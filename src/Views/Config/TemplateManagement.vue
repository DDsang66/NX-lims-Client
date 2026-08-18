<template>
  <div class="domContent">
    <!-- ==================== Top Section: Template List ==================== -->
    <div class="topHalf">
      <div class="halfBox">
        <div class="boxTitle">
          <el-icon><Files /></el-icon>
          Template Library
          <el-tag size="small" type="info" style="margin-left: 8px;">
            Total: {{ templateList.length }}
          </el-tag>
        </div>

        <!-- Toolbar -->
        <div class="formula-toolbar">
          <el-input 
            v-model="searchKeyword" 
            placeholder="Search by name/ID..."
            clearable
            prefix-icon="Search"
            style="flex: 1; min-width: 200px;"
          />
          <el-select 
            v-model="filterSite" 
            placeholder="Site"
            clearable
            style="width: 120px;"
          >
            <el-option label="All" value="" />
            <el-option label="Ningbo" value="NB" />
            <el-option label="Shanghai" value="SH" />
            <el-option label="Shenzhen" value="SZ" />
          </el-select>
          <el-select 
            v-model="filterCategory" 
            placeholder="Category"
            clearable
            style="width: 140px;"
          >
            <el-option label="All" value="" />
            <el-option label="Checklist" value="checklist" />
            <el-option label="Datasheet" value="datasheet" />
            <el-option label="Report" value="report" />
          </el-select>
          <el-select 
            v-model="filterTestType" 
            placeholder="Test Type"
            clearable
            style="width: 130px;"
          >
            <el-option label="All" value="" />
            <el-option label="DIM" value="DIM" />
            <el-option label="CFR" value="CFR" />
            <el-option label="PFO" value="PFO" />
            <el-option label="CON" value="CON" />
            <el-option label="STR" value="STR" />
          </el-select>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>
            New Template
          </el-button>
          <el-button @click="refreshList">
            <el-icon><Refresh /></el-icon>
            Refresh
          </el-button>
        </div>

        <!-- Template Table -->
        <div class="table-wrapper">
          <el-table :data="paginatedTemplates"
                    stripe
                    border
                    highlight-current-row
                    @current-change="handleTableRowClick"
                    style="width: 100%;"
                    max-height="400">
            <el-table-column type="index" width="50" label="#" />

            <el-table-column prop="id" label="Template ID" width="220">
              <template #default="{ row }">
                <el-link type="primary" @click="loadTemplate(row.id)">
                  {{ row.id }}
                </el-link>
              </template>
            </el-table-column>

            <el-table-column prop="name" label="Template Name" min-width="150" />

            <el-table-column prop="site" label="Site" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.site }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="category" label="Category" width="120">
              <template #default="{ row }">
                <el-tag type="primary" size="small">
                  {{ row.category }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="testType" label="Test Type" width="120">
              <template #default="{ row }">
                <el-tag v-if="row.testType" type="warning" size="small">
                  {{ row.testType }}
                </el-tag>
                <span v-else style="color: #ccc;">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="version" label="Version" width="85">
              <template #default="{ row }">
                <el-tag size="small" type="info">v{{ row.version }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="fileType" label="File Type" width="100">
              <template #default="{ row }">
                <el-tag :type="row.fileType === 'xlsx' ? 'success' : 'primary'" size="small">
                  {{ row.fileType?.toUpperCase() }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="templateUrl" label="Template URL" min-width="200">
              <template #default="{ row }">
                <el-link :href="row.templateUrl" target="_blank" type="primary">
                  {{ row.templateUrl }}
                </el-link>
              </template>
            </el-table-column>

            <el-table-column prop="updatedAt" label="Updated At" width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.updatedAt) }}
              </template>
            </el-table-column>

            <el-table-column label="History" width="100">
              <template #default="{ row }">
                <el-button size="small"
                           type="info"
                           @click="showHistory(row)">
                  View
                </el-button>
              </template>
            </el-table-column>

            <el-table-column label="Actions" width="240" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <!--<el-button size="small" type="primary" @click="loadTemplate(row.id)">
          Load
        </el-button>-->
                  <el-button size="small" type="warning" @click="editTemplate(row)">
                    Edit
                  </el-button>
                  <el-button size="small" type="danger" @click="deleteTemplate(row)">
                    Delete
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredTemplates.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- ==================== Bottom Section: OnlyOffice Editor ==================== -->
    <div class="bottomBox">
      <div class="ruleToolbar">
        <div class="modeToggle">
          <span 
            class="modeBlock" 
            :class="{ active: editorMode === 'excel' }"
            @click="switchEditorMode('excel')"
          >
            <el-icon><Document /></el-icon>
            Excel Editor
          </span>
          <span 
            class="modeBlock" 
            :class="{ active: editorMode === 'word' }"
            @click="switchEditorMode('word')"
          >
            <el-icon><EditPen /></el-icon>
            Word Editor
          </span>
        </div>

        <div style="flex:1; display: flex; gap: 8px; align-items: center;">
          <el-input 
            v-model="currentTemplateId" 
            placeholder="Enter Template ID to load..."
            clearable
            style="max-width: 300px;"
            @keyup.enter="loadTemplateById"
          />
          <el-button type="primary" @click="loadTemplateById">
            <el-icon><Download /></el-icon>
            Load
          </el-button>
          <el-button type="success" @click="saveTemplate">
            <el-icon><Check /></el-icon>
            Save
          </el-button>
          <el-button @click="resetEditor">
            <el-icon><RefreshRight /></el-icon>
            Reset
          </el-button>
        </div>

        <el-tag v-if="currentTemplateInfo" type="success" size="large">
          Current: {{ currentTemplateInfo.name }} (v{{ currentTemplateInfo.version }})
        </el-tag>
      </div>

      <!-- OnlyOffice Editor Container -->
      <div class="editor-container" id="onlyoffice-editor">
        <div v-if="!editorLoaded" class="editor-placeholder">
          <el-icon :size="64"><Document /></el-icon>
          <span>Select a template or enter Template ID to load</span>
          <span class="hint">Supports Excel / Word document online editing</span>
        </div>
        <div v-else ref="editorRef" class="editor-iframe-wrapper"></div>
      </div>
    </div>

    <!-- ==================== Create/Edit Dialog ==================== -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle"
      width="700px"
      destroy-on-close
    >
      <el-form :model="formData" label-width="140px" label-position="right">
        <el-form-item label="Template Name" required>
          <el-input v-model="formData.name" placeholder="Enter template name" />
        </el-form-item>

        <el-form-item label="Site" required>
          <el-select v-model="formData.site" placeholder="Select site" style="width: 100%;">
            <el-option label="Ningbo" value="NB" />
            <el-option label="Shanghai" value="SH" />
            <el-option label="Shenzhen" value="SZ" />
          </el-select>
        </el-form-item>

        <el-form-item label="Category Mode" required>
          <el-select v-model="formData.categoryMode"
                     placeholder="Select category mode"
                     style="width: 100%;">
            <el-option label="Common" value="common" />
            <el-option label="Buyer" value="buyer" />
          </el-select>
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            Common: Common_FLAM, Common_PHY, Common_WET, Common_FIBER<br>
            Buyer: {BuyerName}_FLAM, {BuyerName}_PHY, etc.
          </div>
        </el-form-item>

        <!-- 买家名称 -->
        <el-form-item v-if="formData.categoryMode === 'buyer'" label="Buyer Name" required>
          <el-input v-model="formData.buyerName"
                    placeholder="Enter buyer name (e.g., Apple, Samsung)" />
        </el-form-item>

        <el-form-item label="Categroy Type" required>
          <el-select v-model="formData.categroyType" placeholder="Select category type" style="width: 100%;" clearable>
            <el-option label="PHY" value="PHY" />
            <el-option label="WET" value="WET" />
            <el-option label="FLAM" value="FLAM" />
            <el-option label="FIBER" value="FIBER" />
          </el-select>
        </el-form-item>

        <!-- Test Type -->
        <el-form-item label="Test Type" required>
          <el-select v-model="formData.testType" placeholder="Select test type" style="width: 100%;" clearable>
            <el-option label="DIM" value="DIM" />
            <el-option label="CFR" value="CFR" />
            <el-option label="PFO" value="PFO" />
            <el-option label="CON" value="CON" />
            <el-option label="STR" value="STR" />
          </el-select>
        </el-form-item>

        <!-- 显示最终的 Category 预览 -->
        <el-form-item v-if="formData.categoryMode && formData.categroyType" label="Category Preview">
          <el-tag type="primary" size="large">
            {{ formData.categoryMode === 'common' ? `Common_${formData.categroyType}` : `${formData.buyerName || '?'}_${formData.categroyType}` }}
          </el-tag>
        </el-form-item>

        <!-- File Type 显示 -->
        <el-form-item label="File Type">
          <el-input v-model="formData.fileType"
                    placeholder="Auto-detected from file"
                    disabled />
        </el-form-item>

        <el-form-item label="Upload File" required>
          <el-upload ref="uploadRef"
                     class="upload-demo"
                     drag
                     action="#"
                     :auto-upload="false"
                     :on-change="handleFileChange"
                     :on-remove="handleFileRemove"
                     :limit="1"
                     accept=".xlsx,.xls,.docx,.doc">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              Drop file here or <em>click to browse</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                Supports: .xlsx, .xls (Excel) | .docx, .doc (Docx)
              </div>
            </template>
          </el-upload>
          <div v-if="formData.uploadFile" class="upload-file-info">
            <el-tag type="success" size="large">
              <el-icon><Document /></el-icon>
              {{ formData.uploadFile.name }}
              <el-button type="text" @click="formData.uploadFile = null" style="margin-left: 8px;">
                <el-icon><Close /></el-icon>
              </el-button>
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item label="Version">
          <el-input-number v-model="formData.version" :min="1" :step="1" />
        </el-form-item>

        <el-form-item label="Remarks">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="Optional remarks" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          {{ isEdit ? 'Update' : 'Create' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- ==================== History Dialog ==================== -->
    <el-dialog v-model="historyDialogVisible" title="Operation History" width="600px">
      <el-timeline>
        <el-timeline-item 
          v-for="(item, index) in historyList" 
          :key="index"
          :timestamp="item.time"
          placement="top"
        >
          <el-card>
            <p>{{ item.action }}</p>
            <p style="color: #909399; font-size: 12px;">
              Operator: {{ item.operator || 'System' }}
            </p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <template #footer>
        <el-button @click="historyDialogVisible = false">Close</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, inject,reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Refresh, Search, Files, Document, EditPen, 
  Download, Check, RefreshRight, List, UploadFilled, Close
} from '@element-plus/icons-vue'

// ==================== Types ====================
const TEMPLATE_CATEGORIES = {
  checklist: 'Checklist',
  datasheet: 'Datasheet',
  report: 'Report'
}

// ==================== State ====================
const searchKeyword = ref('')
const filterSite = ref('')
const filterCategory = ref('')
const filterTestType = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

  const request = inject('request');

  const templateList = ref([])

// ==================== Editor State ====================
const editorMode = ref('excel')
const editorLoaded = ref(false)
const currentTemplateId = ref('')
const currentTemplateInfo = ref(null)
const editorRef = ref(null)

// ==================== Dialog State ====================
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const dialogTitle = ref('New Template')
const uploadRef = ref(null)

  const formData = reactive({
    id: '',
    name: '',
    site: '',
    category: '',      // 存储拼接后的最终值
    categoryMode: '',  // 新增：'common' 或 'buyer'
    testType: '',      // DIM/CFR/PFO/CON/STR
    categroyType: '',
    templateUrl: '',
    version: 1,
    remark: '',
    uploadFile: null,
    fileType: '',      // 新增：从文件后缀获取 xlsx/docx
    buyerName: ''      // 新增：买家名称
  })

// ==================== History ====================
const historyDialogVisible = ref(false)
const historyList = ref([])

// ==================== Computed ====================
const filteredTemplates = computed(() => {
  let list = templateList.value

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(item => 
      item.name.toLowerCase().includes(keyword) ||
      item.id.toLowerCase().includes(keyword)
    )
  }

  if (filterSite.value) {
    list = list.filter(item => item.site === filterSite.value)
  }

  if (filterCategory.value) {
    list = list.filter(item => item.category === filterCategory.value)
  }

  if (filterTestType.value) {
    list = list.filter(item => item.testType === filterTestType.value)
  }

  return list
})

