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
            <label>Sample <span class="text-danger">*</span></label>
            <el-input v-model="sampleInput" placeholder="" style="flex: 1" />
          </div>

          <!-- 拆分表格区域 -->
          <div class="oneSampleComposition split-card">
            <!-- 标题行 -->
            <div class="section-header-row">
              <span class="section-title">Split</span>
            </div>

            <!-- 表格 -->
            <div class="table-wrapper custom-table">
              <!-- 方向键/Enter/Tab 的跨格导航走**捕获阶段**委托：el-select 会在内层 input 上
                   对 ↑↓/Enter 做 stopPropagation，冒泡阶段收不到（见 utils/tableKeyboardNav.js 注释） -->
              <table class="custom-table-layout" @keydown.capture="handleGridKeydown">
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
                  <template v-for="(row, rIndex) in splitSection.rows" :key="rIndex">
                  <tr>
                    <td class="cell-composition">
                      <el-select clearable v-model="row.composition" placeholder="成分" filterable style="width: 100%"
                        :filter-method="onCompositionQuery" @visible-change="onCompositionVisibleChange">
                        <el-option v-for="item in filteredCompositions" :key="item" :value="item">{{ item }}</el-option>
                      </el-select>
                    </td>
                    <td class="cell-input">
                      <el-input type="text" inputmode="decimal" placeholder="Trial #1" v-model="row.trial1" :disabled="isBicomponentRow(row)" />
                    </td>
                    <td class="cell-input">
                      <el-input type="text" inputmode="decimal" placeholder="Trial #2" v-model="row.trial2" :disabled="isBicomponentRow(row)" />
                    </td>
                    <td class="cell-action">
                      <el-button type="danger" link @click="removeSplitRow(rIndex)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </td>
                  </tr>
                  <!-- cellulosic fibre 子行 (Split) -->
                  <template v-if="row.composition === '*cellulosic fibre' || row.composition === '*Regenerated cellulose fibre'">
                    <tr v-for="(sub, si) in ensureCellulosicSubFibers(row)" :key="'split-cel-'+rIndex+'-'+si"
                        class="cellulosic-sub-row">
                      <td class="cell-sub-composition">
                        <el-select clearable v-model="sub.fiberName" placeholder="" size="small" style="width: 100%">
                          <el-option v-for="f in subOptionsFor(row.composition)" :key="f" :value="f" :label="f" />
                        </el-select>
                      </td>
                      <td class="cell-sub-input" colspan="2" style="text-align:center">
                        <el-input v-model="sub.percentage" placeholder="%" size="small" style="width: 100px" type="number" />
                      </td>
                      <td class="cell-sub-action"></td>
                    </tr>
                  </template>
                  <!-- Bicomponent/Biconstituent 子行 (Split) -->
                  <template v-if="row.composition === 'Bicomponent Fiber' || row.composition === 'Biconstituent Fiber'">
                    <tr v-for="(sub, si) in ensureBicomponentSubFibers(row)" :key="'split-bic-'+rIndex+'-'+si"
                        class="bicomponent-sub-row">
                      <td class="cell-sub-composition">
                        <el-select v-model="sub.fiberName" placeholder="" size="small" style="width: 100%">
                          <el-option v-for="f in bicomponentSubOptions" :key="f" :value="f" :label="f" />
                        </el-select>
                      </td>
                      <td class="cell-sub-input" style="text-align:center">
                        <el-input v-model="sub.gsmTrail1" placeholder="Trial#1" size="small" style="width: 80px" />
                      </td>
                      <td class="cell-sub-input" style="text-align:center">
                        <el-input v-model="sub.gsmTrail2" placeholder="Trial#2" size="small" style="width: 80px" />
                      </td>
                      <td class="cell-sub-action"></td>
                    </tr>
                  </template>
                  </template>
                </tbody>
              </table>
            </div>
            <!-- 追加的行的成分与 Trial 直接在行内填，故有此按钮 -->
            <el-button type="primary" plain class="add-row-btn" @click="appendSplitRow">
              <el-icon><Plus /></el-icon> Add
            </el-button>
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

            <!-- 表格区域 -->
            <div class="table-wrapper custom-table">
              <table class="custom-table-layout" @keydown.capture="handleGridKeydown">
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
                      <el-input type="text" inputmode="decimal" placeholder="data#1 before proccessing" v-model="section.headerInputs.trial1" class="header-input" />
                    </th>
                    <th class="header-row-2">
                      <el-input type="text" inputmode="decimal" placeholder="data#2 before proccessing" v-model="section.headerInputs.trial2" class="header-input" />
                    </th>
                    <th class="header-row-2" style="text-align:center">
                      <!-- 这里留空或者放置其他操作，如果需要的话 -->
                      Delete Row
                    </th>
                  </tr>
                </thead>
                <!-- 表格内容 -->
                <tbody>
                  <template v-for="(row, rIndex) in section.rows" :key="rIndex">
                  <tr>
                    <td class="cell-composition">
                      <el-select clearable v-model="row.composition" placeholder="成分" filterable style="width: 100%"
                        :filter-method="onCompositionQuery" @visible-change="onCompositionVisibleChange">
                        <el-option v-for="item in filteredCompositions" :key="item" :value="item">{{ item }}</el-option>
                      </el-select>
                    </td>
                    <td class="cell-input">
                      <el-input type="text" inputmode="decimal" placeholder="Trial #1" v-model="row.trial1" :disabled="isBicomponentRow(row)" />
                    </td>
                    <td class="cell-input">
                      <el-input type="text" inputmode="decimal" placeholder="Trial #2" v-model="row.trial2" :disabled="isBicomponentRow(row)" />
                    </td>
                    <td class="cell-action">
                      <el-button type="danger" link @click="removeRow(sIndex, rIndex)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </td>
                  </tr>
                  <!-- cellulosic fibre 子行 (Dissolved) -->
                  <template v-if="row.composition === '*cellulosic fibre' || row.composition === '*Regenerated cellulose fibre'">
                    <tr v-for="(sub, si) in ensureCellulosicSubFibers(row)" :key="'diss-cel-'+sIndex+'-'+rIndex+'-'+si"
                        class="cellulosic-sub-row">
                      <td class="cell-sub-composition">
                        <el-select clearable v-model="sub.fiberName" placeholder="" size="small" style="width: 100%">
                          <el-option v-for="f in subOptionsFor(row.composition)" :key="f" :value="f" :label="f" />
                        </el-select>
                      </td>
                      <td class="cell-sub-input" colspan="2" style="text-align:center">
                        <el-input v-model="sub.percentage" placeholder="%" size="small" style="width: 100px" type="number" />
                      </td>
                      <td class="cell-sub-action"></td>
                    </tr>
                  </template>
                  <!-- Bicomponent/Biconstituent 子行 (Dissolved) -->
                  <template v-if="row.composition === 'Bicomponent Fiber' || row.composition === 'Biconstituent Fiber'">
                    <tr v-for="(sub, si) in ensureBicomponentSubFibers(row)" :key="'diss-bic-'+sIndex+'-'+rIndex+'-'+si"
                        class="bicomponent-sub-row">
                      <td class="cell-sub-composition">
                        <el-select v-model="sub.fiberName" placeholder="" size="small" style="width: 100%">
                          <el-option v-for="f in bicomponentSubOptions" :key="f" :value="f" :label="f" />
                        </el-select>
                      </td>
                      <td class="cell-sub-input" style="text-align:center">
                        <el-input v-model="sub.gsmTrail1" placeholder="Trial#1" size="small" style="width: 80px" />
                      </td>
                      <td class="cell-sub-input" style="text-align:center">
                        <el-input v-model="sub.gsmTrail2" placeholder="Trial#2" size="small" style="width: 80px" />
                      </td>
                      <td class="cell-sub-action"></td>
                    </tr>
                  </template>
                  </template>
                </tbody>
              </table>
            </div>
            <!-- 追加的行的成分与 Trial 直接在行内填，故有此按钮 -->
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
              <label class="mb-2 d-block">Vertify Result</label>
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
              <label class="mb-2 d-block">Recommended Label</label>
              <el-select v-model="extraInputs.input6" placeholder="" style="width: 100%">
                <el-option value="Yes" label="Yes"></el-option>
                <el-option value="" label=""></el-option>
              </el-select>
            </div>
          </div>

          <!-- 第三行：2个下拉选择 -->
          <div class="row">
            <div class="form-group col-xl-6">
              <label class="mb-2 d-block">Result Remark</label>
              <!-- 多选：选项 55 条、单条最长 179 字符（中英双语成对），不折叠会把表单行撑高、与右列错位 -->
              <el-select multiple collapse-tags collapse-tags-tooltip clearable v-model="extraInputs.resultRemark" placeholder="" style="width: 100%">
                <el-option v-for="item in resultRemarkOptions" :key="item" :value="item" :label="item"></el-option>
              </el-select>
            </div>
            <div class="form-group col-xl-6">
              <label class="mb-2 d-block">Label Remark</label>
              <!-- 多选，同上 -->
              <el-select multiple collapse-tags collapse-tags-tooltip clearable v-model="extraInputs.input8" placeholder="" style="width: 100%">
                <el-option v-for="item in labelRemarkOptions" :key="item" :value="item" :label="item"></el-option>
              </el-select>
            </div>
          </div>

          <!-- 第四行：2个下拉选择 -->
          <div class="row">
            <div class="form-group col-xl-6">
              <label class="mb-2 d-block">Judgment Label Remark</label>
              <el-select clearable v-model="extraInputs.input9" placeholder="" style="width: 100%">
                <el-option v-for="item in judgmentLabelOptions" :key="item" :value="item" :label="item"></el-option>
              </el-select>
            </div>
            <div class="form-group col-xl-6">
              <label class="mb-2 d-block">Language Label Remark</label>
              <el-select clearable v-model="extraInputs.input10" placeholder="" style="width: 100%">
                <el-option v-for="item in languageLabelOptions" :key="item" :value="item" :label="item"></el-option>
              </el-select>
            </div>
          </div>

        </div>

        <div class="extra-inputs-container">
          <div class="row">
            <!-- 这一行是 flex：前三个是"对这一份报告的操作"，历史报告是"翻别的报告"，
                 靠 margin-left:auto 把它顶到最右侧，与左边三个分开。 -->
            <div class="form-group col-xl-12" style="display: flex; align-items: center;">
              <el-button @click="handleSaveDraft" type="success">Save a Draft</el-button>
              <el-button @click="handleBuildAnalysis" type="primary">Build Analysis</el-button>
              <el-button @click="handleRefresh" type="primary">Refresh</el-button>
              <el-button @click="historyVisible = true" type="warning" style="margin-left: auto; min-width: 110px;">历史报告</el-button>
            </div>
            </div>
          </div>
        </div>
    </transition>

    <!-- 历史报告列表：后端扫 SaveDocx 根目录 + 全部 FiberAnalysis{yyyyMM} 子目录，
         只认 *_FiberAnalysis.docx（挡别的模块的报告）。列表只有 报告号/时间/大小 ——
         文件名里没有样品名，纤维也没有对应的 docx 读取器，所以不做回填。 -->
    <el-dialog v-model="historyVisible" title="历史报告文件" width="820px">
      <el-form size="small" @submit.prevent>
        <el-form-item label-width="0">
          <el-input v-model="historyKeyword" clearable placeholder="按报告号筛选" size="default" style="width:280px"/>
        </el-form-item>
      </el-form>
      <el-table v-loading="historyLoading" class="removeTableGaps" :data="filteredHistory" border stripe size="small" style="width:100%;">
        <el-table-column prop="reportNumber" label="报告号" min-width="200" show-overflow-tooltip/>
        <el-table-column label="生成时间" width="180">
          <template #default="{ row }">{{ ts(row.generatedAt) }}</template>
        </el-table-column>
        <el-table-column label="大小" width="100">
          <template #default="{ row }">{{ (row.sizeBytes / 1024).toFixed(1) }} KB</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="downloadHistoryFile(row.fileName)">下载</el-button>
            <el-button size="small" type="danger" @click="deleteHistoryFile(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </section>
