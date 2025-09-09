import '@/assets/css/plugins/bootstrap.min.css';
import '@/assets/css/plugins//animate.min.css';
import '@/assets/css/plugins/magnific-popup.css';
import '@/assets/css/plugins/slick.css';
import '@/assets/css/plugins/slick-theme.css';
import '@/assets/css/plugins/ion.rangeSlider.min.css';
import '@/assets/fonts/flaticon/flaticon.css';
import '@/assets/css/plugins/font-awesome.min.css';
import '@/assets/css/style.css';
import '@/assets/css/responsive.css';
import '@/assets/css/cssVariable.css'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { createPinia } from 'pinia';
import userAuthStore from '@/stores/auth.js'
import request from "@/utils/request.js";

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(ElementPlus)
//使用provide全局提供
const auth = userAuthStore()
app.provide('userAuthStore',auth)
app.provide('request',request)
auth.init()

app.mount('#mycontent');



