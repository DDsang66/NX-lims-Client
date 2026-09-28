<template>
  <section class="panel-section fiber-section">
    <!-- 标题区 -->
    <div class="panel-header simple-header">
      <div class="header-left">
        <a href="#" @click.prevent="toggleNotice()" class="collapsible-title">
          <div class="title-group">
            <span class="title-text">{{ $t('Single dissolved component') }}</span>
          </div>
          <el-icon class="arrow-icon" :class="{ 'is-reverse': !isNoticeOpen }">
            <ArrowDown />
          </el-icon>
        </a>
      </div>
    </div>

    <!-- 内容区 -->
    <transition name="fade">
      <div v-show="isNoticeOpen" class="panel-body fiber-body">
        <div class="mainContainer">
          <!-- 循环渲染多个 Section -->
          <div v-for="(section, sIndex) in localSections" :key="section.id" class="oneSampleComposition">
            <!-- Section 标题行 -->
            <div class="section-header-row">
              <span class="section-title">{{ section.title }}</span>
              <el-button v-if="localSections.length > 1" type="danger" link @click="removeSection(sIndex)" class="remove-section-btn">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>

            <!-- 表格区域 -->
            <div class="table-wrapper custom-table">
              <!-- 方向键/Enter/Tab 的跨格导航走**捕获阶段**委托：el-select 会在内层 input 上
                   对 ↑↓/Enter 做 stopPropagation，冒泡阶段收不到（见 utils/tableKeyboardNav.js 注释） -->
              <table class="custom-table-layout" @keydown.capture="handleGridKeydown">
                <!-- 表头第一行 -->
                <thead>
                  <tr>
                    <th class="header-row-1"></th>
                    <th class="header-row-1"></th>
                    <th class="header-row-1">Operation</th>
                  </tr>
                  <!-- 表头第二行 -->
                  <tr>
                    <th class="header-row-2">Sample<span class="text-danger">*</span></th>
                    <th class="header-row-2">Composition<span class="text-danger">*</span></th>
                    <th class="header-row-2" style="text-align:center">
                      Delete Row
                    </th>
                  </tr>
                </thead>
                <!-- 表格内容 -->
                <tbody>
                  <tr v-for="(row, rIndex) in section.rows" :key="rIndex">
                    <td class="cell-location">
                      <el-input type="text" placeholder="Location" v-model="row.location" />
                    </td>
                    <td class="cell-composition">
                      <el-select clearable v-model="row.composition" placeholder="成分" filterable style="width: 100%"
                        :filter-method="onCompositionQuery" @visible-change="onCompositionVisibleChange">
                        <el-option v-for="item in filteredCompositions" :key="item" :value="item">{{ item }}</el-option>
                      </el-select>
                    </td>
                    <td class="cell-action">
                      <el-button type="danger" link @click="removeRow(sIndex, rIndex)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- 追加的行的 Location/成分/Trial 直接在行内填，故有此按钮 -->
            <el-button type="primary" plain class="add-row-btn" @click="appendRow(sIndex)">
              <el-icon><Plus /></el-icon> Add
            </el-button>

          </div>
        </div>

        <!-- 新增：独立的12个输入框区域，位于 mainContainer 下方 -->
        <div class="extra-inputs-container">
          <!-- 第一行：1个输入框 -->
          <!-- 2026-09-28：Final Result / Durability Label / Other Label / Comprehensive 四项
               随模板 conclusion 段删行一并下线。
               ⚠️ 剩余项仍用 input1 / input6 / input8 / input9 / input10 这些**位置式旧键名**，
               删掉的 input2~input5 必须**留空号**，不可把后面的往前挪。 -->
          <div class="row">
            <div class="form-group col-xl-12">
              <label>Vertify Result</label>
              <el-select clearable v-model="extraInputs.input1" placeholder="" style="width: 100%">
                <el-option label="Pass" value="Pass"></el-option>
                <el-option label="Fail" value="Fail"></el-option>
                <el-option label="Pending" value="Pending"></el-option>
                <el-option label="Conclusion: The information listed on the fibre content label is appropriate." value="Conclusion: The information listed on the fibre content label is appropriate."></el-option>
              </el-select>
            </div>
          </div>

          <!-- 第二行：1个输入框 -->
          <div class="row">
            <div class="form-group col-xl-12">
              <label>Recommended Label</label>
              <el-select v-model="extraInputs.input6" placeholder="" style="width: 100%">
                <el-option value="Yes" label="Yes"></el-option>
                <el-option value="" label=""></el-option>
              </el-select>
            </div>
          </div>

          <!-- 第三行：2个下拉选择 -->
          <div class="row">
            <div class="form-group col-xl-6">
              <label>Result Remark</label>
              <!-- 多选：选项 55 条、单条最长 179 字符（中英双语成对），不折叠会把表单行撑高、与右列错位 -->
              <el-select multiple collapse-tags collapse-tags-tooltip clearable v-model="extraInputs.resultRemark" placeholder="" style="width: 100%">
                <el-option v-for="item in resultRemarkOptions" :key="item" :value="item" :label="item"></el-option>
              </el-select>
            </div>
            <div class="form-group col-xl-6">
              <label>Label Remark</label>
              <!-- 多选，同上 -->
              <el-select multiple collapse-tags collapse-tags-tooltip clearable v-model="extraInputs.input8" placeholder="" style="width: 100%">
                <el-option v-for="item in labelRemarkOptions" :key="item" :value="item" :label="item"></el-option>
              </el-select>
            </div>
          </div>

          <!-- 第四行：2个下拉选择 -->
          <div class="row">
            <div class="form-group col-xl-6">
              <label>Judgment Label Remark</label>
              <el-select clearable v-model="extraInputs.input9" placeholder="" style="width: 100%">
                <el-option v-for="item in judgmentLabelOptions" :key="item" :value="item" :label="item"></el-option>
              </el-select>
            </div>
            <div class="form-group col-xl-6">
              <label>Language Lable Remark</label>
              <el-select clearable v-model="extraInputs.input10" placeholder="" style="width: 100%">
                <el-option v-for="item in languageLabelOptions" :key="item" :value="item" :label="item"></el-option>
              </el-select>
            </div>
          </div>
        </div>

        <div class="extra-inputs-container">
          <div class="row">
            <div class="form-group col-xl-6">
              <el-button @click="handleSaveDraft" type="success">Save a Draft</el-button>
              <el-button @click="handleBuildAnalysis" type="primary">Build Analysis</el-button>
              <el-button @click="handleRefresh" type="primary">Refresh</el-button>
            </div>
            <div class="form-group col-xl-6">
              <el-input v-model="searchReportNo" placeholder="Search Report No." />
            </div>
          </div>
        </div>



      </div>
    </transition>
  </section>
