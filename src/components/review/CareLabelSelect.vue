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
            <el-popover placement="bottom-start"
                        :width="item.popoverWidth"
                        :visible="item.visible.value">
              <template #reference>
                <div class="procedureSelect"
                     :ref="(el) => { if(el) item.selectRef.value = el }"
                     @click="item.visible.value=!item.visible.value;">
                  <div style="height: 100%; display: flex; align-items: center; gap: 2px;"
                       v-for="(src,idx) in getSelectedValue(item.key).src" :key="src + idx">
                    <span v-if="idx>0" style="font-size: 12px;">&</span>
                    <img class="labelImg" :src="src" />
                  </div>
                </div>
              </template>
              <div :ref="(el) => { if(el) item.popoverRef.value = el }" class="popoverSon">
                <el-select v-model="item.standard.value"
                           class="procedureStandardSelect">
                  <el-option v-for="standard in item.standardOptions.value"
                             :key="standard"
                             :value="standard">
                  </el-option>
                </el-select>
                <div class="procedureGroupContainer">
                  <div class="procedureGroup">
                    <div class="head">{{ washLabelRegion + ' ' + item.standard.value }}</div>
                    <div class="optionsContainer">
                      <div class="procedureOption"
                           v-for="label in item.labelOptions.value"
                           @click="selectLabel(label, washLabelRegion, item.key)"
                           :key="label.value">
                        <div class="optionLabelsContainer">
                          <div style="height: 100%; display: flex; align-items: center; gap: 2px;"
                               v-for="(src,idx) in label.src" :key="src + idx">
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
import {onMounted, onUnmounted, ref, watch, computed} from 'vue';

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
  modelValue: {
    type: Object,
    default: () => ({
      washLabelRegionDefault: "Europe",
      MachineType: 'Type A',
      Temperature: '',
      WashingProcess: '',
      WashingProcedure: '',
      DryProcedure: {
        value: '',
        label: '',
        src: [new URL('../../assets/img/wet Care Label/Europe/Dry/Do not tumble dry.jpg', import.meta.url).href]
      },
      DryCleanProcedure: {
        value: '',
        label: '',
        src: [new URL('../../assets/img/wet Care Label/Europe/DC/Do not dry-clean.jpg', import.meta.url).href]
      },
      IronMethod: {
        value: '',
        label: '',
        src: [new URL('../../assets/img/wet Care Label/Europe/Iron/Do not iron.jpg', import.meta.url).href]
      },
      BleachProcedure: {
        value: '',
        label: '',
        src: [new URL('../../assets/img/wet Care Label/Europe/Bleach/Do not bleach.jpg', import.meta.url).href]
      },
      specialCareInstruction: []
    })
  }
});

const emit = defineEmits(['updateData', 'update:modelValue']);

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

// DOM - 使用 ref 对象存储（修复：改为 ref(null) 而不是直接赋值）
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

