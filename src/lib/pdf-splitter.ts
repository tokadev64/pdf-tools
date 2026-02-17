import { zipSync } from "fflate";
import { PDFDocument, degrees } from "pdf-lib";
import type { SplitResult } from "../types/pdf.ts";

/**
 * PDF を分割点に基づいてページ範囲ごとに分割する
 *
 * @param pdfData - 元 PDF のバイナリ
 * @param splitPoints - 分割するページ番号（1-indexed、そのページの後ろで分割）
 * @param rotations - ページ番号→回転角度のマップ
 * @param originalFileName - 元ファイル名（拡張子なし）
 * @returns 分割結果の配列
 */
export async function splitPdf(
  pdfData: Uint8Array,
  splitPoints: number[],
  rotations: Map<number, number>,
  originalFileName: string,
): Promise<SplitResult[]> {
  const sourcePdf = await PDFDocument.load(pdfData);
  const totalPages = sourcePdf.getPageCount();

  const sorted = [...new Set(splitPoints)]
    .filter((p) => p >= 1 && p < totalPages)
    .sort((a, b) => a - b);

  const ranges: { start: number; end: number }[] = [];
  let rangeStart = 1;

  for (const point of sorted) {
    ranges.push({ start: rangeStart, end: point });
    rangeStart = point + 1;
  }
  ranges.push({ start: rangeStart, end: totalPages });

  const results: SplitResult[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    const newPdf = await PDFDocument.create();
    const pageIndices = Array.from(
      { length: range.end - range.start + 1 },
      (_, idx) => range.start - 1 + idx,
    );

    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);

    for (let j = 0; j < copiedPages.length; j++) {
      const page = copiedPages[j];
      const pageNum = range.start + j;
      const rotation = rotations.get(pageNum) ?? 0;

      if (rotation !== 0) {
        page.setRotation(degrees(page.getRotation().angle + rotation));
      }

      newPdf.addPage(page);
    }

    const pdfBytes = await newPdf.save();
    const suffix = ranges.length > 1 ? `_${i + 1}` : "";

    results.push({
      fileName: `${originalFileName}${suffix}.pdf`,
      data: new Uint8Array(pdfBytes),
      pageRange: range,
    });
  }

  return results;
}

/**
 * 分割結果をダウンロードする
 * 1ファイル: PDF 直接ダウンロード
 * 2ファイル以上: ZIP でまとめてダウンロード
 */
export function downloadSplitResults(results: SplitResult[], zipFileName: string): void {
  if (results.length === 0) return;

  if (results.length === 1) {
    downloadBlob(toBlob(results[0].data, "application/pdf"), results[0].fileName);
    return;
  }

  const zipEntries: Record<string, Uint8Array> = {};
  for (const result of results) {
    zipEntries[result.fileName] = result.data;
  }

  const zipData = zipSync(zipEntries);
  downloadBlob(toBlob(zipData, "application/zip"), zipFileName);
}

function toBlob(data: Uint8Array, type: string): Blob {
  return new Blob([new Uint8Array(data)], { type });
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
