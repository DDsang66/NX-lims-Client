<template>
  <section class="panel-section">
    <!-- 标题区 -->
    <div class="panel-header" style="display: flex; align-items: center; justify-content: space-between;">
      <div class="header-left">
        <label class="panel-title">{{ $t('Setting Form') }}</label>
      </div>
      <el-button type="primary" @click="$emit('refresh')">Refresh</el-button>
    </div>

    <!-- 表单区 -->
    <div class="panel-body">
      <el-form class="setting-form" label-width="120px" :size="size">
        <!-- 第一行：Report Number | Addition Item -->
        <div class="form-row">
          <!-- 左侧：Report Number（宽度保持原样 1:1，别跟着 Method 那行变） -->
          <div class="form-col">
            <el-form-item class="custom-item">
                <template #label>Report Number <span class="text-danger">*</span></template>
              <!-- 紧凑两排：87. | 405. | 26. 在一排，流水号 | .01 在第二排。
                   单排五格在半幅面板里放不下（会被挤成四排），固定宽度只留给定长段。 -->
              <div class="input-group report-no">
                <div class="input-line">
                  <el-input v-model="localReportNums.data1" class="rn-prefix" disabled></el-input>
                  <el-select v-model="localReportNums.data2" class="rn-flex" filterable>
                    <el-option value="405.">405.</el-option>
                    <el-option value="441.">441.</el-option>
                  </el-select>
                  <el-select v-model="localReportNums.data3" class="rn-flex" filterable>
                    <el-option :value="twoDigitYear+'.'"></el-option>
                    <el-option :value="twoDigitYear-1+'.'"></el-option>
                  </el-select>
                </div>
                <div class="input-line">
                  <el-input v-model="localReportNums.data4" class="rn-serial" @keydown="data4Keydown" @blur="data4Blur"></el-input>
                  <el-input v-model="localReportNums.data5" class="rn-suffix"></el-input>
                </div>
              </div>
            </el-form-item>
          </div>

          <!-- 中间：垂直分割线 -->
          <div class="v-divider"></div>

          <!-- 右侧：Component Type -->
          <div class="form-col">
            <el-form-item class="custom-item">
                <template #label>Component Type <span class="text-danger">*</span></template>
              <el-select v-model="localForm.additionItem" style="width: 100%;">
                <el-option v-for="item in additionItems" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>

        <!-- 第二行：Location | Method -->
        <div class="form-row">
          <!-- 左侧：Method（方法下拉 + 口径开关，故与上面 Report Number 一样取 2 份宽） -->
          <div class="form-col col-main">
            <el-form-item class="custom-item">
                <template #label>Method <span class="text-danger">*</span></template>
              <div class="input-group">
                <el-select v-model="localForm.menuName" class="method-select" multiple collapse-tags>
                  <el-option v-for="m in menuName" :key="m.value" :value="m.value" :label="m.label"></el-option>
                </el-select>
                <!-- 标准口径二选一：常规 = 各标准的当前版本；2C = 只印 CNAS 与 CMA **双资质**范围内的版本
                     （资质范围通常落后于最新版，盖章出报告只能引资质内的版本）。
                     做二选一而不是 toggle，是因为按钮上要能直接看出**当前是哪个口径**。
                     值随下面的 watch(localForm) 一路带回父组件，模式本身**不落库** —— 它只活在这一趟生成里。 -->
                <el-radio-group v-model="localForm.standardMode"
                                class="mode-switch"
                                title="常规 = 当前版本；2C = 只印 CNAS 与 CMA 双资质范围内的版本">
                  <el-radio-button value="Current">常规</el-radio-button>
                  <el-radio-button value="Dual">2C</el-radio-button>
                </el-radio-group>
              </div>
            </el-form-item>
          </div>

          <!-- 中间：垂直分割线 -->
          <div class="v-divider"></div>

          <!-- 右侧：Buyer -->
          <div class="form-col col-side">
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
  import { ref, watch } from 'vue'
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

  const emit = defineEmits(['update:reportNums', 'update:form', 'refresh'])

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

  /* 标题 + 口径开关同一组靠左，Refresh 单独留在右端 */
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  /* 口径开关现在贴在 Method 下拉右边：与下拉同高、别抢宽度，所以字号收到 13px */
  .mode-switch {
    flex-shrink: 0;
    margin-left: 3px;
  }

  .mode-switch :deep(.el-radio-button__inner) {
    font-size: 13px;
    line-height: 1;
    padding: 9px 12px;
  }

  .method-select {
    flex: 1;
    min-width: 0;
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

  /* 只 Method 那一行取 2:1：右边 Buyer 只有一个下拉、有富余，
     匀出来的宽度留给 Method 下拉 + 口径开关，Method 框保持加开关之前的宽度。
     Report Number 那行仍是 1:1，宽度不变。 */
  .form-col.col-main {
    flex: 2;
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

  /* Report Number：两排，两个定长段（87. / .01）不吃剩余宽度，其余等分 */
  .input-group.report-no {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }

  .input-line {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 5px;
  }

  /* 值要完整可见：等分段只许涨、不许缩到切字，各自留一个刚好放得下内容的下限 */
  .input-line .rn-flex {
    flex: 1 1 0;
    min-width: 84px;
  }

  .input-line .rn-serial {
    flex: 1 1 0;
    min-width: 120px;
  }

  .input-line .rn-prefix,
  .input-line .rn-suffix {
    flex: 0 0 60px;
    width: 60px;
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





