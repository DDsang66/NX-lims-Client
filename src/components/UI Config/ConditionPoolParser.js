// utils/ConditionPoolParser.js
import { COMPONENT_REGISTRY, SAMPLE_DESCRIP_KEYWORDS, adaptToDescripOption } from '@/config/conditionDictionary.js'

export class ConditionPoolParser {
  constructor(registry = COMPONENT_REGISTRY) {
    this.registry = registry
    this._values = new Map()   // 存储字段值: key -> value
    this._samples = []         // 当前样品列表
  }

  /**
   * 动态注册组件（运行时扩展）
   * @param {ComponentMapping} config
   */
  register(config) {
    this.registry.push(config)
  }

  /**
   * 核心解析方法
   * @param {ConditionPoolField[]} pool
   * @returns {ParseResult}
   */
  parse(pool = []) {
    const used = new Set()
    const components = []

    // 1. 匹配专属组件
    for (const cfg of this.registry) {
      const matched = pool.filter(f => {
        if (used.has(f.name)) return false
        return cfg.match(f.name)
      })

      if (matched.length > 0) {
        components.push({
          key: cfg.key,
          component: cfg.component,
          fields: matched,
          exclusive: cfg.exclusive !== false,
          renderMode: cfg.renderMode || 'component',
          category: cfg.category || 'global'
        })
        matched.forEach(f => used.add(f.name))
      }
    }

    // 2. 剩余字段分类
    const remaining = pool.filter(f => !used.has(f.name))
    const sampleDescripFields = remaining.filter(f =>
      SAMPLE_DESCRIP_KEYWORDS.some(kw => f.name.toLowerCase().includes(kw.toLowerCase()))
    )
    sampleDescripFields.forEach(f => used.add(f.name))

    const generalFields = remaining.filter(f => !used.has(f.name))

    return {
      components,
      sampleDescripFields,
      generalFields,
      descripPool: [...sampleDescripFields, ...generalFields].map(adaptToDescripOption)
    }
  }

  /**
   * 初始化字段默认值
   * @param {ConditionPoolField[]} pool
   * @param {string[]} samples - 样品列表（用于perSample字段）
   */
  initValues(pool, samples = []) {
    this._samples = samples

    for (const field of pool) {
      const cfg = this.registry.find(r => r.match(field.name))
      const isPerSample = cfg?.category === 'perSample'

      if (isPerSample && samples.length > 0) {
        // perSample字段: { sampleName -> value }
        const map = {}
        for (const s of samples) {
          map[s] = field.defaultValue ?? this._getEmptyValue(field.type)
        }
        this._values.set(field.name, map)
      } else {
        // global字段: 直接存值
        this._values.set(field.name, field.defaultValue ?? this._getEmptyValue(field.type))
      }
    }
  }

  /**
   * 获取字段值
   * @param {string} fieldName
   * @param {string} [sample] - 如果是perSample字段，需要传sample
   */
  get(fieldName, sample) {
    const val = this._values.get(fieldName)
    if (sample && val && typeof val === 'object' && !Array.isArray(val)) {
      return val[sample]
    }
    return val
  }

  /**
   * 设置字段值
   * @param {string} fieldName
   * @param {any} value
   * @param {string} [sample]
   */
  set(fieldName, value, sample) {
    if (sample) {
      const map = this._values.get(fieldName) || {}
      map[sample] = value
      this._values.set(fieldName, map)
    } else {
      this._values.set(fieldName, value)
    }
  }

  /**
   * 获取全部值（平铺对象，用于提交到conditionsGroups）
   * @param {string} [sample] - 如果传了，返回该sample的完整条件对象
   */
  getAll(sample) {
    const result = {}
    for (const [key, val] of this._values.entries()) {
      if (sample && val && typeof val === 'object' && !Array.isArray(val)) {
        result[key] = val[sample]
      } else if (!sample) {
        result[key] = val
      }
    }
    return result
  }

  /**
   * 按样品聚合，输出 conditionsGroups 格式
   * @param {string[]} samples
   * @returns {Array<{testPoints:string[], conditions:Object}>}
   */
  toConditionGroups(samples) {
    return samples.map(s => ({
      testPoints: [s],
      conditions: this.getAll(s)
    }))
  }

  _getEmptyValue(type) {
    if (type === 'multiple') return []
    if (type === 'number') return 0
    return ''
  }
}
