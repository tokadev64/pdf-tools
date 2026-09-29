const input = await new Response(Deno.stdin.readable).text();

let command = "";
try {
  const parsed = JSON.parse(input) as { command?: string };
  command = parsed.command ?? "";
} catch {
  deny("PR 前チェックの入力を読めませんでした。", input.slice(0, 500));
}

if (!/\bgh\s+pr\s+create\b/.test(command)) {
  console.log(JSON.stringify({ permission: "allow" }));
  Deno.exit(0);
}

const root = new URL("../..", import.meta.url).pathname;
const steps = [
  ["deno", "task", "check"],
  ["deno", "task", "test"],
] as const;

const failures: string[] = [];
for (const args of steps) {
  const result = await new Deno.Command(args[0], {
    args: args.slice(1),
    cwd: root,
    stdout: "piped",
    stderr: "piped",
  }).output();
  if (result.code !== 0) {
    const output =
      new TextDecoder().decode(result.stdout) + new TextDecoder().decode(result.stderr);
    failures.push(`$ ${args.join(" ")}\n${output.trim()}`);
  }
}

if (failures.length === 0) {
  console.log(JSON.stringify({ permission: "allow" }));
  Deno.exit(0);
}

const detail = failures.join("\n\n").slice(-6000);
deny("formatter、linter、または test が失敗したため、PR 作成を止めました。", detail);

function deny(summary: string, detail: string): never {
  console.log(
    JSON.stringify({
      permission: "deny",
      user_message: summary,
      agent_message: `${summary}\n${detail}`,
    }),
  );
  Deno.exit(0);
}
