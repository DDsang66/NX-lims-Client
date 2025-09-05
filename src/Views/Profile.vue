<template>
  <Header />
  <div class="sigma_subheader dark-overlay dark-overlay-2" style="background-image: url(/src/assets/img/scale_1200.png)">

    <div class="container">
      <div class="sigma_subheader-inner">
        <div class="sigma_subheader-text">
          <h1>Hello</h1>
          <p>
            Creative Laboratory &amp;<br>
            Our Motto: "Add value. Inspire trust."
          </p>
        </div>
      </div>
    </div>

  </div>
  <!-- ===== Profile Section Start ===== -->
  <section>

  </section>
  <!-- ===== Profile Section End ===== -->


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


</script>

<style scoped>

</style>
