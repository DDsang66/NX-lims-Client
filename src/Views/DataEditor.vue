<template>
  <div class="datasheet-editor-layout">
    <!-- ============ 左侧 30%：任务列表 ============ -->
    <el-card class="left-panel"
             shadow="never"
             :body-style="{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column' }">
      <template #header>
        <div class="panel-header">
          <span class="panel-title">
            <el-icon><List /></el-icon>
            Datasheet Tasks
          </span>
          <el-button type="primary"
                     size="small"
                     text
                     :loading="loadingTasks"
                     @click="showAttachDialog = true">
            + Attach
          </el-button>
          <el-button type="info" size="small" text @click="refreshAll">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="summary-bar">
        <div class="summary-item">
          <span class="label">Total</span>
          <span class="value">{{ summary.total }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Pending</span>
          <span class="value warning">{{ summary.pending }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Saved</span>
          <span class="value success">{{ summary.saved }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Done</span>
          <span class="value primary">{{ summary.done }}</span>
        </div>
      </div>

      <div class="filter-bar">
        <el-input v-model="keyword"
                  size="small"
                  clearable
                  placeholder="Report No / CheckList ID">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="statusFilter"
                   size="small"
                   placeholder="All status"
                   style="margin-top: 6px; width: 100%">
          <el-option label="All status" value="" />
          <el-option label="Pending" value="Pending" />
          <el-option label="Saved" value="Saved" />
          <el-option label="Done" value="Done" />
        </el-select>
      </div>

      <!-- ============ 扁平 datasheet 卡片列表 ============ -->
      <el-scrollbar class="task-scroll">
        <div v-if="flatDatasheetList.length > 0" class="datasheet-items">
          <div v-for="entry in flatDatasheetList"
               :key="entry.item.datasheetId"
               class="datasheet-item"
               :class="{ 'datasheet-selected': currentDatasheetId === entry.item.datasheetId }"
               @click="openItem(entry.task, entry.item)">

            <div class="datasheet-item-header">
              <div class="datasheet-select-indicator">
                <span class="datasheet-name">{{ entry.item.testItemId || '—' }}</span>
              </div>
              <el-tag :type="statusTagType(entry.item.status)" size="small" effect="light">
                {{ entry.item.status }}
              </el-tag>
            </div>

            <div class="datasheet-item-body">
              <div class="datasheet-field">
                <span class="field-label">Report:</span>
                <span class="field-value">{{ entry.item.reportNo || entry.task.reportNo || '—' }}</span>
              </div>
              <div class="datasheet-field">
                <span class="field-label">CheckList:</span>
                <span class="field-value">{{ shortId(entry.task.checkListId) }}</span>
              </div>
              <div class="datasheet-field">
                <span class="field-label">ModelKey:</span>
                <span class="field-value">{{ entry.item.modelKey || '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-else
                  description="No tasks. Click Attach to load."
                  :image-size="60" />
      </el-scrollbar>
    </el-card>

    <!-- ============ 右侧 70%：工作区 ============ -->
    <div class="right-panel">
      <!-- 顶部控制栏 -->
      <el-card class="control-bar"
               shadow="never"
               :body-style="{
          padding: '0 20px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }">
        <el-input v-model="searchText"
                  placeholder="输入 TestItemId / DatasheetId / ReportNo"
                  size="large"
                  clearable
                  style="flex: 1; max-width: 420px">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" size="large" @click="onSelectDocument">
          <el-icon style="margin-right: 6px"><Select /></el-icon>
          Select
        </el-button>
        <el-button type="success"
                   size="large"
                   :disabled="!documentUrl || currentItemStatus === STATUS.DONE"
                   :loading="savingCurrent"
                   @click="saveToBackend">
          <el-icon style="margin-right: 6px"><Document /></el-icon>
          Save
        </el-button>
        <!-- Done 按钮 -->
        <el-button type="warning"
                   size="large"
                   :disabled="!currentDatasheetId || currentItemStatus === STATUS.DONE"
                   :loading="markingDone"
                   @click="markAsDone">
          <el-icon style="margin-right: 6px"><CircleCheck /></el-icon>
          Done
        </el-button>
      </el-card>

      <!-- 编辑器卡片 -->
      <el-card class="editor-card"
               shadow="never"
               :body-style="{
          padding: '0',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }">
        <template #header>
          <div class="editor-header">
            <el-icon><Document /></el-icon>
            <span class="editor-title">Work Area</span>
            <el-tag v-if="activeDocumentTitle" size="small" type="info" effect="plain">
              {{ activeDocumentTitle }}
            </el-tag>
            <!-- 当前文档状态 -->
            <el-tag v-if="currentItemStatus"
                    size="small"
                    :type="statusTagType(currentItemStatus)"
                    effect="dark">
              {{ currentItemStatus }}
            </el-tag>
            <!-- 加载中提示 -->
            <el-tag v-if="loadingDocument" size="small" type="warning" effect="plain">
              Loading...
            </el-tag>
          </div>
        </template>

        <div class="editor-body">
          <div v-if="documentUrl"
               id="onlyoffice-word-preview"
               class="onlyoffice-container"></div>
          <el-empty v-else
                    description="No file to preview. Select a task or click Select." />
        </div>
      </el-card>
    </div>

    <!-- Attach Dialog -->
    <el-dialog v-model="showAttachDialog"
               title="Attach Task"
               width="440px"
               @closed="attachCheckListId = ''">
      <el-form label-width="40%">
        <el-form-item label="CheckList ID" required>
          <el-input v-model="attachCheckListId"
                    placeholder="请输入 Checklist GUID"
                    clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAttachDialog = false">取消</el-button>
        <el-button type="primary"
                   :loading="loadingTasks"
                   @click="attachRealTask">
          加载
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import {
    ref,
    computed,
    onBeforeUnmount,
    onMounted,
    nextTick
  } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    List,
    Search,
    Select,
    Document,
    Refresh,
    CircleCheck
  } from '@element-plus/icons-vue'
  import request from '@/utils/request'
  import { API_BASE } from '@/utils/config.js'
  import loadOnlyOfficeScript from '@/utils/loadOnlyOffice.js'

  /* ============================================================
   *  调试
   * ============================================================ */
  const DEBUG = true
  function log(...args) { if (DEBUG) console.log('[DataEditor]', ...args) }
  function warn(...args) { if (DEBUG) console.warn('[DataEditor]', ...args) }

  /* ============================================================
   *  状态常量
   * ============================================================ */
  const STATUS = {
    PENDING: 'Pending',
    SAVED: 'Saved',
    DONE: 'Done'
  }

  const LOCK_AFTER_DONE = true

  /* ============================================================
   *  加载超时 / 重试参数
   * ============================================================ */
  const LOAD_TIMEOUT_MS = 15000
  const MAX_LOAD_ATTEMPTS = 2

  /* ============================================================
   *  一、状态
   * ============================================================ */
  const taskList = ref([])
  const keyword = ref('')
  const statusFilter = ref('')
  const selectedTaskId = ref('')
  const loadingTasks = ref(false)
  const markingDone = ref(false)
  const loadingDocument = ref(false)

  const savingMap = ref(new Map())

  const showAttachDialog = ref(false)
  const attachCheckListId = ref('')

  const searchText = ref('')

  const activeDocumentTitle = ref('')
  const documentUrl = ref('')
  const currentDatasheetId = ref('')

  /* ============================================================
   *  状态工具方法
   * ============================================================ */
  function getCurrentStatus(datasheetId) {
    if (!datasheetId) return ''
    for (const task of taskList.value) {
      const item = (task.items || []).find(i => i.datasheetId === datasheetId)
      if (item) return item.status
    }
    return ''
  }

  function setItemStatus(datasheetId, status) {
    if (!datasheetId) return
    for (const task of taskList.value) {
      const item = (task.items || []).find(i => i.datasheetId === datasheetId)
      if (item) {
        if (item.status === status) return
        log('[status]', datasheetId, item.status, '→', status)
        item.status = status
        return
      }
    }
  }

  const currentItemStatus = computed(() => {
    if (!currentDatasheetId.value) return ''
    return getCurrentStatus(currentDatasheetId.value)
  })

  function normalizeStatus(s) {
    if (s === 'Done') return STATUS.DONE
    if (s === 'Saved') return STATUS.SAVED
    return STATUS.PENDING
  }

  /* ============================================================
   *  保存状态（按 datasheetId）
   * ============================================================ */
  function isSaving(datasheetId) {
    return savingMap.value.get(datasheetId) === true
  }

  function setSaving(datasheetId, val) {
    const m = new Map(savingMap.value)
    m.set(datasheetId, val)
    savingMap.value = m
  }

  const savingCurrent = computed(() =>
    currentDatasheetId.value ? isSaving(currentDatasheetId.value) : false
  )

  /* ============================================================
   *  二、后端接口调用
   * ============================================================ */
  async function fetchDatasheetsByChecklist(checklistId) {
    log('fetchDatasheetsByChecklist', checklistId)
    const res = await request.get(`/dataeditor/get/${checklistId}`)
    const payload = res?.data?.value ?? res?.data ?? res?.value ?? res
    if (Array.isArray(payload)) return payload
    if (payload && Array.isArray(payload.value)) return payload.value
    if (payload && Array.isArray(payload.data)) return payload.data
    return []
  }

  function buildPreviewUrl(rawUrl) {
    if (!rawUrl) return ''
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl

    const clean = rawUrl.replace(/\\/g, '/').replace(/^\/+/, '')
    const [path, query] = clean.split('?')

    const encodedPath = path
      .split('/')
      .map(seg => encodeURIComponent(seg))
      .join('/')

    const full = `${API_BASE}/dataeditor/datasheet/download/${encodedPath}`
    return query ? `${full}?${query}` : full
  }

  function mapDtosToTask(checklistId, dtos) {
    if (!dtos || !dtos.length) return null

    const first = dtos[0]
    const items = dtos.map(dto => ({
      datasheetId: dto.id || '',
      batchId: dto.bacthId || '',
      reportNo: dto.reportNumber || '',
      testItemId: dto.testItemId || '',
      modelKey: dto.modelKey || '',
      rawUrl: dto.url || '',
      updatedAt: dto.updateTime || new Date().toISOString(),
      version: dto.editorVersion ?? dto.updateTime ?? null,
      status: normalizeStatus(dto.status === 'Done' ? 'Done' : 'Pending')
    }))

    log('mapDtosToTask', checklistId, 'items=', items.length,
      'versions=', items.map(i => i.version))

    return {
      checkListId: checklistId,
      batchId: first.bacthId || '',
      reportNo: first.reportNumber || '',
      total: items.length,
      status: 'Pending',
      items
    }
  }

  async function refreshAll() {
    if (!taskList.value.length) {
      ElMessage.info('还没有已加载的任务')
      return
    }
    loadingTasks.value = true
    try {
      const ids = taskList.value.map(t => t.checkListId)
      const results = await Promise.all(
        ids.map(id => fetchDatasheetsByChecklist(id).catch(() => []))
      )
      const newTasks = results
        .map((dtos, idx) => mapDtosToTask(ids[idx], dtos))
        .filter(Boolean)
      taskList.value = newTasks
      ElMessage.success('已刷新')
    } finally {
      loadingTasks.value = false
    }
  }

  /* ============================================================
   *  三、Attach 真实任务
   * ============================================================ */
  async function attachRealTask() {
    const cid = attachCheckListId.value.trim()
    if (!cid) {
      ElMessage.warning('请输入 Checklist ID')
      return
    }
    loadingTasks.value = true
    try {
      const dtos = await fetchDatasheetsByChecklist(cid)
      if (!dtos.length) {
        ElMessage.warning('该 Checklist 下暂无 Datasheet')
        return
      }
      const task = mapDtosToTask(cid, dtos)
      const existingIdx = taskList.value.findIndex(t => t.checkListId === cid)
      if (existingIdx >= 0) taskList.value.splice(existingIdx, 1, task)
      else taskList.value.unshift(task)

      selectedTaskId.value = cid
      showAttachDialog.value = false
      ElMessage.success(`已加载 ${dtos.length} 个 Datasheet`)

      const readyItem = task.items.find(i => i.rawUrl)
      if (readyItem) {
        openItem(task, readyItem)
      }
    } catch (e) {
      console.error(e)
      ElMessage.error(e?.response?.data?.error || '加载失败')
    } finally {
      loadingTasks.value = false
    }
  }

  /* ============================================================
   *  四、计算属性
   * ============================================================ */
  const filteredTaskList = computed(() => {
    const kw = keyword.value.trim().toLowerCase()
    return taskList.value.filter(t => {
      if (statusFilter.value && t.status !== statusFilter.value) return false
      if (kw) {
        const hitTask =
          (t.reportNo || '').toLowerCase().includes(kw) ||
          (t.checkListId || '').toLowerCase().includes(kw)
        const hitItem = (t.items || []).some(
          i =>
            (i.testItemId || '').toLowerCase().includes(kw) ||
            (i.datasheetId || '').toLowerCase().includes(kw)
        )
        if (!hitTask && !hitItem) return false
      }
      return true
    })
  })

  const flatDatasheetList = computed(() => {
    const list = []
    filteredTaskList.value.forEach(task => {
      (task.items || []).forEach(item => {
        list.push({ task, item })
      })
    })
    list.sort((a, b) => {
      const ta = String(a.item.testItemId || '')
      const tb = String(b.item.testItemId || '')
      return ta.localeCompare(tb, undefined, {
        numeric: true,
        sensitivity: 'base'
      })
    })
    return list
  })

  const summary = computed(() => {
    let total = 0
    let pending = 0
    let saved = 0
    let done = 0
    taskList.value.forEach(t => {
      (t.items || []).forEach(i => {
        total++
        if (i.status === STATUS.DONE) done++
        else if (i.status === STATUS.SAVED) saved++
        else pending++
      })
    })
    return { total, pending, saved, done }
  })

  function statusTagType(status) {
    switch (status) {
      case STATUS.DONE: return 'primary'
      case STATUS.SAVED: return 'success'
      case STATUS.PENDING: return 'warning'
      default: return 'info'
    }
  }
  function shortId(id) {
    return id ? String(id).slice(0, 8) : '—'
  }

  /* ============================================================
   *  五、编辑器缓存
   * ============================================================ */
  const editorCache = new Map()
  if (typeof window !== 'undefined') {
    window.__editorCache = editorCache
  }

  /**
   * 生成 documentKey
   * - unique=false：版本 key（命中 DS 缓存，快）
   * - unique=true ：追加随机后缀（强制 DS 重新拉文件）
   */
  function buildDocKey(datasheetId, version, unique = false) {
    const safeId = String(datasheetId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
    let v = '0'
    if (version !== null && version !== undefined && version !== '') {
      if (typeof version === 'number') {
        v = String(version)
      } else {
        const ts = new Date(version).getTime()
        v = Number.isFinite(ts) ? String(ts) : String(version)
      }
    }
    if (unique) {
      const uniq = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      return `ds_${safeId}_${v}_${uniq}`
    }
    return `ds_${safeId}_${v}`
  }

  function pickVersion(dto) {
    if (!dto) return null
    return dto.editorVersion ?? dto.updateTime ?? null
  }

  function getOrCreateCacheEntry(datasheetId, url, title, version) {
    if (!editorCache.has(datasheetId)) {
      const key = buildDocKey(datasheetId, version, false)
      editorCache.set(datasheetId, {
        datasheetId,
        documentUrl: url,
        documentKey: key,
        title,
        version: version ?? null,
        // ★ 新增字段
        needsRefetch: true,        // 首次进入默认需要重拉（保守）
        saving: false,
        editedDuringSave: false,
        lastSavedAt: 0
      })
      log('[cache] created', datasheetId, 'key=', key, 'version=', version)
      return editorCache.get(datasheetId)
    }

    const entry = editorCache.get(datasheetId)
    entry.documentUrl = url
    entry.title = title

    if (version !== null && version !== undefined && entry.version !== version) {
      const oldKey = entry.documentKey
      entry.version = version
      entry.documentKey = buildDocKey(datasheetId, version, false)
      log('[cache] version changed', datasheetId, `${oldKey} → ${entry.documentKey}`)
    }
    return entry
  }

  /* ============================================================
   *  六、事件抑制
   * ============================================================ */
  let suppressStateChange = false

  function withSuppress(fn) {
    suppressStateChange = true
    try {
      fn()
    } finally {
      setTimeout(() => { suppressStateChange = false }, 800)
    }
  }

  /* ============================================================
   *  七、打开文档
   * ============================================================ */
  function openItem(task, item) {
    if (!task || !item) return
    selectedTaskId.value = task.checkListId

    if (!item.rawUrl) {
      ElMessage.warning('该 Datasheet 暂无文件')
      return
    }

    openDocument(
      item.datasheetId,
      buildPreviewUrl(item.rawUrl),
      `${item.testItemId || item.datasheetId}.docx`,
      item.version
    )
  }

  function handleTaskClick(task) {
    if (!task) return
    selectedTaskId.value = task.checkListId

    const readyItem = task.items.find(i => i.rawUrl)
    if (readyItem) {
      openItem(task, readyItem)
    } else {
      documentUrl.value = ''
      currentDatasheetId.value = ''
      activeDocumentTitle.value = '暂无可用文档'
    }
  }

  async function openDocument(datasheetId, url, title, version) {
    const sameDoc = currentDatasheetId.value === datasheetId

    if (!sameDoc) {
      loadAttempt = 0
      loadingDocument.value = true
    }

    log('[openDocument]', datasheetId, 'version=', version, 'sameDoc=', sameDoc)

    const entry = getOrCreateCacheEntry(datasheetId, url, title, version)

    // ★ 若正在保存，暂不切换（避免读到中间态）
    if (entry.saving) {
      ElMessage.info('文档正在保存，请稍候再切换')
      return
    }

    // ★ 需要重拉：唯一 key + 从后端拉最新 URL
    if (entry.needsRefetch) {
      log('[openDocument] needsRefetch → refetch + unique key')
      try {
        const fresh = await refetchDatasheet(datasheetId)
        if (fresh && fresh.url) {
          entry.documentUrl = fresh.url
          entry.version = fresh.version
        }
      } catch (e) {
        warn('[openDocument] refetch failed', e)
      }
      entry.documentKey = buildDocKey(datasheetId, entry.version, true)
      entry.needsRefetch = false

      currentDatasheetId.value = datasheetId
      activeDocumentTitle.value = entry.title
      documentUrl.value = entry.documentUrl

      destroyEditor()
      await nextTick()
      loadAttempt = 0
      initWordPreview(entry)
      return
    }

    currentDatasheetId.value = datasheetId
    activeDocumentTitle.value = entry.title
    documentUrl.value = entry.documentUrl

    // 同一文档且编辑器已就绪 → refreshFile（命中缓存）
    if (sameDoc && wordEditor && editorReady) {
      log('[openDocument] sameDoc → refreshFile', entry.documentKey)
      loadingDocument.value = false
      try {
        withSuppress(() => {
          wordEditor.refreshFile({ key: entry.documentKey })
        })
      } catch (err) {
        warn('[openDocument] refreshFile failed', err)
      }
      return
    }

    // 换文档 → 销毁 + 重建
    nextTick(() => {
      initWordPreview(entry)
    })
  }

  /* ============================================================
   *  八、Select 按钮
   * ============================================================ */
  function onSelectDocument() {
    const kw = searchText.value.trim().toLowerCase()
    if (!kw) {
      if (selectedTaskId.value) {
        const t = taskList.value.find(x => x.checkListId === selectedTaskId.value)
        if (t) handleTaskClick(t)
      } else if (taskList.value.length) {
        handleTaskClick(taskList.value[0])
      } else {
        ElMessage.warning('请先 Attach 一个任务')
      }
      return
    }

    let matchedTask = null
    let matchedItem = null
    for (const t of taskList.value) {
      const hit = (t.items || []).find(
        i =>
          (i.testItemId || '').toLowerCase().includes(kw) ||
          (i.datasheetId || '').toLowerCase().includes(kw)
      )
      if (hit) {
        matchedTask = t
        matchedItem = hit
        break
      }
      if (
        (t.reportNo || '').toLowerCase().includes(kw) ||
        (t.checkListId || '').toLowerCase().includes(kw)
      ) {
        matchedTask = t
        break
      }
    }

    if (!matchedTask) {
      ElMessage.warning(`未找到匹配 "${kw}" 的任务或 Datasheet`)
      return
    }

    if (matchedItem && matchedItem.rawUrl) {
      openItem(matchedTask, matchedItem)
      ElMessage.success(`已打开 ${matchedItem.testItemId || matchedItem.datasheetId}`)
    } else {
      handleTaskClick(matchedTask)
      ElMessage.success(`已选中任务 ${matchedTask.reportNo || matchedTask.checkListId}`)
    }
  }

  /* ============================================================
   *  九、保存到后端
   * ============================================================ */
  function triggerEditorSave() {
    if (!wordEditor) return false
    if (typeof wordEditor.requestSave === 'function') {
      log('[save] requestSave()')
      wordEditor.requestSave()
      return true
    }
    if (typeof wordEditor.serviceCommand === 'function') {
      log('[save] serviceCommand(forcesave)')
      wordEditor.serviceCommand('forcesave')
      return true
    }
    if (typeof wordEditor.Save === 'function') {
      log('[save] Save()')
      wordEditor.Save()
      return true
    }
    return false
  }

  async function saveToBackend() {
    log('[save] === start ===')
    if (!currentDatasheetId.value) {
      ElMessage.warning('没有打开的文档')
      return
    }
    const targetDatasheetId = currentDatasheetId.value
    const entry = editorCache.get(targetDatasheetId)
    if (!entry) return

    if (isSaving(targetDatasheetId)) {
      log('[save] already saving, skip')
      return
    }

    if (!wordEditor) {
      ElMessage.warning('编辑器未初始化')
      return
    }
    if (!triggerEditorSave()) {
      ElMessage.warning('当前 Document Server 不支持主动保存')
      return
    }

    const targetTaskId = selectedTaskId.value
    const beforeVersion = entry.version

    log('[save] target=', targetDatasheetId, 'beforeVersion=', beforeVersion)

    // ★ 保存开始：立即标记 needsRefetch，并锁定状态事件
    entry.saving = true
    entry.needsRefetch = true
    entry.editedDuringSave = false
    setSaving(targetDatasheetId, true)
    suppressStateChange = true

    ElMessage.info('正在保存，请稍候...')

    try {
      const startTs = Date.now()
      const maxWait = 30000
      let latestDto = null
      let pollCount = 0

      await new Promise(r => setTimeout(r, 2000))

      const fileUrl = entry.documentUrl
      log('[save] trigger callback:', targetDatasheetId)

      try {
        await request.post(
          `/dataeditor/onlyoffice/callback?datasheetId=${encodeURIComponent(targetDatasheetId)}`,
          { status: 6, url: fileUrl }
        )
      } catch (err) {
        warn('[save] callback trigger failed:', err)
        ElMessage.error('触发回调失败')
        // ★ 失败回滚
        entry.saving = false
        entry.needsRefetch = false
        setSaving(targetDatasheetId, false)
        suppressStateChange = false
        return
      }

      while (Date.now() - startTs < maxWait) {
        await new Promise(r => setTimeout(r, 1000))
        pollCount++
        try {
          const res = await request.get(`/dataeditor/get/${targetTaskId}`)
          const dtos = res?.data?.value ?? res?.data ?? []
          const dto = dtos.find(d => d.id === targetDatasheetId)
          if (dto) {
            const v = pickVersion(dto)
            log(`[save] poll#${pollCount} v=`, v, ', before=', beforeVersion)
            if (v !== null && v !== undefined && v !== beforeVersion) {
              latestDto = dto
              break
            }
          }
        } catch (err) {
          warn('[save] poll error', err)
        }
      }

      if (!latestDto) {
        warn('[save] timeout')
        ElMessage.warning('保存确认超时，请稍后刷新')
        // ★ 失败回滚
        entry.saving = false
        entry.needsRefetch = false
        setSaving(targetDatasheetId, false)
        suppressStateChange = false
        return
      }

      const newVersion = pickVersion(latestDto)
      const newRawUrl = latestDto.url || ''

      log('[save] update entry:', beforeVersion, '→', newVersion)

      entry.version = newVersion
      entry.documentKey = buildDocKey(targetDatasheetId, newVersion, false)
      if (newRawUrl) entry.documentUrl = buildPreviewUrl(newRawUrl)

      for (const t of taskList.value) {
        const item = (t.items || []).find(i => i.datasheetId === targetDatasheetId)
        if (item) {
          item.updatedAt = latestDto.updateTime || item.updatedAt
          if (newRawUrl) item.rawUrl = newRawUrl
          if (newVersion !== null) item.version = newVersion
          break
        }
      }

      if (getCurrentStatus(targetDatasheetId) !== STATUS.DONE) {
        setItemStatus(targetDatasheetId, STATUS.SAVED)
      }

      // ★ 保存成功：清 needsRefetch，记录 lastSavedAt
      entry.saving = false
      entry.needsRefetch = false
      entry.lastSavedAt = Date.now()
      setSaving(targetDatasheetId, false)
      suppressStateChange = false

      // ★ 保存期间用户又改了 → 回置 needsRefetch
      if (entry.editedDuringSave) {
        entry.editedDuringSave = false
        entry.needsRefetch = true
        if (getCurrentStatus(targetDatasheetId) === STATUS.SAVED) {
          setItemStatus(targetDatasheetId, STATUS.PENDING)
        }
        log('[save] editedDuringSave → needsRefetch=true, status=Pending')
      }

      // ★ 当前仍打开该文档：重建，让 DS 用新 key 拉新文件
      if (currentDatasheetId.value === targetDatasheetId && wordEditor) {
        await new Promise(r => setTimeout(r, 500))
        entry.documentKey = buildDocKey(targetDatasheetId, newVersion, true)
        destroyEditor()
        await nextTick()
        loadAttempt = 0
        initWordPreview(entry)
      }

      ElMessage.success('已保存到后端')
    } catch (e) {
      console.error('[save] exception', e)
      ElMessage.error('保存失败')
      // ★ 异常回滚
      entry.saving = false
      entry.needsRefetch = false
      setSaving(targetDatasheetId, false)
      suppressStateChange = false
    }
  }

  /* ============================================================
   *  十、标记 Done（走后端）
   * ============================================================ */
  async function markAsDone() {
    if (!currentDatasheetId.value) {
      ElMessage.warning('没有打开的文档')
      return
    }
    if (currentItemStatus.value === STATUS.DONE) {
      ElMessage.info('该文档已完成')
      return
    }

    if (currentItemStatus.value === STATUS.PENDING) {
      try {
        await ElMessageBox.confirm(
          '当前文档有未保存的更改，是否先保存再标记为 Done？',
          '提示',
          { confirmButtonText: '先保存', cancelButtonText: '取消', type: 'warning' }
        )
      } catch {
        return
      }
      await saveToBackend()
      if (currentItemStatus.value !== STATUS.SAVED) return
    }

    markingDone.value = true
    const targetDatasheetId = currentDatasheetId.value
    try {
      await request.post(
        `/dataeditor/mark-done/${encodeURIComponent(targetDatasheetId)}`
      )
      setItemStatus(targetDatasheetId, STATUS.DONE)

      // ★ Done 后强制下次重拉，避免外部改动导致的缓存不一致
      const entry = editorCache.get(targetDatasheetId)
      if (entry) {
        entry.needsRefetch = true
      }

      ElMessage.success('已标记为 Done')

      if (LOCK_AFTER_DONE && entry && currentDatasheetId.value === targetDatasheetId) {
        destroyEditor()
        await nextTick()
        loadAttempt = 0
        // 直接重拉 + 唯一 key
        try {
          const fresh = await refetchDatasheet(targetDatasheetId)
          if (fresh && fresh.url) {
            entry.documentUrl = fresh.url
            entry.version = fresh.version
          }
        } catch (e) {
          warn('[markDone] refetch failed', e)
        }
        entry.documentKey = buildDocKey(targetDatasheetId, entry.version, true)
        entry.needsRefetch = false
        initWordPreview(entry)
      }
    } catch (e) {
      console.error('[markDone]', e)
      ElMessage.error(e?.response?.data?.error || '标记失败')
    } finally {
      markingDone.value = false
    }
  }

  /* ============================================================
   *  十一、OnlyOffice
   * ============================================================ */
  let wordEditor = null
  let editorReady = false
  let loadTimer = null
  let loadAttempt = 0

  function clearLoadTimer() {
    if (loadTimer) {
      clearTimeout(loadTimer)
      loadTimer = null
    }
  }

  /** 向后端重新拉 URL / 版本 */
  async function refetchDatasheet(datasheetId) {
    for (const t of taskList.value) {
      const item = (t.items || []).find(i => i.datasheetId === datasheetId)
      if (!item) continue

      try {
        const dtos = await fetchDatasheetsByChecklist(t.checkListId)
        const dto = dtos.find(d => d.id === datasheetId)
        if (!dto) return null

        const url = buildPreviewUrl(dto.url || '')
        const version = pickVersion(dto)

        item.rawUrl = dto.url || item.rawUrl
        item.version = version
        item.updatedAt = dto.updateTime || item.updatedAt

        return { url, version }
      } catch (e) {
        warn('[refetchDatasheet] failed', e)
        return null
      }
    }
    return null
  }

  /**
   * 加载失败统一处理：
   * - 第 1 次：重拉 + 唯一 key
   * - 第 2 次：再重拉 + 唯一 key
   * - 仍失败：清空视图
   */
  async function handleLoadFailure(entry, reason) {
    clearLoadTimer()

    if (entry.datasheetId !== currentDatasheetId.value) return

    loadAttempt += 1
    warn(`[loadFailure] attempt=${loadAttempt} reason=${reason}`, entry.datasheetId)

    destroyEditor()

    if (loadAttempt <= MAX_LOAD_ATTEMPTS) {
      // ★ 每次都重拉 + 唯一 key
      try {
        const fresh = await refetchDatasheet(entry.datasheetId)
        if (fresh && fresh.url) {
          entry.documentUrl = fresh.url
          entry.version = fresh.version
        }
      } catch (e) {
        warn('[loadFailure] refetch failed', e)
      }
      entry.documentKey = buildDocKey(entry.datasheetId, entry.version, true)
      entry.needsRefetch = false

      await nextTick()
      loadingDocument.value = true
      initWordPreview(entry)
      return
    }

    loadAttempt = 0
    loadingDocument.value = false
    ElMessage.error('文档加载失败，请稍后重试或联系管理员')
    documentUrl.value = ''
    currentDatasheetId.value = ''
    activeDocumentTitle.value = '加载失败'
  }

  async function initWordPreview(entry) {
    log('[init] start for', entry?.datasheetId, 'key =', entry?.documentKey)

    console.log('[init] DS url =', entry.documentUrl)
    console.log('[init] DS key =', entry.documentKey)

    if (!entry || !entry.documentUrl) {
      destroyEditor()
      loadingDocument.value = false
      return
    }
    if (entry.datasheetId !== currentDatasheetId.value) {
      log('[init] skip, not current datasheet')
      return
    }

    destroyEditor()
    loadingDocument.value = true
    await new Promise(r => setTimeout(r, 200))
    await nextTick()

    const container = document.getElementById('onlyoffice-word-preview')
    if (!container) {
      warn('[init] container not found')
      loadingDocument.value = false
      return
    }

    log('[init] creating DocsAPI.DocEditor key =', entry.documentKey)

    const isDone = getCurrentStatus(entry.datasheetId) === STATUS.DONE
    const canEdit = !(LOCK_AFTER_DONE && isDone)

    const config = {
      style: { height: '100%', width: '100%' },
      document: {
        title: entry.title || '预览文档.docx',
        url: entry.documentUrl,
        fileType: 'docx',
        key: entry.documentKey,
        permissions: { edit: canEdit, download: true }
      },
      documentType: 'word',
      editorConfig: {
        mode: canEdit ? 'edit' : 'view',
        lang: 'en',
        callbackUrl: `${API_BASE}/dataeditor/onlyoffice/callback?datasheetId=${encodeURIComponent(
          entry.datasheetId
        )}`,
        customization: {
          uiTheme: 'theme-dark',
          comments: false,
          feedback: false,
          forcesave: false,
          autosave: false
        }
      },
      events: {
        onDocumentReady: () => {
          editorReady = true
          loadingDocument.value = false
          clearLoadTimer()
          loadAttempt = 0
          log('[ready] key =', entry.documentKey)
        },

        onDocumentStateChange: (event) => {
          if (suppressStateChange) return
          const dsId = currentDatasheetId.value
          if (!dsId) return
          if (LOCK_AFTER_DONE && getCurrentStatus(dsId) === STATUS.DONE) return

          const cur = editorCache.get(dsId)
          if (!cur) return

          if (event && event.data === true) {
            // 保存期间收到编辑 → 只记录标记
            if (cur.saving) {
              cur.editedDuringSave = true
              log('[onDocumentStateChange] during save → editedDuringSave')
              return
            }

            if (getCurrentStatus(dsId) === STATUS.PENDING) return
            log('[onDocumentStateChange] modified → Pending', dsId)
            setItemStatus(dsId, STATUS.PENDING)
            // 用户编辑即代表前端领先后端，缓存有效
            cur.needsRefetch = false
          }
        },

        onRequestRefreshFile: () => {
          if (!editorReady) return
          const e = editorCache.get(currentDatasheetId.value)
          if (!e) return
          // ★ needsRefetch 时不走 refreshFile
          if (e.needsRefetch) {
            log('[onRequestRefreshFile] needsRefetch, skip refreshFile')
            return
          }
          try {
            withSuppress(() => {
              wordEditor.refreshFile({ key: e.documentKey })
            })
          } catch (err) {
            warn('[onRequestRefreshFile] refreshFile failed', err)
          }
        },

        onRequestSave: () => {
          log('[onRequestSave] fired')
        },

        onError: (event) => {
          console.error('[onError]', event)
          console.error('[onError] data =', JSON.stringify(event?.data ?? {}, null, 2))
          clearLoadTimer()
          handleLoadFailure(entry, `DS error: ${event?.data?.errorCode ?? 'unknown'}`)
        }
      }
    }

    try {
      wordEditor = new DocsAPI.DocEditor('onlyoffice-word-preview', config)
      window.__editor = wordEditor
    } catch (e) {
      console.error('[init] failed', e)
      handleLoadFailure(entry, 'DocEditor construct failed')
      return
    }

    clearLoadTimer()
    loadTimer = setTimeout(() => {
      if (!editorReady) {
        warn('[timeout] load timed out, key =', entry.documentKey)
        handleLoadFailure(entry, 'Load timeout')
      }
    }, LOAD_TIMEOUT_MS)
  }

  function destroyEditor() {
    clearLoadTimer()
    if (wordEditor) {
      log('[destroy] destroyEditor')
      try { wordEditor.destroyEditor() } catch (e) { }
      wordEditor = null
      window.__editor = null
    }
    editorReady = false
    const container = document.getElementById('onlyoffice-word-preview')
    if (container) container.innerHTML = ''
  }

  /* ============================================================
   *  十二、生命周期
   * ============================================================ */
  onMounted(async () => {
    try {
      await loadOnlyOfficeScript()
      await nextTick()
      log('[mounted] OnlyOffice script loaded')
    } catch (e) {
      console.error('OnlyOffice 脚本加载失败:', e)
    }

    // ★ 刷新后首次：所有从后端拉回的 entry 标记 needsRefetch
    //   因为内存缓存已丢失，无法判断 DS 端缓存是否与 DB 一致
    //   注：editorCache 为空，后续 openItem 时会走 getOrCreateCacheEntry
    //   里面默认 needsRefetch = true
  })

  onBeforeUnmount(() => {
    destroyEditor()
  })
</script>

<style scoped>
  .datasheet-editor-layout {
    display: flex;
    gap: 16px;
    height: calc(100vh - 24px);
    min-height: 600px;
    padding: 12px;
    box-sizing: border-box;
    background: #f5f7fa;
  }

  .left-panel {
    flex: 0 0 24%;
    width: 24%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid #e4e7ed;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    color: #1f2d3d;
  }

  .summary-bar {
    display: flex;
    justify-content: space-around;
    padding: 10px 12px;
    background: #fafafa;
    border-bottom: 1px solid #ebeef5;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
  }

    .summary-item .label {
      color: #909399;
      margin-bottom: 2px;
    }

    .summary-item .value {
      font-weight: 600;
      color: #303133;
    }

      .summary-item .value.warning {
        color: #e6a23c;
      }

      .summary-item .value.success {
        color: #67c23a;
      }

      .summary-item .value.primary {
        color: #409eff;
      }

  .filter-bar {
    padding: 10px 12px;
    border-bottom: 1px solid #ebeef5;
  }

  .task-scroll {
    flex: 1;
    padding: 8px 10px;
  }

  .datasheet-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .datasheet-item {
    border: 1px solid #ebeef5;
    border-radius: 6px;
    padding: 10px 12px;
    background: #fafafa;
    transition: all 0.2s;
    cursor: pointer;
  }

    .datasheet-item:hover {
      border-color: #409eff;
      background: #f0f7ff;
    }

    .datasheet-item.datasheet-selected {
      border-color: #409eff;
      background: #ecf5ff;
      box-shadow: 0 0 0 1px #409eff;
    }

  .datasheet-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .datasheet-select-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .datasheet-name {
    font-weight: 600;
    color: #303133;
    font-size: 14px;
  }

  .datasheet-item-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .datasheet-field {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
    line-height: 1.6;
  }

  .field-label {
    color: #909399;
    white-space: nowrap;
    min-width: 70px;
  }

  .field-value {
    color: #606266;
    word-break: break-all;
  }

  .right-panel {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .control-bar {
    flex: 0 0 10%;
    min-height: 68px;
    border-radius: 12px;
    border: 1px solid #e4e7ed;
  }

  .editor-card {
    flex: 1;
    min-height: 0;
    border-radius: 12px;
    border: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .editor-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    background: #d7d7d7;
    padding: 12px 20px;
    margin: -20px -20px 0 -20px;
  }

  .editor-title {
    flex: 1;
  }

  .editor-body {
    flex: 1;
    position: relative;
    background: #f9fbfd;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .onlyoffice-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }

  ::-webkit-scrollbar-track {
    background: #f5f7fa;
    border-radius: 2px;
  }

  ::-webkit-scrollbar-thumb {
    background: #e0e3e8;
    border-radius: 2px;
  }

    ::-webkit-scrollbar-thumb:hover {
      background: #d0d4db;
    }

    ::-webkit-scrollbar-thumb:active {
      background: #c0c5ce;
    }

  * {
    scrollbar-width: thin;
    scrollbar-color: #e0e3e8 #f5f7fa;
  }
</style>
