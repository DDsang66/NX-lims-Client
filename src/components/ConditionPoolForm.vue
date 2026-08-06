<template>
  <div class="condition-pool-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- 条件池信息 -->
    <div v-else-if="conditionPoolData" class="condition-pool-content">
      <!-- 头部信息 -->
      <div class="condition-pool-header">
        <div class="header-left">
          <h3>条件池详情</h3>
          <el-tag :type="statusTagType(conditionPoolData.status)" size="large">
            {{ conditionPoolData.status }}
          </el-tag>
        </div>
        <div class="header-right">
          <span class="create-time">创建时间: {{ formatDateTime(conditionPoolData.createdAt) }}</span>
          <el-button type="primary" @click="submitForm">提交条件</el-button>
          <el-button @click="resetForm">重置</el-button>
        </div>
      </div>

      <!-- 动态表单 -->
      <div class="form-container">
        <el-divider content-position="left">条件配置</el-divider>
        <DynamicForm ref="formRef"
                     :schema="convertedSchema"
                     :default-values="defaultValues"
                     @change="handleFormChange" />
      </div>

      <!-- 原始数据展示 -->
      <el-divider content-position="left">原始数据</el-divider>
      <div class="raw-data">
        <pre>{{ JSON.stringify(conditionPoolData, null, 2) }}</pre>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="暂无条件池数据" />
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, computed, inject } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Loading } from '@element-plus/icons-vue'
  import DynamicForm from './DynamicForm.vue'

  const request = inject('request') // 注入 request 实例

  // ==================== Props ====================
  const props = defineProps({
    conditionPoolId: {
      type: String,
      required: true
    }
  })

  // ==================== 状态 ====================
  const loading = ref(false)
  const conditionPoolData = ref(null)
  const formRef = ref(null)
  const formData = ref({})

  // ==================== 类型转换工具 ====================
  /**
   * 将 C# 类型字符串转换为前端类型
   */
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

  /**
   * 将条件数据转换为表单 schema
   */
  function convertConditionsToSchema(conditions) {
    if (!conditions || typeof conditions !== 'object') {
      return {}
    }

    const schema = {}
    Object.keys(conditions).forEach(key => {
      const field = conditions[key]

      // 判断字段结构
      if (field && typeof field === 'object') {
        // 如果字段包含 type, isRequired, allowedValues
        if ('type' in field || 'isRequired' in field || 'allowedValues' in field) {
          schema[key] = {
            type: field.type ? convertCSharpType(field.type) : 'string',
            isRequired: field.isRequired || false,
            allowedValues: field.allowedValues || []
          }
        } else {
          // 如果是简单值，直接使用
          schema[key] = {
            type: convertCSharpType(typeof field),
            isRequired: false,
            allowedValues: [],
            defaultValue: field
          }
        }
      } else {
        // 如果是简单类型
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
  /**
   * 转换后的 schema
   */
  const convertedSchema = computed(() => {
    if (!conditionPoolData.value || !conditionPoolData.value.conditions) {
      return {}
    }
    return convertConditionsToSchema(conditionPoolData.value.conditions)
  })

  /**
   * 默认值
   */
  const defaultValues = computed(() => {
    if (!conditionPoolData.value || !conditionPoolData.value.conditions) {
      return {}
    }

    const values = {}
    Object.keys(conditionPoolData.value.conditions).forEach(key => {
      const field = conditionPoolData.value.conditions[key]
      if (field && typeof field === 'object') {
        // 如果有 defaultValue 字段
        if ('defaultValue' in field) {
          values[key] = field.defaultValue
        }
        // 如果有 allowedValues，取第一个作为默认值
        else if (field.allowedValues && field.allowedValues.length > 0) {
          values[key] = field.allowedValues[0]
        }
      } else {
        values[key] = field
      }
    })
    return values
  })

  // ==================== 方法 ====================

  /**
   * 获取条件池数据
   */
  async function fetchConditionPool() {
    if (!props.conditionPoolId) {
      ElMessage.warning('缺少条件池ID')
      return
    }

    loading.value = true
    try {
      const response = await request.get(`/ConditionPool/${props.conditionPoolId}`)

      if (response.data.isSuccess) {
        conditionPoolData.value = response.data.value
        ElMessage.success('条件池数据加载成功')
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

  /**
   * 状态标签类型
   */
  function statusTagType(status) {
    const map = {
      'Draft': 'info',
      'Validated': 'success',
      'Expired': 'danger'
    }
    return map[status] || ''
  }

  /**
   * 格式化时间
   */
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

  /**
   * 表单数据变化
   */
  function handleFormChange(data) {
    formData.value = data
    console.log('表单数据变化:', data)
  }

  /**
   * 提交表单
   */
  function submitForm() {
    const data = formRef.value?.getFormData()
    if (!data || Object.keys(data).length === 0) {
      ElMessage.warning('请先配置条件')
      return
    }

    // 验证必填字段
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

    console.log('提交的条件数据:', data)
    ElMessage.success('条件已提交')

    // 这里调用你的提交接口
    // await request.post('/ConditionPool/submit', {
    //   conditionPoolId: props.conditionPoolId,
    //   conditions: data
    // })
  }

  /**
   * 重置表单
   */
  function resetForm() {
    formRef.value?.resetForm()
    ElMessage.info('表单已重置')
  }

  // ==================== 生命周期 ====================
  onMounted(() => {
    fetchConditionPool()
  })

  // ==================== 暴露方法 ====================
  defineExpose({
    refresh: fetchConditionPool
  })
</script>

<style scoped>
  .condition-pool-container {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
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
    padding: 16px 0;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 20px;
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
    gap: 16px;
  }

  .create-time {
    font-size: 14px;
    color: #909399;
  }

  .form-container {
    padding: 16px 0;
  }

  .raw-data {
    background: #f5f7fa;
    border-radius: 4px;
    padding: 16px;
    max-height: 300px;
    overflow: auto;
  }

    .raw-data pre {
      margin: 0;
      font-size: 13px;
      color: #303133;
      white-space: pre-wrap;
      word-break: break-all;
    }
</style>
