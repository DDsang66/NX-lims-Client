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
              <!-- 先用 computed 取值 -->
              <template v-if="scope.row.parameters && scope.row.parameters.length">
                <div class="parameterBlock">
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
              <span v-else class="parameterPlain">{{ scope.row.parameter }}</span>
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
        <el-button type="info" @click="handleSaveDraft" :loading="loading">
          {{ $t('saveDraft') || 'Save a Draft' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request.js'

  const props = defineProps({
    step1Dom: Object,
    step2Data: Object,
    testItemMap: { type: Object, default: () => ({}) },
    standardIdToCodeMap: { type: Object, default: () => ({}) },
  })

const loading = ref(false)
const checkListData = ref(null)

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
        // 尝试解析 parameter 为结构化数据
        parameters: parseParameter(item.parameter || item.Parameter || ''),
        parameter: item.parameter || item.Parameter || '', // 保留原始值作为 fallback
        requirement: item.requirement || item.Requirement || '',
        cuttingMethod: item.cuttingMethod || item.CuttingMethod || ''
      }))
    }
  }

  // 解析参数字符串为结构化数据
  function parseParameter(paramStr) {
    if (!paramStr || typeof paramStr !== 'string') return []

    try {
      // 先处理 Unicode 转义
      let decoded = paramStr
        .replace(/\\u002B/g, '+')
        .replace(/\\u002D/g, '-')
        .replace(/\\u002F/g, '/')
        .replace(/\\u003A/g, ':')
        .replace(/\\u005B/g, '[')
        .replace(/\\u005D/g, ']')
        .replace(/\\n/g, '\n')
        .replace(/\\\\/g, '\\')

      // 尝试解析 JSON
      const parsed = JSON.parse(decoded)

      console.log('Parsed JSON:', parsed)

      const groups = []

      // 遍历顶层对象 (A, B, C...)
      for (const [groupName, groupData] of Object.entries(parsed)) {
        // 如果有 values 字段，取 values 内容；否则直接用整个对象
        const entries = groupData.values ? groupData.values : groupData

        // 转换为 key: value 数组
        const entryList = Object.entries(entries).map(([key, value]) => ({
          key: key,
          value: String(value)
        }))

        if (entryList.length > 0) {
          groups.push({
            group: groupName,
            entries: entryList
          })
        }
      }
      console.log('parseParameter return:', groups) 
      return groups.length > 0 ? groups : null
    } catch (e) {
      // JSON 解析失败，尝试旧格式解析
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

    return groups.length > 0 ? groups : null
  }

// 计算显示数据：转换 ID 为名称
  const displayItems = computed(() => {
    if (!checkListData.value?.items) return []

    return checkListData.value.items.map((item, idx) => {
      // ✅ 用 item.testItemId（不是 item.testItem）
      const testItemInfo = props.testItemMap[item.testItemId]
      const testItemName = testItemInfo?.nameEn
        || testItemInfo?.nameChn
        || item.testItemId

      const standardsDisplay = (item.standards || []).map(stdId => ({
        id: stdId,
        code: props.standardIdToCodeMap[stdId] || stdId
      }))

      console.log('Item parameters in displayItems:', item.parameters)

      return {
        index: idx + 1,
        testItemId: item.testItemId,  // ✅ 用 item.testItemId
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

      loading.value = true

      const payload = {
        checkListId: checkListData.value.checklistId,
        reportNo: "",
        reviewer: '',
        dateTime: new Date().toISOString(),
        items: checkListData.value.items.map(item => {
          // 获取 testItem 名称
          const testItemInfo = props.testItemMap[item.testItemId]
          const testItemName = testItemInfo?.nameEn
            || testItemInfo?.nameChn
            || item.testItemId

          // 获取 standards 名称列表
          const standardNames = (item.standards || []).map(stdId =>
            props.standardIdToCodeMap[stdId] || stdId
          )

          // ✅ 构建处理后的 parameter：使用结构化参数
          let processedParameter = ''

          // 如果有结构化参数，转换为后端期望的格式
          if (item.parameters && Array.isArray(item.parameters) && item.parameters.length > 0) {
            // 构建参数对象
            const paramObj = {}
            for (const group of item.parameters) {
              if (group.group && group.entries && group.entries.length > 0) {
                const entries = {}
                for (const entry of group.entries) {
                  entries[entry.key] = entry.value
                }
                paramObj[group.group] = entries
              }
            }
            // 转为 JSON 字符串
            processedParameter = JSON.stringify(paramObj)
          } else {
            // 如果没有结构化参数，使用原始值
            processedParameter = item.parameter || ''
          }

          return {
            testItem: testItemName,
            standards: standardNames,
            testGroup: String(item.testGroup || ''),
            samples: item.samples || [],
            parameter: processedParameter, // ✅ 使用处理后的参数
            requirement: item.requirement || '',
            cuttingMethod: item.cuttingMethod || ''
          }
        })
      }

      const res = await request.post('/review/generate-completed-checklist', payload)

      if (res.data.isSuccess) {
        ElMessage.success('Checklist generated successfully')

        const docxUrl = res.data.value?.docxUrl || res.data.value?.url
        if (docxUrl) {
          window.open(docxUrl, '_blank')
        }
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

function handleReBuild() {
  emit('rebuild')
}

async function handleSaveDraft() {
  if (!checkListData.value?.checklistId) {
    ElMessage.warning('No checklist to save')
    return
  }
  
  loading.value = true
  try {
    const res = await request.post('/review/save-draft', {
      checklistId: checkListData.value.checklistId
    })
    
    if (res.data.isSuccess) {
      ElMessage.success('Draft saved successfully')
    } else {
      ElMessage.error(res.data.message || 'Save failed')
    }
  } catch (error) {
    console.error('Save draft error:', error)
    ElMessage.error('Error saving draft')
  } finally {
    loading.value = false
  }
}

const emit = defineEmits(['rebuild'])

function setCheckListData(data) {
  checkListData.value = normalizeCheckListData(data)
}

defineExpose({
  setCheckListData,
  checkListData
})
</script>

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
</style>
