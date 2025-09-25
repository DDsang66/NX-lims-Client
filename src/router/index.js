import { createRouter, createWebHistory } from 'vue-router';

import Mango from '../views/Mango.vue';
import CrazyLine from '../views/CrazyLine.vue';
import ChatBox from '../components/AI Helper(Demo)/ChatBox.vue';
import Jako from '../views/Jako.vue';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import Profile from '../views/Profile.vue';
import OrderEntry from '../Views/OrderEntry.vue';
import FAQ from '../views/StaticInterface/FAQ.vue';
import InstructionManual from '../views/StaticInterface/InstructionManual.vue';
import MainLayout from '../views/MainLayout.vue';
import userAuthStore from "@/stores/auth.js";
import OrderSummary from "@/Views/OrderSummary.vue";

const routes = [
  {
    path: '/Login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',redirect: '/Login' // 默认路径重定向到登录页面
  },
  {
    path: '/main/Home', name: 'Home', component: Home,
  },
  {
    path: '/main/Profile', name: 'Profile', component: Profile,
  },
  {
    path: '/main/FAQ', name: 'FAQ', component: FAQ
  },
  {
    path: '/main/OrderEntry', name: 'OrderEntry', component: OrderEntry
  },
  {
    path: '/main/OrderSummary', name: 'OrderSummary', component: OrderSummary
  },
  {
    path: '/main/InstructionManual', name: 'InstructionManual', component: InstructionManual
  },
  {
    path: '/main',
    name: 'MainLayout',
    component: MainLayout,
    children: [
      { path: 'Mango', name: 'Mango', component: Mango },
      { path: 'Crazyline', name: 'CrazyLine', component: CrazyLine },
      { path: 'Jako', name: 'Jako', component: Jako },
      { path: 'ChatBox', name: 'ChatBox', component: ChatBox },
    ]
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 使用 import.meta.env.BASE_URL
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = userAuthStore();
  const isLoggedIn = authStore.isLoggedIn;

  if (!isLoggedIn && to.path !== '/Login') {
    next('/Login');
  } else if (isLoggedIn && to.path === '/Login') {
    next('/main/Home');
  } else {
    next();
  }
});

export default router;
