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
        <el-table-column label="Condition Pattern" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ conditionPattern(row) }}</template>
        </el-table-column>
        <el-table-column prop="resultValue" label="Result Value" width="120"></el-table-column>
        <el-table-column prop="resultNotes" label="Result Notes" min-width="200" show-overflow-tooltip></el-table-column>
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

    <el-dialog title="Add Rule" v-model="dialogVisible" width="550px">
      <el-form :model="dialogForm" label-width="150px">
        <el-form-item label="Rule ID">
          <el-input v-model="dialogForm.id" placeholder=""></el-input>
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
import { computed, inject, onMounted, ref } from "vue";
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

function addOpen() {
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

  request.post('/ParamRules/add-json', {
    id: dialogForm.value.id,
    formulaId: dialogForm.value.formulaId,
    paramStructureId: dialogForm.value.paramStructureId,
    paramName: dialogForm.value.paramName,
    paramResult: dialogForm.value.paramResult,
    priority: dialogForm.value.priority,
    stopOnMatch: dialogForm.value.stopOnMatch,
    ...matches
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

function conditionPattern(row) {
  const parts = [];
  for (const m of row.equalMatches || []) {
    parts.push(`${m.field}=${m.value}`);
  }
  for (const m of row.comparisonMatches || []) {
    parts.push(`${m.fieldPath} ${m.operator} ${m.expectedValue}`);
  }
  for (const m of row.inMatches || []) {
    const vals = (m.values || []).join(',');
    parts.push(`${m.field} IN [${vals}]`);
  }
  for (const m of row.compositeMatches || []) {
    parts.push(`(${m.logic}: ${(m.fieldNames || []).join(',')})`);
  }
  return parts.join(' ; ') || '-';
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
