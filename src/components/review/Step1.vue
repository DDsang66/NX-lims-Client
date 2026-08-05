<template>
  <div class="column-flex-container maxContainer" style="align-items: stretch">
    <div class="line-flex-container firstLine" style="align-items: stretch;border: 0">
      <div style="width: 60%;" class="thisBlock">
        <el-form inline class="form1"
                 require-asterisk-position="right"
                 label-width="auto"
                 label-position="left"
                 :rules="rules1"
                 ref="form1Ref"
                 :validate-on-rule-change="false"
                 :model="form1">
          <el-form-item required>
            <template #label>
              <div class="itemLabel">{{$t('reportNumber')}}</div>
            </template>
            <el-input v-model="reportNums.data1" style="width: 45px;" :size="size"
                      disabled></el-input>
            <el-select v-model="reportNums.data2"
                       filterable
                       :size="size"
                       style="width: 75px;">
              <el-option value="405.">405.</el-option>
              <el-option value="441.">441.</el-option>
            </el-select>
            <el-select v-model="reportNums.data3"
                       :size="size"
                       filterable
                       style="width: 65px;">
              <el-option :value="twoDigitYear+'.'"></el-option>
              <el-option :value="twoDigitYear-1+'.'"></el-option>
            </el-select>
            <el-input v-model="reportNums.data4" style="width: 80px;" :size="size"
                      :class="{'is-error-el':data4IsError}"
                      @input="data4Check"
                      @keydown="data4Keydown"
                      @blur="data4Blur"></el-input>
            <el-input v-model="reportNums.data5" style="width: 60px;"
                      :class="{'is-error-el':data5IsError}"
                      @input="data5Check"
                      @keydown="enterBlur"
                      @blur="data5Blur"
                      :size="size"></el-input>
            <div class="el-form-item__error" v-if="reportIsError">
              {{$t(reportError)}}
            </div>
          </el-form-item>
          <el-form-item required prop="buyerName">
            <template #label>
              <div class="itemLabel">{{$t('buyer')}}</div>
            </template>
            <el-select style="width: 120px" :size="size" v-model="buyerName"
                       @change="buyerChange"
                       filterable>
              <el-option v-for="buyer in buyerOptions" :key="buyer.name" :value="buyer.name"
                         :label="buyer.name">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="menus">
            <template #label>
              <div class="itemLabel">{{$t('menus')}}</div>
            </template>
            <el-select style="width: 325px" v-model="menus"
                       :size="size"
                       filterable
                       allow-create
                       multiple
                       default-first-option
                       @remove-tag="removeMenuHandler"
                       value-key="name">
              <el-option v-for="menu in menuOptions" :key="menu.name" :value="menu"
                         :label="menu.name">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div style="width: 40%" class="thisBlock rightBlock">
        <el-form
          label-position="left"
          label-width="auto"
          :model="form2"
          ref="form2Ref"
          :rules="rules2"
          :validate-on-rule-change="false"
          hide-required-asterisk
          class="rightForm">
          <el-form-item prop="newItem" class="rightFormItem">
            <template #label>
              <div class="itemLabel2">{{$t('item')}}</div>
            </template>
            <el-select style="width: 300px" :size="size" v-model="newItemName" filterable @change="newItemstandardCode=''">
              <el-option v-for="itemName in newItemOptions.map(item => item.itemName)"
                         :key="itemName"
                         :value="itemName"
                         :label="itemName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="newItem.standardCode" class="rightFormItem">
            <template #label>
              <div class="itemLabel2">{{$t('standardCode')}}</div>
            </template>
            <div class="standardLine">
              <el-select style="width: 300px" :size="size" filterable
                         v-model="newItemstandardCode">
                <el-option v-for="s in standardOptions" :key="s.standardCode"
                           :value="s.standardCode">
                </el-option>
              </el-select>
              <el-button type="primary" class="addBtn" @click="addAdditionalItem">+</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!--      第一个list                        -->
    <div class="firstList">
      <el-tabs type="border-card" v-model="activeTabName">
        <el-tab-pane :label="$t('menuName')" v-if="menus.length===0" name="default">
          <div>{{$t('samplePlease')}}</div>
        </el-tab-pane>
        <el-tab-pane v-for="menu in menus" :key="menu.name" :label="menu.name" :name="menu.name">
          <div class="menuFirstListContainer">
