<template>
  <div class="allContainer">
    <div style="margin-left: auto ;
  display: flex;flex-direction: column;align-items: center;gap: 20px;width: 100%;height: 100%">
      <div class="mainSelectContainer">
        <div>
          <el-text size="large">ReportNo.</el-text>
          <el-input placeholder="" v-model="searchParams.reportNum" style="width: 150px;" />
          <el-button type="primary" @click="search">Search</el-button>
        </div>
        <div>
          <el-text size="large">TimeOpt</el-text>
          <el-select v-model="searchParams.timeOpt" style="width: 100px">
            <el-option value="default" label="Default">Default</el-option>
            <el-option value="dueDate" label="DueDate">DueDate</el-option>
            <el-option value="labIn" label="LabIn">LabIn</el-option>
            <el-option value="ReviewFinish" label="ReviewFinish">ReviewFinish</el-option>
            <el-option value="LabOut" label="LabOut">LabOut</el-option>
          </el-select>
          <el-text size="large">TimeType</el-text>
          <el-select v-model="searchParams.timeType" style="width: 100px" @change="timeTypeChange" :disabled="searchParams.timeOpt==='default'">
            <el-option v-for="type in DatePickerType" :key="type" :value="type"></el-option>
          </el-select>
          <el-text size="large">Time Range</el-text>
          <el-date-picker v-model="searchParams.timeRange"
                          :type="searchParams.timeType"
                          placeholder=""
                          :disabled="searchParams.timeOpt==='default'"/>
        </div>
        <div>
          <el-text>Group</el-text>
          <el-select v-model="searchParams.group" style="width: 100px;" @change="searchGroupChange" :disabled="groups.length===1">
            <el-option v-for="op in groups" :key="op" :value="op" :label="op"></el-option>
          </el-select>
        </div>
        <div>
          <el-text>Status</el-text>
          <el-select v-model="searchParams.status" style="width: 150px" @change="search">
            <el-option value="All">All</el-option>
            <el-option value="In Lab">In Lab</el-option>
            <el-option value="Review Finished">Review Finished</el-option>
            <el-option value="Test Done">Test Done</el-option>
          </el-select>
        </div>
        <div>
          <el-text>Express</el-text>
          <el-select v-model="searchParams.express" style="width: 100px" @change="search">
            <el-option value="All">All</el-option>
            <el-option value="Regular">Regular</el-option>
            <el-option value="Express">Express</el-option>
            <el-option value="Shuttle">Shuttle</el-option>
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
                style="width:100%;" height="75%"
                v-if="searchParams.group==='All'">
        <el-table-column type="expand">
          <template #default="props">
            <div style="margin-left: 50px;">
              <el-table :data="props.row.groups" style="width: 100%" ref="innerTableRef" border>
                <el-table-column label="Group" fixed prop="group" width="80" :formatter="funcs.emptyDisplay" />
                <el-table-column label="Lab-In" width="100">
                  <template #default="scope">
                    {{scope.row.labIn ? formatTime(new Date(scope.row.labIn)):'-'}}
                  </template>
                </el-table-column>
                <el-table-column prop="dueDate" label="Due-Date" width="100" :formatter="funcs.strDateColumnFormatter" />
                <el-table-column prop="express" label="Express" width="90" :formatter="funcs.emptyDisplay" />
                <el-table-column prop="testSampleNum" label="No. of Sample" width="90" :formatter="funcs.emptyDisplay" />
                <!--              <el-table-column prop="testItemNum" label="TestItemNum" :formatter="funcs.emptyDisplay" />-->
                <el-table-column prop="reviewer" label="Reviewer" width="150" :formatter="funcs.emptyDisplay" />
                <el-table-column prop="reviewFinish" label="Review-Finished" width="100" :formatter="funcs.strTimeColumnFormatter"></el-table-column>
                <el-table-column prop="labOut" label="Lab-Out" width="100" :formatter="funcs.strTimeColumnFormatter" />
                <el-table-column prop="remark" label="Remark" min-width="200" :formatter="funcs.emptyDisplay" />
                <el-table-column prop="status" label="Status" width="100" :formatter="funcs.emptyDisplay"></el-table-column>
                <el-table-column prop="delayType" label="Delay Type" :formatter="funcs.emptyDisplay" width="100"></el-table-column>
                <el-table-column prop="delayReason" label="Delay Reason" :formatter="funcs.emptyDisplay" width="300"></el-table-column>
                <el-table-column width="110" fixed="right" label="Application">
                  <template #default="scope">
                    <el-button type="primary"
                               text
                               @click="openEdit(scope.row,props.row)">
                      Edit
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="reportNum" label="ReportNo." :formatter="funcs.emptyDisplay" />
        <el-table-column prop="orderEntry" label="Order-Entry" :formatter="funcs.emptyDisplay" />
        <el-table-column prop="cs" label="CS" :formatter="funcs.emptyDisplay" />
        <el-table-column prop="testGroups" label="Groups" :formatter="funcs.emptyDisplay" />
        <el-table-column label="Expresses" :formatter="funcs.emptyDisplay">
          <template #default="scope">
            {{getExpresses(scope.row)}}
          </template>
        </el-table-column>
        <el-table-column label="Application" width="110">
          <template #default="scope">
            <el-button link type="primary" @click="openAllEdit(scope.row)">Edit</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--    单group展示单-->
      <el-table class="removeTableGaps"
                :data="reportGroupList"
                border
                style="width:100%;" height="600px"
                v-if="searchParams.group!=='All'">
        <!--订单id埋点，scope.row.recordId读取-->
        <el-table-column fixed width="160" prop="reportNum" label="ReportNo." :formatter="funcs.emptyDisplay" />
        <el-table-column width="140" prop="orderEntry" label="Order-Entry" :formatter="funcs.emptyDisplay" />
        <el-table-column width="100" prop="cs" label="CS" :formatter="funcs.emptyDisplay" />
        <el-table-column width="100" label="Group" prop="testGroup" :formatter="funcs.emptyDisplay" />
        <el-table-column width="150" label="Lab-In">
          <template #default="scope">
            {{scope.row.labIn ? formatTime(new Date(scope.row.labIn)):'-'}}
          </template>
        </el-table-column>
        <el-table-column width="100" prop="dueDate" label="Due-Date" :formatter="funcs.strDateColumnFormatter" />
        <el-table-column width="100" prop="express" label="Express" :formatter="funcs.emptyDisplay" />
        <el-table-column width="100" prop="testSampleNum" label="No. of Sample" :formatter="funcs.emptyDisplay" />
        <!--      <el-table-column width="100" prop="testItemNum" label="TestItemNum" :formatter="funcs.emptyDisplay" />-->
        <el-table-column width="120" prop="reviewer" label="Reviewer" :formatter="funcs.emptyDisplay" />
        <el-table-column width="150" prop="reviewFinish" label="Review-Finished" :formatter="funcs.strTimeColumnFormatter" />
        <el-table-column width="150" prop="labOut" label="Lab-Out" :formatter="funcs.strTimeColumnFormatter" />
        <el-table-column width="300" prop="remark" label="Remark" :formatter="funcs.emptyDisplay" />
        <el-table-column width="100" prop="status" label="Status" :formatter="funcs.emptyDisplay"></el-table-column>
        <el-table-column prop="delayType" label="Delay Type" :formatter="funcs.emptyDisplay" width="100"></el-table-column>
        <el-table-column prop="delayReason" label="Delay Reason" :formatter="funcs.emptyDisplay" width="300"></el-table-column>
        <el-table-column label="Application" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="openEdit(scope.row)">Edit</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="currentPage"
                     v-model:page-size="pageSize"
                     :page-sizes="[10, 20, 30, 40]"
                     size="large"
                     background
                     layout="total, sizes, pager, jumper"
                     :total="total"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     pager-count="12" />
    </div>
    <el-dialog top="5vh"
               v-model="editDialogOpen"
               title="Edit Application"
               width="800px"
               :before-close="editBeforeClose">
      <el-form v-if=allOpen>
        <el-descriptions :column="2" border>
          <!-- Report 基本信息 -->
          <el-descriptions-item label="Report No.">
            {{reportEdit.reportNum}}
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
        <div v-for="(group, index) in reportEdit.groups" :key="index" style="position: relative; margin-bottom: 20px; padding: 10px; border: 1px dashed #ccc; border-radius: 4px;">
          <!-- 右上角 × -->
          <el-button type="danger"
                     text
                     style="position: absolute; top: 6px; right: 6px;"
                     @click="reportEdit.groups.splice(index, 1)">×</el-button>
          <el-descriptions :column="2"  border>
            <el-descriptions-item label="Group">
              {{group.group}}
            </el-descriptions-item>
            <el-descriptions-item label="Lab-In">
              {{globalFunctions.stringTimeFormat(group.labIn)}}
            </el-descriptions-item>
            <el-descriptions-item label="Due Date">
              <el-date-picker v-model="group.dueDate"
                              type="date"
                              format="YYYY-MM-DD"
                              placeholder="选择日期" />
            </el-descriptions-item>
            <el-descriptions-item label="Express">
              <el-select v-model="group.express" filterable placeholder="">
                <el-option value="Regular" :disabled="group.regularDisable">Regular</el-option>
                <el-option value="Express" :disabled="group.expressDisable">Express</el-option>
                <el-option value="Shuttle" :disabled="group.shuttleDisable">Shuttle</el-option>
                <el-option value="Same Day" :disabled="group.sameDayDisable">Same Day</el-option>
              </el-select>
            </el-descriptions-item>
            <el-descriptions-item label="No. of Sample">
              <el-input v-model="group.testSampleNum" />
            </el-descriptions-item>
            <el-descriptions-item label="status">
              {{group.status}}
            </el-descriptions-item>
            <el-descriptions-item label="remark" span="2">
              <el-input v-model="group.remark" type="textarea" />
            </el-descriptions-item>
            <el-descriptions-item label="Application Reason">
              <el-input v-model="group.applicationReason" type="textarea" />
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-form>
      <el-form v-else>
        <!--        无嵌套-->
        <el-descriptions :column="2" border>

          <!-- ReportNo. -->
          <el-descriptions-item label="ReportNo.">
            {{reportGroupEdit.reportNum}}
          </el-descriptions-item>

          <!-- OrderEntry -->
          <el-descriptions-item label="OrderEntry">
            {{reportGroupEdit.orderEntry}}
          </el-descriptions-item>

          <!-- CS -->
          <el-descriptions-item label="CS">
            {{reportGroupEdit.cs}}
          </el-descriptions-item>

          <!-- Group -->
          <el-descriptions-item label="Group">
            {{reportGroupEdit.group}}
          </el-descriptions-item>

          <!-- Lab-In -->
          <el-descriptions-item label="Lab-In">
            {{globalFunctions.stringTimeFormat(reportGroupEdit.labIn)}}
          </el-descriptions-item>

          <!-- Due-Date -->
          <el-descriptions-item label="Due-Date">
            <el-date-picker v-model="reportGroupEdit.dueDate"
                            type="date"
                            placeholder="">
            </el-date-picker>
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
          <el-descriptions-item label="No. of Sample">
            <el-input v-model="reportGroupEdit.testSampleNum" />
          </el-descriptions-item>

          <!-- Status -->
          <el-descriptions-item label="Status" span="2">
            {{reportGroupEdit.status}}
          </el-descriptions-item>
          <el-descriptions-item label="Remark" span="2">
            <el-input v-model="reportGroupEdit.remark" type="textarea" />
          </el-descriptions-item>
          <el-descriptions-item label="ApplicationReason">
            <el-input v-model="reportGroupEdit.applicationReason" type="textarea" />
          </el-descriptions-item>
        </el-descriptions>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogOpen = false">Cancel</el-button>
          <el-button type="primary" @click="editDialogConfirm2">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import Header from "@/components/Layout/Header.vue";