const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTemplates.value.slice(start, end)
})

// ==================== Methods ====================

// --- Table Helpers ---
function categoryLabel(category) {
  return TEMPLATE_CATEGORIES[category] || category
}

function categoryTagType(category) {
  const map = {
    checklist: 'success',
    datasheet: 'primary',
    report: 'warning'
  }
  return map[category] || ''
}

function formatDateTime(dateTime) {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function handleTableRowClick(row) {
  if (row) {
    loadTemplate(row.id)
  }
}

  function onCategoryChange(val) {
    // 切换 Category 时清空买家名称
    if (val !== 'buyer') {
      formData.buyerName = ''
    }
  }

// --- File Upload ---
  function handleFileChange(file) {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword' // .doc
    ]

    if (!validTypes.includes(file.raw.type)) {
      ElMessage.warning('Please upload a valid Excel or Word file')
      return
    }

    // 获取文件名（不含扩展名）
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '')

    // ✅ 修改：存储文件扩展名（带点号），而不是 "Excel"/"Word"
    const fileExt = file.name.split('.').pop().toLowerCase()
    formData.fileType = `.${fileExt}`  // 例如: .xlsx, .docx, .xls, .doc

    formData.uploadFile = file
    formData.name = fileNameWithoutExt

    // 显示友好的文件类型名称
    const fileTypeDisplay = ['.xlsx', '.xls'].includes(formData.fileType) ? 'Excel' : 'Word'
    ElMessage.success(`File "${file.name}" selected successfully (${fileTypeDisplay})`)
  }