<!--            模糊搜索-->
            <div class="itemFuzzyQueryContainer">
              <div class="oneFormItem">
                <div class="itemLabel">{{$t('item')}}</div>
                <el-input v-model="itemFuzzyQueryParameters.itemName" style="width: 300px"></el-input>
              </div>
              <div class="oneFormItem">
                <div class="itemLabel">{{$t('standardCode')}}</div>
                <el-input v-model="itemFuzzyQueryParameters.standardCode" style="width: 300px"></el-input>
              </div>
              <el-button @click="itemFuzzyQueryReset">{{$t('reset')}}</el-button>
            </div>
<!--            分组-->
            <div v-if="menu.groups">
              <div v-for="group in menu.groups" :key="group.name">
                <h6 class="">{{ group.name }}</h6>
                <el-table
                  border
                  :data="group.items"
                  class="removeTableGaps "
                  :row-style="({row})=>{if(!(row.itemName.includes(itemFuzzyQueryParameters.itemName)&&row.standardCode.includes(itemFuzzyQueryParameters.standardCode)))
                    return {display:'none'}}"
                  :row-class-name="(data)=>{return data.row.isTogether ?'togetherTr' : ''}"
                  :cell-class-name="(data)=>{return data.row.isTogether ?'togetherTr' : ''}"
                  @cell-mouse-enter="togetherChoose"
                  @cell-mouse-leave="togetherChoose"
                  @row-click="(row,column,event)=>{if(event.ctrlKey){row.isTogether=!row.isTogether}}"
                >
                  <el-table-column :label="$t('index')" prop="index" width="70px">
                  </el-table-column>
                  <el-table-column :label="$t('testItem')" prop="itemName" width="200px">
                  </el-table-column>
                  <el-table-column :label="$t('standardCode')" prop="standardCode">
                  </el-table-column>
                  <el-table-column :label="$t('requirement')" prop="requirement">
                  </el-table-column>
                  <el-table-column :label="$t('samples')" width="340px">
                    <template #default="scope">
                      <!--                        <el-input v-model="scope.row.samples"-->
                      <!--                                  @input="togetherChange(scope.row.isTogether,$event)"></el-input>-->
                      <samples-select v-model="scope.row.samples" style="width: 100%"
                                      :size="size"
                                      :max-show-number="3"
                                      collapse-tags
                                      @change="togetherChange(scope.row.isTogether,$event)"></samples-select>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('copies')" width="90px">
                    <template #default="scope">
                      <el-input-number
                        v-model="scope.row.copies"
                        :min="1"
                        controls-position="right"
                        :size="size"
                        style="width: 75px;"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
