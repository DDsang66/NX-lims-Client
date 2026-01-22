<template>
  <div class="thisPadding">
    <div class="thisPiece">
      <WetCareLabel @updateData="handleWetCarelabelUpdate" :afterWashs="afterWashs" :washLabelRegionDefault="washLabelRegionDefault"/>
    </div>
  </div>
  <div class="thisPadding">
    <div class="thisPiece">
      <FiberContentBoundSingle v-if="['Primark','OVS'].includes(buyer)"
         @confirm="handleRowsSingle"
         :sampleSummary="sampleSummary"
      />
      <FiberContent v-else @confirm="handleRows" />
    </div>
  </div>

  <div class="thisPadding">
    <div class="thisPiece">
      <SampleDescripeBoundSingle v-if="['Primark','OVS'].includes(buyer)"
         :sampleSummary="sampleSummary"
         :propertys="propertys"
         ref="sampleDescripBoundSingle"
      />
      <SampleDescripe v-else ref="sampleDescrip" :propertys="propertys" />
    </div>
  </div>

  <div class="thisPadding">
    <div class="thisPiece" >
      <div style="margin-bottom: 5px">
        <a style="color:#3364d5;font-size: 20px;font-weight: bold" href="#" @click.prevent="toggleNotice()">
          {{ $t('itemRequire') }}
        </a>
      </div>
      <transition name="fade" style="margin-bottom: 10px">
        <div v-show="additionalReqIsOpen">
          <div class="seamItemParam" v-if="seamSamples.length!==0">
            <hr class="thisHr">
            <label class="itemNameParam">{{$t('seamParameter')}}</label>
            <div class="blockContainer">
              <div class="oneGroup" v-for="(group,index) in seamGroups" :key="group.samples">
                <!--            样品-->
                <div class="line-flex-container">
                  <el-select v-model="group.samples" placeholder="" multiple
                             style="flex:1;"
                             @change="oneGroupSamplesChange">
                    <el-option v-for="sample in sampleSummary" :key="sample" :value="sample"></el-option>
                  </el-select>
                  <el-button type="danger" @click="deleteGroup(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <!--            添加部位-->
                <div class="line-flex-container">
                  <label>Type</label>
                  <el-select style="width: 250px" v-model="group.locationsDraft.type" @change="locationTypeChange(group.locationsDraft)">
                    <el-option v-for="type in seamTypeOptions" :key="type" :value='type'></el-option>
                  </el-select>
                  <label style="margin-left: 10px">Locations</label>
                  <el-select v-model="group.locationsDraft.locations" multiple @change="locationsSelectChange(group.locationsDraft)">
                    <template #header>
                      <el-checkbox
                        v-model="group.locationsDraft.locationCheckAll"
                        :indeterminate="group.locationsDraft.indeterminate"
                        @change="handleLocationCheckAll($event,group.locationsDraft)"
                      >
                        All
                      </el-checkbox>
                    </template>
                    <el-option v-for="location in seamType_LocationsMap.get(group.locationsDraft.type)" :key="location" :value="location"></el-option>
                  </el-select>
                  <el-button @click="addLocations(group)">+</el-button>
                </div>
                <!--            参数-->
                <el-table class="removeTableGaps" :data="group.locationInfos" border>
                  <el-table-column label="Location" prop="location" width="200px"></el-table-column>
                  <el-table-column label="NA" width="50px">
                    <template #default="scope">
                      <el-checkbox v-model="scope.row.isNA"></el-checkbox>
                    </template>
                  </el-table-column>
                  <el-table-column label="Reason">
                    <template #default="scope">
                      <el-select :disabled="!scope.row.isNA" allow-create filterable v-model="scope.row.reason" default-first-option>
                        <el-option v-for="reason in seamReasons" :key="reason" :value="reason"></el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="Delete" width="75px">
                    <template #default="scope">
                      <el-button type="danger" @click="removeLocationInfo(group.locationInfos,scope.$index)">
                        <el-icon>x</el-icon>
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <div class="line-flex-container">
                <el-select v-model="newSeamSampleGroup" multiple>
                  <el-option v-for="sample in unGroupedSeamSamples" :key="sample" :value="sample"></el-option>
                </el-select>
                <el-button @click="addNewSeamGroup">
                  <el-icon><Check /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </transition>

    </div>

  </div>
  <div class="row" style="padding:0 20px 0 20px" >
    <div class="form-group col-xl-9 mb-0">
      <label>{{ $t('additionalRequire') }}</label>
      <input class="form-control"
             readonly
             placeholder="Order Notes (Optional)"
             v-model="additionalRequire">
    </div>
    <div class="form-group col-xl-3">
      <label>action</label>
      <button type="button"
              style="background-color: #3364d5"
              class="sigma_btn-custom primary btn-block"
              @click="confirmAction">
        Confirm
      </button>
    </div>
  </div>
