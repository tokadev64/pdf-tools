import { test } from "bun:test";
import { deepStrictEqual as assertEquals } from "node:assert/strict";

import * as fc from "fast-check";

import {
  formatAsContinuousMarkdown,
  formatAsMarkdown,
  hasExtractedText,
  joinLines,
} from "./markdown-writer.ts";

test("PBT hasExtractedText - trim 後に1文字でもあれば true", () => {
  fc.assert(
    fc.property(fc.array(fc.string()), (pages) => {
      const expected = pages.some((page) => page.trim() !== "");
      assertEquals(hasExtractedText(pages), expected);
    }),
  );
});

test("PBT formatAsMarkdown - 常にタイトル見出しで始まり末尾改行がある", () => {
  // trimEnd 後も見出しに残るタイトルだけ（実装が文書末尾空白を落とすため）
  const titleArb = fc
    .string({ minLength: 1, maxLength: 40 })
    .filter(
      (title) =>
        !title.includes("\n") &&
        !title.includes("\r") &&
        title === title.trimEnd() &&
        title.trim() !== "",
    );
  fc.assert(
    fc.property(fc.array(fc.string(), { maxLength: 20 }), titleArb, (pages, title) => {
      const result = formatAsMarkdown(pages, title);
      assertEquals(result.startsWith(`# ${title}\n`), true);
      assertEquals(result.endsWith("\n"), true);
      if (!hasExtractedText(pages)) {
        assertEquals(result.includes("## Page"), false);
      }
    }),
  );
});

test("PBT formatAsContinuousMarkdown - ページ見出しを出さない", () => {
  fc.assert(
    fc.property(
      fc.array(fc.string(), { maxLength: 20 }),
      fc.constantFrom("doc", "x"),
      (pages, title) => {
        const result = formatAsContinuousMarkdown(pages, title);
        assertEquals(result.includes("## Page"), false);
        assertEquals(result.startsWith(`# ${title}`), true);
      },
    ),
  );
});

test("PBT joinLines - 空入力と段落境界を保持する", () => {
  fc.assert(
    fc.property(fc.array(fc.string({ maxLength: 40 }), { maxLength: 8 }), (paras) => {
      const input = paras.join("\n\n");
      const result = joinLines(input);
      if (input === "") {
        assertEquals(result, "");
        return;
      }
      const inCount = input.split(/\n{2,}/).length;
      const outCount = result.split(/\n{2,}/).length;
      assertEquals(outCount, inCount);
    }),
  );
});
