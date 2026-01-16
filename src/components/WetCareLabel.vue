<template>
  <div style="margin-bottom: 5px">
    <a style="color:#3364d5;font-size: 20px;font-weight: bold" href="#" @click.prevent="toggleNotice()">
      {{ $t('careLabel') }}
    </a>
  </div>
  <transition name="fade">
    <div class="row" v-if="isNoticeOpen">
      <div class="form-group col-xl-4">
        <label>{{$t('careLabelRegion')}}</label>
        <el-select v-model="washLabelRegion" @change="washLabelRegionChange">
          <el-option v-for="option in washLabelRegionOptions" :key="option" :value="option"></el-option>
        </el-select>
      </div>
      <div class="form-group col-xl-4">
        <label>{{$t('washing Procedure')}}</label>
        <div class="input-group">
<!--          <select class="form-control" v-model="selectedWashingProcedure">-->
<!--            <option value="">No Wash</option>-->
<!--            <option v-for="option in washingProcedures" :key="option.value" :value="option.value">-->
<!--              {{ option.label }}-->
<!--            </option>-->
<!--          </select>-->
          <el-popover
            placement="bottom-start"
            :width="950"
            :visible="washingProcedureVisible"
          >
            <template #reference>
              <div class="procedureSelect washingProcedureSelect"
                   ref="washingProcedureSelect"
                @click="washingProcedureVisible=!washingProcedureVisible;">
                <div style="height: 100%;" v-for="(src,idx) in selectedWashingProcedure.src" :key="src">
                  <span v-if="idx>0">&</span>
                  <img class="labelImg" :src="src" />
                </div>
              </div>
            </template>
            <div ref="washingSelectPopover" class="popoverSon">
              <el-select v-model="washingProcedureStandard"
                         :append-to="washingSelectPopover"
                         class="procedureStandardSelect">
                <el-option v-for="standard in washingLabelStandardOptions" :key="standard" :value="standard">
                </el-option>
              </el-select>
              <div class="procedureGroupContainer">
                <div class="procedureGroup">
                  <div class="head">{{washLabelRegion+' '+washingProcedureStandard}}</div>
                  <div class="optionsContainer">
                    <div class="procedureOption washingProcedureOption" v-for="label in washingLabelOptions"
                         @click="selectedWashingProcedure=label;washingProcedureVisible=false" :key="label.value">
                      <div class="optionLabelsContainer">
                        <div style="height: 100%;" v-for="(src,idx) in label.src" :key="src">
                          <span v-if="idx>0">&</span>
                          <img class="labelImg" :src="src" />
                        </div>
                      </div>
                      <div class="optionText">
                        {{label.label}}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </el-popover>
        </div>
      </div>
      <div class="form-group col-xl-4">
        <label>{{$t('dryProcedure')}}</label>
        <div class="input-group">
<!--          <select :class="{'form-control': true,valueNoClass:selectedDryProcedure===''}" v-model="selectedDryProcedure">-->
<!--            <option value="">Do Not Dry</option>-->
<!--            <option v-for="option in dryProcedures" :key="option.value" :value="option.value">-->
<!--              {{ option.label }}-->
<!--            </option>-->
<!--          </select>-->
          <el-popover
            placement="bottom-start"
            :width="650"
            :visible="dryProcedureVisible"
          >
            <template #reference>
              <div class="procedureSelect dryProcedureSelect"
                   ref="dryProcedureSelect"
                   @click="dryProcedureVisible=!dryProcedureVisible;">
                <div style="height: 100%;" v-for="(src,idx) in selectedDryProcedure.src" :key="src">
                  <span v-if="idx>0">&</span>
                  <img class="labelImg" :src="src" />
                </div>
              </div>
            </template>
            <div ref="drySelectPopover">
              <el-select v-model="dryProcedureStandard"
                         :append-to="drySelectPopover"
                         class="procedureStandardSelect">
                <el-option v-for="standard in dryLabelStandardOptions" :key="standard" :value="standard">
                </el-option>
              </el-select>
              <div class="procedureGroupContainer">
                <div class="procedureGroup">
                  <div class="head">{{washLabelRegion+' '+dryProcedureStandard}}</div>
                  <div class="optionsContainer">
                    <div class="procedureOption dryProcedureOption" v-for="label in dryLabelOptions"
                         @click="selectedDryProcedure=label;dryProcedureVisible=false" :key="label.value">
                      <div class="optionLabelsContainer">
                        <div style="height: 100%;" v-for="(src,idx) in label.src" :key="src">
                          <span v-if="idx>0">&</span>
                          <img class="labelImg" :src="src" />
                        </div>
                      </div>
                      <div class="optionText">
                        {{label.label}}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </el-popover>
        </div>
      </div>
      <div class="form-group col-xl-4">
        <label>{{$t('DCProcedure')}}</label>
        <div class="input-group">
