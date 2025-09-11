<template>
  <Header />
  <div class="sigma_subheader dark-overlay dark-overlay-2" :style="{ backgroundImage: `url(${imgUrl})` }">

    <div class="container">
      <div class="sigma_subheader-inner">
        <div class="sigma_subheader-text">
          <h1>Instruction Manual</h1>
          <p>
            Creative Laboratory &amp;<br>
            Our Motto: "Add value. Inspire trust."
          </p>
        </div>
      </div>
    </div>

  </div>
  <!-- ===== FAQ Section Start ===== -->
  <div class="container-fluid" style="background-color: #f7f7f7;">
    <section class="section-faq">
      <h2>What should I do in the review interface?</h2>
    </section>
    <p>
      <h6>进入选定的买家界面，输入申请单的报告号(ReportNumber),选择买家套餐,点击[Confirm]按钮打印出测试项目</h6>
    </p>
    <!-- ===== FAQ Section End ===== -->
    <div>
    </div>
    <div class="container-fluid" style="background-color: #f7f7f7; padding:60px 0">



    </div>

  </div>
  <Footer />
</template>

<script setup>
  import Footer from '@/components/Layout/Footer.vue';
  import Header from '@/components/Layout/Header.vue';
  import { ref } from 'vue'
  import imgUrl from '@/assets/img/scale_1200.png';
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
    transition: transform .6s;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .6s ease;
  }

  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
</style>
