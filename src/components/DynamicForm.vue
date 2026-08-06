<template>
  <div class="dynamic-form">
    <el-form :model="formData" label-width="140px" ref="formRef">
      <el-row :gutter="20">
        <el-col v-for="(field, fieldName) in schema"
                :key="fieldName"
                :span="12">
          <el-form-item :label="formatLabel(fieldName)"
                        :required="field.isRequired"
                        :prop="fieldName"
                        :rules="getRules(fieldName, field)">
            <!-- 有 allowedValues 时使用 Select -->
            <template v-if="field.allowedValues && field.allowedValues.length > 0">
              <!-- 布尔值用 Switch -->
              <el-switch v-if="field.type === 'boolean'"
                         v-model="formData[fieldName]"
                         :active-value="true"
                         :inactive-value="false" />
              <!-- 数字类型用 Select 或 InputNumber -->
              <el-select v-else-if="field.type === 'number' || field.type === 'integer'"
                         v-model="formData[fieldName]"
                         :placeholder="`请选择${formatLabel(fieldName)}`"
                         style="width: 100%"
                         clearable
                         filterable>
                <el-option v-for="item in field.allowedValues"
                           :key="item"
                           :label="item"
                           :value="item" />
              </el-select>
              <!-- 字符串用 Select -->
              <el-select v-else
                         v-model="formData[fieldName]"
                         :placeholder="`请选择${formatLabel(fieldName)}`"
                         style="width: 100%"
                         clearable
                         filterable
                         allow-create
                         default-first-option>
                <el-option v-for="item in field.allowedValues"
                           :key="item"
                           :label="item"
                           :value="item" />
              </el-select>
            </template>

            <!-- 没有 allowedValues 时使用普通输入 -->
            <template v-else>
              <!-- 布尔值 -->
              <el-switch v-if="field.type === 'boolean'"
                         v-model="formData[fieldName]"
                         :active-value="true"
                         :inactive-value="false" />
              <!-- 数字 -->
              <el-input-number v-else-if="field.type === 'number' || field.type === 'integer'"
                               v-model="formData[fieldName]"
                               :placeholder="`请输入${formatLabel(fieldName)}`"
                               style="width: 100%"
                               controls-position="right"
                               :min="0"
                               :step="field.type === 'integer' ? 1 : 0.1" />
              <!-- 日期时间 -->
              <el-date-picker v-else-if="field.type === 'datetime'"
                              v-model="formData[fieldName]"
                              type="datetime"
                              :placeholder="`请选择${formatLabel(fieldName)}`"
                              style="width: 100%"
                              value-format="YYYY-MM-DD HH:mm:ss" />
              <!-- 日期 -->
              <el-date-picker v-else-if="field.type === 'date'"
                              v-model="formData[fieldName]"
                              type="date"
                              :placeholder="`请选择${formatLabel(fieldName)}`"
                              style="width: 100%"
                              value-format="YYYY-MM-DD" />
              <!-- 字符串 -->
              <el-input v-else-if="field.type === 'string'"
                        v-model="formData[fieldName]"
                        :placeholder="`请输入${formatLabel(fieldName)}`"
                        style="width: 100%"
                        clearable />
              <!-- 其他类型 -->
              <el-input v-else
                        v-model="formData[fieldName]"
                        :placeholder="`请输入${formatLabel(fieldName)}`"
                        style="width: 100%"
                        clearable />
            </template>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
  import { reactive, watch, defineProps, defineEmits, ref, onMounted } from 'vue'

  // ==================== Props ====================
  const props = defineProps({
    schema: {
      type: Object,
      required: true,
      default: () => ({})
    },
    defaultValues: {
      type: Object,
      default: () => ({})
    }
  })

  // ==================== Emits ====================
  const emit = defineEmits(['update:modelValue', 'change'])

  // ==================== Refs ====================
  const formRef = ref(null)

  // ==================== 表单数据 ====================
  const formData = reactive({})

  // ==================== 方法 ====================

  /**
   * 格式化标签
   */
  function formatLabel(fieldName) {
    // 将驼峰转换为带空格的显示文本
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
  }

  /**
   * 获取表单验证规则
   */
  function getRules(fieldName, field) {
    const rules = []

    if (field.isRequired) {
      rules.push({
        required: true,
        message: `${formatLabel(fieldName)}为必填项`,
        trigger: 'change'
      })
    }

    if (field.type === 'number' || field.type === 'integer') {
      rules.push({
        type: 'number',
        message: `${formatLabel(fieldName)}必须为数字`,
        trigger: 'blur'
      })
    }

    return rules
  }

  /**
   * 初始化表单数据
   */
  function initFormData() {
    Object.keys(props.schema).forEach(fieldName => {
      const field = props.schema[fieldName]

      // 如果有默认值
      if (props.defaultValues && props.defaultValues[fieldName] !== undefined) {
        formData[fieldName] = props.defaultValues[fieldName]
        return
      }

      // 根据类型设置默认值
      if (field.allowedValues && field.allowedValues.length > 0) {
        formData[fieldName] = field.allowedValues[0]
      } else {
        switch (field.type) {
          case 'boolean':
            formData[fieldName] = false
            break
          case 'number':
          case 'integer':
            formData[fieldName] = 0
            break
          default:
            formData[fieldName] = ''
        }
      }
    })
  }

  /**
   * 获取表单数据
   */
  function getFormData() {
    return { ...formData }
  }

  /**
   * 验证表单
   */
  async function validateForm() {
    try {
      await formRef.value?.validate()
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 重置表单
   */
  function resetForm() {
    Object.keys(formData).forEach(key => {
      delete formData[key]
    })
    initFormData()
  }

  // ==================== 监听 ====================
  watch(formData, (newValue) => {
    emit('update:modelValue', newValue)
    emit('change', newValue)
  }, { deep: true })

  // ==================== 暴露方法 ====================
  defineExpose({
    getFormData,
    validateForm,
    resetForm
  })

  // ==================== 生命周期 ====================
  onMounted(() => {
    initFormData()
  })
</script>

<style scoped>
  .dynamic-form :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  .dynamic-form :deep(.el-select) {
    width: 100%;
  }

  .dynamic-form :deep(.el-input-number) {
    width: 100%;
  }

  .dynamic-form :deep(.el-date-editor) {
    width: 100%;
  }
</style>
