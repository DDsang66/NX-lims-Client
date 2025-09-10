<template>
  <div class="alert mb-0" :class="`alert-${type}`">
    <label>{{ type }} Garment Only：</label>
    <input v-model="desc" placeholder="Select the Components below." class="form-control mb-2" readonly />
    <div class="row">
      <div class="form-group col-xl-2">
        <input v-model="inputVal" class="form-control mb-2" />
      </div>
      <div class="form-group col-xl-5">
        <select class="form-control mb-2" v-model="Layout">
          <option value="Inner Shell">Inner Shell</option>
          <option value="Outer Shell">Outer Shell</option>
          <option value="Inner Lining">Inner Lining</option>
          <option value="Outer Linin'">Outer Lining</option>
        </select>
      </div>
      <div class="form-group col-xl-5">
        <div class="input-group">
          <select class="form-control" v-model="Component">
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
  const props = defineProps({ type: String, modelValue: Object })
  const emit = defineEmits(['update:modelValue'])
  const desc = ref('')
  const inputVal = ref('')
  const Layout = ref('')
  const Component = ref('')

  function addWord() {
    const text = inputVal.value.trim()
    const lay = Layout.value.trim()
    const comp = Component.value.trim()
    if (!text && !lay && !comp) return
    const oldDesc = desc.value
    const headParts = []
    if (text) headParts.push(text)
    if (lay) headParts.push(lay)
    const headStr = headParts.join('-')

    /* ---------- 只拼 Component 的条件 ---------- */
    // 已经存在 headStr，并且本次 Component 有值
    const canAppendOnlyComp = headStr &&
      oldDesc.includes(headStr) &&
      comp

    if (canAppendOnlyComp) {
      desc.value = `${oldDesc}-${comp}`
    } else {
      /* 如果是第一次 or headStr 变了：整行重写 */
      const allParts = []
      if (headStr) allParts.push(headStr)
      if (comp) allParts.push(comp)
      desc.value = allParts.join('-')
    }

    // 回传父组件
    emit('update:modelValue', {
      ...props.modelValue,
      Param: desc.value
    })

    // 清空输入
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
