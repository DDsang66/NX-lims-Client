<template>
  <div class="allContainer instrument-page">
    <div class="main">

      <!-- ==================== 左侧面板 ==================== -->
      <div class="left">

        <!-- 设备连接 -->
        <el-card shadow="hover">
          <template #header>
            <div class="ctitle"><el-icon><Connection /></el-icon>设备连接</div>
          </template>
          <el-form label-position="left" label-width="66px" size="small" @submit.prevent>
            <el-form-item label="天平品牌">
              <el-select v-model="scaleBrand" style="width:130px" :disabled="connected || connecting" @change="onBrandChange">
                <el-option v-for="(b, k) in SCALE_BRANDS" :key="k" :value="k" :label="b.label"/>
              </el-select>
            </el-form-item>
            <el-form-item label="波特率">
              <el-select v-model="baudRate" style="width:90px" :disabled="connected">
                <el-option v-for="b in rates" :key="b" :value="b" :label="String(b)"/>
              </el-select>
            </el-form-item>
            <!-- label-width="0": 无 label 的 form-item 默认吃 form 的 label-width 当 margin-left
                 (element-plus form-item 的 contentStyle), 不显式归零这排按钮会右移 66px -->
            <el-form-item label-width="0">
              <el-button type="primary" size="small" :disabled="connected" :loading="connecting" @click="connect">
                <el-icon><Link /></el-icon>连接设备
              </el-button>
              <el-button type="danger" size="small" :disabled="!connected" @click="disconnect">
                <el-icon><SwitchButton /></el-icon>断开
              </el-button>
            </el-form-item>
          </el-form>
          <div class="st"><el-tag :type="connTag.type" size="small" effect="plain">{{ connTag.text }}</el-tag></div>
          <div v-if="connected" class="st">
            <el-tag :type="massTag.type" size="small" effect="plain">{{ massTag.text }}</el-tag>
          </div>
        </el-card>

        <!-- 质量 -->
        <el-card shadow="hover">
          <template #header>
            <div class="ctitle"><el-icon><ScaleToOriginal /></el-icon>质量 (g/50)</div>
          </template>
          <!-- 框壳保留: 琥珀虚线框=手输, 绿实线框=天平正在读数, 是有用的状态提示 -->
          <div class="wtbox" :class="{live:connected}">
            <el-input-number v-if="!connected" v-model="mass" :precision="3" :min="0" :step="0.001" controls-position="right" style="width:100%" placeholder="手动输入"/>
            <el-statistic v-else-if="mass != null" class="wtstat" :value="mass" :precision="3"/>
            <span v-else class="wtval">---</span>
          </div>
        </el-card>

        <!-- 报告信息 -->
        <el-card shadow="hover">
          <template #header>
            <div class="ctitle"><el-icon><Document /></el-icon>报告信息</div>
          </template>
          <el-form label-position="top" size="small" @submit.prevent>
            <el-form-item label="试样编号">
              <div class="repno">
                <el-input v-model="rep1" style="width:36px" disabled/>
                <el-select v-model="rep2" style="width:66px"><el-option value="405.">405.</el-option><el-option value="441.">441.</el-option></el-select>
                <el-select v-model="rep3" style="width:58px">
                  <el-option :value="twoDigitYear + '.'">{{ twoDigitYear }}</el-option>
                  <el-option :value="(twoDigitYear-1) + '.'">{{ twoDigitYear-1 }}</el-option>
                </el-select>
                <el-input v-model="rep4" style="width:64px" @blur="data4Blur" placeholder="序号"/>
                <el-input v-model="rep5" style="width:52px"/>
              </div>
            </el-form-item>
            <el-form-item>
              <div class="env-row">
                <div class="env-cell">
                  <span class="env-lbl">环境温度(℃)</span>
                  <el-input-number v-model="temp" :precision="1" :min="-50" :max="100" style="width:100%" controls-position="right"/>
                </div>
                <div class="env-cell">
                  <span class="env-lbl">环境湿度(%)</span>
                  <el-input-number v-model="humid" :precision="1" :min="0" :max="100" style="width:100%" controls-position="right"/>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- ==================== 中间按钮 ==================== -->
      <el-card class="mid" shadow="hover">
        <el-space direction="vertical" :size="10" fill>
          <el-button type="primary" round @click="record"><el-icon><CirclePlus /></el-icon>结果记录</el-button>
          <el-button type="warning" round @click="clearCurrent"><el-icon><RefreshLeft /></el-icon>清除当前</el-button>
          <el-button type="danger" round :disabled="!specimens.size" @click="clearAll"><el-icon><Delete /></el-icon>清空全部</el-button>
          <el-button type="success" round :disabled="!specimens.size" @click="doExport"><el-icon><Download /></el-icon>导出Excel</el-button>
          <el-button type="primary" round :disabled="!specimens.size" @click="doReport"><el-icon><Document /></el-icon>生成报告</el-button>
          <el-button round :disabled="!specimens.size" @click="doPrint"><el-icon><Printer /></el-icon>打印</el-button>
        </el-space>
      </el-card>

      <!-- ==================== 右侧面板 ==================== -->
      <div class="right">

        <!-- 当前试样录入 -->
        <el-card shadow="hover">
          <template #header>
            <div class="ctitle" style="justify-content:space-between;">
              <span><el-icon><Grid /></el-icon>当前试样</span>
              <el-text class="hint" size="small" type="info">方向 {{ direction }} 只有 {{ specCount }} 个试样格(模板如此), 与报告表一一对应</el-text>
            </div>
          </template>

          <el-form label-position="left" label-width="48px" size="small" @submit.prevent>            <el-form-item label="方向">
              <el-radio-group v-model="direction">
                <el-radio-button v-for="d in DIRECTIONS" :key="d.name" :value="d.name">{{ d.name }}</el-radio-button>
              </el-radio-group>
              <span class="lbl2">试样号</span>
              <el-select v-model="specIndex" style="width:82px">
                <el-option v-for="i in specCount" :key="i" :value="i" :label="'#' + i"/>
              </el-select>
              <span class="lbl2">已录</span>
              <span class="val">{{ specimens.size }} 个试样</span>
            </el-form-item>
          </el-form>

          <el-row :gutter="4" justify="space-between" class="len-grid">
            <el-col v-for="i in LENGTH_COUNT" :key="i" :span="2">
              <div class="len-cell">
                <el-text class="len-idx" size="small" type="info">{{ i }}</el-text>
                <el-input-number v-model="lengths[i - 1]" :precision="2" :min="0" :step="0.1" :controls="false" size="small" style="width:100%"/>
              </div>
            </el-col>
          </el-row>

          <el-descriptions :column="3" size="small" border>
            <el-descriptions-item label="Average(cm)">{{ fmt(liveAverage, 2) }}</el-descriptions-item>
            <el-descriptions-item label="Mass(g/50)">{{ fmt(liveMass, 3) }}</el-descriptions-item>
            <el-descriptions-item label="Tex"><span class="hl">{{ fmt(liveTex, 2) }}</span></el-descriptions-item>
          </el-descriptions>
          <el-text class="hint block" size="small" type="info">Tex = Mass × 200 ÷ Average（平均与质量都按报告上的位数先舍入）</el-text>
        </el-card>

        <!-- 记录网格: 行 = 长度 1..10 / Average / Mass / Tex, 列 = 模板各试样格 -->
        <el-card class="gridcard card-stack" shadow="hover">
          <template #header>
            <div class="ctitle">
              <el-icon><Grid /></el-icon>记录网格
              <el-text class="hint" size="small" type="info">与报告表逐格对应</el-text>
            </div>
          </template>
          <div class="tbl-wrap">
            <el-table :data="gridData" border stripe size="small">
              <el-table-column prop="label" label="" width="112" fixed/>
              <el-table-column v-for="(c, i) in gridCols" :key="c.key" :prop="'c' + i" width="98" align="right">
                <template #header>
                  <span class="gh">
                    {{ c.label }}
                    <el-button v-if="c.data" class="delx" link type="danger" size="small" title="删除该试样" @click="removeSpecimen(c)">
                      <el-icon><Close /></el-icon>
                    </el-button>
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

        <!-- 汇总: 表0 的 R6/R7/R9 三格 -->
        <el-card shadow="hover">
          <el-descriptions :column="3" size="small" border>
            <el-descriptions-item label="Warp (Tex)"><span class="sum">{{ fmt(warpTex, 2) }}</span></el-descriptions-item>
            <el-descriptions-item label="Weft (Tex)"><span class="sum">{{ fmt(weftTex, 2) }}</span></el-descriptions-item>
            <el-descriptions-item label="Knit (Tex)"><span class="sum">{{ fmt(knitTex, 2) }}</span></el-descriptions-item>
          </el-descriptions>
          <el-text class="hint block" size="small" type="info">三个方向同口径 = 该方向各试样 Tex 的算术平均；没测的方向报告该格空白</el-text>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onBeforeUnmount, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Connection, Link, SwitchButton, ScaleToOriginal, Grid, CirclePlus, RefreshLeft, Delete, Download, Printer, Document, Close } from '@element-plus/icons-vue'

