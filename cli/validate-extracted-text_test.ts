import { assertThrows } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { validateExtractedText } from "../src/lib/validate-extracted-text.ts";

Deno.test("本文のない PDF は OCR が必要な旨を通知する", () => {
  for (const pages of [[], [""], ["", " \n\t", ""]]) {
    assertThrows(() => validateExtractedText(pages), Error, "OCR");
  }
});

Deno.test("空白ページが混在していても本文があれば変換できる", () => {
  validateExtractedText(["", "本文", " "]);
});
