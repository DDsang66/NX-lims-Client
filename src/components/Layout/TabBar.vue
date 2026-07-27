<template>
  <div class="tab-bar-container">
    <!-- 左滚动箭头 -->
    <span
      class="tab-bar-arrow tab-bar-arrow-left"
      :class="{ visible: canScrollLeft }"
      @click="scrollLeft"
    >
      <el-icon><ArrowLeft /></el-icon>
    </span>

    <!-- 标签页滚动轨道 -->
    <div
      ref="trackRef"
      class="tab-bar-track"
      @wheel.prevent="handleWheel"
    >
      <div
        v-for="(tab, idx) in tabsStore.openedTabs"
        :key="tab.fullPath"
        :ref="el => setTabRef(tab.fullPath, el)"
        :class="tabClasses(tab, idx)"
        :draggable="tab.closable !== false"
        @click="handleTabClick(tab)"
        @contextmenu.prevent="openContextMenu($event, tab)"
        @dragstart="onDragStart($event, idx)"
        @dragenter="onDragEnter($event, idx)"
        @dragover="onDragOver($event, tab, idx)"
        @dragleave="onDragLeave"
        @drop="onDrop($event)"
        @dragend="onDragEnd"
      >
        <span class="tab-title">{{ tab.title }}</span>
        <span
          v-if="tab.closable !== false"
          class="tab-close"
          @click.stop="handleTabClose(tab)"
        >
          <el-icon><Close /></el-icon>
        </span>
      </div>
    </div>

    <!-- 右滚动箭头 -->
    <span
      class="tab-bar-arrow tab-bar-arrow-right"
      :class="{ visible: canScrollRight }"
      @click="scrollRight"
    >
      <el-icon><ArrowRight /></el-icon>
    </span>

    <!-- 更多操作按钮 -->
    <div class="tab-bar-actions">
      <el-dropdown trigger="click" :hide-on-click="false">
        <span class="tab-bar-more">
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="closeAllTabs">
              <el-icon><CloseBold /></el-icon>
              关闭所有
            </el-dropdown-item>
            <el-dropdown-item @click="closeOtherTabs">
              <el-icon><SemiSelect /></el-icon>
              关闭其他
            </el-dropdown-item>
            <el-dropdown-item @click="closeRightTabs">
              <el-icon><DArrowRight /></el-icon>
              关闭右侧
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import {
  ArrowLeft, ArrowRight, ArrowDown, Close,
  CloseBold, SemiSelect, DArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()
const tabsStore = useTabsStore()

// ==================== DOM 引用 ====================
const trackRef = ref(null)
const tabRefs = {}
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function setTabRef(path, el) {
  if (el) tabRefs[path] = el
}

// ==================== 拖拽状态 ====================
const dragIndex = ref(-1)        // 被拖拽的标签页索引
const dropPosition = ref(-1)     // 目标插入位置（在哪个索引之前）
let autoScrollTimer = null

function tabClasses(tab, idx) {
  return [
    'tab-item',
    { active: tab.fullPath === tabsStore.activeTabPath },
    { dragging: idx === dragIndex.value },
    { 'drop-before': dropPosition.value === idx && idx !== dragIndex.value },
    { 'drop-after': dropPosition.value === idx + 1 && idx !== dragIndex.value && dropPosition.value <= tabsStore.openedTabs.length },
  ]
}

// ==================== 拖拽事件处理 ====================

function onDragStart(e, idx) {
  dragIndex.value = idx
  // 设置拖拽图像为半透明效果
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', String(idx))
  // 延迟设置拖拽图像，让浏览器先生成缩略图
  const el = e.target
  if (el) {
    const rect = el.getBoundingClientRect()
    e.dataTransfer.setDragImage(el, rect.width / 2, rect.height / 2)
  }
}

function onDragEnter(e) {
  e.preventDefault()
}

function onDragOver(e, tab, idx) {
  e.preventDefault()
  if (idx === dragIndex.value) {
    dropPosition.value = -1
    return
  }

  // 不允许放到固定标签（Home）前面，也不允许拖拽固定标签
  if (tab.closable === false || tab.affix) {
    return
  }

  e.dataTransfer.dropEffect = 'move'

  // 根据鼠标在目标元素上的位置决定插入前还是插入后
  const rect = e.currentTarget.getBoundingClientRect()
  const midX = rect.left + rect.width / 2

  if (e.clientX < midX) {
    dropPosition.value = idx           // 插入到当前标签之前
  } else {
    dropPosition.value = idx + 1       // 插入到当前标签之后
  }

  // 拖拽到边缘时自动滚动
  handleDragAutoScroll(e)
}

function onDragLeave() {}

function onDrop(e) {
  e.preventDefault()
  const fromIdx = dragIndex.value
  let toIdx = dropPosition.value

  if (toIdx < 0 || fromIdx < 0) { onDragEnd(); return }

  // 不允许放到 Home（index 0）之前
  if (toIdx === 0) { onDragEnd(); return }

  // 修正目标位置（移除被拖拽元素后索引偏移）
  if (toIdx > fromIdx) toIdx--

  if (toIdx === 0) { onDragEnd(); return }

  tabsStore.reorderTabs(fromIdx, toIdx)
  onDragEnd()
}

function onDragEnd() {
  dragIndex.value = -1
  dropPosition.value = -1
  clearDragAutoScroll()
}

// ==================== 拖拽时边缘自动滚动 ====================
function handleDragAutoScroll(e) {
  const track = trackRef.value
  if (!track) return

  const rect = track.getBoundingClientRect()
  const edgeThreshold = 80
  const scrollSpeed = 15

  clearDragAutoScroll()

  if (e.clientX - rect.left < edgeThreshold) {
    // 靠近左边缘 → 向左滚动
    autoScrollTimer = setInterval(() => {
      track.scrollLeft -= scrollSpeed
    }, 16)
  } else if (rect.right - e.clientX < edgeThreshold) {
    // 靠近右边缘 → 向右滚动
    autoScrollTimer = setInterval(() => {
      track.scrollLeft += scrollSpeed
    }, 16)
  }
}

function clearDragAutoScroll() {
  if (autoScrollTimer) {
    clearInterval(autoScrollTimer)
    autoScrollTimer = null
  }
}

// ==================== 标签页操作 ====================
function handleTabClick(tab) {
  tabsStore.setActiveTab(tab.fullPath)
  router.push(tab.fullPath)
}

function handleTabClose(tab) {
  const nextPath = tabsStore.removeTab(tab.fullPath)
  if (nextPath) {
    router.push(nextPath)
  }
}

// ==================== 下拉菜单操作 ====================
function closeAllTabs() {
  const nextPath = tabsStore.closeAll()
  if (nextPath) {
    router.push(nextPath)
  }
}

function closeOtherTabs() {
  tabsStore.closeOthers(tabsStore.activeTabPath)
}

function closeRightTabs() {
  tabsStore.closeRight(tabsStore.activeTabPath)
}

// ==================== 滚动 ====================
function scrollLeft() {
  trackRef.value?.scrollBy({ left: -200, behavior: 'smooth' })
}

function scrollRight() {
  trackRef.value?.scrollBy({ left: 200, behavior: 'smooth' })
}

function handleWheel(e) {
  if (trackRef.value) {
    trackRef.value.scrollLeft += e.deltaY
  }
}

function checkScrollArrows() {
  const el = trackRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 1
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 1
}

// ==================== 自动滚动到激活标签页 ====================
watch(() => tabsStore.activeTabPath, async () => {
  await nextTick()
  const el = tabRefs[tabsStore.activeTabPath]
  if (el) {
    el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }
})

// ==================== 滚动监听 ====================
let resizeObserver = null

onMounted(() => {
  if (trackRef.value) {
    trackRef.value.addEventListener('scroll', checkScrollArrows, { passive: true })
    resizeObserver = new ResizeObserver(checkScrollArrows)
    resizeObserver.observe(trackRef.value)
  }
})

onUnmounted(() => {
  if (trackRef.value) {
    trackRef.value.removeEventListener('scroll', checkScrollArrows)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  clearDragAutoScroll()
})
</script>

<style scoped>
.tab-bar-container {
  display: flex;
  align-items: center;
  height: 38px;
  background: var(--el-bg-color-page, #f5f7fa);
  border-bottom: 1px solid var(--el-border-color-light, #e4e7ed);
  user-select: none;
  flex-shrink: 0;
  position: relative;
}

/* ==================== 标签页轨道 ==================== */
.tab-bar-track {
  flex: 1;
  display: flex;
  align-items: flex-end;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  height: 100%;
  padding: 4px 4px 0 4px;
  gap: 2px;
}
.tab-bar-track::-webkit-scrollbar {
  display: none;
}

/* ==================== 单个标签页 ==================== */
.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border-radius: 6px 6px 0 0;
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid transparent;
  border-bottom: none;
  transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.15s, opacity 0.15s;
  flex-shrink: 0;
  max-width: 180px;
  position: relative;
}

.tab-item:hover {
  background: var(--el-bg-color-overlay, #fff);
  color: var(--el-text-color-primary, #303133);
}

.tab-item.active {
  background: var(--el-bg-color, #fff);
  color: var(--el-color-primary, #409eff);
  border-color: var(--el-border-color-light, #e4e7ed);
  border-bottom-color: var(--el-bg-color, #fff);
  z-index: 1;
}

/* ==================== 拖拽状态 ==================== */

/* 被拖拽的标签页 — 半透明 */
.tab-item.dragging {
  opacity: 0.4;
  transform: scale(0.95);
}

/* 在此标签之前插入 — 左边缘蓝色指示线 */
.tab-item.drop-before::before {
  content: '';
  position: absolute;
  left: -3px;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: var(--el-color-primary, #409eff);
  border-radius: 1px;
  z-index: 10;
  animation: dropPulse 0.8s ease-in-out infinite;
}

/* 在此标签之后插入 — 右边缘蓝色指示线 */
.tab-item.drop-after::after {
  content: '';
  position: absolute;
  right: -3px;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: var(--el-color-primary, #409eff);
  border-radius: 1px;
  z-index: 10;
  animation: dropPulse 0.8s ease-in-out infinite;
}

@keyframes dropPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ==================== 标签页标题 ==================== */
.tab-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1;
  pointer-events: none;
}

/* ==================== 关闭按钮 ==================== */
.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.12s, background 0.12s, color 0.12s;
  flex-shrink: 0;
  color: var(--el-text-color-secondary, #909399);
}

.tab-item:hover .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background: var(--el-color-primary-light-9, #ecf5ff);
  color: var(--el-color-primary, #409eff);
}

.tab-item.active .tab-close {
  opacity: 1;
}

/* 拖拽中隐藏关闭按钮 */
.tab-item.dragging .tab-close,
.tab-item.drop-before .tab-close,
.tab-item.drop-after .tab-close {
  opacity: 0 !important;
}

/* ==================== 滚动箭头 ==================== */
.tab-bar-arrow {
  flex-shrink: 0;
  width: 28px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--el-text-color-secondary, #909399);
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
  pointer-events: none;
}

.tab-bar-arrow.visible {
  opacity: 1;
  pointer-events: auto;
}

.tab-bar-arrow:hover {
  color: var(--el-color-primary, #409eff);
}

.tab-bar-arrow-left {
  background: linear-gradient(to right, var(--el-bg-color-page, #f5f7fa) 60%, transparent);
}

.tab-bar-arrow-right {
  background: linear-gradient(to left, var(--el-bg-color-page, #f5f7fa) 60%, transparent);
}

/* ==================== 更多操作 ==================== */
.tab-bar-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
}

.tab-bar-more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--el-text-color-secondary, #909399);
  font-size: 14px;
  transition: background 0.15s, color 0.15s;
}

.tab-bar-more:hover {
  background: var(--el-bg-color-overlay, #fff);
  color: var(--el-color-primary, #409eff);
}
</style>
