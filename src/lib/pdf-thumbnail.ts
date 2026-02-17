import type { PDFDocumentProxy } from "pdfjs-dist";

const THUMBNAIL_WIDTH = 200;

/**
 * PDF の指定ページをサムネイル DataURL として返す
 *
 * @param pdfDocument - pdfjs-dist の DocumentProxy
 * @param pageNumber - 1-indexed ページ番号
 * @param rotation - 追加回転角度（0, 90, 180, 270）
 */
export async function renderThumbnail(
  pdfDocument: PDFDocumentProxy,
  pageNumber: number,
  rotation = 0,
): Promise<string> {
  const page = await pdfDocument.getPage(pageNumber);

  const originalViewport = page.getViewport({ scale: 1, rotation });
  const scale = (THUMBNAIL_WIDTH * window.devicePixelRatio) / originalViewport.width;
  const viewport = page.getViewport({ scale, rotation });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context の取得に失敗しました");
  }

  await page.render({ canvasContext: context, viewport }).promise;

  return canvas.toDataURL("image/png");
}
