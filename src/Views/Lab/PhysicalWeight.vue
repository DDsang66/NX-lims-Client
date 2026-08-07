<template>
  <div class="allContainer">
    <div class="main">

      <!-- ==================== 左侧面板 ==================== -->
      <div class="left">

        <!-- 设备连接 -->
        <div class="card">
          <div class="ctitle"><el-icon><Connection /></el-icon>设备连接</div>
          <div class="row">
            <span class="lbl">波特率</span>
            <el-select v-model="baudRate" size="small" style="width:90px" :disabled="connected">
              <el-option v-for="b in rates" :key="b" :value="b" :label="String(b)"/>
            </el-select>
          </div>
          <div class="row" style="gap:8px;">
            <el-button type="primary" size="small" :disabled="connected" :loading="connecting" @click="connect">
              <el-icon style="margin-right:4px;"><Link /></el-icon>连接设备
            </el-button>
            <el-button type="danger" size="small" :disabled="!connected" @click="disconnect">
              <el-icon style="margin-right:4px;"><SwitchButton /></el-icon>断开
            </el-button>
          </div>
          <div class="st"><span class="dot" :class="{on:connected}"></span>{{ connecting ? '连接中...' : connected ? '已连接 ' + cfgInfo : '未连接 — 可手动输入' }}</div>
          <div v-if="connected" class="st" style="color:#67c23a;">
            <span class="dot" :class="{on:weight!=null}"></span>{{ weight != null ? '读取正常: ' + weight.toFixed(4) : '等待数据... 按天平 PRINT 键' }}
          </div>
        </div>

        <!-- 重量 -->
        <div class="card">
          <div class="ctitle"><el-icon><ScaleToOriginal /></el-icon>重量 (g)</div>
          <div class="wtbox" :class="{live:connected}">
            <span v-if="!connected">
              <el-input-number v-model="weight" :precision="4" :min="0" :step="0.0001" controls-position="right" style="width:100%" placeholder="手动输入"/>
            </span>
            <span v-else class="wtval">{{ weight != null ? weight.toFixed(4) : '---' }}</span>
          </div>
        </div>

        <!-- 刷新间隔 -->
        <div class="card">
          <div class="ctitle"><el-icon><Timer /></el-icon>刷新间隔</div>
          <el-select v-model="refreshInterval" style="width:100%" size="small">
            <el-option :value="0.5" label="0.5s" />
            <el-option :value="1" label="1s" />
            <el-option :value="2" label="2s" />
            <el-option :value="5" label="5s" />
            <el-option :value="0" label="手动" />
          </el-select>
        </div>

        <!-- 测试类型切换 -->
        <div class="card">
          <div class="ctitle"><el-icon><Grid /></el-icon>测试类型</div>
          <el-radio-group v-model="testType" size="small" style="width:100%" @change="onTestTypeChange">
            <el-radio-button value="area" style="width:33.33%">面积克重</el-radio-button>
            <el-radio-button value="length" style="width:33.33%">长度克重</el-radio-button>
            <el-radio-button value="piece" style="width:33.33%">条重</el-radio-button>
          </el-radio-group>
          <div class="st" style="color:#909399;">{{ TYPE_LABEL[testType] }}</div>
        </div>

        <!-- 试样面积 (面积克重) -->
        <div v-if="testType==='area'" class="card">
          <div class="ctitle" style="justify-content:space-between;">
            <span><el-icon><Grid /></el-icon>试样面积 (cm²)</span>
            <el-switch v-model="areaByCalc" size="small" active-text="长×宽" inactive-text="直接" style="--el-switch-on-color:#409eff;" />
          </div>
          <template v-if="areaByCalc">
            <div class="row" style="gap:4px;">
              <span class="lbl">长</span>
              <el-input-number v-model="areaLen" :precision="2" :min="0" :step="1" controls-position="right" size="small" style="flex:1;width:0" placeholder="cm"/>
              <span class="lbl">宽</span>
              <el-input-number v-model="areaWid" :precision="2" :min="0" :step="1" controls-position="right" size="small" style="flex:1;width:0" placeholder="cm"/>
            </div>
            <span v-if="areaLen>0 && areaWid>0" class="hint">= {{ area }} cm²</span>
          </template>
          <el-input-number v-else v-model="area" :precision="2" :min="0" :step="1" controls-position="right" style="width:100%" placeholder="输入面积"/>
        </div>

        <!-- 试样长度 (长度克重) -->
        <div v-if="testType==='length'" class="card">
          <div class="ctitle"><el-icon><Grid /></el-icon>试样长度 (cm)</div>
          <el-input-number v-model="lengthCm" :precision="2" :min="0" :step="1" controls-position="right" style="width:100%" placeholder="输入长度 cm"/>
        </div>

        <!-- 试样条重 (条重) -->
        <div v-if="testType==='piece'" class="card">
          <div class="ctitle" style="justify-content:space-between;">
            <span><el-icon><Grid /></el-icon>试样条重</span>
            <el-switch v-model="pieceMode" size="small" active-text="每打" inactive-text="条数" :active-value="'perDozen'" :inactive-value="'count'" style="--el-switch-on-color:#409eff;" />
          </div>
          <el-input-number v-model="pieceCount" :precision="0" :min="1" :step="1" controls-position="right" style="width:100%" :placeholder="pieceMode==='perDozen' ? '每打条数 (默认12)' : '称重条数'"/>
        </div>
      </div>

      <!-- ==================== 中间按钮 ==================== -->
      <div class="mid card">
        <el-button type="primary" round @click="record"><el-icon><CirclePlus /></el-icon>结果记录</el-button>
        <el-button type="warning" round @click="clearAll"><el-icon><RefreshLeft /></el-icon>清除数据</el-button>
        <el-button type="danger" round :disabled="!sel.length" @click="delSel"><el-icon><Delete /></el-icon>删除选中</el-button>
        <el-button type="success" round :disabled="!rows.length" @click="doExport"><el-icon><Download /></el-icon>导出Excel</el-button>
        <el-button type="primary" round :disabled="!rows.length" @click="doReport"><el-icon><Document /></el-icon>生成报告</el-button>
        <el-button round :disabled="!rows.length" @click="doPrint"><el-icon><Printer /></el-icon>打印</el-button>
        <el-button round :disabled="!rows.length" @click="doSave"><el-icon><Upload /></el-icon>保存到服务器</el-button>
      </div>

      <!-- ==================== 右侧面板 ==================== -->
      <div class="right">
        <div class="card" style="display:flex;flex-direction:row;flex-wrap:wrap;gap:14px 24px;align-items:center;padding:10px 14px;">
          <span class="field">试样编号 <el-input v-model="sid" placeholder="试样编号" style="width:120px" clearable/></span>
          <span class="field">试样测点 <el-input v-model="point" placeholder="试样测点" style="width:120px" clearable/></span>
          <span class="field">环境温度(℃) <el-input-number v-model="temp" :precision="1" :min="-50" :max="100" style="width:110px" controls-position="right"/></span>
          <span class="field">环境湿度(%) <el-input-number v-model="humid" :precision="1" :min="0" :max="100" style="width:110px" controls-position="right"/></span>
        </div>
        <div class="tbl-wrap">
          <el-table :data="rows" border stripe style="width:100%;height:100%;" @selection-change="s=>sel=s" row-key="id">
            <el-table-column type="selection" width="40"/>
            <el-table-column prop="ri" label="次数" width="50" align="center"/>
            <el-table-column prop="sid" label="试样编号" width="120"/>
            <el-table-column prop="point" label="试样测点" width="100"/>
            <el-table-column label="重量(g)" width="100" align="right"><template #default="s">{{ s.row.w?.toFixed(4) }}</template></el-table-column>
            <!-- 面积克重 -->
            <template v-if="testType==='area'">
              <el-table-column label="面积(cm²)" width="100" align="right"><template #default="s">{{ s.row.a?.toFixed(2) }}</template></el-table-column>
              <el-table-column label="g/m²" width="90" align="right"><template #default="s">{{ s.row.gsm?.toFixed(2) }}</template></el-table-column>
              <el-table-column label="oz/yd²" width="90" align="right"><template #default="s">{{ s.row.oz?.toFixed(2) }}</template></el-table-column>
            </template>
            <!-- 长度克重 -->
            <template v-if="testType==='length'">
              <el-table-column label="长度(cm)" width="100" align="right"><template #default="s">{{ s.row.lc?.toFixed(2) }}</template></el-table-column>
              <el-table-column label="g/m" width="90" align="right"><template #default="s">{{ s.row.gm?.toFixed(2) }}</template></el-table-column>
              <el-table-column label="oz/yd" width="90" align="right"><template #default="s">{{ s.row.oyd?.toFixed(2) }}</template></el-table-column>
            </template>
            <!-- 条重 -->
            <template v-if="testType==='piece'">
              <el-table-column label="条数" width="80" align="right"><template #default="s">{{ s.row.pc }}</template></el-table-column>
              <el-table-column label="g/piece" width="90" align="right"><template #default="s">{{ s.row.gp?.toFixed(2) }}</template></el-table-column>
              <el-table-column label="lb/dozen" width="90" align="right"><template #default="s">{{ s.row.lbd?.toFixed(2) }}</template></el-table-column>
            </template>
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
import { Connection, Link, SwitchButton, ScaleToOriginal, Timer, Grid, CirclePlus, RefreshLeft, Delete, Download, Printer, Upload, Document } from '@element-plus/icons-vue'

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
const lastRxTime = ref(0)          // 最近一次收到串口数据的时间戳
// ---- 测试类型: area(面积克重) | length(长度克重) | piece(条重) ----
const testType = ref('area')
const TYPE_LABEL = { area: '面积克重', length: '长度克重', piece: '条重' }
// ---- 面积 ----
const area = ref(null)             // 直接输入模式
const areaByCalc = ref(false)      // 长×宽计算模式
const areaLen = ref(null)
const areaWid = ref(null)
const areaValue = computed(() => areaByCalc.value && areaLen.value && areaWid.value ? parseFloat((areaLen.value * areaWid.value).toFixed(2)) : area.value)
// ---- 长度 ----
const lengthCm = ref(null)         // 试样长度 cm
// ---- 条重 ----
const pieceMode = ref('count')     // count(条数) | perDozen(每打条数)
const pieceCount = ref(12)         // 称重条数(默认 12 = 1打)
const refreshInterval = ref(1)
const sid = ref('')
const point = ref('')
const temp = ref(null)
const humid = ref(null)
const rows = reactive([])
const sel = ref([])

