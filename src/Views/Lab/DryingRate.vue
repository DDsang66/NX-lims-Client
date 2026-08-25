<template>
  <div class="allContainer">
    <div class="main">
      <!-- ========== Left Panel 20% ========== -->
      <div class="left-panel">
        <!-- Device Connection Card -->
        <div class="card">
          <div class="ctitle"><el-icon><Connection /></el-icon>Device Connection</div>

          <div class="field-row">
            <label class="lbl">Balance Brand</label>
            <el-select v-model="scaleBrand" size="small" class="full-width" :disabled="connected || connecting" @change="onBrandChange">
              <el-option v-for="(b, k) in SCALE_BRANDS" :key="k" :value="k" :label="b.label" />
            </el-select>
          </div>

          <div class="field-row">
            <label class="lbl">Baud Rate</label>
            <el-select v-model="baudRate" size="small" class="full-width" :disabled="connected">
              <el-option v-for="b in rates" :key="b" :value="b" :label="String(b)" />
            </el-select>
          </div>

          <div class="btn-row">
            <el-button type="primary" size="small" :disabled="connected" :loading="connecting" @click="connect" class="btn-half">
              <el-icon><Link /></el-icon> Connect
            </el-button>
            <el-button type="danger" size="small" :disabled="!connected" @click="disconnect" class="btn-half">
              <el-icon><SwitchButton /></el-icon> Disconnect
            </el-button>
          </div>

          <div class="status-text">
            <span class="dot" :class="{on:connected}"></span>
            {{ connecting ? 'Connecting...' : connected ? 'Connected ' + cfgInfo : 'Disconnected — Manual' }}
          </div>
          <div v-if="connected" class="status-text" style="color:#67c23a;">
            <span class="dot" :class="{on:weight!=null}"></span>
            {{ weight != null ? 'Reading: ' + weight.toFixed(4) + ' g' : 'Waiting for data...' }}
          </div>
        </div>

        <!-- Weight Card -->
        <div class="card">
          <div class="ctitle"><el-icon><ScaleToOriginal /></el-icon>Weight (g)</div>
          <div class="wtbox" :class="{live:connected}">
            <span v-if="!connected" style="width:100%;">
              <el-input-number v-model="weight" :precision="4" :min="0" :step="0.0001" controls-position="right" class="full-width" placeholder="Recording......." />
            </span>
            <span v-else class="wtval">{{ weight != null ? weight.toFixed(4) : '---' }}</span>
          </div>
        </div>

        <!-- Operation Buttons -->
        <div class="card btn-group">
          <el-button type="primary" round size="default" @click="recordResults" class="full-width"><el-icon><CirclePlus /></el-icon> Record Results</el-button>
          <el-button type="warning" round size="default" @click="clearAll" class="full-width"><el-icon><RefreshLeft /></el-icon> Clear All</el-button>
          <el-button type="danger" round size="default" :disabled="!sel.length" @click="delSel" class="full-width"><el-icon><Delete /></el-icon> Delete Selected</el-button>
          <el-button type="info" round size="default" :disabled="!rows.length" @click="doExport" class="full-width"><el-icon><Download /></el-icon> Export Excel</el-button>
          <el-button type="primary" round size="default" @click="generateReport" class="full-width">
            <el-icon><Document /></el-icon> Generate Report
          </el-button>
          <el-button round size="default" @click="doPrint" class="full-width">
            <el-icon><Printer /></el-icon> Print
          </el-button>
        </div>
      </div>

      <!-- ========== Right Panel 80% ========== -->
      <div class="right-panel">
        <!-- Upper 30% : Report Info -->
        <div class="right-top card">
        </div>

        <!-- Lower 70% : DryingRate Data -->
        <div class="right-bottom card">

        </div>
      </div>
    </div>
  </div>


</template>

