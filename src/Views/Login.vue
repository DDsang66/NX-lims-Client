<!--<template>
  <div class="w3l-signinform">
    <div class="wrapper">
      <div class="w3l-form-info">
        <div class="w3_info">
          <h1>Welcome Back</h1>
          <p class="sub-para">Lorem ipsum dolor sit amet, consectetur adipiscing elit ... ... ...</p>
          <transition name="fade" mode="out-in">
            <form v-if="currentMode === 'login'" @submit.prevent="handleLogin">
              <h2>Log In</h2>
              <div class="input-group">
                <span><i class="fa fa-user" aria-hidden="true"></i></span>
                <input v-model.trim="form.email"
                       type="text"
                       placeholder="Email or Username"
                       required />
              </div>

              <div class="input-group two-groop">
                <span><i class="fa fa-key" aria-hidden="true"></i></span>
                <input v-model.trim="form.password"
                       type="password"
                       placeholder="Password"
                       required />
              </div>

              <div class="form-row bottom">
                <div class="form-check">
                  <input id="remember"
                         v-model="form.remember"
                         type="checkbox"
                         name="remember" />
                  <label for="remember">Remember me?</label>
                </div>
                <a href="#" class="forgot" @click.prevent="currentMode = 'pwdreset'">Forgot password?</a>
              </div>

              <button class="btn btn-primary btn-block" type="submit">Log In</button>
            </form>-->
<!--Register-->
<!--<form v-else-if="currentMode === 'signup'" @submit.prevent="handleSignup">
  <h2>Sign Up</h2>
  <div class="input-group" style="margin-bottom:20px">
    <span><i class="fa fa-user" aria-hidden="true"></i></span>
    <input v-model.trim="register.email"
           type="text"
           placeholder="Email or Username"
           required />
  </div>
  <div class="input-group">
    <span><i class="fa fa-key" aria-hidden="true"></i></span>
    <input v-model.trim="register.password"
           type="password"
           placeholder="Password"
           required />
  </div>
  <div class="input-group two-groop">
    <span><i class="fa fa-key" aria-hidden="true"></i></span>
    <input v-model.trim="register.password_again"
           type="password"
           placeholder="Confirm Your Password Again"
           required />
  </div>

  <div class="input-group" style="margin-bottom:10px">
    <span><i class="fa fa-user" aria-hidden="true"></i></span>
    <input v-model.trim="register.nickname"
           type="text"
           placeholder="Your Real Name.."
           required />
  </div>

  <div class="input-group" style="margin-bottom:10px">
    <span><i class="fa fa-user" aria-hidden="true"></i></span>
    <input v-model.trim="register.employeeId"
           type="text"
           placeholder="Your Employee Id.."
           required />
  </div>
  <button class="btn btn-primary btn-block" type="submit">Ok</button>
