// 集中管理后端/文档服务器地址，优先使用 Vite 环境变量
export const BACKEND_BASE = import.meta.env.VITE_BACKEND_BASE || 'http://localhost:5051'
export const API_BASE = `${BACKEND_BASE}/api`
export const DOC_VIEWER = import.meta.env.VITE_DOC_VIEWER || 'http://localhost:5130'

// 便于后面扩展其他全局配置
export default {
  BACKEND_BASE,
  API_BASE,
  DOC_VIEWER
}
