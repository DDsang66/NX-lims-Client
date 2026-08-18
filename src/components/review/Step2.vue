<template>
  <div class="paramsContainer thisBlock">
    <div class="sharedParametersContainer">
      <div class="pieceContainer">
        <!-- Care Label 框体 -->
        <div class="thisPiece careLabelContainer">
          <span class="paramTitle">{{$t('careLabel')}}</span>
          <div class="careLabelWrapper">
            <!-- 左侧：洗标选择 -->
            <div class="careLabelLeft">
              <CareLabelSelect class="pieceContent" v-model="careLabelData" />
            </div>

            <!-- 右侧：Special Care Instruction -->
            <div class="careLabelRight">
              <span class="subTitle">{{$t('General Care Instruction')}}</span>
              <div class="specialCareContent">
                <div class="careInstructionItem">
                  <span class="instructionLabel">{{$t('afterWashing')}}</span>
                  <AfterWashingSelect class="pieceContent" :afterWashItems="afterWashItems" :sampleSummary="allSample" />
                </div>
                <div class="careInstructionItem">
                  <span class="instructionLabel">{{$t('detergent')}}</span>
                  <DetergentSelect class="pieceContent" :detergentItems="detergentItems" :sampleSummary="allSample" />
                </div>
                <div class="careInstructionItem">
                  <span class="instructionLabel">{{$t('afterIron')}}</span>
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

        <!-- 样品成分 & 样品描述 -->
        <div class="oneLinePiece">
          <div class="thisPiece compositionPiece">
            <span class="paramTitle">{{$t('sampleComposition')}}</span>
            <SampleSpecificComposition
              class="pieceContent"
              @confirm="handleRowsSingle"
              :sampleSummary="allSample"
            />
          </div>
          <div class="thisPiece descriptionPiece">
            <span class="paramTitle">{{$t('sampleDescription')}}</span>
            <SampleSpecificDescrip
              class="pieceContent"
              :sampleSummary="allSample"
              :buyerNameDto="buyerNameDto"
              ref="sampleSpecificDescripDoM"
            />
          </div>
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

// AfterIron 数据
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
  padding: 5px;
  --h1-color: #111827;
  --border-first-level: none;
  --border-second-level: none;
  gap: 15px;
}

.paramsContainer > div {
  padding: 5px;
}

.thisBlock {
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  padding: 10px;
}

.blockTitle {
  font-size: 26px;
  font-weight: bold;
  color: var(--h1-color);
}

/* ========== 主标题样式 ========== */
.paramTitle {
  font-size: 22px;
  font-weight: bold;
  color: var(--h1-color);
  align-self: flex-start;
  position: relative;
  
  /* 添加下划线装饰，让标题更突出 */
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 40px;
    height: 3px;
    background: var(--el-color-primary);
    border-radius: 2px;
  }
}

/* ========== 各个模块卡片样式 ========== */
.thisPiece {
  @include column-up-flex-container;
  align-items: stretch;
  gap: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 15px 20px;
  background-color: #fafbfc;
  width: 100%;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--el-border-color);
    background-color: #f8f9fa;
  }
}

/* ========== 一行两列布局 ========== */
.oneLinePiece {
  @include line-stretch-flex-container;
  gap: 15px;
  border: none;
  border-radius: 0;
  width: 100%;
  padding: 0;
  
  .thisPiece {
    flex: 1;
    min-width: 250px;
  }
}

/* ========== Care Label 区域 ========== */
.careLabelContainer {
  @include column-left-flex-container;
  gap: 0;
  background: #f8faff;
  border-color: #d4e0f0;
}

.careLabelWrapper {
  @include line-stretch-flex-container;
  gap: 25px;
  align-items: stretch;
  width: 100%;
  padding-top: 5px;
}

.careLabelLeft {
  flex: 1;
  min-width: 300px;
  padding: 10px 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  
  .pieceContent {
    padding: 0;
  }
}

.careLabelRight {
  flex: 1;
  min-width: 300px;
  @include column-stretch-flex-container;
  gap: 10px;
  padding: 10px 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

/* ========== 子标题 ========== */
.subTitle {
  font-size: 17px;
  font-weight: 600;
  color: var(--h1-color);
  align-self: flex-start;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--el-color-primary-light-8);
  width: 100%;
}

/* ========== Special Care 内容 ========== */
.specialCareContent {
  @include column-stretch-flex-container;
  gap: 10px;
}

.careInstructionItem {
  @include line-left-flex-container;
  gap: 15px;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  background: #f8f9fc;
  transition: background 0.15s ease;
  
  &:hover {
    background: #f0f2f7;
  }

  .instructionLabel {
    font-size: 15px;
    font-weight: 500;
    min-width: 100px;
    color: #374151;
  }

  .pieceContent {
    padding: 0;
    flex: 1;
  }
}

/* ========== 其他参数 ========== */
.otherParamsPiece {
  background: #fafcfe;
  border-color: #dce4ec;
}

.otherParamsContainer {
  @include line-left-flex-container;
  flex-wrap: wrap;
  gap: 15px 30px;
  padding: 5px 0;
  
  .line-flex-container {
    @include line-left-flex-container;
    gap: 10px;
    align-items: center;
    padding: 4px 0;
    
    label {
      font-size: 14px;
      font-weight: 500;
      color: #4b5563;
      min-width: 80px;
    }
  }
}

/* ========== 接缝参数 ========== */
.seamPiece {
  background: #fafff8;
  border-color: #d4e8d4;
}

/* ========== 组成和描述特殊样式 ========== */
.compositionPiece {
  background: #f8faff;
  border-color: #d4e0f0;
}

.descriptionPiece {
  background: #fafffa;
  border-color: #d4e8d4;
}

/* ========== 通用内容容器 ========== */
.pieceContent {
  background-color: transparent;
  border-radius: 5px;
  padding: 5px 0;
}

.pieceContainer {
  @include column-stretch-flex-container;
  gap: 20px;
}

/* ========== 响应式适配 ========== */
@media (max-width: 992px) {
  .careLabelWrapper {
    flex-direction: column;
    gap: 15px;
  }
  
  .careLabelLeft,
  .careLabelRight {
    min-width: unset;
  }
  
  .oneLinePiece {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .thisPiece {
    padding: 12px 15px;
  }
  
  .careInstructionItem {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    
    .instructionLabel {
      min-width: unset;
    }
  }
  
  .otherParamsContainer .line-flex-container {
    flex-wrap: wrap;
    gap: 5px;
  }
}
</style>
