<template>
  <div class="paramsContainer thisBlock">
    <div class="sharedParametersContainer">
      <div class="pieceContainer">
        <!-- Care Label 和 Sample Composition 左右并排 -->
        <div class="oneLinePiece">
          <!-- Care Label 框体 -->
          <div class="thisPiece careLabelContainer">
            <span class="paramTitle">{{$t('careLabel')}}</span>
            <div class="careLabelWrapper">
              <!-- 洗标选择 -->
              <div class="careLabelLeft">
                <CareLabelSelect class="pieceContent" v-model="careLabelData" />

                <div class="specialCareContent">
                  <div class="careInstructionItem">
                    <span class="instructionLabel">{{$t('AfterWashing')}}</span>
                    <AfterWashingSelect class="pieceContent" :afterWashItems="afterWashItems" :sampleSummary="allSample" />
                  </div>
                  <div class="careInstructionItem">
                    <span class="instructionLabel">{{$t('Detergent')}}</span>
                    <DetergentSelect class="pieceContent" :detergentItems="detergentItems" :sampleSummary="allSample" />
                  </div>
                  <!-- Special Care Instruction + After Iron 同一行 -->
                  <div class="careInstructionItem combinedCareRow">
                    <span class="instructionLabel">{{$t('After Iron')}}</span>
                    <el-select v-model="afterIronValue" placeholder="" style="width: 200px">
                      <el-option v-for="option in afterIronOptions"
                                 :key="option.value"
                                 :value="option.value"
                                 :label="option.label" />
                    </el-select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sample Composition 独立框体（与 CareLabel 同级） -->
          <div class="thisPiece compositionPiece">
            <span class="paramTitle">{{$t('sampleComposition')}}</span>
            <SampleSpecificComposition class="pieceContent"
                                       @confirm="handleRowsSingle"
                                       :sampleSummary="allSample" />
          </div>
        </div>

        <!-- Sample Description 独立一行 -->
        <div class="thisPiece descriptionPiece">
          <span class="paramTitle">{{$t('sampleDescription')}}</span>
          <SampleSpecificDescrip class="pieceContent"
                                 :sampleSummary="allSample"
                                 :buyerNameDto="buyerNameDto"
                                 ref="sampleSpecificDescripDoM" />
        </div>

        <!-- 其他参数 -->
        <div class="thisPiece otherParamsPiece">
          <span class="paramTitle">{{$t('otherParameters')}}</span>
          <div class="pieceContent otherParamsContainer">
            <div class="line-flex-container" v-for="param in orderParams" :key="param.name">
              <label>{{ $t(param.name) }}</label>
              <el-input v-model="param.value" v-if="param.type==='input'"
                        style="width: 100px"></el-input>
              <el-select v-model="param.value" v-else-if="param.type==='select'"
                         placeholder=""
                         :empty-values="[null,undefined]"
                         style="width: 200px">
                <el-option v-for="option in param.options" :key="option.value" :value="option.value" :label="option.label">
                </el-option>
              </el-select>
              <el-select v-model="param.value" v-else multiple style="width: 100px" :empty-values="[null,undefined]">
                <el-option v-for="option in param.options" :key="option.value" :value="option.value" :label="option.label">
                </el-option>
              </el-select>
            </div>
          </div>
        </div>

        <!-- 接缝参数 -->
        <div class="thisPiece seamPiece" v-if="seamSamples.length>0">
          <span class="paramTitle">{{$t('seamParameter')}}</span>
          <SeamRequire class="pieceContent" :seamSamples="seamSamples"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import CareLabelSelect from "@/components/review/CareLabelSelect.vue";
import {computed, reactive, ref} from "vue";
import SampleSpecificComposition from "@/components/review/SampleSpecificComposition.vue";
import SampleSpecificDescrip from "@/components/review/SampleSpecificDescrip.vue";
import SeamRequire from "@/components/review/ItemRequire/SeamRequire.vue";
import AfterWashingSelect from "@/components/review/ItemRequire/AfterWashingSelect.vue";
import DetergentSelect from "@/components/review/ItemRequire/DetergentSelect.vue";

const props=defineProps({
  step1Dom: Object,
  buyerNameDto: String,
})

const afterWashItems=ref(["item1","item2"])
const detergentItems=ref(["item1","item2"])

// AfterIron 数据（现在作为 Special Care Instruction 的值）
const afterIronValue = ref('')
const afterIronOptions = [
  { label:'After Iron', value:'After Iron' },
  { label:'Before and After Iron', value:'Before and After Iron' },
  { label:'Do Not Iron', value:'' }
]

