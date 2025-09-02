<template>
  <!-- 登录面板 -->
  <section>
    <div class="sigma_notice" >
      <p>
        Need to switch account?
        <a style="color:#3364d5" href="#" @click.prevent="toggle('login')">Click here to login.</a>
      </p>
    </div>

    <transition name="fade">
      <div v-show="open.login" class="sigma_notice-content">
        <div class="row">
          <div class="col-xl-6 form-group">
            <label>Your Username</label>
            <input v-model="login.username"
                   type="text"
                   class="form-control"
                   placeholder="Username" />
          </div>

          <div class="col-xl-6 form-group">
            <label>Password</label>
            <input v-model="login.password"
                   type="password"
                   class="form-control"
                   placeholder="Password" />
          </div>

          <div class="col-12 form-group">
            <div class="custom-control custom-checkbox">
              <input id="rememberMe"
                     v-model="login.remember"
                     type="checkbox"
                     class="custom-control-input" />
              <label class="custom-control-label" for="rememberMe">
                Remember Me
              </label>
            </div>
          </div>

          <div class="col-12">
            <button style="background-color:#3364d5"
                    class="sigma_btn-custom"
                    @click="ChangeAccount">
              Login
            </button>
          </div>
        </div>
      </div>
    </transition>
  </section>

  <!-- 反馈面板 -->
  <section>
    <div class="sigma_notice" >
      <p>
        Have any question about the system?
        <a style="color:#3364d5" href="#" @click.prevent="toggle('feedback')">Click here to feedback.</a>
      </p>
    </div>

    <transition name="fade">
      <div v-show="open.feedback" class="sigma_notice-content">
        <p>If you have any question, write it below</p>
        <div class="input-group">
          <input v-model="feedback.text"
                 type="text"
                 class="form-control"
                 placeholder="Any Suggestion" />
          <div class="input-group-append">
            <button style="background-color:#3364d5"
                    class="sigma_btn-custom shadow-none btn-sm"
                    type="button"
                    @click="submitFeedback">
              Feedback
            </button>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>

<script setup>
  import { reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  import { useAuthStore } from '@/stores/auth';
  const router = useRouter()
/* 状态：两个面板的开关 */
const open = reactive({
  login: false,
  feedback: false
})

/* 表单数据 */
const login = reactive({
  username: '',
  password: '',
  remember: false
})
const feedback = reactive({ text: '' })

/* 折叠/展开 */
function toggle(key) {
  open[key] = !open[key]
}

/* JS 钩子：精确高度，避免 max-height 1000px 抖动 */
function enter(el, done) {
  el.style.maxHeight = el.scrollHeight + 'px'
  el.addEventListener('transitionend', done, { once: true })
}
function leave(el, done) {
  el.style.maxHeight = el.scrollHeight + 'px'
  requestAnimationFrame(() => {
    el.style.maxHeight = '0'
    el.addEventListener('transitionend', done, { once: true })
  })
}

/* 业务函数（示例） */
  const ChangeAccount = async () => {
  try {
    const response = await axios.post('http://localhost:5051/api/auth/login', login, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // 在登录成功时
    const { tokens, reviewer } = response.data;
    const { accessToken, refreshToken } = tokens;
    localStorage.setItem('accessToken', accessToken);   // 用于请求
    localStorage.setItem('refreshToken', refreshToken); // 续用
    localStorage.setItem('reviewer', reviewer);
    const authStore = useAuthStore();
    authStore.setTokens(accessToken, refreshToken, reviewer);
    location.reload();
  } catch (error) {
    console.error('登录失败', error);
  }
}
function submitFeedback() {
  console.log('Feedback', feedback.text)
  feedback.text = ''
}
</script>

<style scoped>
  .sigma_btn-custom::before {
    background-color: #18086a;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.6s;
  }

  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
</style>
