<template>
  <div class="thisPadding">
    <div class="thisPiece">
      <WetCareLabel @updateData="handleWetCarelabelUpdate" :afterWashs="afterWashs"/>
    </div>
  </div>
  <div class="thisPadding">
    <div class="thisPiece">
      <FiberContent @confirm="handleRows" />
    </div>
  </div>

  <div class="thisPadding">
    <div class="thisPiece">
      <SampleDescripe ref="sampleDescrip" :propertys="propertys" />
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

  const request = inject('request');
  const props = defineProps({
    buyer: String,
    orderNumber: String,
    menuName: String,
    reviewer: String,
    items: Array
  });
  const sampleDescrip=ref(null)
  const testItems=ref()
  const selectedItemNames=ref([])
  const selectedItems=ref([])
  const additionalReqIsOpen=ref(true)
  const size='large'
  const itemParamsIsOpen=ref(false)

  const afterWashs = ref([]);
  const wetCareData = ref({});   // 保存 WetCareLabel 数据
  const fiberRows   = ref([]);   // 保存 FiberContent 数据
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
  const handleRows = (rows)=> {
   fiberRows.value = rows;
  };

  // const handleDescription = (data) => {
  //   sampleDescription.value = data;
  // };


const emit = defineEmits(['submit', 'api-response', 'api-error'])
  const confirmAction = async () => {
  // console.log(selectedItems.value)
    const wetCareFields = Object.keys(wetCareData.value).reduce((acc, key) => {
      acc[key] = wetCareData.value[key];
      return acc;
    }, {});
    if(afterWashs.value.some(item =>!item.testPoint)){
      return alert('Please fill in the Sample')
    }
    const payload = {
    ...wetCareFields,
    fiberComposition: fiberRows.value,
      buyer: globalFunctions.cleanAndLowercase(props.buyer),
      reportNumber: props.orderNumber,
      menuName: props.menuName,
      reviewer: props.reviewer,
      items: props.items,
      additionalRequire: additionalRequire.value,
      sampleDescription: (()=>{
        let mountDescription = '';
        // console.log(sampleDescrip.value.propertyTable)
        for(let property of sampleDescrip.value.propertyTable){
          //拼接
          if (property.type==='Input'||property.type==='Single'){
            mountDescription+='-'+property.value
          }else{
            mountDescription+='-'+property.value.join('-')
          }
        }
        return mountDescription.substring(1)
      })(),
      afterWash:afterWashs.value.map(item => item.testPoint+'-'+item.afterWash.join('-')),
      additionalItems: selectedItems.value
  };
  try{
    // console.log(payload)
    const response = await request.post('/buyer/parameter', payload, );
      emit('api-response', response.data)
      emit('submit', payload)
  }
  catch(error){
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
async function getSampleDescription(){

}
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
