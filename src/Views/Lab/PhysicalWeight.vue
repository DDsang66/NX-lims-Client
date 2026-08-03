<template>
  <div class="allContainer">
    <div style="display: flex; width: 100%; height: 100%; gap: 10px; padding: 10px; box-sizing: border-box;">

      <!-- ==================== 左侧面板 ==================== -->
      <div style="width: 240px; display: flex; flex-direction: column; gap: 10px; flex-shrink: 0;">

        <!-- 设备连接 -->
        <div class="card">
          <div class="ctitle">设备连接</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="font-size:12px;">波特率</span>
            <el-select v-model="baudRate" size="small" style="width:90px" :disabled="connected">
              <el-option v-for="b in rates" :key="b" :value="b" :label="String(b)"/>
            </el-select>
          </div>
          <div style="display:flex;gap:8px;">
            <el-button type="primary" size="small" :disabled="connected" :loading="connecting" @click="connect">连接设备</el-button>
            <el-button type="danger" size="small" :disabled="!connected" @click="disconnect">断开</el-button>
          </div>
          <div style="margin-top:6px;font-size:12px;">
            <span :style="{display:'inline-block',width:'8px',height:'8px',borderRadius:'50%',marginRight:'4px',background:connected?'#67c23a':'#c0c4cc',boxShadow:connected?'0 0 4px #67c23a':'none'}"></span>
            {{ connecting ? '连接中...' : connected ? '已连接 ' + cfgInfo : '未连接 — 可手动输入' }}
          </div>
        </div>

        <!-- 重量 -->
        <div class="card">
          <div class="ctitle">重量 (g)</div>
          <div class="wtbox" :style="{background:connected?'#f0f9eb':'#fdf6ec',border:connected?'2px solid #67c23a':'1px dashed #e6a23c'}">
            <span v-if="!connected">
              <el-input-number v-model="weight" :precision="4" :min="0" :step="0.0001" controls-position="right" style="width:100%" placeholder="手动输入"/>
            </span>
            <span v-else class="wtval">{{ weight != null ? weight.toFixed(4) : '---' }}</span>
          </div>
        </div>

        <!-- 刷新间隔 -->
        <div class="card">
          <div class="ctitle">刷新间隔</div>
          <el-select v-model="refreshInterval" style="width:100%" size="small">
            <el-option :value="0.5" label="0.5s" />
            <el-option :value="1" label="1s" />
            <el-option :value="2" label="2s" />
            <el-option :value="5" label="5s" />
            <el-option :value="0" label="手动" />
          </el-select>
        </div>

        <!-- 试样面积 -->
        <div class="card">
          <div class="ctitle" style="display:flex;justify-content:space-between;align-items:center;">
            <span>试样面积 (cm²)</span>
            <el-switch v-model="areaByCalc" size="small" active-text="长×宽" inactive-text="直接" style="--el-switch-on-color:#409eff;" />
          </div>
          <template v-if="areaByCalc">
            <div style="display:flex;gap:4px;margin-bottom:4px;">
              <span style="font-size:11px;">长</span>
              <el-input-number v-model="areaLen" :precision="2" :min="0" :step="1" controls-position="right" size="small" style="flex:1;width:0" placeholder="cm"/>
              <span style="font-size:11px;">宽</span>
              <el-input-number v-model="areaWid" :precision="2" :min="0" :step="1" controls-position="right" size="small" style="flex:1;width:0" placeholder="cm"/>
            </div>
            <span v-if="areaLen>0 && areaWid>0" style="font-size:11px;color:#909399;">= {{ area }} cm²</span>
          </template>
          <el-input-number v-else v-model="area" :precision="2" :min="0" :step="1" controls-position="right" style="width:100%" placeholder="输入面积"/>
        </div>
      </div>

      <!-- ==================== 中间按钮 ==================== -->
      <div style="display:flex;flex-direction:column;justify-content:center;gap:10px;flex-shrink:0;width:90px;">
        <el-button type="primary" @click="record">结果记录</el-button>
        <el-button type="warning" @click="clearAll">清除数据</el-button>
        <el-button type="danger" :disabled="!sel.length" @click="delSel">删除选中</el-button>
        <el-button type="success" :disabled="!rows.length" @click="doExport">导出Excel</el-button>
        <el-button :disabled="!rows.length" @click="doPrint">打印</el-button>
        <el-button :disabled="!rows.length" @click="doSave">保存到服务器</el-button>
      </div>

      <!-- ==================== 右侧面板 ==================== -->
      <div style="flex:1;display:flex;flex-direction:column;gap:8px;min-width:0;">
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <span style="font-size:13px;">试样编号 <el-input v-model="sid" placeholder="试样编号" style="width:120px" clearable/></span>
          <span style="font-size:13px;">试样测点 <el-input v-model="point" placeholder="试样测点" style="width:120px" clearable/></span>
          <span style="font-size:13px;">环境温度(℃) <el-input-number v-model="temp" :precision="1" :min="-50" :max="100" style="width:110px" controls-position="right"/></span>
          <span style="font-size:13px;">环境湿度(%) <el-input-number v-model="humid" :precision="1" :min="0" :max="100" style="width:110px" controls-position="right"/></span>
        </div>
        <div style="flex:1;min-height:0;">
          <el-table class="removeTableGaps" :data="rows" border stripe style="width:100%;height:100%;" @selection-change="s=>sel=s" row-key="id">
            <el-table-column type="selection" width="40"/>
            <el-table-column prop="ri" label="次数" width="50" align="center"/>
            <el-table-column prop="sid" label="试样编号" width="120"/>
            <el-table-column prop="point" label="试样测点" width="100"/>
            <el-table-column label="重量(g)" width="100" align="right"><template #default="s">{{ s.row.w?.toFixed(4) }}</template></el-table-column>
            <el-table-column label="面积(cm²)" width="100" align="right"><template #default="s">{{ s.row.a?.toFixed(2) }}</template></el-table-column>
            <el-table-column label="g/m²" width="90" align="right"><template #default="s">{{ s.row.gsm?.toFixed(2) }}</template></el-table-column>
            <el-table-column label="oz/yd²" width="90" align="right"><template #default="s">{{ s.row.oz?.toFixed(2) }}</template></el-table-column>
            <el-table-column label="测试时间" width="155"><template #default="s">{{ ts(s.row.t) }}</template></el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onBeforeUnmount, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const api = inject('request')