// ---- 换算常量 ----
const OZ_PER_YD_TO_G_PER_M = 31.0035   // 1 oz/yd = 31.0035 g/m
const LB_TO_G = 453.592                 // 1 lb = 453.592 g

// ---- 串口底层 (Sartorius BSA) ----
// 注意: USB转串口多数不支持硬件流控, 优先用非流控 + 手动DTR/RTS模拟握手
async function _open(port, baud) {
  const cfgs = [
    { baudRate: baud, dataBits: 7, parity: 'odd',  stopBits: 1 },
    { baudRate: baud, dataBits: 8, parity: 'odd',  stopBits: 1 },
    { baudRate: baud, dataBits: 7, parity: 'even', stopBits: 1 },
    { baudRate: baud, dataBits: 8, parity: 'none', stopBits: 1 },
    { baudRate: baud, dataBits: 7, parity: 'odd',  stopBits: 1, flowControl: 'hardware' },
  ]
  let lastErr
  for (const c of cfgs) {
    try { await port.open(c); return c }
    catch (e) { lastErr = e; try { await port.close() } catch (_) {} }
  }
  throw lastErr || new Error('unable to open')
}

// ---- 端口关闭: 先停读取, 再拉低电平, 最后 close (避免驱动崩溃 + 电平残留) ----
const sleep = ms => new Promise(r => setTimeout(r, ms))
async function _close(port) {
  await stopLoop()          // 停止并等待读取循环真正退出
  if (!port) return
  try { await port.setSignals({ dataTerminalReady: false, requestToSend: false }) } catch (_) {}
  await sleep(100)          // 等驱动把电平刷到引脚
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
    recoverCount = 0        // 重连计数复位
    // 复位握手: 先拉低 → 等待 → 拉高, 制造边沿重新触发天平输出使能
    try { await p.setSignals({ dataTerminalReady: false, requestToSend: false }) } catch (_) {}
    await sleep(120)
    try { await p.setSignals({ dataTerminalReady: true, requestToSend: true }) } catch (_) {}
    startLoop()
    ElMessage.success('已连接')
  } catch (e) {
    if (e.name !== 'AbortError') ElMessage.error(e.message || '连接失败')
  } finally { connecting.value = false }
}

