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
          <el-form label-position="left" label-width="62px" size="small" @submit.prevent>
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
                 (element-plus form-item 的 contentStyle), 不显式归零这排按钮会右移 62px 并被挤到换行 -->
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
            <el-tag :type="weightTag.type" size="small" effect="plain">{{ weightTag.text }}</el-tag>
          </div>
        </el-card>

        <!-- 重量 -->
        <el-card shadow="hover">
          <template #header>
            <div class="ctitle"><el-icon><ScaleToOriginal /></el-icon>重量 (g)</div>
          </template>
          <!-- 框壳保留: 琥珀虚线框=手输, 绿实线框=天平正在读数 -->
          <div class="wtbox" :class="{live:connected}">
            <el-input-number v-if="!connected" v-model="weight" :precision="3" :min="0" :step="0.001" controls-position="right" style="width:100%" placeholder="手动输入"/>
            <el-statistic v-else-if="weight != null" class="wtstat" :value="weight" :precision="3"/>
            <span v-else class="wtval">---</span>
          </div>
        </el-card>

        <!-- 测试类型切换 -->
        <el-card shadow="hover">
          <template #header>
            <div class="ctitle"><el-icon><Grid /></el-icon>测试类型</div>
          </template>
          <el-radio-group v-model="testType" class="tt-group" size="small" @change="onTestTypeChange">
            <el-radio-button value="area" style="width:33.33%">面积克重</el-radio-button>
            <el-radio-button value="length" style="width:33.33%" :disabled="!supportsType('length')">长度克重</el-radio-button>
            <el-radio-button value="piece" style="width:33.33%" :disabled="!supportsType('piece')">条重</el-radio-button>
          </el-radio-group>
          <div class="st"><el-text size="small" type="info">{{ TYPE_LABEL[testType] }}</el-text></div>
          <div v-if="!supportsType('length')" class="st">
            <el-tag type="warning" size="small" effect="plain">{{ buyer }} 报告模板只有面积克重的列</el-tag>
          </div>
        </el-card>

        <!-- 试样面积 (面积克重) -->
        <el-card v-if="testType==='area'" shadow="hover">
          <template #header>
            <div class="ctitle" style="justify-content:space-between;">
              <span><el-icon><Grid /></el-icon>试样面积 (cm²)</span>
              <el-switch v-model="areaByCalc" size="small" active-text="长×宽" inactive-text="直接" style="--el-switch-on-color:#409eff;" />
            </div>
          </template>
          <el-form size="small" @submit.prevent>
            <template v-if="areaByCalc">
              <el-form-item>
                <div class="pair">
                  <span class="lbl">长</span>
                  <el-input-number v-model="areaLen" :precision="2" :min="0" :step="1" controls-position="right" style="flex:1;width:0" placeholder="cm"/>
                  <span class="lbl">宽</span>
                  <el-input-number v-model="areaWid" :precision="2" :min="0" :step="1" controls-position="right" style="flex:1;width:0" placeholder="cm"/>
                </div>
              </el-form-item>
              <el-text v-if="areaLen>0 && areaWid>0" class="hint block" size="small" type="info">= {{ areaValue }} cm²</el-text>
            </template>
            <!-- NEXT 直接模式: 单块试样固定 100 cm², 不填(一次称 N 块时靠下面的样品数乘出总面积) -->
            <el-form-item v-else>
              <el-input-number v-if="areaFixed" :model-value="NEXT_AREA" disabled :precision="2" controls-position="right" style="width:100%"/>
              <el-input-number v-else v-model="area" :precision="2" :min="0" :step="1" controls-position="right" style="width:100%" placeholder="输入面积"/>
            </el-form-item>
            <el-text v-if="areaFixed" class="hint block" size="small" type="info">NEXT 单块固定 100 cm², 总面积 = 样品数 × 100</el-text>
            <!-- FOCUS 报告汇总表有 g/m 那一列, 面积模式下页面没有长度可录 → 每条记录单独录一次长度 -->
            <el-form-item v-if="buyer==='FOCUS'">
              <div class="pair">
                <span class="lbl">长度</span>
                <el-input-number v-model="focusLen" :precision="2" :min="0" :step="1" controls-position="right" style="flex:1;width:0" placeholder="cm (算 g/m)"/>
              </div>
            </el-form-item>
            <el-text v-if="buyer==='FOCUS' && focusLen>0" class="hint block" size="small" type="info">g/m = 重量 ÷ 长度 × 100</el-text>
            <!-- NEXT 登记表要 Number of sample: 该次称重覆盖了几块试样, 每条记录录一次 -->
            <el-form-item v-if="buyer==='NEXT'">
              <div class="pair">
                <span class="lbl">样品数</span>
                <el-input-number v-model="sampleCount" :precision="0" :min="1" :step="1" controls-position="right" style="flex:1;width:0" placeholder="样品数 (默认1)"/>
              </div>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 试样长度 (长度克重) -->
        <el-card v-if="testType==='length'" shadow="hover">
          <template #header>
            <div class="ctitle"><el-icon><Grid /></el-icon>试样长度 (cm)</div>
          </template>
          <el-form size="small" @submit.prevent>
            <el-form-item>
              <el-input-number v-model="lengthCm" :precision="2" :min="0" :step="1" controls-position="right" style="width:100%" placeholder="输入长度 cm"/>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 试样条重 (条重) -->
        <el-card v-if="testType==='piece'" shadow="hover">
          <template #header>
            <div class="ctitle"><el-icon><Grid /></el-icon>试样条重 (piece)</div>
          </template>
          <el-form size="small" @submit.prevent>
            <el-form-item>
              <el-input-number v-model="pieceCount" :precision="0" :min="1" :step="1" controls-position="right" style="width:100%" placeholder="称重条数 (默认12)"/>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- ==================== 中间按钮 ==================== -->
      <el-card class="mid" shadow="hover">
        <el-space direction="vertical" :size="10" fill>
          <el-button type="primary" round @click="record"><el-icon><CirclePlus /></el-icon>结果记录</el-button>
          <el-button type="warning" round @click="clearAll"><el-icon><RefreshLeft /></el-icon>清除数据</el-button>
          <el-button type="danger" round :disabled="!sel.length" @click="delSel"><el-icon><Delete /></el-icon>删除选中</el-button>
          <el-button type="success" round :disabled="!rows.length" @click="doExport"><el-icon><Download /></el-icon>导出Excel</el-button>
          <el-button type="primary" round :disabled="!rows.length" @click="doReport"><el-icon><Document /></el-icon>生成报告</el-button>
          <el-button round :disabled="!rows.length" @click="doPrint"><el-icon><Printer /></el-icon>打印</el-button>
          <el-button round :disabled="!rows.length" @click="doSave"><el-icon><Upload /></el-icon>保存到服务器</el-button>
        </el-space>
      </el-card>

      <!-- ==================== 右侧面板 ==================== -->
      <div class="right">
        <el-card class="info-card" shadow="hover">
          <!-- 第一排: 试样编号 + 试样测点 -->
          <div class="fields">
            <span class="field">试样编号
              <el-input v-model="rep1" style="width:52px" disabled/>
              <el-select v-model="rep2" style="width:76px"><el-option value="405.">405.</el-option><el-option value="441.">441.</el-option></el-select>
              <el-select v-model="rep3" style="width:64px"><el-option :value="twoDigitYear + '.'">{{ twoDigitYear }}</el-option><el-option :value="(twoDigitYear-1) + '.'">{{ twoDigitYear-1 }}</el-option></el-select>
              <el-input v-model="rep4" style="width:76px" @blur="data4Blur" placeholder="序号"/>
              <el-input v-model="rep5" style="width:56px"/>
            </span>
            <span class="field">试样测点 <el-input v-model="point" placeholder="试样测点" style="width:120px" clearable/></span>
          </div>
          <!-- 第二排: 环境温度 + 环境湿度 + 买家 -->
          <div class="fields">
            <span class="field">环境温度(℃) <el-input-number v-model="temp" :precision="1" :min="-50" :max="100" style="width:110px" controls-position="right"/></span>
            <span class="field">环境湿度(%) <el-input-number v-model="humid" :precision="1" :min="0" :max="100" style="width:110px" controls-position="right"/></span>
            <span class="field">买家
              <el-select v-model="buyer" style="width:110px" @change="onBuyerChange">
                <el-option v-for="b in BUYERS" :key="b" :label="b" :value="b"/>
              </el-select>
            </span>
          </div>
        </el-card>
        <div class="tbl-wrap">
          <el-table ref="tblRef" :data="rows" border stripe style="width:100%;height:100%;" @selection-change="s=>sel=s" row-key="id">
            <el-table-column type="selection" width="40"/>
            <el-table-column prop="ri" label="次数" width="60" align="center"/>
            <el-table-column prop="sid" label="试样编号" width="200"/>
            <el-table-column prop="point" label="试样测点" width="100"/>
            <el-table-column label="重量(g)" width="100" align="right"><template #default="s">{{ s.row.w?.toFixed(3) }}</template></el-table-column>
            <!-- 面积克重 -->
            <template v-if="testType==='area'">
              <el-table-column label="面积(cm²)" width="100" align="right"><template #default="s">{{ s.row.a?.toFixed(2) }}</template></el-table-column>
              <el-table-column label="g/m²" width="90" align="right"><template #default="s">{{ s.row.gsm?.toFixed(3) }}</template></el-table-column>
              <!-- Adidas/NEXT 的报告没有 oz/yd² 这一格, 就不摆这一列 -->
              <el-table-column v-if="areaShowsOz" label="oz/yd²" width="90" align="right"><template #default="s">{{ s.row.oz?.toFixed(3) }}</template></el-table-column>
              <!-- FOCUS: 录入长度与据此算出的 g/m(显示计算全精度, 进报告才按模板取整) -->
              <template v-if="buyer==='FOCUS'">
                <el-table-column label="长度(cm)" width="100" align="right"><template #default="s">{{ s.row.fl?.toFixed(2) }}</template></el-table-column>
                <el-table-column label="g/m" width="90" align="right"><template #default="s">{{ s.row.gm?.toFixed(3) }}</template></el-table-column>
              </template>
              <!-- NEXT: 该次称重的样品数(登记表 Number of sample 用) -->
              <el-table-column v-if="buyer==='NEXT'" label="样品数" width="90" align="right"><template #default="s">{{ s.row.ns ?? 1 }}</template></el-table-column>
            </template>
            <!-- 长度克重 -->
            <template v-if="testType==='length'">
              <el-table-column label="长度(cm)" width="100" align="right"><template #default="s">{{ s.row.lc?.toFixed(2) }}</template></el-table-column>
              <el-table-column label="g/m" width="90" align="right"><template #default="s">{{ s.row.gm?.toFixed(3) }}</template></el-table-column>
              <el-table-column label="oz/yd" width="90" align="right"><template #default="s">{{ s.row.oyd?.toFixed(3) }}</template></el-table-column>
            </template>
            <!-- 条重 -->
            <template v-if="testType==='piece'">
              <el-table-column label="条数" width="80" align="right"><template #default="s">{{ s.row.pc }}</template></el-table-column>
              <el-table-column label="g/piece" width="90" align="right"><template #default="s">{{ s.row.gp?.toFixed(3) }}</template></el-table-column>
              <el-table-column label="lb/dozen" width="90" align="right"><template #default="s">{{ s.row.lbd?.toFixed(3) }}</template></el-table-column>
              <el-table-column label="oz/dozen" width="100" align="right"><template #default="s">{{ s.row.ozd?.toFixed(3) }}</template></el-table-column>
            </template>
            <el-table-column label="测试时间" min-width="155"><template #default="s">{{ ts(s.row.t) }}</template></el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Connection, Link, SwitchButton, ScaleToOriginal, Grid, CirclePlus, RefreshLeft, Delete, Download, Printer, Upload, Document } from '@element-plus/icons-vue'

