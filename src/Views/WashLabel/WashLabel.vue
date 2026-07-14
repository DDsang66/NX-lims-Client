<script setup>
import { ref, inject } from 'vue';
import ImageUploader from './ImageUploader.vue';
import AnalysisResult from './AnalysisResult.vue';

const request = inject('request');
const isLoading = ref(false);
const result = ref(null);
const error = ref(null);

async function handleAnalyze(file) {
  isLoading.value = true;
  error.value = null;
  result.value = null;

  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await request.post('/WashLabel/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0  // AI 请求不设超时
    });
    result.value = res.data;
  } catch (e) {
    error.value = e.response?.data?.error || e.message || '分析失败';
  } finally {
    isLoading.value = false;
  }
}

function downloadJson() {
  if (!result.value) return;
  const blob = new Blob([JSON.stringify(result.value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wash-label-result.json';
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>洗标识别</h1>
      <p class="subtitle">上传服装洗护标签照片，AI 自动识别文字和洗护符号</p>
    </header>

    <main class="main">
      <div class="left-panel">
        <ImageUploader @analyze="handleAnalyze" />
      </div>

      <div class="right-panel">
        <div v-if="isLoading" class="loading-box">
          <div class="spinner"></div>
          <p>AI 正在分析洗标中…</p>
        </div>

        <div v-else-if="error" class="error-box">
          <p> {{ error }}</p>
          <button class="btn-retry" @click="error = null">好的</button>
        </div>

        <div v-else-if="!result" class="placeholder-box">
          <div class="placeholder-icon"></div>
          <p>上传洗标照片开始识别</p>
          <p class="placeholder-hint">支持识别水洗、漂白、干燥、熨烫、干洗等符号</p>
        </div>

        <div v-else class="result-wrapper">
          <div class="result-header">
            <button class="btn-download" @click="downloadJson">导出 JSON</button>
          </div>
          <AnalysisResult :result="result" />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  min-height: 100vh;
  box-sizing: border-box;
}
.header {
  text-align: center;
  margin-bottom: 36px;
}
.header h1 {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}
.subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}
.main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: start;
}
@media (max-width: 768px) {
  .main { grid-template-columns: 1fr; }
  .header h1 { font-size: 28px; }
}
.left-panel, .right-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
}
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  color: #6b7280;
}
.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error-box {
  text-align: center;
  padding: 40px 24px;
  color: #dc2626;
}
.btn-retry {
  margin-top: 12px;
  padding: 8px 20px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}
.placeholder-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  color: #9ca3af;
}
.placeholder-icon { font-size: 56px; margin-bottom: 12px; }
.placeholder-hint { font-size: 13px; margin-top: 4px; }
.result-wrapper { display: flex; flex-direction: column; gap: 16px; }
.result-header { display: flex; justify-content: flex-end; }
.btn-download {
  padding: 8px 18px;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.btn-download:hover { background: #4338ca; }
</style>
