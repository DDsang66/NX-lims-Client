import { createRouter, createWebHistory } from 'vue-router';

import Mango from '../Views/Review/Mango.vue';
import CrazyLine from '../Views/Review/CrazyLine.vue';
import ChatBox from '../components/AI Helper(Demo)/ChatBox.vue';
import Jako from '../Views/Review/Jako.vue';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import Profile from '../views/Profile.vue';
import OrderEntry from '../Views/OrderEntry.vue';
import FAQ from '../views/StaticInterface/FAQ.vue';
import InstructionManual from '../views/StaticInterface/InstructionManual.vue';
import MainLayout from '../views/MainLayout.vue';
import userAuthStore from "@/stores/auth.js";
import OrderSummary from "@/Views/OrderSummary.vue";
import OrderReporting from "@/Views/OrderReporting.vue";
import Tchibo from "@/Views/Review/Tchibo.vue";
import useRoleStore from '@/stores/role.js'
import OrderView from "@/Views/OrderView.vue";

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
    path: '/main',
    name: 'MainLayout',
    component: MainLayout,
    children: [
      { path: 'ChatBox', name: 'ChatBox', component: ChatBox, meta: { title: 'AI Helper' } },
      {path:'Home',name:'Home',component:Home,meta:{title:'Home'}},
      {path:'Profile',name:'Profile',component:Profile,meta:{title:'Personal Center'}},
      {path:'FAQ',name:'FAQ',component:FAQ,meta:{title:'FAQ'}},
      {path:'InstructionManual',name:'InstructionManual',component:InstructionManual,meta:{title:'Instruction Manual'}},
      {path:'OrderView',name:'OrderView',component:OrderView,meta:{title:'Order Overview'}}
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

//为main添加子路由的方法
function addChildRoutes(routeArray,fatherRouteName) {
  if(!fatherRouteName)
    fatherRouteName = 'MainLayout';
  routeArray.forEach((item)=>{
    if(!router.hasRoute(item.name)){
      router.addRoute(fatherRouteName,item);
    }
  })
}


//获取数组并添加
export function addRoleRoute(){
  const roleStore=useRoleStore()
  const roleRoutes = roleStore.getRoutes
  if(roleRoutes.length>0){
    addChildRoutes(roleRoutes)
  }
  // console.log(router.getRoutes())
}

export default router;
