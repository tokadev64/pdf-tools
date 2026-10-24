/** 依存パッケージを最新へ更新し、vite-plus と overrides.vite を揃える。 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("bun", ["update", "--latest"]);

const packageJsonPath = `${root}/package.json`;
const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
  devDependencies?: Record<string, string>;
  overrides?: Record<string, string>;
};

const vitePlusRange = pkg.devDependencies?.["vite-plus"];
if (!vitePlusRange) {
  console.error("devDependencies.vite-plus が見つかりません。");
  process.exit(1);
}

const vitePlusVersion = vitePlusRange.replace(/^[\^~>=<\s]+/, "");
pkg.overrides = {
  ...pkg.overrides,
  vite: `npm:@voidzero-dev/vite-plus-core@${vitePlusVersion}`,
};

writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);
run("bun", ["install"]);
