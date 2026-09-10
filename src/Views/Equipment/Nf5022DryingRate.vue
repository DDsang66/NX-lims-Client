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
          <div v-if="!simMode && connected" class="st" :style="{ color: handshakeOk ? '#67c23a' : '#e6a23c' }">
            <span class="dot" :class="{on:true}"></span>
            <template v-if="handshakeOk">设备握手成功, 采样间隔 {{ spaceTime }}min</template>
            <template v-else>串口已开, 未收到设备握手回帧 (已收 {{ rxBytes }}B/{{ rxFrames }}帧)</template>
            <el-button v-if="!handshakeOk" size="small" text type="primary" style="margin-left:6px;" @click="doHandshake">重发握手</el-button>
          </div>
          <div v-if="!simMode && connected && lastRxHex" class="st" style="color:#909399; word-break:break-all;">RX: {{ lastRxHex }}</div>
        </div>

        <!-- 样品区 -->
        <div class="card conn-card">
          <div class="ctitle"><el-icon><Document /></el-icon>样品信息</div>
          <div class="row row-col"><span class="lbl">报告号</span>
            <span class="repno">
              <el-input v-model="rep1" size="small" style="width:38px" disabled/>
              <el-select v-model="rep2" size="small" style="width:58px" :disabled="testing"><el-option value="405.">405.</el-option><el-option value="441.">441.</el-option></el-select>
              <el-select v-model="rep3" size="small" style="width:52px" :disabled="testing"><el-option :value="twoDigitYear + '.'">{{ twoDigitYear }}</el-option><el-option :value="(twoDigitYear - 1) + '.'">{{ twoDigitYear - 1 }}</el-option></el-select>
              <el-input v-model="rep4" size="small" style="width:50px" @blur="data4Blur" placeholder="序号" :disabled="testing"/>
              <el-input v-model="rep5" size="small" style="width:40px" :disabled="testing"/>
            </span>
          </div>
          <div class="row"><span class="lbl">样品名称</span>
            <el-input v-model="sampleName" size="small" :disabled="testing"/>
          </div>
          <div class="row"><span class="lbl">环境温度</span>
            <el-input v-model="temperature" size="small" placeholder="℃" :disabled="testing"/>
          </div>
          <div class="row"><span class="lbl">环境湿度</span>
            <el-input v-model="humidity" size="small" placeholder="%" :disabled="testing"/>
          </div>
          <el-button type="primary" size="small" class="full-width" @click="onInput" :disabled="testing">
            <el-icon style="margin-right:4px;"><Check /></el-icon>录入
          </el-button>
        </div>

        <!-- 标准与参数 -->
        <div class="card conn-card">
          <div class="ctitle"><el-icon><Setting /></el-icon>测试参数</div>
          <div class="row">
            <span class="lbl">标准</span>
            <el-select v-model="testMethod" size="small" style="flex:1;" :disabled="testing">
              <el-option :value="0" label="GBT 21655.1 2008"/>
              <el-option :value="1" label="GBT 21655.1 2023"/>
            </el-select>
          </div>
          <div class="row">
            <span class="lbl">采样间隔</span>
            <el-input-number v-model="spaceTime" :min="1" :max="60" size="small" style="width:100px;" :disabled="testing" controls-position="right"/>
            <span class="lbl" style="margin-left:4px;">min(设备@帧)</span>
          </div>
          <div class="row">
            <span class="lbl">残留时刻</span>
            <el-input-number v-model="residualMinute" :min="1" :max="600" size="small" style="width:100px;" :disabled="testing" controls-position="right"/>
            <span class="lbl" style="margin-left:4px;">min</span>
          </div>
        </div>

        <!-- 工位选择 -->
        <div class="card conn-card">
          <div class="ctitle"><el-icon><Grid /></el-icon>测试工位</div>
          <div class="row" style="display:grid; grid-template-columns:repeat(3,1fr); gap:4px; justify-items:center;">
            <el-checkbox v-for="i in 6" :key="i" v-model="stationChecked[i-1]" :disabled="testing" size="small">{{ i }}</el-checkbox>
          </div>
        </div>

        <!-- 操作键 -->
        <div class="card conn-card">
          <div class="ctitle"><el-icon><VideoPlay /></el-icon>操作</div>
          <div class="btn-grid">
            <el-button size="small" type="primary" @click="doTare" :disabled="!canOperate">去皮</el-button>
            <el-button size="small" type="primary" @click="doDryCloth" :disabled="!canOperate">称干布</el-button>
            <el-button size="small" type="warning" @click="doTest" :disabled="!canTest">{{ testing ? '测试中' : '开始测试' }}</el-button>
            <el-button size="small" type="danger" @click="doStop" :disabled="!testing">停止</el-button>
          </div>
          <div class="row" style="margin-top:8px;">
            <span class="lbl">滴水工位:</span>
          </div>
          <div class="row drip-grid">
            <el-button v-for="i in 6" :key="i" size="small" style="width:100%;" :type="stationChecked[i-1] ? 'primary' : 'info'" :disabled="!canOperate || !stationChecked[i-1]" @click="doDrip(i)">{{ i }}</el-button>
          </div>
          <div class="row" style="margin-top:6px;">
            <el-button size="small" @click="doRelease" :disabled="!canOperate">解除扩散</el-button>
          </div>
          <div class="st" style="margin-top:6px;">{{ statusText }}</div>
        </div>

        <!-- 操作导航 -->
        <div class="card">
          <div class="ctitle"><el-icon><Files /></el-icon>数据</div>
          <div class="btn-grid">
            <el-button size="small" @click="historyVisible = true">历史报告</el-button>
            <el-button size="small" type="success" :disabled="!computeResult" @click="generateReport"><el-icon style="margin-right:4px;"><Download /></el-icon>生成报告</el-button>
          </div>
        </div>
      </div>

      <!-- ==================== 右侧面板 ==================== -->
      <div class="right-panel">

        <!-- 实时数值 Tab（架子/干布/滴水量/蒸发量） -->
        <div class="card right-top">
          <div class="ctitle"><el-icon><DataAnalysis /></el-icon>实时数据 <span class="st" style="margin:0 0 0 auto;">{{ devStatusText }}</span></div>
          <el-tabs v-model="activeTab" size="small">
            <el-tab-pane label="架子(mg)" name="frame">
              <div class="stat-grid">
                <div v-for="i in 6" :key="i" class="stat-cell">
                  <span class="lbl">工位{{ i }}</span>
                  <span class="val">{{ fmt(frameWeight[i-1]) }}</span>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="干布(mg)" name="cloth">
              <div class="stat-grid">
                <div v-for="i in 6" :key="i" class="stat-cell">
                  <span class="lbl">工位{{ i }}</span>
                  <span class="val">{{ fmt(clothWeight[i-1]) }}</span>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="滴水量(mg)" name="water">
              <div class="stat-grid">
                <div v-for="i in 6" :key="i" class="stat-cell">
                  <span class="lbl">工位{{ i }}</span>
                  <span class="val">{{ fmt(waterWeight[i-1]) }}</span>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="蒸发量(mg)" name="evap">
              <div class="stat-grid">
                <div v-for="i in 6" :key="i" class="stat-cell">
                  <span class="lbl">工位{{ i }}</span>
                  <span class="val">{{ fmt(curEvap[i-1]) }}</span>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 实时蒸发曲线 -->
        <div class="card">
          <div class="ctitle"><el-icon><TrendCharts /></el-icon>蒸发曲线 (mg/点数)</div>
          <v-chart :option="chartOpt" autoresize style="height:250px;"/>
        </div>

        <!-- 结果表 -->
        <div class="card right-bottom">
          <div class="ctitle"><el-icon><Tickets /></el-icon>计算结果</div>
          <el-table :data="resultRows" border stripe size="small" class="removeTableGaps" style="width:100%;">
            <el-table-column prop="station" label="工位" width="60" align="center"/>
            <el-table-column label="滴水量(mg)" align="right">
              <template #default="{ row }">{{ row.participated ? fmt1(row.waterMg) : '-' }}</template>
            </el-table-column>
            <el-table-column label="蒸发时间(min)" align="right">
              <template #default="{ row }">{{ row.participated ? fmt1(row.timeMin) : '-' }}</template>
            </el-table-column>
            <el-table-column label="干燥速率(mg/h)" align="right">
              <template #default="{ row }">{{ row.participated ? fmt0(row.rateMgPerHour) : '-' }}</template>
            </el-table-column>
            <el-table-column label="干燥速率(g/h)" align="right">
              <template #default="{ row }">{{ row.participated ? fmt3(row.rateGPerHour) : '-' }}</template>
            </el-table-column>
            <el-table-column label="残留率(‰)" align="right">
              <template #default="{ row }">{{ row.participated ? fmt1(row.sfclPermille) : '-' }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 历史报告列表 -->
    <el-dialog v-model="historyVisible" title="历史报告文件" width="640px">
      <div class="filter-row">
        <el-input v-model="historyKeyword" size="small" clearable placeholder="按报告号筛选" style="width:220px;"/>
      </div>
      <el-table :data="filteredHistory" border stripe size="small" class="removeTableGaps" style="width:100%;">
        <el-table-column prop="reportNumber" label="报告号" width="160"/>
        <el-table-column label="生成时间" width="170">
          <template #default="{ row }">{{ ts(row.generatedAt) }}</template>
        </el-table-column>
        <el-table-column label="大小" width="90">
          <template #default="{ row }">{{ (row.sizeBytes / 1024).toFixed(1) }} KB</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="140">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="downloadFile(row.fileName)">下载</el-button>
            <el-button size="small" type="danger" @click="deleteFile(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onBeforeUnmount, onActivated, onDeactivated, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Connection, SwitchButton, Link, Document, Setting, Grid, VideoPlay, Files, Download, Check, DataAnalysis, TrendCharts, Tickets } from '@element-plus/icons-vue'

