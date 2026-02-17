import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  formatAsContinuousMarkdown,
  formatAsMarkdown,
  writeMarkdownFile,
} from "../src/lib/markdown-writer.ts";

// --- formatAsMarkdown ---

Deno.test("formatAsMarkdown - 単一ページのテキストを Markdown に変換する", () => {
  const pages = ["Hello World"];
  const result = formatAsMarkdown(pages, "test");

  assertEquals(result.includes("# test"), true);
  assertEquals(result.includes("Hello World"), true);
});

Deno.test("formatAsMarkdown - 複数ページをページ見出し付きで変換する", () => {
  const pages = ["Page one content", "Page two content"];
  const result = formatAsMarkdown(pages, "sample");

  assertEquals(result.includes("# sample"), true);
  assertEquals(result.includes("## Page 1"), true);
  assertEquals(result.includes("Page one content"), true);
  assertEquals(result.includes("## Page 2"), true);
  assertEquals(result.includes("Page two content"), true);
});

Deno.test("formatAsMarkdown - 空ページをスキップする", () => {
  const pages = ["Content", "", "  ", "More content"];
  const result = formatAsMarkdown(pages, "doc");

  assertEquals(result.includes("## Page 1"), true);
  assertEquals(result.includes("Content"), true);
  assertEquals(result.includes("## Page 2"), true);
  assertEquals(result.includes("More content"), true);
  // 空ページの見出しは含まれない
  assertEquals(result.includes("## Page 3"), false);
  assertEquals(result.includes("## Page 4"), false);
});

// --- formatAsContinuousMarkdown ---

Deno.test("formatAsContinuousMarkdown - ページまたぎの段落を結合する", () => {
  const pages = [
    "リファクタリングは体系的に行わなければなり",
    "ません。私が仲間とともに本を書いた",
  ];
  const result = formatAsContinuousMarkdown(pages, "test");

  // ページ区切りなし
  assertEquals(result.includes("## Page"), false);
  // 行末が句読点でない → 直接結合
  assertEquals(result.includes("行わなければなりません。"), true);
});

Deno.test("formatAsContinuousMarkdown - 句読点で終わる行は段落区切りにする", () => {
  const pages = ["最初の段落です。", "次の段落です。"];
  const result = formatAsContinuousMarkdown(pages, "test");

  // 句読点で終わる → 段落分離（空行）
  assertEquals(result.includes("最初の段落です。\n\n次の段落です。"), true);
});

Deno.test("formatAsContinuousMarkdown - 空ページをスキップする", () => {
  const pages = ["内容あり", "", "  ", "別の内容"];
  const result = formatAsContinuousMarkdown(pages, "doc");

  assertEquals(result.includes("内容あり"), true);
  assertEquals(result.includes("別の内容"), true);
});

Deno.test("formatAsContinuousMarkdown - タイトルが含まれる", () => {
  const pages = ["テキスト"];
  const result = formatAsContinuousMarkdown(pages, "my-doc");

  assertEquals(result.startsWith("# my-doc\n"), true);
});

// --- writeMarkdownFile ---

Deno.test("writeMarkdownFile - ファイルに書き出せる", async () => {
  const tmpFile = await Deno.makeTempFile({ suffix: ".md" });
  try {
    await writeMarkdownFile(tmpFile, "# Test\n\nHello");
    const content = await Deno.readTextFile(tmpFile);
    assertEquals(content, "# Test\n\nHello");
  } finally {
    await Deno.remove(tmpFile);
  }
});
