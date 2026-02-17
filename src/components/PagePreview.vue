<script setup lang="ts">
defineProps<{
  previewUrl: string | null;
  pageNumber: number;
  isLoading: boolean;
}>();
</script>

<template>
  <div class="preview-panel">
    <div class="preview-header">
      <span class="preview-label">ページ {{ pageNumber }}</span>
    </div>
    <div class="preview-image-wrapper">
      <div v-if="isLoading" class="preview-loading">読み込み中...</div>
      <img v-else-if="previewUrl" :src="previewUrl" :alt="`ページ ${pageNumber} プレビュー`" class="preview-image" />
      <div v-else class="preview-placeholder">プレビューなし</div>
    </div>
  </div>
</template>

<style scoped>
.preview-panel {
  width: 360px;
  flex-shrink: 0;
  position: sticky;
  top: 1rem;
}

.preview-header {
  margin-bottom: 0.5rem;
}

.preview-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
}

.preview-image-wrapper {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  display: block;
}

.preview-loading,
.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 480px;
  color: #999;
  font-size: 0.875rem;
}
</style>
