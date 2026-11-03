import { test } from "bun:test";
import { deepStrictEqual as assertEquals } from "node:assert/strict";

import { decideShellCommand } from "../../.cursor/hooks/shell-rules.ts";

test("shell-rules - main push と force push は deny", () => {
  assertEquals(decideShellCommand("git push origin main"), "deny");
  assertEquals(decideShellCommand("git push --force origin feature"), "deny");
  assertEquals(decideShellCommand("git push -f origin feature"), "deny");
  assertEquals(decideShellCommand("git push -u origin HEAD"), "allow");
});

test("shell-rules - deploy 系は ask", () => {
  assertEquals(decideShellCommand("wrangler deploy"), "ask");
  assertEquals(decideShellCommand("bunx wrangler deploy"), "ask");
  assertEquals(decideShellCommand("bun run ensure-redirect"), "ask");
  assertEquals(decideShellCommand("bun scripts/ensure-pdf-tools-redirect.ts"), "ask");
});

test("shell-rules - zone API は deny、通常コマンドは allow", () => {
  assertEquals(decideShellCommand("curl https://api.cloudflare.com/client/v4/zones/abc"), "deny");
  assertEquals(decideShellCommand("bun test"), "allow");
});
