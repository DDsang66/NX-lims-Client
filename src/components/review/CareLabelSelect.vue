<template>
  <div class="allContainer">
    <div class="allLabelContainer">
      <div class="labelRegion">
        <label>{{ $t('careLabelRegion') }}</label>
        <div class="forHeight" style="width: 120px">
          <el-select v-model="washLabelRegion" @change="washLabelRegionChange">
            <el-option v-for="option in washLabelRegionOptions" :key="option"
                       :value="option"></el-option>
          </el-select>
        </div>
      </div>
      <div class="labelSelectContainer">
        <div class="labelSelect" v-for="(item, index) in labelItems" :key="index">
          <label>{{ $t(item.labelKey) }}</label>
          <div>
            <el-popover
              placement="bottom-start"
              :width="item.popoverWidth"
              :visible="item.visible.value"
            >
              <template #reference>
                <div class="procedureSelect"
                     :ref="(el) => item.selectRef = el"
                     @click="item.visible.value=!item.visible.value;">
                  <div style="height: 100%; display: flex; align-items: center; gap: 2px;" 
                       v-for="(src,idx) in item.selectedValue.src" :key="src">
                    <span v-if="idx>0" style="font-size: 12px;">&</span>
                    <img class="labelImg" :src="src" />
                  </div>
                </div>
              </template>
              <div :ref="(el) => item.popoverRef = el" class="popoverSon">
                <!-- 移除 :append-to，让它默认渲染在 body -->
                <el-select v-model="item.standard.value"
                           class="procedureStandardSelect">
                  <el-option v-for="standard in item.standardOptions.value" :key="standard" :value="standard">
                  </el-option>
                </el-select>
                <div class="procedureGroupContainer">
                  <div class="procedureGroup">
                    <div class="head">{{ washLabelRegion + ' ' + item.standard.value }}</div>
                    <div class="optionsContainer">
                      <div class="procedureOption" 
                           v-for="label in item.labelOptions.value"
                           @click="item.selectLabel(label); item.visible.value=false" 
                           :key="label.value">
                        <div class="optionLabelsContainer">
                          <div style="height: 100%; display: flex; align-items: center; gap: 2px;" 
                               v-for="(src,idx) in label.src" :key="src">
                            <span v-if="idx>0" style="font-size: 12px;">&</span>
                            <img class="labelImg" :src="src" />
                          </div>
                        </div>
                        <div class="optionText">
                          {{ label.label }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-popover>
          </div>
        </div>
      </div>
    </div>
    <div class="specialCareInstructionContainer">
      <label>{{ $t('specialCareInstruction') }}</label>
      <el-select v-model="modelValue.specialCareInstruction" multiple style="flex: 1; min-width: 100px;" clearable>
        <el-option v-for="instruction in specialCareInstructionOptions" :key="instruction.value" 
                   :value="instruction.value" :label="instruction.label">
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script setup>
import {onMounted, onUnmounted, ref, watch, computed, reactive} from 'vue';

import noWashEuropeImg from '@/assets/img/wet Care Label/Europe/Washing/No Wash.jpg'
import N3Img from '@/assets/img/wet Care Label/Europe/Washing/3N.jpg'
import M3Img from '@/assets/img/wet Care Label/Europe/Washing/3M.jpg'
import G3Img from '@/assets/img/wet Care Label/Europe/Washing/3G.jpg'
import H3Img from '@/assets/img/wet Care Label/Europe/Washing/3H.jpg'
import N4Img from '@/assets/img/wet Care Label/Europe/Washing/4N.jpg'
import M4Img from '@/assets/img/wet Care Label/Europe/Washing/4M.jpg'
import G4Img from '@/assets/img/wet Care Label/Europe/Washing/4G.jpg'
import H4Img from '@/assets/img/wet Care Label/Europe/Washing/4H.jpg'
import N5Img from '@/assets/img/wet Care Label/Europe/Washing/5N.jpg'
import M5Img from '@/assets/img/wet Care Label/Europe/Washing/5M.jpg'
import N6Img from '@/assets/img/wet Care Label/Europe/Washing/6N.jpg'
import M6Img from '@/assets/img/wet Care Label/Europe/Washing/6M.jpg'
import N7Img from '@/assets/img/wet Care Label/Europe/Washing/7N.jpg'
import N9Img from '@/assets/img/wet Care Label/Europe/Washing/9N.jpg'

import noWashUSAImg from '@/assets/img/wet Care Label/USA/Washing/No Wash.jpg'
import MachineWashColdNormalImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Cold Normal.jpg'
import MachineWashColdGentleImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Cold Gentle.jpg'
import MachineWashColdPermanentPressImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Cold Permanent Press.jpg'

import MachineWashWarmNormalImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Warm Normal.jpg'
import MachineWashWarmNormal1Img from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Warm Normal_1.jpg'
import MachineWashWarmGentleImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Warm Gentle.jpg'
import MachineWashWarmGentle1Img from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Warm Gentle_1.jpg'
import MachineWashWarmPermanentPressImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Warm Permanent Press.jpg'
import MachineWashWarmPermanentPress1Img from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Warm Permanent Press_1.jpg'

import MachineWashHotNormal1Img from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Hot Normal_1.jpg'
import MachineWashHotNormalImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Hot Normal.jpg'
import MachineWashHotGentleImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Hot Gentle.jpg'
import MachineWashHotGentle1Img from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Hot Gentle_1.jpg'
import MachineWashHotPermanentPressImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Hot Permanent Press.jpg'
import MachineWashHotPermanentPress1Img from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Hot Permanent Press_1.jpg'

import MachineWashVeryHotNormalImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Very Hot Normal.jpg'
import MachineWashVeryHotGentleImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Very Hot Gentle.jpg'
import MachineWashVeryHotPermanentPressImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Very Hot Permanent Press.jpg'

import HandWashImg from '@/assets/img/wet Care Label/USA/Washing/Hand Wash.jpg'
import HandWashColdImg from '@/assets/img/wet Care Label/USA/Washing/Hand Wash Cold.jpg'

const props = defineProps({
  washLabelRegionDefault: {
    type: String,
    default: 'Europe'
  },
  modelValue: {
    type: Object,
    default: function (){
      return {
        selectedWashingProcedure:{
          value:'',
          label: '',
          src:[new URL('../../assets/img/wet Care Label/Europe/Washing/No Wash.jpg', import.meta.url).href]
        },
        selectedDryProcedure:{
          value:'',
          label: '',
          src:[new URL('../../assets/img/wet Care Label/Europe/Dry/Do not tumble dry.jpg', import.meta.url).href]
        },
        selectedDCProcedure:{
          value:'',
          label: '',
          src:[new URL('../../assets/img/wet Care Label/Europe/DC/Do not dry-clean.jpg', import.meta.url).href]
        },
        selectedIronMethod:{
          value:'',
          label: '',
          src:[new URL('../../assets/img/wet Care Label/Europe/Iron/Do not iron.jpg', import.meta.url).href]
        },
        selectedBleachProcedure:{
          value:'',
          label: '',
          src:[new URL('../../assets/img/wet Care Label/Europe/Bleach/Do not bleach.jpg', import.meta.url).href]
        },
        specialCareInstruction: []
      }
    }
  }
});

const emit = defineEmits(['updateData']);

// 特殊洗语选项
const specialCareInstructionOptions = [
  { value: 'Front Zippers Must be Opened', label: 'Front Zippers Must be Opened' },
  { value: 'Wash Inside Out', label: 'Wash Inside Out' },
  { value: 'Wash in Laundry Bag', label: 'Wash in Laundry Bag' },
  { value: 'Close All Botton and Zipper before Washing', label: 'Close All Botton and Zipper before Washing' },
  { value: 'Wash in Net Bag', label: 'Wash in Net Bag' },
  { value: 'Close fastener', label: 'Close fastener' }
];

// 弹出框是否展示
const washingProcedureVisible = ref(false);
const dryProcedureVisible = ref(false);
const DCProcedureVisible = ref(false);
const ironProcedureVisible = ref(false);
const bleachProcedureVisible = ref(false);

// DOM - 使用 ref 对象存储
const washingProcedureSelect = ref(null);
const dryProcedureSelect = ref(null);
const DCProcedureSelect = ref(null);
const ironProcedureSelect = ref(null);
const bleachProcedureSelect = ref(null);

const washingSelectPopover = ref(null);
const drySelectPopover = ref(null);
const DCSelectPopover = ref(null);
const ironSelectPopover = ref(null);
const bleachSelectPopover = ref(null);

// 标签选项列表
const washingLabelOptions = ref([])
const dryLabelOptions = ref([])
const DCLabelOptions = ref([])
const ironLabelOptions = ref([])
const bleachLabelOptions = ref([])

// 洗标标准选项列表
const washingLabelStandardOptions = ref([])
const dryLabelStandardOptions = ref([])
const DCLabelStandardOptions = ref([])
const ironLabelStandardOptions = ref([])
const bleachLabelStandardOptions = ref([])

// 洗标标准
const washingProcedureStandard = ref('')
const dryProcedureStandard = ref('')
const DCProcedureStandard = ref('')
const ironProcedureStandard = ref('')
const bleachProcedureStandard = ref('')

// 洗标数据
const washingProceduresEurope = ref([
  {value:'', label: 'No Wash', src:[noWashEuropeImg]},
  {value:'default', label: 'default', src:[new URL('../../assets/img/wet Care Label/default/washingDefault.png', import.meta.url).href]},
  { value: '3N', label: '3N', src:[N3Img]},
  { value: '3M', label: '3M', src:[M3Img]},
  { value: '3G', label: '3G', src:[G3Img]},
  { value: '3H', label: '3H', src:[H3Img]},
  { value: '4N', label: '4N', src:[N4Img]},
  { value: '4M', label: '4M', src:[M4Img]},
  { value: '4G', label: '4G', src:[G4Img]},
  { value: '4H', label: '4H', src:[H4Img]},
  { value: '5N', label: '5N', src:[N5Img]},
  { value: '5M', label: '5M', src:[M5Img]},
  { value: '6N', label: '6N', src:[N6Img]},
  { value: '6M', label: '6M', src:[M6Img]},
  { value: '7N', label: '7N', src:[N7Img]},
  { value: '9N', label: '9N', src:[N9Img]},
]);

const washingProceduresUSA = ref([
  {value:'', label: 'No Wash', src:[noWashUSAImg]},
  { value: 'Machine Wash Cold Normal', label: 'Machine Wash Cold Normal', src:[MachineWashColdNormalImg]},
  { value: 'Machine Wash Cold Gentle', label: 'Machine Wash Cold Gentle', src:[MachineWashColdGentleImg]},
  { value: 'Machine Wash Cold Permanent Press', label: 'Machine Wash Cold Permanent Press', src:[MachineWashColdPermanentPressImg]},
  { value: 'Machine Wash Warm Normal', label: 'Machine Wash Warm Normal', src: [MachineWashWarmNormalImg, MachineWashWarmNormal1Img] },
  { value: 'Machine Wash Warm Gentle', label: 'Machine Wash Warm Gentle', src: [MachineWashWarmGentleImg, MachineWashWarmGentle1Img] },
  { value: 'Machine Wash Warm Permanent Press', label: 'Machine Wash Warm Permanent Press', src: [MachineWashWarmPermanentPressImg, MachineWashWarmPermanentPress1Img] },
  { value: 'Machine Wash Hot Normal', label: 'Machine Wash Hot Normal', src: [MachineWashHotNormalImg, MachineWashHotNormal1Img] },
  { value: 'Machine Wash Hot Gentle', label: 'Machine Wash Hot Gentle', src: [MachineWashHotGentleImg, MachineWashHotGentle1Img] },
  { value: 'Machine Wash Hot Permanent Press', label: 'Machine Wash Hot Permanent Press', src: [MachineWashHotPermanentPressImg, MachineWashHotPermanentPress1Img] },
  { value: 'Machine Wash Very Hot Normal', label: 'Machine Wash Very Hot Normal', src: [MachineWashVeryHotNormalImg] },
  { value: 'Machine Wash Very Hot Gentle', label: 'Machine Wash Very Hot Gentle', src: [MachineWashVeryHotGentleImg] },
  { value: 'Machine Wash Very Hot Permanent Press', label: 'Machine Wash Very Hot Permanent Press', src: [MachineWashVeryHotPermanentPressImg] },
  { value: 'Hand Wash', label: 'Hand Wash', src: [HandWashImg] },
  { value: 'Hand Wash Cold', label: 'Hand Wash Cold', src: [HandWashColdImg] }
]);

const dryProceduresEurope = ref([
  { value: '', label: 'Do Not Tumble Dry', src: [new URL('../../assets/img/wet Care Label/Europe/Dry/Do not tumble dry.jpg', import.meta.url).href] },
  {value:'default', label: 'default', src:[new URL('../../assets/img/wet Care Label/default/dryDefault.png', import.meta.url).href]},
  { value: 'Tumble Dry', label: 'Tumble Dry', src: [new URL('../../assets/img/wet Care Label/Europe/Dry/Tumble dry.jpg', import.meta.url).href] },
  { value: 'Tumble Dry Low', label: 'Tumble Dry Low', src: [new URL('../../assets/img/wet Care Label/Europe/Dry/Tumble dry low.jpg', import.meta.url).href] },
  { value: 'Flat Dry', label: 'Flat Dry', src: [new URL('../../assets/img/wet Care Label/Europe/Dry/Flat dry.jpg', import.meta.url).href] },
  { value: 'Line Dry', label: 'Line Dry', src: [new URL('../../assets/img/wet Care Label/Europe/Dry/Line dry.jpg', import.meta.url).href] }
]);

const dryProceduresUSA = ref([
  { value: '', label: 'Do Not Tumble Dry', src: [new URL('../../assets/img/wet Care Label/USA/Dry/Do Not Tumble Dry.jpg', import.meta.url).href] },
  { value: 'Tumble Dry', label: 'Tumble Dry', src: [new URL('../../assets/img/wet Care Label/USA/Dry/Tumble Dry.jpg', import.meta.url).href, new URL('../../assets/img/wet Care Label/USA/Dry/Tumble Dry_1.jpg', import.meta.url).href] },
  { value: 'Tumble Dry Low', label: 'Tumble Dry Low', src: [new URL('../../assets/img/wet Care Label/USA/Dry/Tumble Dry Low.jpg', import.meta.url).href] },
  { value: 'Flat Dry', label: 'Flat Dry', src: [new URL('../../assets/img/wet Care Label/USA/Dry/Flat Dry.jpg', import.meta.url).href] },
  { value: 'Line Dry', label: 'Line Dry', src: [new URL('../../assets/img/wet Care Label/USA/Dry/Line Dry.jpg', import.meta.url).href] },
  { value: 'Drip Dry', label: 'Drip Dry', src: [new URL('../../assets/img/wet Care Label/USA/Dry/Drip Dry.jpg', import.meta.url).href] },
  { value: 'Drip Flat Dry', label: 'Drip Flat Dry', src: [new URL('../../assets/img/wet Care Label/USA/Dry/Drip Flat Dry.png', import.meta.url).href] }
]);

const DCProceduresEurope = ref([
  { value: '', label: 'Do Not Dry Clean', src: [new URL('../../assets/img/wet Care Label/Europe/DC/Do not dry-clean.jpg', import.meta.url).href] },
  {value: 'default', label:'default', src:[new URL('../../assets/img/wet Care Label/default/DCDefault.png', import.meta.url).href]},
  { value: 'DC Normal', label: 'DC Normal', src: [new URL('../../assets/img/wet Care Label/Europe/DC/DC Normal.jpg', import.meta.url).href] },
  { value: 'DC Sensitive', label: 'DC Sensitive', src: [new URL('../../assets/img/wet Care Label/Europe/DC/DC Sensitive.jpg', import.meta.url).href]},
  { value: 'Petroleum DC Normal', label: 'Petroleum DC Normal', src: [new URL('../../assets/img/wet Care Label/Europe/DC/Petroleum DC Normal.jpg', import.meta.url).href]},
  { value: 'Petroleum DC Sensitive', label: 'Petroleum DC Sensitive', src: [new URL('../../assets/img/wet Care Label/Europe/DC/Petroleum DC Sensitive.jpg', import.meta.url).href]}
]);

const ironProceduresEurope = ref([
  {value:'', label:'Do not Iron', src: [new URL('../../assets/img/wet Care Label/Europe/Iron/Do not iron.jpg', import.meta.url).href]},
  {value: 'default', label:'default', src:[new URL('../../assets/img/wet Care Label/default/ironDefault.png', import.meta.url).href]},
  {value:'Hot Iron', label: 'Hot Iron', src: [new URL('../../assets/img/wet Care Label/Europe/Iron/Hot iron.jpg', import.meta.url).href]},
  {value:'Warm Iron', label: 'Warm Iron', src: [new URL('../../assets/img/wet Care Label/Europe/Iron/Warm iron.jpg', import.meta.url).href]},
  {value:'Cool Iron', label: 'Cool Iron', src: [new URL('../../assets/img/wet Care Label/Europe/Iron/Cool iron.jpg', import.meta.url).href]}
]);

const bleachProceduresEurope = ref([
  {value:'', label:'Do not Bleach', src: [new URL('../../assets/img/wet Care Label/Europe/Bleach/Do not bleach.jpg', import.meta.url).href]},
  {value:'Any Bleaching', label:'Any Bleaching', src: [new URL('../../assets/img/wet Care Label/Europe/Bleach/Any Bleaching.jpg', import.meta.url).href]},
  {value:'Non-chlorine Bleaching', label:'Non-chlorine Bleaching', src: [new URL('../../assets/img/wet Care Label/Europe/Bleach/Non-chlorine Bleaching.jpg', import.meta.url).href]}
]);

// 洗标地区
const washLabelRegion = ref(props.washLabelRegionDefault)
const washLabelRegionOptions = ['Europe', 'USA'];

// 汇总数据
const washingProcedureses = ref([{region:'Europe', standard:'ISO 3758:2023(E)', value:washingProceduresEurope.value},
  {region:'USA', standard:'ASTM_D5489-2018(R2023)', value:washingProceduresUSA.value}
]);
const washingProcedureStandardses = ref([
  {region:'Europe', value:['ISO 3758:2023(E)']},
  {region:'USA', value:['ASTM_D5489-2018(R2023)']}
]);

const dryProcedureses = ref([{region:'Europe', standard:'ISO 3758:2023(E)', value:dryProceduresEurope.value},
  {region:'USA', standard: 'ASTM_D5489-2018(R2023)', value: dryProceduresUSA.value}]);
const dryProcedureStandardses = ref([
  {region:'Europe', value:['ISO 3758:2023(E)']},
  {region:'USA', value:['ASTM_D5489-2018(R2023)']}
]);

const DCProcedureses = ref([{region:'Europe', standard:'ISO 3758:2023(E)', value:DCProceduresEurope.value},
  {region:'USA', standard:'ASTM_D5489-2018(R2023)', value:DCProceduresEurope.value}]);
const DCProcedureStandardses = ref([{region:'Europe', value:['ISO 3758:2023(E)']},{region:'USA', value:['ASTM_D5489-2018(R2023)']}]);

const ironProcedureses = ref([{region:'Europe', standard:'ISO 3758:2023(E)', value:ironProceduresEurope.value},
  {region:'USA', standard:'ASTM_D5489-2018(R2023)', value:ironProceduresEurope.value}]);
const ironProcedureStandardses = ref([{region:'Europe', value:['ISO 3758:2023(E)']},{region:'USA', value:['ASTM_D5489-2018(R2023)']}]);

const bleachProcedureses = ref([{region:'Europe', standard:'ISO 3758:2023(E)', value:bleachProceduresEurope.value},
  {region:'USA', standard:'ASTM_D5489-2018(R2023)', value:bleachProceduresEurope.value}]);
const bleachProcedureStandardses = ref([{region:'Europe', value:['ISO 3758:2023(E)']},{region:'USA', value:['ASTM_D5489-2018(R2023)']}]);

// 创建 label items 的映射关系
const labelItemsMap = {
  washing: {
    labelKey: 'washing Procedure',
    popoverWidth: 950,
    visible: washingProcedureVisible,
    selectRef: washingProcedureSelect,
    popoverRef: washingSelectPopover,
    standard: washingProcedureStandard,
    standardOptions: washingLabelStandardOptions,
    labelOptions: washingLabelOptions,
    selectedKey: 'selectedWashingProcedure',
    procedureses: washingProcedureses,
    standardOptionses: washingProcedureStandardses,
  },
  dry: {
    labelKey: 'dryProcedure',
    popoverWidth: 650,
    visible: dryProcedureVisible,
    selectRef: dryProcedureSelect,
    popoverRef: drySelectPopover,
    standard: dryProcedureStandard,
    standardOptions: dryLabelStandardOptions,
    labelOptions: dryLabelOptions,
    selectedKey: 'selectedDryProcedure',
    procedureses: dryProcedureses,
    standardOptionses: dryProcedureStandardses,
  },
  DC: {
    labelKey: 'DCProcedure',
    popoverWidth: 650,
    visible: DCProcedureVisible,
    selectRef: DCProcedureSelect,
    popoverRef: DCSelectPopover,
    standard: DCProcedureStandard,
    standardOptions: DCLabelStandardOptions,
    labelOptions: DCLabelOptions,
    selectedKey: 'selectedDCProcedure',
    procedureses: DCProcedureses,
    standardOptionses: DCProcedureStandardses,
  },
  iron: {
    labelKey: 'ironMethod',
    popoverWidth: 450,
    visible: ironProcedureVisible,
    selectRef: ironProcedureSelect,
    popoverRef: ironSelectPopover,
    standard: ironProcedureStandard,
    standardOptions: ironLabelStandardOptions,
    labelOptions: ironLabelOptions,
    selectedKey: 'selectedIronMethod',
    procedureses: ironProcedureses,
    standardOptionses: ironProcedureStandardses,
  },
  bleach: {
    labelKey: 'bleaching',
    popoverWidth: 450,
    visible: bleachProcedureVisible,
    selectRef: bleachProcedureSelect,
    popoverRef: bleachSelectPopover,
    standard: bleachProcedureStandard,
    standardOptions: bleachLabelStandardOptions,
    labelOptions: bleachLabelOptions,
    selectedKey: 'selectedBleachProcedure',
    procedureses: bleachProcedureses,
    standardOptionses: bleachProcedureStandardses,
  }
};

// 使用 computed 生成 labelItems 数组，并添加 selectLabel 方法
const labelItems = computed(() => {
  return Object.values(labelItemsMap).map(item => ({
    ...item,
    get selectedValue() {
      return props.modelValue[item.selectedKey];
    },
    selectLabel: (label) => {
      props.modelValue[item.selectedKey] = label;
    }
  }));
});

// 切换洗标地区
function washLabelRegionChange() {
  const items = Object.values(labelItemsMap);
  items.forEach((item) => {
    // 刷新 standard 选项列表
    const standardOpts = item.standardOptionses.value.find(s => s.region === washLabelRegion.value);
    item.standardOptions.value = standardOpts?.value || item.standardOptionses.value[0]?.value || [];
    // standard 默认选第一个
    item.standard.value = item.standardOptions.value[0] || '';
    // 刷新图标列表
    const labelOpts = item.procedureses.value.find(p => p.region === washLabelRegion.value && p.standard === item.standard.value);
    item.labelOptions.value = labelOpts?.value || item.procedureses.value[0]?.value || [];
    // 所有已选值切换成图标列表第一个
    if (item.labelOptions.value.length > 0) {
      props.modelValue[item.selectedKey] = item.labelOptions.value[0];
    }
  });
}

// 关闭选择器的下拉框
function closeSelectPopover(e) {
  const items = Object.values(labelItemsMap);
  items.forEach((item) => {
    const popoverEl = item.popoverRef.value;
    const selectEl = item.selectRef.value;
    // 检查 popoverEl 是否是有效的 DOM 元素
    if (popoverEl && selectEl && popoverEl.contains && selectEl.contains) {
      if (!popoverEl.contains(e.target) && !selectEl.contains(e.target)) {
        item.visible.value = false;
      }
    }
  });
}

// 监听 modelValue 变化，触发更新
watch(() => props.modelValue, (newVal) => {
  emit('updateData', newVal);
}, { deep: true });

onMounted(() => {
  washLabelRegionChange();
  document.addEventListener('mousedown', closeSelectPopover);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', closeSelectPopover);
});

</script>

<style lang="scss" scoped>
.allContainer {
  @include column-stretch-flex-container;
  gap: 15px;
}

.allLabelContainer {
  @include line-left-flex-container;
  --procedure-select-height: 54px;
  flex-wrap: wrap;
  gap: 8px;
}

.labelRegion {
  @include column-flex-container;
  display: inline-flex;
  width: 180px;
  border-right: 1px solid var(--el-border-color);
  flex-shrink: 0;
}

.forHeight {
  height: var(--procedure-select-height);
  @include line-flex-container;
}

.labelSelectContainer {
  @include line-flex-container;
  flex: 1;
  gap: 8px 12px;
  flex-wrap: wrap;
  min-width: 0;
}

.labelSelect {
  @include column-flex-container;
  flex: 0 1 auto;
  min-width: 100px;
  max-width: 180px;
  
  label {
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
}

.procedureSelect {
  height: var(--procedure-select-height);
  border-radius: var(--el-border-radius-base);
  box-shadow: 0 0 0 1px var(--el-border-color);
  box-sizing: border-box;
  @include line-flex-container;
  background-color: white;
  padding: 0 6px;
  min-width: 60px;
  width: 100%;
  max-width: 130px;
  overflow: hidden;
  
  &:hover {
    cursor: pointer;
  }
}

.labelImg {
  width: 40px;
  height: 40px;
  object-fit: contain;
  flex-shrink: 0;
}

.procedureGroupContainer {
  display: flex;
  align-items: flex-start;
}

.procedureGroup {
  @include column-flex-container;
  flex: 1;
}

  /* ========== 选项对齐样式 ========== */
  .optionsContainer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    width: 100%;
    padding: 4px 0;
  }

  .procedureOption {
    height: 56px;
    min-height: 56px;
    display: flex;
    align-items: stretch;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid transparent;
    transition: border-color 0.2s;

    &:hover {
      background-color: #e9eef6;
      border-color: var(--el-color-primary-light-5);
      cursor: pointer;
    }
  }

  .optionLabelsContainer {
    flex-shrink: 0;
    border: 1px solid #d3d1d1;
    border-radius: 4px 0 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 6px;
    background: #fff;
  }

  .optionText {
    flex: 1;
    min-width: 80px; /* 增加最小宽度 */
    height: 100%;
    border: 1px solid #d3d1d1;
    border-left: none;
    border-radius: 0 4px 4px 0;
    display: flex;
    align-items: center;
    padding: 4px 10px;
    font-size: 13px;
    background: #fff;
    white-space: nowrap; /* 强制不换行 */
    overflow: hidden; /* 隐藏溢出 */
    text-overflow: ellipsis; /* 溢出显示省略号 */
    line-height: 1.3;
  }

  /* 各类型选项的图标区宽度 */
  .washingProcedureOption .optionLabelsContainer {
    width: 130px;
    min-width: 130px;
  }

  .dryProcedureOption .optionLabelsContainer {
    width: 110px;
    min-width: 110px;
  }

  .DCProcedureOption .optionLabelsContainer {
    width: 110px;
    min-width: 110px;
  }

  .ironProcedureOption .optionLabelsContainer {
    width: 100px;
    min-width: 100px;
  }

  /* Bleaching 选项 - 加大文字区域宽度 */
  .bleachProcedureOption .optionLabelsContainer {
    width: 80px; /* 稍微缩小图标区 */
    min-width: 80px;
  }

  .bleachProcedureOption .optionText {
    min-width: 100px; /* 加大文字区最小宽度 */
    font-size: 12px; /* 稍微缩小字体 */
  }

  /* 如果想让文字完全显示不换行，可以调整整体选项宽度 */
  .procedureOption {
    min-width: 200px; /* 增加选项最小宽度 */
  }

  /* 响应式：小屏幕时单列 */
  @media (max-width: 768px) {
    .optionsContainer {
      grid-template-columns: 1fr;
    }

    .procedureOption {
      height: 48px;
      min-height: 48px;
      min-width: unset;
    }

    .optionLabelsContainer {
      width: 80px !important;
      min-width: 80px !important;
    }

    .optionText {
      min-width: 60px;
      font-size: 12px;
      white-space: nowrap;
    }

    .labelImg {
      width: 32px;
      height: 32px;
    }
  }

  /* 极端小屏 */
  @media (max-width: 480px) {
    .optionsContainer {
      grid-template-columns: 1fr;
      gap: 4px;
    }

    .procedureOption {
      height: 44px;
      min-height: 44px;
    }

    .optionLabelsContainer {
      width: 60px !important;
      min-width: 60px !important;
    }

    .optionText {
      font-size: 11px;
      min-width: 50px;
      padding: 4px 6px;
    }

    .labelImg {
      width: 28px;
      height: 28px;
    }
  }

  /* 弹窗整体宽度自适应 */
  :deep(.el-popover) {
    max-width: 90vw !important;
    overflow: auto;
  }

  /* popover 内部容器 */
  .popoverSon {
    max-width: 100%;
    overflow: auto;
  }

  .procedureGroupContainer {
    display: flex;
    align-items: flex-start;
    max-width: 100%;
    overflow: auto;
  }

  .procedureGroup {
    @include column-flex-container;
    flex: 1;
    min-width: 0; /* 防止溢出 */
    max-width: 100%;
  }

</style>