const api = inject('request')

// ---- 口径常量: 与后端 YarnCountReportRequestDto 的常量一一对应 ----
// 页面即时显示的数就是报告上要印的数, 两边必须逐位一致, 改一处就得改另一处。
// 方向表与模板表1 的 R0(Warp | Weft | Knit)按序对应, count 是该方向的试样列数。
// 2026-09 模板改版: 原为 Warp 2 / Weft 5, 现三方向各 2 列; Knit 也从"页面手工输入一个汇总值"
// 改为与经纬向同口径按试样测, 所以三个方向走的是同一条链路, 不再有特例分支。
const DIRECTIONS = [
  { name: 'Warp', count: 2 },
  { name: 'Weft', count: 2 },
  { name: 'Knit', count: 2 },
]

// 方向写错时**抛异常**, 不兜底成某个方向 —— 与后端 YarnCountDocxEngine.ColumnOf 同一原则:
// 静默走错分支会把数字填进别人的列, 比当场报错难查得多。
function countOf(dir) {
  const d = DIRECTIONS.find(x => x.name === dir)
  if (!d) throw new Error(`未知方向: ${dir}`)
  return d.count
}

const LENGTH_COUNT = 10      // 每试样 10 个长度读数
const LENGTH_DECIMALS = 2
const AVERAGE_DECIMALS = 2
const MASS_DECIMALS = 3
const TEX_DECIMALS = 2

