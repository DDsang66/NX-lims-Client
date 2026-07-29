<template>
  <div>
    <div class="domContent">
      <div class="searchParametersContanier">
        <el-form inline style="display: flex">
          <el-form-item :label="$t('standardFamily')">
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
        <el-table-column :label="$t('standardFamily')" prop="id" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('standardFamilyCode')" prop="standardFamilyCode" min-width="200" show-overflow-tooltip></el-table-column>
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

    <el-dialog :title="$t(dialogTitle)" v-model="dialogVisible" width="45%">
      <div class="formContainer">
        <el-form :model="dialogForm" label-width="180px">
          <el-form-item :label="$t('standardFamily')">
            <el-input v-model="dialogForm.standardFamilyId" placeholder=""
                      :disabled="dialogTitle === 'editStandardFamily'"></el-input>
          </el-form-item>
          <el-form-item :label="$t('standardFamilyCode')">
            <el-input v-model="dialogForm.standardFamilyCode" placeholder=""></el-input>
          </el-form-item>
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

const filteredTableData = computed(() => {
  return tableData.value.filter(item => {
    return (!form.standardFamilyId || (item.id || '').toLowerCase().includes(form.standardFamilyId.toLowerCase())) &&
           (!form.standardFamilyCode || (item.standardFamilyCode || '').toLowerCase().includes(form.standardFamilyCode.toLowerCase()));
  });
});

const dialogVisible = ref(false);
const dialogTitle = ref('addStandardFamily');
const dialogForm = ref({ standardFamilyId: '', standardFamilyCode: '' });

function fetchAll() {
  loading.value = true;
  request.get('/StandardFamily/getall').then(res => {
    if (res.data.isSuccess) tableData.value = res.data.value || [];
  }).catch(err => {
    console.error(err);
    ElMessage.error('Failed to load');
  }).finally(() => loading.value = false);
}

function addOpen() {
  dialogVisible.value = true;
  dialogTitle.value = 'addStandardFamily';
  dialogForm.value = { standardFamilyId: '', standardFamilyCode: '' };
}

function editOpen(row) {
  dialogVisible.value = true;
  dialogTitle.value = 'editStandardFamily';
  dialogForm.value = { standardFamilyId: row.id, standardFamilyCode: row.standardFamilyCode };
}

function confirmFamily() {
  if (dialogTitle.value === 'addStandardFamily') {
    request.post('/StandardFamily/add', {
      standardFamilyId: dialogForm.value.standardFamilyId,
      standardFamilyCode: dialogForm.value.standardFamilyCode
    }).then(res => {
      if (res.data.isSuccess) {
        ElMessage.success('Added');
        dialogVisible.value = false;
        tableData.value.unshift({ id: dialogForm.value.standardFamilyId, standardFamilyCode: dialogForm.value.standardFamilyCode });
      } else ElMessage.error(res.data.error || 'Failed');
    }).catch(() => ElMessage.error('Failed'));
  } else {
    request.put('/StandardFamily/update', {
      standardFamilyId: dialogForm.value.standardFamilyId,
      standardFamilyCode: dialogForm.value.standardFamilyCode
    }).then(res => {
      if (res.data.isSuccess) {
        ElMessage.success('Updated');
        dialogVisible.value = false;
        const idx = tableData.value.findIndex(item => item.id === dialogForm.value.standardFamilyId);
        if (idx !== -1) tableData.value[idx] = { ...tableData.value[idx], standardFamilyCode: dialogForm.value.standardFamilyCode };
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

onMounted(() => fetchAll());
</script>

<style scoped>
.removeTableGaps :deep(table) { margin-bottom: 0 !important; }
.domContent { margin: 0 auto; }
</style>
