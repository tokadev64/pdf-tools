import Tesseract from "tesseract.js/dist/tesseract.esm.min.js";

import { ocrConcurrency } from "./ocr-pages.ts";

export const OCR_LANGS = ["jpn+eng", "jpn", "eng"] as const;
export type OcrLang = (typeof OCR_LANGS)[number];

export type OcrSession = {
  setLabel: (label: string) => void;
  recognize: (canvas: HTMLCanvasElement, dpi: number) => Promise<string>;
  terminate: () => Promise<void>;
};

function errorText(e: unknown, fallback: string): string {
  if (e instanceof Error && e.message !== "") return e.message;
  if (typeof e === "string" && e !== "") return e;
  return fallback;
}

type Terminable = { terminate: () => void | Promise<unknown> };

const spawnStack: Set<Terminable>[] = [];
let workerTrackingInstalled = false;

function installWorkerTracking(): void {
  if (workerTrackingInstalled) return;
  const NativeWorker = globalThis.Worker;
  if (!NativeWorker) return;
  workerTrackingInstalled = true;
  const TrackedWorker = class extends NativeWorker {
    constructor(scriptURL: string | URL, options?: WorkerOptions) {
      super(scriptURL, options);
      spawnStack.at(-1)?.add(this);
    }
  };
  globalThis.Worker = TrackedWorker;
}

async function terminateAll(workers: Iterable<Terminable>): Promise<void> {
  await Promise.all([...workers].map((worker) => worker.terminate()));
}

/** ブラウザ内で tesseract.js のワーカーを1つ起動する */
export async function createOcrSession(
  lang: OcrLang,
  onStatus?: (message: string) => void,
): Promise<OcrSession> {
  const label = { text: "OCR の準備をしています" };
  onStatus?.(label.text);
  installWorkerTracking();

  let rejectInit: (error: Error) => void;
  const initFailed = new Promise<never>((_, reject) => {
    rejectInit = reject;
  });
  void initFailed.catch(() => {});

  const spawned = new Set<Terminable>();
  spawnStack.push(spawned);
  // tesseract.js は createWorker の呼び出し中に Worker を同期生成する。
  // 言語データの取得を待つ間まで追跡すると、別機能の Worker まで終了対象になる。
  let workerPromise: ReturnType<typeof Tesseract.createWorker>;
  try {
    workerPromise = Tesseract.createWorker(lang, 1, {
      logger(message) {
        if (message.status !== "recognizing text") return;
        const percent = Math.round(message.progress * 100);
        onStatus?.(`${label.text} ${percent}%`);
      },
      errorHandler(error: unknown) {
        rejectInit(new Error(errorText(error, "OCR の準備に失敗しました"), { cause: error }));
      },
    });
  } catch (e) {
    await terminateAll(spawned);
    throw new Error(errorText(e, "OCR の準備に失敗しました"), { cause: e });
  } finally {
    spawnStack.pop();
  }

  let worker: Awaited<ReturnType<typeof Tesseract.createWorker>>;
  try {
    worker = await Promise.race([workerPromise, initFailed]);
  } catch (e) {
    await terminateAll(spawned);
    throw new Error(errorText(e, "OCR の準備に失敗しました"), { cause: e });
  }

  return {
    setLabel(text: string) {
      label.text = text;
      onStatus?.(text);
    },
    async recognize(canvas: HTMLCanvasElement, dpi: number): Promise<string> {
      try {
        await worker.setParameters({ user_defined_dpi: String(dpi) });
        const result = await worker.recognize(canvas);
        return result.data.text.trim();
      } catch (e) {
        throw new Error(errorText(e, "OCR に失敗しました"), { cause: e });
      }
    },
    async terminate(): Promise<void> {
      await worker.terminate();
    },
  };
}

/**
 * 複数ワーカーで taskIndex 順に仕事を取り、完了順ではなく呼び出し側がページ位置へ戻す。
 * 最初の1つが言語データを取得してから、残りを起動する。
 */
export async function runOcrPool(
  lang: OcrLang,
  taskCount: number,
  onStatus: ((message: string) => void) | undefined,
  task: (session: OcrSession, taskIndex: number) => Promise<void>,
  hardwareConcurrency?: number,
  createSession: (lang: OcrLang) => Promise<OcrSession> = createOcrSession,
): Promise<void> {
  const concurrency = ocrConcurrency(taskCount, hardwareConcurrency);
  if (concurrency === 0) return;

  onStatus?.("OCR の準備をしています");
  const sessions: OcrSession[] = [];
  try {
    sessions.push(await createSession(lang));
    if (concurrency > 1) {
      const started = await Promise.allSettled(
        Array.from({ length: concurrency - 1 }, () => createSession(lang)),
      );
      for (const result of started) {
        if (result.status === "fulfilled") sessions.push(result.value);
      }
      const failure = started.find((result) => result.status === "rejected");
      if (failure?.status === "rejected") throw failure.reason;
    }

    let cursor = 0;
    let done = 0;
    await Promise.all(
      sessions.map(async (session) => {
        while (true) {
          const taskIndex = cursor++;
          if (taskIndex >= taskCount) return;
          await task(session, taskIndex);
          done++;
          onStatus?.(`OCR しています（${done}/${taskCount} ページ完了）`);
        }
      }),
    );
  } finally {
    await Promise.all(sessions.map((session) => session.terminate()));
  }
}
