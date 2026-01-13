<template>
  <div class="row">
    <div class="col-xl-12 ">
      <!-- 标题 + 折叠开关 -->
      <div style="margin-bottom: 5px">
        <a style="color:#3364d5;font-size: 20px;font-weight: bold" href="#" @click.prevent="toggleNotice()">
          {{ $t('sampleDescription') }}
        </a>
      </div>
      <transition name="fade">
        <!-- 折叠面板 -->
        <div v-show="isNoticeOpen" :class="['sigma_notice-content', { block: isNoticeOpen.value }]">
          <div class="mainContainer">
            <div class="applyToAllBlock">
              <div>
                <label>{{$t('applyToAll')}}</label>
              </div>
              <el-form label-position="left" inline style="display: flex" class="formMargin">
                <el-form-item>
                  <template #label>
                    <label>Property</label>
                  </template>
                  <el-select v-model="uniformProperty" style="width: 200px" value-key="propertyName" @change="uniformPropertyChange">
                    <el-option v-for="option in propertys" :key="option.propertyName" :value="option" :label="option.propertyName">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item style="flex: 1">
                  <template #label>
                    <label>Value</label>
                  </template>
                  <div class="line-left-flex-container" style="width: 100%">
                    <el-select v-if="uniformProperty.type==='Single'" v-model="uniformProperty.value" style="flex: 1">
                      <el-option v-for="option in uniformProperty.propertyValue" :key="option" :value="option">
                      </el-option>
                    </el-select>
                    <el-input v-if="uniformProperty.type==='Input'" v-model="uniformProperty.value" style="flex: 1" />
                    <el-select multiple v-if="uniformProperty.type==='Multiple'" v-model="uniformProperty.value" style="flex: 1" >
                      <el-option v-for="option in uniformProperty.propertyValue" :key="option" :value="option">
                      </el-option>
                    </el-select>
                    <el-button style="margin-left: 10px" type="primary" @click="applyToAll">Apply</el-button>
                  </div>
                </el-form-item>
              </el-form>
            </div>
            <div class="oneSampleDescrip" v-for="group in descripGroups" :key="group.samples">
              <el-select v-model="group.samples" placeholder="" multiple @change="oneGroupSamplesChange">
                <el-option v-for="sample in sampleSummary" :key="sample" :value="sample"></el-option>
              </el-select>
              <el-form label-position="left" inline style="display: flex">
                <el-form-item>
                  <template #label>
                    <label>Property</label>
                  </template>
                  <el-select v-model="group.thisProperty" style="width: 200px" value-key="propertyName">
                    <el-option v-for="option in propertys" :key="option.propertyName" :value="option" :label="option.propertyName">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item style="flex: 1">
                  <template #label>
                    <label>Value</label>
                  </template>
                  <div class="line-left-flex-container" style="width: 100%">
                    <el-select v-if="group.thisProperty.type==='Single'" v-model="group.thisProperty.value" style="flex: 1">
                      <el-option v-for="option in group.thisProperty.propertyValue" :key="option" :value="option">
                      </el-option>
                    </el-select>
                    <el-input v-if="group.thisProperty.type==='Input'" v-model="group.thisProperty.value" style="flex: 1" />
                    <el-select multiple v-if="group.thisProperty.type==='Multiple'" v-model="group.thisProperty.value" style="flex: 1" >
                      <el-option v-for="option in group.thisProperty.propertyValue" :key="option" :value="option">
                      </el-option>
                    </el-select>
                    <el-button style="margin-left: 10px" type="primary" @click="addToTable(group)">+</el-button>
                  </div>
                </el-form-item>
              </el-form>
              <el-table :data="group.propertyTable" class="removeTableGaps" border>
                <el-table-column label="Property" prop="propertyName" width="150px">
                </el-table-column>
                <el-table-column label="Value">
                  <template #default="scope">
                    <el-select v-if="scope.row.type==='Single'" v-model="scope.row.value">
                      <el-option v-for="option in scope.row.propertyValue" :key="option" :value="option">
                      </el-option>
                    </el-select>
                    <div class="line-left-flex-container" v-if="scope.row.type==='Input'">
                      <el-input v-model="scope.row.value" />
                    </div>
                    <el-select multiple v-if="scope.row.type==='Multiple'" v-model="scope.row.value" >
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
                    <el-button v-if="scope.row.isNecessary.includes('N')" type="danger" @click="removeProperty(group,scope.$index)">x</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="line-flex-container">
              <el-select v-model="newSampleGroup" multiple>
                <el-option v-for="sample in unGroupedSamples" :key="sample" :value="sample"></el-option>
              </el-select>
              <el-button @click="addNewGroup">
                <el-icon><Check /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import '@/assets/css/style.css';
import { ref, reactive, computed, watch } from 'vue'
import {Check} from "@element-plus/icons-vue";

const props=defineProps({
  propertys: Array,
  sampleSummary: {
    type: Array,
    default: () => []
  }
})

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
//新分组
const newSampleGroup=ref([])

/* 折叠开关 */
const isNoticeOpen = ref(true)
function toggleNotice() {
  isNoticeOpen.value = !isNoticeOpen.value;
}
// const isDetial = ref(false)
// function toggleDetial() {
//   isDetial.value = !isDetial.value;
// }

//表格展示的property，获取必选项作为默认值
defineExpose({
  descripGroups,
})

//function------------------------------------------------------------------------------------------
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
//修改单组样品
function oneGroupSamplesChange() {
  let countSamples=new Set()
  for (const group of descripGroups.value) {
    group.samples.forEach(sample => {
      if(countSamples.has(sample))
        return alert('Some components already exists')
      countSamples.add(sample)
    })
  }
}

function addNewGroup() {
  descripGroups.value.push({
    samples: newSampleGroup.value,
    thisProperty:{name:'',value:'',type:'',options:null,defaultValue:null},
    propertyTable:props.propertys.filter(property => property.isNecessary.includes('Y')).map(
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
//初始刷新
watch(()=>props.propertys,()=>{
  descripGroups.value.forEach(group=>{
    group.propertyTable.value=props.propertys.filter(property => property.isNecessary.includes('Y')).map(
      property => {
        let newProperty= JSON.parse(JSON.stringify(property))
        newProperty.value=newProperty.defaultValue;
        return newProperty;
      }
    )
  })
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
}
.oneSampleDescrip{
  @include column-flex-container();
  align-items: stretch;
  border: 1px solid #9f9c9c;
  border-radius: 4px;
  padding: 10px;
}
/*减少表单margin*/
.formMargin>div{
  margin-bottom: 5px;
}
.applyToAllBlock{
  border: 1px solid #9f9c9c;
  border-radius: 4px;
  padding: 10px;
}
</style>
