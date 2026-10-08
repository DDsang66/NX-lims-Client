import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import request from '@/utils/request'
import { API_BASE } from '@/utils/config.js'

const STORAGE_KEY = 'datasheet-progress-tasks'
const STORAGE_VERSION = 1

export const useDatasheetStore = defineStore('datasheet', () => {
  /* ========== 状态 ========== */
  const taskList = ref(loadFromStorage())
  const expandedKeys = ref([])

  // checkListId -> { abort, pollTimer, retryCount, closed }
  const activeConnections = new Map()

  // 全局消息队列，页面订阅后弹 ElMessage
  const events = ref([])   // { id, type, message, ts }

  /* ========== 持久化 ========== */
  watch(
    taskList,
    (val) => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: STORAGE_VERSION, tasks: val })
        )
      } catch (e) {
        console.warn('saveToStorage failed', e)
      }
    },
    { deep: true }
  )

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.map(migrateTask)
      if (parsed && parsed.version === STORAGE_VERSION && Array.isArray(parsed.tasks)) {
        return parsed.tasks.map(migrateTask)
      }
      return []
    } catch (e) {
      console.warn('loadFromStorage failed', e)
      return []
    }
  }

  function migrateTask(t) {
    return {
      checkListId: t.checkListId || '',
      batchId: t.batchId || null,
      reportNo: t.reportNo || '',
      total: t.total || (t.items ? t.items.length : 0),
      success: t.success || 0,
      failed: t.failed || 0,
      generating: t.generating || 0,
      pending: t.pending || 0,
      status: t.status || 'PENDING',
      mergedPdfUrl: t.mergedPdfUrl || null,
      items: (t.items || []).map(i => ({
        datasheetId: i.datasheetId || '',
        projectId: i.projectId || '',
        testItemId: i.testItemId || '',
        modelIndex: i.modelIndex ?? 0,
        modelKey: i.modelKey || null,
        status: i.status || 'PENDING',
        fileUrl: i.fileUrl || null,
        errorMessage: i.errorMessage || null,
        retryCount: i.retryCount || 0,
        updatedAt: i.updatedAt || new Date().toISOString()
      }))
    }
  }

  /* ========== 状态常量（和页面一致） ========== */
  const SUCCESS_STATUSES = new Set([
    'SUCCESS', 'CREATED', 'INPROCCESS', 'IN_PROCESS', 'INPROGRESS',
    'COMPLETED', 'RELEASED', 'MERGED'
  ])
  const FAILED_STATUSES = new Set([
    'FAILED', 'REJECTED', 'PARTIAL_FAILED', 'MERGE_FAILED'
  ])
  const RUNNING_STATUSES = new Set(['PENDING', 'GENERATING', 'MERGING'])
  const TERMINAL_STATUSES = new Set([
    'SUCCESS', 'CREATED', 'COMPLETED', 'RELEASED', 'MERGED',
    'FAILED', 'REJECTED', 'PARTIAL_FAILED', 'MERGE_FAILED'
  ])

  const normalizeStatus = (s) => String(s || '').trim().toUpperCase()
  const isSuccessStatus = (s) => SUCCESS_STATUSES.has(normalizeStatus(s))
  const isFailedStatus = (s) => FAILED_STATUSES.has(normalizeStatus(s))
  const isRunningStatus = (s) => RUNNING_STATUSES.has(normalizeStatus(s))
  const isTerminalStatus = (s) => TERMINAL_STATUSES.has(normalizeStatus(s))

  /* ========== 事件 ========== */
  function emit(type, message) {
    events.value.push({ id: Date.now() + Math.random(), type, message, ts: Date.now() })
    // 只保留最近 50 条，避免无限增长
    if (events.value.length > 50) events.value.splice(0, events.value.length - 50)
  }

  function consumeEvent(id) {
    const idx = events.value.findIndex(e => e.id === id)
    if (idx >= 0) events.value.splice(idx, 1)
  }

  /* ========== 任务 CRUD ========== */
  function getTask(checkListId) {
    return taskList.value.find(t => t.checkListId === checkListId)
  }

  function createTask(checkListId, reportNo, projectCount) {
    const projects = Array.from({ length: projectCount }, (_, i) => ({
      datasheetId: `ds-${checkListId.slice(0, 6)}-${i + 1}`,
      projectId: `P${String(i + 1).padStart(3, '0')}`,
      testItemId: '',
      modelIndex: i,
      modelKey: null,
      status: 'PENDING',
      fileUrl: null,
      errorMessage: null,
      retryCount: 0,
      updatedAt: new Date().toISOString()
    }))
    return {
      checkListId,
      batchId: null,
      reportNo,
      total: projectCount,
      success: 0, failed: 0, generating: 0, pending: projectCount,
      status: 'PENDING',
      mergedPdfUrl: null,
      items: projects
    }
  }

  /** ★ 对外主入口：生成页调用它 → 自动开始监听 */
  async function startGenerate({ checkListId, reportNo, forceRegenerate = false }) {
    if (!checkListId) return null

    try {
      const res = await request.post('/datasheet/datasheet-generate', {
        checkListId,
        reportNo,
        forceRegenerate
      })
      const data = res.data?.value
      if (!data) {
        emit('error', 'Generate failed')
        return null
      }

      const task = createTask(data.checkListId, reportNo, data.total)
      task.batchId = data.batchId
      taskList.value.unshift(task)
      expandedKeys.value = [data.checkListId]

      attachTaskStream(data.checkListId, reportNo)

      return data
    } catch (e) {
      console.error('[store] startGenerate failed', e)
      emit('error', 'Generate request failed')
      return null
    }
  }

  /* ========== SSE ========== */
  function attachTaskStream(checkListId, reportNo = '') {
    if (!checkListId) return
    detachTaskStream(checkListId)

    let task = getTask(checkListId)
    if (!task) {
      task = createTask(checkListId, reportNo || checkListId.slice(0, 12), 0)
      task.total = 0
      task.pending = 0
      task.status = 'GENERATING'
      taskList.value.unshift(task)
      expandedKeys.value = [checkListId]
    }

    const conn = { abort: null, pollTimer: null, retryCount: 0, closed: false }
    activeConnections.set(checkListId, conn)
    openSseStream(checkListId, task, conn)
  }

  function openSseStream(checkListId, task, conn) {
    if (conn.closed) return

    const controller = new AbortController()
    conn.abort = controller

    const token = localStorage.getItem('accessToken')
    const url = `${API_BASE}/datasheet/datasheet-progress/stream?checkListId=${encodeURIComponent(checkListId)}`

    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
        ...(token ? { accessToken: token } : {})
      },
      signal: controller.signal
    })
      .then(async (res) => {
        if (!res.ok || !res.body) throw new Error(`SSE HTTP ${res.status}`)
        conn.retryCount = 0

        const reader = res.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          let idx
          while ((idx = buffer.indexOf('\n\n')) >= 0) {
            const rawEvent = buffer.slice(0, idx)
            buffer = buffer.slice(idx + 2)
            handleSseEvent(rawEvent, checkListId)
          }
        }
      })
      .catch((err) => {
        if (conn.closed || err.name === 'AbortError') return
        console.warn('SSE error', err)
        conn.retryCount += 1
        if (conn.retryCount > 3) {
          console.warn('SSE retry exceeded, fallback to polling')
          startPolling(checkListId, conn)
        } else {
          setTimeout(() => openSseStream(checkListId, task, conn), 1000 * conn.retryCount)
        }
      })
  }

  function handleSseEvent(rawEvent, checkListId) {
    const lines = rawEvent.split('\n')
    let eventName = 'message'
    let dataStr = ''
    for (const line of lines) {
      if (line.startsWith('event:')) eventName = line.slice(6).trim()
      else if (line.startsWith('data:')) dataStr += line.slice(5).trim()
    }
    if (!dataStr) return
    const data = safeParse(dataStr)
    if (!data) return

    const t = getTask(checkListId)
    if (!t) return

    if (eventName === 'progress') {
      applyProgressSnapshot(t, data)
    } else if (eventName === 'item-failed') {
      const item = t.items.find(i =>
        i.projectId === data.ProjectId ||
        i.testItemId === data.ProjectId ||
        i.datasheetId === data.DataSheetId
      )
      if (item) {
        item.status = 'FAILED'
        item.errorMessage = data.ErrorMessage
        item.retryCount = data.RetryCount ?? item.retryCount
        item.updatedAt = data.UpdatedAt || new Date().toISOString()
      }
    } else if (eventName === 'completed') {
      t.status = data.Status || t.status
      t.total = data.Total ?? t.total
      t.success = data.Success ?? t.success
      t.failed = data.Failed ?? t.failed
    } else if (eventName === 'merged') {
      if (data.MergedPdfUrl) {
        t.mergedPdfUrl = data.MergedPdfUrl
        t.status = t.failed > 0 ? 'PARTIAL_FAILED' : 'MERGED'
        emit('success', `Task ${t.reportNo} merged PDF ready`)
      }
      closeConnection(checkListId)
    }
  }

  function detachTaskStream(checkListId) {
    const conn = activeConnections.get(checkListId)
    if (!conn) return
    conn.closed = true
    try { conn.abort?.abort() } catch { }
    if (conn.pollTimer) clearInterval(conn.pollTimer)
    activeConnections.delete(checkListId)
  }

  function closeConnection(checkListId) {
    detachTaskStream(checkListId)
  }

  async function startPolling(checkListId, conn) {
    if (conn.pollTimer) return
    const poll = async () => {
      try {
        const res = await request.get('/datasheet/datasheet-progress', {
          params: { checkListId }
        })
        const data = res.data?.value
        if (!data) return
        const t = getTask(checkListId)
        if (!t) return
        applyProgressSnapshot(t, data)
        if (isTerminalStatus(data.Status)) {
          clearInterval(conn.pollTimer)
          conn.pollTimer = null
          activeConnections.delete(checkListId)
        }
      } catch (e) {
        console.warn('polling error', e)
      }
    }
    poll()
    conn.pollTimer = setInterval(poll, 2000)
  }

  function applyProgressSnapshot(t, data) {
    t.total = data.Total ?? t.total
    t.success = data.Success ?? t.success
    t.failed = data.Failed ?? t.failed
    t.generating = data.Generating ?? t.generating
    t.pending = data.Pending ?? t.pending
    t.status = data.Status ?? t.status
    t.mergedPdfUrl = data.MergedPdfUrl ?? t.mergedPdfUrl
    t.batchId = data.BatchId ?? t.batchId

    if (Array.isArray(data.Items)) {
      t.items = data.Items.map(dto => ({
        datasheetId: dto.DataSheetId,
        projectId: dto.ProjectId,
        testItemId: dto.TestItemId,
        modelIndex: dto.ModelIndex,
        modelKey: dto.ModelKey,
        status: dto.Status,
        fileUrl: dto.FileUrl,
        errorMessage: dto.ErrorMessage,
        retryCount: dto.RetryCount,
        updatedAt: dto.UpdatedAt
      }))
    }
  }

  function safeParse(str) {
    try { return JSON.parse(str) } catch { return null }
  }

  /* ========== 重试 ========== */
  async function retryItem(item) {
    try {
      const res = await request.post(`/datasheet/retry/${item.datasheetId}`)
      if (res.data?.isSuccess) emit('success', `Retry requested for ${item.testItemId || item.datasheetId}`)
      else emit('error', res.data?.error || 'Retry failed')
    } catch (e) {
      console.error('Retry error:', e)
      emit('error', e.response?.data?.error || 'Retry failed')
    }
  }

  async function retryAllFailed(task) {
    const count = task.items.filter(i => isFailedStatus(i.status)).length
    if (count === 0) {
      emit('warning', 'No failed items to retry')
      return
    }
    try {
      const res = await request.post(`/datasheet/retry-batch/${task.checkListId}`)
      if (res.data?.isSuccess) emit('success', `Batch retry requested for ${count} datasheets`)
      else emit('error', res.data?.error || 'Batch retry failed')
    } catch (e) {
      console.error('Batch retry error:', e)
      emit('error', e.response?.data?.error || 'Batch retry failed')
    }
  }

  /* ========== 清理 ========== */
  function clearAll() {
    activeConnections.forEach((_, id) => detachTaskStream(id))
    taskList.value = []
    expandedKeys.value = []
  }

  function dispose() {
    activeConnections.forEach((_, id) => detachTaskStream(id))
  }

  /* ========== 派生 ========== */
  function deriveOverallStatus(task) {
    const items = task?.items || []
    if (items.length === 0) return normalizeStatus(task?.status) || 'PENDING'

    let success = 0, failed = 0, running = 0, unknown = 0
    for (const it of items) {
      if (isSuccessStatus(it.status)) success++
      else if (isFailedStatus(it.status)) failed++
      else if (isRunningStatus(it.status)) running++
      else unknown++
    }
    if (running > 0 || unknown > 0) {
      if (success > 0 && running > 0) return 'MERGING'
      return 'GENERATING'
    }
    if (failed === 0) return 'SUCCESS'
    if (success === 0) return 'FAILED'
    return 'PARTIAL_FAILED'
  }

  function displayStatus(status) {
    const s = normalizeStatus(status)
    if (SUCCESS_STATUSES.has(s) && s !== 'SUCCESS') return 'SUCCESS'
    return s || 'UNKNOWN'
  }

  const summary = computed(() => {
    const s = { generating: 0, success: 0, failed: 0 }
    taskList.value.forEach(t => {
      const overall = deriveOverallStatus(t)
      if (overall === 'SUCCESS') s.success++
      else if (overall === 'FAILED' || overall === 'PARTIAL_FAILED') s.failed++
      else s.generating++
    })
    return s
  })

  return {
    // state
    taskList, expandedKeys, events,
    // action
    startGenerate, attachTaskStream, detachTaskStream, closeConnection,
    retryItem, retryAllFailed, clearAll, dispose,
    consumeEvent,
    // helpers
    normalizeStatus, isSuccessStatus, isFailedStatus, isRunningStatus, isTerminalStatus,
    deriveOverallStatus, displayStatus,
    summary,
    getTask
  }
})
