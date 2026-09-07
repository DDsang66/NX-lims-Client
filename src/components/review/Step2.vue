<template>
  <div class="paramsContainer thisBlock">
    <div class="sharedParametersContainer">
      <div class="pieceContainer">
        <!-- Care Label 和 Sample Composition 左右并排 -->
        <div class="oneLinePiece">
          <!-- Care Label 框体 -->
          <div class="thisPiece careLabelContainer">
            <span class="paramTitle">{{$t('careLabel')}}</span>
            <div class="careLabelWrapper">
              <!-- 洗标选择 -->
              <div class="careLabelLeft">
                <CareLabelSelect class="pieceContent" v-model="careLabelData" />

                <div class="specialCareContent">
                  <div class="careInstructionItem">
                    <span class="instructionLabel">{{$t('AfterWashing')}}</span>
                    <AfterWashingSelect class="pieceContent" :afterWashItems="afterWashItems" :sampleSummary="allSample" />
                  </div>
                  <div class="careInstructionItem">
                    <span class="instructionLabel">{{$t('Detergent')}}</span>
                    <DetergentSelect class="pieceContent" :detergentItems="detergentItems" :sampleSummary="allSample" />
                  </div>
                  <!-- Special Care Instruction + After Iron 同一行 -->
                  <div class="careInstructionItem combinedCareRow">
                    <span class="instructionLabel">{{$t('After Iron')}}</span>
                    <el-select v-model="afterIronValue" placeholder="" style="width: 200px">
                      <el-option v-for="option in afterIronOptions"
                                 :key="option.value"
                                 :value="option.value"
                                 :label="option.label" />
                    </el-select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sample Composition 独立框体（与 CareLabel 同级） -->
          <div class="thisPiece compositionPiece">
            <span class="paramTitle">{{$t('sampleComposition')}}</span>
            <SampleSpecificComposition class="pieceContent"
                                       @confirm="handleRowsSingle"
                                       :sampleSummary="allSample" />
          </div>
        </div>

        <!-- Sample Description 独立一行 -->
        <div class="thisPiece descriptionPiece">
          <span class="paramTitle">{{$t('sampleDescription')}}</span>
          <SampleSpecificDescrip class="pieceContent"
                                 :sampleSummary="allSample"
                                 :buyerNameDto="buyerNameDto"
                                @descrip-change="handleDescripChange"/>
        </div>

        <!-- 其他参数 -->
        <div class="thisPiece otherParamsPiece">
          <span class="paramTitle">{{$t('otherParameters')}}</span>
          <div class="pieceContent otherParamsContainer">
            <div class="line-flex-container" v-for="param in orderParams" :key="param.name">
              <label>{{ $t(param.name) }}</label>
              <el-input v-model="param.value" v-if="param.type==='input'"
                        style="width: 100px"></el-input>
              <el-select v-model="param.value" v-else-if="param.type==='select'"
                         placeholder=""
                         :empty-values="[null,undefined]"
                         style="width: 200px">
                <el-option v-for="option in param.options" :key="option.value" :value="option.value" :label="option.label">
                </el-option>
              </el-select>
              <el-select v-model="param.value" v-else multiple style="width: 100px" :empty-values="[null,undefined]">
                <el-option v-for="option in param.options" :key="option.value" :value="option.value" :label="option.label">
                </el-option>
              </el-select>
            </div>
          </div>
        </div>

        <!-- 接缝参数 -->
        <div class="thisPiece seamPiece" v-if="seamSamples.length>0">
          <span class="paramTitle">{{$t('seamParameter')}}</span>
          <SeamRequire class="pieceContent" :seamSamples="seamSamples"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import CareLabelSelect from "@/components/review/CareLabelSelect.vue";
  import { computed, reactive, ref, watch, nextTick } from "vue";
  import SampleSpecificComposition from "@/components/review/SampleSpecificComposition.vue";
  import SampleSpecificDescrip from "@/components/review/SampleSpecificDescrip.vue";
  import SeamRequire from "@/components/review/ItemRequire/SeamRequire.vue";
  import AfterWashingSelect from "@/components/review/ItemRequire/AfterWashingSelect.vue";
  import DetergentSelect from "@/components/review/ItemRequire/DetergentSelect.vue";
  import { isEqual } from 'lodash-es';
  import request from "@/utils/request.js";
  import { ElMessage } from 'element-plus';

  const conditionsGroups = ref([]);
  //和样品绑定的成分
  const fiberCompositionSingle = ref([])
  //订单参数 (移除 afterIron，因为它已移到 Care Label 中)
  const orderParams = ref([
    // 可以在这里添加其他参数
  ])
  const sampleSpecificDescripDoM = ref(null);
  const props = defineProps({
    step1Dom: Object,
    step1Data: Object, 
    buyerNameDto: String,
    buyerCode: { type: String, default: null },
    buyerIsIndividualTraveler: { type: Boolean, default: false },
  })

  const afterWashItems = ref(["item1", "item2"])
  const detergentItems = ref(["item1", "item2"])

  // AfterIron 数据（现在作为 Special Care Instruction 的值）
  const afterIronValue = ref('')
  const afterIronOptions = [
    { label: 'After Iron', value: 'After Iron' },
    { label: 'Before and After Iron', value: 'Before and After Iron' },
    { label: 'Do Not Iron', value: '' }
  ]

  //洗标数据
  const careLabelData = ref({
    washLabelRegionDefault: "Europe",
    MachineType: 'Type A',
    Temperature: '',
    WashingProcess: '',
    WashingProcedure: {
      value: '',
      label: '',
      src: [new URL('../../assets/img/wet Care Label/Europe/Washing/No Wash.jpg', import.meta.url).href]
    },
    DryProcedure: {
      value: '',
      label: '',
      src: [new URL('../../assets/img/wet Care Label/Europe/Dry/Do not tumble dry.jpg', import.meta.url).href]
    },
    DryCleanProcedure: {
      value: '',
      label: '',
      src: [new URL('../../assets/img/wet Care Label/Europe/DC/Do not dry-clean.jpg', import.meta.url).href]
    },
    IronMethod: {
      value: '',
      label: '',
      src: [new URL('../../assets/img/wet Care Label/Europe/Iron/Do not iron.jpg', import.meta.url).href]
    },
    BleachProcedure: {
      value: '',
      label: '',
      src: [new URL('../../assets/img/wet Care Label/Europe/Bleach/Do not bleach.jpg', import.meta.url).href]
    }
  })

  //---------------------------------------------------------------------------------------------------------------------------------------------------

  //根据menus获取所有smaple
  let allSample = computed(() => {
    let samples = new Set()
    props.step1Dom?.menus?.forEach(menu => {
      //分组
      if (menu.groups) {
        menu.groups.forEach(group => {
          group.items.forEach(item => {
            item.samples.forEach(sample => {
              samples.add(sample)
            })
          })
        })
      } else {
        menu.items.forEach(item => {
          item.samples.forEach(sample => {
            samples.add(sample)
          })
        })
      }
    })
    return Array.from(samples).sort()
  })

  //ConditionPool初始化
  watch(allSample, (samples) => {
    const oldGroups = conditionsGroups.value;
    const newGroups = [];

    oldGroups.forEach(group => {
      const remainingTestPoints = group.testPoints.filter(tp => samples.includes(tp));
      if (remainingTestPoints.length > 0) {
        newGroups.push({ ...group, testPoints: remainingTestPoints });
      }
    });

    const samplesInGroups = newGroups.flatMap(g => g.testPoints);
    const missingSamples = samples.filter(s => !samplesInGroups.includes(s));

    missingSamples.forEach(sample => {
      newGroups.push({
        testPoints: [sample],
        conditions: {
          CheckListId: props.step1Data?.checkListId ?? null,     // ← 新增
          ConditionPoolId: props.step1Data?.conditionPoolId ?? null,   // ← 新增
          ReportNo: props.step1Data?.reportNo ?? null,     
          BuyerCode: props.buyerCode ?? null,
          BuyerIsIndividualTraveler: props.buyerIsIndividualTraveler ?? false,
        }
      });
    });

    conditionsGroups.value = newGroups;
  }, { immediate: true });

  watch(
    () => [props.buyerCode, props.buyerIsIndividualTraveler],
    ([newBuyerCode, newIsIndividualTraveler]) => {
      conditionsGroups.value.forEach(group => {
        group.conditions.BuyerCode = newBuyerCode ?? null;
        group.conditions.BuyerIsIndividualTraveler = newIsIndividualTraveler ?? false;
      });
    },
    { deep: true }
  );

  // 监听 fiberCompositionSingle 变化（Composition 组件数据）
  watch(fiberCompositionSingle, (newFiberCom) => {
    // newFiberCom 是 [{sample, composition: [...]}]
    newFiberCom.forEach(item => {
      const group = conditionsGroups.value.find(g => g.testPoints.includes(item.sample));
      if (group) {
        // 如果 conditions 对象还没有 composition 键，则初始化
        if (!group.conditions.composition) {
          group.conditions.composition = {};
        }
        // 更新 composition 数据（可能结构是数组）
        group.conditions.composition = item.composition;
      }
    });
    // 可选：触发合并相同 conditions 的操作
    // mergeGroupsWithSameConditions();
  }, { deep: true });

  // 监听 descripGroups 变化（通过 ref 访问）
  watch(
    () => sampleSpecificDescripDoM.value?.descripGroups?.value,  // 注意加了 .value
    (newDescripGroups) => {
      console.log('descripGroups changed:', newDescripGroups);
      if (!newDescripGroups) return;
      // 清空之前所有 group 的 description，避免残留
      conditionsGroups.value.forEach(g => {
        if (g.conditions.description) delete g.conditions.description;
      });
      // 遍历每个 descrip group
      newDescripGroups.forEach(dg => {
        dg.samples.forEach(sample => {
          const group = conditionsGroups.value.find(g => g.testPoints.includes(sample));
          if (group) {
            group.conditions.description = dg.propertyTable;
          }
        });
      });
    },
    { deep: true, immediate: true }
  );

  // 3. 同步共享参数（CareLabel、AfterIron、OtherParams 等）
  // 定义计算属性，提取需要放入 conditions 的字段
  const sharedConditions = computed(() => ({
    washLabelRegionDefault: careLabelData.value.washLabelRegionDefault,
    MachineType: careLabelData.value.MachineType,
    Temperature: careLabelData.value.Temperature,
    WashingProcess: careLabelData.value.WashingProcess,
    WashingProcedure: careLabelData.value.WashingProcedure?.value,
    DryProcedure: careLabelData.value.DryProcedure?.value,
    DryCleanProcedure: careLabelData.value.DryCleanProcedure?.value,
    IronMethod: careLabelData.value.IronMethod?.value,
    BleachProcedure: careLabelData.value.BleachProcedure?.value,
    afterIron: afterIronValue.value,
    otherParams: Object.fromEntries(orderParams.value.map(p => [p.name, p.value])),
  }));

  //处理样描信息的更新
  function handleDescripChange(newDescripGroups) {
    if (!newDescripGroups) return;

    // 1. 收集所有当前样描组中的属性名，用于清除旧键
    const allPropertyNames = new Set();
    newDescripGroups.forEach(dg => {
      dg.propertyTable.forEach(prop => {
        if (prop.propertyName) allPropertyNames.add(prop.propertyName);
      });
    });

    // 2. 删除所有 group 中这些旧键
    conditionsGroups.value.forEach(group => {
      allPropertyNames.forEach(propName => {
        if (group.conditions.hasOwnProperty(propName)) {
          delete group.conditions[propName];
        }
      });
    });

    // 3. 重新设置属性值
    newDescripGroups.forEach(dg => {
      dg.samples.forEach(sample => {
        const group = conditionsGroups.value.find(g => g.testPoints.includes(sample));
        if (group) {
          dg.propertyTable.forEach(prop => {
            if (prop.propertyName) {
              group.conditions[prop.propertyName] = prop.value;
            }
          });
        }
      });
    });
  }

  // 当共享参数变化时，将其合并到所有 group 的 conditions 中
  watch(sharedConditions, (newShared) => {
    conditionsGroups.value.forEach(group => {
      // 注意：不要覆盖 composition 和 description，采用合并方式
      group.conditions = {
        ...group.conditions,
        ...newShared,
      };
    });
  }, { deep: true, immediate: true });

  watch(conditionsGroups, (val) => {
    console.log('conditionsGroups updated:', JSON.parse(JSON.stringify(val)));
  }, { deep: true });
  //---------------------------------------------------------------------------------------------------------------------------------------------------

  //用户在 step2 中修改某个测点的条件时，需要更新对应 group 的 conditions
  function updateGroupConditions(sample, newConditions) {
    const group = conditionsGroups.value.find(g => g.testPoints.includes(sample));
    if (group) {
      // 合并或直接替换，根据业务需求决定
      group.conditions = { ...group.conditions, ...newConditions };
    }
  }

  function mergeGroupsWithSameConditions() {
    const merged = [];
    conditionsGroups.value.forEach(group => {
      const existing = merged.find(g => isEqual(g.conditions, group.conditions));
      if (existing) {
        existing.testPoints.push(...group.testPoints);
      } else {
        merged.push({ ...group, testPoints: [...group.testPoints] });
      }
    });
    conditionsGroups.value = merged;
  }


  //接缝样品
  const seamSamples = computed(() => {
    let seamSamplesSet = new Set()
    props.step1Dom?.menus?.forEach(menu => {
      //如果有groups
      if (menu.groups) {
        menu.groups.forEach(group => {
          group.items.forEach(item => {
            if (item.itemName.includes('Seam'))
              item.samples.forEach(sample => {
                seamSamplesSet.add(sample)
              })
          })
        })
      } else {
        menu.items.forEach(item => {
          if (item.itemName.includes('Seam'))
            item.samples.forEach(sample => {
              seamSamplesSet.add(sample)
            })
        })
      }
    })
    return [...seamSamplesSet].sort()
  })

  //获取成分
  const handleRowsSingle = (fiberCom) => {
    fiberCompositionSingle.value = fiberCom;
  };

  //---------------------------------------------- 提交----------------------------
  const isSubmitting = ref(false)  // 👈 添加提交状态

  async function submitConditions() {
    // 如果正在提交，直接返回
    if (isSubmitting.value) return

    mergeGroupsWithSameConditions()

    // 构建 DTO 列表
    const dtoList = conditionsGroups.value.map(group => ({
      ConditionPoolId: group.conditions.ConditionPoolId ?? props.step1Data?.conditionPoolId ?? Guid.Empty,
      CheckListId: group.conditions.CheckListId ?? props.step1Data?.checkListId ?? Guid.Empty,
      OrderId: group.conditions.ReportNo ?? props.step1Data?.reportNo ?? '',
      TestPoints: group.testPoints,
      Conditions: group.conditions
    }))

    try {
      isSubmitting.value = true  // 👈 开始提交

      const res = await request.post('/review/generate-param', dtoList)

      if (res.data.isSuccess) {
        ElMessage.success('Parameters generated successfully')
        return res.data.value
      } else {
        ElMessage.error(res.data.message || 'Failed to generate parameters')
        return null
      }
    } catch (error) {
      console.error('Submit conditions error:', error)
      ElMessage.error('Error submitting conditions')
      return null
    } finally {
      isSubmitting.value = false  // 👈 结束提交
    }
  }


  /* 暴露数据 */
  defineExpose({
    conditionsGroups,
    submitConditions,
    isSubmitting, 
    // ← 新增
  })

  //---------------------------------------------- 提交----------------------------
