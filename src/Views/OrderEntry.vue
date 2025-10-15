<template>
  <div class="container-fluid" style="padding:3%">
    <div class="row">
      <div class="col-xl-5">
        <div style="border: 1px solid #cae2e8; padding: 20px;">
          <div class="row">
            <div class="form-group col-xl-8">
              <label>ReportNo.<span class="text-danger">*</span></label>
<!--              <input type="text" class="form-control" v-model="inputRow.reportNum" />-->
              <div style="display: flex">
                <input type="text" class="form-control" :value="reportNums.data1"  readonly style="width: 50px;"/>
                <div style="width: 55px">
                  <el-select v-model="reportNums.data2"
                             class="form-control custom-el-select no-arrow-elselect"
                             filterable
                             style="width: 55px;" >
                    <el-option value="405.">405.</el-option>
                    <el-option value="441.">441.</el-option>
                  </el-select>
                </div>
                <div style="width: 50px">
                  <el-select v-model="reportNums.data3"
                             class="form-control custom-el-select no-arrow-elselect"
                             filterable
                             style="width: 50px;" >
                    <el-option :value="twoDigitYear+'.'" ></el-option>
                    <el-option :value="twoDigitYear-1+'.'"></el-option>
                  </el-select>
                </div>
                <input type="text" class="form-control" v-model="reportNums.data4" style="width: 80px" @keydown="data4Keydown" @blur="data4Blur"/>
                <input type="text" class="form-control" v-model="reportNums.data5" style="width: 80px" />
              </div>
            </div>
            <div class="form-group col-xl-4">
              <label>OrderEntry<span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model.trim="inputRow.orderEntry" readonly />
            </div>
            <div class="form-group col-xl-4">
              <label>Due-Date<span class="text-danger">*</span></label>
              <input type="date" placeholder="出单时间" class="form-control" v-model="inputRow.dueDate" />
            </div>
            <div class="form-group col-xl-3">
              <label>CS<span class="text-danger">*</span></label>
              <el-select class="form-control custom-el-select" v-model="inputRow.cs" filterable placeholder="">
                <el-option v-for="cs in CSList" :key="cs.id" :value="cs.id" :label="cs.customerService1"></el-option>
              </el-select>
            </div>

            <div class="form-group col-xl-5">
              <label>Group<span class="text-danger">*</span></label>
              <el-select class="form-control custom-el-select" v-model="groups"
                         @change="groupsChange"
                         filterable multiple placeholder="" >
<!--                自定义头部-->
                <template #header>
                  <el-checkbox
                    v-model="checkAll"
                    :indeterminate="indeterminate"
                    @change="handleCheckAll"
                    style="width: 100%;"
                  >
                    All
                  </el-checkbox>
                </template>
                <el-option value="Physics">Physics</el-option>
                <el-option value="Wet">Wet</el-option>
                <el-option value="Fiber">Fiber</el-option>
                <el-option value="Flam">Flam</el-option>
              </el-select>
            </div>
            <div class="form-group col-xl-3">
              <label>Express<span class="text-danger">*</span></label>
              <el-select class="form-control custom-el-select" v-model="inputRow.express" filterable placeholder="">
                <el-option value="Regular" :disabled="regularDisable">Regular</el-option>
                <el-option value="Express" :disabled="expressDisable">Express</el-option>
                <el-option value="Shuttle" :disabled="shuttleDisable">Shuttle</el-option>
                <el-option value="Same Day">Same Day</el-option>
              </el-select>
            </div>
            <div class="form-group col-xl-8">
              <label>Lab-In<span class="text-danger">*</span></label>
              <div class="input-group">
                <input type="text" class="form-control" :value="formatTime(new Date(inputRow.labIn))" readonly />
                <div class="input-group-append">
                  <button class="sigma_btn-custom shadow-none btn-sm" style="background-color:#3364d5" @click="addRow">+</button>
                </div>
              </div>
            </div>
          </div>