function handleFileRemove() {
  formData.uploadFile = null
  formData.fileType = ''
}

// --- Template Loading ---
async function loadTemplate(templateId) {
  try {
    const template = templateList.value.find(t => t.id === templateId)
    if (!template) {
      ElMessage.warning('Template not found')
      return
    }

    currentTemplateId.value = templateId
    currentTemplateInfo.value = template
    
    // Switch editor mode based on file type
    if (template.fileType === 'xlsx' || template.fileType === 'xls') {
      editorMode.value = 'excel'
    } else {
      editorMode.value = 'word'
    }

    await loadTemplateContent(template)
    ElMessage.success(`Template loaded: ${template.name}`)
  } catch (error) {
    console.error('Failed to load template:', error)
    ElMessage.error('Failed to load template: ' + error.message)
  }
}

async function loadTemplateById() {
  if (!currentTemplateId.value.trim()) {
    ElMessage.warning('Please enter Template ID')
    return
  }
  await loadTemplate(currentTemplateId.value.trim())
}

async function loadTemplateContent(template) {
  editorLoaded.value = true
  await nextTick()
  initOnlyOffice(template)
}

// --- OnlyOffice Editor ---
function initOnlyOffice(template) {
  // TODO: Initialize OnlyOffice editor
  // Documentation: https://api.onlyoffice.com/editors/basic
  
  const editorConfig = {
    document: {
      fileType: template.fileType || 'docx',
      key: template.id,
      title: template.name,
      url: template.templateUrl
    },
    editorConfig: {
      mode: 'edit',
      lang: 'en-US'
    }
  }

  console.log('Initializing OnlyOffice Editor:', editorConfig)
  
  // In production, use:
  // const docEditor = new DocsAPI.DocEditor('onlyoffice-editor', editorConfig)
}

