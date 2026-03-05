<template>
  <div class="mainContainer">
    <div class="applyToAllBlock">
      <div>
        <span class="samplesLabel">{{ $t('applyToAll') }}</span>
      </div>
      <el-form label-position="left" inline style="display: flex" class="formMargin">
        <el-form-item>
          <template #label>
            <span class="formLabel">{{$t('property')}}</span>
          </template>
          <el-select v-model="uniformProperty" style="width: 200px" value-key="propertyName"
                     @change="uniformPropertyChange">
            <el-option v-for="option in descripPropertyOptions" :key="option.propertyName" :value="option"
                       :label="option.propertyName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="flex: 1">
          <template #label>
            <span class="formLabel">{{$t('value')}}</span>
          </template>
          <div class="line-left-flex-container" style="width: 100%">
            <el-select v-if="uniformProperty.type==='Single'" v-model="uniformProperty.value"
                       style="flex: 1">
              <el-option v-for="option in uniformProperty.propertyValue" :key="option"
                         :value="option">
              </el-option>
            </el-select>
            <el-input v-if="uniformProperty.type==='Input'" v-model="uniformProperty.value"
                      style="flex: 1"/>
            <el-select multiple v-if="uniformProperty.type==='Multiple'"
                       v-model="uniformProperty.value" style="flex: 1">
              <el-option v-for="option in uniformProperty.propertyValue" :key="option"
                         :value="option">
              </el-option>
            </el-select>
            <el-button style="margin-left: 10px" type="primary" @click="applyToAll">{{$t('apply')}}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div class="oneSampleDescrip" v-for="(group,index) in descripGroups" :key="group.samples">
      <div class="column-stretch-flex-container groupSamples">
        <div class="line-flex-container">
          <div class="groupLabelContainer">
            <span class="samplesLabel">{{$t('samples')}}</span>
          </div>
          <el-select v-model="group.samples" placeholder="" multiple style="flex: 1"
                     @change="oneGroupSamplesChange">
            <el-option v-for="sample in sampleSummary" :key="sample" :value="sample"></el-option>
          </el-select>
          <el-button type="danger" @click="deleteGroup(index)">
            <el-icon>
              <Delete/>
            </el-icon>
          </el-button>
        </div>
        <div class="warningMy" v-if="group.warnMessage">{{group.warnMessage}}</div>
      </div>
      <div class="oneGroupDescripForm">
        <el-form label-position="left" inline style="display: flex">
          <el-form-item>
            <template #label>
              <span class="formLabel">{{$t('property')}}</span>
            </template>
            <el-select v-model="group.thisProperty" style="width: 200px" value-key="propertyName">
              <el-option v-for="option in descripPropertyOptions" :key="option.propertyName" :value="option"
                         :label="option.propertyName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="flex: 1">
            <template #label>
              <span class="formLabel">{{$t('value')}}</span>
            </template>
            <div class="line-left-flex-container" style="width: 100%">
              <el-select v-if="group.thisProperty.type==='Single'" v-model="group.thisProperty.value"
                         style="flex: 1">
                <el-option v-for="option in group.thisProperty.propertyValue" :key="option"
                           :value="option">
                </el-option>
              </el-select>
              <el-input v-if="group.thisProperty.type==='Input'" v-model="group.thisProperty.value"
                        style="flex: 1"/>
              <el-select multiple v-if="group.thisProperty.type==='Multiple'"
                         v-model="group.thisProperty.value" style="flex: 1">
                <el-option v-for="option in group.thisProperty.propertyValue" :key="option"
                           :value="option">
                </el-option>
              </el-select>
              <el-button style="margin-left: 10px" type="primary" @click="addToTable(group)">+
              </el-button>
            </div>
          </el-form-item>
        </el-form>
        <el-table :data="group.propertyTable" class="removeTableGaps" border>
          <el-table-column :label="$t('property')" prop="propertyName" width="300px">
          </el-table-column>
          <el-table-column :label="$t('value')">
            <template #default="scope">
              <el-select v-if="scope.row.type==='Single'" v-model="scope.row.value">
                <el-option v-for="option in scope.row.propertyValue" :key="option" :value="option">
                </el-option>
              </el-select>
              <div class="line-left-flex-container" v-if="scope.row.type==='Input'">
                <el-input v-model="scope.row.value"/>
              </div>
              <el-select multiple v-if="scope.row.type==='Multiple'" v-model="scope.row.value">
                <el-option v-for="option in scope.row.propertyValue" :key="option" :value="option">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column width="70">
            <template #header>
              <el-button type="danger" @click="removeAllProperty(group)">x</el-button>
            </template>
            <template #default="scope">
              <el-button v-if="scope.row.isNecessary.includes('N')" type="danger"
                         @click="removeProperty(group,scope.$index)">x
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="line-flex-container">
      <span class="samplesLabel">{{$t('remainingSamples')}}</span>
      <el-select v-model="newSampleGroup" multiple style="flex: 1" clearable>
        <template #header>
          <el-checkbox
            v-model="remainSampleCheckAll"
            :indeterminate="remainSampleIndeterminate"
            @change="handleRemainSampleCheckAll"
            style="width: 100%;"
          >
            All
          </el-checkbox>
        </template>
        <el-option v-for="sample in unGroupedSamples" :key="sample" :value="sample"></el-option>
      </el-select>
      <el-button @click="addNewGroup">
        <el-icon>
          <Check/>
        </el-icon>
      </el-button>
    </div>
    <div class="warningMy" v-if="remainSampleWarn">All samples must have description.</div>
  </div>