// ============================================================
// NF5022 水分干燥速率（重量式, 6 工位）
// 协议(ASCII, 19200/8N1, 反编译钉死):
//   命令: !!!!!!@1 握手 | !!!!!!%4<位图> 去皮 | !!!!!!%3<位图> 称干布
//         !!!!!!%2<工位1-6> 滴水 | !!!!!!%1<位图> 测试 | !!!!!!%60 解除 | !!!!!!%00 停止
//   回帧: @<间隔字节> 握手确认
//         &1<rtData[2]><站'1'-'6'><6位重量mg> 单站重量 (10B: 站=index3, 重量=index4..9, index2 忽略)
//         &2<站><时间><速率> 设备结果推送 (11B, 前端仅消费保持对齐, 不做实时处理)
//         &3<0架/1布/2水/3蒸发><10站×6位> 批量 (63B)
// 状态机(dev_status): 1=去皮收架重, 2=称干布, 3/4=测试(首帧定滴水量, 后续帧算蒸发量)
// 计算落点: 测试中记每工位原始重量时序 rawSeries → 停止 POST compute/nf5022(后端权威)
//          → 结果表 → POST report/nf5022 → DOCX 存服务器 + 下载
// ============================================================

const api = inject('request')

// ---- 连接状态 ----
const connected = ref(false)
const connecting = ref(false)
const simMode = ref(false)
const portObj = ref(null)
const portCfg = ref(null)
const baudRate = ref(19200)
const rates = [9600, 19200, 38400, 115200]