// ---- 状态 ----
const baudRate = ref(1200)
const rates = [1200, 2400, 4800, 9600, 19200, 38400]
const connected = ref(false)
const connecting = ref(false)
const cfgInfo = ref('')
const portObj = ref(null)
const portCfg = ref(null)  // 实际打开的端口配置 {dataBits,parity,...}
const weight = ref(null)
const area = ref(null)             // 直接输入模式
const areaByCalc = ref(false)      // 长×宽计算模式
const areaLen = ref(null)
const areaWid = ref(null)
const areaValue = computed(() => areaByCalc.value && areaLen.value && areaWid.value ? parseFloat((areaLen.value * areaWid.value).toFixed(2)) : area.value)
const refreshInterval = ref(1)
const sid = ref('')
const point = ref('')
const temp = ref(null)
const humid = ref(null)
const rows = reactive([])
const sel = ref([])

// ---- 串口底层 (Sartorius BSA) ----
async function _open(port, baud) {
  const cfgs = [
    { baudRate: baud, dataBits: 7, parity: 'odd',  stopBits: 1, flowControl: 'hardware' },
    { baudRate: baud, dataBits: 8, parity: 'odd',  stopBits: 1 },
    { baudRate: baud, dataBits: 7, parity: 'odd',  stopBits: 1 },
    { baudRate: baud, dataBits: 7, parity: 'even', stopBits: 1 },
    { baudRate: baud, dataBits: 8, parity: 'none', stopBits: 1 },
  ]
  let lastErr
  for (const c of cfgs) {
    try { await port.open(c); return c }
    catch (e) { lastErr = e; try { await port.close() } catch (_) {} }
  }
  throw lastErr || new Error('unable to open')
}

async function _close(port) {
  try { if (port.readable) { const r = port.readable.getReader(); r.releaseLock(); await port.readable.cancel() } } catch (_) {}
  try { if (port.writable) { const w = port.writable.getWriter(); w.releaseLock(); await port.writable.close() } } catch (_) {}
  try { await port.close() } catch (_) {}
}

// ---- 连接 / 断开 ----
async function connect() {
  if (!('serial' in navigator)) { ElMessage.error('请用Chrome/Edge'); return }
  connecting.value = true
  try {
    const p = await navigator.serial.requestPort()
    const cfg = await _open(p, baudRate.value)
    cfgInfo.value = cfg.baudRate + ' ' + cfg.dataBits + cfg.parity.charAt(0) + cfg.stopBits + (cfg.flowControl ? ' hw' : '')
    portObj.value = p
    portCfg.value = cfg
    connected.value = true
    try { await p.setSignals({ dataTerminalReady: true, requestToSend: true }) } catch (_) {}
    startLoop()
    ElMessage.success('已连接')
  } catch (e) {
    if (e.name !== 'AbortError') ElMessage.error(e.message || '连接失败')
  } finally { connecting.value = false }
}

async function disconnect() {
  stopLoop()
  if (portObj.value) { await _close(portObj.value); portObj.value = null }
  connected.value = false
  weight.value = null
  ElMessage.info('已断开')
}

// ---- 持续读取 (持久 reader + ESC P 定时敲) ----
let stopFn = null

