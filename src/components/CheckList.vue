<template>
  <h5>{{ title }}</h5>
  <div style="width:100%">
    <table class="sigma_responsive-table"
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
            <td>{{ row.parameters ?? "" }}</td>
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
              ].includes(row.itemName)">
            <td colspan="5">
              <ExtraForm :type="row.itemName" v-model="row.extra" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
<script setup>
  import { ref, watch } from 'vue'
  import ExtraForm from '@/components/Item Additional Required/ExtraForm.vue'
  defineEmits(['update:checked'])
  const props = defineProps({ title: String, list: { type: Array, default: () => [] } })

  watch(
    () => props.list,
    () => props.list.forEach(r => {
      if (!('extra' in r)) r.extra = {}
    }),
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
</style>
