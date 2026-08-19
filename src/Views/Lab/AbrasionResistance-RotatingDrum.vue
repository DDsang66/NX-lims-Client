<template>
  <div class="allContainer">
    <div class="main">
      <!-- ========== Left Panel 20% ========== -->
      <div class="left-panel">
        <!-- Device Connection Card -->
        <div class="card">
          <div class="ctitle"><el-icon><Connection /></el-icon>Device Connection</div>

          <div class="field-row">
            <label class="lbl">Balance Brand</label>
            <el-select v-model="scaleBrand" size="small" class="full-width" :disabled="connected || connecting" @change="onBrandChange">
              <el-option v-for="(b, k) in SCALE_BRANDS" :key="k" :value="k" :label="b.label" />
            </el-select>
          </div>

          <div class="field-row">
            <label class="lbl">Baud Rate</label>
            <el-select v-model="baudRate" size="small" class="full-width" :disabled="connected">
              <el-option v-for="b in rates" :key="b" :value="b" :label="String(b)" />
            </el-select>
          </div>

          <div class="btn-row">
            <el-button type="primary" size="small" :disabled="connected" :loading="connecting" @click="connect" class="btn-half">
              <el-icon><Link /></el-icon> Connect
            </el-button>
            <el-button type="danger" size="small" :disabled="!connected" @click="disconnect" class="btn-half">
              <el-icon><SwitchButton /></el-icon> Disconnect
            </el-button>
          </div>

          <div class="status-text">
            <span class="dot" :class="{on:connected}"></span>
            {{ connecting ? 'Connecting...' : connected ? 'Connected ' + cfgInfo : 'Disconnected — Manual' }}
          </div>
          <div v-if="connected" class="status-text" style="color:#67c23a;">
            <span class="dot" :class="{on:weight!=null}"></span>
            {{ weight != null ? 'Reading: ' + weight.toFixed(4) + ' g' : 'Waiting for data...' }}
          </div>
        </div>

        <!-- Weight Card -->
        <div class="card">
          <div class="ctitle"><el-icon><ScaleToOriginal /></el-icon>Weight (g)</div>
          <div class="wtbox" :class="{live:connected}">
            <span v-if="!connected" style="width:100%;">
              <el-input-number v-model="weight" :precision="4" :min="0" :step="0.0001" controls-position="right" class="full-width" placeholder="Manual" />
            </span>
            <span v-else class="wtval">{{ weight != null ? weight.toFixed(4) : '---' }}</span>
          </div>
        </div>

        <!-- Operation Buttons -->
        <div class="card btn-group">
          <el-button type="primary" round size="default" @click="recordResults" class="full-width"><el-icon><CirclePlus /></el-icon> Record Results</el-button>
          <el-button type="warning" round size="default" @click="clearAll" class="full-width"><el-icon><RefreshLeft /></el-icon> Clear All</el-button>
          <el-button type="danger" round size="default" :disabled="!sel.length" @click="delSel" class="full-width"><el-icon><Delete /></el-icon> Delete Selected</el-button>
          <el-button type="info" round size="default" :disabled="!rows.length" @click="doExport" class="full-width"><el-icon><Download /></el-icon> Export Excel</el-button>
          <el-button type="primary" round size="default" @click="generateReport" class="full-width">
            <el-icon><Document /></el-icon> Generate Report
          </el-button>
          <el-button round size="default" @click="doPrint" class="full-width">
            <el-icon><Printer /></el-icon> Print
          </el-button>
        </div>
      </div>

      <!-- ========== Right Panel 80% ========== -->
      <div class="right-panel">
        <!-- Upper 30% : Report Info -->
        <div class="right-top card">
          <div style="display:flex; flex-direction:column; height:100%; gap:6px;">
            <div style="display:flex; gap:24px; width:100%;">
              <!-- 第一列：3个字段 -->
              <div style="flex:1; display:flex; flex-direction:column; gap:12px;">
                <!-- 第一行：Report No. -->
                <span class="field" style="display:flex; align-items:center; gap:2px;">
                  <!-- 左侧标签区域，固定宽度并右对齐 -->
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">Report No.:</span>
                  <el-input v-model="rep1" style="width:40px" size="small" disabled />
                  <el-select v-model="rep2" style="width:60px" size="small">
                    <el-option value="405.">405.</el-option>
                    <el-option value="441.">441.</el-option>
                  </el-select>
                  <el-select v-model="rep3" style="width:50px" size="small">
                    <el-option :value="twoDigitYear + '.'">{{ twoDigitYear }}</el-option>
                    <el-option :value="(twoDigitYear-1) + '.'">{{ twoDigitYear-1 }}</el-option>
                  </el-select>
                  <el-input v-model="rep4" style="width:60px" size="small" @blur="data4Blur" placeholder="No" />
                  <el-input v-model="rep5" style="width:45px" size="small" />
                </span>

                <!-- 第二行：Condition -->
                <span class="field" style="display:flex; align-items:center;">
                  <!-- 左侧标签区域，与上面保持相同的 width 和对齐方式 -->
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">Condition:</span>
                  <el-select v-model="conditionSelected" size="small" style="flex:1; max-width:200px;">
                    <el-option v-for="cond in conditionOptionsList" :key="cond.value" :label="cond.label" :value="cond.value" />
                  </el-select>
                </span>

                <!-- 第三行：Cleaning Method -->
                <span class="field" style="display:flex; align-items:center;">
                  <!-- 左侧标签区域，与上面保持相同的 width 和对齐方式 -->
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">Cleaning Method:</span>
                  <el-autocomplete v-model="cleaningMethodSelected"
                                   :fetch-suggestions="queryCleaningMethods"
                                   trigger="focus"
                                   clearable
                                   size="small"
                                   style="flex:1; max-width:200px;"
                                   placeholder="Select or input"
                                   @select="onCleaningMethodSelect"
                                   @clear="onCleaningMethodClear" />
                </span>
              </div>


              <!-- 第二列：2个字段 -->
              <div style="flex:1; display:flex; flex-direction:column; gap:12px;">
                <span class="field" style="display:flex; align-items:center;">
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">Test Standard:</span>
                  <el-select v-model="testStandardSelected" size="small" style="flex:1; max-width:200px;">
                    <el-option v-for="sg in testStandardOptions" :key="sg.value" :label="sg.label" :value="sg.value" />
                  </el-select>
                </span>

                <span class="field" style="display:flex; align-items:center;">
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">Method Category:</span>
                  <el-select v-model="methodCategorySelected" size="small" style="flex:1; max-width:200px;">
                    <el-option v-for="mc in methodCategoryOptions" :key="mc.value" :label="mc.label" :value="mc.value" />
                  </el-select>
                </span>

                <span class="field" style="display:flex; align-items:center;">
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">Buyer Limitation:</span>
                  <el-tooltip content="≤ 买家给定requirement" placement="top" :show-after="300">
                    <el-input-number v-model="buyerLimitation" :precision="4" :step="0.0001" :min="0" size="small" style="flex:1; max-width:200px;" controls-position="right" placeholder="≤" />
                  </el-tooltip>
                </span>
              </div>

              <!-- 第三列：2个字段 + Remark -->
              <div style="flex:1; display:flex; flex-direction:column; gap:12px;">
                <!-- M1 Constant -->
                <span class="field" style="display:flex; align-items:center;">
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">M1 Constant:</span>
                  <div style="flex:1; max-width:200px; position:relative; display:flex; gap:4px; align-items:center;">
                    <el-input-number v-model="m1Constant" :precision="4" :step="0.0001" :min="0" size="small" style="flex:1;" controls-position="right" :disabled="loadingConstants" readonly ="true" />
                    <el-icon style="cursor:pointer; color:#409eff; font-size:16px; flex-shrink:0;" @click="openEditDialog('M1')">
                      <Edit />
                    </el-icon>
                    <el-icon style="cursor:pointer; color:#67c23a; font-size:16px; flex-shrink:0;" @click="openHistoryDialog('M1')">
                      <Clock />
                    </el-icon>
                  </div>
                </span>

                <!-- M2 Constant -->
                <span class="field" style="display:flex; align-items:center;">
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">M2 Constant:</span>
                  <div style="flex:1; max-width:200px; position:relative; display:flex; gap:4px; align-items:center;">
                    <el-input-number v-model="m2Constant" :precision="4" :step="0.0001" :min="0" size="small" style="flex:1;" controls-position="right" :disabled="loadingConstants" readonly ="true" />
                    <el-icon style="cursor:pointer; color:#409eff; font-size:16px; flex-shrink:0;" @click="openEditDialog('M2')">
                      <Edit />
                    </el-icon>
                    <el-icon style="cursor:pointer; color:#67c23a; font-size:16px; flex-shrink:0;" @click="openHistoryDialog('M2')">
                      <Clock />
                    </el-icon>
                  </div>
                </span>

                <span class="field" style="display:flex; align-items:center;">
                  <span style="width:130px; text-align:right; margin-right:8px; flex-shrink:0;">Remark:</span>
                  <el-select v-model="remarkSelected" size="small" style="flex:1; max-width:200px;" placeholder="Select remark">
                    <el-option v-for="rm in remarkOptions" :key="rm.value" :label="rm.label" :value="rm.value" />
                  </el-select>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Lower 70% : Abrasion Data -->
        <div class="right-bottom card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
            <span style="font-weight:600; color:#2b3a4a; font-size:14px;">
              <el-icon><Grid /></el-icon> Abrasion Resistance Data
            </span>
            <span class="field" style="display:flex; align-items:center; gap:6px;">
              <span style="font-weight:500; color:#444; font-size:13px;">Sample:</span>
              <el-input v-model="sampleNumber"
                        size="small"
                        style="width:180px;"
                        placeholder="Enter sample Code" />
            </span>
          </div>

          <!-- Calculation sections with checkboxes -->
          <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:8px;">
            <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
              <el-checkbox v-model="showDensityCalc">Density of test Sample</el-checkbox>
              <div v-if="showDensityCalc" style="width:100%;">
                <table style="width:100%; border-collapse:collapse; margin-top:8px; table-layout:fixed;">
                  <colgroup>
                    <col style="width:120px;" />
                    <col style="width:auto;" />
                    <col style="width:auto;" />
                    <col style="width:auto;" />
                    <col style="width:120px;" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee; width:120px;">Item</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee;">m₁ (g)</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee;">m₂ (g)</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee;">Formula</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee; width:120px;">Result (g/cm³)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px;">Specimen A</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">
                        <el-input-number ref="testDensityM1Ref0" v-model="testDensityM1[0]" :precision="4" :step="0.0001" size="small" style="width:140px" @focus="onInputFocus('testDensityM1', 0)" />
                      </td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">
                        <el-input-number ref="testDensityM2Ref0" v-model="testDensityM2[0]" :precision="4" :step="0.0001" size="small" style="width:140px" @focus="onInputFocus('testDensityM2', 0)" />
                      </td>
                      <td rowspan="3" style="padding:8px; vertical-align:middle; border-left:1px solid #eee; text-align:center;">ρ = ρ<sub>w</sub> × m₁/(m₁-m₂)</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:100px; font-weight:600; color:#409eff;">
                        <el-input-number v-model="testDensityResults[0]"
                                         :precision="4"
                                         :step="0.0001"
                                         :min="0"
                                         size="small"
                                         style="width:100px"
                                         controls-position="right"
                                         placeholder="Auto"
                                         @change="onTestDensityResultChange(0)"
                                         @focus="onInputFocus('testDensityResult', 0)" />
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px;">Specimen B</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">
                        <el-input-number ref="testDensityM1Ref1" v-model="testDensityM1[1]" :precision="4" :step="0.0001" size="small" style="width:140px" @focus="onInputFocus('testDensityM1', 1)" />
                      </td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">
                        <el-input-number ref="testDensityM2Ref1" v-model="testDensityM2[1]" :precision="4" :step="0.0001" size="small" style="width:140px" @focus="onInputFocus('testDensityM2', 1)" />
                      </td>
                      <td style="padding: 8px; border-bottom: 1px solid #f5f5f5; text-align: center; width: 100px; font-weight: 600; color: #409eff;">
                        <el-input-number v-model="testDensityResults[1]"
                                         :precision="4"
                                         :step="0.0001"
                                         :min="0"
                                         size="small"
                                         style="width:100px"
                                         controls-position="right"
                                         placeholder="Auto"
                                         @change="onTestDensityResultChange(1)"
                                         @focus="onInputFocus('testDensityResult', 1)" />
                      </td>
                    </tr>
                    <tr style="background-color:#fafafa;">
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center; width:120px; font-weight:600;">Average</td>
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center;">—</td>
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center;">—</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px; font-weight:700; color:#409eff;">
                        {{ avgTestDensity != null ? avgTestDensity.toFixed(4) : '---' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
              <el-checkbox v-model="showVolumeLossCalc">Relative Volume Loss (per specimen)</el-checkbox>
              <div v-if="showVolumeLossCalc" style="width:100%;">
                <div style="display:flex; gap:12px; align-items:center; margin-top:6px;">
                  <span class="field">
                    Abrasion distance:
                    <el-select v-model="abrasionDistanceSelected" size="small" style="width:140px; margin-left:8px;" @change="onAbrasionDistanceChange">
                      <el-option label="Full" value="full" />
                      <el-option label="Half" value="half" />
                      <el-option label="Quarter" value="quarter" />
                    </el-select>
                  </span>
                </div>
                <table style="width:100%; border-collapse:collapse; margin-top:8px; table-layout:fixed;">
                  <colgroup>
                    <col style="width:120px;" />
                    <col style="width:auto;" />
                    <col style="width:auto;" />
                    <col style="width:auto;" />
                    <col style="width:auto;" />
                    <col style="width:auto;" />
                    <col style="width:120px;" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee; width:120px;">Specimen</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee;">W₁ (g)</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee;">W₂ (g)</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee;">M₁</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee;">M₂</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee;">Formula</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee; width:120px;">Result (mm³)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px;">Specimen 1</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;"><el-input-number ref="abrasionBefore0" v-model="abrasionRows[0].beforeWeight" :precision="4" :step="0.0001" size="small" controls-position="right" style="width:130px" @change="calculateAbrasion(abrasionRows[0])" @focus="onInputFocus(0, 'before')" /></td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;"><el-input-number ref="abrasionAfter0" v-model="abrasionRows[0].afterWeight" :precision="4" :step="0.0001" size="small" controls-position="right" style="width:130px" @change="calculateAbrasion(abrasionRows[0])" @focus="onInputFocus(0, 'after')" /></td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">{{ m1Constant != null ? m1Constant.toFixed(4) : '---' }}</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">{{ m2Constant != null ? m2Constant.toFixed(4) : '---' }}</td>
                      <td rowspan="4" style="padding:8px; vertical-align:middle; border-left:1px solid #eee; text-align:center;">ΔV<sub>rel</sub> = 1000×Δm<sub>t</sub>×400 / [ρ<sub>t</sub>×(M₁+M₂)]</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px; font-weight:600; color:#409eff;">{{ abrasionRows[0].volLoss != null ? abrasionRows[0].volLoss.toFixed(4) : '---' }}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px;">Specimen 2</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;"><el-input-number ref="abrasionBefore1" v-model="abrasionRows[1].beforeWeight" :precision="4" :step="0.0001" size="small" controls-position="right" style="width:130px" @change="calculateAbrasion(abrasionRows[1])" @focus="onInputFocus(1, 'before')" /></td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;"><el-input-number ref="abrasionAfter1" v-model="abrasionRows[1].afterWeight" :precision="4" :step="0.0001" size="small" controls-position="right" style="width:130px" @change="calculateAbrasion(abrasionRows[1])" @focus="onInputFocus(1, 'after')" /></td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">{{ m1Constant != null ? m1Constant.toFixed(4) : '---' }}</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">{{ m2Constant != null ? m2Constant.toFixed(4) : '---' }}</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px; font-weight:600; color:#409eff;">{{ abrasionRows[1].volLoss != null ? abrasionRows[1].volLoss.toFixed(4) : '---' }}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px; text-align:center; width:120px;">Specimen 3</td>
                      <td style="padding:8px; text-align:center;"><el-input-number ref="abrasionBefore2" v-model="abrasionRows[2].beforeWeight" :precision="4" :step="0.0001" size="small" controls-position="right" style="width:130px" @change="calculateAbrasion(abrasionRows[2])" @focus="onInputFocus(2, 'before')" /></td>
                      <td style="padding:8px; text-align:center;"><el-input-number ref="abrasionAfter2" v-model="abrasionRows[2].afterWeight" :precision="4" :step="0.0001" size="small" controls-position="right" style="width:130px" @change="calculateAbrasion(abrasionRows[2])" @focus="onInputFocus(2, 'after')" /></td>
                      <td style="padding:8px; text-align:center;">{{ m1Constant != null ? m1Constant.toFixed(4) : '---' }}</td>
                      <td style="padding:8px; text-align:center;">{{ m2Constant != null ? m2Constant.toFixed(4) : '---' }}</td>
                      <td style="padding:8px; text-align:center; width:120px; font-weight:600; color:#409eff;">{{ abrasionRows[2].volLoss != null ? abrasionRows[2].volLoss.toFixed(4) : '---' }}</td>
                    </tr>
                    <tr style="background-color:#fafafa;">
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center; width:120px; font-weight:600;">Average</td>
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center;">—</td>
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center;">—</td>
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center;">—</td>
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center;">—</td>
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center; width:120px; font-weight:700; color:#409eff;">
                        {{ avgVolLoss != null ? avgVolLoss.toFixed(4) : '---' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
              <el-checkbox v-model="showRefDensityCalc">Density of reference compound</el-checkbox>
              <div v-if="showRefDensityCalc" style="width:100%;">
                <table style="width:100%; border-collapse:collapse; margin-top:8px; table-layout:fixed;">
                  <colgroup>
                    <col style="width:120px;" />
                    <col style="width:auto;" />
                    <col style="width:auto;" />
                    <col style="width:120px;" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee; width:120px;">Item</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee;">m₁ (g)</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee;">m₂ (g)</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee; width:120px;">Result (g/cm³)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px;">Specimen A</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">
                        <el-input-number ref="refDensityM1Ref0" v-model="refDensityM1[0]" :precision="4" :step="0.0001" size="small" style="width:140px" @focus="onInputFocus('refDensityM1', 0)" />
                      </td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">
                        <el-input-number ref="refDensityM2Ref0" v-model="refDensityM2[0]" :precision="4" :step="0.0001" size="small" style="width:140px" @focus="onInputFocus('refDensityM2', 0)" />
                      </td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px; font-weight:600; color:#409eff;">{{ calcRefDensityResult(0) }}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px;">Specimen B</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">
                        <el-input-number ref="refDensityM1Ref1" v-model="refDensityM1[1]" :precision="4" :step="0.0001" size="small" style="width:140px" @focus="onInputFocus('refDensityM1', 1)" />
                      </td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">
                        <el-input-number ref="refDensityM2Ref1" v-model="refDensityM2[1]" :precision="4" :step="0.0001" size="small" style="width:140px" @focus="onInputFocus('refDensityM2', 1)" />
                      </td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px; font-weight:600; color:#409eff;">{{ calcRefDensityResult(1) }}</td>
                    </tr>
                    <tr style="background-color:#fafafa;">
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center; width:120px; font-weight:600;">Average</td>
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center;">—</td>
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center;">—</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px; font-weight:600; color:#409eff;">
                        {{ avgRefDensity != null ? avgRefDensity.toFixed(4) : '---' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
              <el-checkbox v-model="showARIndexCalc">Abrasion resistance Index</el-checkbox>
              <div v-if="showARIndexCalc" style="width:100%;">
                <table style="width:100%; border-collapse:collapse; margin-top:8px; table-layout:fixed;">
                  <colgroup>
                    <col style="width:120px;" />
                    <col style="width:auto;" />
                    <col style="width:auto;" />
                    <col style="width:auto;" />
                    <col style="width:120px;" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee; width:120px;">Specimen</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee;">Δm<sub>t</sub> (mg)</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee;">ρ<sub>t</sub> (g/cm³)</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee;">Formula</th>
                      <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee; width:120px;">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px;">Specimen 1</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">
                        {{ abrasionRows[0].massLoss != null ? (abrasionRows[0].massLoss * 1000).toFixed(2) : '---' }}
                      </td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">
                        {{ avgTestDensity != null ? avgTestDensity.toFixed(4) : '---' }}
                      </td>
                      <td rowspan="4" style="padding:8px; vertical-align:middle; border-left:1px solid #eee; text-align:center; font-size:13px;">
                        I<sub>AR</sub> = ((M₁+M₂)/2 × ρ<sub>t</sub>) / (Δm<sub>t</sub> × 1.15) × 100
                      </td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px; font-weight:600; color:#67c23a;">
                        {{ abrasionRows[0].arIndex != null ? abrasionRows[0].arIndex.toFixed(2) : '---' }}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px;">Specimen 2</td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">
                        {{ abrasionRows[1].massLoss != null ? (abrasionRows[1].massLoss * 1000).toFixed(2) : '---' }}
                      </td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center;">
                        {{ avgTestDensity != null ? avgTestDensity.toFixed(4) : '---' }}
                      </td>
                      <td style="padding:8px; border-bottom:1px solid #f5f5f5; text-align:center; width:120px; font-weight:600; color:#67c23a;">
                        {{ abrasionRows[1].arIndex != null ? abrasionRows[1].arIndex.toFixed(2) : '---' }}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px; text-align:center; width:120px;">Specimen 3</td>
                      <td style="padding:8px; text-align:center;">
                        {{ abrasionRows[2].massLoss != null ? (abrasionRows[2].massLoss * 1000).toFixed(2) : '---' }}
                      </td>
                      <td style="padding:8px; text-align:center;">
                        {{ avgTestDensity != null ? avgTestDensity.toFixed(4) : '---' }}
                      </td>
                      <td style="padding:8px; text-align:center; width:120px; font-weight:600; color:#67c23a;">
                        {{ abrasionRows[2].arIndex != null ? abrasionRows[2].arIndex.toFixed(2) : '---' }}
                      </td>
                    </tr>
                    <tr style="background-color:#fafafa;">
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center; width:120px; font-weight:600;">Average</td>
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center;">—</td>
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center;">
                        {{ avgTestDensity != null ? avgTestDensity.toFixed(4) : '---' }}
                      </td>
                      <td style="padding:8px; border-top:2px solid #eee; text-align:center; width:120px; font-weight:700; color:#409eff;">
                        {{ avgARIndex != null ? avgARIndex.toFixed(2) : '---' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style="margin-top:6px; font-size:12px; color:#909399;">
                  <span>ρ<sub>r</sub> (reference rubber density) = 1.15 g/cm³</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- M1/M2 修改对话框 -->
  <el-dialog v-model="editDialogVisible" :title="'Modify ' + editForm.type + ' Constant'" width="700px" append-to-body>
    <el-form label-width="110px">
      <el-form-item :label="editForm.type + ' Value'">
        <el-input-number v-model="editForm.value"
                         :precision="4"
                         :step="0.0001"
                         :min="0"
                         style="width:100%;"
                         controls-position="right" />
      </el-form-item>
      <el-form-item label="Modifier Name">
        <el-input v-model="editForm.modifier"
                  placeholder="Enter your name" />
      </el-form-item>
      <el-form-item label="Reason">
        <el-input v-model="editForm.reason"
                  type="textarea"
                  :rows="3"
                  placeholder="Enter the reason for modification" />
      </el-form-item>
      <el-form-item label="Time">
        <el-input :model-value="new Date().toLocaleString('zh-CN')"
                  disabled />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editDialogVisible = false">Cancel</el-button>
      <el-button type="primary" :loading="submitting" @click="submitEditConstant">Submit</el-button>
    </template>
  </el-dialog>

  <!-- 常量历史记录对话框 -->
  <el-dialog v-model="historyDialogVisible"
             :title="historyType + ' Constant History'"
             width="700px"
             append-to-body>
    <el-table :data="constantHistory" border stripe size="small" max-height="400">
      <el-table-column prop="type" label="Type" width="80" align="center" />
      <el-table-column prop="value" label="Value" width="120" align="center">
        <template #default="{ row }">
          {{ row.value != null ? row.value.toFixed(4) : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="modifier" label="Modifier" width="120" align="center" />
      <el-table-column prop="reason" label="Reason" min-width="200" />
      <el-table-column prop="modifiedAt" label="Modified At" width="180" align="center">
        <template #default="{ row }">
          {{ formatDateTime(row.modifiedAt) }}
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="historyDialogVisible = false">Close</el-button>
    </template>
  </el-dialog>

</template>

<script setup>
  import { ref, reactive, computed, onBeforeUnmount, inject, watch, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    Connection, Link, SwitchButton, ScaleToOriginal, Grid,
    CirclePlus, RefreshLeft, Delete, Download, Printer, Document, Edit, Clock
  } from '@element-plus/icons-vue'

  // ---- Inject API ----
  const api = inject('request')

  // ---- Serial constants (same as original) ----
  const UNIT_TO_G = { g: 1, kg: 1000, mg: 0.001 }
  const METTLER_STABLE_RE = /^S[DI]?\s+([+-]?\d+\.\d+)\s*(g|kg|mg)?\r?$/i
  const METTLER_BARE_RE = /^([+-]?\d+\.\d+)\s*(g|kg|mg)?\r?$/

  function toGrams(num, unit) {
    const k = (unit || 'g').toLowerCase()
    return num * (UNIT_TO_G[k] ?? 1)
  }

  function matchMettler(line) {
    let i = 0
    while (i < line.length && (line.charCodeAt(i) <= 32)) i++
    const s = line.slice(i).trim()
    let m = s.match(METTLER_STABLE_RE)
    if (m) return toGrams(parseFloat(m[1]), m[2])
    m = s.match(METTLER_BARE_RE)
    if (m) return toGrams(parseFloat(m[1]), m[2])
    if (/^S[ DI]?\s/i.test(s)) {
      m = s.match(/([+-]?\d+\.\d+)\s*(g|kg|mg)?\s*$/)
      if (m) return toGrams(parseFloat(m[1]), m[2])
    }
    return null
  }

  const SCALE_BRANDS = {
    sartorius: {
      label: 'Sartorius',
      defaultBaud: 1200,
      signals: 'edge',
      cfgs: [
        { dataBits: 7, parity: 'odd', stopBits: 1 },
        { dataBits: 8, parity: 'odd', stopBits: 1 },
        { dataBits: 7, parity: 'even', stopBits: 1 },
        { dataBits: 8, parity: 'none', stopBits: 1 },
        { dataBits: 7, parity: 'odd', stopBits: 1, flowControl: 'hardware' },
      ],
      parse(line) {
        const m = line.trim().match(/([+-]?\d+\.\d+)/)
        return m ? parseFloat(m[1]) : null
      },
    },
    mettler: {
      label: 'Mettler Toledo',
      defaultBaud: 9600,
      signals: 'none',
      cfgs: [
        { dataBits: 8, parity: 'none', stopBits: 1 },
        { dataBits: 7, parity: 'even', stopBits: 1 },
        { dataBits: 7, parity: 'odd', stopBits: 1 },
        { dataBits: 8, parity: 'even', stopBits: 1 },
        { dataBits: 7, parity: 'none', stopBits: 1 },
      ],
      parse: matchMettler,
    },
  }
  const currentReportFileName = ref(null)
  // ---- State ----
  const baudRate = ref(1200)
  const rates = [1200, 2400, 4800, 9600, 19200, 38400]
  const scaleBrand = ref('sartorius')
  const connected = ref(false)
  const connecting = ref(false)
  const cfgInfo = ref('')
  const portObj = ref(null)
  const portCfg = ref(null)
  const weight = ref(null)
  const lastRxTime = ref(0)

  // ---- Specimen Info ----
  const twoDigitYear = new Date().getFullYear() % 100
  const rep1 = ref('87.')
  const rep2 = ref('441.')
  const rep3 = ref(`${twoDigitYear}.`)
  const rep4 = ref('')
  const rep5 = ref('.01')
  const point = ref('')
  const reportNo = computed(() => rep1.value + rep2.value + rep3.value + rep4.value + rep5.value)
  const sampleNumber = ref('')

  // ---- Report info (new fields) ----
  const conditionSelected = ref(null)
  const conditionOptionsList = [
    { value: '23 ± 2°C / 50 ± 2% RH × 16 hours(recommend 16 hours)', label: '23 ± 2°C / 50 ± 2% RH × 16 hours(recommend 16 hours)' },
    { value: '20 ± 2°C / 65 ± 2% RH × 16 hours', label: '20 ± 2°C / 65 ± 2% RH × 16 hours' },
    { value: 'Without conditioning', label: 'Without conditioning' }
  ]

  const cleaningMethodSelected = ref(null)
  const cleaningOptionsList = [
    { value: 'a brush attached to a vacuum cleaner', label: 'a brush attached to a vacuum cleaner' },
    { value: 'brush', label: 'brush' },
    { value: '', label: 'please specified' }
  ]

  function queryCleaningMethods(queryString, cb) {
    const results = cleaningOptionsList.map(item => ({ value: item.value || item.label }))
    cb(results)
  }

  // 当从下拉列表选中某项时触发
  function onCleaningMethodSelect(item) {
    cleaningMethodSelected.value = item.value
    // 如果选中的是第3个选项（空字符串代表自定义），清空输入框以便用户输入
    if (item.value === '') {
      cleaningMethodSelected.value = ''
    }
  }

  // 当点击清空按钮时触发
  function onCleaningMethodClear() {
    cleaningMethodSelected.value = ''
  }

  // Additional mock selects (as requested)
  const testStandardSelected = ref(null)
  const testStandardOptions = [
    { value: 'ASTM D 5963-22', label: 'ASTM D 5963-22' },
    { value: 'DIN 53516', label: 'DIN 53516' },
    { value: 'BS 903 A9:2020 Method A', label: 'BS 903 A9:2020 Method A' },
    { value: 'ISO 4649:2024', label: 'ISO 4649:2024' },
    { value: 'BS ISO 4649:2024', label: 'BS ISO 4649:2024' },
    { value: 'DIN ISO 4649:2014', label: 'DIN ISO 4649:2014' },
    { value: 'EN 12770:1999', label: 'EN 12770:1999' },
    { value: 'ISO 20871:2018(R2023)', label: 'ISO 20871:2018(R2023)' },
    { value: 'SATRA TM174:2016', label: 'SATRA TM174:2016' },
    { value: 'QB/T 2884-2020', label: 'QB/T 2884-2020' },
    { value: 'GB/T 9867-2008', label: 'GB/T 9867-2008' },
    { value: 'GB/T 26703-2021', label: 'GB/T 26703-2021' },
    { value: 'GE-27', label: 'GE-27' },
    { value: 'SATRA TM193(leather sole)', label: 'SATRA TM193(leather sole)' },
  ]

  const methodCategorySelected = ref(null)
  const methodCategoryOptions = [
    { value: '', label: 'default' },
    { value: 'Method A(Non-rotation test)', label: 'Method A(Non-rotation test)' },
    { value: 'Method B(Rotation test)', label: 'Method B(Rotation test)' }
  ]

  const buyerLimitation = ref(null)
  const testDensityResults = ref([null, null])

  // 新增：记录哪些是手动输入的
  const testDensityManual = ref([false, false])


  // ---- Remark ----
  const remarkSelected = ref(null)
  const remarkOptions = [
    { value: '', label: 'default' },
    { value: 'Not applicable for the outsole thickness less than 2.0mm.', label: 'Not applicable for the outsole thickness less than 2.0mm.' },
    { value: 'Not applicable for the outsole size less than 16.0 mm.', label: 'Not applicable for the outsole size less than 16.0 mm.' },
    { value: 'Not suitable to sampling', label: 'Not suitable to sampling' }
  ]

  // ---- M1、M2 常量 ----
  const m1Constant = ref(null)
  const m2Constant = ref(null)
  const loadingConstants = ref(false)

  // 常量历史记录
  const constantHistory = ref([])
  const historyDialogVisible = ref(false)
  const historyType = ref('')

  const submitting = ref(false)
  // ---- Density Measurement ----
  const waterDensity = ref(1) // g/cm³ at 23°C

  const densityA = reactive({
    airWeight: null,
    waterWeight: null,
    density: null
  })

  const densityB = reactive({
    airWeight: null,
    waterWeight: null,
    density: null
  })

  // 完整的 Report No
  const reportNumber = computed(() => {
    return rep1.value + rep2.value + rep3.value + rep4.value + rep5.value
  })

  // 格式化 rep4 输入（只允许数字）
  function formatRep4Input() {
    rep4.value = rep4.value.replace(/\D/g, '')
    if (rep4.value.length > 4) {
      rep4.value = rep4.value.slice(0, 4)
    }
  }

  // blur 时补足 4 位
  function formatRep4() {
    if (!rep4.value) return
    rep4.value = rep4.value.replace(/\D/g, '')
    if (rep4.value.length < 4) {
      rep4.value = rep4.value.padStart(4, '0')
    }
    if (rep4.value.length > 4) {
      rep4.value = rep4.value.slice(0, 4)
    }
  }


  async function fetchConstants() {
    try {
      loadingConstants.value = true
      const res = await api.get('AbrasionResistanceReport/Mvalue')
      if (res.data && res.data.isSuccess) {
        m1Constant.value = res.data.value?.m1 ?? null
        m2Constant.value = res.data.value?.m2 ?? null
      } else {
        ElMessage.warning(res.data?.message || 'Failed to fetch constants')
      }
    } catch (e) {
      ElMessage.error('Failed to fetch M1/M2 constants: ' + (e.message || e))
    } finally {
      loadingConstants.value = true
    }
  }

  // 修改对话框状态
  const editDialogVisible = ref(false)
  const editForm = reactive({
    type: 'M1',
    value: null,
    modifier: '',
    reason: '',
    modifiedAt: null
  })

  // 打开修改对话框
  function openEditDialog(type) {
    editForm.type = type
    editForm.value = type === 'M1' ? m1Constant.value : m2Constant.value
    editForm.modifier = ''
    editForm.reason = ''
    editForm.modifiedAt = null
    editDialogVisible.value = true
  }

  // 提交修改
  async function submitEditConstant() {
    if (!editForm.modifier || !editForm.modifier.trim()) {
      ElMessage.warning('Please enter modifier name')
      return
    }
    if (!editForm.reason || !editForm.reason.trim()) {
      ElMessage.warning('Please enter the reason for modification')
      return
    }
    if (editForm.value == null || editForm.value <= 0) {
      ElMessage.warning('Please enter a valid constant value (must be > 0)')
      return
    }

    submitting.value = true
    try {
      const payload = {
        type: editForm.type,
        value: editForm.value,
        modifier: editForm.modifier.trim(),
        reason: editForm.reason.trim(),
        modifiedAt: new Date().toISOString()
      }

      const res = await api.post('AbrasionResistanceReport/change-Mvalue', payload)

      if (res.data && res.data.isSuccess) {
        // 更新本地显示
        if (editForm.type === 'M1') {
          m1Constant.value = editForm.value
        } else {
          m2Constant.value = editForm.value
        }

        ElMessage.success(`${editForm.type} Constant updated successfully`)
        editDialogVisible.value = false
      } else {
        ElMessage.error(res.data?.message || 'Update failed')
      }
    } catch (e) {
      ElMessage.error('Update failed: ' + (e.message || e))
    } finally {
      submitting.value = false
    }
  }

  //查看历史记录
  async function openHistoryDialog(type) {
    historyType.value = type
    try {
      const res = await api.get(`AbrasionResistanceReport/Mvalue/${type}-history`)
      if (res.data && res.data.isSuccess) {
        constantHistory.value = res.data.value || []
        historyDialogVisible.value = true
      } else {
        ElMessage.warning(res.data?.message || 'Failed to fetch history')
      }
    } catch (e) {
      ElMessage.error('Failed to fetch history: ' + (e.message || e))
    }
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  // 挂载时获取数据
  onMounted(() => {
    fetchConstants()
  })

  const avgTestDensity = computed(() => {
    const densities = []
    for (let i = 0; i < 2; i++) {
      // 获取当前试样的密度值（无论是手动输入还是自动计算）
      const result = calcTestDensityResult(i)
      if (result !== '---') {
        densities.push(parseFloat(result))
      }
    }
    if (densities.length === 0) return null
    return densities.reduce((a, b) => a + b, 0) / densities.length
  })

  // 参照化合物密度平均值
  const avgRefDensity = computed(() => {
    const densities = []
    for (let i = 0; i < 2; i++) {
      const result = calcRefDensityResult(i)
      if (result !== '---') {
        densities.push(parseFloat(result))
      }
    }
    if (densities.length === 0) return null
    return densities.reduce((a, b) => a + b, 0) / densities.length
  })


  // Calculate density: ρ = ρ_w × m_air / (m_air - m_water)
  function calculateDensity(obj) {
    if (obj.airWeight != null && obj.waterWeight != null && obj.airWeight > 0 && obj.waterWeight > 0 && obj.airWeight > obj.waterWeight) {
      const diff = obj.airWeight - obj.waterWeight
      obj.density = waterDensity.value * (obj.airWeight / diff)
    } else {
      obj.density = null
    }
  }

  function calcTestDensityResult(idx) {
    // 如果用户手动输入了值，直接返回
    if (testDensityManual.value[idx] && testDensityResults.value[idx] != null) {
      return testDensityResults.value[idx].toFixed(4)
    }

    // 否则自动计算
    const m1 = testDensityM1.value[idx]
    const m2 = testDensityM2.value[idx]
    if (m1 != null && m2 != null && (m1 - m2) !== 0) {
      const result = m1 / (m1 - m2)
      // 同步更新到 testDensityResults
      testDensityResults.value[idx] = result
      return result.toFixed(4)
    }
    return '---'
  }

  // 新增：当用户修改 Result 时，清空对应的 m1、m2
  function onTestDensityResultChange(idx) {
    const val = testDensityResults.value[idx]
    if (val != null && val > 0) {
      // 标记为手动输入
      testDensityManual.value[idx] = true
      // 清空对应的 m1、m2
      testDensityM1.value[idx] = null
      testDensityM2.value[idx] = null
      ElMessage.success(`Specimen ${idx === 0 ? 'A' : 'B'} density set manually, m₁ and m₂ cleared`)
    } else {
      // 如果清空了值，恢复自动计算模式
      testDensityManual.value[idx] = false
      testDensityResults.value[idx] = null
    }
  }

  // 新增：计算参照化合物密度的辅助函数
  function calcRefDensityResult(idx) {
    const m1 = refDensityM1.value[idx]
    const m2 = refDensityM2.value[idx]
    if (m1 != null && m2 != null && (m1 - m2) !== 0) {
      return (m1 / (m1 - m2)).toFixed(4)
    }
    return '---'
  }

  function calcVolLossResult(row) {
    if (row.beforeWeight != null && row.afterWeight != null && m1Constant.value != null && m2Constant.value != null) {
      const deltaMt = row.beforeWeight - row.afterWeight
      const deltaMr = 200
      if (deltaMt > 0 && m2Constant.value > 0 && deltaMr > 0) {
        const result = (deltaMt * m1Constant.value) / (m2Constant.value * deltaMr)
        return result.toFixed(4)
      }
    }
    return '---'
  }

  const arIndexData = computed(() => {
    return abrasionRows.map((row, index) => {
      const massLossMg = row.massLoss != null ? row.massLoss * 1000 : null
      const density = avgTestDensity.value
      const refLoss = 200 // mg
      const refDensity = 1.15 // g/cm³

      let arIndex = null
      if (massLossMg != null && density != null && massLossMg > 0) {
        arIndex = (refLoss * density) / (massLossMg * refDensity) * 100
      }

      return {
        specimen: `Specimen ${index + 1}`,
        massLossMg: massLossMg,
        density: density,
        arIndex: arIndex
      }
    })
  })

  const avgARIndexValue = computed(() => {
    const valid = arIndexData.value
      .map(d => d.arIndex)
      .filter(v => v != null && !isNaN(v))
    if (valid.length === 0) return null
    return valid.reduce((a, b) => a + b, 0) / valid.length
  })


  watch(() => densityA.airWeight, () => calculateDensity(densityA))
  watch(() => densityA.waterWeight, () => calculateDensity(densityA))
  watch(() => densityB.airWeight, () => calculateDensity(densityB))
  watch(() => densityB.waterWeight, () => calculateDensity(densityB))

  const avgDensity = computed(() => {
    const valid = [densityA.density, densityB.density].filter(d => d != null && d > 0)
    if (valid.length === 0) return null
    return valid.reduce((a, b) => a + b, 0) / valid.length
  })

  // ---- Abrasion Data ----
  const testMode = ref('full')
  const referenceRubber = ref('stdA')
  const referenceLoss = ref(200)

  // Abrasion rows: 3 specimens
  const abrasionRows = reactive([
    { id: 1, specimen: 'Specimen 1', testPoint: '', beforeWeight: null, afterWeight: null, massLoss: null, volLoss: null, arIndex: null },
    { id: 2, specimen: 'Specimen 2', testPoint: '', beforeWeight: null, afterWeight: null, massLoss: null, volLoss: null, arIndex: null },
    { id: 3, specimen: 'Specimen 3', testPoint: '', beforeWeight: null, afterWeight: null, massLoss: null, volLoss: null, arIndex: null }
  ])

  // ---- Calculation display toggles and fields ----
  const showDensityCalc = ref(true)
  const abrasionDistanceSelected = ref('full')
  const showVolumeLossCalc = ref(true)
  const showRefDensityCalc = ref(false)
  const refDensityM1 = ref([null, null, null])
  const refDensityM2 = ref([null, null, null])

  const testDensityM1 = ref([null, null])
  const testDensityM2 = ref([null, null])
  const showARIndexCalc = ref(false)

  // Density reading fields (balance readings) for the table
  const densityReadingA = ref(null)
  const densityReadingB = ref(null)

  const densityAverageDisplay = computed(() => {
    const a = densityReadingA.value
    const b = densityReadingB.value
    if ((a == null || isNaN(a)) && (b == null || isNaN(b))) return '---'
    const vals = [a, b].filter(v => v != null && !isNaN(v))
    if (!vals.length) return '---'
    const avg = vals.reduce((x, y) => x + y, 0) / vals.length
    return avg.toFixed(4)
  })

  // ---- 焦点追踪 ----
  const activeInput = ref(null)

  // ---- onInputFocus：记录焦点位置 ----
  function onInputFocus(areaOrIdx, fieldOrIdx) {
    if (typeof areaOrIdx === 'string') {
      if (areaOrIdx === 'testDensityM1' || areaOrIdx === 'testDensityM2' ||
        areaOrIdx === 'refDensityM1' || areaOrIdx === 'refDensityM2') {
        activeInput.value = {
          area: areaOrIdx,
          idx: fieldOrIdx
        }
      } else if (areaOrIdx === 'densityA' || areaOrIdx === 'densityB') {
        activeInput.value = {
          area: 'density',
          field: areaOrIdx
        }
      } else {
        activeInput.value = {
          area: areaOrIdx,
          idx: fieldOrIdx
        }
      }
    } else if (typeof areaOrIdx === 'number') {
      activeInput.value = {
        area: 'abrasion',
        idx: areaOrIdx,
        field: fieldOrIdx
      }
    } else {
      activeInput.value = null
    }
  }

  // ---- Abrasion distance change handler ----
  function onAbrasionDistanceChange() {
    // 重新计算所有已有数据的试样
    abrasionRows.forEach(row => {
      if (row.beforeWeight != null && row.afterWeight != null) {
        calculateAbrasion(row)
      }
    })
    ElMessage.info(`Abrasion distance changed to: ${abrasionDistanceSelected.value}`)
  }

  // ---- fillWeightTarget ----
  function fillWeightTarget(w) {
    if (w == null || isNaN(w)) return false
    const val = Number(w)

    if (activeInput.value) {
      const t = activeInput.value

      if (t.area === 'testDensityM1' && t.idx !== undefined) {
        testDensityM1.value[t.idx] = val
        ElMessage.success(`Recorded to Test Density m₁ - Specimen ${t.idx === 0 ? 'A' : 'B'}`)
        return true
      }
      if (t.area === 'testDensityM2' && t.idx !== undefined) {
        testDensityM2.value[t.idx] = val
        ElMessage.success(`Recorded to Test Density m₂ - Specimen ${t.idx === 0 ? 'A' : 'B'}`)
        return true
      }
      if (t.area === 'refDensityM1' && t.idx !== undefined) {
        refDensityM1.value[t.idx] = val
        ElMessage.success(`Recorded to Reference Density m₁ - Specimen ${t.idx === 0 ? 'A' : 'B'}`)
        return true
      }
      if (t.area === 'refDensityM2' && t.idx !== undefined) {
        refDensityM2.value[t.idx] = val
        ElMessage.success(`Recorded to Reference Density m₂ - Specimen ${t.idx === 0 ? 'A' : 'B'}`)
        return true
      }

      if (t.area === 'abrasion' && t.idx !== undefined && t.field) {
        const row = abrasionRows[t.idx]
        if (row) {
          if (t.field === 'before') {
            row.beforeWeight = val
            calculateAbrasion(row)
            ElMessage.success(`Recorded to ${row.specimen} W₁`)
            return true
          } else if (t.field === 'after') {
            row.afterWeight = val
            calculateAbrasion(row)
            ElMessage.success(`Recorded to ${row.specimen} W₂`)
            return true
          }
        }
        return false
      }

      if (t.area === 'density') {
        if (t.field === 'densityA') {
          densityReadingA.value = val
          densityA.airWeight = val
          ElMessage.success('Recorded to Specimen A (Test Density)')
          return true
        } else if (t.field === 'densityB') {
          densityReadingB.value = val
          densityB.airWeight = val
          ElMessage.success('Recorded to Specimen B (Test Density)')
          return true
        }
        return false
      }
    }

    // 顺序填充
    const fillTargets = []

    if (showDensityCalc.value) {
      for (let i = 0; i < 2; i++) {
        if (testDensityM1.value[i] == null) {
          fillTargets.push({
            set: () => { testDensityM1.value[i] = val },
            msg: `Test Density m₁ - Specimen ${i === 0 ? 'A' : 'B'}`
          })
          break
        }
        if (testDensityM2.value[i] == null) {
          fillTargets.push({
            set: () => { testDensityM2.value[i] = val },
            msg: `Test Density m₂ - Specimen ${i === 0 ? 'A' : 'B'}`
          })
          break
        }
      }
    }

    if (fillTargets.length === 0 && showVolumeLossCalc.value) {
      for (let i = 0; i < abrasionRows.length; i++) {
        if (abrasionRows[i].beforeWeight == null) {
          fillTargets.push({
            set: () => {
              abrasionRows[i].beforeWeight = val
              calculateAbrasion(abrasionRows[i])
            },
            msg: `${abrasionRows[i].specimen} W₁`
          })
          break
        }
        if (abrasionRows[i].afterWeight == null) {
          fillTargets.push({
            set: () => {
              abrasionRows[i].afterWeight = val
              calculateAbrasion(abrasionRows[i])
            },
            msg: `${abrasionRows[i].specimen} W₂`
          })
          break
        }
      }
    }

    if (fillTargets.length === 0 && showRefDensityCalc.value) {
      for (let i = 0; i < 2; i++) {
        if (refDensityM1.value[i] == null) {
          fillTargets.push({
            set: () => { refDensityM1.value[i] = val },
            msg: `Reference Density m₁ - Specimen ${i === 0 ? 'A' : 'B'}`
          })
          break
        }
        if (refDensityM2.value[i] == null) {
          fillTargets.push({
            set: () => { refDensityM2.value[i] = val },
            msg: `Reference Density m₂ - Specimen ${i === 0 ? 'A' : 'B'}`
          })
          break
        }
      }
    }

    if (fillTargets.length > 0) {
      const target = fillTargets[0]
      target.set()
      ElMessage.success(`Recorded to ${target.msg}`)
      return true
    }

    ElMessage.warning('All input fields are already filled')
    return false
  }

  // 监听 showARIndexCalc 变化，当 checkbox 被勾选时重新计算
  watch(
    () => showARIndexCalc.value,
    (newVal, oldVal) => {
      // 当 checkbox 从未选中变为选中时，重新计算所有已有数据的试样
      if (newVal === true && oldVal === false) {
        abrasionRows.forEach(row => {
          if (row.beforeWeight != null && row.afterWeight != null) {
            calculateAbrasion(row)
          }
        })
        ElMessage.info('AR Index calculation enabled, results updated')
      }
    }
  )


  // 监听所有试样的 beforeWeight 和 afterWeight 变化
  watch(
    () => abrasionRows.map(r => ({ before: r.beforeWeight, after: r.afterWeight })),
    () => {
      abrasionRows.forEach(row => {
        calculateAbrasion(row)
      })
    },
    { deep: true }
  )

  // 监听 M1/M2 常量变化，重新计算
  watch(
    () => [m1Constant.value, m2Constant.value],
    () => {
      abrasionRows.forEach(row => {
        if (row.beforeWeight != null && row.afterWeight != null) {
          calculateAbrasion(row)
        }
      })
    }
  )

  // 监听 avgTestDensity 变化，重新计算磨耗指数
  watch(
    () => avgTestDensity.value,
    () => {
      abrasionRows.forEach(row => {
        if (row.beforeWeight != null && row.afterWeight != null) {
          calculateAbrasion(row)
        }
      })
    }
  )

  watch(
    () => [testDensityM1.value[0], testDensityM2.value[0], testDensityM1.value[1], testDensityM2.value[1]],
    () => {
      for (let i = 0; i < 2; i++) {
        // 如果用户重新输入了 m1 或 m2，清除手动标记
        if (testDensityM1.value[i] != null || testDensityM2.value[i] != null) {
          testDensityManual.value[i] = false
          // 触发重新计算
          const result = calcTestDensityResult(i)
          if (result !== '---') {
            testDensityResults.value[i] = parseFloat(result)
          }
        }
      }
    },
    { deep: true }
  )


  const avgVolLoss = computed(() => {
    const vals = abrasionRows.map(r => r.volLoss).filter(v => v != null && !isNaN(v))
    if (!vals.length) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  })

  const avgARIndex = computed(() => {
    const vals = abrasionRows.map(r => r.arIndex).filter(v => v != null && !isNaN(v))
    if (!vals.length) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  })

  // Calculate abrasion parameters for a row (修正后与后端公式一致)
  function calculateAbrasion(row) {
    // 重置计算结果
    row.massLoss = null
    row.volLoss = null
    row.arIndex = null

    // 检查必要数据
    if (row.beforeWeight == null || row.afterWeight == null) return
    if (row.beforeWeight <= 0 || row.afterWeight <= 0) return
    if (m1Constant.value == null || m2Constant.value == null) return

    // 计算质量损失 (g)
    row.massLoss = row.beforeWeight - row.afterWeight
    if (row.massLoss <= 0) return

    // ========================================
    // 相对体积损失 (与后端公式一致)
    // ========================================
    const testDensity = avgTestDensity.value
    if (testDensity != null && testDensity > 0) {
      const deltaMt = row.massLoss
      const distanceFactor = getAbrasionDistanceFactor(abrasionDistanceSelected.value)
      row.volLoss = 1000 * deltaMt * 400 / (testDensity * (m1Constant.value + m2Constant.value)) * distanceFactor
      row.volLoss = Number(row.volLoss.toFixed(4))
    }

    // ========================================
    // 磨耗指数 - 只有 showARIndexCalc 为 true 时才计算
    // ========================================
    if (showARIndexCalc.value && testDensity != null && testDensity > 0) {
      const deltaMr = (m1Constant.value + m2Constant.value) / 2
      const rhoR = 1.15
      const deltaMtMg = row.massLoss * 1000

      if (deltaMtMg > 0 && rhoR > 0) {
        row.arIndex = (deltaMr * testDensity) * 100 / (deltaMtMg * rhoR)
        row.arIndex = Number(row.arIndex.toFixed(2))
      }
    }
  }

  // 获取里程系数
  function getAbrasionDistanceFactor(distance) {
    switch (distance) {
      case 'full': return 1
      case 'half': return 2
      case 'quarter': return 4
      default: return 1
    }
  }

  // ---- Table data ----
  const rows = reactive([])
  const sel = ref([])

  // ---- Record functions ----
  function recordDensity() {
    if (avgDensity.value == null || avgDensity.value <= 0) {
      ElMessage.warning('Please complete density measurement first')
      return
    }
    if (!rep4.value.trim()) {
      ElMessage.warning('Specimen serial number is required')
      return
    }
    ElMessage.success(`Density recorded: ${avgDensity.value.toFixed(2)} g/m³`)
  }

  function recordAbrasion() {
    const incomplete = abrasionRows.filter(r => r.beforeWeight == null || r.afterWeight == null)
    if (incomplete.length > 0) {
      ElMessage.warning(`Please complete all ${abrasionRows.length} specimen measurements`)
      return
    }

    if (avgDensity.value == null || avgDensity.value <= 0) {
      ElMessage.warning('Please measure density first')
      return
    }

    if (!sampleNumber.value.trim()) {
      ElMessage.warning('Please enter Sample Code')
      return
    }

    const t = new Date().toISOString()
    abrasionRows.forEach(r => {
      rows.push({
        id: crypto.randomUUID?.() ?? Math.random().toString(36),
        ri: rows.length + 1,
        reportNo: reportNo.value.trim(),
        sample: sampleNumber.value.trim(),
        specimen: r.specimen,
        testPoint: r.testPoint || point.value,
        beforeWeight: r.beforeWeight,
        afterWeight: r.afterWeight,
        massLoss: r.massLoss,
        volLoss: r.volLoss,
        arIndex: r.arIndex,
        testMode: testMode.value,
        referenceRubber: referenceRubber.value,
        referenceLoss: referenceLoss.value,
        density: avgDensity.value,
        t
      })
    })

    ElMessage.success(`Abrasion data recorded for ${abrasionRows.length} specimens`)
  }

  // ---- Combined record handler ----
  function recordResults() {
    if (weight.value != null) {
      const filled = fillWeightTarget(weight.value)
      if (filled) {
        return
      }
    } else {
      ElMessage.info('No weight reading available. Please connect to balance or enter weight manually.')
      return
    }

    const hasAbrasionData = abrasionRows.some(r => r.beforeWeight != null && r.afterWeight != null)
    if (hasAbrasionData) {
      recordAbrasion()
    } else {
      ElMessage.info('Please enter abrasion data first')
    }
  }

  // ---- Clear & Delete ----
  async function clearAll() {
    if (!rows.length && abrasionRows.every(r => r.beforeWeight == null && r.afterWeight == null)) {
      ElMessage.info('No data to clear')
      return
    }
    try {
      await ElMessageBox.confirm('Clear all data?', 'Confirm', { type: 'warning' })
      rows.splice(0)
      abrasionRows.forEach(r => {
        r.beforeWeight = null
        r.afterWeight = null
        r.massLoss = null
        r.volLoss = null
        r.arIndex = null
      })
      densityA.airWeight = null
      densityA.waterWeight = null
      densityA.density = null
      densityB.airWeight = null
      densityB.waterWeight = null
      densityB.density = null
      densityReadingA.value = null
      densityReadingB.value = null
      refDensityM1.value = [null, null, null]
      refDensityM2.value = [null, null, null]
      testDensityM1.value = [null, null]
      testDensityM2.value = [null, null]
      testDensityResults.value = [null, null]
      testDensityManual.value = [false, false]
      ElMessage.success('All data cleared')
    } catch { /* */ }
  }

  async function delSel() {
    if (!sel.value.length) return
    try {
      await ElMessageBox.confirm(`Delete ${sel.value.length} selected record(s)?`, 'Confirm', { type: 'warning' })
      const ids = new Set(sel.value.map(r => r.id))
      for (let i = rows.length - 1; i >= 0; i--) {
        if (ids.has(rows[i].id)) rows.splice(i, 1)
      }
      rows.forEach((r, i) => r.ri = i + 1)
      sel.value = []
      ElMessage.success('Deleted')
    } catch { /* */ }
  }

  // ---- Export ----
  async function doExport() {
    if (!rows.length) { ElMessage.warning('No data to export'); return }
    try {
      const XLSX = await import('xlsx')
      const map = r => ({
        '#': r.ri,
        'Report No.': r.reportNo,
        'Sample': r.sample,
        'Specimen': r.specimen,
        'Test Point': r.testPoint,
        'Before (g)': r.beforeWeight?.toFixed(4),
        'After (g)': r.afterWeight?.toFixed(4),
        'Mass Loss (g)': r.massLoss?.toFixed(4),
        'Rel. Vol. Loss (mm³)': r.volLoss?.toFixed(2),
        'AR Index': r.arIndex?.toFixed(2),
        'Test Mode': r.testMode,
        'Density (g/m³)': r.density?.toFixed(2),
        'Test Time': ts(r.t)
      })
      const ws = XLSX.utils.json_to_sheet(rows.map(map))
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Abrasion')
      XLSX.writeFile(wb, `Abrasion_${new Date().toISOString().slice(0, 10)}.xlsx`)
      ElMessage.success('Export successful')
    } catch (e) {
      ElMessage.error('Export failed: ' + e.message)
    }
  }

  // 下载报告文件
  async function downloadReport(fileName) {
    try {
      const response = await api.get(`/AbrasionResistanceReport/${encodeURIComponent(fileName)}/download`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)

      ElMessage.success(`Downloading: ${fileName}`)
    } catch (e) {
      ElMessage.error('Download failed: ' + (e.message || e))
    }
  }

  // ---- Generate Report ----
  async function generateReport() {
    const hasData = abrasionRows.some(r => r.beforeWeight != null && r.afterWeight != null)
    if (!hasData) {
      ElMessage.warning('Please complete abrasion measurements first')
      return
    }

    if (!rep4.value.trim()) {
      ElMessage.warning('Please enter Report No (4-digit sequence number)')
      return
    }

    if (!sampleNumber.value.trim()) {
      ElMessage.warning('Please enter Sample ID')
      return
    }

    try {
      const reportData = {
        reportNo: reportNumber.value,
        standard: testStandardSelected.value || '',
        methodCategory: methodCategorySelected.value || '',
        sample: sampleNumber.value.trim() || '',
        condition: conditionSelected.value || '',
        cleanMethod: cleaningMethodSelected.value || '',
        requirement: buyerLimitation.value?.toString() || '',
        remark: remarkSelected.value || '',
        m1Constant: m1Constant.value,
        m2Constant: m2Constant.value,
        abrasionDistance: abrasionDistanceSelected.value || 'full',
        testDensities: [
          {
            specimen: 'A',
            m1: testDensityManual.value[0] ? null : testDensityM1.value[0],
            m2: testDensityManual.value[0] ? null : testDensityM2.value[0],
            density: testDensityManual.value[0] ? testDensityResults.value[0] :
              (calcTestDensityResult(0) !== '---' ? parseFloat(calcTestDensityResult(0)) : null)
          },
          {
            specimen: 'B',
            m1: testDensityManual.value[1] ? null : testDensityM1.value[1],
            m2: testDensityManual.value[1] ? null : testDensityM2.value[1],
            density: testDensityManual.value[1] ? testDensityResults.value[1] :
              (calcTestDensityResult(1) !== '---' ? parseFloat(calcTestDensityResult(1)) : null)
          }
        ],
        refDensities: showRefDensityCalc.value ? [
          {
            specimen: 'A',
            m1: refDensityM1.value[0],
            m2: refDensityM2.value[0],
            density: calcRefDensityResult(0) !== '---' ? parseFloat(calcRefDensityResult(0)) : null
          },
          {
            specimen: 'B',
            m1: refDensityM1.value[1],
            m2: refDensityM2.value[1],
            density: calcRefDensityResult(1) !== '---' ? parseFloat(calcRefDensityResult(1)) : null
          }
        ] : [],
        abrasionSpecimens: abrasionRows.map((row, index) => ({
          specimenNumber: index + 1,
          beforeWeight: row.beforeWeight,
          afterWeight: row.afterWeight,
          massLoss: row.massLoss,
          volLoss: row.volLoss,
          arIndex: showARIndexCalc.value ? row.arIndex : null
        })),
        generatedAt: new Date().toISOString(),
        operator: 'Operator'
      }

      const response = await api.post('/AbrasionResistanceReport/report', reportData)

      if (response.data && response.data.isSuccess) {
        const fileName = response.data.value?.fileName || response.data.fileName

        if (fileName) {
          currentReportFileName.value = fileName

          try {
            const downloadRes = await api.get(`/AbrasionResistanceReport/${encodeURIComponent(fileName)}/download`, {
              responseType: 'blob'
            })

            const blob = new Blob([downloadRes.data], {
              type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(link.href)

            ElMessage.success({
              message: `Report generated and downloading: ${fileName}`,
              duration: 5000
            })
          } catch (dlError) {
            ElMessage.error('Report generated, but auto-download failed: ' + (dlError.message || dlError))
          }
        } else {
          ElMessage.success('Report generated successfully, but no file name returned for download.')
        }
      } else {
        ElMessage.error(response.data?.message || 'Report generation failed')
      }
    } catch (e) {
      ElMessage.error('Report generation failed: ' + (e.message || e))
    }
  }

  // ---- Print ----
  function doPrint() {
    if (currentReportFileName.value) {
      downloadReport(currentReportFileName.value)
    } else {
      window.print()
    }
  }

  // ---- Utility ----
  function ts(s) {
    if (!s) return '-'
    const d = new Date(s)
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  }
  function p(n) { return String(n).padStart(2, '0') }

  // ---- Serial functions ----
  const sleep = ms => new Promise(r => setTimeout(r, ms))

  function matchWeight(line) {
    const brand = SCALE_BRANDS[scaleBrand.value]
    return brand && typeof brand.parse === 'function' ? brand.parse(line) : null
  }

  async function _open(port, baud) {
    const brand = SCALE_BRANDS[scaleBrand.value]
    const cfgs = brand.cfgs.map(c => ({ baudRate: baud, ...c }))
    let lastErr
    for (const c of cfgs) {
      try { await port.open(c); return c }
      catch (e) { lastErr = e; try { await port.close() } catch (_) { } }
    }
    throw lastErr || new Error('Unable to open port')
  }

  async function _applySignals(port) {
    const brand = SCALE_BRANDS[scaleBrand.value]
    if (brand.signals === 'edge') {
      try { await port.setSignals({ dataTerminalReady: false, requestToSend: false }) } catch (_) { }
      await sleep(120)
      try { await port.setSignals({ dataTerminalReady: true, requestToSend: true }) } catch (_) { }
    } else if (brand.signals === 'high') {
      try { await port.setSignals({ dataTerminalReady: true, requestToSend: true }) } catch (_) { }
    }
  }

  async function _close(port) {
    await stopLoop()
    if (!port) return
    try { await port.setSignals({ dataTerminalReady: false, requestToSend: false }) } catch (_) { }
    await sleep(100)
    try { await port.close() } catch (_) { }
  }

  let stopFn = null
  let activeReader = null
  let loopDone = Promise.resolve()
  let recoverCount = 0

  function startLoop() {
    stopLoop()
    const p = portObj.value
    let stopped = false
    stopFn = () => { stopped = true }
    let resolve
    loopDone = new Promise(r => { resolve = r })
      ; (async () => {
        let reader
        try { reader = p.readable.getReader() } catch (_) { resolve?.(); return }
        activeReader = reader
        let buf = ''
        try {
          while (!stopped) {
            const { value, done } = await reader.read()
            if (done || stopped) break
            if (value && value.length) {
              lastRxTime.value = Date.now()
              if (portCfg.value && portCfg.value.dataBits === 7) {
                for (let i = 0; i < value.length; i++) value[i] &= 0x7F
              }
              const dec = new TextDecoder().decode(value)
              buf += dec
              const parts = buf.split(/\r?\n|\r/)
              buf = parts.pop() || ''
              for (const part of parts) {
                const w = matchWeight(part)
                if (w != null) weight.value = w
              }
            }
          }
        } catch (_) {
          if (!stopped) recover()
        } finally {
          try { reader.releaseLock() } catch (_) { }
          if (activeReader === reader) activeReader = null
          resolve?.()
        }
      })()
  }

  async function stopLoop() {
    if (stopFn) { stopFn(); stopFn = null }
    if (activeReader) {
      const r = activeReader
      try { r.cancel().catch(() => { }) } catch (_) { }
    }
    await loopDone
  }

  async function recover() {
    const p = portObj.value
    if (!p) return
    if (recoverCount >= 3) { connected.value = false; portObj.value = null; ElMessage.error('Auto-reconnect failed (max 3 attempts)'); return }
    recoverCount++
    await stopLoop()
    try { await _close(p) } catch (_) { }
    await sleep(300)
    try {
      await p.open(portCfg.value)
      await _applySignals(p)
      startLoop()
    } catch (e) {
      connected.value = false; portObj.value = null
      ElMessage.error('Auto-reconnect failed: ' + e.message)
    }
  }

  async function connect() {
    if (!('serial' in navigator)) { ElMessage.error('Please use Chrome/Edge browser'); return }
    connecting.value = true
    try {
      const p = await navigator.serial.requestPort()
      const cfg = await _open(p, baudRate.value)
      cfgInfo.value = SCALE_BRANDS[scaleBrand.value].label + ' | ' + cfg.baudRate + ' ' + cfg.dataBits + cfg.parity.charAt(0) + cfg.stopBits + (cfg.flowControl ? ' hw' : '')
      portObj.value = p
      portCfg.value = cfg
      connected.value = true
      recoverCount = 0
      await _applySignals(p)
      startLoop()
      ElMessage.success('Connected to ' + SCALE_BRANDS[scaleBrand.value].label)
    } catch (e) {
      if (e.name !== 'AbortError') ElMessage.error(e.message || 'Connection failed')
    } finally { connecting.value = false }
  }

  function onBrandChange() {
    baudRate.value = SCALE_BRANDS[scaleBrand.value].defaultBaud
    cfgInfo.value = ''
    portCfg.value = null
  }

  async function disconnect() {
    await _close(portObj.value)
    portObj.value = null
    connected.value = false
    weight.value = null
    ElMessage.info('Disconnected')
  }

  function data4Blur() {
    if (!rep4.value) return
    if (!/^\d+$/.test(rep4.value)) {
      rep4.value = ''
      ElMessage.warning('序号请输入纯数字')
      return
    }
    rep4.value = String(Number(rep4.value))
    if (rep4.value.length < 4) rep4.value = rep4.value.padStart(4, '0')
  }

  const onPortDisconnect = (e) => {
    if (portObj.value && e.port === portObj.value) {
      stopLoop(); connected.value = false; portObj.value = null; weight.value = null
      ElMessage.warning('Device removed')
    }
  }
  if (navigator.serial) navigator.serial.addEventListener('disconnect', onPortDisconnect)

  onBeforeUnmount(() => {
    navigator.serial?.removeEventListener('disconnect', onPortDisconnect)
    _close(portObj.value).catch(() => { })
    portObj.value = null
  })
</script>

<style scoped>
  * {
    box-sizing: border-box;
  }

  .allContainer {
    padding: 14px;
    box-sizing: border-box;
    height: 100%;
    background: linear-gradient(135deg, #f5f7fa 0%, #eef1f6 100%);
  }

  .main {
    display: flex;
    width: 100%;
    height: 100%;
    gap: 12px;
    box-sizing: border-box;
    min-width: 0;
  }

  .left-panel {
    width: 20%;
    min-width: 200px;
    max-width: 280px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    flex-shrink: 0;
    box-sizing: border-box;
  }

    .left-panel .card {
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }

  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    overflow: hidden;
  }

  .right-top {
    height: 23%;
    min-height: 90px;
    overflow: auto;
  }

  .right-bottom {
    height: 77%;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  .card {
    background: #fff;
    border: 1px solid #e6e8eb;
    border-radius: 10px;
    padding: 10px 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,.04);
    box-sizing: border-box;
    width: 100%;
  }

  .ctitle {
    font-size: 13px;
    font-weight: 600;
    color: #2b3a4a;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

    .ctitle .el-icon {
      color: #409eff;
    }

  .field-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 8px;
    width: 100%;
  }

    .field-row:last-child {
      margin-bottom: 0;
    }

    .field-row .lbl {
      font-size: 11px;
      color: #666;
      font-weight: 500;
    }

  .full-width {
    width: 100% !important;
  }

    .full-width :deep(.el-input__wrapper) {
      width: 100% !important;
    }

    .full-width :deep(.el-select) {
      width: 100% !important;
    }

    .full-width :deep(.el-input-number) {
      width: 100% !important;
    }

  .btn-row {
    display: flex;
    gap: 6px;
    width: 100%;
    margin-bottom: 6px;
  }

    .btn-row .btn-half {
      flex: 1;
      min-width: 0;
      padding: 6px 4px;
      font-size: 12px;
    }

      .btn-row .btn-half .el-icon {
        margin-right: 2px;
        font-size: 14px;
      }

  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 12px;
  }

    .btn-group .full-width {
      width: 100% !important;
      margin: 0;
      font-size: 13px;
      padding: 8px 0;
    }

      .btn-group .full-width .el-icon {
        margin-right: 4px;
      }

  .status-text {
    font-size: 11px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    word-break: break-all;
    line-height: 1.4;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #c0c4cc;
    transition: all .2s;
    flex-shrink: 0;
  }

    .dot.on {
      background: #67c23a;
      box-shadow: 0 0 4px #67c23a;
    }

  .wtbox {
    padding: 10px;
    border-radius: 8px;
    text-align: center;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fdf6ec;
    border: 1px dashed #e6a23c;
    transition: all .25s;
    width: 100%;
    box-sizing: border-box;
  }

    .wtbox.live {
      background: #f0f9eb;
      border: 2px solid #67c23a;
    }

  .wtval {
    font-size: 26px;
    font-weight: 700;
    font-family: 'Consolas', monospace;
    color: #1f3d2b;
  }

  .field {
    font-size: 12px;
    color: #444;
    display: flex;
    align-items: center;
    gap: 3px;
    white-space: nowrap;
  }

    .field .el-input,
    .field .el-select,
    .field .el-input-number {
      flex-shrink: 0;
    }

  .tbl-wrap {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

    .tbl-wrap :deep(.el-table) {
      height: 100%;
    }

    .tbl-wrap :deep(.el-table__inner-wrapper) {
      height: 100%;
    }

    .tbl-wrap :deep(.el-table__body-wrapper) {
      height: calc(100% - 40px);
      overflow-y: auto;
    }

  @media (max-width: 900px) {
    .left-panel {
      min-width: 160px;
      max-width: 220px;
    }
  }

  @media (max-width: 700px) {
    .main {
      flex-direction: column;
    }

    .left-panel {
      width: 100%;
      max-width: none;
      min-width: 0;
      flex-direction: row;
      flex-wrap: wrap;
    }

      .left-panel .card {
        flex: 1;
        min-width: 180px;
      }

    .right-panel {
      flex: 1;
    }
  }
</style>