// ---- 状态 ----
const baudRate = ref(19200)
const rates = [1200, 2400, 4800, 9600, 19200, 38400]
// ---- 天平品牌适配 (Sartorius / Mettler Toledo) ----
// 每种品牌独立: 默认波特率 / 串口配置尝试列表 / DTR-RTS 握手方式 / 重量解析函数。
const UNIT_TO_G = { g: 1, kg: 1000, mg: 0.001 }
// 行尾可能带 \r 或 \r\n(startLoop 已按 \n 拆行, 这里兼容仅 \r 结尾的帧)
const METTLER_STABLE_RE = /^S[DI]?\s+([+-]?\d+\.\d+)\s*(g|kg|mg)?\r?$/i
const METTLER_BARE_RE = /^([+-]?\d+\.\d+)\s*(g|kg|mg)?\r?$/

// 统一换算到克(页面 mass 语义是克, 避免天平设成 kg/mg 时记错倍数)
function toGrams(num, unit) {
  const k = (unit || 'g').toLowerCase()
  return num * (UNIT_TO_G[k] ?? 1)
}

// 梅特勒: 1) 优先锚定 S/SI/SD 稳定帧; 2) 回退无前缀完整帧;
//          3) 带空格状态帧(如 S D 2.560 g — ME403 实测形态, S 与 D 间有空格)取末尾数字;
//          4) 其它丢弃(保留上次值)
function matchMettler(line) {
  // 剥前导 ASCII 空白 + 控制字符(如 ESC)再锚定
  let i = 0
  while (i < line.length && (line.charCodeAt(i) <= 32)) i++
  const s = line.slice(i).trim()
  let m = s.match(METTLER_STABLE_RE)
  if (m) return toGrams(parseFloat(m[1]), m[2])
  m = s.match(METTLER_BARE_RE)
  if (m) return toGrams(parseFloat(m[1]), m[2])
  // S 开头的状态帧(无论 S/SI/SD/S D/S I), 取行尾"数字+可选单位"
  if (/^S[ DI]?\s/i.test(s)) {
    m = s.match(/([+-]?\d+\.\d+)\s*(g|kg|mg)?\s*$/)
    if (m) return toGrams(parseFloat(m[1]), m[2])
  }
  return null
}

