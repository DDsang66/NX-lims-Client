<template>
  <div class="right-panel">
    <div class="display-card">
      <div class="card-header">
        <span class="header-title">Fiber Analysis Data Area</span>
      </div>

      <div class="preview-content">
        <!-- OnlyOffice Word 查看器容器 -->
        <div v-if="documentUrl" id="onlyoffice-word-preview" class="onlyoffice-container"></div>

        <!-- 无文档时的提示 -->
        <div v-else class="no-document">
          <el-empty description="No file to preview" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref, watch, onBeforeUnmount, onMounted, nextTick } from 'vue'
  import { Document, Menu } from '@element-plus/icons-vue'
  import loadOnlyOfficeScript from '@/utils/loadOnlyOffice.js'


  const props = defineProps({
    form: {
      type: Object,
      required: true
    },
    // 文档URL，用于OnlyOffice预览
    documentUrl: {
      type: String,
      default: 'http://192.168.128.8:5051/api/fiber/get-docxUrl'
    },
    // 文档标题
    documentTitle: {
      type: String,
      default: '预览文档.docx'
    }
  })

  const wordEditor = ref(null)

  const hasData = computed(() => {
    return props.form.reportNumber || props.form.menuName.length > 0
  })

  const menuDisplay = computed(() => {
    if (props.form.menuName.length === 0) return ''
    return props.form.menuName.join(', ')
  })

  // 生成文档唯一key（用于缓存控制）
  function generateDocumentKey(url) {
    if (!url) return ''
    return 'doc_' + btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)
  }

  // 初始化 Word 预览
  async function initWordPreview() {
    if (!props.documentUrl) return

    // 如果已有实例，先销毁
    if (wordEditor.value) {
      wordEditor.value.destroyEditor()
      wordEditor.value = null
    }


    const docKey = generateDocumentKey(props.documentUrl)

    const config = {
      style: { height: '100%', width: '100%' },
      document: {
        title: props.documentTitle,
        url: props.documentUrl,
        fileType: 'docx',
        key: docKey,
        permissions: {
          edit: true,
          download: true
        }
      },
      documentType: 'word',
      editorConfig: {
        mode: 'edit',
        lang: 'en',
        customization: {
          uiTheme: 'theme-dark', 
          chat: false,
          comments: false,
          feedback: false,
          forcesave: false,
          autosave: false
        }
      },
      events: {
        onDocumentReady: function () {
          console.log('Word document is ready for viewing')
        },
        onError: function (event) {
          console.error('Word viewer error:', event)
        }
      }
    }

    wordEditor.value = new DocsAPI.DocEditor('onlyoffice-word-preview', config)
  }

  // 监听 documentUrl 变化，自动加载
  watch(() => props.documentUrl, (newUrl) => {
    if (newUrl) {
      initWordPreview()
    } else {
      // URL 为空时销毁编辑器
      if (wordEditor.value) {
        wordEditor.value.destroyEditor()
        wordEditor.value = null
      }
    }
  }/*, { immediate: true }*/)

  onMounted(async () => {
    try {
      // 1. 关键：先等待脚本加载完成
      await loadOnlyOfficeScript()

      // 2. 等待 DOM 渲染完成
      await nextTick()

      // 3. 安全初始化
      initWordPreview()
    } catch (error) {
      console.error('初始化失败:', error)
    }
  })


  onBeforeUnmount(() => {
    if (wordEditor.value) {
      wordEditor.value.destroyEditor()
      wordEditor.value = null
    }
  })
</script>

<style scoped lang="scss">
  .right-panel {
    width: 60%;
  }

  .display-card {
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    overflow: hidden;
    height: 100%;
    min-height: 500px;
    display: flex;
    flex-direction: column;
  }

  .card-header {
    padding: 16px 20px;
    background: #409eff;
    color: white;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 600;
    height: 56px;
    box-sizing: border-box;
    border-bottom: 1px solid #409eff;
  }

  .header-title {
    flex: 1;
  }

  .preview-content {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  // OnlyOffice 容器样式
  .onlyoffice-container {
    flex: 1;
    width: 100%;
    height: 100%;
    min-height: 400px;
  }

  // 无文档提示样式
  .no-document {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    transition: all 0.2s ease;
  }

  .info-item:hover {
    border-color: #409eff;
  }

  .info-item.active {
    background: #ecf5ff;
    border-color: #409eff;
    border-left: 3px solid #409eff;
  }

  .info-label {
    width: 140px;
    font-size: 14px;
    font-weight: 600;
    color: #606266;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .label-icon {
    font-size: 16px;
    color: #409eff;
  }

  .info-value {
    flex: 1;
    font-size: 14px;
    color: #303133;
    word-break: break-all;
    line-height: 1.5;
  }

  .info-item.active .info-value {
    font-weight: 500;
  }
</style>



