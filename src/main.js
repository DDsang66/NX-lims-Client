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

import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { createPinia } from 'pinia';
const app = createApp(App);
const pinia = createPinia();
app.use(router);
app.use(pinia);

import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
auth.init()

app.mount('#mycontent');



