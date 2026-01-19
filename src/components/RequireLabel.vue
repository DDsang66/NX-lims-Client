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
          {{ $t('additionalRequire') }}
        </a>
      </div>
      <transition name="fade" style="margin-bottom: 10px">
        <div v-show="additionalReqIsOpen">
          <div class="line-left-flex-container">
            <el-text :size="size">TestItems</el-text>
            <el-select :size="size" multiple style="width: 300px" v-model="selectedItemNames" class="thisMulSelect">
              <el-option v-for="item in testItems" :key="item.name" :label="item.name" :value="item.name"></el-option>
            </el-select>
            <el-button :size="size" @click="OpenParams">Parameter Input</el-button>
          </div>
          <div v-if="itemParamsIsOpen">
            <div class="ItemParams"  v-for="item in selectedItems" :key="item">
              <el-text :size="size">{{item.name}}</el-text>
              <div class="column-flex-container" style="align-items:flex-start ">
                <div v-for="param in item.params" :key="param.name">
                  <div class="line-left-flex-container">
                    <el-text :size="size">{{param.name}}</el-text>
                    <el-input style="width: 300px" :size="size" v-if="param.type==='input'" v-model="param.value"></el-input>
                    <el-select v-else-if="param.type==='select'" style="width: 300px;" :size="size" v-model="param.value">
                      <el-option v-for="option in param.options" :key="option" :label="option" :value="option"></el-option>
                    </el-select>
                    <el-select v-else style="width: 300px" :size="size" v-model="param.value" multiple>
                      <el-option v-for="option in param.options" :key="option" :label="option" :value="option"></el-option>
                    </el-select>
                  </div>
                </div>
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
  const sampleDescrip=ref(null)
  const sampleDescripBoundSingle=ref(null)
  const testItems=ref()
  const selectedItemNames=ref([])
  const selectedItems=ref([])
  const additionalReqIsOpen=ref(true)
  const size='large'
  const itemParamsIsOpen=ref(false)

  const afterWashs = ref([]);
  const wetCareData = ref({});   // 保存 WetCareLabel 数据
  const fiberComposition   = ref([]);   // 保存 FiberContent 数据
  const fiberCompositionSingle = ref([]);
  const additionalRequire = ref('');
  // const sampleDescription = ref('');
  const propertys=ref([])


  const {t}=useI18n()
  // const additionalRequireLabel=t('additionalRequire')
  const handleWetCarelabelUpdate = (data) => {
  wetCareData.value = data;
};
  function OpenParams(){
    itemParamsIsOpen.value=true
    const map = new Map(testItems.value.map(item => [item.name, item]))
    selectedItems.value=selectedItemNames.value.map(name => map.get(name)).filter(Boolean)
    // console.log(selectedItems.value)
  }
  function toggleNotice() {
    additionalReqIsOpen.value = !additionalReqIsOpen.value;
  }
  const handleRows = (fiberCom)=> {
    // console.log('fiber',fiberCom)
    fiberComposition.value = fiberCom;
  };
  const handleRowsSingle = (fiberCom)=> {
    // console.log('fiber',fiberCom)
    fiberCompositionSingle.value = fiberCom;
  };
  // const handleDescription = (data) => {
  //   sampleDescription.value = data;
  // };


const emit = defineEmits(['submit', 'api-response', 'api-error'])
const confirmAction = async () => {
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
  let sampleDescripBoundSingleDto
  if(['Primark', 'OVS'].includes(props.buyer)){
    //sampleDescripBoundSingleDto
    sampleDescripBoundSingleDto = (() => {
      if (!['Primark', 'OVS'].includes(props.buyer))
        return null
      return sampleDescripBoundSingle.value.descripGroups.flatMap(group => {
        let descrips = []
        group.samples.forEach(sample => {
          descrips.push({sample: sample, description:  JSON.parse(JSON.stringify(group.propertyTable))})
        })
        return descrips
      })
    })()
    //获取样品set
    let sampleSet = new Set()
    let hasDuplicated = false
    sampleDescripBoundSingleDto.forEach(descrip => {
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
    sampleDescripBoundSingleDto = sampleDescripBoundSingleDto.map(descrip => {
      descrip.description.forEach(item => {
        if (item.type === 'Multiple'&&Array.isArray(item.value)){
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
    items: (()=> {
      let items=props.items
      let selectedRows=props.selectedRows
      // 将 items 转为可快速查找的 Map，key 为 `${itemName}|${standards}`
      const itemMap = new Map();
      const updatedItems = [];

      // 初始化 Map 并保留原始顺序（如果需要）
      items.forEach((item) => {
        const key = `${item.itemName}|${item.standards}`;
        itemMap.set(key, { ...item, samples: '' }); // 初始化 samples 为空字符串
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
    additionalRequire: additionalRequire.value,
    sampleDescription: (() => {
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
    })(),
    sampleDescripBoundSingle: sampleDescripBoundSingleDto,
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
async function getPropertys(){
  const rep = await request.get('/render/sampledesc', {
    params: {
      buyername: globalFunctions.cleanAndLowercase(props.buyer),
    }
  });
  if(rep.data.success){
    propertys.value=rep.data.data
  }else{
    alert(rep.data.message)
  }
}
onMounted(()=>{
  // getBuyerItemsParams()
  getPropertys()
})

</script>

<style scoped>
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
</style>
