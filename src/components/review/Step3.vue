<template>
  <div class="step3Container">
    <!-- 圆角大框包裹 -->
    <div class="checkListCard">
      <div class="cardHeader">
        <h4>CheckList ID: {{ checkListData?.checklistId || '-' }}</h4>
      </div>
      
      <div class="cardBody">
        <el-table 
          :data="displayItems" 
          border 
          style="width: 100%"
          class="checkListTable"
        >
          <el-table-column prop="index" label="#" width="60" align="center" />
          
          <el-table-column label="Test Item" width="220">
            <template #default="scope">
              <span class="itemName">{{ scope.row.testItemName }}</span>
              <span v-if="scope.row.testItemName !== scope.row.testItemId" class="itemId">
                ({{ scope.row.testItemId }})
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="Standards" width="280">
            <template #default="scope">
              <div class="standardsList">
                <span 
                  v-for="(std, idx) in scope.row.standardsDisplay" 
                  :key="idx"
                  class="standardTag"
                >
                  {{ std.code }}
                  <span v-if="std.name !== std.id" class="standardId">({{ std.id }})</span>
                </span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="testGroup" label="Test Group" width="120" align="center" />
          
          <el-table-column label="Samples" width="200">
            <template #default="scope">
              {{ scope.row.samples?.join(', ') || '' }}
            </template>
          </el-table-column>
          
          <el-table-column label="Parameter" min-width="280">
            <template #default="scope">
              <!-- 1. 空参数：直接显示 - -->
              <span v-if="scope.row.parameters === '-' || !scope.row.parameters || scope.row.parameters.length === 0"
                    class="parameterDash">-</span>

              <!-- 2. 结构化参数 -->
              <div v-else class="parameterBlock">
                <div v-for="(paramGroup, gIdx) in scope.row.parameters"
                     :key="gIdx"
                     class="paramGroup">
                  <span class="paramGroupLabel">{{ paramGroup.group }}</span>
                  <span class="paramGroupBracket">[</span>
                  <div class="paramItems">
                    <div v-for="(entry, eIdx) in paramGroup.entries"
                         :key="eIdx"
                         class="paramItem">
                      <span class="paramKey">{{ entry.key }}</span>
                      <span class="paramColon">:</span>
                      <span class="paramValue">{{ entry.value }}</span>
                    </div>
                  </div>
                  <span class="paramGroupBracket">]</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="requirement" label="Requirement" min-width="180" />
          <el-table-column prop="cuttingMethod" label="Cutting Method" width="150" />
        </el-table>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="!checkListData" class="emptyState">
      <el-empty description="No checklist data available" />
    </div>

    <!-- 底部按钮 -->
    <div class="actionButtons">
      <div class="btnLeft">
        <el-button type="primary" @click="handleGenerate" :loading="loading">
          {{ $t('generate') || 'Generate' }}
        </el-button>
      </div>
      <div class="btnRight">
        <el-button type="warning" @click="handleReBuild" :loading="loading">
          {{ $t('reBuild') || 'ReBuild' }}
        </el-button>
        <!-- 替换 Save a Draft 为 Generation History -->
        <el-button type="info" @click="showHistoryDrawer = true">
          {{ $t('generationHistory') || 'Generation History' }}
        </el-button>
        <el-button type="info" @click="handleSendToPrinter" :loading="printLoading" :disabled="!latestDocxUrl">
          {{ $t('sendToPrinter') || 'Send to Printer' }}
        </el-button>
      </div>
    </div>

    <!-- 生成历史抽屉 -->
    <el-drawer
      v-model="showHistoryDrawer"
      title="Generation History"
      direction="rtl"
      size="60%"
    >
      <el-table :data="generationHistory" border style="width: 100%" empty-text="No generation history yet">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="reportNo" label="Report No." width="150" />
        <el-table-column prop="generatedTime" label="Generated Time" width="180" />
        <el-table-column label="Download URL" min-width="250">
          <template #default="scope">
            <el-link type="primary" :href="scope.row.url" target="_blank" :underline="false" class="urlLink">
              {{ scope.row.url }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="120" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleDownloadFile(scope.row.url)">
              Download
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request.js'
import { BACKEND_BASE } from '@/utils/config.js'
import { onStatus, printWord, printPdf } from '@/utils/printBridge'

const props = defineProps({
  step1Ref: Object,
  step2Data: Object,
  testItemMap: { type: Object, default: () => ({}) },
  standardIdToCodeMap: { type: Object, default: () => ({}) },
})

const loading = ref(false)
const printLoading = ref(false)
const checkListData = ref(null)

// 生成历史相关状态
const showHistoryDrawer = ref(false)
const generationHistory = ref([]) 

// 计算属性：获取最新的生成 URL，供 Send to Printer 使用
const latestDocxUrl = computed(() => {
  if (generationHistory.value.length > 0) {
    return generationHistory.value[generationHistory.value.length - 1].url
  }
  return ''
})

let offStatus = null

// 初始化
if (props.step2Data) {
  checkListData.value = normalizeCheckListData(props.step2Data)
}

// 标准化后端数据
function normalizeCheckListData(data) {
  if (!data) return null
  return {
    checklistId: data.checklistId || data.ChecklistId || '',
    items: (data.items || data.Items || []).map((item, idx) => ({
      index: idx + 1,
      testItemId: item.testItem || item.TestItem || '',
      standards: item.standards || item.Standards || [],
      testGroup: item.testGroup || item.TestGroup || 0,
      samples: item.samples || item.Samples || [],
      parameters: parseParameter(item.parameter || item.Parameter || ''),
      parameter: item.parameter || item.Parameter || '',
      requirement: item.requirement || item.Requirement || '',
      cuttingMethod: item.cuttingMethod || item.CuttingMethod || ''
    }))
  }
}

// 解析参数字符串为结构化数据
function parseParameter(paramStr) {
  if (!paramStr || typeof paramStr !== 'string') return []

  try {
    let decoded = paramStr
      .replace(/\\u002B/g, '+')
      .replace(/\\u002D/g, '-')
      .replace(/\\u002F/g, '/')
      .replace(/\\u003A/g, ':')
      .replace(/\\u005B/g, '[')
      .replace(/\\u005D/g, ']')
      .replace(/\\n/g, '\n')
      .replace(/\\\\/g, '\\')

    const parsed = JSON.parse(decoded)
    const groups = []

    for (const [groupName, groupData] of Object.entries(parsed)) {
      const entries = groupData.values ? groupData.values : groupData
      const entryList = Object.entries(entries).map(([key, value]) => ({
        key: key,
        value: String(value)
      }))

      if (entryList.length > 0) {
        groups.push({ group: groupName, entries: entryList })
      }
    }

    const totalEntries = groups.reduce((sum, g) => sum + g.entries.length, 0)
    if (totalEntries === 0) return '-'

    return groups
  } catch (e) {
    return parseParameterLegacy(paramStr)
  }
}

// 旧格式解析（兜底）
function parseParameterLegacy(paramStr) {
  if (!paramStr || typeof paramStr !== 'string') return []

  const groups = []
  const groupRegex = /([A-Za-z0-9_]+):\s*\[(.*?)\]/gs

  let match
  while ((match = groupRegex.exec(paramStr)) !== null) {
    const groupName = match[1]
    const content = match[2]

    const entries = []
    const lines = content.split(/\n|,/).map(l => l.trim()).filter(Boolean)

    for (const line of lines) {
      const colonIdx = line.indexOf(':')
      if (colonIdx > 0) {
        entries.push({
          key: line.substring(0, colonIdx).trim(),
          value: line.substring(colonIdx + 1).trim()
        })
      }
    }

    if (entries.length > 0) {
      groups.push({ group: groupName, entries })
    }
  }
  
  const totalEntries = groups.reduce((sum, g) => sum + g.entries.length, 0)
  if (totalEntries === 0) return '-'

  return groups
}

// 计算显示数据：转换 ID 为名称
const displayItems = computed(() => {
  if (!checkListData.value?.items) return []

  const sortedItems = [...checkListData.value.items].sort((a, b) => {
    const ga = Number(a.testGroup) || 0
    const gb = Number(b.testGroup) || 0
    return ga - gb
  })

  return sortedItems.map((item, idx) => {
    const testItemInfo = props.testItemMap[item.testItemId]
    const testItemName = testItemInfo?.nameEn
      || testItemInfo?.nameChn
      || item.testItemId

    const standardsDisplay = (item.standards || []).map(stdId => ({
      id: stdId,
      code: props.standardIdToCodeMap[stdId] || stdId
    }))

    return {
      index: idx + 1,
      testItemId: item.testItemId,
      testItemName,
      standardsDisplay,
      testGroup: item.testGroup,
      samples: item.samples,
      parameters: item.parameters,
      parameter: item.parameter,
      requirement: item.requirement,
      cuttingMethod: item.cuttingMethod
    }
  })
})

/* 按钮处理 --------------------------------------------------------------------------------------*/

// 1. Generate 按钮：仅负责生成并将记录推入历史
async function handleGenerate() {
  if (!checkListData.value?.checklistId) {
    ElMessage.warning('No checklist to generate')
    return
  }

  try {
    await ElMessageBox.confirm(
      'This will finalize the checklist and generate the report. Continue?',
      'Confirm Generate',
      { confirmButtonText: 'Generate', cancelButtonText: 'Cancel', type: 'warning' }
    )

    let reportNo = ''
    if (props.step1Ref) {
      reportNo = props.step1Ref.reportNo
    }

    loading.value = true

    const payload = {
      checkListId: checkListData.value.checklistId,
      reportNo: reportNo || '',
      reviewer: '',
      dateTime: new Date().toISOString(),
      items: checkListData.value.items.map(item => {
        const testItemInfo = props.testItemMap[item.testItemId]
        const testItemName = testItemInfo?.nameEn
          || testItemInfo?.nameChn
          || item.testItemId

        const standardNames = (item.standards || []).map(stdId =>
          props.standardIdToCodeMap[stdId] || stdId
        )

        let processedParameter = ''

        if (item.parameters && Array.isArray(item.parameters) && item.parameters.length > 0) {
          const lines = []

          for (const group of item.parameters) {
            if (group.group && group.entries && group.entries.length > 0) {
              const validEntries = group.entries.filter(
                e => e.key && e.value !== undefined && e.value !== null && e.value !== ''
              )

              if (validEntries.length > 0) {
                lines.push(`${group.group}:`)
                for (const entry of validEntries) {
                  lines.push(`${entry.key}: ${entry.value}`)
                }
              }
            }
          }

          processedParameter = lines.length > 0 ? lines.join('\r\n') : ''
        } else {
          processedParameter = ''
        }

        return {
          testItem: testItemName,
          standards: standardNames,
          testGroup: String(item.testGroup || ''),
          samples: item.samples || [],
          parameter: processedParameter,
          requirement: item.requirement || '',
          cuttingMethod: item.cuttingMethod || ''
        }
      })
    }

    const res = await request.post('/review/generate-completed-checklist', payload)

    if (res.data.isSuccess) {
      ElMessage.success('Checklist generated successfully')

      const rawUrl = res.data.value?.downloadUrl   

      if (!rawUrl) {
        ElMessage.warning('未获取到文档下载链接')
        return
      }

      const fullUrl = rawUrl.startsWith('http')
        ? rawUrl
        : `${BACKEND_BASE}${rawUrl}`

      // 记录生成历史
      generationHistory.value.push({
        url: fullUrl,
        reportNo: reportNo || '-',
        generatedTime: new Date().toLocaleString()
      })

    } else {
      ElMessage.error(res.data.message || 'Generate failed')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Generate error:', error)
      ElMessage.error('Error generating checklist')
    }
  } finally {
    loading.value = false
  }
}

// 2. Send to Printer 按钮：负责将最新生成的 Word 文档发送给打印服务
async function handleSendToPrinter() {
  if (!latestDocxUrl.value) {
    ElMessage.warning('请先生成文档')
    return
  }

  printLoading.value = true
  try {
    await printWord(latestDocxUrl.value, {
      copies: 1,
      paper: { widthMm: 210, heightMm: 297 }
    })
    ElMessage.info('打印任务已发送，正在处理...')
  } catch (printError) {
    console.error('Print error:', printError)
    ElMessage.error('打印失败，请检查 PrintBridge 是否已启动')
  } finally {
    printLoading.value = false
  }
}

// 3. 下载文件方法
function handleDownloadFile(url) {
  if (!url) return
  // 使用原生 a 标签触发下载
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  // 如果你希望强制下载而不是在浏览器预览，可以加上 download 属性
  // link.download = '' 
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const emit = defineEmits(['rebuild'])
function handleReBuild() {
  emit('rebuild')
}

function setCheckListData(data) {
  checkListData.value = normalizeCheckListData(data)
}

defineExpose({
  setCheckListData,
  checkListData
})

// 在 script setup 中注册状态监听
onMounted(() => {
  offStatus = onStatus((event) => {
    if (event.status === 'success') {
      ElMessage.success('打印任务已提交到打印机')
    } else if (event.status === 'failed') {
      ElMessage.error('打印失败：' + (event.message || '请检查打印机状态'))
    }
  })
})

onUnmounted(() => {
  offStatus?.()
})
</script>

<style scoped>
/* 防止 URL 超出表格 */
.urlLink {
  word-break: break-all;
  white-space: normal;
}
</style>




<style scoped lang="scss">
.step3Container {
  padding: 20px;
}

/* 圆角大框样式 - 参考 Step1 的 border-card 风格 */
.checkListCard {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  background: var(--el-bg-color);
  overflow: hidden;
}

.cardHeader {
  padding: 16px 20px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color);
  
  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.cardBody {
  padding: 20px;
}

/* 表格样式优化 */
.checkListTable {
  :deep(th) {
    background: var(--el-fill-color-light);
    font-weight: 600;
  }
}

.itemName {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.itemId {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.standardsList {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.standardTag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: var(--el-fill-color);
  border-radius: 4px;
  font-size: 13px;
}

.standardId {
  color: var(--el-text-color-secondary);
  font-size: 11px;
  margin-left: 2px;
}

.emptyState {
  margin: 40px 0;
}

.actionButtons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color);
}

  .parameterBlock {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 2px 0;
  }

  .paramGroup {
    display: flex;
    align-items: flex-start;
    gap: 2px;
    padding: 6px 10px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
    border-left: 3px solid var(--el-color-primary);
  }

  .paramGroupLabel {
    font-weight: 700;
    font-size: 14px;
    color: var(--el-color-primary);
    white-space: nowrap;
    padding-top: 1px;
  }

  .paramGroupBracket {
    color: var(--el-text-color-secondary);
    font-weight: 300;
    font-size: 14px;
    padding-top: 1px;
  }

  .paramItems {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    padding: 0 4px;
  }

  .paramItem {
    font-size: 13px;
    font-family: 'Courier New', Consolas, monospace;
    padding: 1px 6px;
    border-radius: 3px;
    background: var(--el-bg-color);
    line-height: 1.6;
    transition: background 0.2s;

    &:hover {
      background: var(--el-fill-color);
    }
  }

  .paramKey {
    color: #e6a23c;
    font-weight: 500;
  }

  .paramColon {
    color: var(--el-text-color-secondary);
    margin: 0 2px;
  }

  .paramValue {
    color: var(--el-text-color-primary);
  }

  .parameterPlain {
    color: var(--el-text-color-regular);
    font-size: 13px;
  }

  .parameterDash {
    color: #909399;
    font-size: 14px;
  }
</style>
