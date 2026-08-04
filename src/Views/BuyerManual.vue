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
                         :key="item.code"
                         :label="item.name"
                         :value="item.code" />
            </el-select>
          </el-form-item>

          <!-- Confirm 按钮 -->
          <el-form-item class="confirm-item">
            <el-button type="success" @click="handleBuyerConfirm">
              Confirm
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <div class="table-card">
        <!-- 横向导航：套餐标签 -->
        <div class="menuNav">
          <el-tag
            v-for="m in menus"
            :key="m.menuId"
            class="menuNavTag"
            :class="{ active: m.menuId === currentMenuId }"
            @click="currentMenuId = m.menuId"
          >{{ m.menuName }}</el-tag>
          <span v-if="menus.length === 0" class="emptyHint">请先在顶部选择买家</span>
        </div>

        <!-- 只读菜单项表 -->
        <el-table :data="currentMenuItems"
                  border
                  class="removeTableGaps"
                  style="width: 100%">
          <el-table-column label="Index" width="80">
            <template #default="scope">{{ scope.$index + 1 }}</template>
          </el-table-column>
          <el-table-column prop="testItemId" label="Item ID" width="110" show-overflow-tooltip />
          <el-table-column prop="buyerOwnName" label="Buyer Own Name" min-width="140" show-overflow-tooltip />
          <el-table-column label="Standard Code" min-width="140" show-overflow-tooltip>
            <template #default="scope">{{ (scope.row.standardIds || []).join(', ') }}</template>
          </el-table-column>
          <el-table-column prop="requirement" label="Requirement" min-width="140" show-overflow-tooltip />
          <el-table-column prop="buyerModifiedGroup" label="Group" width="90" show-overflow-tooltip />
          <!-- 保留 Change History（Group 之后） -->
          <el-table-column :label="$t('Change History')" width="160">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="viewHistory(scope.row)">
                <el-icon><Clock /></el-icon> {{ $t('view') }}
              </el-button>
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
  import { reactive, ref, computed, onMounted, inject } from "vue";
  import { Clock, Document } from "@element-plus/icons-vue";
  import { ElMessage } from 'element-plus';

  const request = inject('request');

  // --- 文件阅读器相关状态 ---
  const fileList = ref([]);
  const currentFileUrl = ref('');
  const currentFileName = ref('');
  const fileContent = ref('');
  const isEditing = ref(false);
  const isSaving = ref(false);

  // --- 业务逻辑状态 ---
  const form = reactive({
    buyer: ''
  });

  const buyerList = ref([]);

  // 当前买家已加载的菜单（MenuResponseDto[]）
  const menus = ref([]);
  const currentMenuId = ref('');

  const currentMenuItems = computed(() =>
    menus.value.find(m => m.menuId === currentMenuId.value)?.menuItems || []);

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

  // --- 买家与菜单加载 ---
  const fetchBuyerList = async () => {
    try {
      const res = await request.get('/buyer/buyer-list');
      console.log('Buyer list response:', res);

      if (res.data.isSuccess) {
        buyerList.value = res.data.value.map(item => ({
          code: item.buyerCode,
          name: item.buyerName
        }));
      } else {
        ElMessage.error('Failed to load buyer list');
      }
    } catch (error) {
      console.error('Failed to fetch buyer list', error);
      ElMessage.error('Error fetching buyer list');
    }
  };

  // 加载某买家下的所有套餐
  function loadMenusByBuyer(buyerId) {
    if (!buyerId) {
      menus.value = [];
      currentMenuId.value = '';
      return;
    }
    request.get(`/Menu/get-by-buyerId/${buyerId}`).then(res => {
      menus.value = res.data.isSuccess ? (res.data.value || []) : [];
      currentMenuId.value = menus.value[0]?.menuId || '';
    }).catch(() => {
      menus.value = [];
      currentMenuId.value = '';
    });
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
    const buyer = buyerList.value.find(x => x.code === form.buyer);
    // 加载该买家的手册文件（用买家名）
    await fetchFiles(buyer?.name || form.buyer);
    // 加载该买家的菜单（用买家编码）
    loadMenusByBuyer(form.buyer);
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

  /* 套餐标签导航 */
  .menuNav {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 8px;
    min-height: 34px;
    margin-bottom: 14px;
  }

  .menuNavTag {
    cursor: pointer;
  }

  .menuNavTag.active {
    background: #409eff;
    color: #fff;
    border-color: #409eff;
  }

  .menuNavTag.active :deep(.el-tag__close) {
    color: #fff;
  }

  .emptyHint {
    color: #909399;
    font-size: 13px;
  }

  /* 清除全局样式 table{margin-bottom:30px} 造成的表头与首行之间的空行 */
  .removeTableGaps :deep(table) {
    margin-bottom: 0 !important;
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
