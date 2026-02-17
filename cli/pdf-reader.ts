/**
 * pdfjs-dist を使って PDF からページ単位のテキストを抽出する
 */

import { fileURLToPath } from "node:url";
import { getDocument } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api.d.ts";

/** file:// URL をファイルシステムパスに変換し末尾 / を付与する */
function resolveAsPath(specifier: string): string {
  return `${fileURLToPath(import.meta.resolve(specifier))}/`;
}

/** PDF ファイルからページ単位のテキスト配列を返す */
export async function extractTextFromPdf(filePath: string): Promise<string[]> {
  const data = await Deno.readFile(filePath);
  const pdf = await getDocument({
    data,
    useSystemFonts: true,
    standardFontDataUrl: resolveAsPath("pdfjs-dist/standard_fonts"),
    cMapUrl: resolveAsPath("pdfjs-dist/cmaps"),
    cMapPacked: true,
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
