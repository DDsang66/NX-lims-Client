<script setup>
import { ref, computed,inject} from 'vue'
import Feedback from '@/components/Login&Feedback.vue'
import BuyerInfo from '@/components/BuyerInfo.vue'
import CheckList from '@/components/CheckList.vue'
import RequireLabel from '@/components/RequireLabel.vue'
import SubmitCheckList from '@/components/SubmitCheckList.vue'


const itemToTable = new Map();
const currentBuyer = ref("Primark");
const authStore = inject('userAuthStore')
const currentReviewer = computed(() => authStore.user || '')
const menuName = ref();
const orderNumber = ref();
const menuOptions = ref([
  {value: 'PTC01', label: 'PTC01'},
  {value: 'PTC02', label: 'PTC02'},
  {value: 'PTC03', label: 'PTC03'},
  {value: 'PTC04', label: 'PTC04'},
  {value: 'PTC05', label: 'PTC05'},
  {value: 'PTC06', label: 'PTC06'},
  {value: 'PTC07', label: 'PTC07'},
  {value: 'PTC08', label: 'PTC08'},
  {value: 'PTC09', label: 'PTC09'},
  {value: 'PTC10', label: 'PTC10'},
  {value: 'PTC11', label: 'PTC11'},
  {value: 'PTC12', label: 'PTC12'},
  {value: 'PTC13', label: 'PTC13'},
  {value: 'PTC14', label: 'PTC14'},
  {value: 'PTC15', label: 'PTC15'},
  {value: 'PTC15A', label: 'PTC15A'},
  {value: 'PTC16', label: 'PTC16'},
  {value: 'PTC17', label: 'PTC17'},
  {value: 'PTC18A', label: 'PTC18A'},
  {value: 'PTC18B', label: 'PTC18B'},
  {value: 'PTC19', label: 'PTC19'},
  {value: 'PTC20A', label: 'PTC20A'},
  {value: 'PTC20B', label: 'PTC20B'},
  {value: 'PTC21A', label: 'PTC21A'},
  {value: 'PTC21B', label: 'PTC21B'},
  {value: 'PTC22', label: 'PTC22'},
  {value: 'PTC23', label: 'PTC23'},
  {value: 'PTC24', label: 'PTC24'},
  {value: 'PTC25', label: 'PTC25'},
  {value: 'PTC26', label: 'PTC26'},
  {value: 'PTC27', label: 'PTC27'},
  {value: 'PTC28', label: 'PTC28'},
  {value: 'PTC29', label: 'PTC29'},
  {value: 'PTC31', label: 'PTC31'},
  {value: 'PTC35', label: 'PTC35'},
  {value: 'PTC36', label: 'PTC36'},
  {value: 'PTC37', label: 'PTC37'},
  {value: 'PTT07', label: 'PTT07'},
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
    </div>
  </div>
</template>



<style>
</style>
