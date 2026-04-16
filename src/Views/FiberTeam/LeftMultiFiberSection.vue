<template>
  <section class="panel-section fiber-section">
    <!-- 标题区 -->
    <div class="panel-header simple-header">
      <div class="header-left">
        <a href="#" @click.prevent="toggleNotice()" class="collapsible-title">
          <div class="title-group">
            <span class="title-text">{{ $t('Multi-dissolved components') }}</span>
            <el-button type="primary" link @click.stop="addSection" class="add-btn">
              Add New Component
            </el-button>
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
          <!-- Sample 输入框 -->
          <div class="sample-input-area">
            <label>Sample</label>
            <el-input v-model="sampleInput" placeholder="" style="flex: 1" />
          </div>

          <!-- 拆分表格区域 -->
          <div class="oneSampleComposition">
            <!-- 标题行 -->
            <div class="section-header-row">
              <span class="section-title">Split</span>
            </div>

            <!-- 输入行 -->
            <div class="input-row-container">
              <div class="input-group">
                <div class="input-item">
                  <label>{{ $t('composition') }}<span class="text-danger">*</span></label>
                  <el-select v-model="splitSection.inputRow.composition" placeholder="" filterable style="width: 200px">
                    <el-option v-for="item in allCompositions" :key="item" :value="item">{{ item }}</el-option>
                  </el-select>
                </div>
                <div class="input-item">
                  <label>Gradient GSM<span class="text-danger">*</span></label>
                  <el-input type="number" placeholder="" v-model.number="splitSection.inputRow.gradientGsm" style="width: 150px;" />
                </div>
                <div class="input-item">
                  <el-button @click="addSplitRow" type="primary">Add</el-button>
                </div>
              </div>
            </div>

            <!-- 表格 -->
            <div class="table-wrapper custom-table">
              <table class="custom-table-layout">
                <thead>
                  <tr>
                    <th class="header-row-1"></th>
                    <th class="header-row-1">Trial #1</th>
                    <th class="header-row-1">Trial #2</th>
                    <th class="header-row-1">Operation</th>
                  </tr>
                  <tr>
                    <th class="header-row-2">Composition</th>
                    <th class="header-row-2"></th>
                    <th class="header-row-2"></th>
                    <th class="header-row-2" style="text-align:center">Delete Row</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rIndex) in splitSection.rows" :key="rIndex">
                    <td class="cell-composition">
                      <el-select v-model="row.composition" placeholder="成分" filterable style="width: 100%">
                        <el-option v-for="item in allCompositions" :key="item" :value="item">{{ item }}</el-option>
                      </el-select>
                    </td>
                    <td class="cell-input">
                      <el-input type="number" placeholder="Trial #1" v-model.number="row.trial1" />
                    </td>
                    <td class="cell-input">
                      <el-input type="number" placeholder="Trial #2" v-model.number="row.trial2" />
                    </td>
                    <td class="cell-action">
                      <el-button type="danger" link @click="removeSplitRow(rIndex)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 循环渲染多个 Section -->
          <div v-for="(section, sIndex) in localSections" :key="section.id" class="oneSampleComposition">
            <!-- Section 标题行 -->
            <div class="section-header-row">
              <span class="section-title">{{ section.title }}</span>
              <el-button v-if="localSections.length > 1" type="danger" link @click="removeSection(sIndex)" class="remove-section-btn">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>

            <!-- 输入行 (Composition + Gradient GSM + Add Button) -->
            <div class="input-row-container">
              <div class="input-group">
                <div class="input-item">
                  <label>{{ $t('composition') }}<span class="text-danger">*</span></label>
                  <el-select v-model="section.inputRow.composition" placeholder="" filterable style="width: 200px">
                    <el-option v-for="item in allCompositions" :key="item" :value="item">{{ item }}</el-option>
                  </el-select>
                </div>
                <div class="input-item">
                  <label>Gradient GSM<span class="text-danger">*</span></label>
                  <el-input type="number" placeholder="" v-model.number="section.inputRow.gradientGsm" style="width: 150px;" />
                </div>
                <div class="input-item">
                  <el-button @click="addRow(sIndex)" type="primary">Add</el-button>
                </div>
              </div>
            </div>

            <!-- 表格区域 -->
            <div class="table-wrapper custom-table">
              <table class="custom-table-layout">
                <!-- 表头第一行 -->
                <thead>
                  <tr>
                    <th class="header-row-1"></th>
                    <th class="header-row-1">Trial #1</th>
                    <th class="header-row-1">Trial #2</th>
                    <th class="header-row-1">Operation</th>
                  </tr>
                  <!-- 表头第二行 -->
                  <tr>
                    <th class="header-row-2">Composition</th>
                    <th class="header-row-2">
                      <el-input type="number" placeholder="data#1 before proccessing" v-model.number="section.headerInputs.trial1" class="header-input" />
                    </th>
                    <th class="header-row-2">
                      <el-input type="number" placeholder="data#2 before proccessing" v-model.number="section.headerInputs.trial2" class="header-input" />
                    </th>
                    <th class="header-row-2" style="text-align:center">
                      <!-- 这里留空或者放置其他操作，如果需要的话 -->
                      Delete Row
                    </th>
                  </tr>
                </thead>
                <!-- 表格内容 -->
                <tbody>
                  <tr v-for="(row, rIndex) in section.rows" :key="rIndex">
                    <td class="cell-composition">
                      <el-select v-model="row.composition" placeholder="成分" filterable style="width: 100%">
                        <el-option v-for="item in allCompositions" :key="item" :value="item">{{ item }}</el-option>
                      </el-select>
                    </td>
                    <td class="cell-input">
                      <el-input type="number" placeholder="Trial #1" v-model.number="row.trial1" />
                    </td>
                    <td class="cell-input">
                      <el-input type="number" placeholder="Trial #2" v-model.number="row.trial2" />
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
          </div>
        </div>

        <!-- 新增：独立的12个输入框区域，位于 mainContainer 下方 -->
        <div class="extra-inputs-container">
          <!-- 第一行：2个输入框 -->
          <div class="row">
            <div class="form-group col-xl-6">
              <label class="mb-2 d-block">Vertify Result</label>
              <el-select v-model="extraInputs.input1" placeholder="" style="width: 100%">
                <el-option label="Pass" value="Pass"></el-option>
                <el-option label="Fail" value="Fail"></el-option>
                <el-option label="Pending" value="Pending"></el-option>
              </el-select>
            </div>
            <div class="form-group col-xl-6">
              <label class="mb-2 d-block">Final Result</label>
              <el-select v-model="extraInputs.input2" placeholder="" style="width: 100%">
                <el-option label="Approved" value="Approved"></el-option>
                <el-option label="Rejected" value="Rejected"></el-option>
                <el-option label="Review" value="Review"></el-option>
              </el-select>
            </div>
          </div>

          <!-- 第二行：3个输入框 -->
          <div class="row">
            <div class="form-group col-xl-4">
              <label class="mb-2 d-block">Durability Label</label>
              <el-input v-model="extraInputs.input3" placeholder="" />
            </div>
            <div class="form-group col-xl-4">
              <label class="mb-2 d-block">Other Label</label>
              <el-input v-model="extraInputs.input4" placeholder="" />
            </div>
            <div class="form-group col-xl-4">
              <label class="mb-2 d-block">Comprehensive</label>
              <el-input v-model="extraInputs.input5" placeholder="" />
            </div>
          </div>

          <!-- 第三行：2个输入框 -->
          <div class="row">
            <div class="form-group col-xl-6">
              <label class="mb-2 d-block">Recommended Label</label>
              <el-input v-model="extraInputs.input6" placeholder="" />
            </div>
            <div class="form-group col-xl-6">
              <label class="mb-2 d-block">Bottle Number</label>
              <el-select v-model="extraInputs.bottleNumber" multiple placeholder="" style="width: 100%">
                <el-option label="1" value="1"></el-option>
                <el-option label="2" value="2"></el-option>
                <el-option label="3" value="3"></el-option>
                <el-option label="4" value="4"></el-option>
                <el-option label="5" value="5"></el-option>
              </el-select>
            </div>
          </div>

          <!-- 第四行：2个输入框 -->
          <div class="row">
            <div class="form-group col-xl-6">
              <label class="mb-2 d-block">Result Remark</label>
              <el-popover placement="bottom" :width="200" trigger="click">
                <template #reference>
                  <el-input :model-value="resultRemarkDisplay" placeholder="点击选择" readonly style="width: 100%; cursor: pointer;" />
                </template>
                <el-checkbox-group v-model="extraInputs.resultRemarks">
                  <el-checkbox v-for="item in resultRemarkOptions" :key="item" :value="item" style="display: block; margin: 8px 0;">
                    {{ item }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-popover>
            </div>
            <div class="form-group col-xl-6">
              <label class="mb-2 d-block">Label Remark</label>
              <el-input v-model="extraInputs.input8" placeholder="" />
            </div>
          </div>

          <!-- 第五行：2个输入框 -->
          <div class="row">
            <div class="form-group col-xl-6">
              <label class="mb-2 d-block">Judgment Label Remark</label>
              <el-input v-model="extraInputs.input9" placeholder="" />
            </div>
            <div class="form-group col-xl-6">
              <label class="mb-2 d-block">Language Lable Remark</label>
              <el-input v-model="extraInputs.input10" placeholder="" />
            </div>
          </div>
        </div>

        <div class="extra-inputs-container">
          <div class="row">
            <div class="form-group col-xl-6">
              <el-button @click="" type="success">Save a Draft</el-button>
              <el-button @click="" type="primary">Build Analysis</el-button>
              <el-button @click="" type="primary">Refresh</el-button>
            </div>
            <div class="form-group col-xl-6">
              <el-input v-model="extraInputs.input10" placeholder="Search Report No." />
            </div>
            </div>
          </div>
        </div>
    </transition>
  </section>
</template>

<script setup>
  import { ref, reactive, watch, computed } from 'vue'
  import { ArrowDown, Plus, Delete } from '@element-plus/icons-vue'

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

  const emit = defineEmits(['update:sections', 'confirm'])

  const isNoticeOpen = ref(true)

  // Result Remark 选项和显示
  const resultRemarkOptions = ['123', '456', '789']
  const resultRemarkDisplay = computed(() => {
    return extraInputs.resultRemarks
      .map((val, index) => `*${index + 1}:${val}`)
      .join(', ')
  })

  // Sample 输入框
  const sampleInput = ref('')

  // 初始化 localSections（默认2个，第一个3条数据，第二个6条数据）
  const localSections = ref(props.sections.length > 0 ? JSON.parse(JSON.stringify(props.sections)) : [
    {
      id: Date.now(),
      title: 'Dissolved #1',
      rows: [
        { composition: '', trial1: null, trial2: null },
        { composition: '', trial1: null, trial2: null },
        { composition: '', trial1: null, trial2: null }
      ],
      inputRow: { composition: '', gradientGsm: null },
      headerInputs: { trial1: null, trial2: null }
    },
    {
      id: Date.now() + 1,
      title: 'Dissolved #2',
      rows: [
        { composition: '', trial1: null, trial2: null },
        { composition: '', trial1: null, trial2: null },
        { composition: '', trial1: null, trial2: null },
        { composition: '', trial1: null, trial2: null },
        { composition: '', trial1: null, trial2: null },
        { composition: '', trial1: null, trial2: null }
      ],
      inputRow: { composition: '', gradientGsm: null },
      headerInputs: { trial1: null, trial2: null }
    }
  ])

  // 拆分表格（单个，默认2行）
  const splitSection = reactive({
    rows: [
      { composition: '', trial1: null, trial2: null },
      { composition: '', trial1: null, trial2: null }
    ],
    inputRow: { composition: '', gradientGsm: null },
    headerInputs: { trial1: null, trial2: null }
  })

  // 初始化独立的额外输入框数据
  const extraInputs = reactive({
    input1: '', input2: '', input3: '', input4: '', input5: '',
    input6: '', input8: '', input9: '', input10: '',
    input11: '', input12: '',
    resultRemarks: [],  // Result Remark 多选数组
    bottleNumber: []    // Bottle Number 多选数组
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

  function toggleNotice() {
    isNoticeOpen.value = !isNoticeOpen.value;
  }

  /* 判断类别 */
  const synthList = ['Acetate', 'Polyester', 'Polyamide', 'Polyurethane', 'Polyethylene', 'Elastane', 'Spandex', 'Viscose', 'Acrylic', 'Modal', 'Tencel', 'Meraklon', 'Lycra', 'Lyocell', 'Modacrylic' ,'Nylon', 'Rayon', 'Vinylon']
  const naturalList = ['Cotton', 'Wool', 'Silk', 'Ramie', 'Mohair', 'Tussah', 'Linen', 'Asbestos']
  const isSynth = str => synthList.includes(str)
  const isNatural = str => naturalList.includes(str)

  /* 添加 Section */
  function addSection() {
    const nextNum = localSections.value.length + 1
    localSections.value.push({
      id: Date.now(),
      title: `Dissolved #${nextNum}`,
      rows: [],
      inputRow: { composition: '', gradientGsm: null },
      headerInputs: { trial1: null, trial2: null }
    })
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

  /* 添加行 */
  function addRow(sectionIndex) {
    const currentSection = localSections.value[sectionIndex]
    const inputRow = currentSection.inputRow
    const composition = inputRow.composition.trim()
    const gradientGsm = inputRow.gradientGsm

    // 校验：必须选择成分
    if (!composition) return alert('Please select a composition')

    // 校验：必须输入 Gradient GSM 值
    if (gradientGsm === null || gradientGsm === '') {
      return alert('Please enter a Gradient GSM value')
    }

    // 查找是否已存在该成分
    const existingRow = currentSection.rows.find(r => r.composition === composition)

    if (existingRow) {
      // 已存在该成分，检查 trial 值
      if (existingRow.trial1 === null || existingRow.trial1 === '') {
        // Trial #1 为空，填入
        existingRow.trial1 = gradientGsm
      } else if (existingRow.trial2 === null || existingRow.trial2 === '') {
        // Trial #2 为空，填入
        existingRow.trial2 = gradientGsm
      } else {
        // 两个 trial 都有值，提示错误
        return alert('This component already has two trial values. Please select a different composition.')
      }
    } else {
      // 新成分，创建新行，填入 Trial #1
      currentSection.rows.push({ 
        composition: composition, 
        trial1: gradientGsm, 
        trial2: null 
      })
    }

    // 重置输入行
    inputRow.composition = ''
    inputRow.gradientGsm = null
  }

  //删除行
  function removeRow(sectionIndex, rowIndex) {
    localSections.value[sectionIndex].rows.splice(rowIndex, 1);
  }

  /* ========== 拆分表格方法 ========== */

  /* 添加拆分行 */
  function addSplitRow() {
    const inputRow = splitSection.inputRow
    const composition = inputRow.composition.trim()
    const gradientGsm = inputRow.gradientGsm

    // 校验：必须选择成分
    if (!composition) return alert('Please select a composition')

    // 校验：必须输入 Gradient GSM 值
    if (gradientGsm === null || gradientGsm === '') {
      return alert('Please enter a Gradient GSM value')
    }

    // 查找是否已存在该成分
    const existingRow = splitSection.rows.find(r => r.composition === composition)

    if (existingRow) {
      // 已存在该成分，检查 trial 值
      if (existingRow.trial1 === null || existingRow.trial1 === '') {
        existingRow.trial1 = gradientGsm
      } else if (existingRow.trial2 === null || existingRow.trial2 === '') {
        existingRow.trial2 = gradientGsm
      } else {
        return alert('This component already has two trial values. Please select a different composition.')
      }
    } else {
      // 新成分，创建新行
      splitSection.rows.push({
        composition: composition,
        trial1: gradientGsm,
        trial2: null
      })
    }

    // 重置输入行
    inputRow.composition = ''
    inputRow.gradientGsm = null
  }

  /* 删除拆分行 */
  function removeSplitRow(rowIndex) {
    splitSection.rows.splice(rowIndex, 1)
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
    gap: 12px;
  }

  /* Sample 输入框样式 */
  .sample-input-area {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px;
    background-color: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    label {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
      white-space: nowrap;
      min-width: 60px;
    }
  }

  /* Section 内部样式 */
  .oneSampleComposition {
    display: flex;
    flex-direction: column;
    gap: 6px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 10px;
    background-color: #fff;
    position: relative;
  }

  /* Section 标题行样式 */
  .section-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
    padding-bottom: 6px;
    border-bottom: 1px dashed #ebeef5;
  }

  .section-title {
    font-size: 14px;
    font-weight: 300;
    color: #3364d5;
  }

  .remove-section-btn {
    padding: 0;
    font-size: 16px;
  }

  /* 新增：输入行容器样式 */
  .input-row-container {
    margin-bottom: 0;

    .input-group {
      display: flex;
      align-items: center;
      gap: 15px;
      background-color: #f9f9f9;
      padding: 6px 10px;
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
    margin: 4px 0;

    .custom-table-layout {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th, td {
        border: 1px solid #ebeef5;
        padding: 4px 6px;
        text-align: left;
        vertical-align: middle;
      }

      /* 表头第一行样式 */
      .header-row-1 {
        background-color: #f5f7fa;
        color: #606266;
        font-weight: bold;
        text-align: center;
        height: 28px;

        &:first-child {
          width: 30%;
        }
        &:not(:first-child) {
          width: 23.33%;
        }
      }

      /* 表头第二行样式 */
      .header-row-2 {
        background-color: #fff;
        color: #303133;
        font-weight: normal;
        height: 32px;

        .header-input {
          width: 90%;
        }
      }

      /* 数据行样式 */
      .cell-composition {
        width: 30%;
      }

      .cell-input {
        width: 23.33%;

        :deep(.el-input__wrapper) {
          width: 90%;
        }
      }
      
      .cell-action {
        width: 23.33%;
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
    
/*    label {
      min-width: 150px;
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }*/
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