function startLoop() {
  stopLoop()
  const p = portObj.value
  let stopped = false
  stopFn = () => { stopped = true }

  // 持久 reader: 一直活着，收到数据立刻更新重量
  ;(async () => {
    let reader
    try { reader = p.readable.getReader() } catch (_) { return }
    let buf = ''
    try {
      while (!stopped) {
        const { value, done } = await reader.read()
        if (done || stopped) break
        if (value) {
          if (portCfg.value && portCfg.value.dataBits === 7) { for (let i = 0; i < value.length; i++) value[i] &= 0x7F }
          buf += new TextDecoder().decode(value)
          const lines = buf.split(/[\r\n]+/)
          buf = lines.pop() || ''
          for (const line of lines) {
            const m = line.trim().match(/([+-]?\d+\.\d+)/)
            if (m) weight.value = parseFloat(m[1])
          }
        }
      }
    } catch (_) { /* cancel */ }
    finally { try { reader.releaseLock() } catch (_) {} }
  })()

  // 定时 ESC P (原始字节, 解决 7-bit 编码问题)
  let timer
  function ping() {
    if (stopped) return
    const raw = new Uint8Array([0x1b, 0x50, 0x0d, 0x0a]) // ESC P CR LF
    const w = p.writable.getWriter()
    w.write(raw).catch(() => {}).finally(() => w.releaseLock())
    timer = setTimeout(ping, (refreshInterval.value || 1) * 1000)
  }
  ping()
  stopFn = () => { stopped = true; clearTimeout(timer) }
}

function stopLoop() { if (stopFn) { stopFn(); stopFn = null } }

// ---- 业务 ----
function record() {
  if (weight.value == null || +weight.value <= 0) { ElMessage.warning('重量>0'); return }
  if (areaValue.value == null || +areaValue.value <= 0) { ElMessage.warning('面积>0'); return }
  if (!sid.value.trim()) { ElMessage.warning('试样编号不能为空'); return }
  const w = +weight.value, a = +areaValue.value
  rows.push({ id: crypto.randomUUID?.() ?? Math.random().toString(36), ri: rows.length + 1, sid: sid.value.trim(), point: point.value.trim(), w, a, gsm: +(w / a * 10000).toFixed(2), oz: +((w / a * 10000) / 33.9057).toFixed(2), temp: temp.value, humid: humid.value, t: new Date().toISOString() })
  ElMessage.success(`g/m²=${rows[rows.length-1].gsm}  oz/yd²=${rows[rows.length-1].oz}`)
}

async function clearAll() {
  if (!rows.length) return
  try { await ElMessageBox.confirm('确定要清除所有数据吗？', '确认', { type: 'warning' }); rows.splice(0) } catch { /* */ }
}

async function delSel() {
  if (!sel.value.length) return
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${sel.value.length} 条记录？`, '确认', { type: 'warning' })
    const ids = new Set(sel.value.map(r => r.id))
    for (let i = rows.length - 1; i >= 0; i--) { if (ids.has(rows[i].id)) rows.splice(i, 1) }
    rows.forEach((r, i) => r.ri = i + 1); sel.value = []
    ElMessage.success('已删除')
  } catch { /* */ }
}

async function doExport() {
  if (!rows.length) return
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(rows.map(r => ({ '次数': r.ri, '试样编号': r.sid, '试样测点': r.point, '重量(g)': r.w?.toFixed(4), '面积(cm²)': r.a?.toFixed(2), 'g/m²': r.gsm?.toFixed(2), 'oz/yd²': r.oz?.toFixed(2), '测试时间': ts(r.t) })))
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'PhysicalWeight')
  XLSX.writeFile(wb, `PhysicalWeight_${new Date().toISOString().slice(0,10)}.xlsx`)
  ElMessage.success('导出成功')
}

function doPrint() { window.print() }

async function doSave() {
  if (!rows.length) return
  try {
    const res = await api.post('/PhysicalWeight', { records: rows.map(r => ({ recordIndex: r.ri, sampleId: r.sid, testPoint: r.point, weight: r.w, area: r.a, gPerSqm: r.gsm, ozPerSqyd: r.oz, envTemperature: r.temp, envHumidity: r.humid, testTime: r.t, reportNumber: null })) })
    ElMessage[res.data.success ? 'success' : 'error'](res.data.message || '保存失败')
  } catch (e) { ElMessage.error('网络错误: ' + e.message) }
}

// ---- 工具 ----
function ts(s) { if (!s) return '-'; const d = new Date(s); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` }
function p(n) { return String(n).padStart(2, '0') }

onBeforeUnmount(() => { stopLoop(); if (portObj.value) _close(portObj.value).catch(() => { }) })
</script>

<style scoped>
.card { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 6px; padding: 10px; }
.ctitle { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px; }
.wtbox { padding: 8px; border-radius: 4px; text-align: center; min-height: 40px; display: flex; align-items: center; justify-content: center; }
.wtval { font-size: 28px; font-weight: 700; font-family: 'Consolas', 'Courier New', monospace; color: #333; }
</style>
