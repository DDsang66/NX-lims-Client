<template>
  <!-- Order Details -->
  <div class="order-details">
    <div class="form-group">
      <label>Card Number</label>
      <input type="text"
             class="form-control"
             name="master-number"
             placeholder="Card Number"
             readonly />
    </div>

    <!--<div class="form-group">
      <label>N/A</label>
      <input type="text"
             class="form-control"
             name="master-name"
             placeholder="N/A"
             v-model="masterName" />
    </div>-->

    <div class="row">
      <div class="col-xl-6 form-group">
        <label>Finishing Time</label>
        <input type="datetime-local"
               class="form-control"
               name="master-expiry"
               id="FinishingTime"
               v-model="finishingTime" />
      </div>

      <div class="col-xl-6 form-group">
        <label>Barcode*</label>
        <input type="number"
               class="form-control"
               name="master-cvv"
               placeholder="Barcode"
               min="0"
               v-model.number="cvv"
               readonly/>
      </div>
    </div>

    <p class="small">
      The order information you reviewed will be saved to the database, please
      confirm that all the information is correct before submitting. Thank you
      for your efforts!
    </p>
    <p class="small">
      If you have a bug submission, you can submit a bug report
      <a class="btn-link" href="#">here.</a>
    </p>

    <div class="row">
      <div class="col-xl-6 form-group">
        <button type="button"
                style="background-color:#3364d5"
                class="sigma_btn-custom primary btn-block"
                @click="submitData">
          Print
        </button>
      </div>

      <div class="col-xl-6 form-group">
        <button type="button"
                style="background-color:#3364d5"
                class="sigma_btn-custom primary btn-block"
                @click="pageReload">
          Finish?
        </button>
      </div>
    </div>
  </div>
  <!-- Order Details End -->
</template>

<script setup>
  import { ref, defineProps, defineEmits,inject} from 'vue'

const request = inject('request')
const emit = defineEmits(['submit', 'api-response', 'api-error'])
// 响应式数据
const masterName   = ref('')
const finishingTime= ref('')
const cvv          = ref(null)

  const props = defineProps({
    buyer: {
      type: String,
      required: true
    },
    reviewer: {
      type: String,
      required: true
    },
    menuName: {
      type: String,
      required: true,
    },
    additionalRequire: {
    type: String,
    required: true,
    },
    sampleDescription: {
      type: String,
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    selectedRows: {
      type: Array,
      required: true,
      default: () => []
    }
  })


  const submitData = async() => {
    const processedRows = (props.selectedRows || []).map(row => ({
      ...row,
      standards: row.standards ? row.standards.join(', ') : '',
      types: row.types ? row.types.join(', ') : ''
    }));
  const form =
  {
    ReportNumber: props.orderNumber,
    MenuName: props.menuName,
    Reviewer: props.reviewer,
    Buyer: props.buyer,
    AdditionalRequire: props.additionalRequire,
    SampleDescription: props.sampleDescription,
    SelectedRows: processedRows
  }

  try {
    const response = await request.post('/receivedata/showExcel', form,
      {
        responseType: 'blob', //axios 返回二进制流
      });

    const blob = new Blob([response.data], { type: 'application/zip' });
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition
      ?.split('filename=')[1]
      ?.replace(/"/g, '') || 'report.zip';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    emit('api-response', response.data)
    emit('submit', response.data)
  }
  catch (error) {
    emit('api-error', {
      message: error.response?.data?.message || '请求失败',
      status: error.response?.status,
      error: error
    })
  }
}

const pageReload = () => {
  location.reload()
}
</script>

<style scoped>
  .sigma_btn-custom::before {
    background-color: #18086a;
  }
</style>
