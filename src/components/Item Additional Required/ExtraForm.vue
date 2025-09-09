<template>
  <div class="alert mb-0" :class="`alert-${type}`">
    <label>{{ type }} Garment Only：</label>
    <input v-model="modelValue.desc" placeholder="Select the Components below." class="form-control mb-2" readonly />
    <div class="row">
      <div class="form-group col-xl-2">
        <input v-model="inputVal" class="form-control mb-2" />
      </div>
      <div class="form-group col-xl-5">
        <select class="form-control mb-2" v-model="Layout">
          <option :value="InnerShell">Inner Shell</option>
          <option :value="OuterShell">Outer Shell</option>
          <option :value="InnerLining">Inner Lining</option>
          <option :value="OuterLining">Outer Lining</option>
        </select>
      </div>
      <div class="form-group col-xl-5">
        <div class="input-group">
          <select class="form-control" v-model="Component">
            <option :value="1">sample_1</option>
            <option :value="2">sample_2</option>
          </select>
          <div class="input-group-append">
            <button class="sigma_btn-custom shadow-none btn-sm" @click="addWord">+</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
  import { ref, reactive, computed, watch } from 'vue'
 defineProps({ type: String, modelValue: Object })
  const emit = defineEmits(['update:modelValue'])
  const inputVal = ref('');
  const Component = ref('');
  const modelValue = ref('');

  function addWord() {
    const text = inputVal.value.trim()
    const sel = Component.value.trim()

    const parts = []
    if (text) parts.push(text)
    if (sel) parts.push(sel)

    if (parts.length === 0) return   // 两个都空就不处理

    // 第一次直接写，之后用 “-” 连接
    modelValue.value = modelValue.value
      ? `${modelValue.value}-${parts.join('-')}`
      : parts.join('-')

    // 清空输入框和 select
    inputVal.value = ''
    Component.value = ''
  }

</script>

<style scoped>
  .sigma_btn-custom::before {
    background-color: #18086a;
  }

  .form-control {
      border-radius:0px;
  }
</style>
