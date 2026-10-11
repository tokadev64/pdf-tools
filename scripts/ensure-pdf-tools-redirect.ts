import { readFile } from "node:fs/promises";

import { type RedirectRule, mergeRedirectRules } from "./pdf-tools-redirect.ts";

const API = "https://api.cloudflare.com/client/v4";
const ZONE_NAME = "tokaga.me";

type CfError = { message?: string };
type CfBody<T> = { success?: boolean; errors?: CfError[]; result?: T };

type Zone = { id: string; name: string };
type Ruleset = { id: string; rules?: RedirectRule[] };

function failure(action: string, body: CfBody<unknown>): string {
  const detail = body.errors
    ?.map((error) => error.message)
    .filter(Boolean)
    .join("; ");
  return detail ? `${action}: ${detail}` : `${action} failed`;
}

async function cf<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: CfBody<T> }> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const body = (await response.json()) as CfBody<T>;
  return { status: response.status, body };
}

function accountIdFromWrangler(toml: string): string {
  const match = toml.match(/^account_id\s*=\s*"([^"]+)"/m);
  if (!match?.[1]) throw new Error("wrangler.toml is missing account_id");
  if (!toml.includes(`zone_name = "${ZONE_NAME}"`)) {
    throw new Error(`wrangler.toml does not route ${ZONE_NAME}`);
  }
  return match[1];
}

async function zoneId(token: string, accountId: string): Promise<string> {
  const { status, body } = await cf<Zone[]>(
    token,
    `/zones?name=${ZONE_NAME}&account.id=${accountId}`,
  );
  if (status !== 200 || !body.success || !body.result) {
    throw new Error(failure(`lookup zone ${ZONE_NAME}`, body));
  }
  if (body.result.length !== 1) {
    throw new Error(`expected one zone named ${ZONE_NAME}, found ${body.result.length}`);
  }
  return body.result[0].id;
}

async function ensureRedirect(token: string, zone: string): Promise<void> {
  const phase = `/zones/${zone}/rulesets/phases/http_request_dynamic_redirect/entrypoint`;
  const current = await cf<Ruleset>(token, phase);
  if (current.status === 404) {
    const created = await cf<Ruleset>(token, `/zones/${zone}/rulesets`, {
      method: "POST",
      body: JSON.stringify({
        name: "Redirect rules ruleset",
        kind: "zone",
        phase: "http_request_dynamic_redirect",
        rules: mergeRedirectRules([]),
      }),
    });
    if (created.status !== 200 || !created.body.success) {
      throw new Error(failure("create redirect ruleset", created.body));
    }
    return;
  }
  if (current.status !== 200 || !current.body.success || !current.body.result?.id) {
    throw new Error(failure("read redirect ruleset", current.body));
  }
  const rules = mergeRedirectRules(current.body.result.rules ?? []);
  const updated = await cf<Ruleset>(token, `/zones/${zone}/rulesets/${current.body.result.id}`, {
    method: "PUT",
    body: JSON.stringify({ rules }),
  });
  if (updated.status !== 200 || !updated.body.success) {
    throw new Error(failure("update redirect ruleset", updated.body));
  }
}

if (import.meta.main) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error("CLOUDFLARE_API_TOKEN is required");
  const accountId = accountIdFromWrangler(await readFile("wrangler.toml", "utf8"));
  const zone = await zoneId(token, accountId);
  await ensureRedirect(token, zone);
}
