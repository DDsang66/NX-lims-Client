import { computed, ref } from 'vue'

/**
 * 下拉框的「按首字母」检索：**严格前缀**、大小写不敏感。
 *
 * 为什么不用 Element Plus 的默认过滤：它的匹配规则写死在
 * es/components/select/src/useOption.mjs 里 ——
 *   states.visible = new RegExp(escapeStringRegexp(query), 'i').test(label)
 * 正则**不带锚点**，所以是"含有"检索：敲 l 会把 Modal 也带出来，首字母起不到定位作用。
 * 这条规则没有任何 prop 可改，唯一的钩子是 el-select 的 filter-method。
 *
 * 而一旦给了 filter-method，EP 自己的过滤就**完全不跑了**
 * （useSelect.mjs 的 updateOptions() 见 filterMethod 直接 return，不再调用 option.updateOption），
 * 所以筛掉选项这件事必须我们自己干 —— 也就是在模板里过滤 el-option 的 v-for 列表。
 *
 * @param {import('vue').Ref|import('vue').ComputedRef} source 候选项集合（响应式）
 * @param {(item: any) => string} labelOf 取显示名；候选项是字符串时用默认值即可
 * @returns {{filtered: import('vue').ComputedRef, onQuery: (q: string) => void, onVisibleChange: (v: boolean) => void}}
 *   三个返回值都要在 <script setup> 里**解构出来**再交给模板 ——
 *   嵌在普通对象里的 ref 在模板中不会自动解包，v-for 会拿到 Ref 对象本身。
 */
export function createStartsWithFilter(source, labelOf = (item) => item) {
  const query = ref('')

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return source.value
    // 纯字符串 startsWith，不走正则：用户敲 ( 之类不必担心元字符
    return source.value.filter((item) => String(labelOf(item) ?? '').toLowerCase().startsWith(q))
  })

  return {
    filtered,
    // 绑 :filter-method —— EP 每敲一个字回调一次，包括清空时的空串
    onQuery: (q) => {
      query.value = q ?? ''
    },
    // 绑 @visible-change —— 收起时必须清掉，否则下次打开还停在上次的过滤结果上
    onVisibleChange: (visible) => {
      if (!visible) query.value = ''
    }
  }
}
