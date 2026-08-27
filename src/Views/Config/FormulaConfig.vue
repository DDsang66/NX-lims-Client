<template>
  <div class="formula-management-container">
    <!-- Top: Standard Family Search Area -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="Standard Family">
          <el-select v-model="searchForm.standardFamilyId"
                     placeholder="Please select a standard family"
                     filterable
                     clearable
                     @change="handleSearchChange">
            <el-option v-for="item in standardFamilyOptions"
                       :key="item.standardFamilyId"
                       :label="item.standardFamilyCode"
                       :value="item.standardFamilyId" />
          </el-select>
        </el-form-item>
        <el-form-item label="Contact Buyer">
          <el-select v-model="searchForm.contactBuyerId"
                     placeholder="Please select a contact buyer"
                     filterable
                     clearable
                     @change="handleSearchChange">
            <el-option v-for="item in buyerOptions"
                       :key="item.buyerCode"
                       :label="item.buyerName || item.buyerCode"
                       :value="item.buyerCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="Engine Layer" style="min-width: 180px;">
          <el-select v-model="searchForm.engineLayer"
                     placeholder="Please select engine layer"
                     clearable
                     @change="handleSearchChange"
                     style="width: 160px;">
            <el-option v-for="item in engineLayerOptions"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Bottom: Formula List Area -->
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
        <!-- 固定ID列 -->
        <el-table-column prop="id" label="Formula ID" width="180" fixed="left" />
        <!-- 其他列 -->
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
        <!-- EngineLayer 列 -->
        <el-table-column prop="engineLayer" label="Engine Layer" width="120">
          <template #default="{ row }">
            <el-tag :type="row.engineLayer === 'Buyer' ? 'primary' : 'warning'" size="small">
              {{ row.engineLayer || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- Contact Buyer 列 - 修复：使用 buyerCodes 并显示名称 -->
        <el-table-column label="Contact Buyer" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.buyerCodes && row.buyerCodes.length > 0">
              {{ getBuyerNames(row.buyerCodes) }}
            </span>
            <span v-else>-</span>
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
        <!-- 操作列 -->
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

    <!-- Add/Edit Formula Dialog -->
    <el-dialog v-model="dialogVisible"
               :title="dialogTitle"
               width="650px"
               :close-on-click-modal="false">
      <el-form :model="formulaForm" :rules="formulaRules" ref="formulaFormRef" label-width="140px">
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
        <!-- Contact Buyer (多选) -->
        <el-form-item label="Contact Buyer" prop="buyerCodes">
          <el-select v-model="formulaForm.buyerCodes"
                     multiple
                     filterable
                     collapse-tags
                     collapse-tags-tooltip
                     placeholder="Please select contact buyers">
            <el-option v-for="item in buyerOptions"
                       :key="item.buyerCode"
                       :label="item.buyerName || item.buyerCode"
                       :value="item.buyerCode" />
          </el-select>
        </el-form-item>
        <!-- Engine Layer -->
        <el-form-item label="Engine Layer" prop="engineLayer">
          <el-select v-model="formulaForm.engineLayer"
                     placeholder="Please select engine layer"
                     clearable>
            <el-option v-for="item in engineLayerOptions"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value" />
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

  interface BuyerListDto {
    buyerCode: string;
    buyerName?: string;
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
    buyerCodes: string[];
    engineLayer?: string;
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
    buyerCodes?: string[];
    engineLayer?: string;
  }

  const formulaRules = reactive({
    formulaId: [{ required: true, message: 'Please enter formula ID', trigger: 'blur' }],
    name: [{ required: true, message: 'Please enter formula name', trigger: 'blur' }],
    paramName: [{ required: true, message: 'Please enter param name', trigger: 'blur' }],
    expressionTemplate: [{ required: true, message: 'Please enter expression template', trigger: 'blur' }],
  });

  // === Data ===
  const standardFamilyOptions = ref<StandardFamily[]>([]);
  const buyerOptions = ref<BuyerListDto[]>([]);
  const paramStructureOptions = ref([
    { id: 'PS001', name: 'Dimension Structure' },
    { id: 'PS002', name: 'Material Structure' },
  ]);

  const engineLayerOptions = ref([
    { value: 'Buyer', label: 'Buyer' },
    { value: 'Standard', label: 'Standard' },
  ]);

  // === Core State ===
  const loading = ref(false);
  const submitLoading = ref(false);
  const dialogVisible = ref(false);
  const isAddMode = ref(true);
  const formulaFormRef = ref<FormInstance>();

  const searchForm = ref({
    standardFamilyId: '',
    contactBuyerId: '',
    engineLayer: '',
  });

  // 存储所有原始数据（未筛选）
  const allFormulas = ref<FormulaResponseDto[]>([]);
  // 显示的数据（经过筛选）
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
    buyerCodes: [],
    engineLayer: '',
  };

  const formulaForm = reactive<AddFormulaDto>({ ...initFormulaForm });

  // === Helper Functions ===

  // 根据 buyerCodes 获取买家名称列表（用于表格显示）
  const getBuyerNames = (buyerCodes: string[] | undefined): string => {
    if (!buyerCodes || buyerCodes.length === 0) return '-';
    return buyerCodes
      .map(code => {
        const buyer = buyerOptions.value.find(b => b.buyerCode === code);
        return buyer?.buyerName || code;
      })
      .join(', ');
  };

  // === 前端筛选逻辑 ===
  const applyFilters = () => {
    let filtered = [...allFormulas.value];

    // 按 Contact Buyer 筛选
    if (searchForm.value.contactBuyerId) {
      filtered = filtered.filter(f =>
        f.buyerCodes && f.buyerCodes.includes(searchForm.value.contactBuyerId)
      );
    }

    // 按 Engine Layer 筛选
    if (searchForm.value.engineLayer) {
      filtered = filtered.filter(f =>
        f.engineLayer === searchForm.value.engineLayer
      );
    }

    formulaList.value = filtered;
    console.log('Filtered formulas:', formulaList.value.length);

    // 如果筛选后没有数据，显示提示
    if (formulaList.value.length === 0 && (searchForm.value.contactBuyerId || searchForm.value.engineLayer)) {
      ElMessage.info('No formulas match the current filter criteria');
    }
  };

  // === Business Logic ===

  const fetchBuyerList = async () => {
    try {
      const res = await request.get('/buyer/buyer-list');
      console.log('Buyer API Response:', res);

      if (res.data.isSuccess) {
        buyerOptions.value = (res.data.value || []).map((item: any) => ({
          buyerCode: item.buyerCode || item.BuyerCode,
          buyerName: item.buyerName || item.BuyerName
        }));
        console.log('Buyer options loaded:', buyerOptions.value.length);
      } else {
        ElMessage.error(res.data.error || 'Failed to load buyer list');
        buyerOptions.value = [];
      }
    } catch (error) {
      console.error('Failed to fetch buyer list:', error);
      ElMessage.error('Failed to load buyer list');
      buyerOptions.value = [];
    }
  };

  const fetchStandardFamilies = async () => {
    try {
      loading.value = true;
      const res = await request.get('/StandardFamily/getall');
      console.log('API Response:', res);

      if (res.data.isSuccess) {
        const data = res.data.value || [];
        standardFamilyOptions.value = data;

        if (data.length > 0 && !searchForm.value.standardFamilyId) {
          searchForm.value.standardFamilyId = data[0].standardFamilyId;
          await nextTick();
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
    Promise.all([
      fetchStandardFamilies(),
      fetchBuyerList()
    ]);
  });

  const loadFormulas = async (familyId: string) => {
    console.log('loadFormulas called with familyId:', familyId);

    if (!familyId) {
      allFormulas.value = [];
      formulaList.value = [];
      return;
    }

    const selectedFamily = standardFamilyOptions.value.find(item => item.standardFamilyId === familyId);

    if (!selectedFamily) {
      allFormulas.value = [];
      formulaList.value = [];
      ElMessage.warning('Selected family not found');
      return;
    }

    if (!selectedFamily.formulaIds || selectedFamily.formulaIds.length === 0) {
      allFormulas.value = [];
      formulaList.value = [];
      ElMessage.info('No formulas found for this family');
      return;
    }

    try {
      loading.value = true;

      // 只传 ids，不传筛选参数（筛选在前端做）
      const params: any = {
        ids: selectedFamily.formulaIds
      };

      console.log('Request params:', params);

      const res = await request.get('/ParamFormula/get-by-ids', {
        params: params,
        paramsSerializer: {
          indexes: null
        }
      });

      console.log('Formula API response:', res);

      if (res.data.isSuccess) {
        const rawData = res.data.value || [];
        // 映射后端字段到前端
        allFormulas.value = rawData.map((item: any) => ({
          id: item.id || item.Id || '',
          formulaId: item.formulaId || item.FormulaId || item.id || item.Id || '',
          paramStructureIds: item.paramStructureIds || item.ParamStrurctureIds || [],
          standardFamilyIds: item.standardFamilyIds || item.StandardFamilyIds || [],
          name: item.name || item.Name || '',
          paramName: item.paramName || item.ParamName || '',
          conditionFields: item.conditionFields || item.ConditionFields || [],
          expressionTemplate: item.expressionTemplate || item.ExpressionTemplate || '',
          description: item.description || item.Description || '',
          version: item.version || item.Version || 0,
          effectiveDate: item.effectiveDate || item.EffectiveDate || '',
          isActive: item.isActive ?? item.IsActive ?? false,
          buyerCodes: item.buyerCodes || item.BuyerCodes || [],
          engineLayer: item.engineLayer || item.EngineLayer || ''
        }));
        console.log('All formulas loaded:', allFormulas.value.length);

        // 应用前端筛选
        applyFilters();
      } else {
        ElMessage.error(res.data.error || 'Failed to fetch formulas');
        allFormulas.value = [];
        formulaList.value = [];
      }
    } catch (error) {
      console.error('Failed to fetch formulas:', error);
      ElMessage.error('Failed to fetch formulas');
      allFormulas.value = [];
      formulaList.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 统一的搜索变更处理
  const handleSearchChange = () => {
    console.log('Search changed:', searchForm.value);
    if (searchForm.value.standardFamilyId) {
      // 重新加载数据（会清空筛选条件重新获取）
      loadFormulas(searchForm.value.standardFamilyId);
    }
  };

  // 监听 standardFamilyId 的变化
  watch(() => searchForm.value.standardFamilyId, (newVal, oldVal) => {
    console.log('watch - standardFamilyId changed from', oldVal, 'to', newVal);
    if (newVal && newVal !== oldVal) {
      // 切换标准族时，重置筛选条件
      searchForm.value.contactBuyerId = '';
      searchForm.value.engineLayer = '';
      loadFormulas(newVal);
    } else if (!newVal) {
      allFormulas.value = [];
      formulaList.value = [];
    }
  });

  // 监听 Contact Buyer 和 Engine Layer 筛选条件变化（只做前端筛选，不调接口）
  watch(
    () => [searchForm.value.contactBuyerId, searchForm.value.engineLayer],
    () => {
      console.log('Filter conditions changed (frontend only):', {
        contactBuyerId: searchForm.value.contactBuyerId,
        engineLayer: searchForm.value.engineLayer
      });
      // 直接在前端筛选，不调接口
      applyFilters();
    },
    { deep: true }
  );

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
      description: row.description || '',
      buyerCodes: row.buyerCodes || [],
      engineLayer: row.engineLayer || ''
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
        // 更新原始数据
        const original = allFormulas.value.find(f => f.id === row.id);
        if (original) {
          original.isActive = true;
        }
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
          description: formulaForm.description,
          buyerCodes: formulaForm.buyerCodes || [],
          engineLayer: formulaForm.engineLayer || ''
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
        // 重新加载数据
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

  .search-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0;
  }

    .search-form .el-form-item {
      margin-bottom: 0;
      margin-right: 18px;
    }

      .search-form .el-form-item:last-child {
        margin-right: 0;
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
