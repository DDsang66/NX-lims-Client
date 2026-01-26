<template>
  <div>
    <h2>OnlyOffice Excel 预览</h2>
    <el-form inline>
      <el-form-item>
        <template #label>
<!--          粗体-->
          <div style="font-weight: bolder">Buyer</div>
        </template>
        <el-input style="width: 100px" v-model="buyer"></el-input>
      </el-form-item>
      <el-form-item>
        <template #label>
          <div style="font-weight: bolder">ReportNo.</div>
        </template>
        <el-input v-model="reportNums.data1" style="width: 50px;" :size="size" disabled></el-input>
        <el-select v-model="reportNums.data2"
                   filterable
                   :size="size"
                   style="width: 80px;" >
          <el-option value="405.">405.</el-option>
          <el-option value="441.">441.</el-option>
        </el-select>
        <el-select v-model="reportNums.data3"
                   :size="size"
                   filterable
                   style="width: 75px;" >
          <el-option :value="twoDigitYear+'.'" ></el-option>
          <el-option :value="twoDigitYear-1+'.'"></el-option>
        </el-select>
        <el-input v-model="reportNums.data4" style="width: 80px;" :size="size" @keydown="data4Keydown" @blur="data4Blur"></el-input>
        <el-input v-model="reportNums.data5" style="width: 60px;" :size="size"></el-input>
      </el-form-item>
      <el-form-item>
        <template #label>
          <div style="font-weight: bolder">Group</div>
        </template>
        <el-select v-model="group"
                   style="width: 100px"
                   :size="size"
                   filterable placeholder="" >
          <!--                自定义头部-->
          <el-option value="Physics">Physics</el-option>
          <el-option value="Wet">Wet</el-option>
          <el-option value="Fiber">Fiber</el-option>
          <el-option value="Flam">Flam</el-option>
        </el-select>
        <el-button @click="loadDocument" style="margin-left: 10px" :disabled="loading">
          {{ loading ? '加载中...' : '获取 Excel' }}
        </el-button>
      </el-form-item>
    </el-form>
    <div style="width: 100%; height: 80vh; margin-top: 20px;">
      <div id="onlyoffice-editor"></div>
    </div>

  </div>
</template>

<script setup>
import {computed, reactive, inject,ref} from 'vue'

const loading = ref(false)
const request=inject('request')
var twoDigitYear=ref(new Date().getFullYear()%100)
const reportNums=reactive({
  data1:'87.',
  data2:"405.",
  data3:twoDigitYear.value+'.',
  data4:'',
  data5:'.01',
})
const buyer=ref('')
const reportNum=computed(()=>reportNums.data1+reportNums.data2+reportNums.data3+reportNums.data4+reportNums.data5)
const group=ref('Physics')

  //失去焦点，判断四位数
function data4Blur(){
  //先判断为空
  if(!reportNums.data4)
    return
  //先判断数字
  if(!/^\d+$/.test(reportNums.data4)){
    reportNums.data4=''
    alert('Please enter a pure number in the fourth item of the report number.')
  }else{
    //先转为数字，再转回字符串。以此去掉0
    reportNums.data4=String(Number(reportNums.data4))
    //不到四位则补零
    if(reportNums.data4.length<4){
      reportNums.data4=String(reportNums.data4).padStart(4,'0')
    }
  }
}
//按下enter
function data4Keydown(e){
  // 检测是否按下了 Enter 键
  if (e.key === 'Enter') {
    // 阻止默认行为（换行）
    e.preventDefault();
    // 让当前元素失去焦点，触发 @blur
    e.target.blur();
  }
}


// 公开的 Excel 文件
// const FILE_URL = 'https://test234234535.oss-cn-hangzhou.aliyuncs.com/pepco_sheet.xlsx'
// const FILE_URL = 'http://localhost:8087/pepco_sheet.xlsx'
// const FILE_NAME = 'pepco_sheet.xlsx'

async function loadDocument() {
  if (loading.value) return
  loading.value = true
  let res
  try{
    res=await request.get('/search/getExcelUrl',{
      params:{
        repo:reportNum.value,
        group:group.value,
        buyer:buyer.value
      }
    })
  } catch (error){
    console.error('获取url失败:', error)
    return alert('获取url失败')
  }
  try {
    // 动态加载 OnlyOffice SDK（关键！）
    await loadOnlyOfficeScript()

    // 销毁已有实例（避免重复初始化）
    if (window.onlyofficeEditor) {
      window.onlyofficeEditor.destroyEditor()
    }

    // 初始化编辑器
    window.onlyofficeEditor = new DocsAPI.DocEditor('onlyoffice-editor', {
      style: {height:'100vh'},
      document: {
        title:res.data.fileName ,
        url: res.data.downloadUrl,
        fileType: 'xlsx'
      },
      documentType: 'cell', // Excel 必须是 'cell'
      editorConfig: {
        mode: 'view', // 或 'edit'
        lang: 'zh-CN',
        user: { name: '演示用户' }, // 必填！否则弹协作窗口
        customization: {
          chat: false,
          comments: false,
          feedback: false
        }
      }
      // 注意：没有 token 字段！因为 JWT 已关闭
    })

  } catch (error) {
    console.error('OnlyOffice 加载失败:', error)
    alert('文档加载失败，请检查控制台')
  } finally {
    loading.value = false
  }
}

// 动态加载 OnlyOffice JS SDK
function loadOnlyOfficeScript() {
  return new Promise((resolve, reject) => {
    // 如果已加载，直接返回
    if (window.DocsAPI) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'http://localhost/web-apps/apps/api/documents/api.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load OnlyOffice SDK'))
    document.head.appendChild(script)
  })
}
</script>

<style scoped>

</style>
