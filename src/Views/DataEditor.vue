<!--<template>
  <div class="datasheet-editor-layout">-->
<!-- ============ 左侧 30%：任务列表 ============ -->
<!--<el-card class="left-panel"
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
  </div>-->
<!-- ============ 扁平 datasheet 卡片列表 ============ -->
<!--<el-scrollbar class="task-scroll">
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
</el-card>-->
<!-- ============ 右侧 70%：工作区 ============ -->
<!--<div class="right-panel">-->
<!-- 顶部控制栏 -->
<!--<el-card class="control-bar"
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
             :disabled="!documentUrl"
             :loading="saving"
             @click="saveToBackend">
    <el-icon style="margin-right: 6px"><Document /></el-icon>
    Save
  </el-button>
</el-card>-->
<!-- 编辑器卡片 -->
<!--<el-card class="editor-card"
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
</div>-->
<!-- Attach Dialog -->
<!--<el-dialog v-model="showAttachDialog"
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
  import { ElMessage } from 'element-plus'
  import {
    List,
    Search,
    Select,
    Document,
    Refresh
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
   *  一、状态
   * ============================================================ */
  const taskList = ref([])
  const keyword = ref('')
  const statusFilter = ref('')
  const selectedTaskId = ref('')
  const loadingTasks = ref(false)
  const saving = ref(false)

  const showAttachDialog = ref(false)
  const attachCheckListId = ref('')

  const searchText = ref('')

  const activeDocumentTitle = ref('')
  const documentUrl = ref('')
  const currentDatasheetId = ref('')

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
    const encoded = clean
      .split('/')
      .map(seg => encodeURIComponent(seg))
      .join('/')
    return `${API_BASE}/dataeditor/datasheet/download/${encoded}`
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
      status: 'Pending'
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
        if (i.status === 'Done') done++
        else if (i.status === 'Saved') saved++
        else pending++
      })
    })
    return { total, pending, saved, done }
  })

  function statusTagType(status) {
    switch (status) {
      case 'Done': return 'primary'
      case 'Saved': return 'success'
      case 'Pending': return 'warning'
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

  function buildDocKey(datasheetId, version) {
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
    return `ds_${safeId}_${v}`
  }

  function pickVersion(dto) {
    if (!dto) return null
    return dto.editorVersion ?? dto.updateTime ?? null
  }

  function getOrCreateCacheEntry(datasheetId, url, title, version) {
    if (!editorCache.has(datasheetId)) {
      const key = buildDocKey(datasheetId, version)
      editorCache.set(datasheetId, {
        datasheetId,
        documentUrl: url,
        documentKey: key,
        title,
        version: version ?? null
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
      entry.documentKey = buildDocKey(datasheetId, version)
      log('[cache] version changed', datasheetId, `${oldKey} → ${entry.documentKey}`)
    }
    return entry
  }

  /* ============================================================
   *  六、打开文档
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

  function openDocument(datasheetId, url, title, version) {
    saveSession++
    log('[openDocument]', datasheetId, 'version=', version, 'saveSession=', saveSession)

    const entry = getOrCreateCacheEntry(datasheetId, url, title, version)
    const sameDoc = currentDatasheetId.value === datasheetId

    currentDatasheetId.value = datasheetId
    activeDocumentTitle.value = entry.title
    documentUrl.value = entry.documentUrl

    log('[openDocument] sameDoc=', sameDoc, 'key=', entry.documentKey)

    // 同一文档且编辑器已就绪 → 用 refreshFile 切版本
    if (sameDoc && wordEditor && editorReady) {
      log('[openDocument] sameDoc → refreshFile', entry.documentKey)
      try {
        wordEditor.refreshFile({ key: entry.documentKey })
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
   *  七、Select 按钮
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
   *  八、保存到后端
   * ============================================================ */
  let saveSession = 0

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
    const entry = editorCache.get(currentDatasheetId.value)
    if (!entry) return
    if (!wordEditor) {
      ElMessage.warning('编辑器未初始化')
      return
    }
    if (!triggerEditorSave()) {
      ElMessage.warning('当前 Document Server 不支持主动保存')
      return
    }

    const mySession = ++saveSession
    const targetDatasheetId = currentDatasheetId.value
    const targetTaskId = selectedTaskId.value
    const beforeVersion = entry.version

    log('[save] mySession =', mySession, 'beforeVersion =', beforeVersion)

    saving.value = true
    ElMessage.info('正在保存，请稍候...')

    try {
      const startTs = Date.now()
      const maxWait = 30000
      let latestDto = null
      let pollCount = 0

      // ★ 第 1 步：等几秒，让 DS 有机会把文件写入自己的缓存
      await new Promise(r => setTimeout(r, 2000))

      // ★ 第 2 步：手动触发后端 callback，模拟 DS 行为
      //   url 用后端自己的下载接口（保证后端能下载到文件）
      const callbackUrl = `${API_BASE}/dataeditor/onlyoffice/callback?datasheetId=${encodeURIComponent(targetDatasheetId)}`
      const fileUrl = entry.documentUrl

      log('[save] manually trigger callback:', callbackUrl)
      log('[save] callback fileUrl:', fileUrl)

      try {
        const cbRes = await request.post(
          `/dataeditor/onlyoffice/callback?datasheetId=${encodeURIComponent(targetDatasheetId)}`,
          {
            status: 6,
            url: fileUrl
          }
        )
        log('[save] callback response:', cbRes)
      } catch (err) {
        warn('[save] callback trigger failed:', err)
        ElMessage.error('触发回调失败')
        return
      }

      // ★ 第 3 步：轮询后端，等 editorVersion 变化
      while (Date.now() - startTs < maxWait) {
        if (mySession !== saveSession) {
          log('[save] session superseded, abort')
          return
        }
        await new Promise(r => setTimeout(r, 1000))
        pollCount++

        try {
          const res = await request.get(`/dataeditor/get/${targetTaskId}`)
          const dtos = res?.data?.value ?? res?.data ?? []
          const dto = dtos.find(d => d.id === targetDatasheetId)
          if (dto) {
            const v = pickVersion(dto)
            log(`[save] poll#${pollCount} editorVersion =`, v, ', before =', beforeVersion)
            if (v !== null && v !== undefined && v !== beforeVersion) {
              latestDto = dto
              log('[save] detected new version =', v)
              break
            }
          }
        } catch (err) {
          warn('[save] poll error', err)
        }
      }

      if (!latestDto) {
        warn('[save] timeout, no new version')
        ElMessage.warning('保存确认超时，请稍后刷新')
        return
      }

      const newVersion = pickVersion(latestDto)
      const newRawUrl = latestDto.url || ''

      log('[save] updating entry:', beforeVersion, '→', newVersion)

      entry.version = newVersion
      entry.documentKey = buildDocKey(targetDatasheetId, newVersion)
      if (newRawUrl) entry.documentUrl = buildPreviewUrl(newRawUrl)

      const task = taskList.value.find(t => t.checkListId === targetTaskId)
      if (task) {
        const item = task.items.find(i => i.datasheetId === targetDatasheetId)
        if (item) {
          item.updatedAt = latestDto.updateTime || item.updatedAt
          if (newRawUrl) item.rawUrl = newRawUrl
          if (newVersion !== null) item.version = newVersion
        }
      }

      log('[save] entry key now =', entry.documentKey)
      ElMessage.success('已保存到后端')
    } catch (e) {
      console.error('[save] exception', e)
      ElMessage.error('保存失败')
    } finally {
      log('[save] finally, saving = false')
      saving.value = false
    }
  }

  /* ============================================================
   *  九、OnlyOffice
   * ============================================================ */
  let wordEditor = null
  let editorReady = false

  async function initWordPreview(entry) {
    log('[init] start for', entry?.datasheetId, 'key =', entry?.documentKey)

    if (!entry || !entry.documentUrl) {
      destroyEditor()
      return
    }
    if (entry.datasheetId !== currentDatasheetId.value) {
      log('[init] skip, not current datasheet')
      return
    }

    destroyEditor()
    await new Promise(r => setTimeout(r, 200))
    await nextTick()

    const container = document.getElementById('onlyoffice-word-preview')
    if (!container) {
      warn('[init] container not found')
      return
    }

    log('[init] creating DocsAPI.DocEditor key =', entry.documentKey)

    const config = {
      style: { height: '100%', width: '100%' },
      document: {
        title: entry.title || '预览文档.docx',
        url: entry.documentUrl,
        fileType: 'docx',
        key: entry.documentKey,
        permissions: { edit: true, download: true }
      },
      documentType: 'word',
      editorConfig: {
        mode: 'edit',
        lang: 'en',
        callbackUrl: `${API_BASE}/dataeditor/onlyoffice/callback?datasheetId=${encodeURIComponent(
          entry.datasheetId
        )}`,
        customization: {
          uiTheme: 'theme-dark',
          comments: false,
          feedback: false,
          forcesave: true,
          autosave: true
        }
      },
      events: {
        onDocumentReady: () => {
          editorReady = true
          log('[ready] key =', entry.documentKey)
        },
        onRequestRefreshFile: () => {
          if (!editorReady) {
            log('[onRequestRefreshFile] editor not ready, ignore')
            return
          }
          const e = editorCache.get(currentDatasheetId.value)
          if (!e) {
            warn('[onRequestRefreshFile] entry not found')
            return
          }
          log('[onRequestRefreshFile] → refreshFile', e.documentKey)
          try {
            wordEditor.refreshFile({ key: e.documentKey })
          } catch (err) {
            warn('[onRequestRefreshFile] refreshFile failed', err)
          }
        },
        onRequestSave: () => {
          log('[onRequestSave] fired')
        },
        onError: event => console.error('[onError]', event)
      }
    }

    try {
      wordEditor = new DocsAPI.DocEditor('onlyoffice-word-preview', config)
      window.__editor = wordEditor
    } catch (e) {
      console.error('[init] failed', e)
    }
  }

  function destroyEditor() {
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
   *  十、生命周期
   * ============================================================ */
  onMounted(async () => {
    try {
      await loadOnlyOfficeScript()
      await nextTick()
      log('[mounted] OnlyOffice script loaded')
    } catch (e) {
      console.error('OnlyOffice 脚本加载失败:', e)
    }
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

  /* ============ 左侧 30% ============ */
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

  /* ============================================================ */
  /*  左侧列表：风格对齐 logicalValidation 的 formula-item           */
  /* ============================================================ */
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

  /* ============ 右侧 70% ============ */
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

  /* ============ 细滚动条（对齐 logicalValidation） ============ */
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
</style>-->



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
                   :loading="saving"
                   @click="saveToBackend">
          <el-icon style="margin-right: 6px"><Document /></el-icon>
          Save
        </el-button>
        <!-- ★ 新增：Done 按钮 -->
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
            <!-- ★ 当前文档状态 -->
            <el-tag v-if="currentItemStatus"
                    size="small"
                    :type="statusTagType(currentItemStatus)"
                    effect="dark">
              {{ currentItemStatus }}
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
  // ★ 新增 ElMessageBox
  import { ElMessage, ElMessageBox } from 'element-plus'
  // ★ 新增 CircleCheck 图标
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
   *  ★ 状态常量
   * ============================================================ */
  const STATUS = {
    PENDING: 'Pending',
    SAVED: 'Saved',
    DONE: 'Done'
  }

  /** Done 后是否锁定编辑 */
  const LOCK_AFTER_DONE = true

  /* ============================================================
   *  一、状态
   * ============================================================ */
  const taskList = ref([])
  const keyword = ref('')
  const statusFilter = ref('')
  const selectedTaskId = ref('')
  const loadingTasks = ref(false)
  const saving = ref(false)
  const markingDone = ref(false)          // ★ Done 按钮 loading

  const showAttachDialog = ref(false)
  const attachCheckListId = ref('')

  const searchText = ref('')

  const activeDocumentTitle = ref('')
  const documentUrl = ref('')
  const currentDatasheetId = ref('')

  /* ============================================================
   *  ★ 状态工具方法
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
    const encoded = clean
      .split('/')
      .map(seg => encodeURIComponent(seg))
      .join('/')
    return `${API_BASE}/dataeditor/datasheet/download/${encoded}`
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
      // ★ 优先用后端状态：Done 保留，其余一律 Pending（符合「会话内 Saved」语义）
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

  function buildDocKey(datasheetId, version) {
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
    return `ds_${safeId}_${v}`
  }

  function pickVersion(dto) {
    if (!dto) return null
    return dto.editorVersion ?? dto.updateTime ?? null
  }

  function getOrCreateCacheEntry(datasheetId, url, title, version) {
    if (!editorCache.has(datasheetId)) {
      const key = buildDocKey(datasheetId, version)
      editorCache.set(datasheetId, {
        datasheetId,
        documentUrl: url,
        documentKey: key,
        title,
        version: version ?? null
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
      entry.documentKey = buildDocKey(datasheetId, version)
      log('[cache] version changed', datasheetId, `${oldKey} → ${entry.documentKey}`)
    }
    return entry
  }

  /* ============================================================
   *  ★ 六、事件抑制（防止 refreshFile / 初始加载误触状态）
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

  function openDocument(datasheetId, url, title, version) {
    saveSession++
    log('[openDocument]', datasheetId, 'version=', version, 'saveSession=', saveSession)

    const entry = getOrCreateCacheEntry(datasheetId, url, title, version)
    const sameDoc = currentDatasheetId.value === datasheetId

    currentDatasheetId.value = datasheetId
    activeDocumentTitle.value = entry.title
    documentUrl.value = entry.documentUrl

    log('[openDocument] sameDoc=', sameDoc, 'key=', entry.documentKey)

    // 同一文档且编辑器已就绪 → 用 refreshFile 切版本
    if (sameDoc && wordEditor && editorReady) {
      log('[openDocument] sameDoc → refreshFile', entry.documentKey)
      try {
        // ★ 用 withSuppress 包裹，避免误触状态回退
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
  let saveSession = 0

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
    const entry = editorCache.get(currentDatasheetId.value)
    if (!entry) return
    if (!wordEditor) {
      ElMessage.warning('编辑器未初始化')
      return
    }
    if (!triggerEditorSave()) {
      ElMessage.warning('当前 Document Server 不支持主动保存')
      return
    }

    const mySession = ++saveSession
    const targetDatasheetId = currentDatasheetId.value
    const targetTaskId = selectedTaskId.value
    const beforeVersion = entry.version

    log('[save] mySession =', mySession, 'beforeVersion =', beforeVersion)

    saving.value = true
    ElMessage.info('正在保存，请稍候...')

    try {
      const startTs = Date.now()
      const maxWait = 30000
      let latestDto = null
      let pollCount = 0

      // ★ 第 1 步：等几秒，让 DS 有机会把文件写入自己的缓存
      await new Promise(r => setTimeout(r, 2000))

      // ★ 第 2 步：手动触发后端 callback，模拟 DS 行为
      const callbackUrl = `${API_BASE}/dataeditor/onlyoffice/callback?datasheetId=${encodeURIComponent(targetDatasheetId)}`
      const fileUrl = entry.documentUrl

      log('[save] manually trigger callback:', callbackUrl)
      log('[save] callback fileUrl:', fileUrl)

      try {
        const cbRes = await request.post(
          `/dataeditor/onlyoffice/callback?datasheetId=${encodeURIComponent(targetDatasheetId)}`,
          {
            status: 6,
            url: fileUrl
          }
        )
        log('[save] callback response:', cbRes)
      } catch (err) {
        warn('[save] callback trigger failed:', err)
        ElMessage.error('触发回调失败')
        return
      }

      // ★ 第 3 步：轮询后端，等 editorVersion 变化
      while (Date.now() - startTs < maxWait) {
        if (mySession !== saveSession) {
          log('[save] session superseded, abort')
          return
        }
        await new Promise(r => setTimeout(r, 1000))
        pollCount++

        try {
          const res = await request.get(`/dataeditor/get/${targetTaskId}`)
          const dtos = res?.data?.value ?? res?.data ?? []
          const dto = dtos.find(d => d.id === targetDatasheetId)
          if (dto) {
            const v = pickVersion(dto)
            log(`[save] poll#${pollCount} editorVersion =`, v, ', before =', beforeVersion)
            if (v !== null && v !== undefined && v !== beforeVersion) {
              latestDto = dto
              log('[save] detected new version =', v)
              break
            }
          }
        } catch (err) {
          warn('[save] poll error', err)
        }
      }

      if (!latestDto) {
        warn('[save] timeout, no new version')
        ElMessage.warning('保存确认超时，请稍后刷新')
        return
      }

      const newVersion = pickVersion(latestDto)
      const newRawUrl = latestDto.url || ''

      log('[save] updating entry:', beforeVersion, '→', newVersion)

      entry.version = newVersion
      entry.documentKey = buildDocKey(targetDatasheetId, newVersion)
      if (newRawUrl) entry.documentUrl = buildPreviewUrl(newRawUrl)

      const task = taskList.value.find(t => t.checkListId === targetTaskId)
      if (task) {
        const item = task.items.find(i => i.datasheetId === targetDatasheetId)
        if (item) {
          item.updatedAt = latestDto.updateTime || item.updatedAt
          if (newRawUrl) item.rawUrl = newRawUrl
          if (newVersion !== null) item.version = newVersion
        }
      }

      // ★ 标记 Saved（除非已完成 Done）
      if (getCurrentStatus(targetDatasheetId) !== STATUS.DONE) {
        setItemStatus(targetDatasheetId, STATUS.SAVED)
      }

      // ★ 抑制随后的 DS 状态事件，避免立刻被打回 Pending
      suppressStateChange = true
      setTimeout(() => { suppressStateChange = false }, 1500)

      log('[save] entry key now =', entry.documentKey)
      ElMessage.success('已保存到后端')
    } catch (e) {
      console.error('[save] exception', e)
      ElMessage.error('保存失败')
    } finally {
      log('[save] finally, saving = false')
      saving.value = false
    }
  }

  /* ============================================================
   *  ★ 十、标记 Done（走后端）
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

    // Done 建议先保存
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
      ElMessage.success('已标记为 Done')

      // ★ 若锁定编辑，重建为 view 模式
      if (LOCK_AFTER_DONE) {
        const entry = editorCache.get(targetDatasheetId)
        if (entry) {
          destroyEditor()
          await nextTick()
          initWordPreview(entry)
        }
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

  async function initWordPreview(entry) {
    log('[init] start for', entry?.datasheetId, 'key =', entry?.documentKey)

    if (!entry || !entry.documentUrl) {
      destroyEditor()
      return
    }
    if (entry.datasheetId !== currentDatasheetId.value) {
      log('[init] skip, not current datasheet')
      return
    }

    destroyEditor()
    await new Promise(r => setTimeout(r, 200))
    await nextTick()

    const container = document.getElementById('onlyoffice-word-preview')
    if (!container) {
      warn('[init] container not found')
      return
    }

    log('[init] creating DocsAPI.DocEditor key =', entry.documentKey)

    // ★ 根据状态决定是否可编辑
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
          forcesave: true,
          autosave: true
        }
      },
      events: {
        onDocumentReady: () => {
          editorReady = true
          log('[ready] key =', entry.documentKey)
        },
        // ★ 新增：文档内容变化 → 回退到 Pending
        onDocumentStateChange: (event) => {
          if (suppressStateChange) {
            log('[onDocumentStateChange] suppressed')
            return
          }
          const dsId = currentDatasheetId.value
          if (!dsId) return

          // Done 且锁定，不允许回退
          if (LOCK_AFTER_DONE && getCurrentStatus(dsId) === STATUS.DONE) return

          if (event && event.data === true) {
            const current = getCurrentStatus(dsId)
            if (current === STATUS.PENDING) return
            log('[onDocumentStateChange] modified → Pending', dsId)
            setItemStatus(dsId, STATUS.PENDING)
          }
        },
        onRequestRefreshFile: () => {
          if (!editorReady) {
            log('[onRequestRefreshFile] editor not ready, ignore')
            return
          }
          const e = editorCache.get(currentDatasheetId.value)
          if (!e) {
            warn('[onRequestRefreshFile] entry not found')
            return
          }
          log('[onRequestRefreshFile] → refreshFile', e.documentKey)
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
        onError: event => console.error('[onError]', event)
      }
    }

    try {
      wordEditor = new DocsAPI.DocEditor('onlyoffice-word-preview', config)
      window.__editor = wordEditor
    } catch (e) {
      console.error('[init] failed', e)
    }
  }

  function destroyEditor() {
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

  /* ============ 左侧 30% ============ */
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

  /* ============================================================ */
  /*  左侧列表：风格对齐 logicalValidation 的 formula-item           */
  /* ============================================================ */
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

  /* ============ 右侧 70% ============ */
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

  /* ============ 细滚动条（对齐 logicalValidation） ============ */
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
