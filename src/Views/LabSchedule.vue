<template>
  <div class="allContainer">
    <div class="pageWrapper">
      <!-- 查询条件区 -->
      <div class="mainSelectContainer">
        <div>
          <el-text size="large">ChecklistId</el-text>
          <el-input placeholder=""
                    v-model="searchParams.checklistId"
                    style="width: 180px;"
                    clearable
                    @keyup.enter="search" />
        </div>
        <div>
          <el-text size="large">ReportNo.</el-text>
          <el-input placeholder=""
                    v-model="searchParams.reportNumber"
                    style="width: 180px;"
                    clearable
                    @keyup.enter="search" />
        </div>
        <div>
          <el-text size="large">TimeOpt</el-text>
          <el-select v-model="searchParams.timeOpt" style="width: 150px" disabled>
            <el-option value="createdTime" label="Created Time" />
          </el-select>
          <el-text size="large">TimeType</el-text>
          <el-select v-model="searchParams.timeType"
                     style="width: 140px"
                     @change="timeTypeChange">
            <el-option v-for="type in DatePickerType"
                       :key="type.value"
                       :value="type.value"
                       :label="type.label" />
          </el-select>
          <el-text size="large">Time Range</el-text>
          <el-date-picker v-model="searchParams.timeRange"
                          :type="searchParams.timeType"
                          placeholder=""
                          :value-format="datePickerValueFormat"
                          start-placeholder="Start"
                          end-placeholder="End" />
        </div>
        <div>
          <el-text>Status</el-text>
          <el-select v-model="searchParams.status"
                     style="width: 150px"
                     @change="search">
            <el-option value="All" label="All" />
            <el-option value="Created" label="Created" />
            <el-option value="Validated" label="Validated" />
            <el-option value="InProgress" label="InProgress" />
            <el-option value="Completed" label="Completed" />
          </el-select>
        </div>
        <div>
          <el-button type="primary" @click="search">Search</el-button>
        </div>
      </div>

      <!-- 主表格 -->
      <el-table v-loading="loading"
                class="removeTableGaps roundedTable"
                :data="reportList"
                border
                row-key="checklistId"
                style="width:100%;" height="75%">
        <!-- 展开：子表格 -->
        <el-table-column type="expand">
          <template #default="props">
            <div style="margin-left: 50px;">
              <el-table class="roundedTable"
                        :data="props.row.items || []"
                        style="width: 100%"
                        border
                        empty-text="No items">
                <el-table-column label="Group"
                                 fixed
                                 prop="group"
                                 width="100"
                                 :formatter="funcs.emptyDisplay" />
                <el-table-column label="DatasheetId"
                                 prop="datasheetId"
                                 min-width="150"
                                 :formatter="funcs.emptyDisplay" />
                <el-table-column label="ModelKey"
                                 prop="modelKey"
                                 min-width="140"
                                 :formatter="funcs.emptyDisplay" />
                <el-table-column label="TestItem"
                                 prop="testItem"
                                 min-width="150"
                                 :formatter="funcs.emptyDisplay" />
                <el-table-column label="Status" width="120">
                  <template #default="scope">
                    <el-tag :type="itemStatusTagType(scope.row.status)" size="small">
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="URL" min-width="220">
                  <template #default="scope">
                    <a v-if="scope.row.url"
                       class="file-link"
                       @click.prevent="openDatasheet(scope.row)">
                      {{ getFileName(scope.row.url) }}
                    </a>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="Approver"
                                 prop="approver"
                                 width="130"
                                 :formatter="funcs.emptyDisplay" />
                <el-table-column label="Operations" width="360" fixed="right">
                  <template #default="scope">
                    <el-button type="success"
                               size="small"
                               @click="handleApprove(props.row, scope.row)">
                      Approve
                    </el-button>
                    <el-button type="primary"
                               size="small"
                               @click="handleRelease(props.row, scope.row)">
                      Release
                    </el-button>
                    <el-button type="danger"
                               size="small"
                               @click="handleReject(props.row, scope.row)">
                      Reject
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="checklistId"
                         label="ChecklistId"
                         min-width="180"
                         :formatter="funcs.emptyDisplay" />
        <el-table-column prop="reportNumber"
                         label="ReportNo."
                         min-width="160"
                         :formatter="funcs.emptyDisplay" />
        <el-table-column prop="testGroups"
                         label="Groups"
                         min-width="150"
                         :formatter="funcs.emptyDisplay" />

        <!-- Overall Progress -->
        <el-table-column label="Overall Progress" min-width="280">
          <template #default="{ row }">
            <el-progress :percentage="progressPercent(row)"
                         :status="progressStatus(row)" />
            <div class="progressText">
              {{ progressSummary(row) }}
            </div>
          </template>
        </el-table-column>

        <!-- Overall Status -->
        <el-table-column label="Overall Status" width="150">
          <template #default="{ row }">
            <el-tag :type="overallStatusTagType(row)">
              {{ deriveOverallStatus(row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Operations" width="120" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="openEdit(scope.row)">opreation</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination v-model:current-page="currentPage"
                     v-model:page-size="pageSize"
                     :page-sizes="[10, 20, 30, 40]"
                     size="large"
                     background
                     layout="total, sizes, pager, jumper"
                     :total="total"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     pager-count="12" />
    </div>

    <!-- 编辑框 -->
    <el-dialog top="5vh"
               v-model="editDialogOpen"
               title="Opreation"
               width="800px"
               :before-close="editBeforeClose">
      <el-form>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ChecklistId">
            <el-input v-model="reportEdit.checklistId" disabled />
          </el-descriptions-item>
          <el-descriptions-item label="ReportNo.">
            <el-input v-model="reportEdit.reportNumber" />
          </el-descriptions-item>
          <el-descriptions-item label="Groups">
            <el-input v-model="reportEdit.testGroups" disabled />
          </el-descriptions-item>
          <el-descriptions-item label="Overall Status">
            <el-tag :type="overallStatusTagType(reportEdit)">
              {{ deriveOverallStatus(reportEdit) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <b>Items</b>
        <div v-for="(item, index) in reportEdit.items"
             :key="item.itemId || index"
             class="groupCard">
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="Group">
              <el-input v-model="item.group" disabled />
            </el-descriptions-item>
            <el-descriptions-item label="DatasheetId">
              <el-input v-model="item.datasheetId" disabled />
            </el-descriptions-item>
            <el-descriptions-item label="ModelKey">
              <el-input v-model="item.modelKey" />
            </el-descriptions-item>
            <el-descriptions-item label="TestItem">
              <el-input v-model="item.testItem" />
            </el-descriptions-item>
            <el-descriptions-item label="Status">
              <el-select v-model="item.status" placeholder="">
                <el-option value="Created" label="Created" />
                <el-option value="Validated" label="Validated" />
                <el-option value="InProgress" label="InProgress" />
                <el-option value="Completed" label="Completed" />
              </el-select>
            </el-descriptions-item>
            <el-descriptions-item label="URL">
              <el-input v-model="item.url" />
            </el-descriptions-item>
            <el-descriptions-item label="Approver">
              <el-select v-model="item.approver" filterable placeholder="">
                <el-option v-for="user in userList"
                           :key="user.userId"
                           :value="user.nickName"
                           :label="user.nickName" />
              </el-select>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogOpen = false">Cancel</el-button>
          <el-button type="primary" @click="editDialogConfirm">Confirm</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { API_BASE } from '@/utils/config.js'
/* ===================== Data ===================== */
const request = inject('request')
const authStore = inject('userAuthStore')
const funcs = inject('funcs')

const userList = ref([])
const loading = ref(false)

// 编辑
const reportEdit = ref({
  checklistId: '',
  reportNumber: '',
  testGroups: '',
  status: '',
  items: [],
})
const editDialogOpen = ref(false)

// 表格数据
const reportList = ref([])
const searchParams = reactive({
  checklistId: '',
  reportNumber: '',
  timeOpt: 'createdTime',
  timeType: 'monthrange',   // ★ 默认月范围，保证 timeRange 是数组
  timeRange: '',
  status: 'All',
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// ★ 精简 TimeType：只用 range 类型，保证 timeRange 恒为 [start, end]
const DatePickerType = [
  { value: 'daterange', label: 'Date Range' },
  { value: 'monthrange', label: 'Month Range' },
  { value: 'datetimerange', label: 'Datetime Range' },
]

// el-date-picker 的 value-format：随类型自动切换
const datePickerValueFormat = computed(() => {
  switch (searchParams.timeType) {
    case 'daterange':
    case 'monthrange':
      return 'YYYY-MM-DD'
    case 'datetimerange':
      return 'YYYY-MM-DD HH:mm:ss'
    default:
      return 'YYYY-MM-DD'
  }
})

/* ===================== CheckListStatus 元数据 ===================== */
/**
 * 与后端 NX_lims_Softlines_Command_System.src.Domain.Aggregeates.CheckListContext.Enums.CheckListStatus 严格对齐
 *   Created → Validated → InProgress → Completed
 */
const CHECKLIST_STATUS = {
  Created:    { order: 0, weight: 0,   tag: 'info' },
  Validated:  { order: 1, weight: 25,  tag: 'primary' },
  InProgress: { order: 2, weight: 50,  tag: 'warning' },
  Completed:  { order: 3, weight: 100, tag: 'success' },
}
const STATUS_ORDER = ['Created', 'Validated', 'InProgress', 'Completed']

function normalizeStatus(s) {
  if (!s) return ''
  const lower = String(s).trim().toLowerCase()
  return STATUS_ORDER.find(x => x.toLowerCase() === lower) || String(s).trim()
}
function statusMeta(s) {
  return CHECKLIST_STATUS[normalizeStatus(s)] || null
}

/* ===================== 聚合逻辑 ===================== */

function itemProgress(status) {
  const meta = statusMeta(status)
  return meta ? meta.weight : 0
}

/**
 * Overall Progress = 所有子项进度贡献的平均值
 */
function progressPercent(row) {
  const items = row?.items || []
  if (items.length === 0) return 0
  const sum = items.reduce((acc, it) => acc + itemProgress(it.status), 0)
  return Math.round(sum / items.length)
}

/**
 * 进度条颜色：全部 Completed 才绿
 */
function progressStatus(row) {
  const items = row?.items || []
  if (items.length === 0) return undefined
  const allCompleted = items.every(it => normalizeStatus(it.status) === 'Completed')
  return allCompleted ? 'success' : undefined
}

/**
 * Overall Status = 所有子项中最"落后"的状态（短板效应）
 */
function deriveOverallStatus(row) {
  const items = row?.items || []
  if (items.length === 0) {
    return normalizeStatus(row?.status) || 'Created'
  }
  let minOrder = Infinity
  let minStatus = 'Created'
  for (const it of items) {
    const meta = statusMeta(it.status)
    if (!meta) continue
    if (meta.order < minOrder) {
      minOrder = meta.order
      minStatus = normalizeStatus(it.status)
    }
  }
  return minStatus
}

function overallStatusTagType(row) {
  const s = deriveOverallStatus(row)
  const meta = statusMeta(s)
  return meta ? meta.tag : 'info'
}

function itemStatusTagType(status) {
  const meta = statusMeta(status)
  return meta ? meta.tag : 'info'
}

/**
 * 进度条下方统计文字
 */
function progressSummary(row) {
  const items = row?.items || []
  const counts = { Created: 0, Validated: 0, InProgress: 0, Completed: 0 }
  for (const it of items) {
    const s = normalizeStatus(it.status)
    if (counts[s] !== undefined) counts[s]++
  }
  return `${counts.Completed} Completed / ${counts.InProgress} InProgress / ${counts.Validated} Validated / ${counts.Created} Created (total ${items.length})`
}

/* ===================== 时间范围处理 ===================== */

function timeTypeChange() {
  searchParams.timeRange = ''
}

/**
 * 把 timeRange（[start, end] 数组）拆成 startTime / endTime
 */
function resolveTimeRange() {
  const r = searchParams.timeRange
  if (!r || !Array.isArray(r) || r.length < 2) {
    return { startTime: null, endTime: null }
  }
  return {
    startTime: r[0] || null,
    endTime: r[1] || null,
  }
}

/**
 * 转成后端能识别的字符串。
 * 由于 el-date-picker 已用 value-format 转成 "YYYY-MM-DD" 或 "YYYY-MM-DD HH:mm:ss"，
 * 直接传即可，无需再 toISOString。
 */
function toBackendTimeStr(s) {
  return s || undefined
}

/* ===================== 查询 / 分页 ===================== */

async function search() {
  if (!searchParams.timeRange) {
    return ElMessage.warning('Please select a time range.')
  }

  const { startTime, endTime } = resolveTimeRange()

  const params = {
    checklistId: searchParams.checklistId || undefined,
    reportNumber: searchParams.reportNumber || undefined,
    status: searchParams.status || 'All',
    startTime: startTime || undefined,
    endTime: endTime || undefined,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  }

  loading.value = true
  try {
    const req = await request.get('/labschedule/page-result', { params })

    // ★ 真实结构：{ isSuccess, value: { items, totalCount } }
    if (req.data.isSuccess) {
      reportList.value = req.data.value?.items ?? []
      total.value = req.data.value?.totalCount ?? 0
    } else {
      ElMessage.error(req.data.error || 'Search failed')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('Search failed')
  } finally {
    loading.value = false
  }
}

function handleCurrentChange() {
  search()
}

function handleSizeChange() {
  currentPage.value = 1
  search()
}


/* ===================== 下载 / URL 拼接 ===================== */

function getFileName(path) {
  if (!path) return ''
  const parts = path.split(/[\\/]/)
  return parts[parts.length - 1]
}

/**
 * 与 datasheet-editor 的 buildPreviewUrl 对齐
 * 只把接口路径从 /dataeditor 换成 /labschedule
 */
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

function openDatasheet(row) {
  if (!row?.url) return
  const url = buildPreviewUrl(row.url)
  if (!url) return
  window.open(url, '_blank')
}
/* ===================== 编辑 ===================== */

function openEdit(row) {
  reportEdit.value = JSON.parse(JSON.stringify(row))
  editDialogOpen.value = true
}

function editBeforeClose() {
  editDialogOpen.value = false
}

async function editDialogConfirm() {
  const dto = {
    checklistId: reportEdit.value.checklistId,
    reportNumber: reportEdit.value.reportNumber,
    status: reportEdit.value.status,
    items: reportEdit.value.items,
  }
  try {
    const res = await request.post('/checklist/update', dto)
    if (res.data.success) {
      ElMessage.success('Update success')
      editDialogOpen.value = false
      await search()
    } else {
      ElMessage.error(res.data.message || 'Update failed')
    }
  } catch (e) {
    ElMessage.error('Update failed')
  }
}

/* ===================== 子表格操作 ===================== */

async function handleApprove(parentRow, currentRow) {
  await doItemAction('/checklist/approve', parentRow, currentRow, 'Approve')
}
async function handleRelease(parentRow, currentRow) {
  await doItemAction('/checklist/release', parentRow, currentRow, 'Release')
}
async function handleReject(parentRow, currentRow) {
  try {
    const { value } = await ElMessageBox.prompt(
      'Please input reject reason',
      'Reject',
      { confirmButtonText: 'Confirm', cancelButtonText: 'Cancel' }
    )
    if (!value || !value.trim()) {
      return ElMessage.warning('Reason is required')
    }
    await doItemAction('/checklist/reject', parentRow, currentRow, 'Reject', { reason: value })
  } catch (e) {
    // 用户取消
  }
}

async function doItemAction(url, parentRow, currentRow, actionName, extra = {}) {
  const payload = {
    checklistId: parentRow.checklistId,
    checkListItemId: currentRow.itemId,     // ★ 用实体主键，跨聚合根最稳
    datasheetId: currentRow.datasheetId,
    userId: authStore.id,
    ...extra,
  }
  try {
    const res = await request.post(url, payload)
    if (res.data.success) {
      ElMessage.success(`${actionName} success`)
      await search()
    } else {
      ElMessage.error(res.data.message || `${actionName} failed`)
    }
  } catch (e) {
    console.error(e)
    ElMessage.error(`An error occurred during ${actionName}`)
  }
}

/* ===================== 用户列表 ===================== */

async function getUserList() {
  const rep = await request.get('/search/getUser')
  if (rep.data.success) {
    userList.value = rep.data.data
  }
}

/* ===================== 生命周期 ===================== */

onMounted(() => {
  search()
  getUserList()
})
</script>

<style scoped>
  /* 整体页面容器 */
  .pageWrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
    height: 100%;
  }

  /* 查询条件主要容器 */
  .mainSelectContainer {
    display: flex;
    gap: 15px;
    width: 100%;
    align-items: center;
    flex-shrink: 0;
    flex-wrap: wrap;
    border: 1px solid #ebeef5;
    padding: 10px;
    border-radius: 6px;
  }

    .mainSelectContainer > div {
      display: flex;
      align-items: center;
      gap: 5px;
    }

  /* 表格轻圆角 */
  .roundedTable {
    border-radius: 6px;
    overflow: hidden;
  }

  /* 去除表格标题和内容之间的空隙 */
  .removeTableGaps :deep(table) {
    margin-bottom: 0 !important;
  }

  /* 单元格内容居中 */
  .el-table :deep(.cell) {
    text-align: center;
  }

  /* 进度条下方统计文字 */
  .progressText {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  /* 编辑弹窗中每个 item 卡片 */
  .groupCard {
    position: relative;
    margin-bottom: 20px;
    padding: 10px;
    border: 1px dashed #ccc;
    border-radius: 6px;
  }

  button:focus {
    outline: none;
  }

  .file-link {
    color: #409eff !important;
    text-decoration: underline !important;
    cursor: pointer;
    font-size: 13px;
  }

    .file-link:hover {
      color: #66b1ff !important;
    }
</style>
