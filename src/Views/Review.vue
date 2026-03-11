<template>
  <div ref="allDom" class="reviewContainer">
    <h3>{{ step1Dom?.buyerName ? step1Dom.buyerName : 'BuyerName' }}</h3>
    <div class="reviewSteps">
      <el-steps :active="3" align-center style="flex:1">
        <el-step v-for="step in steps" class="myStep" :key="step.index" :status="step.status" :title="$t(step.title)" @click="toCertainStep(step.index)"/>
      </el-steps>
      <el-button v-if="thisStepIndex!==steps.length" @click="toNextStep" class="header-button">{{$t('nextStep')}}</el-button>
      <el-button v-else @click="printReport" class="header-button">{{$t('print')}}</el-button>
    </div>

<!--    第一步-->
    <Step1 ref="step1Dom" v-show="thisStepIndex===1" :allDom="allDom" v-model:buyerNameDto="buyerNameDto" :size="size"/>

<!--    第二步-->
    <Step2 :step1Dom="step1Dom" :buyerNameDto="buyerNameDto" v-if="steps[0].status==='success'" v-show="thisStepIndex===2" />
<!--    第三步-->
    <step3 :step1Dom="step1Dom" v-if="steps[1].status==='success'" v-show="thisStepIndex===3"/>

  </div>
</template>

<script setup>
import {inject, onBeforeUnmount, onMounted, reactive, ref} from 'vue'
import Step1 from "@/components/review/Step1.vue";
import Step2 from "@/components/review/Step2.vue";
import globalFunctions from "@/utils/globalFunctions.js";
import Step3 from "@/components/review/Step3.vue";

const request=inject('request')
//活跃的步骤
const thisStepIndex = ref(1)
//步骤信息
const steps=reactive([
  {
    index: 1,
    title: 'step1',
    status:'process'
  },
  {
    index: 2,
    title: 'step2',
    status:'wait'
  },
  {
    index: 3,
    title: 'step3',
    status:'wait'
  }
])

//整个组件
const allDom=ref(null)
const size = 'default'
// //套餐信息
// const menus=ref([])
//dto买家名
const buyerNameDto = ref('')
const step1Dom=ref(null)
/*function------------------------------------------------------------------------------------------*/
//打印单子
function printReport(){
  steps[thisStepIndex.value - 1].status='success'
}
// //上一步
// function toLastStep() {
//   if (thisStepIndex.value > 1)
//     thisStepIndex.value--
// }
//下一步
async function toNextStep() {
  // 第一步
  if(thisStepIndex.value===1){
    let result=await step1Dom.value.allCheck()
    if(!result) return
  }
  steps[thisStepIndex.value - 1].status='success'
  thisStepIndex.value++
}
//步骤跳转
function toCertainStep(index){
  //向后，仅允许下一步
  if(thisStepIndex.value<index){
    //下一步
    if(thisStepIndex.value===index-1)
      toNextStep()
  }else
  //向前，随便
  thisStepIndex.value=index
}
</script>

<style lang="scss" scoped>
.reviewContainer{
  height: 100%;
  width: 100%;
  overflow:auto;
}
.step-title {
  font-size: 20px;
  font-weight: bold;
}

.reviewSteps{
  @include line-left-flex-container;
  width: 90%;
  margin:0 auto 10px;
}
.header-button{
  width: 75px;
  margin-right: 5px;
}
.myStep:hover{
  background-color: rgba(233, 238, 246, 0.2);
  box-shadow: var(--el-box-shadow-light);
  cursor: pointer;
}
</style>
