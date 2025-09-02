<template>
  <footer class="sigma_footer sigma_footer-dark style-5 pb-0">
    <div class="sigma_footer-middle">
      <div class="container">
        <div class="row">
          <div class="col-lg-4">
            <div class="sigma_footer-widget">
              <div class="sigma_footer-logo mb-4">
                <img src="@/assets/img/NX-lims logo-w.png" alt="logo">
              </div>
              <div class="row">
                <div class="col-sm-9">
                  <p class="mb-0">
                    All rights are reserved by the owner of this webpage.
                    No part of this webpage may be reproduced, distributed, or transmitted in any form or by any means without the prior written consent of the owner.
                  </p>
                </div>
              </div>
              <ul class="sigma_sm square has-border mt-4 justify-content-start">
                <li>
                  <a href="#"><i class="fab fa-facebook-f"></i></a>
                </li>
                <li>
                  <a href="#"><i class="fab fa-twitter"></i></a>
                </li>
                <li>
                  <a href="#"><i class="fab fa-instagram"></i></a>
                </li>
                <li>
                  <a href="#"><i class="fab fa-linkedin"></i></a>
                </li>
                <li>
                  <a href="#"><i class="fab fa-google"></i></a>
                </li>
              </ul>
            </div>
          </div>
          <div class="col-lg-3 col-sm-3">
            <div class="sigma_footer-widget">
              <h5 class="widget-title">Services</h5>
              <ul class="sigma_footer-links">
                <li>
                  <router-link to="#">Services</router-link>
                </li>
                <li>
                  <router-link to="#">Portfolio</router-link>
                </li>
                <li>
                  <router-link to="#">Ecommerce</router-link>
                </li>
                <li>
                  <router-link to="#">Wishlist</router-link>
                </li>
                <li>
                  <router-link to="/team">Team</router-link>
                </li>
              </ul>
            </div>
          </div>
          <div class="col-lg-2 col-sm-3">
            <div class="sigma_footer-widget">
              <h5 class="widget-title">Solution</h5>
              <ul class="sigma_footer-links">
                <li>
                  <router-link to="#">Home</router-link>
                </li>
                <li>
                  <router-link to="#">About</router-link>
                </li>
                <li>
                  <router-link to="#">Blog</router-link>
                </li>
                <li>
                  <router-link to="#">FAQ</router-link>
                </li>
                <li>
                  <router-link to="#">Contacts</router-link>
                </li>
              </ul>
            </div>
          </div>
          <div class="col-lg-3 col-sm-6">
            <div class="sigma_footer-widget">
              <h5 class="widget-title">Subscribe</h5>
              <form @submit.prevent="subscribe">
                <input type="email" v-model="email" class="form-control" placeholder="Email">
                <button type="submit"style="background-color:#3364d5" class="sigma_btn-custom mt-3 btn-block">Subscribe</button>
                <p class="mb-0 mt-3">Get The Latest Updates via email. Any time you may unsubscribe</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="sigma_footer-bottom mt-0 d-block d-sm-flex align-items-center justify-content-between">
        <div class="sigma_footer-copyright mt-0 mb-3 mb-sm-0">
          <p class="mb-0">© 2025 | All Rights Reserved.</p>
        </div>
        <ul class="sigma_footer-links">
          <li>
            <router-link to="#">Privacy</router-link>
          </li>
          <li>
            <router-link to="#">Terms</router-link>
          </li>
          <li>
            <router-link to="#">Sitemap</router-link>
          </li>
          <li>
            <router-link to="#">Help</router-link>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<script>export default {
  name: 'Footer',
  data() {
    return {
      email: ''
    };
  },
  methods: {
    subscribe() {
      // Handle subscription logic here
      alert('Thank you for subscribing!');
    }
  }
};</script>

<style scoped>
  .sigma_btn-custom::before {
    background-color: #18086a;
  }
</style>