</form>-->
<!--Pwd Reset-->
<!--<form v-else @submit.prevent="handleForgot">
              <h2>Password Reset</h2>
              <div class="input-group" style="margin-bottom:20px">
                <span><i class="fa fa-user" aria-hidden="true"></i></span>
                <input v-model.trim="pwdReset.authenticinfo"
                       type="text"
                       placeholder="Your Name or Username"
                       required />
              </div>
              <div class="input-group">
                <span><i class="fa fa-key" aria-hidden="true"></i></span>
                <input v-model.trim="pwdReset.newpassword"
                       type="password"
                       placeholder="Your New Password"
                       required />
              </div>
              <div class="input-group two-groop">
                <span><i class="fa fa-key" aria-hidden="true"></i></span>
                <input v-model.trim="pwdReset.newpassword_again"
                       type="password"
                       placeholder="Confirm Your New Password Again"
                       required />
              </div>
              <button class="btn btn-primary btn-block" type="submit">Ok</button>
            </form>
          </transition>



          <p class="account">
            {{ currentMode === 'login' ? "Don't have an account?" : currentMode === 'signup' ? "Already have an account?" : "Back to login?" }}
            <a href="#" @click.prevent="toggleMode">
              {{ currentMode === 'login' ? 'Sign up' : currentMode === 'signup' ? 'Login' : 'Back to login' }}
            </a>
          </p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>
        &copy; 2025 NX-lims Lab Command. All Rights Reserved |
        <a target="_blank" href="#">Learn more.</a>
      </p>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive,inject } from 'vue'
  import { useRouter } from 'vue-router'
  import {addRoleRoute} from '../router/index.js'

  const request = inject('request');
  const roleStore = inject('roleStore');
  const authStore = inject('userAuthStore');
  const currentMode = ref('login')
  const router = useRouter()
  const form = reactive({
    email: '',
    password: '',
    remember: false
  })

  const register = reactive({
    email: '',
    password: '',
    nickname: '',
    password_again: '',
    employeeId: '',
    remember: false
  })

  const pwdReset = reactive({
    authenticinfo: '',
    newpassword: '',
    newpassword_again: '',
    remember: false
  })


  const toggleMode = () => {
    if (currentMode.value === 'login') {
      currentMode.value = 'signup'
    } else if (currentMode.value === 'signup') {
      currentMode.value = 'login'
    } else {
      currentMode.value = 'login'
    }
  }


  const handleLogin = async() => {
    // 登录逻辑，例如调用接口
    try {
      const response = await request.post('/auth/login', form);
      // 在登录成功时
      const { tokens, user,id,role} = response.data;
      // console.log('Login Succeed:', user);
      const { accessToken, refreshToken } = tokens;
      localStorage.setItem('accessToken', accessToken);   // 用于请求
      localStorage.setItem('refreshToken', refreshToken); // 续用
      localStorage.setItem('user', user);
      localStorage.setItem('id', id)
      localStorage.setItem('role', role);
      console.log('routes'+roleStore.getRoutes)
      // localStorage.setItem('routes', JSON.stringify(roleStore.getRoutes))
      roleStore.setRole(role);
      addRoleRoute()
      authStore.setTokens(accessToken, refreshToken, user,id);
      form.email = '';
      form.password = '';
      router.push('/main/Home');
    } catch (error)
    {
      alert('LoginError:'+error);
    }
  }

  const handleForgot = async() => {
    try {
      if (pwdReset.newpassword !== pwdReset.newpassword_again) {
        alert('The password entered twice is inconsistent, please re-enter it.');
        return;
      }

      const response = await request.post('/auth/pwdreset', pwdReset);
      alert('Reset Succeed,please login.'); // 使用 alert 弹出提示
      currentMode.value = 'login';
    } catch
    {
      alert('Register Failed,please try again.');
    }
  }

  const handleSignup = async () => {
    try {
      if (register.password !== register.password_again) {
        alert('The password entered twice is inconsistent, please re-enter it.');
        return;
      }
      if (register.employeeId == null || register.nickname == null) {
        alert('Please check out all the input box were filled.');
        return;
      }
      const response = await request.post('/auth/register', register);
      // 注册成功
      alert('Register Succeed,please login.'); // 使用 alert 弹出提示
      currentMode.value = 'login';
    } catch
    {
      alert('Register Failed,please try again.');
    }
  }
</script>

<style scoped>
  @import '@/assets/LoginPage/css/font-awesome.min.css';
  @import '@/assets/LoginPage/css/style.css';
  @import url('https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@300;400;700&display=swap');
  .sigma_btn-custom::before {
    background-color: #18086a;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.6s;
  }

  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
</style>-->




