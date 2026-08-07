<template>
  <div class="condition-pool-layout">
    <!-- ==================== 左侧主内容区 ==================== -->
    <div class="left-main">
      <div class="condition-pool-container">
        <!-- 输入框区域 -->
        <div class="input-area">
          <el-input 
            v-model="poolIdInput" 
            placeholder="请输入条件池ID (格式: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
            style="flex: 1; min-width: 300px"
            clearable
            @keyup.enter="loadConditionPool"
          >
            <template #append>
              <el-button 
                type="primary" 
                @click="loadConditionPool"
                :loading="loading"
              >
                Load
              </el-button>
            </template>
          </el-input>
          <el-button @click="clearInput" :disabled="!poolIdInput">Clear</el-button>
          <el-tag v-if="poolId" type="success" size="large" class="status-tag">
            已加载: {{ poolId }}
          </el-tag>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>Loading...</span>
        </div>

        <!-- 条件池信息 -->
        <div v-else-if="conditionPoolData" class="condition-pool-content">
          <!-- 头部信息 -->
          <div class="condition-pool-header">
            <div class="header-left">
              <h3>Condition Pool Detail</h3>
              <el-tag :type="statusTagType(conditionPoolData.status)" size="large">
                {{ conditionPoolData.status }}
              </el-tag>
            </div>
            <div class="header-right">
              <span class="create-time">CreateTime: {{ formatDateTime(conditionPoolData.createdAt) }}</span>
              <el-button 
                type="primary" 
                @click="submitForm"
                :loading="submitting"
              >
                Submit Change
              </el-button>
              <el-button @click="resetForm">Reset</el-button>
            </div>
          </div>

          <!-- 动态表单 -->
          <div class="form-container">
            <el-divider content-position="left">Condition Config</el-divider>
            <DynamicForm 
              ref="formRef"
              :schema="convertedSchema"
              :default-values="defaultValues"
              @change="handleFormChange"
            />
          </div>

          <!-- 原始数据展示 -->
          <el-divider content-position="left">Original Data</el-divider>
          <div class="raw-data">
            <pre>{{ JSON.stringify(conditionPoolData, null, 2) }}</pre>
          </div>

          <!-- ==================== 条件池信息（内置在左侧下方） ==================== -->
          <el-divider content-position="left">Condition Pool Info</el-divider>
          <div class="condition-info-inline">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">ID:</span>
                <span class="info-value">{{ conditionPoolData.conditionPoolId }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value">
                  <el-tag :type="statusTagType(conditionPoolData.status)" size="small">
                    {{ conditionPoolData.status }}
                  </el-tag>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">字段数:</span>
                <span class="info-value">{{ Object.keys(conditionPoolData.conditions || {}).length }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">CreateTime:</span>
                <span class="info-value">{{ formatDateTime(conditionPoolData.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- ==================== 操作历史（内置在左侧下方） ==================== -->
          <el-divider content-position="left">Operation History</el-divider>
          <div class="history-inline">
            <div class="history-list">
              <div v-for="(item, index) in historyList" :key="index" class="history-item">
                <span class="history-time">{{ item.time }}</span>
                <span class="history-action">{{ item.action }}</span>
              </div>
              <div v-if="historyList.length === 0" class="empty-hint">No record</div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-else description="请输入条件池ID并点击加载" :image-size="120" />
      </div>
    </div>

    <!-- ==================== 右侧面板 ==================== -->
    <div class="right-panel">
      <!-- 上半部分：Formula 查询 -->
      <div class="right-top">
        <div class="panel-title">Formula Query</div>
        <div class="panel-content">
          <!-- 搜索区域 -->
          <div class="formula-search-area">
            <el-form :inline="true" :model="formulaSearchForm" class="formula-search-form">
              <el-form-item label="Standard Family">
                <el-select 
                  v-model="formulaSearchForm.standardFamilyId"
                  placeholder="请选择 Standard Family"
                  filterable
                  clearable
                  style="width: 100%"
                  @change="handleFormulaSearch"
                >
                  <el-option 
                    v-for="item in standardFamilyOptions" 
                    :key="item.id" 
                    :label="item.standardFamilyCode" 
                    :value="item.id" 
                  />
                </el-select>
              </el-form-item>
            </el-form>
          </div>

          <!-- Formula 列表（可选择） -->
          <div class="formula-list-area" v-loading="formulaLoading">
            <div v-if="formulaList.length > 0" class="formula-items">
              <div 
                v-for="(formula, index) in formulaList" 
                :key="index" 
                class="formula-item"
                :class="{ 'formula-selected': selectedFormulaIds.includes(formula.id) }"
                @click="toggleFormulaSelection(formula.id)"
              >
                <div class="formula-header">
                  <div class="formula-select-indicator">
                    <el-checkbox 
                      :model-value="selectedFormulaIds.includes(formula.id)"
                      @click.stop
                      @change="toggleFormulaSelection(formula.id)"
                    />
                    <span class="formula-name">{{ formula.name }}</span>
                  </div>
                  <el-tag :type="formula.isActive ? 'success' : 'danger'" size="small">
                    {{ formula.isActive ? 'Active' : 'Inactive' }}
                  </el-tag>
                </div>
                <div class="formula-body">
                  <div class="formula-field">
                    <span class="field-label">ID:</span>
                    <span class="field-value">{{ formula.id }}</span>
                  </div>
                  <div class="formula-field">
                    <span class="field-label">Param:</span>
                    <span class="field-value">{{ formula.paramName }}</span>
                  </div>
                  <div class="formula-field">
                    <span class="field-label">Expression:</span>
                    <span class="field-value">{{ formula.expressionTemplate }}</span>
                  </div>
                  <div v-if="formula.conditionFields && formula.conditionFields.length > 0" class="formula-field">
                    <span class="field-label">Conditions:</span>
                    <span class="field-value">
                      <el-tag 
                        v-for="field in formula.conditionFields" 
                        :key="field" 
                        size="small" 
                        style="margin-right: 4px;"
                      >
                        {{ field }}
                      </el-tag>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="formulaSearched" class="empty-hint">该 Standard Family 下暂无 Formula</div>
            <div v-else class="empty-hint">请选择 Standard Family 进行查询</div>
          </div>
        </div>
      </div>

      <!-- 下半部分：Match 功能 -->
      <div class="right-bottom">
        <div class="panel-title">Match Rules</div>
        <div class="panel-content">
          <div class="match-area">
            <!-- 条件池ID输入框（只读） -->
            <div class="match-input-group">
              <el-input 
                v-model="matchConditionPoolId"
                placeholder="条件池ID"
                readonly
                size="default"
              >
                <template #prepend>Condition Pool ID</template>
              </el-input>
              <el-button 
                type="primary" 
                @click="handleMatch"
                :loading="matchLoading"
                :disabled="!matchConditionPoolId || selectedFormulaIds.length === 0"
              >
                Match
              </el-button>
            </div>

            <!-- 选中的 Formula IDs 显示 -->
            <div class="selected-formulas">
              <span class="selected-label">已选 Formula ({{ selectedFormulaIds.length }}):</span>
              <el-tag 
                v-for="id in selectedFormulaIds" 
                :key="id" 
                size="small" 
                type="info"
                closable
                @close="removeFormulaSelection(id)"
                style="margin: 2px 4px;"
              >
                {{ id }}
              </el-tag>
              <span v-if="selectedFormulaIds.length === 0" class="empty-hint">请在上方选择 Formula</span>
            </div>

            <!-- 结果显示框 -->
            <div class="match-result" v-loading="matchLoading">
              <div v-if="matchResult" class="result-content">
                <el-divider content-position="left">Result</el-divider>
                <pre>{{ JSON.stringify(matchResult, null, 2) }}</pre>
              </div>
              <div v-else class="empty-hint">等待 Match 验证...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import DynamicForm from '@/components/DynamicForm.vue'

// ==================== 注入依赖 ====================
const request = inject('request')

// ==================== Props ====================
const props = defineProps({
  conditionPoolId: {
    type: String,
    default: ''
  }
})

// ==================== 状态 ====================
const loading = ref(false)
const submitting = ref(false)
const conditionPoolData = ref(null)
const formRef = ref(null)
const formData = ref({})
const poolIdInput = ref('')
const poolId = ref('')

// ==================== Formula 查询相关状态 ====================
const formulaLoading = ref(false)
const formulaSearched = ref(false)
const standardFamilyOptions = ref([])
const formulaList = ref([])
const selectedFormulaIds = ref([]) // 选中的 Formula ID 列表

const formulaSearchForm = reactive({
  standardFamilyId: ''
})

// ==================== Match 相关状态 ====================
const matchLoading = ref(false)
const matchConditionPoolId = ref('')
const matchResult = ref(null)

// ==================== 操作历史数据 ====================
const historyList = ref([])

// ==================== GUID 验证 ====================
function isValidGuid(value) {
  if (!value || typeof value !== 'string') return false
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return guidRegex.test(value.trim())
}

// ==================== 类型转换工具 ====================
function convertCSharpType(csharpType) {
  if (!csharpType) return 'string'

  const typeMap = {
    'System.String': 'string',
    'System.Int32': 'integer',
    'System.Int64': 'integer',
    'System.Int16': 'integer',
    'System.Double': 'number',
    'System.Decimal': 'number',
    'System.Single': 'number',
    'System.Boolean': 'boolean',
    'System.DateTime': 'datetime',
    'System.DateTimeOffset': 'datetime',
    'System.Guid': 'string',
    'System.Byte': 'integer'
  }

  for (const [key, value] of Object.entries(typeMap)) {
    if (csharpType.includes(key)) {
      return value
    }
  }
  return 'string'
}

function convertConditionsToSchema(conditions) {
  if (!conditions || typeof conditions !== 'object') {
    return {}
  }

  const schema = {}
  Object.keys(conditions).forEach(key => {
    const field = conditions[key]

    if (field && typeof field === 'object') {
      if ('type' in field || 'isRequired' in field || 'allowedValues' in field) {
        schema[key] = {
          type: field.type ? convertCSharpType(field.type) : 'string',
          isRequired: field.isRequired || false,
          allowedValues: field.allowedValues || []
        }
      } else {
        schema[key] = {
          type: convertCSharpType(typeof field),
          isRequired: false,
          allowedValues: [],
          defaultValue: field
        }
      }
    } else {
      schema[key] = {
        type: convertCSharpType(typeof field),
        isRequired: false,
        allowedValues: [],
        defaultValue: field
      }
    }
  })

  return schema
}

// ==================== 计算属性 ====================
const convertedSchema = computed(() => {
  if (!conditionPoolData.value || !conditionPoolData.value.conditions) {
    return {}
  }
  return convertConditionsToSchema(conditionPoolData.value.conditions)
})

const defaultValues = computed(() => {
  if (!conditionPoolData.value || !conditionPoolData.value.conditions) {
    return {}
  }

  const values = {}
  Object.keys(conditionPoolData.value.conditions).forEach(key => {
    const field = conditionPoolData.value.conditions[key]
    if (field && typeof field === 'object') {
      if ('defaultValue' in field) {
        values[key] = field.defaultValue
      } else if (field.allowedValues && field.allowedValues.length > 0) {
        values[key] = field.allowedValues[0]
      }
    } else {
      values[key] = field
    }
  })
  return values
})

// ==================== 方法 ====================

function loadConditionPool() {
  const inputValue = poolIdInput.value.trim()
  
  if (!inputValue) {
    ElMessage.warning('请输入条件池ID')
    return
  }
  
  if (!isValidGuid(inputValue)) {
    ElMessage.error('请输入有效的GUID格式 (例如: 123e4567-e89b-12d3-a456-426614174000)')
    return
  }
  
  if (poolId.value === inputValue) {
    fetchConditionPool()
    ElMessage.info('数据已刷新')
    return
  }
  
  poolId.value = inputValue
  fetchConditionPool()
}

function clearInput() {
  poolIdInput.value = ''
  poolId.value = ''
  conditionPoolData.value = null
  matchConditionPoolId.value = ''
  matchResult.value = null
  selectedFormulaIds.value = []
  historyList.value = []
  ElMessage.info('已清空')
}

async function fetchConditionPool() {
  if (!poolId.value) {
    ElMessage.warning('缺少条件池ID')
    return
  }

  if (!request) {
    ElMessage.error('请求服务未初始化，请检查应用配置')
    console.error('request is not defined. Please ensure it is provided via inject.')
    return
  }

  loading.value = true
  try {
    const response = await request.get(`/ConditionPool/${poolId.value}`)

    if (response.data.isSuccess) {
      conditionPoolData.value = response.data.value
      // 同步更新 Match 区域的 ConditionPoolId
      matchConditionPoolId.value = poolId.value
      ElMessage.success('条件池数据加载成功')
      
      historyList.value.unshift({
        time: new Date().toLocaleString(),
        action: `加载条件池: ${poolId.value}`
      })
    } else {
      ElMessage.error(response.data.error || '加载条件池数据失败')
    }
  } catch (error) {
    console.error('获取条件池失败:', error)
    ElMessage.error(`获取条件池失败: ${error.message || '网络错误'}`)
  } finally {
    loading.value = false
  }
}

// ==================== Formula 查询方法 ====================

async function fetchStandardFamilies() {
  try {
    const res = await request.get('/StandardFamily/getall')
    if (res.data.isSuccess) {
      standardFamilyOptions.value = res.data.value || []
    } else {
      console.error('Failed to load standard families:', res.data.error)
      standardFamilyOptions.value = []
    }
  } catch (error) {
    console.error('Failed to fetch standard families:', error)
    standardFamilyOptions.value = []
  }
}

async function handleFormulaSearch() {
  const familyId = formulaSearchForm.standardFamilyId
  if (!familyId) {
    formulaList.value = []
    formulaSearched.value = false
    // 清空选中
    selectedFormulaIds.value = []
    return
  }

  const selectedFamily = standardFamilyOptions.value.find(item => item.id === familyId)
  if (!selectedFamily || !selectedFamily.formulaIds || selectedFamily.formulaIds.length === 0) {
    formulaList.value = []
    formulaSearched.value = true
    selectedFormulaIds.value = []
    return
  }

  formulaLoading.value = true
  formulaSearched.value = true
  // 切换 Standard Family 时清空选中
  selectedFormulaIds.value = []

  try {
    const res = await request.get('/ParamFormula/get-by-ids', {
      params: {
        ids: selectedFamily.formulaIds
      }
    })

    if (res.data.isSuccess) {
      formulaList.value = res.data.value || []
      if (formulaList.value.length === 0) {
        ElMessage.info('该 Standard Family 下暂无 Formula')
      }
    } else {
      ElMessage.error(res.data.error || '获取 Formula 列表失败')
      formulaList.value = []
    }
  } catch (error) {
    console.error('Failed to fetch formulas:', error)
    ElMessage.error('获取 Formula 列表失败')
    formulaList.value = []
  } finally {
    formulaLoading.value = false
  }
}

// ==================== Formula 选择方法 ====================
function toggleFormulaSelection(formulaId) {
  const index = selectedFormulaIds.value.indexOf(formulaId)
  if (index > -1) {
    selectedFormulaIds.value.splice(index, 1)
  } else {
    selectedFormulaIds.value.push(formulaId)
  }
}

function removeFormulaSelection(formulaId) {
  const index = selectedFormulaIds.value.indexOf(formulaId)
  if (index > -1) {
    selectedFormulaIds.value.splice(index, 1)
  }
}

// ==================== Match 方法 ====================
async function handleMatch() {
  if (!matchConditionPoolId.value) {
    ElMessage.warning('请先加载条件池')
    return
  }

  if (selectedFormulaIds.value.length === 0) {
    ElMessage.warning('请至少选择一个 Formula')
    return
  }

  const requestData = {
    ConditionPoolId: matchConditionPoolId.value,
    FormulaIds: selectedFormulaIds.value
  }

  matchLoading.value = true
  matchResult.value = null

  try {
    const response = await request.put('/LogicValidation/test', requestData)

    if (response.data.isSuccess) {
      matchResult.value = response.data.value || { message: '验证通过' }
      ElMessage.success('Match 验证完成')
      
      historyList.value.unshift({
        time: new Date().toLocaleString(),
        action: `Match 验证: ${selectedFormulaIds.value.length} 个 Formula`
      })
    } else {
      ElMessage.error(response.data.error || 'Match 验证失败')
      matchResult.value = { error: response.data.error || '验证失败' }
    }
  } catch (error) {
    console.error('Match 验证失败:', error)
    ElMessage.error(`Match 验证失败: ${error.message || '网络错误'}`)
    matchResult.value = { error: error.message || '网络错误' }
  } finally {
    matchLoading.value = false
  }
}

function statusTagType(status) {
  const map = {
    'Draft': 'info',
    'Validated': 'success',
    'Expired': 'danger'
  }
  return map[status] || ''
}

function formatDateTime(dateTime) {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function handleFormChange(data) {
  formData.value = data
  console.log('表单数据变化:', data)
}

async function submitForm() {
  const data = formRef.value?.getFormData()
  if (!data || Object.keys(data).length === 0) {
    ElMessage.warning('请先配置条件')
    return
  }

  const schema = convertedSchema.value
  const missingFields = []
  Object.keys(schema).forEach(key => {
    if (schema[key].isRequired && (data[key] === undefined || data[key] === null || data[key] === '')) {
      missingFields.push(key)
    }
  })

  if (missingFields.length > 0) {
    ElMessage.warning(`请填写必填字段: ${missingFields.join(', ')}`)
    return
  }

  const requestData = {
    ConditionPoolId: poolId.value,
    Conditions: data
  }

  submitting.value = true
  try {
    const response = await request.post('/LogicValidation/condition-update', requestData)

    if (response.data.isSuccess) {
      const updatedData = response.data.value
      if (updatedData) {
        conditionPoolData.value = updatedData
        ElMessage.success('条件提交成功，数据已更新')
        
        historyList.value.unshift({
          time: new Date().toLocaleString(),
          action: `提交条件配置 (${Object.keys(data).length} 个字段)`
        })
      } else {
        ElMessage.success('条件提交成功')
        await fetchConditionPool()
      }
    } else {
      ElMessage.error(response.data.error || '条件提交失败')
    }
  } catch (error) {
    console.error('提交条件失败:', error)
    ElMessage.error(`提交条件失败: ${error.message || '网络错误'}`)
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  formRef.value?.resetForm()
  ElMessage.info('表单已重置')
}

// ==================== 暴露方法 ====================
defineExpose({
  refresh: fetchConditionPool,
  loadConditionPool
})

// ==================== 监听 Props ID 变化 ====================
watch(() => props.conditionPoolId, (newId) => {
  if (newId && isValidGuid(newId)) {
    poolIdInput.value = newId
    poolId.value = newId
    fetchConditionPool()
  }
}, { immediate: true })

// ==================== 初始化 ====================
onMounted(() => {
  fetchStandardFamilies()
})
</script>

<style scoped lang="scss">
.condition-pool-layout {
  display: flex;
  gap: 16px;
  height: 100%;
  min-height: 600px;
}

/* ==================== 左侧主内容 ==================== */
.left-main {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 10px;
  border: 1px solid var(--el-border-color);
  padding: 16px;
  overflow: auto;
}

.condition-pool-container {
  height: 100%;
}

/* 输入框区域 */
.input-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0 16px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.input-area .el-input {
  max-width: 500px;
}

.status-tag {
  font-family: monospace;
  font-size: 13px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
  font-size: 16px;
  color: #409eff;
}

.loading-container .el-icon {
  font-size: 32px;
}

.condition-pool-content {
  min-height: 400px;
}

.condition-pool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.create-time {
  font-size: 14px;
  color: #909399;
}

.form-container {
  padding: 12px 0;
}

.raw-data {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  max-height: 200px;
  overflow: auto;
}

.raw-data pre {
  margin: 0;
  font-size: 13px;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-all;
}

/* ==================== 条件池信息（内置在左侧下方） ==================== */
.condition-info-inline {
  padding: 12px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 14px;
}

.info-label {
  color: #909399;
}

.info-value {
  color: #303133;
  font-weight: 500;
  word-break: break-all;
}

/* ==================== 操作历史（内置在左侧下方） ==================== */
.history-inline {
  padding: 12px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px 16px;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
  border: 1px solid #f0f0f0;
}

.history-item:hover {
  background: #f0f7ff;
  border-color: #409eff;
}

.history-time {
  color: #909399;
  min-width: 160px;
}

.history-action {
  color: #303133;
  flex: 1;
  margin-left: 16px;
}

/* ==================== 右侧面板 ==================== */
.right-panel {
  width: 50%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.right-top,
.right-bottom {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  border: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 200px;
}

.right-top {
  flex: 1.2;
}

.right-bottom {
  flex: 1;
}

.panel-title {
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
  flex-shrink: 0;
}

.panel-content {
  padding: 12px 16px;
  flex: 1;
  overflow: auto;
}

/* ==================== Formula 查询样式 ==================== */
.formula-search-area {
  margin-bottom: 12px;
}

.formula-search-form {
  display: flex;
  width: 100%;
}

.formula-search-form .el-form-item {
  flex: 1;
  margin-bottom: 0;
}

.formula-search-form .el-select {
  width: 100%;
}

.formula-list-area {
  flex: 1;
  overflow: auto;
}

.formula-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.formula-item {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 10px 12px;
  background: #fafafa;
  transition: all 0.2s;
  cursor: pointer;
}

.formula-item:hover {
  border-color: #409eff;
  background: #f0f7ff;
}

.formula-item.formula-selected {
  border-color: #409eff;
  background: #ecf5ff;
  box-shadow: 0 0 0 1px #409eff;
}

.formula-select-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.formula-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.formula-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.formula-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.formula-field {
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

/* ==================== Match 区域样式 ==================== */
.match-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.match-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.match-input-group .el-input {
  flex: 1;
}

.match-input-group .el-button {
  flex-shrink: 0;
}

.selected-formulas {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  min-height: 36px;
}

.selected-label {
  font-size: 13px;
  color: #606266;
  margin-right: 4px;
}

.match-result {
  flex: 1;
  background: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  min-height: 100px;
  max-height: 200px;
  overflow: auto;
}

.match-result pre {
  margin: 0;
  font-size: 13px;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-all;
}

.result-content {
  height: 100%;
}

.result-content .el-divider {
  margin: 8px 0;
}

.empty-hint {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  text-align: center;
  padding: 8px 0;
}

/* ==================== 响应式 ==================== */
@media (max-width: 1024px) {
  .right-panel {
    width: 40%;
  }
}

@media (max-width: 768px) {
  .condition-pool-layout {
    flex-direction: column;
  }

  .right-panel {
    width: 100%;
    flex-direction: row;
    gap: 16px;
  }

  .right-top,
  .right-bottom {
    flex: 1;
    min-height: 150px;
  }

  .input-area .el-input {
    min-width: unset;
    width: 100%;
    max-width: unset;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .history-item {
    flex-direction: column;
    gap: 4px;
  }
  
  .history-time {
    min-width: unset;
  }
  
  .history-action {
    margin-left: 0;
  }

  .match-input-group {
    flex-direction: column;
  }

  .match-input-group .el-button {
    width: 100%;
  }
}

  /* 更淡的滚动条样式 */
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

  /* Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: #e0e3e8 #f5f7fa;
  }
</style>