<!--          展示表格-->
          <div class="row">
            <div class="form-group col-xl-12">
              <table class="sigma_responsive-table">
                <thead>
                  <tr><th>ReportNo.</th><th>Group</th><th>Due-Date</th><th style="width:40px;">Delete</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in rows" :key="idx">
                    <td :data-old-value="row.reportNum">
                      {{ row.reportNum }}
                    </td>
                    <td v-text="row.group"></td>
                    <td><input type="date"  class="form-control" v-model="row.dueDate"/></td>
                    <td style="text-align:center">
                      <button class="btn btn-link text-danger p-0" @click="removeRow(idx)">
                        ×
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- 结果 & 提交 -->
            <div class="form-group col-xl-8">
              <label>Remark</label>
              <input type="text" class="form-control" v-model="remark"/>
            </div>
            <div class="form-group col-xl-4">
              <label>action </label>
              <button class="sigma_btn-custom primary btn-block" style="background-color:#3364d5" @click="Confirm">Confirm</button>
            </div>
          </div>
        </div>
        </div>
        <div class="col-xl-7">
          <el-table class="removeTableGaps removeTableBorder" :data="todayReport"  max-height="626px" border>
            <el-table-column type="expand">
              <template #default="props">
                <div style="margin-left: 50px">
                  <el-table :data="props.row.groups">
                    <el-table-column label="group" prop="group" width="100"/>
                    <el-table-column label="Lab-In" width="100">
                      <template #default="scope">
                        {{formatTime(new Date(scope.row.labIn))}}
                      </template>
                    </el-table-column>
                    <el-table-column prop="dueDate" label="Due-Date" width="100"/>
                    <el-table-column prop="express" label="Express" width="90"/>
                    <el-table-column prop="remark" label="Remark" width="300"/>
                    <el-table-column prop="status" label="Status" width="100"></el-table-column>
                  </el-table>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="reportNum" label="ReportNo." />
            <el-table-column prop="orderEntry" label="OrderEntry" />
            <el-table-column prop="cs" label="CS" />
            <el-table-column prop="testGroups" label="Groups" >
            </el-table-column>
          </el-table>
        </div>
      </div>
  </div>
</template>

<script setup>
  import '@/assets/css/style.css';
  import { ref, reactive, watch, onMounted, onUnmounted,inject } from 'vue'

  // const emit = defineEmits(['confirm']);
  const authStore=inject('userAuthStore')
  const request = inject('request')

  //express禁选
  var expressDisable=ref(false)
  var regularDisable=ref(false)
  var shuttleDisable=ref(false)
//单号
  //两位年份
  var twoDigitYear=ref(new Date().getFullYear()%100)
  const reportNums=reactive({
    data1:'87.',
    data2:"405.",
    data3:twoDigitYear.value+'.',
    data4:'',
    data5:'.01',
  })
//今日进单
  const todayReport=ref([])
  const id=authStore.id

  //Group是否全选
  const checkAll = ref(false)
  //Group是否半选
  const indeterminate = ref(false)
  //定时器
  var timer=null;
  //第一个定时器
  var firstTimeout=null;
    /* 输入行 */
  const inputRow = reactive({
    reportNum:'',
    orderEntry:'',
    express:'',
    dueDate:'',
    cs:'',
    group:'',
    labIn:new Date(),
  })
  //CS列表
  var CSList=ref( [])
  //多选group
  const groups=ref([])
  //remark
  const remark = ref('')

  /* 进单数据 */
  var rows = reactive([])
  /* group数组 */
  const groupSelectList=['Physics','Wet','Fiber','Flam']

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
  //获取CSList
  const getCSList = async () => {
    const res = await request.get('/search/getCs')
      if(res.data.success){
        CSList.value=res.data.data
      }else{
        alert(res.data.message)
      }
  }
  /*group选择修改时触发事件*/
  const groupsChange = () => {
    groups.value.sort((a,b)=>{return groupSelectList.indexOf(a)-groupSelectList.indexOf(b) })
  }

  // 格式化为: 2025-09-07 16:45
  const formatTime = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')  // 月份从0开始，+1
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
  /* 添加行 */
  function addRow() {
    // console.log("dueDate:"+inputRow.dueDate)
    // console.log(inputRow.labIn)
    inputRow.reportNum=reportNums.data1+reportNums.data2+reportNums.data3+reportNums.data4+reportNums.data5
    inputRow.labIn=new Date()
    // console.log(inputRow.labIn)
    //判断inputRow的任何部分为空
    if(!inputRow.reportNum||!inputRow.express||!inputRow.dueDate||!inputRow.cs||!groups.value){
      alert('Please fill in all fields.')
    }else{
      //备份初始状态
      let originalRows=[...rows]
      //存储重复数据
      let duplicateRows=[]
      for (const group of groups.value) {
        let rowAdd={...inputRow, group: group}
        //判断重复
        if(!isRowsContain(rows, rowAdd)){
          rows.push(rowAdd)
          // console.log(rowAdd)
        }
        else
          duplicateRows.push(group)
      }
      if(duplicateRows.length>0){
        alert('The report with reportNumber '+inputRow.reportNum+' and Group '+duplicateRows.join(',')+' already exists, adding failed.')
        rows.length=0
        rows.push(...originalRows)
      }
    }
  }
  //简易判断数组是否包含某个对象
  // function isObjectContain(rows, obj) {
  //   for (const row of rows) {
  //     if(JSON.stringify(row)===JSON.stringify(obj))
  //       return true
  //   }
  //   return false
  // }
  //判断订单数组是否包含某订单
  function isRowsContain(rows, row1) {
    for (const row of rows) {
      if(row.reportNum===row1.reportNum&&row.group===row1.group)
        return true
    }
    return false
  }
  //删除行
  function removeRow(idx) {
    rows.splice(idx, 1);
  }
