<template>
  <div>
    <div class="domContent">
      <!-- ==================== Top: Search/Filter Area ==================== -->
      <div class="topHalf">
        <!-- Left: Search and Filter -->
        <div class="halfBox">
          <div class="boxTitle">Param Structure Management</div>
          <div class="toolbar">
            <el-input 
              v-model="searchKeyword" 
              placeholder="Search ID/Name/Description" 
              clearable 
              style="flex: 1;"
              @input="handleSearch"
            />
            <el-select 
              v-model="searchStatus" 
              placeholder="Filter by Status" 
              clearable 
              style="width: 140px; margin-left: 10px;"
              @change="handleSearch"
            >
              <el-option label="All" value="" />
              <el-option label="Active" value="true" />
              <el-option label="Inactive" value="false" />
            </el-select>
            <el-button type="primary" @click="openAddDialog" style="margin-left: 10px;">
              <el-icon><Plus /></el-icon>
              New Param Structure
            </el-button>
          </div>

          <!-- Statistics -->
          <div class="stats-info">
            <span>Total {{ filteredData.length }} records</span>
            <span v-if="filteredData.length > 0">
              Last Updated: {{ formatDate(filteredData[0]?.lastModifiedTime) }}
            </span>
          </div>

          <!-- Table -->
          <el-table 
            :data="pagedData" 
            border 
            class="removeTableGaps" 
            height="350" 
            style="width: 100%" 
            v-loading="loading"
            @row-click="handleRowClick"
          >
            <el-table-column type="expand">
              <template #default="{ row }">
                <div style="margin-left: 30px; padding: 10px 0;">
                  <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <!-- Basic Information -->
                    <div style="min-width: 200px;">
                      <h4>Basic Information</h4>
                      <div><b>ID:</b> {{ row.id }}</div>
                      <div><b>Param Name:</b> {{ row.name }}</div>
                      <div><b>Description:</b> {{ row.description || '-' }}</div>
                      <div><b>Status:</b> 
                        <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
                          {{ row.isActive ? 'Active' : 'Inactive' }}
                        </el-tag>
                      </div>
                      <div><b>Created:</b> {{ formatDate(row.createdTime) }}</div>
                      <div><b>Updated:</b> {{ formatDate(row.lastModifiedTime) }}</div>
                    </div>

                    <!-- Associated Formulas -->
                    <div style="min-width: 200px;">
                      <h4>Associated Formulas</h4>
                      <div v-if="row.formulas && row.formulas.length > 0">
                        <el-tag 
                          v-for="formula in row.formulas" 
                          :key="formula.id" 
                          size="small" 
                          style="margin: 2px;"
                          type="info"
                        >
                          {{ formula.id }} - {{ formula.name }}
                        </el-tag>
                      </div>
                      <span v-else class="text-muted">No associated formulas</span>
                    </div>

                    <!-- Associated Rules -->
                    <div style="min-width: 200px;">
                      <h4>Associated Rules</h4>
                      <div v-if="row.rules && row.rules.length > 0">
                        <el-tag 
                          v-for="rule in row.rules" 
                          :key="rule.id" 
                          size="small" 
                          style="margin: 2px;"
                          type="warning"
                        >
                          {{ rule.id }} - {{ rule.paramName }}
                        </el-tag>
                      </div>
                      <span v-else class="text-muted">No associated rules</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="id" label="ID" width="180" fixed="left" show-overflow-tooltip />
            <el-table-column prop="name" label="Name" min-width="150" show-overflow-tooltip />
            <el-table-column prop="description" label="Description" min-width="220" show-overflow-tooltip />
            
            <!-- Association Statistics -->
            <el-table-column label="Formulas" width="120" align="center">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.formulas?.length || 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Rules" width="120" align="center">
              <template #default="{ row }">
                <el-tag size="small" type="warning">{{ row.rules?.length || 0 }}</el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="Status" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
                  {{ row.isActive ? 'Active' : 'Inactive' }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="lastModifiedTime" label="Updated" width="180" show-overflow-tooltip>
              <template #default="{ row }">
                {{ formatDate(row.lastModifiedTime) }}
              </template>
            </el-table-column>
            
            <el-table-column label="Actions" width="250" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click.stop="openEditDialog(row)">
                  <el-icon><Edit /></el-icon>
                  Edit
                </el-button>
                <el-tooltip :content="row.isActive ? 'Deactivate' : 'Activate'" placement="top">
                  <el-button 
                    :type="row.isActive ? 'danger' : 'success'" 
                    size="small"
                    @click.stop="toggleStatus(row)"
                  >
                    <el-icon>
                      <CircleCheck v-if="!row.isActive" />
                      <VideoPause v-else />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click.stop="deleteParamStructure(row)"
                  :disabled="hasRelatedData(row)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- Pagination -->
          <div style="display: flex; justify-content: center; margin-top: 16px;">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="filteredData.length"
              layout="total, sizes, prev, pager, next"
              background
            />
          </div>
        </div>

        <!-- Right: Quick View of Associated Data -->
        <div class="halfBox">
          <div class="boxTitle">Quick View</div>
          <div class="quick-view-tabs">
            <el-tabs v-model="activeTab" @tab-change="handleTabChange">
              <el-tab-pane label="Formulas" name="formulas">
                <el-table :data="relatedFormulas" border size="small" height="280" style="width: 100%">
                  <el-table-column prop="id" label="ID" width="160" show-overflow-tooltip />
                  <el-table-column prop="name" label="Name" min-width="140" show-overflow-tooltip />
                  <el-table-column prop="paramName" label="Param Name" width="120" show-overflow-tooltip />
                  <el-table-column label="Status" width="80">
                    <template #default="{ row }">
                      <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
                        {{ row.isActive ? 'Active' : 'Inactive' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              
              <el-tab-pane label="Rules" name="rules">
                <el-table :data="relatedRules" border size="small" height="280" style="width: 100%">
                  <el-table-column prop="id" label="ID" width="160" show-overflow-tooltip />
                  <el-table-column prop="paramName" label="Param Name" width="120" show-overflow-tooltip />
                  <el-table-column prop="formulaId" label="Formula ID" width="140" show-overflow-tooltip />
                  <el-table-column prop="priority" label="Priority" width="80" align="center" />
                  <el-table-column label="Status" width="80">
                    <template #default="{ row }">
                      <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
                        {{ row.isActive ? 'Active' : 'Inactive' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== Add/Edit Dialog ==================== -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      width="65%"
      :close-on-click-modal="false"
    >
      <el-form :model="dialogForm" label-width="140px" :rules="formRules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Param Structure ID" prop="id">
              <el-input v-model="dialogForm.id"
                        placeholder="Enter ID"
                        :disabled="dialogTitle === 'Edit Param Structure'" />
              <div class="form-tip" v-if="dialogTitle !== 'Edit Param Structure'">
                ID cannot be modified once created
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Param Name" prop="name">
              <el-input v-model="dialogForm.name" placeholder="Enter name" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Description" prop="description">
          <el-input v-model="dialogForm.description"
                    type="textarea"
                    :rows="3"
                    placeholder="Enter description" />
        </el-form-item>
        <!-- 在描述字段后面添加 -->
        <el-form-item label="Formula ID" prop="formulaId">
          <el-input v-model="dialogForm.formulaId" placeholder="Enter Formula ID" />
        </el-form-item>

        <el-form-item label="Standard Family IDs" prop="standardFamilyIds">
          <el-select v-model="dialogForm.standardFamilyIds"
                     multiple
                     filterable
                     allow-create
                     placeholder="Select Standard Families"
                     style="width: 100%" />
        </el-form-item>

        <el-form-item label="Rule IDs" prop="ruleIds">
          <el-select v-model="dialogForm.ruleIds"
                     multiple
                     filterable
                     allow-create
                     placeholder="Select Rules"
                     style="width: 100%" />
        </el-form-item>

        <el-form-item label="Effective Date" prop="effectiveDate">
          <el-date-picker v-model="dialogForm.effectiveDate"
                          type="datetime"
                          placeholder="Select effective date"
                          style="width: 100%" />
        </el-form-item>

        <el-divider content-position="left">Param Structure Configuration</el-divider>

        <!-- Required Parameter -->
        <el-form-item label="Required Parameter" prop="requiredParam">
          <div style="width: 100%;">
            <el-row :gutter="10">
              <el-col :span="8">
                <el-input v-model="dialogForm.requiredParam.name"
                          placeholder="Parameter name"
                          size="small" />
              </el-col>
              <el-col :span="8">
                <el-select v-model="dialogForm.requiredParam.valueType"
                           placeholder="Parameter type"
                           size="small"
                           style="width: 100%">
                  <el-option label="String" value="System.String" />
                  <el-option label="Integer" value="System.Int32" />
                  <el-option label="Decimal" value="System.Decimal" />
                  <el-option label="Boolean" value="System.Boolean" />
                  <el-option label="DateTime" value="System.DateTime" />
                </el-select>
              </el-col>
              <el-col :span="8">
                <el-switch v-model="dialogForm.requiredParam.isNullable"
                           active-text="Nullable"
                           inactive-text="Required" />
              </el-col>
            </el-row>
            <el-row :gutter="10" style="margin-top: 8px;">
              <el-col :span="24">
                <el-input v-model="dialogForm.requiredParam.description"
                          placeholder="Parameter description"
                          size="small" />
              </el-col>
            </el-row>
          </div>
        </el-form-item>

        <!-- Condition Requirements -->
        <el-form-item label="Condition Requirements">
          <div style="width: 100%;">
            <div v-for="(condition, index) in dialogForm.conditionRequirements"
                 :key="index"
                 style="margin-bottom: 10px; padding: 10px; border: 1px solid #DCDFE6; border-radius: 4px;">
              <el-row :gutter="10">
                <el-col :span="6">
                  <el-input v-model="condition.fieldName"
                            placeholder="Field name"
                            size="small" />
                </el-col>
                <el-col :span="6">
                  <el-select v-model="condition.fieldType"
                             placeholder="Field type"
                             size="small"
                             style="width: 100%">
                    <el-option label="String" value="System.String" />
                    <el-option label="Integer" value="System.Int32" />
                    <el-option label="Decimal" value="System.Decimal" />
                    <el-option label="Boolean" value="System.Boolean" />
                    <el-option label="Enum" value="System.Enum" />
                  </el-select>
                </el-col>
                <el-col :span="6">
                  <el-switch v-model="condition.isRequired"
                             active-text="Required"
                             inactive-text="Optional" />
                </el-col>
                <el-col :span="6" style="text-align: right;">
                  <el-button type="danger"
                             size="small"
                             circle
                             @click="removeCondition(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
              <el-row :gutter="10" style="margin-top: 8px;">
                <el-col :span="24">
                  <el-select v-model="condition.allowedValues"
                             multiple
                             filterable
                             allow-create
                             placeholder="Allowed values (press Enter to add)"
                             size="small"
                             style="width: 100%" />
                </el-col>
              </el-row>
            </div>
            <el-button size="small"
                       @click="addCondition"
                       style="width: 100%;">
              <el-icon><Plus /></el-icon>
              Add Condition Requirement
            </el-button>
          </div>
        </el-form-item>

        <!-- Parameter Limitations -->
        <el-form-item label="Parameter Limitations">
          <div style="width: 100%;">
            <div v-for="(limitation, key) in dialogForm.limitations"
                 :key="key"
                 style="margin-bottom: 10px; padding: 10px; border: 1px solid #DCDFE6; border-radius: 4px;">
              <el-row :gutter="10">
                <el-col :span="6">
                  <el-input v-model="limitation.key"
                            placeholder="Parameter name"
                            size="small"
                            @input="updateLimitationKey(key, $event)" />
                </el-col>
                <el-col :span="6">
                  <el-select v-model="limitation.valueType"
                             placeholder="Type"
                             size="small"
                             style="width: 100%">
                    <el-option label="String" value="System.String" />
                    <el-option label="Integer" value="System.Int32" />
                    <el-option label="Decimal" value="System.Decimal" />
                    <el-option label="Boolean" value="System.Boolean" />
                  </el-select>
                </el-col>
                <el-col :span="10">
                  <el-select v-model="limitation.allowedValues"
                             multiple
                             filterable
                             allow-create
                             placeholder="Allowed values (press Enter)"
                             size="small"
                             style="width: 100%" />
                </el-col>
                <el-col :span="2" style="text-align: right;">
                  <el-button type="danger"
                             size="small"
                             circle
                             @click="removeLimitation(key)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
              <el-row :gutter="10" style="margin-top: 8px;">
                <el-col :span="12">
                  <el-input v-model="limitation.min"
                            placeholder="Min value"
                            size="small" />
                </el-col>
                <el-col :span="12">
                  <el-input v-model="limitation.max"
                            placeholder="Max value"
                            size="small" />
                </el-col>
              </el-row>
            </div>
            <el-button size="small"
                       @click="addLimitation"
                       style="width: 100%;">
              <el-icon><Plus /></el-icon>
              Add Parameter Limitation
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="confirmSubmit" :loading="submitLoading">
          {{ dialogTitle === 'Edit Param Structure' ? 'Update' : 'Create' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, CircleCheck, VideoPause } from '@element-plus/icons-vue';

// ==================== Inject and Reactive Data ====================
const request = inject('request');
const loading = ref(false);
const submitLoading = ref(false);
const allData = ref([]);

// Search and Filter
const searchKeyword = ref('');
const searchStatus = ref('');
const filteredData = ref([]);

// Pagination
const currentPage = ref(1);
const pageSize = ref(20);

// Related Data Views
const activeTab = ref('formulas');
const relatedFormulas = ref([]);
const relatedRules = ref([]);
const selectedStructureId = ref('');

// ==================== Dialog Related ====================
const dialogVisible = ref(false);
const dialogTitle = ref('New Param Structure');
const formRef = ref(null);

  const dialogForm = ref({
    id: '',
    name: '',
    description: '',
    requiredParam: {
      name: '',
      valueType: 'System.String',
      description: '',
      isNullable: false,
      defaultValue: null
    },
    conditionRequirements: [],
    limitations: {},
    // 新增字段
    formulaId: '',
    standardFamilyIds: [],
    ruleIds: [],
    effectiveDate: new Date().toISOString()
  });

// Form Validation Rules
const formRules = {
  id: [
    { required: true, message: 'Please enter Param Structure ID', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_-]+$/, message: 'ID can only contain letters, numbers, underscores and hyphens', trigger: 'blur' }
  ],
  name: [
    { required: true, message: 'Please enter name', trigger: 'blur' }
  ]
};

// ==================== Computed Properties ====================
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

// ==================== Core Methods ====================

// Search Handler
function handleSearch() {
  currentPage.value = 1;
  applyFilters();
}

function applyFilters() {
  let result = allData.value;
  
  // Keyword Search
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase();
    result = result.filter(item => 
      (item.id || '').toLowerCase().includes(keyword) ||
      (item.name || '').toLowerCase().includes(keyword) ||
      (item.description || '').toLowerCase().includes(keyword)
    );
  }
  
  // Status Filter
  if (searchStatus.value !== '') {
    const isActive = searchStatus.value === 'true';
    result = result.filter(item => item.isActive === isActive);
  }
  
  filteredData.value = result;
}

  // ==================== 数据映射适配器 ====================
  function mapParamStructureResponse(item) {
    return {
      // 字段名映射
      id: item.paramStructureId,  // ParamStructureResponseDto.ParamStructureId → id
      name: item.paramName,        // ParamStructureResponseDto.ParamName → name
      description: item.paramSchema?.requiredParam?.description || '',
      isActive: true,              // 后端可能没有这个字段，默认true或从其他字段推断
      createdTime: item.effectiveDate,  // 使用生效时间作为创建时间
      lastModifiedTime: item.effectiveDate, // 暂时使用生效时间

      // 关联数据 - 从ID列表获取（需要额外加载）
      formulas: [],  // 需要通过 FormulaId 或 StandardFamilyIds 获取
      rules: [],     // 需要通过 RuleIds 获取

      // Schema 信息（用于编辑）
      paramSchema: item.paramSchema,
      formulaId: item.formulaId,
      standardFamilyIds: item.standardFamilyIds || [],
      ruleIds: item.ruleIds || [],
      effectiveDate: item.effectiveDate
    };
  }

// Fetch All Data
  function fetchAll() {
    loading.value = true;
    request.get('/ParamStructure/getall')
      .then(res => {
        if (res.data.isSuccess) {
          // 映射后端数据到前端格式
          allData.value = (res.data.value || []).map(item => mapParamStructureResponse(item));

          // 批量加载关联数据
          loadAllRelatedData(allData.value);

          applyFilters();
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

  async function loadAllRelatedData(items) {
    const promises = [];

    items.forEach(item => {
      // 如果有 FormulaId，加载公式信息
      if (item.formulaId) {
        promises.push(
          request.get(`/ParamFormula/get/${item.formulaId}`)
            .then(res => {
              if (res.data.isSuccess) {
                item.formulas = [res.data.value];
              }
            })
            .catch(() => { })
        );
      }

      // 如果有 RuleIds，加载规则信息
      if (item.ruleIds && item.ruleIds.length > 0) {
        promises.push(
          request.get('/ParamRules/get-by-ids', {
            params: { ids: item.ruleIds }
          })
            .then(res => {
              if (res.data.isSuccess) {
                item.rules = res.data.value || [];
              }
            })
            .catch(() => { })
        );
      }
    });

    await Promise.allSettled(promises);
  }

// Open Add Dialog
function openAddDialog() {
  dialogTitle.value = 'New Param Structure';
  dialogForm.value = {
    id: '',
    name: '',
    description: '',
    requiredParam: {
      name: '',
      valueType: 'System.String',
      description: '',
      isNullable: false,
      defaultValue: null
    },
    conditionRequirements: [],
    limitations: {}
  };
  dialogVisible.value = true;
}

// Open Edit Dialog
  function openEditDialog(row) {
    dialogTitle.value = 'Edit Param Structure';

    // 直接从 row 中获取数据，因为我们已经映射过了
    dialogForm.value = {
      id: row.id,
      name: row.name,
      description: row.description || '',
      requiredParam: row.paramSchema?.requiredParam || {
        name: '',
        valueType: 'System.String',
        description: '',
        isNullable: false,
        defaultValue: null
      },
      conditionRequirements: row.paramSchema?.conditionRequirements || [],
      limitations: row.paramSchema?.limitations || {},
      // 额外字段
      formulaId: row.formulaId || '',
      standardFamilyIds: row.standardFamilyIds || [],
      ruleIds: row.ruleIds || [],
      effectiveDate: row.effectiveDate || new Date().toISOString()
    };
    dialogVisible.value = true;
  }

// Confirm Submit
  // 确认提交
  function confirmSubmit() {
    formRef.value?.validate((valid) => {
      if (!valid) return;

      submitLoading.value = true;

      // 构建请求数据（适配后端格式）
      const requestData = {
        paramStructureId: dialogForm.value.id,
        paramName: dialogForm.value.name,
        formulaId: dialogForm.value.formulaId,
        standardFamilyIds: dialogForm.value.standardFamilyIds,
        ruleIds: dialogForm.value.ruleIds,
        effectiveDate: dialogForm.value.effectiveDate || new Date().toISOString(),
        paramSchema: {
          requiredParam: dialogForm.value.requiredParam,
          conditionRequirements: dialogForm.value.conditionRequirements,
          limitations: dialogForm.value.limitations
        }
      };

      const isEdit = dialogTitle.value === 'Edit Param Structure';
      const url = isEdit ? '/ParamStructure/update' : '/ParamStructure/add';
      const method = isEdit ? request.put : request.post;

      method(url, requestData)
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
    });
  }

// Toggle Status
function toggleStatus(row) {
  const action = row.isActive ? 'deactivate' : 'activate';
  const confirmText = row.isActive 
    ? `Are you sure you want to deactivate param structure "${row.name}"?`
    : `Are you sure you want to activate param structure "${row.name}"?`;
  
  ElMessageBox.confirm(confirmText, 'Confirmation', {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(() => {
    const url = row.isActive 
      ? `/ParamStructure/deactive/${row.id}`
      : `/ParamStructure/active/${row.id}`;
    
    request.put(url)
      .then(res => {
        if (res.data.isSuccess) {
          row.isActive = !row.isActive;
          ElMessage.success(`${action}d successfully`);
        } else {
          ElMessage.error(res.data.error || `${action} failed`);
        }
      })
      .catch(() => {
        ElMessage.error(`${action} failed`);
      });
  }).catch(() => {});
}

// Delete Param Structure
function deleteParamStructure(row) {
  if (hasRelatedData(row)) {
    ElMessage.warning('This param structure has associated data and cannot be deleted');
    return;
  }
  
  ElMessageBox.confirm(`Are you sure you want to delete param structure "${row.name}"? This action cannot be undone!`, 'Warning', {
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    type: 'error'
  }).then(() => {
    request.delete(`/ParamStructure/delete/${row.id}`)
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
  }).catch(() => {});
}

// Check if has related data
function hasRelatedData(row) {
  return (row.formulas && row.formulas.length > 0) || 
         (row.rules && row.rules.length > 0);
}

// Click row to show related data
function handleRowClick(row) {
  selectedStructureId.value = row.id;
  loadRelatedData(row.id);
}

// Load related data
  // 加载关联数据（点击行时）
  function loadRelatedData(structureId) {
    // 从已加载的数据中查找
    const item = allData.value.find(d => d.id === structureId);
    if (!item) return;

    // 加载关联公式
    if (item.formulaId) {
      request.get(`/ParamFormula/get/${item.formulaId}`)
        .then(res => {
          if (res.data.isSuccess) {
            relatedFormulas.value = [res.data.value];
          } else {
            relatedFormulas.value = [];
          }
        })
        .catch(() => {
          relatedFormulas.value = [];
        });
    } else {
      relatedFormulas.value = [];
    }

    // 加载关联规则
    if (item.ruleIds && item.ruleIds.length > 0) {
      request.get('/ParamRules/get-by-ids', {
        params: { ids: item.ruleIds }
      })
        .then(res => {
          if (res.data.isSuccess) {
            relatedRules.value = res.data.value || [];
          } else {
            relatedRules.value = [];
          }
        })
        .catch(() => {
          relatedRules.value = [];
        });
    } else {
      relatedRules.value = [];
    }
  }

// Tab change handler
function handleTabChange(tab) {
  if (selectedStructureId.value) {
    loadRelatedData(selectedStructureId.value);
  }
}

// Condition Requirements Management
function addCondition() {
  dialogForm.value.conditionRequirements.push({
    fieldName: '',
    fieldType: 'System.String',
    isRequired: false,
    allowedValues: []
  });
}

function removeCondition(index) {
  dialogForm.value.conditionRequirements.splice(index, 1);
}

// Parameter Limitations Management
function addLimitation() {
  const key = `param_${Date.now()}`;
  dialogForm.value.limitations[key] = {
    key: key,
    valueType: 'System.String',
    allowedValues: [],
    min: null,
    max: null
  };
}

function removeLimitation(key) {
  delete dialogForm.value.limitations[key];
}

function updateLimitationKey(oldKey, newKey) {
  if (oldKey !== newKey && newKey) {
    const value = dialogForm.value.limitations[oldKey];
    delete dialogForm.value.limitations[oldKey];
    dialogForm.value.limitations[newKey] = value;
  }
}

// ==================== Utility Methods ====================
function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

// ==================== Lifecycle ====================
onMounted(() => {
  fetchAll();
});

// Watch search changes
watch([searchKeyword, searchStatus], () => {
  handleSearch();
});
</script>

<style scoped lang="scss">
.domContent {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
}

.topHalf {
  display: flex;
  gap: 15px;
  height: 100%;
}

.halfBox {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 12px;
  background: #fff;
}

.boxTitle {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.stats-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  padding: 4px 0;
}

.quick-view-tabs {
  flex: 1;
  min-height: 0;
}

.removeTableGaps :deep(table) {
  margin-bottom: 0 !important;
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.text-muted {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

// Custom Scrollbar
.halfBox :deep(.el-table__body-wrapper) {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c7cd;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f3f6f9;
  }
}

// Responsive Adjustments
@media (max-width: 1200px) {
  .topHalf {
    flex-direction: column;
  }
  
  .halfBox {
    max-height: 500px;
  }
}

// Dialog Styles
:deep(.el-divider) {
  margin: 20px 0;
}

:deep(.el-switch) {
  .el-switch__label {
    font-size: 12px;
  }
}
</style>
