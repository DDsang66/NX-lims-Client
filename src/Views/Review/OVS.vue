<script setup>
  import { ref, computed,inject} from 'vue'
  import BuyerInfo from '@/components/BuyerInfo.vue'
  import CheckList from '@/components/CheckList.vue'
  import RequireLabel from '@/components/RequireLabel.vue'
  import SubmitCheckList from '@/components/SubmitCheckList.vue'


  const itemToTable = new Map();
  const currentBuyer = ref("OVS");
  const authStore = inject('userAuthStore')
  const currentReviewer = computed(() => authStore.user || '')
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
  const additionalRequire = ref();
  const sampleDescription = ref();
  const PhysicsList = ref([]);
  const WetList = ref([]);
  const FiberList = ref([]);
  const items = ref([]);

  const onSubmitData = (data) =>
  {
    additionalRequire.value = data.additionalRequire;
    sampleDescription.value = data.sampleDescription;
  }



  /* 接收 BuyerInfo 回传数据 */
  const onBuyerData = (response) => {
    const list = (response.data || []).map(item => ({
      ...item,
      // 过滤 null / undefined / '' 后，若结果为空数组 → 直接设成 []
      parameters: (item.parameters || [])
        .filter(p => p != null && p !== '')
    }))

    // console.log('原始数据:', list)

    // 按 types 直接分类
    PhysicsList.value = list.filter(item => item.types.includes('Physics'))
    WetList.value = list.filter(item => item.types.includes('Wet'))
    FiberList.value = list.filter(item => item.types.includes('Fiber'))

    itemToTable.clear()
    PhysicsList.value.forEach(r => itemToTable.set(r.itemName, 'Physics'))
    WetList.value.forEach(r => itemToTable.set(r.itemName, 'Wet'))
    FiberList.value.forEach(r => itemToTable.set(r.itemName, 'Fiber'))

    items.value = list.map(item => ({itemName:item.itemName,standards:item.standards ? item.standards.join(', ') : ''}))
  }

  //对已有的CheckList进行渲染
  const onBuyerParamData = ({ data = [] }) => {
    // const rowMap = new Map()
    // PhysicsList.value.forEach(r => rowMap.set(r.itemName, r))
    // WetList.value.forEach(r => rowMap.set(r.itemName, r))
    // FiberList.value.forEach(r => rowMap.set(r.itemName, r))

    //汇总List
    const countList=[...PhysicsList.value,...WetList.value]

    //先将已有checkList放入其中

    data.forEach(patch => {
      //根据回传找对应旧值
      const row=countList.find(item=>{
        return item.itemName===patch.itemName&&item.standards[0]===patch.standard
      })
      if (!row) return

      // // 1. 通过新值获取parameters
      // const str = Object.entries(patch)//返回`[index, value]` 迭代器
      //   .filter(([k, v]) => k !== 'itemName' && k !== 'orderNumber'&&k!=='standard' && v != null && v !== '')//去除属性，和空值属性
      //   .map(([k, v]) => k === 'param' ? v : `${k}: ${v}`)
      // 2. 仅覆盖 parameters
      row.parameters = patch.param
    })
  }


  //保留所有字段，只加 selected
  const physicsRows = computed(() =>
    PhysicsList.value.map(r => ({ ...r, selected: r.selected ?? false }))
  )
  const wetRows = computed(() =>
    WetList.value.map(r => ({ ...r, selected: r.selected ?? false }))
  )
  const fiberRows = computed(() =>
    FiberList.value.map(r => ({ ...r, selected: r.selected ?? false }))
  )

  //直接取原始对象
  const selectedRows = computed(() =>
    [...physicsRows.value, ...wetRows.value, ...fiberRows.value]
      .filter(r => r.selected)
  )

  //获取样品汇总
  const sampleSummary = computed(() =>{
    let summary = new Set()
    selectedRows.value.forEach(item=>{
      let samplesArray=item.samples.split(',')
      for (const string of samplesArray) {
        summary.add(string)
      }
    })
    return [...summary].sort()
  })

  function onRowToggle(row) {
    // 找到原数组对应项，更新 selected
    const arr = row.type === 'Physics'
      ? PhysicsList.value
      : row.type === 'Wet'
        ? WetList.value
        : FiberList.value
    const item = arr.find(r => r.itemName === row.itemName)
    if (item) item.selected = row.selected
  }


  const handleFieldChange = (fields) => {
    // fields contains: { reportNumber, reviewer, buyer, menuName }
    menuName.value = fields.menuName;
    orderNumber.value = fields.reportNumber;
  }

</script>

<template>
  <div class="row">
    <div class="col-xl-7">
<!--          <Feedback />-->
      <BuyerInfo
         :buyer="currentBuyer"
         :reviewer="currentReviewer"
         :menuName="menuOptions"
         @api-response="onBuyerData"
         @api-error="handleError"
         @field-change="handleFieldChange"/>
      <div style="border: 1px solid #cae2e8;">
        <RequireLabel
         :buyer="currentBuyer"
         :orderNumber="orderNumber"
         :menuName="menuName"
         :reviewer ="currentReviewer"
         :items="items"
         :sampleSummary="sampleSummary"
         :selectedRows="selectedRows"
         @api-response="onBuyerParamData"
         @submit="onSubmitData"/>
      </div>
    </div>
    <div class="col-xl-5">
      <CheckList title="Physics" :list="PhysicsList" style="width: 100%" @update:checked="onRowToggle"/>
      <CheckList title="Wet" :list="WetList" style="width: 100%" @update:checked="onRowToggle" />
<!--          <CheckList title="Fiber" :list="FiberList" @update:checked="onRowToggle"/>-->
      <SubmitCheckList
       :buyer="currentBuyer"
       :orderNumber="orderNumber"
       :menuName="menuName"
       :reviewer ="currentReviewer"
       :selectedRows="selectedRows"
       :additionalRequire="additionalRequire"
       :sampleDescription ="sampleDescription"
                       />
    </div>
  </div>
</template>



<style>
</style>