</template>

<script setup>
import {ref, defineComponent, inject, computed, onMounted} from 'vue'
import WetCareLabel from '@/components/WetCareLabel.vue'
import FiberContent from '@/components/FiberContent.vue'
import SampleDescripe from '@/components/SampleDescripe.vue'
import {useI18n} from "vue-i18n";
import globalFunctions from "@/utils/globalFunctions.js";
import FiberContentBoundSingle from "@/components/FiberContentBoundSingle.vue";
import SampleDescripeBoundSingle from "@/components/SampleDescripeBoundSingle.vue";
import {Check, Delete} from "@element-plus/icons-vue";

const request = inject('request');
const props = defineProps({
  buyer: String,
  orderNumber: String,
  menuName: String,
  reviewer: String,
  items: Array,
  sampleSummary: Array,
  selectedRows: Array,
  washLabelRegionDefault: String,
});
const sampleDescrip = ref(null)
const sampleDescripBoundSingle = ref(null)
// const testItems = ref()
// const selectedItemNames = ref([])
const selectedItems = ref([])
const additionalReqIsOpen = ref(true)
const size = 'large'
// const itemParamsIsOpen = ref(false)

const afterWashs = ref([]);
const wetCareData = ref({});   // 保存 WetCareLabel 数据
const fiberComposition = ref([]);   // 保存 FiberContent 数据
const fiberCompositionSingle = ref([]);
const additionalRequire = ref('');
// const sampleDescription = ref('');
const propertys = ref([])
//接缝样品
const seamSamples = computed(() => {
  let seamSamplesSet = new Set()
  props.selectedRows.forEach(row => {
    if (row.itemName.includes('Seam'))
      row.samples.split(',').forEach(sample => {
        seamSamplesSet.add(sample)
      })
  })
  return [...seamSamplesSet].sort()
})
//接缝分组
/*
* samples
* locationInfos
* */
const seamGroups = ref([])
//未分组样品
const unGroupedSeamSamples = computed(() => {
  //已分组样品
  let groupedSamples = seamGroups.value.flatMap(g => g.samples)
  return seamSamples.value.filter(s => !groupedSamples.includes(s))
})
const newSeamSampleGroup = ref([]);
const seamTypeOptions = ['Top', 'Bottom']
const seamType_LocationsMap = new Map([['Top', ['Side', 'Sleeve','Armhole','Shoulder',]],
  ['Bottom', ['Armprit', 'Front Panel','Back Panel','Outside','Inside','Back Rise','Front Crotch','Cross']]])
//原因
const seamReasons = ['拼缝', '接缝长度不足','该接缝不存在','织物结构为针织']

const {t} = useI18n()
// const additionalRequireLabel=t('additionalRequire')
const handleWetCarelabelUpdate = (data) => {
  wetCareData.value = data;
};
// function OpenParams(){
//   itemParamsIsOpen.value=true
//   const map = new Map(testItems.value.map(item => [item.name, item]))
//   selectedItems.value=selectedItemNames.value.map(name => map.get(name)).filter(Boolean)
//   // console.log(selectedItems.value)
// }
function toggleNotice() {
  additionalReqIsOpen.value = !additionalReqIsOpen.value;
}

const handleRows = (fiberCom) => {
  // console.log('fiber',fiberCom)
  fiberComposition.value = fiberCom;
};
const handleRowsSingle = (fiberCom) => {
  // console.log('fiber',fiberCom)
  fiberCompositionSingle.value = fiberCom;
};
// const handleDescription = (data) => {
//   sampleDescription.value = data;
// };

const emit = defineEmits(['submit', 'api-response', 'api-error'])
const seamParameter=computed(()=>{
  return seamGroups.value.flatMap(group=>{
    return group.samples.map(sample=>({sample,locationInfos:group.locationInfos}))
  })
})
const sampleDescription=computed(()=>{
  if (['Primark', 'OVS'].includes(props.buyer))
    return ''
  let mountDescription = '';
  for (let property of sampleDescrip.value.propertyTable) {
    //拼接
    if (property.type === 'Input' || property.type === 'Single') {
      mountDescription += '-' + property.value
    } else {
      mountDescription += '-' + property.value.join('-')
    }
  }
  return mountDescription.substring(1)
})