const SCALE_BRANDS = {
  sartorius: {
    label: 'Sartorius',
    defaultBaud: 1200,
    signals: 'edge',    // 保留 DTR/RTS 边沿触发(拉低120ms→拉高, 触发天平输出使能)
    cfgs: [
      { dataBits: 7, parity: 'odd',  stopBits: 1 },
      { dataBits: 8, parity: 'odd',  stopBits: 1 },
      { dataBits: 7, parity: 'even', stopBits: 1 },
      { dataBits: 8, parity: 'none', stopBits: 1 },
      { dataBits: 7, parity: 'odd',  stopBits: 1, flowControl: 'hardware' },
    ],
    parse(line) {
      const m = line.trim().match(/([+-]?\d+\.\d+)/)
      return m ? parseFloat(m[1]) : null
    },
  },
  mettler: {
    label: 'Mettler Toledo',
    defaultBaud: 9600,
    signals: 'none',    // 标准 RS-232 被动输出, 不做 DTR/RTS 操作
    cfgs: [
      { dataBits: 8, parity: 'none', stopBits: 1 },     // 8N1 标准默认(命中率最高)
      { dataBits: 7, parity: 'even', stopBits: 1 },     // 7E1 常见回退
      { dataBits: 7, parity: 'odd',  stopBits: 1 },
      { dataBits: 8, parity: 'even', stopBits: 1 },
      { dataBits: 7, parity: 'none', stopBits: 1 },
    ],
    parse: matchMettler,
  },
}
const scaleBrand = ref('sartorius')

// 解析分发(供 startLoop 调用)
function matchWeight(line) {
  const brand = SCALE_BRANDS[scaleBrand.value]
  return brand && typeof brand.parse === 'function' ? brand.parse(line) : null
}
const connected = ref(false)
const connecting = ref(false)
const cfgInfo = ref('')
const portObj = ref(null)
const portCfg = ref(null)  // 实际打开的端口配置 {dataBits,parity,...}
const mass = ref(null)     // 质量 (g/50): 连了天平就是实时读数, 没连就是手输框
const lastRxTime = ref(0)  // 最近一次收到串口数据的时间戳

// 连接状态标签: 文字与颜色一起给, 模板里不再写嵌套三元
const connTag = computed(() => {
  if (connecting.value) return { type: 'warning', text: '连接中...' }
  if (connected.value) return { type: 'success', text: '已连接 ' + cfgInfo.value }
  return { type: 'info', text: '未连接 — 可手动输入' }
})
const massTag = computed(() => mass.value != null
  ? { type: 'success', text: '读取正常: ' + mass.value.toFixed(3) }
  : { type: 'info', text: '等待数据... 按天平 PRINT 键' })

// ---- 试样编号(五段式, 与 PhysicalWeight 同一规则): 87. + 405./441. + 两位年份. + 4位序号 + .01 ----
const twoDigitYear = new Date().getFullYear() % 100
const rep1 = ref('87.')
const rep2 = ref('405.')
const rep3 = ref(`${twoDigitYear}.`)
const rep4 = ref('')
const rep5 = ref('.01')
const sid = computed(() => rep1.value + rep2.value + rep3.value + rep4.value + rep5.value)
const data4Blur = () => {
  if (!rep4.value) return
  if (!/^\d+$/.test(rep4.value)) {
    rep4.value = ''
    ElMessage.warning('序号请输入纯数字')
    return
  }
  rep4.value = String(Number(rep4.value))
  if (rep4.value.length < 4) rep4.value = rep4.value.padStart(4, '0')
}
const temp = ref(null)
const humid = ref(null)

// ---- 当前试样录入 ----
const direction = ref('Warp')
const specIndex = ref(1)
const specCount = computed(() => countOf(direction.value))
const lengths = reactive(Array(LENGTH_COUNT).fill(null))

// ---- 已录试样: key = "Warp#1" → { direction, index, lengths, average, mass, tex, t } ----
const specimens = reactive(new Map())
const keyOf = (dir, idx) => `${dir}#${idx}`

// ---- 算数: 与后端 YarnCountMath 同一套口径 ----

// decimal + AwayFromZero 的等价物。先按相对量补一点点再舍, 免得恰在 .5 上的值
// (如 10 个读数平均出 50.005)因 double 表示误差被舍到另一侧, 与后端差最后一位。
function roundTo(v, d) {
  if (v == null || !Number.isFinite(v)) return null
  const p = Math.pow(10, d)
  const x = v * p
  const fix = Math.abs(x) * 1e-9   // 远大于 double 误差(1e-16), 远小于半个最低位
  return Math.round(x + (x >= 0 ? fix : -fix)) / p
}

// 只算有数的槽位; 一个都没填 → null(没测就是没测, 不是 0)
function averageOf(list) {
  const nums = list.filter(v => v != null && v !== '' && Number.isFinite(+v)).map(v => roundTo(+v, LENGTH_DECIMALS))
  if (!nums.length) return null
  return roundTo(nums.reduce((a, b) => a + b, 0) / nums.length, AVERAGE_DECIMALS)
}

