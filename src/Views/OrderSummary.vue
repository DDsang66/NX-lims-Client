<template>
  <Header />
  <div class="container-fluid" style="padding:3%;margin-left: auto ;
  display: flex;flex-direction: column;align-items: center;gap: 20px">
    <div class="mainSelectContainer">
      <div>
        <el-text size="large">ReportNo.</el-text>
        <el-input placeholder="" v-model="searchParams.reportNum" style="width: 150px;" />
        <el-button type="primary" @click="search">Search</el-button>
      </div>
      <div>
        <el-text size="large" >TimeOpt</el-text>
        <el-select v-model="searchParams.timeOpt" style="width: 100px">
          <el-option value="all">All</el-option>
          <el-option value="anyOne">AnyOne</el-option>
          <el-option value="dueDate">DueDate</el-option>
          <el-option value="labIn">LabIn</el-option>
          <el-option value="ReviewFinish">ReviewFinish</el-option>
          <el-option value="LabOut">LabOut</el-option>
        </el-select>
        <el-text size="large" >TimeType</el-text>
        <el-select v-model="searchParams.timeType" style="width: 100px" @change="timeTypeChange">
          <el-option v-for="type in DatePickerType" :key="type" :value="type" ></el-option>
          <!--        <el-option label="year" value="year"></el-option>-->
          <!--        <el-option label="month" value="month"></el-option>-->
          <!--        <el-option label="day" value="day"></el-option>-->
          <!--        <el-option label="week" value="week"></el-option>-->
          <!--        <el-option label="dateTime" value="dateTime"></el-option>-->
        </el-select>
        <el-text size="large">Time Range</el-text>
        <el-date-picker
          v-model="searchParams.timeRange"
          :type="searchParams.timeType"
          placeholder=""
        />
      </div>
      <div>
        <el-text >Group</el-text>
        <el-select v-model="searchParams.group" style="width: 100px;" @change="searchGroupChange">
          <el-option value="All">All</el-option>
          <el-option value="Physics">Physics</el-option>
          <el-option value="Wet">Wet</el-option>
          <el-option value="Fiber">Fiber</el-option>
          <el-option value="Flam">Flam</el-option>
        </el-select>
      </div>
      <div>
        <el-text >Status</el-text>
        <el-select v-model="searchParams.status" style="width: 150px" @change="search">
          <el-option value="All">All</el-option>
          <el-option value="In Lab">In Lab</el-option>
          <el-option value="Review Finished">Review Finished</el-option>
          <el-option value="Test Done">Test Done</el-option>
        </el-select>
      </div>
      <div>
        <el-text >Express</el-text>
        <el-select v-model="searchParams.express" style="width: 100px" @change="search">
          <el-option value="All" >All</el-option>
          <el-option value="Regular" >Regular</el-option>
          <el-option value="Express" >Express</el-option>
          <el-option value="Shuttle" >Shuttle</el-option>
          <el-option value="Same Day">Same Day</el-option>
        </el-select>
      </div>
      <div>
        <el-text>OrderEntry</el-text>
        <el-input v-model="searchParams.orderEntry" style="width: 100px"></el-input>
      </div>
    </div>
    <el-table class="removeTableGaps"
              :data="reportList"
              border
              style="width:100%;" height="600px"
              v-if="searchParams.group==='All'">
      <el-table-column type="expand">
        <template #default="props">
          <div style="margin-left: 50px;">
            <el-table :data="props.row.groups" style="width: 100%" ref="innerTableRef" border>
              <el-table-column label="group" prop="group" :formatter="funcs.emptyDisplay"/>
              <el-table-column label="Lab-In" >
                <template #default="scope">
                  {{scope.row.labIn ? formatTime(new Date(scope.row.labIn)):'-'}}
                </template>
              </el-table-column>
              <el-table-column prop="dueDate" label="Due-Date" :formatter="funcs.emptyDisplay"/>
              <el-table-column prop="express" label="Express" :formatter="funcs.emptyDisplay"/>
              <el-table-column prop="testSampleNum" label="No. of test" :formatter="funcs.emptyDisplay"/>
              <el-table-column prop="testItemNum" label="TestItemNum" :formatter="funcs.emptyDisplay"/>
              <el-table-column prop="Reviewer" label="Reviewer" :formatter="funcs.emptyDisplay"/>
              <el-table-column prop="reviewFinish" label="ReviewFinish" :formatter="funcs.emptyDisplay"/>
              <el-table-column prop="labOut" label="LabOut" :formatter="funcs.emptyDisplay"/>
              <el-table-column prop="remark" label="Remark" min-width="200" :formatter="funcs.emptyDisplay"/>
              <el-table-column prop="status" label="Status" :formatter="funcs.emptyDisplay"></el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="reportNum" label="ReportNo."  :formatter="funcs.emptyDisplay"/>
      <el-table-column prop="orderEntry" label="OrderEntry" :formatter="funcs.emptyDisplay"/>
      <el-table-column prop="cs" label="CS" :formatter="funcs.emptyDisplay"/>
      <el-table-column prop="testGroups" label="Groups" :formatter="funcs.emptyDisplay"/>
      <el-table-column label="Expresses" :formatter="funcs.emptyDisplay">
        <template #default="scope">
          {{getExpresses(scope.row)}}
        </template>
      </el-table-column>
      <el-table-column label="Operations" width="120">
        <template #default="scope">
          <el-button link type="primary"  @click="openEdit(scope.row)" >Edit</el-button>
        </template>
      </el-table-column>
    </el-table>
