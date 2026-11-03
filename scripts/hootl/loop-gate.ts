/**
 * 内側ループの max-iter / 同一失敗上限ゲート
 *
 * Usage:
 *   bun run hootl:loop-gate --status
 *   bun run hootl:loop-gate --record "<fingerprint>"
 *   bun run hootl:loop-gate --success
 *   bun run hootl:loop-gate --stop "<reason>"
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { readConditionsFile } from "./conditions.ts";

export type LoopState = {
  runId: string;
  iteration: number;
  sameFailureCount: number;
  lastFingerprint: string | null;
  outcome: "running" | "success" | "safe-stop" | "deadline";
  reason?: string;
};

const conditionsPath = resolve("hootl/CONDITIONS.md");
const conditions = readConditionsFile(conditionsPath);
const runDir = resolve("hootl/runs", conditions.runId);
const statePath = join(runDir, "loop-state.json");

mkdirSync(runDir, { recursive: true });

const state = loadState();
const mode = process.argv[2] ?? "--status";

if (mode === "--status") {
  printState(state);
  process.exit(gateExit(state));
}

if (mode === "--success") {
  state.outcome = "success";
  state.reason = "success criteria met";
  saveState(state);
  printState(state);
  process.exit(0);
}

if (mode === "--stop") {
  const reason = process.argv[3] ?? "safe-stop";
  state.outcome = "safe-stop";
  state.reason = reason;
  saveState(state);
  printState(state);
  process.exit(2);
}

if (mode === "--record") {
  const fingerprint = process.argv[3];
  if (!fingerprint) {
    console.error("fingerprint が必要です");
    process.exit(1);
  }
  state.iteration += 1;
  if (state.lastFingerprint === fingerprint) {
    state.sameFailureCount += 1;
  } else {
    state.lastFingerprint = fingerprint;
    state.sameFailureCount = 1;
  }

  if (state.iteration > conditions.maxIterations) {
    state.outcome = "safe-stop";
    state.reason = `Max-iterations exceeded (${conditions.maxIterations})`;
  } else if (state.sameFailureCount > conditions.sameFailureLimit) {
    state.outcome = "safe-stop";
    state.reason = `Same-failure-limit exceeded (${conditions.sameFailureLimit})`;
  }

  saveState(state);
  printState(state);
  process.exit(gateExit(state));
}

console.error(`未知の mode: ${mode}`);
process.exit(1);

function loadState(): LoopState {
  try {
    return JSON.parse(readFileSync(statePath, "utf8")) as LoopState;
  } catch {
    return {
      runId: conditions.runId,
      iteration: 0,
      sameFailureCount: 0,
      lastFingerprint: null,
      outcome: "running",
    };
  }
}

function saveState(next: LoopState): void {
  writeFileSync(statePath, `${JSON.stringify(next, null, 2)}\n`);
}

function printState(next: LoopState): void {
  console.log(JSON.stringify(next, null, 2));
}

function gateExit(next: LoopState): number {
  return next.outcome === "running" ? 0 : 2;
}
