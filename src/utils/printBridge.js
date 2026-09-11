// printBridge.js
import { PrintBridgeClient } from 'print-bridge-sdk'

let client = null
const statusHandlers = new Set()

/**
 * 初始化 PrintBridge 连接
 */
export async function connect(options = {}) {
  if (client?.isConnected()) return client

  client = new PrintBridgeClient({
    ip: options.ip || '127.0.0.1',
    port: options.port || 17890,
    connectTimeoutMs: options.connectTimeoutMs || 5000,
    requestTimeoutMs: options.requestTimeoutMs || 10000
  })

  await client.connect()

  // 连接成功后，注册一次底层 status 监听，向所有订阅者分发
  client.on('status', (event) => {
    statusHandlers.forEach(handler => {
      try {
        handler(event)
      } catch (e) {
        console.error('[PrintBridge] status handler error:', e)
      }
    })
  })

  return client
}

/**
 * 订阅打印任务状态
 * @param {function} handler - (event) => void，event 含 jobId、status 等字段
 * @returns {function} 取消订阅函数
 */
export function onStatus(handler) {
  statusHandlers.add(handler)
  return () => statusHandlers.delete(handler)
}

/**
 * 打印 Word 文档
 * @param {string} fileUrl - 后端 Word 文档下载 URL
 * @param {object} options - 打印选项
 * @returns {Promise<{ requestId: string, jobId: string }>}
 */
export async function printWord(fileUrl, options = {}) {
  const {
    copies = 1,
    printerName,
    paper = { widthMm: 210, heightMm: 297 }
  } = options

  await connect()

  const requestId = `REQ-${Date.now()}`
  const jobId = `JOB-${Date.now()}`

  await client.print({
    requestId,
    jobId,
    type: 'docx',
    fileUrl,
    copies,
    printerName,
    paper
  })

  return { requestId, jobId }
}

/**
 * 断开连接
 */
export function disconnect() {
  client?.disconnect()
  client = null
  statusHandlers.clear()
}