<!--    全展示单-->
    <el-table class="removeTableGaps"
              :data="reportGroupList"
              border
              style="width:100%;" height="600px"
              v-if="searchParams.group!=='All'">
      <el-table-column fixed width="160" prop="reportNum" label="ReportNo."  :formatter="funcs.emptyDisplay"/>
      <el-table-column width="140" prop="orderEntry" label="OrderEntry" :formatter="funcs.emptyDisplay"/>
      <el-table-column width="100" prop="cs" label="CS" :formatter="funcs.emptyDisplay"/>
      <el-table-column width="100" label="group" prop="testGroup" :formatter="funcs.emptyDisplay"/>
      <el-table-column width="150" label="Lab-In" >
        <template #default="scope">
          {{scope.row.labIn ? formatTime(new Date(scope.row.labIn)):'-'}}
        </template>
      </el-table-column>
      <el-table-column width="100" prop="dueDate" label="Due-Date" :formatter="funcs.emptyDisplay"/>
      <el-table-column width="100" prop="express" label="Express"  :formatter="funcs.emptyDisplay"/>
      <el-table-column width="100" prop="testSampleNum" label="No. of test" :formatter="funcs.emptyDisplay"/>
      <el-table-column width="100" prop="testItemNum" label="TestItemNum" :formatter="funcs.emptyDisplay"/>
      <el-table-column width="120" prop="Reviewer" label="Reviewer" :formatter="funcs.emptyDisplay"/>
      <el-table-column width="150" prop="reviewFinish" label="ReviewFinish" :formatter="funcs.emptyDisplay"/>
      <el-table-column width="150" prop="labOut" label="LabOut" :formatter="funcs.emptyDisplay"/>
      <el-table-column width="300" prop="remark" label="Remark"  :formatter="funcs.emptyDisplay"/>
      <el-table-column width="100" prop="status" label="Status" :formatter="funcs.emptyDisplay"></el-table-column>
      <el-table-column label="Operations" width="120" fixed="right">
        <template #default="scope">
          <el-button link type="primary"  @click="openEdit(scope.row)" >Edit</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 30, 40]"
      size="large"
      background
      layout="total, sizes, pager, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      pager-count="12"
    />
  </div>
