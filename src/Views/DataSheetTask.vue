<template>
  <div class="datasheetDemo">

    <!-- Floating left panel: task summary -->
    <div class="sidePanel">
      <div class="sidePanelTitle">Summary</div>
      <div class="summaryItem">
        <span class="summaryLabel">Total Tasks</span>
        <span class="summaryValue">{{ store.taskList.length }}</span>
      </div>
      <div class="summaryItem">
        <span class="summaryLabel">Generating</span>
        <span class="summaryValue">{{ store.summary.generating }}</span>
      </div>
      <div class="summaryItem">
        <span class="summaryLabel">Success</span>
        <span class="summaryValue success">{{ store.summary.success }}</span>
      </div>
      <div class="summaryItem">
        <span class="summaryLabel">Failed</span>
        <span class="summaryValue danger">{{ store.summary.failed }}</span>
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
        <el-option label="Generating" value="GENERATING" />
        <el-option label="Merging" value="MERGING" />
        <el-option label="Success" value="SUCCESS" />
        <el-option label="Partial Failed" value="PARTIAL_FAILED" />
        <el-option label="Failed" value="FAILED" />
      </el-select>
    </div>

    <!-- Main content -->
    <div class="mainContent">
      <!-- Top title row -->
      <div class="headerRow">
        <h3>Datasheet Generation Progress</h3>
        <div class="headerActions">
          <el-button @click="onClearAll">Clear All</el-button>
        </div>
      </div>

      <div class="attachBar">
        <el-input v-model="attachCheckListId"
                  size="small"
                  placeholder="CheckList ID"
                  style="width: 240px" />
        <el-input v-model="attachReportNo"
                  size="small"
                  placeholder="Report No (optional)"
                  style="width: 200px" />
        <el-button size="small" type="primary" @click="onAttach">Attach Task</el-button>
        <span class="hintText">
          Auto-syncs with store. Manual attach uses same SSE pipeline.
        </span>
      </div>

      <el-table :data="filteredTaskList"
                row-key="checkListId"
                border
                style="width: 100%"
                :expand-row-keys="store.expandedKeys"
                @expand-change="onExpandChange"
                empty-text="No tasks yet. Attach a CheckList or start from another page.">
        <!-- Expand: datasheet sub-table -->
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="subTableWrapper">
              <div class="subHeader">
                <span>
                  Datasheets under this Task ({{ row.items.length }})
                </span>
                <div>
                  <!-- 批量重试：有失败项时显示 -->
                  <el-button v-if="hasFailedItems(row)"
                             size="small"
                             type="warning"
                             @click="onRetryAll(row)"
                             style="margin-right: 8px">
                    Retry All Failed ({{ failedCount(row) }})
                  </el-button>
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
                <el-table-column prop="testItemId" label="Test Item" width="120" />
                <el-table-column prop="modelIndex" label="Index" width="70" />
                <el-table-column prop="modelKey" label="Model Key" width="140" />
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
                    <el-button v-if="store.isSuccessStatus(item.status) && item.fileUrl"
                               size="small"
                               @click="openFile(item.fileUrl)">
                      Download
                    </el-button>
                    <el-button v-if="store.isFailedStatus(item.status)"
                               size="small"
                               type="warning"
                               @click="store.retryItem(item)">
                      Retry
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column prop="errorMessage" label="Error Message" min-width="240">
                  <template #default="{ row: item }">
                    <span v-if="item.errorMessage" class="errorText">{{ item.errorMessage }}</span>
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
            <el-progress :percentage="progressPercent(row)"
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
            <el-tag :type="statusTagType(store.deriveOverallStatus(row))">
              {{ store.displayStatus(store.deriveOverallStatus(row)) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="toggleExpand(row)">
              {{ store.expandedKeys.includes(row.checkListId) ? 'Collapse' : 'Expand' }}
            </el-button>

            <!-- 批量重试 -->
            <el-button v-if="hasFailedItems(row)"
                       size="small"
                       type="warning"
                       @click="onRetryAll(row)">
              Retry All ({{ failedCount(row) }})
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useDatasheetStore } from '@/stores/datasheetStore'

  const store = useDatasheetStore()

  /* ---------------- Filter ---------------- */
  const keyword = ref('')
  const statusFilter = ref('')

  const filteredTaskList = computed(() => {
    const kw = keyword.value.trim().toLowerCase()
    return store.taskList.filter(t => {
      // 筛选按聚合状态，而不是原始 t.status
      if (statusFilter.value) {
        const overall = store.deriveOverallStatus(t)
        if (overall !== statusFilter.value) return false
      }
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

  /* ---------------- store events → ElMessage ---------------- */
  watch(
    () => store.events.slice(),
    (list) => {
      list.forEach(ev => {
        if (ev.type === 'success') ElMessage.success(ev.message)
        else if (ev.type === 'error') ElMessage.error(ev.message)
        else if (ev.type === 'warning') ElMessage.warning(ev.message)
        else ElMessage.info(ev.message)
        store.consumeEvent(ev.id)
      })
    },
    { deep: false }
  )

  /* ---------------- Attach (手动) ---------------- */
  const attachCheckListId = ref('')
  const attachReportNo = ref('')

  function onAttach() {
    if (!attachCheckListId.value.trim()) {
      ElMessage.warning('Please enter a CheckList ID')
      return
    }
    store.attachTaskStream(attachCheckListId.value.trim(), attachReportNo.value.trim())
    attachCheckListId.value = ''
    attachReportNo.value = ''
  }

  /* ---------------- Table helpers ---------------- */
  function formatTime(t) {
    if (!t) return ''
    return new Date(t).toLocaleString('en-US', { hour12: false })
  }

  function statusTagType(status) {
    if (store.isSuccessStatus(status)) return 'success'
    if (store.isFailedStatus(status)) return 'danger'
    if (store.isRunningStatus(status)) return 'warning'
    return 'info'
  }

  function progressStatus(row) {
    const s = store.deriveOverallStatus(row)
    if (store.isSuccessStatus(s)) return 'success'
    if (store.isFailedStatus(s)) return 'exception'
    return undefined
  }

  function progressPercent(row) {
    const items = row?.items || []
    if (items.length === 0) return 0
    let done = 0
    for (const it of items) {
      const s = store.normalizeStatus(it.status)
      if (store.isSuccessStatus(s) || store.isFailedStatus(s)) done++
    }
    return Math.round((done / items.length) * 100)
  }

  function onExpandChange(row, expandedRows) {
    store.expandedKeys = expandedRows.map(r => r.checkListId)
  }

  function toggleExpand(row) {
    const idx = store.expandedKeys.indexOf(row.checkListId)
    if (idx >= 0) store.expandedKeys.splice(idx, 1)
    else store.expandedKeys.push(row.checkListId)
  }

  function openFile(url) {
    window.open(url, '_blank')
  }

  function openMergedPdf(row) {
    if (row.mergedPdfUrl) window.open(row.mergedPdfUrl, '_blank')
  }

  function failedCount(task) {
    return (task.items || []).filter(i => store.isFailedStatus(i.status)).length
  }

  function hasFailedItems(task) {
    return failedCount(task) > 0
  }

  async function onRetryAll(task) {
    const count = failedCount(task)
    if (count === 0) {
      ElMessage.warning('No failed items to retry')
      return
    }
    try {
      await ElMessageBox.confirm(
        `Retry all ${count} failed datasheets under this task?`,
        'Batch Retry Confirmation',
        { type: 'warning', confirmButtonText: 'Retry All', cancelButtonText: 'Cancel' }
      )
    } catch {
      return
    }
    await store.retryAllFailed(task)
  }

  function onClearAll() {
    store.clearAll()
  }

  /* ---------------- 刷新后自动恢复未完成任务 ---------------- */
  onMounted(() => {
    // 从 localStorage 恢复的任务里，未终结的重新挂 SSE
    store.taskList.forEach(t => {
      const overall = store.deriveOverallStatus(t)
      if (overall !== 'SUCCESS' && overall !== 'FAILED' && overall !== 'PARTIAL_FAILED') {
        store.attachTaskStream(t.checkListId, t.reportNo)
      }
    })
  })

  onBeforeUnmount(() => {
    // ★ 不 detach，SSE 由 store 持有，切页不中断
  })
</script>

<style scoped>
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

  .sidePanel {
    position: sticky;
    top: 16px;
    flex: 0 0 180px;
    width: 180px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
  }

  .mainContent {
    flex: 1 1 auto;
    min-width: 0;
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    box-sizing: border-box;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

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
