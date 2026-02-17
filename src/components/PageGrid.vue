<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import type { PageInfo } from "../types/pdf.ts";
import PageThumbnail from "./PageThumbnail.vue";
import SplitMarker from "./SplitMarker.vue";

defineProps<{
  pages: PageInfo[];
  splitPoints: Set<number>;
  fileName: string;
}>();

const emit = defineEmits<{
  "toggle-split": [pageNumber: number];
  "request-thumbnail": [pageNumber: number];
}>();

const gridRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!gridRef.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const pageNum = Number(entry.target.getAttribute("data-page"));
          if (pageNum) emit("request-thumbnail", pageNum);
          observer?.unobserve(entry.target);
        }
      }
    },
    { root: null, rootMargin: "200px", threshold: 0 },
  );

  for (const el of gridRef.value.querySelectorAll("[data-page]")) {
    observer.observe(el);
  }
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <div ref="gridRef" class="page-grid">
    <template v-for="page in pages" :key="page.pageNumber">
      <div class="grid-item" :data-page="page.pageNumber">
        <PageThumbnail :page="page" :file-name="fileName" />
      </div>
      <SplitMarker
        v-if="page.pageNumber < pages.length"
        :active="splitPoints.has(page.pageNumber)"
        @toggle="emit('toggle-split', page.pageNumber)"
      />
    </template>
  </div>
</template>

<style scoped>
.page-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1rem 0;
}

.grid-item {
  flex-shrink: 0;
}
</style>
