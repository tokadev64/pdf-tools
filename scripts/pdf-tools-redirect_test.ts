import { test } from "bun:test";
import { deepStrictEqual as assertEquals } from "node:assert/strict";

import {
  PDF_TOOLS_REDIRECT_REF,
  mergeRedirectRules,
  pdfToolsRedirectRule,
} from "./pdf-tools-redirect.ts";

test("転送ルールは tokaga.me の /pdf-tools だけに一致する", () => {
  const rule = pdfToolsRedirectRule();
  assertEquals(
    rule.expression,
    '(http.host eq "tokaga.me" and http.request.uri.path eq "/pdf-tools")',
  );
  assertEquals(
    rule.action_parameters?.from_value?.target_url?.value,
    "https://tokaga.me/pdf-tools/",
  );
  assertEquals(rule.action_parameters?.from_value?.status_code, 308);
  assertEquals(rule.action_parameters?.from_value?.preserve_query_string, true);
});

test("既存ルールが無いときは転送ルールを追加する", () => {
  const merged = mergeRedirectRules([]);
  assertEquals(merged.length, 1);
  assertEquals(merged[0]?.ref, PDF_TOOLS_REDIRECT_REF);
});

test("同じ ref は更新し、ほかのルールと id は残す", () => {
  const merged = mergeRedirectRules([
    { ref: "other", description: "keep me", expression: "true", action: "redirect" },
    {
      id: "rule-1",
      ref: PDF_TOOLS_REDIRECT_REF,
      description: "old",
      expression: 'http.request.uri.path eq "/pdf-tools*"',
      version: "stale",
      last_updated: "2020-01-01T00:00:00Z",
    },
    { ref: PDF_TOOLS_REDIRECT_REF, description: "duplicate" },
  ]);

  assertEquals(
    merged.map((rule) => rule.ref),
    ["other", PDF_TOOLS_REDIRECT_REF],
  );
  assertEquals(merged[0]?.description, "keep me");
  assertEquals(merged[1]?.id, "rule-1");
  assertEquals(merged[1]?.expression, pdfToolsRedirectRule().expression);
  assertEquals("version" in (merged[1] ?? {}), false);
  assertEquals("last_updated" in (merged[1] ?? {}), false);
});
