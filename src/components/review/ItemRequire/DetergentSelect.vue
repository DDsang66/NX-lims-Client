<template>
  <div class="blockContainer">
    <div class="oneGroupDetergent" v-for="(group,index) in itemGroups" :key="group.samples">
      <!--            项目-->
      <div class="column-stretch-flex--container groupSamples">
        <div class="line-flex-container">
          <span class="itemsLabel">{{$t('items')}}</span>
          <el-select v-model="group.items" placeholder="" multiple
                     style="flex:1;"
                     @change="oneGroupItemsChange">
            <el-option v-for="item in detergentItems" :key="item" :value="item"></el-option>
          </el-select>
          <el-button type="danger" @click="deleteGroup(index)">
            <el-icon>
              <Delete/>
            </el-icon>
          </el-button>
        </div>
        <div class="warningMy" v-if="group.sampleWarnMessage">{{$t(group.sampleWarnMessage)}}</div>
      </div>
<!--      单组-->
      <div class="oneGroupDetergentForm">
        <div class="line-flex-container">
          <div class="oneFormItem">
            <label>{{$t('samples')}}</label>
            <el-select v-model="group.addForm.samples" placeholder="" multiple style="width: 300px">
              <el-option v-for="sample in sampleSummary" :key="sample" :value="sample"></el-option>
            </el-select>
          </div>
          <div class="oneFormItem" style="flex: 1">
            <label>{{$t('detergent')}}</label>
            <el-select  v-model="group.addForm.detergent"
                        class="thisMulSelect"
                        placeholder=""
                        style="flex: 1">
              <el-option v-for="option in detergentOptions" :key="option" :value="option">
                {{ option }}
              </el-option>
            </el-select>
            <el-button @click="addDetergent(group)">+</el-button>
          </div>

        </div>
        <div class="detergentTableContainer">
          <el-table :data="group.detergentData" border class="removeTableGaps">
            <el-table-column :label="$t('samples')" width="300">
              <template #default="scope">
                <el-select  v-model="scope.row.samples"
                            placeholder=""
                            class="thisMulSelect"
                            multiple>
                  <el-option v-for="option in sampleSummary" :key="option" :value="option">
                    {{ option }}
                  </el-option>
                </el-select>
                <div class="warningMy" v-if="scope.row.sampleWarnMessage">{{$t(scope.row.sampleWarnMessage)}}</div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('detergent')">
              <template #default="scope">
                <el-select  v-model="scope.row.detergent"
                            placeholder=""
                            class="thisMulSelect">
                  <el-option v-for="option in detergentOptions" :key="option" :value="option">
                    {{ option }}
                  </el-option>
                </el-select>
                <div class="warningMy" v-if="scope.row.detergentWarnMessage">{{$t(scope.row.detergentWarnMessage)}}</div>
              </template>
            </el-table-column>
            <el-table-column label="action" width="75">
              <template #default="scope">
                <el-button @click="removeDetergent(group,scope.$index)" type="danger" style="margin: auto;display: block">
                  x</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <div class="line-flex-container">
      <span class="itemsLabel">{{$t('remainingItems')}}</span>
      <el-select v-model="newItemGroup" multiple style="flex: 1" clearable>
        <template #header>
          <el-checkbox
            v-model="remainItemCheckAll"
            :indeterminate="remainItemIndeterminate"
            @change="handleRemainItemCheckAll"
            style="width: 100%;"
          >
            All
          </el-checkbox>
        </template>
        <el-option v-for="item in unGroupedItems" :key="item" :value="item"></el-option>
      </el-select>
      <el-button @click="addNewItemGroup">
        <el-icon>
          <Check/>
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import {Check, Delete} from "@element-plus/icons-vue";
import {computed, ref, watch} from "vue";

const props = defineProps({
  detergentItems: {
    type: Array,
    required: true
  },
  sampleSummary: {
    type: Array,
    required: true
  },
})
//洗涤剂选项
const detergentOptions=["Mild Detergent","Wool Detergent"]
/*
{items，detergent}
* */
//项目分组
const itemGroups = ref([])
const newItemGroup = ref([]);
//未分组项目
const unGroupedItems = computed(() => {
  //已分组项目
  let groupedItems = itemGroups.value.flatMap(g => g.items)
  return props.detergentItems.filter(s => !groupedItems.includes(s))
})
//remainItem是否全选
const remainItemCheckAll = ref(false)
//remainItem是否半选
const remainItemIndeterminate = ref(false)

