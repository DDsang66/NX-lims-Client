<template>
  <div class="blockContainer">
    <el-select :model-value="modelValue"
               placeholder=""
               style="width: 100%"
               class="thisMulSelect"
               @update:model-value="val => emit('update:modelValue', val)">
      <el-option v-for="option in DetergentsOptions"
                 :key="option"
                 :value="option"
                 :label="option" />
    </el-select>
  </div>
</template>

<script setup>
import {Check, Delete} from "@element-plus/icons-vue";
import {computed, ref, watch} from "vue";

  const props = defineProps({
    DetergentOptionsList: {
      type: Array,
      required: true
    },
    modelValue: {
      type: [String, Array],
      default: ''
    }
  })
  const emit = defineEmits(['update:modelValue'])
//洗涤剂选项
  const DetergentsOptions =["Mild Detergent","Wool Detergent"]
</script>

<style scoped lang="scss">
  .blockContainer {
    width: 100%;
  }

  .thisMulSelect :deep(.el-tag__close) {
    position: relative !important;
    top: auto !important;
    right: auto !important;
    transform: none !important;
  }
</style>
