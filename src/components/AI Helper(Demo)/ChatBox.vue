<template>
  <section class="chat-wrapper">
    <!-- 消息列表 -->
    <div ref="msgBox" class="messages">
      <div v-for="(m, i) in messages"
           :key="i"
           :class="['msg', m.role]"
           v-text="m.text" />
      <div v-if="thinking" class="msg bot thinking">
        <span>●●●</span>
      </div>
    </div>

    <!-- 输入区 -->
    <form @submit.prevent="send">
      <input v-model="input"
             placeholder="请输入您的问题..."
             :disabled="thinking"
             />
      <button type="submit" :disabled="thinking || !input.trim()" style="background-color: #3364d5">发送</button>
      <input ref="fileRef"
             type="file"
             accept="image/*,.doc,.docx"
             :disabled="thinking" />
      <button type="button" :disabled="thinking" @click="uploadFile" style="background-color: #3364d5">
        上传
      </button>
    </form>

    <!-- 错误提示 -->
    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<script setup>
  import { nextTick, ref } from 'vue'
  import axios from 'axios'

  const input = ref('')
  const messages = ref([])          // { role:'user'|'bot', text:'...' }
  const thinking = ref(false)
  const error = ref('')
  const msgBox = ref(null)
  const fileRef = ref(null)

  /* 滚动到底部 */
  const scrollToBottom = () =>
    nextTick(() => (msgBox.value.scrollTop = msgBox.value.scrollHeight))

  /* 发送消息 */
  const send = async () => {
    const q = input.value.trim()
    if (!q) return
    messages.value.push({ role: 'user', text: q })
    input.value = ''
    error.value = ''
    scrollToBottom()

    thinking.value = true
    try {
      const { data } = await axios.post('http://localhost:5052/api/chat/talk', { message: q })
      // 假设后端直接返回纯文本或 JSON 的 answer 字段
      const answer = typeof data === 'string' ? data : data.answer || JSON.stringify(data)
      messages.value.push({ role: 'bot', text: answer })
    } catch (e) {
      error.value = e.response?.data?.error || e.message || '请求失败'
    } finally {
      thinking.value = false
      scrollToBottom()
    }
  }

  const uploadFile = async () => {
    const file = fileRef.value?.files?.[0]
    if (!file) return

    thinking.value = true
    error.value = ''

    try {
      // 用 FormData 一次性把文件和文字一起发
      const form = new FormData()
      form.append('file', file)
      form.append('message', input.value || '请解析这份文件') // 可选文字提示

      const { data } = await axios.post(
        'http://localhost:5052/api/chat/upload',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      messages.value.push({ role: 'bot', text: data.answer })
    } catch (e) {
      error.value = e.response?.data?.error || e.message || '上传失败'
    } finally {
      thinking.value = false
      scrollToBottom()
      fileRef.value.value = ''   // 清空选择
    }
  }

</script>

<style scoped>
  .sigma_btn-custom::before {
    background-color: #18086a;
  }

  .chat-wrapper {
    max-width: 600px;
    margin: 40px auto;
    display: flex;
    flex-direction: column;
    height: 70vh;
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    overflow: hidden;
  }

  .messages {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
    background: #fafafa;
  }

  .msg {
    margin: 6px 0;
    padding: 8px 12px;
    border-radius: 6px;
    max-width: 75%;
    word-break: break-word;
    line-height: 1.4;
  }

  .user {
    background: #e3f2fd;
    align-self: flex-end;
    margin-left: auto;
  }

  .bot {
    background: #f1f1f1;
  }

  .thinking span {
    animation: blink 1s infinite;
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }

  form {
    display: flex;
    border-top: 1px solid #e4e4e4;
  }

  input {
    flex: 1;
    padding: 10px;
    border: none;
    outline: none;
    font-size: 14px;
  }

  button {
    padding: 0 16px;
    border: none;
    background: #1976d2;
    color: #fff;
    cursor: pointer;
  }

    button:disabled {
      background: #90caf9;
      cursor: not-allowed;
    }

  .error {
    color: #e53935;
    margin: 6px 12px;
    font-size: 13px;
  }
</style>
