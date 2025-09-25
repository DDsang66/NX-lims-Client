<template>
  <Header />
  <div class="container-fluid" style="padding:3%;margin-left: auto ;display: flex;flex-direction: column;align-items: center">
    <div style="display: flex;gap: 5px ;margin-bottom: 30px;width: 100%;align-items: center;justify-content: center;flex-shrink: 0;flex-wrap: wrap;">
      <el-text size="large">ReportNo.</el-text>
      <el-input placeholder="" v-model="searchParams.reportNum" style="width: 150px;" />
      <el-button type="primary" @click="search">Search</el-button>
      <el-text size="large" class="searchGap">TimeOpt</el-text>
      <el-select v-model="searchParams.timeOpt" style="width: 100px">
        <el-option value="all">All</el-option>
        <el-option value="anyOne">AnyOne</el-option>
        <el-option value="dueDate">DueDate</el-option>
        <el-option value="labIn">LabIn</el-option>
      </el-select>
      <el-text size="large" >TimeType</el-text>
      <el-select v-model="searchParams.timeType" style="width: 100px">
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
      <el-text class="searchGap">Group</el-text>
      <el-select v-model="searchParams.group" style="width: 100px;">
        <el-option value="All">All</el-option>
        <el-option value="Physics">Physics</el-option>
        <el-option value="Wet">Wet</el-option>
        <el-option value="Fiber">Fiber</el-option>
        <el-option value="Flam">Flam</el-option>
      </el-select>
      <el-text class="searchGap">Status</el-text>
      <el-select v-model="searchParams.status" style="width: 100px">
        <el-option value="All">All</el-option>
        <el-option value="In Lab">In Lab</el-option>
      </el-select>
      <el-text class="searchGap">Express</el-text>
      <el-select v-model="searchParams.express" style="width: 100px">
        <el-option value="All" >All</el-option>
        <el-option value="Regular" >Regular</el-option>
        <el-option value="Express" >Express</el-option>
        <el-option value="Shuttle" >Shuttle</el-option>
        <el-option value="Same Day">Same Day</el-option>
      </el-select>
      <div class="searchGap">
        <el-text>OrderEntry</el-text>
        <el-input v-model="searchParams.orderEntry" style="width: 100px"></el-input>
      </div>
    </div>
    <el-table class="removeTableGaps" :data="reportList" style="width:100%;" height="600px" default-sort="{ prop: 'reportNum', order: 'descending' }">
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
      <el-table-column prop="reportNum" label="ReportNo."  />
      <el-table-column prop="orderEntry" label="OrderEntry" />
      <el-table-column prop="cs" label="CS" />
      <el-table-column prop="testGroups" label="Groups" >
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="currentPage4"
      v-model:page-size="pageSize4"
      :page-sizes="[100, 200, 300, 400]"
      :size="size"
      :disabled="disabled"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      :total="400"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
  <Footer />
</template>

<script setup>
import Header from "@/components/Layout/Header.vue";
import Footer from "@/components/Layout/Footer.vue";
import {reactive, ref} from "vue";

/* Data------------------------------------------------------------------------------------------- */
//表格数据
const reportList=ref([
  {
    "reportNum": "87.405.25.10001.01",
    "orderEntry": "GuangXv,Chen",
    "cs": "TestCS",
    "testGroups": "Physics,Wet,Fiber",
    "groups": [
      {
        "recodeId": 1971026855154679800,
        "express": "Express",
        "group": "Physics",
        "remark": "测试时间",
        "labIn": "2025-09-25 09:39:32",
        "dueDate": "2025-09-28",
        "status": "In Lab"
      },
      {
        "recodeId": 1971026855578304500,
        "express": "Express",
        "group": "Wet",
        "remark": "测试时间",
        "labIn": "2025-09-25 09:39:32",
        "dueDate": "2025-09-28",
        "status": "In Lab"
      },
      {
        "recodeId": 1971026855657996300,
        "express": "Express",
        "group": "Fiber",
        "remark": "测试时间",
        "labIn": "2025-09-25 09:39:32",
        "dueDate": "2025-09-28",
        "status": "In Lab"
      }
    ]
  },
  {
    "reportNum": "87.405.25.10002.01",
    "orderEntry": "GuangXv,Chen",
    "cs": "TestCS",
    "testGroups": "Fiber,Physics",
    "groups": [
      {
        "recodeId": 1971027002634797000,
        "express": "Same Day",
        "group": "Fiber",
        "remark": "测试时间",
        "labIn": "2025-09-25 09:40:00",
        "dueDate": "2025-09-26",
        "status": "In Lab"
      },
      {
        "recodeId": 1971027002731266000,
        "express": "Same Day",
        "group": "Physics",
        "remark": "测试时间",
        "labIn": "2025-09-25 09:40:00",
        "dueDate": "2025-09-26",
        "status": "In Lab"
      }
    ]
  }
])
const searchParams=reactive({
  reportNum: "",
  timeType: "month",
  timeRange: '',
  group: "All",
  status: "All",
  timeOpt: "All",
  express: "All",
  orderEntry: ""
})
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
/* function--------------------------------------------------------------------------------------- */
async function search() {

}
/* 生命周期函数------------------------------------------------------------------------------------- */
/* watch------------------------------------------------------------------------------------------ */
</script>
<style scoped>
/*去除表格标题和内容之间的空隙*/
.removeTableGaps :deep(table){
  margin-bottom: 0 !important;
}
/*查询条件各项间距*/
.searchGap{
  margin-left: 9px;
}
</style>