<!--          <select :class="{'form-control': true,valueNoClass:selectedDCProcedure===''}" v-model="selectedDCProcedure">-->
<!--            <option value="">Do not Dry Clean</option>-->
<!--            <option v-for="option in dcProcedures" :key="option.value" :value="option.value">-->
<!--              {{ option.label }}-->
<!--            </option>-->
<!--          </select>-->
          <el-popover
            placement="bottom-start"
            :width="650"
            :visible="DCProcedureVisible"
          >
            <template #reference>
              <div class="procedureSelect DCProcedureSelect"
                   ref="DCProcedureSelect"
                   @click="DCProcedureVisible=!DCProcedureVisible;">
                <div style="height: 100%;" v-for="(src,idx) in selectedDCProcedure.src" :key="src">
                  <span v-if="idx>0">&</span>
                  <img class="labelImg" :src="src" />
                </div>
              </div>
            </template>
            <div ref="DCSelectPopover">
              <el-select v-model="DCProcedureStandard"
                         :append-to="DCSelectPopover"
                         class="procedureStandardSelect">
                <el-option v-for="standard in DCLabelStandardOptions" :key="standard" :value="standard">
                </el-option>
              </el-select>
              <div class="procedureGroupContainer">
                <div class="procedureGroup">
                  <div class="head">{{washLabelRegion+' '+DCProcedureStandard}}</div>
                  <div class="optionsContainer">
                    <div class="procedureOption DCProcedureOption" v-for="label in DCLabelOptions"
                         @click="selectedDCProcedure=label;DCProcedureVisible=false" :key="label.value">
                      <div class="optionLabelsContainer">
                        <div style="height: 100%;" v-for="(src,idx) in label.src" :key="src">
                          <span v-if="idx>0">&</span>
                          <img class="labelImg" :src="src" />
                        </div>
                      </div>
                      <div class="optionText">
                        {{label.label}}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </el-popover>
        </div>
      </div>
      <div class="form-group col-xl-4">
        <label>{{$t('ironMethod')}}</label>
        <div class="input-group">
          <el-popover
            placement="bottom-start"
            :width="350"
            :visible="ironProcedureVisible"
          >
            <template #reference>
              <div class="procedureSelect ironMethodSelect"
                   ref="ironProcedureSelect"
                   @click="ironProcedureVisible=!ironProcedureVisible;">
                <div style="height: 100%;" v-for="(src,idx) in selectedIronMethod.src" :key="src">
                  <span v-if="idx>0">&</span>
                  <img class="labelImg" :src="src" />
                </div>
              </div>
            </template>
            <div ref="ironSelectPopover">
              <el-select v-model="ironProcedureStandard"
                         :append-to="ironSelectPopover"
                         class="procedureStandardSelect">
                <el-option v-for="standard in ironLabelStandardOptions" :key="standard" :value="standard">
                </el-option>
              </el-select>
              <div class="procedureGroupContainer">
                <div class="procedureGroup">
                  <div class="head">{{washLabelRegion+' '+ironProcedureStandard}}</div>
                  <div class="optionsContainer">
                    <div class="procedureOption ironProcedureOption" v-for="label in ironLabelOptions"
                         @click="selectedIronMethod=label;ironProcedureVisible=false" :key="label.value">
                      <div class="optionLabelsContainer">
                        <div style="height: 100%;" v-for="(src,idx) in label.src" :key="src">
                          <span v-if="idx>0">&</span>
                          <img class="labelImg" :src="src" />
                        </div>
                      </div>
                      <div class="optionText">
                        {{label.label}}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </el-popover>
        </div>
      </div>
      <div class="form-group col-xl-4">
        <label>{{$t('bleaching')}}</label>
        <div class="input-group">
          <el-popover
            placement="bottom-start"
            :width="350"
            :visible="bleachProcedureVisible"
          >
            <template #reference >
              <div class="procedureSelect bleachProcedureSelect"
                   ref="bleachProcedureSelect"
                   @click="bleachProcedureVisible=!bleachProcedureVisible;">
                <div style="height: 100%;" v-for="(src,idx) in selectedBleachProcedure.src" :key="src">
                  <span v-if="idx>0">&</span>
                  <img class="labelImg" :src="src" />
                </div>
              </div>
            </template>
            <div ref="bleachSelectPopover">
              <el-select v-model="bleachProcedureStandard"
                         :append-to="bleachSelectPopover"
                         class="procedureStandardSelect">
                <el-option v-for="standard in bleachLabelStandardOptions" :key="standard" :value="standard">
                </el-option>
              </el-select>
              <div class="procedureGroupContainer">
                <div class="procedureGroup">
                  <div class="head">{{washLabelRegion+' '+bleachProcedureStandard}}</div>
                  <div class="optionsContainer">
                    <div class="procedureOption bleachProcedureOption" v-for="label in bleachLabelOptions"
                         @click="selectedBleachProcedure=label;bleachProcedureVisible=false" :key="label.value">
                      <div class="optionLabelsContainer">
                        <div style="height: 100%;" v-for="(src,idx) in label.src" :key="src">
                          <span v-if="idx>0">&</span>
                          <img class="labelImg" :src="src" />
                        </div>
                      </div>
                      <div class="optionText">
                        {{label.label}}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </el-popover>
        </div>
      </div>
      <div class="form-group col-xl-4">
        <label>{{$t('afterIron')}}</label>
        <div>
          <el-select :class="{valueNoClass:selectedIronProcedure===''}" v-model="selectedIronProcedure">
            <el-option value="">Do Not Iron</el-option>
            <el-option v-for="option in afterIrons" :key="option" :value="option">
              {{ option }}
            </el-option>
          </el-select>
          <Transition name="fade">
            <div v-show="showAppend" class="input-group-append" style="display:none">
              <button class="sigma_btn-custom shadow-none btn-sm" style="background-color:#3364d5;font-size:large" @click="ironMethodLabelOpen=true">▮</button>
            </div>
          </Transition>
        </div>
      </div>
      <div class="form-group col-xl-8">
        <label>{{$t('detergent')}}</label>
        <el-select :class="{valueNoClass:detergent===''}" v-model="detergent" clearable>
          <el-option v-for="option in detergentOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </el-option>
        </el-select>
      </div>
      <div class="form-group col-xl-4">
        <label>{{$t('testPoint')}}</label>
        <el-input type="text"  v-model="testPoint"/>
      </div>
      <div class="form-group col-xl-8">
        <label>{{$t('afterWash')}}</label>
        <div class="line-flex-container">
          <el-select  v-model="selectedAfterWashs"
                      class="thisMulSelect"
                      placeholder=""
                      style="flex: 1"
                      multiple>
            <el-option v-for="option in afterWashOptions" :key="option" :value="option">
              {{ option }}
            </el-option>
          </el-select>
          <el-button @click="addAfterWash" style="margin-left: 5px;">+</el-button>
        </div>
      </div>
      <div class="form-group col-xl-12">
        <el-table :data="props.afterWashs" border class="removeTableGaps">
          <el-table-column label="Sample" width="100">
            <template #default="scope">
              <el-input v-model="scope.row.testPoint"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="afterWash">
            <template #default="scope">
              <el-select  v-model="scope.row.afterWash"
                          placeholder=""
                          class="thisMulSelect"
                          multiple>
                <el-option v-for="option in afterWashOptions" :key="option" :value="option">
                  {{ option }}
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="action" width="75">
            <template #default="scope">
              <el-button @click="removeAfterWash(scope.$index)" type="danger" link style="margin: auto;display: block">x</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="form-group col-xl-12">
        <label>{{$t('specialCareInstruction')}} <span class="text-danger">*</span></label>
        <select class="form-control" v-model="selectedSCI">
          <option value="">N/A</option>
          <option v-for="option in scis" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
  </transition>



