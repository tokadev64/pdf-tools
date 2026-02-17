import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { PDFDocument } from "pdf-lib";
import { splitPdf } from "./pdf-splitter.ts";

/** テスト用の N ページ PDF を生成する */
async function createTestPdf(pageCount: number): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    pdf.addPage([200, 200]);
  }
  return new Uint8Array(await pdf.save());
}

// --- splitPdf ---

Deno.test("splitPdf - 分割点なしの場合は元 PDF と同じ1ファイルを返す", async () => {
  const pdfData = await createTestPdf(5);
  const results = await splitPdf(pdfData, [], new Map(), "test");

  assertEquals(results.length, 1);
  assertEquals(results[0].pageRange, { start: 1, end: 5 });
  assertEquals(results[0].fileName, "test.pdf");

  const resultPdf = await PDFDocument.load(results[0].data);
  assertEquals(resultPdf.getPageCount(), 5);
});

Deno.test("splitPdf - 単一分割点で2ファイルに分割する", async () => {
  const pdfData = await createTestPdf(6);
  const results = await splitPdf(pdfData, [3], new Map(), "doc");

  assertEquals(results.length, 2);
  assertEquals(results[0].pageRange, { start: 1, end: 3 });
  assertEquals(results[0].fileName, "doc_1.pdf");
  assertEquals(results[1].pageRange, { start: 4, end: 6 });
  assertEquals(results[1].fileName, "doc_2.pdf");

  const pdf1 = await PDFDocument.load(results[0].data);
  const pdf2 = await PDFDocument.load(results[1].data);
  assertEquals(pdf1.getPageCount(), 3);
  assertEquals(pdf2.getPageCount(), 3);
});

Deno.test("splitPdf - 複数分割点で3ファイルに分割する", async () => {
  const pdfData = await createTestPdf(10);
  const results = await splitPdf(pdfData, [3, 7], new Map(), "report");

  assertEquals(results.length, 3);
  assertEquals(results[0].pageRange, { start: 1, end: 3 });
  assertEquals(results[1].pageRange, { start: 4, end: 7 });
  assertEquals(results[2].pageRange, { start: 8, end: 10 });

  const pdf1 = await PDFDocument.load(results[0].data);
  const pdf2 = await PDFDocument.load(results[1].data);
  const pdf3 = await PDFDocument.load(results[2].data);
  assertEquals(pdf1.getPageCount(), 3);
  assertEquals(pdf2.getPageCount(), 4);
  assertEquals(pdf3.getPageCount(), 3);
});

Deno.test("splitPdf - 先頭ページで分割（1ページ目のみ分離）", async () => {
  const pdfData = await createTestPdf(4);
  const results = await splitPdf(pdfData, [1], new Map(), "doc");

  assertEquals(results.length, 2);
  assertEquals(results[0].pageRange, { start: 1, end: 1 });
  assertEquals(results[1].pageRange, { start: 2, end: 4 });

  const pdf1 = await PDFDocument.load(results[0].data);
  assertEquals(pdf1.getPageCount(), 1);
});

Deno.test("splitPdf - 末尾の1つ前で分割", async () => {
  const pdfData = await createTestPdf(4);
  const results = await splitPdf(pdfData, [3], new Map(), "doc");

  assertEquals(results.length, 2);
  assertEquals(results[0].pageRange, { start: 1, end: 3 });
  assertEquals(results[1].pageRange, { start: 4, end: 4 });

  const pdf2 = await PDFDocument.load(results[1].data);
  assertEquals(pdf2.getPageCount(), 1);
});

Deno.test("splitPdf - 全ページで分割（各ページが1ファイル）", async () => {
  const pdfData = await createTestPdf(3);
  const results = await splitPdf(pdfData, [1, 2], new Map(), "each");

  assertEquals(results.length, 3);
  for (const result of results) {
    const pdf = await PDFDocument.load(result.data);
    assertEquals(pdf.getPageCount(), 1);
  }
});

Deno.test("splitPdf - 重複分割点は無視される", async () => {
  const pdfData = await createTestPdf(6);
  const results = await splitPdf(pdfData, [3, 3, 3], new Map(), "dup");

  assertEquals(results.length, 2);
  assertEquals(results[0].pageRange, { start: 1, end: 3 });
  assertEquals(results[1].pageRange, { start: 4, end: 6 });
});

Deno.test("splitPdf - 範囲外の分割点は無視される", async () => {
  const pdfData = await createTestPdf(5);
  const results = await splitPdf(pdfData, [0, 5, 10, -1], new Map(), "out");

  assertEquals(results.length, 1);
  assertEquals(results[0].pageRange, { start: 1, end: 5 });
});

Deno.test("splitPdf - 回転が適用される", async () => {
  const pdfData = await createTestPdf(3);
  const rotations = new Map([[2, 90]]);
  const results = await splitPdf(pdfData, [], rotations, "rotated");

  assertEquals(results.length, 1);
  const resultPdf = await PDFDocument.load(results[0].data);
  const page2 = resultPdf.getPage(1);
  assertEquals(page2.getRotation().angle, 90);
});

Deno.test("splitPdf - 未ソートの分割点は正しくソートされる", async () => {
  const pdfData = await createTestPdf(10);
  const results = await splitPdf(pdfData, [7, 3], new Map(), "unsorted");

  assertEquals(results.length, 3);
  assertEquals(results[0].pageRange, { start: 1, end: 3 });
  assertEquals(results[1].pageRange, { start: 4, end: 7 });
  assertEquals(results[2].pageRange, { start: 8, end: 10 });
});