<!--编辑框-->
  <el-dialog
    top="5vh"
    v-model="editDialogOpen"
    title="Edit"
    width="50%"
    :before-close="editBeforeClose"
  >
    <el-form v-if="searchParams.group==='All'">
      <el-descriptions :column="2" border>
        <!-- Report 基本信息 -->
        <el-descriptions-item label="Report No.">
          {{ reportEdit.reportNum }}
        </el-descriptions-item>
        <el-descriptions-item label="Order Entry">
          {{reportEdit.orderEntry}}
        </el-descriptions-item>
        <el-descriptions-item label="CS">
          {{reportEdit.cs}}
        </el-descriptions-item>
        <el-descriptions-item label="Test Groups">
          {{reportEdit.testGroups}}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 多个 Group 的编辑 -->
      <b>Groups</b>
      <div v-for="(group, index) in reportEdit.groups" :key="index" style="margin-bottom: 20px; padding: 10px; border: 1px dashed #ccc; border-radius: 4px;">
        <el-descriptions :column="2" size="small" border>
          <el-descriptions-item label="Group">
            {{ group.group }}
          </el-descriptions-item>
          <el-descriptions-item label="Lab-In">
            <el-date-picker
              v-model="group.labIn"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择时间"
            />
          </el-descriptions-item>
          <el-descriptions-item label="Due Date">
            <el-date-picker
              v-model="group.dueDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
            />
          </el-descriptions-item>
          <el-descriptions-item label="Express">
            <el-select  v-model="group.express" filterable placeholder="">
              <el-option value="Regular" :disabled="regularDisable">Regular</el-option>
              <el-option value="Express" :disabled="expressDisable">Express</el-option>
              <el-option value="Shuttle" :disabled="shuttleDisable">Shuttle</el-option>
              <el-option value="Same Day">Same Day</el-option>
            </el-select>
          </el-descriptions-item>
          <el-descriptions-item label="No. of test">
            <el-input v-model="group.testSampleNum" />
          </el-descriptions-item>
          <el-descriptions-item label="Test Item Num">
            <el-input v-model="group.testItemNum" />
          </el-descriptions-item>
          <el-descriptions-item label="Reviewer">
            <el-input v-model="group.Reviewer" />
          </el-descriptions-item>
          <el-descriptions-item label="Review Finish">
            <el-date-picker
              v-model="group.reviewFinish"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder=""
            />
          </el-descriptions-item>
          <el-descriptions-item label="Lab Out">
            <el-date-picker
              v-model="group.labOut"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder=""
            />
          </el-descriptions-item>
          <el-descriptions-item label="Remark">
            <el-input v-model="group.remark" type="textarea" :rows="2" />
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-form>
    <el-form v-if="searchParams.group !== 'All'">
      <!--        无嵌套-->
      <el-descriptions :column="2" border>
        <!-- ReportNo. -->
        <el-descriptions-item label="ReportNo.">
          <el-input v-model="reportGroupEdit.reportNum" />
        </el-descriptions-item>

        <!-- OrderEntry -->
        <el-descriptions-item label="OrderEntry">
          <el-input v-model="reportGroupEdit.orderEntry" />
        </el-descriptions-item>

        <!-- CS -->
        <el-descriptions-item label="CS">
          <el-input v-model="reportGroupEdit.cs" />
        </el-descriptions-item>

        <!-- Groups -->
        <el-descriptions-item label="Groups">
          <el-input v-model="reportGroupEdit.testGroups" />
        </el-descriptions-item>

        <!-- Group -->
        <el-descriptions-item label="Group">
          <el-input v-model="reportGroupEdit.group" />
        </el-descriptions-item>

        <!-- Lab-In -->
        <el-descriptions-item label="Lab-In">
          <el-date-picker
            v-model="reportGroupEdit.labIn"
            type="datetime"
            placeholder=""
            style="width: 100%"
          >
          </el-date-picker>
        </el-descriptions-item>

        <!-- Due-Date -->
        <el-descriptions-item label="Due-Date">
          <el-input v-model="reportGroupEdit.dueDate" />
        </el-descriptions-item>

        <!-- Express -->
        <el-descriptions-item label="Express">
          <el-select v-model="reportGroupEdit.express" filterable placeholder="">
            <el-option value="Regular" :disabled="regularDisable">Regular</el-option>
            <el-option value="Express" :disabled="expressDisable">Express</el-option>
            <el-option value="Shuttle" :disabled="shuttleDisable">Shuttle</el-option>
            <el-option value="Same Day">Same Day</el-option>
          </el-select>
        </el-descriptions-item>

        <!-- TestSampleNum -->
        <el-descriptions-item label="No. of test">
          <el-input v-model="reportGroupEdit.testSampleNum" />
        </el-descriptions-item>

        <!-- TestItemNum -->
        <el-descriptions-item label="TestItemNum">
          <el-input v-model="reportGroupEdit.testItemNum" />
        </el-descriptions-item>

        <!-- Reviewer -->
        <el-descriptions-item label="Reviewer">
          <el-input v-model="reportGroupEdit.Reviewer" />
        </el-descriptions-item>

        <!-- ReviewFinish -->
        <el-descriptions-item label="ReviewFinish">
          <el-date-picker
            v-model="reportGroupEdit.reviewFinish"
            type="datetime"
            placeholder=""
            style="width: 100%"
          >
          </el-date-picker>
        </el-descriptions-item>

        <!-- LabOut -->
        <el-descriptions-item label="LabOut">
          <el-date-picker
            v-model="reportGroupEdit.labOut"
            type="datetime"
            placeholder=""
            style="width: 100%"
          >
          </el-date-picker>
        </el-descriptions-item>

        <!-- Status -->
        <el-descriptions-item label="Status">
          <el-input v-model="reportGroupEdit.status" />
        </el-descriptions-item>

        <!-- Remark -->
        <el-descriptions-item label="Remark" :span="2">
          <el-input v-model="reportGroupEdit.remark" type="textarea" :rows="3" />
        </el-descriptions-item>
      </el-descriptions>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="editDialogOpen = false">Cancel</el-button>
        <el-button type="primary" @click="editDialogConfirm">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
  <Footer />
