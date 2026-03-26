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
          @submit="onSubmitData"
        />
      </div>
    </div>

    <div class="col-xl-5">
      <CheckList :rawData="rawData"
                 @update:selected="val => selectedRows = val" />

      <SubmitCheckList :buyer="currentBuyer"
                       :orderNumber="orderNumber"
                       :menuName="menuName"
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

  const currentBuyer = ref("OVS"); 
  const authStore = inject('userAuthStore')
  const currentReviewer = computed(() => authStore.user || '')
  const requireLabelDoM = ref(null)
  const menuName = ref();
  const orderNumber = ref();
  const menuOptions = ref([
    { value: 'A-Act', label: 'A-Act' },
    { value: 'G-Act', label: 'G-Act' },
    { value: 'L-Act', label: 'L-Act' },
    { value: 'J-Act', label: 'J-Act' },
    { value: 'A', label: 'A' },
    { value: 'A-1', label: 'A-1' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' },
    { value: 'F', label: 'F' },
    { value: 'G', label: 'G' },
    { value: 'H', label: 'H' },
    { value: 'I', label: 'I' },
    { value: 'L', label: 'L' },
    { value: 'M', label: 'M' },
    { value: 'J', label: 'J' },
    { value: 'KL', label: 'KL' },
    { value: 'KP', label: 'KP' },
    { value: 'KT', label: 'KT' },
    { value: 'N', label: 'N' },
    { value: 'O', label: 'O' },
    { value: 'P', label: 'P' },
    { value: 'T', label: 'T' },
    { value: 'U', label: 'U' },
    { value: 'V', label: 'V' },
    { value: 'Z', label: 'Z' },
    { value: 'A-SKI wear', label: 'A-SKI wear' },
    { value: 'G-SKI wear', label: 'G-SKI wear' },
    { value: 'L-SKI wear', label: 'L-SKI wear' },
    { value: 'J-SKI wear', label: 'J-SKI wear' },
    { value: 'I-SKI wear', label: 'I-SKI wear' },
    { value: 'PP-Period Panties', label: 'PP-Period Panties' },
    { value: 'HTL-N-Bed Sheet', label: 'HTL-N-Bed Sheet' },
    { value: 'HTL-T-Bathrobe&Towel', label: 'HTL-T-Bathrobe&Towel' },
    { value: 'HTL-P-TableClothes', label: 'HTL-P-TableClothes' },
    { value: 'HTL-S-SPA&Sea Towel', label: 'HTL-S-SPA&Sea Towel' },
    { value: 'HTL-Y-Slipper', label: 'HTL-Y-Slipper' },
    { value: 'UM-Umbrellas', label: 'UM-Umbrellas' },
    { value: 'UPH-T', label: 'UPH-T' },
    { value: 'LG', label: 'LG' },
    { value: 'PPE', label: 'PPE' }
  ])

  // 状态简化
  const rawData = ref([]) // 存储 API 返回的原始列表
  const selectedRows = ref([]) // 存储当前选中的行
  const items = ref([]) // RequireLabel 需要的简单列表
  const additionalRequire = ref();
  const sampleDescription = ref();

  // 处理 BuyerInfo 返回的数据
  const onBuyerData = (response) => {                                     
    const list = response.data || []

    // 直接存储原始数据，不再手动分类
    rawData.value = list

    // 生成 RequireLabel 需要的轻量级列表
    items.value = list.map(item => ({
      itemName: item.itemName,
      standards: item.standards ? item.standards.join(', ') : ''
    }))
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
