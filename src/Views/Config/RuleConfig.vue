<template>
  <div>
    <div class="domContent">
      <div class="searchParametersContanier">
        <el-form inline style="display: flex">
          <el-form-item label="Rule ID">
            <el-input v-model="searchRuleId" placeholder="" clearable style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="Formula ID">
            <el-input v-model="searchFormulaId" placeholder="" clearable style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="Param Name">
            <el-input v-model="searchParamName" placeholder="" clearable style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item style="flex: 1; margin-right: 0; text-align: right;">
            <el-button type="primary" @click="addOpen">Add Rule</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="pagedData" border class="removeTableGaps" style="width: 100%" v-loading="loading">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div style="margin-left: 30px; padding: 10px 0;">
              <div style="margin-bottom: 8px;">
                <b>Param Structure ID:</b> {{ row.paramStructureId || '-' }}
              </div>
              <el-table :data="matchRows(row)" border size="small" style="width: 100%">
                <el-table-column prop="type" label="Type" width="120"></el-table-column>
                <el-table-column prop="field" label="Field" width="200"></el-table-column>
                <el-table-column prop="value" label="Value" min-width="200" show-overflow-tooltip></el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="Rule ID" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="formulaId" label="Formula ID" width="180" show-overflow-tooltip></el-table-column>
        <el-table-column prop="paramName" label="Param Name" width="150"></el-table-column>
        <el-table-column prop="priority" label="Priority" width="100"></el-table-column>
        <el-table-column label="Status" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
              {{ row.isActive ? 'Active' : 'Inactive' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resultValue" label="Result Value" width="120"></el-table-column>
        <el-table-column prop="resultNotes" label="Result Notes" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column label="Operation" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" :icon="Edit" circle size="small" @click="editOpen(row)"></el-button>
            <el-tooltip :content="row.isActive ? 'Deactivate' : 'Activate'" placement="top">
              <el-button :type="row.isActive ? 'danger' : 'success'" circle size="small"
                         style="margin-left: 4px"
                         @click="row.isActive ? deactiveRule(row) : activeRule(row)">
                <el-icon size="14">
                  <CircleCheck v-if="!row.isActive" />
                  <VideoPause v-else />
                </el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div style="display: flex; justify-content: center; margin-top: 16px;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
    </div>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="70%">
      <el-form :model="dialogForm" label-width="150px">
        <el-form-item label="Rule ID">
          <el-input v-model="dialogForm.id" placeholder="" :disabled="dialogTitle === 'Edit Rule'"></el-input>
        </el-form-item>
        <el-form-item label="Formula ID">
          <el-input v-model="dialogForm.formulaId" placeholder=""></el-input>
        </el-form-item>
        <el-form-item label="Param Structure ID">
          <el-input v-model="dialogForm.paramStructureId" placeholder=""></el-input>
        </el-form-item>
        <el-form-item label="Param Name">
          <el-input v-model="dialogForm.paramName" placeholder=""></el-input>
        </el-form-item>
        <el-form-item label="Param Result">
          <el-input v-model="dialogForm.paramResult" placeholder=""></el-input>
        </el-form-item>
        <el-form-item label="Priority">
          <el-input-number v-model="dialogForm.priority" :min="1" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="Stop On Match">
          <el-switch v-model="dialogForm.stopOnMatch"></el-switch>
        </el-form-item>
        <el-form-item label="Rule Type">
          <div class="modeToggle">
            <div class="modeBlock" :class="{ active: inputMode === 'text' }" @click="inputMode = 'text'">Text</div>
            <div class="modeBlock" :class="{ active: inputMode === 'json' }" @click="inputMode = 'json'">Json</div>
          </div>
        </el-form-item>
        <el-form-item v-if="inputMode === 'text'" label="Rule Text">
          <el-input v-model="dialogForm.ruleText" type="textarea" :rows="6"
                    placeholder="Enter natural language rules..."></el-input>
        </el-form-item>
        <el-form-item v-else label="Matches (JSON)">
          <el-input v-model="dialogForm.matchesJson" type="textarea" :rows="6"
                    placeholder='{"equalMatches":[],"comparisonMatches":[],"inMatches":[],"compositeMatches":[]}'></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="confirmAdd" :loading="submitLoading">Confirm</el-button>
        <el-button @click="dialogVisible = false">Cancel</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from "vue";
import { Edit, CircleCheck, VideoPause } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const request = inject("request");
const loading = ref(false);
const submitLoading = ref(false);
const allData = ref([]);
const searchFormulaId = ref('');
const searchRuleId = ref('');
const searchParamName = ref('');
const currentPage = ref(1);
const pageSize = ref(20);

const filteredData = computed(() => {
  return allData.value.filter(item => {
    return (!searchFormulaId.value || (item.formulaId || '').toLowerCase().includes(searchFormulaId.value.toLowerCase())) &&
           (!searchRuleId.value || (item.id || '').toLowerCase().includes(searchRuleId.value.toLowerCase())) &&
           (!searchParamName.value || (item.paramName || '').toLowerCase().includes(searchParamName.value.toLowerCase()));
  });
});

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const dialogVisible = ref(false);
const dialogTitle = ref('Add Rule');
const inputMode = ref('text');
const dialogForm = ref({
  id: '',
  formulaId: '',
  paramStructureId: '',
  paramName: '',
  paramResult: '',
  priority: 1,
  stopOnMatch: true,
  matchesJson: '',
  ruleText: ''
});

const jsonTemplate = JSON.stringify({ equalMatches: [], comparisonMatches: [], inMatches: [], compositeMatches: [] }, null, 2);
watch(inputMode, (mode) => {
  if (mode === 'json' && !dialogForm.value.matchesJson) {
    dialogForm.value.matchesJson = jsonTemplate;
  }
});

function addOpen() {
  dialogTitle.value = 'Add Rule';
  dialogForm.value = {
    id: '',
    formulaId: '',
    paramStructureId: '',
    paramName: '',
    paramResult: '',
    priority: 1,
    stopOnMatch: true,
    matchesJson: '',
    ruleText: ''
  };
  inputMode.value = 'text';
  dialogForm.value.matchesJson = '';
  dialogVisible.value = true;
}

function editOpen(row) {
  dialogTitle.value = 'Edit Rule';
  inputMode.value = 'json';
  dialogForm.value = {
    id: row.id,
    formulaId: row.formulaId || '',
    paramStructureId: row.paramStructureId || '',
    paramName: row.paramName || '',
    paramResult: row.resultValue != null ? String(row.resultValue) : '',
    priority: row.priority || 1,
    stopOnMatch: row.stopOnMatch !== false,
    matchesJson: JSON.stringify({
      equalMatches: row.equalMatches || [],
      comparisonMatches: row.comparisonMatches || [],
      inMatches: row.inMatches || [],
      compositeMatches: row.compositeMatches || []
    }, null, 2),
    ruleText: ''
  };
  dialogVisible.value = true;
}

function confirmAdd() {
  submitLoading.value = true;

  if (inputMode.value === 'text') {
    // Text 模式 → add-naturaltext
    request.post('/ParamRules/add-naturaltext', {
      text: dialogForm.value.ruleText,
      formulaId: dialogForm.value.formulaId,
      paramStructureId: dialogForm.value.paramStructureId,
      paramName: dialogForm.value.paramName,
      priority: dialogForm.value.priority
    }).then(res => {
      if (res.data.isSuccess) {
        ElMessage.success('Rule added');
        dialogVisible.value = false;
        fetchAll();
      } else {
        ElMessage.error(res.data.error || 'Failed to add rule');
      }
    }).catch(() => ElMessage.error('Failed to add rule'))
      .finally(() => submitLoading.value = false);
    return;
  }

  // Json 模式 → add-json
  let matches = { equalMatches: [], comparisonMatches: [], inMatches: [], compositeMatches: [] };
  if (dialogForm.value.matchesJson.trim()) {
    try {
      const parsed = JSON.parse(dialogForm.value.matchesJson);

      // 校验 JSON 结构
      const err = validateMatches(parsed);
      if (err) { ElMessage.error(err); submitLoading.value = false; return; }

      matches = {
        equalMatches: parsed.equalMatches || [],
        comparisonMatches: parsed.comparisonMatches || [],
        inMatches: parsed.inMatches || [],
        compositeMatches: parsed.compositeMatches || []
      };
    } catch {
      ElMessage.error('Invalid JSON in Matches field');
      submitLoading.value = false;
      return;
    }
  }

  const isEdit = dialogTitle.value === 'Edit Rule';
  const url = isEdit ? '/ParamRules/update-json' : '/ParamRules/add-json';
  const body = isEdit
    ? {
        id: dialogForm.value.id,
        formulaId: dialogForm.value.formulaId,
        paramName: dialogForm.value.paramName,
        priority: dialogForm.value.priority,
        isActive: dialogForm.value.stopOnMatch,
        resultValue: dialogForm.value.paramResult || undefined,
        resultNotes: undefined,
        ...matches
      }
    : {
        id: dialogForm.value.id,
        formulaId: dialogForm.value.formulaId,
        paramStructureId: dialogForm.value.paramStructureId,
        paramName: dialogForm.value.paramName,
        paramResult: dialogForm.value.paramResult,
        priority: dialogForm.value.priority,
        stopOnMatch: dialogForm.value.stopOnMatch,
        ...matches
      };
  const method = isEdit ? request.put : request.post;

  method(url, body).then(res => {
    if (res.data.isSuccess) {
      ElMessage.success(isEdit ? 'Rule updated' : 'Rule added');
      dialogVisible.value = false;
      fetchAll();
    } else {
      ElMessage.error(res.data.error || 'Failed');
    }
  }).catch(() => ElMessage.error('Failed'))
    .finally(() => submitLoading.value = false);
}

function deactiveRule(row) {
  request.put(`/ParamRules/deactive/${row.id}`).then(res => {
    if (res.data.isSuccess) {
      row.isActive = false;
      ElMessage.success('Deactivated');
    } else {
      ElMessage.error(res.data.error || 'Failed');
    }
  }).catch(() => ElMessage.error('Failed'));
}

function activeRule(row) {
  request.put(`/ParamRules/active/${row.id}`).then(res => {
    if (res.data.isSuccess) {
      row.isActive = true;
      ElMessage.success('Activated');
    } else {
      ElMessage.error(res.data.error || 'Failed');
    }
  }).catch(() => ElMessage.error('Failed'));
}

const VALID_OPERATORS = ['Equal', 'NotEqual', 'GreaterThan', 'GreaterThanOrEqual', 'LessThan', 'LessThanOrEqual'];
const VALID_LOGICS = ['And', 'Or', 'Not'];

function validateMatches(parsed) {
  if (!parsed || typeof parsed !== 'object') return 'Matches must be a JSON object';
  const allowedRoot = ['equalMatches', 'comparisonMatches', 'inMatches', 'compositeMatches'];
  for (const key of Object.keys(parsed)) {
    if (!allowedRoot.includes(key)) return `Invalid top-level key: "${key}". Allowed: ${allowedRoot.join(', ')}`;
  }
  for (const m of parsed.equalMatches || []) {
    for (const k of Object.keys(m)) { if (!['field', 'value'].includes(k)) return `Invalid key "${k}" in equalMatches. Allowed: field, value`; }
  }
  for (const m of parsed.comparisonMatches || []) {
    for (const k of Object.keys(m)) { if (!['fieldPath', 'operator', 'expectedValue'].includes(k)) return `Invalid key "${k}" in comparisonMatches`; }
    if (m.operator && !VALID_OPERATORS.includes(m.operator)) return `Invalid operator "${m.operator}" in comparisonMatches. Allowed: ${VALID_OPERATORS.join(', ')}`;
  }
  for (const m of parsed.inMatches || []) {
    for (const k of Object.keys(m)) { if (!['field', 'values'].includes(k)) return `Invalid key "${k}" in inMatches. Allowed: field, values`; }
  }
  for (const m of parsed.compositeMatches || []) {
    if (m.logic && !VALID_LOGICS.includes(m.logic)) return `Invalid logic "${m.logic}" in compositeMatches. Allowed: ${VALID_LOGICS.join(', ')}`;
    for (const k of Object.keys(m)) { if (!['logic', 'fieldNames', 'subConditions'].includes(k)) return `Invalid key "${k}" in compositeMatches. Allowed: logic, fieldNames, subConditions`; }
    for (const s of m.subConditions || []) {
      for (const k of Object.keys(s)) { if (!['fieldPath', 'operator', 'expectedValue'].includes(k)) return `Invalid key "${k}" in compositeMatches[].subConditions`; }
    }
  }
  return null; // 校验通过
}

function fetchAll() {
  loading.value = true;
  request.get('/ParamRules/getall').then(res => {
    if (res.data.isSuccess) allData.value = res.data.value || [];
  }).catch(err => {
    console.error(err);
    ElMessage.error('Failed to load rules');
  }).finally(() => loading.value = false);
}

function matchRows(row) {
  const rows = [];
  for (const m of row.equalMatches || []) {
    rows.push({ type: 'Equal', field: m.field, value: m.value });
  }
  for (const m of row.comparisonMatches || []) {
    rows.push({ type: 'Comparison', field: m.fieldPath, value: `${m.operator} ${m.expectedValue}` });
  }
  for (const m of row.inMatches || []) {
    rows.push({ type: 'In', field: m.field, value: (m.values || []).join(', ') });
  }
  for (const m of row.compositeMatches || []) {
    const sub = (m.subConditions || []).map(s => `${s.fieldPath} ${s.operator} ${s.expectedValue}`).join('; ');
    rows.push({ type: 'Composite', field: (m.fieldNames || []).join(', '), value: `${m.logic}: ${sub}` });
  }
  return rows;
}

onMounted(() => fetchAll());
</script>

<style scoped>
.domContent { margin: 0 auto; }
.removeTableGaps :deep(table) { margin-bottom: 0 !important; }

.modeToggle { display: flex; gap: 8px; }
.modeBlock {
  padding: 4px 16px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
}
.modeBlock.active {
  background: #409EFF;
  color: #fff;
  border-color: #409EFF;
}
</style>
