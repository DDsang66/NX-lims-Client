<template>
  <div class="profile-page">
    <!-- 顶部横幅 -->
    <div class="profile-banner">
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <div class="profile-avatar-container">
          <el-avatar :size="150" :src="avatarUrl" class="profile-avatar"></el-avatar>
          <div class="avatar-edit">
            <el-button type="primary" circle @click="handleAvatarUpload">
              <el-icon><Edit /></el-icon>
            </el-button>
            <input type="file" ref="avatarInput" style="display: none" @change="handleAvatarChange">
          </div>
        </div>
        <h1 class="profile-name">{{ name }}</h1>
        <p class="profile-title">{{ title }}</p>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.projects }}</span>
            <span class="stat-label">Projects</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.followers }}</span>
            <span class="stat-label">Followers</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.rating }}</span>
            <span class="stat-label">Rating</span>
          </div>
        </div>
        <!-- 修改这部分，添加一个包装器并调整样式 -->
        <div class="profile-actions">
          <el-button type="primary" @click="activeTab = 'edit'">Edit Profile</el-button>
          <el-button @click="handleShare">Share Profile</el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="profile-content">
      <el-row :gutter="24">
        <!-- 左侧边栏 -->
        <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="6">
          <div class="sidebar">
            <!-- 个人信息 -->
            <el-card class="info-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>About Me</span>
                  <el-button class="header-btn" text @click="activeTab = 'edit'">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </div>
              </template>
              <div class="info-content">
                <p class="bio">{{ bio }}</p>
                <div class="info-item">
                  <el-icon><Location /></el-icon>
                  <span>{{ location }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Message /></el-icon>
                  <span>{{ email }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Phone /></el-icon>
                  <span>{{ phone }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Calendar /></el-icon>
                  <span>Joined {{ joinDate }}</span>
                </div>
              </div>
            </el-card>

            <!-- 社交媒体 -->
            <el-card class="social-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>Social Media</span>
                </div>
              </template>
              <div class="social-links">
                <a v-for="(link, index) in socialLinks" :key="index" :href="link.url" target="_blank" class="social-link">
                  <el-icon :size="20"><component :is="link.icon" /></el-icon>
                  <span>{{ link.name }}</span>
                </a>
              </div>
            </el-card>

            <!-- 技能 -->
            <el-card class="skills-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>Skills</span>
                  <el-button class="header-btn" text @click="showAddSkillDialog = true">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </div>
              </template>
              <div class="skills-content">
                <div v-for="(skill, index) in skills" :key="index" class="skill-item">
                  <div class="skill-header">
                    <span class="skill-name">{{ skill.name }}</span>
                    <span class="skill-level">{{ skill.level }}%</span>
                  </div>
                  <el-progress :percentage="skill.level" :color="skill.color"></el-progress>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>

        <!-- 右侧内容区 -->
        <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18">
          <div class="main-content">
            <!-- 标签页 -->
            <el-tabs v-model="activeTab" class="profile-tabs">
              <!-- 作品集 -->
              <el-tab-pane label="Portfolio" name="portfolio">
                <div class="portfolio-grid">
                  <div v-for="(project, index) in projects" :key="index" class="project-card">
                    <el-card :body-style="{ padding: '0px' }" shadow="hover">
                      <div class="project-image" :style="{ backgroundImage: `url(${project.image})` }"></div>
                      <div class="project-content">
                        <h3 class="project-title">{{ project.title }}</h3>
                        <p class="project-description">{{ project.description }}</p>
                        <div class="project-tags">
                          <el-tag v-for="(tag, tagIndex) in project.tags" :key="tagIndex" size="small" type="info">
                            {{ tag }}
                          </el-tag>
                        </div>
                        <div class="project-actions">
                          <el-button type="primary" text @click="viewProject(project)">View Project</el-button>
                          <el-button text @click="likeProject(project)">
                            <el-icon><Star /></el-icon>
                            {{ project.likes }}
                          </el-button>
                        </div>
                      </div>
                    </el-card>
                  </div>
                </div>
              </el-tab-pane>

              <!-- 工作经历 -->
              <el-tab-pane label="Experience" name="experience">
                <el-timeline>
                  <el-timeline-item v-for="(exp, index) in experiences"
                                    :key="index"
                                    :timestamp="exp.period"
                                    placement="top"
                                    :type="index === 0 ? 'primary' : ''">
                    <el-card shadow="hover">
                      <h3 class="exp-position">{{ exp.position }}</h3>
                      <p class="exp-company">{{ exp.company }}</p>
                      <p class="exp-description">{{ exp.description }}</p>
                      <div class="exp-tags">
                        <el-tag v-for="(tag, tagIndex) in exp.tags" :key="tagIndex" size="small" type="success">
                          {{ tag }}
                        </el-tag>
                      </div>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </el-tab-pane>

              <!-- 评价 -->
              <el-tab-pane label="Reviews" name="reviews">
                <div class="reviews-container">
                  <div class="review-summary">
                    <div class="overall-rating">
                      <div class="rating-number">{{ averageRating }}</div>
                      <el-rate v-model="averageRating" disabled show-score text-color="#ff9900" score-template="{value}"></el-rate>
                      <div class="rating-count">{{ reviews.length }} reviews</div>
                    </div>
                    <div class="rating-breakdown">
                      <div v-for="i in 5" :key="i" class="rating-bar">
                        <span class="rating-label">{{ 6 - i }} stars</span>
                        <el-progress :percentage="getRatingPercentage(6 - i)" :show-text="false"></el-progress>
                        <span class="rating-count">{{ getRatingCount(6 - i) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="review-list">
                    <div v-for="(review, index) in reviews" :key="index" class="review-item">
                      <div class="review-header">
                        <el-avatar :size="40" :src="review.avatar"></el-avatar>
                        <div class="reviewer-info">
                          <div class="reviewer-name">{{ review.name }}</div>
                          <div class="review-date">{{ review.date }}</div>
                        </div>
                        <el-rate v-model="review.rating" disabled size="small"></el-rate>
                      </div>
                      <p class="review-text">{{ review.text }}</p>
                      <div class="review-actions">
                        <el-button text @click="helpfulReview(review)">
                          <el-icon><Select /></el-icon>
                          Helpful ({{ review.helpful }})
                        </el-button>
                        <el-button text @click="replyReview(review)">
                          <el-icon><ChatDotRound /></el-icon>
                          Reply
                        </el-button>
                      </div>
                    </div>
                  </div>

                  <div class="add-review">
                    <h3>Write a Review</h3>
                    <el-form :model="newReview" label-width="80px">
                      <el-form-item label="Rating">
                        <el-rate v-model="newReview.rating"></el-rate>
                      </el-form-item>
                      <el-form-item label="Your Review">
                        <el-input v-model="newReview.text"
                                  type="textarea"
                                  :rows="4"
                                  placeholder="Share your experience with this person"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <el-button type="primary" @click="submitReview">Submit Review</el-button>
                      </el-form-item>
                    </el-form>
                  </div>
                </div>
              </el-tab-pane>

              <!-- 编辑个人资料 -->
              <el-tab-pane label="Edit Profile" name="edit">
                <el-card shadow="hover">
                  <el-form :model="editForm" label-width="120px">
                    <el-form-item label="Full Name">
                      <el-input v-model="editForm.name"></el-input>
                    </el-form-item>
                    <el-form-item label="Title">
                      <el-input v-model="editForm.title"></el-input>
                    </el-form-item>
                    <el-form-item label="Email">
                      <el-input v-model="editForm.email"></el-input>
                    </el-form-item>
                    <el-form-item label="Phone">
                      <el-input v-model="editForm.phone"></el-input>
                    </el-form-item>
                    <el-form-item label="Location">
                      <el-input v-model="editForm.location"></el-input>
                    </el-form-item>
                    <el-form-item label="Bio">
                      <el-input v-model="editForm.bio"
                                type="textarea"
                                :rows="4"
                                placeholder="Tell us about yourself"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="saveProfile">Save Changes</el-button>
                      <el-button @click="activeTab = 'portfolio'">Cancel</el-button>
                    </el-form-item>
                  </el-form>
                </el-card>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 添加技能对话框 -->
    <el-dialog v-model="showAddSkillDialog" title="Add Skill" width="30%">
      <el-form :model="newSkill" label-width="80px">
        <el-form-item label="Skill Name">
          <el-input v-model="newSkill.name"></el-input>
        </el-form-item>
        <el-form-item label="Proficiency">
          <el-slider v-model="newSkill.level" :step="5" :max="100"></el-slider>
        </el-form-item>
        <el-form-item label="Color">
          <el-color-picker v-model="newSkill.color"></el-color-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddSkillDialog = false">Cancel</el-button>
          <el-button type="primary" @click="addSkill">Add</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加项目对话框 -->
    <el-dialog v-model="showAddProjectDialog" title="Add Project" width="50%">
      <el-form :model="newProject" label-width="100px">
        <el-form-item label="Project Title">
          <el-input v-model="newProject.title"></el-input>
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="newProject.description"
                    type="textarea"
                    :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="Tags">
          <el-select v-model="newProject.tags"
                     multiple
                     filterable
                     allow-create
                     placeholder="Select or create tags"
                     style="width: 100%">
            <el-option v-for="tag in availableTags"
                       :key="tag"
                       :label="tag"
                       :value="tag"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Project Image">
          <el-upload action="#"
                     list-type="picture-card"
                     :auto-upload="false"
                     :on-change="handleProjectImageChange">
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddProjectDialog = false">Cancel</el-button>
          <el-button type="primary" @click="addProject">Add</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 项目详情对话框 -->
    <el-dialog v-model="showProjectDetailDialog" :title="currentProject.title" width="70%">
      <div class="project-detail">
        <div class="project-detail-image" :style="{ backgroundImage: `url(${currentProject.image})` }"></div>
        <div class="project-detail-content">
          <h3>{{ currentProject.title }}</h3>
          <p>{{ currentProject.description }}</p>
          <div class="project-tags">
            <el-tag v-for="(tag, index) in currentProject.tags" :key="index" size="small" type="info">
              {{ tag }}
            </el-tag>
          </div>
          <div class="project-stats">
            <div class="project-stat">
              <el-icon><View /></el-icon>
              <span>{{ currentProject.views }} views</span>
            </div>
            <div class="project-stat">
              <el-icon><Star /></el-icon>
              <span>{{ currentProject.likes }} likes</span>
            </div>
            <div class="project-stat">
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ currentProject.comments }} comments</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showProjectDetailDialog = false">Close</el-button>
          <el-button type="primary" @click="likeProject(currentProject)">
            <el-icon><Star /></el-icon>
            Like ({{ currentProject.likes }})
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, inject } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    Edit, Location, Message, Phone, Calendar, Plus, Star,
    Select, ChatDotRound, View, Share
  } from '@element-plus/icons-vue'

  // 模拟数据
  const avatarUrl = ref('https://picsum.photos/seed/avatar1/200/200.jpg')
  const name = ref('Your Name')
  const title = ref('Senior Frontend Developer')
  const bio = ref('Passionate about creating beautiful and functional web applications. With over 8 years of experience in frontend development, I specialize in Vue.js, React, and modern CSS frameworks.')
  const email = ref('alex.johnson@example.com')
  const phone = ref('+1 (555) 123-4567')
  const location = ref('San Francisco, CA')
  const joinDate = ref('January 2020')

  const stats = ref({
    projects: 24,
    followers: 1.2,
    rating: 4.8
  })

  const socialLinks = ref([
    { name: 'GitHub', icon: 'Github', url: 'https://github.com' },
    { name: 'LinkedIn', icon: 'Share', url: 'https://linkedin.com' },
    { name: 'Twitter', icon: 'ChatDotRound', url: 'https://twitter.com' },
    { name: 'Dribbble', icon: 'Star', url: 'https://dribbble.com' }
  ])

  const skills = ref([
    { name: 'JavaScript', level: 95, color: '#f1e05a' },
    { name: 'Vue.js', level: 90, color: '#42b883' },
    { name: 'React', level: 85, color: '#61dafb' },
    { name: 'CSS/SASS', level: 90, color: '#563d7c' },
    { name: 'TypeScript', level: 80, color: '#3178c6' },
    { name: 'Node.js', level: 75, color: '#68a063' }
  ])

  const projects = ref([
    {
      id: 1,
      title: 'E-Commerce Dashboard',
      description: 'A comprehensive dashboard for managing e-commerce operations with real-time analytics and inventory tracking.',
      image: 'https://picsum.photos/seed/project1/400/300.jpg',
      tags: ['Vue.js', 'Element Plus', 'Chart.js'],
      likes: 42,
      views: 156,
      comments: 8
    },
    {
      id: 2,
      title: 'Social Media App',
      description: 'A social media platform with real-time messaging, content sharing, and community features.',
      image: 'https://picsum.photos/seed/project2/400/300.jpg',
      tags: ['React', 'Redux', 'Firebase'],
      likes: 38,
      views: 124,
      comments: 12
    },
    {
      id: 3,
      title: 'Task Management Tool',
      description: 'A collaborative task management application with kanban boards, time tracking, and team collaboration features.',
      image: 'https://picsum.photos/seed/project3/400/300.jpg',
      tags: ['Vue.js', 'Vuex', 'Node.js'],
      likes: 56,
      views: 210,
      comments: 15
    },
    {
      id: 4,
      title: 'Weather Forecast App',
      description: 'A beautiful weather forecast application with location-based forecasts, interactive maps, and severe weather alerts.',
      image: 'https://picsum.photos/seed/project4/400/300.jpg',
      tags: ['React', 'OpenWeather API', 'Mapbox'],
      likes: 34,
      views: 98,
      comments: 6
    },
    {
      id: 5,
      title: 'Fitness Tracker',
      description: 'A comprehensive fitness tracking application with workout plans, progress tracking, and nutrition guidance.',
      image: 'https://picsum.photos/seed/project5/400/300.jpg',
      tags: ['Vue.js', 'Chart.js', 'PWA'],
      likes: 48,
      views: 175,
      comments: 10
    },
    {
      id: 6,
      title: 'Travel Booking Platform',
      description: 'A travel booking platform with flight and hotel search, itinerary planning, and travel guides.',
      image: 'https://picsum.photos/seed/project6/400/300.jpg',
      tags: ['React', 'Node.js', 'MongoDB'],
      likes: 62,
      views: 245,
      comments: 18
    }
  ])

  const experiences = ref([
    {
      position: 'Senior Frontend Developer',
      company: 'Tech Solutions Inc.',
      period: '2021 - Present',
      description: 'Leading the frontend team in developing and maintaining the company\'s main product. Implemented new features, improved performance, and mentored junior developers.',
      tags: ['Leadership', 'Vue.js', 'Performance Optimization']
    },
    {
      position: 'Frontend Developer',
      company: 'Digital Innovations LLC',
      period: '2018 - 2021',
      description: 'Developed responsive web applications for various clients. Worked closely with designers to implement pixel-perfect designs and collaborated with backend developers to integrate APIs.',
      tags: ['React', 'CSS3', 'API Integration']
    },
    {
      position: 'Junior Web Developer',
      company: 'Creative Web Agency',
      period: '2016 - 2018',
      description: 'Started as an intern and was promoted to junior developer. Built and maintained websites for small businesses, learned modern web development practices.',
      tags: ['HTML', 'CSS', 'JavaScript']
    }
  ])

  const reviews = ref([
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://picsum.photos/seed/user1/100/100.jpg',
      rating: 5,
      date: '2 weeks ago',
      text: 'Alex is an exceptional developer who consistently delivers high-quality work. His attention to detail and problem-solving skills are outstanding. I highly recommend working with him!',
      helpful: 12
    },
    {
      id: 2,
      name: 'Michael Chen',
      avatar: 'https://picsum.photos/seed/user2/100/100.jpg',
      rating: 5,
      date: '1 month ago',
      text: 'I\'ve had the pleasure of working with Alex on several projects, and he always exceeds expectations. His communication is clear, and he\'s always willing to go the extra mile to ensure the project is successful.',
      helpful: 8
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      avatar: 'https://picsum.photos/seed/user3/100/100.jpg',
      rating: 4,
      date: '2 months ago',
      text: 'Alex is a talented developer with a great eye for design. He transformed our outdated website into a modern, user-friendly platform. The only minor issue was some delays in the timeline, but the end result was worth it.',
      helpful: 5
    }
  ])

  // 计算属性
  const averageRating = computed(() => {
    if (reviews.value.length === 0) return 0
    const sum = reviews.value.reduce((total, review) => total + review.rating, 0)
    return (sum / reviews.value.length).toFixed(1)
  })

  // 方法
  const getRatingCount = (rating) => {
    return reviews.value.filter(review => review.rating === rating).length
  }

  const getRatingPercentage = (rating) => {
    if (reviews.value.length === 0) return 0
    const count = getRatingCount(rating)
    return Math.round((count / reviews.value.length) * 100)
  }

  // 表单数据
  const editForm = ref({
    name: name.value,
    title: title.value,
    email: email.value,
    phone: phone.value,
    location: location.value,
    bio: bio.value
  })

  const newSkill = ref({
    name: '',
    level: 50,
    color: '#409EFF'
  })

  const newProject = ref({
    title: '',
    description: '',
    tags: [],
    image: ''
  })

  const newReview = ref({
    rating: 5,
    text: ''
  })

  const availableTags = ref([
    'Vue.js', 'React', 'Angular', 'Node.js', 'JavaScript', 'TypeScript',
    'CSS3', 'HTML5', 'Python', 'Java', 'PHP', 'Ruby', 'Go', 'Swift',
    'UI/UX', 'Design', 'Frontend', 'Backend', 'Full Stack', 'DevOps',
    'Database', 'API', 'Mobile', 'Web', 'Desktop', 'Cloud', 'AI/ML'
  ])

  // 状态
  const activeTab = ref('portfolio')
  const showAddSkillDialog = ref(false)
  const showAddProjectDialog = ref(false)
  const showProjectDetailDialog = ref(false)
  const currentProject = ref({})
  const avatarInput = ref(null)

  // 方法
  const handleAvatarUpload = () => {
    avatarInput.value.click()
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        avatarUrl.value = e.target.result
        ElMessage.success('Avatar updated successfully')
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProfile = () => {
    name.value = editForm.value.name
    title.value = editForm.value.title
    email.value = editForm.value.email
    phone.value = editForm.value.phone
    location.value = editForm.value.location
    bio.value = editForm.value.bio

    ElMessage.success('Profile updated successfully')
    activeTab.value = 'portfolio'
  }

  const addSkill = () => {
    if (!newSkill.value.name) {
      ElMessage.error('Please enter a skill name')
      return
    }

    skills.value.push({
      name: newSkill.value.name,
      level: newSkill.value.level,
      color: newSkill.value.color
    })

    newSkill.value = {
      name: '',
      level: 50,
      color: '#409EFF'
    }

    showAddSkillDialog.value = false
    ElMessage.success('Skill added successfully')
  }

  const handleProjectImageChange = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      newProject.value.image = e.target.result
    }
    reader.readAsDataURL(file.raw)
  }

  const addProject = () => {
    if (!newProject.value.title || !newProject.value.description) {
      ElMessage.error('Please fill in all required fields')
      return
    }

    projects.value.unshift({
      id: Date.now(),
      title: newProject.value.title,
      description: newProject.value.description,
      image: newProject.value.image || 'https://picsum.photos/seed/newproject/400/300.jpg',
      tags: newProject.value.tags,
      likes: 0,
      views: 0,
      comments: 0
    })

    newProject.value = {
      title: '',
      description: '',
      tags: [],
      image: ''
    }

    showAddProjectDialog.value = false
    ElMessage.success('Project added successfully')
  }

  const viewProject = (project) => {
    currentProject.value = project
    showProjectDetailDialog.value = true
    // 增加查看次数
    project.views++
  }

  const likeProject = (project) => {
    project.likes++
    ElMessage.success(`You liked ${project.title}`)
  }

  const helpfulReview = (review) => {
    review.helpful++
    ElMessage.success('Review marked as helpful')
  }

  const replyReview = (review) => {
    ElMessage.info(`Reply to ${review.name}`)
  }

  const submitReview = () => {
    if (!newReview.value.text) {
      ElMessage.error('Please write a review')
      return
    }

    reviews.value.unshift({
      id: Date.now(),
      name: 'You',
      avatar: avatarUrl.value,
      rating: newReview.value.rating,
      date: 'Just now',
      text: newReview.value.text,
      helpful: 0
    })

    newReview.value = {
      rating: 5,
      text: ''
    }

    ElMessage.success('Review submitted successfully')
  }

  const handleShare = () => {
    ElMessage.success('Profile link copied to clipboard')
  }

  onMounted(() => {
    // 组件挂载时的初始化逻辑
  })