// Tex = (Mass ÷ 50 × 100) ÷ (Average ÷ 100) = Mass × 200 ÷ Average。
// 用**已舍入**的 Average/Mass —— 审核拿报告上印的两个数手算, 能复现出同一个 Tex。
function texOf(average, mass) {
  if (average == null || mass == null || average <= 0) return null
  return roundTo(mass * 200 / average, TEX_DECIMALS)
}

// 方向汇总 = 该方向各试样 Tex 的算术平均(等权), 算不出 Tex 的试样不拉低汇总
function meanTex(dir) {
  const list = []
  for (let i = 1; i <= countOf(dir); i++) {
    const s = specimens.get(keyOf(dir, i))
    if (s?.tex != null) list.push(s.tex)
  }
  if (!list.length) return null
  return roundTo(list.reduce((a, b) => a + b, 0) / list.length, TEX_DECIMALS)
}

const liveAverage = computed(() => averageOf(lengths))
const liveMass = computed(() => roundTo(mass.value, MASS_DECIMALS))
const liveTex = computed(() => texOf(liveAverage.value, liveMass.value))
const warpTex = computed(() => meanTex('Warp'))
const weftTex = computed(() => meanTex('Weft'))
// Knit 与经纬向同口径: 针织各试样 Tex 的算术平均(不再是手工输入)
const knitTex = computed(() => meanTex('Knit'))

// 数字显示: 没有数就显示破折号(与报告留空对应)
const fmt = (v, d) => (v == null || !Number.isFinite(v) ? '—' : v.toFixed(d))

// 切方向: 试样号跳到该方向第一个还没录的格子(Warp #3 不存在, 所以这里必须夹回 1..specCount)
watch(direction, () => { specIndex.value = firstFreeIndex(direction.value) })

function firstFreeIndex(dir) {
  const count = countOf(dir)
  for (let i = 1; i <= count; i++) if (!specimens.has(keyOf(dir, i))) return i
  return count
}

// ---- 记录网格: 行跟着模板表1 的行序走, 列跟着格序走, 方便肉眼对报告 ----
const GRID_ROWS = [
  ...Array.from({ length: LENGTH_COUNT }, (_, i) => ({
    label: `${i + 1}. (cm)`,
    cell: s => s?.lengths?.[i],
    dec: LENGTH_DECIMALS
  })),
  { label: 'Average(cm)', cell: s => s?.average, dec: AVERAGE_DECIMALS },
  { label: 'Mass(g/50)',  cell: s => s?.mass,    dec: MASS_DECIMALS },
  { label: 'Tex',         cell: s => s?.tex,     dec: TEX_DECIMALS },
]

const gridCols = computed(() => {
  const cols = []
  for (const d of DIRECTIONS)
    for (let i = 1; i <= d.count; i++) cols.push(colOf(d.name, i))
  return cols
})
const colOf = (dir, idx) => ({
  key: keyOf(dir, idx),
  label: `${dir} #${idx}`,
  dir,
  idx,
  data: specimens.get(keyOf(dir, idx)) ?? null
})

const gridData = computed(() => GRID_ROWS.map(r => {
  const row = { label: r.label }
  gridCols.value.forEach((c, i) => {
    const v = r.cell(c.data)
    row['c' + i] = v != null ? (+v).toFixed(r.dec) : ''
  })
  return row
}))

// ---- 串口底层 ----
// 注意: USB转串口多数不支持硬件流控, 优先用非流控 + 手动DTR/RTS模拟握手
async function _open(port, baud) {
  const brand = SCALE_BRANDS[scaleBrand.value]
  const cfgs = brand.cfgs.map(c => ({ baudRate: baud, ...c }))
  let lastErr
  for (const c of cfgs) {
    try { await port.open(c); return c }
    catch (e) { lastErr = e; try { await port.close() } catch (_) {} }
  }
  throw lastErr || new Error('unable to open')
}

