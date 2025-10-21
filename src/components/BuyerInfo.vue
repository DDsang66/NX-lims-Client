<template>
  <section>
    <h3>{{buyer}}</h3>

    <div class="row">
      <!-- 报告号 -->
      <div class="form-group col-xl-6">
        <label>{{$t('reportNumber')}}<span class="text-danger">*</span></label>
        <input v-model="form.reportNumber"
               type="text"
               placeholder="报告号"
               class="form-control"
               required />
      </div>

      <!-- 审核人 -->
      <div class="form-group col-xl-6">
        <label>{{ $t('reviewer') }}<span class="text-danger">*</span></label>
        <input v-model="form.reviewer"
               type="text"
               placeholder="审核人"
               class="form-control"
               readonly />
      </div>

      <!-- 公司名称（只读） -->
      <div class="form-group col-xl-12">
        <input v-model="form.buyer"
               type="text"
               placeholder="Buyer Name"
               class="form-control"
               readonly />
      </div>

      <!-- 菜单选择 -->
      <div class="form-group col-xl-12">
        <label>{{ $t('set Menu') }}<span class="text-danger">*</span></label>
        <select v-model="form.menuName" class="form-control">
          <option value="">Select a Menu</option>
          <option v-for="m in menuName" :key="m.value" :value="m.value">
            {{ m.label }}
          </option>
        </select>
      </div>
      <!-- 备注 -->
      <div class="form-group col-xl-12 mb-0">
        <label>{{ $t('remark') }}</label>
        <textarea v-model="form.remark"
                  rows="5"
                  class="form-control"
                  placeholder="Order Notes (Optional)"></textarea>
      </div>

      <!-- 额外项目 -->
      <div class="form-group col-xl-3">
        <label>{{$t('extraItem')}}</label>
        <select v-model="form.extraItem" class="form-control">
          <option value="">Select</option>
          <option v-for="e in extraItems" :key="e.value" :value="e.value">
            {{ e.label }}
          </option>
        </select>
      </div>

      <!-- 标准 -->
      <div class="form-group col-xl-6">
        <label>{{$t('standard')}}</label>
        <select v-model="form.standard" class="form-control">
          <option value="">Select a Standard</option>
          <option v-for="s in standards" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>
      </div>

      <!-- 提交按钮 -->
      <div class="form-group col-xl-3">
        <label>action</label>
        <button type="button"
                style="background-color: #3364d5"
                class="sigma_btn-custom primary btn-block"
                @click="submitForm">
          Confirm
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, watch,inject} from 'vue'

  const request= inject('request')
  // 定义接收的props
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
      type: Array,
      required: true,
      default: () => []
    }
  })

  // 定义emit事件 - 修正了事件名称
  const emit = defineEmits(['submit', 'api-response', 'api-error', 'field-change'])

  // 表单数据 - 修正了变量名一致性
  const form = ref({
    reportNumber: '',
    reviewer: props.reviewer,
    buyer: props.buyer,
    menuName: '',
    remark: '',
    extraItem: '',
    standard: ''
  })

  // 其他选项数据
  const extraItems = ref([
    { value: 'item1', label: '额外项目1' },
    { value: 'item2', label: '额外项目2' }
  ])

  const standards = ref([
    { value: 'std1', label: '标准1' },
    { value: 'std2', label: '标准2' }
  ])


  // 监听表单字段变化
  watch(
    () => [
      form.value.reportNumber,
      form.value.reviewer,
      form.value.buyer,
      form.value.menuName
    ],
    ([newReportNumber, newReviewer, newBuyer, newMenuName]) => {
      emit('field-change', {
        reportNumber: newReportNumber,
        reviewer: newReviewer,
        buyer: newBuyer,
        menuName: newMenuName
      })
    },
    { deep: true }
  )


  // 提交方法 - 修正了变量名和逻辑
  const submitForm = async () => {
    try {
      //直接调用API - 修正了变量名 formData → form
      const response = await request.post('/buyer/confirm', form.value)
      console.log('API Response:', response.data);
      // 将完整API响应发送给父组件
      emit('api-response', response.data)
      emit('submit', response.data)

    } catch (error) {
      //将错误信息发送给父组件
      emit('api-error', {
        message: error.response?.data?.message || '请求失败',
        status: error.response?.status,
        error: error
      })
    }
  }
</script>

<style scoped>
  .sigma_btn-custom::before {
    background-color: #18086a;
  }
</style>
