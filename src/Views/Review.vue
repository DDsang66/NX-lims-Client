<template>
  <div ref="allDom" style="height: 100%;width: 100%;overflow:auto">
    <h3>{{ buyerName ? buyerName : 'BuyerName' }}</h3>
    <div class="column-flex-container maxDiv" style="align-items: stretch">
      <div class="line-flex-container firstLine" style="align-items: stretch;border: 0">
        <div style="width: 50%;" class="thisBlock">
          <el-form inline>
            <el-form-item>
              <template #label>
                <label>Report No.</label>
              </template>
              <el-input v-model="reportNums.data1" style="width: 50px;" :size="size"
                        disabled></el-input>
              <el-select v-model="reportNums.data2"
                         filterable
                         :size="size"
                         style="width: 80px;">
                <el-option value="405.">405.</el-option>
                <el-option value="441.">441.</el-option>
              </el-select>
              <el-select v-model="reportNums.data3"
                         :size="size"
                         filterable
                         style="width: 75px;">
                <el-option :value="twoDigitYear+'.'"></el-option>
                <el-option :value="twoDigitYear-1+'.'"></el-option>
              </el-select>
              <el-input v-model="reportNums.data4" style="width: 80px;" :size="size"
                        @keydown="data4Keydown" @blur="data4Blur"></el-input>
              <el-input v-model="reportNums.data5" style="width: 60px;" :size="size"></el-input>
            </el-form-item>
            <el-form-item>
              <template #label>
                <label>Buyer</label>
              </template>
              <el-select style="width: 100px" :size="size" v-model="buyerName"
                         filterable></el-select>
            </el-form-item>
            <el-form-item>
              <template #label>
                <label>Menus</label>
              </template>
              <el-select style="width: 300px" v-model="menus"
                         :size="size"
                         filterable
                         allow-create
                         multiple
                         default-first-option
                         value-key="name">
                <el-option v-for="menu in menuOptions" :key="menu.name" :value="menu"
                           :label="menu.name">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div style="width: 50%" class="thisBlock">
          <el-form inline>
            <el-form-item label="Item">
              <el-select style="width: 300px" :size="size" v-model="newItem" filterable
                         value-key="itemName">
                <el-option v-for="optionItem  in newItems"
                           :key="optionItem.itemName"
                           :value="optionItem"
                           :label="optionItem.itemName">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Standard Code">
              <el-select style="width: 300px" :size="size" filterable
                         v-model="newItem.standardCode">
                <el-option v-for="standardCode in newItem.standardCodes" :key="standardCode"
                           :value="standardCode">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addAdditionalItem">+</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="firstList">
        <div class="helpSampleContainer">
          <samples-select v-model="helpSamples" style="width: 350px" :max-show-number="3" collapse-tags></samples-select>
          <el-button :size="size" >+</el-button>
        </div>
        <el-tabs type="border-card">
          <el-tab-pane v-for="menu in menus" :key="menu.name" :label="menu.name">
            <div class="menuFirstListContainer">
              <div v-if="menu.groups">
                <div v-for="group in menu.groups" :key="group.name">
                  <h6 class="">{{ group.name }}</h6>
                  <el-table
                    border
                    :data="group.items"
                    class="removeTableGaps "
                    :row-class-name="(data)=>{return data.row.isTogether ?'togetherTr' : ''}"
                    :cell-class-name="(data)=>{return data.row.isTogether ?'togetherTr' : ''}"
                    @cell-mouse-enter="togetherChoose"
                    @cell-mouse-leave="togetherChoose"
                    @row-click="(row,column,event)=>{if(event.ctrlKey){row.isTogether=!row.isTogether}}"
                  >
                    <el-table-column label="Index" prop="index" width="70px">
                    </el-table-column>
                    <el-table-column label="TestItem" prop="itemName" width="200px">
                    </el-table-column>
                    <el-table-column label="Standard Code" prop="standardCode">
                    </el-table-column>
                    <el-table-column label="Requirement" prop="requirement">
                    </el-table-column>
                    <el-table-column label="Samples">
                      <template #default="scope">
                        <el-input v-model="scope.row.samples"
                                  @input="togetherChange(scope.row.isTogether,$event)"></el-input>
                      </template>
                    </el-table-column>
                    <el-table-column label="Copies" width="90px">
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
              <div v-else>
                <el-table
                  border
                  :data="menu.items"
                  class="removeTableGaps "
                  :row-class-name="(data)=>{return data.row.isTogether ?'togetherTr' : ''}"
                  :cell-class-name="(data)=>{return data.row.isTogether ?'togetherTr' : ''}"
                  @cell-mouse-enter="togetherChoose"
                  @cell-mouse-leave="togetherChoose"
                  @row-click="(row,column,event)=>{if(event.ctrlKey){row.isTogether=!row.isTogether}}"
                >
                  <el-table-column label="Index" prop="index" width="70px">
                  </el-table-column>
                  <el-table-column label="TestItem" prop="itemName" width="200px">
                  </el-table-column>
                  <el-table-column label="Standard Code" prop="standardCode">
                  </el-table-column>
                  <el-table-column label="Requirement" prop="requirement">
                  </el-table-column>
                  <el-table-column label="Samples">
                    <template #default="scope">
                      <el-input v-model="scope.row.samples" :size="size"
                                @input="togetherChange(scope.row.isTogether,$event)"></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column label="Copies" width="90px">
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
                  <el-table-column label="delete" v-if="menu.name==='AdditionalMenu'" width="75px">
                    <template #default="scope">
                      <el-button type="danger" @click="deleteAdditionalItem(scope.$index)">-</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>


      <div class="params thisBlock">
        <el-collapse v-model="activeName2" expand-icon-position="left">
          <el-collapse-item title="Params" name="1">
            <template #title="{ isActive }">
              <div :class="['collapse-title', { 'is-active': isActive }]">
                Info
                <el-icon class="header-icon">
                </el-icon>
              </div>
            </template>
            <div class="params column-flex-container">
              <div>
                <el-text>bound to the order</el-text>
                <div class="line-left-flex-container">
                  <div class="line-flex-container" v-for="param in orderParams" :key="param.name">
                    <el-text>{{ param.name }}</el-text>
                    <el-input v-model="param.value" v-if="param.type==='input'"
                              style="width: 100px"></el-input>
                    <el-select v-model="param.value" v-else-if="param.type==='select'"
                               style="width: 100px">
                      <el-option v-for="option in param.options" :key="option" :value="option">
                      </el-option>
                    </el-select>
                    <el-select v-model="param.value" v-else multiple style="width: 100px">
                      <el-option v-for="option in param.options" :key="option" :value="option">
                      </el-option>
                    </el-select>
                  </div>
                </div>
              </div>
              <div>
                <el-text>bound to the sample</el-text>
                <div class="line-left-flex-container">
                  <div class="line-flex-container" v-for="param in orderParams" :key="param.name">
                    <el-text>{{ param.name }}</el-text>
                    <el-input v-model="param.value" v-if="param.type==='input'"
                              style="width: 100px"></el-input>
                    <el-select v-model="param.value" v-else-if="param.type==='select'"
                               style="width: 100px">
                      <el-option v-for="option in param.options" :key="option" :value="option">
                      </el-option>
                    </el-select>
                    <el-select v-model="param.value" v-else multiple style="width: 100px">
                      <el-option v-for="option in param.options" :key="option" :value="option">
                      </el-option>
                    </el-select>
                  </div>
                </div>
              </div>

            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <div class="checkList thisBlock" style="height: 100px">
      </div>
    </div>
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, reactive, ref} from 'vue'
import SamplesSelect from "@/components/self made UI/SamplesSelect.vue";

