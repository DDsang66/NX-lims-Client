<template>
  <div class="row">
    <div class="col-xl-12 form-group">
      <!-- 标题 + 折叠开关 -->
      <div class="sigma_notice">
        <p>
          <a style="text-align:center;color:#3364d5" href="#" @click.prevent="toggleNotice()">
            Fiber Content.
          </a>
        </p>
      </div>
      <transition name="fade">
        <!-- 折叠面板 -->
        <div v-show="isNoticeOpen" :class="['sigma_notice-content', { block: isNoticeOpen.value }]">
          <!-- 输入 -->
          <div class="row">
            <div class="form-group col-xl-6">
              <label>Composition<span class="text-danger">*</span></label>
              <input type="text" placeholder="成分" class="form-control" v-model.trim="inputRow.composition" />
              <ul v-if="filteredCompositions.length" class="list-group">
                <li v-for="item in filteredCompositions"
                    :key="item"
                    class="list-group-item"
                    @click="selectComposition(item)">
                  {{ item }}
                </li>
              </ul>
            </div>
            <div class="form-group col-xl-6">
              <label>Rate<span class="text-danger">*</span></label>
              <div class="input-group">
                <input type="number" placeholder="比例" class="form-control"
                       v-model.number="inputRow.rate" min="0" max="100" />
                <div class="input-group-append">
                  <button class="sigma_btn-custom shadow-none btn-sm" style="background-color:#3364d5" @click="addRow">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 表格 -->
          <div class="row">
            <div class="form-group col-xl-12">
              <table class="sigma_responsive-table">
                <thead>
                  <tr><th>Composition</th><th>Rate(%)</th><th style="width:40px;">Delete</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in rows" :key="idx">
                    <td contenteditable="true"
                        @input="updateComposition($event, row)"
                        :data-old-value="row.composition">
                      {{ row.composition }}
                    </td>
                    <td
                      contenteditable="true"
                      @keydown="handleKeydown"
                      @blur="updateRateOnBlur($event, row)"
                      v-text="row.rate"
                    ></td>
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
            <div class="form-group col-xl-12">
              <label>Composition > 50%</label>
              <input type="text" class="form-control" :value="maxComposition" readonly />
            </div>
<!--            <div class="form-group col-xl-4">-->
<!--              <label>action </label>-->
<!--              <button class="sigma_btn-custom primary btn-block" style="background-color:#3364d5" @click="Confirm">Confirm</button>-->
<!--            </div>-->
          </div>
        </div>
        </transition>
</div>
  </div>
</template>

<script setup>
  import '@/assets/css/style.css';
  import { ref, reactive, computed, watch } from 'vue'
  const emit = defineEmits(['confirm']);


  /* 折叠开关 */
  const isNoticeOpen = ref(true)
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
    if(totalRate.value+inputRow.rate>100){
      alert('比例不能超过100%');
    }else {
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
  const synthList = ['Acetate', 'Polyester', 'Polyamide', 'Polyurethane', 'Polyethylene', 'Elastane', 'Spandex', 'Viscose', 'Acrylic', 'Modal', 'Tencel', 'Meraklon', 'Lycra', 'Lyocell', 'Modacrylic' ,'Nylon', 'Rayon', 'Vinylon']
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

  // async function Confirm() {
  //   try {
  //     emit('confirm', rows);   // 把 rows 发出去
  //     alert('提交成功！');
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }
  watch(rows,() => {
    emit('confirm', rows)
  })
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
    if(totalRate>100){
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

</script>

<style scoped>
  .sigma_btn-custom::before {
    background-color: #18086a;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.6s;
  }

  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
</style>
