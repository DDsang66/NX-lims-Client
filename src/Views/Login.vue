<template>
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
            </form>




            <!--Register-->
            <form v-else-if="currentMode === 'signup'" @submit.prevent="handleSignup">
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
            </form>



            <!--Pwd Reset-->
            <form v-else @submit.prevent="handleForgot">
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

  const request = inject('request');
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
      const { tokens, user,id } = response.data;
      console.log('Login Succeed:', user);
      const { accessToken, refreshToken } = tokens;
      localStorage.setItem('accessToken', accessToken);   // 用于请求
      localStorage.setItem('refreshToken', refreshToken); // 续用
      localStorage.setItem('user', user);
      localStorage.setItem('id', id)

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
</style>
