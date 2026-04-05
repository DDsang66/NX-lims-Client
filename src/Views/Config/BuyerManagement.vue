<template>
  <div>
    <div class="domContent">
      <div class="searchParametersContanier">
        <el-form inline>
          <el-form-item :label="$t('standardFamily')">
            <el-input style="width: 100px" v-model="form.standardFamilyCode"></el-input>
            <el-button type="primary" @click="addOpenStandardFamily" style="margin-left: 10px">{{$t('addStandardFamily')}}</el-button>
          </el-form-item>
        </el-form>
        <el-form inline label-position="top">
          <el-form-item :label="$t('standardId')">
            <el-input style="width: 150px" v-model="form.standardId" placeholder=""></el-input>
          </el-form-item>
          <el-form-item :label="$t('standardCode')">
            <el-input style="width: 150px" v-model="form.standardCode" placeholder=""></el-input>
          </el-form-item>
          <el-form-item :label="$t('standardNameEn')">
            <el-input style="width: 150px" v-model="form.standardNameEn" placeholder=""></el-input>
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
          <div class="el-form-item" style="display: flex;align-items: flex-end">
            <el-button type="primary" style="margin-left: 10px" @click="searchList">{{$t("search")}}</el-button>
            <el-button type="primary" style="margin-left: 10px" @click="addOpenStandard">{{$t("addStandard")}}</el-button>
          </div>
        </el-form>
      </div>
      <div class="collapseContainer">
        <el-collapse expand-icon-position="left">
          <el-collapse-item v-for="standardFamily in standardFamilyList" :key="standardFamily.id">
            <template #title>
              <div class="standardFamilyTitleContainer">
                {{$t('standardFamily:')+standardFamily.standardFamilyCode}}
                <div class="operationContainer">
                  <el-button link @click.stop="editOpenStandardFamily(standardFamily)">
                    <el-icon :size="22"><Edit /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <el-table :data="standardFamily.standardList" border class="removeTableGaps">
              <el-table-column :label="$t('standardId')" prop="standardId" width="200">
              </el-table-column>
              <el-table-column :label="$t('standardCode')" prop="standardCode" width="200">
              </el-table-column>
              <el-table-column :label="$t('standardNameEn')" prop="standardNameEn">
              </el-table-column>
              <el-table-column :label="$t('standardNameChn')" prop="standardNameChn"></el-table-column>
              <el-table-column :label="$t('testGroup')" prop="testGroup" width="110"></el-table-column>
              <!--          <el-table-column :label="$t('standardFamily')" prop="standardFamily">-->
              <!--          </el-table-column>-->
              <el-table-column :label="$t('operation')" width="124">
                <template #default="scope">
                  <el-button type="primary" :icon="Edit" @click="editOpenStandard(scope.row)"></el-button>
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
          </el-collapse-item>
        </el-collapse>

      </div>
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
        <el-button type="primary" @click="confirmStandard">{{$t("confirm")}}</el-button>
        <el-button @click="cancelStandard">{{$t("cancel")}}</el-button>
      </template>
    </el-dialog>
    <el-dialog :title="$t(dialogTitleStandardFamily)" v-model="dialogVisibleStandardFamily" width="40%">
      <div class="formContainer">
        <el-form inline label-width="auto">
          <el-form-item :label="$t('standardFamilyCode')">
            <el-input style="width: 150px" v-model="dialogFormStandardFamily.standardFamilyCode" placeholder=""></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button type="primary" @click="confirmStandardFamily">{{$t("confirm")}}</el-button>
        <el-button @click="cancelStandardFamily">{{$t("cancel")}}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {inject, reactive, ref} from "vue";
import {Delete, Edit} from "@element-plus/icons-vue";


const newRequest=inject("newRequest")
//标准组列表数据
const standardFamilyList=ref([
  {
    id:1,
    standardFamilyCode:'sdfsdfsf',
    standardList:[
      {
        id:1,
        standardId:'1',
        standardCode:'1',
        standardNameEn:'1',
        standardNameChn:'1',
        testGroup:'Physics',
        standardFamilyCode:'sdfsf'
      },
      {
        id:2,
        standardId:'2',
        standardCode:'2',
        standardNameEn:'2',
        standardNameChn:'2',
        testGroup:'Physics',
        standardFamilyCode:'Physics'
      }
    ]
  },
  {
    id:2,
    standardFamilyCode:'sdfsdfsf',
    standardList:[
      {
        id:1,
        standardId:'1',
        standardCode:'1',
        standardNameEn:'1',
        standardNameChn:'1',
        testGroup:'Physics',
        standardFamilyCode:'sdfsf'
      },
      {
        id:2,
        standardId:'2',
        standardCode:'2',
        standardNameEn:'2',
        standardNameChn:'2',
        testGroup:'Physics',
        standardFamilyCode:'Physics'
      }
    ]
  }
])
//测试分组
const testGroupOptions=["Physics","Wet","Fiber","Flam"]
//标准对话框表单
const dialogForm=ref({
  standardId:'',
  standardCode:'',
  standardNameEn:'',
  standardNameChn:'',
  testGroup:'',
  standardFamilyCode:''
})
//标准组对话框表单
const dialogFormStandardFamily=ref({})
//查询表单
const form=reactive({})
//表格数据
const itemTableData=ref([
  {
  }
])
//对话框展示
const dialogVisible=ref(false)
//标准组对话框展示
const dialogVisibleStandardFamily=ref(false)
//标准对话框标题
const dialogTitle=ref('')
//标准组对话框标题
const dialogTitleStandardFamily=ref('')
// method-------------------------------------------------------------------------------------------
function confirmStandardFamily(){
  if(dialogTitleStandardFamily.value==='addStandardFamily')
    newRequest.post('/config/standard-family-add',dialogFormStandardFamily.value).then(res=>{
      if(res.data.success){
        dialogVisibleStandardFamily.value=false
      }
    })
  else if(dialogTitleStandardFamily.value==='editStandardFamily')
    newRequest.post('/config/standard-family-update',dialogFormStandardFamily.value).then(res=>{
      if(res.data.success){
        dialogVisibleStandardFamily.value=false
      }
    })
}
function addOpenStandardFamily(){
  dialogVisibleStandardFamily.value=true
  dialogTitleStandardFamily.value='addStandardFamily'
}
function editOpenStandardFamily(row){
  dialogVisibleStandardFamily.value=true
  dialogTitleStandardFamily.value='editStandardFamily'
  dialogFormStandardFamily.value=row
}
function confirmStandard(){
  if(dialogTitle.value==='addStandard')
    newRequest.post('/config/standard-add',dialogForm.value).then(res=>{
        dialogVisible.value=false
    })
  else if(dialogTitle.value==='editStandard')
    newRequest.post('/config/standard-update',dialogForm.value).then(res=>{
      if(res.data.success){
        dialogVisible.value=false
      }
    })
}
function addOpenStandard(){
  dialogVisible.value=true
  dialogTitle.value='addStandard'
}
function editOpenStandard(row){
  dialogVisible.value=true
  dialogTitle.value='editStandard'
  dialogForm.value=row
}
</script>

<style scoped lang="scss">
.collapseContainer{
  border:1px solid #dcdfe6;
  padding:10px;
}
.operationContainer{
  margin-left: 20px;
}
.standardFamilyTitleContainer{
  @include line-left-flex-container;
  //margin: 10px 10px;
  font-size: 22px;
  font-weight: bold;
  color: #222222;
  align-self:flex-start;
}
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
