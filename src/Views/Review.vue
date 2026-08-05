<template>
  <div ref="allDom" class="reviewContainer">
    <!--    标题行：买家名 + Print 按钮-->
    <div class="headerRow">
      <h3>{{ step1Dom?.buyerName ? step1Dom.buyerName : 'BuyerName' }}</h3>
      <el-button @click="printReport" class="header-button">{{$t('print')}}</el-button>
    </div>

    <!--    悬浮的左侧步骤栏：位置固定始终可见，紧凑排列，点击滚动到对应模块中心-->
    <div class="stepPanel" :style="stepPanelStyle">
      <div v-for="step in steps" :key="step.index" class="stepItem" @click="jumpToModule(step.index)">
        <div class="stepCircle" :class="{'is-active': step.index===activeStepIndex, 'is-success': step.status==='success'}">
          {{ step.index }}
        </div>
        <span class="stepLabel">{{ $t(step.title) }}</span>
      </div>
    </div>

    <!--    三个模块：按序挂载（Step1 完成 → Step2 渲染；Step2 完成 → Step3 渲染）-->
    <div class="moduleBlock" :ref="(el) => setModuleBlock(0, el)">
      <Step1 :ref="setStep1Dom" :allDom="allDom" v-model:buyerNameDto="buyerNameDto" :size="size"/>
      <!-- Step1 末尾：下一步 → 校验并挂载 Step2 -->
      <div class="moduleFooter" v-if="steps[0].status !== 'success'">
        <el-button type="primary" @click="toNextStep" class="header-button">{{$t('nextStep')}}</el-button>
      </div>
    </div>
    <div v-if="steps[0].status==='success'" class="moduleBlock" :ref="(el) => setModuleBlock(1, el)">
      <Step2 :step1Dom="step1Dom" :buyerNameDto="buyerNameDto"/>
      <!-- Step2 末尾：下一步 → 挂载 Step3 -->
      <div class="moduleFooter" v-if="steps[0].status==='success' && steps[1].status !== 'success'">
        <el-button type="primary" @click="toNextStep" class="header-button">{{$t('nextStep')}}</el-button>
      </div>
    </div>
    <div v-if="steps[1].status==='success'" class="moduleBlock" :ref="(el) => setModuleBlock(2, el)">
      <Step3 :step1Dom="step1Dom"/>
    </div>

  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, reactive, ref} from 'vue'
import Step1 from "@/components/review/Step1.vue";
import Step2 from "@/components/review/Step2.vue";
import Step3 from "@/components/review/Step3.vue";

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

//整个组件（滚动容器，Step1 通过 props.allDom 自动滚动，必须保持）
const allDom=ref(null)
const size = 'default'
//dto买家名
const buyerNameDto = ref('')
const step1Dom=ref(null)
// v-for 内用函数 ref 固定引用 Step1 组件实例（字符串 ref 在 v-for 内会收集成数组）
function setStep1Dom(el){
  if(el) step1Dom.value=el
}
//三个模块区块的 DOM（函数 ref 填充，index 0/1/2 对应 step1/2/3）
const moduleBlocks=ref([])
function setModuleBlock(index, el){
  if(el) moduleBlocks.value[index]=el
}
//scroll-spy：当前最接近视口中央的步骤
const activeStepIndex=ref(1)
//悬浮步骤栏的定位（fixed，锚定内容区左侧中部，始终不变）
const stepPanelStyle=reactive({left: '5px', top: '50%'})
function positionStepPanel(){
  const container=allDom.value
  if(!container) return
  const rect=container.getBoundingClientRect()
  stepPanelStyle.left = rect.left + 5 + 'px'
  stepPanelStyle.top = rect.top + rect.height / 2 + 'px'
}
/*function------------------------------------------------------------------------------------------*/
//打印单子
function printReport(){
  steps.forEach(step => step.status='success')
}
//下一步：校验当前步骤 → 标记 success → 挂载下一步模块
async function toNextStep() {
  // Step1 需校验 allCheck；Step2/Step3 无需校验（只有挂载动作）
  if (steps[0].status !== 'success') {
    const ok = await step1Dom.value?.allCheck();
    if (!ok) return;   // 校验不通过，不推进
    steps[0].status = 'success';
    return;
  }
  if (steps[1].status !== 'success') {
    steps[1].status = 'success';
  }
}
//点击步骤圆框 → 滚动 allDom 使对应模块垂直居中（只滚容器，不滚窗口）
function jumpToModule(index){
  const container=allDom.value
  const block=moduleBlocks.value[index - 1]
  if(!container || !block) return
  const containerRect=container.getBoundingClientRect()
  const blockRect=block.getBoundingClientRect()
  const delta=(blockRect.top - containerRect.top) - (container.clientHeight - block.offsetHeight) / 2
  container.scrollTo({top: container.scrollTop + delta, behavior: 'smooth'})
}
//scroll-spy：高亮最接近视口中央的模块
function updateActiveStep(){
  const container=allDom.value
  if(!container) return
  const containerRect=container.getBoundingClientRect()
  const viewportCenter=containerRect.top + container.clientHeight / 2
  let nearest=1
  let minDist=Infinity
  moduleBlocks.value.forEach((block, i) => {
    if(!block) return
    const rect=block.getBoundingClientRect()
    const dist=Math.abs((rect.top + rect.height / 2) - viewportCenter)
    if(dist < minDist){
      minDist=dist
      nearest=i + 1
    }
  })
  activeStepIndex.value=nearest
}

let resizeObserver=null
onMounted(() => {
  allDom.value?.addEventListener('scroll', updateActiveStep)
  positionStepPanel()
  //容器尺寸变化时重新锚定悬浮栏位置
  if(typeof ResizeObserver!=='undefined' && allDom.value){
    resizeObserver=new ResizeObserver(positionStepPanel)
    resizeObserver.observe(allDom.value)
  }
  updateActiveStep()
})
onBeforeUnmount(() => {
  allDom.value?.removeEventListener('scroll', updateActiveStep)
  resizeObserver?.disconnect()
})
</script>

<style lang="scss" scoped>
.reviewContainer{
  height: 100%;
  width: 100%;
  overflow:auto;
}
/*标题行：买家名靠左，Print 靠右*/
.headerRow{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5px 10px;
}
.header-button{
  width: 75px;
  margin-right: 5px;
}
/*模块区块：纵向排列，不再留左侧槽位*/
.moduleBlock{
  margin-bottom: 10px;
}
/*模块末尾的"下一步"按钮行：右对齐*/
.moduleFooter{
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
/*悬浮步骤栏：fixed 锚定内容区左侧中部，位置始终不变*/
.stepPanel{
  position: fixed;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
  padding: 12px 10px;
}
/*步骤项：紧凑排列*/
.stepItem{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
}
.stepCircle{
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--el-color-primary);
  color: var(--el-color-primary);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all .2s;
}
.stepCircle.is-active{
  background: var(--el-color-primary);
  color: #fff;
}
.stepCircle.is-success{
  border-color: var(--el-color-success);
  color: var(--el-color-success);
}
.stepLabel{
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
</style>
