import { computed, ref } from "vue";

import {
  formatAsContinuousMarkdown,
  formatAsMarkdown,
  hasExtractedText,
  joinLines,
} from "../lib/markdown-writer.ts";
import type { OcrLang } from "../lib/ocr.ts";
import { extractTextFromFile } from "../lib/pdf-reader.ts";

const UNREADABLE_PDF_TEXT_MESSAGE = "この PDF からテキストを読み取れませんでした。";

export function usePdfConverter() {
  const pages = ref<string[]>([]);
  const fileName = ref("");
  const merge = ref(false);
  const stripBreaks = ref(false);
  const ocrLang = ref<OcrLang>("jpn+eng");
  const isProcessing = ref(false);
  const status = ref("");
  const error = ref("");

  const markdown = computed(() => {
    if (pages.value.length === 0) return "";
    const title = fileName.value.replace(/\.pdf$/i, "");
    const raw = merge.value
      ? formatAsContinuousMarkdown(pages.value, title)
      : formatAsMarkdown(pages.value, title);
    return stripBreaks.value ? joinLines(raw) : raw;
  });

  async function processFile(file: File): Promise<void> {
    if (isProcessing.value) return;
    error.value = "";
    isProcessing.value = true;
    status.value = "テキストを抽出しています";
    try {
      fileName.value = file.name;
      const extracted = await extractTextFromFile(file, {
        ocrLang: ocrLang.value,
        onStatus: (message) => {
          status.value = message;
        },
      });
      if (!hasExtractedText(extracted)) {
        pages.value = [];
        error.value = UNREADABLE_PDF_TEXT_MESSAGE;
        return;
      }
      pages.value = extracted;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "PDF の読み込みに失敗しました";
      pages.value = [];
    } finally {
      isProcessing.value = false;
      status.value = "";
    }
  }

  function downloadMarkdown(): void {
    if (!markdown.value) return;
    const blob = new Blob([markdown.value], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.value.replace(/\.pdf$/i, ".md");
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    pages,
    fileName,
    merge,
    stripBreaks,
    ocrLang,
    isProcessing,
    status,
    error,
    markdown,
    processFile,
    downloadMarkdown,
  };
}
