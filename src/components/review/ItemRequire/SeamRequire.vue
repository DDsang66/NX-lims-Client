<template>
  <div class="blockContainer">
    <div class="oneGroupSeam" v-for="(group,index) in seamGroups" :key="group.samples">
      <!--            样品-->
      <div class="column-stretch-flex--container groupSamples">
        <div class="line-flex-container">
          <span class="samplesLabel">{{$t('samples')}}</span>
          <el-select v-model="group.samples" placeholder="" multiple
                     style="flex:1;"
                     @change="oneGroupSamplesChange">
            <el-option v-for="sample in seamSamples" :key="sample" :value="sample"></el-option>
          </el-select>
          <span class="formLabel">{{$t('type')}}</span>
          <el-select :disabled="group.samples.some(sample=>sample.includes('-'))" style="width: 100px"
                     v-model="group.samplesType">
            <el-option v-for="type in seamSampleTypes" :key="type.value" :value='type.value'
                       :label="type.label"></el-option>
          </el-select>
          <el-button type="danger" @click="deleteGroup(index)">
            <el-icon>
              <Delete/>
            </el-icon>
          </el-button>
        </div>
        <div class="warningMy" v-if="group.warnMessage">{{$t(group.warnMessage)}}</div>
      </div>
      <div class="oneGroupSeamForm">
        <!--            添加部位-->
        <div class="line-flex-container" style="margin-bottom: 10px">
          <span class="formLabel">{{$t('garmentType')}}</span>
          <el-select style="width: 100px" v-model="group.locationsDraft.type"
                     @change="locationTypeChange(group.locationsDraft)">
            <el-option v-for="type in seamTypeOptions" :key="type" :value='type'></el-option>
          </el-select>
          <el-button @click="addLocationsByType(group)">+</el-button>
          <span style="margin-left: 10px" class="formLabel">{{$t('locations')}}</span>
          <el-select style="flex:1" v-model="group.locationsDraft.locations" multiple
                     clearable
                     @change="locationsSelectChange(group.locationsDraft)">
            <template #header>
              <el-checkbox
                v-model="group.locationsDraft.locationCheckAll"
                :indeterminate="group.locationsDraft.indeterminate"
                @change="handleLocationCheckAll($event,group.locationsDraft)"
              >
                All
              </el-checkbox>
            </template>
            <el-option v-for="location in seamType_LocationsMap.get(group.locationsDraft.type)"
                       :key="location.value"
                       :label="location.label"
                       :value="location.value"></el-option>
          </el-select>
          <el-button @click="addLocations(group)">+</el-button>
        </div>
        <!--            参数-->
        <el-table class="removeTableGaps" :data="group.locationInfos" border>
          <el-table-column :label="$t('location')" prop="location" width="200px"></el-table-column>
          <el-table-column label="N/A" width="55px">
            <template #default="scope">
              <el-checkbox v-model="scope.row.isNA"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column :label="$t('reason')">
            <template #default="scope">
              <el-select :disabled="!scope.row.isNA" allow-create filterable
                         v-model="scope.row.reason" default-first-option>
                <el-option v-for="reason in seamReasons" :key="reason" :value="reason"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="$t('delete')" width="75px">
            <template #default="scope">
              <el-button type="danger" @click="removeLocationInfo(group.locationInfos,scope.$index)">
                <el-icon>x</el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="line-flex-container">
      <span class="samplesLabel">{{$t('remainingSamples')}}</span>
      <el-select v-model="newSeamSampleGroup" multiple style="flex: 1" clearable>
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
        <el-option v-for="sample in unGroupedSeamSamples" :key="sample" :value="sample"></el-option>
      </el-select>
      <el-button @click="addNewSeamGroup">
        <el-icon>
          <Check/>
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import {Check, Delete} from "@element-plus/icons-vue";
import {ref, inject, computed, onMounted, watch} from 'vue'


const props = defineProps({
  seamSamples: Array,
})

//remainSample是否全选
const remainSampleCheckAll = ref(false)
//remainSample是否半选
const remainSampleIndeterminate = ref(false)
//接缝分组
/*
* samples
* locationInfos
* */
const seamGroups = ref([])
//未分组样品
const unGroupedSeamSamples = computed(() => {
  //已分组样品
  let groupedSamples = seamGroups.value.flatMap(g => g.samples)
  return props.seamSamples.filter(s => !groupedSamples.includes(s))
})
const newSeamSampleGroup = ref([]);
const seamType_LocationsMap = new Map([
  ['Top', [
    {value:'Side', label:'Side(侧缝)'},
    {value:'Sleeve', label: 'Sleeve(袖缝)'} ,
    {value:'Armhole', label: 'Armhole(袖笼)'},
    {value:'Shoulder', label: 'Shoulder(肩缝)'},
    {value:'Armprit', label: 'Armprit(腋下缝)'},
  ]
  ],
  ['Bottom', [
    {value:'Outside', label: 'Outside(外缝)'},
    {value:'Inside', label:'Inside(内缝)'},
    {value:'Back Rise', label: 'Back Rise(后档缝)'},
    {value:'Front Crotch', label: 'Front Crotch(裆下缝)'},
  ]],
  ['Other',[
    {value:'Front Panel', label: 'Front Panel(前片)'},
    {value:'Back Panel', label:'Back Panel(后片)'},
    {value:'Cross', label:'Cross(X缝，十字缝)'}
  ]]
])
const seamTypeOptions = (()=>{
  let options = []
  seamType_LocationsMap.forEach((locations, type) => {
    options.push(type)
  })
  return options
})()
//原因
const seamReasons = ['拼缝', '接缝长度不足','该接缝不存在','织物结构为针织']