</template>

<script setup>
import {onMounted, onUnmounted, ref, watch} from 'vue';

  import noWashEuropeImg from '@/assets/img/wet Care Label/Europe/Washing/No Wash.jpg'
  import N3Img from '@/assets/img/wet Care Label/Europe/Washing/3N.jpg'
  import M3Img from '@/assets/img/wet Care Label/Europe/Washing/3M.jpg'
  import G3Img from '@/assets/img/wet Care Label/Europe/Washing/3G.jpg'
  import H3Img from '@/assets/img/wet Care Label/Europe/Washing/3H.jpg'
  import N4Img from '@/assets/img/wet Care Label/Europe/Washing/4N.jpg'
  import M4Img from '@/assets/img/wet Care Label/Europe/Washing/4M.jpg'
  import G4Img from '@/assets/img/wet Care Label/Europe/Washing/4G.jpg'
  import H4Img from '@/assets/img/wet Care Label/Europe/Washing/4H.jpg'
  import N5Img from '@/assets/img/wet Care Label/Europe/Washing/5N.jpg'
  import M5Img from '@/assets/img/wet Care Label/Europe/Washing/5M.jpg'
  import N6Img from '@/assets/img/wet Care Label/Europe/Washing/6N.jpg'
  import M6Img from '@/assets/img/wet Care Label/Europe/Washing/6M.jpg'
  import N7Img from '@/assets/img/wet Care Label/Europe/Washing/7N.jpg'
  import N9Img from '@/assets/img/wet Care Label/Europe/Washing/9N.jpg'

  import noWashUSAImg from '@/assets/img/wet Care Label/USA/Washing/No Wash.jpg'
  import MachineWashColdNormalImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Cold Normal.jpg'
  import MachineWashColdGentleImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Cold Gentle.jpg'
  import MachineWashColdPermanentPressImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Cold Permanent Press.jpg'

  import MachineWashWarmNormalImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Warm Normal.jpg'
  import MachineWashWarmNormal1Img from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Warm Normal_1.jpg'
  import MachineWashWarmGentleImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Warm Gentle.jpg'
  import MachineWashWarmGentle1Img from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Warm Gentle_1.jpg'
  import MachineWashWarmPermanentPressImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Warm Permanent Press.jpg'
  import MachineWashWarmPermanentPress1Img from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Warm Permanent Press_1.jpg'

  import MachineWashHotNormal1Img from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Hot Normal_1.jpg'
  import MachineWashHotNormalImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Hot Normal.jpg'
  import MachineWashHotGentleImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Hot Gentle.jpg'
  import MachineWashHotGentle1Img from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Hot Gentle_1.jpg'
  import MachineWashHotPermanentPressImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Hot Permanent Press.jpg'
  import MachineWashHotPermanentPress1Img from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Hot Permanent Press_1.jpg'

  import MachineWashVeryHotNormalImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Very Hot Normal.jpg'
  import MachineWashVeryHotGentleImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Very Hot Gentle.jpg'
  import MachineWashVeryHotPermanentPressImg from '@/assets/img/wet Care Label/USA/Washing/Machine Wash Very Hot Permanent Press.jpg'

  import HandWashImg from '@/assets/img/wet Care Label/USA/Washing/Hand Wash.jpg'
  import HandWashColdImg from '@/assets/img/wet Care Label/USA/Washing/Hand Wash Cold.jpg'


  const isNoticeOpen = ref(true)
  const DCProLabelOpen=ref(false)
  const afterIronLabelOpen=ref(false)
  const ironMethodLabelOpen=ref(false)
  const testPoint=ref('')
  const detergent = ref('');
  // const afterWashs=ref([])
  const props = defineProps({
    afterWashs: Array,
    washLabelRegionDefault: {
      type: String,
      default: 'Europe'
    },
  });
  const selectedAfterWashs=ref([])
  const afterWashOptions=['1 Wash', '3 Wash', '5 Wash', '10 Wash', '15 Wash', '20 Wash','25 Wash','32 Wash','45 Wash'];
  const afterIrons=['After Iron','Before and After Iron']
  // 洗标默认值
  const selectedWashingProcedure = ref({
    value:'',
    label: '',
    src:[new URL('../assets/img/wet Care Label/Europe/Washing/No Wash.jpg', import.meta.url).href]
  });
  const selectedDryProcedure = ref({
    value:'',
    label: '',
    src:[new URL('../assets/img/wet Care Label/Europe/Dry/Do not tumble dry.jpg', import.meta.url).href]
  });
  const selectedDCProcedure=ref({
    value:'',
    label: '',
    src:[new URL('../assets/img/wet Care Label/Europe/DC/Do not dry-clean.jpg', import.meta.url).href]
  })
  const selectedIronMethod=ref({
    value:'',
    label: '',
    src:[new URL('../assets/img/wet Care Label/Europe/Iron/Do not iron.jpg', import.meta.url).href]
  })
  const selectedBleachProcedure = ref({
    value:'',
    label: '',
    src:[new URL('../assets/img/wet Care Label/Europe/Bleach/Do not bleach.jpg', import.meta.url).href]
  });
  // 洗标弹出框是否展示
  const washingProcedureVisible = ref(false);
  const dryProcedureVisible = ref(false);
  const DCProcedureVisible = ref(false);
  const ironProcedureVisible = ref(false);
  const bleachProcedureVisible = ref(false);


  const selectedIronProcedure=ref('');
  const selectedSCI = ref('');
  const showAppend = ref(false);
  // const isWashingLabelVisible = ref(false);
  // const isDryLabelVisible = ref(false);
  // const isDIBLabelVisible = ref(false);

  // DOM
  const washingProcedureSelect = ref(null)
  const dryProcedureSelect = ref(null)
  const DCProcedureSelect = ref(null)
  const ironProcedureSelect = ref(null)
  const bleachProcedureSelect = ref(null)

  //popover DOM
  const washingSelectPopover=ref(null)
  const drySelectPopover=ref(null)
  const DCSelectPopover=ref(null)
  const ironSelectPopover=ref(null)
  const bleachSelectPopover=ref(null)

  //标签选项列表
  const washingLabelOptions=ref([])
  const dryLabelOptions=ref([])
  const DCLabelOptions=ref([])
  const ironLabelOptions=ref([])
  const bleachLabelOptions=ref([])

  //洗标标准选项列表
  const washingLabelStandardOptions=ref([])
  const dryLabelStandardOptions=ref([])
  const DCLabelStandardOptions=ref([])
  const ironLabelStandardOptions=ref([])
  const bleachLabelStandardOptions=ref([])

  // const washingProcedures = ref([
  //   { value: '3N', label: '3N' },
  //   { value: '3M', label: '3M' },
  //   { value: '3G', label: '3G' },
  //   { value: '3H', label: '3H' },
  //   { value: '4N', label: '4N' },
  //   { value: '4M', label: '4M' },
  //   { value: '4G', label: '4G' },
  //   { value: '4H', label: '4H' },
  //   { value: '5N', label: '5N' },
  //   { value: '5M', label: '5M' },
  //   { value: '6N', label: '6N' },
  //   { value: '6M', label: '6M' },
  //   { value: '7N', label: '7N' },
  //   { value: '9N', label: '9N' },
  //   { value: 'Machine Wash Cold Normal', label: 'Machine Wash Cold Normal' },
  //   { value: 'Machine Wash Cold Gentle', label: 'Machine Wash Cold Gentle' },
  //   { value: 'Machine Wash Cold Permanent Press', label: 'Machine Wash Cold Permanent Press' },
  //   { value: 'Machine Wash Warm Normal', label: 'Machine Wash Warm Normal' },
  //   { value: 'Machine Wash Warm Gentle', label: 'Machine Wash Warm Gentle' },
  //   { value: 'Machine Wash Warm Permanent Press', label: 'Machine Wash Warm Permanent Press' },
  //   { value: 'Machine Wash Hot Normal', label: 'Machine Wash Hot Normal' },
  //   { value: 'Machine Wash Hot Gentle', label: 'Machine Wash Hot Gentle' },
  //   { value: 'Machine Wash Hot Permanent Press', label: 'Machine Wash Hot Permanent Press' },
  //   { value: 'Machine Wash Very Hot Normal', label: 'Machine Wash Very Hot Normal' },
  //   { value: 'Machine Wash Very Hot Gentle', label: 'Machine Wash Very Hot Gentle' },
  //   { value: 'Machine Wash Very Hot Permanent Press', label: 'Machine Wash Very Hot Permanent Press' },
  //   { value: 'Hand Wash', label: 'Hand Wash' },
  //   { value: 'Hand Wash Cold', label: 'Hand Wash Cold' },
  // ]);


  const washingProceduresEurope = ref([
    {value:'', label: 'No Wash',src:[noWashEuropeImg]},
    {value:'default', label: 'default',src:[new URL('../assets/img/wet Care Label/default/washingDefault.png', import.meta.url).href]},
    { value: '3N', label: '3N',src:[N3Img]},
    { value: '3M', label: '3M',src:[M3Img]},
    { value: '3G', label: '3G',src:[G3Img]},
    { value: '3H', label: '3H',src:[H3Img]},
    { value: '4N', label: '4N',src:[N4Img]},
    { value: '4M', label: '4M',src:[M4Img]},
    { value: '4G', label: '4G',src:[G4Img]},
    { value: '4H', label: '4H',src:[H4Img]},
    { value: '5N', label: '5N',src:[N5Img]},
    { value: '5M', label: '5M',src:[M5Img]},
    { value: '6N', label: '6N',src:[N6Img]},
    { value: '6M', label: '6M',src:[M6Img]},
    { value: '7N', label: '7N',src:[N7Img]},
    { value: '9N', label: '9N',src:[N9Img]},
  ]);
  const washingProceduresUSA=ref([
    {value:'', label: 'No Wash',src:[noWashUSAImg]},
    { value: 'Machine Wash Cold Normal', label: 'Machine Wash Cold Normal',src:[MachineWashColdNormalImg]},
    { value: 'Machine Wash Cold Gentle', label: 'Machine Wash Cold Gentle',src:[MachineWashColdGentleImg]},
    { value: 'Machine Wash Cold Permanent Press', label: 'Machine Wash Cold Permanent Press',src:[MachineWashColdPermanentPressImg]},
    { value: 'Machine Wash Warm Normal', label: 'Machine Wash Warm Normal', src: [MachineWashWarmNormalImg, MachineWashWarmNormal1Img] },
    { value: 'Machine Wash Warm Gentle', label: 'Machine Wash Warm Gentle', src: [MachineWashWarmGentleImg, MachineWashWarmGentle1Img] },
    { value: 'Machine Wash Warm Permanent Press', label: 'Machine Wash Warm Permanent Press', src: [MachineWashWarmPermanentPressImg,
        MachineWashWarmPermanentPress1Img] },
    { value: 'Machine Wash Hot Normal', label: 'Machine Wash Hot Normal', src: [MachineWashHotNormalImg,MachineWashHotNormal1Img] },
    { value: 'Machine Wash Hot Gentle', label: 'Machine Wash Hot Gentle', src: [MachineWashHotGentleImg,MachineWashHotGentle1Img] },
    { value: 'Machine Wash Hot Permanent Press', label: 'Machine Wash Hot Permanent Press', src: [MachineWashHotPermanentPressImg,
        MachineWashHotPermanentPress1Img] },
    { value: 'Machine Wash Very Hot Normal', label: 'Machine Wash Very Hot Normal', src: [MachineWashVeryHotNormalImg] },
    { value: 'Machine Wash Very Hot Gentle', label: 'Machine Wash Very Hot Gentle', src: [MachineWashVeryHotGentleImg] },
    { value: 'Machine Wash Very Hot Permanent Press', label: 'Machine Wash Very Hot Permanent Press', src: [MachineWashVeryHotPermanentPressImg] },
    { value: 'Hand Wash', label: 'Hand Wash', src: [HandWashImg] },
    { value: 'Hand Wash Cold', label: 'Hand Wash Cold', src: [HandWashColdImg] }
  ])


  // const dryProcedures = ref([
  //   { value: 'Drip Flat Dry', label: 'Drip Flat Dry' },
  //   { value: 'Drip Dry', label: 'Drip Dry' },
  //   { value: 'Flat Dry', label: 'Flat Dry' },
  //   { value: 'Line Dry', label: 'Line Dry' },
  //   { value: 'Tumble Dry', label: 'Tumble Dry' },
  //   { value: 'Tumble Dry Low', label: 'Tumble Dry Low' }
  // ]);

  const dryProceduresEurope = ref([
    { value: '', label: 'Do Not Tumble Dry', src: [new URL('../assets/img/wet Care Label/Europe/Dry/Do not tumble dry.jpg', import.meta.url).href] },
    {value:'default', label: 'default', src:[new URL('../assets/img/wet Care Label/default/dryDefault.png', import.meta.url).href]},
    { value: 'Tumble Dry', label: 'Tumble Dry', src: [new URL('../assets/img/wet Care Label/Europe/Dry/Tumble dry.jpg', import.meta.url).href] },
    { value: 'Tumble Dry Low', label: 'Tumble Dry Low', src: [new URL('../assets/img/wet Care Label/Europe/Dry/Tumble dry low.jpg', import.meta.url).href] },
    { value: 'Flat Dry', label: 'Flat Dry', src: [new URL('../assets/img/wet Care Label/Europe/Dry/Flat dry.jpg', import.meta.url).href] },
    { value: 'Line Dry', label: 'Line Dry', src: [new URL('../assets/img/wet Care Label/Europe/Dry/Line dry.jpg', import.meta.url).href] }
  ]);

  const dryProceduresUSA = ref([
    { value: '', label: 'Do Not Tumble Dry', src: [new URL('../assets/img/wet Care Label/USA/Dry/Do Not Tumble Dry.jpg', import.meta.url).href] },
    { value: 'Tumble Dry', label: 'Tumble Dry', src: [new URL('../assets/img/wet Care Label/USA/Dry/Tumble Dry.jpg', import.meta.url).href,
        new URL('../assets/img/wet Care Label/USA/Dry/Tumble Dry_1.jpg', import.meta.url).href] },
    { value: 'Tumble Dry Low', label: 'Tumble Dry Low', src: [new URL('../assets/img/wet Care Label/USA/Dry/Tumble Dry Low.jpg', import.meta.url).href] },
    { value: 'Flat Dry', label: 'Flat Dry', src: [new URL('../assets/img/wet Care Label/USA/Dry/Flat Dry.jpg', import.meta.url).href] },
    { value: 'Line Dry', label: 'Line Dry', src: [new URL('../assets/img/wet Care Label/USA/Dry/Line Dry.jpg', import.meta.url).href] },
    { value: 'Drip Dry', label: 'Drip Dry', src: [new URL('../assets/img/wet Care Label/USA/Dry/Drip Dry.jpg', import.meta.url).href] },
    { value: 'Drip Flat Dry', label: 'Drip Flat Dry', src: [new URL('../assets/img/wet Care Label/USA/Dry/Drip Flat Dry.png', import.meta.url).href] }
  ]);

  // const dcProcedures = ref([
  //   { value: 'DC Normal', label: 'DC Normal' },
  //   { value: 'DC Sensitive', label: 'DC Sensitive' },
  //   { value: 'Petroleum DC Normal', label: 'Petroleum DC Normal' },
  //   { value: 'Petroleum DC Sensitive', label: 'Petroleum DC Sensitive' }
  // ]);

  const DCProceduresEurope=ref([
    { value: '', label: 'Do Not Dry Clean',src: [new URL('../assets/img/wet Care Label/Europe/DC/Do not dry-clean.jpg', import.meta.url).href] },
    {value: 'default',label:'default',src:[new URL('../assets/img/wet Care Label/default/DCDefault.png', import.meta.url).href]},
    { value: 'DC Normal', label: 'DC Normal',src: [new URL('../assets/img/wet Care Label/Europe/DC/DC Normal.jpg', import.meta.url).href] },
    { value: 'DC Sensitive', label: 'DC Sensitive',src: [new URL('../assets/img/wet Care Label/Europe/DC/DC Sensitive.jpg', import.meta.url).href]},
    { value: 'Petroleum DC Normal', label: 'Petroleum DC Normal',src: [new URL('../assets/img/wet Care Label/Europe/DC/Petroleum DC Normal.jpg', import.meta.url).href]},
    { value: 'Petroleum DC Sensitive', label: 'Petroleum DC Sensitive',src: [new URL('../assets/img/wet Care Label/Europe/DC/Petroleum DC Sensitive.jpg', import.meta.url).href]}
  ])

  const ironProcedures = ref([
    { value: 'Hot Iron', label: 'Hot Iron' },
    { value: 'Warm Iron', label: 'Warm Iron' },
    { value: 'Cool Iron', label: 'Cool Iron' }
  ]);

  const ironProceduresEurope=ref([
    {value:'',label:'Do not Iron',src: [new URL('../assets/img/wet Care Label/Europe/Iron/Do not iron.jpg', import.meta.url).href]},
    {value: 'default',label:'default',src:[new URL('../assets/img/wet Care Label/default/ironDefault.png', import.meta.url).href]},
    {value:'Hot Iron',label: 'Hot Iron',src: [new URL('../assets/img/wet Care Label/Europe/Iron/Hot iron.jpg', import.meta.url).href]},
    {value:'Warm Iron',label: 'Warm Iron',src: [new URL('../assets/img/wet Care Label/Europe/Iron/Warm iron.jpg', import.meta.url).href]},
    {value:'Cool Iron',label: 'Cool Iron',src: [new URL('../assets/img/wet Care Label/Europe/Iron/Cool iron.jpg', import.meta.url).href]}
  ])

  // const bleachProcedures = ref([
  //   { value: 'Any Bleaching', label: 'Any Bleaching' },
  //   { value: 'Non-chlorine Bleaching', label: 'Non-chlorine Bleaching' }
  // ]);

  const bleachProceduresEurope=ref([
    {value:'',label:'Do not Bleach',src: [new URL('../assets/img/wet Care Label/Europe/Bleach/Do not bleach.jpg', import.meta.url).href]},
    {value:'Any Bleaching',label:'Any Bleaching',src: [new URL('../assets/img/wet Care Label/Europe/Bleach/Any Bleaching.jpg', import.meta.url).href]},
    {value:'Non-chlorine Bleaching',label:'Non-chlorine Bleaching',src: [new URL('../assets/img/wet Care Label/Europe/Bleach/Non-chlorine Bleaching.jpg', import.meta.url).href]}
  ])


  const scis = ref([
    { value: 'Front Zippers Must be Opened', label: 'Front Zippers Must be Opened' },
    { value: 'Wash Inside Out', label: 'Wash Inside Out' },
    { value: 'Wash in Laundry Bag', label: 'Wash in Laundry Bag' },
    { value: 'Close All Botton and Zipper before Washing', label: 'Close All Botton and Zipper before Washing' },
    { value: 'Wash in Net Bag,Close All Botton and Zipper before Washing', label: 'Wash in Net Bag,Close All Botton and Zipper before Washing' },
    { value: 'Wash Inside Out,Close All Botton and Zipper before Washing', label: 'Wash Inside Out,Close All Botton and Zipper before Washing' },
    { value: 'Wash in Laundry Bag,Wash in Net Bag,Close All Botton and Zipper before Washing', label: 'Wash in Laundry Bag,Wash in Net Bag,Close All Botton and Zipper before Washing' },
    {value:'Close fastener',label: 'Close fastener'}
  ]);
  const detergentOptions=ref([
    { value: 'Mild Detergent', label: 'Mild Detergent' },
    { value: 'Wool Detergent', label: 'Wool Detergent' }
  ]);


  const emit = defineEmits(['updateData']);

