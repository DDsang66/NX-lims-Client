<template>
  <div ref="allDom" class="reviewContainer">
    <!--    标题行：买家名 + Print 按钮-->
    <div class="headerRow">
      <h3>{{ step1Dom?.buyerName ? step1Dom.buyerName : 'BuyerName' }}</h3>
    </div>

    <!--    悬浮的左侧步骤栏：位置固定始终可见，紧凑排列，点击滚动到对应模块中心-->
    <div class="stepPanel" :style="stepPanelStyle">
      <div v-for="step in steps" :key="step.index" class="stepItem" @click="jumpToModule(step.index)">
        <div class="stepCircle" :class="{'is-active': step.index===activeStepIndex, 'is-success': step.status==='success'}">
          {{ step.index }}
        </div>
        <span class="stepLabel">{{ $t(step.title) }}</span>

        <!-- 新增：悬停弹出的操作按钮面板 -->
        <div class="actionPanel">
          <!-- Step 1 的按钮 -->
          <template v-if="step.index === 1">
            <el-button size="small" type="primary" plain @click.stop="handleRegenerateCheckList">
              Regenerate CheckList
            </el-button>
          </template>

          <!-- Step 2 的按钮 -->
          <template v-if="step.index === 2">
            <el-button size="small" type="primary" plain @click.stop="handleCalculate">
              Calculate
            </el-button>
          </template>

          <!-- Step 3 的按钮 -->
          <template v-if="step.index === 3">
            <el-button size="small" type="danger" plain @click.stop="handleClear">
              Clear
            </el-button>
          </template>
        </div>
      </div>
    </div>

    <!--    三个模块：按序挂载（Step1 完成 → Step2 渲染；Step2 完成 → Step3 渲染）-->
    <div class="moduleBlock" :ref="(el) => setModuleBlock(0, el)">
      <Step1 ref="step1Ref"
             :allDom="allDom"
             v-model:buyerNameDto="buyerNameDto"
             :size="size"
             @update:step1Data="handleStep1Data"
             @update:buyerCode="buyerCode = $event"
             @update:buyerIsIndividualTraveler="buyerIsIndividualTraveler = $event"
             @update:regeneratedData="handleStep1Regenerated" />

      <!-- Step1 末尾：下一步 → 校验并挂载 Step2 -->
      <div class="moduleFooter" v-if="steps[0].status !== 'success'">
        <el-button type="primary" @click="toNextStep" class="header-button">{{$t('nextStep')}}</el-button>
      </div>
    </div>
    <div v-if="steps[0].status==='success'" class="moduleBlock" :ref="(el) => setModuleBlock(1, el)">
      <div v-if="isStepDataStale" class="stale-overlay">
        <el-alert type="warning" :closable="false" show-icon style="margin-bottom: 10px;">
          <template #title>
            Step 1 data has been modified. Please click the "Regenerate CheckList" button in the left panel to update.
          </template>
        </el-alert>
      </div>

      <Step2 ref="step2Ref"
             :class="{'is-disabled': isStepDataStale}"
             :step1Ref="step1Ref"
             :buyerNameDto="buyerNameDto"
             :buyerCode="buyerCode"
             :buyerIsIndividualTraveler="buyerIsIndividualTraveler"
             :step1Data="step1Data" />

      <!-- Step2 末尾：下一步 → 挂载 Step3 -->
      <div class="moduleFooter" v-if="steps[0].status==='success' && steps[1].status !== 'success'">
        <el-button type="primary" :disabled="isStepDataStale"
                   @click="submitStep2AndNext" class="header-button">
          {{$t('nextStep')}}
        </el-button>
      </div>

      <div v-if="steps[1].status==='success'" class="moduleBlock" :ref="(el) => setModuleBlock(2, el)">
        <Step3 ref="step3Ref"
               :step1Ref="step1Ref"
               :step2Data="step2Result"
               :testItemMap="testItemMap"
               :standardIdToCodeMap="standardIdToCodeMap"
               @rebuild="handleReBuild" />
      </div>

    </div>
  </div>
