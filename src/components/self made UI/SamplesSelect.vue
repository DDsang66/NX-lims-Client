<template>
  <div @keydown="keyDownHandle"
       ref="root"
  >
    <el-popover :width="500"
      placement="bottom"
      :visible="visible"
      :append-to="root"
    >
      <template #reference>
        <div class="likeInput mySelect" :style="inputBoxStyle" >
          <div class="selectTags">
            <el-tag :size="size" v-for="(sample,index) in showSamplezse" :key="sample"
                    closable
                    disable-transitions
                    @close="removeSample(sample,index)" >{{sample}}</el-tag>
            <el-tag v-if="collapseTags&&(modelValue.length-maxShowNumber)>0">...{{modelValue.length-maxShowNumber}}</el-tag>
          </div>
          <el-select v-model="inputValue"
                     placeholder=""
                     filterable
                     allow-create
                     default-first-option
                     @change="inputChange"
                     ref="selectInputDom"
                     :size="size"
                     class="input-select">
          </el-select>
          <el-icon style="margin-left: auto" @click="visible=!visible"><Grid /></el-icon>
          <el-icon @click="clearData"><CircleClose /></el-icon>
        </div>
      </template>
      <div class="gridPopover" @mousedown.prevent>
        <div class="gridPopoverHead" style="margin-bottom: 10px">
          <el-radio-group v-model="optionCategoryName" @change="optionCategoryChange">
            <el-radio-button label="A" value="letter" ></el-radio-button>
            <el-radio-button label="001" value="number" ></el-radio-button>
            <el-radio-button label="A-xx" value="suffixedLetter" ></el-radio-button>
            <el-radio-button label="001-xx" value="suffixedNumber" ></el-radio-button>
          </el-radio-group>
          <div style="margin-left: auto">
            <el-button  @click="toLastPageGrids">
              <el-icon><ArrowLeftBold /></el-icon>
            </el-button>
            <el-button @click="toNextPageGrids">
              <el-icon><ArrowRightBold /></el-icon>
            </el-button>
            <el-button @click="visible=false">
              X
            </el-button>
          </div>
        </div>
<!--        <div v-for="sample in selectList" :key="sample.value">-->
<!--        </div>-->
        <div class="gridsContainer" v-if="optionCategoryName==='letter'||optionCategoryName==='number'">
          <div class="oneGrid"
               :class="{selectedGrid:grid.status==='selected'||grid.status==='toSelectStart'||grid.status==='toSelectEnd',toBeSelected:grid.status==='toBeSelected'}"
               v-for="grid in currentGrids"
               :key="grid.value"
               @mouseenter="gridMouseEnter(grid)"
               @click="gridClick(grid)">
            {{grid.value}}
          </div>
        </div>
        <div class="suffixedOptionContainer" v-else>
          <el-popover
            trigger="click"
            v-for="grid in currentSuffixedGrids"
            :key="grid.value"
            :width="380"
            :append-to="root"
          >
            <template #reference>
              <div class="oneSuffixedGrid"
                   :class="{selectedGrid:grid.suffixes?.length>0}">
                {{grid.value}}
              </div>
            </template>
            <el-checkbox-group v-model="grid.suffixes" @change="sampleSuffixesChange(grid)">
              <el-checkbox v-for="suffix in withAdditionalSuffixes(grid.suffixes)" :key="suffix"
                           :value="suffix"
                           :label="suffix"
                           style="width: 160px"
              >
              </el-checkbox>
            </el-checkbox-group>
          </el-popover>

        </div>
        <div class="likeInput popoverShowSelected" :style="inputBoxStyle" style="margin-top: 10px">
          <div class="selectTags">
            <el-tag :size="size" v-for="(sample,index) in modelValue" :key="sample"
                    closable
                    disable-transitions
                    @close="removeSample(sample,index)" >{{sample}}</el-tag>
          </div>
        </div>
      </div>
    </el-popover>
  </div>

</template>

<script setup>

import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {ArrowLeft, ArrowLeftBold, ArrowRightBold, CircleClose, Grid} from "@element-plus/icons-vue";
import globalFunctions from "@/utils/globalFunctions.js";
import GlobalFunctions from "@/utils/globalFunctions.js";

const props = defineProps({
  modelValue:{
    type: Array,
    default: () => []
  },
  size:{
    type: String,
    default: 'default'
  },
  collapseTags:{
    type: Boolean,
    default: false
  },
  maxShowNumber:{
    type: Number,
    default: 1
  }

})
//输入框值
const inputValue=ref('')
//默认关闭
const visible=ref(false)