const sampleDescripBoundSingleDto=ref()

defineExpose({
  seamParameter,
  sampleDescripBoundSingleDto
})

// function-----------------------------------------------------------------------------------------
//部位type改变
function locationTypeChange(locationsDraft){
  locationsDraft.locations=[]
  locationsDraft.locationCheckAll = false
  locationsDraft.indeterminate = false
}
//移除一行信息
function removeLocationInfo(infos,index){
  infos.splice(index,1)
}
//部位选择改变
function locationsSelectChange(locationsDraft) {
  if (locationsDraft.locations.length === 0) {
    locationsDraft.locationCheckAll = false
    locationsDraft.indeterminate = false
  } else if (locationsDraft.locations.length === seamType_LocationsMap.get(locationsDraft.type).length) {
    locationsDraft.locationCheckAll = true
    locationsDraft.indeterminate = false
  } else {
    locationsDraft.indeterminate = true
  }
}

//全选修改
function handleLocationCheckAll(val, locationsDraft) {
  locationsDraft.indeterminate = false
  if (val) {
    //全选
    locationsDraft.locations = seamType_LocationsMap.get(locationsDraft.type)
    locationsDraft.locationCheckAll = true
    locationsDraft.indeterminate = false
  } else {
    locationsDraft.locations = []
    locationsDraft.locationCheckAll = false
    locationsDraft.indeterminate = false
  }
}

//添加部位
function addLocations(group) {
  group.locationsDraft.locations.forEach(location => {
    //不存在则添加
    if (!group.locationInfos.some(locationInfo => {
      return locationInfo.location === location
    }))
      group.locationInfos.push({location, isNA: false, reason: ''})
  })
}

//添加新分组
function addNewSeamGroup() {
  seamGroups.value.push({
    samples: newSeamSampleGroup.value,
    locationInfos: [],
    locationsDraft: {type: '', locations: []},
    //部位多选
    locationCheckAll: false,
    indeterminate: false
  })
  newSeamSampleGroup.value = []
}

//删除某一组
function deleteGroup(index) {
  seamGroups.value.splice(index, 1)
}

//修改单组样品
function oneGroupSamplesChange() {
  let countSamples = new Set()
  for (const group of seamGroups.value) {
    group.samples.forEach(sample => {
      if (countSamples.has(sample))
        return alert('Some sample already exists')
      countSamples.add(sample)
    })
  }
}

