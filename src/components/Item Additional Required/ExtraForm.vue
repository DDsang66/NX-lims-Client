<template>
  <div class="alert mb-0" :class="`alert-${type}`">
    <label>{{ type }} Garment Only：</label>
    <input v-model="modelValue.desc" placeholder="description" class="form-control mb-2" />
    <select v-model="modelValue.level" class="form-control">
      <option :value="1">sample_1</option>
      <option :value="2">sample_2</option>
    </select>
  </div>
</template>

<script setup>
 defineProps({ type: String, modelValue: Object })
const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
  .sigma_btn-custom::before {
    background-color: #18086a;
  }
</style>
