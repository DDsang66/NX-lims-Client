<template>
  <div class="allContainer">
    <div class="main">

      <!-- ==================== 左侧面板 ==================== -->
      <div class="left-panel">

        <!-- 设备连接 -->
        <div class="card conn-card">
          <div class="ctitle"><el-icon><Connection /></el-icon>设备连接</div>
          <div class="row">
            <span class="lbl">波特率</span>
            <el-select v-model="baudRate" size="small" style="width:110px" :disabled="connected || connecting">
              <el-option v-for="b in rates" :key="b" :value="b" :label="String(b)"/>
            </el-select>
            <span class="lbl" style="margin-left:6px;">仿真</span>
            <el-switch v-model="simMode" size="small" @change="onSimModeChange" :disabled="connected || connecting"/>
          </div>
          <div class="row" style="gap:8px;">
            <el-button type="primary" size="small" :disabled="connected || simMode" :loading="connecting" @click="connect">
              <el-icon style="margin-right:4px;"><Link /></el-icon>连接设备
            </el-button>
            <el-button type="danger" size="small" :disabled="!connected" @click="disconnect">
              <el-icon style="margin-right:4px;"><SwitchButton /></el-icon>断开
            </el-button>
          </div>
          <div class="st"><span class="dot" :class="{on:connected || simMode}"></span>
            {{ simMode ? '仿真模式（无真机）' : connecting ? '连接中...' : connected ? '已连接 ' + baudRate + ' 8N1' : '未连接' }}
          </div>
          <div class="st" style="color:#67c23a;" v-if="connected && !simMode"><span class="dot" :class="{on:true}"></span>设备主动推送遥测</div>
        </div>

        <!-- 样品区 -->
        <div class="card conn-card">
          <div class="ctitle"><el-icon><Document /></el-icon>样品信息</div>
          <div class="row row-col"><span class="lbl">报告号</span>
            <span class="repno">
              <el-input v-model="rep1" size="small" style="width:38px" disabled/>
              <el-select v-model="rep2" size="small" style="width:58px" :disabled="testing1 || testing2"><el-option value="405.">405.</el-option><el-option value="441.">441.</el-option></el-select>
              <el-select v-model="rep3" size="small" style="width:52px" :disabled="testing1 || testing2"><el-option :value="twoDigitYear + '.'">{{ twoDigitYear }}</el-option><el-option :value="(twoDigitYear - 1) + '.'">{{ twoDigitYear - 1 }}</el-option></el-select>
              <el-input v-model="rep4" size="small" style="width:50px" @blur="data4Blur" placeholder="序号" :disabled="testing1 || testing2"/>
              <el-input v-model="rep5" size="small" style="width:40px" :disabled="testing1 || testing2"/>
            </span>
          </div>
          <div class="row"><span class="lbl">样品名称</span>
            <el-input v-model="sampleName" size="small" :disabled="testing1 || testing2"/>
          </div>
          <div class="row"><span class="lbl">环境温度</span>
            <el-input v-model="temperature" size="small" placeholder="℃" :disabled="testing1 || testing2"/>
          </div>
          <div class="row"><span class="lbl">环境湿度</span>
            <el-input v-model="humidity" size="small" placeholder="%" :disabled="testing1 || testing2"/>
          </div>
          <div class="row"><span class="lbl">滴水量</span>
            <el-input-number v-model="waterMl" :min="0.01" :max="10" :precision="2" :step="0.01" size="small" style="width:110px;" :disabled="testing1 || testing2" controls-position="right"/>
            <span class="lbl">mL</span>
          </div>
        </div>

        <!-- 工位操作 -->
        <div class="card">
          <div class="ctitle"><el-icon><VideoPlay /></el-icon>工位测试</div>
          <div class="btn-grid">
            <el-button size="small" :type="testing1 ? 'danger' : 'primary'" :disabled="!canStart" @click="toggleTest(1)">
              {{ testing1 ? '工位1 停止' : '工位1 测试' }}
            </el-button>
            <el-button size="small" :type="testing2 ? 'danger' : 'primary'" :disabled="!canStart" @click="toggleTest(2)">
              {{ testing2 ? '工位2 停止' : '工位2 测试' }}
            </el-button>
          </div>
          <div class="st" style="margin-top:6px;">{{ statusText }}</div>
        </div>

        <!-- 校准参数 -->
        <div class="card conn-card">
          <div class="ctitle"><el-icon><Setting /></el-icon>校准参数</div>
          <div class="row"><span class="lbl">设定温度</span><span class="val">{{ config?.setTemp ?? '-' }} ℃</span></div>
          <div class="row"><span class="lbl">面温偏置1/2</span><span class="val">{{ fmtBias(config?.tempHw1) }} / {{ fmtBias(config?.tempHw2) }} ℃</span></div>
          <div class="row"><span class="lbl">风速偏置1/2</span><span class="val">{{ fmtBias(config?.wind1) }} / {{ fmtBias(config?.wind2) }} m/s</span></div>
          <div class="row"><span class="lbl">PID</span><span class="val">{{ config?.p }} / {{ config?.i }} / {{ config?.d }}</span></div>
          <el-button type="primary" size="small" class="full-width" @click="openCalDialog">
            <el-icon style="margin-right:4px;"><Tools /></el-icon>校准参数设置
          </el-button>
        </div>

        <!-- 数据 -->
        <div class="card">
          <div class="ctitle"><el-icon><Files /></el-icon>数据</div>
          <div class="btn-grid">
            <el-button size="small" @click="historyVisible = true">历史报告</el-button>
            <el-button size="small" type="success" :disabled="!computeResult" :loading="computing" @click="generateReport"><el-icon style="margin-right:4px;"><Download /></el-icon>生成报告</el-button>
          </div>
        </div>
      </div>

      <!-- ==================== 右侧面板 ==================== -->
      <div class="right-panel">

        <!-- 实时状态栏 -->
        <div class="card">
          <div class="ctitle"><el-icon><Monitor /></el-icon>实时状态</div>
          <div class="rt-grid">
            <div v-for="s in [1, 2]" :key="s" class="rt-cell">
              <span class="lbl">工位{{ s }}</span>
              <span class="sub">面温 <b>{{ liveSurface[s-1].toFixed(2) }}</b>℃</span>
              <span class="sub">板温 <b>{{ liveBoard[s-1].toFixed(2) }}</b>℃</span>
              <span class="sub">风速 <b>{{ liveWind[s-1].toFixed(2) }}</b>m/s</span>
              <span class="sub">盖板 <b :class="liveCover[s-1] === 1 ? 'closed' : 'open'">{{ liveCover[s-1] === 1 ? '●闭' : '○开' }}</b></span>
              <span class="sub">功率 <b>{{ livePower[s-1] }}</b>%</span>
            </div>
          </div>
        </div>

        <!-- 两条温度曲线 -->
        <div class="card" v-for="s in [1, 2]" :key="s">
          <div class="ctitle"><el-icon><TrendCharts /></el-icon>工位{{ s }} 表面温度曲线 (℃/点数)
            <span class="st" style="margin:0 0 0 auto;">{{ testing1 && s === 1 || testing2 && s === 2 ? '● 记录中' : '空闲' }}</span>
          </div>
          <v-chart :option="chartOpts[s-1]" autoresize style="height:190px;"/>
        </div>

        <!-- 结果表 -->
        <div class="card">
          <div class="ctitle"><el-icon><Tickets /></el-icon>计算结果</div>
          <el-table :data="resultRows" border stripe size="small" class="removeTableGaps" style="width:100%;">
            <el-table-column prop="station" label="工位" width="60" align="center"/>
            <el-table-column label="滴水量(mL)" align="right">
              <template #default="{ row }">{{ row.participated ? row.waterMl.toFixed(2) : '-' }}</template>
            </el-table-column>
            <el-table-column label="干燥速率(mg/h)" align="right">
              <template #default="{ row }">{{ row.participated ? row.rateMgPerHour.toFixed(0) : '-' }}</template>
            </el-table-column>
            <el-table-column label="干燥速率(g/h)" align="right">
              <template #default="{ row }">{{ row.participated ? row.rateGPerHour.toFixed(3) : '-' }}</template>
            </el-table-column>
            <el-table-column label="干燥时间(s)" align="right">
              <template #default="{ row }">{{ row.participated ? row.dryingTimeSec.toFixed(1) : '-' }}</template>
            </el-table-column>
            <el-table-column label="起点" align="center">
              <template #default="{ row }">{{ row.participated ? row.startPoint : '-' }}</template>
            </el-table-column>
            <el-table-column label="终点" align="center">
              <template #default="{ row }">{{ row.participated ? row.endPoint : '-' }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 历史报告列表 -->
    <el-dialog v-model="historyVisible" title="历史报告文件" width="640px">
      <div class="filter-row">
        <el-input v-model="historyKeyword" size="small" placeholder="按报告号筛选" style="width:220px;"/>
        <el-button size="small" type="primary" @click="loadHistory" style="margin-left:6px;">查询</el-button>
      </div>
      <el-table :data="historyList" border stripe size="small" class="removeTableGaps" style="width:100%;">
        <el-table-column prop="reportNumber" label="报告号" width="160"/>
        <el-table-column label="生成时间" width="170">
          <template #default="{ row }">{{ ts(row.generatedAt) }}</template>
        </el-table-column>
        <el-table-column label="大小" width="90">
          <template #default="{ row }">{{ (row.sizeBytes / 1024).toFixed(1) }} KB</template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="downloadFile(row.fileName)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 校准参数对话框 (照原 calForm + StandardForm) -->
    <el-dialog v-model="calVisible" title="AATCC 201 校准参数" width="560px">
      <el-form label-width="130px" size="small">
        <el-divider content-position="left">偏置 (显示时 PC 端叠加)</el-divider>
        <div class="form-grid">
          <el-form-item label="面温1偏置℃"><el-input-number v-model="calForm.tempHw1" :step="0.05" :precision="2" controls-position="right"/></el-form-item>
          <el-form-item label="面温2偏置℃"><el-input-number v-model="calForm.tempHw2" :step="0.05" :precision="2" controls-position="right"/></el-form-item>
          <el-form-item label="板温1偏置℃"><el-input-number v-model="calForm.tempBoard1" :step="0.05" :precision="2" controls-position="right"/></el-form-item>
          <el-form-item label="板温2偏置℃"><el-input-number v-model="calForm.tempBoard2" :step="0.05" :precision="2" controls-position="right"/></el-form-item>
          <el-form-item label="风速1偏置m/s"><el-input-number v-model="calForm.wind1" :step="0.05" :precision="2" controls-position="right"/></el-form-item>
          <el-form-item label="风速2偏置m/s"><el-input-number v-model="calForm.wind2" :step="0.05" :precision="2" controls-position="right"/></el-form-item>
        </div>
        <el-divider content-position="left">斜坡/平缓判定</el-divider>
        <div class="form-grid">
          <el-form-item label="斜坡段点数"><el-input-number v-model="calForm.slopePoint" :min="1" controls-position="right"/></el-form-item>
          <el-form-item label="平缓段点数"><el-input-number v-model="calForm.flatPoint" :min="1" controls-position="right"/></el-form-item>
          <el-form-item label="斜坡判定序号"><el-input-number v-model="calForm.slopeDgNo" :min="1" controls-position="right"/></el-form-item>
          <el-form-item label="斜坡持续点数"><el-input-number v-model="calForm.slopeContinueNo" :min="1" controls-position="right"/></el-form-item>
          <el-form-item label="斜坡持续温差℃"><el-input-number v-model="calForm.slopeContinueTemp" :step="0.1" :precision="1" controls-position="right"/></el-form-item>
        </div>
        <el-divider content-position="left">设备参数 (设定温度 / PID / 板修正)</el-divider>
        <div class="form-grid">
          <el-form-item label="设定温度℃"><el-input-number v-model="calForm.setTemp" :step="0.5" :precision="1" controls-position="right"/></el-form-item>
          <el-form-item label="P"><el-input-number v-model="calForm.p" :min="0" controls-position="right"/></el-form-item>
          <el-form-item label="I"><el-input-number v-model="calForm.i" :min="0" controls-position="right"/></el-form-item>
          <el-form-item label="D"><el-input-number v-model="calForm.d" :min="0" controls-position="right"/></el-form-item>
          <el-form-item label="板1修正℃"><el-input-number v-model="calForm.tempBoard1X" :step="0.1" :precision="1" controls-position="right"/></el-form-item>
          <el-form-item label="板2修正℃"><el-input-number v-model="calForm.tempBoard2X" :step="0.1" :precision="1" controls-position="right"/></el-form-item>
        </div>
        <div class="st" style="color:#909399;">最近保存: {{ config?.updatedBy || '-' }} {{ ts(config?.updatedAt) }}</div>
      </el-form>
      <template #footer>
        <el-button size="small" :disabled="!connected || simMode" :loading="calReading" @click="readFromDevice">设备回读</el-button>
        <el-button size="small" @click="calVisible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="calSaving" @click="saveCal">保存(入库+设备下发)</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onBeforeUnmount, onMounted, onActivated, onDeactivated, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Connection, SwitchButton, Link, Document, Setting, VideoPlay, Files, Download, Monitor, TrendCharts, Tickets, Tools } from '@element-plus/icons-vue'