const washingProceduresJapan = ref([
  { value: '', label: 'No Wash', src: [noWashEuropeImg] },
  { value: 'default', label: 'default', src: [new URL('../../assets/img/wet Care Label/default/washingDefault.png', import.meta.url).href] },
  { value: '3N', label: '3N', src: [N3Img] },
  { value: '3M', label: '3M', src: [M3Img] },
  { value: '3G', label: '3G', src: [G3Img] },
  { value: '3H', label: '3H', src: [H3Img] },
  { value: '4N', label: '4N', src: [N4Img] },
  { value: '4M', label: '4M', src: [M4Img] },
  { value: '4G', label: '4G', src: [G4Img] },
  { value: '4H', label: '4H', src: [H4Img] },
  { value: '5N', label: '5N', src: [N5Img] },
  { value: '5M', label: '5M', src: [M5Img] },
  { value: '6N', label: '6N', src: [N6Img] },
  { value: '6M', label: '6M', src: [M6Img] },
  { value: '7N', label: '7N', src: [N7Img] },
  { value: '9N', label: '9N', src: [N9Img] },
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
const washLabelRegion = ref(props.modelValue.washLabelRegionDefault || 'Europe')
const washLabelRegionOptions = ['Europe', 'USA','Japan'];

// 汇总数据 - 所有地区统一用欧标格式返回（修复：Japan 也使用 Europe 的数据）
const washingProcedureses = ref([
  {region:'Europe', standard:'ISO 3758:2023(E)', value:washingProceduresEurope.value},
  {region:'USA', standard:'ASTM_D5489-2018(R2023)', value:washingProceduresUSA.value},
  { region: 'Japan', standard:'JIS L 0217:2015', value:washingProceduresEurope.value}  // 修复：Japan 也指向 Europe 数据
]);
const washingProcedureStandardses = ref([
  {region:'Europe', value:['ISO 3758:2023(E)']},
  { region: 'USA', value: ['ASTM_D5489-2018(R2023)'] },
  { region: 'Japan', value: ['JIS L 0217:2015'] }  // 修复：统一用欧标
]);

const dryProcedureses = ref([
  {region:'Europe', standard:'ISO 3758:2023(E)', value:dryProceduresEurope.value},
  {region:'USA', standard: 'ASTM_D5489-2018(R2023)', value: dryProceduresUSA.value},
  { region: 'Japan', standard:'JIS L 0217:2015', value:dryProceduresEurope.value}  // 修复
]);
const dryProcedureStandardses = ref([
  {region:'Europe', value:['ISO 3758:2023(E)']},
  { region: 'USA', value: ['ASTM_D5489-2018(R2023)'] },
  { region: 'Japan', value: ['JIS L 0217:2015'] }  // 修复
]);

const DCProcedureses = ref([
  {region:'Europe', standard:'ISO 3758:2023(E)', value:DCProceduresEurope.value},
  {region:'USA', standard:'ASTM_D5489-2018(R2023)', value:DCProceduresEurope.value},  // USA 也先用欧标
  { region: 'Japan', standard:'JIS L 0217:2015', value:DCProceduresEurope.value}  // 修复
]);
const DCProcedureStandardses = ref([
  { region: 'Europe', value: ['ISO 3758:2023(E)'] }, 
  { region: 'USA', value: ['ISO 3758:2023(E)'] },  // 修复：统一欧标
  { region: 'Japan', value: ['JIS L 0217:2015'] }  // 修复
]);

const ironProcedureses = ref([
  {region:'Europe', standard:'ISO 3758:2023(E)', value:ironProceduresEurope.value},
  {region:'USA', standard:'ASTM_D5489-2018(R2023)', value:ironProceduresEurope.value},  // 统一欧标
  { region: 'Japan', standard:'JIS L 0217:2015', value:ironProceduresEurope.value}  // 修复
]);
const ironProcedureStandardses = ref([
  { region: 'Europe', value: ['ISO 3758:2023(E)'] }, 
  { region: 'USA', value: ['ISO 3758:2023(E)'] },  // 修复
  { region: 'Japan', value: ['JIS L 0217:2015'] }  // 修复
]);

const bleachProcedureses = ref([
  {region:'Europe', standard:'ISO 3758:2023(E)', value:bleachProceduresEurope.value},
  {region:'USA', standard:'ASTM_D5489-2018(R2023)', value:bleachProceduresEurope.value},  // 统一欧标
  { region: 'Japan', standard:'JIS L 0217:2015', value:bleachProceduresEurope.value}  // 修复
]);
const bleachProcedureStandardses = ref([
  { region: 'Europe', value: ['ISO 3758:2023(E)'] }, 
  { region: 'USA', value: ['ISO 3758:2023(E)'] },  // 修复
  { region: 'Japan', value: ['JIS L 0217:2015'] }  // 修复
]);

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
    selectedKey: 'WashingProcedure',
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
    selectedKey: 'DryProcedure',
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
    selectedKey: 'DryCleanProcedure',
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
    selectedKey: 'IronMethod',
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
    selectedKey: 'BleachProcedure',
    procedureses: bleachProcedureses,
    standardOptionses: bleachProcedureStandardses,
  }
};

// 修复：getSelectedValue 直接读取 props.modelValue，确保响应式
function getSelectedValue(key) {
  const itemConfig = labelItemsMap[key];
  if (!itemConfig) return { value: '', label: '', src: [] };

  const value = props.modelValue[itemConfig.selectedKey];
  return value ? {
    value: value.value || '',
    label: value.label || '',
    src: Array.isArray(value.src) ? value.src : []
  } : { value: '', label: '', src: [] };
}

// labelItems - 使用 computed 确保响应式更新（修复：不再缓存 selectedValue，改用函数获取）
const labelItems = computed(() => {
  return Object.entries(labelItemsMap).map(([key, item]) => {
    return {
      ...item,
      key: key,
      // 修复：不再在这里计算 selectedValue，模板中直接调用 getSelectedValue
    };
  });
});

