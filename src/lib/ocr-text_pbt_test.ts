import { test } from "bun:test";
import { deepStrictEqual as assertEquals } from "node:assert/strict";

import * as fc from "fast-check";

import { collapseOcrSpaces } from "./ocr-text.ts";

test("PBT collapseOcrSpaces - 冪等で改行数を変えない", () => {
  fc.assert(
    fc.property(fc.string({ maxLength: 80 }), (text) => {
      const once = collapseOcrSpaces(text);
      const twice = collapseOcrSpaces(once);
      assertEquals(twice, once);
      assertEquals(
        [...once].filter((c) => c === "\n").length,
        [...text].filter((c) => c === "\n").length,
      );
    }),
  );
});

test("PBT collapseOcrSpaces - ASCII 単語間の単一スペースを消さない", () => {
  fc.assert(
    fc.property(
      fc.array(fc.constantFrom("Open", "ID", "Connect", "HTTP", "PDF"), {
        minLength: 2,
        maxLength: 5,
      }),
      (words) => {
        const text = words.join(" ");
        assertEquals(collapseOcrSpaces(text), text);
      },
    ),
  );
});