<template>
  <div class="modern-login-container">
    <!-- 动态背景 -->
    <div class="animated-bg">
      <div v-for="n in 20" :key="n" class="bg-circle" :style="getCircleStyle(n)"></div>
    </div>

    <div class="login-wrapper">
      <!-- 左侧品牌展示区 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo">
            <el-icon size="48" color="#6366f1"><Collection /></el-icon>
          </div>
          <h1 class="brand-title">NX-LIMS</h1>
          <p class="brand-desc">Laboratory Information Management System</p>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>Smart Sample Tracking</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>Automated Workflow</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>Real-time Analytics</span>
            </div>
          </div>
        </div>
        <div class="copyrightNew">
          <p>&copy; 2025 NX-lims Lab Command. All Rights Reserved | <a href="#">Learn more</a></p>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="form-section">
        <div class="form-card">
          <!-- 顶部工具栏 -->
          <div class="form-header">
            <el-radio-group v-model="currentMode" size="large" fill="#6366f1">
              <el-radio-button label="login">Login</el-radio-button>
              <el-radio-button label="signup">Sign Up</el-radio-button>
              <el-radio-button label="pwdreset">Reset</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 登录表单 -->
          <transition name="el-fade-in-linear" mode="out-in">
            <div v-if="currentMode === 'login'" key="login" class="form-content">
              <div class="form-title">
                <h2>Welcome Back</h2>
                <p>Please sign in to continue</p>
              </div>

              <el-form @submit.prevent="handleLogin" label-position="top">
                <el-form-item label="Email or Username">
                  <el-input v-model.trim="form.email"
                            placeholder="Enter your email or username"
                            size="large"
                            clearable>
                    <template #prefix>
                      <el-icon><User /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item label="Password">
                  <el-input v-model.trim="form.password"
                            type="password"
                            placeholder="Enter your password"
                            size="large"
                            show-password
                            clearable>
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <div class="form-options">
                  <el-checkbox v-model="form.remember">Remember me</el-checkbox>
                  <el-link type="primary" @click="currentMode = 'pwdreset'" :underline="false">
                    Forgot password?
                  </el-link>
                </div>

                <el-button type="primary"
                           size="large"
                           class="submit-btn"
                           :loading="false"
                           @click="handleLogin">
                  Sign In
                </el-button>
              </el-form>

              <div class="form-footer">
                <span>Don't have an account?</span>
                <el-link type="primary" @click="currentMode = 'signup'" :underline="false">
                  Sign up now
                </el-link>
              </div>
            </div>

            <!-- 注册表单 -->
            <div v-else-if="currentMode === 'signup'" key="signup" class="form-content">
              <div class="form-title">
                <h2>Create Account</h2>
                <p>Fill in your information to register</p>
              </div>

              <el-form @submit.prevent="handleSignup" label-position="top">
                <el-form-item label="Email or Username">
                  <el-input v-model.trim="register.email"
                            placeholder="Enter your email"
                            size="large"
                            clearable>
                    <template #prefix>
                      <el-icon><Message /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="Password">
                      <el-input v-model.trim="register.password"
                                type="password"
                                placeholder="Password"
                                size="large"
                                show-password
                                clearable>
                        <template #prefix>
                          <el-icon><Lock /></el-icon>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Confirm Password">
                      <el-input v-model.trim="register.password_again"
                                type="password"
                                placeholder="Confirm"
                                size="large"
                                show-password
                                clearable>
                        <template #prefix>
                          <el-icon><Key /></el-icon>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-form-item label="Full Name">
                  <el-input v-model.trim="register.nickname"
                            placeholder="Enter your real name"
                            size="large"
                            clearable>
                    <template #prefix>
                      <el-icon><UserFilled /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item label="Employee ID">
                  <el-input v-model.trim="register.employeeId"
                            placeholder="Enter your employee ID"
                            size="large"
                            clearable>
                    <template #prefix>
                      <el-icon><Postcard /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-button type="primary"
                           size="large"
                           class="submit-btn"
                           @click="handleSignup">
                  Create Account
                </el-button>
              </el-form>

              <div class="form-footer">
                <span>Already have an account?</span>
                <el-link type="primary" @click="currentMode = 'login'" :underline="false">
                  Sign in
                </el-link>
              </div>
            </div>

            <!-- 密码重置表单 -->
            <div v-else key="pwdreset" class="form-content">
              <div class="form-title">
                <h2>Reset Password</h2>
                <p>Enter your details to reset password</p>
              </div>

              <el-form @submit.prevent="handleForgot" label-position="top">
                <el-form-item label="Username or Name">
                  <el-input v-model.trim="pwdReset.authenticinfo"
                            placeholder="Enter your name or username"
                            size="large"
                            clearable>
                    <template #prefix>
                      <el-icon><User /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item label="New Password">
                  <el-input v-model.trim="pwdReset.newpassword"
                            type="password"
                            placeholder="Enter new password"
                            size="large"
                            show-password
                            clearable>
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item label="Confirm New Password">
                  <el-input v-model.trim="pwdReset.newpassword_again"
                            type="password"
                            placeholder="Confirm new password"
                            size="large"
                            show-password
                            clearable>
                    <template #prefix>
                      <el-icon><Key /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-button type="primary"
                           size="large"
                           class="submit-btn"
                           @click="handleForgot">
                  Reset Password
                </el-button>
              </el-form>

              <div class="form-footer">
                <span>Remember your password?</span>
                <el-link type="primary" @click="currentMode = 'login'" :underline="false">
                  Back to login
                </el-link>
              </div>
            </div>
          </transition>
        </div>

        <!-- 页脚 -->
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, inject } from 'vue'
  import { useRouter } from 'vue-router'
  import { addRoleRoute } from '../router/index.js'

  const request = inject('request');
  const roleStore = inject('roleStore');
  const authStore = inject('userAuthStore');
  const currentMode = ref('login')
  const router = useRouter()
  const form = reactive({
    email: '',
    password: '',
    remember: false
  })

  const register = reactive({
    email: '',
    password: '',
    nickname: '',
    password_again: '',
    employeeId: '',
    remember: false
  })

  const pwdReset = reactive({
    authenticinfo: '',
    newpassword: '',
    newpassword_again: '',
    remember: false
  })


  const toggleMode = () => {
    if (currentMode.value === 'login') {
      currentMode.value = 'signup'
    } else if (currentMode.value === 'signup') {
      currentMode.value = 'login'
    } else {
      currentMode.value = 'login'
    }
  }


  const handleLogin = async () => {
    // 登录逻辑，例如调用接口
    try {
      const response = await request.post('/auth/login', form);
      // 在登录成功时
      const { tokens, user, id, role } = response.data;
      // console.log('Login Succeed:', user);
      const { accessToken, refreshToken } = tokens;
      localStorage.setItem('accessToken', accessToken);   // 用于请求
      localStorage.setItem('refreshToken', refreshToken); // 续用
      localStorage.setItem('user', user);
      localStorage.setItem('id', id)
      localStorage.setItem('role', role);
      console.log('routes' + roleStore.getRoutes)
      // localStorage.setItem('routes', JSON.stringify(roleStore.getRoutes))
      roleStore.setRole(role);
      addRoleRoute()
      authStore.setTokens(accessToken, refreshToken, user, id);
      form.email = '';
      form.password = '';
      router.push('/main/Home');
    } catch (error) {
      alert('LoginError:' + error);
    }
  }

  const handleForgot = async () => {
    try {
      if (pwdReset.newpassword !== pwdReset.newpassword_again) {
        alert('The password entered twice is inconsistent, please re-enter it.');
        return;
      }

      const response = await request.post('/auth/pwdreset', pwdReset);
      alert('Reset Succeed,please login.'); // 使用 alert 弹出提示
      currentMode.value = 'login';
    } catch
    {
      alert('Register Failed,please try again.');
    }
  }

  const handleSignup = async () => {
    try {
      if (register.password !== register.password_again) {
        alert('The password entered twice is inconsistent, please re-enter it.');
        return;
      }
      if (register.employeeId == null || register.nickname == null) {
        alert('Please check out all the input box were filled.');
        return;
      }
      const response = await request.post('/auth/register', register);
      // 注册成功
      alert('Register Succeed,please login.'); // 使用 alert 弹出提示
      currentMode.value = 'login';
    } catch
    {
      alert('Register Failed,please try again.');
    }
  }

  // 背景圆圈样式生成
  const getCircleStyle = (n) => {
    const size = Math.random() * 300 + 100
    const left = Math.random() * 100
    const top = Math.random() * 100
    const delay = Math.random() * 5
    const duration = Math.random() * 10 + 10
    return {
      width: `${size}px`,
      height: `${size}px`,
      left: `${left}%`,
      top: `${top}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`
    }
  }