//洗标地区
const washLabelRegion=ref(props.washLabelRegionDefault)
const washLabelRegionOptions=['Europe', 'USA'];

//洗标标准
// const washingProcedureStandardOptions=ref([]);
const washingProcedureStandard=ref('')
const dryProcedureStandard=ref('')
const DCProcedureStandard=ref('')
const ironProcedureStandard=ref('')
const bleachProcedureStandard=ref('')


//washingProcedures汇总
const washingProcedureses=ref([{region:'Europe',standard:'ISO 3758:2023(E)',value:washingProceduresEurope.value},
  {region:'USA',standard:'ASTM_D5489-2018(R2023)',value:washingProceduresUSA.value}
])
const washingProcedureStandardses=ref([
  {region:'Europe',value:['ISO 3758:2023(E)']},
  {region:'USA',value:['ASTM_D5489-2018(R2023)']}
])

//dryProcedures汇总
const dryProcedureses=ref([{region:'Europe',standard:'ISO 3758:2023(E)',value:dryProceduresEurope.value},
  {region:'USA',standard: 'ASTM_D5489-2018(R2023)',value: dryProceduresUSA.value}])
const dryProcedureStandardses=ref([
  {region:'Europe',value:['ISO 3758:2023(E)']},
  {region:'USA',value:['ASTM_D5489-2018(R2023)']}
])

