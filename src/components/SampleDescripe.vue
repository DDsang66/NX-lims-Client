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
<!--          &lt;!&ndash; 输入 &ndash;&gt;-->
<!--          <div class="row" style="margin-bottom: 20px">-->
<!--            <div class=" col-xl-4">-->
<!--              <label>{{ $t('property') }}<span class="text-danger">*</span></label>-->
<!--              <div class="input-group">-->
<!--                <select class="form-control" v-model="Property">-->
<!--                  <option value="">N/A</option>-->
<!--                  <option v-for="option in property" :key="option.value" :value="option.value">-->
<!--                    {{ option.label }}-->
<!--                  </option>-->
<!--                </select>-->
<!--                <div class="input-group-append">-->
<!--                  <button class="sigma_btn-custom shadow-none btn-sm" style="background-color:#3364d5" @click="toggleDetial()">▮</button>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--            <div class=" col-xl-8">-->
<!--              <label>{{ $t('word Entry') }}<span class="text-danger">*</span></label>-->
<!--              <div class="input-group">-->
<!--                <input type="text" class="form-control" v-model="inputVal" />-->
<!--                <select class="form-control" v-model="Word">-->
<!--                  <option value="">N/A</option>-->
<!--                  <option v-for="option in wordOptions" :key="option.value" :value="option.value">-->
<!--                    {{ option.label }}-->
<!--                  </option>-->
<!--                </select>-->
<!--                <div class="input-group-append">-->
<!--                  <button class="sigma_btn-custom shadow-none btn-sm" style="background-color:#3364d5" @click="addWord">+</button>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->

<!--          &lt;!&ndash; 表格 &ndash;&gt;-->
<!--          <div class="row">-->
<!--            &lt;!&ndash; 结果 & 提交 &ndash;&gt;-->
<!--            <div class=" col-xl-9">-->
<!--              <label>{{ $t('description') }}</label>-->
<!--              <input type="text" class="form-control" v-model="description" readonly />-->
<!--            </div>-->
<!--            <div class=" col-xl-3">-->
<!--              <label>action </label>-->
<!--              <button class="sigma_btn-custom primary btn-block" style="background-color:#3364d5" @click="clear">Clear</button>-->
<!--            </div>-->
<!--          </div>-->
          <div>
            <el-form label-position="top" inline>
              <el-form-item label="Property">
                <el-select v-model="thisProperty" style="width: 200px" value-key="propertyName">
                  <el-option v-for="option in propertys" :key="option.propertyName" :value="option" :label="option.propertyName">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Value" style="flex: 1">
                <div class="line-left-flex-container" style="width: 100%">
                  <el-select v-if="thisProperty.type==='Single'" v-model="thisProperty.value" style="flex: 1">
                    <el-option v-for="option in thisProperty.propertyValue" :key="option" :value="option">
                    </el-option>
                  </el-select>
                  <el-input v-if="thisProperty.type==='Input'" v-model="thisProperty.value" style="flex: 1" />
                  <el-select multiple v-if="thisProperty.type==='Multiple'" v-model="thisProperty.value" style="flex: 1" >
                    <el-option v-for="option in thisProperty.propertyValue" :key="option" :value="option">
                    </el-option>
                  </el-select>
                  <el-button style="margin-left: 10px" type="primary" @click="addToTable">+</el-button>
                </div>
              </el-form-item>
            </el-form>
            <el-table :data="propertyTable" class="removeTableGaps" border>
              <el-table-column label="Property" prop="propertyName" width="150px">
              </el-table-column>
              <el-table-column label="Value">
                <template #default="scope">
                  <el-select v-if="scope.row.type==='Single'" v-model="scope.row.value" >
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
                  <el-button type="danger" @click="removeAllProperty">x</el-button>
                </template>
                <template #default="scope">
                  <el-button v-if="scope.row.isNecessary.includes('N')" type="danger" @click="removeProperty(scope.$index)">x</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

      </transition>
    </div>
  </div>

  <div :class="['search-form-wrapper', { open: isDetial }]">
    <div class="search-trigger sigma_close" @click="toggleDetial()">
      <span></span>
      <span></span>
    </div>
    <div style="overflow-y: auto; max-height: 70%; width: 70%; border: 1px solid #ddd; ">
      <table class="sigma_responsive-table">
        <thead>
          <tr>
            <th style="text-align:center" colspan="6">Necessarily Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Common</th>
            <td>AfterWash / Structure / State</td>
          </tr>
          <tr>
            <th>Mango</th>
            <td>AfterWash / State</td>
          </tr>
          <tr>
            <th>Crazy Line</th>
            <td>AfterWash / Structure / State / Area</td>
          </tr>
          <tr>
            <th>JAKO</th>
            <td>AfterWash / Structure / State / Batch / Type / Category</td>
          </tr>
          <tr>
            <th>Tchibo</th>
            <td>ProjectNo. / Color / Structure / State / Type</td>
          </tr>
        </tbody>

      </table>
    </div>
  </div>

</template>

<script setup>
  import '@/assets/css/style.css';
  import { ref, reactive, computed, watch } from 'vue'

  const props=defineProps({
    propertys: Array,
  })

  /* 折叠开关 */
  const isNoticeOpen = ref(true)
  function toggleNotice() {
    isNoticeOpen.value = !isNoticeOpen.value;
  }
  const isDetial = ref(false)
  function toggleDetial() {
    isDetial.value = !isDetial.value;
  }

  const thisProperty = ref({name:'',value:'',type:'',options:null,defaultValue:null});

  //表格展示的property，获取必选项作为默认值
  const propertyTable=ref(props.propertys.filter(property => property.isNecessary.includes('Y')).map(
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
  ))
  defineExpose({
    propertyTable,
  })

  function addToTable(){
    //添加到表格
    //如果已有该行
    if(propertyTable.value.some(item => item.propertyName === thisProperty.value.propertyName)){
      propertyTable.value.map(item => {
        if (item.propertyName === thisProperty.value.propertyName) {
          //如果已有该项不处理
          if(item.value.includes(thisProperty.value.value))
            return;
          //如果是输入框
          if(thisProperty.value.type==='Input')
            item.value += '-'+thisProperty.value.value;
          //多选
          else if(thisProperty.value.type==='Multiple')
            item.value =thisProperty.value.value;
          //单选
          else
            item.value = thisProperty.value.value;
        }
      })
    }else{
      propertyTable.value.push(JSON.parse(JSON.stringify(thisProperty.value)))
    }
  }
  //去除所有非必选property
  function removeAllProperty(){
    for (let i=propertyTable.value.length-1;i>0;i--){
      if(!propertyTable.value[i].isNecessary.includes('Y'))
        propertyTable.value.splice(i,1)
    }
  }
  //去除单个property
  function removeProperty(index){
    propertyTable.value.splice(index,1)
  }
  watch(()=>props.propertys,()=>{
    propertyTable.value=props.propertys.filter(property => property.isNecessary.includes('Y')).map(
      property => {
        let newProperty= JSON.parse(JSON.stringify(property))
        newProperty.value=newProperty.defaultValue;
        return newProperty;
      }
    )
  })
</script>

<style scoped>
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
</style>