</template>

<script setup>
  import { ref, reactive, watch, computed, inject, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { ArrowDown, Plus, Delete } from '@element-plus/icons-vue'
  import { handleGridKeydown } from '@/utils/tableKeyboardNav.js'
  import { createStartsWithFilter } from '@/utils/selectFilter.js'

  const request = inject('request');

  // 子纤维候选改由父组件传入（原先两处内联且**全小写** 'hemp'/'cotton'/'linen'/'ramie'，
  // 与 fiber_database 的拼写不一致 —— 存进库的就是小写名，报告上照原样印出）。
  // 候选真正的内容在 Domain 的 FiberOptions，经 /FiberAnalysis/fiber-options 下发。

  // cellulosic fibre 子行默认 4 行空模板。
  // percentage 用空串而非 0：输入框上的 placeholder="%" 只在空值时显示，
  // 填 0 会让框里一直有个 0、那个 % 永远不露面（两者是同一个提交加进来的，从落地起就互相抵消）。
  // 提交侧两者等价 —— FiberWorkSheet 的 filter 是 `s.percentage > 0`，'' 与 0 都不成立。
  function newCellulosicDefaults() {
    return [
      { fiberName: '', percentage: '' },
      { fiberName: '', percentage: '' },
      { fiberName: '', percentage: '' },
      { fiberName: '', percentage: '' }
    ];
  }
  // 惰性初始化 row 上的 cellulosicSubFibers（写入 row 保证双向绑定）
  function ensureCellulosicSubFibers(row) {
    if (!row.cellulosicSubFibers) {
      row.cellulosicSubFibers = newCellulosicDefaults();
    }
    return row.cellulosicSubFibers;
  }

  function newBicomponentDefaults() {
    return [
      { fiberName: 'Polyamide',  gsmTrail1: 0, gsmTrail2: 0 },
      { fiberName: 'Polyester', gsmTrail1: 0, gsmTrail2: 0 }
    ];
  }

  function isBicomponentRow(row) {
    return row.composition === 'Bicomponent Fiber' || row.composition === 'Biconstituent Fiber';
  }

  function ensureBicomponentSubFibers(row) {
    if (!row.bicomponentSubFibers) {
      row.bicomponentSubFibers = newBicomponentDefaults();
    }
    return row.bicomponentSubFibers;
  }

  const props = defineProps({
    sections: {
      type: Array,
      default: () => []
    },
    allCompositions: {
      type: Array,
      default: () => []
    },
    // 子纤维候选（来自后端 /FiberAnalysis/fiber-options）
    cellulosicSubOptions: {
      type: Array,
      default: () => []
    },
    regeneratedSubOptions: {
      type: Array,
      default: () => []
    },
    bicomponentSubOptions: {
      type: Array,
      default: () => []
    }
  })

  // 成分下拉的检索口径：**按首字母（严格前缀）**，不再是 EP 默认的"含有"。
  // Split 与 Dissolved 两张表共用这一份 query —— 同一时刻只可能有一个下拉展开，
  // 收起时 onVisibleChange 会清空，所以不会串味。详见 utils/selectFilter.js。
  const {
    filtered: filteredCompositions,
    onQuery: onCompositionQuery,
    onVisibleChange: onCompositionVisibleChange
  } = createStartsWithFilter(computed(() => props.allCompositions))

  // 两个纤维素父槽的候选**不是同一份**：`*cellulosic fibre` 是天然（Cotton/Hemp/Linen/Ramie），
  // `*Regenerated cellulose fibre` 是再生（Cupro/Lyocell/Modal/Rayon/Viscose）。
  // 原先两处共用一份天然清单，于是"再生纤维素"下选不到粘胶、反倒能选到大麻。
  function subOptionsFor(composition) {
    return composition === '*Regenerated cellulose fibre'
      ? props.regeneratedSubOptions
      : props.cellulosicSubOptions
  }

  const emit = defineEmits(['update:sections', 'confirm', 'save-draft', 'build-analysis'])

  const isNoticeOpen = ref(true)

  // 按钮事件：打包子组件数据 emit 到父组件
  function buildPayload() {
    return {
      splitSection: JSON.parse(JSON.stringify(splitSection)),
      localSections: JSON.parse(JSON.stringify(localSections.value)),
      extraInputs: JSON.parse(JSON.stringify(extraInputs)),
      sampleInput: sampleInput.value
    }
  }

  function handleSaveDraft()  { emit('save-draft',      buildPayload()) }
  function handleBuildAnalysis(){ emit('build-analysis', buildPayload()) }

  function handleRefresh() {
    // 重置所有数据
    Object.keys(extraInputs).forEach(k => {
      if (Array.isArray(extraInputs[k])) extraInputs[k] = []
      else extraInputs[k] = ''
    })
    splitSection.rows = [
      { composition: '', trial1: null, trial2: null },
      { composition: '', trial1: null, trial2: null }
    ]
    // 清空 Dissolved 表格每行值，保留表格结构
    localSections.value.forEach(sec => {
      sec.headerInputs = { trial1: null, trial2: null }
      sec.rows.forEach(row => { row.composition = ''; row.trial1 = null; row.trial2 = null })
    })
    sampleInput.value = ''
  }

  // 下拉选项 — ResultRemark 和 LabelRemark 共用同一组
  const resultRemarkOptions = ref([]);
  const labelRemarkOptions = ref([]);

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
      headerInputs: { trial1: null, trial2: null }
    }
  ])

  // 拆分表格（单个，默认2行）
  const splitSection = reactive({
    rows: [
      { composition: '', trial1: null, trial2: null },
      { composition: '', trial1: null, trial2: null }
    ],
    headerInputs: { trial1: null, trial2: null }
  })

  // 初始化独立的额外输入框数据
  // ⚠️ 键名是位置式的，input2~input5 已随模板删行下线，**空号保留不补位**
  const extraInputs = reactive({
    input1: '',
    input6: '', input9: '', input10: '',
    input11: '', input12: '',
    input8: [],          // Label Remark 多选数组（键名是位置式的旧名，别当文本框）
    resultRemark: [],    // Result Remark 多选数组
    resultRemarks: [],   // Result Remark 多选数组 (legacy, keep)
    bottleNumber: [],    // Bottle Number 多选数组
    gramWeight: ''       // Gram Weight
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

  /* 添加 Section */
  function addSection() {
    const nextNum = localSections.value.length + 1
    localSections.value.push({
      id: Date.now(),
      title: `Dissolved #${nextNum}`,
      rows: [],
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

  /* 在数据表末尾追加一个空行 —— 成分与 Trial 直接在行内填，不再经过顶部的输入行 */
  function appendRow(sectionIndex) {
    localSections.value[sectionIndex].rows.push({ composition: '', trial1: null, trial2: null })
  }

  //删除行
  function removeRow(sectionIndex, rowIndex) {
    localSections.value[sectionIndex].rows.splice(rowIndex, 1);
  }

  /* ========== 拆分表格方法 ========== */

  /* 在数据表末尾追加一个空行 —— 成分与 Trial 直接在行内填，不再经过顶部的输入行 */
  function appendSplitRow() {
    splitSection.rows.push({ composition: '', trial1: null, trial2: null })
  }

  /* 删除拆分行 */
  function removeSplitRow(rowIndex) {
    splitSection.rows.splice(rowIndex, 1)
  }

  /* ============ 历史报告 ============ */
  // 报告以 docx 存服务器 SaveDocx/FiberAnalysis{yyyyMM}/，生成完只回一个文件名，
  // 页面一刷新那份报告就找不回来了（库里 fiber_analysis 存的是录入数据，不是报告产物）。
  // 这个弹窗扫目录把历史报告列出来，可下载、可删除。
  const historyVisible = ref(false)
  const historyKeyword = ref('')
  const historyList = ref([])
  const historyLoading = ref(false)

  // 一次拉全量，筛选在本地做（按报告号子串，改动输入即出结果，不再打后端）
  async function loadHistory() {
    historyLoading.value = true
    try {
      const res = await request.get('/FiberAnalysis/reports')
      historyList.value = res.data?.isSuccess ? res.data.value : []
    } catch (e) {
      ElMessage.error('查询失败: ' + e.message)
    } finally {
      historyLoading.value = false
    }
  }

  watch(historyVisible, v => { if (v) loadHistory() })

  const filteredHistory = computed(() => {
    const keyword = historyKeyword.value.trim().toLowerCase()
    if (!keyword) return historyList.value
    return historyList.value.filter(r => (r.reportNumber || '').toLowerCase().includes(keyword))
  })

  // 下载必须走 axios：请求拦截器要带 accessToken，裸 <a href> 或页面里那个给 OnlyOffice
  // 预览用的 API_BASE 绝对地址都拿不到 token，会静默失败。
  function downloadHistoryFile(fileName) {
    const backendOrigin = new URL(request.defaults.baseURL).origin
    request.get(`${backendOrigin}/api/FiberAnalysis/reports/${encodeURIComponent(fileName)}`, { responseType: 'blob' })
      .then(resp => {
        const url = URL.createObjectURL(new Blob([resp.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }))
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })
      .catch(e => ElMessage.error('下载失败: ' + e.message))
  }

  // 删除报告：物理删除不可恢复 → 先二次确认。
  // **只删这份 docx，不动库里 fiber_analysis 的录入行**（与干燥速率一致）。
  async function deleteHistoryFile(row) {
    try {
      await ElMessageBox.confirm(
        `确定删除报告「${row.reportNumber}」吗? 删除后不可恢复。`,
        '删除确认', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
    } catch { return }   // 取消/关闭 → 什么都不做

    try {
      const res = await request.delete(`/FiberAnalysis/reports/${encodeURIComponent(row.fileName)}`)
      if (!res.data?.isSuccess) { ElMessage.error(res.data?.error || '删除失败'); return }
      ElMessage.success('已删除')
      loadHistory()
    } catch (e) {
      ElMessage.error('网络错误: ' + e.message)
    }
  }

  /** 后端给的是 ISO 时间串，按本地时区显示到秒 */
  function ts(s) {
    if (!s) return '-'
    const d = new Date(s)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} `
      + `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
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
    gap: 0;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 6px 10px;
    background-color: #fff;
    position: relative;
  }

  /* Split 卡片加淡底色，与 Dissolved 卡片区分 ——
     两者共用 .oneSampleComposition，所以只能加在 Split 那一个的附加类上，
     改基类会把所有 Dissolved 一起染。色取 Split 标题 #3364d5 的淡色调。 */
  .oneSampleComposition.split-card {
    background-color: #61b5e6;
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
    font-size: 14px;
    font-weight: 300;
    color: #3364d5;
    /* style.css:1796 的全局 .section-title 带 margin-bottom:50px（营销模板残留），
       而 .section-header-row 是 flex 行 —— 子元素的 margin 计进行的交叉尺寸，
       整行被撑高 50px，标题与表格之间就多出一条空行。
       本组件原先只覆盖字体与颜色、没声明 margin，所以那 50px 一直在生效。 */
    margin-bottom: 0;
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
      gap: 10px;
      background-color: #f9f9f9;
      padding: 6px 10px;
      border-radius: 4px;
      border: 1px solid #ebeef5;
    }

    .input-item {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;

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
      font-size: 13px;
      /* 全局 style.css 给所有 table 塞了 margin-bottom:30px；卡片是 gap:0 的纵向 flex，
         这条会被 .custom-table 的 overflow:hidden 包进边框里，在表与下方 Add 之间撑出一条空白 */
      margin-bottom: 0;

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
      .cell-sub-composition {
        width: 30%;
        padding: 2px 8px;
        :deep(.el-input--small) { --el-input-height: 28px; }
      }
      .cell-sub-input {
        width: 23.33%;
        padding: 2px 8px;
      }
      .cell-sub-action {
        width: 23.33%;
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










