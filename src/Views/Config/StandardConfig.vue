<template>
  <div>
    <div class="domContent">
      <div class="searchParametersContanier">
        <el-form inline>
          <el-form-item :label="$t('standardId')">
            <el-input style="width: 150px" v-model="form.standardId" placeholder=""></el-input>
          </el-form-item>
          <el-form-item :label="$t('standardCode')">
            <el-input style="width: 200px" v-model="form.standardCode" placeholder=""></el-input>
          </el-form-item>
          <el-form-item :label="$t('standardNameEn')">
            <el-input style="width: 100px" v-model="form.standardNameEn" placeholder=""></el-input>
          </el-form-item>
          <el-form-item :label="$t('standardNameChn')">
            <el-input  v-model="form.standardNameChn" style="width: 150px" placeholder=""></el-input>
          </el-form-item>
          <el-form-item :label="$t('testGroup')">
            <el-select style="width: 100px" v-model="form.testGroup"  placeholder="">
              <el-option v-for="item in testGroupOptions" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('standardFamily')">
            <el-input style="width: 100px" v-model="form.standardFamilyCode"></el-input>
            <el-button type="primary" style="margin-left: 10px" @click="searchList">{{$t("search")}}</el-button>
            <el-button type="primary" style="margin-left: 10px" @click="addOpen">{{$t("add")}}</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="itemTableData" border class="removeTableGaps">
        <el-table-column :label="$t('standardId')" prop="standardId" width="200">
        </el-table-column>
        <el-table-column :label="$t('standardCode')" prop="standardCode" width="200">
        </el-table-column>
        <el-table-column :label="$t('standardNameEn')" prop="standardNameEn">
        </el-table-column>
        <el-table-column :label="$t('standardNameChn')" prop="standardNameChn"></el-table-column>
        <el-table-column :label="$t('testGroup')" prop="testGroup" width="110"></el-table-column>
        <el-table-column :label="$t('standardFamily')" prop="standardFamily">
        </el-table-column>
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
    <el-dialog :title="$t(dialogTitle)" v-model="dialogVisible" width="65%">
      <div class="formContainer">
        <el-form inline label-width="auto">
          <el-form-item :label="$t('standardId')">
            <el-input style="width: 150px" v-model="dialogForm.standardId" placeholder=""></el-input>
          </el-form-item>
          <el-form-item :label="$t('standardCode')">
            <el-input style="width: 150px" v-model="dialogForm.standardCode" placeholder=""></el-input>
          </el-form-item>
          <el-form-item :label="$t('standardNameEn')">
            <el-input style="width: 150px" v-model="dialogForm.standardNameEn" placeholder=""></el-input>
          </el-form-item>
          <el-form-item :label="$t('standardNameChn')">
            <el-input  v-model="dialogForm.standardNameChn" style="width: 150px" placeholder=""></el-input>
          </el-form-item>
          <el-form-item :label="$t('testGroup')">
            <el-select style="width: 150px" v-model="dialogForm.testGroup"  placeholder="">
              <el-option v-for="item in testGroupOptions" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('standardFamily')">
            <el-select style="width: 150px" v-model="dialogForm.standardFamilyCode">
              <el-options></el-options>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button type="primary" @click="confirm">{{$t("confirm")}}</el-button>
        <el-button @click="addCancel">{{$t("cancel")}}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {inject, reactive, ref} from "vue";
import {Delete, Edit} from "@element-plus/icons-vue";


const newRequest=inject("newRequest")
//测试分组
const testGroupOptions=["Physics","Wet","Fiber","Flam"]
//对话框表单
const dialogForm=ref({
  standardId:'',
  standardCode:'',
  standardNameEn:'',
  standardNameChn:'',
  testGroup:'',
  standardFamilyCode:''
})
//查询表单
const form=reactive({})
//表格数据
const itemTableData=ref([
  {
  }
])
//对话框展示
const dialogVisible=ref(false)
//对话框标题
const dialogTitle=ref('')
// method-------------------------------------------------------------------------------------------
function confirm(){
  if(dialogTitle.value==='add')
    newRequest.post('/config/standard-add',dialogForm.value).then(res=>{
        dialogVisible.value=false
    })
  else if(dialogTitle.value==='edit')
    newRequest.post('/config/standard-update',dialogForm.value).then(res=>{
      if(res.data.success){
        dialogVisible.value=false
      }
    })
}
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