//DCProcedure汇总
const DCProcedureses=ref([{region:'Europe',standard:'ISO 3758:2023(E)',value:DCProceduresEurope.value},
  {region:'USA',standard:'ASTM_D5489-2018(R2023)',value:DCProceduresEurope.value}])
const DCProcedureStandardses=ref([{region:'Europe',value:['ISO 3758:2023(E)']},{region:'USA',value:['ASTM_D5489-2018(R2023)']}])

//ironMethod汇总
const ironProcedureses=ref([{region:'Europe',standard:'ISO 3758:2023(E)',value:ironProceduresEurope.value},
  {region:'USA',standard:'ASTM_D5489-2018(R2023)',value:ironProceduresEurope.value}])
const ironProcedureStandardses=ref([{region:'Europe',value:['ISO 3758:2023(E)']},{region:'USA',value:['ASTM_D5489-2018(R2023)']}])

//bleaching汇总
const bleachProcedureses=ref([{region:'Europe',standard:'ISO 3758:2023(E)',value:bleachProceduresEurope.value},
  {region:'USA',standard:'ASTM_D5489-2018(R2023)',value:bleachProceduresEurope.value}])
const bleachProcedureStandardses=ref([{region:'Europe',value:['ISO 3758:2023(E)']},{region:'USA',value:['ASTM_D5489-2018(R2023)']}])

