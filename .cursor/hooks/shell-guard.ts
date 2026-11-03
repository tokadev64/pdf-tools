import { readFileSync } from "node:fs";

import { decideShellCommand } from "./shell-rules.ts";

const input = readFileSync(0, "utf8");

let command = "";
try {
  const parsed = JSON.parse(input) as { command?: string };
  command = parsed.command ?? "";
} catch {
  decide("deny", "shell-guard の入力を読めませんでした。", input.slice(0, 500));
}

const decision = decideShellCommand(command);
if (decision === "deny" && /\bgit\s+push\b/.test(command)) {
  decide("deny", "main への直接 push / force push は禁止です。", `blocked: ${command}`);
}
if (decision === "ask") {
  decide(
    "ask",
    "本番 deploy / redirect 変更には承認が必要です（Deploy-touch-policy: ask）。",
    `ask deploy: ${command}`,
  );
}
if (decision === "deny") {
  decide(
    "deny",
    "zone / account / pdf-tools 外ルートの変更は HITL 専用です。",
    `blocked: ${command}`,
  );
}

decide("allow");

function decide(
  permission: "allow" | "ask" | "deny",
  userMessage?: string,
  agentMessage?: string,
): never {
  const payload: Record<string, string> = { permission };
  if (userMessage) payload.user_message = userMessage;
  if (agentMessage) payload.agent_message = agentMessage;
  console.log(JSON.stringify(payload));
  process.exit(0);
}
