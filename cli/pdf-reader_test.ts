import { test } from "bun:test";
import { deepStrictEqual as assertEquals } from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PDFDocument, StandardFonts } from "pdf-lib";

import { extractTextFromPdf } from "./pdf-reader.ts";

test("extractTextFromPdf - ファイルの文字をページ単位で返す", async () => {
  const dir = await mkdtemp(join(tmpdir(), "pdf-reader-"));
  const filePath = join(dir, "hello.pdf");
  try {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([300, 200]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    page.drawText("Hello PDF", { x: 40, y: 100, size: 18, font });
    await writeFile(filePath, await pdf.save());

    const pages = await extractTextFromPdf(filePath);
    assertEquals(pages, ["Hello PDF"]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
