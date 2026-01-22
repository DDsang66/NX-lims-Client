<template>
  <div style="width: 100%">
    <h5>{{ title }}</h5>
    <div style="width:100%">
      <table class="sigma_responsive-table"
             style="width: 100%"
             ref="myTable"
             @mousedown="onMouseDown"
             @mousemove="onMouseMove"
             @mouseup="onMouseUp"
             @input="onInput">
        <thead>
        <tr>
          <th>Test Item</th>
          <th>Standard</th>
          <th>Parameters</th>
          <th>Sample</th>
          <th>Select</th>
        </tr>
        </thead>

        <tbody>
        <template v-for="(row, idx) in list" :key="row.itemName">
          <tr>
            <!--v-for="row in list" :key="row.itemName"-->
            <td>{{ row.itemName }}</td>
            <td>{{ (row.standards || []).filter(p => p != null && p !== '').join(', ') }}</td>
            <td><pre class="formatted-output" style="max-width: 150px" v-html="formatDataAsHtml(row.parameters)"></pre></td>
            <td contenteditable="true"
                :ref="(el) => setRef(el, idx)"
                @blur="syncSample($event, row)"
                @keydown.enter.prevent="syncSample($event, row)">
              {{ row.samples }}
            </td>
            <td>
              <input type="checkbox"
                     style="width:20px;height:20px"
                     v-model="row.selected"
                     @change="syncCheck(row)" />
            </td>
          </tr>
          <!-- 当 itemName 命中目标值时渲染额外框体 -->
          <tr v-if="[
              'Seam Slippage',
              'Seam Strength',
              'Bursting Strength',
              'Water Resistance-Hydrostatic Pressure',
              'Seam Slippage of Garment Seams'
              ].includes(row.itemName)">
            <td colspan="5">
              <ExtraForm :type="row.itemName" v-model="row.extra" />
            </td>
          </tr>
        </template>
        </tbody>
      </table>
    </div>
  </div>

</template>
<script setup>
import {nextTick, ref, watch} from 'vue'
  import ExtraForm from '@/components/Item Additional Required/ExtraForm.vue'
  defineEmits(['update:checked'])
  const props = defineProps({ title: String, list: { type: Array, default: () => [] } })


  // 声明 ref
  const myTable = ref(null)
//param格式化为html
function formatDataAsHtml(arr) {
  if(!arr) return '';
  if (!Array.isArray(arr)) return arr;

  // 安全转义函数（防止 XSS）
  const escape = (str) => {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      . replace(/>/g, '&gt;');
  };

  return arr
    .map(item => {
      const lines = [`<strong>${escape(item.sample)}:</strong>`];

      for (const [key, value] of Object.entries(item)) {
        if (key === 'sample') continue;

        if (value !== null && typeof value === 'object') {
          for (const [innerKey, innerValue] of Object.entries(value)) {
            if (innerValue === '' || innerValue == null) continue;
            // ✅ 整行：Key: <span>Value</span>,
            lines.push(
              `&nbsp;&nbsp;${escape(innerKey)}: <span class="param-value">${escape(innerValue)}</span>,`
            );
          }
        } else {
          if (value === '' || value == null) continue;
          lines.push(
            `&nbsp;&nbsp;${escape(key)}: <span class="param-value">${escape(value)}</span>,`
          );
        }
      }

      return lines.join('<br>');
    })
    .join('<br>');
}
  // 👇 新增：安全的单元格合并函数（兼容额外行）
