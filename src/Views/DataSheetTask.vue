<template>
  <div class="datasheetDemo">

    <!-- Floating left panel: task summary -->
    <div class="sidePanel">
      <div class="sidePanelTitle">Summary</div>
      <div class="summaryItem">
        <span class="summaryLabel">Total Tasks</span>
        <span class="summaryValue">{{ taskList.length }}</span>
      </div>
      <div class="summaryItem">
        <span class="summaryLabel">Generating</span>
        <span class="summaryValue">{{ summary.generating }}</span>
      </div>
      <div class="summaryItem">
        <span class="summaryLabel">Success</span>
        <span class="summaryValue success">{{ summary.success }}</span>
      </div>
      <div class="summaryItem">
        <span class="summaryLabel">Failed</span>
        <span class="summaryValue danger">{{ summary.failed }}</span>
      </div>

      <el-divider style="margin: 12px 0" />

      <div class="sidePanelTitle">Search / Filter</div>
      <el-input v-model="keyword"
                size="small"
                clearable
                placeholder="Report No / CheckList ID"
                style="margin-bottom: 8px" />
      <el-select v-model="statusFilter"
                 size="small"
                 style="width: 100%"
                 placeholder="All status">
        <el-option label="All status" value="" />
        <el-option label="PENDING" value="PENDING" />
        <el-option label="GENERATING" value="GENERATING" />
        <el-option label="SUCCESS" value="SUCCESS" />
        <el-option label="MERGED" value="MERGED" />
        <el-option label="PARTIAL_FAILED" value="PARTIAL_FAILED" />
        <el-option label="FAILED" value="FAILED" />
      </el-select>

      <el-divider style="margin: 12px 0" />

      <div class="sidePanelTitle">Data Source</div>
      <el-radio-group v-model="dataSource" size="small">
        <el-radio-button label="mock">Mock</el-radio-button>
        <el-radio-button label="real">Real SSE</el-radio-button>
      </el-radio-group>

      <div v-if="dataSource === 'real'" style="margin-top: 8px">
        <el-input v-model="baseUrl"
                  size="small"
                  placeholder="API base url" />
        <div class="hintText">e.g. http://localhost:8080</div>
      </div>
    </div>

    <!-- Main content -->
    <div class="mainContent">
      <!-- Top title row -->
      <div class="headerRow">
        <h3>Datasheet Generation Progress</h3>
        <div class="headerActions">
          <el-button type="primary" @click="startMockGenerate" :disabled="dataSource === 'real'">
            Simulate New Task
          </el-button>
          <el-button @click="clearAll">Clear All</el-button>
        </div>
      </div>

      <div v-if="dataSource === 'real'" class="attachBar">
        <el-input v-model="attachCheckListId" size="small" placeholder="CheckList ID" style="width: 240px" />
        <el-input v-model="attachReportNo" size="small" placeholder="Report No (optional)" style="width: 200px" />
        <el-button size="small" type="primary" @click="attachRealTask">Attach Task</el-button>
        <span class="hintText">
          Listening to {{ baseUrl }}/api/checklist/&lt;id&gt;/datasheet-progress/stream
        </span>
      </div>

      <el-table :data="filteredTaskList"
                row-key="checkListId"
                border
                style="width: 100%"
                :expand-row-keys="expandedKeys"
                @expand-change="handleExpandChange"
                empty-text="No tasks yet. Click 'Simulate New Task' to start.">
        <!-- Expand: datasheet sub-table -->
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="subTableWrapper">
              <div class="subHeader">
                <span>
                  Datasheets under this Task ({{ row.items.length }})
                </span>
                <div>
                  <el-tag v-if="row.mergedPdfUrl" type="success" style="margin-right: 8px">
                    Merged PDF Ready
                  </el-tag>
                  <el-button v-if="row.mergedPdfUrl"
                             size="small"
                             type="primary"
                             @click="openMergedPdf(row)">
                    Open Merged PDF
                  </el-button>
                </div>
              </div>
              <el-table :data="row.items" border size="small">
                <el-table-column prop="projectId" label="Project" width="90" />
                <el-table-column prop="projectName" label="Project Name" width="140" />
                <el-table-column prop="datasheetId" label="Datasheet ID" width="150" />
                <el-table-column label="Status" width="120">
                  <template #default="{ row: item }">
                    <el-tag :type="statusTagType(item.status)" size="small">
                      {{ item.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="retryCount" label="Retries" width="80" />
                <el-table-column label="Actions" width="180">
                  <template #default="{ row: item }">
                    <el-button v-if="item.status === 'SUCCESS' && item.fileUrl"
                               size="small"
                               @click="openFile(item.fileUrl)">
                      Download
                    </el-button>
                    <el-button v-if="item.status === 'FAILED'"
                               size="small"
                               type="warning"
                               @click="retryItem(item)">
                      Retry
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column prop="errorMessage" label="Error Message" min-width="240">
                  <template #default="{ row: item }">
                    <span v-if="item.errorMessage" class="errorText">
                      {{ item.errorMessage }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="updatedAt" label="Updated At" width="180">
                  <template #default="{ row: item }">
                    {{ formatTime(item.updatedAt) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="checkListId" label="CheckList ID" width="200" />
        <el-table-column prop="reportNo" label="Report No" width="200" />
        <el-table-column label="Overall Progress" min-width="280">
          <template #default="{ row }">
            <el-progress :percentage="row.total ? Math.round(((row.success + row.failed) / row.total) * 100) : 0"
                         :status="progressStatus(row)" />
            <div class="progressText">
              {{ row.success }} success / {{ row.failed }} failed /
              {{ row.generating }} generating / {{ row.pending }} pending
              (total {{ row.total }})
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Overall Status" width="160">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120">
          <template #default="{ row }">
            <el-button size="small" @click="toggleExpand(row)">
              {{ expandedKeys.includes(row.checkListId) ? 'Collapse' : 'Expand' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onBeforeUnmount  } from 'vue'
  import { ElMessage } from 'element-plus'

  /* ---------------- State ---------------- */
  const STORAGE_KEY = 'datasheet-progress-tasks'
  const STORAGE_VERSION = 1
  const taskList = ref(loadFromStorage())
  const expandedKeys = ref([])
  /* ---------------- Filter & data source ---------------- */
const keyword = ref('')
const statusFilter = ref('')
const dataSource = ref('mock')          // 'mock' | 'real'
const baseUrl = ref('http://localhost:8080')
  /* ---------------- Persistence ---------------- */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // 兼容：可能是数组（旧）或 {version, tasks}（新）
    if (Array.isArray(parsed)) {
      return parsed.map(migrateTask)
    }
    if (parsed && parsed.version === STORAGE_VERSION && Array.isArray(parsed.tasks)) {
      return parsed.tasks.map(migrateTask)
    }
    return []
  } catch (e) {
    console.warn('loadFromStorage failed', e)
    return []
  }
}

// 防止历史数据缺字段导致页面崩溃
function migrateTask(t) {
  return {
    checkListId: t.checkListId || '',
    reportNo: t.reportNo || '',
    total: t.total || (t.items ? t.items.length : 0),
    success: t.success || 0,
    failed: t.failed || 0,
    generating: t.generating || 0,
    pending: t.pending || 0,
    status: t.status || 'PENDING',
    mergedPdfUrl: t.mergedPdfUrl || null,
    items: (t.items || []).map(i => ({
      projectId: i.projectId || '',
      projectName: i.projectName || '',
      datasheetId: i.datasheetId || '',
      status: i.status || 'PENDING',
      fileUrl: i.fileUrl || null,
      errorMessage: i.errorMessage || null,
      retryCount: i.retryCount || 0,
      updatedAt: i.updatedAt || new Date().toISOString()
    }))
  }
}

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
/* ---------------- Real SSE ---------------- */
const activeConnections = new Map() // checkListId -> { es, pollTimer, retryCount, closed }

/**
 * 启动真实进度订阅。两种入口：
 *  1. 已知 checkListId（例如从后端 generate 接口拿到）→ attachTaskStream
 *  2. 手动粘贴一个 checkListId 来观察（本 demo 用「Attach Task」按钮触发）
 */
function attachTaskStream(checkListId, reportNo = '') {
  if (!checkListId) {
    ElMessage.warning('checkListId is required')
    return
  }
  // 已存在连接，先关闭
  detachTaskStream(checkListId)

  // 若 task 不存在，先占位
  let task = taskList.value.find(t => t.checkListId === checkListId)
  if (!task) {
    task = createTask(checkListId, reportNo || checkListId.slice(0, 12), 0)
    task.total = 0
    task.pending = 0
    task.status = 'GENERATING'
    taskList.value.unshift(task)
    expandedKeys.value = [checkListId]
  }

  const url = `${baseUrl.value.replace(/\/$/, '')}/api/checklist/${checkListId}/datasheet-progress/stream`
  const conn = { es: null, pollTimer: null, retryCount: 0, closed: false }
  activeConnections.set(checkListId, conn)

  const open = () => {
    if (conn.closed) return

    let es
    try {
      es = new EventSource(url)
    } catch (e) {
      console.warn('EventSource not supported, fallback to polling', e)
      startPolling(checkListId, task, conn)
      return
    }
    conn.es = es

    es.addEventListener('progress', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      applyProgressSnapshot(task, data)
    })

    es.addEventListener('item-failed', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const item = task.items.find(i => i.projectId === data.projectId)
      if (item) {
        item.status = 'FAILED'
        item.errorMessage = data.errorMessage
        item.retryCount = data.retryCount ?? item.retryCount
        item.updatedAt = data.updatedAt || new Date().toISOString()
      }
      recalcAggregates(task)
    })

    es.addEventListener('completed', (e) => {
      const data = safeParse(e.data)
      if (data) {
        task.status = data.status || task.status
        task.total = data.total ?? task.total
        task.success = data.success ?? task.success
        task.failed = data.failed ?? task.failed
      }
      // 链路一：completed 后关闭；链路二：等 merged
      // 这里保守起见，等 merged 或手动关闭
    })

    es.addEventListener('merged', (e) => {
      const data = safeParse(e.data)
      if (data?.mergedPdfUrl) {
        task.mergedPdfUrl = data.mergedPdfUrl
        task.status = task.failed > 0 ? 'PARTIAL_FAILED' : 'MERGED'
        ElMessage.success(`Task ${task.reportNo} merged PDF ready`)
      }
      closeConnection(checkListId)
    })

    es.onerror = () => {
      // EventSource 会自动重连；若重试太多则降级轮询
      conn.retryCount += 1
      if (conn.retryCount > 3) {
        console.warn('SSE retry exceeded, fallback to polling')
        try { es.close() } catch {}
        conn.es = null
        startPolling(checkListId, task, conn)
      }
    }
  }

  open()
}

function detachTaskStream(checkListId) {
  const conn = activeConnections.get(checkListId)
  if (!conn) return
  conn.closed = true
  try { conn.es?.close() } catch {}
  if (conn.pollTimer) clearInterval(conn.pollTimer)
  activeConnections.delete(checkListId)
}

function closeConnection(checkListId) {
  detachTaskStream(checkListId)
}

function startPolling(checkListId, task, conn) {
  if (conn.pollTimer) return
  const poll = async () => {
    try {
      const res = await fetch(
        `${baseUrl.value.replace(/\/$/, '')}/api/checklist/${checkListId}/datasheet-progress`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      applyProgressSnapshot(task, data)
      if (['SUCCESS', 'MERGED', 'FAILED', 'PARTIAL_FAILED'].includes(data.status)) {
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

function applyProgressSnapshot(task, data) {
  task.total = data.total ?? task.total
  task.success = data.success ?? task.success
  task.failed = data.failed ?? task.failed
  task.generating = data.generating ?? task.generating
  task.pending = data.pending ?? task.pending
  task.status = data.status ?? task.status
  task.mergedPdfUrl = data.mergedPdfUrl ?? task.mergedPdfUrl

  if (Array.isArray(data.items)) {
    // 以 snapshot 为准，合并到现有 items（按 projectId）
    const map = new Map(task.items.map(i => [i.projectId, i]))
    data.items.forEach(dto => {
      const old = map.get(dto.projectId) || {}
      map.set(dto.projectId, { ...old, ...dto })
    })
    task.items = Array.from(map.values())
  } else if (data.changedItem) {
    const item = task.items.find(i => i.projectId === data.changedItem.projectId)
    if (item) Object.assign(item, data.changedItem)
    else task.items.push(data.changedItem)
  }
}

function safeParse(str) {
  try { return JSON.parse(str) } catch { return null }
}

/* ---------------- Real mode: attach by ID ---------------- */
const attachCheckListId = ref('')
const attachReportNo = ref('')

function attachRealTask() {
  if (dataSource.value !== 'real') {
    ElMessage.warning('Switch Data Source to "Real SSE" first')
    return
  }
  if (!attachCheckListId.value.trim()) {
    ElMessage.warning('Please enter a CheckList ID')
    return
  }
  attachTaskStream(attachCheckListId.value.trim(), attachReportNo.value.trim())
  attachCheckListId.value = ''
  attachReportNo.value = ''
}


  /* ---------------- Computed ---------------- */
const filteredTaskList = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return taskList.value.filter(t => {
    // status filter
    if (statusFilter.value && t.status !== statusFilter.value) return false
    // keyword filter: reportNo / checkListId / projectName / datasheetId
    if (kw) {
      const hitTask =
        (t.reportNo || '').toLowerCase().includes(kw) ||
        (t.checkListId || '').toLowerCase().includes(kw)
      const hitItem = (t.items || []).some(
        i =>
          (i.projectName || '').toLowerCase().includes(kw) ||
          (i.datasheetId || '').toLowerCase().includes(kw)
      )
      if (!hitTask && !hitItem) return false
    }
    return true
  })
})

  const summary = computed(() => {
    const s = { generating: 0, success: 0, failed: 0 }
    taskList.value.forEach(t => {
      if (t.status === 'GENERATING' || t.status === 'MERGING' || t.status === 'PENDING') {
        s.generating += 1
      } else if (t.status === 'SUCCESS' || t.status === 'MERGED') {
        s.success += 1
      } else {
        s.failed += 1
      }
    })
    return s
  })

  /* ---------------- Utils ---------------- */
  function formatTime(t) {
    if (!t) return ''
    return new Date(t).toLocaleString('en-US', { hour12: false })
  }

  function statusTagType(status) {
    switch (status) {
      case 'SUCCESS':
      case 'MERGED':
        return 'success'
      case 'FAILED':
      case 'PARTIAL_FAILED':
      case 'MERGE_FAILED':
        return 'danger'
      case 'GENERATING':
      case 'MERGING':
        return 'warning'
      default:
        return 'info'
    }
  }

  function progressStatus(row) {
    if (row.status === 'SUCCESS' || row.status === 'MERGED') return 'success'
    if (row.status === 'FAILED' || row.status === 'PARTIAL_FAILED') return 'exception'
    return undefined
  }

  /* ---------------- Task creation ---------------- */
  function createTask(checkListId, reportNo, projectCount) {
    const projects = Array.from({ length: projectCount }, (_, i) => ({
      projectId: `P${String(i + 1).padStart(3, '0')}`,
      projectName: `Project ${i + 1}`,
      datasheetId: `ds-${checkListId.slice(0, 6)}-${i + 1}`,
      status: 'PENDING',
      fileUrl: null,
      errorMessage: null,
      retryCount: 0,
      updatedAt: new Date().toISOString()
    }))
    return {
      checkListId,
      reportNo,
      total: projectCount,
      success: 0,
      failed: 0,
      generating: 0,
      pending: projectCount,
      status: 'PENDING',
      mergedPdfUrl: null,
      items: projects
    }
  }

  /* ---------------- Mock generation ---------------- */
  function startMockGenerate() {
    const id = Math.random().toString(16).slice(2, 10)
    const reportNo = `87.405.26.${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}.01`
    const projectCount = 5 + Math.floor(Math.random() * 6)
    const task = createTask(id, reportNo, projectCount)
    taskList.value.unshift(task)
    expandedKeys.value = [id]

    simulateOneByOne(task)
  }

  function simulateOneByOne(task) {
    let cursor = 0
    const tick = () => {
      if (cursor >= task.items.length) {
        finishTask(task)
        return
      }
      const item = task.items[cursor]
      item.status = 'GENERATING'
      item.updatedAt = new Date().toISOString()
      task.generating += 1
      task.pending -= 1
      task.status = 'GENERATING'

      const delay = 200 + Math.random() * 600
      setTimeout(() => {
        const roll = Math.random()
        if (roll < 0.8) {
          item.status = 'SUCCESS'
          item.fileUrl = `/mock/files/${item.datasheetId}.docx`
          task.success += 1
        } else {
          item.status = 'FAILED'
          item.errorMessage = pickRandomError()
          task.failed += 1
        }
        task.generating -= 1
        item.updatedAt = new Date().toISOString()
        recalcStatus(task)
        cursor += 1
        tick()
      }, delay)
    }
    tick()
  }

  function pickRandomError() {
    const errors = [
      "Template render failed: missing field 'fiberContent'",
      'Word generation timeout after 30s',
      'Object storage upload failed: 503',
      'Invalid project data: composition is empty'
    ]
    return errors[Math.floor(Math.random() * errors.length)]
  }

  function recalcStatus(task) {
    if (task.success + task.failed < task.total) {
      task.status = 'GENERATING'
      return
    }
    if (task.failed === 0) task.status = 'SUCCESS'
    else if (task.success === 0) task.status = 'FAILED'
    else task.status = 'PARTIAL_FAILED'
  }

  function finishTask(task) {
    recalcStatus(task)
    if (task.success > 0) {
      task.status = 'MERGING'
      setTimeout(() => {
        task.mergedPdfUrl = `/mock/files/merged-${task.checkListId}.pdf`
        task.status = task.failed === 0 ? 'MERGED' : 'PARTIAL_FAILED'
        ElMessage.success(`Task ${task.reportNo} merged PDF ready`)
      }, 800)
    } else {
      ElMessage.error(`Task ${task.reportNo} failed entirely`)
    }
  }

  /* ---------------- Interactions ---------------- */
  function handleExpandChange(row, expandedRows) {
    expandedKeys.value = expandedRows.map(r => r.checkListId)
  }

  function toggleExpand(row) {
    const idx = expandedKeys.value.indexOf(row.checkListId)
    if (idx >= 0) expandedKeys.value.splice(idx, 1)
    else expandedKeys.value.push(row.checkListId)
  }

  function openFile(url) {
    ElMessage.info(`Open file: ${url} (mock)`)
  }

  function openMergedPdf(row) {
    ElMessage.info(`Open merged PDF: ${row.mergedPdfUrl} (mock)`)
  }

  function retryItem(item) {
    item.status = 'GENERATING'
    item.errorMessage = null
    item.retryCount += 1
    item.updatedAt = new Date().toISOString()

    const task = taskList.value.find(t => t.items.includes(item))
    if (task) recalcAggregates(task)

    setTimeout(() => {
      if (Math.random() < 0.8) {
        item.status = 'SUCCESS'
        item.fileUrl = `/mock/files/${item.datasheetId}.docx`
        ElMessage.success(`${item.projectName} retry succeeded`)
      } else {
        item.status = 'FAILED'
        item.errorMessage = pickRandomError()
        ElMessage.error(`${item.projectName} retry failed again`)
      }
      item.updatedAt = new Date().toISOString()
      if (task) {
        recalcAggregates(task)
        recalcStatus(task)
      }
    }, 600)
  }

  function recalcAggregates(task) {
    task.success = task.items.filter(i => i.status === 'SUCCESS').length
    task.failed = task.items.filter(i => i.status === 'FAILED').length
    task.generating = task.items.filter(i => i.status === 'GENERATING').length
    task.pending = task.items.filter(i => i.status === 'PENDING').length
  }

  function clearAll() {
    taskList.value = []
    expandedKeys.value = []
  }

  onBeforeUnmount(() => {
  activeConnections.forEach((_, id) => detachTaskStream(id))
})

</script>
<style scoped>
  /* 整体：flex 两栏，占满整页 */
  .datasheetDemo {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
    padding: 16px;
    background: #f5f7fa;
  }

  /* 左侧栏：sticky，跟随滚动但不脱离布局 */
  .sidePanel {
    position: sticky;
    top: 16px;
    flex: 0 0 180px; /* 固定宽 180px，不伸不缩 */
    width: 180px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
  }

  /* 右侧主区：占满剩余宽度 */
  .mainContent {
    flex: 1 1 auto;
    min-width: 0; /* 防止内容撑破 flex */
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    box-sizing: border-box;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

  /* 顶部标题行：现在放在右侧主区顶部更好，或者单独一行 */
  .headerRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

    .headerRow h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }

  .headerActions {
    display: flex;
    gap: 12px;
  }

  .sidePanelTitle {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .summaryItem {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #606266;
    margin-bottom: 6px;
  }

  .summaryValue {
    font-weight: 600;
    color: #303133;
  }

    .summaryValue.success {
      color: #67c23a;
    }

    .summaryValue.danger {
      color: #f56c6c;
    }

  .progressText {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .subTableWrapper {
    padding: 12px 20px;
    background: #fafafa;
  }

  .subHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-weight: 600;
    color: #303133;
    font-size: 13px;
  }

  .errorText {
    color: #f56c6c;
    font-size: 12px;
  }

  .attachBar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .hintText {
    font-size: 12px;
    color: #909399;
  }
</style>
