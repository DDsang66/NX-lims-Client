<template>
  <Header />
  <div class="sigma_subheader dark-overlay dark-overlay-2" style="background-image: url(/src/assets/img/scale_1200.png)">

    <div class="container">
      <div class="sigma_subheader-inner">
        <div class="sigma_subheader-text">
          <h1>FAQ</h1>
          <p>
            Creative Laboratory &amp;<br>
            Our Motto: "Add value. Inspire trust."
          </p>
        </div>
      </div>
    </div>

  </div>
  <!-- ===== FAQ Section Start ===== -->
  <section class="section-faq">
    <div class="container">
      <h2 class="section-title" style="text-align:left">Frequently Asked Questions</h2>

      <!-- 单条 FAQ 卡片（可循环 v-for） -->
      <div class="faq-item" v-for="(item, idx) in faqList" :key="idx">
        <!-- 问题标题 / 点击展开答案 -->
        <div class="faq-question" @click="toggle(idx)">
          <span>{{ item.q }}</span>
          <i class="icon" :class="openIdx === idx ? 'fa fa-chevron-up' : 'fa fa-chevron-down'"></i>
        </div>

        <!-- 答案区域（过渡动画） -->
        <transition name="fade" mode="out-in">
          <div class="faq-answer" v-show="openIdx === idx">
            <p>{{ item.a }}</p>
          </div>
        </transition>
      </div>
    </div>
  </section>
  <!-- ===== FAQ Section End ===== -->


  <Footer />
</template>

<script setup>
  import Footer from '@/components/Layout/Footer.vue';
  import Header from '@/components/Layout/Header.vue';
  import { ref } from 'vue'

const openIdx = ref(null)

function toggle(idx) {
  openIdx.value = openIdx.value === idx ? null : idx
}

// 常见问题数据
const faqList = ref([
  {
    q: 'How to register an account?',
    a: 'Return to the login page, click [Sign Up], and fill in the username and password.'
  },
  {
    q: 'What should I do if I forget my password?',
    a: 'Click [Forgot password] on the login page to reset your password using your registered email or phone number.'
  },
  {
    q: 'How to modify my permissions',
    a: 'Please contact the administrator for modifications. Once approved, you will receive higher privileges.'
  },
    {
    q: 'What should I do if my account is locked?',
    a: 'Please contact the administrator to unfreeze your account, and then reset your password.'
  },
])
</script>

<style scoped>
  .sigma_btn-custom::before {
    background-color: #18086a;
  }

  .section-faq {
    padding: 60px 0;
    background: #f7f7f7;
  }

  .section-title {
    text-align: center;
    margin-bottom: 40px;
    font-size: 28px;
  }

  .faq-item {
    background: #fff;
    margin-bottom: 16px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,.06);
  }

  .faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 24px;
    cursor: pointer;
    font-weight: 600;
  }

  .faq-answer {
    padding: 0 24px 18px;
    color: #555;
  }

  .icon {
    transition: transform .3s;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .3s ease;
  }

  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
</style>
