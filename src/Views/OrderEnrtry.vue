<template>
  <Header />

  <div class="container-fluid"style="padding:3%">
    <div class="row">
      <div class="col-xl-5">
        <div style="border: 1px solid #cae2e8; padding: 20px;">

          <div class="row">
            <div class="form-group col-xl-4">
              <label>ReportNum<span class="text-danger">*</span></label>
              <input type="text" class="form-control" />
            </div>
            <div class="form-group col-xl-4">
              <label>OrderEnrty<span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model.trim="inputRow.composition" />
              <ul v-if="filteredCompositions.length" class="list-group">
                <li v-for="item in filteredCompositions"
                    :key="item"
                    class="list-group-item"
                    @click="selectComposition(item)">
                  {{ item }}
                </li>
              </ul>
            </div>
            <div class="form-group col-xl-4">
              <label>Express<span class="text-danger">*</span></label>
              <select class="form-control">
                <option value="Regular">Regular</option>
                <option value="Express">Express</option>
                <option value="Shuttle">Shuttle</option>
                <option value="Same Date">Same Date</option>
              </select>
            </div>

            <div class="form-group col-xl-6">
              <label>Lab-Out<span class="text-danger">*</span></label>
              <input type="datetime-local" placeholder="出单时间" class="form-control" />
            </div>
            <div class="form-group col-xl-3">
              <label>PC<span class="text-danger">*</span></label>
              <select class="form-control">
                <option value="Regular">PC_1</option>
                <option value="Express">PC_2</option>
                <option value="Shuttle">PC_3</option>
                <option value="Same Date">PC_4</option>
              </select>
            </div>

            <div class="form-group col-xl-3">
              <label>Group<span class="text-danger">*</span></label>
              <select class="form-control">
                <option value="All">All</option>
                <option value="Physics">Physics</option>
                <option value="Wet">Wet</option>
                <option value="Fiber">Fiber</option>
                <option value="Flame">Flame</option>
              </select>
            </div>
            <div class="form-group col-xl-6">
              <label>Lab-In<span class="text-danger">*</span></label>
              <input type="datetime-local" class="form-control" v-model="orderDate"/>
            </div>

            <div class="form-group col-xl-6">
              <label>Review Finish<span class="text-danger">*</span></label>
              <div class="input-group">
                <input type="datetime-local" placeholder="审单完成时间" class="form-control"
                       v-model.number="inputRow.rate" />
                <div class="input-group-append">
                  <button class="sigma_btn-custom shadow-none btn-sm" style="background-color:#3364d5" @click="addRow">+</button>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="form-group col-xl-12">
              <table class="sigma_responsive-table">
                <thead>
                  <tr><th>RepoNum</th><th>Group</th><th style="width:40px;">Delete</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in rows" :key="idx">
                    <td contenteditable="true"
                        @input="updateComposition($event, row)"
                        :data-old-value="row.composition">
                      {{ row.composition }}
                    </td>
                    <td contenteditable="true"
                        @keydown="handleKeydown"
                        @blur="updateRateOnBlur($event, row)"
                        v-text="row.rate"></td>
                    <td style="text-align:center">
                      <button class="btn btn-link text-danger p-0" @click="removeRow(idx)">
                        ×
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- 结果 & 提交 -->
            <div class="form-group col-xl-8">
              <label>Remark</label>
              <input type="text" class="form-control" />
            </div>
            <div class="form-group col-xl-4">
              <label>action </label>
              <button class="sigma_btn-custom primary btn-block" style="background-color:#3364d5" @click="Confirm">Confirm</button>
            </div>
          </div>
        </div>
        </div>


        <div class="col-xl-7">
          <div ref="tableRef" style="height:100%;width:100%;"></div>
        </div>
      </div>
  </div>
  <Footer />
</template>

