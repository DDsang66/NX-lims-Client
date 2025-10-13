<template>
  <Header />
  <div class="container-fluid" style="padding:3%;margin-left: auto ;">
    <div class="this-first-line">
      <div class="todayData this-piece">
        <div class="block-head">
          <el-select v-model="cardTimeType" placeholder="" style="width: 90px">
            <el-option label="Date" value="date"></el-option>
            <el-option label="Month" value="month"></el-option>
            <el-option label="Year" value="year"></el-option>
          </el-select>
          <el-date-picker v-model="cardTime" :type="cardTimeType">
          </el-date-picker>
          <el-text size="large" style="margin-left: 10px;">Group</el-text>
          <el-select v-model="cardGroup" style="width: 100px;" @change="cardsDataReq">
            <el-option value="All">All</el-option>
            <el-option value="Physics">Physics</el-option>
            <el-option value="Wet">Wet</el-option>
            <el-option value="Fiber">Fiber</el-option>
            <el-option value="Flam">Flam</el-option>
          </el-select>
        </div>
        <div class="line-flex-container this-cards">
          <el-card shadow="hover" class="column-flex-container this-card">
            <h6>Need Lab Out</h6>
            <div>
              <el-text type="primary" >{{cardData.needLabOut}}</el-text>
            </div>
          </el-card>
          <el-card shadow="hover" class="column-flex-container">
              <h6>Actually Lab Out</h6>
            <div>
              <el-text type="primary" >{{cardData.actuallyLabOut}}</el-text>
            </div>

          </el-card>
          <el-card shadow="hover" class="column-flex-container">
            <h6>Delay Lab Out</h6>
            <div>
              <el-text type="primary" >{{cardData.delayLabOut}}</el-text>
            </div>

          </el-card>
          <el-card shadow="hover" class="column-flex-container">
            <h6>In Advance</h6>
            <div>
              <el-text type="primary" >{{cardData.inAdvanceLabOut}}</el-text>
            </div>

          </el-card>
          <el-card shadow="hover" class="column-flex-container">
            <h6>No. of test</h6>
            <div>
              <el-text type="primary">{{cardData.numOfTest}}</el-text>
            </div>
          </el-card>
        </div>
      </div>
      <div class="fan-chart-wrapper this-piece">
        <div class="block-head">
          <el-select v-model="fanChartTimeType" placeholder="" style="width: 90px;">
            <el-option label="Date" value="date"></el-option>
            <el-option label="Month" value="month"></el-option>
            <el-option label="Year" value="year"></el-option>
          </el-select>
          <el-date-picker v-model="fanChartTime"
                          :type="fanChartTimeType"
                          placeholder="">
          </el-date-picker>
          <el-text size="large" style="margin-left: 10px;">Group</el-text>
          <el-select v-model="fanChartGroup" style="width: 100px;" @change="fanChartDataReq">
            <el-option value="All">All</el-option>
            <el-option value="Physics">Physics</el-option>
            <el-option value="Wet">Wet</el-option>
            <el-option value="Fiber">Fiber</el-option>
            <el-option value="Flam">Flam</el-option>
          </el-select>
        </div>
        <v-chart
          :option="fanChartOp"
          autoresize
        />
      </div>
    </div>
    <div class="line-chart-wrapper this-piece">
      <div class="block-head" >
        <el-select v-model="lineChartTimeType" placeholder="" style="width: 100px;" @change="lineChartTimeTypeChange">
          <el-option label="Month" value="month"></el-option>
          <el-option label="Months" value="months"></el-option>
          <el-option label="Year" value="year"></el-option>
          <el-option label="Years" value="years"></el-option>
          <el-option label="AllYear" value="allYear"></el-option>
        </el-select>
        <el-date-picker
          v-model="lineChartTime"
          :type="lineChartTimeType==='allYear' ? 'year' : lineChartTimeType"
          placeholder=""
        :disabled="lineChartTimeType==='allYear'">
        </el-date-picker>
        <el-text size="large" style="margin-left: 10px;">Group</el-text>
        <el-select v-model="lineChartGroup" style="width: 100px;" @change="lineChartDataReq">
          <el-option value="All">All</el-option>
          <el-option value="Physics">Physics</el-option>
          <el-option value="Wet">Wet</el-option>
          <el-option value="Fiber">Fiber</el-option>
          <el-option value="Flam">Flam</el-option>
        </el-select>
        <el-text size="large" style="margin-left: 10px;">Type</el-text>
        <el-select v-model="lineChartType" style="width: 120px;" @change="lineChartDataReq">
          <el-option value="all" label="All"></el-option>
          <el-option value="normal" label="Normal"></el-option>
          <el-option value="delay" label="Delay"></el-option>
          <el-option value="inAdvance" label="InAdvance"></el-option>
        </el-select>
      </div>
      <!-- 使用 v-chart 组件 -->
      <v-chart
        :option="countLineChartOp"
        autoresize
        @click="handleClick"
      />
    </div>
  </div>
  <Footer />
</template>
<script setup>
import Header from "@/components/Layout/Header.vue";
import Footer from "@/components/Layout/Footer.vue";
import {ref,inject} from "vue";

/* Data-------------------------------------------------------------------------------------------- */
var request = inject('request');

