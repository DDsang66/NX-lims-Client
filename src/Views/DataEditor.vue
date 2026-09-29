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
          <span class="value">{{ taskList.length }}</span>
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

      <!-- ============ 扁平 datasheet 卡片列表（风格对齐 formula-item） ============ -->
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
      <!-- 顶部 10% 控制栏 -->
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
                   :disabled="!documentUrl"
                   :loading="saving"
                   @click="saveToBackend">
          <el-icon style="margin-right: 6px"><Document /></el-icon>
          Save
        </el-button>
      </el-card>

      <!-- 下部 90% 编辑器卡片 -->
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
   *  一、状态
   * ============================================================ */
  const taskList = ref([])
  const keyword = ref('')
  const statusFilter = ref('')
  const selectedTaskId = ref('')
  const loadingTasks = ref(false)
  const saving = ref(false)

  // Attach 对话框
  const showAttachDialog = ref(false)
  const attachCheckListId = ref('')

  // 右侧搜索框
  const searchText = ref('')

  // 当前编辑器状态
  const activeDocumentTitle = ref('')
  const documentUrl = ref('')
  const currentDatasheetId = ref('')

  /* ============================================================
   *  二、后端接口调用（路径不修改）
   * ============================================================ */

  /**
   * GET /dataeditor/get/{checklistId}
   */
  async function fetchDatasheetsByChecklist(checklistId) {
    const res = await request.get(`/dataeditor/get/${checklistId}`)
    const payload = res?.data?.value ?? res?.data ?? res?.value ?? res

    console.log(payload)

    if (Array.isArray(payload)) return payload
    if (payload && Array.isArray(payload.value)) return payload.value
    if (payload && Array.isArray(payload.data)) return payload.data
    return []
  }

  /**
   * 拼成 OnlyOffice 能访问的完整 URL
   * 后端: GET /dataeditor/datasheet/download/{*url}
   */
  function buildPreviewUrl(rawUrl) {
    if (!rawUrl) return ''
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl

    // \DocxModel\SaveDocx\xxx.docx
    // → DocxModel/SaveDocx/xxx.docx
    const clean = rawUrl.replace(/\\/g, '/').replace(/^\/+/, '')

    // 逐段编码，保留 /
    const encoded = clean
      .split('/')
      .map(seg => encodeURIComponent(seg))
      .join('/')

    return `${API_BASE}/dataeditor/datasheet/download/${encoded}`
  }

  /**
   * DTO → task 结构
   *
   * ★ 状态不从后端拿：这里统一给固定占位 'Pending'。
   *   后续要区分 Pending/Saved/Done 时，只改下面这一行。
   */
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
      status: 'Pending'
    }))

    return {
      checkListId: checklistId,
      batchId: first.bacthId || '',
      reportNo: first.reportNumber || '',
      total: items.length,
      status: 'Pending',
      items
    }
  }

  /**
   * 刷新所有已 attach 的任务
   */
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

      // 自动打开第一个可用项
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

  /**
   * 把 task → items 拍平成一个扁平列表，供左侧卡片渲染
   * 每一项保留它所属的 task，供点击时使用
   */
  const flatDatasheetList = computed(() => {
    const list = []
    filteredTaskList.value.forEach(task => {
      (task.items || []).forEach(item => {
        list.push({ task, item })
      })
    })
    return list
  })

  // ★ 暂时只填 Pending，等状态规则确定后改
  const summary = computed(() => {
    return {
      pending: taskList.value.length,
      saved: 0,
      done: 0
    }
  })

  // ★ 纯展示映射，不做业务判断
  function statusTagType(status) {
    switch (status) {
      case 'Done': return 'primary'
      case 'Saved': return 'success'
      case 'Pending': return 'warning'
      default: return 'info'
    }
  }
  function progressStatus() {
    return undefined
  }
  function progressPercent() {
    return 0
  }
  function shortId(id) {
    return id ? String(id).slice(0, 8) : '—'
  }

  /* ============================================================
   *  五、编辑器缓存机制（仅稳定 document.key）
   * ============================================================ */
  const editorCache = new Map()

  function stableKeyFor(datasheetId, version = 0) {
    const safeId = String(datasheetId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24)
    return `ds_${safeId}_v${version}`
  }

  function buildDocKey(datasheetId, updateTime) {
  const safeId = String(datasheetId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
  // updateTime 是 ISO 字符串，转成数字时间戳
  const ts = updateTime ? new Date(updateTime).getTime() : 0
  return `ds_${safeId}_${ts}`
}

function getOrCreateCacheEntry(datasheetId, url, title, updateTime) {
  const newKey = buildDocKey(datasheetId, updateTime)

  if (!editorCache.has(datasheetId)) {
    editorCache.set(datasheetId, {
      datasheetId,
      documentUrl: url,
      documentKey: newKey,
      title,
      updateTime: updateTime || null
    })
  } else {
    const entry = editorCache.get(datasheetId)
    entry.documentUrl = url
    entry.title = title
    // ★ updateTime 变了 → 换 key
    if (entry.updateTime !== updateTime) {
      entry.updateTime = updateTime
      entry.documentKey = newKey
    }
  }
  return editorCache.get(datasheetId)
}

  /* ============================================================
   *  六、选中任务 / 打开文档
   * ============================================================ */

  // 打开某个指定 item
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
    item.updatedAt        // ★ 传后端返回的 updateTime
  )
}

  // 打开某 task 的第一个可用 item（Select 按钮无关键词时使用）
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

