<template>
  <div class="firstList">
    <el-tabs type="border-card" v-model="activeTabName">
      <el-tab-pane :label="$t('menuName')" v-if="menus.length===0" name="default">
        <div>{{$t('samplePlease')}}</div>
      </el-tab-pane>
      <el-tab-pane v-for="menu in menus" :key="menu.name" :label="menu.name" :name="menu.name">
        <div class="menuFirstListContainer">
          <!--            模糊搜索-->
          <div class="itemFuzzyQueryContainer">
            <div class="oneFormItem" v-if="menu.groups">
              <div class="itemLabel">{{$t('group')}}</div>
              <el-input v-model="itemFuzzyQueryParameters.group" style="width: 150px"></el-input>
            </div>
            <div class="oneFormItem">
              <div class="itemLabel">{{$t('item')}}</div>
              <el-input v-model="itemFuzzyQueryParameters.itemName" style="width: 300px"></el-input>
            </div>
            <div class="oneFormItem">
              <div class="itemLabel">{{$t('standardCode')}}</div>
              <el-input v-model="itemFuzzyQueryParameters.standardCode" style="width: 300px"></el-input>
            </div>
            <el-button @click="itemFuzzyQuery" circle><el-icon><Search /></el-icon></el-button>
            <el-button @click="itemFuzzyQueryReset">{{$t('reset')}}</el-button>
          </div>
          <!--            分组-->
          <div v-if="menu.groups">
            <div v-for="group in menu.groups" :key="group.name" v-show="group.name.includes(itemFuzzyQueryParameters.group)">
              <h6 class="">{{ group.name }}</h6>
              <el-table
                border
                :data="group.items"
                class="removeTableGaps "
                :row-style="({row})=>{if(!(row.itemName.includes(itemFuzzyQueryParameters.itemName)&&row.standardCode.includes(itemFuzzyQueryParameters.standardCode)))
                    return {display:'none'}}"
                @row-click="(row,column,event)=>{if(event.ctrlKey){row.isTogether=!row.isTogether}}"
              >
                <el-table-column :label="$t('index')" prop="index" width="70px">
                </el-table-column>
                <el-table-column :label="$t('testItem')" prop="itemName" width="200px">
                </el-table-column>
                <el-table-column :label="$t('standardCode')" prop="standardCode">
                </el-table-column>
                <el-table-column :label="$t('requirement')" prop="requirement">
                </el-table-column>
                <el-table-column :label="$t('samples')" width="200px">
                  <template #default="scope">
<!--                    <samples-select v-model="scope.row.samples" style="width: 100%"-->
<!--                                    :size="size"-->
<!--                                    :max-show-number="3"-->
<!--                                    collapse-tags-->
<!--                                    @change="togetherChange(scope.row.isTogether,$event)"></samples-select>-->
                    <div>{{scope.row.samples.join(',')}}</div>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('parameters')" width="200px" prop="parameters">
                </el-table-column>
                <el-table-column :label="$t('copies')" width="80px" prop="copies">
                </el-table-column>
              </el-table>
            </div>
          </div>
          <!--            不分组-->
          <div v-else style="margin-top: 20px">
            <el-table
              border
              :data="menu.items"
              class="removeTableGaps "
              :row-style="({row})=>{if(!(row.itemName.includes(itemFuzzyQueryParameters.itemName)&&row.standardCode.includes(itemFuzzyQueryParameters.standardCode)))
                    return {display:'none'}}"
              @row-click="(row,column,event)=>{if(event.ctrlKey){row.isTogether=!row.isTogether}}"
            >
              <el-table-column :label="$t('index')" prop="index" width="70px">
              </el-table-column>
              <el-table-column :label="$t('testItem')" prop="itemName" width="200px">
              </el-table-column>
              <el-table-column :label="$t('standardCode')" prop="standardCode">
              </el-table-column>
              <el-table-column :label="$t('requirement')" prop="requirement">
              </el-table-column>
              <el-table-column :label="$t('samples')" width="320px">
                <template #default="scope">
<!--                  <samples-select v-model="scope.row.samples" style="width: 300px"-->
<!--                                  :size="size"-->
<!--                                  :max-show-number="3"-->
<!--                                  collapse-tags-->
<!--                                  @change="togetherChange(scope.row.isTogether,$event)"></samples-select>-->
                  <div>{{scope.row.samples.join(',')}}</div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('copies')" width="80px" prop="copies">
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import SamplesSelect from "@/components/self made UI/SamplesSelect.vue";
import {computed, reactive, ref, watch} from "vue";
import {Search} from "@element-plus/icons-vue";

const props = defineProps({
  step1Dom: Object,
  size: {
    type: String,
    default: 'default'
  },
});
const menus=computed(()=>props.step1Dom.menus)
//活跃标签页
const activeTabName=ref(menus.value[0].name)
//item模糊查询参数
const itemFuzzyQueryParameters=reactive({
  itemName: '',
  standardCode: '',
  group: '',
})

/*method--------------------------------------------------------------------------------------------*/
//重置
function itemFuzzyQueryReset(){
  itemFuzzyQueryParameters.itemName=''
  itemFuzzyQueryParameters.standardCode=''
  itemFuzzyQueryParameters.group=''
}

/*数据监听--------------------------------------------------------------------------------------------*/
watch(menus, () => {
  //不包含当前标签页
  if(!menus.value.some(menu => menu.name === activeTabName.value)){
    //不为空
    if(menus.value.length>0){
      activeTabName.value=menus.value[0].name
    }else{
      activeTabName.value='default'
    }
  }
})
</script>

<style scoped lang="scss">
@mixin thisBlockBorder {
  border: 1px solid var(--el-border-color);
}
.firstList h6 {
  margin-top: 10px !important;
  margin-bottom: 10px !important;
}
.firstLine > div {
  @include thisBlockBorder;
  display: flex;
  align-items: center;
  justify-content: center;
}
/*去除表格标题和内容之间的空隙*/
.removeTableGaps :deep(table) {
  margin-bottom: 0 !important;
}

.itemLabel{
  //width: 80px;
  font-size: 16px;
  font-weight: bold;
  //text-align: left;
}

.oneFormItem{
  @include line-flex-container;
}
.itemFuzzyQueryContainer{
  @include line-flex-container;
  gap:10px;
  //margin-left: 20px;
}
</style>
