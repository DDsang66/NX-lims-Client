// 纤维录入表的格子导航：Enter / Tab / ↑ ↓ ← →
//
// 为什么挂在 <table> 上用**捕获阶段**，而不是像原先那样一格格绑 @keydown：
//
// 1. Element Plus 的 el-select 在内层 input 上对 ArrowUp / ArrowDown / Enter / Escape
//    做 preventDefault + **stopPropagation**（es/components/select/src/useSelect.mjs 的
//    handleKeydown），冒泡阶段挂在外层的 handler 根本收不到这些键 —— 原先绑在
//    <el-select> 上的 @keydown.enter 一直是空转的。捕获阶段先于目标元素执行，
//    且在其中 stopPropagation 能让 EP 的 handler 根本不触发。
// 2. 一格格绑 × 4 个方向 = 上百个绑定；委托一份就够，子行与表头格自动纳入。

const NAV = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right'
}

const FOCUSABLE = 'input, textarea, [contenteditable="true"]'

/** 一个格子里能聚焦的元素；disabled 的不算 —— 对它 focus() 会静默失败 */
function focusableIn(cell) {
  const el = cell?.querySelector(FOCUSABLE)
  return el && !el.disabled ? el : null
}

/** 可导航 = 有能聚焦的元素，且不是操作列（含 el-button 的格，沿用原有规则） */
function isNavigable(cell) {
  return !!focusableIn(cell) && !cell.querySelector('.el-button')
}

/**
 * 一行的视觉列区间。**colspan 必须累加**：cellulosic 子行只有 3 个 td
 * （其中一个 colspan="2"），父行却有 4 个 —— 用 children 下标会错位，
 * 父行 Trial#1 ↓ 会落到空的操作列上。
 */
function rangesOf(row) {
  let col = 0
  return Array.from(row.children).map((cell) => {
    const start = col
    col += cell.colSpan || 1
    return { cell, start, end: col }
  })
}

/** 该行的可导航格，按视觉列升序 */
function navigableOf(row) {
  return rangesOf(row)
    .filter((r) => isNavigable(r.cell))
    .sort((a, b) => a.start - b.start)
}

function colOf(row, cell) {
  const r = rangesOf(row).find((x) => x.cell === cell)
  return r ? r.start : 0
}

/**
 * 该行中"视觉列 col 所在的"可导航格：取 start <= col 中最大的那个。
 * 父行 Trial#1（start=1）因此能落进子行 start=1 的 colspan 百分比格。
 */
function cellInRowAt(row, col) {
  const cells = navigableOf(row)
  let hit = null
  for (const c of cells) {
    if (c.start <= col) hit = c
    else break
  }
  return hit || cells[0] || null
}

function siblingRow(table, row, step) {
  const rows = Array.from(table.rows)
  const i = rows.indexOf(row)
  if (i < 0) return null
  const j = i + step
  return j >= 0 && j < rows.length ? rows[j] : null
}

/** 上/下：逐行找过去，跳过没有可导航格的行；走到头返回 null（停住） */
function findVertical(table, row, col, step) {
  let r = siblingRow(table, row, step)
  while (r) {
    const hit = cellInRowAt(r, col)
    if (hit) return hit.cell
    r = siblingRow(table, r, step)
  }
  return null
}

/**
 * Tab：只在本行内往后走一格，**行尾返回 null**。
 * 与 → 刻意不同：→ 行尾环绕到下一行（Excel 手感），Tab 行尾放行浏览器默认，
 * 焦点顺势走到表格下方的 Add 按钮 —— 这是"Add 按钮移到表下方"那次改动的既定语义。
 */
function nextInRow(row, cell) {
  const cells = navigableOf(row)
  const i = cells.findIndex((c) => c.cell === cell)
  return i >= 0 && i + 1 < cells.length ? cells[i + 1].cell : null
}

/** 左/右：本行内前/后一个；越界则环绕到上一行末格 / 下一行首格 */
function findHorizontal(table, row, cell, step) {
  const cells = navigableOf(row)
  const i = cells.findIndex((c) => c.cell === cell)
  if (i < 0) return null

  const j = i + step
  if (j >= 0 && j < cells.length) return cells[j].cell

  let r = siblingRow(table, row, step)
  while (r) {
    const list = navigableOf(r)
    if (list.length) return (step > 0 ? list[0] : list[list.length - 1]).cell
    r = siblingRow(table, r, step)
  }
  return null
}

/**
 * 表格键盘导航入口 —— 绑在 <table> 上，**捕获阶段**：
 *   <table class="custom-table-layout" @keydown.capture="handleGridKeydown">
 *
 * @param {KeyboardEvent} event
 */
export function handleGridKeydown(event) {
  const isArrow = !!NAV[event.key]
  const dir = NAV[event.key] || (event.key === 'Enter' ? 'down' : event.key === 'Tab' ? 'tab' : null)
  if (!dir) return

  // 带修饰键的一律放行：Shift+← 选字符之类仍归浏览器/组件自己
  if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return

  // 成分下拉已展开时，↑/↓ 归 Element Plus 在选项间移动。
  // Enter 也走这条（它映射成 down）—— 展开时回车 = 选中高亮那个选项，
  // 这正是纯键盘选成分的唯一通路：打字过滤 → 下拉展开 → ↑/↓ 挪高亮 → 回车选中。
  // 下拉只能靠打字或鼠标打开（聚焦不会自动开），失焦会自动收，所以跨格离开这一格之后，
  // 方向键立刻回到"跨格"语义。
  if ((dir === 'up' || dir === 'down') && event.target?.getAttribute?.('aria-expanded') === 'true') return

  const table = event.target?.closest?.('table')
  const cell = table && event.target.closest('td, th')
  if (!cell || cell.parentElement?.parentElement?.closest('table') !== table) return

  const row = cell.parentElement
  const col = colOf(row, cell)
  const next =
    dir === 'up' ? findVertical(table, row, col, -1)
      : dir === 'down' ? findVertical(table, row, col, 1)
        : dir === 'left' ? findHorizontal(table, row, cell, -1)
          : dir === 'right' ? findHorizontal(table, row, cell, 1)
            : nextInRow(row, cell)

  if (isArrow) {
    // 方向键一律接管，**即使走到头也拦**：不拦的话 EP 会借 ↓ 开下拉，
    // type="number" 的格子会被原生步进数值。
    event.preventDefault()
    event.stopPropagation()
  } else {
    // Enter 到头（最后一行）与 Tab 到头（行尾）都放行浏览器默认：
    // Tab 顺势把焦点交给表格下方的 Add 按钮。
    if (!next) return
    event.preventDefault()
    // 成分下拉**关着**时回车若继续冒泡，EP 的 handleKeydown 会 selectOption() →
    // toggleMenu() 把下拉打开 —— 可焦点已经跳到下一格了，于是在对不上的格子上多出一个浮层。
    // 只对 combobox 拦传播：普通 el-input 上的 Enter 保持原样（改前它本来是会冒泡的）。
    if (event.target?.getAttribute?.('role') === 'combobox') event.stopPropagation()
  }

  if (!next) return
  const target = focusableIn(next)
  target?.focus()
  target?.select?.()
}
