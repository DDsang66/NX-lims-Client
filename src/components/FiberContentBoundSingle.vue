<template>
  <div class="row">
    <div class="col-xl-12">
      <!-- 标题 + 折叠开关 -->
      <div style="margin-bottom: 5px">
        <a style="color:#3364d5;font-size: 20px;font-weight: bold" href="#" @click.prevent="toggleNotice()">
          {{ $t('fiberContent') }}
        </a>
      </div>
      <transition name="fade">
        <!-- 折叠面板 -->
        <div v-show="isNoticeOpen" :class="['sigma_notice-content', { block: isNoticeOpen.value }]">
          <div class="mainContainer">
            <!--          样品-->
            <div class="oneSampleComposition" v-for="(group,index) in sampleGroups" :key="group.samples">
              <div class="line-flex-container">
                <el-select v-model="group.samples" placeholder="" multiple
                           style="flex:1;"
                           @change="oneGroupSamplesChange">
                  <el-option v-for="sample in sampleSummary" :key="sample" :value="sample"></el-option>
                </el-select>
                <el-button type="danger" @click="deleteGroup(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <!-- 输入 -->
              <div class="line-flex-container">
                <div style="width: 50%" class="line-left-flex-container">
                  <label>{{ $t('composition') }}<span class="text-danger">*</span></label>
                  <el-select v-model="group.inputRow.composition" placeholder="" filterable style="width: 200px">
                    <el-option v-for="item in allCompositions" :key="item" :value="item">{{ item }}</el-option>
                  </el-select>
                </div>
                <div style="width: 50%" class="line-left-flex-container">
                  <label>{{ $t('rate') }}<span class="text-danger">*</span></label>
                  <div class="line-flex-container">
                    <el-input type="number" placeholder=""
                              v-model.number="group.inputRow.rate" min="0" max="100" />
                    <el-button @click="addRow(group)">+</el-button>
                  </div>
                </div>
              </div>
              <!-- 表格 -->
              <div>
                <el-table :data="group.rows" border class="removeTableGaps">
                  <el-table-column :label="$t('composition')" prop="composition">
                    <template v-slot="scope">
                      <el-select v-model="scope.row.composition" placeholder="成分" filterable style="width: 200px">
                        <el-option v-for="item in allCompositions" :key="item" :value="item">{{ item }}</el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('rate')" >
                    <template v-slot="scope">
                      <el-input type="number" placeholder="比例"
                                @keydown="handleKeydown"
                                @blur="updateRateOnBlur(group,scope.row.rate)"
                                v-model.number="scope.row.rate" min="0" max="100" />
                    </template>
                  </el-table-column>
                  <el-table-column label="Delete" width="75">
                    <template v-slot="scope">
                      <el-button @click="removeRow(group.rows,scope.$index)">
                        ×
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <!-- 结果 -->
              <div class="line-flex-container">
                <label>Composition > 50%</label>
                <el-input type="text"  :value="getMaxComposition(group.rows)" disabled  style="flex:1"/>
              </div>
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
import {ref, reactive, computed, watch, onMounted, onBeforeUnmount, inject} from 'vue'
import {Check, Delete} from "@element-plus/icons-vue";
const emit = defineEmits(['confirm']);

const props=defineProps({
  sampleSummary: {
    type: Array,
    default: () => []
  }
})
const request = inject('request');
//样品分组
/*
* {samples:[
* composition
* */
const sampleGroups=ref([])
//未分组样品
const unGroupedSamples=computed(()=>{
  //已分组样品
  let groupedSamples = sampleGroups.value.flatMap(g => g.samples)
  return props.sampleSummary.filter(s => !groupedSamples.includes(s))
})
//新分组
const newSampleGroup=ref([])
/* 折叠开关 */
const isNoticeOpen = ref(true)
function toggleNotice() {
  isNoticeOpen.value = !isNoticeOpen.value;
}
/* 输入行 */

