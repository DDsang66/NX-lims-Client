<template>
  <div class="handwriting-container">
    <div class="handwriting-header">
      <span class="title">✍️ 手写输入</span>
      <div class="toolbar">
        <el-button size="small" @click="clearCanvas" :disabled="!hasStroke">
          <el-icon><Delete /></el-icon> 清除
        </el-button>
        <el-button size="small" type="primary" @click="recognize" :disabled="!hasStroke">
          <el-icon><Search /></el-icon> 识别
        </el-button>
      </div>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef"
              @pointerdown="startDrawing"
              @pointermove="draw"
              @pointerup="stopDrawing"
              @pointerleave="stopDrawing"></canvas>
      <div v-if="recognizing" class="recognizing-overlay">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>识别中...</span>
      </div>
    </div>

    <!-- 候选词显示 -->
    <div v-if="candidates.length > 0" class="candidates">
      <span class="candidates-label">候选词：</span>
      <el-tag v-for="(candidate, index) in candidates"
              :key="index"
              :type="index === 0 ? 'primary' : ''"
              @click="selectCandidate(candidate)"
              class="candidate-tag">
        {{ candidate }}
      </el-tag>
    </div>

    <!-- 状态提示 -->
    <div class="status-bar">
      <span>{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Delete, Search, Loading } from '@element-plus/icons-vue'

  // 事件：当识别结果被确认时触发
  const emit = defineEmits(['input'])

  const canvasRef = ref(null)
  let ctx = null
  let isDrawing = ref(false)
  let hasStroke = ref(false)
  let recognizing = ref(false)
  let candidates = ref([])

  // 绘画相关变量
  let lastX = 0
  let lastY = 0
  let points = [] // 存储笔画点 {x, y, t}

  // 状态文本
  const statusText = ref('请在上方区域手写输入')

  // 初始化Canvas
  onMounted(() => {
    const canvas = canvasRef.value
    ctx = canvas.getContext('2d')
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCanvas)
  })

  function resizeCanvas() {
    const container = canvasRef.value.parentElement
    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvasRef.value.width = rect.width * dpr
    canvasRef.value.height = rect.height * dpr
    canvasRef.value.style.width = rect.width + 'px'
    canvasRef.value.style.height = rect.height + 'px'

    ctx.scale(dpr, dpr)
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#2c3e50'
  }

  // 绘画方法
  function startDrawing(e) {
    const rect = canvasRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    isDrawing.value = true
    hasStroke.value = true
    lastX = x
    lastY = y

    // 开始新笔画
    points.push({ x, y, t: Date.now() })

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function draw(e) {
    if (!isDrawing.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    points.push({ x, y, t: Date.now() })

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function stopDrawing() {
    if (isDrawing.value) {
      isDrawing.value = false
      // 如果笔画太短，可能是误触
      if (points.length < 3) {
        clearCanvas()
        return
      }
      statusText.value = '已输入，点击"识别"按钮或等待自动识别'

      // 自动识别（防抖）
      clearTimeout(window.recognizeTimeout)
      window.recognizeTimeout = setTimeout(() => {
        if (points.length > 0) {
          recognize()
        }
      }, 1500)
    }
  }

  function clearCanvas() {
    const rect = canvasRef.value.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    hasStroke.value = false
    points = []
    candidates.value = []
    statusText.value = '请在上方区域手写输入'
    clearTimeout(window.recognizeTimeout)
  }

  // 识别方法 - 使用浏览器原生API
  async function recognize() {
    if (!hasStroke.value || points.length < 3) {
      ElMessage.warning('请先手写内容')
      return
    }

    // 检查浏览器是否支持手写识别
    if (!('handwriting' in navigator)) {
      // 降级方案：模拟识别（实际项目中可以接入第三方API）
      ElMessage.warning('当前浏览器不支持手写识别，请使用Chrome浏览器')
      // 模拟识别结果
      candidates.value = ['测试', '手写', '输入']
      statusText.value = '请点击候选词插入到当前光标位置'
      return
    }

    recognizing.value = true
    statusText.value = '正在识别...'

    try {
      // 准备笔画数据
      const strokes = convertPointsToStrokes(points)

      // 创建手写识别器
      const recognizer = new navigator.handwriting.HandwritingRecognizer({
        language: 'zh-Hans',
        // 或者使用 'en' 识别英文
      })

      // 等待识别器准备就绪
      await recognizer.ready

      // 执行识别
      const result = await recognizer.recognize({
        strokes: strokes,
        // 可以设置候选词数量
        maxCandidates: 5
      })

      // 处理识别结果
      if (result && result.length > 0) {
        candidates.value = result.map(item => item.text)
        statusText.value = '识别完成，请点击候选词插入到当前光标位置'
        ElMessage.success('识别成功！')
      } else {
        candidates.value = []
        statusText.value = '未识别到内容，请重新手写'
        ElMessage.warning('未识别到有效内容')
      }

    } catch (error) {
      console.error('识别失败:', error)
      ElMessage.error('识别失败：' + error.message)
      statusText.value = '识别失败，请重试'
    } finally {
      recognizing.value = false
    }
  }

  // 将点转换为笔画数据
  function convertPointsToStrokes(points) {
    // 简化为一个笔画（手写通常是一个连续的笔画）
    const stroke = {
      points: points.map(p => ({ x: p.x, y: p.y }))
    }
    return [stroke]
  }

  // 选择候选词并插入到当前光标位置
  function selectCandidate(candidate) {
    // 触发input事件，将候选词传递给父组件
    emit('input', candidate)

    // 清除手写板，准备下一次输入
    clearCanvas()
    candidates.value = []
    statusText.value = `已插入 "${candidate}"，可以继续手写`
    ElMessage.success(`已插入 "${candidate}"`)
  }

  // 暴露方法给父组件
  defineExpose({
    clearCanvas,
    recognize
  })
</script>

<style scoped>
  .handwriting-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
  }

  .handwriting-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #ebeef5;
    background: #fafafa;
  }

  .title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .toolbar {
    display: flex;
    gap: 6px;
  }

  .canvas-wrapper {
    flex: 1;
    position: relative;
    background: #fafafa;
    cursor: crosshair;
    min-height: 150px;
  }

    .canvas-wrapper canvas {
      width: 100%;
      height: 100%;
      display: block;
      touch-action: none;
    }

  .recognizing-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 16px;
    color: #409eff;
  }

    .recognizing-overlay .el-icon {
      font-size: 32px;
    }

  .candidates {
    padding: 8px 12px;
    border-top: 1px solid #ebeef5;
    background: #fafafa;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-height: 44px;
  }

  .candidates-label {
    font-size: 13px;
    color: #606266;
    margin-right: 4px;
  }

  .candidate-tag {
    cursor: pointer;
    transition: all 0.2s;
  }

    .candidate-tag:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
    }

  .status-bar {
    padding: 4px 12px;
    background: #f5f7fa;
    border-top: 1px solid #ebeef5;
    font-size: 12px;
    color: #909399;
    text-align: center;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
