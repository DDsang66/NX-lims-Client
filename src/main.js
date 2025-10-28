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

import VChart from 'vue-echarts'
import 'echarts'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { createPinia } from 'pinia';
import userAuthStore from '@/stores/auth.js'
import useRoleStore from '@/stores/role.js'
import request from "@/utils/request.js";
import globalFunctions from "@/utils/globalFunctions.js";
import i18n from './i18n'

const app = createApp(App);
const pinia = createPinia();

app.component('v-chart', VChart)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router);
app.use(pinia);
app.use(ElementPlus)
app.use(i18n)
//使用provide全局提供
const auth = userAuthStore()
app.provide('roleStore',useRoleStore())
app.provide('userAuthStore',auth)
app.provide('request',request)
auth.init()
app.provide('funcs',globalFunctions)
app.mount('#mycontent');