<script setup>
  import { ref, computed, onBeforeUnmount, inject } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    Connection, Link, SwitchButton, ScaleToOriginal, Grid,
    CirclePlus, RefreshLeft, Delete, Download, Printer, Document, Edit, Clock
  } from '@element-plus/icons-vue'

  // ---- Inject API ----
  const api = inject('request')

  // ---- Serial constants ----
  const UNIT_TO_G = { g: 1, kg: 1000, mg: 0.001 }
  const METTLER_STABLE_RE = /^S[DI]?\s+([+-]?\d+\.\d+)\s*(g|kg|mg)?\r?$/i
  const METTLER_BARE_RE = /^([+-]?\d+\.\d+)\s*(g|kg|mg)?\r?$/

  function toGrams(num, unit) {
    const k = (unit || 'g').toLowerCase()
    return num * (UNIT_TO_G[k] ?? 1)
  }

  function matchMettler(line) {
    let i = 0
    while (i < line.length && (line.charCodeAt(i) <= 32)) i++
    const s = line.slice(i).trim()
    let m = s.match(METTLER_STABLE_RE)
    if (m) return toGrams(parseFloat(m[1]), m[2])
    m = s.match(METTLER_BARE_RE)
    if (m) return toGrams(parseFloat(m[1]), m[2])
    if (/^S[ DI]?\s/i.test(s)) {
      m = s.match(/([+-]?\d+\.\d+)\s*(g|kg|mg)?\s*$/)
      if (m) return toGrams(parseFloat(m[1]), m[2])
    }
    return null
  }

  const SCALE_BRANDS = {
      NF5022: {
      label: 'NF5022',
      defaultBaud: 19200,
      signals: 'edge',
      cfgs: [
        { dataBits: 7, parity: 'odd', stopBits: 1 },
        { dataBits: 8, parity: 'odd', stopBits: 1 },
        { dataBits: 7, parity: 'even', stopBits: 1 },
        { dataBits: 8, parity: 'none', stopBits: 1 },
        { dataBits: 7, parity: 'odd', stopBits: 1, flowControl: 'hardware' },
      ],
      parse(line) {
        const m = line.trim().match(/([+-]?\d+\.\d+)/)
        return m ? parseFloat(m[1]) : null
      },
    },
    sartorius: {
      label: 'Sartorius',
      defaultBaud: 1200,
      signals: 'edge',
      cfgs: [
        { dataBits: 7, parity: 'odd', stopBits: 1 },
        { dataBits: 8, parity: 'odd', stopBits: 1 },
        { dataBits: 7, parity: 'even', stopBits: 1 },
        { dataBits: 8, parity: 'none', stopBits: 1 },
        { dataBits: 7, parity: 'odd', stopBits: 1, flowControl: 'hardware' },
      ],
      parse(line) {
        const m = line.trim().match(/([+-]?\d+\.\d+)/)
        return m ? parseFloat(m[1]) : null
      },
    },
    mettler: {
      label: 'Mettler Toledo',
      defaultBaud: 9600,
      signals: 'none',
      cfgs: [
        { dataBits: 8, parity: 'none', stopBits: 1 },
        { dataBits: 7, parity: 'even', stopBits: 1 },
        { dataBits: 7, parity: 'odd', stopBits: 1 },
        { dataBits: 8, parity: 'even', stopBits: 1 },
        { dataBits: 7, parity: 'none', stopBits: 1 },
      ],
      parse: matchMettler,
    },
  }

  // ---- State ----
  const baudRate = ref(19200)
  const rates = [1200, 2400, 4800, 9600, 19200, 38400]
  const scaleBrand = ref('NF5022')
  const connected = ref(false)
  const connecting = ref(false)
  const cfgInfo = ref('')
  const portObj = ref(null)
  const portCfg = ref(null)
  const weight = ref(null)
  const lastRxTime = ref(0)

  // ---- Right panel UI data (static for layout) ----
  const twoDigitYear = new Date().getFullYear() % 100

  const conditionOptionsList = [
    { value: '23 ± 2°C / 50 ± 2% RH × 16 hours(recommend 16 hours)', label: '23 ± 2°C / 50 ± 2% RH × 16 hours(recommend 16 hours)' },
    { value: '20 ± 2°C / 65 ± 2% RH × 16 hours', label: '20 ± 2°C / 65 ± 2% RH × 16 hours' },
    { value: 'Without conditioning', label: 'Without conditioning' }
  ]

  const testStandardOptions = [
    { value: 'ASTM D 5963-22', label: 'ASTM D 5963-22' },
    { value: 'DIN 53516', label: 'DIN 53516' },
    { value: 'BS 903 A9:2020 Method A', label: 'BS 903 A9:2020 Method A' },
    { value: 'ISO 4649:2024', label: 'ISO 4649:2024' },
    { value: 'BS ISO 4649:2024', label: 'BS ISO 4649:2024' },
    { value: 'DIN ISO 4649:2014', label: 'DIN ISO 4649:2014' },
    { value: 'EN 12770:1999', label: 'EN 12770:1999' },
    { value: 'ISO 20871:2018(R2023)', label: 'ISO 20871:2018(R2023)' },
    { value: 'SATRA TM174:2016', label: 'SATRA TM174:2016' },
    { value: 'QB/T 2884-2020', label: 'QB/T 2884-2020' },
    { value: 'GB/T 9867-2008', label: 'GB/T 9867-2008' },
    { value: 'GB/T 26703-2021', label: 'GB/T 26703-2021' },
    { value: 'GE-27', label: 'GE-27' },
    { value: 'SATRA TM193(leather sole)', label: 'SATRA TM193(leather sole)' },
  ]

  const methodCategoryOptions = [
    { value: '', label: 'default' },
    { value: 'Method A(Non-rotation test)', label: 'Method A(Non-rotation test)' },
    { value: 'Method B(Rotation test)', label: 'Method B(Rotation test)' }
  ]

  const remarkOptions = [
    { value: '', label: 'default' },
    { value: 'Not applicable for the outsole thickness less than 2.0mm.', label: 'Not applicable for the outsole thickness less than 2.0mm.' },
    { value: 'Not applicable for the outsole size less than 16.0 mm.', label: 'Not applicable for the outsole size less than 16.0 mm.' },
    { value: 'Not suitable to sampling', label: 'Not suitable to sampling' }
  ]

  // ---- Dialog visibility (保留UI控制) ----
  const editDialogVisible = ref(false)
  const historyDialogVisible = ref(false)

  // ---- Table data (保留空数组供按钮使用) ----
  const rows = ref([])
  const sel = ref([])

  // ---- Serial functions ----
  const sleep = ms => new Promise(r => setTimeout(r, ms))

  function matchWeight(line) {
    const brand = SCALE_BRANDS[scaleBrand.value]
    return brand && typeof brand.parse === 'function' ? brand.parse(line) : null
  }

  async function _open(port, baud) {
    const brand = SCALE_BRANDS[scaleBrand.value]
    const cfgs = brand.cfgs.map(c => ({ baudRate: baud, ...c }))
    let lastErr
    for (const c of cfgs) {
      try { await port.open(c); return c }
      catch (e) { lastErr = e; try { await port.close() } catch (_) { } }
    }
    throw lastErr || new Error('Unable to open port')
  }

  async function _applySignals(port) {
    const brand = SCALE_BRANDS[scaleBrand.value]
    if (brand.signals === 'edge') {
      try { await port.setSignals({ dataTerminalReady: false, requestToSend: false }) } catch (_) { }
      await sleep(120)
      try { await port.setSignals({ dataTerminalReady: true, requestToSend: true }) } catch (_) { }
    } else if (brand.signals === 'high') {
      try { await port.setSignals({ dataTerminalReady: true, requestToSend: true }) } catch (_) { }
    }
  }

  async function _close(port) {
    await stopLoop()
    if (!port) return
    try { await port.setSignals({ dataTerminalReady: false, requestToSend: false }) } catch (_) { }
    await sleep(100)
    try { await port.close() } catch (_) { }
  }

  let stopFn = null
  let activeReader = null
  let loopDone = Promise.resolve()
  let recoverCount = 0

  function startLoop() {
    stopLoop()
    const p = portObj.value
    let stopped = false
    stopFn = () => { stopped = true }
    let resolve
    loopDone = new Promise(r => { resolve = r })
      ; (async () => {
        let reader
        try { reader = p.readable.getReader() } catch (_) { resolve?.(); return }
        activeReader = reader
        let buf = ''
        try {
          while (!stopped) {
            const { value, done } = await reader.read()
            if (done || stopped) break
            if (value && value.length) {
              lastRxTime.value = Date.now()
              if (portCfg.value && portCfg.value.dataBits === 7) {
                for (let i = 0; i < value.length; i++) value[i] &= 0x7F
              }
              const dec = new TextDecoder().decode(value)
              buf += dec
              const parts = buf.split(/\r?\n|\r/)
              buf = parts.pop() || ''
              for (const part of parts) {
                const w = matchWeight(part)
                if (w != null) weight.value = w
              }
            }
          }
        } catch (_) {
          if (!stopped) recover()
        } finally {
          try { reader.releaseLock() } catch (_) { }
          if (activeReader === reader) activeReader = null
          resolve?.()
        }
      })()
  }

  async function stopLoop() {
    if (stopFn) { stopFn(); stopFn = null }
    if (activeReader) {
      const r = activeReader
      try { r.cancel().catch(() => { }) } catch (_) { }
    }
    await loopDone
  }

  async function recover() {
    const p = portObj.value
    if (!p) return
    if (recoverCount >= 3) { connected.value = false; portObj.value = null; ElMessage.error('Auto-reconnect failed (max 3 attempts)'); return }
    recoverCount++
    await stopLoop()
    try { await _close(p) } catch (_) { }
    await sleep(300)
    try {
      await p.open(portCfg.value)
      await _applySignals(p)
      startLoop()
    } catch (e) {
      connected.value = false; portObj.value = null
      ElMessage.error('Auto-reconnect failed: ' + e.message)
    }
  }

  async function connect() {
    if (!('serial' in navigator)) { ElMessage.error('Please use Chrome/Edge browser'); return }
    connecting.value = true
    try {
      const p = await navigator.serial.requestPort()
      const cfg = await _open(p, baudRate.value)
      cfgInfo.value = SCALE_BRANDS[scaleBrand.value].label + ' | ' + cfg.baudRate + ' ' + cfg.dataBits + cfg.parity.charAt(0) + cfg.stopBits + (cfg.flowControl ? ' hw' : '')
      portObj.value = p
      portCfg.value = cfg
      connected.value = true
      recoverCount = 0
      await _applySignals(p)
      startLoop()
      ElMessage.success('Connected to ' + SCALE_BRANDS[scaleBrand.value].label)
    } catch (e) {
      if (e.name !== 'AbortError') ElMessage.error(e.message || 'Connection failed')
    } finally { connecting.value = false }
  }

  function onBrandChange() {
    baudRate.value = SCALE_BRANDS[scaleBrand.value].defaultBaud
    cfgInfo.value = ''
    portCfg.value = null
  }

  async function disconnect() {
    await _close(portObj.value)
    portObj.value = null
    connected.value = false
    weight.value = null
    ElMessage.info('Disconnected')
  }

  // ---- Placeholder functions for buttons ----
  function recordResults() {
    if (weight.value != null) {
      ElMessage.info(`Recorded weight: ${weight.value.toFixed(4)} g`)
    } else {
      ElMessage.info('No weight reading available. Please connect to balance or enter weight manually.')
    }
  }

  async function clearAll() {
    if (!rows.value.length) {
      ElMessage.info('No data to clear')
      return
    }
    try {
      await ElMessageBox.confirm('Clear all data?', 'Confirm', { type: 'warning' })
      rows.value.splice(0)
      ElMessage.success('All data cleared')
    } catch { /* */ }
  }

  async function delSel() {
    if (!sel.value.length) return
    try {
      await ElMessageBox.confirm(`Delete ${sel.value.length} selected record(s)?`, 'Confirm', { type: 'warning' })
      const ids = new Set(sel.value.map(r => r.id))
      for (let i = rows.value.length - 1; i >= 0; i--) {
        if (ids.has(rows.value[i].id)) rows.value.splice(i, 1)
      }
      rows.value.forEach((r, i) => r.ri = i + 1)
      sel.value = []
      ElMessage.success('Deleted')
    } catch { /* */ }
  }

  async function doExport() {
    if (!rows.value.length) { ElMessage.warning('No data to export'); return }
    ElMessage.info('Export function placeholder')
  }

  async function generateReport() {
    ElMessage.info('Generate Report placeholder')
  }

  function doPrint() {
    window.print()
  }

  // ---- Serial event cleanup ----
  const onPortDisconnect = (e) => {
    if (portObj.value && e.port === portObj.value) {
      stopLoop(); connected.value = false; portObj.value = null; weight.value = null
      ElMessage.warning('Device removed')
    }
  }
  if (navigator.serial) navigator.serial.addEventListener('disconnect', onPortDisconnect)

  onBeforeUnmount(() => {
    navigator.serial?.removeEventListener('disconnect', onPortDisconnect)
    _close(portObj.value).catch(() => { })
    portObj.value = null
  })