function mergeSameCells(table, colIndex = 0) {
  if (!table?.tBodies?.[0]) return;

  const tbody = table.tBodies[0];
  const allRows = Array.from(tbody.rows);

  // Step 1: 标记每一行的类型和是否后接额外行
  const rowInfos = [];
  for (let i = 0; i < allRows.length; i++) {
    const tr = allRows[i];
    const isExtra = tr.cells.length === 1 && tr.cells[0].colSpan >= 5;

    if (isExtra) {
      rowInfos.push({ type: 'extra', tr });
    } else {
      // 👇 关键修复：必须声明 cell
      const cell = tr.cells[colIndex];
      const text = cell ? cell.textContent.trim() : '';
      const hasNextExtra =
        i + 1 < allRows.length &&
        allRows[i + 1].cells.length === 1 &&
        allRows[i + 1].cells[0].colSpan >= 5;

      rowInfos.push({
        type: 'main',
        tr,
        text,
        hasNextExtra
      });
    }
  }

  // Step 2: 合并连续且未被打断的相同项
  let i = 0;
  while (i < rowInfos.length) {
    if (rowInfos[i].type !== 'main') {
      i++;
      continue;
    }

    const current = rowInfos[i];
    let rowspan = 1;
    let j = i + 1;

    // 只有当前行未被打断，才尝试合并
    if (!current.hasNextExtra) {
      while (j < rowInfos.length) {
        const next = rowInfos[j];
        if (next.type !== 'main') {
          j++;
          continue;
        }
        if (next.text !== current.text) break;
        rowspan++;
        j++;
      }
    }

    // 执行合并
    if (rowspan > 1) {
      current.tr.cells[colIndex].rowSpan = rowspan;
      let deleted = 0;
      let k = i + 1;
      while (deleted < rowspan - 1 && k < rowInfos.length) {
        const info = rowInfos[k];
        if (info.type === 'main' && info.tr.cells[colIndex]) {
          info.tr.deleteCell(colIndex);
          deleted++;
        }
        k++;
      }
    }

    i = j; // 跳到下一个未处理的行
  }
}
watch(
  () => props.list,
  async () => {
    // 原有逻辑：初始化 extra
    props.list.forEach(r => {
      if (!('extra' in r)) r.extra = {}
    })
    // ⭐ 等待 Vue 完成 DOM 更新后再合并
    await nextTick()
    mergeSameCells(myTable.value, 0)
  },
  { immediate: true, deep: true }
)


  /* ---------- 批量填写修正 ---------- */
  const isCtrl = ref(false)
  const isDown = ref(false)
  const selectedCells = ref([])
  const cellRefs = ref([])

  const setRef = (el, idx) => cellRefs.value[idx] = el

  function onMouseDown(e) {
    if (!e.ctrlKey) return
    isCtrl.value = true
    isDown.value = true
    selectedCells.value = []
  }

  function onMouseMove(e) {
    if (!isCtrl.value || !isDown.value) return
    const td = e.target
    if (td.tagName === 'TD' && td.contentEditable === 'true' && !selectedCells.value.includes(td)) {
      selectedCells.value.push(td)
      td.classList.add('selected')
    }
  }

  function onMouseUp() {
    isCtrl.value = isDown.value = false
  }

  function onInput(e) {
    const td = e.target
    if (!selectedCells.value.includes(td)) return

    const txt = td.textContent.trim()
    selectedCells.value.forEach(cell => {
      const rowIndex = cell.parentElement.rowIndex - 1   // 0 基
      if (props.list[rowIndex]) {
        props.list[rowIndex].samples = txt
        props.list[rowIndex].selected = !!txt
      }
      cell.classList.remove('selected')
    })
    selectedCells.value = []
  }

  /* ---------- 其余逻辑保持原样 ---------- */
  function syncCheck(row) {
    if (!row.selected && !(row.samples || '').trim()) row.selected = false
  }
  watch(
    () => props.list,
    () => props.list.forEach(row => (row.selected = !!(row.samples || '').trim())),
    { deep: true, immediate: true }
  )

  // 把值写回 row.samples
  function syncSample(e, row) {
    const txt = e.target.textContent.trim()
    // 仅当值真正变化时才更新，避免无谓触发
    if (row.samples !== txt) {
      row.samples = txt
      row.selected = !!txt
    }
  }
</script>

<style scoped>
  .selected {
    background-color: #d0e7ff;
  }
  /*parameters格式化样式*/
  .formatted-output {
  }
  /*高亮*/
  :deep(.param-value) {
    background-color: yellow; /* GitHub 风格的红色 */
  }
</style>
