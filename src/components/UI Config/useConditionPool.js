// composables/useConditionPool.js
import { ref, reactive, computed, watch } from 'vue'
import { ConditionPoolParser } from '@/utils/ConditionPoolParser.js'

/**
 * 在Vue组件中使用ConditionPool
 * @param {Object} options
 * @param {import('vue').Ref<ConditionPoolField[]>} options.pool - 后端返回的ConditionPool
 * @param {import('vue').Ref<string[]>} options.samples - 样品列表
 * @param {import('vue').Ref<Object>} options.step1Data - 可选，用于监听变化重新初始化
 */
export function useConditionPool({ pool, samples }) {
  // 解析器实例
  const parser = new ConditionPoolParser()

  // 解析结果（computed，pool变化自动重新解析）
  const parsed = computed(() => parser.parse(pool.value || []))

  // 字段值存储（响应式对象，直接绑定到表单控件）
  const fieldValues = reactive({})

  // 初始化/重置值
  function init() {
    // 清空旧值
    Object.keys(fieldValues).forEach(k => delete fieldValues[k])

    // 用parser初始化
    parser.initValues(pool.value || [], samples.value || [])

    // 同步到响应式对象（global字段直接挂，perSample字段挂 _sample_ 前缀或对象）
    for (const [key, val] of parser._values.entries()) {
      fieldValues[key] = val
    }
  }

  // 当pool或samples变化时自动初始化
  watch([() => pool.value, () => samples.value], () => {
    if (pool.value?.length > 0) {
      init()
    }
  }, { immediate: true })

  // 获取某个组件的值对象（用于v-model传给子组件）
  function getComponentValues(componentKey) {
    const comp = parsed.value.components.find(c => c.key === componentKey)
    if (!comp) return {}

    const vals = {}
    for (const f of comp.fields) {
      vals[f.name] = fieldValues[f.name]
    }
    return vals
  }

  // 设置某个组件的值（子组件emit更新时调用）
  function setComponentValues(componentKey, values) {
    const comp = parsed.value.components.find(c => c.key === componentKey)
    if (!comp) return

    for (const f of comp.fields) {
      if (values[f.name] !== undefined) {
        fieldValues[f.name] = values[f.name]
        parser.set(f.name, values[f.name])
      }
    }
  }

  // 获取SampleDescription用的字段定义（已转换格式）
  const descripOptions = computed(() => parsed.value.descripPool)

  // 导出为conditionsGroups格式（兼容你现有逻辑）
  const conditionGroups = computed(() => {
    const groups = []
    const sampleList = samples.value || []

    // perSample组件字段：每个样品独立
    for (const s of sampleList) {
      const conditions = {}

      // 收集global字段（所有样品共享）
      for (const comp of parsed.value.components) {
        if (comp.category === 'global') {
          for (const f of comp.fields) {
            conditions[f.name] = fieldValues[f.name]
          }
        } else if (comp.category === 'perSample') {
          const val = fieldValues[f.name]
          conditions[f.name] = val?.[s] ?? val
        }
      }

      // 收集SampleDescription字段（由SampleSpecificDescrip内部维护，这里预留接口）
      // TODO: 如果需要把SampleDescription的值也聚合进来，需要额外传入

      groups.push({
        testPoints: [s],
        conditions
      })
    }

    return groups
  })

  return {
    parser,
    parsed,
    fieldValues,
    descripOptions,
    conditionGroups,
    init,
    getComponentValues,
    setComponentValues
  }
}
