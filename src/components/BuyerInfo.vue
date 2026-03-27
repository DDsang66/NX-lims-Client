<template>
  <section style="margin-bottom: 10px">
    <!-- Buyer 标题区 -->
    <div style="border: 1px solid #cae2e8; border-bottom: 2px solid #3364d5; padding: 10px 20px; background-color: #f5f7fa;">
      <label style="font-size: 40px; font-weight: bold; color: #3364d5;">{{buyer}}</label>
    </div>

    <!-- 表单区 -->
    <div style="border: 1px solid #cae2e8; border-top: none; padding: 15px;">
      <el-form class="firstForm" label-width="100px">

        <!-- 第一行：Report Number | Addition Item -->
        <div style="display: flex; align-items: center;">
          <!-- 左侧：Report Number -->
          <div style="display: flex; align-items: center; flex: 1;">
            <el-form-item style="margin-bottom: 0;">
              <template #label>
                <label style="font-size: 16px">{{$t('reportNumber')}}</label>
              </template>
              <el-input v-model="reportNums.data1" style="width: 50px;" :size="size" disabled></el-input>
              <el-select v-model="reportNums.data2"
                         filterable
                         :size="size"
                         style="width: 80px;">
                <el-option value="405.">405.</el-option>
                <el-option value="441.">441.</el-option>
              </el-select>
              <el-select v-model="reportNums.data3"
                         :size="size"
                         filterable
                         style="width: 75px;">
                <el-option :value="twoDigitYear+'.'"></el-option>
                <el-option :value="twoDigitYear-1+'.'"></el-option>
              </el-select>
              <el-input v-model="reportNums.data4" style="width: 80px;" :size="size" @keydown="data4Keydown" @blur="data4Blur"></el-input>
              <el-input v-model="reportNums.data5" style="width: 60px;" :size="size"></el-input>
            </el-form-item>
          </div>

          <!-- 中间：垂直分割线 -->
          <div style="width: 1px; height: 40px; background-color: #e0e0e0; margin: 0 20px;"></div>

          <!-- 右侧：Addition Item -->
          <div style="display: flex; align-items: center; flex: 1;">
            <el-form-item style="margin-bottom: 0;">
              <template #label>
                <label style="font-size: 16px; white-space: nowrap;">Addition Item</label>
              </template>
              <el-select v-model="form.additionItem" style="width: 300px;" :size="size">
                <el-option value=""></el-option>
                <el-option v-for="item in additionItems" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>

        <div style="display: flex; align-items: center; margin-top: 15px;">
          <!-- 左侧：Menu + Reload -->
          <div style="display: flex; align-items: center; flex: 1;">
            <el-form-item style="margin-bottom: 0;">
              <template #label>
                <label style="font-size: 16px">{{$t('set Menu')}}</label>
              </template>
              <!-- 修改点 1: 添加 multiple 属性 -->
              <!-- 修改点 2: 建议添加 collapse-tags 以防止选项过多时占用太多空间 -->
              <el-select v-model="form.menuName"
                         style="width: 250px; margin-right: 5px;"
                         :size="size"
                         multiple
                         collapse-tags
                         @change="submitForm">
                <el-option v-for="m in menuName" :key="m.value" :value="m.value" :label="m.label"></el-option>
              </el-select>
              <el-button @click="submitForm" :size="size">Load Menu</el-button>
            </el-form-item>
          </div>

          <!-- 中间：垂直分割线 -->
          <div style="width: 1px; height: 40px; background-color: #e0e0e0; margin: 0 20px;"></div>

          <!-- 右侧：Standard -->
          <div style="display: flex; align-items: center; flex: 1;">
            <el-form-item style="margin-bottom: 0;">
              <template #label>
                <label style="font-size: 16px">Standard</label>
              </template>
              <el-select v-model="form.standard" style="width: 300px;" :size="size">
                <el-option value=""></el-option>
                <el-option v-for="s in standards" :key="s.value" :value="s.value" :label="s.label"></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>

      </el-form>
    </div>

  </section>
</template>

<script setup>
import {ref, watch, inject, reactive} from 'vue'
  import globalFunctions from "@/utils/globalFunctions.js";

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

  //elementPlus组件的size
const size='large'
  //两位年份
  var twoDigitYear=ref(new Date().getFullYear()%100)
  const reportNums=reactive({
    data1:'87.',
    data2:"405.",
    data3:twoDigitYear.value+'.',
    data4:'',
    data5:'.01',
  })

  // 定义emit事件 - 修正了事件名称
  const emit = defineEmits(['submit', 'api-response', 'api-error', 'field-change'])

  // 表单数据 - 修正了变量名一致性
  const form = ref({
    reportNumber: '',
    reviewer: props.reviewer,
    buyer: props.buyer,
    menuName: [],
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

  //失去焦点，判断四位数
  function data4Blur(){
    //先判断为空
    if(!reportNums.data4)
      return
    //先判断数字
    if(!/^\d+$/.test(reportNums.data4)){
      reportNums.data4=''
      alert('Please enter a pure number in the fourth item of the report number.')
    }else{
      //先转为数字，再转回字符串。以此去掉0
      reportNums.data4=String(Number(reportNums.data4))
      //不到四位则补零
      if(reportNums.data4.length<4){
        reportNums.data4=String(reportNums.data4).padStart(4,'0')
      }
    }
  }

  //按下enter
  function data4Keydown(e){
    // 检测是否按下了 Enter 键
    if (e.key === 'Enter') {
      // 阻止默认行为（换行）
      e.preventDefault();
      // 让当前元素失去焦点，触发 @blur
      e.target.blur();
    }
  }

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

  //监听分段单号的变化，拼装为完整单号
  watch(reportNums,()=>{
    form.value.reportNumber=reportNums.data1+reportNums.data2+reportNums.data3+reportNums.data4+reportNums.data5
  })


  const submitForm = async () => {
    console.log('form.value structure:', JSON.parse(JSON.stringify(form.value)));
    try {
      const currentMenu = form.value.menuName || [];
      // 1. 将数组转换为字符串 (例如 ['A', 'B'] -> "A,B")
      const menuString = form.value.menuName.join(',');

      console.log('menuString:', menuString);
      // 2. 构造参数对象
      // 注意：这里使用展开运算符 ...form.value 会包含原始的数组 menuName
      // 所以我们需要显式地覆盖它为 menuString
      const params = {
        ...form.value,
        buyer: globalFunctions.cleanAndLowercase(form.value.buyer),
        menuName: menuString // <--- 关键修改：覆盖为数组转换后的字符串
      };

      // 3. 发送请求
      const response = await request.post('/buyer/confirm', params);

      // console.log('API Response:', response.data);
      emit('api-response', response.data);
      emit('submit', response.data);

    } catch (error) {
      emit('api-error', {
        message: error.response?.data?.message || '请求失败',
        status: error.response?.status,
        error: error
      });
    }
  };
</script>

<style lang="scss" scoped>
  .sigma_btn-custom::before {
    background-color: #18086a;
  }
/*  .firstForm{
    @include column-left-flex-container
  }
  .firstForm > div{
    @include line-left-flex-container;
  }*/
</style>
