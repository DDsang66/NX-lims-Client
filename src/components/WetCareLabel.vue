<template>
  <div style="margin-bottom: 5px">
    <a style="color:#3364d5;font-size: 20px;font-weight: bold" href="#" @click.prevent="toggleNotice()">
      {{ $t('careLabel') }}
    </a>
  </div>
  <transition name="fade">
    <div class="row" v-if="isNoticeOpen">
      <div class="form-group col-xl-2">
        <label>{{$t('details')}}</label>
        <button class="sigma_btn-custom primary btn-block" style="background-color:#3364d5" @click="showAppend = !showAppend">
          ≡
        </button>
      </div>
      <div class="form-group col-xl-6">
        <label>{{$t('washing Procedure')}}</label>
        <div class="input-group">
          <select class="form-control" v-model="selectedWashingProcedure">
            <option value="">No Wash</option>
            <option v-for="option in washingProcedures" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <Transition>
            <div v-show="showAppend" class="input-group-append" style="display:none">
              <button class="sigma_btn-custom shadow-none btn-sm" style="background-color:#3364d5;font-size:large" @click="toggleWashingLabel()">▮</button>
            </div>
          </Transition>
        </div>
      </div>
      <div class="form-group col-xl-4">
        <label>{{$t('dryProcedure')}}</label>
        <div class="input-group">
          <select class="form-control" v-model="selectedDryProcedure">
            <option value="">Do Not Dry</option>
            <option v-for="option in dryProcedures" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <Transition name="fade">
            <div v-show="showAppend" class="input-group-append" style="display:none">
              <button class="sigma_btn-custom shadow-none btn-sm" style="background-color:#3364d5;font-size:large" @click="toggleDryLabel()">▮</button>
            </div>
          </Transition>
        </div>
      </div>
      <div class="form-group col-xl-4">
        <label>{{$t('DCProcedure')}}</label>
        <div class="input-group">
          <select class="form-control" v-model="selectedDCProcedure">
            <option value="">Do not Dry Clean</option>
            <option v-for="option in dcProcedures" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <Transition name="fade">
            <div v-show="showAppend" class="input-group-append" style="display:none">
              <button class="sigma_btn-custom shadow-none btn-sm" style="background-color:#3364d5;font-size:large" @click="DCProLabelOpen=!DCProLabelOpen">▮</button>
            </div>
          </Transition>
        </div>
      </div>
      <div class="form-group col-xl-4">
        <label>{{$t('afterIron')}}</label>
        <div class="input-group">
          <select class="form-control" v-model="selectedIronProcedure">
            <option value="">Do Not Iron</option>
            <option v-for="option in ironProcedures" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <Transition name="fade">
            <div v-show="showAppend" class="input-group-append" style="display:none">
              <button class="sigma_btn-custom shadow-none btn-sm" style="background-color:#3364d5;font-size:large" @click="ironMethodLabelOpen=true">▮</button>
            </div>
          </Transition>
        </div>
      </div>
      <div class="form-group col-xl-4">
        <label>{{$t('ironMethod')}}</label>
        <div class="input-group">
          <select class="form-control" v-model="ironMethod">
            <option value="">Do Not Iron</option>
            <option v-for="option in ironProcedures" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <Transition name="fade">
            <div v-show="showAppend" class="input-group-append" style="display:none">
              <button class="sigma_btn-custom shadow-none btn-sm" style="background-color:#3364d5;font-size:large" @click="ironMethodLabelOpen=true">▮</button>
            </div>
          </Transition>
        </div>
      </div>
      <div class="form-group col-xl-4">
        <label>{{$t('bleaching')}}</label>
        <div class="input-group">
          <select class="form-control" v-model="selectedBleachProcedure">
            <option value="">Do Not Bleach</option>
            <option v-for="option in bleachProcedures" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <Transition name="fade">
            <div v-show="showAppend" class="input-group-append" style="display:none">
              <button class="sigma_btn-custom shadow-none btn-sm" style="background-color:#3364d5;font-size:large" @click="toggleDIBLabel()">▮</button>
            </div>
          </Transition>
        </div>
      </div>
      <div class="form-group col-xl-8">
        <label>{{$t('detergent')}}</label>
        <select class="form-control" v-model="detergent">
          <option v-for="option in detergentOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <div class="form-group col-xl-4">
        <label>{{$t('testPoint')}}</label>
        <input type="text" class="form-control" v-model="testPoint">
      </div>
      <div class="form-group col-xl-6">
        <label>{{$t('afterWash')}}</label>
        <el-select  v-model="selectedAfterWashs"
                    class="thisMulSelect"
                    placeholder=""
                    multiple>
          <el-option v-for="option in afterWashOptions" :key="option" :value="option">
            {{ option }}
          </el-option>
        </el-select>
      </div>
      <div class="form-group col-xl-2" style="display: flex;align-items: center;margin: 0">
        <el-button @click="addAfterWash">+</el-button>
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






  <div :class="['search-form-wrapper', { open: isWashingLabelVisible }]">
    <div class="search-trigger sigma_close" @click="toggleWashingLabel()">
      <span></span>
      <span></span>
    </div>
    <div style="overflow-y: auto; max-height: 70%; width: 70%; border: 1px solid #ddd; ">
      <table class="sigma_responsive-table">
        <thead>
          <tr>
            <th style="text-align:center" colspan="6">Washing Care Label</th>
          </tr>
        </thead>

        <tbody style=" background-color: transparent;">
          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="3">
              Europe Care Label
            </td>
            <td style="text-align:center" colspan="3">
              USA Care Label
            </td>
          </tr>

          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              Care Symbols
            </td>
            <td style="text-align:center"> ISO 3758:2023(E)</td>
            <td style="text-align:center" colspan="2">
              Care Symbols
            </td>
            <td>ASTM_D5489-2018(R2023)</td>
          </tr>

          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/Do Not Wash.jpg">
            </td>
            <td style="text-align:center"> No Wash</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/No Wash.jpg">
            </td>
            <td>No Wash</td>
          </tr>

          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/3N.jpg">
            </td>
            <td style="text-align:center">3N</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Machine Wash Cold Normal.jpg">
            </td>
            <td>Machine Wash Cold(Normal)</td>
          </tr>

          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/3M.jpg">
            </td>
            <td style="text-align:center">3M</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Machine Wash Cold Gentle.jpg">
            </td>
            <td>Machine Wash Cold(Gentle)</td>
          </tr>

          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/3G.jpg">
            </td>
            <td style="text-align:center">3G</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Machine Wash Cold Permanent Press.jpg">
            </td>
            <td>Machine Wash Cold(Permanent Press)</td>
          </tr>
          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/3H.jpg">
            </td>
            <td style="text-align:center">3H</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Hand Wash Cold.jpg">
            </td>
            <td>Hand Wash Cold</td>
          </tr>
          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/4N.jpg">
            </td>
            <td style="text-align:center">4N</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Machine Wash Warm Nomal_1.jpg"> &
              <img src="../assets/img/USA Wet Care Label/Machine Wash Warm Normal.jpg">
            </td>
            <td>Machine Wash Warm(Normal)</td>
          </tr>

          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/4M.jpg">
            </td>
            <td style="text-align:center">4M</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Machine Wash Warm Gentle_1.jpg"> &
              <img src="../assets/img/USA Wet Care Label/Machine Wash Warm Gentle.jpg">
            </td>
            <td>Machine Wash Warm(Gentle)</td>
          </tr>

          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/4G.jpg">
            </td>
            <td style="text-align:center">4G</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Machine Wash Warm Permanent Press_1.jpg"> &
              <img src="../assets/img/USA Wet Care Label/Machine Wash Warm Permanent Press.jpg">
            </td>
            <td>Machine Wash Warm(Permanent Press)</td>
          </tr>
          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/4H.jpg">
            </td>
            <td style="text-align:center">4H</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Hand Wash.jpg">
            </td>
            <td>Hand Wash</td>
          </tr>

          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/5N.jpg">
            </td>
            <td style="text-align:center">5N</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Machine Wash Hot Normal_1.jpg"> &
              <img src="../assets/img/USA Wet Care Label/Machine Wash Hot Noraml.jpg">
            </td>
            <td>Machine Wash Hot(Noraml)</td>
          </tr>
          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/5M.jpg">
            </td>
            <td style="text-align:center">5M</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Machine Wash Hot Gentle_1.jpg"> &
              <img src="../assets/img/USA Wet Care Label/Machine Wash Hot Gentle.jpg">
            </td>
            <td>Machine Wash Hot(Gentle)</td>
          </tr>

          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/6N.jpg">
            </td>
            <td style="text-align:center">6N</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Machine Wash Hot Permanent Press_1.jpg"> &
              <img src="../assets/img/USA Wet Care Label/Machine Wash Hot Permanent Press.jpg">
            </td>
            <td>Machine Wash Hot(Permanent Press)</td>
          </tr>
          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/6M.jpg">
            </td>
            <td style="text-align:center">6M</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Machine Wash Very Hot Normal.jpg">
            </td>
            <td>Machine Wash Very Hot(Normal)</td>
          </tr>
          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/7N.jpg">
            </td>
            <td style="text-align:center">7N</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Machine Wash Very Hot Gentle.jpg">
            </td>
            <td>Machine Wash Very Hot(Gentle)</td>
          </tr>

          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/9N.jpg">
            </td>
            <td style="text-align:center">9N</td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Machine Wash Very Hot Permanent Press.jpg">
            </td>
            <td>Machine Wash Very Hot(Permanent Press)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>


  <div :class="['search-form-wrapper', { open: isDryLabelVisible }]">
    <div class="search-trigger sigma_close" @click="toggleDryLabel()">
      <span></span>
      <span></span>
    </div>
    <div style="max-height: 70%; width: 70%;">
      <table class="sigma_responsive-table">
        <thead>
          <tr>
            <th style="text-align:center" colspan="6">Dry Procedure Label</th>
          </tr>
        </thead>
        <tbody style=" background-color: transparent;">
          <tr style=" background-color: transparent;">
            <td style="text-align:center" colspan="3">
              Europe Dry Procedure Label
            </td>
            <td style="text-align:center" colspan="3">
              USA Dry Procedure Label
            </td>
          </tr>
          <tr>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/Do not tumble dry.jpg">
            </td>
            <td style="text-align:center">
              Do Not Tumble Dry
            </td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Do Not Tumble Dry.jpg">
            </td>
            <td style="text-align:center">
              Do Not Tumble Dry
            </td>
          </tr>

          <tr>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/Tumble dry.jpg">
            </td>
            <td style="text-align:center">
              Tumble Dry
            </td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Tumble Dry.jpg"> &
              <img src="../assets/img/USA Wet Care Label/Tumble Dry_1.jpg">
            </td>
            <td style="text-align:center">
              Tumble Dry
            </td>
          </tr>

          <tr>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/Tumble dry low.jpg">
            </td>
            <td style="text-align:center">
              Tumble Dry Low
            </td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Tumble Dry Low.jpg">
            </td>
            <td style="text-align:center">
              Tumble Dry Low
            </td>
          </tr>

          <tr>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/Flat dry.jpg">
            </td>
            <td style="text-align:center">
              Flat Dry
            </td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Flat Dry.jpg">
            </td>
            <td style="text-align:center">
              Flat Dry
            </td>
          </tr>
          <tr>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/Europe Wet Care Label/Line dry.jpg">
            </td>
            <td style="text-align:center">
              Line Dry
            </td>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Line Dry.jpg">
            </td>
            <td style="text-align:center">
              Line Dry
            </td>
          </tr>

          <tr>
            <td style="text-align:center" colspan="3" rowspan="2">
              <p style="margin:0; text-align:center;">
                Notice: When tumble dry is not permitted,<br>
                the laboratory defaults to line dry for woven fabrics and flat dry for knitted fabrics.<br>
                Applicable to both ASTM and ISO/EN standards.
              </p>
            </td>
              <td style="text-align:center" colspan="2" >
                <img src="../assets/img/USA Wet Care Label/Drip Dry.jpg">
              </td>
              <td style="text-align:center">
                Drip Dry
              </td>
          </tr>
          <tr>
            <td style="text-align:center" colspan="2">
              <img src="../assets/img/USA Wet Care Label/Drip Flat Dry.png">
            </td>
            <td style="text-align:center">
              Drip Flat Dry
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div :class="['search-form-wrapper', { open: isDIBLabelVisible }]">
    <div class="search-trigger sigma_close" @click="toggleDIBLabel()">
      <span></span>
      <span></span>
    </div>
    <div style="max-height: 70%; width: 70%;">
      <table class="sigma_responsive-table">
        <thead>
          <tr>
            <th style="text-align:center" colspan="2">Bleach Label</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <img src="../assets/img/Europe Wet Care Label/Do not bleach.jpg">
            </td>
            <td style="text-align:center">
              Do Not Bleach
            </td>
          </tr>

          <tr>
            <td>
              <img src="../assets/img/Europe Wet Care Label/Any Bleaching.jpg">
            </td>
            <td style="text-align:center">
              Any Bleaching
            </td>
          </tr>

          <tr>
            <td>
              <img src="../assets/img/Europe Wet Care Label/Non-chlorine bleaching.jpg">
            </td>
            <td style="text-align:center">
              Non-chlorine bleaching
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div :class="['search-form-wrapper', { open: DCProLabelOpen }]">
    <div class="search-trigger sigma_close" @click="DCProLabelOpen=false">
      <span></span>
      <span></span>
    </div>
    <div style="max-height: 70%; width: 70%;">
      <table class="sigma_responsive-table">
        <thead>
        <tr>
          <th style="text-align:center" colspan="2">DC Procedure Label</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>
            <img src="../assets/img/Europe Wet Care Label/Do not dry-clean.jpg">
          </td>
          <td style="text-align:center">
            Do Not Dry Clean
          </td>
        </tr>

        <tr>
          <td>
            <img src="../assets/img/Europe Wet Care Label/DC Normal.jpg">
          </td>
          <td style="text-align:center">
            DC Normal
          </td>
        </tr>

        <tr>
          <td>
            <img src="../assets/img/Europe Wet Care Label/DC Sensitive.jpg">
          </td>
          <td style="text-align:center">
            DC Sensitive
          </td>
        </tr>

        <tr>
          <td>
            <img src="../assets/img/Europe Wet Care Label/Petroleum DC Normal.jpg">
          </td>
          <td style="text-align:center">
            Petroleum DC Normal
          </td>
        </tr>

        <tr>
          <td>
            <img src="../assets/img/Europe Wet Care Label/Petroleum DC Sensitive.jpg">
          </td>
          <td style="text-align:center">
            Petroleum DC Sensitive
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div :class="['search-form-wrapper', { open: ironMethodLabelOpen }]">
    <div class="search-trigger sigma_close" @click="ironMethodLabelOpen=false">
      <span></span>
      <span></span>
    </div>
    <div style="max-height: 70%; width: 70%;">
      <table class="sigma_responsive-table">
        <thead>
        <tr>
          <th style="text-align:center" colspan="2">Iron Label</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>
            <img src="../assets/img/Europe Wet Care Label/Do not iron.jpg">
          </td>
          <td style="text-align:center">
            Do Not Iron
          </td>
        </tr>

        <tr>
          <td>
            <img src="../assets/img/Europe Wet Care Label/Cool iron.jpg">
          </td>
          <td style="text-align:center">
            Cool Iron
          </td>
        </tr>

        <tr>
          <td>
            <img src="../assets/img/Europe Wet Care Label/Warm iron.jpg">
          </td>
          <td style="text-align:center">
            Warm Iron
          </td>
        </tr>

        <tr>
          <td>
            <img src="../assets/img/Europe Wet Care Label/Hot iron.jpg">
          </td>
          <td style="text-align:center">
            Hot Iron
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>


