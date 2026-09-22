<template>
  <div class="blockContainer">
    <el-select :model-value="modelValue"
               multiple
               placeholder=""
               style="width: 100%"
               class="thisMulSelect"
               @update:model-value="val => emit('update:modelValue', val)">
      <el-option v-for="option in washesOptions"
                 :key="option"
                 :value="option"
                 :label="option" />
    </el-select>
  </div>
</template>

<script setup>
  import { ref } from "vue";
  const props = defineProps({
    // 选项列表（原 afterWashItems 重命名，避免和 v-model 数据冲突）
    afterWashOptionsList: {
      type: Array,
      required: true
    },
    modelValue: {
      type: Array,
      default: () => []
    }
  })
  const emit = defineEmits(['update:modelValue'])


  //洗后遍数选项（如果父组件传选项就用 props.afterWashOptionsList，否则用本地常量）
  const washesOptions = ['1 Wash', '3 Wash', '5 Wash', '10 Wash', '15 Wash', '20 Wash', '25 Wash', '32 Wash', '45 Wash'];
/*
{items，afterWashData}
* */
//项目分组
//const itemGroups = ref([])
//const newItemGroup = ref([]);
////未分组项目
//const unGroupedItems = computed(() => {
//  //已分组项目
//  let groupedItems = itemGroups.value.flatMap(g => g.items)
//  return props.afterWashItems.filter(s => !groupedItems.includes(s))
//})
////remainItem是否全选
//const remainItemCheckAll = ref(false)
////remainItem是否半选
//const remainItemIndeterminate = ref(false)
////洗后遍数选项
//  const washesOptions = ['1 Wash', '3 Wash', '5 Wash', '10 Wash', '15 Wash', '20 Wash', '25 Wash', '32 Wash', '45 Wash'];
//// function-----------------------------------------------------------------------------------------
////检查样品和洗涤遍数
//function checkAllSamplesAndAfterWashes(groups) {
//  if (!groups || !Array.isArray(groups)) return;

//  // --- 步骤 1: 建立全局样本索引 (逻辑不变) ---
//  const sampleMap = new Map();
//  let washesWarnMessage = 'message.inputIsEmpty';
//  let sampleWarnMessage = 'message.inputIsEmpty';
//  groups.forEach(group => {
//    if(!group.afterWashes || !Array.isArray(group.afterWashes) || group.afterWashes.length===0){
//      if(group.afterWashesWarnMessage!==washesWarnMessage)
//        group.afterWashesWarnMessage =washesWarnMessage;
//    }
//    else{
//      if(group.afterWashesWarnMessage===washesWarnMessage)
//        group.afterWashesWarnMessage = '';
//    }
//    if (!group.samples || !Array.isArray(group.samples) || group.samples.length===0) {
//      if(group.sampleWarnMessage!==sampleWarnMessage)
//        group.sampleWarnMessage =sampleWarnMessage;
//      return;
//    }
//    else{
//      if(group.sampleWarnMessage===sampleWarnMessage)
//        group.sampleWarnMessage = '';
//    }
//    group.samples.forEach(sample => {
//      if (!sample) return;
//      if (!sampleMap.has(sample)) {
//        sampleMap.set(sample, new Set());
//      }
//      sampleMap.get(sample).add(group);
//    });
//  });

//  // --- 步骤 2: 找出所有“确实有重复问题”的组集合 ---
//  const groupsWithIssues = new Set();

//  for (const [sample, groupSet] of sampleMap.entries()) {
//    if (groupSet.size > 1) {
//      groupSet.forEach(g => groupsWithIssues.add(g));
//    }
//  }

//  // --- 步骤 3: 差异化更新 (关键优化点) ---
//  groups.forEach(group => {
//    let dumplicateWarnMessage = 'message.group.sampleDuplicated'
//    const shouldHaveWarning = groupsWithIssues.has(group);
//    const currentHasWarning = group.sampleWarnMessage===dumplicateWarnMessage; // 当前是否有警告内容

//    if (shouldHaveWarning && !currentHasWarning) {
//      // 情况 A: 应该有警告，但现在没有 -> 添加警告
//      group.sampleWarnMessage = dumplicateWarnMessage;
//    } else if (!shouldHaveWarning && currentHasWarning) {
//      // 情况 B: 不应该有警告，但现在有 -> 清空警告
//      group.sampleWarnMessage = '';
//    }
//    // 情况 C & D: 状态一致，什么都不做，避免触发响应式更新和 UI 闪烁
//  });
//}

