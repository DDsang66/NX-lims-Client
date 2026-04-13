<template>
  <div class="checklist-container">

    <!-- 模块 1: Physics -->
    <div class="module-section" v-if="physicsData.length > 0">
      <h5>Physics</h5>
      <el-table ref="physicsTableRef"
                :data="physicsData"
                style="width: 100%"
                :span-method="({ row, column, rowIndex, columnIndex }) => getSpanMethod({ row, column, rowIndex, columnIndex }, physicsData)"
                border
                row-key="id">

        <!-- 移除了 type="selection" 列 -->
        <el-table-column prop="itemName" label="Test Item" width="220" />

        <el-table-column prop="standards" label="Standard">
          <template #default="{ row }">
            {{ row.standards && row.standards[0] ? row.standards[0] : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="parameters" label="Parameters">
          <template #default="{ row }">
            <div class="param-cell" v-html="formatParams(row.parameters)"></div>
          </template>
        </el-table-column>

        <el-table-column label="Sample" width="180">
          <template #default="{ row }">
            <el-input v-model="row.samples"
                      placeholder="Confirm Your Sample"
                      clearable
                      @blur="handleSampleBlur(row)" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 模块 2: Wet -->
    <div class="module-section" v-if="wetData.length > 0">
      <h5>Wet</h5>
      <el-table ref="wetTableRef"
                :data="wetData"
                style="width: 100%"
                :span-method="({ row, column, rowIndex, columnIndex }) => getSpanMethod({ row, column, rowIndex, columnIndex }, wetData)"
                border
                row-key="id">

        <!-- 移除了 type="selection" 列 -->
        <el-table-column prop="itemName" label="Test Item" width="220" />

        <el-table-column prop="standards" label="Standard">
          <template #default="{ row }">
            {{ row.standards && row.standards[0] ? row.standards[0] : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="parameters" label="Parameters">
          <template #default="{ row }">
            <div class="param-cell" v-html="formatParams(row.parameters)"></div>
          </template>
        </el-table-column>

        <el-table-column label="Sample" width="180">
          <template #default="{ row }">
            <el-input v-model="row.samples"
                      placeholder="Confirm Your Sample"
                      clearable
                      @blur="handleSampleBlur(row)" />
          </template>
        </el-table-column>
      </el-table>
    </div>

  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'

  // 定义 Props
  const props = defineProps({
    rawData: { type: Array, default: () => [] },
    fullRefresh: { type: Boolean, default: false }
  })

  // 定义 Emits
  const emit = defineEmits(['update:selected'])

  // 表格引用
  const physicsTableRef = ref()
  const wetTableRef = ref()

  // --- 1. 数据预处理逻辑 ---
  const processedList = ref([])

  watch(
  () => props.rawData,
  (newVal) => {
    if (!newVal) return
    
    const list = []
    
    // 创建一个旧数据的 Map，用于快速查找，key 为 id
    // 这样我们可以在构建新列表时，保留旧的 samples
    const oldDataMap = new Map(processedList.value.map(item => [item.id, item]))

    newVal.forEach((item, index) => {
      const standards = item.standards || []
      standards.forEach((std, stdIndex) => {
        // 生成唯一的 ID
        const id = `${item.itemName}-${std}-${index}-${stdIndex}`
        
        // 检查旧数据中是否存在该 ID
        const oldRow = oldDataMap.get(id)
        
        // 核心逻辑：如果旧数据存在且有 samples，则使用旧数据的 samples；否则使用新数据的 samples
        // 同时也保留新数据的 parameters (因为这是后端回填的重点)
        // 关键修改：只有非全量刷新时才保留 samples
        const preservedSamples = (!props.fullRefresh && oldRow && oldRow.samples)
          ? oldRow.samples
          : (item.samples || '')


        list.push({
          ...item,
          id: id,
          standards: [std],
          samples: preservedSamples, // 使用保留的 samples
          parameters: item.parameters, // 确保使用最新的 parameters
          _originalItem: item
        })
      })
    })

    processedList.value = list
  },
  { immediate: true, deep: true }
)

  // --- 2. 数据分类逻辑 ---
const physicsData = computed(() => {
  // 1. 过滤
  const list = processedList.value.filter(item => item.types && item.types.includes('Physics'))
  
  // 2. 排序：按 itemName 字母顺序排序，这样相同的项目就会挨在一起
  // 使用 localeCompare 支持中文排序
  return list.sort((a, b) => (a.itemName || '').localeCompare(b.itemName || '', 'en'))
})

const wetData = computed(() => {
  // 1. 过滤
  const list = processedList.value.filter(item => item.types && item.types.includes('Wet'))
  
  // 2. 排序
  return list.sort((a, b) => (a.itemName || '').localeCompare(b.itemName || '', 'en'))
})

  // --- 3. 合并单元格逻辑 (核心修改) ---
  const getSpanMethod = ({ row, column, rowIndex, columnIndex }, tableData) => {
    if (!row || !tableData || tableData.length === 0) {
      return [1, 1]
    }

    // columnIndex 0 是 Test Item 列
    if (columnIndex === 0) {
      const currentName = row.itemName
      if (!currentName) return [1, 1]

      const prevName = rowIndex > 0 ? tableData[rowIndex - 1].itemName : null

      if (currentName !== prevName) {
        let rowspan = 1
        for (let i = rowIndex + 1; i < tableData.length; i++) {
          if (tableData[i] && tableData[i].itemName === currentName) {
            rowspan++
          } else {
            break
          }
        }
        return [rowspan, 1]
      } else {
        return [0, 0]
      }
    }

    // 其他列 (Standard, Parameters, Sample) 保持独立，不合并
    return [1, 1]
  }

  // --- 4. 交互逻辑 ---
  const handleSampleBlur = (row) => {
    if (row.samples) {
      row.samples = row.samples.trim()
    }
  }

// --- 5. 样式与格式化逻辑 ---
const formatParams = (params) => {
  // 1. 如果为空，直接返回
  if (!params) return ''

  // 2. 如果是字符串（兼容旧数据），直接逗号换行
  if (typeof params === 'string') {
    return params.replace(/,/g, ', ')
  }

  // 3. 如果是对象数组（新数据格式），进行格式化
  if (Array.isArray(params)) {
    return params.map(item => {
      // 【修改开始】处理 sample 字符串，支持逗号分隔
      // 1. 确保是字符串
      const sampleStr = String(item.sample || '')
      // 2. 按英文半角逗号分割，并去除首尾空格
      const samples = sampleStr.split(',').map(s => s.trim()).filter(s => s)
      
      // 如果分割后为空，使用默认名
      if (samples.length === 0) samples.push('Unknown')

      // 3. 提取参数对象
      const paramObj = { ...item.normalParam, ...item.wetParam }
      
      // 4. 将对象转换为 "Key: Value" 字符串数组 (逻辑保持不变)
      const details = Object.entries(paramObj)
        .filter(([_, value]) => value !== null && value !== '')
        .map(([key, value]) => {
          const label = key.replace(/([A-Z])/g, ' $1').trim()
          const valStr = Array.isArray(value) ? value.join(', ') : String(value)
          return `${label}: ${valStr}`
        })

      // 5. 针对每一个测点生成一段 HTML
      // 例如 samples = ['A', 'B']，则生成两段 "A: ..." 和 "B: ..."
      return samples.map(sampleName => {
        if (details.length === 0) return `<strong>${sampleName}</strong>`
        return `<strong>${sampleName}:</strong><br>&nbsp;&nbsp;${details.join(',<br>&nbsp;&nbsp;')}`
      }).join('<br><br>') // 测点之间用双换行分隔
      // 【修改结束】
    }).join('<br><br>') // 不同的 item (如 wetParam 和 normalParam 分开的情况) 之间也用双换行
  }

  // 4. 其他情况转字符串
  return String(params)
}



 // 计算出所有填写了 Sample 的行
 const filledRows = computed(() => {
  // 合并 physics 和 wet 的数据
  const allData = [...physicsData.value, ...wetData.value]
  // 过滤出 samples 不为空的行
  return allData.filter(row => row.samples && row.samples.trim() !== '')
  })

// 监听 filledRows 的变化，实时通知父组件
 watch(filledRows, (newVal) => {
   emit('update:selected', newVal)
  }, { deep: true })
</script>

<style scoped>
  .checklist-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .module-section h5 {
    margin-bottom: 10px;
    color: #333;
    border-left: 4px solid #409eff;
    padding-left: 10px;
    background-color: #f5f7fa;
    padding-top: 5px;
    padding-bottom: 5px;
  }

  .param-cell {
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.5;
  }
</style>




