<template>
  <div>
    <div class="domContent">
      <!-- 搜索区域 -->
      <div class="searchParametersContanier">
        <el-form inline style="display: flex">
          <el-form-item :label="$t('itemNameEn')">
            <el-input v-model="form.testItemNameEn" placeholder="" clearable style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item :label="$t('itemNameChn')">
            <el-input v-model="form.testItemNameChn" placeholder="" clearable style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item style="flex: 1; margin-right: 0; text-align: right;">
            <el-button type="primary" @click="addOpen">{{$t("add")}}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table :data="pagedData" border class="removeTableGaps" style="width: 100%" v-loading="loading">
        <el-table-column :label="$t('TestItemId')" prop="id" width="180" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('ItemName-En')" prop="nameEn" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('ItemName-Chn')" prop="nameChn" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('Description')" prop="description" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('Group')" prop="group" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('IsFeasible')" prop="isFeasible" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isFeasible ? 'success' : 'danger'" size="small">
              {{ scope.row.isFeasible ? $t('yes') : $t('no') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('Status')" prop="status" width="120" show-overflow-tooltip>
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('Param Count')" prop="paramCount" width="120" align="center">
          <template #default="scope">
            <el-tag size="small" type="info">{{ scope.row.paramRequireDefinitions?.length || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operation')" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" :icon="Edit" circle size="small" @click="editOpen(scope.row)"></el-button>
            <el-popconfirm class="box-item"
                           :title="$t('confirmDelete')"
                           @confirm="deleteRow(scope.row)">
              <template #reference>
                <el-button type="danger" :icon="Delete" circle size="small" style="margin-left: 5px"></el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="display: flex; justify-content: center; margin-top: 16px;">
        <el-pagination v-model:current-page="currentPage"
                       v-model:page-size="pageSize"
                       :page-sizes="[10, 20, 50, 100]"
                       :total="filteredData.length"
                       layout="total, sizes, prev, pager, next"
                       background />
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="$t(dialogTitle)" v-model="dialogVisible" width="75%">
      <div class="formContainer">
        <el-form :model="dialogForm" label-width="180px" label-position="left">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('TestItemId')" required>
                <el-input v-model="dialogForm.testItemId" placeholder="Enter ID"
                          :disabled="dialogTitle === 'edit'"></el-input>
                <div class="form-tip" v-if="dialogTitle === 'add'">ID cannot be modified once created</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('Group')" required>
                <el-select v-model="dialogForm.group" placeholder="Select group" style="width: 100%">
                  <el-option label="Physics" value="Physics"></el-option>
                  <el-option label="Wet" value="Wet"></el-option>
                  <el-option label="Flame" value="Flame"></el-option>
                  <el-option label="Fiber" value="Fiber"></el-option>
                  <el-option label="Chemistry" value="Chemistry"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('ItemName-En')" required>
                <el-input v-model="dialogForm.testItemNameEn" placeholder="Enter English name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('ItemName-Chn')" required>
                <el-input v-model="dialogForm.testItemNameChn" placeholder="Enter Chinese name"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item :label="$t('Description')">
            <el-input v-model="dialogForm.description" type="textarea" :rows="2" placeholder="Enter description"></el-input>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('IsFeasible')">
                <el-switch v-model="dialogForm.isFeasible"
                           active-text="Yes"
                           inactive-text="No"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('Status')">
                <el-select v-model="dialogForm.status" placeholder="Select status" style="width: 100%">
                  <el-option label="Draft" value="Draft"></el-option>
                  <el-option label="Active" value="Active"></el-option>
                  <el-option label="Inactive" value="Inactive"></el-option>
                  <el-option label="Deprecated" value="Deprecated"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">Param Require Definitions</el-divider>

          <div v-for="(param, index) in dialogForm.paramRequireDefinitions"
               :key="index"
               style="margin-bottom: 15px; padding: 15px; border: 1px solid #DCDFE6; border-radius: 4px;">
            <el-row :gutter="10">
              <el-col :span="6">
                <el-form-item :label="$t('ParamName')" label-width="90px">
                  <el-input v-model="param.paramName" placeholder="Param name" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item :label="$t('ParamType')" label-width="90px">
                  <el-select v-model="param.paramTypeName" placeholder="Type" size="small" style="width: 100%">
                    <el-option label="String" value="System.String"></el-option>
                    <el-option label="Integer" value="System.Int32"></el-option>
                    <el-option label="Decimal" value="System.Decimal"></el-option>
                    <el-option label="Boolean" value="System.Boolean"></el-option>
                    <el-option label="DateTime" value="System.DateTime"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item :label="$t('IsRequired')" label-width="80px">
                  <el-switch v-model="param.isRequired" size="small"></el-switch>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item :label="$t('UniversalDefault')" label-width="110px">
                  <el-input v-model="param.universalDefault" placeholder="Default value" size="small"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="2" style="text-align: right; display: flex; align-items: center; justify-content: flex-end;">
                <el-button type="danger" size="small" circle @click="removeParam(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-col>
            </el-row>

            <!-- Standard Defaults -->
            <div style="margin-top: 10px; padding-left: 20px; background: #f5f7fa; border-radius: 4px; padding: 10px;">
              <div style="font-size: 13px; color: #606266; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
                <span>Standard Defaults</span>
                <el-button size="small" type="primary" plain @click="addStandardDefault(index)">
                  <el-icon><Plus /></el-icon> Add
                </el-button>
              </div>
              <div v-for="(stdValue, stdKey) in param.standardDefaults"
                   :key="stdKey"
                   style="display: flex; gap: 10px; margin-bottom: 5px; align-items: center;">
                <el-select :model-value="stdKey"
                           placeholder="Select standard type"
                           size="small"
                           style="width: 200px;"
                           filterable
                           allow-create
                           default-first-option
                           @update:model-value="(newKey) => handleStandardTypeChange(index, stdKey, newKey)">
                  <el-option label="ISO" value="ISO"></el-option>
                  <el-option label="AATCC" value="AATCC"></el-option>
                  <el-option label="EN" value="EN"></el-option>
                  <el-option label="BS" value="BS"></el-option>
                  <el-option label="DIN" value="DIN"></el-option>
                  <el-option label="JIS" value="JIS"></el-option>
                  <el-option label="GB" value="GB"></el-option>
                  <el-option label="FZ" value="FZ"></el-option>
                  <el-option label="ASTM" value="ASTM"></el-option>
                  <el-option label="IWTO" value="IWTO"></el-option>
                  <el-option label="CPSC" value="CPSC"></el-option>
                  <el-option label="EU" value="EU"></el-option>
                  <el-option label="Other" value="Other"></el-option>
                </el-select>
                <el-input :model-value="stdValue"
                          placeholder="Default value"
                          size="small"
                          style="flex: 1;"
                          @update:model-value="(val) => updateStandardDefault(index, stdKey, val)"></el-input>
                <el-button type="danger" size="small" circle @click="removeStandardDefault(index, stdKey)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <div v-if="Object.keys(param.standardDefaults || {}).length === 0" style="color: #909399; font-size: 12px; padding: 4px 0;">
                No standard defaults configured
              </div>
            </div>
          </div>

          <el-button type="primary" plain @click="addParam" style="width: 100%;">
            <el-icon><Plus /></el-icon> Add Param Require Definition
          </el-button>
        </el-form>
      </div>
      <template #footer>
        <el-button type="primary" @click="confirmSubmit" :loading="submitLoading">{{$t("confirm")}}</el-button>
        <el-button @click="dialogVisible = false">{{$t("cancel")}}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { reactive, ref, computed, inject, onMounted } from "vue";
  import { Delete, Edit, Plus } from "@element-plus/icons-vue";
  import { ElMessage, ElMessageBox } from "element-plus";

  const request = inject("request");
  const loading = ref(false);
  const submitLoading = ref(false);

  // 查询表单
  const form = reactive({
    testItemNameEn: '',
    testItemNameChn: ''
  });

  // 表格数据
  const tableData = ref([]);

  // 分页
  const currentPage = ref(1);
  const pageSize = ref(20);

  // 前端筛选
  const filteredData = computed(() => {
    return tableData.value.filter(item => {
      return (!form.testItemNameEn || (item.nameEn || '').toLowerCase().includes(form.testItemNameEn.toLowerCase())) &&
        (!form.testItemNameChn || (item.nameChn || '').toLowerCase().includes(form.testItemNameChn.toLowerCase()));
    });
  });

  // 分页后的数据
  const pagedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredData.value.slice(start, start + pageSize.value);
  });

  // 对话框表单
  const dialogForm = ref({
    testItemId: '',
    testItemNameEn: '',
    testItemNameChn: '',
    description: '',
    group: "Physics",
    isFeasible: true,
    status: 'Draft',
    paramRequireDefinitions: []
  });

  // 对话框展示
  const dialogVisible = ref(false);
  const dialogTitle = ref('add');

  function getStatusTagType(status) {
    const map = { 'Draft': 'info', 'Active': 'success', 'Inactive': 'danger', 'Deprecated': 'warning' };
    return map[status] || '';
  }

  // ==================== API Methods ====================

  // 获取所有数据
  function fetchAll() {
    loading.value = true;
    request.get('/TestItem/getall')
      .then(res => {
        if (res.data.isSuccess) {
          tableData.value = res.data.value || [];
          // 重置到第一页
          currentPage.value = 1;
        } else {
          ElMessage.error(res.data.error || 'Failed to load data');
        }
      })
      .catch(err => {
        console.error(err);
        ElMessage.error('Failed to load data');
      })
      .finally(() => {
        loading.value = false;
      });
  }

  // ==================== Dialog Methods ====================

  function addOpen() {
    dialogVisible.value = true;
    dialogTitle.value = 'add';
    dialogForm.value = {
      testItemId: '',
      testItemNameEn: '',
      testItemNameChn: '',
      description: '',
      group: "Physics",
      isFeasible: true,
      status: 'Draft',
      paramRequireDefinitions: []
    };
  }

  function editOpen(row) {
    dialogVisible.value = true;
    dialogTitle.value = 'edit';
    dialogForm.value = {
      testItemId: row.id,
      testItemNameEn: row.nameEn,
      testItemNameChn: row.nameChn,
      description: row.description || '',
      group: row.group || 'Physics',
      isFeasible: row.isFeasible || false,
      status: row.status || 'Draft',
      paramRequireDefinitions: row.paramRequireDefinitions ? JSON.parse(JSON.stringify(row.paramRequireDefinitions)) : []
    };
  }

  // ==================== Form Submit ====================

  function confirmSubmit() {
    // 基本验证
    if (!dialogForm.value.testItemId) {
      ElMessage.warning('Please enter Test Item ID');
      return;
    }
    if (!dialogForm.value.testItemNameEn) {
      ElMessage.warning('Please enter English name');
      return;
    }
    if (!dialogForm.value.testItemNameChn) {
      ElMessage.warning('Please enter Chinese name');
      return;
    }
    if (!dialogForm.value.group) {
      ElMessage.warning('Please enter Group');
      return;
    }

    submitLoading.value = true;

    const payload = {
      testItemId: dialogForm.value.testItemId,
      testItemNameEn: dialogForm.value.testItemNameEn,
      testItemNameChn: dialogForm.value.testItemNameChn,
      description: dialogForm.value.description || '',
      group: dialogForm.value.group,
      isFeasible: dialogForm.value.isFeasible,
      status: dialogForm.value.status,
      paramRequireDefinitions: dialogForm.value.paramRequireDefinitions
    };

    const isEdit = dialogTitle.value === 'edit';
    const url = isEdit ? '/TestItem/update' : '/TestItem/add';
    const method = isEdit ? request.put : request.post;

    method(url, payload)
      .then(res => {
        if (res.data.isSuccess) {
          ElMessage.success(isEdit ? 'Updated successfully' : 'Created successfully');
          dialogVisible.value = false;
          fetchAll();
        } else {
          ElMessage.error(res.data.error || 'Operation failed');
        }
      })
      .catch(() => {
        ElMessage.error('Operation failed');
      })
      .finally(() => {
        submitLoading.value = false;
      });
  }

  // ==================== Delete ====================

  function deleteRow(row) {
    ElMessageBox.confirm(`Are you sure you want to delete test item "${row.nameEn}"?`, 'Warning', {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'error'
    }).then(() => {
      request.delete(`/TestItem/delete/${row.id}`)
        .then(res => {
          if (res.data.isSuccess) {
            ElMessage.success('Deleted successfully');
            fetchAll();
          } else {
            ElMessage.error(res.data.error || 'Delete failed');
          }
        })
        .catch(() => {
          ElMessage.error('Delete failed');
        });
    }).catch(() => { });
  }

  // ==================== Param Definitions Management ====================

  function addParam() {
    dialogForm.value.paramRequireDefinitions.push({
      paramName: '',
      paramTypeName: 'System.String',
      isRequired: false,
      universalDefault: null,
      standardDefaults: {}
    });
  }

  function removeParam(index) {
    dialogForm.value.paramRequireDefinitions.splice(index, 1);
  }

  function addStandardDefault(paramIndex) {
    const param = dialogForm.value.paramRequireDefinitions[paramIndex];
    if (!param.standardDefaults) {
      param.standardDefaults = {};
    }
    // 添加一个空的标准类型，用户可以通过下拉选择
    // 使用空字符串作为临时 key，用户选择后通过 handleStandardTypeChange 更新
    param.standardDefaults[''] = '';
  }

  function removeStandardDefault(paramIndex, stdKey) {
    const param = dialogForm.value.paramRequireDefinitions[paramIndex];
    if (param.standardDefaults) {
      delete param.standardDefaults[stdKey];
    }
  }

  // 处理标准类型变化 - 当用户选择或输入新的标准类型时，更新 key
  function handleStandardTypeChange(paramIndex, oldKey, newKey) {
    if (oldKey === newKey) return;
    if (!newKey || newKey.trim() === '') return;

    const param = dialogForm.value.paramRequireDefinitions[paramIndex];
    const value = param.standardDefaults[oldKey] || '';

    // 检查新 key 是否已存在
    if (param.standardDefaults[newKey] !== undefined) {
      ElMessage.warning(`Standard type "${newKey}" already exists`);
      return;
    }

    // 删除旧 key，创建新 key
    delete param.standardDefaults[oldKey];
    param.standardDefaults[newKey] = value;
  }

  // 更新标准默认值
  function updateStandardDefault(paramIndex, stdKey, value) {
    const param = dialogForm.value.paramRequireDefinitions[paramIndex];
    if (param.standardDefaults) {
      param.standardDefaults[stdKey] = value;
    }
  }

  // ==================== Lifecycle ====================

  onMounted(() => {
    fetchAll();
  });
</script>

<style scoped>
  .removeTableGaps :deep(table) {
    margin-bottom: 0 !important;
  }

  .domContent {
    margin: 0 auto;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
    padding-top: 4px;
  }
</style>
