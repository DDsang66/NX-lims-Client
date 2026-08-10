<template>
  <div>
    开发中
  </div>
</template>

<script setup>

</script>

<style scoped lang="scss">
.domContent {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

// ==================== 上半区样式 ====================
.topHalf {
  display: flex;
  gap: 15px;
}

  .halfBox {
    flex: 1;
    min-width: 0; // 关键：防止内容撑开 flex 容器
    border: 1px solid var(--el-border-color);
    border-radius: 10px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden; // 确保内容不会溢出
    gap: 10px;
  }

  // 给表格添加固定布局
  .halfBox :deep(.el-table) {
    table-layout: fixed;
  }

.boxTitle {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.formula-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

// ==================== 下半区样式 ====================
.bottomBox {
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ruleToolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.removeTableGaps :deep(table) {
  margin-bottom: 0 !important;
}

.modeToggle {
  display: flex;
  gap: 8px;
}
.modeBlock {
  padding: 4px 16px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
}
.modeBlock.active {
  background: #409EFF;
  color: #fff;
  border-color: #409EFF;
}
</style>