<!--            不分组-->
            <div v-else style="margin-top: 20px">
              <el-table
                border
                :data="menu.items"
                class="removeTableGaps "
                :row-style="({row})=>{if(!(row.itemName.includes(itemFuzzyQueryParameters.itemName)&&row.standardCode.includes(itemFuzzyQueryParameters.standardCode)))
                    return {display:'none'}}"
                :row-class-name="(data)=>{return data.row.isTogether ?'togetherTr' : ''}"
                :cell-class-name="(data)=>{return data.row.isTogether ?'togetherTr' : ''}"
                @cell-mouse-enter="togetherChoose"
                @cell-mouse-leave="togetherChoose"
                @row-click="(row,column,event)=>{if(event.ctrlKey){row.isTogether=!row.isTogether}}"
              >
                <el-table-column :label="$t('index')" prop="index" width="70px">
                </el-table-column>
                <el-table-column :label="$t('testItem')" prop="itemName" width="200px">
                </el-table-column>
                <el-table-column :label="$t('standardCode')" prop="standardCode">
                </el-table-column>
                <el-table-column :label="$t('requirement')" prop="requirement">
                </el-table-column>
                <el-table-column :label="$t('samples')" width="320px">
                  <template #default="scope">
                    <!--                      <el-input v-model="scope.row.samples" :size="size"-->
                    <!--                                @input="togetherChange(scope.row.isTogether,$event)"></el-input>-->
                    <samples-select v-model="scope.row.samples" style="width: 300px"
                                    :size="size"
                                    :max-show-number="3"
                                    collapse-tags
                                    @change="togetherChange(scope.row.isTogether,$event)"></samples-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('copies')" width="90px">
                  <template #default="scope">
                    <el-input-number
                      v-model="scope.row.copies"
                      :min="1"
                      controls-position="right"
                      :size="size"
                      style="width: 75px;"
                    />
                  </template>
                </el-table-column>
                <el-table-column :label="$t('delete')" v-if="menu.name==='AdditionalMenu'" width="75px">
                  <template #default="scope">
                    <el-button type="danger" @click="deleteAdditionalItem(scope.$index)">-
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import SamplesSelect from "@/components/self made UI/SamplesSelect.vue";
import {computed, onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";
import globalFunctions from "@/utils/globalFunctions.js";
import {data} from "@visactor/vtable";
import request from "@/utils/request.js";
import { useI18n } from "vue-i18n";
import { ElMessage } from 'element-plus'; 

  const emit = defineEmits(['update:buyerNameDto', 'update:step1Data'])

const { t } = useI18n()
const props=defineProps({
  size: {
    type: String,
    default: 'default'
  },
  allDom: {
    type: Object,
    default: null
  },
  buyerNameDto: String,
})
//item模糊查询参数
const itemFuzzyQueryParameters=reactive({
  itemName: '',
  standardCode: '',
})

//活跃标签页
const activeTabName=ref('default')
//ref
const form1Ref=ref(null)
const form2Ref=ref(null)
//ctrl状态
let ctrlDown = false
// //鼠标左健
// var mouseLeftDown = false
//维护鼠标相对于视口高度
let mouseClientY = 0
//两位年份
let twoDigitYear = ref(new Date().getFullYear() % 100)
const reportNums = reactive({
  data1: '87.',
  data2: "405.",
  data3: twoDigitYear.value + '.',
  data4: '',
  data5: '.01',
})
//错误状态
const data4IsError=ref(false)
const data5IsError=ref(false)
const reportIsError=computed(()=>data4IsError.value||data5IsError.value)
//订单错误汇总
const reportErrorSummary=reactive(new Set())
const reportError=computed(()=>Array.from(reportErrorSummary)[0])
//menu的选项（选买家后由真实 API 加载）
const menuOptions = ref([])
//当前选中的买家 code（用于调 GET /Menu/get-by-buyerId/{code}）
const selectedBuyerCode = ref('')
//TestItem / Standard 映射（id → 名称/编码）
const testItemMap = ref({})
const standardMap = ref({})
const newItemName = ref('')
const newItemstandardCode = ref('')
const newItem=computed(()=>{
  const opt = newItemOptions.value.find(o => o.itemName === newItemName.value)
  return newItemName.value
    ? { itemName: newItemName.value, standardCode: newItemstandardCode.value, testItemId: opt?.testItemId || '' }
    : null
})
//真实 API：右上角 Item / Standard Code 选项（加载真实数据，不保存到 menu）
const newItemOptions = ref([])      // [{itemName: nameEn, testItemId, group}]
const standardOptions = ref([])     // [{standardId, standardCode}]
//定时器
let timer=null
// //项目默认值
// let itemDefalutObj={copies:1,samples:[]}
//买家选项
const buyerOptions = ref([])

//持久表单数据----------------------------------------
const buyerName = ref('')
//选择的menu
const menus = ref([])
// //被展示的部分
// const menusBeDisplayed = ref(menus.value)
//单号
const reportNo=computed(()=>reportNums.data1 + reportNums.data2 + reportNums.data3 + reportNums.data4 + reportNums.data5
)
//第一个表单
let form1=reactive({
  buyerName: buyerName,
  menus: menus,
  reportNo:reportNums
})
const rules1=computed(()=>{
  return {
    'buyerName': [
      {required: true, message: t('message.buyerSelect'),trigger: 'change'}
    ],
    'menus': [
      {required: true, message: t('message.oneMenu'),trigger: 'change'},
    ],
  }
})
//第二表单
let form2=reactive({
  newItem
})
let rules2=computed(()=>{
  return {
    'newItem': [
      {required: true, message: t('message.itemSelect'),trigger: 'change'},
    ],
    'newItem.standardCode': [
      {required: true, message: t('message.standardSelect'),trigger: 'change'},
    ],
  }
})

/*function------------------------------------------------------------------------------------------*/
//获取买家选项
  async function getBuyerOptions() {
    try {
      const res = await request.get('/buyer/buyer-list')

      if (!res.data.isSuccess) {
        console.warn('Failed to load buyer list:', res.data.message)
        return
      }

      // 确保数据结构正确
      buyerOptions.value = res.data.value.map(buyer => ({
        name: buyer.buyerName || buyer.name || buyer.buyerCode || 'Unknown',
        buyerCode: buyer.buyerCode || buyer.code || '',
        code: buyer.buyerCode || buyer.code || ''  // 保留两种命名方式以便兼容
      }))

      // 如果之前有选中的买家，尝试重新匹配
      if (buyerName.value) {
        const matched = buyerOptions.value.find(b => b.name === buyerName.value)
        if (!matched) {
          buyerName.value = ''
        }
      }
    } catch (error) {
      console.error('Error fetching buyer list:', error)
      // 可选：设置默认数据或显示错误提示
      ElMessage?.error?.('Failed to load buyer list')
    }
  }
//项目模糊查询
//重置
function itemFuzzyQueryReset(){
  itemFuzzyQueryParameters.itemName=''
  itemFuzzyQueryParameters.standardCode=''
}

// // 单号报错
// function reportData4Error(message){
//   reportError.value=message
//   data4IsError.value=true
// }
//项目初始化方法
function initItems(item){
  item.copies=1
  item.samples=[]
  return item
}
//移除标签事件处理
function removeMenuHandler(tagValue){
  if(tagValue.name==="AdditionalMenu")
    menuOptions.value.splice(menuOptions.value.findIndex(menu=>menu.name==="AdditionalMenu"),1)
}
//buyer改变
  function buyerChange() {
    emit('update:buyerNameDto', globalFunctions.cleanAndLowercase(buyerName.value))
    // 找到选中的买家 code → 加载真实菜单
    const matched = buyerOptions.value.find(b => b.name === buyerName.value)
    // 兼容多种字段名
    selectedBuyerCode.value = matched?.buyerCode || matched?.code || ''
    loadMenus(selectedBuyerCode.value)
  }

//加载 TestItem/Standard 映射（id → 名称/编码），同时填充右上角 Item / Standard Code 选项
function loadMappings() {
  request.get('/TestItem/getall').then(res => {
    if (res.data.isSuccess) {
      const map = {}
      ;(res.data.value || []).forEach(i => { map[i.id] = i })
      testItemMap.value = map
      // 右上角 Item 下拉：显示英文名
      newItemOptions.value = (res.data.value || []).map(i => ({
        itemName: i.nameEn || i.nameChn || i.id,
        testItemId: i.id,
        group: i.group || ''
      }))
    }
  }).catch(() => {})
  request.get('/Standard/getall').then(res => {
    if (res.data.isSuccess) {
      // 建立两个映射
      const codeToIdMap = {}  // standardCode → standardId
      const idToCodeMap = {}  // standardId → standardCode

        ; (res.data.value || []).forEach(s => {
          const id = s.standardId || s.StandardId  // 兼容大小写
          const code = s.standardCode
          if (code && id) {
            codeToIdMap[code] = id
            idToCodeMap[id] = code
          }
        })

      // 这里我们需要两个映射
      // 但只有一个 standardMap，所以需要调整
      standardMap.value = codeToIdMap  // 用于编码→ID 转换

      // 为了在 loadMenus 中显示，需要另一个映射
      // 可以复用 standardMap 或者新建一个
      // 但为了最小改动，我们直接在 loadMenus 中使用 standardMap 的反向查找

      standardOptions.value = res.data.value || []
    }
  }).catch(() => {})
}
//加载某买家的真实菜单 → 填充 menuOptions
function loadMenus(buyerCode) {
  if (!buyerCode) { menuOptions.value = []; return }
  request.get(`/Menu/get-by-buyerId/${buyerCode}`).then(res => {
    if (!res.data.isSuccess) { menuOptions.value = []; return }
    const list = res.data.value || []
    menuOptions.value = list.map(menu => {
      const items = (menu.menuItems || []).map((item, idx) => {
        // 将 standardIds (ID列表) 转换为 standardCode (编码字符串)
        const standardCodes = (item.standardIds || []).map(id => {
          // 查找 ID 对应的编码
          const code = Object.keys(standardMap.value).find(key => standardMap.value[key] === id)
          return code || id  // 如果找不到，返回 ID 本身
        })

        return {
          index: String(idx + 1),
          itemName: (testItemMap.value[item.testItemId]?.nameEn)
            || (testItemMap.value[item.testItemId]?.nameChn)
            || item.buyerOwnName || item.testItemId || '',
          standardCode: standardCodes.join(','),  // 显示编码
          requirement: item.requirement || '',
          samples: [],
          testItemId: item.testItemId || '',
          buyerModifiedTestItemId: item.buyerModifiedTestItemId || null,
          buyerModifiedTextMethodId: item.buyerModifiedTextMethodId || null,
        }
      })
      // 按 buyerModifiedGroup 分组
      const groupsMap = {}
      items.forEach((it, idx) => {
        const g = menu.menuItems[idx]?.buyerModifiedGroup || ''
        if (!groupsMap[g]) groupsMap[g] = []
        groupsMap[g].push(it)
      })
      const groups = Object.entries(groupsMap)
        .filter(([g]) => g !== '')
        .map(([g, its]) => ({ name: g, items: its }))
      const ungrouped = groupsMap[''] || []
      const result = { name: menu.menuName, groups: groups }
      if (ungrouped.length > 0) {
        if (groups.length === 0) result.items = ungrouped       // 全无组 → flat
        else groups.push({ name: 'Default', items: ungrouped })  // 有组+无组 → 默认组
      }
      return result
    })
  }).catch(() => { menuOptions.value = [] })
}

//失去焦点，判断四位数
function data4Blur() {
  data4Check()
  //无错误
  if(!data4IsError.value){
    //先转为数字，再转回字符串。以此去掉0
    reportNums.data4 = String(Number(reportNums.data4))
    //不到四位则补零
    if (reportNums.data4.length < 4) {
      reportNums.data4 = String(reportNums.data4).padStart(4, '0')
    }
  }
}

//data5失去焦点，判断两位数
function data5Blur() {
  data5Check()
  //无错误
  if(!data5IsError.value){
    //数组部分（去掉首位的.获得）
    let data5Number=reportNums.data5.split('.')[1]
    //补0
    if (data5Number.length < 2) {
      data5Number = String(data5Number).padStart(2, '0')
    }
    reportNums.data5 = '.' + data5Number
  }
}

//检查data4的输入
function data4Check(){
  let emptyErrorMessage = 'reportMessage.fourth.empty'
  let formatErrorMessage = 'reportMessage.fourth.notNumber'
  //先判断为空
  if (!reportNums.data4){
    reportErrorSummary.add(emptyErrorMessage)
    data4IsError.value=true
  }else reportErrorSummary.delete(emptyErrorMessage)
  reportNums.data4=reportNums.data4.trim()
  //先判断数字
  if (!/^\d+$/.test(reportNums.data4)) {
    reportErrorSummary.add(formatErrorMessage)
    data4IsError.value=true
  } else {
    reportErrorSummary.delete(formatErrorMessage)
    data4IsError.value=false
  }
  return !data4IsError.value
}

//检验data5输入
function data5Check() {
  let emptyErrorMessage = 'reportMessage.fifth.empty'
  let formatErrorMessage = 'reportMessage.fifth.formatError'
  //先判断为空
  if (!reportNums.data5){
    reportErrorSummary.add(emptyErrorMessage)
    data5IsError.value=true
  }else reportErrorSummary.delete(emptyErrorMessage)
  reportNums.data5=reportNums.data5.trim()
  //判断格式，首位是.其余是数字
  if (!/^\.\d+$/.test(reportNums.data5)) {
    reportErrorSummary.add(formatErrorMessage)
    data5IsError.value=true
  } else {
    reportErrorSummary.delete(formatErrorMessage)
    data5IsError.value=false
  }
  return !data4IsError.value
}


//单号校验
function reportNoCheck(){
  return data4Check()&&data5Check()
}
//统一检查
  async function allCheck() {
    // 1. 先进行表单验证
    let reportCorrect = reportNoCheck()
    let form1OtherCorrect

    try {
      form1OtherCorrect = await form1Ref.value.validate()
    } catch {
      form1OtherCorrect = false
    }

    if (!reportCorrect || !form1OtherCorrect) {
      return false
    }

    // 2. 提交 sample 数据到后端
    const submitSuccess = await submitSampleData()

    if (submitSuccess) {
      // 3. 将数据传递给父组件
      emit('update:step1Data', {
        reportNo: reportNo.value,
        buyerName: buyerName.value,
        menus: menus.value,
        sampleData: collectSampleData()
      })
      return true
    }

    return false
  }

//data4中按下enter
function data4Keydown(e) {
  enterBlur(e)
}
//enter按下则Blur
function enterBlur(e) {
  // 检测是否按下了 Enter 键
  if (e.key === 'Enter') {
    // 阻止默认行为（换行）
    e.preventDefault();
    // 让当前元素失去焦点，触发 @blur
    e.target.blur();
  }
}

//添加额外项目
async function addAdditionalItem() {
  //校验
  let noError
  try {
    noError=await form2Ref.value.validate()
  }catch {
    return
  }
  //如果没有，先创建Menu
  if (!menus.value.some(menu => menu.name === 'AdditionalMenu')){
    let newMenu={name:"AdditionalMenu",items:[initItems({...newItem.value, index: 1})]}
    menus.value.push(newMenu)
    menuOptions.value.push(newMenu)
  }else{
    //添加项
    menus.value.map(menu => {
      if (menu.name === 'AdditionalMenu') {
        if(!menu.items.some(item => item.itemName === newItem.value.itemName&&item.standardCode === newItem.value.standardCode))
          menu.items.push(initItems({...newItem.value, index: menu.items.length+1}))
      }
    })
  }
}

//删除项目
function deleteAdditionalItem(index) {
  menus.value.map(menu => {
    if (menu.name === 'AdditionalMenu') {
      menu.items.splice(index, 1)
    }
  })
}

//选中
function togetherChoose(row, column, cell, e) {
  if (e.ctrlKey) {
    row.isTogether = true
  }
}

//一起修改值
function togetherChange(isTogether, value) {
  if (isTogether) {
    for (const menu of menus.value) {
      //无分组
      if (!menu.groups) {
        for (const item of menu.items) {
          if (item.isTogether) {
            if(Array.isArray(item.samples))
              item.samples=[...value]
            else
              item.samples = value
          }
        }
      } else {
        //有分组
        for (const group of menu.groups) {
          for (const item of group.items) {
            if (item.isTogether) {
              if(Array.isArray(item.samples))
                item.samples=[...value]
              else
                item.samples = value
            }
          }
        }
      }

    }
  }
}

//为所有项目选项添加默认值
function itemOptionsAddDefault(){
  for (const menu of menuOptions.value) {
    if (!menu.groups) {
      menu.items=menu.items.map(item => (initItems(item)))
    } else {
      for (const group of menu.groups) {
        group.items=group.items.map(item => (initItems(item)))
      }
    }
  }
}


let valid = true;
//节流
function throttle(fn, delay) {
  if (!valid) {
    return
  }
  valid = false;
  fn();
  setTimeout(function () {
    valid = true;
  }, delay);
}

//ctrl按下时，阻止默认行为
function ctrlPreventDefault(e) {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}

//全局监听按键
function handleGlobalKeyDown(e) {
  if (e.key === 'Escape') {
    for (const menu of menus.value) {
      if (menu.groups) {
        for (const group of menu.groups) {
          for (const item of group.items) {
            item.isTogether = false
          }
        }
      } else {
        for (const item of menu.items) {
          item.isTogether = false
        }
      }
    }
  }
  if (e.key === 'Control') {
    ctrlDown = true
  }
}

function handleGlobalKeyUp(e) {
  if (e.key === 'Control') {
    ctrlDown = false
  }
}

function globalMouseDown(e) {
  ctrlPreventDefault(e)
}

  function globalMouseMove(e) {
    ctrlPreventDefault(e)
    throttle(() => {
      mouseClientY = e.clientY
    }, 50)
  }

  // 收集有 sample 值的行数据
  // 收集有 sample 值的行数据
  function collectSampleData() {
    const items = []

    // 遍历所有选中的菜单
    for (const menu of menus.value) {
      // 处理有分组的情况
      if (menu.groups) {
        for (const group of menu.groups) {
          for (const item of group.items) {
            if (item.samples && item.samples.length > 0) {
              // 转换 standardCode 为 standardIds 数组（ID 列表）
              const standardIds = []
              if (item.standardCode) {
                const codes = item.standardCode.split(',').map(s => s.trim()).filter(Boolean)
                for (const code of codes) {
                  // 通过 standardMap 查找对应的 ID
                  const id = standardMap.value[code]
                  if (id) {
                    standardIds.push(id)
                  } else {
                    console.warn(`Standard code not found: ${code}`)
                    // 如果找不到映射，使用 code 本身作为 fallback
                    standardIds.push(code)
                  }
                }
              }

              items.push({
                testItemId: item.testItemId || '',
                buyerModifiedTestItemId: null,
                standardIds: standardIds,  // ← 现在是 ID 列表
                buyerModifiedTextMethodId: null,
                testGroup: 0,
                samples: item.samples || [],
                requirement: item.requirement || ''
              })
            }
          }
        }
      }
      // 处理无分组的情况 - 修复后
      else if (menu.items) {
        for (const item of menu.items) {
          if (item.samples && item.samples.length > 0) {
            // 转换 standardCode 为 standardIds 数组（ID 列表）
            const standardIds = []
            if (item.standardCode) {
              const codes = item.standardCode.split(',').map(s => s.trim()).filter(Boolean)
              for (const code of codes) {
                // 通过 standardMap 查找对应的 ID
                const id = standardMap.value[code]
                if (id) {
                  standardIds.push(id)
                } else {
                  console.warn(`Standard code not found: ${code}`)
                  standardIds.push(code)
                }
              }
            }

            items.push({
              testItemId: item.testItemId || '',
              buyerModifiedTestItemId: null,
              standardIds: standardIds,  // ← 现在是 ID 列表
              buyerModifiedTextMethodId: null,
              testGroup: 0,
              samples: item.samples || [],
              requirement: item.requirement || ''
            })
          }
        }
      }
    }

    return items
  }

  //提交数据到后端
  async function submitSampleData() {
    const items = collectSampleData()

    if (items.length === 0) {
      ElMessage.warning(t('message.noSampleData') || 'Please add samples before proceeding')
      return false
    }

    try {
      const payload = {
        sourceId: reportNo.value,
        items: items,
        remark: '' // 暂无备注
      }

      const res = await request.post('/checklist/add', payload)

      if (res.data.isSuccess) {
        ElMessage.success(t('message.sampleSubmitSuccess') || 'Sample data submitted successfully')
        return true
      } else {
        ElMessage.error(res.data.message || t('message.sampleSubmitFailed') || 'Failed to submit sample data')
        return false
      }
    } catch (error) {
      console.error('Submit sample data error:', error)
      ElMessage.error(t('message.sampleSubmitError') || 'Error submitting sample data')
      return false
    }
  }



/*暴露数据-------------------------------------------------------------------------------------------*/
defineExpose({
  menus,
  reportNo,
  buyerName,
  allCheck,
})


/*数据监听-------------------------------------------------------------------------------------------*/
watch(menus, () => {
  //不包含当前标签页
  if(!menus.value.some(menu => menu.name === activeTabName.value)){
    //不为空
    if(menus.value.length>0){
      activeTabName.value=menus.value[0].name
    }else{
      activeTabName.value='default'
    }
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown);
  window.addEventListener('mousedown', globalMouseDown);
  window.addEventListener('mousemove', globalMouseMove);
  // window.addEventListener('mouseup', globalMouseUp);
  window.addEventListener('keyup', handleGlobalKeyUp);
  //自动滚动滚动条
  timer =setInterval(() => {
    if (ctrlDown) {
      if (window.innerHeight - mouseClientY < window.innerHeight * 0.1) {
        props.allDom.scrollTop += 10
      }
    }
  }, 10)

  itemOptionsAddDefault()
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
  window.removeEventListener('mousedown', globalMouseDown);
  window.removeEventListener('mousemove', globalMouseMove);
  // window.removeEventListener('mouseup', globalMouseUp);
  window.removeEventListener('keyup', handleGlobalKeyUp);
  clearInterval(timer)
});

onMounted(()=>{
  getBuyerOptions()
  loadMappings()
})
</script>

<style scoped lang="scss">
.maxContainer{
}
@mixin thisBlockBorder {
  border: 1px solid var(--el-border-color);
}
.thisBlock {
  @include thisBlockBorder;
  padding: 10px 10px 0;
}
/*右边 Item/Standard Code 框：弹性布局，缩放时不错位*/
.rightBlock{
  min-width: 0;               /* 允许 flex 子项收缩，防止溢出换行 */
  align-items: center;
  justify-content: center;
}
.rightForm{
  width: 100%;
  /* Item 与 Standard Code 分两行显示，不并排 */
  display: block;
}
.rightFormItem{
  width: 100%;
  margin-bottom: 8px;
}
.rightFormItem:last-child{
  margin-bottom: 0;
}
.rightForm :deep(.el-form-item){
  margin-right: 0;
  flex: 1;
  min-width: 0;
}
.rightForm :deep(.el-form-item__content){
  flex: 1;
  min-width: 0;
}
.standardLine{
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  min-width: 0;
}
.addBtn{
  flex-shrink: 0;
}
/*.maxContainer .thisBlock{
  @include thisBlockBorder;
  padding: 0 5px;
}*/
.firstList h6 {
  margin-top: 10px !important;
  margin-bottom: 10px !important;
}
.firstLine > div {
  @include thisBlockBorder;
  display: flex;
  align-items: center;
  justify-content: center;
}
/*去除表格标题和内容之间的空隙*/
.removeTableGaps :deep(table) {
  margin-bottom: 0 !important;
}
:deep(.togetherTr) {
  background-color: #8ff68f !important;
}
/*禁止选中文本*/
.no-select {
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* 标准语法 */
}
.itemLabel{
  //width: 80px;
  font-size: 16px;
  font-weight: bold;
  //text-align: left;
}
.itemLabel2{
  //width: 108px;
  font-size: 16px;
  font-weight: bold;
  //text-align: left;
}
.oneFormItem{
  @include line-flex-container;
}
.itemFuzzyQueryContainer{
  @include line-flex-container;
  gap:10px;
  //margin-left: 20px;
}
</style>
