/**
 * ブラウザ版 PDF テキスト抽出
 *
 * CLI 版 (cli/pdf-reader.ts) と同じテキスト結合ロジックを使用し、
 * ファイル読み込み部分のみ File API に差し替えている。
 */

import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { TextItem } from "pdfjs-dist/types/src/display/api.d.ts";

GlobalWorkerOptions.workerSrc = workerUrl;

/** File オブジェクトからページ単位のテキスト配列を返す */
export async function extractTextFromFile(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  const pdf = await getDocument({ data }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const text = textContent.items
      .filter((item): item is TextItem => "str" in item)
      .map((item) => item.str + (item.hasEOL ? "\n" : ""))
      .join("")
      .trim();

    pages.push(text);
  }

  return pages;
}