import Footer from "@/components/Layout/Footer.vue";
import { inject, onMounted, reactive, ref } from "vue";
import globalFunctions from '@/utils/globalFunctions';
import { ElMessage } from 'element-plus'

/* Data------------------------------------------------------------------------------------------- */
const request = inject('request')
const roleStore = inject('roleStore')
const groups = roleStore.getGroups
const authStore = inject('userAuthStore')
//编辑
var reportEdit = ref({
  reportNum: '',
  data1: '',
  data2: '',
  data3: '',
  data4: '',
  data5: '',
})
const CSList=ref( [])
const userList = ref([])

var editDialogOpen = ref(false)
var allOpen=ref(false)
//删除
const reportGroupDelete = ref<{ recordId: string }>({ recordId: '' })  /* 当前行数据（来自 scope.row） */
const reason = ref('')  /* 删除理由 */
var deleteDialogOpen = ref(false)
//表格数据
const reportList = ref([])
const reportGroupList = ref([])
const funcs = inject('funcs')
const searchParams = reactive({
  recordId: "",
  reportNum: "",
  timeType: "month",
  timeRange: '',
  group: groups[0],
  status: "All",
  timeOpt: "default",
  express: "All",
  orderEntry: "",
})
var reportGroupEdit = ref({
  group: searchParams.group,
})
//分页数据
const currentPage = ref(1)
const pageSize = ref(10)
//总数
const total = ref(100)
const DatePickerType = [
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
const innerTableRef = ref(null)
/* function--------------------------------------------------------------------------------------- */

function getExpresses(row) {
  let expresses = new Set()
  for (const group of row.groups) {
    expresses.add(group.express)
  }

  return [...expresses].join(',')
}
function searchGroupChange() {
  search()
}
/* edit--------------------------------------------------------------------------------------- */
//打开单group编辑框
function openEdit(row,row2) {
  reportGroupEdit.value = JSON.parse(JSON.stringify(row))
  if(row2){
    let group=JSON.parse(JSON.stringify(row))
    let report=JSON.parse(JSON.stringify(row2))
    reportGroupEdit.value={...report,...group}
  }
  reportGroupEdit.value.group =reportGroupEdit.value.group || searchParams.group
  editDialogOpen.value = true
  allOpen.value = false
}
//打开所有group编辑框
function openAllEdit(row) {
  reportEdit.value = JSON.parse(JSON.stringify(row))
  editDialogOpen.value = true
  allOpen.value = true
}

function editBeforeClose() {
  editDialogOpen.value = false
}

async function editDialogConfirm() {
  let dto: OrderUpdateDto

  if (searchParams.group === 'All') {
    // 嵌套场景：一个 Report 里可能有多条 group
    const rows = (reportEdit.value.groups || []).map(groupToOrderUpdate)
    dto = buildOrderUpdateDto(rows)
  } else {
    // 扁平场景：当前就是单条
    dto = buildOrderUpdateDto([groupToOrderUpdate(reportGroupEdit.value)])
  }
  // console.log(dto)
  try {
    await request.post('/order/update', dto)
    ElMessage.success('Update success')
    editDialogOpen.value = false
    // 刷新表格
    await search()
  } catch (e) {
    ElMessage.error('Update failed')
  }
}
async function editDialogConfirm2(){
  let dto
  if(searchParams.group==='All'){
    for (const group of reportEdit.value.groups) {
      const groupName = group.group || 'current';
      if (!group.dueDate) {
        return alert(`Please set a due date for the ${groupName} group.`);
      }
      if (group.labIn && group.reviewFinish && new Date(group.labIn) >= new Date(group.reviewFinish)) {
        return alert(`For the ${groupName} group, "Lab In" time must be earlier than "Review Finish" time.`);
      }
      if (group.reviewFinish && group.labOut && new Date(group.reviewFinish) >= new Date(group.labOut)) {
        return alert(`For the ${groupName} group, "Review Finish" time must be earlier than "Lab Out" time.`);
      }
      if (group.labIn) {
        const dueDatePlusOneDay = new Date(new Date(group.dueDate).getTime() + 24 * 60 * 60 * 1000);
        // console.log(dueDatePlusOneDay)
        if (new Date(group.labIn) >= dueDatePlusOneDay) {
          return alert(`For the ${groupName} group, "Lab In" time must be on or before the due date (i.e., before ${dueDatePlusOneDay.toISOString().slice(0, 10)}).`);
        }
      }
    }
    reportEdit.value.reportNum=reportEdit.value.data1+reportEdit.value.data2+reportEdit.value.data3+reportEdit.value.data4+reportEdit.value.data5
  }else{
    const v = reportGroupEdit.value;
    if (!v.dueDate) {
      return alert('Please select a due date.');
    }
    const adjustedDueDate = new Date(new Date(v.dueDate).getTime() + 24 * 60 * 60 * 1000);
    if (v.labIn && v.reviewFinish && !(new Date(v.labIn) < new Date(v.reviewFinish))) {
      return alert('Lab-In must be earlier than Review-Finish.');
    }
    if (v.reviewFinish && v.labOut && !(new Date(v.reviewFinish) < new Date(v.labOut))) {
      return alert('Review-Finish must be earlier than Lab-Out.');
    }
    if (v.labIn && !(new Date(v.labIn) <= adjustedDueDate)) {
      return alert('Lab-In must be on or before the due date.');
    }
    reportGroupEdit.value.reportNum=reportGroupEdit.value.data1+reportGroupEdit.value.data2+reportGroupEdit.value.data3+reportGroupEdit.value.data4+reportGroupEdit.value.data5
  }
  if (searchParams.group === 'All') {
    if(reportEdit.value.groups.length!==new Set(reportEdit.value.groups.map(g => g.group)).size){
      return alert('The same group is not allowed here.')
    }
    dto=reportEdit.value.groups.map(item=>{
      const {groups, ...noGroups}= reportEdit.value
      let obj={...item,...noGroups}
      return {...obj, "testEngineer": "",testGroup:obj.group,reportDueDate:obj.dueDate,orderInTime:obj.labIn,labOutTime:obj.labOut}})
  } else {
    dto=[{...reportGroupEdit.value,"testEngineer": "",testGroup:reportGroupEdit.value.group,reportDueDate:reportGroupEdit.value.dueDate,orderInTime:reportGroupEdit.value.labIn,labOutTime:reportGroupEdit.value.labOut}]
  }
  try {
    await request.post('/order/update', {rows:dto})
    ElMessage.success('Update success')
    editDialogOpen.value = false
    // 刷新表格
    await search()
  } catch (e) {
    ElMessage.error('Update failed')
  }
}

/* edit--------------------------------------------------------------------------------------- */

/* delete--------------------------------------------------------------------------------------- */
//点击删除按钮
function openDelete(row: { recordId: string }) {
  reportGroupDelete.value = row
  reason.value = ''
  deleteDialogOpen.value = true
}

function deleteBeforeClose() {
  deleteDialogOpen.value = false
}
async function deleteDialogConfirm() {
  deleteDialogOpen.value = false
  //删除当前数据（把埋点的RecordId传回去）
  if (!reason.value.trim()) {
    ElMessage.warning('Please input reason')
    return
  }
  const dto = {
    items: [{ recordId: reportGroupDelete.value.recordId, reason: reason.value }],
    userId: authStore.id
  }
  console.log(dto)
  let req = await request.post('/order/delete', dto)
  if (req.data.success) {
    ElMessage.success('Deleted successfully')
    deleteDialogOpen.value = false
    search()
  }
  else {
    ElMessage.error('Delete failed')
  }
}
/* delete--------------------------------------------------------------------------------------- */

function timeTypeChange() {
  searchParams.timeRange = ''
}
//分页函数
function handleCurrentChange() {
  search()
}
function handleSizeChange() {
  search()
}
const getCSList = async () => {
  const res = await request.get('/search/getCs')
  if(res.data.success){
    CSList.value=res.data.data
  }else{
    alert(res.data.message)
  }
}
async function getUserList() {
  let rep=await request.get('/search/getUser')
  if(rep.data.success){
    userList.value=rep.data.data
  }else{
    alert(rep.data.message)
  }
}
async function search() {
  if(searchParams.timeOpt!=='default'&&!searchParams.timeRange){
    return alert('Please select a time range.')
  }
  let req = await request.post('/order/ordersummary', { QueryParam: searchParams, PageSize: pageSize.value, PageNum: currentPage.value })
  if (req.data.success) {
    if (searchParams.group === 'All')
      reportList.value = req.data.data.items
    else
      reportGroupList.value = req.data.data.items
    total.value = req.data.data.totalCount
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
onMounted(() => {
  search()
  getCSList()
  getUserList()
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
