<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  markdown: string;
  fileName: string;
}>();

const emit = defineEmits<{
  download: [];
}>();

const copied = ref(false);

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.markdown);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    alert("クリップボードへのコピーに失敗しました");
  }
}
</script>

<template>
  <div class="preview">
    <div class="toolbar">
      <span class="file-name">{{ fileName }}</span>
      <div class="actions">
        <button @click="copyToClipboard">
          {{ copied ? "Copied!" : "Copy" }}
        </button>
        <button @click="emit('download')">Download .md</button>
      </div>
    </div>
    <pre class="content">{{ markdown }}</pre>
  </div>
</template>

<style scoped>
.preview {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border-bottom: 1px solid #ccc;
}

.file-name {
  font-weight: bold;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.actions button {
  padding: 0.3rem 0.8rem;
  border: 1px solid #888;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.actions button:hover {
  background: #eee;
}

.content {
  padding: 1rem;
  margin: 0;
  max-height: 60vh;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.85rem;
  line-height: 1.6;
}
</style>
