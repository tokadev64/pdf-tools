import { test } from "bun:test";
import { deepStrictEqual as assertEquals, fail } from "node:assert/strict";

import { type OcrSession, runOcrPool } from "./ocr.ts";

test("runOcrPool - 追加ワーカーの起動に失敗しても成功分は終了する", async () => {
  const terminated: number[] = [];
  let created = 0;

  const createSession = async (): Promise<OcrSession> => {
    const id = ++created;
    if (id === 3) throw new Error("init failed");
    return {
      setLabel() {},
      async recognize() {
        return "";
      },
      async terminate() {
        terminated.push(id);
      },
    };
  };

  try {
    await runOcrPool("eng", 3, undefined, async () => {}, 3, createSession);
    fail("起動失敗を返すべき");
  } catch (error) {
    assertEquals(error instanceof Error && error.message, "init failed");
  }
  assertEquals(
    terminated.toSorted((a, b) => a - b),
    [1, 2],
  );
});

test("runOcrPool - 起動失敗より後に成功したワーカーも終了する", async () => {
  const terminated: number[] = [];
  let created = 0;
  let releaseLate: () => void;
  const lateReleased = new Promise<void>((resolve) => {
    releaseLate = resolve;
  });
  let markFailed: () => void;
  const thirdFailed = new Promise<void>((resolve) => {
    markFailed = resolve;
  });

  const createSession = async (): Promise<OcrSession> => {
    const id = ++created;
    if (id === 2) await lateReleased;
    if (id === 3) {
      markFailed();
      throw new Error("init failed");
    }
    return {
      setLabel() {},
      async recognize() {
        return "";
      },
      async terminate() {
        terminated.push(id);
      },
    };
  };

  const pending = runOcrPool("eng", 3, undefined, async () => {}, 3, createSession);
  await thirdFailed;
  releaseLate();
  try {
    await pending;
    fail("起動失敗を返すべき");
  } catch (error) {
    assertEquals(error instanceof Error && error.message, "init failed");
  }
  assertEquals(
    terminated.toSorted((a, b) => a - b),
    [1, 2],
  );
});
