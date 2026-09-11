// printBridge.js
import { PrintBridgeClient } from 'print-bridge-sdk'

let client = null
const statusHandlers = new Set()

export async function connect(options = {}) {
  if (client?.isConnected()) return client

  client = new PrintBridgeClient({
    ip: options.ip || '127.0.0.1',
    port: options.port || 17890,
    connectTimeoutMs: options.connectTimeoutMs || 5000,
    requestTimeoutMs: options.requestTimeoutMs || 10000
  })

  await client.connect()

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

export function onStatus(handler) {
  statusHandlers.add(handler)
  return () => statusHandlers.delete(handler)
}

/**
 * 通用打印方法
 * @param {string} fileUrl - 文件下载 URL
 * @param {string} type - 文件类型：'docx' | 'pdf'
 * @param {object} options - 打印选项
 */
async function printFile(fileUrl, type, options = {}) {
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
    type,          // 'docx' 或 'pdf'
    fileUrl,
    copies,
    printerName,
    paper
  })

  return { requestId, jobId }
}

/**
 * 打印 Word 文档
 */
export async function printWord(fileUrl, options = {}) {
  return printFile(fileUrl, 'docx', options)
}

/**
 * 打印 PDF 文档
 */
export async function printPdf(fileUrl, options = {}) {
  return printFile(fileUrl, 'pdf', options)
}

/**
 * 断开连接
 */
export function disconnect() {
  client?.disconnect()
  client = null
  statusHandlers.clear()
}