</template>

<script setup>
import Header from "@/components/Layout/Header.vue";
import Footer from "@/components/Layout/Footer.vue";
import {inject, onMounted, reactive, ref} from "vue";

/* Data------------------------------------------------------------------------------------------- */
const request=inject('request')

var reportEdit=ref({})
var reportGroupEdit=ref({})
var editDialogOpen=ref(false)
//表格数据
const reportList=ref([])
const reportGroupList=ref([])
const funcs=inject('funcs')
const searchParams=reactive({
  reportNum: "",
  timeType: "month",
  timeRange: '',
  group: "All",
  status: "All",
  timeOpt: "All",
  express: "All",
  orderEntry: "",
})
//分页数据
const currentPage=ref(1)
const pageSize=ref(10)
//总数
const total=ref(100)
const DatePickerType =[
  'year',
  'years',
  'month',
  'months',
  'date',
  'dates',
  'week',
  'datetime',
  'datetimerange',
  'daterange',
  'monthrange',
  'yearrange',
]
//小表格的ref
const innerTableRef=ref(null)
/* function--------------------------------------------------------------------------------------- */
function getExpresses(row){
  let expresses=new Set()
  for (const group of row.groups){
    expresses.add(group.express)
  }
  let expressesString=''
  expresses.forEach(express=>{
    expressesString+=express+' '
  })
  return expressesString.trim()
}
function searchGroupChange(){
  search()
}
function editBeforeClose(){
  editDialogOpen.value=false
}
function editDialogConfirm(){
  editDialogOpen.value=false
}
//打开编辑框
function openEdit(row){
  if(searchParams.group==='All')
    reportEdit.value=JSON.parse(JSON.stringify(row))
  else
    reportGroupEdit.value=JSON.parse(JSON.stringify(row))
  editDialogOpen.value=true
}
function timeTypeChange(){
  searchParams.timeRange=''
}
//分页函数
function handleCurrentChange(){
  search()
}
function handleSizeChange(){
  search()
}
async function search() {
  let req=await request.post('/order/ordersummary',{QueryParam:searchParams,PageSize:pageSize.value,PageNum:currentPage.value})
  if (req.data.success){
    if(searchParams.group==='All')
    reportList.value=req.data.data.items
    else
      reportGroupList.value=req.data.data.items
    total.value=req.data.data.totalCount
  }
}
//时间格式化
const formatTime = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')  // 月份从0开始，+1
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}
/* 生命周期函数------------------------------------------------------------------------------------- */
onMounted(()=>{
  search()
})
/* watch------------------------------------------------------------------------------------------ */
</script>
<style scoped>
/*去除表格标题和内容之间的空隙*/
.removeTableGaps :deep(table){
  margin-bottom: 0 !important;
}
/*查询条件主要容器*/
.mainSelectContainer{
  display: flex;
  gap: 15px ;
  width: 100%;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: wrap;
  border: 1px solid #ebeef5;
  padding: 10px;
}
/*查询条件中各项间距*/
.mainSelectContainer > div{
  display: flex;
  align-items: center;
  gap: 5px;
}
/* 让所有 el-table 的单元格内容居中 */
.el-table :deep(.cell) {
  text-align: center;
}
button:focus {
  outline: none;
}
</style>