</template>

<script setup>
  import { onBeforeUnmount, onMounted, reactive, ref, nextTick, watch } from 'vue'
  import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import Step1 from "@/components/review/Step1.vue";
import Step2 from "@/components/review/Step2.vue";
import Step3 from "@/components/review/Step3.vue";

  let loadingInstance = null 
  const step1Data = ref(null)
  const step2Ref = ref(null)
  const step3Ref = ref(null)
  const step2Result = ref(null)
  const isStepDataStale = ref(false) // 数据是否过期（需要重新生成）
  const step1Ref = ref(null) // Step1 的 ref
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

  const testItemMap = ref({})
  const standardIdToCodeMap = ref({})

  function handleStep1Data(data) {
    console.log('Step1 data:', data)
    step1Data.value = data

    // 使用 step1Ref 而不是 step1Dom
    if (step1Ref.value) {
      console.log('step1Ref:', step1Ref.value)
      console.log('step1Ref.testItemMap:', step1Ref.value?.testItemMap)
      console.log('step1Ref.standardIdToCodeMap:', step1Ref.value?.standardIdToCodeMap)

      testItemMap.value = step1Ref.value?.testItemMap || {}
      standardIdToCodeMap.value = step1Ref.value?.standardIdToCodeMap || {}

      console.log('testItemMap set to:', testItemMap.value)
      console.log('standardIdToCodeMap set to:', standardIdToCodeMap.value)
    } else {
      console.warn('step1Ref is not set yet')
    }
  }



