<template>
  <el-container style="width: 100vw;height: 100vh;display: flex;flex-direction: column">
    <el-header style="height: 8%;border-bottom: 1px solid #dcdfe6;">
      <div style="display: flex;align-items: center;width: 100%;height: 100%;">
        <img src="@/assets/img/NX-lims logo-b.png" alt="logo" style="object-fit: contain;max-height: 100%;">
        <div style="height: 100%;margin-left: auto;display: flex;align-items: center;">
          <div @click="changeLanguage" style="height: 40%">
            <img src="/src/assets/svg/中英切换_英.svg" style="margin:auto;height: 100%;width: auto" v-show="locale==='English'" alt="" />
            <img src="/src/assets/svg/中英切换_中.svg" style="margin:auto;height: 100%;width: auto" v-show="locale==='Chinese'" alt="" />
          </div>
          <span style="margin-left: 5px">{{userAuth.user}}</span>
          <el-popover placement="bottom"
                      :width="100"
                      :popper-style="{ minWidth: '100px'}"
                      @hide="xiaJianTou=true"
                      trigger="click">
            <div style="display: flex;flex-direction: column">
              <!--            <el-link :underline="false" @click="geRenZiLiaoKuang=true">个人资料</el-link>-->
              <el-link underline='never' @click="openChangePassword" style="font-size: 18px">修改密码</el-link>
              <!--              <el-link underline='never' @click="logOut" style="font-size: 18px">退出登录</el-link>-->
            </div>
            <template #reference>
              <span style="margin-left: 5px">
                <el-icon style="margin-left: 2px;font-size: 15px"
                         v-show="xiaJianTou"
                         @click="xiaJianTou=false"><ArrowDown /></el-icon>
                <el-icon style="margin-left: 2px;
                   font-size: 15px"
                         @click="xiaJianTou=true"
                         v-show="!xiaJianTou"><ArrowUp /></el-icon>
              </span>
            </template>
          </el-popover>
          <img src="/src/assets/svg/退出登录.svg" style="margin-left: 5px;height: 40%;width: auto" alt="" @click="logOut" />
        </div>
      </div>
    </el-header>
    <el-container style="width: 100%;flex: 1;min-height: 0">
      <!-- [修改] 侧边栏宽度动态绑定，添加 collapse 过渡效果 -->
      <el-aside :width="isCollapse ? '64px' : '225px'" style="height: 100%; transition: width 0.3s;">
        <el-menu class="sidebar-menu"
                 mode="vertical"
                 background-color="white"
                 text-color="#333"
                 active-text-color="#409eff"
                 default-active="/main/Home"
                 router
                 :collapse="isCollapse"
                 :collapse-transition="false"
                 style="height: 100%">

          <!-- [新增] 折叠/展开 按钮 -->
          <div style="height: 50px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-bottom: 1px solid #e6e6e6;" @click="toggleSidebar">
            <el-icon v-if="!isCollapse" style="font-size: 20px;"><Fold /></el-icon>
            <el-icon v-else style="font-size: 20px;"><Expand /></el-icon>
          </div>

          <el-menu-item index="/main/Home">
            <el-icon><HomeFilled /></el-icon>
            <span>Home</span>
          </el-menu-item>


          <!-- Order 菜单 -->
          <el-sub-menu index="2" v-if="hasBigPower('Order')">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>Order Management</span>
            </template>
            <el-menu-item index="/main/OrderReporting" v-if="hasPower('OrderReporting')">
              <span>Order Reporting</span>
            </el-menu-item>
            <el-menu-item index="/main/OrderSummary" v-if="hasPower('OrderSummary')">
              <span>Order Summary</span>
            </el-menu-item>
            <el-menu-item index="/main/OrderEntry" v-if="hasPower('OrderEntry')">
              <span>Order Lab In</span>
            </el-menu-item>
            <el-menu-item index="/main/ReviewFinish" v-if="hasPower('Review')">
              <span>Order Check Done</span>
            </el-menu-item>
            <el-menu-item index="/main/LabOut" v-if="hasPower('LabOut')">
              <span>Order Lab Out</span>
            </el-menu-item>
            <el-menu-item index="/main/OrderView">
              <span>Order Overview</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- Review 菜单 -->
          <el-sub-menu index="3" v-if="hasPower('Review')">
            <template #title>
              <el-icon><Edit /></el-icon>
              <span>Application Form Review</span>
            </template>
            <el-menu-item index="/main/Mango">
              <span>MANGO</span>
            </el-menu-item>
            <el-menu-item index="/main/CrazyLine">
              <span>Crazy Line</span>
            </el-menu-item>
            <el-menu-item index="/main/Jako">
              <span>JAKO</span>
            </el-menu-item>
            <el-menu-item index="/main/Tchibo">
              <span>Tchibo</span>
            </el-menu-item>
            <el-menu-item index="/main/Primark">
              <span>Primark</span>
            </el-menu-item>
            <el-menu-item index="/main/Kik">
              <span>KiK</span>
            </el-menu-item>
            <el-menu-item index="/main/Pep&co">
              <span>Pepco</span>
            </el-menu-item>
            <el-menu-item index="/main/Next">
              <span>NEXT</span>
            </el-menu-item>
            <el-menu-item index="/main/Woolworth">
              <span>Woolworth</span>
            </el-menu-item>
            <el-menu-item index="/main/LTAG">
              <span>LTAG</span>
            </el-menu-item>
            <el-menu-item index="/main/LPP">
              <span>LPP</span>
            </el-menu-item>
            <el-menu-item index="/main/Focus">
              <span>Focus</span>
            </el-menu-item>
            <el-menu-item index="/main/OVS">
              <span>OVS</span>
            </el-menu-item>
          </el-sub-menu>
          <!--          未发布的-->
          <el-sub-menu index="4" v-if="hasPower('Lab')">
            <template #title>
              <el-icon><Monitor /></el-icon>
              <span>Lab</span>
            </template>
            <el-menu-item index="/main/Review">
              <span>Laboratory Schedule</span>
            </el-menu-item>
            <el-menu-item index="/main/ExcelTry">
              <span>Work Sheet Edit</span>
            </el-menu-item>
            <el-menu-item index="/main/ItemConfig">
              <span>Buyer Manual</span>
            </el-menu-item>
            <el-menu-item index="/main/StandardConfig">
              <span>Standard Overview</span>
            </el-menu-item>
            <el-menu-item index="/main/ParamConfig">
              <span>Reporting List</span>
            </el-menu-item>
          </el-sub-menu>



          <el-sub-menu index="5" v-if="hasBigPower('Lab Management')">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>Lab Management</span>
            </template>
            <el-menu-item index="/main/Review">
              <span>Standard Management</span>
            </el-menu-item>
            <el-menu-item index="/main/ExcelTry">
              <span>Test Item Management</span>
            </el-menu-item>
            <el-menu-item index="/main/ItemConfig">
              <span>Buyer Management</span>
            </el-menu-item>
            <el-menu-item index="/main/StandardConfig">
              <span>Manual Management</span>
            </el-menu-item>
            <el-menu-item index="/main/ParamConfig">
              <span>Test Logic Config</span>
            </el-menu-item>
          </el-sub-menu>
          <!-- Personal Center -->
          <el-menu-item index="/main/Profile">
            <el-icon><User /></el-icon>
            <span>Personal Center</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main style="height: 100%;padding: 0">
        <router-view style="padding: 20px" />
        <el-dialog title="修改密码"
                   v-model="showChangePassword"
                   width="30%">
          <el-form :model="form3" label-width="80px">
            <el-form-item label="用 户">
              <span>{{form3.user}}</span>
            </el-form-item>
            <el-form-item label="旧密码">
              <el-input v-model="form3.oldPassword" style="width: 90%;" placeholder="请输入旧密码"></el-input>
            </el-form-item>
            <el-form-item label="新密码">
              <el-input :prefix-icon="Lock" v-model="form3.newPassword" style="width: 90%;" placeholder="请输入新密码" show-password></el-input>
            </el-form-item>
            <el-form-item label="新密码">
              <el-input :prefix-icon="Lock" v-model="form3.newPassword2" style="width: 90%;" placeholder="请再次输入新密码" show-password></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showChangePassword= false">取消</el-button>
            <el-button type="primary" @click="changePassword">确定</el-button>
          </template>
        </el-dialog>
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
  import { inject, ref } from 'vue'
  import router from "@/router/index.js";
  import { ArrowDown, ArrowUp, Lock, Fold, Expand, HomeFilled, Document, Edit, Files, Setting, User } from "@element-plus/icons-vue";
  import { useI18n } from "vue-i18n";
  import userAuthStore from "@/stores/auth.js";
  import { ElMessage } from "element-plus";

  export default {
    name: 'MainLayout',
    components: {
      ArrowUp,
      ArrowDown,
      // 注册新引入的图标组件
      Fold,
      Expand,
      HomeFilled,
      Document,
      Edit,
      Files,
      Setting,
      User
    },
    setup() {
      const { locale } = useI18n()
      const roleStore = inject('roleStore')
      const hasPower = roleStore.hasPower;
      const hasBigPower = roleStore.hasBigPower;
      const userAuth = inject('userAuthStore')
      const xiaJianTou = ref(true)
      const globalStore = inject('globalStore')
      const showChangePassword = ref(false)

      // [新增] 控制侧边栏折叠的状态
      const isCollapse = ref(false)
      const toggleSidebar = () => {
        isCollapse.value = !isCollapse.value
      }

      // 修改密码表单数据
      const form3 = ref({
        user: '',
        oldPassword: '',
        newPassword: '',
        newPassword2: '',
        id: ''
      })
      //请求
      const request = inject('request')
      const { t } = useI18n()
      /* function----------------------------------------------------------------------------------- */
      function changePassword() {
        let oldPassword = ''
        if (form3.value.oldPassword !== oldPassword) {
          return ElMessage({
            message: t('message.oldPasswordIncorrect'),
            type: "warning"
          })
        }
        if (form3.value.newPassword !== form3.value.newPassword2) {
          return ElMessage({
            message: t('message.twoPasswordInconsistent'),
            type: "warning"
          })
        }
        request.put("/zhangHao/changePassword", { id: form3.value.id, mima: form3.value.newPassword }).then(res => {
          if (res.code === 1) {
            ElMessage({
              message: res.msg,
              type: "success"
            })
            showChangePassword.value = false
            router.push("/login")
          }
        })
      }
      const openChangePassword = () => {
        form3.value.user = userAuth.user
        form3.value.id = userAuth.id
        showChangePassword.value = true
      }
      const logOut = async () => {
        userAuth.clearTokens();
        router.push('/Login');
      }
      const changeLanguage = () => {
        locale.value = locale.value === 'English' ? 'Chinese' : 'English'
      }
      return {
        locale,
        userAuth,
        xiaJianTou,
        logOut,
        changeLanguage,
        globalStore,
        hasPower,
        hasBigPower,
        openChangePassword,
        showChangePassword,
        form3,
        changePassword,
        Lock,
        // [新增] 返回折叠相关的状态和方法
        isCollapse,
        toggleSidebar
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

  /* [新增] 侧边栏菜单样式调整 */
  .sidebar-menu:not(.el-menu--collapse) {
    width: 225px;
  }

  /* [新增] 确保折叠时图标居中 */
  .el-menu--collapse .el-menu-item span,
  .el-menu--collapse .el-sub-menu__title span {
    height: 0;
    width: 0;
    overflow: hidden;
    visibility: hidden;
    display: inline-block;
  }

  /* [新增] 确保折叠时图标居中 */
  .el-menu--collapse .el-menu-item .el-icon,
  .el-menu--collapse .el-sub-menu__title .el-icon {
    margin: 0; /* 移除默认margin，确保居中 */
    vertical-align: middle;
  }
</style>