</template>

<script setup>
import '@/assets/css/style.css';
import {ref,inject, reactive, computed, watch, onMounted} from 'vue'
import {Check, Delete} from "@element-plus/icons-vue";
import globalFunctions from "@/utils/globalFunctions.js";


const request=inject('request')
const props=defineProps({
  buyerNameDto:String,
  sampleSummary: {
    type: Array,
    default: () => []
  }
})

//remainSample是否全选
const remainSampleCheckAll = ref(false)
//remainSample是否半选
const remainSampleIndeterminate = ref(false)
//样描属性
const descripPropertyOptions = ref([])
//统一的属性
const uniformProperty=ref({})
/*
* 样描分组
* [{samples: []
* ,descrip}]
* */
const descripGroups=ref([])
//未分组样品
const unGroupedSamples=computed(()=>{
  //已分组样品
  let groupedSamples = descripGroups.value.flatMap(g => g.samples)
  return props.sampleSummary.filter(s => !groupedSamples.includes(s))
})
//剩余样品是否警告
const remainSampleWarn = computed(()=>{
  return unGroupedSamples.value.length>0
})
//新分组
const newSampleGroup=ref([])

//表格展示的property，获取必选项作为默认值
defineExpose({
  descripGroups,
})

//function------------------------------------------------------------------------------------------
//remainSample全选
const handleRemainSampleCheckAll = () => {
  remainSampleIndeterminate.value = false
  if (newSampleGroup.value.length===0) {
    newSampleGroup.value = [...unGroupedSamples.value]
  } else {
    newSampleGroup.value = []
  }
}
//删除某分组
function deleteGroup(index){
  descripGroups.value.splice(index,1)
}
//统一设置属性，切换属性时
function uniformPropertyChange(){
  if(uniformProperty.value.type==='Multiple')
    uniformProperty.value.value=[]
  else
    uniformProperty.value.value=''
}
//去除单个property
function removeProperty(group,index){
  group.propertyTable.splice(index,1)
}
//为所有组应用或添加
function applyToAll(){
  for (let group of descripGroups.value) {
    //如果已有该行
    const existingItem=group.propertyTable.find(
      item => item.propertyName === uniformProperty.value.propertyName
    );
    if(existingItem){
      existingItem.value = uniformProperty.value.value;
    }else{
      group.propertyTable.push(JSON.parse(JSON.stringify(uniformProperty.value)))
    }
  }
}

//检查重复样品
function checkAllDuplicateSamples() {
  let groups = descripGroups.value;
  if (!groups || !Array.isArray(groups)) return;

  // --- 步骤 1: 建立全局样本索引 (逻辑不变) ---
  const sampleMap = new Map();

  groups.forEach(group => {
    if (!group.samples || !Array.isArray(group.samples)) return;
    group.samples.forEach(sample => {
      if (!sample) return;
      if (!sampleMap.has(sample)) {
        sampleMap.set(sample, new Set());
      }
      sampleMap.get(sample).add(group);
    });
  });

  // --- 步骤 2: 找出所有“确实有重复问题”的组集合 ---
  const groupsWithIssues = new Set();

  for (const [sample, groupSet] of sampleMap.entries()) {
    if (groupSet.size > 1) {
      groupSet.forEach(g => groupsWithIssues.add(g));
    }
  }

  // --- 步骤 3: 差异化更新 (关键优化点) ---
  groups.forEach(group => {
    const shouldHaveWarning = groupsWithIssues.has(group);
    const currentHasWarning = !!group.warnMessage; // 当前是否有警告内容

    if (shouldHaveWarning && !currentHasWarning) {
      // 情况 A: 应该有警告，但现在没有 -> 添加警告
      group.warnMessage = 'Some samples are duplicated with other groups.';
    } else if (!shouldHaveWarning && currentHasWarning) {
      // 情况 B: 不应该有警告，但现在有 -> 清空警告
      group.warnMessage = '';
    }
    // 情况 C & D: 状态一致，什么都不做，避免触发响应式更新和 UI 闪烁
  });
}


