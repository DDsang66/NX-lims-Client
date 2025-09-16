<template>
  <Header />

  <div class="container-fluid" style="padding:3%">
    <div class="row">
      <div class="col-xl-5">
        <div style="border: 1px solid #cae2e8; padding: 20px;">
          <div class="row">
            <div class="form-group col-xl-4">
              <label>ReportNo.<span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model="inputRow.reportNum" />
            </div>
            <div class="form-group col-xl-4">
              <label>OrderEntry<span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model.trim="inputRow.orderEntry" readonly />
            </div>
            <div class="form-group col-xl-4">
              <label>Express<span class="text-danger">*</span></label>
              <select class="form-control" v-model="inputRow.express">
                <option value="Regular">Regular</option>
                <option value="Express">Express</option>
                <option value="Shuttle">Shuttle</option>
                <option value="Same Day">Same Day</option>
              </select>
            </div>
            <div class="form-group col-xl-6">
              <label>Due-Date<span class="text-danger">*</span></label>
              <input type="datetime-local" placeholder="出单时间" class="form-control" v-model="inputRow.dueDate" />
            </div>
            <div class="form-group col-xl-3">
              <label>CS<span class="text-danger">*</span></label>
              <select class="form-control" v-model="inputRow.CS">
                <option value="Regular">Regular</option>
                <option value="Express">Express</option>
                <option value="Shuttle">Shuttle</option>
                <option value="Same Day">Same Day</option>
              </select>
            </div>

            <div class="form-group col-xl-3">
              <label>Group<span class="text-danger">*</span></label>
              <select class="form-control" v-model="inputRow.group">
                <option value="All">All</option>
                <option value="Physics">Physics</option>
                <option value="Wet">Wet</option>
                <option value="Fiber">Fiber</option>
                <option value="Flam">Flam</option>
              </select>
            </div>
            <div class="form-group col-xl-11">
              <label>Lab-In<span class="text-danger">*</span></label>
              <div class="input-group">
                <input type="text" class="form-control" :value="formatTime(inputRow.labIn)" readonly />
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
                    <td><input type="datetime-local"  class="form-control" v-model="row.dueDate"/></td>
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
          <div ref="tableRef" style="height:100%;width:100%;"></div>
        </div>
      </div>
  </div>
  <Footer />
</template>

<script setup>
  import Header from '@/components/Layout/Header.vue'
  import Footer from '@/components/Layout/Footer.vue'
  import '@/assets/css/style.css';
  import { ref, reactive, computed, watch, onMounted, onUnmounted,inject } from 'vue'
  import { ListTable, PivotTable, TYPES, themes } from '@visactor/vtable';
  import * as VTable from '@visactor/vtable'

  // const emit = defineEmits(['confirm']);
  const authStore=inject('userAuthStore')
  const request = inject('request')

  const id=authStore.id
  /* 折叠开关 */
  const isNoticeOpen = ref(false)
  function toggleNotice() {
    isNoticeOpen.value = !isNoticeOpen.value;
  }
  //定时器
  var timer=null;
  //第一个定时器
  var firstTimeout=null;
    /* 输入行 */
  const inputRow = reactive({
    reportNum:'',
    orderEntry:'',
    express:'',
    dueDate:null,
    CS:'',
    group:'',
    labIn:new Date(),
  })
  //remark
  const remark = ref('')

  /* 表格数据 */
  const rows = reactive([])

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
    //判断inputRow的任何部分为空
    if(!inputRow.reportNum||!inputRow.express||!inputRow.dueDate||!inputRow.CS||!inputRow.group){
      alert('Please fill in all fields.')
    }
    if(inputRow.group==='All'){
      rows.push({...inputRow,group:'Physics'})
      rows.push({...inputRow,group:'Wet'})
      rows.push({...inputRow,group:'Fiber'})
      rows.push({...inputRow,group:'Flame'})
    }else{
      rows.push({...inputRow})
    }
  }
  //删除行
  function removeRow(idx) {
    rows.splice(idx, 1);
  }
//进单提交
//   async function Confirm() {
//     try {
//       emit('confirm', rows);   // 把 rows 发出去
//       alert('提交成功！');
//     } catch (e) {
//       console.error(e);
//     }
//   }
  async function Confirm() {
    try {
      // console.log({rows: rows, id: id,remark:remark})
      const res=await request.post('/order/add', JSON.parse(JSON.stringify({rows: rows, id: id,remark:remark.value})))
      if(res.data.status===1)
        alert('提交成功！');
      else alert('提交失败！');
    } catch (e) {
      console.error(e);
    }
  }

  // function updateComposition(e, row) {
  //   const newValue = e.target.textContent.trim();
  //   if (row.composition !== newValue) {
  //     row.composition = newValue;
  //   }
  // }


  /* ---------- 1. 数据 ---------- */
  const tableOptions = ref({
    header: [
      { field: '0', caption: 'Repo'},
      { field: '1', caption: 'OrderEntry' },
      { field: '2', caption: 'Due-Date' },
      { field: '3', caption: 'Lab-In' },
      { field: '4', caption: 'Express' },
      { field: '5', caption: 'CS' },
      { field: '6', caption: 'Group' },
      { field: '7', caption: 'Review Finish' },
    ],
    records: Array.from({ length: 100 }, () => ['10001', '进单人1', '', '', '', '', '', '', ''])
  })

  /* ---------- 2. 挂载 ---------- */
  const tableRef = ref(null)
  let tableInstance = null

  onMounted(() => {

    //后端完成后需要把V-Table数据实时替换成后端传入的数据
    //在页面加载时获取当前user完成的进单数据，并渲染到V-Table中

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
    tableInstance = new VTable.ListTable(tableRef.value, tableOptions.value)
  })

  onUnmounted(() => {
    tableInstance?.release()
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
      border-radius:0px;
      border-color:#a3a3a3
  }
</style>
