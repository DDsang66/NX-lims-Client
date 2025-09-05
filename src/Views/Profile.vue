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

  <div class="row">
    <div class="col-xl-7">
      <section class="profile-container">
        <div class="sidebar">
          <div class="profile-picture-container">
            <img src="../assets/img/icon.png" alt="Profile Picture" class="profile-picture" />
          </div>
          <h2 class="profile-name">{{ name }}</h2>
          <nav class="nav-links">
            <ul>
              <li><a href="#info" @click="activeTab = 'info'" style="color:#ffffff">Info</a></li>
              <li><a href="#social" @click="activeTab = 'social'" style="color:#ffffff">Edit</a></li>
              <li><a href="#contact" @click="activeTab = 'contact'" style="color:#ffffff">Contact</a></li>
            </ul>
          </nav>
        </div>
        <div class="main-content">
          <div v-if="activeTab === 'info'" class="profile-info">
            <h1>{{ name }}</h1>
            <p><strong>Email:</strong> {{ email }}</p>
            <p><strong>Phone:</strong> {{ phone }}</p>
            <p><strong>Employee Id:</strong> {{ ep }}</p>
            <p><strong>Gender:</strong> {{ gender }}</p>
            <p><strong>Birth:</strong> {{ birth }}</p>
            <a :href="githubLink" target="_blank" class="social-link">GitHub</a>
            <a :href="linkedinLink" target="_blank" class="social-link">LinkedIn</a>


          </div>
          <div v-if="activeTab === 'social'" class="profile-social">
            <div class="row">
              <div class="col-lg-8">
                <div class="form-group">
                  <i class="far fa-user"></i>
                  <input type="text" placeholder="Employee Id" class="form-control"v-model="form.employeeId" name="employeeId">
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <i class="far fa-user"></i>
                  <input type="text" placeholder="Full Name" class="form-control"v-model="form.realName"name="realName">
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <i class="far fa-envelope"></i>
                  <input type="email" placeholder="Email" class="form-control" v-model="form.email"name="email">
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <i class="far fa-pencil"></i>
                  <input type="text" placeholder="Phone" class="form-control"v-model="form.phone" name="phone">
                </div>
              </div>

              <div class="col-lg-4">
                <div class="form-group">
                  <i class="far fa-user"></i>
                  <input type="text" placeholder="Gender" class="form-control" v-model="form.gender"name="gender">
                </div>
              </div>

              <div class="col-lg-8">
                <div class="form-group">
                  <input type="datetime-local" placeholder="Birthday" class="form-control"v-model="form.birth" name="birth">
                </div>
              </div>
              <div class="col-lg-8">
                <div class="form-group">
                  <input type="password" placeholder="ID Card" class="form-control"v-model="form.idCard" name="idCard">
                </div>
              </div>
              <div class="col-lg-3 form-group">
                <button type="button"
                        style="background-color:#3364d5"
                        class="sigma_btn-custom primary btn-block"
                        @click="edit">
                  Finish?
                </button>
              </div>
            </div>
            <div v-if="activeTab === 'contact'" class="profile-contact">
              <p><strong>Email:</strong> {{ email }}</p>
              <p><strong>Phone:</strong> {{ phone }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="col-xl-5">
    </div>
  </div>
    <!-- ===== Profile Section End ===== -->


    <Footer />
</template>

<script setup>
  import Footer from '@/components/Layout/Footer.vue';
  import Header from '@/components/Layout/Header.vue';
  import { useAuthStore } from '@/stores/auth';
  import { ref, computed, onMounted } from 'vue'
  import axios from '@/axios'


  const authStore = useAuthStore()
  console.log(authStore.user)
  const email = ref('');
  const phone = ref('');
  const ep = ref('');
  const gender = ref('');
  const birth = ref('');
  const name = computed(() => authStore.user || '')
  const githubLink = ref('https://github.com/your-github');
  const linkedinLink = ref('https://linkedin.com/in/your-linkedin');


  const form = ref({
    employeeId: ep.value,
    realName: name.value,
    email: '',
    phone: '',
    gender: '',
    birth: '',
    idCard: ''
  });


  const activeTab = ref('info'); // 默认显示 Info 选项卡

  const edit = async () => {
    console.log(form.value)
    try {
      const response = await axios.post('/profile/edit', form.value, {
        headers: {
          'Content-Type': 'application/json' // 明确设置请求头
        }
      });
      fetchProfileData();
      alert('Your profile information has been updated.');
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };


  const fetchProfileData = async () => {
    try {
      const response = await axios.post('/profile/render', name.value, {
          headers: {
            'Content-Type': 'application/json' // 明确设置请求头
          }
        }
      );
      if (response.status == 404)
      {
        email.value = "";
        phone.value = "";
        gender.value = "";
        ep.value = "";
        birth.value = "";
      }
      email.value = response.data.email;
      phone.value = response.data.phone;
      gender.value = response.data.gender;
      ep.value = response.data.employeeId;
      birth.value = response.data.birth;
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  onMounted(() => {
    fetchProfileData();
  });

</script>

<style scoped>
  .sigma_btn-custom::before {
    background-color: #18086a;
  }
  .profile-container {
    display: flex;
    max-width: 100%;
    max-height: 80vh;
    margin: 50px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color:#efeded;
  }

  .sidebar {
    background-color: rgba(0, 0, 0, 0.5);
    width: 40%;
    padding: 20px;
    border-right: 1px solid #ccc;
  }

  .profile-picture-container {
    width: 120px;
    height: 120px;
    border-radius: 60px;
    overflow: hidden;
    border: 4px solid rgba(0, 0, 0, 0.9);
    margin: 0 auto 20px;
    background-color:aliceblue;
  }

  .profile-picture {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .profile-name {
    text-align: center;
    margin-bottom: 20px;
    color:#ffffff;
  }

  .nav-links ul {
    color:#e1c2c2;
    list-style: none;
    padding: 0;
  }

  .nav-links li {
    margin-bottom: 10px;
    color:#ffffff;
  }

  .nav-links a {
    text-decoration: none;
    color: #007bff;
    display: block;
    padding: 5px;
    border-radius: 4px;
  }

    .nav-links a:hover {
      background-color: #f0f0f0;
    }

  .main-content {
    flex: 1;
    padding: 20px;
    flex-direction: column;
    justify-content: center; /* 垂直方向上居中内容 */
  }

  .profile-info, .profile-social, .profile-contact {
    margin-bottom: 20px;
  }

  .social-link {
    margin: 0 10px;
    text-decoration: none;
    color: #007bff;
  }

    .social-link:hover {
      text-decoration: underline;
    }
</style>
