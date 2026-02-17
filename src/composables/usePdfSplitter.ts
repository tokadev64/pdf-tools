import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { computed, ref, watch } from "vue";
import { downloadSplitResults, splitPdf } from "../lib/pdf-splitter.ts";
import { renderThumbnail } from "../lib/pdf-thumbnail.ts";
import type { PageInfo } from "../types/pdf.ts";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).href;

export function usePdfSplitter() {
  const pages = ref<PageInfo[]>([]);
  const splitPoints = ref<Set<number>>(new Set());
  const fileName = ref("");
  const pdfData = ref<Uint8Array | null>(null);
  const isLoading = ref(false);
  const isSplitting = ref(false);
  const error = ref("");

  let pdfDocument: PDFDocumentProxy | null = null;

  const splitCount = computed(() => splitPoints.value.size + 1);
  const canSplit = computed(() => splitPoints.value.size > 0);

  async function loadPdf(file: File): Promise<void> {
    error.value = "";
    isLoading.value = true;
    try {
      const buffer = await file.arrayBuffer();
      pdfData.value = new Uint8Array(buffer);
      fileName.value = file.name;

      pdfDocument = await getDocument({ data: pdfData.value.slice() }).promise;
      const totalPages = pdfDocument.numPages;

      pages.value = Array.from({ length: totalPages }, (_, i) => ({
        pageNumber: i + 1,
        rotation: 0,
        thumbnailUrl: null,
      }));

      splitPoints.value = new Set();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "PDF の読み込みに失敗しました";
      pages.value = [];
      pdfData.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadThumbnail(pageNumber: number): Promise<void> {
    if (!pdfDocument) return;
    const page = pages.value.find((p) => p.pageNumber === pageNumber);
    if (!page || page.thumbnailUrl) return;

    try {
      const url = await renderThumbnail(pdfDocument, pageNumber, page.rotation);
      pages.value = pages.value.map((p) =>
        p.pageNumber === pageNumber ? { ...p, thumbnailUrl: url } : p,
      );
    } catch {
      // サムネイル描画失敗はプレースホルダーのまま
    }
  }

  function toggleSplit(pageNumber: number): void {
    const next = new Set(splitPoints.value);
    if (next.has(pageNumber)) {
      next.delete(pageNumber);
    } else {
      next.add(pageNumber);
    }
    splitPoints.value = next;
  }

  function rotatePage(pageNumber: number, direction: 90 | -90): void {
    pages.value = pages.value.map((p) => {
      if (p.pageNumber !== pageNumber) return p;
      return { ...p, rotation: (p.rotation + direction + 360) % 360, thumbnailUrl: null };
    });
  }

  function rotateAllPages(direction: 90 | -90): void {
    pages.value = pages.value.map((p) => ({
      ...p,
      rotation: (p.rotation + direction + 360) % 360,
      thumbnailUrl: null,
    }));
  }

  watch(
    () => pages.value.map((p) => `${p.pageNumber}:${p.rotation}`).join(","),
    () => {
      for (const page of pages.value) {
        if (!page.thumbnailUrl) {
          loadThumbnail(page.pageNumber);
        }
      }
    },
  );

  async function executeSplit(): Promise<void> {
    if (!pdfData.value || !canSplit.value) return;

    error.value = "";
    isSplitting.value = true;
    try {
      const rotations = new Map<number, number>();
      for (const page of pages.value) {
        if (page.rotation !== 0) {
          rotations.set(page.pageNumber, page.rotation);
        }
      }

      const baseName = fileName.value.replace(/\.pdf$/i, "");
      const results = await splitPdf(pdfData.value, [...splitPoints.value], rotations, baseName);

      downloadSplitResults(results, `${baseName}.zip`);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "PDF の分割に失敗しました";
    } finally {
      isSplitting.value = false;
    }
  }

  return {
    pages,
    splitPoints,
    fileName,
    isLoading,
    isSplitting,
    error,
    splitCount,
    canSplit,
    loadPdf,
    loadThumbnail,
    toggleSplit,
    rotatePage,
    rotateAllPages,
    executeSplit,
  };
}
