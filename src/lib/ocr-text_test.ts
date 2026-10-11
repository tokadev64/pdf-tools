import { test } from "bun:test";
import { deepStrictEqual as assertEquals } from "node:assert/strict";

import { collapseOcrSpaces } from "./ocr-text.ts";

test("collapseOcrSpaces - 日本語の文字間の空白を除く", () => {
  assertEquals(collapseOcrSpaces("こ れ は 本 文"), "これは本文");
});

test("collapseOcrSpaces - 英単語の空白と、英単語と日本語の境目は残す", () => {
  assertEquals(collapseOcrSpaces("OpenID Connect を 使 う"), "OpenID Connect を使う");
});

test("collapseOcrSpaces - 句読点の前後の空白を除く", () => {
  assertEquals(collapseOcrSpaces("です 。 次 は 「 例 」"), "です。次は「例」");
});

test("collapseOcrSpaces - 日本語と数字の間の空白を除く", () => {
  assertEquals(collapseOcrSpaces("第 1 章"), "第1章");
});

test("collapseOcrSpaces - 英字と数字の間は残す", () => {
  assertEquals(collapseOcrSpaces("HTTP 2"), "HTTP 2");
});

test("collapseOcrSpaces - 改行は残す", () => {
  assertEquals(collapseOcrSpaces("あ い\nう え"), "あい\nうえ");
});
