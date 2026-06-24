<template>
  <div class="page-container">
    <!-- 左侧 40% -->
    <div class="left-panel">
      <!-- 子组件1: Setting Form -->
      <left-top-section v-model:reportNums="reportNums"
                        v-model:form="form"
                        :additionItems="additionItems"
                        :menuName="menuName"
                        :standards="standards"
                        @submit-form="submitForm" />

      <!-- 分割虚线 -->
      <div class="dashed-line"></div>

      <!-- 子组件2: 根据 additionItem 值动态显示 -->
      <left-multi-fiber-section v-if="isMultiFiber"
                                v-model:rows="rows"
                                :allCompositions="allCompositions"
                                @confirm="handleFiberConfirm"
                                @save-draft="handleSaveDraft"
                                @build-analysis="handleBuildAnalysis" />

      <left-single-fiber-section v-else
                                 v-model:rows="rows"
                                 :allCompositions="allCompositions"
                                 @confirm="handleFiberConfirm"
                                 @save-draft="handleSaveDraft"
                                 @build-analysis="handleBuildAnalysis" />
    </div>

    <!-- 右侧 60% -->
    <!-- 子组件3: Right Panel -->
    <right-panel :form="form" :document-url="docUrl" />
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, inject, watch } from 'vue'
  import LeftTopSection from './LeftTopSection.vue'
  import LeftMultiFiberSection from './LeftMultiFiberSection.vue'
  import LeftSingleFiberSection from './LeftSingleFiberSection.vue'
  import RightPanel from './RightPanel.vue'
  import '@/assets/css/style.css';

  const emit = defineEmits(['confirm']);
  const request = inject('request');
  const docUrl = ref('http://localhost:5051/api/fiberdocx/get-docxUrl')  // 初始加载模板文档

  // Report Number 分段数据
  const twoDigitYear = ref(new Date().getFullYear() % 100)
  const reportNums = reactive({
    data1: '87.',
    data2: '405.',
    data3: twoDigitYear.value + '.',
    data4: '',
    data5: '.01'
  })

  // 表单数据
  const form = ref({
    reportNumber: '',
    menuName: [],
    additionItem: '',
    standard: ''
  })

  // 模拟数据 - 通过 fiberType 字段标识组件类型
  const additionItems = ref([
    { value: 'type1', label: 'Multi', fiberType: 'multi' },
    { value: 'type2', label: 'Single', fiberType: 'single' }
  ])

  const menuName = ref([
    { value: 'Regulation (Eu) No. 1007/2011', label: 'Regulation (Eu) No. 1007/2011' },
    { value: 'AATCC TM20-2021',               label: 'AATCC TM20-2021' },
    { value: 'AATCC TM20-2021  AATCC TM20A-2021e', label: 'AATCC TM20-2021  AATCC TM20A-2021e' },
    { value: 'ISO1833',                       label: 'ISO1833' },
    { value: 'DIN EN ISO 1833',               label: 'DIN EN ISO 1833' },
    { value: 'FZ/T 01057.1-4–2007',           label: 'FZ/T 01057.1-4–2007' },
    { value: 'AATCC TM20-2021 AATCC TM20A-2021e (Korea)', label: 'AATCC TM20-2021 AATCC TM20A-2021e (Korea)' },
    { value: 'CAN/CGSB-4.2 No.14-2005',       label: 'CAN/CGSB-4.2 No.14-2005' },
    { value: 'CNS 2339-1:2013 CNS 2339-2:2013', label: 'CNS 2339-1:2013 CNS 2339-2:2013' },
    { value: 'JIS L1030-1:2012 JIS L1030-2:2012', label: 'JIS L1030-1:2012 JIS L1030-2:2012' }
  ])

  const standards = ref([
    { value: 'std1', label: 'Standard Method 1' },
    { value: 'std2', label: 'Standard Method 2' }
  ])

  const allCompositions = ref([]);
  const rows = ref([]);

  // 计算属性：判断是否显示多纤维组件
  const isMultiFiber = computed(() => {
    if (!form.value.additionItem) return false

    const selectedItem = additionItems.value.find(
      item => item.value === form.value.additionItem
    )

    // 根据 additionItems 中的 fiberType 字段判断，默认为 single
    return selectedItem?.fiberType === 'multi'
  })

  // 监听 additionItem 变化，切换时清空 rows 数据避免数据混乱
  watch(() => form.value.additionItem, (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      rows.value = []
    }
  })

  // 获取成分选项列表
  async function getCompositions() {
    allCompositions.value = (await request.get('/render/compositionsearch')).data.data
  }

  const submitForm = () => {
    console.log('Load Menu:', form.value.menuName)
  }

  const handleFiberConfirm = (data) => {
    emit('confirm', data)
  }

  // 构建 BuildAnalysisDto（全部 camelCase，匹配后端 System.Text.Json）
  function buildDto(payload) {
    const dto = {
      reportNumber: form.value.reportNumber,
      method: form.value.menuName || [],
      componentType: form.value.additionItem === 'type1' ? 'Multi' : 'Single',
      buyer: form.value.standard || '',
      verifyResult: payload.extraInputs?.input1 || '',
      finalResult: payload.extraInputs?.input2 || '',
      durabilityLabel: payload.extraInputs?.input3 || '',
      otherLabel: payload.extraInputs?.input4 || '',
      comprehensive: payload.extraInputs?.input5 || '',
      recommendedLabel: payload.extraInputs?.input6 ? [payload.extraInputs.input6] : [],
      resultRemark: payload.extraInputs?.resultRemark || '',
      labelRemark: payload.extraInputs?.input8 || '',
      judgmentLabelRemark: payload.extraInputs?.input9 || '',
      languageLabelRemark: payload.extraInputs?.input10 || ''
    }

    if (form.value.additionItem === 'type1') {
      // Multi
      dto.multipleBuildAnalysis = {
        fiberSplittingList: [],
        fiberDissolvedList: [],
        sample: payload.sampleInput || ''
      }
      if (payload.splitSection?.rows) {
        dto.multipleBuildAnalysis.fiberSplittingList = [{
          splittingRows: payload.splitSection.rows
            .filter(r => r.composition)
            .map(r => ({ fiberName: r.composition, gsmTrail1: Number(r.trial1) || 0, gsmTrail2: Number(r.trial2) || 0 }))
        }]
      }
      if (payload.localSections?.length) {
        dto.multipleBuildAnalysis.fiberDissolvedList = payload.localSections.map(sec => ({
          originalGSMTrail1: Number(sec.headerInputs?.trial1) || 0,
          originalGSMTrail2: Number(sec.headerInputs?.trial2) || 0,
          dissolvedRows: (sec.rows || []).filter(r => r.composition).map(r => ({
            fiberName: r.composition, gsmTrail1: Number(r.trial1) || 0, gsmTrail2: Number(r.trial2) || 0
          }))
        }))
      }
    } else {
      // Single
      dto.singleBuildAnalysis = {
        singleFiberRows: ((payload.sections || []).flatMap(s => (s.rows || []).filter(r => r.composition).map(r => ({
          sample: payload.sampleInput || r.location || '',
          fiberName: r.composition,
          gsmTrail1: Number(r.trial1) || 0
        }))))
      }
    }

    return dto
  }

  async function handleSaveDraft(payload) {
    const dto = buildDto(payload)
    const res = await request.post('/FiberAnalysis/worksheet', dto)
    console.log('Save Draft:', res.data)
  }

  async function handleBuildAnalysis(payload) {
    const dto = buildDto(payload)
    console.log('Build DTO:', JSON.stringify(dto))
    const res1 = await request.post('/FiberAnalysis/worksheet', dto)
    console.log('Build Analysis:', res1.data)
    if (res1.data?.isSuccess) {
      // BuildAnalysis 已经在后端完成计算+生成Word，直接加载预览
      const fileName = `${dto.reportNumber}_FiberAnalysis.docx`
      docUrl.value = `http://localhost:5051/api/FiberAnalysis/${fileName}/download`
    }
  }

  onMounted(() => {
    getCompositions()
  })
</script>

<style scoped lang="scss">
  .page-container {
    min-height: 100vh;
    background: #f5f7fa;
    padding: 24px;
    box-sizing: border-box;
    display: flex;
    gap: 24px;
  }

  .left-panel {
    width: 40%;
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #cae2e8;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .dashed-line {
    width: 100%;
    height: 1px;
    border-top: 1px dashed #dcdfe6;
    margin: 0;
    flex-shrink: 0;
  }

  @media (max-width: 1200px) {
    .page-container {
      flex-direction: column;
    }

    .left-panel {
      width: 100%;
    }
  }
</style>





