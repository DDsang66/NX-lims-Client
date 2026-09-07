// config/conditionDictionary.js
import { markRaw } from 'vue'
import CareLabelSelect from '@/components/review/CareLabelSelect.vue'
import SampleSpecificComposition from '@/components/review/SampleSpecificComposition.vue'
import SeamRequire from '@/components/review/ItemRequire/SeamRequire.vue'
import AfterWashingSelect from '@/components/review/ItemRequire/AfterWashingSelect.vue'
import DetergentSelect from '@/components/review/ItemRequire/DetergentSelect.vue'

/**
 * 组件映射字典
 * 新增组件只需在这里注册，前端其他地方零改动
 */
export const COMPONENT_REGISTRY = [
  {
    key: 'CareLabel',
    component: markRaw(CareLabelSelect),
    match: (name) => [
      'washLabelRegionDefault', 'MachineType', 'Temperature',
      'WashingProcess', 'WashingProcedure', 'DryProcedure',
      'DryCleanProcedure', 'IronMethod', 'BleachProcedure'
    ].includes(name),
    exclusive: true,
    category: 'global'  // 全局一份值
  },
  {
    key: 'Composition',
    component: markRaw(SampleSpecificComposition),
    match: (name) => ['composition', 'fiberComposition', 'Composition'].includes(name),
    exclusive: true,
    category: 'perSample'  // 每个样品独立
  },
  {
    key: 'Seam',
    component: markRaw(SeamRequire),
    match: (name) => /seam/i.test(name),
    exclusive: true,
    category: 'perSample'
  },
  {
    key: 'AfterWashing',
    component: markRaw(AfterWashingSelect),
    match: (name) => /afterwash|after_washing/i.test(name),
    exclusive: true,
    category: 'global'
  },
  {
    key: 'Detergent',
    component: markRaw(DetergentSelect),
    match: (name) => /detergent/i.test(name),
    exclusive: true,
    category: 'global'
  },
  {
    key: 'AfterIron',
    component: null,  // 无复杂子组件，走原生控件
    match: (name) => /afteriron|after_iron/i.test(name),
    exclusive: true,
    renderMode: 'native',
    category: 'global'
  }
]

/**
 * 样描语义关键词（用于把字段优先归入SampleDescription）
 * 不在 COMPONENT_REGISTRY 中、但包含这些词的字段，会明确标记为样描
 */
export const SAMPLE_DESCRIP_KEYWORDS = [
  'color', 'size', 'style', 'article', 'season', 'gender',
  'description', 'sampletype', 'fabric', 'weight', 'width'
]

/**
 * 后端类型 → 前端控件类型的转换映射
 * TODO: 根据你们后端的实际枚举值调整
 */
export const TYPE_MAPPING = {
  'single': 'Single',
  'multiple': 'Multiple',
  'input': 'Input',
  'select': 'Single',      // 单选下拉
  'text': 'Input',
  'number': 'Input',       // 可用el-input-number，这里先统一为Input
  // TODO: 补全其他映射
}

/**
 * 将后端原始字段转换为 SampleSpecificDescrip 认识的格式
 * @param {ConditionPoolField} field
 * @returns {Object}
 */
export function adaptToDescripOption(field) {
  return {
    propertyName: field.name,
    type: TYPE_MAPPING[field.type] || 'Input',
    propertyValue: field.options || [],
    isNecessary: field.isRequired ? 'Y' : 'N',
    defaultValue: field.defaultValue ?? (field.type === 'multiple' ? [] : '')
  }
}
