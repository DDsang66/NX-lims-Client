<template>
  <div class="mainContainer">
    <!--          样品-->
    <div class="oneGroupComposition" v-for="(group,index) in sampleGroups" :key="group.samples">
      <div class="column-stretch-flex--container groupSamples">
        <div class="line-flex-container">
          <div class="groupLabelContainer">
            <span class="samplesLabel">{{$t('samples')}}</span>
          </div>
          <el-select v-model="group.samples" placeholder="" multiple
                     style="flex:1;"
                     @change="oneGroupSamplesChange">
            <el-option v-for="sample in sampleSummary" :key="sample" :value="sample"></el-option>
          </el-select>
          <el-button type="danger" @click="deleteGroup(index)">
            <el-icon>
              <Delete/>
            </el-icon>
          </el-button>
        </div>
        <div class="warningMy" v-if="group.warnMessage">{{$t(group.warnMessage)}}</div>
      </div>
      <div class="oneGroupComposForm">
        <!-- 输入 -->
        <div class="line-flex-container">
          <div style="flex:1" class="line-left-flex-container">
            <div class="groupLabelContainer">
              <span class="formLabel">{{ $t('composition') }}<span class="text-danger">*</span></span>
            </div>
            <el-select v-model="group.inputRow.composition" placeholder="" filterable
                       style="flex:1">
              <el-option v-for="item in allCompositions" :key="item.idComposition" 
                         :value="item.compositionNameEn" :label="item.compositionNameEn">
                {{ item.compositionNameEn }}
              </el-option>
            </el-select>
          </div>
          <div class="line-left-flex-container">
            <div class="groupLabelContainer">
              <span class="formLabel">{{ $t('rate') }}<span class="text-danger">*</span></span>
            </div>
            <div class="line-flex-container">
              <el-input type="number" placeholder="" style="width: 70px;"
                        v-model.number="group.inputRow.rate" :min="0" :max="100"/>
              <el-button @click="addRow(group)">+</el-button>
            </div>
          </div>
        </div>
        <!-- 表格 -->
        <div>
          <el-table :data="group.rows" border class="removeTableGaps">
            <el-table-column :label="$t('composition')" prop="composition">
              <template v-slot="scope">
                <el-select v-model="scope.row.compositionNameEn" placeholder="成分" filterable
                           style="width: 200px" @change="updateCompositionInfo(scope.row)">
                  <el-option v-for="item in allCompositions" :key="item.idComposition" 
                             :value="item.compositionNameEn" :label="item.compositionNameEn">
                    {{ item.compositionNameEn }}
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column :label="$t('rate')">
              <template v-slot="scope">
                <el-input type="number" placeholder="比例"
                          @keydown="handleKeydown"
                          @blur="updateRateOnBlur(group,scope.row.rate)"
                          v-model.number="scope.row.rate" min="0" max="100"/>
              </template>
            </el-table-column>
            <el-table-column :label="$t('delete')" width="75">
              <template v-slot="scope">
                <el-button type="danger" @click="removeRow(group.rows,scope.$index)">
                  ×
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 结果 -->
        <div class="line-flex-container">
          <span class="formLabel">{{$t('composition')}} > 50%</span>
          <el-input type="text" :value="getMaxComposition(group.rows)" disabled style="flex:1"/>
        </div>
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
  </div>
</template>

<script setup>
import '@/assets/css/style.css';
import {ref, reactive, computed, watch, onMounted, onBeforeUnmount, inject} from 'vue'
import {Check, Delete} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";
import {useI18n} from "vue-i18n";

const { t } = useI18n()
const emit = defineEmits(['confirm']);

const props = defineProps({
  sampleSummary: {
    type: Array,
    default: () => []
  }
})
const request = inject('request');

//remainSample是否全选
const remainSampleCheckAll = ref(false)
//remainSample是否半选
const remainSampleIndeterminate = ref(false)
//样品分组
const sampleGroups = ref([])
//未分组样品
const unGroupedSamples = computed(() => {
  let groupedSamples = sampleGroups.value.flatMap(g => g.samples)
  return props.sampleSummary.filter(s => !groupedSamples.includes(s))
})
//新分组
const newSampleGroup = ref([])

/* 判断类别 */
const synthList = ['Acetate', 'Polyester', 'Polyamide', 'Polyurethane', 'Polyethylene', 'Elastane', 'Spandex', 'Viscose', 'Acrylic', 'Modal', 'Tencel', 'Meraklon', 'Lycra', 'Lyocell', 'Modacrylic', 'Nylon', 'Rayon', 'Vinylon']
const naturalList = ['Cotton', 'Wool', 'Silk', 'Ramie', 'Mohair', 'Tussah', 'Linen', 'Asbestos']
const isSynth = str => synthList.includes(str)
const isNatural = str => naturalList.includes(str)

const allCompositions = ref([]);
const allCompositionDtos = ref([]); // 存储完整的 DTO 对象

//function------------------------------------------------------------------------------------------
//remainSample全选
const handleRemainSampleCheckAll = () => {
  remainSampleIndeterminate.value = false
  if (newSampleGroup.value.length === 0) {
    newSampleGroup.value = [...unGroupedSamples.value]
  } else {
    newSampleGroup.value = []
  }
}

//删除某一组
function deleteGroup(index) {
  sampleGroups.value.splice(index, 1)
}

