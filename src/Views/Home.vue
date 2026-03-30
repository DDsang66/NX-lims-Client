<template>
  <div class="home-container">
    <!-- 2. Banner 轮播区域 -->
    <div class="sigma_banner banner-3">
      <!-- Custom Arrows Start -->
      <div class="sigma_arrows sigma_arrows-transparent">
        <div class="sigma_round-arrow prev-arrow" @click="prevSlide">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="125px" height="125px" viewBox="0 0 197 197" enable-background="new 0 0 197 197" xml:space="preserve">
          <circle class="sigma_round-arrow-stroke" stroke-linecap="round" cx="98.5" cy="98.6" r="97.5"></circle>
          <circle class="sigma_round-arrow-circle" stroke-linecap="round" cx="98.5" cy="98.6" r="97.5"></circle>
          </svg>
          <i class="far fa-arrow-left slick-arrow slider-prev"></i>
        </div>
        <div class="sigma_round-arrow next-arrow" @click="nextSlide">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="125px" height="125px" viewBox="0 0 197 197" enable-background="new 0 0 197 197" xml:space="preserve">
          <circle class="sigma_round-arrow-stroke" stroke-linecap="round" cx="98.5" cy="98.6" r="97.5"></circle>
          <circle class="sigma_round-arrow-circle" stroke-linecap="round" cx="98.5" cy="98.6" r="97.5"></circle>
          </svg>
          <i class="far fa-arrow-right slick-arrow slider-next"></i>
        </div>
      </div>
      <!-- Custom Arrows End -->

      <div class="sigma_banner-slider">
        <!-- Banner Item Start -->
        <div v-for="(slide, index) in slides" :key="index" class="light-bg sigma_banner-slider-inner bg-cover bg-center bg-norepeat dark-overlay" :style="{ backgroundImage: `url(${slide.image})`, display: index === currentSlide ? 'block' : 'none' }">
          <div class="sigma_banner-text">
            <div class="container">
              <div class="row justify-content-center">
                <div class="col-lg-6 text-center">
                  <h4 class="text-white">{{ slide.title }}</h4>
                  <h1 class="title text-white">{{ slide.subtitle }}</h1>
                  <p>{{ slide.description }}</p>
                  <div class="section-button d-flex align-items-center justify-content-center">
                    <a href="#" class="sigma_btn-custom">About Labem</a>
                    <a href="#" class="ml-3 sigma_btn-custom secondary">Get a help</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Banner Item End -->
      </div>
    </div>

    <!-- 3. 视频与导航区域 -->
    <div class="content-sectionNew">
      <div class="content-inner">
        <div class="content-wrapper">
          <!-- 左侧：视频区域 -->
          <div class="video-container">
            <div class="section-label">Demo Area</div>
            <div class="sigma_video-popup-wrap">
              <video ref="videoRef"
                     class="sigma_video"
                     src="/src/assets/video/demo.mp4"
                     muted
                     loop
                     playsinline
                     preload="metadata"
                     @click="toggleVideo" 
                     style="border: 5px solid #000000;"></video>
              <a href="#" class="sigma_video-popup bg-white popup-youtube popup-lg" @click.prevent="playVideo" v-show="showPlayBtn">
                <i class="far fa-play"></i>
              </a>
            </div>
          </div>

          <!-- 右侧：模块化导航 -->
          <div class="nav-grid-container">
            <div class="section-label">Quick Navigation</div>
            <div class="nav-grid">
              <div class="nav-item" v-for="(nav, index) in navItems" :key="index">
                <div class="nav-icon">
                  <el-icon><component :is="nav.icon" /></el-icon>
                </div>
                <div class="nav-title">{{ nav.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. 更新历史区域 -->
    <div class="history-section">
      <!-- 新增：独立的框体容器 -->
      <div class="history-container">
        <div class="section-label">Update History</div>
        <el-timeline>
          <el-timeline-item v-for="(activity, index) in historyData"
                            :key="index"
                            :timestamp="activity.timestamp"
                            placement="top">
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  // 引入图标
  import { DataAnalysis, Document, Management, Setting, Grid, Menu, User, Files } from '@element-plus/icons-vue';

  // 视频相关逻辑
  const videoRef = ref(null);
  const showPlayBtn = ref(true);

  function playVideo() {
    const v = videoRef.value;
    if (v && v.paused) {
      v.play();
      showPlayBtn.value = false;
    }
  }

  function toggleVideo() {
    const v = videoRef.value;
    if (v) {
      if (v.paused) {
        v.play();
      } else {
        v.pause();
      }
      // 关键修改：立即根据视频的实际播放状态更新按钮显示状态
      // 如果视频暂停了（v.paused 为 true），showPlayBtn 设为 true（显示按钮）
      // 如果视频播放了（v.paused 为 false），showPlayBtn 设为 false（隐藏按钮）
      showPlayBtn.value = v.paused;
    }
  }

  function onVideoPause() {
    showPlayBtn.value = true;
  }

  function onVideoEnd() {
    showPlayBtn.value = true;
  }

  // Banner 轮播相关逻辑
  import banner1 from '@/assets/img/banner/3.jpg';
  import banner2 from '@/assets/img/banner/2.jpg';

  const slides = ref([
    {
      image: banner1,
      title: 'NX-lims Version 1.0',
      subtitle: 'passionate experts',
      description: 'Add Value. Inspire trust.'
    },
    {
      image: banner2,
      title: 'NX-lims Version 1.0',
      subtitle: 'One-stop textile testing solution',
      description: 'Add Value. Inspire trust..'
    }
  ]);

  const currentSlide = ref(0);
  const intervalTime = 7000; // 自动轮播的时间间隔（毫秒）
  let intervalId;

  const prevSlide = () => {
    currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
  };

  const nextSlide = () => {
    currentSlide.value = (currentSlide.value + 1) % slides.value.length;
  };

  const startAutoSlide = () => {
    intervalId = setInterval(nextSlide, intervalTime);
  };

  const stopAutoSlide = () => {
    clearInterval(intervalId);
  };

  // 导航菜单相关逻辑
  const activeIndex = ref('1');
  const handleSelect = (key, keyPath) => {
    console.log(key, keyPath);
  };

  // 快速导航数据
  const navItems = ref([
    { icon: DataAnalysis, title: 'Data Analysis' },
    { icon: Document, title: 'Report Management' },
    { icon: Management, title: 'Process Management' },
    { icon: Setting, title: 'System Configuration' },
    { icon: Grid, title: 'Module Configuration' },
    { icon: Menu, title: 'Menu Management' },
    { icon: User, title: 'User Permissions' },
    { icon: Files, title: 'File Archiving' }
  ]);

  // 更新历史数据
  const historyData = ref([
    {
      timestamp: '2023-10-01',
      content: 'System updated to v1.2.0, added data export feature.'
    },
    {
      timestamp: '2023-09-15',
      content: 'Optimized report generation speed, improved user experience.'
    },
    {
      timestamp: '2023-08-30',
      content: 'Fixed known issues in the sample registration process.'
    },
    {
      timestamp: '2023-08-01',
      content: 'System officially launched, initial version v1.0.0.'
    }
  ]);

  // 生命周期钩子
  onMounted(() => {
    startAutoSlide();
    const v = videoRef.value;
    if (v) {
      v.addEventListener('pause', onVideoPause);
      v.addEventListener('ended', onVideoEnd);
    }
  });

  onUnmounted(() => {
    stopAutoSlide();
    const v = videoRef.value;
    if (v) {
      v.removeEventListener('pause', onVideoPause);
      v.removeEventListener('ended', onVideoEnd);
    }
  });
</script>

<style scoped>
  /* 全局样式 */
  .home-container {
    width: 100%;
    overflow-x: hidden;
  }

  /* Banner 轮播样式 */
  .sigma_banner {
    position: relative;
    width: 100%;
    height: 68vh;
    margin-top: 15px; /* 抵消固定导航栏的高度 */
    overflow: hidden;
  }

  .sigma_arrows {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    box-sizing: border-box;
    z-index: 10;
  }

  .sigma_round-arrow {
    cursor: pointer;
    transition: opacity 0.3s;
  }

    .sigma_round-arrow:hover {
      opacity: 0.8;
    }

  .sigma_banner-slider-inner {
    width: 100%;
    height: 68vh; /* 强制高度为视口高度 */
    background-size: cover; /* 确保覆盖整个区域，多余部分裁剪 */
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    /* 即使图片加载慢，也保持高度，防止跳动 */
    min-height: 40vh;
  }

  .sigma_banner-text {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    text-align: center;
    z-index: 5;
  }

    .sigma_banner-text h4 {
      font-size: 24px;
      font-weight: 500;
      margin-bottom: 15px;
    }

    .sigma_banner-text h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 20px;
    }

    .sigma_banner-text p {
      font-size: 18px;
      margin-bottom: 30px;
    }

  .sigma_btn-custom {
    display: inline-block;
    padding: 12px 30px;
    background-color: #409EFF;
    color: #fff;
    border-radius: 30px;
    font-weight: 500;
    transition: all 0.3s;
    text-decoration: none;
  }

    .sigma_btn-custom:hover {
      background-color: #66b1ff;
      transform: translateY(-2px);
    }

    .sigma_btn-custom.secondary {
      background-color: transparent;
      border: 2px solid #fff;
      margin-left: 15px;
    }

      .sigma_btn-custom.secondary:hover {
        background-color: #fff;
        color: #409EFF;
      }

  /* 内容区域样式 - 减少间距 */
  .content-sectionNew {
    margin-top: 5%;
    padding: 20px 0; /* 减少了 padding */
    background-color: #f8f9fa;
    width: 100%;
  }

  .content-inner {
    max-width: 90%;
    margin: 0 auto;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .content-wrapper {
    display: flex;
    gap: 30px;
    align-items: flex-start;
  }

  .section-label {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
    padding-left: 10px;
    border-left: 4px solid #409EFF;
  }

  /* 视频区域样式 */
  .video-container {
    flex: 1;
    max-width: 60%;
  }

  .sigma_video-popup-wrap {
    position: relative;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    background-color: #000;
  }

  .sigma_video {
    width: 100%;
    height: auto;
    display: block;
  }

  .sigma_video-popup {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }

    .sigma_video-popup:hover {
      transform: translate(-50%, -50%) scale(1.1);
      background-color: #fff;
    }

    .sigma_video-popup i {
      font-size: 24px;
      color: #409EFF;
      margin-left: 4px;
    }

  /* 导航网格样式 */
  .nav-grid-container {
    flex: 1;
  }

  .nav-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .nav-item {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    cursor: pointer;
  }

    .nav-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

  .nav-icon {
    font-size: 32px;
    color: #409EFF;
    margin-bottom: 10px;
  }

  .nav-title {
    font-size: 16px;
    color: #303133;
    font-weight: 500;
  }

  /* 更新历史样式 - 独立框体 */
  .history-section {
    padding: 40px 0; /* 调整外层间距 */
    background-color: #f8f9fa; /* 外层背景色 */
  }

  .history-container {
    width: 90%;
    margin: 0 auto;
    background-color: #fff;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
  }

    .history-container .section-label {
      margin-bottom: 30px;
    }
</style>