</script>

<style scoped>
  .profile-page {
    background-color: #f5f7fa;
    min-height: 100vh;
  }

  /* 顶部横幅 */
  .profile-banner {
    position: relative;
    height: 350px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin-bottom: -75px; /* 负值让内容区域上移 */
    overflow: hidden;
    z-index: 1; /* 添加z-index确保横幅在正确的层级 */
  }

  .banner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('https://picsum.photos/seed/banner/1920/600.jpg');
    background-size: cover;
    background-position: center;
    opacity: 0.2;
  }

  .banner-content {
    position: relative;
    z-index: 2; /* 提高内容区域的层级 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 20px;
    padding-bottom: 20px; /* 添加底部内边距 */
    color: white;
  }

  .profile-avatar-container {
    position: relative;
    margin-bottom: 15px;
  }

  .profile-avatar {
    border: 4px solid white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .avatar-edit {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }

  .profile-name {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 5px;
  }

  .profile-title {
    font-size: 1.1rem;
    margin-bottom: 20px;
    opacity: 0.9;
  }

  .profile-stats {
    display: flex;
    gap: 40px;
    margin-bottom: 20px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .stat-label {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .profile-actions {
    display: flex;
    gap: 15px;
    margin-top: 20px; /* 添加顶部外边距 */
    z-index: 3; /* 提高按钮的层级 */
  }

  .profile-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 40px;
    position: relative; /* 添加相对定位 */
    z-index: 2; /* 确保内容区域在横幅之上 */
  }

  .sidebar {
    margin-bottom: 20px;
    position: relative; /* 添加相对定位 */
    z-index: 2; /* 确保侧边栏在正确的层级 */
  }

  .info-card, .social-card, .skills-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-btn {
    padding: 0;
  }

  .info-content {
    padding: 10px 0;
  }

  .bio {
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    color: #606266;
  }

    .info-item .el-icon {
      margin-right: 8px;
      color: #909399;
    }

  .social-links {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .social-link {
    display: flex;
    align-items: center;
    padding: 8px 0;
    color: #606266;
    text-decoration: none;
    transition: color 0.3s;
  }

    .social-link:hover {
      color: #409EFF;
    }

    .social-link .el-icon {
      margin-right: 10px;
    }

  .skills-content {
    padding: 10px 0;
  }

  .skill-item {
    margin-bottom: 15px;
  }

  .skill-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }

  .skill-name {
    font-weight: 500;
  }

  .skill-level {
    color: #909399;
  }

  /* 右侧内容区 */
  .main-content {
    margin-bottom: 20px;
  }

  .profile-tabs {
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 20px;
  }

  /* 作品集 */
  .portfolio-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .project-card {
    transition: transform 0.3s;
  }

    .project-card:hover {
      transform: translateY(-5px);
    }

  .project-image {
    height: 200px;
    background-size: cover;
    background-position: center;
  }

  .project-content {
    padding: 15px;
  }

  .project-title {
    margin: 0 0 10px;
    font-size: 1.1rem;
  }

  .project-description {
    margin: 0 0 15px;
    color: #606266;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .project-tags {
    margin-bottom: 15px;
  }

    .project-tags .el-tag {
      margin-right: 5px;
      margin-bottom: 5px;
    }

  .project-actions {
    display: flex;
    justify-content: space-between;
  }

  /* 工作经历 */
  .exp-position {
    margin: 0 0 5px;
    font-size: 1.1rem;
  }

  .exp-company {
    margin: 0 0 10px;
    color: #606266;
    font-weight: 500;
  }

  .exp-description {
    margin: 0 0 15px;
    line-height: 1.6;
  }

  .exp-tags .el-tag {
    margin-right: 5px;
  }

  /* 评价 */
  .reviews-container {
    padding: 20px 0;
  }

  .review-summary {
    display: flex;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;
  }

  .overall-rating {
    width: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 30px;
  }

  .rating-number {
    font-size: 3rem;
    font-weight: 600;
    color: #409EFF;
  }

  .rating-count {
    margin-top: 5px;
    color: #909399;
  }

  .rating-breakdown {
    flex: 1;
  }

  .rating-bar {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .rating-label {
    width: 60px;
    font-size: 0.9rem;
  }

  .rating-count {
    width: 30px;
    text-align: right;
    font-size: 0.9rem;
    color: #909399;
  }

  .review-list {
    margin-bottom: 30px;
  }

  .review-item {
    padding: 20px;
    margin-bottom: 20px;
    background-color: #f9f9f9;
    border-radius: 4px;
  }

  .review-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }

  .reviewer-info {
    flex: 1;
    margin-left: 15px;
  }

  .reviewer-name {
    font-weight: 500;
  }

  .review-date {
    font-size: 0.9rem;
    color: #909399;
  }

  .review-text {
    margin: 0 0 15px;
    line-height: 1.6;
  }

  .review-actions {
    display: flex;
    gap: 20px;
  }

  .add-review {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 4px;
  }

  /* 项目详情 */
  .project-detail {
    display: flex;
    flex-direction: column;
  }

  .project-detail-image {
    height: 300px;
    background-size: cover;
    background-position: center;
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .project-detail-content h3 {
    margin: 0 0 15px;
  }

  .project-detail-content p {
    margin: 0 0 15px;
    line-height: 1.6;
  }

  .project-stats {
    display: flex;
    gap: 20px;
    margin-top: 20px;
  }

  .project-stat {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #606266;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .profile-banner {
      height: 300px;
    }

    .profile-name {
      font-size: 1.5rem;
    }

    .profile-stats {
      gap: 20px;
    }

    .review-summary {
      flex-direction: column;
    }

    .overall-rating {
      margin-right: 0;
      margin-bottom: 20px;
    }
  }


  .main-content {
    margin-bottom: 20px;
    position: relative; /* 添加相对定位 */
    z-index: 2; /* 确保主内容区在正确的层级 */
  }
</style>
