<template>
  <div>
    <div class="domContent">
      <!-- 搜索区域 -->
      <div class="searchParametersContanier">
        <el-form inline style="display: flex">
          <el-form-item :label="$t('standardFamilyCode')">
            <el-input v-model="form.standardFamilyCode" placeholder="" clearable style="width: 160px"></el-input>
          </el-form-item>
          <el-form-item :label="$t('standardCode')">
            <el-input v-model="form.standardCode" placeholder="" clearable style="width: 160px"></el-input>
          </el-form-item>
          <el-form-item style="flex: 1; margin-right: 0; text-align: right;">
            <el-button type="primary" @click="addOpen">{{$t("addStandard")}}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table :data="filteredTableData" border class="removeTableGaps" style="width: 100%"
                v-loading="loading" :span-method="spanMethod">
        <el-table-column :label="$t('standardFamily')" prop="standardFamilyCode" width="150" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('standardId')" prop="standardId" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('standardCode')" prop="standardCode" width="160" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('standardNameEn')" prop="standardCodeNameEn" min-width="180" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('standardNameChn')" prop="standardCodeNameChn" min-width="160" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('status')" prop="status" width="110">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operation')" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" :icon="Edit" circle size="small" @click="editOpen(scope.row)"></el-button>
            <el-popconfirm class="box-item"
                           :title="$t('confirmDelete')"
                           @confirm="deleteStandard(scope.row)">
              <template #reference>
                <el-button type="danger" :icon="Delete" circle size="small" style="margin-left: 4px"></el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑标准对话框 -->
    <el-dialog :title="$t(dialogTitle)" v-model="dialogVisible" width="70%">
      <div class="formContainer">
        <el-form :model="dialogForm" label-width="150px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('standardFamily')">
                <el-select v-model="dialogForm.standardFamilyId"
                           :placeholder="$t('pleaseSelect')"
                           style="width: 100%"
                           filterable
                           clearable>
                  <el-option v-for="item in standardFamilyOptions"
                             :key="item.id"
                             :label="item.standardFamilyCode"
                             :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('standardId')">
                <div style="display: flex; align-items: center; width: 100%; gap: 2px;">
                  <el-select v-model="idSeg1" :disabled="isEdit" style="flex: 1; min-width: 0;">
                    <el-option v-for="item in prefixOptions" :key="item" :label="item" :value="item"></el-option>
                  </el-select>
                  <span>_</span>
                  <el-select v-model="idSeg2" :disabled="isEdit" style="flex: 1; min-width: 0;">
                    <el-option v-for="item in siteOptions" :key="item" :label="item" :value="item"></el-option>
                  </el-select>
                  <span>_</span>
                  <el-select v-model="idSeg3" :disabled="isEdit" :placeholder="$t('pleaseSelect')" style="flex: 1.2; min-width: 0;">
                    <el-option v-for="item in standardItemOptions" :key="item" :label="item" :value="item"></el-option>
                  </el-select>
                  <span>_</span>
                  <el-input v-model="idSeg4" :disabled="isEdit" style="flex: 1.1; min-width: 0;"
                            maxlength="5" placeholder=""></el-input>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('status')">
                <el-select v-model="dialogForm.status" :placeholder="$t('pleaseSelect')" style="width: 100%">
                  <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('standardCode')">
                <el-input v-model="dialogForm.standardCode" placeholder=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('standardNameEn')">
                <el-input v-model="dialogForm.standardCodeNameEn" placeholder=""></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('standardNameChn')">
                <el-input v-model="dialogForm.standardCodeNameChn" placeholder=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <el-button type="primary" @click="confirmStandard">{{$t("confirm")}}</el-button>
        <el-button @click="dialogVisible = false">{{$t("cancel")}}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { computed, inject, onMounted, reactive, ref, watch } from "vue";
  import { Delete, Edit } from "@element-plus/icons-vue";
  import { ElMessage } from "element-plus";

  const request = inject("request");

  // ==================== 状态数据 ====================
  const loading = ref(false);

  // ==================== 搜索表单 ====================
  const form = reactive({
    standardFamilyCode: '',
    standardCode: ''
  });

  // ==================== 表格数据 ====================
  const tableData = ref([]);

  // 前端筛选
  const filteredTableData = computed(() => {
    return tableData.value.filter(item => {
      return (!form.standardFamilyCode || (item.standardFamilyCode || '').toLowerCase().includes(form.standardFamilyCode.toLowerCase())) &&
        (!form.standardCode || (item.standardCode || '').toLowerCase().includes(form.standardCode.toLowerCase()));
    });
  });

  // ==================== 标准族选项（从独立接口获取） ====================
  const standardFamilyOptions = ref([]);

  // 根据标准族ID获取对应的Code（用于显示）
  function getStandardFamilyCodeById(id) {
    const found = standardFamilyOptions.value.find(item => item.id === id);
    return found ? found.standardFamilyCode : '';
  }

  // 根据标准族Code获取对应的ID
  function getStandardFamilyIdByCode(code) {
    const found = standardFamilyOptions.value.find(item => item.standardFamilyCode === code);
    return found ? found.id : '';
  }

  // ==================== 对话框 ====================
  const dialogVisible = ref(false);
  const dialogTitle = ref('addStandard');
  const isEdit = computed(() => dialogTitle.value === 'editStandard');

  const dialogForm = ref({
    standardId: '',
    standardCode: '',
    standardCodeNameEn: '',
    standardCodeNameChn: '',
    status: 'Draft',
    standardFamilyId: ''  // 存储选中的标准族ID
  });

  function statusTagType(status) {
    const map = { 'Draft': 'info', 'Active': 'success', 'Deprecated': 'danger', 'Superseded': 'warning', 'Pending': '' };
    return map[status] || '';
  }

  // ==================== 单元格合并方法 ====================
  function spanMethod({ row, columnIndex, rowIndex }) {
    if (columnIndex === 0) {
      const key = row.standardFamilyCode || '';
      const data = filteredTableData.value;
      let startIndex = -1;
      let count = 0;
      for (let i = 0; i < data.length; i++) {
        const currentKey = data[i].standardFamilyCode || '';
        if (currentKey === key) {
          if (startIndex === -1) startIndex = i;
          count++;
        } else if (startIndex !== -1) {
          break;
        }
      }
      if (rowIndex === startIndex) {
        return [count, 1];
      } else {
        return [0, 0];
      }
    }
    return [1, 1];
  }

  // ==================== Standard ID 四段拼接 ====================
  const prefixOptions = ['SFL'];
  const siteOptions = ref(['NB', 'XM', 'BJ', 'HK', 'GZ']);
  const standardItemOptions = ref(['CFR', 'CON', 'DIM', 'PFO', 'STR']);
  const statusOptions = ref(['Draft', 'Active', 'Deprecated', 'Superseded', 'Pending']);

  const idSeg1 = ref('SFL');
  const idSeg2 = ref('NB');
  const idSeg3 = ref('');
  const idSeg4 = ref('');

  // 段变化 → 自动拼接
  watch([idSeg1, idSeg2, idSeg3, idSeg4], () => {
    dialogForm.value.standardId = [idSeg1.value, idSeg2.value, idSeg3.value, idSeg4.value].join('_');
  });

  // 反向解析 standardId → 四段
  function parseStandardId(id) {
    const parts = (id || '').split('_');
    if (parts.length === 4) {
      idSeg1.value = parts[0] || 'SFL';
      idSeg2.value = parts[1] || 'NB';
      idSeg3.value = parts[2] || '';
      idSeg4.value = parts[3] || '';
    }
  }

  // ==================== API 方法 ====================

  // 获取标准族列表（独立接口）
  function fetchStandardFamilies() {
    // 假设接口路径是 /StandardFamily/getall，请根据实际情况修改
    request.get('/StandardFamily/getall').then(res => {
      if (res.data.isSuccess) {
        const data = res.data.value || [];
        standardFamilyOptions.value = data.map(item => ({
          id: item.id,
          standardFamilyCode: item.standardFamilyCode
        }));
      }
    }).catch(err => {
      console.error('Failed to fetch standard families:', err);
      ElMessage.error('Failed to load standard families');
    });
  }

  // ==================== 监听标准族选项变化，更新表格显示 ====================
  watch(standardFamilyOptions, (newVal) => {
    if (newVal.length > 0 && tableData.value.length > 0) {
      tableData.value = tableData.value.map(item => {
        const name = getStandardFamilyCodeById(item.standardFamilyCode);
        return {
          ...item,
          standardFamilyCode: name || item.standardFamilyCode || ''
        };

      });
    }
  });

  // 获取标准列表
  function fetchAllStandards() {
    loading.value = true;
    request.get('/Standard/getall').then(res => {
      if (res.data.isSuccess) {
        tableData.value = (res.data.value || []).map(item => ({
          ...item,
          // 如果 standardFamilyOptions 已经加载完成，直接转换
          standardFamilyCode: standardFamilyOptions.value.length > 0
            ? getStandardFamilyCodeById(item.standardFamilyCode) || item.standardFamilyCode || ''
            : item.standardFamilyCode || ''
        }));
      }
    }).catch(err => {
      const msg = err.response?.status
        ? `HTTP ${err.response.status}: ${err.response.statusText}`
        : (err.message || 'Network error');
      console.error('Failed to fetch standards:', msg);
      ElMessage.error(`Failed to load standards: ${msg}`);
    }).finally(() => {
      loading.value = false;
    });
  }

  function addOpen() {
    dialogVisible.value = true;
    dialogTitle.value = 'addStandard';
    idSeg1.value = 'SFL';
    idSeg2.value = 'NB';
    idSeg3.value = '';
    idSeg4.value = '';
    dialogForm.value = {
      standardId: '',
      standardCode: '',
      standardCodeNameEn: '',
      standardCodeNameChn: '',
      status: 'Draft',
      standardFamilyId: ''
    };
  }

  function editOpen(row) {
    dialogVisible.value = true;
    dialogTitle.value = 'editStandard';
    parseStandardId(row.standardId);

    // 根据标准族Code查找对应的ID
    const familyId = getStandardFamilyIdByCode(row.standardFamilyCode || '');

    dialogForm.value = {
      standardId: row.standardId,
      standardCode: row.standardCode,
      standardCodeNameEn: row.standardCodeNameEn,
      standardCodeNameChn: row.standardCodeNameChn,
      status: row.status || 'Draft',
      standardFamilyId: familyId
    };
  }

  function confirmStandard() {
    // 根据选中的标准族ID获取对应的Code
    const familyCode = getStandardFamilyCodeById(dialogForm.value.standardFamilyId);

    const payload = {
      standardId: dialogForm.value.standardId,
      standardCode: dialogForm.value.standardCode,
      standardNameCn: dialogForm.value.standardCodeNameChn,
      standardNameEn: dialogForm.value.standardCodeNameEn,
      status: dialogForm.value.status || 'Draft'
    };

    // 如果选择了标准族，添加标准族相关字段
    if (dialogForm.value.standardFamilyId) {
      payload.standardFamilyCode = dialogForm.value.standardFamilyId;
    }

    if (dialogTitle.value === 'addStandard') {
      request.post('/Standard/add', payload).then(res => {
        if (res.data.isSuccess) {
          ElMessage.success('Standard added');
          dialogVisible.value = false;
          // 重新获取数据，保持一致性
          fetchAllStandards();
        } else {
          ElMessage.error(res.data.error || 'Failed to add standard');
        }
      }).catch(() => ElMessage.error('Failed to add standard'));
    } else {
      request.put('/Standard/update', payload).then(res => {
        if (res.data.isSuccess) {
          ElMessage.success('Standard updated');
          dialogVisible.value = false;
          // 重新获取数据，保持一致性
          fetchAllStandards();
        } else {
          ElMessage.error(res.data.error || 'Failed to update standard');
        }
      }).catch(() => ElMessage.error('Failed to update standard'));
    }
  }

  function deleteStandard(row) {
    request.delete(`/Standard/remove/${row.standardId}`).then(res => {
      if (res.data.isSuccess) {
        ElMessage.success('Standard deleted');
        const idx = tableData.value.findIndex(item => item.standardId === row.standardId);
        if (idx !== -1) tableData.value.splice(idx, 1);
      } else {
        ElMessage.error(res.data.error || 'Failed to delete standard');
      }
    }).catch(() => ElMessage.error('Failed to delete standard'));
  }

  // ==================== 初始化 ====================
  onMounted(() => {
    // 并行获取两个接口数据
    Promise.all([
      fetchStandardFamilies(),  // 获取标准族列表（用于下拉选择）
      fetchAllStandards()       // 获取标准列表（用于表格展示）
    ]);

    request.get('/Enum/sites').then(res => {
      if (res.data) siteOptions.value = res.data;
    }).catch(() => { });
    request.get('/Enum/standard-items').then(res => {
      if (res.data) standardItemOptions.value = res.data;
    }).catch(() => { });
    request.get('/Enum/statuses').then(res => {
      if (res.data) statusOptions.value = res.data;
    }).catch(() => { });
  });
</script>

<style scoped>
  .removeTableGaps :deep(table) {
    margin-bottom: 0 !important;
  }

  .domContent {
    margin: 0 auto;
  }
</style>