//辅助选择样品的值
const helpSamples=ref(['A','B','C','D'])

//整个组件
const allDom=ref(null)
const size = 'default'
//ctrl状态
var ctrlDown = false
// //鼠标左健
// var mouseLeftDown = false
//维护鼠标相对于视口高度
var mouseClientY = 0
//两位年份
var twoDigitYear = ref(new Date().getFullYear() % 100)
const reportNums = reactive({
  data1: '87.',
  data2: "405.",
  data3: twoDigitYear.value + '.',
  data4: '',
  data5: '.01',
})
const buyerName = ref('')
const menuOptions = ref([{
  name: 'menu1',
  groups: [{
    name: 'Physics', items: [
      {
        index: '1',
        itemName: 'item1',
        standardCode: 'sdfsa',
        requirement: 'asdfasfdas',
        samples: ''
      },
      {
        index: '2',
        itemName: 'item2',
        standardCode: 'sdfsa',
        requirement: 'asdfasfdas',
        samples: ''
      },
      {
        index: '3',
        itemName: 'item3',
        standardCode: 'sdfsa',
        requirement: 'asdfasfdas',
        samples: ''
      },
      {
        index: '4',
        itemName: 'item4',
        standardCode: 'sdfsa',
        requirement: 'asdfasfdas',
        samples: ''
      },
      {index: '5', itemName: 'item5', standardCode: 'sdfsa', requirement: 'asdfasfdas', samples: ''}
    ]
  },
    {
      name: 'Chemistry', items: [
        {
          index: '1',
          itemName: 'item1',
          standardCode: 'sdfsa',
          requirement: 'asdfasfdas',
          samples: ''
        },
        {
          index: '2',
          itemName: 'item2',
          standardCode: 'sdfsa',
          requirement: 'asdfasfdas',
          samples: ''
        },
        {
          index: '3',
          itemName: 'item3',
          standardCode: 'sdfsa',
          requirement: 'asdfasfdas',
          samples: ''
        },
        {
          index: '4',
          itemName: 'item4',
          standardCode: 'sdfsa',
          requirement: 'asdfasfdas',
          samples: ''
        },
      ]
    }]
}, {
  name: 'menu2',
  items: [
    {index: '1', itemName: 'item1', standardCode: 'sdfsa', requirement: 'asdfasfdas', samples: ''},
    {index: '2', itemName: 'item2', standardCode: 'sdfsa', requirement: 'asdfasfdas', samples: ''},
    {index: '3', itemName: 'item3', standardCode: 'sdfsa', requirement: 'asdfasfdas', samples: ''},
    {index: '4', itemName: 'item4', standardCode: 'sdfsa', requirement: 'asdfasfdas', samples: ''},
    {index: '5', itemName: 'item5', standardCode: 'sdfsa', requirement: 'asdfasfdas', samples: ''}
  ]
}])
//
const menus = ref([])
const orderParams = ref([
  {name: 'param1', type: 'input', value: '', options: []},
  {name: 'param2', type: 'select', value: '', options: ['option1', 'option2']},
  {name: 'param3', type: 'mulSelect', value: '', options: ['option1', 'option2']},
])


