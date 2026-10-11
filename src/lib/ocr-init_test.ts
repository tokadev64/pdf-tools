import { mock, test } from "bun:test";
import { deepStrictEqual as assertEquals } from "node:assert/strict";

class RecordingWorker {
  static instances: RecordingWorker[] = [];
  url: string;
  terminated = false;

  constructor(scriptURL: string | URL, _options?: WorkerOptions) {
    this.url = String(scriptURL);
    RecordingWorker.instances.push(this);
  }

  terminate(): void {
    this.terminated = true;
  }
}

globalThis.Worker = RecordingWorker as unknown as typeof Worker;

let failLanguage: (error: unknown) => void;

mock.module("tesseract.js/dist/tesseract.esm.min.js", () => ({
  default: {
    createWorker: (
      _lang: string,
      _oem: number,
      options?: { errorHandler?: (error: unknown) => void },
    ) => {
      const worker = new Worker("tesseract-worker.js");
      void worker;
      return new Promise(() => {
        failLanguage = (error) => options?.errorHandler?.(error);
      });
    },
  },
}));

const { createOcrSession } = await import("./ocr.ts");

test("createOcrSession - 言語データの取得失敗では OCR ワーカーだけを終了する", async () => {
  const pending = createOcrSession("eng");
  const other = new Worker("pdf.js");
  void other;
  failLanguage("language failed");

  let message = "";
  try {
    await pending;
    message = "初期化が戻らなかった";
  } catch (error) {
    message = error instanceof Error ? error.message : "unknown";
  }

  assertEquals(message, "language failed");
  const ocr = RecordingWorker.instances.find((worker) => worker.url === "tesseract-worker.js");
  const pdf = RecordingWorker.instances.find((worker) => worker.url === "pdf.js");
  assertEquals(ocr?.terminated, true);
  assertEquals(pdf?.terminated, false);
});
