/** ブラウザ版の文字抽出。OCR は明示的に有効にした場合だけ使用する。 */
import { GlobalWorkerOptions, OPS, getDocument } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { TextItem } from "pdfjs-dist/types/src/display/api.d.ts";
import type { Worker } from "tesseract.js";

GlobalWorkerOptions.workerSrc = workerUrl;

export interface ExtractionOptions {
  ocr?: boolean;
  onProgress?: (message: string) => void;
}

export async function extractTextFromFile(
  file: File,
  options: ExtractionOptions = {},
): Promise<string[]> {
  const progress = options.onProgress ?? (() => {});
  const task = getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/cmaps/",
    cMapPacked: true,
  });
  let worker: Worker | undefined;
  let currentPage = 0;
  let total = 0;
  try {
    const pdf = await task.promise;
    total = pdf.numPages;
    const pages: string[] = [];
    for (let i = 1; i <= total; i++) {
      currentPage = i;
      progress(`文字抽出中: ${i} / ${total} ページ`);
      const page = await pdf.getPage(i);
      try {
        const content = await page.getTextContent();
        let text = content.items
          .filter((item): item is TextItem => "str" in item)
          .map((item) => item.str + (item.hasEOL ? "\n" : ""))
          .join("")
          .trim();
        if (!text && options.ocr) {
          const ops = await page.getOperatorList();
          const hasImage = ops.fnArray.some((op) =>
            [
              OPS.paintImageXObject,
              OPS.paintInlineImageXObject,
              OPS.paintImageMaskXObject,
            ].includes(op),
          );
          if (hasImage) {
            if (!worker) {
              progress(`OCR の日本語・英語データを準備中: ${i} / ${total} ページ`);
              const { createWorker, PSM } = await import("tesseract.js");
              const { default: workerPath } = await import("tesseract.js/dist/worker.min.js?url");
              worker = await createWorker(["jpn", "eng"], 1, {
                workerPath,
                logger: (message) => {
                  if (message.status === "recognizing text") {
                    progress(
                      `OCR 中: ${currentPage} / ${total} ページ (${Math.round(message.progress * 100)}%)`,
                    );
                  }
                },
                errorHandler: () => {}, // エラーは await の呼び出し元へ伝える。
              });
              await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
            }
            progress(`OCR 中: ${i} / ${total} ページ`);
            const original = page.getViewport({ scale: 1 });
            const scale = Math.min(300 / 72, 4096 / Math.max(original.width, original.height));
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            try {
              const context = canvas.getContext("2d");
              if (!context) throw new Error("OCR 用の画像を作成できませんでした。");
              await page.render({ canvasContext: context, viewport }).promise;
              text = (await worker.recognize(canvas)).data.text.trim();
            } finally {
              canvas.width = 0;
              canvas.height = 0;
            }
          }
        }
        pages.push(text);
      } finally {
        page.cleanup();
      }
    }
    if (!pages.some((text) => text.trim())) {
      throw new Error(
        options.ocr
          ? "本文を読み取れませんでした。PDF の画質や内容を確認してください。"
          : "文字データを抽出できませんでした。画像の PDF は「画像ページを OCR で読み取る」をオンにして再変換してください。",
      );
    }
    return pages;
  } finally {
    try {
      await worker?.terminate();
    } finally {
      await task.destroy();
    }
  }
}
