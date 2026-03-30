<template>
  <div class="containerS">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form :inline="true" :model="form" class="search-form">
        <el-form-item :label="$t('standardFamily')">
          <el-input v-model="form.standardFamilyCode" :placeholder="$t('pleaseInput')" style="width: 150px" clearable></el-input>
        </el-form-item>
        <el-form-item :label="$t('standardId')">
          <el-input v-model="form.standardId" :placeholder="$t('pleaseInput')" style="width: 150px" clearable></el-input>
        </el-form-item>
        <el-form-item :label="$t('standardCode')">
          <el-input v-model="form.standardCode" :placeholder="$t('pleaseInput')" style="属于某一列，并且重新设计表格摒弃之前的按standardfamily分')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('standardNameEn')">
          <el-input v-model="form.standardNameEn" :placeholder="$t('pleaseInput')" style="width: 150px" clearable></el-input>
        </el-form-item>
        <el-form-item :label="$t('standardNameChn')">
          <el-input v-model="form.standardNameChn" :placeholder="$t('pleaseInput')" style="width: 150px" clearable></el-input>
        </el-form-item>
        <el-form-item :label="$t('testGroup')">
          <el-select v-model="form.testGroup" :placeholder="$t('pleaseSelect')" style="width: 120px" clearable>
            <el-option v-for="item in testGroupOptions" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchList">
            <el-icon><Search /></el-icon> {{ $t('search') }}
          </el-button>
          <el-button type="success" @click="addOpenStandard">
            <el-icon><Plus /></el-icon> {{ $t('addStandard') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table :data="tableData" border style="width: 100%" stripe>
        <!-- Standard Family 列：包含表头添加按钮 -->
        <el-table-column :label="$t('standardFamily')" prop="standardFamilyCode" width="180">
          <template #header>
            <div class="table-header-with-action">
              <span>{{ $t('standardFamily') }}</span>
              <el-tooltip content="Add Standard Family" placement="top">
                <el-button circle size="small" type="primary" @click="addOpenStandardFamily" style="margin-left: 5px;">
                  <el-icon><Plus /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('standardCode')" prop="standardCode" width="150"></el-table-column>
        <el-table-column :label="$t('standardNameEn')" prop="standardNameEn" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('standardNameChn')" prop="standardNameChn" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('testGroup')" prop="testGroup" width="120"></el-table-column>
        <el-table-column :label="$t('operation')" width="170" fixed="right">
          <template #default="scope">
            <el-button link type="primary" :icon="Edit" @click="editOpenStandard(scope.row)">{{ $t('edit') }}</el-button>
            <el-popconfirm title="Are you sure to delete?" @confirm="deleteStandard(scope.row)">
              <template #reference>
                <el-button link type="danger" :icon="Delete">{{ $t('delete') }}</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>


    <!-- 添加/编辑 标准 的对话框 -->
    <el-dialog :title="$t(dialogTitle)" v-model="dialogVisible" width="50%">
      <el-form :model="dialogForm" label-width="140px">
        <el-form-item :label="$t('standardFamily')">
          <el-select v-model="dialogForm.standardFamilyCode" style="width: 100%" :placeholder="$t('pleaseSelect')">
            <!-- 这里需要动态获取标准族列表 -->
            <el-option v-for="item in standardFamilyOptions" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('standardId')">
          <el-input v-model="dialogForm.standardId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('standardCode')">
          <el-input v-model="dialogForm.standardCode" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('standardNameEn')">
          <el-input v-model="dialogForm.standardNameEn" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('standardNameCHN')">
          <el-input v-model="dialogForm.standardNameChn" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('testGroup')">
          <el-select v-model="dialogForm.testGroup" style="width: 100%" :placeholder="$t('pleaseSelect')">
            <el-option v-for="item in testGroupOptions" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('cancel') }}</el-button>
          <el-button type="primary" @click="confirmStandard">{{ $t('confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加/编辑 标准族 的对话框 -->
    <el-dialog :title="$t(dialogTitleStandardFamily)" v-model="dialogVisibleStandardFamily" width="40%">
      <el-form :model="dialogFormStandardFamily" label-width="150px">
        <el-form-item :label="$t('standardFamilyCode')">
          <el-input v-model="dialogFormStandardFamily.standardFamilyCode" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisibleStandardFamily = false">{{ $t('cancel') }}</el-button>
          <el-button type="primary" @click="confirmStandardFamily">{{ $t('confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { inject, reactive, ref } from "vue"; 
import { Delete, Edit, Plus, Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 模拟 API 请求注入
const newRequest = inject("newRequest");

// 状态数据
const testGroupOptions = ref(["Physics", "Wet", "Fiber", "Flam"]);
const standardFamilyOptions = ref(["Family A", "Family B", "Family C"]); // 模拟数据，实际应从接口获取

// 搜索表单
const form = reactive({
  standardFamilyCode: '',
  standardId: '',
  standardCode: '',
  standardNameEn: '',
  standardNameChn: '',
  testGroup: ''
});

// 表格数据 - 扁平化结构
const tableData = ref([
  {
    id: 1,
    standardId: '1',
    standardCode: 'ISO-4014',
    standardNameEn: 'Hexagon head bolts',
    standardNameChn: '六角头螺栓',
    testGroup: 'Physics',
    standardFamilyCode: 'Family A'
  },
  {
    id: 2,
    standardId: '2',
    standardCode: 'ISO-4017',
    standardNameEn: 'Hexagon head screws',
    standardNameChn: '六角头螺钉',
    testGroup: 'Physics',
    standardFamilyCode: 'Family A'
  },
  {
    id: 3,
    standardId: '3',
    standardCode: 'DIN-931',
    standardNameEn: 'Hexagon head bolts - Part thread',
    standardNameChn: '六角头螺栓-部分螺纹',
    testGroup: 'Physics',
    standardFamilyCode: 'Family B'
  }
]);

// 对话框状态
const dialogVisible = ref(false);
const dialogVisibleStandardFamily = ref(false);
const dialogTitle = ref('');
const dialogTitleStandardFamily = ref('');

// 对话框表单数据
const dialogForm = ref({
  standardId: '',
  standardCode: '',
  standardNameEn: '',
  standardNameChn: '',
  testGroup: '',
  standardFamilyCode: ''
});

const dialogFormStandardFamily = ref({
  standardFamilyCode: ''
});

// 方法
function searchList() {
  // 这里实现搜索逻辑，通常需要调用 API
  console.log("Searching with:", form);
  // 模拟筛选
  tableData.value = tableData.value.filter(item => {
    return (!form.standardFamilyCode || item.standardFamilyCode.includes(form.standardFamilyCode)) &&
           (!form.standardId || item.standardId.includes(form.standardId)) &&
           (!form.standardCode || item.standardCode.includes(form.standardCode)) &&
           (!form.standardNameEn || item.standardNameEn.includes(form.standardNameEn)) &&
           (!form.standardNameChn || item.standardNameChn.includes(form.standardNameChn)) &&
           (!form.testGroup || item.testGroup === form.testGroup);
  });
}

function addOpenStandard() {
  dialogVisible.value = true;
  dialogTitle.value = 'addStandard';
  // 重置表单
  dialogForm.value = {
    standardId: '',
    standardCode: '',
    standardNameEn: '',
    standardNameChn: '',
    testGroup: '',
    standardFamilyCode: ''
  };
}

function editOpenStandard(row) {
  dialogVisible.value = true;
  dialogTitle.value = 'editStandard';
  // 填充表单
  dialogForm.value = { ...row };
}

function confirmStandard() {
  if (dialogTitle.value === 'addStandard') {
    // 模拟添加
    const newId = Math.max(...tableData.value.map(item => item.id)) + 1;
    tableData.value.unshift({
      ...dialogForm.value,
      id: newId
    });
    ElMessage.success("添加成功");
  } else {
    // 模拟编辑
    const index = tableData.value.findIndex(item => item.id === dialogForm.value.id);
    if (index !== -1) {
      tableData.value[index] = { ...dialogForm.value };
      ElMessage.success("更新成功");
    }
  }
  dialogVisible.value = false;
}

function deleteStandard(row) {
  // 模拟删除
  const index = tableData.value.findIndex(item => item.id === row.id);
  if (index !== -1) {
    tableData.value.splice(index, 1);
    ElMessage.success("删除成功");
  }
}

function addOpenStandardFamily() {
  dialogVisibleStandardFamily.value = true;
  dialogTitleStandardFamily.value = 'addStandardFamily';
  dialogFormStandardFamily.value = {
    standardFamilyCode: ''
  };
}

function confirmStandardFamily() {
  // 模拟添加标准族
  if (dialogFormStandardFamily.value.standardFamilyCode) {
    standardFamilyOptions.value.push(dialogFormStandardFamily.value.standardFamilyCode);
    ElMessage.success("标准族添加成功");
    dialogVisibleStandardFamily.value = false;
  } else {
    ElMessage.warning("请输入标准族代码");
  }
}
</script>

<style scoped lang="scss">
.containerS {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.search-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.table-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-header-with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