function switchEditorMode(mode) {
  editorMode.value = mode
  ElMessage.info(`Switched to ${mode === 'excel' ? 'Excel' : 'Word'} Editor`)
  
  if (currentTemplateInfo.value) {
    loadTemplateContent(currentTemplateInfo.value)
  }
}

async function saveTemplate() {
  try {
    // TODO: Save current editor content
    ElMessage.success('Template saved successfully')
    
    historyList.value.unshift({
      time: new Date().toLocaleString(),
      action: `Saved template: ${currentTemplateInfo.value?.name}`,
      operator: 'Current User'
    })
  } catch (error) {
    ElMessage.error('Save failed: ' + error.message)
  }
}

function resetEditor() {
  editorLoaded.value = false
  currentTemplateInfo.value = null
  currentTemplateId.value = ''
  ElMessage.info('Editor reset')
}

// --- Create / Edit ---
function openCreateDialog() {
  isEdit.value = false
  dialogTitle.value = 'New Template'
  resetFormData()
  dialogVisible.value = true
}

  function editTemplate(row) {
    isEdit.value = true
    dialogTitle.value = 'Edit Template'
    Object.assign(formData, {
      id: row.id,
      name: row.name,
      site: row.site,
      category: row.category,
      testType: row.testType,
      templateUrl: row.templateUrl,
      version: row.version,
      remark: row.remark || '',
      uploadFile: null,
      fileType: row.fileType || '',
      buyerName: '' // 编辑时清空买家名称
    })
    dialogVisible.value = true
  }

  function resetFormData() {
    Object.assign(formData, {
      id: '',
      name: '',
      site: '',
      category: '',
      categoryMode: '',
      testType: '',
      templateUrl: '',
      version: 1,
      remark: '',
      uploadFile: null,
      fileType: '',
      buyerName: ''
    })
  }

  async function submitForm() {
    // Validation
    if (!formData.name || !formData.site || !formData.categoryMode) {
      ElMessage.warning('Please fill in all required fields')
      return
    }

    if (formData.categoryMode === 'buyer' && !formData.buyerName) {
      ElMessage.warning('Please enter buyer name')
      return
    }

    if (!formData.testType) {
      ElMessage.warning('Please select Test Type')
      return
    }

    if (!isEdit.value && !formData.uploadFile) {
      ElMessage.warning('Please upload a template file')
      return
    }

    submitting.value = true

    try {
      // 构建 Category 值
      let categoryValue = ''
      if (formData.categoryMode === 'common') {
        categoryValue = `Common_${formData.categroyType}`
      } else if (formData.categoryMode === 'buyer') {
        categoryValue = `${formData.buyerName}_${formData.categroyType}`
      }

      // 构建 FormData 匹配后端 DTO
      const submitData = new FormData()
      submitData.append('TemplateName', formData.name)
      submitData.append('Site', formData.site)
      submitData.append('Category', categoryValue)
      submitData.append('TestType', formData.testType)
      submitData.append('FileType', formData.fileType)
      submitData.append('Remark', formData.remark || '')

      if (formData.uploadFile) {
        submitData.append('TemplateFile', formData.uploadFile.raw)
      }

      // ✅ 使用原生 fetch 替代 axios
      const response = await fetch('http://localhost:5051/api/Template/add', {
        method: 'POST',
        body: submitData,
        // 不要设置 Content-Type，浏览器自动设置 multipart/form-data 和 boundary
      })

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      if (result.isSuccess) {
        ElMessage.success(isEdit.value ? 'Template updated successfully' : 'Template created successfully')
        dialogVisible.value = false
        resetFormData()

        // 刷新列表
        refreshList()
      } else {
        ElMessage.error(result.error || 'Operation failed')
      }
    } catch (error) {
      console.error('Submit error:', error)
      ElMessage.error(error.message || 'Operation failed')
    } finally {
      submitting.value = false
    }
  }

