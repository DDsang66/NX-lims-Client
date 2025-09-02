import axios from 'axios';
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: 'http://localhost:5051/api',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

// 请求拦截器：自动带上 Access Token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          // 2️⃣ 改为纯文本
          const { data } = await axios.post(
            'http://localhost:5051/api/refresh',
            refreshToken,
            { headers: { 'Content-Type': 'text/plain' } }
          )
          // 3️⃣ 交给 Pinia 统一处理
          const auth = useAuthStore()
          auth.setTokens(data.accessToken, data.refreshToken)
          original.headers['Authorization'] = `Bearer ${data.accessToken}`
          return api(original)      // 重试原请求
        } catch {
          useAuthStore().logout()   // 统一登出
          router.replace('/login')
        }
      }
    }
    return Promise.reject(err)
  }
)

export default api;