var cardData=ref({
  needLabOut:23,
  actuallyLabOut:17,
  delayLabOut:6,
  inAdvanceLabOut:12,
  numOfTest:14
});
var cardTime=ref('');
var fanChartTime=ref('');
var lineChartTime=ref('');
var cardGroup=ref('All');
var lineChartGroup=ref('All');
var fanChartGroup=ref('All');
var cardTimeType=ref('date');
var lineChartTimeType=ref('month');
var fanChartTimeType=ref('month');
var lineChartType=ref('all');
const fanChartOp = {
  color: ['rgb(0,70,173)', 'rgb(11,37,59)', 'rgb(242,239,237)'],
  title: {
    text: '出单情况',
    left: 'center'
  },
  dataset: {
    dimensions: ['value', 'category'],
    source: [
      ['sales', 'product'],
      [735,'Delay'],
      [580,'Normal'],
      [1048,'InAdvance'],
    ]
  },
  series: [
    {
      type: 'pie',
      radius: '50%',

      // data: [
      //   { value: 735, name: 'Delay'},
      //   { value: 580, name: 'Normal'},
      //   { value: 1048, name: 'InAdvance'},
      // ],
      label: {
        overflow: 'break',
        formatter: '{b} ({d}%)', // 使用字符串模板显示名称和百分比
        fontSize: 16
      }
    }
  ]
}
const countLineChartOp = {
  title: {
    text: '单量折线图',
    left: 'center'
  },
  // X 轴（类别轴）
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月','7月', '8月', '9月', '10月', '11月', '12月'],
  },
  // Y 轴（数值轴）
  yAxis: {
    type: 'value',
    name: '单量'
  },
  // 数据系列
  series: [
    {
      type: 'line',        // 图表类型：柱状图
      data: [120, 180, 150,123,123,134,142,230,123,52,23,56],
      emphasis: {
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      },
      name: '2024'
    },
    {
      type: 'line',
      //生成十二个测试数据
      data: [144, 120, 130,143,153,124,112,20,53,52,43,52],
      name: '2025',
      emphasis: {
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      },
    },
    //柱形图
    // {
    //   type: 'bar',        // 图表类型：柱状图
    //   data: [120, 180, 150,123,123,134,142,230,123,52,23,56],
    //   label: {
    //     show: true,
    //     position: 'top',
    //     formatter: '{c}'
    //   },
    // }
  ],
  legend: { // 👈 添加图例
    show: true,
    bottom: '0%' // 放在底部
  }
}
/* Methods----------------------------------------------------------------------------------------- */
async function cardsDataReq(){
  let req=await request.get('/api/order/cards',{
    params:{
      time:cardTime.value,
      group:cardGroup.value,
      timeType:cardTimeType.value
    }
  });
  if (req.data.success){
    cardData.value=req.data.data;
  }
}

async function fanChartDataReq(){
  let req=await request.get('/api/order/fanChart',{
    params:{
      time:fanChartTime.value,
      group:fanChartGroup.value,
      timeType:fanChartTimeType.value
    }
  });
  if (req.data.success){
    fanChartOp.series[0].data=req.data.data;
  }
}
async function lineChartDataReq(){
  let req=await request.get('/api/order/lineChart',{
    params:{
      time:lineChartTime.value,
      group:lineChartGroup.value,
      timeType:lineChartTimeType.value,
      type:lineChartType.value
    }
  });
  if (req.data.success){
    countLineChartOp.series[0].data=req.data.data;
  }
}
function lineChartTimeTypeChange(){
  lineChartTime.value='';
}
const handleClick = (event) => {
  alert(` ${event.name}：单量: ${event.value} `)
}
</script>

<style lang="scss" scoped>
.this-card-head{
  height: 30%;
}
/* Flex 样式 */
.line-flex-container{
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
.line-left-flex-container{
  display: flex;
  justify-content: left;
  align-items: center;
  gap: 5px;
}
.column-flex-container{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
@mixin column-flex-container(){
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
@mixin line-flex-container(){
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
@mixin line-left-flex-container(){
  display: flex;
  justify-content: left;
  align-items: center;
  gap: 5px;
}

.line-chart-wrapper {
  width: 80%;
  height: 500px;
  margin: 10px auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.fan-chart-wrapper{
  width: 50%;
}
.todayData{
  width: 50%;
  height: 100%;
}
.this-first-line{
  width: 80%;
  height: 500px;
  margin: 15px auto;
  display: flex;
  gap: 15px;
}
.this-piece{
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
/* 每块的上部分 */
.block-head{
  @include line-left-flex-container();
  width: 100%;
  margin-left: 20px;
  margin-top:10px;
}

.this-cards{
  margin-top: 15px;
  gap: 5px;
  flex-wrap: wrap;
}
.this-cards :deep(.el-card){
  width: 30%;
  height: 200px;
}
:deep(.el-card__body){
  @include column-flex-container();
  height: 100%;
  padding: 10px 20px;
}
:deep(.el-card__body) h6{
  height: 40%;
  text-align: center;
  margin: 0;
}
:deep(.el-card__body) div{
  height: 60%;
}
:deep(.el-card__body) span{
  font-size: 40px;
}
</style>
