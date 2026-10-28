<template>
  <div class="allContainer instrument-page">
    <div class="main">
      <!-- ========== Left Panel 20% ========== -->
      <div class="left-panel">
        <!-- Device Connection Card -->
        <el-card shadow="hover">
          <template #header>
            <div class="ctitle"><el-icon><Connection /></el-icon>Device Connection</div>
          </template>
          <el-form label-position="top" size="small" @submit.prevent>
            <el-form-item label="Balance Brand">
              <el-select v-model="scaleBrand" class="full-width" :disabled="connected || connecting" @change="onBrandChange">
                <el-option v-for="(b, k) in SCALE_BRANDS" :key="k" :value="k" :label="b.label" />
              </el-select>
            </el-form-item>
            <el-form-item label="Baud Rate">
              <el-select v-model="baudRate" class="full-width" :disabled="connected">
                <el-option v-for="b in rates" :key="b" :value="b" :label="String(b)" />
              </el-select>
            </el-form-item>
            <el-form-item label-width="0">
              <div class="btn-row">
                <el-button type="primary" size="small" :disabled="connected" :loading="connecting" @click="connect" class="btn-half">
                  <el-icon><Link /></el-icon> Connect
                </el-button>
                <el-button type="danger" size="small" :disabled="!connected" @click="disconnect" class="btn-half">
                  <el-icon><SwitchButton /></el-icon> Disconnect
                </el-button>
              </div>
            </el-form-item>
          </el-form>
          <div class="status-text"><el-tag :type="connTag.type" size="small" effect="plain">{{ connTag.text }}</el-tag></div>
          <div v-if="connected" class="status-text">
            <el-tag :type="weightTag.type" size="small" effect="plain">{{ weightTag.text }}</el-tag>
          </div>
        </el-card>

        <!-- Weight Card -->
        <el-card shadow="hover">
          <template #header>
            <div class="ctitle"><el-icon><ScaleToOriginal /></el-icon>Weight (g)</div>
          </template>
          <div class="wtbox" :class="{live:connected}">
            <el-input-number v-if="!connected" v-model="weight" :precision="4" :min="0" :step="0.0001" controls-position="right" class="full-width" placeholder="Manual" />
            <el-statistic v-else-if="weight != null" class="wtstat" :value="weight" :precision="4" />
            <span v-else class="wtval">---</span>
          </div>
        </el-card>

        <!-- Operation Buttons -->
        <el-card class="op-buttons" shadow="hover">
          <el-space direction="vertical" :size="6" fill>
            <el-button type="primary" round @click="recordResults"><el-icon><CirclePlus /></el-icon> Record Results</el-button>
            <el-button type="warning" round @click="clearAll"><el-icon><RefreshLeft /></el-icon> Clear All</el-button>
            <el-button type="danger" round :disabled="!rows.length" @click="delSel"><el-icon><Delete /></el-icon> Delete Selected</el-button>
            <el-button type="info" round :disabled="!rows.length" @click="doExport"><el-icon><Download /></el-icon> Export Excel</el-button>
          </el-space>
        </el-card>
      </div>

      <!-- ========== Right Panel 80% ========== -->
      <div class="right-panel">
        <!-- Report Info -->
        <el-card class="right-top" shadow="hover">
          <div style="display:flex; flex-direction:column; height:100%; gap:6px;">
            <div style="display:flex; gap:24px; width:100%;">
              <!-- Column 1 -->
              <div style="flex:1; display:flex; flex-direction:column; gap:12px;">
                <span class="field" style="display:flex; align-items:center; gap:2px;">
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">Report No.:</span>
                  <el-input v-model="rep1" style="width:40px" size="small" disabled />
                  <el-select v-model="rep2" style="width:60px" size="small">
                    <el-option value="405.">405.</el-option>
                    <el-option value="441.">441.</el-option>
                  </el-select>
                  <el-select v-model="rep3" style="width:50px" size="small">
                    <el-option :value="twoDigitYear + '.'">{{ twoDigitYear }}</el-option>
                    <el-option :value="(twoDigitYear-1) + '.'">{{ twoDigitYear-1 }}</el-option>
                  </el-select>
                  <el-input v-model="rep4" style="width:60px" size="small" @blur="formatRep4" placeholder="No" />
                  <el-input v-model="rep5" style="width:45px" size="small" />
                </span>

                <span class="field" style="display:flex; align-items:center;">
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">Condition:</span>
                  <el-select v-model="conditionSelected" size="small" style="flex:1; max-width:200px;">
                    <el-option v-for="cond in conditionOptionsList" :key="cond.value" :label="cond.label" :value="cond.value" />
                  </el-select>
                </span>

                <span class="field" style="display:flex; align-items:center;">
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">Cleaning Method:</span>
                  <el-autocomplete v-model="cleaningMethodSelected"
                                   :fetch-suggestions="queryCleaningMethods"
                                   trigger="focus"
                                   clearable
                                   size="small"
                                   style="flex:1; max-width:200px;"
                                   placeholder="Select or input"
                                   @select="onCleaningMethodSelect"
                                   @clear="onCleaningMethodClear" />
                </span>
              </div>

              <!-- Column 2 -->
              <div style="flex:1; display:flex; flex-direction:column; gap:12px;">
                <span class="field" style="display:flex; align-items:center;">
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">Test Standard:</span>
                  <el-select v-model="testStandardSelected" size="small" style="flex:1; max-width:200px;">
                    <el-option v-for="sg in testStandardOptions" :key="sg.value" :label="sg.label" :value="sg.value" />
                  </el-select>
                </span>

                <span class="field" style="display:flex; align-items:center;">
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">Method Category:</span>
                  <el-select v-model="methodCategorySelected" size="small" style="flex:1; max-width:200px;">
                    <el-option v-for="mc in methodCategoryOptions" :key="mc.value" :label="mc.label" :value="mc.value" />
                  </el-select>
                </span>

                <span class="field" style="display:flex; align-items:center;">
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">Buyer Limitation:</span>
                  <el-tooltip content="≤ 买家给定requirement" placement="top" :show-after="300">
                    <el-input-number v-model="buyerLimitation" :precision="4" :step="0.0001" :min="0" size="small" style="flex:1; max-width:200px;" controls-position="right" placeholder="≤" />
                  </el-tooltip>
                </span>
              </div>

              <!-- Column 3 -->
              <div style="flex:1; display:flex; flex-direction:column; gap:12px;">
                <span class="field" style="display:flex; align-items:center;">
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">Remark:</span>
                  <el-select v-model="remarkSelected" size="small" style="flex:1; max-width:200px;" placeholder="Select remark">
                    <el-option v-for="rm in remarkOptions" :key="rm.value" :label="rm.label" :value="rm.value" />
                  </el-select>
                </span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- Lower : Data Table -->
        <el-card class="right-bottom" shadow="hover">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
            <span style="font-weight:600; color:#2b3a4a; font-size:14px;">
              <el-icon><Grid /></el-icon> Moisture Measurement Data
            </span>
            <span class="field" style="display:flex; align-items:center; gap:6px;">
              <span style="font-weight:500; color:#444; font-size:13px;">Sample:</span>
              <el-input v-model="sampleNumber" size="small" style="width:180px;" placeholder="Enter sample Code" />
            </span>
          </div>

          <el-table :data="rows" border stripe size="small" style="width:100%" height="calc(100% - 40px)">
            <el-table-column type="index" label="#" width="50" align="center" />
            <el-table-column prop="reportNo" label="Report No." min-width="140" />
            <el-table-column prop="sample" label="Sample" min-width="100" />
            <el-table-column prop="specimen" label="Specimen" width="100" />
            <el-table-column prop="weight" label="Weight (g)" width="120" align="right">
              <template #default="{ row }">
                {{ row.weight != null ? row.weight.toFixed(4) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="t" label="Test Time" min-width="160">
              <template #default="{ row }">
                {{ ts(row.t) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
// @ts-nocheck
import { ref, reactive, computed, onBeforeUnmount, inject } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Connection, Link, SwitchButton, ScaleToOriginal, Grid,
    CirclePlus, RefreshLeft, Delete, Download
} from '@element-plus/icons-vue'

// ---- Inject API ----
const api = inject('request')

// ---- Serial constants ----
const UNIT_TO_G = { g: 1, kg: 1000, mg: 0.001 }

function toGrams(num, unit) {
    const k = (unit || 'g').toLowerCase()
    return num * (UNIT_TO_G[k] ?? 1)
}

// 串口诊断日志开关：定位设备无读数问题时打开，定位完置 false
// 统一前缀 [MOISTURE]，控制台输入该前缀即可过滤全部串口诊断日志
const SERIAL_DEBUG = true
function slog(...args) { if (SERIAL_DEBUG) console.log('[MOISTURE]', ...args) }
function swarn(...args) { if (SERIAL_DEBUG) console.warn('[MOISTURE]', ...args) }

// parse 失败原因去重记录：同一原因连续出现时只打一次，避免每帧刷屏
let _lastParseErr = ''
function parseFail(reason, line) {
  if (!SERIAL_DEBUG) return
  if (_lastParseErr === reason) return
  _lastParseErr = reason
  swarn('[parse] FAIL reason =', reason, '| line =', JSON.stringify(line))
}

const SCALE_BRANDS = {
    shimadzu: {
      label: 'Shimadzu',
      defaultBaud: 300,
      signals: 'none',
      cfgs: [
        { dataBits: 7, parity: 'even', stopBits: 1 },
        { dataBits: 8, parity: 'none', stopBits: 1 },
        { dataBits: 7, parity: 'odd', stopBits: 1 },
      ],
      parse(line) {
        // Shimadzu MOC-120H output: tab-separated columns (time, temperature, weight, moisture)
        // Lines may start with "*" for final values
        const s = line.replace(/^\*/, '').trim()
        if (!s) { parseFail('empty line after trim', line); return null }
        const cols = s.split('\t')
        if (cols.length < 3) {
          parseFail('cols.length < 3 (splitBy="\\t"), cols=' + cols.length, line)
          return null
        }
        const weightStr = cols[2].trim()
        const m = weightStr.match(/^([+-]?\d+\.\d+)/)
        if (!m) { parseFail('col[2] not numeric: ' + JSON.stringify(weightStr), line); return null }
        const val = parseFloat(m[1])
        if (!Number.isFinite(val)) { parseFail('not finite: ' + m[1], line); return null }
        _lastParseErr = ''
        return val
      },
    },
}

// ---- State ----
const baudRate = ref(300)
const rates = [300, 600, 1200, 2400, 4800, 9600, 19200, 38400]
const scaleBrand = ref('shimadzu')
const connected = ref(false)
const connecting = ref(false)
const cfgInfo = ref('')
const portObj = ref(null)
const portCfg = ref(null)
const weight = ref(null)
const lastRxTime = ref(0)

const connTag = computed(() => {
    if (connecting.value) return { type: 'warning', text: 'Connecting...' }
    if (connected.value) return { type: 'success', text: 'Connected ' + cfgInfo.value }
    return { type: 'info', text: 'Disconnected — Manual' }
})
const weightTag = computed(() => weight.value != null
    ? { type: 'success', text: 'Reading: ' + weight.value.toFixed(4) + ' g' }
    : { type: 'info', text: 'Waiting for data...' })

// ---- Report Info ----
const twoDigitYear = new Date().getFullYear() % 100
const rep1 = ref('87.')
const rep2 = ref('441.')
const rep3 = ref(`${twoDigitYear}.`)
const rep4 = ref('')
const rep5 = ref('.01')
const reportNo = computed(() => rep1.value + rep2.value + rep3.value + rep4.value + rep5.value)
const sampleNumber = ref('')

const conditionSelected = ref(null)
const conditionOptionsList = [
    { value: '23 ± 2°C / 50 ± 2% RH × 16 hours(recommend 16 hours)', label: '23 ± 2°C / 50 ± 2% RH × 16 hours(recommend 16 hours)' },
    { value: '20 ± 2°C / 65 ± 2% RH × 16 hours', label: '20 ± 2°C / 65 ± 2% RH × 16 hours' },
    { value: 'Without conditioning', label: 'Without conditioning' }
]

const cleaningMethodSelected = ref(null)
const cleaningOptionsList = [
    { value: 'a brush attached to a vacuum cleaner', label: 'a brush attached to a vacuum cleaner' },
    { value: 'brush', label: 'brush' },
    { value: '', label: 'please specified' }
]

function queryCleaningMethods(queryString, cb) {
    const results = cleaningOptionsList.map(item => ({ value: item.value || item.label }))
    cb(results)
}

function onCleaningMethodSelect(item) {
    cleaningMethodSelected.value = item.value
    if (item.value === '') {
      cleaningMethodSelected.value = ''
    }
}

function onCleaningMethodClear() {
    cleaningMethodSelected.value = ''
}

const testStandardSelected = ref(null)
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

const methodCategorySelected = ref(null)
const methodCategoryOptions = [
    { value: '', label: 'default' },
    { value: 'Method A(Non-rotation test)', label: 'Method A(Non-rotation test)' },
    { value: 'Method B(Rotation test)', label: 'Method B(Rotation test)' }
]

const buyerLimitation = ref(null)

const remarkSelected = ref(null)
const remarkOptions = [
    { value: '', label: 'default' },
    { value: 'Not applicable for the outsole thickness less than 2.0mm.', label: 'Not applicable for the outsole thickness less than 2.0mm.' },
    { value: 'Not applicable for the outsole size less than 16.0 mm.', label: 'Not applicable for the outsole size less than 16.0 mm.' },
    { value: 'Not suitable to sampling', label: 'Not suitable to sampling' }
]

// ---- Table data ----
const rows = reactive([])
const sel = ref([])

// ---- Record functions (simplified) ----
function recordResults() {
    if (weight.value == null) {
      ElMessage.info('No weight reading available. Please connect to balance or enter weight manually.')
      return
    }
    if (!sampleNumber.value.trim()) {
      ElMessage.warning('Please enter Sample Code')
      return
    }

    const t = new Date().toISOString()
    rows.push({
      id: crypto.randomUUID?.() ?? Math.random().toString(36),
      ri: rows.length + 1,
      reportNo: reportNo.value.trim(),
      sample: sampleNumber.value.trim(),
      specimen: `S${rows.length + 1}`,
      weight: weight.value,
      t
    })

    ElMessage.success('Result recorded')
}

// ---- Clear & Delete ----
async function clearAll() {
    if (!rows.length) {
      ElMessage.info('No data to clear')
      return
    }
    try {
      await ElMessageBox.confirm('Clear all data?', 'Confirm', { type: 'warning' })
      rows.splice(0)
      weight.value = null
      ElMessage.success('All data cleared')
    } catch { /* */ }
}

async function delSel() {
    if (!sel.value.length) return
    try {
      await ElMessageBox.confirm(`Delete ${sel.value.length} selected record(s)?`, 'Confirm', { type: 'warning' })
      const ids = new Set(sel.value.map(r => r.id))
      for (let i = rows.length - 1; i >= 0; i--) {
        if (ids.has(rows[i].id)) rows.splice(i, 1)
      }
      rows.forEach((r, i) => r.ri = i + 1)
      sel.value = []
      ElMessage.success('Deleted')
    } catch { /* */ }
}

// ---- Export ----
async function doExport() {
    if (!rows.length) { ElMessage.warning('No data to export'); return }
    try {
      const XLSX = await import('xlsx')
      const map = r => ({
        '#': r.ri,
        'Report No.': r.reportNo,
        'Sample': r.sample,
        'Specimen': r.specimen,
        'Weight (g)': r.weight?.toFixed(4),
        'Test Time': ts(r.t)
      })
      const ws = XLSX.utils.json_to_sheet(rows.map(map))
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Moisture')
      XLSX.writeFile(wb, `Moisture_${new Date().toISOString().slice(0, 10)}.xlsx`)
      ElMessage.success('Export successful')
    } catch (e) {
      ElMessage.error('Export failed: ' + e.message)
    }
}

// ---- Utility ----
function ts(s) {
    if (!s) return '-'
    const d = new Date(s)
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}
function p(n) { return String(n).padStart(2, '0') }

function formatRep4() {
    if (!rep4.value) return
    if (!/^\d+$/.test(rep4.value)) {
      rep4.value = ''
      ElMessage.warning('序号请输入纯数字')
      return
    }
    rep4.value = String(Number(rep4.value))
    if (rep4.value.length < 4) rep4.value = rep4.value.padStart(4, '0')
}

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
        try { reader = p.readable.getReader() } catch (err) {
          swarn('[loop] getReader FAILED, p.readable =', p.readable, 'err =', err?.name, err?.message)
          ElMessage.error('串口读取器创建失败，请断开后重连')
          resolve?.(); return
        }
        activeReader = reader
        let buf = ''
        let rxFrames = 0
        slog('[loop] start reading, portCfg =', JSON.stringify(portCfg.value))
        try {
          while (!stopped) {
            const { value, done } = await reader.read()
            if (done || stopped) break
            if (value && value.length) {
              lastRxTime.value = Date.now()
              rxFrames++
              if (rxFrames <= 20) {
                slog('[rx] frame#', rxFrames, 'len =', value.length, 'hex =',
                  Array.from(value).map(b => b.toString(16).padStart(2, '0')).join(' '))
              }
              if (portCfg.value && portCfg.value.dataBits === 7) {
                for (let i = 0; i < value.length; i++) value[i] &= 0x7F
              }
              const dec = new TextDecoder().decode(value)
              if (SERIAL_DEBUG && rxFrames <= 20) slog('[rx] decoded =', JSON.stringify(dec))
              buf += dec
              const parts = buf.split(/\r?\n|\r/)
              buf = parts.pop() || ''
              slog('[rx] parts =', parts.length, 'bufLeft =', buf.length)
              if (!parts.length) {
                swarn('[rx] NO line separator in buffer, bufLen =', buf.length,
                  'preview =', JSON.stringify(buf.slice(0, 80)))
              }
              for (const part of parts) {
                console.log('RAW RX:', JSON.stringify(part))
                const w = matchWeight(part)
                slog('[parse] line =', JSON.stringify(part), '→ weight =', w)
                slog('[parse] line =', JSON.stringify(part), '→ weight =', w)
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

    .left-panel .el-card {
      width: 100%;
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
    overflow: auto;
  }

  .ctitle {
    font-size: 13px;
    font-weight: 600;
    color: #2b3a4a;
    display: flex;
    align-items: center;
    gap: 6px;
  }

    .ctitle .el-icon {
      color: #409eff;
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
  }

    .btn-row .btn-half {
      flex: 1;
      min-width: 0;
      padding: 6px 4px;
      font-size: 12px;
    }

  .btn-half .el-icon {
    margin-right: 2px;
    font-size: 14px;
  }

  .op-buttons :deep(.el-space) {
    display: flex;
    width: 100%;
  }

  .op-buttons .el-button {
    font-size: 13px;
    padding: 8px 0;
  }

    .op-buttons .el-button .el-icon {
      margin-right: 4px;
    }

  .status-text {
    margin-top: 6px;
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

  .wtstat :deep(.el-statistic__content) {
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

      .left-panel .el-card {
        flex: 1;
        min-width: 180px;
      }

    .right-panel {
      flex: 1;
    }
  }
</style>