/* 表格数据 */

/* 判断类别 */
const synthList = ['Acetate', 'Polyester', 'Polyamide', 'Polyurethane', 'Polyethylene', 'Elastane', 'Spandex', 'Viscose', 'Acrylic', 'Modal', 'Tencel', 'Meraklon', 'Lycra', 'Lyocell', 'Modacrylic' ,'Nylon', 'Rayon', 'Vinylon']
const naturalList = ['Cotton', 'Wool', 'Silk', 'Ramie', 'Mohair', 'Tussah', 'Linen', 'Asbestos']
const isSynth = str => synthList.includes(str)
const isNatural = str => naturalList.includes(str)

const allCompositions = ref();

//function------------------------------------------------------------------------------------------
//删除某一组
function deleteGroup(index){
  sampleGroups.value.splice(index,1)
}
//获取成分选项列表
async function getCompositions() {
  allCompositions.value=(await request.get('/render/compositionsearch')).data.data
}
//修改单组样品
function oneGroupSamplesChange() {
  let countSamples=new Set()
  for (const group of sampleGroups.value) {
    group.samples.forEach(sample => {
      if(countSamples.has(sample))
        return alert('Some components already exists')
      countSamples.add(sample)
    })
  }
}
/* 添加行 */
function addRow(group) {
  if (!group.inputRow.composition.trim() || group.inputRow.rate <= 0) return alert('请输入成分和比例')
  //总比例
  let countRate=getCountRate(group.rows)
  if(group.rows.some(c=> c.composition===group.inputRow.composition))
    return alert('This component already exists')
  if(countRate+group.inputRow.rate>100){
    alert('The proportion cannot exceed 100');
  }else {
    group.rows.push({ composition: group.inputRow.composition.trim(), rate: group.inputRow.rate })
    group.inputRow.composition = ''
    group.inputRow.rate = 0
  }
}
/* 实时计算总比例  */
const getCountRate =(rows) => rows.reduce((s, r) => s + r.rate, 0)
//计算MaxComposition
function getMaxComposition(rows){
  const synth = rows.filter(r => isSynth(r.composition)).reduce((s, r) => s + r.rate, 0)
  const nat = rows.filter(r => isNatural(r.composition)).reduce((s, r) => s + r.rate, 0)
  return synth > 50 ? 'Synth' : nat > 50 ? 'Natural' : ''
}
function addNewGroup() {
  sampleGroups.value.push({
    samples: newSampleGroup.value,
    rows: [],
    inputRow: {}
  })
  newSampleGroup.value = []
}
//删除行
function removeRow(rows,idx) {
  rows.splice(idx, 1);
}

watch(sampleGroups,() => {
  let fiberComposition=[];
  for (const group of sampleGroups.value) {
    for (const sample of group.samples) {
      fiberComposition.push({sample:sample,composition:group.rows})
    }
  }
  emit('confirm', fiberComposition)
},{deep:true})
function handleKeydown(e) {
  // 检测是否按下了 Enter 键
  if (e.key === 'Enter') {
    // 阻止默认行为（换行）
    e.preventDefault();
    // 让当前元素失去焦点，触发 @blur
    e.target.blur();
  }
}
// 失焦时才进行校验和更新
function updateRateOnBlur(group, rate) {
  if(!rate)
    return alert('Please enter the proportion')
  //比例超过100
  if(getCountRate(group.rows)>100)
    return alert('The proportion cannot exceed 100')
}
onMounted(()=>{
  getCompositions()
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
.oneSampleComposition{
  @include column-flex-container();
  align-items: stretch;
  border: 1px solid #9f9c9c;
  border-radius: 4px;
  padding: 10px;
}
.mainContainer{
  @include column-flex-container();
  align-items: stretch;
}
/*去除多余间隔*/
:deep(.el-select__popper) ul li{
  margin:0 !important;
}
</style>
