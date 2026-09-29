import { computed, ref } from "vue";
import { formatAsContinuousMarkdown, formatAsMarkdown, joinLines } from "../lib/markdown-writer.ts";
import { extractTextFromFile } from "../lib/pdf-reader.ts";

export function usePdfConverter() {
  const pages = ref<string[]>([]);
  const fileName = ref("");
  const merge = ref(false);
  const stripBreaks = ref(false);
  const isProcessing = ref(false);
  const error = ref("");
  const ocr = ref(false);
  const progress = ref("");
  const hasFile = ref(false);
  let selectedFile: File | undefined;

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
    selectedFile = file;
    hasFile.value = true;
    progress.value = "PDF を読み込み中...";
    error.value = "";
    isProcessing.value = true;
    pages.value = [];
    try {
      fileName.value = file.name;
      const extractedPages = await extractTextFromFile(file, {
        ocr: ocr.value,
        onProgress: (message) => {
          progress.value = message;
        },
      });
      pages.value = extractedPages;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "PDF の読み込みに失敗しました";
      pages.value = [];
    } finally {
      isProcessing.value = false;
    }
  }

  async function reprocessFile(): Promise<void> {
    if (selectedFile) await processFile(selectedFile);
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
    isProcessing,
    error,
    ocr,
    progress,
    hasFile,
    reprocessFile,
    markdown,
    processFile,
    downloadMarkdown,
  };
}
