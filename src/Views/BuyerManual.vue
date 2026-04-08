<template>
  <div class="page-container">
    <div class="domContent">
      <!-- 搜索区域 -->
      <div class="search-card">
        <el-form inline class="search-form">
          <!-- Buyer 选择框 -->
          <el-form-item label="Buyer" class="buyer-select-item">
            <el-select v-model="form.buyer"
                       placeholder="Select Buyer"
                       filterable
                       clearable
                       style="width: 200px">
              <el-option v-for="item in buyerList"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value" />
            </el-select>
          </el-form-item>

          <!-- Confirm 按钮 -->
          <el-form-item class="confirm-item">
            <el-button type="success" @click="handleBuyerConfirm">
              Confirm
            </el-button>
          </el-form-item>

          <el-form-item :label="$t('itemNameEn')" class="search-item">
            <el-input v-model="form.itemNameEn"
                      placeholder=""
                      clearable
                      style="width: 200px" />
          </el-form-item>

          <el-form-item :label="$t('itemNameChn')" class="search-item">
            <el-input v-model="form.itemNameChn"
                      placeholder=""
                      clearable
                      style="width: 200px" />
          </el-form-item>

          <el-form-item :label="$t('standard')" class="search-item">
            <el-select v-model="form.standard"
                       placeholder=""
                       filterable
                       clearable
                       style="width: 200px" />
          </el-form-item>

          <el-form-item class="action-buttons">
            <el-button type="primary" @click="searchList">
              {{ $t("search") }}
            </el-button>
            <el-button type="primary" @click="addOpen">
              {{ $t("add") }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <div class="table-card">
        <el-table :data="itemTableData"
                  border
                  style="width: 100%">
          <el-table-column :label="$t('ItemName-En')" prop="itemNameEn" width="200" show-overflow-tooltip />
          <el-table-column :label="$t('Modify-Name')" prop="itemNameChn" width="200" show-overflow-tooltip />
          <el-table-column :label="$t('Cited Standards')" prop="standard" min-width="210" show-overflow-tooltip />
          <el-table-column :label="$t('Limit Paradigm')" prop="limitParadigm" width="150" show-overflow-tooltip />
          <el-table-column :label="$t('Remark')" prop="remark" min-width="200" show-overflow-tooltip />
          <el-table-column :label="$t('Change History')" prop="modifyHistory" width="160">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="viewHistory(scope.row)">
                <el-icon><Clock /></el-icon> {{ $t('view') }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column :label="$t('operation')" width="150" fixed="right">
            <template #default="scope">
              <el-button type="primary" :icon="Edit" circle size="small" @click="editOpen(scope.row)" />
              <el-popconfirm class="box-item"
                             :title="$t('confirmDelete')"
                             @confirm="deleteRow(scope.row)">
                <template #reference>
                  <el-button type="danger" :icon="Delete" circle size="small" style="margin-left: 5px" />
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 文件阅读器区域 -->
    <div class="reader-card">
      <div class="reader-layout">
        <!-- 左侧：文件列表 -->
        <div class="file-sidebar">
          <div class="sidebar-header">
            <span class="sidebar-title">Buyer Manuals</span>
            <el-badge :value="fileList.length" class="file-badge" type="primary" v-if="fileList.length > 0" />
          </div>

          <div class="file-list-container">
            <el-empty v-if="fileList.length === 0"
                      description="Select a buyer to view files"
                      :image-size="80"
                      class="file-empty" />

            <div v-for="file in fileList"
                 :key="file.name"
                 class="file-item"
                 :class="{ active: currentFileName === file.name }"
                 @click="selectFile(file)">
              <div class="file-icon-wrapper">
                <el-icon class="file-icon"><Document /></el-icon>
              </div>
              <div class="file-info">
                <div class="file-name" :title="file.name">{{ file.name }}</div>
                <el-link type="primary"
                         :href="file.url"
                         target="_blank"
                         @click.stop
                         class="file-link">
                  {{ file.url }}
                </el-link>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：阅读器主体 -->
        <div class="reader-main">
          <!-- 工具栏 -->
          <div class="reader-toolbar">
            <div class="toolbar-left">
              <span class="current-file-name" v-if="currentFileName">
                {{ currentFileName }}
              </span>
              <span v-else class="no-file-selected">Select a file to view</span>
            </div>

            <div class="toolbar-right" v-if="currentFileUrl">
              <el-button v-if="isEditing"
                         type="success"
                         size="small"
                         @click="saveContent"
                         :loading="isSaving">
                Save
              </el-button>

              <el-button type="primary"
                         size="small"
                         @click="toggleEdit">
                {{ isEditing ? 'Cancel Edit' : 'Edit Content' }}
              </el-button>
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="reader-content">
            <!-- 查看模式：iframe -->
            <div v-if="!isEditing && currentFileUrl" class="iframe-container">
              <iframe :src="currentFileUrl" class="file-iframe" />
            </div>

            <!-- 编辑模式：编辑器 -->
            <div v-if="isEditing" class="editor-container">
              <el-input v-model="fileContent"
                        type="textarea"
                        :rows="20"
                        placeholder="File content will appear here..." />
            </div>

            <!-- 空状态 -->
            <div v-if="!currentFileUrl && !isEditing" class="empty-viewer">
              <el-empty description="Please select a file from the list above to view" :image-size="100" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="$t(dialogTitle)"
               v-model="dialogVisible"
               width="60%">
      <div class="formContainer">
        <el-form :model="dialogForm" label-width="140px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('ItemName-En')">
                <el-input v-model="dialogForm.itemNameEn" placeholder="" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('ItemName-Chn')">
                <el-input v-model="dialogForm.itemNameChn" placeholder="" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('Cited Standards')">
                <el-select v-model="dialogForm.standard"
                           placeholder=""
                           filterable
                           allow-create
                           default-first-option
                           style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('Limit Paradigm')">
                <el-input v-model="dialogForm.limitParadigm" placeholder="" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item :label="$t('Remark')">
            <el-input v-model="dialogForm.remark"
                      type="textarea"
                      :rows="3"
                      placeholder="" />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button type="primary" @click="addConfirm">{{ $t("confirm") }}</el-button>
        <el-button @click="addCancel">{{ $t("cancel") }}</el-button>
      </template>
    </el-dialog>

    <!-- 修改历史对话框 -->
    <el-dialog :title="$t('modifyHistory')"
               v-model="historyDialogVisible"
               width="50%">
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in historyData"
                          :key="index"
                          :timestamp="activity.timestamp"
                          placement="top">
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>

      <template #footer>
        <el-button @click="historyDialogVisible = false">{{ $t("close") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { reactive, ref, onMounted, inject } from "vue";
  import { Delete, Edit, Clock, Document } from "@element-plus/icons-vue";
  import { ElMessage } from 'element-plus';

  const request = inject('request');

  // --- 文件阅读器相关状态 ---
  const fileList = ref([]);
  const currentFileUrl = ref('');
  const currentFileName = ref('');
  const fileContent = ref('');
  const isEditing = ref(false);
  const isSaving = ref(false);

  // --- 原有的业务逻辑状态 ---
  const dialogForm = ref({
    itemNameEn: '',
    itemNameChn: '',
    standard: '',
    limitParadigm: '',
    remark: ''
  });

  const form = reactive({
    buyer: '',
    itemNameEn: '',
    itemNameChn: '',
    standard: ''
  });

  const buyerList = ref([]);

  const itemTableData = ref([
    {
      id: 1,
      itemNameEn: 'Formaldehyde Content',
      itemNameChn: '甲醛含量',
      standard: 'GB 18401-2010',
      limitParadigm: '≤ 75 mg/kg',
      remark: 'B类',
      modifyHistory: []
    },
    {
      id: 2,
      itemNameEn: 'pH Value',
      itemNameChn: 'pH值',
      standard: 'GB 18401-2010',
      limitParadigm: '4.0 - 8.5',
      remark: 'B类',
      modifyHistory: []
    }
  ]);

  const dialogVisible = ref(false);
  const historyDialogVisible = ref(false);
  const historyData = ref([
    {
      timestamp: '2023-05-20 10:30',
      content: 'Created by Admin'
    },
    {
      timestamp: '2023-06-15 14:20',
      content: 'Updated limit paradigm from ≤ 100 to ≤ 75'
    }
  ]);

  const dialogTitle = ref('');

  // --- 原有的业务方法 ---
  function addOpen() {
    dialogVisible.value = true;
    dialogTitle.value = 'add';
    dialogForm.value = {
      itemNameEn: '',
      itemNameChn: '',
      standard: '',
      limitParadigm: '',
      remark: ''
    };
  }

  const fetchBuyerList = async () => {
    try {
      const res = await request.get('/buyer/buyer-list');
      console.log('Buyer list response:', res);

      if (res.data.isSuccess) {
        buyerList.value = res.data.value.map(item => ({
          label: item.buyerName,
          value: item.buyerName
        }));
      } else {
        ElMessage.error('Failed to load buyer list');
      }
    } catch (error) {
      console.error('Failed to fetch buyer list', error);
      ElMessage.error('Error fetching buyer list');
    }
  };

  function editOpen(row) {
    dialogVisible.value = true;
    dialogTitle.value = 'edit';
    dialogForm.value = JSON.parse(JSON.stringify(row));
  }

  function addConfirm() {
    if (dialogTitle.value === 'add') {
      const newId = Math.max(...itemTableData.value.map(item => item.id || 0)) + 1;
      itemTableData.value.unshift({
        ...dialogForm.value,
        id: newId,
        modifyHistory: []
      });
    } else {
      const index = itemTableData.value.findIndex(item => item.id === dialogForm.value.id);
      if (index !== -1) {
        itemTableData.value[index] = { ...dialogForm.value };
      }
    }
    dialogVisible.value = false;
  }

  function addCancel() {
    dialogVisible.value = false;
  }

  function searchList() {
    console.log("Searching with:", form);
  }

  function deleteRow(row) {
    const index = itemTableData.value.indexOf(row);
    if (index !== -1) {
      itemTableData.value.splice(index, 1);
    }
  }

  function viewHistory(row) {
    historyDialogVisible.value = true;
    console.log("Viewing history for:", row);
  }

  // --- 文件阅读器方法 ---
  const handleBuyerConfirm = async () => {
    if (!form.buyer) {
      ElMessage.warning('Please select a Buyer first');
      return;
    }
    await fetchFiles(form.buyer);
  };

  const fetchFiles = async (buyer) => {
    try {
      const res = await request.get('/buyer/manual-url', {
        params: { buyer: buyer }
      });

      if (res.data.isSuccess) {
        fileList.value = res.data.value.map(file => ({
          name: file.fileName,
          url: file.url
        }));
      } else {
        ElMessage.error('Failed to load files');
      }
    } catch (error) {
      console.error('Error fetching file list:', error);
      ElMessage.error('Error fetching file list');
    }
  };

  const selectFile = async (file) => {
    currentFileUrl.value = file.url;
    currentFileName.value = file.name;
    isEditing.value = false;
    fileContent.value = '';
  };

  const toggleEdit = () => {
    if (!currentFileUrl.value) {
      ElMessage.warning('Please select a file first');
      return;
    }

    if (isEditing.value) {
      isEditing.value = false;
      fileContent.value = '';
    } else {
      ElMessage.info('Fetching file content for editing...');
      setTimeout(() => {
        fileContent.value = "This is the content of " + currentFileName.value + "\n\nYou can edit this text here.";
        isEditing.value = true;
      }, 500);
    }
  };

  const saveContent = async () => {
    if (!fileContent.value) return;

    isSaving.value = true;
    try {
      const res = await request.post('/files/save', {
        path: currentFileUrl.value,
        content: fileContent.value
      });

      if (res.data.success) {
        ElMessage.success('File saved successfully');
        isEditing.value = false;
      } else {
        ElMessage.error(res.data.message || 'Save failed');
      }
    } catch (error) {
      console.error(error);
      ElMessage.error('Error saving file');
    } finally {
      isSaving.value = false;
    }
  };

  onMounted(() => {
    fetchBuyerList();
  });
</script>

<style scoped>
  /* ========== 页面基础布局 ========== */
  .page-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    padding: 24px;
    box-sizing: border-box;
  }

  /* ========== 搜索区域样式 ========== */
  .search-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid #e4e7ed;
  }

  .search-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

    .search-form :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 12px;
    }

  .buyer-select-item :deep(.el-form-item__label) {
    font-weight: 600;
    color: #409eff;
  }

  .action-buttons {
    margin-left: auto;
    margin-right: 0 !important;
    display: flex;
    gap: 12px;
  }

  /* ========== 表格区域样式 ========== */
  .table-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid #e4e7ed;
    margin-bottom: 24px;
  }

  /* ========== 文件阅读器样式 ========== */
  .reader-card {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 1px solid #e4e7ed;
    overflow: hidden;
    height: calc(100vh - 400px);
    min-height: 600px;
  }

  .reader-layout {
    display: flex;
    height: 100%;
  }

  /* 左侧文件列表 - 与右侧对齐 */
  .file-sidebar {
    width: 320px;
    background: #fafbfc;
    border-right: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: 16px 20px;
    background: #409eff;
    color: white;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 600;
    height: 60px;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .sidebar-title {
    flex: 1;
  }

  .file-badge :deep(.el-badge__content) {
    background-color: #ffffff;
    color: #409eff;
    font-weight: 600;
    border: none;
  }

  .file-list-container {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }

  .file-empty {
    padding: 40px 20px;
  }

  .file-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    margin-bottom: 8px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    cursor: pointer;
    transition: all 0.3s ease;
  }

    .file-item:hover {
      border-color: #409eff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .file-item.active {
      background: #ecf5ff;
      border-color: #409eff;
      border-left: 4px solid #409eff;
    }

  .file-icon-wrapper {
    width: 36px;
    height: 36px;
    background: #ecf5ff;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .file-item.active .file-icon-wrapper {
    background: #409eff;
  }

  .file-icon {
    font-size: 18px;
    color: #409eff;
  }

  .file-item.active .file-icon {
    color: white;
  }

  .file-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .file-name {
    font-size: 13px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
    line-height: 1.4;
    word-break: break-all;
    overflow-wrap: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .file-link {
    font-size: 12px;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 右侧阅读器主体 */
  .reader-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .reader-toolbar {
    padding: 16px 24px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .toolbar-left {
    display: flex;
    align-items: center;
  }

  .current-file-name {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }

  .no-file-selected {
    color: #909399;
    font-style: italic;
  }

  .toolbar-right {
    display: flex;
    gap: 12px;
  }

  .reader-content {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: #fafafa;
  }

  .iframe-container {
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
  }

  .file-iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .editor-container {
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
  }

  .empty-viewer {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ========== 响应式适配 ========== */
  @media (max-width: 1400px) {
    .reader-card {
      height: auto;
      min-height: 500px;
    }

    .reader-layout {
      flex-direction: column;
    }

    .file-sidebar {
      width: 100%;
      max-height: 250px;
      border-right: none;
      border-bottom: 1px solid #e4e7ed;
    }
  }

  @media (max-width: 1200px) {
    .search-form {
      flex-direction: column;
      align-items: stretch;
    }

      .search-form :deep(.el-form-item) {
        margin-right: 0;
        margin-bottom: 12px;
        width: 100%;
      }

    .action-buttons {
      margin-left: 0;
      justify-content: flex-end;
      margin-top: 8px;
    }
  }

  /* ========== 滚动条美化 ========== */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

    ::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
</style>