async function deleteTemplate(row) {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete template "${row.name}"?`,
      'Delete Confirmation',
      { type: 'warning' }
    )
    
    const index = templateList.value.findIndex(t => t.id === row.id)
    if (index > -1) {
      templateList.value.splice(index, 1)
      ElMessage.success('Deleted successfully')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Delete failed: ' + error.message)
    }
  }
}

// --- History ---
function showHistory(row) {
  historyList.value = [
    { time: '2026-08-10 10:30:00', action: `Created template: ${row.name}`, operator: 'John' },
    { time: '2026-08-09 15:20:00', action: `Updated version to v${row.version}`, operator: 'Jane' },
    { time: '2026-08-08 09:00:00', action: 'Content edited', operator: 'Bob' }
  ]
  historyDialogVisible.value = true
}

// --- Refresh & Pagination ---
  // ==================== Refresh & Pagination ====================
  async function refreshList() {
    try {
      const response = await request.get('/Template/getall')

      // ✅ request 是 axios 实例，返回的是整个 axios response，后端数据在 response.data 中
      const payload = response?.data

      if (payload && payload.isSuccess) {
        // 后端 Result<T> 的成功数据在 value 中
        const templates = payload.value || []

        // 如果 templates 是数组，直接映射
        if (Array.isArray(templates)) {
          templateList.value = templates.map(item => ({
            id: item.templateId || item.id || '',
            name: item.templateName || item.name || 'Unknown',
            site: item.site || '',
            // 如果后端返回的是 BusinessCategory，需要拆分
            category: item.businessCategory ?
              item.businessCategory.split('_')[1] || item.businessCategory :
              (item.category || 'Unknown'),
            testType: item.testType || '',
            version: item.version || 1,
            fileType: item.fileType ?
              item.fileType.toLowerCase().replace(/^\./, '') : '',
            templateUrl: item.templateUrl || '',
            updatedAt: item.updateAt || item.updatedAt || new Date().toISOString(),
            remark: item.remark || ''
          }))

          ElMessage.success(`Loaded ${templateList.value.length} templates`)
        } else {
          ElMessage.warning('No template data found')
          templateList.value = []
        }
      } else {
        console.log("payload:", payload)
        ElMessage.error(payload?.error || 'Failed to load templates')
        templateList.value = []
      }
    } catch (error) {
      console.error('Refresh error:', error)
      ElMessage.error('Failed to refresh list: ' + error.message)
      templateList.value = []
    }
  }

function handleSizeChange(val) {
  pageSize.value = val
  currentPage.value = 1
}

function handleCurrentChange(val) {
  currentPage.value = val
}

// ==================== Lifecycle ====================
  onMounted(async () => {
    await refreshList()
  })
</script>

<style scoped lang="scss">
.domContent {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 150%;
  padding: 10px;
}

// ==================== Top Section ====================
.topHalf {
  display: flex;
  gap: 15px;
  flex: 1;
  min-height: 0;
}

.halfBox {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 10px;
  background: #fff;
}

.boxTitle {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.formula-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.table-wrapper :deep(.el-table) {
  height: 100%;
}

.table-wrapper :deep(.el-table__body-wrapper) {
  overflow: auto;
}

.pagination-wrapper {
  flex-shrink: 0;
  padding-top: 10px;
  display: flex;
  justify-content: flex-end;
}

// ==================== Bottom Section ====================
.bottomBox {
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  min-height: 400px;
  flex: 1.2;
}

.ruleToolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.modeToggle {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.modeBlock {
  padding: 4px 16px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  transition: all 0.3s;
  
  &:hover {
    border-color: #409EFF;
  }
  
  &.active {
    background: #409EFF;
    color: #fff;
    border-color: #409EFF;
  }
}

.editor-container {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  min-height: 300px;
  background: #fafafa;
  position: relative;
}

.editor-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  gap: 12px;
  
  .el-icon {
    color: #d0d4db;
  }
  
  .hint {
    font-size: 13px;
    color: #c0c4cc;
  }
}

.editor-iframe-wrapper {
  width: 100%;
  height: 100%;
}

// ==================== Upload Styles ====================
.upload-demo {
  width: 100%;
}

.upload-file-info {
  margin-top: 8px;
  padding: 8px;
  background: #f0f9eb;
  border-radius: 4px;
}

// ==================== Scrollbar ====================
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

* {
  scrollbar-width: thin;
  scrollbar-color: #e0e3e8 #f5f7fa;
}

// ==================== Responsive ====================
@media (max-width: 1200px) {
  .topHalf {
    flex-direction: column;
  }
  
  .halfBox {
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .formula-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .ruleToolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .modeToggle {
    justify-content: center;
  }
}

  // ==================== Actions 按钮样式 ====================
  .action-buttons {
    display: flex;
    gap: 4px;
    flex-wrap: nowrap; // 强制不换行
    white-space: nowrap;

    .el-button {
      padding: 5px 8px; // 稍微紧凑一点
      font-size: 12px;
      min-width: 52px; // 保证按钮宽度一致
    }
  }
</style>