//整个组件（滚动容器，Step1 通过 props.allDom 自动滚动，必须保持）
const allDom=ref(null)
const size = 'default'
  //dto买家名
  const buyerNameDto = ref('')
  const buyerCode = ref('')
  const buyerIsIndividualTraveler = ref(false)
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
    console.log('toNextStep called')

    // 确保组件已经挂载
    await nextTick()

    // 检查 step1Ref 是否设置
    if (!step1Ref.value) {
      console.error('step1Ref is not set')
      ElMessage.error('Step1 component is not ready yet')
      return
    }

    console.log('step1Ref after nextTick:', step1Ref.value)

    // Step1 需校验 allCheck；Step2/Step3 无需校验（只有挂载动作）
    if (steps[0].status !== 'success') {
      try {
        const ok = await step1Ref.value.allCheck()
        if (!ok) return   // 校验不通过，不推进
        steps[0].status = 'success'
      } catch (error) {
        console.error('Error in Step1 validation:', error)
        ElMessage.error('Failed to validate Step1')
        return
      }
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

  async function submitStep2AndNext() {
    if (!step2Ref.value) {
      console.error('step2Ref is null')
      return
    }

    // 👇 开启全屏 Loading
    loadingInstance = ElLoading.service({
      fullscreen: true,
      text: '服务器执行计算，请耐心等待...',
      background: 'rgba(0, 0, 0, 0.7)',
      customClass: 'custom-loading-class'
    })

    try {
      const result = await step2Ref.value.submitConditions()

      if (result) {
        step2Result.value = result
        steps[1].status = 'success'

        // 👇 等待 Step3 渲染完成，关闭 loading
        await nextTick()
        // 额外等待一下确保 Step3 数据渲染完成
        await new Promise(resolve => setTimeout(resolve, 300))

        loadingInstance.close()
        loadingInstance = null

        ElMessage.success('Checklist 生成成功！')
      } else {
        // 如果失败，关闭 loading 并提示
        loadingInstance.close()
        loadingInstance = null
        ElMessage.error('生成失败，请检查参数后重试')
      }
    } catch (error) {
      console.error('Submit error:', error)
      if (loadingInstance) {
        loadingInstance.close()
        loadingInstance = null
      }
      ElMessage.error('提交失败，请重试')
    }
  }

  // 处理 ReBuild：回到 Step2 重新提交
  async function handleReBuild() {
    // 重置 Step2 状态
    steps[1].status = 'wait'
    step2Result.value = null
    isStepDataStale.value = false 
    // 如果 Step3 已渲染，重置其数据
    if (step3Ref.value) {
      step3Ref.value.setCheckListData(null)
    }

    // 等待 DOM 更新后重新聚焦到 Step2
    await nextTick()
    jumpToModule(2)

    ElMessage.info('已返回 Step2，请修改参数后重新生成')
  }

  // 如果需要在 Step2 重新提交后更新 Step3
  async function reSubmitStep2() {
    const result = await step2Ref.value.submitConditions()
    if (result) {
      step2Result.value = result
      steps[1].status = 'success'
      // 更新 Step3 数据
      await nextTick()
      step3Ref.value?.setCheckListData(result)
    }
  }

let resizeObserver=null
  onMounted(() => {
    console.log('step1Ref after mount:', step1Ref.value)
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



  // 在 setup 或 methods 中添加
  const handleRegenerateCheckList = async () => {

    if (!step1Ref.value) {
      console.error('Step1 ref is not set')
      return
    }

    try {
      console.log('Calling regenerateCheckList...')
      const result = await step1Ref.value.regenerateCheckList()
      console.log('Regenerate result:', result)

      if (result) {
        // 更新状态
        isStepDataStale.value = false

        // 触发 Step2 更新
        if (step2Ref.value && step2Ref.value.loadConditions) {
          step2Ref.value.loadConditions(result.conditionPoolId)
        }
      }
    } catch (error) {
      console.error('Error in handleRegenerateCheckList:', error)
      ElMessage.error('Failed to regenerate checklist')
    }
  }

  // 2. 监听 Step1 数据变化 (假设 step1Data 是个 reactive 对象)
  // 当 Step2 或 Step3 已经开始（即 steps[1].status === 'success'），修改 Step1 触发锁定
  watch(
    () => step1Data.value,
    (newVal, oldVal) => {
      if (steps[0].status !== 'success') return
      // 只有内容真的变了才置 stale，避免初始化/重复 emit 误报
      if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
      isStepDataStale.value = true
    },
    { deep: true }
  )

  // 3. Step1 触发 regeneratedData 事件的处理 (如果不用 ref 调用，也可以用 emit 监听)
  // 如果是通过 @update:regeneratedData 绑定：
  // 在父组件中
  const handleStep1Regenerated = (data) => {
    console.log('Step1 data regenerated:', data)
    isStepDataStale.value = false
    if (step2Ref.value && step2Ref.value.loadConditions) {
      step2Ref.value.loadConditions(data.conditionPoolId)
    }

    if (step1Data.value) {
      step1Data.value = {
        ...step1Data.value,
        conditionPoolId: data.conditionPoolId ?? null,
        checkListId: data.checkListId ?? null,
        // reportNo 若也有变化，一并回写（新单场景 reportNo 一定变了）
        reportNo: step1Ref.value?.reportNo ?? step1Data.value.reportNo
      }
    }


    // 新单：Step3 的旧数据失效，退回 Step2 待提交状态
    if (data.isNewOrder && steps[1].status === 'success') {
      steps[1].status = 'wait'
      step2Result.value = null
      ElMessage.info('检测到新单号，已创建新的 CheckList，请重新提交 Step2 生成结果')
    }
  }


  const handleCalculate = async () => {
    console.log('Calculate clicked')

    if (!step2Ref.value) {
      console.error('step2Ref is null')
      return
    }

    // 场景 A：Step2 已提交过，Calculate 只是重算 → 无副作用，直接调
    if (steps[1].status === 'success') {
      const result = await step2Ref.value.submitConditions()
      if (result) {
        step2Result.value = result
        ElMessage.success('Calculate 完成，结果已更新')
      }
      return
    }

    // 场景 B：Step2 尚未提交，Calculate 等价于「提交并下一步」
    // 直接复用已有逻辑，保证 Loading / 状态推进 / Step3 渲染都一致
    await submitStep2AndNext()
  }

  const handleClear = async () => {
    // 二次确认，避免误点
    try {
      await ElMessageBox.confirm(
        '确定要清除所有步骤的数据吗？此操作不可撤销。',
        '清除确认',
        { type: 'warning', confirmButtonText: '清除', cancelButtonText: '取消' }
      )
    } catch {
      return // 用户取消
    }

    // 1. 清 Step1 内部数据（表单、menus、samples、currentCheckListId）
    if (step1Ref.value?.clearAll) {
      step1Ref.value.clearAll()
    }

    // 2. 清父组件持有的 Step1 派生数据
    step1Data.value = null
    testItemMap.value = {}
    standardIdToCodeMap.value = {}
    buyerCode.value = ''
    buyerIsIndividualTraveler.value = false
    buyerNameDto.value = ''

    // 3. 清 Step2 / Step3 结果
    step2Result.value = null
    if (step3Ref.value?.setCheckListData) {
      step3Ref.value.setCheckListData(null)
    }

    // 4. 清状态标记
    isStepDataStale.value = false

    // 5. 重置步骤状态：只有 Step1 是 process，其余 wait
    steps[0].status = 'process'
    steps[1].status = 'wait'
    steps[2].status = 'wait'

    // 6. 等 DOM 更新后回到 Step1 并滚到顶部
    await nextTick()
    activeStepIndex.value = 1
    allDom.value?.scrollTo({ top: 0, behavior: 'smooth' })

    ElMessage.success('已清除所有步骤数据')
  }
</script>

<style lang="scss" scoped>
  .custom-loading-class {
    .el-loading-text {
      font-size: 16px;
      color: #fff;
      letter-spacing: 1px;
    }

    .el-loading-spinner {
      .circular {
        width: 50px;
        height: 50px;
      }
    }
  }
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
  .stepItem {
    position: relative;
    cursor: pointer;
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

  /* 悬浮操作面板基础样式 */
  .actionPanel {
    position: absolute;
    left: 100%; /* 定位在步骤项的右侧 */
    top: 50%;
    transform: translateY(-50%);
    margin-left: 12px; /* 与步骤栏保持一点间距 */

    display: flex;
    flex-direction: column; /* 如果有多个按钮可以纵向排列 */
    gap: 8px;
    background-color: #fff;
    padding: 10px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid #e4e7ed;
    white-space: nowrap; /* 防止按钮文字换行 */
    z-index: 100;
    /* 默认隐藏且不可点击 */
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease-in-out;
  }
  /* 鼠标悬停在 stepItem 时，显示操作面板 */
  .stepItem:hover .actionPanel {
    opacity: 1;
    pointer-events: auto;
  }

  /* 鼠标悬停在操作面板本身时，保持显示（防止鼠标移向按钮时面板消失） */
  .actionPanel:hover {
    opacity: 1;
    pointer-events: auto;
  }

  /* 可选：给弹出的小三角加个伪元素（更美观） */
  .actionPanel::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-right-color: #e4e7ed; /* 边框颜色 */
  }

  .actionPanel::after {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-right-color: #fff; /* 背景颜色 */
  }

  /* 锁定提示层 */
  .stale-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 40px;
    pointer-events: none; /* 允许点击穿透到背后的遮罩，但阻止了表单交互 */
  }

  /* 让被遮罩的 Step2 看起来变灰 */
  .is-disabled {
    opacity: 0.5;
    pointer-events: none; /* 彻底禁止交互 */
  }

  /* 确保 moduleBlock 具备相对定位，以支撑遮罩层 */
  .moduleBlock {
    position: relative;
  }
</style>
