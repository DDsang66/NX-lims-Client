<script>
  import Footer from '@/components/Footer.vue';
  import HomeImage from '@/components/HomeImage.vue'
  import Header from '@/components/Header.vue'

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

  export default {
    name: 'MainLayout',
    components: {
      Footer,
      HomeImage,
      Header
    }
  };
</script>

<template>
    <Header />
    <HomeImage />
    <main>
      <router-view />
    </main>
    <Footer />
</template>
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
