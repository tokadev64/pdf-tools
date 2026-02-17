import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { joinLines } from "./markdown-writer.ts";

// --- joinLines ---

Deno.test("joinLines - 文末でない単独改行を除去する（日本語）", () => {
  const input = "リファクタリングは体系的に\n行わなければなりません。";
  const result = joinLines(input);
  assertEquals(result, "リファクタリングは体系的に行わなければなりません。");
});

Deno.test("joinLines - 文末でない単独改行を除去する（英語はスペース挿入）", () => {
  const input = "Refactoring is a systematic\napproach to improving code.";
  const result = joinLines(input);
  assertEquals(result, "Refactoring is a systematic approach to improving code.");
});

Deno.test("joinLines - 句読点で終わる行の改行は保持する", () => {
  const input = "最初の段落です。\n次の段落です。";
  const result = joinLines(input);
  assertEquals(result, "最初の段落です。\n次の段落です。");
});

Deno.test("joinLines - 空行（段落境界）は保持する", () => {
  const input = "第一段落の内容\n\n第二段落の内容";
  const result = joinLines(input);
  assertEquals(result, "第一段落の内容\n\n第二段落の内容");
});

Deno.test("joinLines - 閉じ括弧で終わる行の改行は保持する", () => {
  const input = "出版社から出版された（2019年）\n次の行です。";
  const result = joinLines(input);
  assertEquals(result, "出版社から出版された（2019年）\n次の行です。");
});

Deno.test("joinLines - 複数行にわたる日本語段落を結合する", () => {
  const input = "本電子書籍は、奥付に\n表記した紙版書籍を\n底本として制作した\nものです。";
  const result = joinLines(input);
  assertEquals(result, "本電子書籍は、奥付に表記した紙版書籍を底本として制作したものです。");
});

Deno.test("joinLines - CJK と ASCII の境界ではスペースを挿入する", () => {
  const input = "Martin Fowler の\nRefactoring です";
  const result = joinLines(input);
  assertEquals(result, "Martin Fowler の Refactoring です");
});

Deno.test("joinLines - 既にスペースがある場合は二重にしない", () => {
  const input = "end of line \nnext line";
  const result = joinLines(input);
  assertEquals(result, "end of line next line");
});

Deno.test("joinLines - 改行がないテキストはそのまま返す", () => {
  const input = "改行なしのテキスト";
  const result = joinLines(input);
  assertEquals(result, "改行なしのテキスト");
});

Deno.test("joinLines - 空文字列はそのまま返す", () => {
  assertEquals(joinLines(""), "");
});

Deno.test("joinLines - 実際の PDF 出力に近い複合パターン", () => {
  const input = [
    "Authorized translation from the English language edition, entitled REFACTORING:",
    "IMPROVING THE DESIGN OF EXISTING CODE, 2nd Edition, by FOWLER, MARTIN,",
    "published by Pearson Education, Inc, Copyright © 2019.",
    "",
    "本電子書籍は、奥付に表記した紙版書籍を底本として制作した",
    "ものです。",
  ].join("\n");

  const result = joinLines(input);

  const expected = [
    "Authorized translation from the English language edition, entitled REFACTORING: IMPROVING THE DESIGN OF EXISTING CODE, 2nd Edition, by FOWLER, MARTIN, published by Pearson Education, Inc, Copyright © 2019.",
    "",
    "本電子書籍は、奥付に表記した紙版書籍を底本として制作したものです。",
  ].join("\n");

  assertEquals(result, expected);
});
