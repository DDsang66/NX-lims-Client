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
      <div style="width: 40%" class="thisBlock">
        <el-form
          label-position="left"
          label-width="auto"
          :model="form2"
          ref="form2Ref"
          :rules="rules2"
          :validate-on-rule-change="false"
          hide-required-asterisk
          inline>
          <el-form-item prop="newItem">
            <template #label>
              <div class="itemLabel2">{{$t('item')}}</div>
            </template>
            <el-select style="width: 300px" :size="size" v-model="newItemName" filterable @change="newItemstandardCode=''">
              <el-option v-for="itemName  in newItemOptions.map(item=>item.itemName)"
                         :key="itemName"
                         :value="itemName"
                         :label="itemName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="newItem.standardCode">
            <template #label>
              <div class="itemLabel2">{{$t('standardCode')}}</div>
            </template>
            <el-select style="width: 300px" :size="size" filterable
                       v-model="newItemstandardCode">
              <el-option v-for="standardCode in newItemOption.standardCodes" :key="standardCode"
                         :value="standardCode">
              </el-option>
            </el-select>
            <el-button type="primary" style="margin-left: 5px" @click="addAdditionalItem">+</el-button>
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
              <div class="oneFormItem" v-if="menu.groups">
                <div class="itemLabel">{{$t('group')}}</div>
                <el-input v-model="itemFuzzyQueryParameters.group" style="width: 150px"></el-input>
              </div>
              <div class="oneFormItem">
                <div class="itemLabel">{{$t('item')}}</div>
                <el-input v-model="itemFuzzyQueryParameters.itemName" style="width: 300px"></el-input>
              </div>
              <div class="oneFormItem">
                <div class="itemLabel">{{$t('standardCode')}}</div>
                <el-input v-model="itemFuzzyQueryParameters.standardCode" style="width: 300px"></el-input>
              </div>
              <el-button @click="itemFuzzyQuery" circle><el-icon><Search /></el-icon></el-button>
              <el-button @click="itemFuzzyQueryReset">{{$t('reset')}}</el-button>
            </div>
<!--            分组-->
            <div v-if="menu.groups">
              <div v-for="group in menu.groups" :key="group.name" v-show="group.name.includes(itemFuzzyQueryParameters.group)">
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
import {Search} from "@element-plus/icons-vue";
import axios from "axios";
import {useI18n} from "vue-i18n";

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
  group: '',
})
//事件
const emit=defineEmits(['update:buyerNameDto'])
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
//menu的选项
const menuOptions = ref([{
  name: 'menu1',
  groups: [{
    name: 'Physics', items: [
      {
        index: '1',
        itemName: 'item1',
        standardCode: 'sdfsa',
        requirement: 'asdfasfdas',
        samples: []
      },
      {
        index: '2',
        itemName: 'item2',
        standardCode: 'sdfsa',
        requirement: 'asdfasfdas',
        samples: []
      },
      {
        index: '3',
        itemName: 'Seam2',
        standardCode: 'sdfsa',
        requirement: 'asdfasfdas',
        samples: []
      },
      {
        index: '4',
        itemName: 'Seam1',
        standardCode: 'sdfsa',
        requirement: 'asdfasfdas',
        samples: []
      },
      {index: '5', itemName: 'item5', standardCode: 'sdfsa', requirement: 'asdfasfdas', samples: []}
    ]
  },
    {
      name: 'Chemistry', items: [
        {
          index: '1',
          itemName: 'item1',
          standardCode: 'sdfsa',
          requirement: 'asdfasfdas',
          samples: []
        },
        {
          index: '2',
          itemName: 'item2',
          standardCode: 'sdfsa',
          requirement: 'asdfasfdas',
          samples: []
        },
        {
          index: '3',
          itemName: 'item3',
          standardCode: 'sdfsa',
          requirement: 'asdfasfdas',
          samples: []
        },
        {
          index: '4',
          itemName: 'item4',
          standardCode: 'sdfsa',
          requirement: 'asdfasfdas',
          samples: []
        },
      ]
    }]
}, {
  name: 'menu2',
  items: [
    {index: '1', itemName: 'item1', standardCode: 'sdfsa', requirement: 'asdfasfdas', samples: []},
    {index: '2', itemName: 'item2', standardCode: 'sdfsa', requirement: 'asdfasfdas', samples: []},
    {index: '3', itemName: 'item3', standardCode: 'sdfsa', requirement: 'asdfasfdas', samples: []},
    {index: '4', itemName: 'item4', standardCode: 'sdfsa', requirement: 'asdfasfdas', samples: []},
    {index: '5', itemName: 'item5', standardCode: 'sdfsa', requirement: 'asdfasfdas', samples: []}
  ]
}])
const newItemName = ref('')
const newItemstandardCode = ref('')
const newItem=computed(()=>{
  return newItemName.value ? {itemName: newItemName.value,standardCode:newItemstandardCode.value} :null
})
const newItemOptions = ref([
  {itemName: 'Seam', standardCodes: ['standard1', 'standard2']},
  {itemName: 'item2', standardCodes: ['standard3', 'standard4']},
])
const newItemOption =computed(()=>{
  return newItemOptions.value.find(item=>item.itemName===newItemName.value)|| {}
})
//定时器
let timer=null
// //项目默认值
// let itemDefalutObj={copies:1,samples:[]}
//买家选项
const buyerOptions = ref([
  {name: 'Mango'},
  {name: 'Crazy Line'},
  {name:'JAKO'},
  {name:'Tchibo'},
  {name:'Primark'},
  {name:'KiK'},
  {name:'Pepco'},
  {name:'NEXT'},
  {name:'Woolworth'},
  {name:'LTAG'},
  {name:'LPP'},
  {name:'Focus'},
])

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
async function getBuyerOptions(){
  let options=await axios.get('http://localhost:5102/query/buyer')
  // console.log('buyerList',options.data.buyerList)
  buyerOptions.value=options.data.buyerList.map(buyer=>{
    buyer.name=buyer.buyerName
    return buyer
  })
  // console.log('buyerOptions',buyerOptions.value)
}
//项目模糊查询
// function itemFuzzyQuery(){
//   //如果分组
//   if(menus.value.groups){
//
//   }
//   //不分组
//   menusBeDisplayed.value=menuOptions.value.filter(menu=>menu.name.includes(itemFuzzyQueryParameters.itemName)
//     || menu.items.some(item=>item.itemName.includes(itemFuzzyQueryParameters.itemName))
//     || menu.items.some(item=>item.standardCode.includes(itemFuzzyQueryParameters.standardCode))
//     || menu.items.some(item=>item.requirement.includes(itemFuzzyQueryParameters.group))
//   )
// }

//重置
function itemFuzzyQueryReset(){
  itemFuzzyQueryParameters.itemName=''
  itemFuzzyQueryParameters.standardCode=''
  itemFuzzyQueryParameters.group=''
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
async function allCheck(){
  let reportCorrect=reportNoCheck()
  let form1OtherCorrect
  try {
    form1OtherCorrect=await form1Ref.value.validate()
  }catch{
    form1OtherCorrect=false
  }
  return reportCorrect&&form1OtherCorrect
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
