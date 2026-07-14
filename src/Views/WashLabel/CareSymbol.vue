<script setup>
defineProps({
  symbol: { type: Object, required: true },
});

const categoryColors = {
  washing: '#3b82f6', bleaching: '#f59e0b', drying: '#10b981',
  ironing: '#ef4444', dryCleaning: '#8b5cf6',
};
const categoryLabels = {
  washing: '水洗', bleaching: '漂白', drying: '干燥',
  ironing: '熨烫', dryCleaning: '干洗',
};
const categoryIcons = {
  washing: '🫧', bleaching: '△', drying: '☐',
  ironing: '♨', dryCleaning: '○',
};
function getColor(c) { return categoryColors[c] || '#6b7280'; }
function getLabel(c) { return categoryLabels[c] || c; }
</script>

<template>
  <div class="symbol-card" :style="{ borderLeftColor: getColor(symbol.category) }">
    <div class="symbol-header">
      <span class="symbol-category" :style="{ background: getColor(symbol.category) }">{{ getLabel(symbol.category) }}</span>
      <span class="symbol-icon">{{ categoryIcons[symbol.category] || '🏷️' }}</span>
    </div>
    <h4 class="symbol-name">{{ symbol.name }}</h4>
    <p class="symbol-meaning">{{ symbol.meaning }}</p>
  </div>
</template>

<style scoped>
.symbol-card {
  background: #fff; border: 1px solid #e5e7eb; border-left: 4px solid;
  border-radius: 10px; padding: 16px; transition: box-shadow 0.2s;
}
.symbol-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.symbol-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.symbol-category { color: #fff; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 12px; }
.symbol-icon { font-size: 28px; }
.symbol-name { margin: 0 0 4px 0; font-size: 16px; color: #1f2937; }
.symbol-meaning { margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5; }
</style>