//各洗标映射
const procedureMap = new Map([
  ['washing', {
    procedureses: washingProcedureses,
    standardOptionses: washingProcedureStandardses,
    standard:washingProcedureStandard,
    visible:washingProcedureVisible,
    selectDom:washingProcedureSelect,
    popoverDom:washingSelectPopover,
    labelOptions: washingLabelOptions,
    standardOptions:washingLabelStandardOptions,
    selectedLabel:selectedWashingProcedure
  }],
  ['dry', {
    procedureses: dryProcedureses,
    standardOptionses: dryProcedureStandardses,
    standard:dryProcedureStandard,
    visible:dryProcedureVisible,
    selectDom:dryProcedureSelect,
    popoverDom:drySelectPopover,
    labelOptions: dryLabelOptions,
    standardOptions: dryLabelStandardOptions,
    selectedLabel:selectedDryProcedure
  }],
  ['DC', {
    procedureses: DCProcedureses,
    standardOptionses: DCProcedureStandardses,
    standard:DCProcedureStandard,
    visible:DCProcedureVisible,
    selectDom:DCProcedureSelect,
    popoverDom:DCSelectPopover,
    labelOptions: DCLabelOptions,
    standardOptions: DCLabelStandardOptions,
    selectedLabel:selectedDCProcedure
  }],
  ['iron', {
    procedureses: ironProcedureses,
    standardOptionses: ironProcedureStandardses,
    standard:ironProcedureStandard,
    visible:ironProcedureVisible,
    selectDom:ironProcedureSelect,
    popoverDom:ironSelectPopover,
    labelOptions: ironLabelOptions,
    standardOptions: ironLabelStandardOptions,
    selectedLabel:selectedIronMethod
  }],
  ['bleach', {
    procedureses: bleachProcedureses,
    standardOptionses: bleachProcedureStandardses,
    standard:bleachProcedureStandard,
    visible:bleachProcedureVisible,
    selectDom:bleachProcedureSelect,
    popoverDom:bleachSelectPopover,
    labelOptions: bleachLabelOptions,
    standardOptions: bleachLabelStandardOptions,
    selectedLabel:selectedBleachProcedure
  }]
]);

  watch(
    [
      detergent,selectedWashingProcedure, selectedDryProcedure, selectedDCProcedure, selectedIronProcedure,selectedIronMethod, selectedSCI, selectedBleachProcedure],() => {
      emit('updateData', {
        washingProcedure: selectedWashingProcedure.value.value,
        dryProcedure: selectedDryProcedure.value.value,
        dcProcedure: selectedDCProcedure.value.value,
        ironProcedure: selectedIronProcedure.value,
        ironMethod:  selectedIronMethod.value.value,
        sci: selectedSCI.value,
        bleachProcedure: selectedBleachProcedure.value.value
        ,detergent:detergent.value
      });
    },
    { immediate: true }
  );

