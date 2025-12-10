<template>
  <!-- Order Details -->
  <div class="order-details">
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
import {ref, inject, h} from 'vue'
  import {ElMessage, ElNotification} from "element-plus";
  import {Loading} from "@element-plus/icons-vue";
import globalFunctions from "@/utils/globalFunctions.js";

const request = inject('request')
const emit = defineEmits(['submit', 'api-response', 'api-error'])
  const notificationInstance = ref(null)
// 响应式数据
const masterName   = ref('')
const finishingTime= ref('')
const cvv          = ref(null)
  var canPrint=true
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
      types: row.types ? row.types.join(', ') : '',
      extra: row.extra || null
    }));
  const form =
  {
    ReportNumber: props.orderNumber,
    MenuName: props.menuName,
    Reviewer: props.reviewer,
    Buyer: globalFunctions.cleanAndLowercase(props.buyer),
    AdditionalRequire: props.additionalRequire,
    SampleDescription: props.sampleDescription,
    SelectedRows: processedRows
  }
  if(canPrint){
    try {
      ElMessage.primary('Start downloading.')
      showPersistentLoadingNotification()
      canPrint=false
      const response = await request.post('/receivedata/showExcel', form,
        {
          responseType: 'blob', //axios 返回二进制流
        });
      canPrint=true
      closeNotification()
      if(response.status===200){
        ElMessage.success('Download successful!')
      }else {
        ElMessage.error('Download failed!')
      }
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
      ElMessage.error('Download failed!')
      closeNotification()
      canPrint=true
      emit('api-error', {
        message: error.response?.data?.message || '请求失败',
        status: error.response?.status,
        error: error
      })
    }
  }
}
  const showPersistentLoadingNotification = () => {
    // 先关闭已存在的
    if (notificationInstance.value) {
      notificationInstance.value.close()
    }

    // 创建一个自定义图标的 Notification
    notificationInstance.value = ElNotification({
      title: 'Downloading',
      message: 'The file is downloading.',
      duration: 0,
      showClose: false,
      position: 'top-right',
      // 关键：传入一个带旋转动画的图标组件
      icon: () => h(Loading, { style: 'animation: rotate 1.5s linear infinite;' })
    })
  }

  const closeNotification = () => {
    if (notificationInstance.value) {
      notificationInstance.value.close()
      notificationInstance.value = null
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
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
