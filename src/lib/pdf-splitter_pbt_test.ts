import { test } from "bun:test";
import { deepStrictEqual as assertEquals } from "node:assert/strict";

import * as fc from "fast-check";
import { PDFDocument } from "pdf-lib";

import { splitPdf } from "./pdf-splitter.ts";

async function createTestPdf(pageCount: number): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    pdf.addPage([200, 200]);
  }
  return new Uint8Array(await pdf.save());
}

test("PBT splitPdf - 分割後のページ合計は元と同じ", async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.integer({ min: 1, max: 12 }),
      fc.array(fc.integer({ min: -2, max: 20 }), { maxLength: 8 }),
      async (pageCount, splitPoints) => {
        const pdfData = await createTestPdf(pageCount);
        const results = await splitPdf(pdfData, splitPoints, new Map(), "doc");
        let total = 0;
        for (const result of results) {
          const pdf = await PDFDocument.load(result.data);
          const count = pdf.getPageCount();
          assertEquals(count, result.pageRange.end - result.pageRange.start + 1);
          total += count;
        }
        assertEquals(total, pageCount);
        assertEquals(results.length >= 1, true);
      },
    ),
    { numRuns: 25 },
  );
});