// function selectProcedure(data,label){
//   data=label
//   console.log(ironMethod)
// }

//切换洗标地区
function washLabelRegionChange(){
  procedureMap.forEach((procedure) => {
    //刷新standard选项列表
    procedure.standardOptions.value= procedure.standardOptionses.value.find(item => item.region===washLabelRegion.value)?.value ||
      procedure.standardOptionses.value[0].value
    //standard默认选第一个
    procedure.standard.value=procedure.standardOptions.value[0]
    //刷新图标列表
    procedure.labelOptions.value=procedure.procedureses.value.find(item=>item.region===washLabelRegion.value&&item.standard===procedure.standard.value)?.value ||
      procedure.procedureses.value[0].value
    //所有已选值切换成图标列表第一个
    procedure.selectedLabel.value=procedure.labelOptions.value[0]
  })
}
// //获取图标列表，并赋初值
//   function getProcedures(procedureStr){
//     let standard=procedureMap.get(procedureStr).standard.value
//     let procedureses=procedureMap.get(procedureStr).procedureses.value
//     return procedureses.find(item=>item.region===washLabelRegion.value&&item.standard===standard)?.value || []
//   }
//获取standards选项，并赋初值
// //获取standard选项，并赋初值
//   function getProcedureStandardOptions(procedureStr){
//     let standards= procedureMap.get(procedureStr).standardOptionses.value.find(item => item.region===washLabelRegion.value).value
//     procedureMap.get(procedureStr).standard.value=standards[0]
//     return standards
//   }
//   //聚焦
//   function getSelectFocus(dom){
//     dom.focus();
//   }
  function addAfterWash(){
    //逗号分隔转数组
    let testPointArray=testPoint.value.split(",")
    for (const sample of testPointArray) {
      if(props.afterWashs.some(item=>item.testPoint===sample)){
        return alert("Some test point already exist.")
      }
    }
    testPointArray.forEach(sample=>{
      props.afterWashs.push({testPoint:sample,afterWash:selectedAfterWashs.value});
    })
  }
  function removeAfterWash(index){
    props.afterWashs.splice(index,1);
  }

  // const toggleWashingLabel = () => {
  //   isWashingLabelVisible.value = !isWashingLabelVisible.value;
  // };
  // const toggleDryLabel = () => {
  //   isDryLabelVisible.value = !isDryLabelVisible.value;
  // };
  // const toggleDIBLabel = () => {
  //   isDIBLabelVisible.value = !isDIBLabelVisible.value;
  // };
  function toggleNotice() {
    isNoticeOpen.value = !isNoticeOpen.value;
  }

