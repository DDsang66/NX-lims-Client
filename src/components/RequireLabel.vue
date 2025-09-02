<template>
  <WetCareLabel @updateData="handleWetCarelabelUpdate" />
  <div style="margin-top:15px">
    <FiberContent @confirm="handleRows" />
  </div>

  <div>
    <SampleDescripe @confirm="handleDescription" />
  </div>


  <div class="row">
    <div class="form-group col-xl-9 mb-0">
      <label>Additional Require</label>
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
  import { ref, defineComponent } from 'vue'
  import axios from 'axios'
  import WetCareLabel from '@/components/WetCareLabel.vue'
  import FiberContent from '@/components/FiberContent.vue'
  import SampleDescripe from '@/components/SampleDescripe.vue'

  const props = defineProps({
    buyer: String,
    orderNumber: String,
    menuName: String,
    reviewer: String,
    itemName: Array
  });


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
    const wetCareFields = Object.keys(wetCareData.value).reduce((acc, key) => {
      acc[key] = wetCareData.value[key];
      return acc;
    }, {});
    const payload = {
    ...wetCareFields,
    fiberComposition: fiberRows.value,
      buyer: props.buyer,
      reportNumber: props.orderNumber,
      menuName: props.menuName,
      reviewer: props.reviewer,
      itemName: props.itemName,
      additionalRequire: additionalRequire.value,
      sampleDescription: sampleDescription.value
  };
  try{
    const response = await axios.post('http://localhost:5051/api/buyer/parameter', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
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
</style>
