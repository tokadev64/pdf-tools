import { readFileSync } from "node:fs";

export type Conditions = {
  runId: string;
  maxIterations: number;
  sameFailureLimit: number;
  allowedPathGlobs: string[];
  raw: string;
};

const REQUIRED_HEADERS = [
  "## Goal",
  "## Success（機械判定）",
  "## Fail classes → action",
  "## Allowed paths",
  "## Forbidden",
  "## Stop-policy",
] as const;

export function parseConditions(raw: string): Conditions {
  const runId = matchField(raw, /^Run-ID:\s*(.+)$/m);
  const maxIterations = Number(matchField(raw, /^Max-iterations:\s*(\d+)\s*$/m));
  const sameFailureLimit = Number(matchField(raw, /^Same-failure-limit:\s*(\d+)\s*$/m));

  if (!runId || runId.includes("<")) {
    throw new Error("Run-ID が未設定です");
  }
  if (!Number.isInteger(maxIterations) || maxIterations < 1) {
    throw new Error("Max-iterations は 1 以上の整数である必要があります");
  }
  if (!Number.isInteger(sameFailureLimit) || sameFailureLimit < 1) {
    throw new Error("Same-failure-limit は 1 以上の整数である必要があります");
  }

  for (const header of REQUIRED_HEADERS) {
    if (!raw.includes(header)) {
      throw new Error(`必須見出しがありません: ${header}`);
    }
  }

  const allowedPathGlobs = sectionLines(raw, "## Allowed paths")
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter((line) => line.length > 0 && !line.startsWith("<"));

  if (allowedPathGlobs.length === 0) {
    throw new Error("Allowed paths が空です");
  }

  return { runId, maxIterations, sameFailureLimit, allowedPathGlobs, raw };
}

export function readConditionsFile(path: string): Conditions {
  return parseConditions(readFileSync(path, "utf8"));
}

export function pathAllowed(filePath: string, globs: readonly string[]): boolean {
  const normalized = filePath.replaceAll("\\", "/").replace(/^\.\//, "");
  return globs.some((glob) => matchGlob(normalized, glob));
}

function matchField(raw: string, re: RegExp): string | undefined {
  return re.exec(raw)?.[1]?.trim();
}

function sectionLines(raw: string, header: string): string[] {
  const start = raw.indexOf(header);
  if (start < 0) return [];
  const after = raw.slice(start + header.length);
  const endMatch = /^##\s/m.exec(after);
  const body = endMatch ? after.slice(0, endMatch.index) : after;
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-"));
}

// 末尾 /** と単一 * だけを扱う簡易 glob
function matchGlob(path: string, glob: string): boolean {
  const g = glob.replaceAll("\\", "/");
  if (g.endsWith("/**")) {
    const prefix = g.slice(0, -3);
    return path === prefix || path.startsWith(`${prefix}/`);
  }
  if (g.includes("*")) {
    const escaped = g.replaceAll(/[.+^${}()|[\]\\]/g, "\\$&").replaceAll("*", "[^/]*");
    return new RegExp(`^${escaped}$`).test(path);
  }
  return path === g;
}