</script>

<style scoped lang="scss">
.paramsContainer {
  @include column-left-flex-container;
  align-items: stretch;
  padding: 8px 12px;
  --h1-color: #1a2332;
  --border-first-level: none;
  --border-second-level: none;
  gap: 20px;
}

.paramsContainer > div {
  padding: 4px 6px;
}

.thisBlock {
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  padding: 16px 20px 20px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.blockTitle {
  font-size: 24px;
  font-weight: 600;
  color: var(--h1-color);
  letter-spacing: 0.3px;
}

/* ========== 主标题样式 ========== */
.paramTitle {
  font-size: 18px;
  font-weight: 600;
  color: var(--h1-color);
  align-self: flex-start;
  position: relative;
  padding-bottom: 6px;
  letter-spacing: 0.2px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 32px;
    height: 3px;
    background: var(--el-color-primary);
    border-radius: 2px;
    transition: width 0.25s ease;
  }

  &:hover::after {
    width: 48px;
  }
}

/* ========== 各个模块卡片样式 ========== */
.thisPiece {
  @include column-up-flex-container;
  align-items: stretch;
  gap: 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px 20px;
  background-color: #f8fafc;
  width: 100%;
  transition: all 0.25s ease;
  position: relative;
  overflow: visible;  /* 改为 visible，防止溢出被裁剪 */

  &:hover {
    border-color: #c8d2e0;
    background-color: #f6f9fe;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  }
}

/* ========== 一行两列布局 ========== */
.oneLinePiece {
  @include line-stretch-flex-container;
  gap: 18px;
  border: none;
  border-radius: 0;
  width: 100%;
  padding: 0;

  .thisPiece {
    flex: 1;
    min-width: 260px;
  }
}

/* ========== Care Label 区域 ========== */
  .careLabelContainer {
    @include column-left-flex-container;
    gap: 2px;
    background: #f7f8f8;
    border-color: #d0ddee;
    overflow: visible;

    &:hover {
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
    }
  }

.careLabelWrapper {
  @include column-stretch-flex-container;
  gap: 8px;
  width: 100%;
  padding-top: 4px;
  overflow: visible;
}

.careLabelLeft {
  width: 100%;
  padding: 14px 18px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  overflow: visible;

  .pieceContent {
    padding: 2px 0;
  }
}

/* ========== Composition 独立样式 ========== */
  .compositionPiece {
    background: #f7f8f8;
    border-color: #d0ddee;
    overflow: visible;

    &:hover {
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.06);
    }
  }

  .descriptionPiece {
    background: #f7f8f8;
    border-color: #d0e4d0;

    &:hover {
      box-shadow: 0 4px 14px rgba(34, 197, 94, 0.06);
    }
  }