// ============================================================
// AATCC 201 水分干燥速率 (加热板法, 2 工位, 纯温度式)
// 协议(二进制, 19200/8N1, 反编译钉死):
//   遥测帧 19字节: AB BA 01 + 面温1/2(16位大端,0.01℃) + 板温1/2 + 风速1/2(0.01) + 盖板1/2(0开1闭) + 功率1/2
//   设备主动连续推送, PC 不发启停命令 (test_flg 纯本地开关)
//   校准: 读 AB BA 00 00 16 | 写 AB BA 00 01 <set_hi><set_lo><P><I><D><板1修><板2修> 16
// 计算落点: 测试中记每工位帧序列(面温/板温/盖板/真实秒数) → 停止 POST compute/aatcc201(后端权威)
//          → 结果表 → POST report/aatcc201 → DOCX 存服务器 + 下载
// ============================================================

const api = inject('request')
const userAuth = inject('userAuthStore')

// ---- 连接状态 ----
const connected = ref(false)
const connecting = ref(false)
const simMode = ref(false)
const portObj = ref(null)
const portCfg = ref(null)
const baudRate = ref(19200)
const rates = [9600, 19200, 38400, 115200]

// ---- 样品 ----
// 五段式报告号 (照 PhysicalWeight): 87. + 405./441. + 两位年份. + 4位序号 + .01
const twoDigitYear = new Date().getFullYear() % 100
const rep1 = ref('87.')                       // 固定前缀
const rep2 = ref('405.')                      // 405. | 441.
const rep3 = ref(`${twoDigitYear}.`)          // 今年/去年
const rep4 = ref('')                          // 序号(纯数字, blur 补足4位)
const rep5 = ref('.01')                       // 后缀
const reportNumber = computed(() => rep1.value + rep2.value + rep3.value + rep4.value + rep5.value)
const reportNoReady = computed(() => rep4.value.trim() !== '')   // 序号必填, 固定前缀不算"已填"
const data4Blur = () => {
  if (!rep4.value) return
  if (!/^\d+$/.test(rep4.value)) { rep4.value = ''; return }
  rep4.value = String(Number(rep4.value))
  if (rep4.value.length < 4) rep4.value = rep4.value.padStart(4, '0')
}
const sampleName = ref('')
const temperature = ref('')
const humidity = ref('')
const waterMl = ref(0.2)

