<template>
  <div class="serial-monitor">
    <!-- 连接状态栏 -->
    <el-card class="status-bar" shadow="never">
      <div class="status-row">
        <el-tag :type="connTag.type" size="small" effect="plain">{{ connTag.text }}</el-tag>
        <span class="stat">已接收 {{ messages.length }} 条</span>
        <span class="stat">最近心跳：{{ lastHeartbeatText }}</span>
        <el-button size="small" @click="clearMessages">清空</el-button>
      </div>
    </el-card>

    <div class="monitor-body">
      <!-- 左侧：可监听的终端（勾选仅做前端过滤） -->
      <el-card class="terminal-panel" shadow="never">
        <template #header>
          <div class="panel-title">可监听终端</div>
        </template>
        <el-empty v-if="!availableTerminals.length"
                  description="最近 5 分钟暂无终端上报"
                  :image-size="60" />
        <div v-else class="terminal-list">
          <div v-for="t in availableTerminals" :key="t" class="terminal-item">
            <el-checkbox :model-value="selectedTerminals.has(t)"
                         @change="val => toggleTerminal(t, val)">
              {{ t }}
            </el-checkbox>
          </div>
        </div>
      </el-card>

      <!-- 右侧：实时消息流 -->
      <el-card class="message-panel" shadow="never">
        <template #header>
          <div class="panel-title">实时消息</div>
        </template>
        <el-scrollbar ref="scrollRef" class="msg-scroll">
          <el-empty v-if="!messages.length"
                    description="暂无消息（请先勾选左侧终端，并在被监听终端上触发串口交互）"
                    :image-size="60" />
          <div v-for="m in messages" :key="m.id" class="msg-item">
            <div class="msg-head">
              <el-tag size="small" type="info" effect="plain">{{ m.terminalId }}</el-tag>
              <span class="msg-time">{{ m.localTime }}</span>
            </div>
            <pre class="msg-body">{{ m.pretty }}</pre>
          </div>
        </el-scrollbar>
      </el-card>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { API_BASE } from '@/utils/config.js'

  /** 消息列表最多保留条数，超出丢最旧，避免长时间监听把内存吃满 */
  const MAX_MESSAGES = 500
  /** 连续多久收不到任何事件就判定连接可能已断开 */
  const HEARTBEAT_TIMEOUT_MS = 45000
  /** 看门狗轮询间隔 */
  const WATCHDOG_INTERVAL_MS = 5000

  const messages = ref([])
  const availableTerminals = ref([])
  /** 用户勾选的终端；只做本地过滤，增删不影响 SSE 连接 */
  const selectedTerminals = ref(new Set())
  const connected = ref(false)
  const lastHeartbeat = ref(null)
  /** 是否因长时间无事件被标记为「可能已断开」 */
  const staleDisconnected = ref(false)
  const scrollRef = ref(null)

  /** EventSource 实例：全页只保留一个 */
  let es = null
  /** 看门狗定时器 */
  let watchdogTimer = null
  /** 最后收到任意事件的时间戳 */
  let lastEventAt = 0
  /** 消息自增 id，仅用于 v-for 的 key */
  let msgSeq = 0

  const connTag = computed(() => {
    if (staleDisconnected.value) return { type: 'danger', text: '连接中断（浏览器自动重连中）' }
    if (connected.value) return { type: 'success', text: '已连接' }
    return { type: 'info', text: '连接中...' }
  })

  const lastHeartbeatText = computed(() =>
    lastHeartbeat.value ? formatTime(lastHeartbeat.value) : '-'
  )

  /**
   * 把时间格式化为 HH:mm:ss，用于界面展示。
   *
   * @param {Date|string|number|null} input 时间值。
   * @returns {string} 格式化后的时间；输入为空时返回 '-'。
   */
  function formatTime(input) {
    if (!input) return '-'
    const d = input instanceof Date ? input : new Date(input)
    if (Number.isNaN(d.getTime())) return '-'
    const p = n => String(n).padStart(2, '0')
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  }

  /**
   * 勾选/取消勾选某台终端。
   *
   * 只改本地集合，不重连、不调后端：SSE 是全局流，过滤在 message 事件里完成。
   *
   * @param {string} terminalId 终端标识（后端下发，形如 IP）。
   * @param {boolean} checked 是否勾选。
   * @returns {void}
   */
  function toggleTerminal(terminalId, checked) {
    const next = new Set(selectedTerminals.value)
    if (checked) next.add(terminalId)
    else next.delete(terminalId)
    selectedTerminals.value = next
  }

  /**
   * 追加一条消息并滚动到底部。
   *
   * @param {{ terminalId: string, timestamp?: string, payload: any }} data SSE message 事件数据。
   * @returns {void}
   */
  function appendMessage(data) {
    messages.value.push({
      id: ++msgSeq,
      terminalId: data.terminalId,
      localTime: formatTime(new Date()),
      pretty: JSON.stringify(data.payload, null, 2),
    })

    if (messages.value.length > MAX_MESSAGES) {
      messages.value.splice(0, messages.value.length - MAX_MESSAGES)
    }

    // 等 DOM 更新后再滚动，否则拿到的是追加前的 scrollHeight
    nextTick(() => {
      try { scrollRef.value?.setScrollTop(9999999) } catch (_) { /* 忽略滚动异常 */ }
    })
  }

  /**
   * 清空已收到的消息（不动连接与勾选状态）。
   *
   * @returns {void}
   */
  function clearMessages() {
    messages.value = []
  }

  /**
   * 处理 ready 事件：重建可选终端列表。
   *
   * 注意幂等：浏览器自动重连后会再次收到 ready，这里不能清空用户已勾选的终端。
   *
   * @param {MessageEvent} e SSE 事件对象，data 为 JSON 字符串。
   * @returns {void}
   */
  function onReady(e) {
    try {
      const data = JSON.parse(e.data)
      availableTerminals.value = Array.isArray(data.terminals) ? data.terminals : []
    } catch (err) {
      console.warn('[serial-monitor] ready 解析失败', err)
    }
  }

  /**
   * 处理 message 事件：按勾选状态过滤后渲染。
   *
   * @param {MessageEvent} e SSE 事件对象。
   * @returns {void}
   */
  function onMessage(e) {
    try {
      const data = JSON.parse(e.data)
      if (!selectedTerminals.value.has(data.terminalId)) return
      appendMessage(data)
    } catch (err) {
      console.warn('[serial-monitor] message 解析失败', err)
    }
  }

  /**
   * 处理 heartbeat 事件：刷新存活时间。
   *
   * @returns {void}
   */
  function onHeartbeat() {
    lastHeartbeat.value = new Date()
  }

  /**
   * 建立 SSE 连接。
   *
   * 关键设计：
   * - 全页只建一个 EventSource，不为每台终端各建一个（浏览器同域连接数有限）；
   * - ready / heartbeat 是自定义事件名，必须用 addEventListener，es.onmessage 收不到。
   *
   * @returns {void}
   */
  function connect() {
    es = new EventSource(`${API_BASE}/Terminal/stream`)

    es.addEventListener('ready', e => {
      lastEventAt = Date.now()
      staleDisconnected.value = false
      onReady(e)
    })

    es.addEventListener('message', e => {
      lastEventAt = Date.now()
      staleDisconnected.value = false
      onMessage(e)
    })

    es.addEventListener('heartbeat', () => {
      lastEventAt = Date.now()
      staleDisconnected.value = false
      onHeartbeat()
    })

    es.onopen = () => {
      connected.value = true
      staleDisconnected.value = false
      lastEventAt = Date.now()
    }

    // 切勿在这里 close()：一旦关闭，浏览器内置的自动重连就失效了
    es.onerror = () => {
      staleDisconnected.value = true
      console.warn('[serial-monitor] SSE 连接异常，等待浏览器自动重连')
    }
  }

  /**
   * 看门狗：长时间收不到任何事件时把状态标记为中断。
   *
   * @returns {void}
   */
  function startWatchdog() {
    watchdogTimer = setInterval(() => {
      if (!lastEventAt) return
      if (Date.now() - lastEventAt > HEARTBEAT_TIMEOUT_MS) {
        staleDisconnected.value = true
      }
    }, WATCHDOG_INTERVAL_MS)
  }

  onMounted(() => {
    connect()
    startWatchdog()
  })

  onBeforeUnmount(() => {
    if (watchdogTimer) clearInterval(watchdogTimer)
    watchdogTimer = null
    // 页面卸载时主动关闭连接，避免残留长连接
    try { es?.close() } catch (_) { /* 忽略关闭异常 */ }
    es = null
  })
