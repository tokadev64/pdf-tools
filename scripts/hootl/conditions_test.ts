import { test } from "bun:test";
import { deepStrictEqual as assertEquals, throws } from "node:assert/strict";

import { parseConditions, pathAllowed } from "./conditions.ts";

const minimal = `# CONDITIONS — pdf-tools
Oversight: HOOTL
Segment: A
Run-ID: 2026-11-03-1300
Deadline: 2026-11-03T15:00:00+09:00
Max-iterations: 8
Max-wall-clock: 2h
Same-failure-limit: 3
OCR-quality-gate: off
Deploy-touch-policy: ask

## Goal
fix

## Success（機械判定）
- bun test

## Fail classes → action
| class | 例 | action |
|---|---|---|
| test_fail | x | stop |

## Allowed paths
- src/**
- cli/**
- package.json

## Forbidden
- secrets

## Priority
tests

## Stop-policy
- success
`;

test("parseConditions - Run-ID と上限と許可パスを読む", () => {
  const parsed = parseConditions(minimal);
  assertEquals(parsed.runId, "2026-11-03-1300");
  assertEquals(parsed.maxIterations, 8);
  assertEquals(parsed.sameFailureLimit, 3);
  assertEquals(parsed.allowedPathGlobs, ["src/**", "cli/**", "package.json"]);
});

test("parseConditions - プレースホルダ Run-ID は拒否する", () => {
  throws(() => parseConditions(minimal.replace("2026-11-03-1300", "<yyyy-mm-dd-hhmm>")));
});

test("pathAllowed - /** と完全一致を扱う", () => {
  assertEquals(pathAllowed("src/lib/ocr.ts", ["src/**"]), true);
  assertEquals(pathAllowed("src", ["src/**"]), true);
  assertEquals(pathAllowed("cli/main.ts", ["src/**"]), false);
  assertEquals(pathAllowed("package.json", ["package.json"]), true);
  assertEquals(pathAllowed("package.lock", ["package.json"]), false);
});