// ---- 测试状态 (每工位独立) ----
const testing1 = ref(false)
const testing2 = ref(false)
const statusText = ref('就绪')

// ---- 实时显示 (含偏置) ----
const liveSurface = ref([0, 0])
const liveBoard = ref([0, 0])
const liveWind = ref([0, 0])
const liveCover = ref([0, 0])
const livePower = ref([0, 0])

// ---- 每工位帧序列 (送后端权威计算) ----
const stFrames = reactive([[], []])

// ---- 校准参数 ----
const config = ref(null)              // GET aatcc201-config 回显
const calVisible = ref(false)
const calReading = ref(false)
const calSaving = ref(false)
const calForm = reactive({
  machineNo: '', tempHw1: 0, tempHw2: 0, tempBoard1: 0, tempBoard2: 0, wind1: 0, wind2: 0,
  slopePoint: 7, flatPoint: 25, slopeDgNo: 100, slopeContinueNo: 100, slopeContinueTemp: 2,
  setTemp: 37, tempBoard1X: 0, tempBoard2X: 0, p: 50, i: 40, d: 0
})

// ---- 计算结果 ----
const computeResult = ref(null)
const computing = ref(false)
const resultRows = computed(() => {
  const r = computeResult.value
  if (!r) return Array.from({ length: 2 }, (_, i) => ({ station: i + 1, participated: false }))
  return r.stations.map(s => ({
    station: s.station, participated: s.participated, waterMl: s.waterMl, rateMgPerHour: s.rateMgPerHour,
    rateGPerHour: s.rateGPerHour, dryingTimeSec: s.dryingTimeSec, startPoint: s.startPoint, endPoint: s.endPoint
  }))
})

