<template>
  <el-container style="width: 100vw;height: 100vh;display: flex;flex-direction: column">
    <el-header style="height: 8%;border-bottom: 1px solid #dcdfe6;">
      <div style="display: flex;align-items: center;width: 100%;height: 100%;">
        <img src="@/assets/img/NX-lims logo-b.png" alt="logo" style="object-fit: contain;max-height: 100%;">
        <span style="margin-left: auto;">{{userAuth.user}}</span>
        <el-popover
          placement="bottom"
          :width="100"
          :popper-style="{ minWidth: '100px'}"
          @hide="xiaJianTou=true"
          trigger="click">
          <div style="display: flex;flex-direction: column">
<!--            <el-link :underline="false" @click="geRenZiLiaoKuang=true">个人资料</el-link>-->
            <el-link underline='never' @click="gaiMiMa" style="font-size: 18px">修改密码</el-link>
            <el-link underline='never' @click="logOut" style="font-size: 18px">退出登录</el-link>
          </div>
          <template #reference>
            <span style="margin-left: 5px">
              <el-icon
                style="margin-left: 2px;font-size: 15px"
                v-show="xiaJianTou"
                @click="xiaJianTou=false"><ArrowDown /></el-icon>
              <el-icon
                style="margin-left: 2px;
                   font-size: 15px"
                @click="xiaJianTou=true"
                v-show="!xiaJianTou"><ArrowUp /></el-icon>
            </span>
          </template>
        </el-popover>
      </div>
    </el-header>
    <el-container style="width: 100%;flex: 1;min-height: 0">
      <el-aside width="200px" style="height: 100%">
        <el-menu
          class="sidebar-menu"
          mode="vertical"
          background-color="white"
          text-color="#333"
          active-text-color="#409eff"
          default-active="/main/Home"
          router
          style="height: 100%"
        >
          <!-- Home 菜单（带子菜单） -->
          <el-sub-menu index="1">
            <template #title>
              <span>Home</span>
            </template>
            <el-menu-item index="/main/Home">
              <span>Home</span>
            </el-menu-item>
            <el-menu-item index="/main/FAQ">
              <span>FAQ</span>
            </el-menu-item>
            <el-menu-item index="/main/InstructionManual">
              <span>Instruction Manual</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- AI Helper -->
          <el-menu-item index="/main/ChatBox">
            <span>AI Helper (Demo)</span>
          </el-menu-item>

          <!-- Order 菜单 -->
          <el-sub-menu index="2">
            <template #title>
              <span>Order</span>
            </template>
            <el-menu-item index="/main/OrderReporting">
              <span>Order Reporting</span>
            </el-menu-item>
            <el-menu-item index="/main/OrderSummary">
              <span>Order Summary</span>
            </el-menu-item>
            <el-menu-item index="/main/OrderEntry">
              <span>Order Entry</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- Review 菜单 -->
          <el-sub-menu index="3">
            <template #title>
              <span>Review</span>
            </template>
            <el-menu-item index="/main/Mango">
              <span>Mango</span>
            </el-menu-item>
            <el-menu-item index="/main/CrazyLine">
              <span>Crazy Line</span>
            </el-menu-item>
            <el-menu-item index="/main/Jako">
              <span>Jako</span>
            </el-menu-item>
            <el-menu-item index="/main/Tchibo">
              <span>Tchibo</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- Manual Management（无跳转） -->
          <el-menu-item index="/main/ManualManagement" disabled>
            <span>Manual Management</span>
          </el-menu-item>

          <!-- Personal Center -->
          <el-menu-item index="/main/Profile">
            <span>Personal Center</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main style="height: 100%">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
  import HomeImage from '@/components/Layout/HomeImage.vue'
  import Header from '@/components/Layout/Header.vue'

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
  import {inject, ref} from 'vue'
  import router from "@/router/index.js";
  import {ArrowDown, ArrowUp} from "@element-plus/icons-vue";

  export default {
    name: 'MainLayout',
    components: {
      ArrowUp,
      ArrowDown,
      HomeImage,
      Header
    },
    setup() {
      const userAuth = inject('userAuthStore')
      const xiaJianTou = ref(true)
      /* function----------------------------------------------------------------------------------- */
      const logOut = async () => {
        userAuth.clearTokens();
        router.push('/Login');
      }
      return {
        userAuth,
        xiaJianTou,
        logOut
      }
    }
  };
</script>
<style scoped>
  html, body {
    height: 100%;
    margin: 0;
  }

  #app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* 让主体内容占剩余空间，footer 不再被拉伸 */
  main {
    flex: 1;
  }

  /* footer 固定高度 + 全宽 + 贴底 */
  footer {
    flex-shrink: 0; /* 防止被拉伸 */
    width: 100%;
  }
</style>
