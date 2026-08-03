/**
 * Web Serial API 封装 — 精简版，聚焦调试
 */

export const isSerialSupported = () => 'serial' in navigator
export const requestPort = () => navigator.serial.requestPort()

export async function openPort(port, baudRate) {
  const configs = [
    { baudRate, dataBits: 8, parity: 'none', stopBits: 1 },
    { baudRate, dataBits: 7, parity: 'even', stopBits: 1 },
    { baudRate, dataBits: 7, parity: 'none', stopBits: 2 },
    { baudRate, dataBits: 8, parity: 'none', stopBits: 1, flowControl: 'hardware' },
  ]
  let lastErr
  for (const cfg of configs) {
    try { await port.open(cfg); return cfg }
    catch (e) { lastErr = e; try { await port.close() } catch (_) {} }
  }
  throw lastErr || new Error('无法打开')
}

/** 设置 DTR/RTS（有些天平需要这些信号） */
export async function setSignals(port, dtr, rts) {
  if (port.setSignals) {
    await port.setSignals({ dataTerminalReady: dtr, requestToSend: rts })
  }
}

export async function closePort(port) {
  try { await port.readable?.cancel() } catch (_) {}
  try { await port.writable?.close() } catch (_) {}
  try { await port.close() } catch (_) {}
  try { await port.forget?.() } catch (_) {}
}

export async function sendBytes(port, bytes) {
  const writer = port.writable.getWriter()
  try { await writer.write(bytes) }
  finally { writer.releaseLock() }
}

export async function sendText(port, text) {
  await sendBytes(port, new TextEncoder().encode(text))
}

/** 从原始字节中提取重量 */
export function parseWeight(data) {
  const s = (data || '').trim()
  if (!s) return null
  // " [+-]?12.34 g "
  let m = s.match(/([+-]?\d+\.\d+)\s*(g|kg|mg)?/i)
  if (m) return parseFloat(m[1])
  m = s.match(/([+-]?\d+\.?\d*)/)
  if (m) return parseFloat(m[1])
  return null
}

/** 把 Uint8Array 转成可读字符串 + hex */
export function describeBytes(buf) {
  const hex = Array.from(buf.slice(0, 64)).map(b => b.toString(16).padStart(2,'0')).join(' ')
  const text = new TextDecoder().decode(buf).replace(/[\x00-\x1f]/g, c => '\\x' + c.charCodeAt(0).toString(16).padStart(2,'0'))
  return `${buf.length}B hex=[${hex > 64 ? hex + '...' : hex}] text=[${text.length > 100 ? text.slice(0,100)+'...' : text}]`
}

/** 启动持续读取，返回 stop 函数 */
export function startReader(port, cbs) {
  let stopped = false
  const { onRaw, onWeight, onLog, onErr } = cbs

  ;(async () => {
    let reader
    try {
      reader = port.readable.getReader()
      onLog?.('reader created OK')
    } catch (e) {
      onLog?.('FAIL create reader: ' + e.message)
      return
    }

    let buf = ''
    let total = 0
    try {
      while (!stopped) {
        onLog?.('waiting for data...')
        const { value, done } = await reader.read()
        if (done) { onLog?.('port stream ended'); break }
        if (value && value.length) {
          total += value.length
          onLog?.(describeBytes(value) + ` (total ${total}B)`)
        }

        const text = new TextDecoder().decode(value, { stream: true })
        buf += text

        // 尝试按 \n \r 分割
        let idx
        while ((idx = buf.search(/[\r\n]/)) !== -1) {
          const line = buf.slice(0, idx).trim()
          buf = buf.slice(idx + 1)
          if (buf[0] === '\n') buf = buf.slice(1)
          if (line) {
            onRaw?.(line)
            const w = parseWeight(line)
            if (w !== null) onWeight?.(w)
          }
        }
      }
    } catch (e) {
      if (!stopped) { onLog?.('READ ERR: ' + e.message); onErr?.(e) }
    } finally {
      onLog?.('reader released (total ' + total + 'B)')
      try { reader?.releaseLock() } catch (_) {}
    }
  })()

  return () => { stopped = true }
}

/** 所有要尝试的唤醒命令 */
export const PROBE_CMDS = [
  { label:'Sartorius ESC P', bytes: new Uint8Array([0x1b, 0x50, 0x0d, 0x0a]) },
  { label:'Sartorius P',     text: 'P\r\n' },
  { label:'Mettler S',       text: 'S\r\n' },
  { label:'Mettler SI',      text: 'SI\r\n' },
  { label:'Ohaus P',         text: 'P\r\n' },
  { label:'Ohaus C',         text: 'C\r\n' },
  { label:'AND D01',         text: 'D01\r\n' },
  { label:'ENQ (0x05)',      bytes: new Uint8Array([0x05]) },
  { label:'ESC P raw',       bytes: new Uint8Array([0x1b, 0x50]) },
  { label:'Ctrl+E',          bytes: new Uint8Array([0x05, 0x0d, 0x0a]) },
]

export const BAUD_RATES = [1200, 2400, 4800, 9600, 19200, 38400]