function openDocument(datasheetId, url, title, updateTime) {
  const entry = getOrCreateCacheEntry(datasheetId, url, title, updateTime)
  currentDatasheetId.value = datasheetId
  activeDocumentTitle.value = entry.title
  documentUrl.value = entry.documentUrl

  nextTick(() => {
    initWordPreview(entry.documentKey)
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
   *  八、保存到后端（forcesave）
   * ============================================================ */
async function saveToBackend() {
  if (!currentDatasheetId.value) {
    ElMessage.warning('没有打开的文档')
    return
  }
  const entry = editorCache.get(currentDatasheetId.value)
  if (!entry) return

  if (!wordEditor || typeof wordEditor.serviceCommand !== 'function') {
    ElMessage.warning('当前 Document Server 不支持主动保存')
    return
  }

  saving.value = true
  try {
    // 记录当前 updateTime 作为"保存前的版本"
    const beforeUpdateTime = new Date(entry.updateTime || 0).getTime()

    // ① 只调 forcesave，其他什么都不做
    wordEditor.serviceCommand('forcesave')
    ElMessage.info('正在保存，请稍候...')

    // ② 轮询后端，等 UpdateTime 变化（说明后端真的收到了保存并写盘）
    const startTs = Date.now()
    const maxWait = 30000
    let newUpdateTime = null

    while (Date.now() - startTs < maxWait) {
      await new Promise(r => setTimeout(r, 1000))
      try {
        const res = await request.get(`/dataeditor/get/${selectedTaskId.value}`)
        const dtos = res?.data?.value ?? res?.data ?? []
        const dto = dtos.find(d => d.id === currentDatasheetId.value)
        if (dto?.updateTime) {
          const t = new Date(dto.updateTime).getTime()
          if (t > beforeUpdateTime) {
            newUpdateTime = dto.updateTime
            break
          }
        }
      } catch { /* ignore */ }
    }

    // ③ 后端确认保存完了，这时才升级 key + 重建编辑器
    if (newUpdateTime) {
      entry.updateTime = newUpdateTime
      entry.documentKey = buildDocKey(currentDatasheetId.value, newUpdateTime)

      nextTick(() => {
        initWordPreview(entry.documentKey)
      })
      ElMessage.success('已保存到后端')
    } else {
      ElMessage.warning('保存确认超时，请稍后刷新')
    }
  } catch (e) {
    console.error('save failed', e)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}
  /* ============================================================
   *  九、OnlyOffice 初始化
   * ============================================================ */
  let wordEditor = null

  async function initWordPreview(explicitKey) {
    if (!documentUrl.value) {
      if (wordEditor) {
try {
  console.log('=== creating editor ===');
  console.log('DocsAPI:', window.DocsAPI);
  console.log('container:', container);
  wordEditor = new DocsAPI.DocEditor('onlyoffice-word-preview', config);
  window.__editor = wordEditor;
  console.log('wordEditor:', wordEditor);
  console.log('serviceCommand type:', typeof wordEditor?.serviceCommand);
} catch (e) {
  console.error('初始化 OnlyOffice 失败:', e);
}
        wordEditor = null
      }
      return
    }

    if (wordEditor) {
      try { wordEditor.destroyEditor() } catch (e) { }
      wordEditor = null
      await new Promise(r => setTimeout(r, 300))
    }

    await nextTick()
    const container = document.getElementById('onlyoffice-word-preview')
    if (!container) {
      console.warn('OnlyOffice 容器不存在')
      return
    }

    const entry = editorCache.get(currentDatasheetId.value)
    const docKey = explicitKey || entry?.documentKey || `fallback_${Date.now()}`

    const config = {
      style: { height: '100%', width: '100%' },
      document: {
        title: activeDocumentTitle.value || '预览文档.docx',
        url: documentUrl.value,
        fileType: 'docx',
        key: docKey,
        permissions: { edit: true, download: true }
      },
      documentType: 'word',
      editorConfig: {
        mode: 'edit',
        lang: 'en',
        callbackUrl: `${API_BASE}/dataeditor/onlyoffice/callback?datasheetId=${encodeURIComponent(
          currentDatasheetId.value
        )}`,
        customization: {
          uiTheme: 'theme-dark',
          chat: false,
          comments: false,
          feedback: false,
          forcesave: true,
          autosave: true
        }
      },
      events: {
        onDocumentReady: () => {
          console.log('Word document is ready, key =', docKey)
        },
        onRequestSave: () => {
          console.log('OnlyOffice 请求保存')
        },
        onError: event => console.error('Word viewer error:', event)
      }
    }

    try {
      wordEditor = new DocsAPI.DocEditor('onlyoffice-word-preview', config)
    } catch (e) {
      console.error('初始化 OnlyOffice 失败:', e)
    }
  }

  /* ============================================================
   *  十、生命周期
   * ============================================================ */
  onMounted(async () => {
    try {
      await loadOnlyOfficeScript()
      await nextTick()
    } catch (e) {
      console.error('OnlyOffice 脚本加载失败:', e)
    }
  })

  onBeforeUnmount(() => {
    if (wordEditor) {
      try { wordEditor.destroyEditor() } catch (e) { }
      wordEditor = null
    }
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