async function disconnect() {
  await _close(portObj.value)   // 等读取循环退出后再关端口
  portObj.value = null
  connected.value = false
  weight.value = null
  ElMessage.info('已断开')
}

// ---- 持续读取 (持久 reader, 连接期间只保留一个) ----
let stopFn = null            // 置 true 让读取循环退出
let activeReader = null      // 当前读取循环持有的 reader
let loopDone = Promise.resolve()  // 读取循环退出信号
let recoverCount = 0         // 自动重连次数(上限3)

function startLoop() {
  stopLoop()
  const p = portObj.value
  let stopped = false
  stopFn = () => { stopped = true }
  let resolve
  loopDone = new Promise(r => { resolve = r })

  ;(async () => {
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
          // 剥离校验位 (7-bit 模式)
          if (portCfg.value && portCfg.value.dataBits === 7) { for (let i = 0; i < value.length; i++) value[i] &= 0x7F }
          const dec = new TextDecoder().decode(value)
          buf += dec
          // 按行拆分, 攒够一行才解析
          const parts = buf.split('\n')
          buf = parts.pop() || ''
          for (const part of parts) {
            const line = part.replace(/\r$/, '')
            const m = line.trim().match(/([+-]?\d+\.\d+)/)
            if (m) weight.value = parseFloat(m[1])
          }
        }
      }
    } catch (_) {
      if (!stopped) recover()   // 驱动错误 → 自动重连; 主动取消则不重连
    }
    finally {
      try { reader.releaseLock() } catch (_) {}
      if (activeReader === reader) activeReader = null
      resolve?.()
    }
  })()
}

