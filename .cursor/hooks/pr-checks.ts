import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const input = readFileSync(0, "utf8");

let command = "";
try {
  const parsed = JSON.parse(input) as { command?: string };
  command = parsed.command ?? "";
} catch {
  deny("PR 前チェックの入力を読めませんでした。", input.slice(0, 500));
}

if (!/\bgh\s+pr\s+create\b/.test(command)) {
  console.log(JSON.stringify({ permission: "allow" }));
  process.exit(0);
}

const root = fileURLToPath(new URL("../..", import.meta.url));
const steps = [
  ["bun", "run", "check"],
  ["bun", "test"],
] as const;

const failures: string[] = [];
for (const args of steps) {
  const result = await run(args, root);
  if (result.code !== 0) {
    failures.push(`$ ${args.join(" ")}\n${result.output.trim()}`);
  }
}

if (failures.length === 0) {
  console.log(JSON.stringify({ permission: "allow" }));
  process.exit(0);
}

const failureDetail = failures.join("\n\n").slice(-6000);
deny("formatter、linter、または test が失敗したため、PR 作成を止めました。", failureDetail);

function run(
  args: readonly [string, ...string[]],
  cwd: string,
): Promise<{ code: number | null; output: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(args[0], args.slice(1), {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const chunks: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ code, output: Buffer.concat(chunks).toString() });
    });
  });
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