/* ========== 子标题 ========== */
.subTitle {
  font-size: 15px;
  font-weight: 600;
  color: var(--h1-color);
  align-self: flex-start;
  padding-bottom: 8px;
  margin-top: 4px;
  border-bottom: 2px solid var(--el-color-primary-light-7);
  width: 100%;
  letter-spacing: 0.2px;
}

/* ========== Special Care 内容 ========== */
.specialCareContent {
  @include column-stretch-flex-container;
  gap: 12px;
  margin-top: 2px;
}

.careInstructionItem {
  @include line-left-flex-container;
  gap: 16px;
  align-items: center;
  padding: 8px 14px;
  border-radius: 8px;
  background: #f8fafd;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    background: #f0f4fe;
    border-color: var(--el-color-primary-light-7);
  }

  .instructionLabel {
    font-size: 14px;
    font-weight: 500;
    min-width: 120px;
    color: #374151;
    letter-spacing: 0.1px;
  }

  .pieceContent {
    padding: 0;
    flex: 1;
  }
}

/* 合并行样式 - Special Care Instruction + After Iron 同一行 */
.combinedCareRow {
  .instructionLabel {
    min-width: 160px;
  }
}

/* ========== 其他参数 ========== */
.otherParamsPiece {
  background: #f7faff;
  border-color: #dbe2ec;

  &:hover {
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.06);
  }
}

