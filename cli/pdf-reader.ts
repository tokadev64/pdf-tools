/**
 * pdfjs-dist を使って PDF からページ単位のテキストを抽出する
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getDocument } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api.d.ts";

/** pdfjs-dist のパッケージ直下にある資産ディレクトリを、末尾 / 付きのパスで返す */
function pdfjsAssetPath(directory: "standard_fonts" | "cmaps"): string {
  const packageJsonPath = fileURLToPath(import.meta.resolve("pdfjs-dist/package.json"));
  return `${join(dirname(packageJsonPath), directory)}/`;
}

/** PDF ファイルからページ単位のテキスト配列を返す */
export async function extractTextFromPdf(filePath: string): Promise<string[]> {
  const data = new Uint8Array(await readFile(filePath));
  const pdf = await getDocument({
    data,
    useSystemFonts: true,
    standardFontDataUrl: pdfjsAssetPath("standard_fonts"),
    cMapUrl: pdfjsAssetPath("cmaps"),
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
