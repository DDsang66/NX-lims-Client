<template>
  <div class="page-container">
    <!-- 左侧 40% -->
    <div class="left-panel">
      <!-- 子组件1: Setting Form -->
      <left-top-section v-model:reportNums="reportNums"
                        v-model:form="form"
                        :additionItems="additionItems"
                        :menuName="menuName"
                        :standards="standards"
                        @refresh="handleRefresh" />

      <!-- 分割虚线 -->
      <div class="dashed-line"></div>

      <!-- 子组件2: 根据 additionItem 值动态显示 -->
      <left-multi-fiber-section v-if="isMultiFiber"
                                :key="refreshKey"
                                v-model:rows="rows"
                                :allCompositions="allCompositions"
                                :cellulosicSubOptions="fiberOptions.cellulosicSub"
                                :regeneratedSubOptions="fiberOptions.regeneratedSub"
                                :bicomponentSubOptions="fiberOptions.bicomponentSub"
                                :prefill="restorePayload"
                                @prefilled="onPrefilled"
                                @confirm="handleFiberConfirm"
                                @save-draft="handleSaveDraft"
                                @build-analysis="handleBuildAnalysis"
                                @restore="handleReportRestore" />

      <left-single-fiber-section v-else
                                 :key="refreshKey"
                                 v-model:rows="rows"
                                 :allCompositions="allCompositions"
                                 :prefill="restorePayload"
                                 @prefilled="onPrefilled"
                                 @confirm="handleFiberConfirm"
                                 @save-draft="handleSaveDraft"
                                 @build-analysis="handleBuildAnalysis"
                                 @restore="handleReportRestore" />
    </div>

    <!-- 右侧 60% -->
    <!-- 子组件3: Right Panel -->
    <right-panel :form="form" :document-url="docUrl" />
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, inject, watch, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import LeftTopSection from './LeftTopSection.vue'
  import LeftMultiFiberSection from './LeftMultiFiberSection.vue'
  import LeftSingleFiberSection from './LeftSingleFiberSection.vue'
  import RightPanel from './RightPanel.vue'
  import { API_BASE } from '@/utils/config.js'
  import '@/assets/css/style.css';

  const emit = defineEmits(['confirm']);
  const request = inject('request');
  // 右侧预览的文档地址。Build Analysis 之前看的是**模板**（随表单类型切单/多组分），
  // 生成之后被换成带时间戳的报告地址（见 handleBuildAnalysis）—— 非空即"已有报告"。
  const reportDocUrl = ref('')
  const refreshKey = ref(0)

  // 历史报告回填：后端按文件名找回那次生成的录入 DTO，这里原样转给当前显示的那个左区组件。
  // 组件灌完数据后 emit('prefilled')，这里立刻清空 —— 否则 Refresh / 切单多组分重新挂载时
  // 会把同一份数据再灌一遍，把用户改过的东西冲掉。
  const restorePayload = ref(null)

  function onPrefilled() { restorePayload.value = null }

  // Report Number 分段数据
  const twoDigitYear = ref(new Date().getFullYear() % 100)
  const reportNums = reactive({
    data1: '87.',
    data2: '405.',
    data3: twoDigitYear.value + '.',
    data4: '',
    data5: '.01'
  })

  // 表单数据
  const form = ref({
    reportNumber: '',
    menuName: [],
    additionItem: 'type1',  // 默认选中 Multi
    standard: '',
    standardMode: 'Current' // 标准口径：'Current' 常规（缺省）/ 'Dual' 2C。由 Setting Form 标题行那个二选一切换
  })

  // 模拟数据 - 通过 fiberType 字段标识组件类型
  const additionItems = ref([
    { value: 'type1', label: 'Multi', fiberType: 'multi' },
    { value: 'type2', label: 'Single', fiberType: 'single' }
  ])

  // Method 候选改由后端提供—— 原先是这里 10 条硬编码, 加标准要改前端重新发版。
  // value 与 label 相同是既有约定, 后端就按这个约定返回纯字符串列表。
  //
  // **两份清单**（常规 / 2C）一次下发, 所以切模式是纯前端动作、不重新请求：
  // methodOptions 存两份, menuName 是**当前生效的那一份**（也就是下拉的数据源,
  // 直接喂给 LeftTopSection 的 :menuName）。别把 menuName 换成计算属性 ——
  // 下面的切换 watcher 需要在"值"上做替换, 计算属性给不了那个时机。
  const methodOptions = ref({ Current: [], Dual: [] })
  const menuName = ref([])

  // 切模式时已选项必须先**按值重映射、再**滤掉不在新清单里的。
  // 只做 filter 是不够的：下面三条在两个模式里**值本身就不同**，
  // 原样提交给 2C 记录会被后端按 2C 口径解析、派生出口径错的链（报告上印错版本号）。
  // 三条与后端 MethodOptionsCurrent / MethodOptionsDual 逐字对应 ——
  // 两条 AATCC 的**空格数刻意不同**（双空格那条是复合方法名，Korea 那条本来就是单空格）。
  const MODE_VALUE_SWAP = [
    ['Regulation (Eu) No. 1007/2011', 'EU regulation No. 1007/2011 VIII'],
    ['AATCC TM20-2021  AATCC TM20A-2025', 'AATCC TM20-2021  AATCC TM20A-2021'],
    ['AATCC TM20-2021 AATCC TM20A-2025 (Korea)', 'AATCC TM20-2021 AATCC TM20A-2021 (Korea)']
  ]

  // 认不出的模式一律按常规 —— 与后端 FiberWorksheetService.ParseStandardMode 同口径
  const optionsFor = (mode) => methodOptions.value[mode === 'Dual' ? 'Dual' : 'Current'] || []

  function swapMethod(value, toDual) {
    const hit = MODE_VALUE_SWAP.find(([current, dual]) => (toDual ? current : dual) === value)
    return hit ? (toDual ? hit[1] : hit[0]) : value
  }

  // 分组候选—— 同样来自后端, 见 getFiberOptions。
  const fiberOptions = ref({ cellulosicSub: [], regeneratedSub: [], bicomponentSub: [] })

  const standards = ref([
    { value: 'std1', label: 'Standard Method 1' },
    { value: 'std2', label: 'Standard Method 2' }
  ])

  const baseCompositions = ref([]);

  // 常用纤维的固定优先顺序。
  // 后端 /render/compositionsearch 没有 ORDER BY, 下来的是 fiber_database 聚集索引的 Guid 字节序
  // （看着像乱序, 官方也不保证稳定）, 所以展示顺序在前端这一处定死。
  const PINNED_COMPOSITIONS = ['Wool', 'Polyamide', 'Nylon', 'Acrylic', 'Viscose', 'Rayon',
    'Cotton', 'Polyester', 'Elastane', 'Spandex', 'Linen', 'Modal', 'Lyocell'];
  // 通配/分组父槽（*Animal 那一类）：字母序会把 '*' 排到最前, 所以单独挑出来垫底
  const isWildcardComposition = name => name.startsWith('*');
  const byCompositionName = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());

  /** 头段（双组分类名）按给定次序 → 13 个常用名按固定序 → 其余字母序 → 通配项垫底。只重排, 不增不删。 */
  function sortCompositions(list, head) {
    const pinned = new Map(PINNED_COMPOSITIONS.map((n, i) => [n, i]));
    const taken = new Set([...head, ...PINNED_COMPOSITIONS]);
    const fixed = list.filter(n => pinned.has(n)).sort((a, b) => pinned.get(a) - pinned.get(b));
    const rest = list.filter(n => !taken.has(n) && !isWildcardComposition(n)).sort(byCompositionName);
    const tail = list.filter(n => !taken.has(n) && isWildcardComposition(n)).sort(byCompositionName);
    return [...head, ...fixed, ...rest, ...tail];
  }

  const allCompositions = computed(() => {
    const methods = form.value.menuName || [];
    const head = [];
    // 头两项 = 两个双组分类名, 勾了对应方法族才出现。它们**不在 fiber_database 里**,
    // 是前端按方法族插进来的；两个都勾时的先后照现状（原来是两次 unshift 的结果）。
    if (methods.some(m => m.startsWith('AATCC'))) head.push('Biconstituent Fiber');
    if (methods.some(m => m.startsWith('FZ/T'))) head.push('Bicomponent Fiber');
    return sortCompositions([...baseCompositions.value], head);
  });
  const rows = ref([]);

  // 计算属性：判断是否显示多纤维组件
  const isMultiFiber = computed(() => {
    if (!form.value.additionItem) return false

    const selectedItem = additionItems.value.find(
      item => item.value === form.value.additionItem
    )

    // 根据 additionItems 中的 fiberType 字段判断，默认为 single
    return selectedItem?.fiberType === 'multi'
  })

  // 模板预览地址：单/多组分是两份**不同的**模板文件，必须告诉后端取哪一份
  // （后端只认 'Single'，其余一律按多组分，见 FiberDocxController.Index）。
  // 值取自 isMultiFiber —— 别在这儿再抄一遍 additionItem === 'type1'，那是同一个判断的第二份拷贝。
  const docUrl = computed(() =>
    reportDocUrl.value
    || `${API_BASE}/fiberdocx/get-docxUrl?type=${isMultiFiber.value ? 'Multiple' : 'Single'}`)

  // 监听 additionItem 变化，切换时清空 rows 数据避免数据混乱
  watch(() => form.value.additionItem, (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      rows.value = []
    }
  })

  // 切标准口径（Setting Form 标题行那个二选一）：换下拉数据源 + 把已选项搬到新清单上。
  // 录入的纤维/称量数据**不清空** —— 口径只影响报告上印的标准版本，与录入内容无关
  // （对比上面 additionItem 那个 watch：单↔多组分换的是模板与录入结构，那才要清）。
  watch(() => form.value.standardMode, (mode, oldMode) => {
    if (!mode || mode === oldMode) return
    const toDual = mode === 'Dual'
    const target = optionsFor(mode)
    const selected = form.value.menuName || []
    // 换值 → 留下还在新清单里的；换完不在新清单里的（CAN/CNS/JIS 三族 2C 下整族不进）去掉
    const kept = selected.map(v => swapMethod(v, toDual)).filter(v => target.some(o => o.value === v))
    const dropped = selected.filter(v => !target.some(o => o.value === swapMethod(v, toDual)))

    form.value.menuName = kept
    menuName.value = target
    // 静默丢掉已选项会让人以为勾选丢了，报一句
    if (dropped.length) {
      ElMessage.warning(`当前口径的清单里没有这些方法，已移除：${dropped.join('、')}`)
    }
  })

  // 获取成分选项列表
  async function getCompositions() {
    baseCompositions.value = (await request.get('/render/compositionsearch')).data.data
  }

  // 获取纤维模块的分组候选（Method / cellulosic 子纤维 / bicomponent 子纤维）
  //
  // methodOptions2C 缺了就**留空**、不回退到常规那份：2C 下摆出常规清单，
  // 分析员勾出来的会是常规版本的标准串，报告上印错版本号而不报错 —— 空下拉更早暴露问题。
  async function getFiberOptions() {
    try {
      const res = await request.get('/FiberAnalysis/fiber-options')
      if (res.data?.success) {
        const d = res.data.data || {}
        const asOptions = list => (list || []).map(m => ({ value: m, label: m }))
        methodOptions.value = {
          Current: asOptions(d.methodOptions),
          Dual: asOptions(d.methodOptions2C)
        }
        menuName.value = optionsFor(form.value.standardMode)
        fiberOptions.value = {
          cellulosicSub: d.cellulosicSub || [],
          regeneratedSub: d.regeneratedSub || [],
          bicomponentSub: d.bicomponentSub || []
        }
      }
    } catch (e) {
      // 与既有的 fetchLabelOptions 同口径: 失败就在控制台报, 下拉留空。
      console.error('获取纤维候选清单失败:', e)
    }
  }

  const handleFiberConfirm = (data) => {
    emit('confirm', data)
  }

  // Bicomponent 父行 GSM 从子行相加
  function resolveRowGsm(row) {
    const subs = row.bicomponentSubFibers || [];
    if (subs.length >= 2) {
      return {
        gsm1: Number(subs[0].gsmTrail1) || 0,
        gsm2: Number(subs[0].gsmTrail2) || 0
      };
    }
    return { gsm1: Number(row.trial1) || 0, gsm2: Number(row.trial2) || 0 };
  }

  // 多选备注 → 单个字符串：每条一行，'\n' 分隔。
  // 后端 DTO / 领域 / 模板三层的字段类型仍是 string，谁都不解析它 —— 拼接只发生在这一个地方。
  // '\n' 之所以够用：WordTemplateEngine.ReplaceBookmarksInPart → TextRunHelper.InsertTextWithLineBreaks
  // 会把文本按 '\n' 拆成多个 run 并在其间插 <w:br/>，到 Word 里就是实打实的换行（段内软换行）。
  // Array.isArray 兜底 + filter(Boolean)：clearable 清空给的是 []，
  // 但 null/undefined 也可能从 JSON.parse(JSON.stringify()) 那条路上漏进来，不该让它变成 'null'。
  function toRemarkText(value) {
    if (Array.isArray(value)) return value.filter(Boolean).join('\n')
    return value || ''
  }

  // 构建 BuildAnalysisDto（全部 camelCase，匹配后端 System.Text.Json）
  function buildDto(payload) {
    const dto = {
      reportNumber: form.value.reportNumber,
      method: form.value.menuName || [],
      componentType: form.value.additionItem === 'type1' ? 'Multi' : 'Single',
      buyer: form.value.standard || '',
      // 标准口径（'Current' / 'Dual'）—— **不是库列**，后端只拿它决定报告上印哪套版本；
      // 2C 与否由后端写进文件名（{报告号}_2C_{时间戳}_FiberAnalysis.docx），历史列表从文件名认。
      standardMode: form.value.standardMode || 'Current',
      // conclusion 段删行下线（input2~input5 空号保留，勿补位）
      verifyResult: payload.extraInputs?.input1 || '',
      recommendedLabel: payload.extraInputs?.input6 ? [payload.extraInputs.input6] : [],
      resultRemark: toRemarkText(payload.extraInputs?.resultRemark),
      labelRemark: toRemarkText(payload.extraInputs?.input8),
      judgmentLabelRemark: payload.extraInputs?.input9 || '',
      languageLabelRemark: payload.extraInputs?.input10 || ''
    }

    if (form.value.additionItem === 'type1') {
      // Multi
      dto.multipleBuildAnalysis = {
        fiberSplittingList: [],
        fiberDissolvedList: [],
        sample: payload.sampleInput || ''
      }
      if (payload.splitSection?.rows) {
        dto.multipleBuildAnalysis.fiberSplittingList = [{
          splittingRows: payload.splitSection.rows
            .filter(r => r.composition)
            .map(r => {
              const gsm = resolveRowGsm(r);
              return {
                fiberName: r.composition,
                gsmTrail1: gsm.gsm1,
                gsmTrail2: gsm.gsm2,
                cellulosicSubFibers: (r.cellulosicSubFibers || []).filter(s => s.fiberName && s.percentage > 0).map(s => ({
                  fiberName: s.fiberName, percentage: Number(s.percentage) || 0
                })),
                bicomponentSubFibers: (r.bicomponentSubFibers || []).filter(s => s.fiberName && (s.gsmTrail1 > 0 || s.gsmTrail2 > 0)).map(s => ({
                  fiberName: s.fiberName, gsmTrail1: Number(s.gsmTrail1) || 0, gsmTrail2: Number(s.gsmTrail2) || 0
                }))
              };
            })
        }]
      }
      if (payload.localSections?.length) {
        dto.multipleBuildAnalysis.fiberDissolvedList = payload.localSections.map(sec => ({
          originalGSMTrail1: Number(sec.headerInputs?.trial1) || 0,
          originalGSMTrail2: Number(sec.headerInputs?.trial2) || 0,
          dissolvedRows: (sec.rows || []).filter(r => r.composition).map(r => {
            const gsm = resolveRowGsm(r);
            return {
              fiberName: r.composition,
              gsmTrail1: gsm.gsm1,
              gsmTrail2: gsm.gsm2,
              cellulosicSubFibers: (r.cellulosicSubFibers || []).filter(s => s.fiberName && s.percentage > 0).map(s => ({
                fiberName: s.fiberName, percentage: Number(s.percentage) || 0
              })),
              bicomponentSubFibers: (r.bicomponentSubFibers || []).filter(s => s.fiberName && (s.gsmTrail1 > 0 || s.gsmTrail2 > 0)).map(s => ({
                fiberName: s.fiberName, gsmTrail1: Number(s.gsmTrail1) || 0, gsmTrail2: Number(s.gsmTrail2) || 0
              }))
            };
          })
        }))
      }
    } else {
      // Single
      dto.singleBuildAnalysis = {
        // 单组分**不称量**（B13）：不发 gsmTrail1 —— 后端该字段已退役。
        singleFiberRows: ((payload.sections || []).flatMap(s => (s.rows || []).filter(r => r.composition).map(r => ({
          sample: payload.sampleInput || r.location || '',
          fiberName: r.composition
        }))))
      }
    }

    return dto
  }

  function handleRefresh() { refreshKey.value++ }

  async function handleSaveDraft(payload) {
    const dto = buildDto(payload)
    const res = await request.post('/FiberAnalysis/worksheet', dto)
    console.log('Save Draft:', res.data)
  }

  async function handleBuildAnalysis(payload) {
    const dto = buildDto(payload)
    console.log('Build DTO:', JSON.stringify(dto))
    const res1 = await request.post('/FiberAnalysis/worksheet', dto)
    console.log('Build Analysis:', res1.data)
    if (res1.data?.isSuccess) {
      // 使用接口返回的 downloadUrl（含时间戳文件名，避免缓存和覆盖）
      const origin = new URL(request.defaults.baseURL).origin
      reportDocUrl.value = `${origin}${res1.data.value.downloadUrl}`
    }
  }

  // 历史报告"回填"：不再把 docx 交给 OnlyOffice，而是按文件名把**那一次生成时的录入数据**
  // 从 fiber_analysis 读回来、灌进左侧表单。报告的 docx 仍可用旁边的「下载」看原件。
  //
  // 文件名是唯一入口：报告号、生成时刻、是否 2C 都在文件名上（模式刻意不落库）。
  // 找不到对应行就只提示，不退回 OnlyOffice。
  async function handleReportRestore(fileName) {
    let dto
    try {
      const res = await request.get(`/FiberAnalysis/reports/${encodeURIComponent(fileName)}/worksheet`)
      dto = res.data?.data
    } catch {
      dto = null
    }
    if (!dto) {
      ElMessage.warning('该报告在库中无对应录入记录')
      return
    }

    // 先落"整页"的字段。standardMode 的 watch 是异步的：先把已选方法清空，避免它在
    // 换口径时把上一份报告的选择按新清单重映射、顺带弹一条"已移除"的警告。
    form.value.menuName = []
    form.value.standardMode = dto.standardMode || 'Current'
    form.value.additionItem = dto.componentType === 'Single' ? 'type2' : 'type1'
    form.value.standard = dto.buyer || ''
    Object.assign(reportNums, splitReportNumber(dto.reportNumber))
    form.value.reportNumber = dto.reportNumber || ''

    // 等单/多组分那一路真的挂载完，再灌已选方法与明细
    await nextTick()
    form.value.menuName = dto.method || []
    // 右侧回到模板预览 —— 回填不等于已生成过报告
    reportDocUrl.value = ''
    restorePayload.value = { token: Date.now(), dto }
  }


  // 报告号 → 界面上的五段。
  // 段数不是 5 时整串塞进 data4，LeftTopSection 的 watcher 拼回去仍是原文。
  function splitReportNumber(reportNumber) {
    const parts = String(reportNumber || '').split('.')
    if (parts.length !== 5) {
      return { data1: '', data2: '', data3: '', data4: reportNumber || '', data5: '' }
    }
    return {
      data1: parts[0] + '.',
      data2: parts[1] + '.',
      data3: parts[2] + '.',
      data4: parts[3],
      data5: '.' + parts[4]
    }
  }

  onMounted(() => {
    getCompositions()
    getFiberOptions()
  })
</script>

<style scoped lang="scss">
  .page-container {
    min-height: 100vh;
    background: #f5f7fa;
    padding: 24px;
    box-sizing: border-box;
    display: flex;
    gap: 24px;
  }

  .left-panel {
    width: 40%;
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #cae2e8;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .dashed-line {
    width: 100%;
    height: 1px;
    border-top: 1px dashed #dcdfe6;
    margin: 0;
    flex-shrink: 0;
  }

  @media (max-width: 1200px) {
    .page-container {
      flex-direction: column;
    }

    .left-panel {
      width: 100%;
    }
  }
</style>