</script>

<style scoped>
  /* 移除原样式导入，使用 Element Plus 变量 */

  .modern-login-container {
    min-height: 100vh;
    display: flex;
    background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
    position: relative;
    overflow: hidden;
  }

  /* 动态背景 */
  .animated-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
  }

  .bg-circle {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: float 15s infinite ease-in-out;
    filter: blur(40px);
  }

  @keyframes float {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }

    33% {
      transform: translate(30px, -30px) scale(1.1);
    }

    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
  }

  /* 主布局 */
  .login-wrapper {
    display: flex;
    width: 100%;
    max-width: 1200px;
    margin: auto;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    z-index: 1;
    min-height: 600px;
  }

  /* 左侧品牌区 */
  .brand-section {
    flex: 1;
    background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
    color: white;
    position: relative;
    overflow: hidden;
  }

    .brand-section::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
      animation: pulse 4s ease-in-out infinite;
    }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.5;
    }

    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }

  .brand-content {
    position: relative;
    z-index: 1;
    text-align: center;
  }

  .logo {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .brand-title {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: 2px;
  }

  .brand-desc {
    font-size: 16px;
    opacity: 0.8;
    margin-bottom: 48px;
    font-weight: 300;
  }

  .feature-list {
    text-align: left;
    display: inline-block;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    font-size: 15px;
    opacity: 0.9;
  }

    .feature-item .el-icon {
      color: #818cf8;
      font-size: 18px;
    }

  /* 右侧表单区 */
  .form-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 48px;
    background: #fafafa;
    position: relative;
  }

  .form-card {
    width: 100%;
    max-width: 400px;
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .form-header {
    display: flex;
    justify-content: center;
    margin-bottom: 32px;
  }

  :deep(.el-radio-group) {
    background: #f3f4f6;
    padding: 4px;
    border-radius: 12px;
  }

  :deep(.el-radio-button__inner) {
    border: none !important;
    background: transparent !important;
    color: #6b7280 !important;
    font-weight: 500 !important;
    padding: 10px 24px !important;
    border-radius: 8px !important;
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: #6366f1 !important;
    color: white !important;
    box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3) !important;
  }

  .form-title {
    text-align: center;
    margin-bottom: 32px;
  }

    .form-title h2 {
      font-size: 28px;
      color: #111827;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .form-title p {
      color: #6b7280;
      font-size: 14px;
    }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #374151;
    padding-bottom: 8px;
  }

  :deep(.el-input__wrapper) {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 4px 12px;
    transition: all 0.3s;
  }

  :deep(.el-input__wrapper:hover) {
    border-color: #6366f1;
  }

  :deep(.el-input__wrapper.is-focus) {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  :deep(.el-input__inner) {
    height: 44px;
    font-size: 15px;
  }

  :deep(.el-input__prefix) {
    color: #9ca3af;
    margin-right: 8px;
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 24px 0;
  }

  :deep(.el-checkbox__label) {
    color: #6b7280;
    font-size: 14px;
  }

  :deep(.el-link) {
    font-size: 14px;
    font-weight: 500;
  }

  .submit-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 10px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    transition: all 0.3s;
    margin-top: 8px;
  }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
    }

  .form-footer {
    text-align: center;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
    color: #6b7280;
    font-size: 14px;
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .copyrightNew {
    position: absolute;
    bottom: 24px;
    color: white;
    font-size: 12px;
    text-align: center;
  }

    .copyrightNew a {
      color: white;
      text-decoration: none;
    }

  /* 响应式 */
  @media (max-width: 968px) {
    .brand-section {
      display: none;
    }

    .login-wrapper {
      margin: 20px;
      min-height: auto;
    }

    .form-section {
      padding: 32px 24px;
    }

    .form-card {
      padding: 32px 24px;
    }
  }

  /* 过渡动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
