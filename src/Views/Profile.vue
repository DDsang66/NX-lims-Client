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
    <el-form :model="profile" label-width="160px" style="margin-top:10px ">
      <el-form-item label="名 称">
        <span v-show="!xiuGaiZiLiao">{{profile.userName}}</span>
        <el-input  v-model="profile2.name" v-if="xiuGaiZiLiao" style="width: 90%;"></el-input>
      </el-form-item>
      <el-form-item label="真实姓名">
        <span>{{profile.realName}}</span>
        <el-input  v-model="profile2.realName" v-if="xiuGaiZiLiao" style="width: 90%;"></el-input>
      </el-form-item>
      <el-form-item label="工 号">
        <span v-show="!xiuGaiZiLiao">{{profile.employeeId}}</span>
      </el-form-item>
      <el-form-item label="性 别">
        <span v-show="!xiuGaiZiLiao">{{profile.gender}}</span>
        <el-radio v-model="profile2.gender" label="男" v-if="xiuGaiZiLiao"></el-radio>
        <el-radio v-model="profile2.gender" label="女" v-if="xiuGaiZiLiao"></el-radio>
      </el-form-item>
      <el-form-item label="生 日">
        <span v-show="!xiuGaiZiLiao">{{profile.birth}}</span>
        <el-input-number  v-model="profile2.birth" :min="0" v-if="xiuGaiZiLiao"></el-input-number>
      </el-form-item>
      <el-form-item label="手机号">
        <span v-show="!xiuGaiZiLiao">{{profile.phone}}</span>
        <el-input  v-model="profile2.phone" v-if="xiuGaiZiLiao" style="width: 90%;"></el-input>
      </el-form-item>
      <el-form-item label="邮箱">
        <span>{{profile.email}}</span>
        <el-input  v-model="profile2.email" v-if="xiuGaiZiLiao" style="width: 90%;"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button v-show="!xiuGaiZiLiao" @click="xiuGaiZiLiao=true;profile2=profile">admend</el-button>
        <el-button type="primary" @click="xiuGaiZiLiao=false" v-show="xiuGaiZiLiao">cancle</el-button>
        <el-button type="primary" @click="onSubmit" v-show="xiuGaiZiLiao">commit</el-button>
      </el-form-item>
    </el-form>
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
