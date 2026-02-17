/** PDF ページの情報 */
export interface PageInfo {
  pageNumber: number;
  rotation: number; // 0, 90, 180, 270
  thumbnailUrl: string | null;
}

/** PDF 分割結果の1ファイル分 */
export interface SplitResult {
  fileName: string;
  data: Uint8Array;
  pageRange: { start: number; end: number };
}
