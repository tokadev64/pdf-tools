/** テキストを持たない PDF を変換成功として扱わない。 */
export function validateExtractedText(pages: string[]): void {
  if (!pages.some((page) => page.trim().length > 0)) {
    throw new Error(
      "PDF から本文を抽出できませんでした。文字データが含まれているか確認してください。画像のみの PDF は OCR（文字認識）が必要ですが、この変換機能は OCR に対応していません。",
    );
  }
}