const root = ref(null)
const selectInputDom=ref(null)
const sizeMap = new Map([['default',32],['small',24],['large',40]])
const inputBoxStyle=ref({
  'min-height': sizeMap.get(props.size)+'px',
})

//26个大写字母
const allLetters=Array.from(Array(26)).map((_,i)=>String.fromCharCode(65+i))

//总数组（字母）
const allLetterGrids=ref(allLetters.map((letter,ind)=>({value:letter,index:ind})))
//总数组（数字）
const allNumberGrids=ref((()=>{
  let grids=[]
  for(let i=1;i<=30;i++){
    grids.push({value:String(i).padStart(3,'0'),index:i-1})
  }
  return grids
})())
//总数组（带后缀字母）
const allSuffixedLetterGrids=ref(allLetters.map((letter,ind)=>({value:letter,index:ind,suffixes:[]})))
//总数组（带后缀数字）
const allSuffixedNumberGrids=ref((()=>{
  let grids=[]
  for(let i=1;i<=30;i++){
    grids.push({value:String(i).padStart(3,'0'),index:i-1,suffixes:[]})
  }
  return grids
})())


//无后缀对应的真实数据set。
const commonValueSet=ref(new Set())
//有后缀对应的真实数据map
const suffixedValueMap=ref(new Map())
//字母组当前页码
const currentPageIndex=ref(1)

//当前展示的格子
const currentGrids=ref(allLetterGrids.value.slice(0,26))
//当前展示的带后缀格子。
const currentSuffixedGrids=ref(allLetterGrids.value.slice(0,26))

//选项种类名
const optionCategoryName=ref((()=>{
  if(Number(props.modelValue[0])){
    return 'number'
  }
  return 'letter'
})())
//选项种类对象
const optionCategory=computed(()=>optionCategoryMap[optionCategoryName.value])

// //获取输入列表
// function getSelectList(){
// }
//选择框展示的标签数组
const showSamplezse=computed(()=>{
  return props.collapseTags ? props.modelValue.slice(0,props.maxShowNumber) : props.modelValue
})
//后缀
const suffixes=new Set(['main fabric','main fabric with print','shem','lining','other part','outer','body','top','bottow'])

//四种类对象列表
const optionCategoryMap = {
  letter: {
    label: 'A',
    allGrids: allLetterGrids,
    currentGrids: currentGrids,
    onePageNumber: 26,
    addOnePage() {
      addOneLetterPage(this.allGrids, this.additionalAttributes)
    },
    additionalAttributes: {},
  }
  , number: {
    label: '001',
    allGrids: allNumberGrids,
    currentGrids: currentGrids,
    onePageNumber: 30,
    addOnePage() {
      addOneNumberPage(this.allGrids, this.onePageNumber, this.additionalAttributes)
    },
    additionalAttributes: {},
  }
  , suffixedLetter: {
      label: 'A-xx',
      allGrids: allSuffixedLetterGrids,
      currentGrids: currentSuffixedGrids,
      onePageNumber: 26,
      addOnePage() {
        addOneLetterPage(this.allGrids, this.additionalAttributes)
      },
      additionalAttributes: {suffixes: []}
    }
  , suffixedNumber: {
      label: '001-xx',
      allGrids: allSuffixedNumberGrids,
      currentGrids: currentSuffixedGrids,
      onePageNumber: 30,
      addOnePage() {
        addOneNumberPage(this.allGrids, this.onePageNumber, this.additionalAttributes)
      },
      additionalAttributes: {suffixes: []}
    }
}

/* Methods------------------------------------------------------------------------------------------*/
//清空
function clearData() {
  inputValue.value = ''
  props.modelValue.length=0
}