////检查重复项目
//function checkAllDuplicateItems() {
//  let groups = itemGroups.value;
//  if (!groups || !Array.isArray(groups)) return;

//  // --- 步骤 1: 建立全局样本索引 (逻辑不变) ---
//  const itemMap = new Map();
//  //统计，每个项目对应分组
//  groups.forEach(group => {
//    if (!group.items || !Array.isArray(group.items)) return;
//    group.items.forEach(item => {
//      if (!item) return;
//      if (!itemMap.has(item)) {
//        itemMap.set(item, new Set());
//      }
//      itemMap.get(item).add(group);
//    });
//  });
//  // --- 步骤 2: 找出所有“确实有重复问题”的组集合 ---
//  const groupsWithIssues = new Set();

//  for (const [item, groupSet] of itemMap.entries()) {
//    if (groupSet.size > 1) {
//      groupSet.forEach(g => groupsWithIssues.add(g));
//    }
//  }

//  // --- 步骤 3: 差异化更新 (关键优化点) ---
//  groups.forEach(group => {
//    //是否应该警告
//    const shouldHaveWarning = groupsWithIssues.has(group);
//    const currentHasWarning = !!group.sampleWarnMessage; // 当前是否有警告内容

//    if (shouldHaveWarning && !currentHasWarning) {
//      // 情况 A: 应该有警告，但现在没有 -> 添加警告
//      group.sampleWarnMessage = 'message.group.sampleDuplicated';
//    } else if (!shouldHaveWarning && currentHasWarning) {
//      // 情况 B: 不应该有警告，但现在有 -> 清空警告
//      group.sampleWarnMessage = '';
//    }
//    // 情况 C & D: 状态一致，什么都不做，避免触发响应式更新和 UI 闪烁
//  });
//}
////移除某已选遍数
//function removeAfterWash(group,index){
//  group.afterWashData.splice(index,1)
//}
////添加洗后次数
//function addAfterWash(group){
//  group.afterWashData.push({
//    samples: group.addForm.samples,
//    afterWashes: group.addForm.afterWashes
//  })
//  group.addForm.samples = []
//  group.addForm.afterWashes = []
//}
////删除某一组
//function deleteGroup(index){
//  itemGroups.value.splice(index,1)
//  checkAllDuplicateItems()
//}
////修改单组项目
//function oneGroupItemsChange() {
//  checkAllDuplicateItems()
//}
////remainItem全选
//const handleRemainItemCheckAll = () => {
//  remainItemIndeterminate.value = false
//  if (newItemGroup.value.length===0) {
//    newItemGroup.value = [...unGroupedItems.value]
//  } else {
//    newItemGroup.value = []
//  }
//}
////添加新分组
//function addNewItemGroup() {
//  itemGroups.value.push({
//    items: newItemGroup.value,
//    //新增form
//    addForm: {
//      samples: [],
//      //洗后次数
//      afterWashes: []
//    },
//    //数据
//    afterWashData: []
//  })
//  newItemGroup.value = []
//}
////暴露数据-------------------------------------------------------------------------------------------
//defineExpose({
//  itemGroups: itemGroups
//})

////数据监听-------------------------------------------------------------------------------------------
////监听newItemGroup
//watch(newItemGroup, (val) => {
//  if (val.length === 0) {
//    remainItemCheckAll.value = false
//    remainItemIndeterminate.value = false
//  } else if (val.length === unGroupedItems.value.length) {
//    remainItemCheckAll.value = true
//    remainItemIndeterminate.value = false
//  } else {
//    remainItemIndeterminate.value = true
//  }
//})
////监听数据。样品重复警告，数据空值警告
//watch(itemGroups, () => {
//  for (const group of itemGroups.value) {
//    checkAllSamplesAndAfterWashes(group.afterWashData);
//  }
//},{deep:true})
</script>

<style scoped lang="scss">
  .blockContainer {
    width: 100%;
  }

  .thisMulSelect :deep(.el-tag__close) {
    position: relative !important;
    top: auto !important;
    right: auto !important;
    transform: none !important;
  }
</style>