function convertToEuropeFormat(washingProcedure, region) {
  if (!washingProcedure) return { Temperature: '', WashingProcess: '' };

  if (region === 'Europe' || region === 'Japan') {  // 修复：Japan 也用欧标格式
    const tempMap = { '3': 30, '4': 40, '5': 50, '6': 60, '7': 70, '9': 95 };
    const processMap = { 'N': 'Normal', 'M': 'Mild', 'G': 'Gentle', 'H': 'Hand' };

    const temp = tempMap[washingProcedure[0]] || '';
    const process = processMap[washingProcedure[1]] || '';

    return { Temperature: temp, WashingProcess: process };
  } else {
    const tempMap = { 'Cold': 30, 'Warm': 40, 'Hot': 50, 'Very Hot': 60 };
    const processMap = { 'Normal': 'Normal', 'Permanent Press': 'Mild', 'Gentle': 'Gentle', 'Hand Wash': 'Hand' };

    let temperature = '';
    let process = '';

    for (const [key, value] of Object.entries(tempMap)) {
      if (washingProcedure.includes(key)) {
        temperature = value;
        break;
      }
    }

    for (const [key, value] of Object.entries(processMap)) {
      if (washingProcedure.includes(key)) {
        process = value;
        break;
      }
    }

    return { Temperature: temperature, WashingProcess: process };
  }
}

function convertFromEuropeFormat(Temperature, WashingProcess, region) {
  if (!Temperature || !WashingProcess) return '';

  const tempMap = { 30: '3', 40: '4', 50: '5', 60: '6', 70: '7', 95: '9' };
  const processMap = { 'Normal': 'N', 'Mild': 'M', 'Gentle': 'G', 'Hand': 'H' };

  if (region === 'Europe' || region === 'Japan') {  // 修复：Japan 也用欧标格式
    const tempCode = tempMap[Temperature] || '';
    const processCode = processMap[WashingProcess] || '';
    return tempCode + processCode;
  } else {
    const tempText = Object.entries(tempMap).find(([key, value]) => value === tempMap[Temperature])?.[0] || '';
    const processText = Object.entries(processMap).find(([key, value]) => value === processMap[WashingProcess])?.[0] || '';
    return processText + ' ' + tempText;
  }
}

const selectLabel = (label, region, itemKey) => {
  if (!label) return;

  const itemConfig = labelItemsMap[itemKey];
  if (!itemConfig) return;

  const updateData = {
    ...props.modelValue,
    [itemConfig.selectedKey]: {
      value: label.value,
      label: label.label,
      src: label.src
    }
  };

  if (itemConfig.selectedKey === 'WashingProcedure') {
    const { Temperature, WashingProcess } = convertToEuropeFormat(label.value, region);
    updateData.Temperature = Temperature;
    updateData.WashingProcess = WashingProcess;
/*    updateData.WashingProcedure = label.value;*/
  }

  emit('update:modelValue', updateData);
  itemConfig.visible.value = false;
};

function mapRegionToMachineType(region) {
  const regionMap = {
    'Europe': 'Type A',
    'USA': 'Type B',
    'Japan': 'Type C'
  };
  return regionMap[region] || 'Type A';
}

// 切换洗标地区
function washLabelRegionChange() {
  const updateData = {
    ...props.modelValue,
    MachineType: mapRegionToMachineType(washLabelRegion.value)
  };

  const items = Object.values(labelItemsMap);
  items.forEach((item) => {
    const standardOpts = item.standardOptionses.value.find(s => s.region === washLabelRegion.value);
    item.standardOptions.value = standardOpts?.value || item.standardOptionses.value[0]?.value || [];
    item.standard.value = item.standardOptions.value[0] || '';

    const labelOpts = item.procedureses.value.find(p => p.region === washLabelRegion.value && p.standard === item.standard.value);
    item.labelOptions.value = labelOpts?.value || item.procedureses.value[0]?.value || [];

    if (item.labelOptions.value.length > 0) {
      const selectedLabel = item.labelOptions.value[0];
      updateData[item.selectedKey] = {
        value: selectedLabel.value,
        label: selectedLabel.label,
        src: selectedLabel.src
      };
    }
  });

  emit('update:modelValue', updateData);
}

// 关闭选择器的下拉框
function closeSelectPopover(e) {
  const items = Object.values(labelItemsMap);
  items.forEach((item) => {
    const popoverEl = item.popoverRef.value;
    const selectEl = item.selectRef.value;
    if (popoverEl && selectEl && popoverEl.contains && selectEl.contains) {
      if (!popoverEl.contains(e.target) && !selectEl.contains(e.target)) {
        item.visible.value = false;
      }
    }
  });
}


onMounted(() => {
  props.modelValue.MachineType = mapRegionToMachineType(washLabelRegion.value);
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