// 按品牌执行开端口后的信号握手(边沿触发仅 Sartorius 需要)
async function _applySignals(port) {
  const brand = SCALE_BRANDS[scaleBrand.value]
  if (brand.signals === 'edge') {
    // 复位握手: 先拉低 → 等待 → 拉高, 制造边沿重新触发天平输出使能
    try { await port.setSignals({ dataTerminalReady: false, requestToSend: false }) } catch (_) {}
    await sleep(120)
    try { await port.setSignals({ dataTerminalReady: true, requestToSend: true }) } catch (_) {}
  } else if (brand.signals === 'high') {
    // 预留: 若梅特勒实测需要 DTR 高电平(少数型号把 DTR 当数据请求), 改成 'high' 即可
    try { await port.setSignals({ dataTerminalReady: true, requestToSend: true }) } catch (_) {}
  }
  // 'none' → 完全不动 DTR/RTS
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
    cfgInfo.value = SCALE_BRANDS[scaleBrand.value].label + ' | ' + cfg.baudRate + ' ' + cfg.dataBits + cfg.parity.charAt(0) + cfg.stopBits + (cfg.flowControl ? ' hw' : '')
    portObj.value = p
    portCfg.value = cfg
    connected.value = true
    recoverCount = 0        // 重连计数复位
    await _applySignals(p)  // 按品牌握手(仅 Sartorius 边沿触发, Mettler 跳过)
    startLoop()
    ElMessage.success('已连接 ' + SCALE_BRANDS[scaleBrand.value].label)
  } catch (e) {
    if (e.name !== 'AbortError') ElMessage.error(e.message || '连接失败')
  } finally { connecting.value = false }
}

// 切换品牌(仅在未连接时触发, 下拉已 disabled 保护): 重置波特率为该品牌默认, 清旧配置
function onBrandChange() {
  baudRate.value = SCALE_BRANDS[scaleBrand.value].defaultBaud
  cfgInfo.value = ''
  portCfg.value = null
  // 不动 mass.value: 未连接时可能是手动输入的质量
}

async function disconnect() {
  await _close(portObj.value)   // 等读取循环退出后再关端口
  portObj.value = null
  connected.value = false
  mass.value = null
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
          // 按行拆分(兼容 \n 或 \r 行分隔符; 梅特勒 SICS 可能只发 \r), 攒够一行才解析
          const parts = buf.split(/\r?\n|\r/)
          buf = parts.pop() || ''
          for (const part of parts) {
            const w = matchWeight(part)   // 按当前品牌解析(Sartorius 无锚定 / Mettler 锚定稳定帧)
            if (w != null) mass.value = w
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
    await _applySignals(p)                         // 按品牌握手(重连与初连一致)
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
    stopLoop(); connected.value = false; portObj.value = null; mass.value = null
    ElMessage.warning('设备已拔出')
  }
}
navigator.serial?.addEventListener('disconnect', onPortDisconnect)

// ---- 业务 ----
async function record() {
  const dir = direction.value, idx = specIndex.value
  const filled = lengths.filter(v => v != null && v !== '')
  if (!filled.length) { ElMessage.warning('请先填长度读数'); return }
  if (filled.some(v => !(+v > 0))) { ElMessage.warning('长度需 > 0'); return }
  if (liveMass.value == null || liveMass.value <= 0) { ElMessage.warning('质量 > 0（接天平或手动输入）'); return }

  const key = keyOf(dir, idx)
  if (specimens.has(key)) {
    try {
      await ElMessageBox.confirm(`${dir} #${idx} 已有数据，覆盖？`, '确认', { type: 'warning' })
    } catch { return }
  }

  const average = liveAverage.value
  const m = liveMass.value
  specimens.set(key, {
    direction: dir,
    index: idx,
    lengths: lengths.map(v => (v == null || v === '') ? null : roundTo(+v, LENGTH_DECIMALS)),
    average,
    mass: m,
    tex: texOf(average, m),
    t: new Date().toISOString()
  })
  ElMessage.success(`${dir} #${idx} 已记录  Average=${average.toFixed(2)}  Mass=${m.toFixed(3)}  Tex=${specimens.get(key).tex ?? '—'}`)

  // 自动跳到下一个空格子, 省得每次手点; 同方向录满了就留在原地
  clearCurrent()
  specIndex.value = firstFreeIndex(dir)
}

function clearCurrent() {
  lengths.fill(null)
  // 连着天平的时候 mass 是天平的实时值, 清了也会被下一帧刷回来, 干脆不动
  if (!connected.value) mass.value = null
}

function removeSpecimen(c) {
  specimens.delete(c.key)
  ElMessage.success(`已删除 ${c.label}`)
  specIndex.value = firstFreeIndex(direction.value)
}

async function clearAll() {
  if (!specimens.size) return
  try {
    await ElMessageBox.confirm(`确定要清空全部 ${specimens.size} 个试样吗？`, '确认', { type: 'warning' })
    specimens.clear()
    clearCurrent()
    specIndex.value = firstFreeIndex(direction.value)
  } catch { /* */ }
}

