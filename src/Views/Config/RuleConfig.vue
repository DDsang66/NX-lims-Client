<template>
  <div>
    <div class="domContent">
      <!-- ==================== 上半：Formula / ParamStructure 各占一半 ==================== -->
      <div class="topHalf">
        <!-- 左：Formula 框 -->
        <div class="halfBox">
          <div class="boxTitle">Formula</div>
          <div class="formula-toolbar">
            <el-input v-model="formulaSearch" placeholder="Search formula" clearable style="flex: 1;"></el-input>
            <el-select v-model="selectedStandardFamilyId" 
                       placeholder="Filter by family" 
                       filterable 
                       clearable 
                       style="width: 200px; margin-left: 10px;"
                       @change="handleFamilyFilterChange">
              <el-option v-for="item in standardFamilyOptions" 
                         :key="item.id" 
                         :label="item.standardFamilyCode || item.name" 
                         :value="item.id" />
            </el-select>
          </div>
          <el-table :data="filteredFormulas" border class="removeTableGaps" height="300" style="width: 100%" table-layout="fixed" :row-class-name="formulaRowClassName" >
            <el-table-column prop="id" label="ID" width="160" fixed="left" show-overflow-tooltip></el-table-column>
            <el-table-column prop="name" label="Name" min-width="140" show-overflow-tooltip></el-table-column>
            <el-table-column prop="paramName" label="Param Name" width="120" show-overflow-tooltip></el-table-column>
            <el-table-column prop="expressionTemplate" label="Expression" min-width="200" show-overflow-tooltip></el-table-column>
            <el-table-column prop="conditionFields" label="Condition Fields" width="150">
              <template #default="{ row }">
                <el-tag v-for="field in (row.conditionFields || [])" :key="field" size="small" style="margin-right: 3px; margin-bottom: 2px;">
                  {{ field }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="Description" min-width="150" show-overflow-tooltip></el-table-column>
            <el-table-column label="Status" width="80">
              <template #default="{ row }">
                <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
                  {{ row.isActive ? 'Active' : 'Inactive' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="" width="90" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="selectFormula(scope.row)">Select</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 右：ParamStructure 框 -->
        <div class="halfBox">
          <div class="boxTitle">Param Structure</div>
          <el-input v-model="paramStructureSearch" placeholder="Search param structure" clearable></el-input>
          <el-table :data="filteredParamStructures" border class="removeTableGaps" height="300" style="width: 100%">
            <el-table-column prop="paramStructureId" label="ID" width="120" show-overflow-tooltip></el-table-column>
            <el-table-column prop="paramName" label="Name" min-width="140" show-overflow-tooltip></el-table-column>
            <el-table-column prop="formulaId" label="Formula ID" min-width="140" show-overflow-tooltip></el-table-column>
            <el-table-column label="" width="55" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" circle @click="addParamStructureToRule(scope.row)">+</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- ==================== 下半：Rule 大框 ==================== -->
      <div class="bottomBox">
        <!-- 工具栏：搜索 + Add Rule -->
        <div class="ruleToolbar">
          <el-input v-model="searchRuleId" placeholder="Rule ID" clearable style="width: 180px"></el-input>
          <el-input v-model="searchFormulaId" placeholder="Formula ID" clearable style="width: 180px"></el-input>
          <el-input v-model="searchParamName" placeholder="Param Name" clearable style="width: 180px"></el-input>
          <el-button type="primary" @click="addOpen" style="margin-left: auto;">Add Rule</el-button>
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
    </div>

    <!-- ==================== Add/Edit Rule 对话框 ==================== -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="70%">
      <el-form :model="dialogForm" label-width="150px">
        <el-form-item label="Rule ID">
          <el-input v-model="dialogForm.id" placeholder="" :disabled="dialogTitle === 'Edit Rule'"></el-input>
        </el-form-item>
        <el-form-item label="Formula ID">
          <el-select v-model="dialogForm.formulaId"
                     filterable
                     placeholder="Select formula"
                     style="width: 100%"
                     @change="onFormulaSelect">
            <el-option v-for="f in allFormulas"
                       :key="f.id"
                       :label="f.id + (f.paramName ? ' - ' + f.paramName : '')"
                       :value="f.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Param Structure ID">
          <el-input v-model="dialogForm.paramStructureId" placeholder=""></el-input>
        </el-form-item>
        <el-form-item label="Param Name">
          <el-input v-model="dialogForm.paramName" placeholder=""></el-input>
        </el-form-item>
        <el-form-item label="Param Result">
          <!-- text 模式：结果值由 Rule Text 推导符右侧解析，只读展示（不可手动填） -->
          <el-input v-if="inputMode === 'text'"
                    :model-value="paramResultFromText"
                    placeholder="Auto-parsed from the right side of the arrow in Rule Text"
                    disabled></el-input>
          <!-- json 模式：手动填写结果值 -->
          <el-input v-else
                    v-model="dialogForm.paramResult"
                    placeholder="Result value"></el-input>
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
                    :placeholder="formulaTemplatePlaceholder"></el-input>
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

// ==================== 上半：Formula 数据 ====================
const formulas = ref([]);
const allFormulas = ref([]); // 存储所有 Formula，用于过滤
const standardFamilyOptions = ref([]);
const selectedStandardFamilyId = ref('');
const formulaSearch = ref('');
const selectedFormulaId = ref(''); // 点击 Formula 表格 Select 按钮后选中的公式 id

// ==================== 上半：ParamStructure 数据 ====================
const paramStructures = ref([]);
const paramStructureSearch = ref('');

// 过滤后的 Formula
const filteredFormulas = computed(() => {
  let result = allFormulas.value;
  
  // 按 Standard Family 过滤
  if (selectedStandardFamilyId.value) {
    const selectedFamily = standardFamilyOptions.value.find(f => f.id === selectedStandardFamilyId.value);
    if (selectedFamily && selectedFamily.formulaIds) {
      result = result.filter(f => selectedFamily.formulaIds.includes(f.id));
    }
  }
  
  // 按搜索关键词过滤
  const kw = formulaSearch.value.trim().toLowerCase();
  if (kw) {
    result = result.filter(f =>
      (f.id || '').toLowerCase().includes(kw) ||
      (f.name || '').toLowerCase().includes(kw) ||
      (f.paramName || '').toLowerCase().includes(kw) ||
      (f.description || '').toLowerCase().includes(kw)
    );
  }
  
  return result;
});

// 过滤后的 ParamStructure（选中 Formula 时只显示它对应的 structure）
const filteredParamStructures = computed(() => {
  let result = paramStructures.value;
  if (selectedFormulaId.value) {
    result = result.filter(p => (p.formulaId || '') === selectedFormulaId.value);
  }
  const kw = paramStructureSearch.value.trim().toLowerCase();
  if (kw) {
    result = result.filter(p =>
      (p.paramStructureId || '').toLowerCase().includes(kw) ||
      (p.paramName || '').toLowerCase().includes(kw) ||
      (p.formulaId || '').toLowerCase().includes(kw));
  }
  return result;
});

// 选择 Formula（再次点击同一行取消选中）
function selectFormula(row) {
  if (selectedFormulaId.value === row.id) {
    selectedFormulaId.value = '';
    searchFormulaId.value = '';
    ElMessage.info(`已取消选择 Formula: ${row.id}`);
  } else {
    selectedFormulaId.value = row.id;
    searchFormulaId.value = row.id;
    ElMessage.success(`已选择 Formula: ${row.id}`);
  }
}

// 选中公式的行高亮
function formulaRowClassName({ row }) {
  return row.id === selectedFormulaId.value ? 'selected-item-row' : '';
}

// 从 Rule Text 推导符右侧提取结果值（后端就是这么解析的，前端只读预览用）
const paramResultFromText = computed(() => {
  const text = dialogForm.value.ruleText;
  if (!text) return '';
  // 贪婪 .* 定位到最后一个推导符，右侧到行尾即结果值
  const m = text.match(/.*(?:→|->|=>|~|\bto\b)\s*([^+]+)\s*$/i);
  return m ? m[1].trim() : '';
});

// Rule Text 文本框的动态 placeholder（显示所选公式的模板）
const formulaTemplatePlaceholder = computed(() => {
  const f = allFormulas.value.find(x => x.id === dialogForm.value.formulaId);
  return f?.expressionTemplate
    ? `Template: ${f.expressionTemplate}\nReplace the placeholder values with actual values.`
    : 'Enter natural language rules...';
});

// 在 Add Rule 弹窗里选中 Formula → 按模板自动生成 Rule Text 示例（仅 text 模式）
function onFormulaSelect(formulaId) {
  if (inputMode.value !== 'text') return;
  const formula = allFormulas.value.find(f => f.id === formulaId);
  if (formula) dialogForm.value.ruleText = generateRuleTextFromTemplate(formula.expressionTemplate);
}

// 根据公式 ExpressionTemplate 生成结构合法的规则文本（占位值用字段名 / >=50 / [字段名]）
function generateRuleTextFromTemplate(template) {
  if (!template) return '';
  const m = template.match(/(.*?)\s*(?:→|->|=>|~|\bto\b)\s*(.*)/i);
  const left = m ? m[1].trim() : template.trim();
  const right = m ? m[2].trim() : 'ResultValue';
  const slots = splitTopLevel(left);
  const parts = slots.map(slot => {
    const sm = slot.match(/^\s*(\w+)\s*\{([^}]*)\}\s*$/);
    if (sm) {
      const type = sm[1].toLowerCase();
      const fields = sm[2].split(',').map(f => f.trim()).filter(Boolean);
      const vals = fields.map(f => {
        if (type === 'comparer') return f + '>=50';  // Comparer 槽
        if (type === 'inner') return '[' + f + ']';  // Inner 槽（数组）
        return f;                                    // Equal / 其他槽
      });
      return sm[1] + '{' + vals.join(', ') + '}';
    }
    return slot.trim(); // 旧式裸字段：保留字段名
  });
  return parts.join(' + ') + ' → ' + right;
}

// 顶层 '+' 分割（忽略大括号内部的 +）
function splitTopLevel(s) {
  const out = [];
  let cur = '';
  let depth = 0;
  for (const ch of s) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (ch === '+' && depth === 0) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

// Standard Family 过滤变化
function handleFamilyFilterChange(val) {
  // 只是触发 computed 重新计算
  currentPage.value = 1; // 重置分页
}

// 从 ParamStructure 添加
function addParamStructureToRule(row) {
  if (dialogVisible.value) {
    dialogForm.value.paramStructureId = row.paramStructureId;
  } else {
    addOpen();
    dialogForm.value.paramStructureId = row.paramStructureId;
  }
}

// ==================== 下半：Rule 数据 ====================
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
    // Text 模式：新增 → add-naturaltext；编辑 → update-naturaltext
    if (!dialogForm.value.ruleText.trim()) {
      ElMessage.warning('Please enter Rule Text');
      submitLoading.value = false;
      return;
    }
    const isEdit = dialogTitle.value === 'Edit Rule';
    const url = isEdit ? '/ParamRules/update-naturaltext' : '/ParamRules/add-naturaltext';
    const method = isEdit ? request.put : request.post;
    // 新增走 NaturalLanguageRuleRequest（含 formulaId/paramStructureId/paramName）；
    // 编辑走 UpdateParamRuleTextRequest——后端用 existingRule.FormulaId 重新解析文本，只需 id/text/priority/stopOnMatch
    const body = isEdit
      ? {
          id: dialogForm.value.id,
          text: dialogForm.value.ruleText,
          priority: dialogForm.value.priority,
          stopOnMatch: dialogForm.value.stopOnMatch
        }
      : {
          id: dialogForm.value.id,
          text: dialogForm.value.ruleText,
          formulaId: dialogForm.value.formulaId,
          paramStructureId: dialogForm.value.paramStructureId,
          paramName: dialogForm.value.paramName,
          priority: dialogForm.value.priority,
          stopOnMatch: dialogForm.value.stopOnMatch
        };
    method(url, body).then(res => {
      if (res.data.isSuccess) {
        ElMessage.success(isEdit ? 'Rule updated' : 'Rule added');
        dialogVisible.value = false;
        fetchAll();
      } else {
        ElMessage.error(res.data.error || (isEdit ? 'Failed to update rule' : 'Failed to add rule'));
      }
    }).catch(() => ElMessage.error(isEdit ? 'Failed to update rule' : 'Failed to add rule'))
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
        // stopOnMatch 用正确字段名传给后端（激活状态不随编辑更新，走独立 active/deactive 按钮）
        stopOnMatch: dialogForm.value.stopOnMatch,
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

// ==================== 加载数据 ====================

// 加载 Standard Family 列表
function fetchStandardFamilies() {
  request.get('/StandardFamily/getall').then(res => {
    if (res.data.isSuccess) {
      standardFamilyOptions.value = res.data.value || [];
    } else {
      ElMessage.error(res.data.error || 'Failed to load standard families');
      standardFamilyOptions.value = [];
    }
  }).catch(() => {
    ElMessage.error('Failed to load standard families');
    standardFamilyOptions.value = [];
  });
}

// 加载所有 Formula
function fetchAllFormulas() {
  request.get('/ParamFormula/getall').then(res => {
    if (res.data.isSuccess) {
      allFormulas.value = res.data.value || [];
    } else {
      ElMessage.error(res.data.error || 'Failed to load formulas');
      allFormulas.value = [];
    }
  }).catch(() => {
    ElMessage.error('Failed to load formulas');
    allFormulas.value = [];
  });
}

// 根据 Standard Family ID 加载 Formula（用于后续扩展）
async function fetchFormulasByFamily(familyId) {
  if (!familyId) {
    // 如果没有选择 family，加载所有
    fetchAllFormulas();
    return;
  }
  
  const selectedFamily = standardFamilyOptions.value.find(f => f.id === familyId);
  if (!selectedFamily || !selectedFamily.formulaIds || selectedFamily.formulaIds.length === 0) {
    allFormulas.value = [];
    return;
  }
  
  try {
    const res = await request.get('/ParamFormula/get-by-ids', {
      params: {
        ids: selectedFamily.formulaIds
      }
    });
    
    if (res.data.isSuccess) {
      allFormulas.value = res.data.value || [];
    } else {
      ElMessage.error(res.data.error || 'Failed to fetch formulas');
      allFormulas.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch formulas by family:', error);
    ElMessage.error('Failed to fetch formulas');
    allFormulas.value = [];
  }
}

function fetchParamStructures() {
  request.get('/ParamStructure/getall').then(res => {
    if (res.data.isSuccess) {
      paramStructures.value = res.data.value || [];
    } else {
      ElMessage.error(res.data.error || 'Failed to load param structures');
      paramStructures.value = [];
    }
  }).catch(() => {
    ElMessage.error('Failed to load param structures');
    paramStructures.value = [];
  });
}

// 监听 Standard Family 选择变化，重新加载 Formula
watch(selectedStandardFamilyId, (newVal) => {
  if (newVal) {
    fetchFormulasByFamily(newVal);
  } else {
    fetchAllFormulas();
  }
  currentPage.value = 1;
});

onMounted(() => {
  fetchAll();
  fetchAllFormulas();
  fetchStandardFamilies();
  fetchParamStructures();
});
</script>

<style scoped lang="scss">
.domContent {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

// ==================== 上半区样式 ====================
.topHalf {
  display: flex;
  gap: 15px;
}

  .halfBox {
    flex: 1;
    min-width: 0; // 关键：防止内容撑开 flex 容器
    border: 1px solid var(--el-border-color);
    border-radius: 10px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden; // 确保内容不会溢出
    gap: 10px;
  }

  // 给表格添加固定布局
  .halfBox :deep(.el-table) {
    table-layout: fixed;
  }

.boxTitle {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.formula-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

// ==================== 下半区样式 ====================
.bottomBox {
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ruleToolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.removeTableGaps :deep(table) {
  margin-bottom: 0 !important;
}

/* Formula 表格选中行高亮（浅蓝） */
:deep(.selected-item-row) {
  background: #ecf5ff !important;
}

:deep(.selected-item-row td) {
  background: #ecf5ff !important;
}

.modeToggle {
  display: flex;
  gap: 8px;
}
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
