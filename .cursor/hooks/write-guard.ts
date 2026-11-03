import { existsSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { pathAllowed, readConditionsFile } from "../../scripts/hootl/conditions.ts";

const root = fileURLToPath(new URL("../..", import.meta.url));
const conditionsPath = resolve(root, "hootl/CONDITIONS.md");
const input = readFileSync(0, "utf8");

let filePath = "";
try {
  const parsed = JSON.parse(input) as {
    tool_input?: { path?: string; file_path?: string };
    path?: string;
  };
  filePath = parsed.tool_input?.path ?? parsed.tool_input?.file_path ?? parsed.path ?? "";
} catch {
  deny("write-guard の入力を読めませんでした。", input.slice(0, 500));
}

if (!existsSync(conditionsPath)) {
  allow();
}

if (!filePath) {
  allow();
}

const conditions = readConditionsFile(conditionsPath);
const rel = relative(root, resolve(filePath)).replaceAll("\\", "/");

if (rel.startsWith("..") || rel.includes("\0")) {
  deny("リポジトリ外への書き込みは禁止です。", rel);
}

if (!pathAllowed(rel, conditions.allowedPathGlobs)) {
  deny(
    `Allowed paths 外への書き込みを止めました: ${rel}`,
    `allowed=${conditions.allowedPathGlobs.join(", ")}`,
  );
}

allow();

function allow(): never {
  console.log(JSON.stringify({ permission: "allow" }));
  process.exit(0);
}

function deny(summary: string, detail: string): never {
  console.log(
    JSON.stringify({
      permission: "deny",
      user_message: summary,
      agent_message: `${summary}\n${detail}`,
    }),
  );
  process.exit(0);
}