//关闭选择器的下拉框
function closeSelectPopover(e){
  procedureMap.forEach(
    (procedure)=>{
      if(!procedure.popoverDom.value?.contains(e.target)&&!procedure.selectDom.value?.contains(e.target)){
        procedure.visible.value=false
      }
    }
  )

}

  onMounted(()=>{
    washLabelRegionChange()
    document.addEventListener('mousedown',closeSelectPopover)
  });
  onUnmounted(()=>{
    document.removeEventListener('mousedown',closeSelectPopover)
  });

  </script>




<style lang="scss" scoped>
.thisMulSelect :deep(.el-tag__close) {
  position: relative !important;
  top: auto !important;
  right: auto !important;
  transform: none !important;
}
.removeTableGaps :deep(table){
  margin-bottom: 0 !important;
}
  .sigma_btn-custom::before {
    background-color: #18086a;
  }
  .scroll-select {
    max-height: 200px;
    overflow-y: auto;
    display: block; /* 确保不是行内元素 */
  }


  /* 0.9 s 淡入淡出动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.9s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.6s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.valueNoClass{
  background-color: rgb(243, 209, 158);
}
/*Procedure-----------------------------------------------------------------------------------------*/
.procedureSelect{
  height: 54px;
  border-radius: var(--el-border-radius-base);
  box-shadow: 0 0 0 1px var(--el-border-color);
  box-sizing: border-box;
  @include line-flex-container;
}
.procedureSelect:hover{
  cursor: pointer;
}
.procedureGroupContainer{
  display: flex;
  align-items: flex-start
}
.procedureGroup{
  @include column-flex-container;
  flex:1
}
/*包含所有选项的容器*/
.optionsContainer{
  @include line-left-flex-container;
  flex-wrap: wrap;
}

.labelImg{
  width: 50px;
  height: 50px;
}
.procedureStandardSelect{
  width:250px
}

.procedureOption{
  height: 52px;
  width:300px;
  @include line-flex-container;
  gap:0
  //border: 1px solid #d3d1d1;

}
.procedureOption:hover{
  background-color: #e9eef6;
  cursor: pointer;
}
/*选项的标签部分容器*/
.optionLabelsContainer{
  width: 120px;
  border: 1px solid #d3d1d1;
  @include line-flex-container;
}
/*选项文字部分*/
.optionText{
  flex:1;
  height: 100%;
  border: 1px solid #d3d1d1;
  border-left: none;
  @include line-flex-container;
  padding:5px
}
/*Washing Procedure ------------------------------------------------*/
.washingProcedureSelect{
  width:120px;
}
.washingProcedureOption{
  //width:250px;
}


/*Dry Procedure----------------------------------------------------*/
.dryProcedureSelect{
  width:120px;
}
.dryProcedureOption{
  //width:120px;
}

/*DC Procedure -----------------------------------------------------*/
.DCProcedureSelect{
  width:120px;
}
.DCProcedureOption{
  //width:120px;
}

/*Iron Method ---------------------------------------------------*/
.ironMethodSelect{
  width:120px;
}
.ironMethodOption{
  //width:120px;
}


/*Bleach Procedure-------------------------------------------------*/
.bleachProcedureSelect{
  width:120px;
}
.bleachProcedureOption{
  //width:120px;
}
</style>
