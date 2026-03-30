<template>
  <div>
    <div class="domContent">
      <!-- 搜索区域 -->
      <div class="searchParametersContanier">
        <el-form inline style="display: flex">
          <el-form-item :label="$t('itemNameEn')">
            <el-input v-model="form.itemNameEn" placeholder="" clearable style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item :label="$t('itemNameChn')">
            <el-input v-model="form.itemNameChn" placeholder="" clearable style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item :label="$t('standard')">
            <el-select v-model="form.standard" placeholder="" filterable clearable style="width: 200px"></el-select>
          </el-form-item>
          <el-form-item style="flex: 1; margin-right: 0; text-align: right;">
            <el-button type="primary" @click="searchList">{{$t("search")}}</el-button>
            <el-button type="primary" @click="addOpen">{{$t("add")}}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table :data="itemTableData" border class="removeTableGaps" style="width: 100%">
        <el-table-column :label="$t('ItemName-En')" prop="itemNameEn" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('ItemName-Chn')" prop="itemNameChn" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('Cited Standards')" prop="standard" min-width="210" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('Limit Paradigm')" prop="limitParadigm" width="150" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('Remark')" prop="remark" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('Modify History')" prop="modifyHistory" width="160">
          <!-- 这里可以放置一个查看历史的按钮或简单的文本 -->
          <template #default="scope">
            <el-button link type="primary" size="small" @click="viewHistory(scope.row)">
              <el-icon><Clock /></el-icon> {{ $t('view') }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operation')" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" :icon="Edit" circle size="small" @click="editOpen(scope.row)"></el-button>
            <el-popconfirm class="box-item"
                           :title="$t('confirmDelete')"
                           @confirm="deleteRow(scope.row)">
              <template #reference>
                <el-button type="danger" :icon="Delete" circle size="small" style="margin-left: 5px"></el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="$t(dialogTitle)" v-model="dialogVisible" width="60%">
      <div class="formContainer">
        <el-form :model="dialogForm" label-width="140px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('ItemName-En')">
                <el-input v-model="dialogForm.itemNameEn" placeholder=""></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('ItemName-Chn')">
                <el-input v-model="dialogForm.itemNameChn" placeholder=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('Cited Standards')">
                <el-select v-model="dialogForm.standard" placeholder="" filterable allow-create default-first-option style="width: 100%"></el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('Limit Paradigm')">
                <el-input v-model="dialogForm.limitParadigm" placeholder=""></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item :label="$t('Remark')">
            <el-input v-model="dialogForm.remark" type="textarea" :rows="3" placeholder=""></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button type="primary" @click="addConfirm">{{$t("confirm")}}</el-button>
        <el-button @click="addCancel">{{$t("cancel")}}</el-button>
      </template>
    </el-dialog>

    <!-- 修改历史对话框 -->
    <el-dialog :title="$t('modifyHistory')" v-model="historyDialogVisible" width="50%">
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in historyData"
                          :key="index"
                          :timestamp="activity.timestamp"
                          placement="top">
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
      <template #footer>
        <el-button @click="historyDialogVisible = false">{{$t("close")}}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { reactive, ref } from "vue";
  import { Delete, Edit, Clock } from "@element-plus/icons-vue";

  // 对话框表单
  const dialogForm = ref({
    itemNameEn: '',
    itemNameChn: '',
    standard: '',
    limitParadigm: '',
    remark: ''
  });

  // 查询表单
  const form = reactive({
    itemNameEn: '',
    itemNameChn: '',
    standard: ''
  });

  // 表格数据
  const itemTableData = ref([
    {
      id: 1,
      itemNameEn: 'Formaldehyde Content',
      itemNameChn: '甲醛含量',
      standard: 'GB 18401-2010',
      limitParadigm: '≤ 75 mg/kg',
      remark: 'B类',
      modifyHistory: [] // 模拟历史数据字段
    },
    {
      id: 2,
      itemNameEn: 'pH Value',
      itemNameChn: 'pH值',
      standard: 'GB 18401-2010',
      limitParadigm: '4.0 - 8.5',
      remark: 'B类',
      modifyHistory: []
    }
  ]);

  // 对话框展示
  const dialogVisible = ref(false);
  // 历史记录对话框展示
  const historyDialogVisible = ref(false);
  // 历史记录数据
  const historyData = ref([
    {
      timestamp: '2023-05-20 10:30',
      content: 'Created by Admin'
    },
    {
      timestamp: '2023-06-15 14:20',
      content: 'Updated limit paradigm from ≤ 100 to ≤ 75'
    }
  ]);

  // 对话框标题
  const dialogTitle = ref('');

  // 方法
  function addOpen() {
    dialogVisible.value = true;
    dialogTitle.value = 'add';
    // 重置表单
    dialogForm.value = {
      itemNameEn: '',
      itemNameChn: '',
      standard: '',
      limitParadigm: '',
      remark: ''
    };
  }

  function editOpen(row) {
    dialogVisible.value = true;
    dialogTitle.value = 'edit';
    // 深拷贝数据
    dialogForm.value = JSON.parse(JSON.stringify(row));
  }

  function addConfirm() {
    if (dialogTitle.value === 'add') {
      // 模拟添加
      const newId = Math.max(...itemTableData.value.map(item => item.id || 0)) + 1;
      itemTableData.value.unshift({
        ...dialogForm.value,
        id: newId,
        modifyHistory: [] // 初始化历史记录
      });
    } else {
      // 模拟编辑
      const index = itemTableData.value.findIndex(item => item.id === dialogForm.value.id);
      if (index !== -1) {
        // 在实际应用中，这里应该记录修改历史
        // itemTableData.value[index].modifyHistory.push({...});
        itemTableData.value[index] = { ...dialogForm.value };
      }
    }
    dialogVisible.value = false;
  }

  function addCancel() {
    dialogVisible.value = false;
  }

  function searchList() {
    console.log("Searching with:", form);
    // 这里添加实际的搜索逻辑
  }

  function deleteRow(row) {
    const index = itemTableData.value.indexOf(row);
    if (index !== -1) {
      itemTableData.value.splice(index, 1);
    }
  }

  function viewHistory(row) {
    // 在实际应用中，这里应该根据 row.id 获取该行的历史记录
    // 这里只是模拟展示
    historyDialogVisible.value = true;
    console.log("Viewing history for:", row);
  }
</script>

<style scoped>
  /*去除表格标题和内容之间的空隙*/
  .removeTableGaps :deep(table) {
    margin-bottom: 0 !important;
  }

  .domContent {
    //width:90%;
    margin: 0 auto;
  }

  .formContainer {
    //width: 80%;
    //margin: 0 auto;
  }

  .searchParametersContanier {
  }
</style>
