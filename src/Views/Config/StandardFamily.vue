<template>
  <div>
    <div class="domContent">
      <div class="searchParametersContanier">
        <el-form inline style="display: flex">
          <el-form-item :label="$t('standardFamilyId')">
            <el-input v-model="form.standardFamilyId" placeholder="" clearable style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item :label="$t('standardFamilyCode')">
            <el-input v-model="form.standardFamilyCode" placeholder="" clearable style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item style="flex: 1; margin-right: 0; text-align: right;">
            <el-button type="primary" @click="addOpen">{{$t("addStandardFamily")}}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="filteredTableData" border class="removeTableGaps" style="width: 100%" v-loading="loading">
        <el-table-column :label="$t('standardFamilyId')" prop="standardFamilyId" width="220" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('standardFamilyCode')" prop="standardFamilyCode" min-width="180" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('version')" prop="version" width="100" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('effectiveDate')" prop="effectiveDate" width="180" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.effectiveDate ? new Date(scope.row.effectiveDate).toLocaleDateString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('standardIds')" prop="standardIds" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <template v-if="scope.row.standardIds && scope.row.standardIds.length">
              <el-tag v-for="id in scope.row.standardIds" :key="id" size="small" style="margin-right: 4px; margin-bottom: 2px;">
                {{ id }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('formulaIds')" prop="formulaIds" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <template v-if="scope.row.formulaIds && scope.row.formulaIds.length">
              <el-tag v-for="id in scope.row.formulaIds" :key="id" size="small" style="margin-right: 4px; margin-bottom: 2px;">
                {{ id }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('paramStructureIds')" prop="paramStructureIds" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <template v-if="scope.row.paramStructureIds && scope.row.paramStructureIds.length">
              <el-tag v-for="id in scope.row.paramStructureIds" :key="id" size="small" style="margin-right: 4px; margin-bottom: 2px;">
                {{ id }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operation')" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" :icon="Edit" circle size="small" @click="editOpen(scope.row)"></el-button>
            <el-popconfirm :title="$t('confirmDelete')" @confirm="deleteFamily(scope.row)">
              <template #reference>
                <el-button type="danger" :icon="Delete" circle size="small" style="margin-left: 4px"></el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="$t(dialogTitle)" v-model="dialogVisible" width="55%">
      <div class="formContainer">
        <el-form :model="dialogForm" label-width="180px">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item :label="$t('standardFamilyId')">
                <el-input v-model="dialogForm.standardFamilyId" placeholder=""
                          :disabled="dialogTitle === 'editStandardFamily'"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item :label="$t('standardFamilyCode')">
                <el-input v-model="dialogForm.standardFamilyCode" placeholder=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('version')">
                <el-input-number v-model="dialogForm.version" :min="1" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('effectiveDate')">
                <el-date-picker v-model="dialogForm.effectiveDate" type="date"
                                :placeholder="$t('pleaseSelect')" style="width: 100%"
                                value-format="YYYY-MM-DD"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item :label="$t('standardIds')">
                <el-select v-model="dialogForm.standardIds" multiple filterable allow-create
                           :placeholder="$t('pleaseSelect')" style="width: 100%">
                  <el-option v-for="item in allStandardOptions" :key="item.id"
                             :label="item.standardCode" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item :label="$t('formulaIds')">
                <el-select v-model="dialogForm.formulaIds" multiple filterable allow-create
                           :placeholder="$t('pleaseSelect')" style="width: 100%">
                  <el-option v-for="item in allFormulaOptions" :key="item.id"
                             :label="item.formulaCode" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item :label="$t('paramStructureIds')">
                <el-select v-model="dialogForm.paramStructureIds" multiple filterable allow-create
                           :placeholder="$t('pleaseSelect')" style="width: 100%">
                  <el-option v-for="item in allParamStructureOptions" :key="item.id"
                             :label="item.structureCode" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <el-button type="primary" @click="confirmFamily">{{$t("confirm")}}</el-button>
        <el-button @click="dialogVisible = false">{{$t("cancel")}}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { computed, inject, onMounted, reactive, ref } from "vue";
  import { Delete, Edit } from "@element-plus/icons-vue";
  import { ElMessage } from "element-plus";

  const request = inject("request");
  const loading = ref(false);

  const form = reactive({ standardFamilyId: '', standardFamilyCode: '' });
  const tableData = ref([]);

  // 用于下拉选择的选项数据
  const allStandardOptions = ref([]);
  const allFormulaOptions = ref([]);
  const allParamStructureOptions = ref([]);

  const filteredTableData = computed(() => {
    return tableData.value.filter(item => {
      return (!form.standardFamilyId || (item.standardFamilyId || '').toLowerCase().includes(form.standardFamilyId.toLowerCase())) &&
        (!form.standardFamilyCode || (item.standardFamilyCode || '').toLowerCase().includes(form.standardFamilyCode.toLowerCase()));
    });
  });

  const dialogVisible = ref(false);
  const dialogTitle = ref('addStandardFamily');
  const dialogForm = ref({
    standardFamilyId: '',
    standardFamilyCode: '',
    version: 1,
    effectiveDate: '',
    standardIds: [],
    formulaIds: [],
    paramStructureIds: []
  });

  function fetchAll() {
    loading.value = true;
    request.get('/StandardFamily/getall').then(res => {
      if (res.data.isSuccess) {
        tableData.value = (res.data.value || []).map(item => ({
          ...item,
          effectiveDate: item.effectiveDate ? new Date(item.effectiveDate).toISOString().split('T')[0] : '',
          // 确保这些字段始终是数组
          standardIds: item.standardIds || [],
          formulaIds: item.formulaIds || [],
          paramStructureIds: item.paramStructureIds || []
        }));
      }
    }).catch(err => {
      console.error(err);
      ElMessage.error('Failed to load');
    }).finally(() => loading.value = false);
  }

  // 获取标准列表用于下拉选择
  function fetchStandards() {
    request.get('/Standard/getall').then(res => {
      if (res.data.isSuccess) {
        allStandardOptions.value = res.data.value || [];
      }
    }).catch(() => { });
  }

  // 获取公式列表用于下拉选择
  function fetchFormulas() {
    request.get('/Formula/getall').then(res => {
      if (res.data.isSuccess) {
        allFormulaOptions.value = res.data.value || [];
      }
    }).catch(() => { });
  }

  // 获取参数结构列表用于下拉选择
  function fetchParamStructures() {
    request.get('/ParamStructure/getall').then(res => {
      if (res.data.isSuccess) {
        allParamStructureOptions.value = res.data.value || [];
      }
    }).catch(() => { });
  }

  function addOpen() {
    dialogVisible.value = true;
    dialogTitle.value = 'addStandardFamily';
    dialogForm.value = {
      standardFamilyId: '',
      standardFamilyCode: '',
      version: 1,
      effectiveDate: '',
      standardIds: [],
      formulaIds: [],
      paramStructureIds: []
    };
  }

  function editOpen(row) {
    dialogVisible.value = true;
    dialogTitle.value = 'editStandardFamily';
    dialogForm.value = {
      standardFamilyId: row.standardFamilyId,
      standardFamilyCode: row.standardFamilyCode,
      version: row.version || 1,
      effectiveDate: row.effectiveDate || '',
      standardIds: row.standardIds || [],
      formulaIds: row.formulaIds || [],
      paramStructureIds: row.paramStructureIds || []
    };
  }

  function confirmFamily() {
    const payload = {
      standardFamilyId: dialogForm.value.standardFamilyId,
      standardFamilyCode: dialogForm.value.standardFamilyCode,
      version: dialogForm.value.version || 1,
      effectiveDate: dialogForm.value.effectiveDate || null,
      standardIds: dialogForm.value.standardIds || [],
      formulaIds: dialogForm.value.formulaIds || [],
      paramStructureIds: dialogForm.value.paramStructureIds || []
    };

    if (dialogTitle.value === 'addStandardFamily') {
      request.post('/StandardFamily/add', payload).then(res => {
        if (res.data.isSuccess) {
          ElMessage.success('Added');
          dialogVisible.value = false;
          tableData.value.unshift(payload);
        } else ElMessage.error(res.data.error || 'Failed');
      }).catch(() => ElMessage.error('Failed'));
    } else {
      request.put('/StandardFamily/update', payload).then(res => {
        if (res.data.isSuccess) {
          ElMessage.success('Updated');
          dialogVisible.value = false;
          const idx = tableData.value.findIndex(item => item.id === dialogForm.value.id);
          if (idx !== -1) tableData.value[idx] = { ...tableData.value[idx], ...payload };
        } else ElMessage.error(res.data.error || 'Failed');
      }).catch(() => ElMessage.error('Failed'));
    }
  }

  function deleteFamily(row) {
    request.delete(`/StandardFamily/remove/${row.id}`).then(res => {
      if (res.data.isSuccess) {
        ElMessage.success('Deleted');
        const idx = tableData.value.findIndex(item => item.id === row.id);
        if (idx !== -1) tableData.value.splice(idx, 1);
      } else ElMessage.error(res.data.error || 'Failed');
    }).catch(() => ElMessage.error('Failed'));
  }

  onMounted(() => {
    fetchAll();
    fetchStandards();
    fetchFormulas();
    fetchParamStructures();
  });
</script>

<style scoped>
  .removeTableGaps :deep(table) {
    margin-bottom: 0 !important;
  }

  .domContent {
    margin: 0 auto;
  }

  /* 添加标签样式，使它们更美观 */
  .el-tag {
    margin-right: 4px;
    margin-bottom: 2px;
  }
</style>