.otherParamsContainer {
  @include line-left-flex-container;
  flex-wrap: wrap;
  gap: 12px 28px;
  padding: 6px 2px;

  .line-flex-container {
    @include line-left-flex-container;
    gap: 12px;
    align-items: center;
    padding: 6px 0;

    label {
      font-size: 14px;
      font-weight: 500;
      color: #4b5563;
      min-width: 88px;
      letter-spacing: 0.1px;
    }
  }
}

/* ========== 接缝参数 ========== */
.seamPiece {
  background: #f8fdf8;
  border-color: #d0e4d0;

  &:hover {
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.06);
  }
}

/* ========== 通用内容容器 ========== */
.pieceContent {
  background-color: transparent;
  border-radius: 6px;
  padding: 4px 0;
}

.pieceContainer {
  @include column-stretch-flex-container;
  gap: 20px;
}

/* ========== 响应式适配 ========== */

/* 平板及以下：两列变一列 */
@media (max-width: 1024px) {
  .oneLinePiece {
    flex-direction: column;
    gap: 14px;
  }

  .oneLinePiece .thisPiece {
    min-width: unset;
    width: 100%;
  }
}

/* 小屏设备 */
@media (max-width: 768px) {
  .paramsContainer {
    padding: 4px 8px;
    gap: 16px;
  }

  .thisBlock {
    padding: 12px 14px 16px;
    border-radius: 10px;
  }

  .thisPiece {
    padding: 14px 14px;
    gap: 12px;
    border-radius: 8px;
  }

  .paramTitle {
    font-size: 16px;
    padding-bottom: 4px;

    &::after {
      width: 24px;
      height: 2.5px;
    }
  }

  .subTitle {
    font-size: 14px;
    padding-bottom: 6px;
  }

  .careLabelLeft {
    padding: 12px 14px;
  }

  .careInstructionItem {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    padding: 10px 12px;

    .instructionLabel {
      min-width: unset;
      font-size: 13px;
      font-weight: 600;
    }
  }

  .otherParamsContainer {
    gap: 8px 16px;

    .line-flex-container {
      flex-wrap: wrap;
      gap: 8px;
      width: 100%;

      label {
        min-width: 70px;
        font-size: 13px;
      }
    }
  }

  .pieceContainer {
    gap: 14px;
  }
}

/* 手机端 */
@media (max-width: 480px) {
  .thisBlock {
    padding: 10px 10px 14px;
    border-radius: 8px;
  }

  .thisPiece {
    padding: 10px 12px;
    gap: 10px;
  }

  .paramTitle {
    font-size: 15px;
  }

  .careLabelLeft {
    padding: 10px 10px;
  }

  .specialCareContent {
    gap: 8px;
  }

  .careInstructionItem {
    padding: 8px 10px;
    border-radius: 6px;
  }

  .otherParamsContainer .line-flex-container {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;

    label {
      min-width: unset;
    }
  }
}
</style>