//洗标数据
const careLabelData=ref({
  selectedWashingProcedure:{
    value:'',
    label: '',
    src:[new URL('../../assets/img/wet Care Label/Europe/Washing/No Wash.jpg', import.meta.url).href]
  },
  selectedDryProcedure:{
    value:'',
    label: '',
    src:[new URL('../../assets/img/wet Care Label/Europe/Dry/Do not tumble dry.jpg', import.meta.url).href]
  },
  selectedDCProcedure:{
    value:'',
    label: '',
    src:[new URL('../../assets/img/wet Care Label/Europe/DC/Do not dry-clean.jpg', import.meta.url).href]
  },
  selectedIronMethod:{
    value:'',
    label: '',
    src:[new URL('../../assets/img/wet Care Label/Europe/Iron/Do not iron.jpg', import.meta.url).href]
  },
  selectedBleachProcedure:{
    value:'',
    label: '',
    src:[new URL('../../assets/img/wet Care Label/Europe/Bleach/Do not bleach.jpg', import.meta.url).href]
  }
})

//根据menus获取所有smaple
let allSample=computed(()=>{
  let samples=new Set()
  props.step1Dom?.menus?.forEach(menu=>{
    //分组
    if(menu.groups){
      menu.groups.forEach(group=>{
        group.items.forEach(item=>{
          item.samples.forEach(sample=>{
            samples.add(sample)
          })
        })
      })
    }else{
      menu.items.forEach(item=>{
        item.samples.forEach(sample=>{
          samples.add(sample)
        })
      })
    }
  })
  return Array.from(samples).sort()
})

//订单参数 (移除 afterIron，因为它已移到 Care Label 中)
const orderParams = ref([
  // 可以在这里添加其他参数
])

//和样品绑定的成分
const fiberCompositionSingle=ref([])

//接缝样品
const seamSamples = computed(() => {
  let seamSamplesSet = new Set()
  props.step1Dom?.menus?.forEach(menu=>{
    //如果有groups
    if(menu.groups){
      menu.groups.forEach(group=>{
        group.items.forEach(item => {
          if (item.itemName.includes('Seam'))
            item.samples.forEach(sample => {
              seamSamplesSet.add(sample)
            })
        })
      })
    }else {
      menu.items.forEach(item => {
        if (item.itemName.includes('Seam'))
          item.samples.forEach(sample => {
            seamSamplesSet.add(sample)
          })
      })
    }
  })
  return [...seamSamplesSet].sort()
})

//获取成分
const handleRowsSingle = (fiberCom) => {
  fiberCompositionSingle.value = fiberCom;
};

</script>

<style scoped lang="scss">
.paramsContainer {
  @include column-left-flex-container;
  align-items: stretch;
  padding: 8px 12px;
  --h1-color: #1a2332;
  --border-first-level: none;
  --border-second-level: none;
  gap: 20px;
}

.paramsContainer > div {
  padding: 4px 6px;
}

.thisBlock {
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  padding: 16px 20px 20px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.blockTitle {
  font-size: 24px;
  font-weight: 600;
  color: var(--h1-color);
  letter-spacing: 0.3px;
}

/* ========== 主标题样式 ========== */
.paramTitle {
  font-size: 18px;
  font-weight: 600;
  color: var(--h1-color);
  align-self: flex-start;
  position: relative;
  padding-bottom: 6px;
  letter-spacing: 0.2px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 32px;
    height: 3px;
    background: var(--el-color-primary);
    border-radius: 2px;
    transition: width 0.25s ease;
  }

  &:hover::after {
    width: 48px;
  }
}

/* ========== 各个模块卡片样式 ========== */
.thisPiece {
  @include column-up-flex-container;
  align-items: stretch;
  gap: 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px 20px;
  background-color: #f8fafc;
  width: 100%;
  transition: all 0.25s ease;
  position: relative;
  overflow: visible;  /* 改为 visible，防止溢出被裁剪 */

  &:hover {
    border-color: #c8d2e0;
    background-color: #f6f9fe;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  }
}

/* ========== 一行两列布局 ========== */
.oneLinePiece {
  @include line-stretch-flex-container;
  gap: 18px;
  border: none;
  border-radius: 0;
  width: 100%;
  padding: 0;

  .thisPiece {
    flex: 1;
    min-width: 260px;
  }
}

/* ========== Care Label 区域 ========== */
  .careLabelContainer {
    @include column-left-flex-container;
    gap: 2px;
    background: #f7f8f8;
    border-color: #d0ddee;
    overflow: visible;

    &:hover {
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
    }
  }

.careLabelWrapper {
  @include column-stretch-flex-container;
  gap: 8px;
  width: 100%;
  padding-top: 4px;
  overflow: visible;
}

.careLabelLeft {
  width: 100%;
  padding: 14px 18px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  overflow: visible;

  .pieceContent {
    padding: 2px 0;
  }
}

/* ========== Composition 独立样式 ========== */
  .compositionPiece {
    background: #f7f8f8;
    border-color: #d0ddee;
    overflow: visible;

    &:hover {
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.06);
    }
  }

  .descriptionPiece {
    background: #f7f8f8;
    border-color: #d0e4d0;

    &:hover {
      box-shadow: 0 4px 14px rgba(34, 197, 94, 0.06);
    }
  }

