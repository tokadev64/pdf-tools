/**
 * ブラウザ版 PDF テキスト抽出
 *
 * 文字データが無い画像ページは tesseract.js で OCR する。
 * CLI 版 (cli/pdf-reader.ts) は文字データの抽出のみ。
 */

import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
// Vite の ?url はファイル URL 文字列を default export する。実体の worker に default export はない。
// oxlint-disable-next-line import/default
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { TextItem } from "pdfjs-dist/types/src/display/api.d.ts";

import { hasPdfImageOperator, imageOnlyPageIndexes } from "./ocr-pages.ts";
import { collapseOcrSpaces } from "./ocr-text.ts";
import { type OcrLang, runOcrPool } from "./ocr.ts";

GlobalWorkerOptions.workerSrc = workerUrl;

const OCR_DPI = 300;
const OCR_MAX_EDGE = 3000;

export type ExtractTextOptions = {
  ocrLang?: OcrLang;
  onStatus?: (message: string) => void;
};

/** File オブジェクトからページ単位のテキスト配列を返す */
export async function extractTextFromFile(
  file: File,
  options?: ExtractTextOptions,
): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  const pdf = await getDocument({
    data,
    cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/cmaps/",
    cMapPacked: true,
  }).promise;

  try {
    const pages: { text: string; hasImage: boolean }[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await readPageText(page);
      const hasImage = text === "" ? await pageHasImage(page) : false;
      pages.push({ text, hasImage });
    }

    const targets = imageOnlyPageIndexes(pages);
    const texts = pages.map((page) => page.text);
    if (targets.length === 0) return texts;

    const renderExclusive = createAsyncLock();
    await runOcrPool(
      options?.ocrLang ?? "jpn+eng",
      targets.length,
      options?.onStatus,
      async (session, taskIndex) => {
        const index = targets[taskIndex];
        const rendered = await renderExclusive(() => renderPageForOcr(pdf, index + 1));
        const recognized = await session.recognize(rendered.canvas, rendered.dpi);
        texts[index] = collapseOcrSpaces(recognized);
      },
      navigator.hardwareConcurrency,
    );

    return texts;
  } finally {
    await pdf.destroy();
  }
}

function createAsyncLock(): <T>(fn: () => Promise<T>) => Promise<T> {
  let tail = Promise.resolve();
  return (fn) => {
    const run = tail.then(() => fn());
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };
}

async function readPageText(page: PDFPageProxy): Promise<string> {
  const textContent = await page.getTextContent();
  return textContent.items
    .filter((item): item is TextItem => "str" in item)
    .map((item) => item.str + (item.hasEOL ? "\n" : ""))
    .join("")
    .trim();
}

async function pageHasImage(page: PDFPageProxy): Promise<boolean> {
  const ops = await page.getOperatorList();
  return hasPdfImageOperator(ops.fnArray);
}

async function renderPageForOcr(
  pdf: PDFDocumentProxy,
  pageNumber: number,
): Promise<{ canvas: HTMLCanvasElement; dpi: number }> {
  const page = await pdf.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const longEdge = Math.max(base.width, base.height);
  const scale = Math.min(OCR_DPI / 72, OCR_MAX_EDGE / longEdge);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context の取得に失敗しました");
  }
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport }).promise;

  return { canvas, dpi: Math.round(scale * 72) };
}
