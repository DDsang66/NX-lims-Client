<script setup>
import { ref } from 'vue';

const emit = defineEmits(['analyze']);
const fileInput = ref(null);
const previewUrl = ref(null);
const isDragging = ref(false);
const selectedFile = ref(null);

function handleFileSelect(event) {
  const file = event.target.files?.[0];
  if (file) setFile(file);
}
function handleDragOver(e) { e.preventDefault(); isDragging.value = true; }
function handleDragLeave() { isDragging.value = false; }
function handleDrop(e) {
  e.preventDefault();
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) setFile(file);
}
function setFile(file) {
  if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return; }
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
}
function handleAnalyze() {
  if (selectedFile.value) emit('analyze', selectedFile.value);
}
function clearFile() {
  selectedFile.value = null;
  if (previewUrl.value) { URL.revokeObjectURL(previewUrl.value); previewUrl.value = null; }
  if (fileInput.value) fileInput.value.value = '';
}
defineExpose({ clearFile });
</script>

<template>
  <div class="uploader">
    <div class="drop-zone" :class="{ dragging: isDragging, 'has-preview': previewUrl }"
         @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop" @click="fileInput?.click()">
      <template v-if="!previewUrl">
        <div class="upload-icon">📷</div>
        <p class="upload-text">拖拽洗标照片到这里，或点击选择</p>
        <p class="upload-hint">支持 JPG、PNG、GIF、WebP 格式，最大 10MB</p>
      </template>
      <img v-else :src="previewUrl" class="preview-image" alt="预览" />
      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/gif,image/webp" class="file-input" @change="handleFileSelect" />
    </div>
    <div class="actions" v-if="selectedFile">
      <button class="btn btn-secondary" @click="clearFile">重新选择</button>
      <button class="btn btn-primary" @click="handleAnalyze">🔍 开始识别</button>
    </div>
  </div>
</template>

<style scoped>
.uploader { display: flex; flex-direction: column; gap: 16px; }
.drop-zone {
  border: 2px dashed #d1d5db; border-radius: 14px; padding: 40px 24px; text-align: center;
  cursor: pointer; transition: all 0.25s; background: #fafafa; min-height: 200px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.drop-zone:hover { border-color: #6366f1; background: #eef2ff; }
.drop-zone.dragging { border-color: #4f46e5; background: #e0e7ff; transform: scale(1.01); }
.drop-zone.has-preview { padding: 12px; }
.upload-icon { font-size: 48px; margin-bottom: 12px; }
.upload-text { font-size: 16px; color: #374151; margin: 0 0 6px 0; font-weight: 500; }
.upload-hint { font-size: 13px; color: #9ca3af; margin: 0; }
.preview-image { max-width: 100%; max-height: 360px; border-radius: 8px; object-fit: contain; }
.file-input { display: none; }
.actions { display: flex; gap: 12px; justify-content: center; }
.btn {
  padding: 12px 28px; border: none; border-radius: 10px; font-size: 15px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-primary { background: #4f46e5; color: #fff; }
.btn-primary:hover { background: #4338ca; box-shadow: 0 4px 12px rgba(79,70,229,0.35); }
.btn-secondary { background: #fff; color: #374151; border: 1px solid #d1d5db; }
.btn-secondary:hover { background: #f3f4f6; }
</style>
