<template>
  <div class="paramsContainer thisBlock">
    <div class="sharedParametersContainer">
      <span class="blockTitle">{{$t('sharedParameters')}}</span>
      <div class="pieceContainer">
        <div class="thisPiece careLabelContainer">
          <span class="paramTitle">{{$t('careLabel')}}</span>
          <CareLabelSelect class="pieceContent" v-model="careLabelData"/>
        </div>
        <div class="thisPiece">
          <span class="paramTitle">{{$t('sampleComposition')}}</span>
          <SampleSpecificComposition
            class="pieceContent"
            @confirm="handleRowsSingle"
            :sampleSummary="allSample"
          />
        </div>
        <div class="thisPiece">
          <span class="paramTitle">{{$t('sampleDescription')}}</span>
          <SampleSpecificDescrip
            class="pieceContent"
            :sampleSummary="allSample"
            :buyerNameDto="buyerNameDto"
            ref="sampleSpecificDescripDoM"
          />
        </div>
        <div class="thisPiece">
          <span class="paramTitle">{{$t('otherParameters')}}</span>
          <div class="pieceContent otherParamsContainer">
            <div class="line-flex-container" v-for="param in orderParams" :key="param.name">
              <el-text>{{ param.name }}</el-text>
              <el-input v-model="param.value" v-if="param.type==='input'"
                        style="width: 100px"></el-input>
              <el-select v-model="param.value" v-else-if="param.type==='select'"
                         style="width: 100px">
                <el-option v-for="option in param.options" :key="option" :value="option">
                </el-option>
              </el-select>
              <el-select v-model="param.value" v-else multiple style="width: 100px">
                <el-option v-for="option in param.options" :key="option" :value="option">
                </el-option>
              </el-select>
            </div>
          </div>

        </div>
      </div>
    </div>
    <div class="itemSpecificParameterContainer">
      <span class="blockTitle">{{$t('itemSpecificParameters')}}</span>
      <div class="pieceContainer">
        <div class="thisPiece" v-if="seamSamples.length>0">
          <span class="paramTitle">{{$t('seamParameter')}}</span>
          <SeamRequire class="pieceContent" :seamSamples="seamSamples"/>
        </div>
        <div class="thisPiece" v-if="needAfterWash">
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

const props=defineProps({
  step1Dom: Object,
  buyerNameDto: String,
})
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
  props.step1Dom.menus.forEach(menu=>{
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
const orderParams = ref([
  {name: 'param1', type: 'input', value: '', options: []},
  {name: 'param2', type: 'select', value: '', options: ['option1', 'option2']},
  {name: 'param3', type: 'mulSelect', value: '', options: ['option1', 'option2']},
])
//和样品绑定的成分
const fiberCompositionSingle=ref([])


//接缝样品
const seamSamples = computed(() => {
  let seamSamplesSet = new Set()
  props.step1Dom.menus.forEach(menu=>{
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
//所有需要洗后遍数的项目
const itemNeedAfterWashAll =['item1','item2']
//需要洗后的项目汇总
const needAfterWashItems = computed(() => {
  let needAfterWashItemsArray = []
  //如果分组
  if(props.step1Dom.menus.groups){
    for (const group of props.step1Dom.menus.groups) {
      for (const item of group.items) {
        if(itemNeedAfterWashAll.includes(item.itemName))
          needAfterWashItemsArray.push(item)
      }
    }
  }
  //不分组

})
/*function------------------------------------------------------------------------------------------*/
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
  --h1-color:#111827;
  --border-first-level:none;
  //--border-second-level:none;
  //--border-second-level:1px solid #aaa6a6;
  --border-second-level:1px solid #e1dede;
}
.paramsContainer > div {
  padding: 5px;
}
.blockTitle{
  font-size: 26px;
  font-weight: bold;
  color: var(--h1-color);
}
/*参数标题*/
.paramTitle{
  font-size: 22px;
  font-weight: bold;
  color: var(--h1-color);
  align-self:flex-start;
}
.careLabelContainer{
  @include column-left-flex-container;
  gap:0
}
.thisPiece{
  @include column-flex-container;
  gap:10px;
  border: var(--border-first-level);
  border-radius: 10px;
  padding: 10px 15px;
  background-color: rgb(0,70,173,0.05);
  width: 90%;
  margin: 0 auto;
}
.pieceContent{
  background-color: white;
  border-radius: 5px  ;
  padding: 20px;
  width: 94%;
}
.multipleItemsContainer{

}
.pieceContainer{
  @include column-stretch-flex-container;
  gap: 20px;
}
.otherParamsContainer{
  @include line-left-flex-container;
}
</style>
