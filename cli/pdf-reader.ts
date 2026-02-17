/**
 * pdfjs-dist を使って PDF からページ単位のテキストを抽出する
 */

import { getDocument } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api.d.ts";

/** PDF ファイルからページ単位のテキスト配列を返す */
export async function extractTextFromPdf(filePath: string): Promise<string[]> {
  const data = await Deno.readFile(filePath);
  const pdf = await getDocument({
    data,
    useSystemFonts: true,
    standardFontDataUrl: import.meta.resolve("pdfjs-dist/standard_fonts/"),
  }).promise;

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