// 提交/导出前的范围兜底: 清掉试样号超出该方向列数的条目。
//
// 正常路径下不会有(录入时按 specCount 限过号), 但 specimens 是 Map 而不是从网格反推的列表 ——
// keep-alive 或 HMR 跨版本时里面可能留着旧编号的记录(比如模板改成 Weft 2 列之前录的 Weft#3),
// 它们**不在网格里、没有删除按钮、却照样提交**, 被后端整单拒绝后操作员看不到也删不掉肇事者。
// 方向认不出来的一并按超范围处理(不抛异常: 这里要的是能收尾, 不是中断导出)。
function dropOutOfRange() {
  const dropped = []
  for (const s of [...specimens.values()]) {
    const max = DIRECTIONS.find(d => d.name === s.direction)?.count ?? 0
    if (s.index < 1 || s.index > max) {
      specimens.delete(keyOf(s.direction, s.index))
      dropped.push(`${s.direction} #${s.index}`)
    }
  }
  if (dropped.length) ElMessage.warning(`已忽略超出模板列数的记录: ${dropped.join('、')}`)
}

async function doExport() {
  if (!specimens.size) return
  dropOutOfRange()
  if (!specimens.size) { ElMessage.warning('没有可导出的试样数据'); return }
  const XLSX = await import('xlsx')
  const list = [...specimens.values()].sort((a, b) => a.direction.localeCompare(b.direction) || a.index - b.index)
  const ws = XLSX.utils.json_to_sheet(list.map(s => {
    const o = { '方向': s.direction, '试样号': '#' + s.index }
    for (let i = 0; i < LENGTH_COUNT; i++) o[`长度${i + 1}(cm)`] = s.lengths[i]?.toFixed(LENGTH_DECIMALS) ?? ''
    o['Average(cm)'] = s.average?.toFixed(AVERAGE_DECIMALS) ?? ''
    o['Mass(g/50)'] = s.mass?.toFixed(MASS_DECIMALS) ?? ''
    o['Tex'] = s.tex?.toFixed(TEX_DECIMALS) ?? ''
    o['测试时间'] = ts(s.t)
    return o
  }))
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'YarnCount')
  XLSX.writeFile(wb, `YarnCount_${new Date().toISOString().slice(0, 10)}.xlsx`)
  ElMessage.success('导出成功')
}

