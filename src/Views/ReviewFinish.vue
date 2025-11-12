<template>
  <div style="margin-left: auto ;
  display: flex;flex-direction: column;align-items: center;gap: 20px;width: 100%;height: 100%">
    <div class="line-left-flex-container" style="width: 100%">
      <div class="mainSelectContainer">
        <div>
          <el-text size="large">ReportNo.</el-text>
          <el-input placeholder="" v-model="searchParams.reportNum" style="width: 150px;" />
          <el-button type="primary" @click="search">Search</el-button>
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
      </div>
    </div>
    <el-table class="removeTableGaps"
              :data="reportList"
              border
              style="width:100%;" height="75%"
              v-if="searchParams.group==='All'"
              @expand-change="expandChange"
              :expand-row-keys="expandRowKeys"
              row-key="reportNum"
              >
      <el-table-column type="expand">
        <template #default="props">
          <div style="margin-left: 50px;">
            <el-table :data="props.row.groups" style="width: 100%" ref="innerTableRef" border>
              <el-table-column label="Group" prop="group" :formatter="funcs.emptyDisplay" />
              <el-table-column label="Lab-In">
                <template #default="scope">
                  {{scope.row.labIn ? formatTime(new Date(scope.row.labIn)):'-'}}
                </template>
              </el-table-column>
              <el-table-column prop="dueDate" label="Due-Date" :formatter="funcs.strDateColumnFormatter" />
              <el-table-column prop="express" label="Express" :formatter="funcs.emptyDisplay" />
              <el-table-column prop="testSampleNum" label="No. of Sample" :formatter="funcs.emptyDisplay" />
              <!--              <el-table-column prop="testItemNum" label="TestItemNum" :formatter="funcs.emptyDisplay" />-->
              <el-table-column prop="reviewer" label="Reviewer" :formatter="funcs.emptyDisplay" />
              <el-table-column prop="reviewFinish" label="Review-Finished" :formatter="funcs.strTimeColumnFormatter"></el-table-column>
              <el-table-column prop="labOut" label="Lab-Out" :formatter="funcs.strTimeColumnFormatter" />
              <el-table-column label="Remark" min-width="200" :formatter="funcs.emptyDisplay" >
                <template #default="scope">
                  <el-input v-model="scope.row.remark" type="textarea"></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="Status" :formatter="funcs.emptyDisplay"></el-table-column>
              <el-table-column width="100" label="Operation">
                <template #default="scope">
                  <div class="line-flex-container">
                    <el-button type="primary"
                               v-if="scope.row.status==='In Lab'"
                               @click="reviewFinish(scope.row)">
                      Finish
                    </el-button>
                    <el-text type="danger" v-else>Finished</el-text>
                  </div>

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
    </el-table>
    <!--    全展示单-->
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
      <el-table-column width="300" label="Remark" :formatter="funcs.emptyDisplay" >
        <template #default="scope">
          <el-input v-model="scope.row.remark" type="textarea"></el-input>
        </template>
      </el-table-column>
      <el-table-column width="100" prop="status" label="Status" :formatter="funcs.emptyDisplay"></el-table-column>
      <el-table-column label="Operations" width="100" fixed="right">
        <template #default="scope">
          <div class="line-flex-container">
            <el-button type="primary"
                       v-if="scope.row.status==='In Lab'"
                       @click="reviewFinish(scope.row)">
              Finish
            </el-button>
            <el-text type="danger" v-else>Finished</el-text>
          </div>
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

</template>
<script setup>

import {ref, reactive, inject, onMounted} from "vue";

const funcs=inject('funcs')
const request = inject('request')
const authStore = inject('userAuthStore')

const searchParams = reactive({
  recordId: "",
  reportNum: "",
  timeType: "month",
  timeRange: '',
  group: 'All',
  status: "In Lab",
  timeOpt: "default",
  express: "All",
  orderEntry: "",
})
const groups = ref(['All','Physics','Wet','Fiber','Flam'])
//表格数据
const reportList = ref([])
const reportGroupList = ref([])
//小表格的ref
const innerTableRef = ref(null)
//分页数据
const currentPage = ref(1)
const pageSize = ref(10)
//总数
const total = ref(100)
const expandRowKeys=ref([])

function handleCurrentChange() {
  search()
}
function handleSizeChange() {
  search()
}

async function search() {
  if(searchParams.timeOpt!=='default'&&!searchParams.timeRange){
    return alert('Please select a time range.')
  }
  let req = await request.post('/order/ordersummary', { QueryParam: searchParams, PageSize: pageSize.value, PageNum: currentPage.value })
  if (req.data.success) {
    if (searchParams.group === 'All'){
      reportList.value = req.data.data.items
    }
    else
      reportGroupList.value = req.data.data.items
    total.value = req.data.data.totalCount
  }
}
async function reviewFinish(row) {
  row.reviewFinishTime=new Date()
  row.testEngineer=row.testEngineer || ''
  row.testGroup=row.group || searchParams.group
  row.reportDueDate=row.dueDate
  row.orderInTime=row.labIn
  row.labOutTime=row.labOut
  row.reviewerId=authStore.id
  let req = await request.post('/order/update', {rows:[row]})
  if (req.data.success) {
    search()
  }
}
function getExpresses(row) {
  let expresses = new Set()
  for (const group of row.groups) {
    expresses.add(group.express)
  }

  return [...expresses].join(',')
}

const formatTime = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')  // 月份从0开始，+1
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}
function searchGroupChange() {
  search()
}
function expandChange(row, expandedRows){
  expandRowKeys.value=expandedRows.map(item=>item.reportNum)
}

onMounted(() => {
  search()
})
</script>
<style scoped>
.removeTableGaps :deep(table){
  margin-bottom: 0 !important;
}
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
.mainSelectContainer > div{
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
