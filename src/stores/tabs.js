import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 标签页状态管理 - 浏览器风格多标签页导航
 *
 * 核心设计：
 * - openedTabs：所有已打开的标签页
 * - activeTabPath：当前激活的标签页路径（fullPath）
 * - cachedViews：keep-alive 的 include 数组，关闭标签页时移除对应组件名即清除缓存
 *
 * Home 页面始终存在且不可关闭（affix: true）
 */

export const useTabsStore = defineStore('tabs', () => {
  // ==================== State ====================
  const openedTabs = ref([])
  const activeTabPath = ref('')

  // ==================== Computed ====================

  /** keep-alive :include 绑定的组件名列表 */
  const cachedViews = computed(() =>
    openedTabs.value.map(t => t.componentName).filter(Boolean)
  )

  // ==================== Helpers ====================

  /**
   * 从路由对象解析组件名（用于 keep-alive 匹配）
   *
   * Vue Router 中，route.matched[0] 是父路由（MainLayout），最后一个才是目标页面。
   * route.name 对于子路由是子路由的 name，通常与 SFC 文件名一致。
   *
   * resolveComponentName 返回的名称必须与 <script setup> SFC 的文件名或
   * defineOptions({name}) 完全一致，否则 keep-alive 无法匹配。
   */
  function resolveComponentName(route) {
    // 1. 显式指定（最高优先级）
    if (route.meta?.componentName) return route.meta.componentName

    // 2. 从最内层（目标页面）路由记录取组件名
    if (route.matched && route.matched.length > 0) {
      const lastIdx = route.matched.length - 1
      const comp = route.matched[lastIdx]?.components?.default
      if (comp) {
        if (comp.__name) return comp.__name   // <script setup>
        if (comp.name) return comp.name        // Options API
      }
    }

    // 3. route.name（子路由的 name，通常与 SFC 文件名一致）
    if (route.name) return route.name

    // 4. 兜底
    return 'Unknown'
  }

  /**
   * 从路由对象解析标签页标题
   */
  function resolveTitle(route) {
    if (route.meta?.title) return route.meta.title
    // 将路由 name 转换为可读标题：CamelCase → 空格分隔
    const name = route.name || ''
    return name.replace(/([A-Z])/g, ' $1').trim() || route.path.split('/').pop() || 'Untitled'
  }

  // ==================== Actions ====================

  /**
   * 添加标签页（已存在则仅激活）
   * @param {import('vue-router').RouteLocationNormalized} route
   * @returns {string|undefined} 返回需要导航到的路径（如果有重定向）
   */
  function addTab(route) {
    // 排除不应出现在标签页中的路由
    if (route.meta?.hideTab) return
    if (!route.path || route.path === '/') return
    // 仅对 /main/* 路径生效
    if (!route.path.startsWith('/main/')) return

    const fullPath = route.fullPath
    const existing = openedTabs.value.find(t => t.fullPath === fullPath)

    if (existing) {
      activeTabPath.value = fullPath
      return
    }

    openedTabs.value.push({
      fullPath: fullPath,
      path: route.path,
      title: resolveTitle(route),
      componentName: resolveComponentName(route),
      query: { ...route.query },
      params: { ...route.params },
      affix: route.meta?.affix || false,
      closable: !route.meta?.affix,  // Home 等固定页不可关闭
    })

    activeTabPath.value = fullPath
  }

  /**
   * 关闭标签页
   * 从 openedTabs 移除 → cachedViews 同步移除 → keep-alive 销毁缓存
   * @param {string} fullPath
   * @returns {string|null} 关闭后应跳转到的路径
   */
  function removeTab(fullPath) {
    const idx = openedTabs.value.findIndex(t => t.fullPath === fullPath)
    if (idx === -1) return null

    const tab = openedTabs.value[idx]
    // 固定标签页不可关闭
    if (tab.affix || tab.closable === false) return null

    openedTabs.value.splice(idx, 1)

    // 如果关闭的是当前激活的标签页，自动切换到相邻标签页
    if (activeTabPath.value === fullPath) {
      const next = openedTabs.value[Math.min(idx, openedTabs.value.length - 1)]
      if (next) {
        activeTabPath.value = next.fullPath
        return next.fullPath
      }
    }
    return null
  }

  /**
   * 设置激活标签页（仅更新状态，导航由 TabBar 组件处理）
   */
  function setActiveTab(fullPath) {
    const tab = openedTabs.value.find(t => t.fullPath === fullPath)
    if (!tab) return
    activeTabPath.value = fullPath
  }

  /** 关闭其他标签页（保留指定页和固定页） */
  function closeOthers(fullPath) {
    openedTabs.value = openedTabs.value.filter(
      t => t.fullPath === fullPath || t.affix || t.closable === false
    )
    activeTabPath.value = fullPath
  }

  /** 关闭右侧所有标签页 */
  function closeRight(fullPath) {
    const idx = openedTabs.value.findIndex(t => t.fullPath === fullPath)
    if (idx === -1) return
    openedTabs.value = openedTabs.value.filter(
      (t, i) => i <= idx || t.affix || t.closable === false
    )
    activeTabPath.value = fullPath
  }

  /** 关闭左侧所有标签页 */
  function closeLeft(fullPath) {
    const idx = openedTabs.value.findIndex(t => t.fullPath === fullPath)
    if (idx === -1) return
    openedTabs.value = openedTabs.value.filter(
      (t, i) => i >= idx || t.affix || t.closable === false
    )
    activeTabPath.value = fullPath
  }

  /** 关闭所有标签页（保留固定页如 Home） */
  function closeAll() {
    openedTabs.value = openedTabs.value.filter(
      t => t.affix || t.closable === false
    )
    const first = openedTabs.value[0]
    if (first) {
      activeTabPath.value = first.fullPath
      return first.fullPath
    }
    return null
  }

  /**
   * 拖拽排序 — 将 fromIndex 的标签页移动到 toIndex
   * 固定标签（Home）不可拖拽、不可被越位
   * @param {number} fromIndex
   * @param {number} toIndex
   */
  function reorderTabs(fromIndex, toIndex) {
    if (fromIndex === toIndex) return
    if (fromIndex < 0 || toIndex < 0) return
    if (fromIndex >= openedTabs.value.length || toIndex >= openedTabs.value.length) return

    // 固定标签不可移动
    const tab = openedTabs.value[fromIndex]
    if (tab.affix || tab.closable === false) return

    // 不允许插入到固定标签之前（即不能放到 index 0）
    if (toIndex === 0) return

    const moved = openedTabs.value.splice(fromIndex, 1)[0]
    openedTabs.value.splice(toIndex, 0, moved)
  }

  /** 重置所有标签页状态（退出登录时调用） */
  function resetTabs() {
    openedTabs.value = []
    activeTabPath.value = ''
  }

  return {
    // state
    openedTabs,
    activeTabPath,
    // computed
    cachedViews,
    // actions
    addTab,
    removeTab,
    setActiveTab,
    closeOthers,
    closeRight,
    closeLeft,
    closeAll,
    reorderTabs,
    resetTabs,
    // helpers (暴露给组件使用)
    resolveTitle,
  }
})
