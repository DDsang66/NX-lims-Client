<script setup>
import { marked } from 'marked';
import CareSymbol from './CareSymbol.vue';

defineProps({
  result: { type: Object, required: true },
});
</script>

<template>
  <div class="result-container">
    <div class="summary-box">
      <h3>📋 洗护建议</h3>
      <p>{{ result.summary }}</p>
    </div>

    <div class="symbols-section" v-if="result.symbols && result.symbols.length > 0">
      <h3>🏷️ 识别到的洗护符号</h3>
      <div class="symbols-grid">
        <CareSymbol v-for="(symbol, index) in result.symbols" :key="index" :symbol="symbol" />
      </div>
    </div>

    <div class="raw-text-box" v-if="result.rawText">
      <h3>📝 提取的文字</h3>
      <div class="raw-text-md" v-html="marked(result.rawText || '')"></div>
    </div>
  </div>
</template>

<style scoped>
.result-container { display: flex; flex-direction: column; gap: 24px; }
.summary-box {
  background: linear-gradient(135deg, #e0f2fe, #dbeafe);
  border: 1px solid #93c5fd; border-radius: 12px; padding: 20px;
}
.summary-box h3 { margin: 0 0 8px 0; font-size: 18px; color: #1e40af; }
.summary-box p { margin: 0; font-size: 15px; color: #1e3a5f; line-height: 1.7; }
.symbols-section h3 { margin: 0 0 14px 0; font-size: 18px; color: #1f2937; }
.symbols-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.raw-text-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; }
.raw-text-box h3 { margin: 0 0 8px 0; font-size: 18px; color: #1f2937; }
.raw-text-box .raw-text-md {
  margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;
}
.raw-text-box .raw-text-md :deep(table) {
  border-collapse: collapse; width: 100%; margin: 8px 0;
}
.raw-text-box .raw-text-md :deep(th),
.raw-text-box .raw-text-md :deep(td) {
  border: 1px solid #d1d5db; padding: 6px 10px; text-align: left;
}
.raw-text-box .raw-text-md :deep(th) {
  background: #f3f4f6; font-weight: 600;
}
</style>
