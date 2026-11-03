import { test } from "bun:test";
import { deepStrictEqual as assertEquals } from "node:assert/strict";

import * as fc from "fast-check";

import {
  OCR_WORKER_LIMIT,
  imageOnlyPageIndexes,
  ocrConcurrency,
  type PageTextSource,
} from "./ocr-pages.ts";

test("PBT ocrConcurrency - 0..(min(page, cores, limit)) に収まる", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 100 }),
      fc.option(fc.double({ min: -2, max: 64, noNaN: true }), { nil: undefined }),
      (pageCount, cores) => {
        const result = ocrConcurrency(pageCount, cores);
        if (pageCount < 1) {
          assertEquals(result, 0);
          return;
        }
        const expectedCores =
          cores !== undefined && Number.isFinite(cores) && cores > 0 ? Math.floor(cores) : 2;
        assertEquals(result, Math.min(pageCount, expectedCores, OCR_WORKER_LIMIT));
        assertEquals(result >= 0 && result <= OCR_WORKER_LIMIT, true);
      },
    ),
  );
});

test("PBT imageOnlyPageIndexes - 空白テキストかつ画像の index だけ", () => {
  const pageArb: fc.Arbitrary<PageTextSource> = fc.record({
    text: fc.string(),
    hasImage: fc.boolean(),
  });

  fc.assert(
    fc.property(fc.array(pageArb, { maxLength: 30 }), (pages) => {
      const indexes = imageOnlyPageIndexes(pages);
      for (const index of indexes) {
        assertEquals(pages[index].text.trim() === "" && pages[index].hasImage, true);
      }
      for (let i = 0; i < pages.length; i++) {
        const should = pages[i].text.trim() === "" && pages[i].hasImage;
        assertEquals(indexes.includes(i), should);
      }
    }),
  );
});