async function stopLoop() {
  if (stopFn) { stopFn(); stopFn = null }
  // 取消 pending read 唤醒循环, 让它在释放锁后自己退出
  if (activeReader) {
    const r = activeReader
    try { r.cancel().catch(() => {}) } catch (_) {}
  }
  await loopDone
}

// ---- 读取异常自动重连 (同一端口重开, 无需重新授权) ----
async function recover() {
  const p = portObj.value
  if (!p) return
  if (recoverCount >= 3) { connected.value = false; portObj.value = null; ElMessage.error('自动重连失败(超过3次)'); return }
  recoverCount++
  await stopLoop()
  try { await _close(p) } catch (_) {}
  await sleep(300)
  try {
    await p.open(portCfg.value)                    // 用上次成功的配置重开
    try { await p.setSignals({ dataTerminalReady: false, requestToSend: false }) } catch (_) {}
    await sleep(120)
    try { await p.setSignals({ dataTerminalReady: true, requestToSend: true }) } catch (_) {}
    startLoop()
  } catch (e) {
    connected.value = false; portObj.value = null
    ElMessage.error('自动重连失败: ' + e.message)
  }
}

// 页面/浏览器关闭前先停读取, 降低驱动崩溃概率
const onUnload = () => { if (stopFn) { stopFn(); stopFn = null } }
window.addEventListener('beforeunload', onUnload)

// ---- USB 拔出检测 ----
const onPortDisconnect = (e) => {
  if (portObj.value && e.port === portObj.value) {
    stopLoop(); connected.value = false; portObj.value = null; weight.value = null
    ElMessage.warning('设备已拔出')
  }
}
navigator.serial?.addEventListener('disconnect', onPortDisconnect)

// ---- 业务 ----
function onTestTypeChange(v) {
  if (rows.length) {
    ElMessageBox.confirm(`切换测试类型将清空已记录的 ${rows.length} 条数据，确定？`, '确认', { type: 'warning' })
      .then(() => { rows.splice(0); applyTypeDefaults(v) })
      .catch(() => { testType.value = rows[0]?.type || 'area' })
    return
  }
  applyTypeDefaults(v)
}

function applyTypeDefaults(v) {
  if (v === 'piece' && !pieceCount.value) pieceCount.value = 12
}

