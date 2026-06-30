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

            <!-- 输入行（表格格式对齐下方数据列） -->
            <div class="table-wrapper custom-table">
              <table class="custom-table-layout">
                <thead>
                  <tr>
                    <th class="header-row-2">Location<span class="text-danger">*</span></th>
                    <th class="header-row-2">Composition<span class="text-danger">*</span></th>
                    <th class="header-row-2">Gradient GSM</th>
                    <th class="header-row-2" style="text-align:center">Add</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="cell-location">
                      <el-input type="text" placeholder="Location" v-model="section.inputRow.location" />
                    </td>
                    <td class="cell-composition">
                      <el-select clearable v-model="section.inputRow.composition" placeholder="成分" filterable style="width: 100%">
                        <el-option v-for="item in allCompositions" :key="item" :value="item">{{ item }}</el-option>
                      </el-select>
                    </td>
                    <td class="cell-input">
                      <el-input type="text" inputmode="decimal" placeholder="Trial #1" v-model="section.inputRow.gradientGsm" />
                    </td>
                    <td class="cell-action">
                      <el-button @click="addRow(sIndex)" type="primary">Add</el-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 表格区域 -->
            <div class="table-wrapper custom-table">
              <table class="custom-table-layout">
                <!-- 表头第一行 -->
                <thead>
                  <tr>
                    <th class="header-row-1"></th>
                    <th class="header-row-1"></th>
                    <th class="header-row-1">Trial #1</th>
                    <th class="header-row-1">Operation</th>
                  </tr>
                  <!-- 表头第二行 -->
                  <tr>
                    <th class="header-row-2">Location<span class="text-danger">*</span></th>
                    <th class="header-row-2">Composition<span class="text-danger">*</span></th>
                    <th class="header-row-2" style="text-align:center">
                      Gradient GSM
                    </th>
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
                      <el-select clearable v-model="row.composition" placeholder="成分" filterable style="width: 100%">
                        <el-option v-for="item in allCompositions" :key="item" :value="item">{{ item }}</el-option>
                      </el-select>
                    </td>
                    <td class="cell-input">
                      <el-input type="text" inputmode="decimal" placeholder="Trial #1" v-model="row.trial1" />
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

            <!-- 结果 -->
            <div class="line-flex-container result-row">
              <label>Composition > 50%</label>
              <el-input type="text" :value="getMaxComposition(section.rows)" disabled style="flex:1" />
            </div>
          </div>
        </div>

        <!-- 新增：独立的12个输入框区域，位于 mainContainer 下方 -->
        <div class="extra-inputs-container">
          <!-- 第一行：2个输入框 -->
          <div class="row">
            <div class="form-group col-xl-6">
              <label>Vertify Result</label>
              <el-select clearable v-model="extraInputs.input1" placeholder="" style="width: 100%">
                <el-option label="Pass" value="Pass"></el-option>
                <el-option label="Fail" value="Fail"></el-option>
                <el-option label="Pending" value="Pending"></el-option>
              </el-select>
            </div>
            <div class="form-group col-xl-6">
              <label>Final Result</label>
              <el-select clearable v-model="extraInputs.input2" placeholder="" style="width: 100%">
                <el-option label="Approved" value="Approved"></el-option>
                <el-option label="Rejected" value="Rejected"></el-option>
                <el-option label="Review" value="Review"></el-option>
              </el-select>
            </div>
          </div>

          <!-- 第二行：3个下拉选择 -->
          <div class="row">
            <div class="form-group col-xl-4">
              <label>Durability Label</label>
              <el-select clearable v-model="extraInputs.input3" placeholder="" style="width: 100%">
                <el-option value="符合" label="符合"></el-option>
                <el-option value="严重不符" label="严重不符"></el-option>
                <el-option value="完全不符" label="完全不符"></el-option>
                <el-option value="无耐久标" label="无耐久标"></el-option>
              </el-select>
            </div>
            <div class="form-group col-xl-4">
              <label>Other Label</label>
              <el-select clearable v-model="extraInputs.input4" placeholder="" style="width: 100%">
                <el-option value="符合" label="符合"></el-option>
                <el-option value="严重不符" label="严重不符"></el-option>
                <el-option value="完全不符" label="完全不符"></el-option>
              </el-select>
            </div>
            <div class="form-group col-xl-4">
              <label>Comprehensive</label>
              <el-select clearable v-model="extraInputs.input5" placeholder="" style="width: 100%">
                <el-option value="符合" label="符合"></el-option>
                <el-option value="严重不符" label="严重不符"></el-option>
                <el-option value="完全不符" label="完全不符"></el-option>
                <el-option value="其他" label="其他"></el-option>
              </el-select>
            </div>
          </div>

          <!-- 第三行：1个输入框 -->
          <div class="row">
            <div class="form-group col-xl-12">
              <label>Recommended Label</label>
              <el-select v-model="extraInputs.input6" placeholder="" style="width: 100%">
                <el-option value="Yes" label="Yes"></el-option>
                <el-option value="" label=""></el-option>
              </el-select>
            </div>
          </div>

          <!-- 第四行：2个下拉选择 -->
          <div class="row">
            <div class="form-group col-xl-6">
              <label>Result Remark</label>
              <el-select clearable v-model="extraInputs.resultRemark" placeholder="" style="width: 100%">
                <el-option v-for="item in resultRemarkOptions" :key="item" :value="item" :label="item"></el-option>
              </el-select>
            </div>
            <div class="form-group col-xl-6">
              <label>Label Remark</label>
              <el-select clearable v-model="extraInputs.input8" placeholder="" style="width: 100%">
                <el-option v-for="item in labelRemarkOptions" :key="item" :value="item" :label="item"></el-option>
              </el-select>
            </div>
          </div>

          <!-- 第五行：2个下拉选择 -->
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
  import { ref, reactive, watch, inject, onMounted } from 'vue'
  import { ArrowDown, Plus, Delete } from '@element-plus/icons-vue'

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
    Object.keys(extraInputs).forEach(k => extraInputs[k] = '')
    // 清空表格每行值，保留表格结构
    localSections.value.forEach(sec => {
      sec.inputRow = { location: '', composition: '', gradientGsm: null }
      sec.rows.forEach(row => { row.location = ''; row.composition = ''; row.trial1 = null })
    })
    searchReportNo.value = ''
  }

  const isNoticeOpen = ref(true)

  // 初始化 localSections
  const localSections = ref(props.sections.length > 0 ? JSON.parse(JSON.stringify(props.sections)) : [{
    id: Date.now(),
    title: 'Dissolved #1',
    rows: [],
    inputRow: { location: '', composition: '', gradientGsm: null },
    headerInputs: { trial1: null }
  }])

  // 初始化独立的额外输入框数据
  const searchReportNo = ref('');

  const extraInputs = reactive({
    input1: '', input2: '', input3: '', input4: '', input5: '',
    input6: '', input7: '', input8: '', input9: '', input10: '',
    resultRemark: '',
    input11: '', input12: ''
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

  /* 判断类别 */
  const synthList = ['Acetate', 'Polyester', 'Polyamide', 'Polyurethane', 'Polyethylene', 'Elastane', 'Spandex', 'Viscose', 'Acrylic', 'Modal', 'Tencel', 'Meraklon', 'Lycra', 'Lyocell', 'Modacrylic' ,'Nylon', 'Rayon', 'Vinylon']
  const naturalList = ['Cotton', 'Wool', 'Silk', 'Ramie', 'Mohair', 'Tussah', 'Linen', 'Asbestos']
  const isSynth = str => synthList.includes(str)
  const isNatural = str => naturalList.includes(str)

  /* 删除 Section */
  function removeSection(index) {
    if (confirm('Are you sure you want to delete this section?')) {
      localSections.value.splice(index, 1)
      localSections.value.forEach((sec, idx) => {
        sec.title = `Dissolved #${idx + 1}`
      })
    }
  }

  /* 添加行 */
  function addRow(sectionIndex) {
    const currentSection = localSections.value[sectionIndex]
    const inputRow = currentSection.inputRow
    const location = inputRow.location.trim()
    const composition = inputRow.composition.trim()
    const gsm = inputRow.gradientGsm

    if (!location) return alert('Please enter a Location')
    if (!composition) return alert('Please select a composition')

    const existingRow = currentSection.rows.find(r => r.composition === composition)

    if (existingRow) {
      existingRow.location = location
      existingRow.trial1 = gsm
    } else {
      currentSection.rows.push({
        location: location,
        composition: composition,
        trial1: gsm
      })
    }

    inputRow.location = ''
    inputRow.composition = ''
    inputRow.gradientGsm = null
  }

  //计算MaxComposition
  function getMaxComposition(rows){
    if (!rows || rows.length === 0) return ''

    let synthTotal = 0
    let natTotal = 0
    let totalRate = 0

    rows.forEach(r => {
      const rate1 = parseFloat(r.trial1) || 0
      // 只使用 Trial #1 的值
      totalRate += rate1

      if (isSynth(r.composition)) {
        synthTotal += rate1
      } else if (isNatural(r.composition)) {
        natTotal += rate1
      }
    })

    if (totalRate === 0) return ''

    const synthPercent = (synthTotal / totalRate) * 100
    const natPercent = (natTotal / totalRate) * 100

    return synthPercent > 50 ? 'Synth' : natPercent > 50 ? 'Natural' : ''
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
        
        &:first-child,
        &:nth-child(2) {
          width: 25%; /* Location 和 Composition 列宽 */
        }
        &:nth-child(3),
        &:nth-child(4) {
          width: 25%; /* Trial #1 和 Operation 列宽 */
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
        width: 25%;
      }
      
      .cell-composition {
        width: 25%;
      }
      
      .cell-input {
        width: 25%;
        
        :deep(.el-input__wrapper) {
          width: 90%;
        }
      }
      
      .cell-action {
        width: 25%;
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