const api = inject('request')

// ---- 状态 ----
const baudRate = ref(19200)
const rates = [1200, 2400, 4800, 9600, 19200, 38400]
// ---- 天平品牌适配 (Sartorius / Mettler Toledo) ----
// 每种品牌独立: 默认波特率 / 串口配置尝试列表 / DTR-RTS 握手方式 / 重量解析函数。
// Sartorius 保持与旧逻辑逐字节一致; Mettler 为新增分支, 走标准 9600 8N1 + S/SI 稳定帧。
const UNIT_TO_G = { g: 1, kg: 1000, mg: 0.001 }
// 行尾可能带 \r 或 \r\n(startLoop 已按 \n 拆行, 这里兼容仅 \r 结尾的帧)
const METTLER_STABLE_RE = /^S[DI]?\s+([+-]?\d+\.\d+)\s*(g|kg|mg)?\r?$/i
const METTLER_BARE_RE = /^([+-]?\d+\.\d+)\s*(g|kg|mg)?\r?$/

// 统一换算到克(页面 weight 语义是克, 避免天平设成 kg/mg 时记错倍数)
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
    parse(line) {                                       // 与现有行为逐字一致
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
const weight = ref(null)
const lastRxTime = ref(0)          // 最近一次收到串口数据的时间戳
// 状态行显示(文字与颜色一起给, 模板里不再写嵌套三元)
const connTag = computed(() => {
  if (connecting.value) return { type: 'warning', text: '连接中...' }
  if (connected.value) return { type: 'success', text: '已连接 ' + cfgInfo.value }
  return { type: 'info', text: '未连接 — 可手动输入' }
})
const weightTag = computed(() => weight.value != null
  ? { type: 'success', text: '读取正常: ' + weight.value.toFixed(3) }
  : { type: 'info', text: '等待数据... 按天平 PRINT 键' })
// ---- 测试类型: area(面积克重) | length(长度克重) | piece(条重) ----
const testType = ref('area')
const TYPE_LABEL = { area: '面积克重', length: '长度克重', piece: '条重' }
// ---- 买家: 决定生成报告时用哪份模板(Normal/Adidas/FOCUS/NEXT) ----
const buyer = ref('Normal')
const BUYERS = ['Normal', 'Adidas', 'FOCUS', 'NEXT']
// 与后端 PhysicalWeightReportService.SupportsTestType 一一对应: 模板表0 没有的列, 报告里就落不进去
const BUYER_TYPES = { Normal: ['area', 'length', 'piece'], Adidas: ['area'], FOCUS: ['area'], NEXT: ['area'] }
const supportsType = t => BUYER_TYPES[buyer.value].includes(t)
// 面积报告表0 里有没有 oz/yd² 那一格 —— 与后端 SummaryValuesOf 的列一一对应:
// Adidas/NEXT 只有 g/m² 一列, 页面上再摆 oz/yd² 就是列了报告里不存在的数(仅指面积列; 长度克重的 oz/yd、条重的 oz/dozen 不受影响)
const BUYER_AREA_OZ = { Normal: true, Adidas: false, FOCUS: true, NEXT: false }
const areaShowsOz = computed(() => BUYER_AREA_OZ[buyer.value])
// ---- 面积 ----
const area = ref(null)             // 直接输入模式
const areaByCalc = ref(false)      // 长×宽计算模式
const areaLen = ref(null)
const areaWid = ref(null)
// NEXT 的单块试样固定 100 cm²(客户方法): 面积框在 NEXT 直接模式下不可填, 一律按 100 算 ——
// 后端 T2 的 Ave(g/m²) 也是拿这个常数池化算的(重量合计 ÷ (样品数合计 × 100) × 10000),
// 两边用同一块面积, 报告与页面才不会是两个数。
const NEXT_AREA = 100
const areaFixed = computed(() => buyer.value === 'NEXT' && !areaByCalc.value)
const areaValue = computed(() => areaFixed.value
  ? NEXT_AREA
  : areaByCalc.value && areaLen.value && areaWid.value ? parseFloat((areaLen.value * areaWid.value).toFixed(2)) : area.value)
const focusLen = ref(null)         // FOCUS 专用: 面积模式下另录的长度 cm(算 g/m 那格用)
const sampleCount = ref(1)         // NEXT 专用: 该次称重覆盖的样品数(登记表 Number of sample)
// ---- 长度 ----
const lengthCm = ref(null)         // 试样长度 cm
// ---- 条重 ----
const pieceCount = ref(12)         // 称重条数(默认 12 = 1打)
// ---- 试样编号(五段式, 与 Fiber 报告编号规则一致): 87. + 405./441. + 两位年份. + 4位序号 + .01 ----
const twoDigitYear = new Date().getFullYear() % 100
const rep1 = ref('87.')                       // 固定前缀
const rep2 = ref('405.')                      // 405. | 441.
const rep3 = ref(`${twoDigitYear}.`)          // 今年/去年
const rep4 = ref('')                          // 序号(纯数字, blur 补足4位)
const rep5 = ref('.01')                       // 后缀
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
const point = ref('')
const temp = ref(null)
const humid = ref(null)
const rows = reactive([])
const sel = ref([])
const tblRef = ref()

// 记录表格超出可视高度时, 新增一条自动滚到底部跟住最新记录(删除/清空不滚)
watch(() => rows.length, (n, o) => {
  if (n <= o) return
  nextTick(() => tblRef.value?.setScrollTop(Number.MAX_SAFE_INTEGER))
})

// ---- 换算常量 ----
const OZ_PER_YD_TO_G_PER_M = 31.0035   // 1 oz/yd = 31.0035 g/m
const LB_TO_G = 453.592                 // 1 lb = 453.592 g
const OZ_TO_G = 28.3495                 // 1 oz = 28.3495 g

// ---- 串口底层 (Sartorius BSA) ----
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
  // 不动 weight.value: 未连接时可能是手动输入的重量
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
          // 【临时】原始串口监听: 只打日志, 不改变任何行为 (定位后删除)
          {
            let hex = '', asc = ''
            for (let i = 0; i < value.length; i++) {
              const b = value[i]
              hex += b.toString(16).padStart(2, '0') + ' '
              asc += (b >= 32 && b < 127) ? String.fromCharCode(b) : '.'
            }
            console.log('[SERIAL-RAW]', new Date().toLocaleTimeString('zh-CN', { hour12: false }), 'bytes=' + value.length, 'HEX:', hex.trim(), '| ASCII:', asc)
          }
          // 剥离校验位 (7-bit 模式)
          if (portCfg.value && portCfg.value.dataBits === 7) { for (let i = 0; i < value.length; i++) value[i] &= 0x7F }
          const dec = new TextDecoder().decode(value)
          buf += dec
          // 按行拆分(兼容 \n 或 \r 行分隔符; 梅特勒 SICS 可能只发 \r), 攒够一行才解析
          const parts = buf.split(/\r?\n|\r/)
          buf = parts.pop() || ''
          for (const part of parts) {
            const w = matchWeight(part)   // 按当前品牌解析(Sartorius 无锚定 / Mettler 锚定稳定帧)
            if (w != null) weight.value = w
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

// 买家切换: 与切测试类型同一套 —— 有数据先确认清空。买家既决定用哪份模板, 也决定一行的行数据
// (FOCUS 的长度算出的 g/m、NEXT 的样品数都是按买家录的), 混着出报告会让别的买家那几格空着。
function onBuyerChange(v) {
  // 新买家不支持当前类型(Adidas/FOCUS/NEXT 只有面积克重) → 一并退回面积
  const toArea = !supportsType(testType.value)
  const settle = () => { if (toArea) { testType.value = 'area'; applyTypeDefaults('area') } }
  if (!rows.length) { settle(); return }
  ElMessageBox.confirm(`切换到 ${v} 将清空已记录的 ${rows.length} 条数据，确定？`, '确认', { type: 'warning' })
    .then(() => { rows.splice(0); settle() })
    // 取消: el-select 已经改过 v-model 了, 得把买家改回去 —— 行上留了录这条时的买家
    .catch(() => { buyer.value = rows[0]?.buyer || 'Normal' })
}

function record() {
  if (weight.value == null || +weight.value <= 0) { ElMessage.warning('重量>0'); return }
  if (!rep4.value.trim()) { ElMessage.warning('试样编号序号不能为空'); return }
  if (!point.value.trim()) { ElMessage.warning('试样测点不能为空'); return }
  const w = +weight.value, t = new Date().toISOString()
  // buyer: 录这条时的买家 —— 切买家会清空, 所以表里各行必属同一个买家; 取消切换时靠它把买家改回去
  const base = { id: crypto.randomUUID?.() ?? Math.random().toString(36), ri: rows.length + 1, sid: sid.value.trim(), point: point.value.trim(), type: testType.value, buyer: buyer.value, w, temp: temp.value, humid: humid.value, t }
  if (testType.value === 'area') {
    // NEXT 登记表要 Number of sample: 默认 1(等价于"称一次算一个样品"); 非 NEXT 的行走后端默认 1
    const ns = buyer.value === 'NEXT' ? (+sampleCount.value || 1) : null
    const a = areaValue.value
    if (a == null || +a <= 0) { ElMessage.warning('面积>0'); return }
    // g/m² = 重量 ÷ 总面积, 总面积 = 样品数 × 单块面积 —— 一次称重可能称了 ns 块, 重量格录的是这 ns 块的总重,
    // 而面积框(以及 NEXT 固定的 100)说的是单块。ns=1 时与原来完全一样。
    const gsm = +(w / ((ns ?? 1) * a) * 10000).toFixed(3), oz = +(gsm / 33.9057).toFixed(3)
    // 长×宽模式: 记录尺寸文本供报告 Measure 列直填(如 "5×5"); 直填模式无尺寸, dim=null
    const dim = areaByCalc.value && areaLen.value && areaWid.value ? `${areaLen.value}×${areaWid.value}` : null
    // FOCUS 报告汇总表多一格 g/m: 面积模式下长度是另录的, 用与长度克重同一个式子算
    let fl = null, gm = null
    if (buyer.value === 'FOCUS') {
      if (!(focusLen.value > 0)) { ElMessage.warning('长度>0'); return }
      fl = focusLen.value
      gm = +(w / fl * 100).toFixed(3)
    }
    rows.push({ ...base, a, dim, gsm, oz, fl, gm, ns })
    ElMessage.success(buyer.value === 'FOCUS'
      ? `g/m²=${gsm}  oz/yd²=${oz}  g/m=${gm}`
      : `g/m²=${gsm}  oz/yd²=${oz}`)
  } else if (testType.value === 'length') {
    const lc = lengthCm.value
    if (lc == null || +lc <= 0) { ElMessage.warning('长度>0'); return }
    const gm = +(w / lc * 100).toFixed(3), oyd = +(gm / OZ_PER_YD_TO_G_PER_M).toFixed(3)
    rows.push({ ...base, lc, gm, oyd })
    ElMessage.success(`g/m=${gm}  oz/yd=${oyd}`)
  } else {
    const pc = +pieceCount.value || 0
    if (pc <= 0) { ElMessage.warning('条数>0'); return }
    const gp = +(w / pc).toFixed(3), lbd = +(gp * 12 / LB_TO_G).toFixed(3), ozd = +(gp * 12 / OZ_TO_G).toFixed(3)
    rows.push({ ...base, pc, gp, lbd, ozd })
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
    map = r => ({ '次数': r.ri, '试样编号': r.sid, '试样测点': r.point, '重量(g)': r.w?.toFixed(3), '长度(cm)': r.lc?.toFixed(2), 'g/m': r.gm?.toFixed(3), 'oz/yd': r.oyd?.toFixed(3), '测试时间': ts(r.t) })
  } else if (testType.value === 'piece') {
    map = r => ({ '次数': r.ri, '试样编号': r.sid, '试样测点': r.point, '重量(g)': r.w?.toFixed(3), '条数': r.pc, 'g/piece': r.gp?.toFixed(3), 'lb/dozen': r.lbd?.toFixed(3), '测试时间': ts(r.t) })
  } else {
    // 导出列与页面记录表同源: Adidas/NEXT 不导 oz/yd²
    const areaMap = r => {
      const o = { '次数': r.ri, '试样编号': r.sid, '试样测点': r.point, '重量(g)': r.w?.toFixed(3), '面积(cm²)': r.a?.toFixed(2), 'g/m²': r.gsm?.toFixed(3) }
      if (areaShowsOz.value) o['oz/yd²'] = r.oz?.toFixed(3)
      return o
    }
    if (buyer.value === 'FOCUS') {
      map = r => ({ ...areaMap(r), '长度(cm)': r.fl?.toFixed(2), 'g/m': r.gm?.toFixed(3), '测试时间': ts(r.t) })
    } else if (buyer.value === 'NEXT') {
      map = r => ({ ...areaMap(r), '样品数': r.ns ?? 1, '测试时间': ts(r.t) })
    } else {
      map = r => ({ ...areaMap(r), '测试时间': ts(r.t) })
    }
  }
  const ws = XLSX.utils.json_to_sheet(rows.map(map))
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'PhysicalWeight')
  XLSX.writeFile(wb, `PhysicalWeight_${new Date().toISOString().slice(0,10)}.xlsx`)
  ElMessage.success('导出成功')
}

// 生成 docx 报告: 调后端按买家选模板(Normal/Adidas/FOCUS/NEXT)填充并下载
async function doReport() {
  if (!rows.length) { ElMessage.warning('请先记录数据'); return }
  if (!sid.value.trim()) { ElMessage.warning('请先填写试样编号(报告号)'); return }
  try {
    const res = await api.post('/PhysicalWeightReport/report', {
      reportNumber: sid.value.trim(),
      buyer: buyer.value,
      testType: testType.value,
      testMethod: '',
      environmentTemperature: temp.value,
      environmentHumidity: humid.value,
      records: rows.map(r => ({ point: r.point, sampleId: r.sid, gsm: r.gsm || 0, oz: r.oz || 0, gPerM: r.gm || 0, ozPerYd: r.oyd || 0, gPerPiece: r.gp || 0, lbPerDozen: r.lbd || 0, ozPerDozen: r.ozd || 0, weight: r.w, area: r.a, dimension: r.dim ?? null, lengthCm: r.lc ?? r.fl ?? null, pieceCount: r.pc ?? null, sampleCount: r.ns ?? null }))
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
    const res = await api.post('/PhysicalWeight', { records: rows.map(r => ({ recordIndex: r.ri, sampleId: sid.value.trim(), testPoint: r.point, weight: r.w, area: r.a || 0, gsm: r.gsm || 0, oz: r.oz || 0, testType: r.type, lengthCm: r.lc ?? r.fl ?? null, pieceCount: r.pc ?? null, gPerM: r.gm || 0, ozPerYd: r.oyd || 0, gPerPiece: r.gp || 0, lbPerDozen: r.lbd || 0, envTemperature: r.temp, envHumidity: r.humid, testTime: r.t, reportNumber: sid.value.trim() })) })
    if (res.data.isSuccess) { ElMessage.success('保存成功') } else { ElMessage.error(res.data.error || '保存失败') }
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
/* 容器/骨架(.allContainer / .main)、卡片内边距、el-form-item 间距、table 下边距
   一律见 src/assets/css/instrument-panel.css —— 那些是 5 个仪器页逐字相同的部分。 */

/* 左右侧列 */
.left { width: 248px; display: flex; flex-direction: column; justify-content: center; gap: 12px; flex-shrink: 0; overflow-y: auto; }
.right { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 0; }

/* 卡片标题: 不叫 card-header, 那个类名 bootstrap 也有 */
.ctitle { font-size: 13px; font-weight: 600; color: #2b3a4a; display: flex; align-items: center; gap: 6px; }
.ctitle .el-icon { color: #409eff; }

/* 标签: 仅剩卡片内联的"长/宽"这类随控件同行的小字(其余标签交给 el-form-item) */
.lbl { font-size: 12px; color: #666; white-space: nowrap; }
/* 不带标签的 form-item 里放的两个控件同行(长 宽 / 长度 / 样品数) */
.pair { display: flex; align-items: center; gap: 4px; width: 100%; }

/* 连接状态行 */
.st { margin-top: 6px; }

/* 重量框: 琥珀虚线=手输, 绿实线=天平正在读数。el-statistic 给不了这圈边框, 保留 */
.wtbox { padding: 12px; border-radius: 8px; text-align: center; min-height: 56px; display: flex; align-items: center; justify-content: center; background: #fdf6ec; border: 1px dashed #e6a23c; transition: all .25s; }
.wtbox.live { background: #f0f9eb; border: 2px solid #67c23a; }
.wtval { font-size: 30px; font-weight: 700; font-family: 'Consolas', 'Courier New', monospace; color: #1f3d2b; }
.wtstat :deep(.el-statistic__content) { font-size: 30px; font-weight: 700; font-family: 'Consolas', 'Courier New', monospace; color: #1f3d2b; }

.hint { font-size: 11px; color: #909399; }
.hint.block { display: block; margin-top: 6px; }

/* 测试类型: el-radio-group 是 inline-flex, 不给 display:flex 就落在行内盒里, 下方多出基线空隙 */
.tt-group { display: flex; width: 100%; }

/* 中间按钮列 (el-card 贴合内容高度; 宽度按最长按钮 "保存到服务器" 定:
   图标 14+4 + 6个汉字 84 + 按钮左右内边距 30 = 132, 加卡片内边距 24 与边框 2 → 158) */
.mid { flex-shrink: 0; align-self: center; width: 160px; }
/* el-space 是 inline-flex, 不撑满卡片内容宽, 按钮就不会等宽 */
.mid :deep(.el-space) { display: flex; width: 100%; }
.mid .el-button .el-icon { margin-right: 4px; }

/* 右侧信息栏: 两组"标签+控件"各占一行, 组内横向排、组间可折行 */
.info-card :deep(.el-card__body) { display: flex; flex-direction: column; gap: 10px; }
.fields { display: flex; flex-direction: row; flex-wrap: wrap; gap: 10px 24px; align-items: center; }
.field { font-size: 13px; color: #444; display: flex; align-items: center; gap: 4px; white-space: nowrap; }

/* 表格容器: 不是卡, 是 .info-card 的兄弟 —— flex:1;min-height:0 + el-table height:100% 的高度链 */
.tbl-wrap { flex: 1; min-height: 0; background: #fff; border: 1px solid #e6e8eb; border-radius: 10px; padding: 6px; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
</style>