</template>

<script setup>
  import { ref, reactive, watch, computed, inject, onMounted } from 'vue'
  import { ArrowDown, Plus, Delete } from '@element-plus/icons-vue'
  import { handleGridKeydown } from '@/utils/tableKeyboardNav.js'
  import { createStartsWithFilter } from '@/utils/selectFilter.js'

  const request = inject('request');

  const props = defineProps({
    sections: {
      type: Array,
      default: () => []
    },
    allCompositions: {
      type: Array,
      default: () => []
    }
  })

  const emit = defineEmits(['update:sections', 'confirm', 'save-draft', 'build-analysis'])

  // 成分下拉的检索口径：**按首字母（严格前缀）**，不再是 EP 默认的"含有"。
  // 详见 utils/selectFilter.js。
  const {
    filtered: filteredCompositions,
    onQuery: onCompositionQuery,
    onVisibleChange: onCompositionVisibleChange
  } = createStartsWithFilter(computed(() => props.allCompositions))

  // 按钮事件：打包子组件数据 emit 到父组件
  function buildPayload() {
    return {
      sections: JSON.parse(JSON.stringify(localSections.value)),
      extraInputs: JSON.parse(JSON.stringify(extraInputs))
    }
  }

  function handleSaveDraft()  { emit('save-draft',      buildPayload()) }
  function handleBuildAnalysis(){ emit('build-analysis', buildPayload()) }

  function handleRefresh() {
    Object.keys(extraInputs).forEach(k => {
      // 多选字段必须回到 []，写成 '' 会把 v-model 的类型打坏（标签渲染不出来）
      if (Array.isArray(extraInputs[k])) extraInputs[k] = []
      else extraInputs[k] = ''
    })
    // 清空表格每行值，保留表格结构
    localSections.value.forEach(sec => {
      sec.rows.forEach(row => { row.location = ''; row.composition = '' })
    })
    searchReportNo.value = ''
  }

  const isNoticeOpen = ref(true)

  // 初始化 localSections（默认一组、预置一个空行 —— 不再有顶部输入行，得有行可填）
  // 单组分**不称量**（B13）：GSM 列已下线，行上只有 Sample(location) 与 Composition。
  const localSections = ref(props.sections.length > 0 ? JSON.parse(JSON.stringify(props.sections)) : [{
    id: Date.now(),
    title: 'Dissolved #1',
    rows: [
      { location: '', composition: '' }
    ]
  }])

  // 初始化独立的额外输入框数据
  const searchReportNo = ref('');

  // ⚠️ 键名是位置式的，input2~input5 已随模板删行下线，**空号保留不补位**
  const extraInputs = reactive({
    input1: '',
    input6: '', input7: '', input9: '', input10: '',
    input11: '', input12: '',
    input8: [],          // Label Remark 多选数组（键名是位置式的旧名，别当文本框）
    resultRemark: []     // Result Remark 多选数组
  })

  // 监听外部变化
  watch(() => props.sections, (val) => {
    if (val && val.length > 0) {
      localSections.value = JSON.parse(JSON.stringify(val))
    }
  }, { deep: true })

  // 监听内部变化
  watch(localSections, (val) => {
    emit('update:sections', val)
    emit('confirm', val)
  }, { deep: true })

  // 单选框选项
  const judgmentLabelOptions = ref([]);
  const languageLabelOptions = ref([]);
  const resultRemarkOptions = ref([]);
  const labelRemarkOptions = ref([]);

  async function fetchLabelOptions() {
    try {
      const res = await request.get('/FiberAnalysis/label-options');
      if (res.data?.success) {
        judgmentLabelOptions.value = res.data.data.judgmentLabelOptions || [];
        languageLabelOptions.value = res.data.data.languageLabelOptions || [];
        resultRemarkOptions.value = res.data.data.resultRemarkOptions || [];
        labelRemarkOptions.value = res.data.data.labelRemarkOptions || [];
      }
    } catch (e) {
      console.error('获取标签选项失败:', e);
    }
  }

  onMounted(() => {
    fetchLabelOptions();
  });

  function toggleNotice() {
    isNoticeOpen.value = !isNoticeOpen.value;
  }

  /* 删除 Section */
  function removeSection(index) {
    if (confirm('Are you sure you want to delete this section?')) {
      localSections.value.splice(index, 1)
      localSections.value.forEach((sec, idx) => {
        sec.title = `Dissolved #${idx + 1}`
      })
    }
  }

  /* 在数据表末尾追加一个空行 —— Location/成分 直接在行内填，不再经过顶部的输入行 */
  function appendRow(sectionIndex) {
    localSections.value[sectionIndex].rows.push({ location: '', composition: '' })
  }

  //删除行
  function removeRow(sectionIndex, rowIndex) {
    localSections.value[sectionIndex].rows.splice(rowIndex, 1);
  }
