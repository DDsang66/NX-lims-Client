<template>
  <div class="formula-management-container">
    <!--  Top: Standard Family Search Area-->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="Standard Family">
          <el-select v-model="searchForm.standardFamilyId"
                     placeholder="Please select a standard family"
                     filterable
                     clearable
                     @change="handleStandardFamilyChange">
            <el-option v-for="item in standardFamilyOptions"
                       :key="item.standardFamilyId"
                       :label="item.standardFamilyCode"
                       :value="item.standardFamilyId" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- Bottom: Formula List Area-->
    <el-card shadow="never" class="table-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>Formula List {{ currentFamilyName ? `(${currentFamilyName})` : '' }}</span>
          <el-button type="primary"
                     :disabled="!searchForm.standardFamilyId"
                     @click="handleAddFormula">
            Add Formula
          </el-button>
        </div>
      </template>

      <el-table :data="formulaList" border style="width: 100%" empty-text="Please select a standard family first, or no formulas found under the current family">
        <!--  固定ID列-->
        <el-table-column prop="id" label="Formula ID" width="180" fixed="left" />
        <!--  其他列-->
        <el-table-column prop="name" label="Formula Name" width="150" />
        <el-table-column prop="paramName" label="Param Name" width="150" />
        <el-table-column prop="expressionTemplate" label="Expression Template" min-width="250" show-overflow-tooltip />
        <el-table-column prop="conditionFields" label="Condition Fields" width="200">
          <template #default="{ row }">
            <el-tag v-for="field in row.conditionFields" :key="field" size="small" style="margin-right: 5px;">
              {{ field }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description" width="200" show-overflow-tooltip />
        <el-table-column label="Status" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? 'Active' : 'Inactive' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 操作列-->
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEditFormula(row)">Edit</el-button>
            <el-button size="small" type="success" link
                       @click="handleToggleActive(row)"
                       :disabled="row.isActive">
              Activate
            </el-button>
            <el-button size="small" type="danger" link @click="handleDeleteFormula(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- Add/Edit Formula Dialog-->
    <el-dialog v-model="dialogVisible"
               :title="dialogTitle"
               width="600px"
               :close-on-click-modal="false">
      <el-form :model="formulaForm" :rules="formulaRules" ref="formulaFormRef" label-width="120px">
        <el-form-item label="Formula ID" prop="formulaId">
          <el-input v-model="formulaForm.formulaId"
                    :disabled="!isAddMode"
                    :placeholder="isAddMode ? 'Please enter formula ID' : 'Formula ID is read-only'" />
        </el-form-item>
        <el-form-item label="Formula Name" prop="name">
          <el-input v-model="formulaForm.name" placeholder="Please enter formula name" />
        </el-form-item>
        <el-form-item label="Param Name" prop="paramName">
          <el-input v-model="formulaForm.paramName" placeholder="Please enter param name" />
        </el-form-item>
        <el-form-item label="Expression" prop="expressionTemplate">
          <el-input v-model="formulaForm.expressionTemplate" type="textarea" placeholder="e.g.: ${field1} + ${field2} → ${param}" />
        </el-form-item>
        <el-form-item label="Condition Fields" prop="conditionFields">
          <el-select v-model="formulaForm.conditionFields" multiple filterable allow-create placeholder="Type and press Enter to add fields">
          </el-select>
        </el-form-item>
        <el-form-item label="Param Structures" prop="paramStructureIds">
          <el-select v-model="formulaForm.paramStructureIds" multiple filterable placeholder="Please select param structure">
            <el-option v-for="item in paramStructureOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="formulaForm.description" type="textarea" placeholder="Please enter description" />
        </el-form-item>
        <el-form-item label="Standard Family" prop="standardFamilyIds" v-if="isAddMode">
          <el-select v-model="formulaForm.standardFamilyIds" multiple disabled>
            <el-option :label="currentFamilyName" :value="searchForm.standardFamilyId" />
          </el-select>
          <div class="el-form-item__tips">Automatically assigned to the currently selected standard family</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitFormulaForm" :loading="submitLoading">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, inject, watch, nextTick } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import type { FormInstance } from 'element-plus';

  const request = inject('request');

  // === Type Definitions ===
  interface StandardFamily {
    standardFamilyId: string;
    standardFamilyCode: string;
    standardIds?: string[];
    formulaIds?: string[];
    paramStructureIds?: string[];
    [key: string]: any;
  }

  interface AddFormulaDto {
    formulaId: string;
    name: string;
    paramName: string;
    conditionFields: string[];
    standardFamilyIds?: string[];
    paramStructureIds?: string[];
    expressionTemplate: string;
    description: string;
  }

  interface FormulaResponseDto {
    id: string;
    formulaId?: string;
    paramStructureIds: string[];
    standardFamilyIds: string[];
    name: string;
    paramName: string;
    conditionFields: string[];
    expressionTemplate: string;
    description: string;
    version: number;
    effectiveDate: string;
    isActive: boolean;
  }

  const formulaRules = reactive({
    formulaId: [{ required: true, message: 'Please enter formula ID', trigger: 'blur' }],
    name: [{ required: true, message: 'Please enter formula name', trigger: 'blur' }],
    paramName: [{ required: true, message: 'Please enter param name', trigger: 'blur' }],
    expressionTemplate: [{ required: true, message: 'Please enter expression template', trigger: 'blur' }],
  });

  // === Data ===
  const standardFamilyOptions = ref<StandardFamily[]>([]);
  const paramStructureOptions = ref([
    { id: 'PS001', name: 'Dimension Structure' },
    { id: 'PS002', name: 'Material Structure' },
  ]);

  // === Core State ===
  const loading = ref(false);
  const submitLoading = ref(false);
  const dialogVisible = ref(false);
  const isAddMode = ref(true);
  const formulaFormRef = ref<FormInstance>();

  const searchForm = ref({
    standardFamilyId: '',
  });

  const formulaList = ref<FormulaResponseDto[]>([]);

  const currentFamilyName = computed(() => {
    const selected = standardFamilyOptions.value?.find(item => item.standardFamilyId === searchForm.value.standardFamilyId);
    return selected?.standardFamilyCode || '';
  });

  const dialogTitle = computed(() => isAddMode.value ? 'Add Formula' : 'Edit Formula');

  const initFormulaForm: AddFormulaDto = {
    formulaId: '',
    name: '',
    paramName: '',
    conditionFields: [],
    standardFamilyIds: [],
    paramStructureIds: [],
    expressionTemplate: '',
    description: '',
  };

  const formulaForm = reactive<AddFormulaDto>({ ...initFormulaForm });

  // === Business Logic ===

  const fetchStandardFamilies = async () => {
    try {
      loading.value = true;
      const res = await request.get('/StandardFamily/getall');
      console.log('API Response:', res);

      if (res.data.isSuccess) {
        const data = res.data.value || [];
        console.log('Raw data:', data);

        standardFamilyOptions.value = data;
        console.log('Processed options:', standardFamilyOptions.value);

        // 如果有第一个选项且当前没有选中，自动选中第一个
        if (data.length > 0 && !searchForm.value.standardFamilyId) {
          searchForm.value.standardFamilyId = data[0].standardFamilyId;
          console.log('Auto selected first family:', searchForm.value.standardFamilyId);
          // 使用 nextTick 确保 DOM 更新后再加载数据
          await nextTick();
          // 手动触发加载
          await loadFormulas(searchForm.value.standardFamilyId);
        }
      } else {
        ElMessage.error(res.data.error || 'Failed to load standard families');
        standardFamilyOptions.value = [];
      }
    } catch (error) {
      console.error('Failed to fetch standard families:', error);
      ElMessage.error('Failed to load standard families');
      standardFamilyOptions.value = [];
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchStandardFamilies();
  });

  const loadFormulas = async (familyId: string) => {
    console.log('loadFormulas called with familyId:', familyId);

    if (!familyId) {
      formulaList.value = [];
      return;
    }

    const selectedFamily = standardFamilyOptions.value.find(item => item.standardFamilyId === familyId);
    console.log('Selected family data:', selectedFamily);

    if (!selectedFamily) {
      formulaList.value = [];
      ElMessage.warning('Selected family not found');
      return;
    }

    // 检查是否有 formulaIds
    if (!selectedFamily.formulaIds || selectedFamily.formulaIds.length === 0) {
      formulaList.value = [];
      ElMessage.info('No formulas found for this family');
      return;
    }

    console.log('Formula IDs to fetch (array):', selectedFamily.formulaIds);

    // 调用 API 获取公式列表 - 使用数组形式
    try {
      loading.value = true;

      // 方式1: 使用 params 传递数组（如果后端支持数组参数）
      const res = await request.get('/ParamFormula/get-by-ids', {
        params: {
          ids: selectedFamily.formulaIds  // 直接传递数组
        },
        paramsSerializer: {
          indexes: null // 让 axios 以 id[]=1&id[]=2 格式序列化
        }
      });

      // 方式2: 如果后端使用 POST 方法
      // const res = await request.post('/ParamFormula/get-by-ids', {
      //   ids: selectedFamily.formulaIds
      // });

      // 方式3: 如果后端需要 JSON 字符串
      // const res = await request.get('/ParamFormula/get-by-ids', {
      //   params: {
      //     ids: JSON.stringify(selectedFamily.formulaIds)
      //   }
      // });

      console.log('Formula API response:', res);

      if (res.data.isSuccess) {
        formulaList.value = res.data.value || [];
        console.log('Formulas loaded:', formulaList.value.length);
        if (formulaList.value.length === 0) {
          ElMessage.info('No formula data returned from API');
        }
      } else {
        ElMessage.error(res.data.error || 'Failed to fetch formulas');
        formulaList.value = [];
      }
    } catch (error) {
      console.error('Failed to fetch formulas:', error);
      ElMessage.error('Failed to fetch formulas');
      formulaList.value = [];
    } finally {
      loading.value = false;
    }
  };

  const handleStandardFamilyChange = (val: string) => {
    console.log('handleStandardFamilyChange called with val:', val);
    console.log('searchForm.standardFamilyId:', searchForm.value.standardFamilyId);

    const familyId = val || searchForm.value.standardFamilyId;
    loadFormulas(familyId);
  };

  // 监听 standardFamilyId 的变化
  watch(() => searchForm.value.standardFamilyId, (newVal, oldVal) => {
    console.log('watch - standardFamilyId changed from', oldVal, 'to', newVal);
    if (newVal && newVal !== oldVal) {
      loadFormulas(newVal);
    } else if (!newVal) {
      formulaList.value = [];
    }
  });

  const handleAddFormula = () => {
    isAddMode.value = true;
    Object.assign(formulaForm, {
      ...initFormulaForm,
      standardFamilyIds: [searchForm.value.standardFamilyId]
    });
    dialogVisible.value = true;
  };

  const handleEditFormula = (row: FormulaResponseDto) => {
    isAddMode.value = false;
    Object.assign(formulaForm, {
      formulaId: row.formulaId || row.id,
      name: row.name,
      paramName: row.paramName,
      conditionFields: row.conditionFields || [],
      standardFamilyIds: row.standardFamilyIds || [],
      paramStructureIds: row.paramStructureIds || [],
      expressionTemplate: row.expressionTemplate,
      description: row.description || ''
    });
    dialogVisible.value = true;
  };

  const handleToggleActive = async (row: FormulaResponseDto) => {
    try {
      loading.value = true;
      const res = await request.put(`/ParamFormula/active/${row.id}`);

      if (res.data.isSuccess) {
        row.isActive = true;
        ElMessage.success('Formula activated successfully');
      } else {
        ElMessage.error(res.data.error || 'Failed to activate formula');
      }
    } catch (error) {
      console.error('Failed to activate formula:', error);
      ElMessage.error('Failed to activate formula');
    } finally {
      loading.value = false;
    }
  };

  const submitFormulaForm = async () => {
    if (!formulaFormRef.value) return;

    await formulaFormRef.value.validate(async (valid) => {
      if (!valid) return;

      submitLoading.value = true;
      try {
        const requestData = {
          formulaId: formulaForm.formulaId,
          name: formulaForm.name,
          paramName: formulaForm.paramName,
          conditionFields: formulaForm.conditionFields,
          standardFamilyIds: formulaForm.standardFamilyIds || [searchForm.value.standardFamilyId],
          paramStructureIds: formulaForm.paramStructureIds || [],
          expressionTemplate: formulaForm.expressionTemplate,
          description: formulaForm.description
        };

        let res;
        if (isAddMode.value) {
          res = await request.post('/ParamFormula/add', requestData);
          if (res.data.isSuccess) {
            ElMessage.success('Formula added successfully');
          } else {
            ElMessage.error(res.data.error || 'Failed to add formula');
            return;
          }
        } else {
          res = await request.put('/ParamFormula/update', requestData);
          if (res.data.isSuccess) {
            ElMessage.success('Formula updated successfully');
          } else {
            ElMessage.error(res.data.error || 'Failed to update formula');
            return;
          }
        }

        dialogVisible.value = false;
        // 刷新列表
        await loadFormulas(searchForm.value.standardFamilyId);
      } catch (error) {
        console.error('Operation failed:', error);
        ElMessage.error('Operation failed');
      } finally {
        submitLoading.value = false;
      }
    });
  };

  const handleDeleteFormula = (row: FormulaResponseDto) => {
    ElMessageBox.confirm(`Are you sure you want to delete formula [${row.name}]?`, 'Warning', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }).then(async () => {
      try {
        loading.value = true;
        const res = await request.delete('/ParamFormula/delete', { params: { id: row.id } });
        if (res.data.isSuccess) {
          ElMessage.success('Deleted successfully');
          await loadFormulas(searchForm.value.standardFamilyId);
        } else {
          ElMessage.error(res.data.error || 'Failed to delete');
        }
      } catch (error) {
        console.error('Failed to delete:', error);
        ElMessage.error('Failed to delete');
      } finally {
        loading.value = false;
      }
    }).catch(() => { });
  };
</script>

<style scoped>
  .formula-management-container {
    padding: 20px;
  }

  .search-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .el-form-item__tips {
    font-size: 12px;
    color: #909399;
    line-height: 1;
    padding-top: 4px;
  }

  .el-table {
    overflow-x: auto;
  }
</style>
