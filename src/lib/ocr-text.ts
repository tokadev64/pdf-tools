const JP_CHAR = /[\u3040-\u30FF\u3400-\u9FFF\uF900-\uFAFF\u3001-\u303F\uFF01-\uFF60\uFF61-\uFF9F]/u;

const GAP = "[ \\u3000\\u00A0]+";

const SPACE_BETWEEN_JP = new RegExp(`(?<=${JP_CHAR.source})${GAP}(?=${JP_CHAR.source})`, "gu");

const SPACE_BETWEEN_JP_AND_DIGIT = new RegExp(
  `(?<=${JP_CHAR.source})${GAP}(?=\\d)|(?<=\\d)${GAP}(?=${JP_CHAR.source})`,
  "gu",
);

/**
 * OCR が日本語の文字間に入れる空白を除く。
 * 英単語どうしの空白は残す。
 */
export function collapseOcrSpaces(text: string): string {
  return text.replace(SPACE_BETWEEN_JP, "").replace(SPACE_BETWEEN_JP_AND_DIGIT, "");
}