</script>

<style scoped>
  .serial-monitor {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: calc(100vh - 24px);
    padding: 12px;
    box-sizing: border-box;
    background: #f5f7fa;
  }

  .status-bar {
    flex: 0 0 auto;
    border-radius: 12px;
    border: 1px solid #e4e7ed;
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .status-row .stat {
    font-size: 13px;
    color: #606266;
  }

  .monitor-body {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 12px;
  }

  .terminal-panel {
    flex: 0 0 24%;
    max-width: 280px;
    min-width: 180px;
    border-radius: 12px;
    border: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .terminal-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .terminal-item {
    font-size: 13px;
  }

  .message-panel {
    flex: 1;
    min-width: 0;
    border-radius: 12px;
    border: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .panel-title {
    font-weight: 600;
    color: #2b3a4a;
    font-size: 14px;
  }

  .msg-scroll {
    flex: 1;
    height: 100%;
  }

  .msg-item {
    margin-bottom: 10px;
    padding: 8px 10px;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    background: #fafafa;
  }

  .msg-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }

  .msg-time {
    font-size: 12px;
    color: #909399;
  }

  .msg-body {
    margin: 0;
    font-family: Consolas, Monaco, monospace;
    font-size: 12px;
    line-height: 1.5;
    color: #303133;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
