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
        <!-- 展开：子表格（保持原样，未改动） -->
        <el-table-column type="expand">
          <template #default="props">
            <div style="margin-left: 50px;">
              <el-table class="roundedTable"
                        :data="props.row.items || []"
                        style="width: 100%"
                        border
                        empty-text="No items">
                <!-- ★ 分包二级子表：一个 CheckListItem 可能对应多份 docx（按 modelIndex 分包） -->
                <el-table-column type="expand">
                  <template #default="dsScope">
                    <div style="margin-left: 20px;">
                      <el-table class="roundedTable"
                                :data="itemDataSheets(dsScope.row)"
                                row-key="dataSheetId"
                                style="width: 100%"
                                border
                                empty-text="No datasheets">
                        <el-table-column label="ModelIndex"
                                         prop="modelIndex"
                                         width="100"
                                         :formatter="funcs.emptyDisplay" />
                        <el-table-column label="DataSheetId"
                                         prop="dataSheetId"
                                         min-width="150"
                                         :formatter="funcs.emptyDisplay" />
                        <el-table-column label="ModelKey"
                                         prop="modelKey"
                                         min-width="120"
                                         :formatter="funcs.emptyDisplay" />
                        <el-table-column label="Status" width="120">
                          <template #default="scope">
                            <el-tag :type="dataSheetStatusTagType(scope.row.status)" size="small">
                              {{ scope.row.status || '-' }}
                            </el-tag>
                          </template>
                        </el-table-column>
                        <el-table-column label="URL" min-width="220">
                          <template #default="scope">
                            <a v-if="scope.row.url"
                               class="file-link"
                               @click.prevent="openDataSheet(scope.row)">
                              {{ getFileName(scope.row.url) }}
                            </a>
                            <span v-else>-</span>
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="Group"
                                 fixed
                                 prop="group"
                                 width="100"
                                 :formatter="funcs.emptyDisplay" />
                <el-table-column label="DataSheets" width="110">
                  <template #default="scope">
                    <el-tag v-if="itemDataSheets(scope.row).length"
                            size="small"
                            type="info">
                      {{ itemDataSheets(scope.row).length }}
                    </el-tag>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
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
                      {{ normalizeStatus(scope.row.status) }}
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
            <el-button link type="primary" @click="openEdit(scope.row)">operation</el-button>
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

    <!-- ================= 编辑框（所有新功能都在这里） ================= -->
    <el-dialog top="5vh"
               v-model="editDialogOpen"
               title="Operation"
               width="1200px"
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

        <!-- 工具条：Groups 下拉筛选 -->
        <div class="editToolbar">
          <el-text>Group Filter:</el-text>
          <el-select v-model="editGroupFilter"
                     placeholder="All Groups"
                     clearable
                     style="width: 220px">
            <el-option v-for="g in editGroupOptions"
                       :key="g"
                       :value="g"
                       :label="g" />
          </el-select>
          <el-text type="info" size="small">
            Selected: {{ selectedEditItems.length }}
          </el-text>
        </div>

        <b>Items</b>

        <!-- ★ 拖动排序：VueDraggable -->
        <VueDraggable v-model="reportEdit.items"
                      :animation="200"
                      handle=".edit-drag-handle"
                      ghost-class="ghost-card"
                      class="draggable-list">
          <div v-for="(item, index) in reportEdit.items"
               v-show="!editGroupFilter || item.group === editGroupFilter"
               :key="item.itemId || index"
               class="groupCard">
            <div class="editCardHeader">
              <el-checkbox v-model="item._selected" />
              <span class="edit-drag-handle">⋮⋮</span>
              <span class="editCardIndex">#{{ index + 1 }}</span>
              <el-tag size="small" type="info">{{ item.group }}</el-tag>
            </div>
            <el-descriptions :column="2" size="small" border>
              <el-descriptions-item label="Group">
                <el-input v-model="item.group" disabled />
              </el-descriptions-item>
              <el-descriptions-item label="DataSheets" :span="2">
                <div class="dsList">
                  <div v-for="(ds, i) in itemDataSheets(item)"
                       :key="ds.dataSheetId || i"
                       class="dsRow">
                    <el-tag size="small" type="info">{{ ds.modelIndex }}</el-tag>
                    <el-input v-model="ds.dataSheetId" disabled style="width: 170px" />
                    <el-input v-model="ds.modelKey" placeholder="ModelKey" style="width: 130px" />
                    <el-input v-model="ds.url" placeholder="URL" style="flex: 1" />
                    <el-tag size="small" :type="dataSheetStatusTagType(ds.status)">
                      {{ normalizeStatus(ds.status) || '-' }}
                    </el-tag>
                  </div>
                  <span v-if="!itemDataSheets(item).length">-</span>
                </div>
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

              <!-- ★ Approver 字段：右侧下方放 Confirm -->
              <el-descriptions-item label="Approver" :span="2">
                <div class="approverWrap">
                  <el-select v-model="item.approver" filterable placeholder="" style="width: 100%">
                    <el-option v-for="user in userList"
                               :key="user.userId"
                               :value="user.nickName"
                               :label="user.nickName" />
                  </el-select>
                  <div class="approverConfirmRow">
                    <el-button type="primary"
                               size="small"
                               @click="handleItemConfirm(item)">
                      Confirm
                    </el-button>
                  </div>
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </VueDraggable>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <!-- 左对齐：3 个动作按钮 -->
          <div class="footer-left">
            <el-button type="success" @click="handleApproveAll">Approve All</el-button>
            <el-button type="primary" @click="handleReleaseAll">Release All</el-button>
            <el-button type="warning" @click="handleMerge">Merge</el-button>
          </div>

          <!-- 右对齐：Cancel + Confirm -->
          <div class="footer-right">
            <el-button @click="editDialogOpen = false">Cancel</el-button>
            <el-button type="primary" @click="editDialogConfirm">Confirm</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
  import { inject, onMounted, reactive, ref, computed, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { VueDraggable } from 'vue-draggable-plus'
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
  const editGroupFilter = ref('')

  // 表格数据
  const reportList = ref([])
  const searchParams = reactive({
    checklistId: '',
    reportNumber: '',
    timeOpt: 'createdTime',
    timeType: 'monthrange',
    timeRange: '',
    status: 'All',
  })

  // 分页
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  const DatePickerType = [
    { value: 'daterange', label: 'Date Range' },
    { value: 'monthrange', label: 'Month Range' },
    { value: 'datetimerange', label: 'Datetime Range' },
  ]

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

  /* ===================== 编辑弹窗：分组 / 选择 ===================== */

  /** 编辑弹窗里所有 group 去重选项 */
  const editGroupOptions = computed(() => {
    const set = new Set()
    for (const it of reportEdit.value.items || []) {
      if (it.group) set.add(it.group)
    }
    return Array.from(set)
  })

  /** 编辑弹窗里被勾选的 item（用于 Merge） */
  const selectedEditItems = computed(() =>
    (reportEdit.value.items || []).filter(it => it._selected)
  )

  /* ===================== CheckListStatus 元数据 ===================== */
  const CHECKLIST_STATUS = {
    Created: { order: 0, weight: 0, tag: 'info' },
    Validated: { order: 1, weight: 25, tag: 'primary' },
    InProgress: { order: 2, weight: 50, tag: 'warning' },
    Completed: { order: 3, weight: 100, tag: 'success' },
    // Rejected 计 0 分，不改变现有进度条口径
    Rejected: { order: 4, weight: 0, tag: 'danger' },
  }
  // 下标即后端枚举序号（0 起），Rejected = 4
  const STATUS_ORDER = ['Created', 'Validated', 'InProgress', 'Completed', 'Rejected']

  /**
   * 把状态归一化成枚举名。
   *
   * 后端可能把枚举序列化成数字序号（0 起），此时只做字符串大小写匹配会
   * 原样返回数字，页面上就会显示成 0/1/2/3，所以先按序号还原成名称。
   *
   * @param {string|number|null} s 原始状态值。
   * @returns {string} 枚举名；无法识别时返回原值的字符串形式。
   */
  function normalizeStatus(s) {
    // 必须先判空再用 Number：Number('') 与 Number(null) 都会得到 0，
    // 而 0 本身是合法状态（Created），不能当成空值丢弃
    if (s === null || s === undefined || s === '') return ''
    const n = Number(s)
    if (Number.isInteger(n) && STATUS_ORDER[n]) return STATUS_ORDER[n]
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

  function progressPercent(row) {
    const items = row?.items || []
    if (items.length === 0) return 0
    const sum = items.reduce((acc, it) => acc + itemProgress(it.status), 0)
    return Math.round(sum / items.length)
  }

  function progressStatus(row) {
    const items = row?.items || []
    if (items.length === 0) return undefined
    const allCompleted = items.every(it => normalizeStatus(it.status) === 'Completed')
    return allCompleted ? 'success' : undefined
  }

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
   * 取一个 CheckListItem 下所有分包（dataSheets）。
   *
   * 后端在同一 modelIndex 上可能保留历史版本行（整体按 version 降序返回），
   * 只有该 modelIndex 的首条才是应当展示的当前版本，因此按 modelIndex 分组后
   * 每组只保留第一条，再按 modelIndex 升序输出。
   *
   * @param {object} item 列表接口返回的 items[] 元素。
   * @returns {Array<{dataSheetId: string, modelIndex: number, modelKey: string, url: string, status: string}>}
   *          按 modelIndex 升序的分包数组；无分包或字段缺失时返回空数组。
   */
  function itemDataSheets(item) {
    const list = Array.isArray(item?.dataSheets) ? item.dataSheets : []
    const seen = new Set()
    const result = []
    for (const ds of list) {
      const idx = Number(ds?.modelIndex ?? 0)
      if (seen.has(idx)) continue   // 同一 modelIndex 的历史版本行，跳过
      seen.add(idx)
      result.push(ds)
    }
    return result.sort((a, b) => Number(a?.modelIndex ?? 0) - Number(b?.modelIndex ?? 0))
  }

  /**
   * 分包（报告文件）状态 → el-tag 类型。
   *
   * 注意与 itemStatusTagType 的区别：这里的 status 来自 dataSheets[].status
   * （Pending / Generating / Success / Failed），而 item 级状态是
   * Created / Validated / InProgress / Completed，两套元数据不能混用，
   * 否则分包状态会全部落到 info 而丢失颜色语义。
   *
   * @param {string} status 分包状态字符串。
   * @returns {string} el-tag 的 type 取值。
   */
  function dataSheetStatusTagType(status) {
    switch (String(status || '').trim().toLowerCase()) {
      case 'success': return 'success'
      case 'failed': return 'danger'
      case 'generating': return 'warning'
      case 'pending': return 'info'
      default: return 'info'
    }
  }

  /**
   * 在新窗口打开某份分包的 docx。
   *
   * @param {{url?: string}} ds 分包对象；url 为空串表示文件尚未生成。
   * @returns {void}
   */
  function openDataSheet(ds) {
    const url = buildPreviewUrl(ds?.url)
    if (!url) return
    window.open(url, '_blank')
  }

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

  /* ===================== URL 工具 ===================== */

  /** 去掉目录，只留文件名 */
  function getFileName(path) {
    if (!path) return ''
    const parts = String(path).split(/[\\/]/)
    return parts[parts.length - 1]
  }

  /** 与 datasheet-editor 的 buildPreviewUrl 对齐：预览用完整 URL */
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

  /**
   * ★ Merge 用：把任意形式的 url 归一化为「相对路径」
   *   - 去掉 http(s)://host 部分
   *   - 反斜杠转正斜杠
   *   - 去掉开头斜杠
   *   - 保留 query
   */
  function toRelativePath(rawUrl) {
    if (!rawUrl) return ''
    let s = String(rawUrl).trim()

    if (/^https?:\/\//i.test(s)) {
      try {
        const u = new URL(s)
        s = u.pathname + (u.search || '')
      } catch {
        // ignore
      }
    }

    return s.replace(/\\/g, '/').replace(/^\/+/, '')
  }

  /* ===================== 编辑 ===================== */
  function openEdit(row) {
    const copy = JSON.parse(JSON.stringify(row))
    copy.items = (copy.items || []).map(it => ({ ...it, _selected: false }))
    reportEdit.value = copy
    editGroupFilter.value = ''
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
      items: reportEdit.value.items.map(({ _selected, dataSheets, ...rest }) => {
        // reportEdit.items 类型被推断为 never[]，显式声明数组以规避新增类型诊断
        const list: any[] = Array.isArray(dataSheets) ? dataSheets : []
        const first: any = list[0]
        // 扁平字段 datasheetId/modelKey/url 的语义是「等于 dataSheets[0]」，
        // 提交前回写保持两者一致，避免后端走旧读取路径时丢掉对首分包的修改
        return first
          ? { ...rest, dataSheets: list, datasheetId: first.dataSheetId, modelKey: first.modelKey, url: first.url }
          : { ...rest, dataSheets: list }
      }),
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

  /* ===================== 子表格操作（原样保留） ===================== */
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
      checkListItemId: currentRow.itemId,
      datasheetId: currentRow.datasheetId,
      userId: authStore?.id,
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

  /* ===================== ★ 编辑弹窗内的操作 ===================== */

  /** 单个 item 的 Confirm（右下侧那个）—— 仍走 mock */
  async function handleItemConfirm(item) {
    const payload = {
      checklistId: reportEdit.value.checklistId,
      checkListItemId: item.itemId,
      datasheetId: item.datasheetId,
      userId: authStore?.id,
    }
    const res = await mockRequest('/checklist/item-confirm', payload)
    if (res.success) ElMessage.success('Confirm success')
    else ElMessage.error(res.message || 'Confirm failed')
  }

  /** Approve All —— 仍走 mock */
  async function handleApproveAll() {
    const items = reportEdit.value.items || []
    if (items.length === 0) return ElMessage.warning('No items')

    try {
      await ElMessageBox.confirm(
        `Approve all ${items.length} items?`,
        'Approve All',
        { type: 'warning' }
      )
    } catch { return }

    const res = await mockRequest('/checklist/approve-all', {
      checklistId: reportEdit.value.checklistId,
      checkListItemIds: items.map(it => it.itemId),
      userId: authStore?.id,
    })
    if (res.success) {
      ElMessage.success('Approve All success')
      editDialogOpen.value = false
      await search()
    } else {
      ElMessage.error(res.message || 'Approve All failed')
    }
  }

  /** Release All —— 仍走 mock */
  async function handleReleaseAll() {
    const items = reportEdit.value.items || []
    if (items.length === 0) return ElMessage.warning('No items')

    try {
      await ElMessageBox.confirm(
        `Release all ${items.length} items?`,
        'Release All',
        { type: 'warning' }
      )
    } catch { return }

    const res = await mockRequest('/checklist/release-all', {
      checklistId: reportEdit.value.checklistId,
      checkListItemIds: items.map(it => it.itemId),
      userId: authStore?.id,
    })
    if (res.success) {
      ElMessage.success('Release All success')
      editDialogOpen.value = false
      await search()
    } else {
      ElMessage.error(res.message || 'Release All failed')
    }
  }

  /**
   * ★ Merge：调用后端 POST /labschedule/data-sheet-merge
   *   请求：MergeLabScheduleDto { ChecklistId, ReportNumber, TestGroup, SelectedDataSheetUrls[] }
   *   响应：Result<DocxUrlResponseDto> { isSuccess, value: { fileKey, fileName, downloadUrl, callbackUrl }, error }
   */
  async function handleMerge() {
    const selected = selectedEditItems.value

    // ★ 一个 item 可能对应多份分包（dataSheets），Merge 时全部展开；
    //   用 Set 去重，避免同一 url 被重复提交
    const selectedUrls = [
      ...new Set(
        selected
          .flatMap(it => itemDataSheets(it))
          .filter(ds => ds.url)
          .map(ds => toRelativePath(ds.url))
          .filter(Boolean)
      ),
    ]

    // 校验改为按「有效文件数」判断：多分包场景下一个 item 就可能提供多个文件

    if (selectedUrls.length < 2) {
      return ElMessage.warning('Selected items have no valid datasheet url')
    }

    // TestGroup：优先用当前分组筛选值，否则取第一个选中项的 group
    const testGroup =
      editGroupFilter.value ||
      selected[0]?.group ||
      ''

    try {
      await ElMessageBox.confirm(
        `Merge ${selectedUrls.length} selected items?`,
        'Merge',
        { type: 'warning' }
      )
    } catch { return }

    const dto = {
      ChecklistId: reportEdit.value.checklistId,
      ReportNumber: reportEdit.value.reportNumber,
      TestGroup: testGroup,
      SelectedDataSheetUrls: selectedUrls,
    }

    try {
      const res = await request.post('/labschedule/data-sheet-merge', dto)

      // 兼容 Result<T> 的 isSuccess / success
      const ok = res.data?.isSuccess ?? res.data?.success
      if (ok) {
        const file = res.data.value
        ElMessage.success('Merge success')

        // ★ 先关弹窗 + 刷新列表 + 等 DOM 更新，再触发下载
        editDialogOpen.value = false
        await search()
        await nextTick()

        await downloadMergedFile(file)
      } else {
        ElMessage.error(res.data?.error || res.data?.message || 'Merge failed')
      }
    } catch (e) {
      console.error(e)
      ElMessage.error('Merge failed')
    }
  }

  /**
   * ★ 下载合并后的文件
   *   用 fetch + blob + <a download> 触发下载，避免 window.open 造成空白页 / 页面卡死
   *   优先用 downloadUrl，否则用 fileName + reportNumber 拼下载接口
   */
  async function downloadMergedFile(file) {
    if (!file) return

    const { fileName, downloadUrl } = file

    // 1) 决定最终下载 URL
    let url = ''
    if (downloadUrl) {
      url = /^https?:\/\//i.test(downloadUrl)
        ? downloadUrl
        : `${API_BASE}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`
    } else if (fileName) {
      const rn = encodeURIComponent(reportEdit.value.reportNumber || '')
      const fn = encodeURIComponent(fileName)
      url = `${API_BASE}/labschedule/datasheet-${fn}/${rn}/download`
    }

    if (!url) return

    try {
      const resp = await fetch(url, {
        method: 'GET',
        // 按需带上鉴权
        // headers: { Authorization: `Bearer ${authStore?.token}` },
      })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

      const blob = await resp.blob()
      const objectUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = objectUrl
      link.download = fileName || 'merged.docx'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()

      // 释放资源
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(objectUrl)
      }, 0)
    } catch (e) {
      console.error(e)
      ElMessage.error('Download failed')
    }
  }

  /* ===================== mock 请求（保留给 Confirm / Approve All / Release All） ===================== */
  function mockRequest(url, payload) {
    // eslint-disable-next-line no-console
    console.log('[MOCK]', url, payload)
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true, message: 'ok' }), 300)
    })
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
  .pageWrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
    height: 100%;
  }

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

  .roundedTable {
    border-radius: 6px;
    overflow: hidden;
  }

  .removeTableGaps :deep(table) {
    margin-bottom: 0 !important;
  }

  .el-table :deep(.cell) {
    text-align: center;
  }

  .progressText {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .groupCard {
    position: relative;
    margin-bottom: 20px;
    padding: 10px;
    border: 1px dashed #ccc;
    border-radius: 6px;
    background: #fff;
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

  /* ★ 编辑弹窗新增样式 */
  .editToolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 15px 0 10px;
  }

  .draggable-list {
    display: block;
  }

  .editCardHeader {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .edit-drag-handle {
    cursor: grab;
    user-select: none;
    color: #909399;
    font-weight: bold;
    padding: 0 4px;
  }

    .edit-drag-handle:active {
      cursor: grabbing;
    }

  .editCardIndex {
    font-size: 12px;
    color: #909399;
  }

  .ghost-card {
    opacity: 0.5;
    background: #ecf5ff;
  }

  /* 弹窗内逐分包编辑行 */
  .dsList {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }

  .dsRow {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  /* ★ Approver 字段：输入框占满，Confirm 按钮在右下侧 */
  .approverWrap {
    width: 100%;
  }

  .approverConfirmRow {
    display: flex;
    justify-content: flex-end;
    margin-top: 6px;
  }

  /* ★ 弹窗底部按钮：左 3 右 2 分开 */
  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .footer-left,
  .footer-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
</style>
