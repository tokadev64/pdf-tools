import { test } from "bun:test";
import { deepStrictEqual as assertEquals } from "node:assert/strict";

import { PDFDocument, PDFRawStream } from "pdf-lib";
import { drawImage } from "pdf-lib/es/api/operations.js";
import { getDocument } from "pdfjs-dist";

import { hasPdfImageOperator, imageOnlyPageIndexes, ocrConcurrency } from "./ocr-pages.ts";

test("ocrConcurrency - ページ数・コア数・上限の小さい方を返す", () => {
  assertEquals(ocrConcurrency(0, 8), 0);
  assertEquals(ocrConcurrency(1, 8), 1);
  assertEquals(ocrConcurrency(10, 2), 2);
  assertEquals(ocrConcurrency(10, 8), 4);
  assertEquals(ocrConcurrency(10), 2);
});

test("hasPdfImageOperator - 画像マスクの描画も画像ページとみなす", async () => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([8, 8]);
  const dict = doc.context.obj({
    Type: "XObject",
    Subtype: "Image",
    Width: 8,
    Height: 8,
    ImageMask: true,
    BitsPerComponent: 1,
  });
  const ref = doc.context.register(PDFRawStream.of(dict, new Uint8Array(8)));
  const key = page.node.newXObject("Im0", ref);
  page.getContentStream().push(
    ...drawImage(key.decodeText(), {
      x: 0,
      y: 0,
      width: 8,
      height: 8,
      rotate: { type: "degrees", angle: 0 },
      xSkew: { type: "degrees", angle: 0 },
      ySkew: { type: "degrees", angle: 0 },
    }),
  );

  const pdf = await getDocument({ data: new Uint8Array(await doc.save()) }).promise;
  try {
    const ops = await (await pdf.getPage(1)).getOperatorList();
    assertEquals(hasPdfImageOperator(ops.fnArray), true);
  } finally {
    await pdf.destroy();
  }
});

test("imageOnlyPageIndexes - 文字が無く画像があるページだけを返す", () => {
  assertEquals(
    imageOnlyPageIndexes([
      { text: "本文", hasImage: false },
      { text: "", hasImage: true },
      { text: "  ", hasImage: true },
      { text: "", hasImage: false },
      { text: "図の説明", hasImage: true },
    ]),
    [1, 2],
  );
});
