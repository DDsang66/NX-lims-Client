<template>
  <div class="w3l-signinform">
    <div class="wrapper">
      <div class="w3l-form-info">
        <div class="w3_info">
          <h1>Welcome Back</h1>
          <p class="sub-para">Lorem ipsum dolor sit amet, consectetur adipiscing elit ... ... ...</p>

          <form v-if="isLoginMode" @submit.prevent="handleLogin">
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
              <a href="#" class="forgot" @click.prevent="handleForgot">Forgot password?</a>
            </div>

            <button class="btn btn-primary btn-block" type="submit">Log In</button>
          </form>




          <!--Register-->
          <form v-else @submit.prevent="handleRegister">
            <h2>Register</h2>
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
            <div class="form-row bottom">
              <div class="form-check">
                <input id="remember"
                       v-model="register.remember"
                       type="checkbox"
                       name="remember" />
                <label for="remember">Remember me?</label>
              </div>
            </div>

            <button class="btn btn-primary btn-block" type="submit">Ok</button>
          </form>




          <p class="account">
            {{ isLoginMode ? "Don't have an account?" : "Already have an account?" }}
            <a href="#" @click.prevent="toggleMode">
              {{ isLoginMode ? 'Register' : 'Login' }}
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
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  import { useAuthStore } from '@/stores/auth';

  const isLoginMode = ref(true)
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
    password_again:'',
    remember: false
  })

  const toggleMode = () => (isLoginMode.value = !isLoginMode.value)


  const handleLogin = async() => {
    // 登录逻辑，例如调用接口
    try {
      const response = await axios.post('http://localhost:5051/api/auth/login', form, {
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
      authStore.setTokens(accessToken, refreshToken,reviewer);

      router.push('/main/Home');
    } catch (error)
    {
      console.error('登录失败', error);
    }
  }

  const handleForgot = () => {
    // 忘记密码逻辑
    console.log('忘记密码')
  }

  const handleRegister = async() => {
    try {
      const response = await axios.post('http://localhost:5051/api/auth/register', register, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      // 注册成功
      console.log('注册成功', response.data);
      alert('注册成功，请登录'); // 使用 alert 弹出提示
      router.push('/Login'); // 跳转到登录页面
    } catch
    {
      console.log('失败');
    }
  }
</script>

<style scoped>
  @import '@/assets/LoginPage/css/font-awesome.min.css';
  @import '@/assets/LoginPage/css/style.css';
  @import url('https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@300;400;700&display=swap');
</style>
