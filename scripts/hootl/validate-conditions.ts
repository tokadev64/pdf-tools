/**
 * CONDITIONS.md の必須項目を検証する
 *
 * Usage:
 *   bun run hootl:validate
 *   bun run hootl:validate -- path/to/CONDITIONS.md
 */

import { resolve } from "node:path";

import { readConditionsFile } from "./conditions.ts";

const pathArg = process.argv[2] ?? "hootl/CONDITIONS.md";
const path = resolve(pathArg);

try {
  const conditions = readConditionsFile(path);
  console.log(
    JSON.stringify(
      {
        ok: true,
        runId: conditions.runId,
        maxIterations: conditions.maxIterations,
        sameFailureLimit: conditions.sameFailureLimit,
        allowedPathGlobs: conditions.allowedPathGlobs,
      },
      null,
      2,
    ),
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`CONDITIONS 検証失敗: ${message}`);
  process.exit(1);
}