const seamParameter=computed(()=>{
  return seamGroups.value.flatMap(group=>{
    return group.samples.map(sample=>({sample,type:group.samplesType,locationInfos:group.locationInfos}))
  })
})
const seamSampleTypes=ref([{value:'Shell',label:'Shell'},
  {value:'Lining',label: 'Lining'}
])

defineExpose({
  seamParameter,
})
/*function------------------------------------------------------------------------------------------*/
//remainSample全选
const handleRemainSampleCheckAll = () => {
  remainSampleIndeterminate.value = false
  if (newSeamSampleGroup.value.length===0) {
    newSeamSampleGroup.value = [...unGroupedSeamSamples.value]
  } else {
    newSeamSampleGroup.value = []
  }
}
//获取所有缝的位置
function getAllLocations(){
  let allLocations = []
  seamType_LocationsMap.forEach(locations=> allLocations.push(...locations))
  return allLocations
}
//根据type添加部位
function addLocationsByType(group){
  for (const location of seamType_LocationsMap.get(group.locationsDraft.type).map(location=>({location:location.value,isNA:false,reason:''}))) {
    if(!group.locationInfos.some(locationInfo=>locationInfo.location===location.location))
      group.locationInfos.push(location)
  }

}

//添加新分组
function addNewSeamGroup() {
  seamGroups.value.push({
    samples: newSeamSampleGroup.value,
    locationInfos: [],
    locationsDraft: {type: '', locations: []},
    //部位多选
    locationCheckAll: false,
    indeterminate: false
  })
  newSeamSampleGroup.value = []
}

//删除某一组
function deleteGroup(index) {
  seamGroups.value.splice(index, 1)
}
//检查重复样品
function checkAllDuplicateSamples() {
  let groups = seamGroups.value;
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
      group.warnMessage = 'message.group.sampleDuplicated';
    } else if (!shouldHaveWarning && currentHasWarning) {
      // 情况 B: 不应该有警告，但现在有 -> 清空警告
      group.warnMessage = '';
    }
    // 情况 C & D: 状态一致，什么都不做，避免触发响应式更新和 UI 闪烁
  });
}
//修改单组样品
function oneGroupSamplesChange() {
}
//部位type改变
function locationTypeChange(locationsDraft){
  locationsDraft.locations=[]
  locationsDraft.locationCheckAll = false
  locationsDraft.indeterminate = false
}
//部位选择改变
function locationsSelectChange(locationsDraft) {
  if (locationsDraft.locations.length === 0) {
    locationsDraft.locationCheckAll = false
    locationsDraft.indeterminate = false
  } else if (locationsDraft.locations.length === getAllLocations().length) {
    locationsDraft.locationCheckAll = true
    locationsDraft.indeterminate = false
  } else {
    locationsDraft.indeterminate = true
    locationsDraft.locationCheckAll = false
  }
}
//全选修改
function handleLocationCheckAll(val, locationsDraft) {
  locationsDraft.indeterminate = false
  if (val) {
    //全选
    locationsDraft.locations = seamType_LocationsMap.get(locationsDraft.type).map(location => location.value)
    locationsDraft.locationCheckAll = true
    locationsDraft.indeterminate = false
  } else {
    locationsDraft.locations = []
    locationsDraft.locationCheckAll = false
    locationsDraft.indeterminate = false
  }
}
//添加部位
function addLocations(group) {
  group.locationsDraft.locations.forEach(location => {
    //不存在则添加
    if (!group.locationInfos.some(locationInfo => {
      return locationInfo.location === location
    }))
      group.locationInfos.push({location, isNA: false, reason: ''})
  })
}
//移除一行信息
function removeLocationInfo(infos,index){
  infos.splice(index,1)
}
/*数据监听--------------------------------------------------------------------------------------------*/
//监听newSampleGroup
watch(newSeamSampleGroup, (val) => {
  if (val.length === 0) {
    remainSampleCheckAll.value = false
    remainSampleIndeterminate.value = false
  } else if (val.length === unGroupedSeamSamples.value.length) {
    remainSampleCheckAll.value = true
    remainSampleIndeterminate.value = false
  } else {
    remainSampleIndeterminate.value = true
  }
})
watch(seamGroups,()=>{
  checkAllDuplicateSamples()
},{deep:true})
</script>

<style scoped lang="scss">
.blockContainer{
  @include column-stretch-flex-container();
  gap: 10px;
}
.oneGroupSeam{
  @include column-stretch-flex-container();
  border: var(--border-second-level);
  //border-radius: 4px;
  //padding: 20px;
  background-color: white;
}
.oneGroupSeam>div{
  padding: 10px 15px;
}
/*去除表格标题和内容之间的空隙*/
.removeTableGaps :deep(table){
  margin-bottom: 0 !important;
}
.samplesLabel{
  font-size: 18px;
  font-weight: 600;
  color: var(--h1-color);
}
.formLabel{
  font-size: 16px;
  font-weight: 600;
  color: var(--h1-color);
}
.groupSamples{
  border-bottom: var(--border-second-level);
  background-color: #f0f4fa;
}
.oneGroupSeamForm{
  @include column-stretch-flex-container();
}
</style>