</script>

<style scoped>
  * {
    box-sizing: border-box;
  }

  .allContainer {
    padding: 14px;
    box-sizing: border-box;
    height: 100%;
    background: linear-gradient(135deg, #f5f7fa 0%, #eef1f6 100%);
  }

  .main {
    display: flex;
    width: 100%;
    height: 100%;
    gap: 12px;
    box-sizing: border-box;
    min-width: 0;
  }

  .left-panel {
    width: 20%;
    min-width: 200px;
    max-width: 280px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    flex-shrink: 0;
    box-sizing: border-box;
  }

    .left-panel .card {
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }

  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    overflow: hidden;
  }

  .right-top {
    height: 23%;
    min-height: 90px;
    overflow: auto;
  }

  .right-bottom {
    height: 77%;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  .card {
    background: #fff;
    border: 1px solid #e6e8eb;
    border-radius: 10px;
    padding: 10px 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,.04);
    box-sizing: border-box;
    width: 100%;
  }

  .ctitle {
    font-size: 13px;
    font-weight: 600;
    color: #2b3a4a;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

    .ctitle .el-icon {
      color: #409eff;
    }

  .field-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 8px;
    width: 100%;
  }

    .field-row:last-child {
      margin-bottom: 0;
    }

    .field-row .lbl {
      font-size: 11px;
      color: #666;
      font-weight: 500;
    }

  .full-width {
    width: 100% !important;
  }

    .full-width :deep(.el-input__wrapper) {
      width: 100% !important;
    }

    .full-width :deep(.el-select) {
      width: 100% !important;
    }

    .full-width :deep(.el-input-number) {
      width: 100% !important;
    }

  .btn-row {
    display: flex;
    gap: 6px;
    width: 100%;
    margin-bottom: 6px;
  }

    .btn-row .btn-half {
      flex: 1;
      min-width: 0;
      padding: 6px 4px;
      font-size: 12px;
    }

      .btn-row .btn-half .el-icon {
        margin-right: 2px;
        font-size: 14px;
      }

  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 12px;
  }

    .btn-group .full-width {
      width: 100% !important;
      margin: 0;
      font-size: 13px;
      padding: 8px 0;
    }

      .btn-group .full-width .el-icon {
        margin-right: 4px;
      }

  .status-text {
    font-size: 11px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    word-break: break-all;
    line-height: 1.4;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #c0c4cc;
    transition: all .2s;
    flex-shrink: 0;
  }

    .dot.on {
      background: #67c23a;
      box-shadow: 0 0 4px #67c23a;
    }

  .wtbox {
    padding: 10px;
    border-radius: 8px;
    text-align: center;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fdf6ec;
    border: 1px dashed #e6a23c;
    transition: all .25s;
    width: 100%;
    box-sizing: border-box;
  }

    .wtbox.live {
      background: #f0f9eb;
      border: 2px solid #67c23a;
    }

  .wtval {
    font-size: 26px;
    font-weight: 700;
    font-family: 'Consolas', monospace;
    color: #1f3d2b;
  }

  .field {
    font-size: 12px;
    color: #444;
    display: flex;
    align-items: center;
    gap: 3px;
    white-space: nowrap;
  }

    .field .el-input,
    .field .el-select,
    .field .el-input-number {
      flex-shrink: 0;
    }

  @media (max-width: 900px) {
    .left-panel {
      min-width: 160px;
      max-width: 220px;
    }
  }

  @media (max-width: 700px) {
    .main {
      flex-direction: column;
    }

    .left-panel {
      width: 100%;
      max-width: none;
      min-width: 0;
      flex-direction: row;
      flex-wrap: wrap;
    }

      .left-panel .card {
        flex: 1;
        min-width: 180px;
      }

    .right-panel {
      flex: 1;
    }
  }
</style>