// ---- 串口诊断 (真机调试: 握手是否成功 / 实际收到多少字节) ----
const handshakeOk = ref(false)   // 收到设备 @ 回帧才算链路通
const rxBytes = ref(0)           // 本次连接累计收到的原始字节数
const rxFrames = ref(0)          // 解析出的完整帧数
const lastRxHex = ref('')        // 最近一次收到数据块的十六进制预览

// ---- 样品 / 参数 ----
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
const testMethod = ref(0)            // 0=GBT 2008, 1=GBT 2023
const spaceTime = ref(3)             // 采样间隔分钟 (设备 @帧; GB/T 21655.1 自然蒸发, 对拍验证 time×rate≈water)
const residualMinute = ref(30)       // 残留率检测时刻 min
const inputDone = ref(false)         // 录入标志 (原 rulu_flg)
const stationChecked = ref([false, false, false, false, false, false])

// ---- 测试状态 ----
const testing = ref(false)
const devStatus = ref(0)             // 镜像设备状态机
const statusText = ref('就绪')
const activeTab = ref('frame')
const curEvap = ref([0, 0, 0, 0, 0, 0])
let stationDone = [false, false, false, false, false, false] // 每工位是否已到终止条件
let computedForTest = false                                   // 本轮测试是否已提交计算 (防重复)

// ---- 数据数组 (6 工位) ----
const frameWeight = ref([0, 0, 0, 0, 0, 0])      // 架重 mg
const clothWeight = ref([0, 0, 0, 0, 0, 0])      // 干布重 mg
const waterWeight = ref([0, 0, 0, 0, 0, 0])      // 滴水量 mg
const rawSeries = reactive([[], [], [], [], [], []]) // 测试期间原始重量时序
const curveSeries = reactive([[], [], [], [], [], []]) // 蒸发量曲线 (首点0)
const curvePoint = ref([0, 0, 0, 0, 0, 0])       // 每工位已记录曲线点数

// ---- 计算结果 ----
const computeResult = ref(null)
const computing = ref(false)
const resultRows = computed(() => {
  const r = computeResult.value
  if (!r) return Array.from({ length: 6 }, (_, i) => ({ station: i + 1, participated: false }))
  return r.stations.map(s => ({
    station: s.station, participated: s.participated, waterMg: s.waterMg, timeMin: s.timeMin,
    rateMgPerHour: s.rateMgPerHour, rateGPerHour: s.rateGPerHour, sfclPermille: s.sfclPermille
  }))
})

// ---- 历史报告 ----
const historyVisible = ref(false)
const historyKeyword = ref('')
const historyList = ref([])

