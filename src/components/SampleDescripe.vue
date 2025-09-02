<template>
  <div class="row">
    <div class="col-xl-12 form-group">
      <!-- 标题 + 折叠开关 -->
      <div class="sigma_notice">
        <p>
          <a style="text-align:center;color:#ffd800" href="#" @click.prevent="toggleNotice()">
            Sample Description.
          </a>
        </p>
      </div>
      <transition name="fade">
        <!-- 折叠面板 -->
        <div v-show="isNoticeOpen" :class="['sigma_notice-content', { block: isNoticeOpen.value }]">
          <!-- 输入 -->
          <div class="row">
            <div class="form-group col-xl-4">
              <label>Property<span class="text-danger">*</span></label>
              <select class="form-control" v-model="Property">
                <option value="">N/A</option>
                <option v-for="option in property" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="form-group col-xl-8">
              <label>Word Entry<span class="text-danger">*</span></label>
              <div class="input-group">
                <input type="text" class="form-control" v-model="inputVal"/>
                <select class="form-control" v-model="Word">
                  <option value="">N/A</option>
                  <option v-for="option in wordOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <div class="input-group-append">
                  <button class="sigma_btn-custom shadow-none btn-sm" style="background-color:#3364d5" @click="addWord">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 表格 -->
          <div class="row">
            <div class="form-group col-xl-12">
              <table class="sigma_responsive-table">
              </table>
            </div>
            <!-- 结果 & 提交 -->
            <div class="form-group col-xl-6">
              <label>Description</label>
              <input type="text" class="form-control" v-model="description" readonly />
            </div>
            <div class="form-group col-xl-3">
              <label>action </label>
              <button class="sigma_btn-custom primary btn-block" style="background-color:#3364d5"@click="clear">Clear</button>
            </div>
            <div class="form-group col-xl-3">
              <label>action </label>
              <button class="sigma_btn-custom primary btn-block" style="background-color:#3364d5"@click ="confirm">Confirm</button>
            </div>
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
  const isNoticeOpen = ref(false)
  function toggleNotice() {
    isNoticeOpen.value = !isNoticeOpen.value;
    console.log("Toggle Notice:", isNoticeOpen.value);
  }


  const Property = ref('');
  const Word = ref('');
  const inputVal = ref('');
  const description = ref('');
  const property = ref([
    { value: 'AfterWash', label: 'AfterWash' },
    { value: 'Structure', label: 'Structure' },
    { value: 'Season', label: 'Season' },
    { value: 'State', label: 'State' },
    { value: 'Age', label: 'Age' },
    { value: 'Style', label: 'Style' },
    { value: 'Category', label: 'Category' },
    { value: 'Country', label: 'Country' },
    { value: 'Other', label: 'Other' },
  ]);

  const wordMap = {
    Structure: ['Woven', 'Knit', 'Non-Woven'],
    Season: ['SS_25', 'SS_26', 'AW_25', 'AW_26'],
    State: ['Fabric', 'Garment', 'Component', '1st Bulk', 'Development'],
    Age: ['Baby', 'Child', 'Adult'],
    Style: ['Casual', 'Fashion', 'Hybrid', 'Performance', 'Teamwear/Teamsport', 'Swimwear'],
    Category: ['Top', 'Bottom', 'Shoes'],
    Country: ['CN', 'US', 'JP', 'EN'],
    AfterWash: ['1 Wash', '3 Wash', '5 Wash', '10 Wash', '15 Wash', '20 Wash'],
    Other: ['Fill the InputBox']
  }

  //根据 Property 返回当前可选 Word 列表
  const wordOptions = computed(() => {
    return (wordMap[Property.value] || []).map(v => ({ value: v, label: v }))
  })

  //监听 Property 变化，清空 Word
  watch(Property, () => {
    Word.value = ''
  })


  /* 新增方法 */
  function addWord() {
    const text = inputVal.value.trim()
    const sel = Word.value.trim()

    const parts = []
    if (text) parts.push(text)
    if (sel) parts.push(sel)

    if (parts.length === 0) return   // 两个都空就不处理

    // 第一次直接写，之后用 “-” 连接
    description.value = description.value
      ? `${description.value}-${parts.join('-')}`
      : parts.join('-')

    // 清空输入框和 select
    inputVal.value = ''
    Word.value = ''
  }

  function clear()
  {
    description.value = "";
  }

  function confirm() {
    try {
      emit('confirm', description.value);
      alert('提交成功！');
    } catch (e) {
      console.error(e);
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