function record() {
  if (weight.value == null || +weight.value <= 0) { ElMessage.warning('重量>0'); return }
  if (!sid.value.trim()) { ElMessage.warning('试样编号不能为空'); return }
  const w = +weight.value, t = new Date().toISOString()
  const base = { id: crypto.randomUUID?.() ?? Math.random().toString(36), ri: rows.length + 1, sid: sid.value.trim(), point: point.value.trim(), type: testType.value, w, temp: temp.value, humid: humid.value, t }
  if (testType.value === 'area') {
    const a = areaValue.value
    if (a == null || +a <= 0) { ElMessage.warning('面积>0'); return }
    const gsm = +(w / a * 10000).toFixed(2), oz = +(gsm / 33.9057).toFixed(2)
    rows.push({ ...base, a, gsm, oz })
    ElMessage.success(`g/m²=${gsm}  oz/yd²=${oz}`)
  } else if (testType.value === 'length') {
    const lc = lengthCm.value
    if (lc == null || +lc <= 0) { ElMessage.warning('长度>0'); return }
    const gm = +(w / lc * 100).toFixed(2), oyd = +(gm / OZ_PER_YD_TO_G_PER_M).toFixed(2)
    rows.push({ ...base, lc, gm, oyd })
    ElMessage.success(`g/m=${gm}  oz/yd=${oyd}`)
  } else {
    const pc = +pieceCount.value || 0
    if (pc <= 0) { ElMessage.warning('条数>0'); return }
    const gp = +(w / pc).toFixed(2), lbd = +(gp * 12 / LB_TO_G).toFixed(2)
    rows.push({ ...base, pc, gp, lbd })
    ElMessage.success(`g/piece=${gp}  lb/dozen=${lbd}`)
  }
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
  let map
  if (testType.value === 'length') {
    map = r => ({ '次数': r.ri, '试样编号': r.sid, '试样测点': r.point, '重量(g)': r.w?.toFixed(4), '长度(cm)': r.lc?.toFixed(2), 'g/m': r.gm?.toFixed(2), 'oz/yd': r.oyd?.toFixed(2), '测试时间': ts(r.t) })
  } else if (testType.value === 'piece') {
    map = r => ({ '次数': r.ri, '试样编号': r.sid, '试样测点': r.point, '重量(g)': r.w?.toFixed(4), '条数': r.pc, 'g/piece': r.gp?.toFixed(2), 'lb/dozen': r.lbd?.toFixed(2), '测试时间': ts(r.t) })
  } else {
    map = r => ({ '次数': r.ri, '试样编号': r.sid, '试样测点': r.point, '重量(g)': r.w?.toFixed(4), '面积(cm²)': r.a?.toFixed(2), 'g/m²': r.gsm?.toFixed(2), 'oz/yd²': r.oz?.toFixed(2), '测试时间': ts(r.t) })
  }
  const ws = XLSX.utils.json_to_sheet(rows.map(map))
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'PhysicalWeight')
  XLSX.writeFile(wb, `PhysicalWeight_${new Date().toISOString().slice(0,10)}.xlsx`)
  ElMessage.success('导出成功')
}