const confirmAction = async () => {
  // console.log(seamGroups.value)
  if (props.orderNumber.replace(' ', '').includes('..')) {
    alert('Please enter the order number.')
  }
  // console.log(selectedItems.value)
  const wetCareFields = Object.keys(wetCareData.value).reduce((acc, key) => {
    acc[key] = wetCareData.value[key];
    return acc;
  }, {});
  if (afterWashs.value.some(item => !item.testPoint)) {
    return alert('Please fill in the Sample')
  }
  if (['Primark', 'OVS'].includes(props.buyer)) {
    //sampleDescripBoundSingleDto
    sampleDescripBoundSingleDto.value = (() => {
      if (!['Primark', 'OVS'].includes(props.buyer))
        return null
      return sampleDescripBoundSingle.value.descripGroups.flatMap(group => {
        let descrips = []
        group.samples.forEach(sample => {
          descrips.push({
            sample: sample,
            description: JSON.parse(JSON.stringify(group.propertyTable))
          })
        })
        return descrips
      })
    })()
    //获取样品set
    let sampleSet = new Set()
    let hasDuplicated = false
    sampleDescripBoundSingleDto.value.forEach(descrip => {
      if (!sampleSet.has(descrip.sample))
        sampleSet.add(descrip.sample)
      else
        hasDuplicated = true
    })
    if (hasDuplicated)
      return alert('Some samples in Sample Description are duplicated')
    //判断是否包含所有样品
    let containAllSample = true
    props.sampleSummary.forEach(sample => {
      if (!sampleSet.has(sample))
        containAllSample = false
    })
    if (!containAllSample)
      return alert('Some samples in Sample Description are missing')
    //样描格式转换
    sampleDescripBoundSingleDto.value = sampleDescripBoundSingleDto.value.map(descrip => {
      descrip.description.forEach(item => {
        if (item.type === 'Multiple' && Array.isArray(item.value)) {
          item.value = item.value.join('-')
        }
      })
      return {
        sample: descrip.sample,
        description: descrip.description
      }
    })
    //fiberCompositionSingle判断重复
    let hasDuplicatedFiberSample = false
    let fiberSampleSet = new Set()
    fiberCompositionSingle.value.forEach(fiber => {
      if (!fiberSampleSet.has(fiber.sample))
        fiberSampleSet.add(fiber.sample)
      else
        hasDuplicatedFiberSample = true
    })
    if (hasDuplicatedFiberSample)
      return alert('Some samples in Fiber Content are duplicated')
  }

  const payload = {
    ...wetCareFields,
    fiberComposition: fiberComposition.value,
    fiberCompositionSingle: fiberCompositionSingle.value,
    buyer: globalFunctions.cleanAndLowercase(props.buyer),
    reportNumber: props.orderNumber,
    menuName: props.menuName,
    reviewer: props.reviewer,
    items: (() => {
      let items = props.items
      let selectedRows = props.selectedRows
      // 将 items 转为可快速查找的 Map，key 为 `${itemName}|${standards}`
      const itemMap = new Map();
      const updatedItems = [];

      // 初始化 Map 并保留原始顺序（如果需要）
      items.forEach((item) => {
        const key = `${item.itemName}|${item.standards}`;
        itemMap.set(key, {...item, samples: ''}); // 初始化 samples 为空字符串
        updatedItems.push(itemMap.get(key));
      });

      // 遍历 selectedRows，找到匹配项并设置 samples
      selectedRows.forEach(row => {
        const key = `${row.itemName}|${Array.isArray(row.standards) ? row.standards[0] : row.standards}`;
        if (itemMap.has(key)) {
          itemMap.get(key).samples = row.samples;
        }
      });

      return updatedItems;
    })(),
    seamParameter:seamParameter.value,
    additionalRequire: additionalRequire.value,
    sampleDescription: sampleDescription.value,
    sampleDescripBoundSingle: sampleDescripBoundSingleDto.value,
    afterWash: afterWashs.value.map(item => item.testPoint + '-' + item.afterWash.join('-')),
    additionalItems: selectedItems.value
  };
  try {
    const response = await request.post('/buyer/parameter', payload,);
    emit('api-response', response.data)
    emit('submit', payload)
  } catch (error) {
    emit('api-error', {
      message: error.response?.data?.message || '请求失败',
      status: error.response?.status,
      error: error
    })
  }
};
// async function  getBuyerItemsParams(){
//   const rep = await request.get('/buyerItemParams', {
//     params: {
//       name: props.buyer,
//     }
//   });
//   if(rep.data.success){
//     testItems.value=rep.data.data.buyerItems
//   }else{
//     alert(rep.data.message)
//   }
// }
async function getPropertys() {
  const rep = await request.get('/render/sampledesc', {
    params: {
      buyername: globalFunctions.cleanAndLowercase(props.buyer),
    }
  });
  if (rep.data.success) {
    propertys.value = rep.data.data
  } else {
    alert(rep.data.message)
  }
}

onMounted(() => {
  // getBuyerItemsParams()
  getPropertys()
})

</script>

<style scoped lang="scss">
  /*去除表格标题和内容之间的空隙*/
  .removeTableGaps :deep(table){
    margin-bottom: 0 !important;
  }
  .sigma_btn-custom::before {
    background-color: #18086a;
  }
  .ItemParams{
    margin-top: 10px;
    padding: 10px;
    border: 1px dashed #ccc;
    border-radius: 4px;
  }
  .thisMulSelect :deep(.el-tag__close) {
    position: relative !important;
    top: auto !important;
    right: auto !important;
    transform: none !important;
  }
  .thisPiece{
    padding: 10px 15px 0 15px;
    margin-bottom: 5px;
    border: 1px solid #c8c2c2;
    border-radius: 5px;
  }
  .thisPadding{
    padding: 10px 10px 0 10px;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.6s;
  }

  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  .thisHr{
    margin-top: 5px;
    margin-bottom: 5px;
  }
  .oneGroup{
    @include column-flex-container();
    align-items: stretch;
    border: 1px solid #9f9c9c;
    border-radius: 4px;
    padding: 10px;
  }
  .blockContainer{
    @include column-flex-container();
    align-items: stretch;
  }
  .itemNameParam{
    font-size: 18px;
  }
</style>