</script>

<style scoped lang="scss">
  .fiber-section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .simple-header {
    padding: 12px 20px;
    background-color: #fff;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    flex: 1;
  }

  .collapsible-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-decoration: none;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
    width: 100%;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #409eff;
    }
  }
    .title-text {
    color: #3364d5;
    font-size: 25px;
    font-weight: bold;
  }

  .add-btn {
    font-size: 18px;
    font-weight: normal;
    margin-left: 10px;
    vertical-align: middle;
  }

  .arrow-icon {
    transition: transform 0.3s;
    font-size: 14px;
    color: #909399;

    &.is-reverse {
      transform: rotate(180deg);
    }
  }

  .fiber-body {
    padding: 15px 20px;
    background-color: #fafafa;
    flex: 1;
    overflow-y: auto;
  }

  .mainContainer {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Section 内部样式 */
  .oneSampleComposition {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 6px 10px;
    background-color: #fff;
    position: relative;
  }

  // 追加行按钮：紧贴数据表下方（卡片是 gap:0 的纵向 flex，表自身 margin 也是 0）
  .add-row-btn {
    width: 100%;
    margin-top: 0;
  }

  /* Section 标题行样式 */
  .section-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .section-title {
    font-size: 16px;
    font-weight: 300;
    color: #3364d5;
  }

  .remove-section-btn {
    padding: 0;
    font-size: 16px;
  }

  /* 新增：输入行容器样式 */
  .input-row-container {
    margin-bottom: 10px;

    .input-group {
      display: flex;
      align-items: center;
      gap: 15px;
      background-color: #f9f9f9;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #ebeef5;
    }

    .input-item {
      display: flex;
      align-items: center;
      gap: 8px;

      label {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
        white-space: nowrap;
      }
    }
  }

  /* 自定义表格样式 */
  .custom-table {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
    margin: 0;

    .custom-table-layout {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      /* 全局 style.css 给所有 table 塞了 margin-bottom:30px；卡片是 gap:0 的纵向 flex，
         这条会被 .custom-table 的 overflow:hidden 包进边框里，在表与下方 Add 之间撑出一条空白 */
      margin-bottom: 0;

      th, td {
        border: 1px solid #ebeef5;
        padding: 8px 10px;
        text-align: left;
        vertical-align: middle;
      }

      /* 表头第一行样式 */
      .header-row-1 {
        background-color: #f5f7fa;
        color: #606266;
        font-weight: bold;
        text-align: center;
        height: 40px;

        /* GSM 列下线后只剩 Sample / Composition / Operation 三列 */
        &:first-child,
        &:nth-child(2),
        &:nth-child(3) {
          width: 33.33%;
        }
      }

      /* 表头第二行样式 */
      .header-row-2 {
        background-color: #fff;
        color: #303133;
        font-weight: normal;
        height: 50px;

        .header-input {
          width: 90%;
        }
      }

      /* 数据行样式 */
      .cell-location {
        width: 33.33%;
      }

      .cell-composition {
        width: 33.33%;
      }

      .cell-action {
        width: 33.33%;
        text-align: center;
      }
    }
  }

  .result-row {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #ebeef5;
    display: flex;
    align-items: center;

    label {
      min-width: 150px;
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }
  }

  .radio-group-vertical {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 200px;
    overflow-y: auto;
  }

  .text-danger {
    color: #f56c6c;
  }

  .removeTableGaps :deep(table) {
    margin-bottom: 0 !important;
  }

  :deep(.el-select__popper) ul li {
    margin: 0 !important;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease, height 0.3s ease;
  }

  .fade-enter-from, .fade-leave-to {
    opacity: 0;
    height: 0;
    overflow: hidden;
  }


  /* 新增：额外输入框容器样式 */
  .extra-inputs-container {
    margin-top: 10px; /* 与上方内容保持间隔 */
    background-color: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 15px;
    // 引用 Bootstrap 风格的网格系统类
    .row {
      display: flex;
      flex-wrap: wrap;
      margin-right: -10px;
      margin-left: -10px;
      margin-bottom: 5px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .form-group {
      position: relative;
      padding-right: 10px;
      padding-left: 10px;
      width: 100%;
      margin-bottom: 0; /* 确保没有额外的底部边距 */
      // 模拟 Bootstrap 的 col-xl-* 类
      &.col-xl-12 {
        flex: 0 0 100%;
        max-width: 100%;
      }

      &.col-xl-6 {
        flex: 0 0 50%;
        max-width: 50%;
      }

      &.col-xl-4 {
        flex: 0 0 33.333333%;
        max-width: 33.333333%;
      }

      label {
        display: block;
        margin-bottom: 5px;
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }

      .el-input {
        width: 100%;
      }
    }
  }




</style>








