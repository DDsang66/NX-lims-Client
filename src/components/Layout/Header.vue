<template>
  <header class="sigma_header style-5 can-sticky">
    <div class="sigma_header-top dark-bg d-none d-md-block">
      <div class="container">
        <div class="sigma_header-top-inner">
          <div class="sigma_header-top-links">
            <ul class="sigma_header-top-nav">
              <li>
                <a router-link to="#">
                  <i class="fal fa-envelope"></i>
                  info@example.com
                </a>
              </li>
              <li>
                <a router-link to="#">
                  <i class="fal fa-map-marker-alt"></i>
                  N/A
                </a>
              </li>
            </ul>
          </div>

          <div class="sigma_header-top-contacts">
            <ul class="sigma_header-top-nav">
              <li>
                <a router-link to="#"><i class="fab fa-facebook-f"></i></a>
              </li>
              <li>
                <a router-link to="#"><i class="fab fa-twitter"></i></a>
              </li>
              <li>
                <a router-link to="#"><i class="fab fa-linkedin-in"></i></a>
              </li>
              <li>
                <a router-link to="#"><i class="fab fa-google"></i></a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="sigma_header-middle">
      <div class="container">
        <div class="navbar">
          <div class="d-none d-lg-flex align-items-center">
            <div class="sigma_header-top-links important-links">
              <ul class="sigma_header-top-nav">
                <li>
                  <div class="sigma_logo-wrapper">
                    <a class="sigma_logo" href="/main/Home">
                      <img src="@/assets/img/NX-lims logo-b.png" alt="logo">
                    </a>
                  </div>
                </li>
                <li>
                  <a router-link to="#">
                    <i class="fal fa-map-marker-alt" style="color: #3364d5"></i>
                    <div>
                      <p><b>Our Address</b></p>
                      <p>Ningbo, Zhejiang Province,</p>
                      <p>Buliding 2, No 350,Jinghua Road,</p>
                      <p>Essence Adream of Space II.</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a router-link to="#">
                    <i class="fal fa-phone" style="color: #3364d5"></i>
                    <div>
                      <p><b>Call Us</b></p>
                      <p>+86 574 2786 XXXX</p>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
            <a href="#" @click="Logout" style="background-color:#3364d5" class="sigma_btn-custom ml-5">Log Out</a>
            <a href="#" style="background-color:#3364d5" class="sigma_btn-custom ml-3">More Information</a>
          </div>
          <div class="sigma_header-controls style-2 d-block d-lg-none">
            <ul class="sigma_header-controls-inner">
              <li class="aside-toggle aside-trigger">
                <span></span>
                <span></span>
                <span></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="sigma_header-bottom">
      <div class="container">
        <div class="navbar">
          <ul class="navbar-nav">
            <li class="menu-item menu-item-has-children">
              <a href="#">Home</a>
              <ul class="sub-menu">
                <li class="menu-item">
                  <router-link to="/main/Home">Home</router-link>
                </li>
                <li class="menu-item">
                  <router-link to="/main/FAQ">FAQ</router-link>
                </li>
                <li class="menu-item">
                  <router-link to="/main/InstructionManual">Instruction Manual</router-link>
                </li>
              </ul>
            </li>
            <li class="menu-item">
              <router-link to="/main/ChatBox">AI Helper(Demo)</router-link>
            </li>
            <li class="menu-item menu-item-has-children">
              <a href="#">Order</a>
              <ul class="sub-menu">
                <li class="menu-item">
                  <router-link to="/main/OrderHome">Order Home</router-link>
                </li>
                <li class="menu-item">
                  <router-link to="/main/OrderSummary">Order Summary</router-link>
                </li>
                <li class="menu-item">
                  <router-link to="/main/OrderEntry">Order Entry</router-link>
                </li>
              </ul>
            </li>
            <li class="menu-item menu-item-has-children">
              <a href="#">Review</a>
              <ul class="sub-menu">
                <li class="menu-item">
                  <router-link to="/main/Mango">Mango</router-link>
                </li>
                <li class="menu-item">
                  <router-link to="/main/CrazyLine">Crazy Line</router-link>
                </li>
                <li class="menu-item">
                  <router-link to="/main/Jako">Jako</router-link>
                </li>
              </ul>
            </li>
            <li class="menu-item">
              <router-link to="#">Manual Management</router-link>
            </li>
            <li class="menu-item">
              <router-link to="/main/Profile">Personal Center</router-link>
            </li>
          </ul>

          <div class="sigma_header-controls style-2">
            <ul class="sigma_header-controls-inner">
              <li class="search-trigger header-controls-item d-none d-sm-block">
                <a class="sigma_header-control-search" title="Search" @click="toggleSearch()">
                  <i class="fal fa-search"></i>
                </a>
              </li>
              <li class="header-controls-item d-none d-sm-block">
                <a class="sigma_header-control-cart" title="Search">
                  <i class="fal fa-shopping-bag"></i>
                </a>
              </li>
              <li class="aside-toggle aside-trigger-right desktop-toggler">
                <span></span>
                <span></span>
                <span></span>
              </li>
              <li class="aside-toggle aside-trigger">
                <span></span>
                <span></span>
                <span></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </header>


  <div :class="['search-form-wrapper', { open: isSearchVisible }]">
    <div class="search-trigger sigma_close" @click="ShutDowntoggleSearch()">
      <span></span>
      <span></span>
    </div>
    <form class="search-form" @submit.prevent="submitSearch()">
      <input type="text"
             placeholder="Search..."
             v-model="searchQuery"
             id="SearchInput"
             name="searchQuery" />
      <button type="submit" class="search-btn">
        <i class="fal fa-search m-0"></i>
      </button>
    </form>
  </div>
</template>

<script setup>
  import { ref,inject} from 'vue';
  import { useRouter } from 'vue-router';

  const isSearchVisible = ref(false);
  const searchQuery = ref('');
  const router = useRouter(); // 使用 Vue Router
  const request=inject('request')
  const authStore = inject('userAuthStore');
  function toggleSearch() {
    isSearchVisible.value = !isSearchVisible.value;
  }

  function ShutDowntoggleSearch() {
    isSearchVisible.value = !isSearchVisible.value;
  }

  async function submitSearch() {
    try {
      // 发送 POST 请求
      const response = await request.post('/search/main', searchQuery.value);

      console.log('Now loading', response.data);

      // 假设 response.data 是一个对象，包含搜索结果
      // 构造查询字符串参数
      const queryParams = response.data.data;
      const searchUrl = `/main/${queryParams}`;

      // 使用 Vue Router 的 push 方法进行内部路由跳转
      router.push(searchUrl);
      ShutDowntoggleSearch();
    } catch (error) {
      console.error('Search failed:', error);
    }
  }



  const Logout = async () => {
    authStore.clearTokens();
    router.push('/Login');
  }
</script>

<style scoped>
  .sigma_btn-custom::before {
    background-color: #18086a;
  }
</style>
