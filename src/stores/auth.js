import { defineStore } from 'pinia';
import axios from '@/axios'

export async function refreshTokens(refreshToken) {
  const { data } = await axios.post('/auth/refresh', refreshToken)
  return data // { accessToken, refreshToken }
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

const userAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    user: localStorage.getItem('user') || '',
    isLoggedIn: !!localStorage.getItem('accessToken'),
    id: localStorage.getItem('id') || '',
    logoutTimer: null
  }),
  actions: {
    setTokens(accessToken, refreshToken, user,id) {
      this.clearTokens();
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.user = user;
      this.id=id;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', user);
      localStorage.setItem('id', id);
      this.isLoggedIn = true;
      this.scheduleRefresh();
    },
    clearTokens() {
      this.accessToken = '';
      this.refreshToken = '';
      this.user = '';
      this.id= '';
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('id');
      this.isLoggedIn = false;
      if (this.logoutTimer) {
        clearTimeout(this.logoutTimer)
        this.logoutTimer = null
      }
    },
    scheduleRefresh() {
      const decoded = parseJwt(this.accessToken)
      if (!decoded) return

      // 提前 60 秒刷新
      const refreshIn = decoded.exp * 1000 - Date.now() - 58_000
      if (refreshIn <= 0) {
        this.doRefresh()
        return
      }
      this.logoutTimer = setTimeout(() => this.doRefresh(), refreshIn)
    },

    async doRefresh() {
      try {
        const newTokens = await refreshTokens(this.refreshToken)
        this.setTokens(newTokens.accessToken, newTokens.refreshToken,this.user,this.id)
      } catch(e){
        console.log('doRefreshError:'+e)
        this.logout()
      }
    },

    logout() {
      this.clearTokens()
      // 建议在外部路由守卫里统一跳转
    },
    init() {
      if (this.accessToken) this.scheduleRefresh()
    }
  }
});

export default userAuthStore;
