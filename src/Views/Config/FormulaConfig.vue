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
                       :key="item.id"
                       :label="item.standardFamilyCode"
                       :value="item.id" />
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
          <!-- 改为 prop="formulaId" -->
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
  import { ref, reactive, computed, onMounted, inject } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import type { FormInstance } from 'element-plus';

  const request = inject('request');

  // === Type Definitions ===
  interface AddFormulaDto {
    formulaId: string;  // 改为 formulaId（后端字段名）
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


  // === Mock Data ===
  const standardFamilyOptions = ref<Array<{ id: string; name: string }>>([]);

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

  const searchForm = reactive({
    standardFamilyId: '',
  });

  const formulaList = ref<FormulaResponseDto[]>([]);

  const currentFamilyName = computed(() => {
    const selected = standardFamilyOptions.value?.find(item => item.id === searchForm.standardFamilyId);
    return selected?.standardFamilyCode || '';
  });

  const dialogTitle = computed(() => isAddMode.value ? 'Add Formula' : 'Edit Formula');

  const initFormulaForm: AddFormulaDto = {
    formulaId: '',  // 改为 formulaId
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
      const res = await request.get('/StandardFamily/getall');
      if (res.data.isSuccess) {
        standardFamilyOptions.value = res.data.value || [];
      } else {
        ElMessage.error(res.data.error || 'Failed to load standard families');
        standardFamilyOptions.value = [];
      }
    } catch (error) {
      console.error('Failed to fetch standard families:', error);
      ElMessage.error('Failed to load standard families');
      standardFamilyOptions.value = [];
    }
  };

  onMounted(() => {
    fetchStandardFamilies();
  });

  const handleStandardFamilyChange = async (val: string) => {
    if (!val) {
      formulaList.value = [];
      return;
    }

    const selectedFamily = standardFamilyOptions.value.find(item => item.id === val);
    if (!selectedFamily || !selectedFamily.formulaIds?.length) {
      formulaList.value = [];
      return;
    }

    try {
      const res = await request.get('/ParamFormula/get-by-ids', {
        params: {
          ids: selectedFamily.formulaIds
        }
      });

      if (res.data.isSuccess) {
        formulaList.value = res.data.value;
      } else {
        ElMessage.error(res.data.error || 'Failed to fetch formulas');
        formulaList.value = [];
      }
    } catch (error) {
      console.error('Failed to fetch formulas:', error);
      ElMessage.error('Failed to fetch formulas');
      formulaList.value = [];
    }
  };

  const handleAddFormula = () => {
    isAddMode.value = true;
    Object.assign(formulaForm, { ...initFormulaForm, standardFamilyIds: [searchForm.standardFamilyId] });
    dialogVisible.value = true;
  };

  const handleEditFormula = (row: FormulaResponseDto) => {
    isAddMode.value = false;
    // 后端返回的字段名可能是 FormulaId，需要映射
    Object.assign(formulaForm, {
      formulaId: row.formulaId || row.id,  // 兼容不同字段名
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
      // 调用激活接口
      const res = await request.put(`/ParamFormula/active/${row.id}`);

      if (res.data.isSuccess) {
        // 更新本地状态
        row.isActive = true;
        ElMessage.success('Formula activated successfully');
      } else {
        ElMessage.error(res.data.error || 'Failed to activate formula');
      }
    } catch (error) {
      console.error('Failed to activate formula:', error);
      ElMessage.error('Failed to activate formula');
    }
  };


  const submitFormulaForm = async () => {
    if (!formulaFormRef.value) return;
    await formulaFormRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true;
        try {
          // 构造请求数据
          const requestData = {
            formulaId: formulaForm.formulaId,
            name: formulaForm.name,
            paramName: formulaForm.paramName,
            conditionFields: formulaForm.conditionFields,
            standardFamilyIds: formulaForm.standardFamilyIds || [searchForm.standardFamilyId],
            paramStructureIds: formulaForm.paramStructureIds || [],
            expressionTemplate: formulaForm.expressionTemplate,
            description: formulaForm.description
          };

          if (isAddMode.value) {
            // 调用新增接口
            const res = await request.post('/ParamFormula/add', requestData);
            if (res.data.isSuccess) {
              ElMessage.success('Formula added successfully');
            } else {
              ElMessage.error(res.data.error || 'Failed to add formula');
              return;
            }
          } else {
            // 编辑模式 - 调用更新接口
            const res = await request.put('/ParamFormula/update', requestData);
            if (res.data.isSuccess) {
              ElMessage.success('Formula updated successfully');
            } else {
              ElMessage.error(res.data.error || 'Failed to update formula');
              return;
            }
          }

          dialogVisible.value = false;
          // 刷新列表
          await handleStandardFamilyChange(searchForm.standardFamilyId);
        } catch (error) {
          console.error('Operation failed:', error);
          ElMessage.error('Operation failed');
        } finally {
          submitLoading.value = false;
        }
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
         // 调用删除接口（如果后端有提供）
         const res = await request.delete('/ParamFormula/delete', { params: { id: row.id } });
         if (res.data.isSuccess) {
           ElMessage.success('Deleted successfully');
         } else {
           ElMessage.error(res.data.error || 'Failed to delete');
           return;
         }
        ElMessage.success('Deleted successfully');
        await handleStandardFamilyChange(searchForm.standardFamilyId);
      } catch (error) {
        console.error('Failed to delete:', error);
        ElMessage.error('Failed to delete');
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

  /* 添加横向滚动样式 */
  .el-table {
    overflow-x: auto;
  }
</style>
