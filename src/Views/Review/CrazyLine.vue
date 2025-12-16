<script setup>
  import { ref, computed,inject} from 'vue'
  import Feedback from '@/components/Login&Feedback.vue'
  import BuyerInfo from '@/components/BuyerInfo.vue'
  import CheckList from '@/components/CheckList.vue'
  import RequireLabel from '@/components/RequireLabel.vue'
  import SubmitCheckList from '@/components/SubmitCheckList.vue'

  const authStore = inject('userAuthStore')
  const currentReviewer = computed(() => authStore.user || '')
  const itemToTable = new Map();
  const currentBuyer = ref("Crazy Line");
  const menuName = ref();
  const orderNumber = ref();
  const menuOptions = ref([
    { value: 'Woven(CrazyLine)', label: 'Woven' },
    { value: 'Knit(CrazyLine)', label: 'Knit' }
  ])

  const PhysicsList = ref([]);
  const WetList = ref([]);
  const FiberList = ref([]);
  const items = ref([]);
  const additionalRequire = ref();
  const sampleDescription = ref();

  const onSubmitData = (data) => {
    console.log("The Required Info Data:", data);
    additionalRequire.value = data.additionalRequire;
    sampleDescription.value = data.sampleDescription;
  }


  //-------------------------------------------------------------------//CheckList
  /* 接收 BuyerInfo 回传数据 */
  const onBuyerData = (response) => {
    const list = (response.data || []).map(item => ({
      ...item,
      // 过滤 null / undefined / '' 后，若结果为空数组 → 直接设成 []
      parameters: (item.parameters || [])
        .filter(p => p != null && p !== '')
        .join(', ') || ''
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
    console.log('countList',countList)

    //先将已有checkList放入其中

    data.forEach(patch => {
      // const row = rowMap.get(patch.itemName)  //获取对应旧值
      const row=countList.filter(item=>{
        if(item.itemName==='Pilling Resistance'&&patch.itemName==='Pilling Resistance'){
          console.log(item)
          console.log(patch)
          console.log(item.itemName===patch.itemName&&item.standard===patch.standard)
        }

        return item.itemName===patch.itemName&&item.standards[0]===patch.standard
      })[0]
      if (!row) return

      // 1. 通过新值获取parameters
      const str = Object.entries(patch)
        .filter(([k, v]) => k !== 'itemName' && k !== 'orderNumber'&&k!=='standard' && v != null && v !== '')
        .map(([k, v]) => k === 'param' ? v : `${k}: ${v}`)
        .join(', ');

      // 2. 仅覆盖 parameters
      row.parameters = str
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
    console.log('Field changes:', fields)
    // fields contains: { reportNumber, reviewer, buyer, menuName }
    menuName.value = fields.menuName;
    orderNumber.value = fields.reportNumber;
  }

</script>

<template>
  <div class="section 1">
    <div class="container">
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
             @api-response="onBuyerParamData"
             @submit="onSubmitData"/>
          </div>
        </div>
        <div class="col-xl-5">
          <CheckList title="Physics" :list="PhysicsList" @update:checked="onRowToggle"/>
          <CheckList title="Wet" :list="WetList" @update:checked="onRowToggle" />
          <CheckList title="Fiber" :list="FiberList" @update:checked="onRowToggle"/>
          <SubmitCheckList
           :buyer="currentBuyer"
           :orderNumber="orderNumber"
           :menuName="menuName"
           :reviewer ="currentReviewer"
           :selectedRows="selectedRows"
           :additionalRequire="additionalRequire"
           :sampleDescription="sampleDescription"
                           />
        </div>
      </div>
      </div>
  </div>
</template>



<style>
</style>