/* ========== 子标题 ========== */
.subTitle {
  font-size: 15px;
  font-weight: 600;
  color: var(--h1-color);
  align-self: flex-start;
  padding-bottom: 8px;
  margin-top: 4px;
  border-bottom: 2px solid var(--el-color-primary-light-7);
  width: 100%;
  letter-spacing: 0.2px;
}

/* ========== Special Care 内容 ========== */
.specialCareContent {
  @include column-stretch-flex-container;
  gap: 12px;
  margin-top: 2px;
}

.careInstructionItem {
  @include line-left-flex-container;
  gap: 16px;
  align-items: center;
  padding: 8px 14px;
  border-radius: 8px;
  background: #f8fafd;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    background: #f0f4fe;
    border-color: var(--el-color-primary-light-7);
  }

  .instructionLabel {
    font-size: 14px;
    font-weight: 500;
    min-width: 120px;
    color: #374151;
    letter-spacing: 0.1px;
  }

  .pieceContent {
    padding: 0;
    flex: 1;
  }
}

/* 合并行样式 - Special Care Instruction + After Iron 同一行 */
.combinedCareRow {
  .instructionLabel {
    min-width: 160px;
  }
}

/* ========== 其他参数 ========== */
.otherParamsPiece {
  background: #f7faff;
  border-color: #dbe2ec;

  &:hover {
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.06);
  }
}

.otherParamsContainer {
  @include line-left-flex-container;
  flex-wrap: wrap;
  gap: 12px 28px;
  padding: 6px 2px;

  .line-flex-container {
    @include line-left-flex-container;
    gap: 12px;
    align-items: center;
    padding: 6px 0;

    label {
      font-size: 14px;
      font-weight: 500;
      color: #4b5563;
      min-width: 88px;
      letter-spacing: 0.1px;
    }
  }
}

/* ========== 接缝参数 ========== */
.seamPiece {
  background: #f8fdf8;
  border-color: #d0e4d0;

  &:hover {
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.06);
  }
}

/* ========== 通用内容容器 ========== */
.pieceContent {
  background-color: transparent;
  border-radius: 6px;
  padding: 4px 0;
}

.pieceContainer {
  @include column-stretch-flex-container;
  gap: 20px;
}

/* ========== 响应式适配 ========== */

/* 平板及以下：两列变一列 */
@media (max-width: 1024px) {
  .oneLinePiece {
    flex-direction: column;
    gap: 14px;
  }

  .oneLinePiece .thisPiece {
    min-width: unset;
    width: 100%;
  }
}

/* 小屏设备 */
@media (max-width: 768px) {
  .paramsContainer {
    padding: 4px 8px;
    gap: 16px;
  }

  .thisBlock {
    padding: 12px 14px 16px;
    border-radius: 10px;
  }

  .thisPiece {
    padding: 14px 14px;
    gap: 12px;
    border-radius: 8px;
  }

  .paramTitle {
    font-size: 16px;
    padding-bottom: 4px;

    &::after {
      width: 24px;
      height: 2.5px;
    }
  }

  .subTitle {
    font-size: 14px;
    padding-bottom: 6px;
  }

  .careLabelLeft {
    padding: 12px 14px;
  }

  .careInstructionItem {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    padding: 10px 12px;

    .instructionLabel {
      min-width: unset;
      font-size: 13px;
      font-weight: 600;
    }
  }

  .otherParamsContainer {
    gap: 8px 16px;

    .line-flex-container {
      flex-wrap: wrap;
      gap: 8px;
      width: 100%;

      label {
        min-width: 70px;
        font-size: 13px;
      }
    }
  }

  .pieceContainer {
    gap: 14px;
  }
}

/* 手机端 */
@media (max-width: 480px) {
  .thisBlock {
    padding: 10px 10px 14px;
    border-radius: 8px;
  }

  .thisPiece {
    padding: 10px 12px;
    gap: 10px;
  }

  .paramTitle {
    font-size: 15px;
  }

  .careLabelLeft {
    padding: 10px 10px;
  }

  .specialCareContent {
    gap: 8px;
  }

  .careInstructionItem {
    padding: 8px 10px;
    border-radius: 6px;
  }

  .otherParamsContainer .line-flex-container {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;

    label {
      min-width: unset;
    }
  }
}
</style>