//修改单组样品
function oneGroupSamplesChange() {
  // checkAllDuplicateSamples()
}

function addNewGroup() {
  descripGroups.value.push({
    samples: newSampleGroup.value,
    thisProperty:{name:'',value:'',type:'',options:null,defaultValue:null},
    propertyTable:descripPropertyOptions.value.filter(property => property.isNecessary.includes('Y')).map(
      property => {
        let newProperty= JSON.parse(JSON.stringify(property))
        if(newProperty.type==='Multiple'){
          if(!newProperty.defaultValue)
            newProperty.value=[]
          else
            newProperty.value=[newProperty.defaultValue];
        }
        else
          newProperty.value=newProperty.defaultValue;
        return newProperty;
      }
    )
  })
  // console.log(descripGroups.value)
  newSampleGroup.value = []
}
function addToTable(group){
  //添加到表格
  //如果已有该行
  if(group.propertyTable.some(item => item.propertyName === group.thisProperty.propertyName)){
    group.propertyTable.map(item => {
      if (item.propertyName === group.thisProperty.propertyName) {
        //如果已有该项不处理
        if(item.value.includes(group.thisProperty.value))
          return;
        //如果是输入框
        if(group.thisProperty.type==='Input')
          item.value += '-'+group.thisProperty.value;
        //多选
        else if(group.thisProperty.type==='Multiple')
          item.value =group.thisProperty.value;
        //单选
        else
          item.value = group.thisProperty.value;
      }
    })
  }else{
    group.propertyTable.push(JSON.parse(JSON.stringify(group.thisProperty)))
  }
}
//去除所有非必选property
function removeAllProperty(group){
  for (let i=group.propertyTable.length-1;i>0;i--){
    if(!group.propertyTable[i].isNecessary.includes('Y'))
      group.propertyTable.splice(i,1)
  }
}
async function getPropertys() {
  const rep = await request.get('/render/sampledesc', {
    params: {
      buyername:props.buyerNameDto,
    }
  });
  if (rep.data.success) {
    descripPropertyOptions.value = rep.data.data
  } else {
    alert(rep.data.message)
  }
}
/*数据监听-------------------------------------------------------------------------------------------*/
// //初始刷新
// watch(()=>props.propertys,()=>{
//   descripGroups.value.forEach(group=>{
//     group.propertyTable.value=props.propertys.filter(property => property.isNecessary.includes('Y')).map(
//       property => {
//         let newProperty= JSON.parse(JSON.stringify(property))
//         newProperty.value=newProperty.defaultValue;
//         return newProperty;
//       }
//     )
//   })
// })
//监听
watch(descripGroups,()=>{
  checkAllDuplicateSamples()
},{deep:true})

//监听newSampleGroup
watch(newSampleGroup, (val) => {
  if (val.length === 0) {
    remainSampleCheckAll.value = false
    remainSampleIndeterminate.value = false
  } else if (val.length === unGroupedSamples.value.length) {
    remainSampleCheckAll.value = true
    remainSampleIndeterminate.value = false
  } else {
    remainSampleIndeterminate.value = true
  }
})
watch(()=>{return props.buyerNameDto},()=>{
  getPropertys()
})
onMounted(()=>{
  getPropertys()
})
</script>

<style scoped lang="scss">
.sigma_btn-custom::before {
  background-color: #18086a;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.6s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
/*去除表格标题和内容之间的空隙*/
.removeTableGaps :deep(table){
  margin-bottom: 0 !important;
}
.mainContainer{
  @include column-flex-container();
  align-items: stretch;
  gap:10px;
}
.oneSampleDescrip{
  @include column-flex-container();
  align-items: stretch;
  border: var(--border-second-level);
  background-color: white;
}
.oneSampleDescrip>div{
  padding: 10px 15px;
}
/*减少表单margin*/
.formMargin>div{
  margin-bottom: 5px;
}
.applyToAllBlock{
  border: var(--border-second-level);
  border-radius: 4px;
  padding: 10px;
  background-color: white;
}
.formLabel{
  font-size: 16px;
  font-weight: 600;
  color: var(--h1-color);
  align-self:flex-start;
}
.samplesLabel{
  font-size: 18px;
  font-weight: 600;
  color: var(--h1-color);
  align-self:flex-start;
}
.groupLabelContainer{
  @include line-left-flex-container();
}
.groupSamples{
  border-bottom: var(--border-second-level);
  background-color: #f0f4fa;
}
</style>