</template>

<script setup>
  import { ref, watch } from 'vue';

  const isNoticeOpen = ref(true)
  const DCProLabelOpen=ref(false)
  const afterIronLabelOpen=ref(false)
  const ironMethodLabelOpen=ref(false)
  const testPoint=ref('')
  const detergent = ref('');
  // const afterWashs=ref([])
  const props = defineProps([
    "afterWashs"]);
  const selectedAfterWashs=ref([])
  const afterWashOptions=['1 Wash', '3 Wash', '5 Wash', '10 Wash', '15 Wash', '20 Wash','25 Wash','32 Wash','45 Wash'];
  const selectedWashingProcedure = ref('');
  const selectedDryProcedure = ref('');
  const selectedDCProcedure = ref('');
  const selectedIronProcedure = ref('');
  const ironMethod=ref('');
  const selectedBleachProcedure = ref('');
  const selectedSCI = ref('');
  const showAppend = ref(false);
  const isWashingLabelVisible = ref(false);
  const isDryLabelVisible = ref(false);
  const isDIBLabelVisible = ref(false);
  const washingProcedures = ref([
    { value: '3N', label: '3N' },
    { value: '3M', label: '3M' },
    { value: '3G', label: '3G' },
    { value: '3H', label: '3H' },
    { value: '4N', label: '4N' },
    { value: '4M', label: '4M' },
    { value: '4G', label: '4G' },
    { value: '4H', label: '4H' },
    { value: '5N', label: '5N' },
    { value: '5M', label: '5M' },
    { value: '6N', label: '6N' },
    { value: '6M', label: '6M' },
    { value: '7N', label: '7N' },
    { value: '9N', label: '9N' },
    { value: 'Machine Wash Cold Normal', label: 'Machine Wash Cold Normal' },
    { value: 'Machine Wash Cold Gentle', label: 'Machine Wash Cold Gentle' },
    { value: 'Machine Wash Cold Permanent Press', label: 'Machine Wash Cold Permanent Press' },
    { value: 'Machine Wash Warm Normal', label: 'Machine Wash Warm Normal' },
    { value: 'Machine Wash Warm Gentle', label: 'Machine Wash Warm Gentle' },
    { value: 'Machine Wash Warm Permanent Press', label: 'Machine Wash Warm Permanent Press' },
    { value: 'Machine Wash Hot Normal', label: 'Machine Wash Hot Normal' },
    { value: 'Machine Wash Hot Gentle', label: 'Machine Wash Hot Gentle' },
    { value: 'Machine Wash Hot Permanent Press', label: 'Machine Wash Very Hot Permanent Press' },
    { value: 'Machine Wash Very Hot Normal', label: 'Machine Wash Very Hot Normal' },
    { value: 'Machine Wash Very Hot Gentle', label: 'Machine Wash Very Hot Gentle' },
    { value: 'Machine Wash Very Hot Permanent Press', label: 'Machine Wash Very Hot Permanent Press' },
    { value: 'Hand Wash', label: 'Hand Wash' },
    { value: 'Hand Wash Cold', label: 'Hand Wash Cold' },
  ]);

  const dryProcedures = ref([
    { value: 'Drip Flat Dry', label: 'Drip Flat Dry' },
    { value: 'Drip Dry', label: 'Drip Dry' },
    { value: 'Flat Dry', label: 'Flat Dry' },
    { value: 'Line Dry', label: 'Line Dry' },
    { value: 'Tumble Dry', label: 'Tumble Dry' },
    { value: 'Tumble Dry Low', label: 'Tumble Dry Low' }
  ]);

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
  const ironProcedures = ref([
    { value: 'Hot Iron', label: 'Hot Iron' },
    { value: 'Warm Iron', label: 'Warm Iron' },
    { value: 'Cool Iron', label: 'Cool Iron' }
  ]);

  const dcProcedures = ref([
    { value: 'DC Normal', label: 'DC Normal' },
    { value: 'DC Sensitive', label: 'DC Sensitive' },
    { value: 'Petroleum DC Normal', label: 'Petroleum DC Normal' },
    { value: 'Petroleum DC Sensitive', label: 'Petroleum DC Sensitive' }
  ]);
  const bleachProcedures = ref([
    { value: 'Any Bleaching', label: 'Any Bleaching' },
    { value: 'Non-chlorine Bleaching', label: 'Non-chlorine Bleaching' }
  ]);
  const emit = defineEmits(['updateData']);

  watch(
    [
      selectedWashingProcedure, selectedDryProcedure, selectedDCProcedure, selectedIronProcedure,ironMethod, selectedSCI, selectedBleachProcedure],() => {
      emit('updateData', {
        washingProcedure: selectedWashingProcedure.value,
        dryProcedure: selectedDryProcedure.value,
        dcProcedure: selectedDCProcedure.value,
        ironProcedure: selectedIronProcedure.value,
        ironMethod: ironMethod.value,
        sci: selectedSCI.value,
        bleachProcedure: selectedBleachProcedure.value
        ,detergent:detergent.value
      });
    },
    { immediate: true }
  );
  function addAfterWash(){
    if(props.afterWashs.some(item=>item.testPoint===testPoint.value)){
      return alert("The test point already exists.")
    }
    props.afterWashs.push({testPoint:testPoint.value,afterWash:selectedAfterWashs.value});
  }
  function removeAfterWash(index){
    props.afterWashs.splice(index,1);
  }

  const toggleWashingLabel = () => {
    isWashingLabelVisible.value = !isWashingLabelVisible.value;
  };
  const toggleDryLabel = () => {
    isDryLabelVisible.value = !isDryLabelVisible.value;
  };
  const toggleDIBLabel = () => {
    isDIBLabelVisible.value = !isDIBLabelVisible.value;
  };
  function toggleNotice() {
    isNoticeOpen.value = !isNoticeOpen.value;
  }
  </script>




<style scoped>
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
</style>
