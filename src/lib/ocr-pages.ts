import { OPS } from "pdfjs-dist";

export type PageTextSource = {
  text: string;
  hasImage: boolean;
};

const PDF_IMAGE_OPERATORS = new Set<number>([
  OPS.paintImageXObject,
  OPS.paintImageMaskXObject,
  OPS.paintImageMaskXObjectGroup,
  OPS.paintImageMaskXObjectRepeat,
  OPS.paintInlineImageXObject,
  OPS.paintInlineImageXObjectGroup,
  OPS.paintImageXObjectRepeat,
]);

/** PDF.js の operator list に、本文画像または画像マスクの描画が含まれるか */
export function hasPdfImageOperator(fnArray: readonly number[]): boolean {
  return fnArray.some((fn) => PDF_IMAGE_OPERATORS.has(fn));
}

/** 同時 OCR の上限。ワーカーごとに言語データと画像を持つため、これ以上は増やさない */
export const OCR_WORKER_LIMIT = 4;

/** ページ数と論理コア数から、同時に動かす OCR ワーカー数を決める */
export function ocrConcurrency(pageCount: number, hardwareConcurrency?: number): number {
  if (pageCount < 1) return 0;
  const cores =
    hardwareConcurrency !== undefined &&
    Number.isFinite(hardwareConcurrency) &&
    hardwareConcurrency > 0
      ? Math.floor(hardwareConcurrency)
      : 2;
  return Math.min(pageCount, cores, OCR_WORKER_LIMIT);
}

/** 文字が無く、画像があるページの index（0始まり）を返す */
export function imageOnlyPageIndexes(pages: readonly PageTextSource[]): number[] {
  const indexes: number[] = [];
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (page.text.trim() === "" && page.hasImage) indexes.push(i);
  }
  return indexes;
}
