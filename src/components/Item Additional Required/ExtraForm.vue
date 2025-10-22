<template>
  <div class="alert mb-0" :class="`alert-${type}`">
    <label>{{ type }} Garment Only：</label>
    <div class="row">
      <div class="form-group col-xl-9">
        <input v-model="desc" placeholder="Select the Components below." class="form-control mb-2" readonly />
      </div>
      <div class="form-group col-xl-3">
        <button class="sigma_btn-custom" @click="confirm" style="border-radius:0px;">ok</button>
      </div>
    </div>
    <div class="row">
      <div class="form-group col-xl-2">
        <input v-model="inputVal" class="form-control mb-2" />
      </div>
      <div class="form-group col-xl-5">
        <select class="form-control mb-2" v-model="Layout" v-if="type!=='Water Resistance-Hydrostatic Pressure'">
          <option value="Inner Shell">Inner Shell</option>
          <option value="Outer Shell">Outer Shell</option>
          <option value="Inner Lining">Inner Lining</option>
          <option value="Outer Linin'">Outer Lining</option>
        </select>
        <input v-model="Layout" class="form-control mb-2" v-else/>
      </div>
      <div class="form-group col-xl-5">
        <div class="input-group">
          <select class="form-control" v-model="Component" v-if="type!=='Water Resistance-Hydrostatic Pressure'">
            <option value="Side">Side Seam</option>
            <option value="Sleeve">Sleeve Seam</option>
            <option value="Armhole">Armhole Seam</option>
            <option value="Shoulder">Shoulder Seam</option>
            <option value="Armprit">Armprit Seam</option>
            <option value="Front Panel">Front Panel Seam</option>
            <option value="Back Panel">Back Panel Seam</option>
            <option value="Outside">Out-side Seam</option>
            <option value="Inside">In-side Seam</option>
            <option value="Back Rise">Back Rise Seam</option>
            <option value="Front Crotch">Front Crotch Seam</option>
            <option value="Cross">Cross Seam</option>
          </select>
          <select class="form-control" v-model="Component" v-else>
            <option value="mbar">mbar</option>
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
  import { ref, watch } from 'vue'


  /* ---------------- props / emit ---------------- */
  const props = defineProps({
    type: String,
    modelValue: Array        // 现在是数组
  })
  const emit = defineEmits(['update:modelValue'])

  /* ---------------- 本地录入状态 ---------------- */
  const desc = ref('')
  const inputVal = ref('')
  const Layout = ref('')
  const Component = ref('')

  /* ---------------- 「+」只负责拼 desc ---------------- */
  function addWord() {
  WaterRHPLayoutBlur()
    const text = inputVal.value.trim()
    const lay = Layout.value.trim()
    const comp = Component.value.trim()
    if (!text && !lay && !comp) return

    const headParts = []
    if (text) headParts.push(text)
    if (lay) headParts.push(lay)
    const headStr = headParts.join('-')

    const canAppendOnlyComp = headStr && desc.value.includes(headStr) && comp

    if (canAppendOnlyComp) {
      desc.value = `${desc.value}-${comp}`
    } else {
      const allParts = []
      if (headStr) allParts.push(headStr)
      if (comp) allParts.push(comp)
      desc.value = allParts.join('-')
    }

    Component.value = ''   // 每次选完 component 后清空下拉框
  }

  /* ---------------- 「OK」把当前 desc 存成对象 ---------------- */
  function confirm() {
    if (!desc.value.trim()) return

    /* --- 拼出整条 Param --- */
    const newItem = {
      Param: desc.value.trim(),
      input: inputVal.value.trim(),
      layout: Layout.value.trim(),
      component: ''               // 先留空
    }

    /* --- 反向解析：把 Param 除第一段外全部写回 component --- */
    const parts = newItem.Param.split('-')
    // 只有 ≥3 段才需要反填
    if (parts.length > 2) {
      newItem.component = parts.slice(2).join('-')
      // 去掉「input-layout」后剩下的
    }

    /* --- 继续原来的追加逻辑 --- */
    const currentList = Array.isArray(props.modelValue) ? props.modelValue : []
    emit('update:modelValue', [...currentList, newItem])

    /* --- 清空录入区（保持原样） --- */
    desc.value = ''
    inputVal.value = ''
    Layout.value = ''
    Component.value = ''
  }
  function WaterRHPLayoutBlur(){
    //判断Layout是数字，且大于零
    if(!Number(Layout.value) && Number(Layout.value)<=0){
      return alert('Please enter a number greater than zero.')
    }
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