//进单提交
  async function Confirm() {
    try {
      if(rows.length===0){
        alert('Please add at least one order.')
        return
      }
      // console.log(rows)
      const res=await request.post('/order/add', {rows: rows, id: id,remark:remark.value})
      if(res.data.success){
        //清空rows
        rows.length=0
        //刷新右侧列表
        await getTodayReport()
        // ElMessage.success('Submission successful!')
        alert('Submission successful!');
      }
      else alert('Submission failed!');
    } catch (e) {
      console.error(e);
    }
  }
  //获取今日进单
  async function getTodayReport() {
    const res=await request.get('/order/getorder',{params:{userId:authStore.id}})
    if(res.data.success){
      todayReport.value=res.data.data
      // console.log(todayReport.value)
    }else alert(res.data.message)
  }

  //group全选
  const handleCheckAll = () => {
    indeterminate.value = false
    if (groups.value.length===0) {
      groups.value = ['Physics', 'Wet', 'Fiber', 'Flam']
    } else {
      groups.value = []
    }
  }

//监听日期，限制express
  watch(()=>{
    let dueDate =new Date(inputRow.dueDate)
    let labIn = new Date(inputRow.labIn)
    return Math.ceil((dueDate-labIn) / (1000 * 60 * 60 * 24))+1;
  }, (days) => {
    shuttleDisable.value   = days <= 2
    expressDisable.value   = days <= 3
    regularDisable.value   = days <= 4
    const disableMap={
      Shuttle: shuttleDisable.value,
      Express: expressDisable.value,
      Regular: regularDisable.value
    }
    if(disableMap[inputRow.express]){
      inputRow.express=''
      alert('Please select an allowed Express.')
    }
  })
//监听group
  watch(groups, (val) => {
    if (val.length === 0) {
      checkAll.value = false
      indeterminate.value = false
    } else if (val.length === 4) {
      checkAll.value = true
      indeterminate.value = false
    } else {
      indeterminate.value = true
    }
  })
  onMounted(() => {

    //获取今日进单
    getTodayReport()
    //立即获取当前时间
    const now = new Date()
    inputRow.labIn = now
    const delay = (60 - now.getSeconds()) * 1000 // 毫秒
    // 先等待到下一个整分钟
    firstTimeout = setTimeout(() => {
      //刷新
      inputRow.labIn=new Date()
      // 开始每分钟执行一次
      timer = setInterval(()=>inputRow.labIn=new Date(), 60000)
    }, delay)
    //获取user并赋值给orderEntry
    inputRow.orderEntry=authStore.user
    //获取CSList
    getCSList()
    //获取

  })

  onUnmounted(() => {
    //存在则清楚计时器
    //立即清除
    if(firstTimeout) clearTimeout(firstTimeout)
    if (timer) clearInterval(timer)
  })
</script>

<style scoped>
  .sigma_btn-custom::before {
    background-color: #18086a;
  }

  .form-control {
      border-radius:0;
      border-color:#a3a3a3
  }
  /*自定义el-select的样式*/
  .custom-el-select {
    padding: 0;
  }
  .custom-el-select :deep(.el-select__wrapper){
    height: 100% ;
    box-shadow:none !important;
  }
  /*自定义el-select的下箭头的样式*/
  .custom-el-select :deep(svg){
    color: #0e2a47;
  }
  /*恢复删除按钮*/
  .form-group :deep(.el-tag__close) {
    position: relative !important;
    top: auto !important;
    right: auto !important;
    transform: none !important;
  }
  /*去除选择框箭头*/
  .no-arrow-elselect :deep(.el-select__suffix) {
    display: none !important;
  }
  /*去除表格标题和内容之间的空隙*/
  .removeTableGaps :deep(table){
    margin-bottom: 0 !important;
  }
  /*去除表格的边框*/
  .removeTableBorder :deep(table){
    border: none !important;
  }
  /*设置单元格的右侧边框*/
</style>
