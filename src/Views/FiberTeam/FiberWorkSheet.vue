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
                                @confirm="handleFiberConfirm" />

      <left-single-fiber-section v-else
                                 v-model:rows="rows"
                                 :allCompositions="allCompositions"
                                 @confirm="handleFiberConfirm" />
    </div>

    <!-- 右侧 60% -->
    <!-- 子组件3: Right Panel -->
    <right-panel :form="form" />
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
    { value: 'menu1', label: 'ISO 1833' },
    { value: 'menu2', label: 'AATCC TM20-2021' },
    { value: 'menu3', label: 'FZ/T 01057.1-4–2007' },
    { value: 'menu4', label: 'CAN/CGSB-4.2 No.14-2005' },
    { value: 'menu4', label: '..................' }
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