// ---- 历史报告 ----
const historyVisible = ref(false)
const historyKeyword = ref('')
const historyList = ref([])

// ---- 辅助 ----
// 偏置字段库存 0.01 单位(照原软件 201config: 读库 ÷100 显示), 卡片摘要按 ℃/m/s 显示
const fmtBias = v => (v == null || isNaN(v)) ? '-' : (Number(v) / 100).toFixed(2)
function ts(s) { if (!s) return '-'; const d = new Date(s); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}` }
const sleep = ms => new Promise(r => setTimeout(r, ms))

const canStart = computed(() => (connected.value || simMode.value) && !!sampleName.value.trim() && reportNoReady.value)

// ============================================================
// Web Serial 基建 (二进制, 按 AB BA 头同步切帧)
// ============================================================

async function _open(port, baud) {
  const cfg = { baudRate: baud, dataBits: 8, parity: 'none', stopBits: 1 }
  await port.open(cfg)
  return cfg
}

async function _close(port) {
  await stopLoop()
  if (!port) return
  try { await port.close() } catch (_) { }
}

let stopFn = null
let activeReader = null
let loopDone = Promise.resolve()
let recoverCount = 0
let rxBytes = []      // 二进制半帧缓冲

async function startLoop() {
  await stopLoop()           // 等旧读循环 finally 里 releaseLock() 执行完, 否则 getReader() 抛 "already locked" 被吞 → 新循环静默退出
  const p = portObj.value
  if (!p) return
  let stopped = false
  stopFn = () => { stopped = true }
  let resolve
  loopDone = new Promise(r => { resolve = r })
  ;(async () => {
    let reader
    try { reader = p.readable.getReader() } catch (_) { resolve?.(); return }
    activeReader = reader
    try {
      while (!stopped) {
        const { value, done } = await reader.read()
        if (done || stopped) break
        if (value && value.length) {
          for (let i = 0; i < value.length; i++) rxBytes.push(value[i])
          pumpBytes()
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
  if (recoverCount >= 3) { connected.value = false; portObj.value = null; ElMessage.error('自动重连失败(最多3次)'); return }
  recoverCount++
  await stopLoop()
  try { await _close(p) } catch (_) { }
  await sleep(300)
  try {
    await p.open(portCfg.value)
    await startLoop()
  } catch (e) {
    connected.value = false; portObj.value = null
    ElMessage.error('自动重连失败: ' + e.message)
  }
}

async function connect() {
  if (!('serial' in navigator)) { ElMessage.error('请使用 Chrome/Edge 浏览器'); return }
  connecting.value = true
  try {
    const p = await navigator.serial.requestPort()
    portCfg.value = await _open(p, baudRate.value)
    portObj.value = p
    connected.value = true
    recoverCount = 0
    await startLoop()
    ElMessage.success('已连接 ' + baudRate.value + ' 8N1')
  } catch (e) {
    if (e.name !== 'AbortError') ElMessage.error(e.message || '连接失败')
  } finally { connecting.value = false }
}

async function disconnect() {
  await _close(portObj.value)
  portObj.value = null
  connected.value = false
  toggleTest(1, true, true); toggleTest(2, true, true)
  ElMessage.info('已断开')
}

const onPortDisconnect = (e) => {
  if (portObj.value && e.port === portObj.value) {
    stopLoop(); connected.value = false; portObj.value = null
    stopSimTelemetry()
    // 拔线: 静默重置测试状态, 不触发 compute(残缺序列无意义); 原 bug 是 testing 永久为 true 卡死
    toggleTest(1, true, true); toggleTest(2, true, true)
    statusText.value = '设备已移除, 测试中止'
    ElMessage.warning('设备已移除, 测试中止')
  }
}
if (navigator.serial) navigator.serial.addEventListener('disconnect', onPortDisconnect)

// ============================================================
// 二进制帧同步: 找 AB BA 头, 按类型取固定长
//   遥测: AB BA 01 + 16 = 19 字节
//   校准读响应: AB BA 00 00 + 7 = 11 字节
// ============================================================

function pumpBytes() {
  while (rxBytes.length >= 2) {
    const i = rxBytes.findIndex((b, k) => k < rxBytes.length - 1 && b === 0xAB && rxBytes[k + 1] === 0xBA)
    if (i < 0) {
      // 无完整 AB BA 头: 保留尾部可能孤立的 0xAB(半帧首字节), 等下一字节补全; 其余垃圾丢弃
      rxBytes = rxBytes[rxBytes.length - 1] === 0xAB ? rxBytes.slice(-1) : []
      break
    }
    if (i > 0) rxBytes = rxBytes.slice(i)
    if (rxBytes.length < 4) break
    const t = rxBytes[2]
    let len = 0
    if (t === 0x01) len = 19
    else if (t === 0x00) len = (rxBytes[3] === 0x00) ? 11 : 5
    else { rxBytes.shift(); continue }
    if (rxBytes.length < len) break
    const frame = rxBytes.slice(0, len)
    rxBytes = rxBytes.slice(len)
    dispatchFrame(frame)
  }
}

function dispatchFrame(frame) {
  const t = frame[2]
  if (t === 0x01) handleTelemetry(frame)
  else if (t === 0x00 && frame[3] === 0x00) handleCalRead(frame)
}

// AB BA 01 + 16 字节遥测帧
function handleTelemetry(f) {
  const rawS1 = f[3] * 256 + f[4]
  const rawS2 = f[5] * 256 + f[6]
  const rawB1 = f[7] * 256 + f[8]
  const rawB2 = f[9] * 256 + f[10]
  const rawW1 = f[11] * 256 + f[12]
  const rawW2 = f[13] * 256 + f[14]
  const c1 = f[15], c2 = f[16]
  const p1 = f[17], p2 = f[18]

  // 显示偏置 PC 端叠加: 表里存 0.01℃/0.01m/s 原值(种子 wind1=5→0.05m/s), 直接加原始 0.01 单位
  // (照原软件: 读库 ÷100 显示、接收端 ×1 加回 —— 勿再 ×100)
  const o1 = config.value ? Number(config.value.tempHw1) : 0
  const o2 = config.value ? Number(config.value.tempHw2) : 0
  const b1 = config.value ? Number(config.value.tempBoard1) : 0
  const b2 = config.value ? Number(config.value.tempBoard2) : 0
  const w1 = config.value ? Number(config.value.wind1) : 0
  const w2 = config.value ? Number(config.value.wind2) : 0
  liveSurface.value[0] = applyJitter(0, rawS1 + o1)
  liveSurface.value[1] = applyJitter(1, rawS2 + o2)
  liveBoard.value[0] = (rawB1 + b1) / 100
  liveBoard.value[1] = (rawB2 + b2) / 100
  liveWind.value[0] = (rawW1 + w1) / 100
  liveWind.value[1] = (rawW2 + w2) / 100
  liveCover.value[0] = c1
  liveCover.value[1] = c2
  livePower.value[0] = p1
  livePower.value[1] = p2

  // 记录测试帧 (送后端)
  const now = Date.now()
  if (testing1.value) {
    stFrames[0].push({ surfaceRaw01: rawS1, boardRaw01: rawB1, coverStatus: c1, frameTimeSec: (now - testStart[0]) / 1000 })
  }
  if (testing2.value) {
    stFrames[1].push({ surfaceRaw01: rawS2, boardRaw01: rawB2, coverStatus: c2, frameTimeSec: (now - testStart[1]) / 1000 })
  }
  refreshCharts()
}

// 温度抗抖动 (照原软件: 连续5帧大跳变才采纳; |Δ|>100 = 1℃)
const jitterCount = [[0, 0], [0, 0]] // [站][0=面 1=板]
const jitterLast = [[0, 0], [0, 0]]
function applyJitter(st, raw) {
  if (jitterLast[st][0] === 0) { jitterLast[st][0] = raw; return raw / 100 }
  const d = Math.abs(raw - jitterLast[st][0])
  if (d > 100) { jitterCount[st][0]++; } else { jitterCount[st][0] = 0 }
  if (jitterCount[st][0] === 0 || jitterCount[st][0] > 4) {
    jitterLast[st][0] = raw
    jitterCount[st][0] = 0
    return raw / 100
  }
  return jitterLast[st][0] / 100
}

// ============================================================
// 工位测试开关
// ============================================================

const testStart = [0, 0]

function toggleTest(st, forceStop = false, silent = false) {
  const is1 = st === 1
  if (forceStop) {
    if (is1) { testing1.value = false } else { testing2.value = false }
    // silent=true: 断开/拔线等异常终止 —— 只重置状态, 不触发 compute(残缺序列算出的速率无意义)
    if (!silent) maybeFinish()
    return
  }
  if (is1) {
    if (!testing1.value) {
      const anyRunning = testing1.value || testing2.value  // 首个测试 → 重置仿真序号从头跑曲线
      stFrames[0] = []; testStart[0] = Date.now(); testing1.value = true
      statusText.value = '工位1 测试开始 (盖板闭合→打开沿为起点)'
      if (simMode.value) startSimTelemetry(anyRunning)
    } else {
      testing1.value = false; maybeFinish()
    }
  } else {
    if (!testing2.value) {
      const anyRunning = testing1.value || testing2.value  // 首个测试 → 重置仿真序号从头跑曲线
      stFrames[1] = []; testStart[1] = Date.now(); testing2.value = true
      statusText.value = '工位2 测试开始 (盖板闭合→打开沿为起点)'
      if (simMode.value) startSimTelemetry(anyRunning)
    } else {
      testing2.value = false; maybeFinish()
    }
  }
}

function maybeFinish() {
  if (!testing1.value && !testing2.value) {
    statusText.value = '测试已停止, 计算中...'
    stopSimTelemetry()
    compute()
  }
}

// ============================================================
// 计算 / 报告
// ============================================================

async function compute() {
  if (!reportNoReady.value) { ElMessage.warning('请先填写报告号序号'); return }
  computing.value = true
  try {
    const res = await api.post('/MoistureDryingRate/compute/aatcc201', {
      reportNumber: reportNumber.value.trim(),
      sampleName: sampleName.value.trim(),
      temperature: temperature.value,
      humidity: humidity.value,
      stations: [0, 1].map(i => ({ waterMl: waterMl.value, frames: stFrames[i] }))
    })
    if (res.data?.isSuccess) {
      computeResult.value = res.data.value
      statusText.value = '计算完成'
    } else {
      statusText.value = '空闲'
      ElMessage.error(res.data?.error || '计算失败')
    }
  } catch (e) { statusText.value = '空闲'; ElMessage.error('网络错误: ' + e.message) }
  finally { computing.value = false }
}

async function generateReport() {
  if (!computeResult.value) { ElMessage.warning('请先完成测试并计算'); return }
  if (!reportNoReady.value) { ElMessage.warning('请先填写报告号序号'); return }
  try {
    const res = await api.post('/MoistureDryingRate/report/aatcc201', {
      reportNumber: reportNumber.value.trim(),
      sampleName: sampleName.value.trim(),
      temperature: temperature.value,
      humidity: humidity.value,
      result: computeResult.value
    })
    if (!res.data?.isSuccess) { ElMessage.error(res.data?.error || '生成失败'); return }
    const { downloadUrl, fileName } = res.data.value
    ElMessage.success('报告生成成功, 开始下载')
    downloadBlob(downloadUrl, fileName)
  } catch (e) { ElMessage.error('网络错误: ' + e.message) }
}

function downloadBlob(downloadUrl, fileName) {
  const backendOrigin = new URL(api.defaults.baseURL).origin
  api.get(backendOrigin + downloadUrl, { responseType: 'blob' }).then(resp => {
    const url = URL.createObjectURL(new Blob([resp.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }))
    const a = document.createElement('a'); a.href = url; a.download = fileName
    a.style.display = 'none'; document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }).catch(e => ElMessage.error('下载失败: ' + e.message))
}

// ---- 历史报告 ----
async function loadHistory() {
  try {
    const res = await api.get('/MoistureDryingRate/reports', { params: { mode: 'aatcc201', keyword: historyKeyword.value.trim() || undefined } })
    historyList.value = res.data?.isSuccess ? res.data.value : []
  } catch (e) { ElMessage.error('查询失败: ' + e.message) }
}
watch(historyVisible, v => { if (v) loadHistory() })

function downloadFile(fileName) {
  const backendOrigin = new URL(api.defaults.baseURL).origin
  api.get(`${backendOrigin}/api/MoistureDryingRate/reports/${encodeURIComponent(fileName)}`, { responseType: 'blob' }).then(resp => {
    const url = URL.createObjectURL(new Blob([resp.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }))
    const a = document.createElement('a'); a.href = url; a.download = fileName
    a.style.display = 'none'; document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }).catch(e => ElMessage.error('下载失败: ' + e.message))
}

// ============================================================
// 校准参数 (GET 回显 / AB BA 00 00 设备回读 / 保存: PUT + AB BA 00 01 下发)
// ============================================================

// 六偏置字段: 库存 0.01 单位(照原软件 201config: 读库 ÷100 显示、×100 保存),
// 对话框按 ℃/m/s 编辑; setTemp/tempBoardX 列语义即 ℃(前端回读 /10、下发 ×10), 不经此转换。
const BIAS_FIELDS = ['tempHw1', 'tempHw2', 'tempBoard1', 'tempBoard2', 'wind1', 'wind2']
function dbToForm(v) { const o = {}; for (const k of BIAS_FIELDS) o[k] = Number(v[k]) / 100; return o }
function formToDb() { const o = {}; for (const k of BIAS_FIELDS) o[k] = Math.round(Number(calForm[k]) * 100); return o }

async function loadConfig() {
  try {
    const res = await api.get('/MoistureDryingRate/aatcc201-config')
    if (res.data?.isSuccess) {
      const v = res.data.value
      config.value = v
      Object.assign(calForm, {
        machineNo: v.machineNo,
        ...dbToForm(v),
        slopePoint: v.slopePoint, flatPoint: v.flatPoint, slopeDgNo: v.slopeDgNo,
        slopeContinueNo: v.slopeContinueNo, slopeContinueTemp: v.slopeContinueTemp,
        setTemp: v.setTemp, tempBoard1X: v.tempBoard1X, tempBoard2X: v.tempBoard2X,
        p: v.p, i: v.i, d: v.d
      })
    }
  } catch (e) {
    ElMessage.warning('校准参数加载失败: ' + (e?.message || '网络错误') + '，实时偏置按 0 处理')
  }
}

async function openCalDialog() {
  calVisible.value = true
  await loadConfig()
}

// AB BA 00 00 16 读设备当前参数 (set_temp/P/I/D/板修正)
function readFromDevice() {
  if (!connected.value || simMode.value) { ElMessage.warning('需连接真机'); return }
  sendCalCmd([0xAB, 0xBA, 0x00, 0x00, 0x16])
  calReading.value = true
  statusText.value = '设备回读中...'
  setTimeout(() => { calReading.value = false }, 3000)
}

// 设备回读响应: AB BA 00 00 + set_temp_hi/lo + P + I + D + 板1修 + 板2修 (共 11 字节)
function handleCalRead(f) {
  // 门控: 需在"设备回读"进行中, 且帧长 11 —— 未请求时脏帧/截断帧不得覆盖对话框
  if (!calVisible.value || !calReading.value || f.length !== 11) return
  const setTemp = (f[4] * 256 + f[5]) / 10.0
  const p = f[6], i = f[7], d = f[8]
  const b1 = (f[9] > 125 ? f[9] - 256 : f[9]) / 10.0
  const b2 = (f[10] > 125 ? f[10] - 256 : f[10]) / 10.0
  calForm.setTemp = setTemp
  calForm.p = p; calForm.i = i; calForm.d = d
  calForm.tempBoard1X = b1; calForm.tempBoard2X = b2
  calReading.value = false
  ElMessage.success('设备回读完成')
}

async function sendCalCmd(bytes) {
  if (simMode.value) { // 仿真: 模拟设备回读响应 (设回读中以满足 handleCalRead 门控; 板修正 ×10 取整防浮点残留)
    calReading.value = true
    setTimeout(() => handleCalRead([0xAB, 0xBA, 0x00, 0x00, 0, Math.round(calForm.setTemp * 10), calForm.p, calForm.i, calForm.d, Math.round(calForm.tempBoard1X * 10), Math.round(calForm.tempBoard2X * 10)]), 300)
    return
  }
  const p = portObj.value
  if (!p || !p.writable) return
  const writer = p.writable.getWriter()
  try { await writer.write(new Uint8Array(bytes)) } finally { writer.releaseLock() }
}

// 保存: ① PUT 全量写库 (记更新人) ② PID/修正经串口 AB BA 00 01 下发设备
async function saveCal() {
  calSaving.value = true
  // 六偏置 ×100 还原 0.01 单位写库(照原软件 save ×100.0); setTemp/tempBoardX 列语义即 ℃ 原样传
  const body = { ...calForm, ...formToDb(), updatedBy: userAuth?.user || '' }
  try {
    const res = await api.put('/MoistureDryingRate/aatcc201-config', body)
    if (!res.data?.isSuccess) { ElMessage.error(res.data?.error || '保存失败'); return }
    const saved = res.data.value
    config.value = saved
    Object.assign(calForm, { ...saved, ...dbToForm(saved) })
    ElMessage.success('已保存到数据库')
    // 下发设备 (失败提示但不回滚已存库的值, 照原软件)
    if (connected.value || simMode.value) {
      const set = Math.round(Number(calForm.setTemp) * 10)
      const b1 = Math.round(Number(calForm.tempBoard1X) * 10) & 0xFF
      const b2 = Math.round(Number(calForm.tempBoard2X) * 10) & 0xFF
      const cmd = [0xAB, 0xBA, 0x00, 0x01, (set >> 8) & 0xFF, set & 0xFF,
        Number(calForm.p) & 0xFF, Number(calForm.i) & 0xFF, Number(calForm.d) & 0xFF, b1, b2, 0x16]
      if (simMode.value) { ElMessage.success('仿真: 已模拟下发设备'); calSaving.value = false; return }
      try {
        const writer = portObj.value.writable.getWriter()
        try { await writer.write(new Uint8Array(cmd)) } finally { writer.releaseLock() }
        ElMessage.success('PID/修正已下发设备')
      } catch (e) {
        ElMessage.warning('已入库, 但设备下发失败: ' + e.message)
      }
    }
  } catch (e) { ElMessage.error('网络错误: ' + e.message) }
  finally { calSaving.value = false }
}

// ============================================================
// 仿真模式 (合成 AB BA 01 遥测帧)
//
// 曲线照 Aatcc201CalculationTests.BuildCompletingCurve（种子配置 slope_dg_no=160/slope_continue_no=80 已验证能跑完）:
//   闭盖保温 30 帧(3700=37℃) → 开盖蒸发降温 50 帧(降到 3300=33℃) → 干燥回升 280 帧(回 37℃) → 平台 250 帧
// 形态必须满足算法时序, 不是"有个斜坡就行":
//   - 回升段要盖住速率斜率检测窗: 斜率从 起点+slope_dg_no(160) 才开始算、斜坡判定在 起点+160+80=271,
//     所以回升段必须持续到 271 帧之后(这里是 280 帧);
//   - 平台段要够长: flat_time_dg 需 平台起始+slope_continue_no+140 帧后、200 点滑窗全平,
//     所以平台要在回升结束后再稳 200+ 帧(这里 250 帧)。
// 帧间隔 120ms(真机 200ms 量级), 610 帧 ≈ 73s 跑完全流程; 每点按 1 秒计速(照原软件), 帧速只影响等待时长不影响速率值。
// ============================================================

let simTimer = null
let simSeq = 0
const SIM_CLOSE = 3700          // 闭盖保温 37.00℃ (0.01 单位)
const SIM_VALLEY = 3300         // 蒸发降温谷底 33.00℃
const SIM_INTERVAL_MS = 120
const SIM_TOTAL_FRAMES = 610    // 30+50+280+250 参考曲线总帧数

// 参考曲线温度(工位2 低 50 = 0.5℃ 便于两线区分; 负偏置不越过 draw_two 斜坡线上限 3700)
function simSurfaceTemp(seq, st) {
  const off = st === 1 ? -50 : 0
  if (seq <= 30) return SIM_CLOSE + off
  if (seq <= 80) return SIM_CLOSE + off - Math.floor((seq - 30) * 400 / 50)
  if (seq <= 360) return SIM_VALLEY + off + Math.floor((seq - 80) * 400 / 280)
  return SIM_CLOSE + off
}

function onSimModeChange() {
  if (simMode.value) {
    ElMessage.info('仿真模式: 合成遥测帧驱动')
    startSimTelemetry()
  } else {
    stopSimTelemetry()
  }
}

function startSimTelemetry(keepSeq = false) {
  stopSimTelemetry()
  if (!keepSeq) simSeq = 0
  simTimer = setInterval(() => {
    simSeq++
    const s1 = simSurfaceTemp(simSeq, 0)
    const s2 = simSurfaceTemp(simSeq, 1)
    const cover = simSeq <= 30 ? 1 : 0
    const power = simSeq <= 80 ? 70 : 40
    handleTelemetry([0xAB, 0xBA, 0x01,
      (s1 >> 8) & 0xFF, s1 & 0xFF, (s2 >> 8) & 0xFF, s2 & 0xFF,
      (s1 >> 8) & 0xFF, s1 & 0xFF, (s2 >> 8) & 0xFF, s2 & 0xFF,   // 板温=面温(计算不用)
      0x00, 0x1e, 0x00, 0x1e, cover, cover, power, power])
    // 曲线跑完(平台段已完整) → 照原软件 flat_time_dg 自动结束测试并触发计算
    if (simSeq >= SIM_TOTAL_FRAMES) {
      stopSimTelemetry()
      const wasTesting = testing1.value || testing2.value
      testing1.value = false
      testing2.value = false
      if (wasTesting) {
        statusText.value = '测试自动结束（温度平台已确认），计算中...'
        compute()
      }
    }
  }, SIM_INTERVAL_MS)
}

function stopSimTelemetry() {
  if (simTimer) { clearInterval(simTimer); simTimer = null }
}

// ============================================================
// echarts 温度曲线 (面温 vs 点数)
// ============================================================

const chartOpts = ref([buildChartOpt(0), buildChartOpt(1)])

function refreshCharts() {
  for (let st = 0; st < 2; st++) {
    const temps = stFrames[st].map(f => f.surfaceRaw01 / 100)
    const c = chartOpts.value[st]
    c.series[0].data = temps
    c.xAxis.data = temps.map((_, i) => i + 1)
    chartOpts.value[st] = { ...c }
  }
}

function buildChartOpt(st) {
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 15, top: 18, bottom: 25 },
    xAxis: { type: 'category', name: '点数', nameTextStyle: { fontSize: 11 }, data: [] },
    yAxis: { type: 'value', name: '℃', min: 0, nameTextStyle: { fontSize: 11 } },
    series: [{ name: '工位' + (st + 1), type: 'line', showSymbol: false, smooth: true, color: ['#409eff', '#e6a23c'][st], data: [] }]
  }
}

// ============================================================
// 生命周期 / keep-alive
// ============================================================

function pauseAll() {
  stopLoop()
  stopSimTelemetry()
}
async function resumeAll() {
  if (connected.value) await startLoop()
  // keepSeq=true: 恢复时不重置仿真序号, 否则测试中曲线从 0 重头(与已采数据错乱)
  if (simMode.value) startSimTelemetry(true)
}

// 挂载即载入校准参数(照原软件 MainForm 启动读 201config): 卡片摘要 + 实时偏置叠加立即生效
onMounted(() => loadConfig())
onBeforeUnmount(() => {
  navigator.serial?.removeEventListener('disconnect', onPortDisconnect)
  pauseAll()
  _close(portObj.value).catch(() => { })
  portObj.value = null
})
// keep-alive: 切走时暂停串口/仿真, 切回时恢复
onDeactivated(() => pauseAll())
onActivated(() => resumeAll())
</script>

<style scoped>
* { box-sizing: border-box; }
.allContainer { padding: 14px; box-sizing: border-box; height: 100%; background: linear-gradient(135deg, #f5f7fa 0%, #eef1f6 100%); overflow: auto; }
.main { display: flex; width: 100%; height: 100%; gap: 12px; box-sizing: border-box; min-width: 0; }
.left-panel { width: 24%; min-width: 250px; max-width: 330px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex-shrink: 0; box-sizing: border-box; }
.right-panel { flex: 1; display: flex; flex-direction: column; gap: 12px; min-width: 0; overflow: auto; }
.card { background: #fff; border: 1px solid #e6e8eb; border-radius: 10px; padding: 10px 18px; box-shadow: 0 1px 3px rgba(0,0,0,.04); box-sizing: border-box; width: 100%; }
.card.conn-card .row, .card.conn-card .st { margin-left: 1px; }
.card.conn-card .row { width: calc(100% - 1px); }
.ctitle { font-size: 13px; font-weight: 600; color: #2b3a4a; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.ctitle .el-icon { color: #409eff; }
.row { display: flex; align-items: center; gap: 4px; margin-bottom: 6px; width: 100%; }
.row:last-child { margin-bottom: 0; }
.lbl { font-size: 12px; color: #666; font-weight: 500; white-space: nowrap; }
.repno { display: flex; align-items: center; flex-wrap: wrap; gap: 2px; flex: 1; min-width: 0; }
.repno :deep(.el-input), .repno :deep(.el-select) { flex: 1 1 auto; }
.row-col { flex-direction: column; align-items: flex-start; gap: 4px; }
.row-col .repno { width: 100%; }
.val { font-size: 12px; color: #2b3a4a; font-family: Consolas, monospace; }
.st { font-size: 11px; color: #666; display: flex; align-items: center; gap: 4px; margin-top: 4px; word-break: break-all; line-height: 1.4; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: #c0c4cc; transition: all .2s; flex-shrink: 0; }
.dot.on { background: #67c23a; box-shadow: 0 0 4px #67c23a; }
.full-width { width: 100% !important; }
.btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.btn-grid .el-button { margin: 0; }
/* 对话框筛选行: 全局 bootstrap .row 带 -15px 负边距, 用独立类避免筛选框贴边框 */
.filter-row { display: flex; align-items: center; gap: 4px; margin: 0 0 8px; width: 100%; }
.rt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.rt-cell { background: #f7f8fa; border-radius: 8px; padding: 8px 10px; display: flex; flex-wrap: wrap; gap: 4px 14px; align-items: center; }
.rt-cell .lbl { font-size: 12px; color: #409eff; font-weight: 700; margin-right: 4px; }
.rt-cell .sub { font-size: 11px; color: #666; }
.rt-cell .sub b { color: #2b3a4a; font-family: Consolas, monospace; }
.rt-cell .sub b.closed { color: #e6a23c; }
.rt-cell .sub b.open { color: #67c23a; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.form-grid .el-form-item { margin-bottom: 8px; }
.form-grid .el-input-number { width: 130px; }
:deep(.el-divider__text) { font-size: 12px; color: #909399; }
/* 清除全局样式 table{margin-bottom:30px} 造成的表头与首行之间的空行 */
.removeTableGaps :deep(table) {
  margin-bottom: 0 !important;
}
</style>
