<script setup>
  import Footer from '@/components/Footer.vue';
  import Header from '@/components/Header.vue'
import { ref, onMounted, onUnmounted } from 'vue';
import banner1 from '@/assets/img/banner/3.jpg';
import banner2 from '@/assets/img/banner/2.jpg';
const videoRef      = ref(null);
const showPlayBtn   = ref(true);

function playVideo() {
  const v = videoRef.value;
  if (v.paused) {
    v.play();
    showPlayBtn.value = false;   // 隐藏按钮
  }
}
function toggleVideo() {
  const v = videoRef.value;
  v.paused ? v.play() : v.pause();
}
// 视频播放完 / 用户手动暂停时重新显示按钮
function onVideoPause()  { showPlayBtn.value = true; }
function onVideoEnd()    { showPlayBtn.value = true; }


const slides = ref([
  {
    image: banner1,
    title: 'NX-lims Lab Command Sys Version 0.9',
    subtitle: 'passionate experts',
    description: 'Creative Laboratory & Science Research Template for all your future-ready science Laboratory It includes areas like Science Research & Technology.'
  },
  {
    image: banner2,
    title: 'NX-lims Lab Command Sys Version 0.9',
    subtitle: '3000 Different analyses',
    description: 'Creative Laboratory & Science Research Template for all your future-ready science Laboratory It includes areas like Science Research & Technology.'
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

onMounted(() => {
  startAutoSlide();
  const v = videoRef.value;
  v.addEventListener('pause',  onVideoPause);
  v.addEventListener('ended',  onVideoEnd);
});

onUnmounted(() => {
  stopAutoSlide();
});

</script>




<template>
  <Header />
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
                  <a href="about-us.html" class="sigma_btn-custom">About Labem</a>
                  <a href="contact-us.html" class="ml-3 sigma_btn-custom secondary">Get a help</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Banner Item End -->
    </div>
  </div>




  <div class="section pb-0">
    <div class="container">
      <div class="row">
        <div class="col-lg-4 col-md-6">
          <div class="sigma_portfolio-item style-6">
            <img src="/src/assets/img/projects/style-2/1.jpg" alt="portfolio">
            <div class="sigma_portfolio-item-content">
              <div class="sigma_portfolio-item-content-inner">
                <h5> <a href="#"> Central Forensic Science <i class="fal fa-arrow-right"></i> </a> </h5>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6">
          <div class="sigma_portfolio-item style-6">
            <img src="/src/assets/img/projects/style-2/2.jpg" alt="portfolio">
            <div class="sigma_portfolio-item-content">
              <div class="sigma_portfolio-item-content-inner">
                <h5> <a href="#"> Our Research Center <i class="fal fa-arrow-right"></i> </a> </h5>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6">
          <div class="sigma_portfolio-item style-6">
            <img src="/src/assets/img/projects/style-2/3.jpg" alt="portfolio">
            <div class="sigma_portfolio-item-content">
              <div class="sigma_portfolio-item-content-inner">
                <h5> <a href="#"> NABL Certificate Award <i class="fal fa-arrow-right"></i> </a> </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="section section-padding pt-0">
    <div class="container">
      <div class="section-title text-center">
        <p class="subtitle">Services</p>
        <h4 class="title">What We Do</h4>
      </div>
      <div class="row">
        <div class="col-lg-4 col-md-6">
          <a href="#" class="sigma_service style-4">
            <i class="flaticon-microscope"></i>
            <div class="sigma_service-body">
              <h5>Chrinic Disease</h5>
              <p>Scientific laboratories can be found as research room and learning spaces in schools and universities. </p>
            </div>
            <div class="sigma_service-footer">
              <ul>
                <li>Commercial company</li>
                <li>Quality services</li>
                <li>Operational excellence through</li>
              </ul>
            </div>
          </a>
        </div>
        <div class="col-lg-4 col-md-6">
          <a href="#" class="sigma_service style-4">
            <i class="flaticon-research"></i>
            <div class="sigma_service-body">
              <h5>Cancer Biology</h5>
              <p> A physics laboratory might contain a particle accelerator or vacuum chamber, while a metallurgy. </p>
            </div>
            <div class="sigma_service-footer">
              <ul>
                <li>Commercial company</li>
                <li>Quality services</li>
                <li>Operational excellence through</li>
              </ul>
            </div>
          </a>
        </div>
        <div class="col-lg-4 col-md-6">
          <a href="#" class="sigma_service style-4">
            <i class="flaticon-laboratory-1"></i>
            <div class="sigma_service-body">
              <h5>Atherosclerosis</h5>
              <p>The organisation and contents of laboratories are determined by the differing requirements. </p>
            </div>
            <div class="sigma_service-footer">
              <ul>
                <li>Commercial company</li>
                <li>Quality services</li>
                <li>Operational excellence through</li>
              </ul>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="section section-padding pt-0">
    <div class="container">
      <div class="section-title text-left">
        <h1>Check the video, learn more about Lims.</h1>
      </div>
    </div>
  </div>

  <div class="section secondary-overlay bg-center bg-cover pt-0" style="background-image:url(/src/assets/img/banner/2.jpg)">

    <div class="spacer white-bg spacer-lg d-none d-lg-block"></div>

    <div class="container">

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

      <div class="section section-padding pb-0">
        <div class="row">
          <div class="col-md-3">
            <div class="sigma_counter">
              <i class="flaticon-experiment"></i>
              <span> <b class="text-white counter" data-from="0" data-to="1500">1500</b> <span class="custom-primary">+</span> </span>
              <p class="custom-dark">Lab Projects</p>
            </div>
          </div>

          <div class="col-md-3">
            <div class="sigma_counter">
              <i class="flaticon-scientist"></i>
              <span> <b class="text-white counter" data-from="0" data-to="800">800</b> <span class="custom-primary">+</span> </span>
              <p class="custom-dark">Practicioners</p>
            </div>
          </div>

          <div class="col-md-3">
            <div class="sigma_counter">
              <i class="flaticon-rating"></i>
              <span> <b class="text-white counter" data-from="0" data-to="1000">1000</b> <span class="custom-primary">+</span> </span>
              <p class="custom-dark">Satisfied Clients</p>
            </div>
          </div>

          <div class="col-md-3">
            <div class="sigma_counter">
              <i class="flaticon-award"></i>
              <span> <b class="text-white counter" data-from="0" data-to="200">200</b> <span class="custom-primary">+</span> </span>
              <p class="custom-dark">Awards Achieved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


  <Footer />
</template>

<style scoped>
  /* Add your styles here */
  .sigma_banner {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden; /* 隐藏超出部分 */
  }

  .sigma_arrows {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    display: flex;
    justify-content: space-between;
    z-index: 10;
  }

  .sigma_round-arrow {
    cursor: pointer;
  }

  .sigma_banner-slider-inner {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .sigma_banner-text {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    text-align: center;
  }
  .sigma_video {
    width: 100%;
    height: auto; /* 或 100%，取决于 img 原来的表现 */
    display: block; /* 去掉 video 默认的 baseline 空隙 */
  }
</style>
