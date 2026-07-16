// 查找 td 内的第一个 input 元素（el-input / el-select 的内部 input）
function getFocusableInput(td) {
  return td?.querySelector('input');
}

// 获取当前 td 在 tr 中的列索引
function getColumnIndex(td) {
  const tr = td.parentElement;
  return Array.from(tr.children).indexOf(td);
}

// 获取同一 tr 中下一个可输入的 td（跳过操作列/空列）
function getNextTd(td) {
  const tr = td.parentElement;
  const cells = Array.from(tr.children);
  const idx = getColumnIndex(td);
  for (let i = idx + 1; i < cells.length; i++) {
    const input = getFocusableInput(cells[i]);
    if (input && !cells[i].querySelector('.el-button')) return cells[i];
  }
  return null;
}

// 获取下一行的同列 td
function getDownTd(td) {
  const tr = td.parentElement;
  const tbody = tr.parentElement;
  const rows = Array.from(tbody.children);
  const colIdx = getColumnIndex(td);
  const currentRowIdx = rows.indexOf(tr);
  if (currentRowIdx >= 0 && currentRowIdx < rows.length - 1) {
    const nextRow = rows[currentRowIdx + 1];
    const nextTd = nextRow.children[colIdx];
    if (nextTd && getFocusableInput(nextTd) && !nextTd.querySelector('.el-button')) {
      return nextTd;
    }
  }
  return null;
}

/**
 * 表格键盘导航入口
 * @param {KeyboardEvent} event  键盘事件
 * @param {'enter'|'tab'} direction 方向
 */
export function handleTableKeydown(event, direction) {
  const td = event.target.closest('td');
  if (!td) return;

  const nextTd = direction === 'tab' ? getNextTd(td) : getDownTd(td);
  if (nextTd) {
    event.preventDefault();
    const input = getFocusableInput(nextTd);
    input?.focus();
    input?.select?.();
  }
}