// ---- 辅助格式化 ----
const fmt = v => (v == null || isNaN(v)) ? '---' : Number(v).toFixed(1)
const fmt0 = v => Number(v).toFixed(0)
const fmt1 = v => Number(v).toFixed(1)
const fmt3 = v => Number(v).toFixed(3)
function ts(s) { if (!s) return '-'; const d = new Date(s); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}` }
const sleep = ms => new Promise(r => setTimeout(r, ms))

// 选中工位位图 (bit0-5 = 工位1-6), 照原软件 %4/%3/%1 命令
function stationMask() {
  let m = 0
  for (let i = 0; i < 6; i++) if (stationChecked.value[i]) m += 1 << i
  return m
}

// 选中的工位数
const selectedCount = computed(() => stationChecked.value.filter(Boolean).length)
const canOperate = computed(() => (connected.value || simMode.value) && inputDone.value && selectedCount.value > 0 && !testing.value)
const canTest = computed(() => canOperate.value)

const devStatusText = computed(() => {
  switch (devStatus.value) {
    case 1: return '状态: 去皮称架重'
    case 2: return '状态: 称干布重'
    case 3: return '状态: 蒸发测试中'
    case 4: return '状态: 滴水称重'
    default: return '状态: 空闲'
  }
})

// ============================================================
// Web Serial 基建 (复用自旧 DryingRate.vue, 简化为单配置)
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
let rxBuf = ''   // ASCII 半帧缓冲

async function startLoop() {
  await stopLoop()           // 先等旧读循环 finally 里 releaseLock() 执行完, 否则 getReader() 抛 "already locked" 被吞 → 新循环静默退出
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
          rxBytes.value += value.length
          const hex = Array.from(value).map(b => b.toString(16).padStart(2, '0')).join(' ').toUpperCase()
          lastRxHex.value = hex.length > 320 ? '…' + hex.slice(-320) : hex
          const dec = new TextDecoder().decode(value)
          rxBuf += dec
          pumpBuffer()
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
    sendHandshake()
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
    handshakeOk.value = false; rxBytes.value = 0; rxFrames.value = 0; lastRxHex.value = ''
    await startLoop()
    sendHandshake()
    ElMessage.success('已连接 ' + baudRate.value + ' 8N1')
  } catch (e) {
    if (e.name !== 'AbortError') ElMessage.error(e.message || '连接失败')
  } finally { connecting.value = false }
}

async function disconnect() {
  await _close(portObj.value)
  portObj.value = null
  connected.value = false
  devStatus.value = 0               // 断开回空闲(可能正停在去皮/称干布/测试某步)
  // 断开为异常终止: 静默重置测试状态, 不触发 compute(残缺序列算出的速率无意义)
  if (testing.value) {
    clearTestTimeout()
    stopSimTest()
    testing.value = false
    statusText.value = '设备已断开, 测试中止'
  }
  ElMessage.info('已断开')
}

const onPortDisconnect = (e) => {
  if (portObj.value && e.port === portObj.value) {
    stopLoop(); connected.value = false; portObj.value = null
    devStatus.value = 0               // 拔线回空闲, 避免右上角卡在旧步骤
    stopSimTest()
    // 拔线: 静默重置测试状态; 原 bug 是 testing 永久为 true 卡死
    if (testing.value) { clearTestTimeout(); testing.value = false; statusText.value = '设备已移除, 测试中止' }
    ElMessage.warning('设备已移除, 测试中止')
  }
}
if (navigator.serial) navigator.serial.addEventListener('disconnect', onPortDisconnect)

// ============================================================
// 帧解析 (ASCII 缓冲, 按 @ / & 起始符切帧, 半帧拼接)
// ============================================================

// 帧定界 —— 长度照反编译 SplitData 的固定下标解析, 修正此前 9B/10B 的错误假设:
//   @ 帧 2 字节; &1 帧 10 字节; &2 帧 11 字节; &3 帧 63 字节
function pumpBuffer() {
  let frames = []
  let i = 0
  while (i < rxBuf.length) {
    const c = rxBuf[i]
    if (c === '@') {
      if (i + 1 >= rxBuf.length) break
      frames.push(rxBuf.substring(i, i + 2)); i += 2
    } else if (c === '&') {
      if (i + 1 >= rxBuf.length) break
      const sub = rxBuf[i + 1]
      let len = 0
      if (sub === '1') len = 10
      else if (sub === '2') len = 11
      else if (sub === '3') len = 63
      else { i++; continue }
      if (rxBuf.length - i < len) break
      frames.push(rxBuf.substring(i, i + len)); i += len
    } else i++
  }
  rxBuf = rxBuf.substring(i)
  for (const f of frames) handleFrame(f)
}

function handleFrame(f) {
  rxFrames.value++
  const c0 = f[0]
  if (c0 === '@') {
    // @<间隔字节> —— 原始字节值, 兼容 ASCII 数字
    const v = f.charCodeAt(1)
    spaceTime.value = (v >= 48 && v <= 57) ? v - 48 : v
    handshakeOk.value = true
    statusText.value = '设备握手成功, 采样间隔 ' + spaceTime.value + 'min'
    return
  }
  if (c0 !== '&') return
  const sub = f[1]
  if (sub === '1') handleStationWeight(f)
  else if (sub === '3') handleBatch3(f)
  // &2: 设备自推结果(时间/速率), 权威计算在后端, 前端只需消费该帧长度保持对齐, 不做实时处理
}

// &1<rtData[2]><站'1'-'6'><6位重量mg> —— 站号 index3, 6 位重量 index4..9 (照反编译 SplitData case"1")
function handleStationWeight(f) {
  const st = f.charCodeAt(3) - 49            // '1'-'6' → 0..5
  if (st < 0 || st > 5) return
  let w = 0
  for (let k = 0; k < 6; k++) {
    const d = f.charCodeAt(4 + k) - 48
    if (d < 0 || d > 9) return            // 非数字 → 帧损坏, 丢弃
    w = w * 10 + d
  }
  switch (devStatus.value) {
    case 1:  // 去皮: 架重
      frameWeight.value[st] = w
      break
    case 2:  // 称干布: 干布重 = 当前 - 架重
      clothWeight.value[st] = w - frameWeight.value[st]
      break
    case 3:
    case 4:  // 测试/滴水: 记原始重量时序, 首点定滴水量, 后续算蒸发量
      onTestWeight(st, w)
      break
    default:
      break
  }
}

// &3<子类'0'架/'1'布/'2'水/'3'蒸发><10站×6位mg> 批量 (63B, 照反编译 SplitData case"3")
// 每站 6 位在原代码从 rtData[8+6k] 递减累乘到 rtData[3+6k] —— index8 是高位(index3 低位),
// 与 &1 的单站正向六位方向相反, 这里照原样镜像(原软件据此与实机跑通)
function handleBatch3(f) {
  const kind = f[2]
  if (kind < '0' || kind > '3') return
  const weights = []
  for (let k = 0; k < 10; k++) {
    let w = 0
    for (let d = 0; d < 6; d++) {
      const c = f.charCodeAt(8 + 6 * k - d) - 48   // 8→3 = 高位→低位
      if (c < 0 || c > 9) return                   // 非数字 → 帧损坏, 整帧丢弃
      w = w * 10 + c
    }
    weights.push(w)
  }
  // 机器 6 工位 → 只写前 6 站; 赋值语义照原代码(架/布/水/蒸发各自直接写入对应数组)
  for (let st = 0; st < 6; st++) {
    const w = weights[st]
    if (kind === '0') frameWeight.value[st] = w
    else if (kind === '1') clothWeight.value[st] = w
    else if (kind === '2') waterWeight.value[st] = w
    else if (kind === '3') curEvap.value[st] = w
  }
}

// 测试中收到某工位重量: 追加原始时序 + 更新蒸发量曲线
function onTestWeight(st, w) {
  rawSeries[st].push(w)
  if (curvePoint.value[st] === 0) {
    // 首点: 定死滴水量 (照后端"只取首点 raw−架−布")
    waterWeight.value[st] = w - frameWeight.value[st] - clothWeight.value[st]
    curveSeries[st] = [0]
    curvePoint.value[st] = 1
    curEvap.value[st] = 0
  } else {
    const evap = waterWeight.value[st] - (w - frameWeight.value[st] - clothWeight.value[st])
    // 负值(称量波动)照常记录: 与后端 evap[k] 逐点一致(原软件 curve_weight 也存负值),
    // 跳过会导致曲线点数错位、maybeAutoStop 的相邻差判定与后端不一致
    curveSeries[st].push(evap)
    curvePoint.value[st]++
    curEvap.value[st] = evap
    maybeAutoStop(st, evap)
  }
  chartOpt.value = buildChartOpt()
}

// 自动终止判定 (照原软件结束条件)
function maybeAutoStop(st, evap) {
  const n = curvePoint.value[st]
  if (n <= 3) return
  const water = waterWeight.value[st]
  let done = false
  if (testMethod.value === 0) {
    done = Math.abs(evap - water) < 5 || Math.abs(evap - curveSeries[st][n - 2]) < 3
  } else {
    done = Math.abs(evap - water) <= 20 || spaceTime.value * (n - 1) >= 60
  }
  if (done) {
    if (curveSeries[st].length >= n && !stationDone[st]) {
      stationDone[st] = true
      statusText.value = '工位' + (st + 1) + ' 已到终止条件'
      if (stationDone.filter(Boolean).length >= selectedCount.value) finishTest()
    }
  }
}

// ============================================================
// 发送命令
// ============================================================

async function sendCmd(cmd) {
  if (simMode.value) return // 仿真模式不真发, 由 simulateResponse 直接喂帧
  const p = portObj.value
  if (!p || !p.writable) return
  const writer = p.writable.getWriter()
  try { await writer.write(new TextEncoder().encode(cmd)) } finally { writer.releaseLock() }
}

function sendHandshake() {
  sendCmd('!!!!!!@1')
  // 原实现 50ms 无条件覆盖状态文字 —— @ 回帧快于定时器时会把"握手成功"刷成"等待",
  // 加 !handshakeOk 守卫: 已成功就不再覆盖
  setTimeout(() => { if (connected.value && !handshakeOk.value) statusText.value = '等待设备握手回帧...' }, 300)
}

// 手动重发握手: 设备可能上电时序晚于串口打开, 首次握手没被收到时重发一次即可建链
function doHandshake() {
  if (simMode.value || !connected.value) return
  handshakeOk.value = false
  statusText.value = '握手命令已重发, 等待设备回帧...'
  sendCmd('!!!!!!@1')
  setTimeout(() => { if (connected.value && !handshakeOk.value) statusText.value = '等待设备握手回帧...' }, 300)
}

function onInput() {
  if (!reportNoReady.value) { ElMessage.warning('请填写报告号序号'); return }
  if (!sampleName.value.trim()) { ElMessage.warning('请填写样品名称'); return }
  inputDone.value = true
  statusText.value = '样品信息已录入'
}

function doTare() {
  const m = stationMask()
  devStatus.value = 1
  statusText.value = '去皮命令已发送, 等待各工位架重...'
  sendCmd('!!!!!!%4' + String.fromCharCode(m))
  if (simMode.value) simulateResponse('tare', m)
}

function doDryCloth() {
  const m = stationMask()
  devStatus.value = 2
  statusText.value = '称干布命令已发送, 等待各工位干布重...'
  sendCmd('!!!!!!%3' + String.fromCharCode(m))
  if (simMode.value) simulateResponse('cloth', m)
}

function doDrip(st) {
  devStatus.value = 4
  statusText.value = '滴水' + st + ' 称重中...'
  sendCmd('!!!!!!%2' + String.fromCharCode(st))
  if (simMode.value) simulateResponse('drip', st)
}

// 全局测试时长兜底: 60min (对齐 GBT2023 方法已有的 sp×(n−1)≥60 时长上限; 2008 方法无上限,
// 设备断帧/波动不满足 ±5mg 判定时测试永久挂起 → 超时强制结束, 后端对永不触发有末点兜底 resultPoint=n)
let testTimeout = null
function armTestTimeout() {
  clearTestTimeout()
  testTimeout = setTimeout(() => {
    if (testing.value) {
      statusText.value = '测试超过 60 分钟, 自动结束'
      ElMessage.info('测试超时(60min), 已自动结束')
      finishTest()
    }
  }, 60 * 60 * 1000)
}
function clearTestTimeout() {
  if (testTimeout) { clearTimeout(testTimeout); testTimeout = null }
}

function doTest() {
  if (!inputDone.value) { ElMessage.warning('请先录入样品信息'); return }
  // 录完后字段可能被清空 → 开始测试前再验一次必填项
  if (!sampleName.value.trim()) { ElMessage.warning('请填写样品名称'); return }
  const m = stationMask()
  if (!m) { ElMessage.warning('请选择测试工位'); return }
  // 校验所选工位已去皮 (架重>0), 防止漏步算出假滴水量
  for (let i = 0; i < 6; i++) {
    if (stationChecked.value[i] && frameWeight.value[i] <= 0) { ElMessage.warning('工位' + (i + 1) + ' 尚未去皮, 请先执行去皮'); return }
  }
  // 报告号必填(测试期间输入框禁用, 无法中途补填): 源头消除"停止后缺号 → finishTest 结果静默丢失"
  if (!reportNoReady.value) { ElMessage.warning('请填写报告号序号'); return }
  // 清掉上一轮计算结果, 防止新旧结果混显 / 误用旧结果生成报告 (P1)
  computeResult.value = null
  testing.value = true
  stationDone = [false, false, false, false, false, false]
  computedForTest = false
  // 清空上一轮曲线数据 (避免原软件跨次残留 bug)
  for (let i = 0; i < 6; i++) { rawSeries[i] = []; curveSeries[i] = []; curvePoint.value[i] = 0; curEvap.value[i] = 0 }
  chartOpt.value = buildChartOpt()   // 立即清空图表(否则 series.data 仍指向上轮旧数组引用)
  devStatus.value = 3
  statusText.value = '测试开始, 等待各工位蒸发数据...'
  armTestTimeout()
  sendCmd('!!!!!!%1' + String.fromCharCode(m))
  if (simMode.value) startSimTest()
}

async function doStop() {
  clearTestTimeout()
  devStatus.value = 0
  statusText.value = '停止命令已发送'
  sendCmd('!!!!!!%00')
  if (simMode.value) stopSimTest()
  finishTest()
}

function doRelease() {
  devStatus.value = 0
  statusText.value = '扩散功能已解除'
  sendCmd('!!!!!!%60')
}

function finishTest() {
  if (computedForTest) return      // 已提交过本轮计算 (自动终止/手动停止只算一次)
  computedForTest = true
  clearTestTimeout()
  stopSimTest()
  testing.value = false
  // 测试结束回空闲: 否则自动结束(全工位到点/60min超时)路径 devStatus 仍卡 3, 右上角一直"蒸发测试中"
  // (手动停止在 doStop 已先置 0, 这里重复置 0 无害)
  devStatus.value = 0
  // 未参与/无数据的工位传空数组, 后端不产生结果
  const stations = []
  for (let i = 0; i < 6; i++) {
    stations.push({
      frameWeightMg: frameWeight.value[i],
      clothWeightMg: clothWeight.value[i],
      rawWeightMg: stationChecked.value[i] ? rawSeries[i] : []
    })
  }
  compute(stations)
}

async function compute(stations) {
  if (!reportNoReady.value) { ElMessage.warning('请填写报告号序号'); return }
  computing.value = true
  try {
    const res = await api.post('/MoistureDryingRate/compute/nf5022', {
      reportNumber: reportNumber.value.trim(),
      sampleName: sampleName.value.trim(),
      temperature: temperature.value,
      humidity: humidity.value,
      spaceTimeMin: spaceTime.value,
      residualMinute: residualMinute.value,
      testMethod: testMethod.value,
      stations
    })
    if (res.data?.isSuccess) {
      computeResult.value = res.data.value
      statusText.value = '计算完成'
    } else {
      ElMessage.error(res.data?.error || '计算失败')
    }
  } catch (e) { ElMessage.error('网络错误: ' + e.message) }
  finally { computing.value = false }
}

// ---- 报告生成 ----
async function generateReport() {
  if (!computeResult.value) { ElMessage.warning('请先完成测试并计算'); return }
  if (!reportNoReady.value) { ElMessage.warning('请填写报告号序号'); return }
  try {
    const res = await api.post('/MoistureDryingRate/report/nf5022', {
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
// 打开对话框拉全量(不带 keyword), 报告号筛选交给 computed —— 改动输入即出结果, 不再打后端。
async function loadHistory() {
  try {
    const res = await api.get('/MoistureDryingRate/reports', { params: { mode: 'nf5022' } })
    historyList.value = res.data?.isSuccess ? res.data.value : []
  } catch (e) { ElMessage.error('查询失败: ' + e.message) }
}
watch(historyVisible, v => { if (v) loadHistory() })

const filteredHistory = computed(() => {
  const keyword = historyKeyword.value.trim().toLowerCase()
  if (!keyword) return historyList.value
  return historyList.value.filter(r => (r.reportNumber || '').toLowerCase().includes(keyword))
})

// 删除报告: 物理删除不可恢复 → 先二次确认; 文件名就是列表给的原名(后端再挡一次路径穿越)
async function deleteFile(row) {
  try {
    await ElMessageBox.confirm(
      `确定删除报告「${row.reportNumber}」吗? 删除后不可恢复。`,
      '删除确认', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
  } catch { return }   // 取消/关闭 → 什么都不做

  try {
    const res = await api.delete(`/MoistureDryingRate/reports/${encodeURIComponent(row.fileName)}`)
    if (!res.data?.isSuccess) { ElMessage.error(res.data?.error || '删除失败'); return }
    ElMessage.success('已删除')
    loadHistory()
  } catch (e) { ElMessage.error('网络错误: ' + e.message) }
}

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
// 仿真模式 (无真机合成帧, 驱动同一套 UI 状态机)
// ============================================================

let simTimer = null
let simSeq = 0

function onSimModeChange() {
  if (simMode.value) {
    ElMessage.info('仿真模式: 合成帧驱动')
  } else {
    stopSimTest()
  }
}

// 仿真响应: 直接喂 handleFrame 同款 ASCII
function simulateResponse(kind, arg) {
  setTimeout(() => {
    if (kind === 'tare') {
      for (let i = 0; i < 6; i++) if (stationChecked.value[i]) handleFrame('&1' + '0' + String.fromCharCode(49 + i) + String(12300 + i * 100).padStart(6, '0'))
    } else if (kind === 'cloth') {
      for (let i = 0; i < 6; i++) if (stationChecked.value[i]) handleFrame('&1' + '0' + String.fromCharCode(49 + i) + String(18300 + i * 50).padStart(6, '0'))
    } else if (kind === 'drip') {
      const st = arg - 1
      handleFrame('&1' + '0' + String.fromCharCode(49 + st) + String(18500 + st * 60).padStart(6, '0'))
    }
  }, 120)
}

function startSimTest(keepSeq = false) {
  if (!keepSeq) simSeq = 0
  stopSimTest()
  simTimer = setInterval(() => {
    simSeq++
    for (let i = 0; i < 6; i++) {
      if (!stationChecked.value[i]) continue
      // 蒸发量从 0 线性升到滴水量 (每点 +12), 秤读数 raw 从 架+布+水 递减到 架+布
      // —— 蒸发时称重必然递减, 与真机 &1 帧方向一致; 用水量取已滴的 waterWeight, 否则首点会把滴水量覆盖成硬编码值
      const water = waterWeight.value[i] || 600
      const evap = Math.min(Math.max(simSeq - 1, 0) * 12, water)
      const raw = frameWeight.value[i] + clothWeight.value[i] + water - evap
      handleFrame('&1' + '0' + String.fromCharCode(49 + i) + String(Math.round(raw)).padStart(6, '0'))
    }
  }, spaceTime.value * 1000) // 仿真按墙钟毫秒快进(真机间隔是分钟), 60× 快放演示; 数值仍按 sp=分钟自洽
}

function stopSimTest() {
  if (simTimer) { clearInterval(simTimer); simTimer = null }
}

// ============================================================
// echarts 蒸发曲线
// ============================================================

const COLORS = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#9c27b0', '#00bcd4']
const chartOpt = ref(buildChartOpt())

function buildChartOpt() {
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: [1, 2, 3, 4, 5, 6].map(i => '工位' + i), top: 0 },
    grid: { left: 45, right: 15, top: 28, bottom: 25 },
    xAxis: { type: 'category', name: '点数', nameTextStyle: { fontSize: 11 } },
    yAxis: { type: 'value', name: '蒸发量(mg)', min: 0, nameTextStyle: { fontSize: 11 } },
    series: Array.from({ length: 6 }, (_, i) => ({
      name: '工位' + (i + 1),
      type: 'line',
      showSymbol: false,
      data: curveSeries[i],
      color: COLORS[i],
      lineStyle: { width: 1.5 }
    }))
  }
}

// ============================================================
// 生命周期 / keep-alive
// ============================================================

function pauseAll() {
  clearTestTimeout()   // 切走清掉超时: 数据冻结期间到点会用冻结果算, 不合理
  stopLoop()
  stopSimTest()
}
async function resumeAll() {
  if (connected.value) await startLoop()
  if (testing.value) armTestTimeout()      // 恢复后重新计时(arm 内部先 clear 再 set, 幂等)
  // keepSeq=true: 恢复时不重置仿真序号, 否则测试中曲线从 0 重头(与已采数据错乱)
  if (simMode.value && testing.value) startSimTest(true)
}

onBeforeUnmount(() => {
  navigator.serial?.removeEventListener('disconnect', onPortDisconnect)
  pauseAll()
  _close(portObj.value).catch(() => { })
  portObj.value = null
})
// keep-alive: 切走时暂停串口/仿真, 切回时恢复 (页面级缓存, 不丢组件状态)
onDeactivated(() => pauseAll())
onActivated(() => resumeAll())
</script>

<style scoped>
* { box-sizing: border-box; }
.allContainer { padding: 14px; box-sizing: border-box; height: 100%; background: linear-gradient(135deg, #f5f7fa 0%, #eef1f6 100%); overflow: auto; }
.main { display: flex; width: 100%; height: 100%; gap: 12px; box-sizing: border-box; min-width: 0; }
.left-panel { width: 24%; min-width: 250px; max-width: 330px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex-shrink: 0; box-sizing: border-box; }
.right-panel { flex: 1; display: flex; flex-direction: column; gap: 12px; min-width: 0; overflow: auto; }
.right-top { flex-shrink: 0; }
.right-bottom { flex-shrink: 0; }
.card { background: #fff; border: 1px solid #e6e8eb; border-radius: 10px; padding: 10px 18px; box-shadow: 0 1px 3px rgba(0,0,0,.04); box-sizing: border-box; width: 100%; }
.card.conn-card .row, .card.conn-card .st { margin-left: 1px; }
.card.conn-card .row { width: calc(100% - 1px); }
.card.conn-card .row :deep(.el-checkbox) { margin-right: 0; }
.ctitle { font-size: 13px; font-weight: 600; color: #2b3a4a; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.ctitle .el-icon { color: #409eff; }
.row { display: flex; align-items: center; gap: 4px; margin-bottom: 6px; width: 100%; }
.row:last-child { margin-bottom: 0; }
.lbl { font-size: 12px; color: #666; font-weight: 500; white-space: nowrap; }
.repno { display: flex; align-items: center; flex-wrap: wrap; gap: 2px; flex: 1; min-width: 0; }
.repno :deep(.el-input), .repno :deep(.el-select) { flex: 1 1 auto; }
.row-col { flex-direction: column; align-items: flex-start; gap: 4px; }
.row-col .repno { width: 100%; }
.st { font-size: 11px; color: #666; display: flex; align-items: center; gap: 4px; margin-top: 4px; word-break: break-all; line-height: 1.4; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: #c0c4cc; transition: all .2s; flex-shrink: 0; }
.dot.on { background: #67c23a; box-shadow: 0 0 4px #67c23a; }
.full-width { width: 100% !important; }
.btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.btn-grid .el-button { margin: 0; }
.drip-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.drip-grid .el-button { margin: 0; }
/* 对话框筛选行: 全局 bootstrap .row 带 -15px 负边距, 用独立类避免筛选框贴边框 */
.filter-row { display: flex; align-items: center; gap: 4px; margin: 0 0 8px; width: 100%; }
.stat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
.stat-cell { background: #f7f8fa; border-radius: 6px; padding: 6px 4px; text-align: center; }
.stat-cell .lbl { font-size: 11px; color: #909399; }
.stat-cell .val { font-size: 13px; font-weight: 600; color: #2b3a4a; font-family: Consolas, monospace; }
:deep(.el-tabs__header) { margin-bottom: 6px; }
/* 清除全局样式 table{margin-bottom:30px} 造成的表头与首行之间的空行 */
.removeTableGaps :deep(table) {
  margin-bottom: 0 !important;
}
</style>