//包含额外选项
function withAdditionalSuffixes(gridSuffixes) {
  let allSuffixes = [...suffixes]
  let additionalSuffixes=[]
  if(!gridSuffixes)
    return allSuffixes
  for (const gridSuffix of gridSuffixes) {
    if(!suffixes.has(gridSuffix))
      additionalSuffixes.push(gridSuffix)
  }
  return allSuffixes.concat(additionalSuffixes)
}
//字母转为数组下标
function lettersToIndex(s) {
  if (!s || typeof s !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  const n = s.length;

  // 计算所有长度小于 n 的字符串总数：26^1 + 26^2 + ... + 26^(n-1)
  let totalShorter = 0;
  for (let i = 1; i < n; i++) {
    totalShorter += Math.pow(26, i);
  }

  // 将字符串转为 26 进制数值（A=0, B=1, ..., Z=25）
  let offset = 0;
  for (let i = 0; i < n; i++) {
    const char = s[i];
    if (char < 'A' || char > 'Z') {
      throw new Error('String must contain only uppercase letters A-Z');
    }
    offset = offset * 26 + (char.charCodeAt(0) - 'A'.charCodeAt(0));
  }

  return totalShorter + offset;
}
//选项后缀改变
function sampleSuffixesChange(grid){
  //更新Map
  suffixedValueMap.value.set(grid.value,new Set(grid.suffixes))
  //跟新数组
  suffixedValueMap.value.forEach((suffixes,key)=>{
    //删除
    for(let i=props.modelValue.length-1;i>=0;i--){
      if(props.modelValue[i].startsWith(key+'-'))
        props.modelValue.splice(i,1)
    }
    //重新添加
    for (const suffix of suffixes) {
      GlobalFunctions.sortInsertArray(props.modelValue,key+'-'+suffix)
    }
  })
}
//选择器输入框值改变
function inputChange(value){
  inputValue.value=''
  if(value.includes('-')){
    //判断未有
    if(!suffixedValueMap.value.has(value)){
      //-前
      let beforeHyphen=value.split('-')[0]
      //-后
      let afterHyphen=value.split('-')[1]
      if(suffixedValueMap.value.has(beforeHyphen)){
        suffixedValueMap.value.get(beforeHyphen).add(afterHyphen)
      }else{
        suffixedValueMap.value.set(beforeHyphen,new Set([afterHyphen]))
      }

      globalFunctions.sortInsertArray(props.modelValue,value)
    }
    //刷新格子
    refreshSuffixedGridsByMap()
  }else{
    if(!commonValueSet.value.has(value)){
      commonValueSet.value.add(value)
      globalFunctions.sortInsertArray(props.modelValue,value)
    }
    //刷新格子
    isSelectedBySet()
  }
}

//根据set判断是否选中（无后缀）
function isSelectedBySet(){
  let maxNumber='';
  let maxLetter='';
  commonValueSet.value.forEach(value=>{
    if(Number(value)){
      if(value>maxNumber)
        maxNumber=value
    }else {
      if(value.length>=maxLetter&&value>maxLetter)
        maxLetter=value
    }
  })
  //不够则添加页
  while(allLetterGrids.value[-1]<maxLetter){
    optionCategoryMap.letter.addOnePage()
  }
  while (allNumberGrids.value[-1]<maxNumber){
    optionCategoryMap.number.addOnePage()
  }
  //判断选中
  allNumberGrids.value.map(grid=>{
    if(commonValueSet.value.has(grid.value))
      grid.status='selected'
    else
      grid.status='unselected'
  })
  allLetterGrids.value.map(grid=>{
    if(commonValueSet.value.has(grid.value))
      grid.status='selected'
    else
      grid.status='unselected'
  })
}

//根据map刷新后缀格子数据。
function refreshSuffixedGridsByMap(){
  //先获取最大值
  let maxNumber='';
  let maxLetter='';
  suffixedValueMap.value.forEach((suffixes,key)=>{
    if(Number(key.split('-')[0])){
      if(key>maxNumber)
        maxNumber=key
    }else {
      if(key.length>maxLetter.length&&key>maxLetter)
        maxLetter=key
    }
  })
  //不够则添加页
  while(allSuffixedLetterGrids.value[-1]<maxLetter){
    optionCategoryMap.letter.addOnePage()
  }
  while (allSuffixedNumberGrids.value[-1]<maxNumber){
    optionCategoryMap.number.addOnePage()
  }
  //判断选中
  allSuffixedNumberGrids.value.map(grid=>{
    if(suffixedValueMap.value.has(grid.value))
      grid.suffixes=[...suffixedValueMap.value.get(grid.value)]
  })
  allSuffixedLetterGrids.value.map(grid=>{
    if(suffixedValueMap.value.has(grid.value))
      grid.suffixes=[...suffixedValueMap.value.get(grid.value)]
  })
}

//改变选项数据类型
function optionCategoryChange(){
  currentPageIndex.value=1;
  let category=optionCategory.value
  category.currentGrids.value=category.allGrids.value.slice(0,category.onePageNumber)
}
//设置当前页grids
function setCurrentGrids(){
  let pageIndex=currentPageIndex.value;
  let number=optionCategory.value.onePageNumber;
  let allGrids=optionCategory.value.allGrids;
  return allGrids.value.slice((pageIndex-1)*number,pageIndex*number)
}


//添加一页字母通用
function addOneLetterPage(allGrids,additionalAttributes){
  //先获取旧数组长度
  let oldLength=allGrids.value.length
  //一个字母
  if(allGrids.value.at(-1).value.length===1){
    allLetters.forEach((letter,idx)=>{
      //根据value和index得到一个数据对象。
      allGrids.value.push({value:'A'+letter,index:oldLength+idx,...additionalAttributes})
    })
  }
  else {
    //仅考虑两位
    let lastInitialLetter=allGrids.value.at(-1).value[0]
    let nextInitialLetter=String.fromCharCode(lastInitialLetter.charCodeAt(0)+1)
    allLetters.forEach((letter,idx)=>{
      //获取下一个字母
      allGrids.value.push({value:nextInitialLetter+letter,index:oldLength+idx})
    })
  }
}

//添加一页数字选项(通用)
function addOneNumberPage(allGrids,onePageNumber,addtionalAttributes){
  let lastNumber=allGrids.value.length
  for (let i = 1; i <=onePageNumber ; i++) {
    allNumberGrids.value.push({value:String(lastNumber+i).padStart(3,'0'),index:i+lastNumber-1,...addtionalAttributes})
  }
}


//通用下一页
function toNextPageGrids(){
  //页数加一
  currentPageIndex.value++;
  //判断是否不够
  if(optionCategory.value.allGrids.value.length<currentPageIndex.value*optionCategory.value.onePageNumber)
    //添加一页
    optionCategory.value.addOnePage()
  //设置为当前页格子
  setCurrentGrids()
}
//上一页
function toLastPageGrids(){
    if(currentPageIndex.value!==1)
      currentPageIndex.value--;
    setCurrentGrids()
}


//去除标签
function removeSample(sample,index){
  if(sample.includes('-')){
    //-前的部分
    let beforeHyphen=sample.split('-')[0]
    //-后的部分
    let afterHyphen=sample.split('-')[1]
    //map删除
    //旧值
    let lastSuffixes=suffixedValueMap.value.get(beforeHyphen)
    lastSuffixes.delete(afterHyphen)
    suffixedValueMap.value.set(beforeHyphen,lastSuffixes)
    //删除标签
    props.modelValue.splice(index,1);
    refreshSuffixedGridsByMap()
  }else{
    //set删除
    commonValueSet.value.delete(props.modelValue[index])
    //删除标签
    props.modelValue.splice(index,1);
    //清除文本选区
    const selection = window.getSelection?.(); // 获取当前文本选区对象（可能为 null）
    if (selection) { // 如果存在选区
      selection.removeAllRanges?.(); // 清除所有选中文本，防止快速删除时意外高亮
    }
    //刷新选项状态
    isSelectedBySet();
  }

}


//点击网格进行选中
var selectStart=false;
var startIndex=0;
//点击事件
function gridClick(grid){
  //开始后
  if(selectStart){
    selectStart=false;
    //两者及两者之间的全变成选中状态
    let endIndex=grid.index
    let frontIndex=startIndex
    //使frontIndex <= endIndex
    if(endIndex<frontIndex){
      endIndex=frontIndex
      frontIndex=grid.index
    }
    let allGrids=optionCategory.value.allGrids
    for(let i=frontIndex;i<=endIndex;i++){
      let thisGrid=allGrids.value[i]
      thisGrid.status='selected'
      //更新数据
      if (!commonValueSet.value.has(thisGrid.value)) {
        commonValueSet.value.add(thisGrid.value)
        globalFunctions.sortInsertArray(props.modelValue, thisGrid.value)
      }
    }

  }else {
    //开始前
    selectStart=true;
    startIndex=grid.index
    changeGridStatus(grid,'toSelectStart')
  }
}

//鼠标进入
function gridMouseEnter(grid){
  if(selectStart){
    let endIndex=grid.index
    let frontIndex=startIndex;
    //当前项转为预选中的end状态
    changeGridStatus(grid,'toSelectEnd')
    //两者之间的全变成预选中状态
    //使frontIndex小于endIndex
    if(grid.index<startIndex){
      endIndex=startIndex
      frontIndex=grid.index
    }
    let allGrids=optionCategory.value.allGrids
    for(let i=frontIndex+1;i<endIndex;i++){
      changeGridStatus(allGrids.value[i],'toBeSelected')
    }
    //其他的全变成未选中状态
    for(let i=0;i<frontIndex;i++){
      changeGridStatus(allGrids.value[i],'unselected')
    }
    for(let i=endIndex+1;i<allGrids.value.length;i++){
      changeGridStatus(allGrids.value[i],'unselected')
    }
  }
}

//状态不为selected则修改状态
function changeGridStatus(grid,status){
  if(grid.status!=='selected')
    grid.status=status
}

//按键事件
function keyDownHandle(e){
  if(e.key==='Escape'){
    //如果已经开始选
    if(selectStart){
      //重置为未开始前状态。
      selectStart=false;
      for(let i=0;i<allLetterGrids.value.length;i++){
        if(allLetterGrids.value[i].status.includes('to'))
          allLetterGrids.value[i].status='unselected'
      }
    }
  }
}
//鼠标按下监听器
function docMouseDownClosePopover(e){
  if(!root.value?.contains(e.target))
    visible.value=false
}

//根据值刷新
function refreshBasedOnLabel(){
  modelValueToRealData()
  isSelectedBySet()
  refreshSuffixedGridsByMap()
}
//将modelValue转为两个真实数据
function modelValueToRealData(){
  //清空map和set
  suffixedValueMap.value.clear()
  commonValueSet.value.clear()
  props.modelValue.forEach(value => {
    if(value.includes('-')){
      //-前的部分
      let beforeHyphen=value.split('-')[0]
      //-后的部分
      let afterHyphen=value.split('-')[1]
      if(suffixedValueMap.value.has(beforeHyphen)){
        let lastSuffixes=suffixedValueMap.value.get(beforeHyphen)
        lastSuffixes.add(afterHyphen)
        suffixedValueMap.value.set(beforeHyphen,lastSuffixes)
      }else{
        suffixedValueMap.value.set(beforeHyphen,new Set([afterHyphen]))
      }
    }else {
      commonValueSet.value.add(value)
    }
  })
}

watch(visible,(newValue)=>{
  if(newValue)
    //鼠标按下监听器，关闭popover
    document.addEventListener('mousedown',docMouseDownClosePopover)
  else
    document.removeEventListener('mousedown',docMouseDownClosePopover)
})
watch(props.modelValue,()=>{
  refreshBasedOnLabel()
})
onMounted(()=>{
  //升序排序
  props.modelValue.sort();
  refreshBasedOnLabel()
})
onBeforeUnmount(()=>{

})
</script>

<style lang="scss" scoped>
$grid-size: 40px;
$grid-gap:5px;
.gridPopoverHead{
  @include line-left-flex-container;
  gap:0;
}
.likeInput{
  border-radius: var(--el-border-radius-base);
  box-shadow: 0 0 0 1px var(--el-border-color);
  box-sizing: border-box;
  padding: 0 4px 0 4px;
}
.mySelect{
  cursor: pointer;
  @include line-left-flex-container;
}
.selectTags{
  @include line-left-flex-container;
  flex-wrap: wrap;
}

.suffixedOptionContainer{
  @include line-left-flex-container;
  flex-wrap: wrap;
  gap:$grid-gap;
  width: $grid-size*10+$grid-gap*9;
}
.oneSuffixedGrid{
  @include line-flex-container;
  width: $grid-size;
  height: $grid-size;
  border-radius: var(--el-border-radius-base);
  box-shadow: 0 0 0 1px var(--el-border-color);
  cursor: pointer;
}

.gridsContainer{
  @include line-left-flex-container;
  flex-wrap: wrap;
  gap:$grid-gap;
  width: $grid-size*10+$grid-gap*9;
}
.oneGrid{
  cursor: pointer;
  @include line-flex-container;
  width: $grid-size;
  height: $grid-size;
  border-radius: var(--el-border-radius-base);
  box-shadow: 0 0 0 1px var(--el-border-color);
}
.selectedGrid{
  background-color: var(--el-color-primary);
  color:white;
}
.toBeSelected{
  background-color: rgb(160, 207, 255);
  color:white;
}
/*选择器输入框*/
.selectInput{
  border:none;
  min-width: 10px;
  width: 10px;
  flex: 1;
}
.selectInput:focus{
  outline: none;
}
/*输入功能*/
.input-select{
  flex: 1;
}
.input-select :deep(.el-select__wrapper){
  border-radius: 0;
  box-shadow: none;
}
/*多选框*/
:deep(.el-checkbox){
  margin-right: 5px;
}
</style>
