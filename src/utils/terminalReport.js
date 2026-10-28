/**
 * 终端串口数据上报工具。
 *
 * 用于把本机串口设备的数据实时上报给后端，由后端经 SSE 转发给其它监听终端。
 * 上报通道与 SSE 订阅通道相互独立：这里的 POST 失败不会影响串口交互主流程。
 */

import { API_BASE } from '@/utils/config.js'

const REPORT_URL = `${API_BASE}/Terminal/report`

/** 同一终端连续报文的合并窗口（毫秒） */
const MERGE_WINDOW_MS = 50

/** 等待发送的最新一帧；窗口内只保留最后一帧，实现合并 */
let pendingPayload = null
/** 上一次真正发出的时间戳，用于计算合并窗口剩余时间 */
let lastSentAt = 0
/** 合并窗口定时器句柄；为空表示当前没有排队 */
let flushTimer = null

/**
 * 上报一条串口数据，供其它终端实时监听。
 *
 * 设计要点（对应后端约定）：
 * - 不 await、不抛错：上报失败绝不能影响串口交互主流程；
 * - 不重试：实时监听允许丢帧，重试反而可能造成到达乱序；
 * - 在合并窗口内只保留最新一帧，避免设备连发时报文瞬间打出一串请求。
 *
 * @param {object} payload 串口设备数据的对象表示，会原样作为 payload 字段上报，
 *                         因此这里必须是对象而不是已序列化的字符串，否则监听端拿不到字段。
 * @returns {void}
 */
export function reportSerialData(payload) {
  if (!payload || typeof payload !== 'object') return

  pendingPayload = payload

  const now = Date.now()
  const wait = MERGE_WINDOW_MS - (now - lastSentAt)

  if (wait <= 0) {
    flush()
    return
  }

  // 窗口内已有排队任务时不重复排队，等窗口结束时统一发出最新帧
  if (flushTimer == null) {
    flushTimer = setTimeout(() => {
      flushTimer = null
      flush()
    }, wait)
  }
}

/**
 * 把当前挂起的一帧真正发出去。
 *
 * @returns {void}
 */
function flush() {
  if (!pendingPayload) return

  const body = JSON.stringify({ payload: pendingPayload })
  pendingPayload = null
  lastSentAt = Date.now()

  try {
    // 用原生 fetch 而不是 src/utils/request.js：
    // 后者的拦截器在 401/超时时会弹窗甚至跳登录页，会打断正在进行的称量操作
    fetch(REPORT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      // 页面卸载时也尽量把最后一帧送出
      keepalive: true,
    }).catch(err => {
      console.warn('[serial-report] 上报失败，不影响串口主流程', err)
    })
  } catch (err) {
    console.warn('[serial-report] 上报异常，不影响串口主流程', err)
  }
}