// 生成 docx 报告: 后端按 PHY_YarnCount.docx 填格并返回下载地址(平均/Tex 一律以后端算的为准)
async function doReport() {
  if (!specimens.size) { ElMessage.warning('请先记录数据'); return }
  if (!sid.value.trim()) { ElMessage.warning('请先填写试样编号(报告号)'); return }
  dropOutOfRange()
  if (!specimens.size) { ElMessage.warning('没有可提交的试样数据'); return }
  try {
    const res = await api.post('/YarnCountReport/report', {
      reportNumber: sid.value.trim(),
      environmentTemperature: temp.value,
      environmentHumidity: humid.value,
      // 三个方向都传(没测的方向 specimens 为空, 会被下面 filter 掉 → 后端该方向汇总留空)。
      // Knit 不再单独传: 它现在跟经纬向一样由试样算出, 后端取该方向各试样 Tex 的算术平均。
      // 长度原样带上 10 个槽位(含空槽): 模板第 1~10 行是固定的, 空槽留空才对齐行号
      directions: DIRECTIONS.map(d => ({
        direction: d.name,
        specimens: [...specimens.values()]
          .filter(s => s.direction === d.name)
          .sort((a, b) => a.index - b.index)
          .map(s => ({ index: s.index, lengths: s.lengths, mass: s.mass }))
      })).filter(d => d.specimens.length)
    })
    if (!res.data?.isSuccess) { ElMessage.error(res.data?.error || '生成失败'); return }
    const { downloadUrl, fileName } = res.data.value
    ElMessage.success('生成成功,开始下载')
    // downloadUrl 是 /api/... 相对路径, 需拼后端 origin(不能走 axios baseURL, 会重复 /api)
    const backendOrigin = new URL(api.defaults.baseURL).origin
    const resp = await api.get(backendOrigin + downloadUrl, { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([resp.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }))
    const a = document.createElement('a'); a.href = url; a.download = fileName
    a.style.display = 'none'; document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  } catch (e) { ElMessage.error('网络错误: ' + e.message) }
}

function doPrint() { window.print() }

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
/* 容器/卡片内边距/表单间距/table 下边距这些 5 页共用的部分在
   src/assets/css/instrument-panel.css(靠根节点的 .instrument-page 生效),
   这里只留本页特有的类。 */

/* 左右侧列 —— 左列要放得下五段式试样编号(36+66+58+64+52=276px), 比宽重要 */
.left { width: 320px; display: flex; flex-direction: column; justify-content: center; gap: 12px; flex-shrink: 0; overflow-y: auto; }
.right { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 0; }

/* 卡片标题(el-card__header 自带内边距与下边框, 所以这里不要 margin-bottom) */
.ctitle { font-size: 13px; font-weight: 600; color: #2b3a4a; display: flex; align-items: center; gap: 6px; }
.ctitle .el-icon { color: #409eff; }

.hint { font-size: 11px; color: #909399; font-weight: 400; }
.hint.block { display: block; margin-top: 8px; }
.lbl2 { font-size: 12px; color: #666; white-space: nowrap; margin-left: 10px; }
.val { font-size: 12px; color: #2b3a4a; font-family: Consolas, monospace; }

/* 连接状态: 两行 tag 竖排(st 自己撑满一行, 不靠卡片的 flex 列) */
.st { margin-top: 8px; display: flex; align-items: center; }

/* 质量框: 框壳保留(琥珀虚线=手输, 绿实线=天平正在读数), 框里的大数字交给 el-statistic */
.wtbox { padding: 12px; border-radius: 8px; text-align: center; min-height: 56px; display: flex; align-items: center; justify-content: center; background: #fdf6ec; border: 1px dashed #e6a23c; transition: all .25s; }
.wtbox.live { background: #f0f9eb; border: 2px solid #67c23a; }
.wtval { font-size: 30px; font-weight: 700; font-family: 'Consolas', 'Courier New', monospace; color: #1f3d2b; }
.wtstat :deep(.el-statistic__content) { font-size: 30px; font-weight: 700; font-family: 'Consolas', 'Courier New', monospace; color: #1f3d2b; }

/* 五段式编号: 各段宽度是调好的(合计 276px 刚好一行), 用页面独有的 flex 容器而不用 el-space
   —— el-space 会给每个子项挂 flex:1(basis 0), 那几条 width 会被忽略, 五段就摊平了 */
.repno { display: flex; align-items: center; flex-wrap: wrap; gap: 3px; }

/* 温度/湿度并排各占一半。标签在控件上方 —— 卡片内容区只有 308px, 一行放不下
   左侧标签位("环境温度(℃)"自己就 84px)再跟一个 104px 的输入框。
   样式与上面"试样编号"的 label-top 标签保持一致(12px / #606266)。 */
.env-row { display: flex; gap: 8px; width: 100%; }
.env-cell { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.env-lbl { font-size: 12px; color: #606266; line-height: 1.4; }

/* 中间按钮列: 高度贴内容, 竖向居中于 .main */
.mid { flex-shrink: 0; align-self: center; width: 138px; }
/* el-space 默认 inline-flex(收缩到内容宽), 要撑满卡片才谈得上按钮等宽 */
.mid :deep(.el-space) { display: flex; width: 100%; }
.mid .el-button .el-icon { margin-right: 4px; }

/* 10 个长度读数: 一格一个, 号码在框上方 */
.len-grid { margin: 4px 0 10px; }
.len-cell { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 0; }
.len-idx { font-size: 11px; color: #909399; }
/* el-input--small 的 wrapper 左右各有 7px 内边距, el-col 只有 span=2 那么宽, 收窄补回文字宽度 */
.len-cell :deep(.el-input__wrapper) { padding: 1px 4px; }
.len-cell :deep(.el-input__inner) { text-align: center; padding: 0; }

/* 即时读数/汇总里的强调数字 */
.hl { color: #409eff; font-weight: 600; font-family: 'Consolas', 'Courier New', monospace; font-size: 16px; }
.sum { color: #409eff; font-weight: 600; font-family: 'Consolas', 'Courier New', monospace; font-size: 16px; }

/* 记录网格: 15 行紧跟模板表1, 给足高度。.gridcard 是 el-card, .card-stack 让内容区变 flex 列 */
.gridcard { flex: 1; min-height: 0; }
.tbl-wrap { flex: 1; min-height: 0; overflow: hidden; }
.tbl-wrap :deep(.el-table) { height: 100%; }
.tbl-wrap :deep(.el-table__inner-wrapper) { height: 100%; }
.tbl-wrap :deep(.el-table__body-wrapper) { height: calc(100% - 40px); overflow-y: auto; }

.gh { display: inline-flex; align-items: center; gap: 3px; }
.delx { color: #c0c4cc; height: auto; padding: 0; }
.delx:hover { color: #f56c6c; }
</style>