<script setup>
  import Header from '@/components/Layout/Header.vue'
  import Footer from '@/components/Layout/Footer.vue'
  import '@/assets/css/style.css';
  import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
  import { ListTable, PivotTable, TYPES, themes } from '@visactor/vtable';
  import * as VTable from '@visactor/vtable'
  const emit = defineEmits(['confirm']);

  const orderDate = ref('')
  /* 生成当前本地时间字符串（YYYY-MM-DDTHH:mm） */
  function nowLocal() {
    const d = new Date()
    const Y = d.getFullYear()
    const M = String(d.getMonth() + 1).padStart(2, '0')
    const D = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${Y}-${M}-${D}T${h}:${m}`
  }



  /* 折叠开关 */
  const isNoticeOpen = ref(false)
  function toggleNotice() {
    isNoticeOpen.value = !isNoticeOpen.value;
  }
  /* 输入行 */
  const inputRow = reactive({
    composition: '',
    rate: 0
  })

  /* 表格数据 */
  const rows = reactive([])

  /* 添加行 */
  function addRow() {
    if (!inputRow.composition.trim() || inputRow.rate <= 0) return alert('请输入成分和比例')
    if (totalRate.value + inputRow.rate > 100) {
      alert('比例不能超过100%');
    } else {
      rows.push({ composition: inputRow.composition.trim(), rate: inputRow.rate })
      inputRow.composition = ''
      inputRow.rate = 0
    }
  }

  /* 实时计算总比例 & MaxComposition */
  const totalRate = computed(() => rows.reduce((s, r) => s + r.rate, 0))
  const maxComposition = computed(() => {
    const synth = rows.filter(r => isSynth(r.composition)).reduce((s, r) => s + r.rate, 0)
    const nat = rows.filter(r => isNatural(r.composition)).reduce((s, r) => s + r.rate, 0)
    return synth > 50 ? 'Synth' : nat > 50 ? 'Natural' : ''
  })

  /* 判断类别 */
  const synthList = ['Acetate', 'Polyester', 'Polyamide', 'Polyurethane', 'Polyethylene', 'Elastane', 'Spandex', 'Viscose', 'Acrylic', 'Modal', 'Tencel', 'Meraklon', 'Lycra', 'Lyocell', 'Modacrylic', 'Nylon', 'Rayon', 'Vinylon']
  const naturalList = ['Cotton', 'Wool', 'Silk', 'Ramie', 'Mohair', 'Tussah', 'Linen', 'Asbestos']
  const isSynth = str => synthList.includes(str)
  const isNatural = str => naturalList.includes(str)

  const allCompositions = ref([...synthList, ...naturalList]);
  const filteredCompositions = computed(() => {
    const kw = inputRow.composition.trim().toLowerCase();
    if (!kw) return [];
    return allCompositions.value.filter(i =>
      i.toLowerCase().includes(kw)
    );
  });
  function selectComposition(item) {
    inputRow.composition = item;
  }
  //删除行
  function removeRow(idx) {
    rows.splice(idx, 1);
  }

  async function Confirm() {
    try {
      emit('confirm', rows);   // 把 rows 发出去
      alert('提交成功！');
    } catch (e) {
      console.error(e);
    }
  }

  function updateComposition(e, row) {
    const newValue = e.target.textContent.trim();
    if (row.composition !== newValue) {
      row.composition = newValue;
    }
  }
  function handleKeydown(e) {
    // 检测是否按下了 Enter 键
    if (e.key === 'Enter') {
      // 阻止默认行为（换行）
      e.preventDefault();

      // 让当前元素失去焦点，触发 @blur
      e.target.blur();
    }
  }
  function  // 失焦时才进行校验和更新
    updateRateOnBlur(e, row) {
    const inputText = e.target.textContent.trim();
    const newValue = parseFloat(inputText);

    // 校验：非数字 → 0，超出范围 → 限制
    const clampedValue = isNaN(newValue)
      ? 0
      : Math.min(100, Math.max(0, newValue));
    let oldValue = row.rate;
    row.rate = clampedValue;
    if (totalRate.value > 100) {
      alert('比例不能超过100%');
      e.target.textContent = oldValue;
    }
    // 只有值真正变化时才更新
    if (row.rate !== clampedValue) {
      row.rate = clampedValue;
      // ✅ 同步显示（防止用户输入无效值后仍显示错误内容）
      e.target.textContent = clampedValue;
    } else {
      // 如果值没变，确保显示的是正确的 number 格式（比如去掉多余空格）
      e.target.textContent = row.rate;
    }
  }


  /* ---------- 1. 数据 ---------- */
  const tableOptions = ref({
    header: [
      { field: '0', caption: 'Repo'},
      { field: '1', caption: 'OrderEntry' },
      { field: '2', caption: 'Lab-Out' },
      { field: '3', caption: 'Lab-In' },
      { field: '4', caption: 'Express' },
      { field: '5', caption: 'PC' },
      { field: '6', caption: 'Group' },
      { field: '7', caption: 'Review Finish' },
    ],
    records: Array.from({ length: 100 }, () => ['10001', '进单人1', '', '', '', '', '', '', ''])
  })

  /* ---------- 2. 挂载 ---------- */
  const tableRef = ref(null)
  let tableInstance = null

  onMounted(() => {
    tableInstance = new VTable.ListTable(tableRef.value, tableOptions.value)
  })

  onUnmounted(() => {
    orderDate.value = nowLocal()
    tableInstance?.release()
  })
</script>

<style scoped>
  .sigma_btn-custom::before {
    background-color: #18086a;
  }

  .form-control {
      border-radius:0px;
      border-color:#a3a3a3
  }
</style>