const newItem = ref({itemName: '', standardCode: ''})
const newItems = ref([
  {itemName: 'item1', standardCodes: ['standard1', 'standard2']},
  {itemName: 'item2', standardCodes: ['standard1', 'standard2']},
])

//定时器
var timer=null

//项目默认值
var itemDefalutObj={copies:1}


//失去焦点，判断四位数
function data4Blur() {
  //先判断为空
  if (!reportNums.data4)
    return
  //先判断数字
  if (!/^\d+$/.test(reportNums.data4)) {
    reportNums.data4 = ''
    alert('Please enter a pure number in the fourth item of the report number.')
  } else {
    //先转为数字，再转回字符串。以此去掉0
    reportNums.data4 = String(Number(reportNums.data4))
    //不到四位则补零
    if (reportNums.data4.length < 4) {
      reportNums.data4 = String(reportNums.data4).padStart(4, '0')
    }
  }
}

//data4中按下enter
function data4Keydown(e) {
  // 检测是否按下了 Enter 键
  if (e.key === 'Enter') {
    // 阻止默认行为（换行）
    e.preventDefault();
    // 让当前元素失去焦点，触发 @blur
    e.target.blur();
  }
}

//添加额外项目
function addAdditionalItem() {
  //两者不为空
  if (!newItem.value.standardCode || !newItem.value.itemName)
    return
  //如果没有，先创建Menu
  if (!menus.value.some(menu => menu.name === 'AdditionalMenu'))
    menus.value.push({name: 'AdditionalMenu', items: []})
  menus.value.map(menu => {
    if (menu.name === 'AdditionalMenu') {
      if(!menu.items.some(item => item.itemName === newItem.value.itemName&&item.standardCode === newItem.value.standardCode))
      menu.items.push({...newItem.value, index: menu.items.length + 1,...itemDefalutObj})
    }
  })
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
      if (!menu.groups) {
        for (const item of menu.items) {
          if (item.isTogether) {
            item.samples = value
          }
        }
      } else {
        for (const group of menu.groups) {
          for (const item of group.items) {
            if (item.isTogether) {
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
      menu.items=menu.items.map(item => ({...item,...itemDefalutObj}))
    } else {
      for (const group of menu.groups) {
      group.items=group.items.map(item => ({...item,...itemDefalutObj}))
      }
    }
  }
  console.log(menuOptions.value)
}


var valid = true;
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

//ctrl阻止默认行为
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

// function globalMouseUp(e) {
//   if (e.button === 0) {
//     mouseLeftDown = false
//   }
// }

function globalMouseDown(e) {
  // if (e.button === 0) {
  //   mouseLeftDown = true
  // }
  ctrlPreventDefault(e)
}

function globalMouseMove(e) {
  ctrlPreventDefault(e)
  throttle(() => {
    mouseClientY = e.clientY
  }, 50)
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown);
  window.addEventListener('mousedown', globalMouseDown);
  window.addEventListener('mousemove', globalMouseMove);
  // window.addEventListener('mouseup', globalMouseUp);
  window.addEventListener('keyup', handleGlobalKeyUp);
  //自动滚动滚动条
  timer =setInterval(() => {
    // console.log(ctrlDown, mouseLeftDown, mouseClientY)
    if (ctrlDown) {
      if (window.innerHeight - mouseClientY < window.innerHeight * 0.05) {
        allDom.value.scrollTop += 10
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
</script>

<style lang="scss" scoped>
@mixin thisBlockBorder {
  border: 1px solid #cae2e8;
}

.thisBlock {
  @include thisBlockBorder;
  padding: 5px;
}

.firstLine > div {
  @include thisBlockBorder;
  display: flex;
  align-items: center;
  justify-content: center;
}

.firstList h6 {
  margin-top: 10px !important;
  margin-bottom: 10px !important;
}

/*.maxDiv .thisBlock{
  @include thisBlockBorder;
  padding: 0 5px;
}*/
:deep(label) {
  font-size: 18px;
}

/*去除表格标题和内容之间的空隙*/
.removeTableGaps :deep(table) {
  margin-bottom: 0 !important;
}

:deep(.togetherTr) {
  background-color: #6ced6c !important;
}

.no-select {
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* 标准语法 */
}

/*折叠面板*/
.is-active {
  color: var(--el-color-primary);
}

.collapse-title {
  font-size: 20px;
  font-weight: bold;
}

.params > div {
  border: 1px solid #cae2e8;
  padding: 5px;
}

.params {
  align-items: stretch;
  padding: 5px;
}

/*第一个List头部*/
.firstListHeader {
  font-size: 20px;
  font-weight: bold;
  color: black;
  cursor: pointer;
}

/*快捷添加样品，容器*/
.helpSampleContainer{
  @include line-right-flex-container;
  border: 1px solid var(--el-border-color);
  border-bottom: none;
  padding: 5px;
}
</style>
