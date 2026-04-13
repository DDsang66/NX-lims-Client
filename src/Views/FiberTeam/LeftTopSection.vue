<template>
  <section class="panel-section">
    <!-- 标题区 -->
    <div class="panel-header">
      <label class="panel-title">{{ $t('Setting Form') }}</label>
    </div>

    <!-- 表单区 -->
    <div class="panel-body">
      <el-form class="setting-form" label-width="120px" :size="size">
        <!-- 第一行：Report Number | Addition Item -->
        <div class="form-row">
          <!-- 左侧：Report Number -->
          <div class="form-col">
            <el-form-item label="Report Number" class="custom-item">
              <div class="input-group">
                <el-input v-model="localReportNums.data1" style="width: 70px;" disabled></el-input>
                <el-select v-model="localReportNums.data2" filterable style="width: 100px;">
                  <el-option value="405.">405.</el-option>
                  <el-option value="441.">441.</el-option>
                </el-select>
                <el-select v-model="localReportNums.data3" filterable style="width: 100px;">
                  <el-option :value="twoDigitYear+'.'"></el-option>
                  <el-option :value="twoDigitYear-1+'.'"></el-option>
                </el-select>
                <el-input v-model="localReportNums.data4" style="width: 220px;" @keydown="data4Keydown" @blur="data4Blur"></el-input>
                <el-input v-model="localReportNums.data5" style="width: 60px;"></el-input>
              </div>
            </el-form-item>
          </div>

          <!-- 中间：垂直分割线 -->
          <div class="v-divider"></div>

          <!-- 右侧：Component Type -->
          <div class="form-col">
            <el-form-item label="Component Type" class="custom-item">
              <el-select v-model="localForm.additionItem" style="width: 100%;">
                <el-option value=""></el-option>
                <el-option v-for="item in additionItems" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>

        <!-- 第二行：Location | Method -->
        <div class="form-row">
          <!-- 左侧：Location -->
          <div class="form-col">
            <el-form-item label="Method" class="custom-item">
              <div class="input-group">
                <el-select v-model="localForm.menuName" style="flex: 1; margin-right: 8px;" multiple collapse-tags @change="handleChange">
                  <el-option v-for="m in menuName" :key="m.value" :value="m.value" :label="m.label"></el-option>
                </el-select>
                <el-button @click="handleChange">Load Standard</el-button>
              </div>
            </el-form-item>
          </div>

          <!-- 中间：垂直分割线 -->
          <div class="v-divider"></div>

          <!-- 右侧：Method -->
          <div class="form-col">
            <el-form-item label="Buyer" class="custom-item">
              <el-select v-model="localForm.standard" style="width: 100%;">
                <el-option value=""></el-option>
                <el-option v-for="s in standards" :key="s.value" :value="s.value" :label="s.label"></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>

      </el-form>
    </div>
  </section>
</template>

<script setup>
  import { ref, watch, computed } from 'vue'
  import { ElMessage } from 'element-plus'

  const props = defineProps({
    reportNums: {
      type: Object,
      required: true
    },
    form: {
      type: Object,
      required: true
    },
    additionItems: {
      type: Array,
      default: () => []
    },
    menuName: {
      type: Array,
      default: () => []
    },
    standards: {
      type: Array,
      default: () => []
    }
  })

  const emit = defineEmits(['update:reportNums', 'update:form', 'submit-form'])

  const size = ref('default')
  const twoDigitYear = ref(new Date().getFullYear() % 100)

  // 使用本地副本以避免直接修改 props，并通过 watch 同步
  const localReportNums = ref({ ...props.reportNums })
  const localForm = ref({ ...props.form })

  watch(() => props.reportNums, (val) => {
    localReportNums.value = val
  }, { deep: true })

  watch(localReportNums, (val) => {
    emit('update:reportNums', val)
  }, { deep: true })

  watch(() => props.form, (val) => {
    localForm.value = val
  }, { deep: true })

  watch(localForm, (val) => {
    emit('update:form', val)
  }, { deep: true })
  
  // 监听 Report Number 变化
  watch(localReportNums, () => {
    localForm.value.reportNumber = localReportNums.value.data1 + localReportNums.value.data2 + localReportNums.value.data3 + localReportNums.value.data4 + localReportNums.value.data5
  }, { immediate: true, deep: true })

  const data4Blur = () => {
    if (!localReportNums.value.data4) return

    if (!/^\d+$/.test(localReportNums.value.data4)) {
      localReportNums.value.data4 = ''
      ElMessage.warning('Please enter a pure number')
      return
    }

    localReportNums.value.data4 = String(Number(localReportNums.value.data4))
    if (localReportNums.value.data4.length < 4) {
      localReportNums.value.data4 = localReportNums.value.data4.padStart(4, '0')
    }
  }

  const data4Keydown = () => {
    // Placeholder for keydown logic
  }

  const handleChange = () => {
    emit('submit-form')
  }
</script>

<style scoped lang="scss">
  .panel-section {
    background: #fff;
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    border-bottom: 2px solid #3364d5;
    padding: 15px 20px;
    background-color: #f5f7fa;
  }

  .panel-title {
    font-size: 30px;
    font-weight: bold;
    color: #3364d5;
    display: block;
  }

  .panel-body {
    padding: 20px;
  }

  .setting-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .form-row {
    display: flex;
    align-items: stretch;
    width: 100%;
  }

  .form-col {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .custom-item {
    width: 100%;
    margin-bottom: 0 !important;
    display: flex;
    align-items: center;
  }

  .custom-item :deep(.el-form-item__label) {
    height: 32px;
    line-height: 32px;
    font-size: 14px;
    font-weight: 500;
    color: #606266;
    padding-right: 12px;
    box-sizing: border-box;
    white-space: nowrap;
  }

  .custom-item :deep(.el-form-item__content) {
    line-height: 32px;
    flex: 1;
  }

  .input-group {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 5px;
  }

  .v-divider {
    width: 1px;
    background-color: #e0e0e0;
    margin: 0 20px;
    position: relative;
    min-height: 32px;
  }

  @media (max-width: 1200px) {
    .form-row {
      flex-direction: column;
      gap: 10px;
    }
    .v-divider {
      width: 100%;
      height: 1px;
      margin: 10px 0;
    }
  }
</style>