//获取成分选项列表（适配新接口）
async function getCompositions() {
  try {
    const response = await request.get('/review/render-composition');
    const result = response.data;
    
    let compositionList = [];
    if (result?.isSuccess === true && Array.isArray(result.data)) {
      compositionList = result.data;
    } else if (Array.isArray(result?.data)) {
      compositionList = result.data;
    } else if (Array.isArray(result)) {
      compositionList = result;
    } else if (Array.isArray(result?.value)) {
      compositionList = result.value;
    }

    // 存储完整 DTO 对象
    allCompositionDtos.value = compositionList;
    allCompositions.value = compositionList;
  } catch (error) {
    console.error('Failed to load compositions:', error);
    allCompositions.value = [];
    allCompositionDtos.value = [];
  }
}

//检查重复样品
function checkAllDuplicateSamples() {
  let groups = sampleGroups.value;
  if (!groups || !Array.isArray(groups)) return;

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

  const groupsWithIssues = new Set();

  for (const [sample, groupSet] of sampleMap.entries()) {
    if (groupSet.size > 1) {
      groupSet.forEach(g => groupsWithIssues.add(g));
    }
  }

  groups.forEach(group => {
    const shouldHaveWarning = groupsWithIssues.has(group);
    const currentHasWarning = !!group.warnMessage;

    if (shouldHaveWarning && !currentHasWarning) {
      group.warnMessage = 'message.group.sampleDuplicated';
    } else if (!shouldHaveWarning && currentHasWarning) {
      group.warnMessage = '';
    }
  });
}

//修改单组样品
function oneGroupSamplesChange() {
  // checkAllDuplicateSamples()
}

/* 添加行 */
function addRow(group) {
  if (!group.inputRow.composition?.trim() || group.inputRow.rate <= 0) 
    return ElMessage.warning(t('message.enterComponentAndRate'))
  
  let countRate = getCountRate(group.rows)
  if (group.rows.some(c => c.compositionNameEn === group.inputRow.composition))
    return ElMessage.warning(t('componentExist'))
  
  if (countRate + group.inputRow.rate > 100) {
    ElMessage.warning(t('message.proportionExceed'));
  } else {
    // 查找完整的成分信息
    const fullComposition = allCompositionDtos.value.find(
      dto => dto.compositionNameEn === group.inputRow.composition
    );
    
    if (fullComposition) {
      group.rows.push({
        compositionNameEn: fullComposition.compositionNameEn,
        rate: group.inputRow.rate,
        idComposition: fullComposition.idComposition,
        primaryCategoryEn: fullComposition.primaryCategoryEn,
        secondaryClassificationEn: fullComposition.secondaryClassificationEn,
        tertiaryClassificationEn: fullComposition.tertiaryClassificationEn
      });
    } else {
      // 如果找不到完整信息，使用基本字段
      group.rows.push({
        compositionNameEn: group.inputRow.composition.trim(),
        rate: group.inputRow.rate,
        idComposition: 0,
        primaryCategoryEn: '',
        secondaryClassificationEn: '',
        tertiaryClassificationEn: ''
      });
    }
    
    group.inputRow.composition = ''
    group.inputRow.rate = 0
  }
}

/* 实时计算总比例 */
const getCountRate = (rows) => rows.reduce((s, r) => s + r.rate, 0)

//计算MaxComposition
function getMaxComposition(rows) {
  const synth = rows.filter(r => isSynth(r.compositionNameEn)).reduce((s, r) => s + r.rate, 0)
  const nat = rows.filter(r => isNatural(r.compositionNameEn)).reduce((s, r) => s + r.rate, 0)
  return synth > 50 ? 'Synth' : nat > 50 ? 'Natural' : ''
}

// 更新成分信息（当在表格中修改成分时）
function updateCompositionInfo(row) {
  const fullComposition = allCompositionDtos.value.find(
    dto => dto.compositionNameEn === row.compositionNameEn
  );
  
  if (fullComposition) {
    row.idComposition = fullComposition.idComposition;
    row.primaryCategoryEn = fullComposition.primaryCategoryEn;
    row.secondaryClassificationEn = fullComposition.secondaryClassificationEn;
    row.tertiaryClassificationEn = fullComposition.tertiaryClassificationEn;
  }
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
function removeRow(rows, idx) {
  rows.splice(idx, 1);
}

watch(sampleGroups, () => {
  let fiberComposition = [];
  for (const group of sampleGroups.value) {
    for (const sample of group.samples) {
      fiberComposition.push({
        sample: sample, 
        composition: group.rows.map(row => ({
          compositionNameEn: row.compositionNameEn,
          rate: row.rate,
          idComposition: row.idComposition,
          primaryCategoryEn: row.primaryCategoryEn,
          secondaryClassificationEn: row.secondaryClassificationEn,
          tertiaryClassificationEn: row.tertiaryClassificationEn
        }))
      })
    }
  }
  checkAllDuplicateSamples()
  emit('confirm', fiberComposition)
}, {deep: true})

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

function handleKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.target.blur();
  }
}

// 失焦时才进行校验和更新
function updateRateOnBlur(group, rate) {
  if (!rate)
    return ElMessage.warning(t('message.enterRate'))
  if (getCountRate(group.rows) > 100)
    return ElMessage.warning(t('rateExceed'))
}

onMounted(() => {
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
.oneGroupComposition{
  @include column-stretch-flex-container();
  border: var(--border-second-level);
  //border-radius: 4px;
  //padding: 20px;
  background-color: white;
}
.oneGroupComposition>div{
  padding: 10px 15px;
}
.mainContainer{
  @include column-flex-container();
  align-items: stretch;
  gap:20px;
}
/*去除多余间隔*/
:deep(.el-select__popper) ul li{
  margin:0 !important;
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
.oneGroupComposForm{
  @include column-stretch-flex-container();
}
</style>
