<template>
  <div class="containerExcel">
    <!-- 左侧 80% 区域 -->
    <div class="left-panel">
      <!-- 原来的表单区域 -->
      <div class="search-form">
        <h2>Work Sheet</h2>
        <el-form inline>
          <el-form-item>
            <template #label>
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
                       filterable placeholder="">
              <!--                自定义头部-->
              <el-option value="Phy" label="Physics"></el-option>
              <el-option value="Wet">Wet</el-option>
              <!--              <el-option value="Fiber">Fiber</el-option>-->
              <!--              <el-option value="Flam">Flam</el-option>-->
            </el-select>
            <el-button @click="loadDocument" style="margin-left: 10px" :disabled="loading">
              {{ loading ? '加载中...' : '获取 Excel' }}
            </el-button>
            <!--            <el-button @click="closeEditor">-->
            <!--              关闭-->
            <!--            </el-button>-->
          </el-form-item>
        </el-form>
      </div>

      <!-- 编辑器区域 -->
      <div class="editor-container">
        <!-- 默认显示的 Work Area -->
        <div v-if="!onlyofficeEditor" class="work-areaExcel">
          <h2>Work Area</h2>
        </div>
        <!-- OnlyOffice 编辑器容器 -->
        <div id="onlyoffice-editor" v-show="onlyofficeEditor"></div>
      </div>
    </div>

    <!-- 右侧 20% 区域 -->
    <div class="right-panel">
      <!-- 用户列表区域 (15%) -->
      <div class="user-list">
        <h3 class="user-list-title">Collaborators</h3>
        <div class="user-avatars">
          <div v-for="(user, index) in collaborators" :key="index" class="user-avatar">
            <el-avatar :src="user.avatar" :size="40" :title="user.name"></el-avatar>
          </div>
          <!-- 添加更多用户的按钮 -->
          <div class="add-user" @click="addUser">
            <el-icon :size="20"><Plus /></el-icon>
          </div>
        </div>
        <div class="editing-status">
          <small>{{ editingUser }} is editing.</small>
        </div>
      </div>

      <!-- 功能切换区域 (剩余区域) -->
      <div class="function-tabs">
        <el-tabs v-model="activeTab" type="border-card" class="full-height-tabs">
          <el-tab-pane label="Edit History" name="history">
            <div class="tab-content">
              <div class="history-tree">
                <div v-for="(item, index) in editHistory" :key="index" class="history-item">
                  <div class="history-dot"></div>
                  <div class="history-content">
                    <div class="history-user">{{ item.user }}</div>
                    <div class="history-time">{{ item.time }}</div>
                    <div class="history-action">{{ item.action }}</div>
                  </div>
                  <div v-if="index < editHistory.length - 1" class="history-line"></div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="Chat" name="chat">
            <div class="tab-content">
              <div class="chat-container">
                <div class="chat-messages">
                  <div v-for="(msg, index) in chatMessages" :key="index"
                       :class="['chat-message', msg.isCurrentUser ? 'message-right' : 'message-left']">
                    <div class="message-avatar">
                      <el-avatar :src="msg.avatar" :size="30"></el-avatar>
                    </div>
                    <div class="message-content">
                      <div class="message-user">{{ msg.user }}</div>
                      <div class="message-text">{{ msg.text }}</div>
                      <div class="message-time">{{ msg.time }}</div>
                    </div>
                  </div>
                </div>
                <div class="chat-input">
                  <el-input v-model="newMessage"
                            placeholder="输入消息..."
                            @keyup.enter="sendMessage"></el-input>
                  <el-button type="primary" @click="sendMessage">发送</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="Comments" name="comments">
            <div class="tab-content">
              <div class="comments-container">
                <div class="comments-list">
                  <div v-for="(comment, index) in comments" :key="index" class="comment-item">
                    <div class="comment-avatar">
                      <el-avatar :src="comment.avatar" :size="30"></el-avatar>
                    </div>
                    <div class="comment-content">
                      <div class="comment-header">
                        <span class="comment-user">{{ comment.user }}</span>
                        <span class="comment-time">{{ comment.time }}</span>
                      </div>
                      <div class="comment-text">{{ comment.text }}</div>
                      <div class="comment-actions">
                        <el-button type="text" size="small">回复</el-button>
                        <el-button type="text" size="small">点赞</el-button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="comment-input">
                  <el-input v-model="newComment"
                            type="textarea"
                            :rows="3"
                            placeholder="添加评论..."></el-input>
                  <div class="comment-actions">
                    <el-button type="primary" @click="addComment">发布</el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, reactive, inject, ref, onBeforeUnmount, onMounted } from 'vue'
  import { Plus } from '@element-plus/icons-vue'
  import '@/utils/loadOnlyOffice.js'

  const userStore = inject('userAuthStore')
  const loading = ref(false)
  const request = inject('request')
  var twoDigitYear = ref(new Date().getFullYear() % 100)
  const reportNums = reactive({
    data1: '87.',
    data2: "405.",
    data3: twoDigitYear.value + '.',
    data4: '',
    data5: '.01',
  })
  const buyer = ref('')
  const reportNum = computed(() => reportNums.data1 + reportNums.data2 + reportNums.data3 + reportNums.data4 + reportNums.data5)
  const group = ref('Phy')
  //编辑器
  const onlyofficeEditor = ref(null)

  // 协作用户列表 - 模拟数据
  const collaborators = ref([
    { name: 'User 1', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' },
    { name: 'User 2', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' },
  ])

  // 当前正在编辑的用户
  const editingUser = ref('User 1')

  // 添加用户的方法 - 留作后续实现
  const addUser = () => {
    console.log('添加用户功能待实现')
  }

  // 当前激活的标签页
  const activeTab = ref('history')

  // 编辑历史数据 - 模拟数据
  const editHistory = ref([
    { user: 'User 1', time: '2023-05-15 14:30', action: 'changed cell A1' },
    { user: 'User 2', time: '2023-05-15 14:25', action: 'added a new sheet' },
    { user: 'User 1', time: '2023-05-15 14:20', action: 'changed cell B2' },
    { user: 'User 3', time: '2023-05-15 14:15', action: 'created and checked this file' },
  ])

  // 聊天消息数据 - 模拟数据
  const chatMessages = ref([
    { user: 'User 1', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', text: 'Hello everyone, does this form need to be modified?', time: '14:30', isCurrentUser: false },
    { user: 'User 2', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', text: 'Yes, there are a few places that need adjustment.', time: '14:32', isCurrentUser: false },
    { user: 'Me', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', text: 'Okay, I will take care of it.', time: '14:35', isCurrentUser: true },
  ])

  // 新消息输入
  const newMessage = ref('')

  // 发送消息
  const sendMessage = () => {
    if (newMessage.value.trim() === '') return

    chatMessages.value.push({
      user: '我',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      text: newMessage.value,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    })

    newMessage.value = ''
  }

  // 评论数据 - 模拟数据
  const comments = ref([
    { user: 'User 1', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', text: 'The standard for washing shrinkage needs to be adjusted', time: '2023-05-15 14:30' },
    { user: 'User 2', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', text: 'Agreed, but some cells need to be merged.', time: '2023-05-15 14:35' },
  ])

  // 新评论输入
  const newComment = ref('')

  // 添加评论
  const addComment = () => {
    if (newComment.value.trim() === '') return

    comments.value.push({
      user: 'Me',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      text: newComment.value,
      time: new Date().toLocaleString()
    })

    newComment.value = ''
  }

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
  //按下enter
  function data4Keydown(e) {
    // 检测是否按下了 Enter 键
    if (e.key === 'Enter') {
      // 阻止默认行为（换行）
      e.preventDefault();
      // 让当前元素失去焦点，触发 @blur
      e.target.blur();
    }
  }

  let config = {
    style: { height: '100vh' },
    document: {
      // title:res.data.fileName ,
      // title:FILE_NAME,
      url: FILE_URL,
      fileType: 'xlsx',
      // key:'1'
    },
    documentType: 'cell', // Excel 必须是 'cell'
    editorConfig: {
      mode: 'edit', // 或 'edit'
      lang: 'zh-CN',
      user: { name: userStore.user }, // 必填！否则弹协作窗口
      customization: {
        chat: false,
        comments: false,
        feedback: false,
        close: {
          visible: true,
          text: "Close file",
        }
      }
    },
    events: {
      onRequestClose,
    },
    // 注意：没有 token 字段！因为 JWT 已关闭
  }

  // 公开的 Excel 文件
  // const FILE_URL = 'https://test234234535.oss-cn-hangzhou.aliyuncs.com/pepco_sheet.xlsx'
  const FILE_URL = 'http://localhost:5051/pepco_sheet.xlsx'
  const FILE_NAME = 'pepco_sheet.xlsx'

  async function loadDocument() {
    if (loading.value) return
    loading.value = true
    let res
    try {
      // 发起请求
      res = await request.get('/worksheet/excelurl', {
        params: {
          repo: reportNum.value,
          group: group.value,
          buyer: buyer.value
        }
      })

      // --- 修改开始 ---
      // 1. 安全性检查：确保 res 存在
      if (!res || !res.data) {
        throw new Error('返回数据格式不正确或为空')
      }

      // 2. 根据你提供的 JSON 结构，数据在 value 字段中
      // 假设你的 request 封装直接返回了整个 JSON 对象
      const fileInfo = res.data.value

      // 3. 检查 value 字段是否存在
      if (!fileInfo) {
        throw new Error('未获取到文件信息 (value)')
      }

      // 4. 赋值，使用可选链 ?. 防止字段缺失报错
      config.document.title = fileInfo.fileName
      config.document.url = fileInfo.downloadUrl
      // --- 修改结束 ---

      config.document.key = Math.random().toString()

      // 初始化 OnlyOffice 编辑器逻辑保持不变
      if (onlyofficeEditor.value) {
        onlyofficeEditor.value.destroyEditor()
        onlyofficeEditor.value = null
      }

      onlyofficeEditor.value = new DocsAPI.DocEditor('onlyoffice-editor', config)
      onlyofficeEditor.value.refreshFile()

    } catch (error) {
      console.error('加载文档出错:', error)
      alert(error.message || '文档加载失败，请检查控制台')
    } finally {
      loading.value = false
    }
  }

  //关闭编辑器
  function onRequestClose() {
    //由另一个标签页打开的情况
    if (window.opener) {
      window.close();
      return;
    }
    onlyofficeEditor.value.destroyEditor()
  }

  onBeforeUnmount(() => {
    if (onlyofficeEditor.value) {
      onlyofficeEditor.value.destroyEditor() // 销毁编辑器
      onlyofficeEditor.value = null
    }
  })
</script>

<style>
  /* 全局样式，确保 html 和 body 占满整个视口 */
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  #app {
    height: 100%;
    width: 100%;
  }
</style>

<style scoped>
  .containerExcel {
    display: flex;
    height: 100%;
    width: 100%;
    padding: 10px; /* 添加内边距，使内容不贴边 */
    box-sizing: border-box; /* 确保内边距不会增加总宽度 */
    background-color: #f0f2f5; /* 添加浅灰色背景，使面板更突出 */
  }

  .left-panel {
    width: 80%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff; /* 添加白色背景 */
    border-radius: 8px; /* 添加圆角 */
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 添加阴影 */
    overflow: hidden; /* 防止内容溢出圆角 */
  }

  .right-panel {
    width: 20%;
    height: 100%;
    margin-left: 10px; /* 添加左边距，使左右面板有间隔 */
    background-color: #fff; /* 添加白色背景 */
    border-radius: 8px; /* 添加圆角 */
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 添加阴影 */
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .search-form {
    padding: 20px;
    background-color: #fff;
    border-bottom: 1px solid #dcdfe6;
  }

  .editor-container {
    flex: 1;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    color: #c0c4cc; /* Element UI 的辅助文本颜色，非常浅的灰色 */
  }

  .work-areaExcel {
    width: 100%;
    height: 100%;
    background-color: #f5f7fa;
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgydjJIMUMxeiIgZmlsbD0iI2UwZTBlMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+'); /* 添加一个微妙的网格背景，让它看起来更像工作区 */
    display: flex;
    align-items: center;
    justify-content: center;
    color: #c0c4cc; /* Element UI 的辅助文本颜色，非常浅的灰色 */
    font-size: 24px;
  }

  #onlyoffice-editor {
    width: 100%;
    height: 100%;
  }

  /* 用户列表样式 */
  .user-list {
    height: 15%;
    border-bottom: 1px solid #ebeef5;
    padding: 10px 0;
    display: flex;
    flex-direction: column;
  }

  .user-list-title {
    font-size: 14px;
    color: #606266;
    margin: 0 0 10px 0;
    padding-left: 10px;
  }

  .user-avatars {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 0 10px;
    overflow-y: auto;
    max-height: calc(100% - 30px);
  }

  .user-avatar {
    display: inline-block;
  }

  .add-user {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px dashed #c0c4cc;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #909399;
    transition: all 0.3s;
  }

    .add-user:hover {
      border-color: #409eff;
      color: #409eff;
    }

  .editing-status {
    padding: 5px 10px;
    color: #909399;
    font-size: 12px;
  }

  /* 功能切换区域样式 */
  .function-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-top: 10px;
  }

  .full-height-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

    .full-height-tabs :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .full-height-tabs :deep(.el-tab-pane) {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

  .tab-content {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* 编辑历史样式 */
  .history-tree {
    overflow-y: auto;
    flex: 1;
    padding: 10px;
  }

  .history-item {
    position: relative;
    padding-left: 20px;
    margin-bottom: 20px;
  }

  .history-dot {
    position: absolute;
    left: 0;
    top: 5px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #409eff;
  }

  .history-line {
    position: absolute;
    left: 4px;
    top: 15px;
    width: 2px;
    height: calc(100% - 5px);
    background-color: #e4e7ed;
  }

  .history-content {
    background-color: #f5f7fa;
    padding: 8px;
    border-radius: 4px;
  }

  .history-user {
    font-weight: bold;
    color: #303133;
  }

  .history-time {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .history-action {
    font-size: 14px;
    color: #606266;
    margin-top: 4px;
  }

  /* 聊天界面样式 */
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }

  .chat-message {
    display: flex;
    margin-bottom: 15px;
  }

  .message-left {
    flex-direction: row;
  }

  .message-right {
    flex-direction: row-reverse;
  }

  .message-avatar {
    flex-shrink: 0;
  }

  .message-content {
    max-width: 70%;
    margin: 0 10px;
  }

  .message-user {
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
  }

  .message-text {
    background-color: #f5f7fa;
    padding: 8px 12px;
    border-radius: 4px;
    word-wrap: break-word;
  }

  .message-right .message-text {
    background-color: #ecf5ff;
  }

  .message-time {
    font-size: 10px;
    color: #c0c4cc;
    margin-top: 4px;
  }

  .chat-input {
    display: flex;
    padding: 10px;
    border-top: 1px solid #ebeef5;
  }

    .chat-input .el-input {
      margin-right: 10px;
    }

  /* 评论区样式 */
  .comments-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .comments-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }

  .comment-item {
    display: flex;
    margin-bottom: 15px;
  }

  .comment-avatar {
    flex-shrink: 0;
  }

  .comment-content {
    flex: 1;
    margin-left: 10px;
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .comment-user {
    font-weight: bold;
    color: #303133;
  }

  .comment-time {
    font-size: 12px;
    color: #909399;
  }

  .comment-text {
    font-size: 14px;
    color: #606266;
    margin-bottom: 4px;
  }

  .comment-actions {
    display: flex;
    justify-content: flex-end;
  }

  .comment-input {
    padding: 10px;
    border-top: 1px solid #ebeef5;
  }

  .comment-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
</style>




