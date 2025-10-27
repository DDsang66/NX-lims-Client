<template>
  <div class="line-left-flex-container this-header">
    <el-input v-model="searchContent" style="width: 200px"></el-input>
    <el-button @click="Search">Search</el-button>
    <el-button @click="provideFeedback" style="margin-left: auto">Provide Feedback</el-button>
  </div>
  <el-table :data="suggestionList" style="width: 100%" class="removeTableGaps" border>
    <el-table-column prop="type" label="Type" width="100"></el-table-column>
    <el-table-column prop="feedbackDetail" label="FeedbackContent"></el-table-column>
    <el-table-column prop="applicant" label="Applicant" width="200"></el-table-column>
    <el-table-column prop="updateTime" label="ApplicationTime" width="160" :formatter="globalFunctions.strTimeColumnFormatter">
    </el-table-column>
    <el-table-column prop="status" label="Status" width="100"></el-table-column>
    <el-table-column label="Operations" width="120">
      <template #default="scope">
        <el-button @click="viewDetails(scope.row)" type="primary" link>View Details</el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-dialog v-model="provideOpen" @closed="provideClosed" label-width="auto" width="50%">
    <el-form>
      <el-form-item label="Type">
        <el-radio-group v-model="feedbackForm.type">
          <el-radio value="suggestion" size="large">Suggestion</el-radio>
          <el-radio value="bug" size="large">Bug</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Content">
        <el-input v-model="feedbackForm.feedbackDetail" type="textarea" rows="5"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="provideOpen = false">Cancel</el-button>
      <el-button type="primary" @click="feedbackCommit">Submit</el-button>
    </template>
  </el-dialog>
  <el-dialog v-model="viewOpen" width="50%" >
    <el-descriptions
      style="margin-top: 10px"
      class="margin-top"
      :column="2"
      border
    >
      <el-descriptions-item>
        <template #label>
          Applicant
        </template>
        {{viewForm.applicant}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          ApplicationTime
        </template>
        {{globalFunctions.stringTimeFormat(viewForm.updateTime)}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            Type
          </div>
        </template>
        {{viewForm.type}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            Status
          </div>
        </template>
        {{viewForm.status}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            Content
          </div>
        </template>
        {{viewForm.feedbackDetail}}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup>
  import Footer from '@/components/Layout/Footer.vue';
  import Header from '@/components/Layout/Header.vue';
  import {ref, inject, reactive, onMounted} from 'vue'
  import imgUrl from '@/assets/img/scale_1200.png';
  const globalFunctions = inject('funcs');
const request=inject('request')
  const userAuth = inject('userAuthStore')
  const provideOpen = ref(false)
  const viewOpen = ref(false)
const openIdx = ref(null)
  const viewForm=ref({})
  const suggestionList = ref([
    {
      type: 'Bug',
      feedbackDetail: 'The system is not working properly.',
      applicant: 'admin',
      time: '2021-01-01 00:00:00',
      status:'Success'
    },
  ])

const feedbackForm = reactive({
  type :'',
  feedbackDetail :'',
  userId:userAuth.id
})
  function provideFeedback(){
    provideOpen.value = true
  }
  function provideClosed(){
    feedbackForm.type=''
    feedbackForm.feedbackDetail=''
    feedbackForm.userId=userAuth.id
  }
function toggle(idx) {
  openIdx.value = openIdx.value === idx ? null : idx
}
async function Search(){
    let req=await request.get('/feedback/get')
    if(req.data.success){
      suggestionList.value=req.data.data
    }else{
      alert(req.data.message)
    }
}
// 提交反馈
  async function  feedbackCommit(){
    //判断Subject和Message同时为空
    if(!feedbackForm.feedbackDetail){
      alert('Please enter the content.')
    }else {
      let req=await request.post('/feedback/post',feedbackForm)
      if(req.data.success){
        provideOpen.value = false
        feedbackForm.type=''
        feedbackForm.feedbackDetail=''
        alert('Feedback submitted successfully.')
        Search()
      }else{
        alert(req.data.message)
      }
    }
  }
  function viewDetails(row){
  viewOpen.value = true
    viewForm.value=row
  }
  onMounted(()=>{
    Search()
  })
// // 常见问题数据
// const faqList = ref([
//   {
//     q: 'How to register an account?',
//     a: 'Return to the login page, click [Sign Up], and fill in the username and password.'
//   },
//   {
//     q: 'What should I do if I forget my password?',
//     a: 'Click [Forgot password] on the login page to reset your password using your registered email or phone number.'
//   },
//   {
//     q: 'How to modify my permissions',
//     a: 'Please contact the administrator for modifications. Once approved, you will receive higher privileges.'
//   },
//     {
//     q: 'What should I do if my account is locked?',
//     a: 'Please contact the administrator to unfreeze your account, and then reset your password.'
//   },
// ])
</script>

<style scoped>
.this-header{
  margin-bottom: 10px;
}
/*去除表格标题和内容之间的空隙*/
.removeTableGaps :deep(table){
  margin-bottom: 0 !important;
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
    transition: transform .6s;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .6s ease;
  }

  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
</style>