// 生成 docx 报告: 调后端用 PHY_Weight.docx 模板填充并下载
async function doReport() {
  if (!rows.length) { ElMessage.warning('请先记录数据'); return }
  if (!sid.value.trim()) { ElMessage.warning('请先填写试样编号(报告号)'); return }
  try {
    const res = await api.post('/PhysicalWeightReport/report', {
      reportNumber: sid.value.trim(),
      testType: testType.value,
      testMethod: '',
      records: rows.map(r => ({ point: r.point, sampleId: r.sid, gsm: r.gsm || 0, oz: r.oz || 0, gPerM: r.gm || 0, ozPerYd: r.oyd || 0, gPerPiece: r.gp || 0, lbPerDozen: r.lbd || 0, weight: r.w, area: r.a }))
    })
    if (!res.data?.isSuccess) { ElMessage.error(res.data?.error || '生成失败'); return }
    const { downloadUrl, fileName } = res.data.value
    ElMessage.success('生成成功,开始下载')
    // downloadUrl 是 /api/... 相对路径, 需拼后端 origin(不能走 axios baseURL, 会重复 /api)
    const backendOrigin = new URL(api.defaults.baseURL).origin   // http://localhost:5051
    const fullUrl = backendOrigin + downloadUrl
    const resp = await api.get(fullUrl, { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([resp.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }))
    const a = document.createElement('a'); a.href = url; a.download = fileName
    a.style.display = 'none'; document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  } catch (e) { ElMessage.error('网络错误: ' + e.message) }
}

function doPrint() { window.print() }

async function doSave() {
  if (!rows.length) return
  if (!sid.value.trim()) { ElMessage.warning('请先填写试样编号(单号)'); return }
  try {
    const res = await api.post('/PhysicalWeight', { records: rows.map(r => ({ recordIndex: r.ri, sampleId: sid.value.trim(), testPoint: r.point, weight: r.w, area: r.a || 0, gsm: r.gsm || 0, oz: r.oz || 0, testType: r.type, lengthCm: r.lc ?? null, pieceCount: r.pc ?? null, gPerM: r.gm || 0, ozPerYd: r.oyd || 0, gPerPiece: r.gp || 0, lbPerDozen: r.lbd || 0, envTemperature: r.temp, envHumidity: r.humid, testTime: r.t, reportNumber: sid.value.trim() })) })
    ElMessage[res.data.isSuccess ? 'success' : 'error'](res.data.error || '保存失败')
  } catch (e) { ElMessage.error('网络错误: ' + e.message) }
}

// ---- 工具 ----
function ts(s) { if (!s) return '-'; const d = new Date(s); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` }
function p(n) { return String(n).padStart(2, '0') }

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onUnload)
  navigator.serial?.removeEventListener('disconnect', onPortDisconnect)
  _close(portObj.value).catch(() => { })
  portObj.value = null
})
</script>

<style scoped>
/* 页面容器: 渐变背景 + 圆角面板 */
.allContainer { padding: 14px; box-sizing: border-box; height: 100%; background: linear-gradient(135deg, #f5f7fa 0%, #eef1f6 100%); }
.main { display: flex; width: 100%; height: 100%; gap: 12px; box-sizing: border-box; }

/* 左右侧列 */
.left { width: 248px; display: flex; flex-direction: column; justify-content: center; gap: 12px; flex-shrink: 0; overflow-y: auto; }
.right { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 0; }

/* 卡片 */
.card { background: #fff; border: 1px solid #e6e8eb; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.04); transition: box-shadow .2s; }
.card:hover { box-shadow: 0 3px 10px rgba(0,0,0,.07); }
.ctitle { font-size: 13px; font-weight: 600; color: #2b3a4a; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
.ctitle .el-icon { color: #409eff; }

/* 行/标签 */
.row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; padding-left: 16px; }
.lbl { font-size: 12px; color: #666; white-space: nowrap; }

/* 连接状态 */
.st { margin-top: 8px; font-size: 12px; color: #666; display: flex; align-items: center; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #c0c4cc; margin-right: 5px; transition: all .2s; }
.dot.on { background: #67c23a; box-shadow: 0 0 4px #67c23a; }

/* 重量框 */
.wtbox { padding: 12px; border-radius: 8px; text-align: center; min-height: 56px; display: flex; align-items: center; justify-content: center; background: #fdf6ec; border: 1px dashed #e6a23c; transition: all .25s; }
.wtbox.live { background: #f0f9eb; border: 2px solid #67c23a; }
.wtval { font-size: 30px; font-weight: 700; font-family: 'Consolas', 'Courier New', monospace; color: #1f3d2b; }

.hint { font-size: 11px; color: #909399; }

/* 中间按钮列 (卡片化, 贴合内容高度) */
.mid { display: flex; flex-direction: column; gap: 12px; flex-shrink: 0; align-self: center; width: 138px; padding: 14px; box-sizing: border-box; }
.mid .el-button { width: 100%; margin: 0; }
.mid .el-button .el-icon { margin-right: 4px; }

/* 右侧信息栏: 4个输入框一行横排 (容器用内联 flex:row, 保证不折行) */
.field { font-size: 13px; color: #444; display: flex; align-items: center; gap: 4px; white-space: nowrap; }
.tbl-wrap { flex: 1; min-height: 0; background: #fff; border: 1px solid #e6e8eb; border-radius: 10px; padding: 6px; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
</style>