// function-----------------------------------------------------------------------------------------
//检查样品和洗涤剂
function checkAllSamplesAndAfterWashes(groups) {
  if (!groups || !Array.isArray(groups)) return;

  // --- 步骤 1: 建立全局样本索引 (逻辑不变) ---
  const sampleMap = new Map();
  let detergentWarnMessage = 'message.inputIsEmpty';
  let sampleWarnMessage = 'message.inputIsEmpty';
  groups.forEach(group => {
    if(!group.detergent){
      if(group.detergentWarnMessage!==detergentWarnMessage)
        group.detergentWarnMessage =detergentWarnMessage;
    }
    else{
      if(group.detergentWarnMessage===detergentWarnMessage)
        group.detergentWarnMessage = '';
    }
    if (!group.samples || !Array.isArray(group.samples) || group.samples.length===0) {
      if(group.sampleWarnMessage!==sampleWarnMessage)
        group.sampleWarnMessage =sampleWarnMessage;
      return;
    }
    else{
      if(group.sampleWarnMessage===sampleWarnMessage)
        group.sampleWarnMessage = '';
    }
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
    let dumplicateWarnMessage = 'message.group.sampleDuplicated'
    const shouldHaveWarning = groupsWithIssues.has(group);
    const currentHasWarning = group.sampleWarnMessage===dumplicateWarnMessage; // 当前是否有警告内容

    if (shouldHaveWarning && !currentHasWarning) {
      // 情况 A: 应该有警告，但现在没有 -> 添加警告
      group.sampleWarnMessage = dumplicateWarnMessage;
    } else if (!shouldHaveWarning && currentHasWarning) {
      // 情况 B: 不应该有警告，但现在有 -> 清空警告
      group.sampleWarnMessage = '';
    }
    // 情况 C & D: 状态一致，什么都不做，避免触发响应式更新和 UI 闪烁
  });
}

//移除某已选洗涤剂
function removeDetergent(group,index){
  group.detergentData.splice(index,1)
}
//添加洗涤剂
function addDetergent(group){
  group.detergentData.push({
    samples: group.addForm.samples,
    detergent: group.addForm.detergent
  })
  group.addForm.samples = []
  group.addForm.detergent = ''
}
//删除某一组
function deleteGroup(index){
  itemGroups.value.splice(index,1)
  checkAllDuplicateItems()
}
//检查重复项目
function checkAllDuplicateItems() {
  let groups = itemGroups.value;
  if (!groups || !Array.isArray(groups)) return;

  // --- 步骤 1: 建立全局样本索引 (逻辑不变) ---
  const itemMap = new Map();
  //统计，每个项目对应分组
  groups.forEach(group => {
    if (!group.items || !Array.isArray(group.items)) return;
    group.items.forEach(item => {
      if (!item) return;
      if (!itemMap.has(item)) {
        itemMap.set(item, new Set());
      }
      itemMap.get(item).add(group);
    });
  });
  // --- 步骤 2: 找出所有“确实有重复问题”的组集合 ---
  const groupsWithIssues = new Set();

  for (const [item, groupSet] of itemMap.entries()) {
    if (groupSet.size > 1) {
      groupSet.forEach(g => groupsWithIssues.add(g));
    }
  }

  // --- 步骤 3: 差异化更新 (关键优化点) ---
  groups.forEach(group => {
    //是否应该警告
    const shouldHaveWarning = groupsWithIssues.has(group);
    const currentHasWarning = !!group.sampleWarnMessage; // 当前是否有警告内容

    if (shouldHaveWarning && !currentHasWarning) {
      // 情况 A: 应该有警告，但现在没有 -> 添加警告
      group.sampleWarnMessage = 'message.group.sampleDuplicated';
    } else if (!shouldHaveWarning && currentHasWarning) {
      // 情况 B: 不应该有警告，但现在有 -> 清空警告
      group.sampleWarnMessage = '';
    }
    // 情况 C & D: 状态一致，什么都不做，避免触发响应式更新和 UI 闪烁
  });
}
//修改单组项目
function oneGroupItemsChange() {
  checkAllDuplicateItems()
}
//添加新分组
function addNewItemGroup() {
  itemGroups.value.push({
    items: newItemGroup.value,
    //新增form
    addForm: {
      samples: [],
      //洗后次数
      detergent: ''
    },
    //数据
    detergentData: []
  })
  newItemGroup.value = []
}
//remainItem全选
const handleRemainItemCheckAll = () => {
  remainItemIndeterminate.value = false
  if (newItemGroup.value.length===0) {
    newItemGroup.value = [...unGroupedItems.value]
  } else {
    newItemGroup.value = []
  }
}

//暴露-----------------------------------------------------------------------------------------------
defineExpose({
  itemGroups: itemGroups
})
//监听-----------------------------------------------------------------------------------------------
//监听newItemGroup
watch(newItemGroup, (val) => {
  if (val.length === 0) {
    remainItemCheckAll.value = false
    remainItemIndeterminate.value = false
  } else if (val.length === unGroupedItems.value.length) {
    remainItemCheckAll.value = true
    remainItemIndeterminate.value = false
  } else {
    remainItemIndeterminate.value = true
  }
})
//监听数据。样品重复警告，数据空值警告
watch(itemGroups, () => {
  for (const group of itemGroups.value) {
    checkAllSamplesAndAfterWashes(group.detergentData);
  }
},{deep:true})
</script>

<style scoped lang="scss">
.blockContainer{
  @include column-stretch-flex-container();
  gap: 10px;
}
.oneGroupDetergent{
  @include column-stretch-flex-container();
  border: var(--border-second-level);
  //border-radius: 4px;
  //padding: 20px;
  background-color: white;
}
.oneGroupDetergent>div{
  padding: 10px 15px;
}
/*去除表格标题和内容之间的空隙*/
.removeTableGaps :deep(table){
  margin-bottom: 0 !important;
}
.itemsLabel{
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
.oneGroupDetergentForm{
  @include column-stretch-flex-container();
}
.oneFormItem{
  @include line-flex-container();
}
.thisMulSelect :deep(.el-tag__close) {
  position: relative !important;
  top: auto !important;
  right: auto !important;
  transform: none !important;
}
</style>
