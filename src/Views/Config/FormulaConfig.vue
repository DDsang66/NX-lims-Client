<template>
  <div>
    <div class="domContent">
      <div class="searchParametersContanier">
        <el-form inline>
          <el-form-item :label="$t('standardFamilyCode')">
            <el-input style="width: 150px" v-model="form.standardFamilyCode" placeholder=""></el-input>
          </el-form-item>
          <el-form-item :label="$t('paramName')">
            <el-input style="width: 200px" v-model="form.paramName" placeholder=""></el-input>
          </el-form-item>
<!--          <el-form-item :label="$t('allowedValue')">-->
<!--            <el-input style="width: 100px" v-model="form.allowedValue" placeholder=""></el-input>-->
<!--          </el-form-item>-->
          <el-form-item :label="$t('type')" >
            <el-select  v-model="form.type" style="width: 150px" placeholder="">
              <el-option v-for="item in typeOptions" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('unit')">
            <el-select style="width: 100px" v-model="form.unit"  placeholder="">
              <el-option v-for="item in unitOptions" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
            <el-button type="primary" style="margin-left: 10px" @click="searchList">{{$t("search")}}</el-button>
            <el-button type="primary" style="margin-left: 10px" @click="addOpen">{{$t("add")}}</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="itemTableData" border class="removeTableGaps">
        <el-table-column :label="$t('standardFamilyCode')" prop="standardFamilyCode" width="200">
        </el-table-column>
        <el-table-column :label="$t('paramName')" prop="paramName" width="200">
        </el-table-column>
        <el-table-column :label="$t('allowedValue')" prop="allowedValue" width="300">
        </el-table-column>
        <el-table-column :label="$t('type')" prop="type" width="100">
        </el-table-column>
        <el-table-column :label="$t('unit')" prop="unit" width="60"></el-table-column>
        <el-table-column :label="$t('formula')" prop="formula"></el-table-column>
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
    <el-dialog :title="$t(dialogTitle)" v-model="dialogVisible" width="60%">
      <div class="formContainer">
        <div class="line-left-flex-container">
          <label>{{$t("standardFamilyCode")}}</label>
          <el-select style="width: 200px"></el-select>
        </div>
        <div style="margin-top: 10px;border-top: 1px dashed goldenrod">
          <span class="title1">{{$t('formula')}}</span>
          <el-form inline>
            <el-form-item :label="$t('paramName')">
              <el-input style="width: 150px" placeholder="" v-model="dialogForm.paramName"></el-input>
            </el-form-item>
            <el-form-item :label="$t('type')">
              <el-select  v-model="dialogForm.type" style="width: 150px" placeholder="">
                <el-option v-for="item in typeOptions" :key="item" :label="item" :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('unit')">
              <el-select style="width: 100px" v-model="dialogForm.unit"  placeholder="">
                <el-option v-for="item in unitOptions" :key="item" :label="item" :value="item">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <el-form label-width="auto">
            <el-form-item :label="$t('allowedValue')">
              <el-input-tag placeholder="" v-model="dialogForm.allowedValue"></el-input-tag>
            </el-form-item>
            <el-form-item :label="$t('formula')">
              <el-input  placeholder="" v-model="dialogForm.formula"></el-input>
            </el-form-item>
            <el-form-item label="Mapping">
              <el-table :data="dialogForm.mapTableData" class="removeTableGaps" border>
                <el-table-column v-for="(param,index) in getParams(dialogForm.formula)" :key="param" :label="param">
                </el-table-column>
                <el-table-column :label="$t('result')">
                  <template #default="scope">
                    <el-input  placeholder="" v-model="scope.row.result"></el-input>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
            <el-form-item :label="$t('mapping')">
              <el-input  type="textarea" placeholder="" v-model="dialogForm.mapping"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="confirm">{{$t("confirm")}}</el-button>
        <el-button @click="addCancel">{{$t("cancel")}}</el-button>
      </template>
    </el-dialog>
  </div>

</template>

<script setup>
import {Delete, Edit} from "@element-plus/icons-vue";
import {inject, reactive, ref} from "vue";
const newRequest=inject("newRequest")
//单位分组
const unitOptions=["cm","mm","min","min"]
//类型分组
const typeOptions=["String", "Integer", "Float", "Boolean","Enum"]
//对话框表单
const dialogForm=ref({
  params:['p1','p2']
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
//根据公式获取参数
function getParams(formula){
  if(!formula)
    return undefined
  //根据+分隔字符串。并去除空格，并丢掉空字符串
  return formula.split(/\+/).map(item=>item.trim()).filter(item=>item)
}
function confirm(){
  if(dialogTitle.value==='add')
    newRequest.post('/config/standard-add',dialogForm.value).then(res=>{
      if(res.data.success){
        dialogVisible.value=false
      }
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
.title1{
  font-size: 22px;
  font-weight: bold;
  color: var(--h1-color);
  align-self:flex-start;
}
.domContent{
  //width:80%;
  margin: 0 auto;
}
</style>
