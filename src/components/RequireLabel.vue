<template>
  <div style="padding: 20px;padding-bottom: 0">
    <WetCareLabel @updateData="handleWetCarelabelUpdate" :afterWashs="afterWashs"/>
  </div>
  <div class="thisPadding">
    <div class="thisPiece">
      <FiberContent @confirm="handleRows" />
    </div>
  </div>

  <div class="thisPadding">
    <div class="thisPiece">
      <SampleDescripe @confirm="handleDescription" />
    </div>

  </div>


  <div class="row">
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
import {ref, defineComponent, inject, computed} from 'vue'
  import WetCareLabel from '@/components/WetCareLabel.vue'
  import FiberContent from '@/components/FiberContent.vue'
  import SampleDescripe from '@/components/SampleDescripe.vue'

  const request = inject('request');
  const props = defineProps({
    buyer: String,
    orderNumber: String,
    menuName: String,
    reviewer: String,
    itemName: Array
  });

  const afterWashs = ref([]);
  const wetCareData = ref({});   // 保存 WetCareLabel 数据
  const fiberRows   = ref([]);   // 保存 FiberContent 数据
  const additionalRequire = ref('');
  const sampleDescription = ref('');
  const handleWetCarelabelUpdate = (data) => {
  wetCareData.value = data;
};
  const handleRows = (rows)=> {
   fiberRows.value = rows;
  };

  const handleDescription = (data) => {
    sampleDescription.value = data;
  };


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
      buyer: props.buyer,
      reportNumber: props.orderNumber,
      menuName: props.menuName,
      reviewer: props.reviewer,
      itemName: props.itemName,
      additionalRequire: additionalRequire.value,
      sampleDescription: sampleDescription.value,
      afterWash:afterWashs.value.map(item => item.testPoint+'-'+item.afterWash.join('-'))
  };
  try{
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
