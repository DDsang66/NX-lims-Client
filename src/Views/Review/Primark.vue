<template>
  <div class="row">
    <div class="col-xl-7">
      <BuyerInfo :buyer="currentBuyer"
                 :reviewer="currentReviewer"
                 :menuName="menuOptions"
                 @api-response="onBuyerData"
                 @field-change="handleFieldChange" />

      <div style="border: 1px solid #cae2e8;">
        <RequireLabel ref="requireLabelDoM"
                      :buyer="currentBuyer"
                      :orderNumber="orderNumber"
                      :menuName="menuName"
                      :reviewer="currentReviewer"
                      :items="items"
                      :selectedRows="selectedRows"
                      :sampleSummary="sampleSummary"
                      @api-response="onBuyerParamData"
                      @submit="onSubmitData" />
      </div>
    </div>

    <div class="col-xl-5">
      <CheckList :rawData="rawData":fullRefresh="isFullRefresh"
                 @update:selected="val => selectedRows = val" />

      <SubmitCheckList :buyer="currentBuyer"
                       :orderNumber="orderNumber"
                       :menuName="menuName?.[0] || 'default'"
                       :reviewer="currentReviewer"
                       :selectedRows="selectedRows"
                       :additionalRequire="additionalRequire"
                       :sampleDescription="sampleDescription"
                       :sampleDescripBoundSingleDto="requireLabelDoM ? requireLabelDoM.sampleDescripBoundSingleDto :null"
                       :seamParameter="requireLabelDoM ? requireLabelDoM.seamParameter : null" />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, inject } from 'vue'
  import BuyerInfo from '@/components/BuyerInfo.vue'
  import CheckList from '@/components/CheckListNew.vue' // 引入新的 Checklist
  import RequireLabel from '@/components/RequireLabel.vue'
  import SubmitCheckList from '@/components/SubmitCheckList.vue'

  const currentBuyer = ref("Primark");
  const authStore = inject('userAuthStore')
  const currentReviewer = computed(() => authStore.user || '')
  const requireLabelDoM = ref(null)
  const menuName = ref();
  const orderNumber = ref();
  const menuOptions = ref([
    { value: 'PTC01', label: 'PTC01' },
    { value: 'PTC02', label: 'PTC02' },
    { value: 'PTC03', label: 'PTC03' },
    { value: 'PTC04', label: 'PTC04' },
    { value: 'PTC05', label: 'PTC05' },
    { value: 'PTC06', label: 'PTC06' },
    { value: 'PTC07', label: 'PTC07' },
    { value: 'PTC08', label: 'PTC08' },
    { value: 'PTC09', label: 'PTC09' },
    { value: 'PTC10', label: 'PTC10' },
    { value: 'PTC11', label: 'PTC11' },
    { value: 'PTC12', label: 'PTC12' },
    { value: 'PTC13', label: 'PTC13' },
    { value: 'PTC14', label: 'PTC14' },
    { value: 'PTC15', label: 'PTC15' },
    { value: 'PTC15A', label: 'PTC15A' },
    { value: 'PTC16', label: 'PTC16' },
    { value: 'PTC17', label: 'PTC17' },
    { value: 'PTC18A', label: 'PTC18A' },
    { value: 'PTC18B', label: 'PTC18B' },
    { value: 'PTC19', label: 'PTC19' },
    { value: 'PTC20A', label: 'PTC20A' },
    { value: 'PTC20B', label: 'PTC20B' },
    { value: 'PTC21A', label: 'PTC21A' },
    { value: 'PTC21B', label: 'PTC21B' },
    { value: 'PTC22', label: 'PTC22' },
    { value: 'PTC23', label: 'PTC23' },
    { value: 'PTC24', label: 'PTC24' },
    { value: 'PTC25', label: 'PTC25' },
    { value: 'PTC26', label: 'PTC26' },
    { value: 'PTC27', label: 'PTC27' },
    { value: 'PTC28', label: 'PTC28' },
    { value: 'PTC29', label: 'PTC29' },
    { value: 'PTC31', label: 'PTC31' },
    { value: 'PTC35', label: 'PTC35' },
    { value: 'PTC36', label: 'PTC36' },
    { value: 'PTC37', label: 'PTC37' },
    { value: 'PTT07', label: 'PTT07' },
  ])

  // 状态简化
  const rawData = ref([]) // 存储 API 返回的原始列表
  const selectedRows = ref([]) // 存储当前选中的行
  const items = ref([]) // RequireLabel 需要的简单列表
  const additionalRequire = ref();
  const sampleDescription = ref();

  const isFullRefresh = ref(false)

  // 修改 onBuyerData，添加 fullRefresh 参数
  const onBuyerData = (response) => {
    const list = response.data || []

    // 标记为全量刷新
    isFullRefresh.value = true

    rawData.value = list

    items.value = list.map(item => ({
      itemName: item.itemName,
      standards: item.standards ? item.standards.join(', ') : ''
    }))

    // 重置标志位（下一个 tick）
    setTimeout(() => {
      isFullRefresh.value = false
    }, 0)
  }

  // RequireLabel 的参数回填逻辑
  const onBuyerParamData = ({ data = [] }) => {
    // 这里需要根据 rawData 更新对应行的 parameters
    // 由于 rawData 是引用传递，直接修改 rawData 即可，CheckList 会自动响应
    data.forEach(patch => {
      const row = rawData.value.find(item =>
        item.itemName === patch.itemName &&
        item.standards[0] === patch.standard
      )
      if (row) {
        row.parameters = patch.param
      }
    })
  }

  const sampleSummary = computed(() => {
    if (!selectedRows.value || selectedRows.value.length === 0) return []

    let summary = new Set()

    selectedRows.value.forEach(item => {
      if (item.samples) {
        // 【修改】将字符串按逗号分割，并去除首尾空格
        // 例如 "A, B" -> ["A", "B"]
        const sampleList = String(item.samples).split(',').map(s => s.trim()).filter(s => s)

        // 将分割后的每一个样品号都加入 Set
        sampleList.forEach(s => summary.add(s))
      }
    })

    // 转回数组并排序
    return [...summary].sort()
  })


  const handleFieldChange = (fields) => {
    menuName.value = fields.menuName;
    orderNumber.value = fields.reportNumber;
  }

  const onSubmitData = (data) => {
    additionalRequire.value = data.additionalRequire;
    sampleDescription.value = data.sampleDescription;
  }
</script>

