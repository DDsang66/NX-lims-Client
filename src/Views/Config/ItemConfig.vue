<template>
<div>
  <div class="domContent">
    <div class="searchParametersContanier">
      <el-form inline style="display: flex">
        <el-form-item :label="$t('buyer')">
          <el-select style="width: 200px" v-model="form.buyer" placeholder=""></el-select>
        </el-form-item>
        <el-form-item :label="$t('item')">
          <el-select style="width: 300px" v-model="form.items" placeholder=""></el-select>
        </el-form-item>
        <el-form-item :label="$t('displayName')">
          <el-input v-model="form.displayName" placeholder=""></el-input>
        </el-form-item>
        <el-form-item :label="$t('standard')" style="flex: 1;margin-right: 0">
          <el-select v-model="form.standard" style="flex: 1" placeholder=""></el-select>
          <el-button type="primary" style="margin-left: 10px" @click="searchList">{{$t("search")}}</el-button>
          <el-button type="primary" style="margin-left: 10px" @click="addOpen">{{$t("add")}}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="itemTableData" border class="removeTableGaps">
      <el-table-column :label="$t('buyer')" prop="buyer" width="200">
      </el-table-column>
      <el-table-column :label="$t('item')" prop="item" width="300">
      </el-table-column>
      <el-table-column :label="$t('standard')" prop="standard">
      </el-table-column>
      <el-table-column :label="$t('displayName')" prop="displayName" width="300">
      </el-table-column>
<!--      <el-table-column :label="$t('requirement')" prop="requirement"></el-table-column>-->
<!--      <el-table-column :label="$t('remark')" prop="remark"></el-table-column>-->
      <el-table-column :label="$t('operation')" width="124">
        <template #default="scope">
          <el-button type="primary" :icon="Edit" @click="editOpen(scope.row)"></el-button>
          <el-popconfirm
            class="box-item"
            title="Are you sure to delete?"
            placement="bottom"
          >
            <template #reference>
              <el-button type="danger" :icon="Delete" style="margin-left: 5px" @click="openDelay(scope.row)"></el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <el-dialog :title="$t(dialogTitle)" v-model="dialogVisible" width="70%">
    <div class="formContainer">
      <el-form inline style="display: flex">
        <el-form-item :label="$t('buyer')">
          <el-select style="width: 200px" v-model="dialogForm.buyer" placeholder=""></el-select>
        </el-form-item>
        <el-form-item :label="$t('item')">
          <el-select style="width: 150px" v-model="dialogForm.items" placeholder="" filterable allow-create default-first-option></el-select>
        </el-form-item>
        <el-form-item :label="$t('standard')" style="flex: 1;">
          <el-select v-model="dialogForm.standard" placeholder="" filterable allow-create default-first-option></el-select>
        </el-form-item>
        <el-form-item :label="$t('displayName')" style="margin-right: 0">
          <el-input v-model="dialogForm.displayName" placeholder=""></el-input>
        </el-form-item>
      </el-form>
      <el-form label-width="auto" label-position="left">
        <el-form-item :label="$t('requirement')">
          <el-input v-model="dialogForm.requirement" placeholder=""></el-input>
        </el-form-item>
        <el-form-item :label="$t('remark')">
          <el-input v-model="dialogForm.remark" type="textarea" placeholder=""></el-input>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button type="primary" @click="addConfirm">{{$t("confirm")}}</el-button>
      <el-button @click="addCancel">{{$t("cancel")}}</el-button>
    </template>
  </el-dialog>
</div>
</template>

<script setup>
import {reactive, ref} from "vue";
import {Delete, Edit} from "@element-plus/icons-vue";
//对话框表单
const dialogForm=ref({
  buyer:'',
  items:'',
  standard:''
})
//查询表单
const form=reactive({})
//表格数据
const itemTableData=ref([
  {
    buyer:'',
    item:'',
    standard:'',
    displayName:'',
    requirement:'',
    remark:''
  }
])
//对话框展示
const dialogVisible=ref(false)
//对话框标题
const dialogTitle=ref('')
// method-------------------------------------------------------------------------------------------
function addOpen(){
  dialogVisible.value=true
  dialogTitle.value='add'
}
function editOpen(row){
  dialogVisible.value=true
  dialogTitle.value='edit'
  dialogForm.value=row
}
</script>

<style scoped>
/*去除表格标题和内容之间的空隙*/
.removeTableGaps :deep(table){
  margin-bottom: 0 !important;
}
.domContent{
  //width:90%;
  margin: 0 auto;
}
.formContainer{
  //width: 80%;
  //margin: 0 auto;
}
.searchParametersContanier{
}
</style>
