<template>
  <div class="profileLayout">
    <!-- ============ 左侧 30%：个人信息 ============ -->
    <el-card class="profileCard" shadow="never">
      <div class="avatarBlock">
        <el-avatar :size="96" :src="user.avatar">
          {{ user.name.charAt(0).toUpperCase() }}
        </el-avatar>
        <div class="userName">{{ user.name }}</div>
        <div class="userRole">{{ user.role }}</div>
        <div class="userEmail">{{ user.email }}</div>
        <el-tag size="small" type="success" effect="light" style="margin-top: 8px">
          {{ user.status }}
        </el-tag>
      </div>

      <el-divider />

      <div class="infoList">
        <div class="infoItem">
          <span class="infoLabel">User ID</span>
          <span class="infoValue">{{ user.id }}</span>
        </div>
        <div class="infoItem">
          <span class="infoLabel">Department</span>
          <span class="infoValue">{{ user.department }}</span>
        </div>
        <div class="infoItem">
          <span class="infoLabel">Site</span>
          <span class="infoValue">{{ user.site }}</span>
        </div>
        <div class="infoItem">
          <span class="infoLabel">Phone</span>
          <span class="infoValue">{{ user.phone }}</span>
        </div>
        <div class="infoItem">
          <span class="infoLabel">Last Login</span>
          <span class="infoValue">{{ user.lastLogin }}</span>
        </div>
        <div class="infoItem">
          <span class="infoLabel">Joined</span>
          <span class="infoValue">{{ user.joinedAt }}</span>
        </div>
      </div>

      <el-divider />

      <div class="statsRow">
        <div class="statItem">
          <div class="statValue">{{ stats.tasks }}</div>
          <div class="statLabel">Tasks</div>
        </div>
        <div class="statItem">
          <div class="statValue">{{ stats.datasheets }}</div>
          <div class="statLabel">Datasheets</div>
        </div>
        <div class="statItem">
          <div class="statValue">{{ stats.reports }}</div>
          <div class="statLabel">Reports</div>
        </div>
      </div>

      <el-button class="logoutBtn" type="danger" plain @click="onLogout">
        Logout
      </el-button>
    </el-card>

    <!-- ============ 右侧 70%：Settings ============ -->
    <div class="settingsPanel">
      <el-tabs v-model="activeTab" class="settingsTabs">
        <!-- ========== 外观 ========== -->
        <el-tab-pane label="Appearance" name="appearance">
          <el-card shadow="never" class="sectionCard">
            <template #header>
              <div class="sectionHeader">
                <el-icon><Brush /></el-icon>
                <span>Appearance</span>
              </div>
            </template>

            <el-form label-width="180px" label-position="left">
              <el-form-item label="Theme">
                <el-radio-group v-model="settings.theme">
                  <el-radio-button label="light">Light</el-radio-button>
                  <el-radio-button label="dark">Dark</el-radio-button>
                  <el-radio-button label="auto">Auto</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="Primary Color">
                <el-color-picker v-model="settings.primaryColor" />
                <span class="hintText" style="margin-left: 8px">{{ settings.primaryColor }}</span>
              </el-form-item>

              <el-form-item label="Font Size">
                <el-slider v-model="settings.fontSize" :min="12" :max="20" :step="1" show-input style="max-width: 420px" />
              </el-form-item>

              <el-form-item label="Font Family">
                <el-select v-model="settings.fontFamily" style="width: 260px">
                  <el-option label="System Default" value="system" />
                  <el-option label="Segoe UI" value="segoe" />
                  <el-option label="Arial" value="arial" />
                  <el-option label="Roboto" value="roboto" />
                  <el-option label="Courier New" value="courier" />
                </el-select>
              </el-form-item>

              <el-form-item label="Compact Mode">
                <el-switch v-model="settings.compactMode" />
                <span class="hintText" style="margin-left: 8px">减少行间距与内边距</span>
              </el-form-item>

              <el-form-item label="Sidebar Width">
                <el-radio-group v-model="settings.sidebarWidth">
                  <el-radio-button label="narrow">Narrow</el-radio-button>
                  <el-radio-button label="default">Default</el-radio-button>
                  <el-radio-button label="wide">Wide</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="Animations">
                <el-switch v-model="settings.animations" />
                <span class="hintText" style="margin-left: 8px">关闭后减少过渡与动效</span>
              </el-form-item>
            </el-form>

            <div class="previewBox">
              <div class="previewTitle">Live Preview</div>
              <div class="previewContent"
                   :style="{
                     fontSize: settings.fontSize + 'px',
                     fontFamily: previewFontFamily,
                     background: settings.theme === 'dark' ? '#1f1f1f' : '#fafafa',
                     color: settings.theme === 'dark' ? '#e5e5e5' : '#303133'
                   }">
                <el-tag :color="settings.primaryColor" effect="dark" style="color:#fff">
                  Primary
                </el-tag>
                <span style="margin-left: 12px">The quick brown fox jumps over the lazy dog.</span>
              </div>
            </div>
          </el-card>
        </el-tab-pane>

        <!-- ========== 通知 ========== -->
        <el-tab-pane label="Notifications" name="notifications">
          <el-card shadow="never" class="sectionCard">
            <template #header>
              <div class="sectionHeader">
                <el-icon><Bell /></el-icon>
                <span>Notifications</span>
              </div>
            </template>

            <el-form label-width="200px" label-position="left">
              <el-form-item label="Email Notifications">
                <el-switch v-model="settings.notifyEmail" />
              </el-form-item>
              <el-form-item label="Desktop Notifications">
                <el-switch v-model="settings.notifyDesktop" />
              </el-form-item>
              <el-form-item label="Task Completed">
                <el-switch v-model="settings.notifyTaskDone" />
              </el-form-item>
              <el-form-item label="Task Failed">
                <el-switch v-model="settings.notifyTaskFailed" />
              </el-form-item>
              <el-form-item label="Merge PDF Ready">
                <el-switch v-model="settings.notifyMerged" />
              </el-form-item>
              <el-form-item label="Weekly Summary">
                <el-switch v-model="settings.notifyWeekly" />
              </el-form-item>
              <el-form-item label="Notification Frequency">
                <el-radio-group v-model="settings.notifyFrequency">
                  <el-radio-button label="instant">Instant</el-radio-button>
                  <el-radio-button label="hourly">Hourly</el-radio-button>
                  <el-radio-button label="daily">Daily</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="Quiet Hours">
                <el-time-picker
                  v-model="settings.quietHours"
                  is-range
                  range-separator="To"
                  start-placeholder="Start"
                  end-placeholder="End"
                  format="HH:mm"
                />
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- ========== 语言与区域 ========== -->
        <el-tab-pane label="Language & Region" name="language">
          <el-card shadow="never" class="sectionCard">
            <template #header>
              <div class="sectionHeader">
                <el-icon><Location /></el-icon>
                <span>Language & Region</span>
              </div>
            </template>

            <el-form label-width="200px" label-position="left">
              <el-form-item label="Language">
                <el-select v-model="settings.language" style="width: 260px">
                  <el-option label="English" value="en" />
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="繁體中文" value="zh-TW" />
                </el-select>
              </el-form-item>
              <el-form-item label="Time Zone">
                <el-select v-model="settings.timezone" style="width: 260px">
                  <el-option label="UTC+08:00 (Asia/Shanghai)" value="Asia/Shanghai" />
                  <el-option label="UTC+09:00 (Asia/Tokyo)" value="Asia/Tokyo" />
                  <el-option label="UTC+00:00 (UTC)" value="UTC" />
                </el-select>
              </el-form-item>
              <el-form-item label="Date Format">
                <el-radio-group v-model="settings.dateFormat">
                  <el-radio-button label="YYYY-MM-DD">YYYY-MM-DD</el-radio-button>
                  <el-radio-button label="DD/MM/YYYY">DD/MM/YYYY</el-radio-button>
                  <el-radio-button label="MM/DD/YYYY">MM/DD/YYYY</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="Time Format">
                <el-radio-group v-model="settings.timeFormat">
                  <el-radio-button label="24h">24h</el-radio-button>
                  <el-radio-button label="12h">12h</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="Number Format">
                <el-radio-group v-model="settings.numberFormat">
                  <el-radio-button label="1,234.56">1,234.56</el-radio-button>
                  <el-radio-button label="1.234,56">1.234,56</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- ========== 编辑器 ========== -->
        <el-tab-pane label="Editor" name="editor">
          <el-card shadow="never" class="sectionCard">
            <template #header>
              <div class="sectionHeader">
                <el-icon><EditPen /></el-icon>
                <span>Editor Preferences</span>
              </div>
            </template>

            <el-form label-width="200px" label-position="left">
              <el-form-item label="Default Editor Mode">
                <el-radio-group v-model="settings.editorMode">
                  <el-radio-button label="edit">Edit</el-radio-button>
                  <el-radio-button label="view">View</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="Auto Save">
                <el-switch v-model="settings.autoSave" />
                <span class="hintText" style="margin-left: 8px">每 30 秒自动保存一次</span>
              </el-form-item>
              <el-form-item label="Auto Save Interval">
                <el-slider v-model="settings.autoSaveInterval" :min="10" :max="300" :step="10" show-input style="max-width: 420px" />
              </el-form-item>
              <el-form-item label="Spell Check">
                <el-switch v-model="settings.spellCheck" />
              </el-form-item>
              <el-form-item label="Show Line Numbers">
                <el-switch v-model="settings.lineNumbers" />
              </el-form-item>
              <el-form-item label="Confirm Before Close">
                <el-switch v-model="settings.confirmClose" />
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- ========== 数据与隐私 ========== -->
        <el-tab-pane label="Data & Privacy" name="privacy">
          <el-card shadow="never" class="sectionCard">
            <template #header>
              <div class="sectionHeader">
                <el-icon><Lock /></el-icon>
                <span>Data & Privacy</span>
              </div>
            </template>

            <el-form label-width="220px" label-position="left">
              <el-form-item label="Usage Analytics">
                <el-switch v-model="settings.analytics" />
                <span class="hintText" style="margin-left: 8px">帮助我们改进产品</span>
              </el-form-item>
              <el-form-item label="Crash Reports">
                <el-switch v-model="settings.crashReports" />
              </el-form-item>
              <el-form-item label="Show Email in Profile">
                <el-switch v-model="settings.showEmail" />
              </el-form-item>
              <el-form-item label="Show Phone in Profile">
                <el-switch v-model="settings.showPhone" />
              </el-form-item>
              <el-form-item label="Data Export">
                <el-button @click="onExportData">
                  <el-icon><Download /></el-icon>
                  <span style="margin-left: 6px">Export My Data</span>
                </el-button>
              </el-form-item>
              <el-form-item label="Delete Account">
                <el-button type="danger" plain @click="onDeleteAccount">
                  Delete Account
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- ========== 安全 ========== -->
        <el-tab-pane label="Security" name="security">
          <el-card shadow="never" class="sectionCard">
            <template #header>
              <div class="sectionHeader">
                <el-icon><Key /></el-icon>
                <span>Security</span>
              </div>
            </template>

            <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-width="180px" label-position="left">
              <el-form-item label="Current Password" prop="currentPassword">
                <el-input v-model="pwdForm.currentPassword" type="password" show-password style="max-width: 320px" />
              </el-form-item>
              <el-form-item label="New Password" prop="newPassword">
                <el-input v-model="pwdForm.newPassword" type="password" show-password style="max-width: 320px" />
              </el-form-item>
              <el-form-item label="Confirm Password" prop="confirmPassword">
                <el-input v-model="pwdForm.confirmPassword" type="password" show-password style="max-width: 320px" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="savingPwd" @click="onChangePassword">
                  Update Password
                </el-button>
              </el-form-item>
            </el-form>

            <el-divider />

            <el-form label-width="220px" label-position="left">
              <el-form-item label="Two-Factor Authentication">
                <el-switch v-model="settings.twoFactor" />
                <span class="hintText" style="margin-left: 8px">启用后登录需额外验证</span>
              </el-form-item>
              <el-form-item label="Session Timeout">
                <el-select v-model="settings.sessionTimeout" style="width: 200px">
                  <el-option label="15 minutes" :value="15" />
                  <el-option label="30 minutes" :value="30" />
                  <el-option label="1 hour" :value="60" />
                  <el-option label="Never" :value="0" />
                </el-select>
              </el-form-item>
              <el-form-item label="Active Sessions">
                <div class="sessionList">
                  <div v-for="s in sessions" :key="s.id" class="sessionItem">
                    <div class="sessionMain">
                      <div class="sessionDevice">{{ s.device }}</div>
                      <div class="sessionMeta">{{ s.location }} · {{ s.lastActive }}</div>
                    </div>
                    <el-tag v-if="s.current" type="success" size="small">Current</el-tag>
                    <el-button v-else size="small" type="danger" plain @click="onRevokeSession(s)">
                      Revoke
                    </el-button>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- ========== Feedback ========== -->
        <el-tab-pane label="Feedback" name="feedback">
          <el-card shadow="never" class="sectionCard">
            <template #header>
              <div class="sectionHeader">
                <el-icon><ChatDotRound /></el-icon>
                <span>Feedback</span>
              </div>
            </template>

            <el-form :model="feedbackForm" :rules="feedbackRules" ref="feedbackFormRef" label-width="180px" label-position="left">
              <el-form-item label="Feedback Type" prop="type">
                <el-radio-group v-model="feedbackForm.type">
                  <el-radio-button label="bug">Bug Report</el-radio-button>
                  <el-radio-button label="feature">Feature Request</el-radio-button>
                  <el-radio-button label="other">Other</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="Title" prop="title">
                <el-input v-model="feedbackForm.title" placeholder="简要描述问题" style="max-width: 480px" />
              </el-form-item>
              <el-form-item label="Description" prop="description">
                <el-input
                  v-model="feedbackForm.description"
                  type="textarea"
                  :rows="5"
                  placeholder="请详细描述你遇到的问题或建议"
                  style="max-width: 720px"
                />
              </el-form-item>
              <el-form-item label="Contact Email">
                <el-input v-model="feedbackForm.email" style="max-width: 320px" />
              </el-form-item>
              <el-form-item label="Attachments">
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :limit="3"
                  :on-change="onFeedbackFileChange"
                  :on-remove="onFeedbackFileRemove"
                >
                  <el-button>
                    <el-icon><Upload /></el-icon>
                    <span style="margin-left: 6px">Select Files</span>
                  </el-button>
                  <template #tip>
                    <div class="hintText">最多 3 个文件，单个不超过 5MB</div>
                  </template>
                </el-upload>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="submittingFeedback" @click="onSubmitFeedback">
                  Submit Feedback
                </el-button>
                <el-button @click="resetFeedback">Reset</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>
      </el-tabs>

      <!-- 全局保存栏 -->
      <div class="settingsFooter">
        <span class="hintText">修改将自动保存到本地（mock）。</span>
        <div>
          <el-button @click="resetAll">Reset to Default</el-button>
          <el-button type="primary" @click="onSaveAll">Save Settings</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Brush, Bell, Location, EditPen, Lock, Key,
  ChatDotRound, Download, Upload
} from '@element-plus/icons-vue'

/* ========== 用户信息（mock） ========== */
const user = reactive({
  id: 'U-20260810-001',
  name: 'John Doe',
  role: 'Lab Engineer',
  email: 'john.doe@example.com',
  avatar: '',
  status: 'Active',
  department: 'Softlines Lab',
  site: 'Ningbo',
  phone: '+86 138 0000 0000',
  lastLogin: '2026-10-08 09:12:33',
  joinedAt: '2024-03-15'
})

const stats = reactive({
  tasks: 128,
  datasheets: 542,
  reports: 87
})

/* ========== 设置项（mock，全部本地响应式） ========== */
const settings = reactive({
  // 外观
  theme: 'light',
  primaryColor: '#409EFF',
  fontSize: 14,
  fontFamily: 'system',
  compactMode: false,
  sidebarWidth: 'default',
  animations: true,

  // 通知
  notifyEmail: true,
  notifyDesktop: false,
  notifyTaskDone: true,
  notifyTaskFailed: true,
  notifyMerged: true,
  notifyWeekly: false,
  notifyFrequency: 'instant',
  quietHours: [new Date(2020, 0, 1, 22, 0), new Date(2020, 0, 2, 8, 0)],

  // 语言与区域
  language: 'en',
  timezone: 'Asia/Shanghai',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  numberFormat: '1,234.56',

  // 编辑器
  editorMode: 'edit',
  autoSave: true,
  autoSaveInterval: 30,
  spellCheck: true,
  lineNumbers: false,
  confirmClose: true,

  // 数据与隐私
  analytics: true,
  crashReports: true,
  showEmail: true,
  showPhone: false,

  // 安全
  twoFactor: false,
  sessionTimeout: 30
})

const previewFontFamily = computed(() => {
  switch (settings.fontFamily) {
    case 'segoe': return '"Segoe UI", sans-serif'
    case 'arial': return 'Arial, sans-serif'
    case 'roboto': return 'Roboto, sans-serif'
    case 'courier': return '"Courier New", monospace'
    default: return 'system-ui, -apple-system, sans-serif'
  }
})

/* ========== Tabs ========== */
const activeTab = ref('appearance')

/* ========== 修改密码 ========== */
const pwdFormRef = ref(null)
const savingPwd = ref(false)
const pwdForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const pwdRules = {
  currentPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '至少 8 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, cb) => {
        if (value !== pwdForm.newPassword) cb(new Error('两次输入不一致'))
        else cb()
      },
      trigger: 'blur'
    }
  ]
}

async function onChangePassword() {
  if (!pwdFormRef.value) return
  try {
    await pwdFormRef.value.validate()
  } catch { return }

  savingPwd.value = true
  try {
    // mock：实际应调后端 /user/change-password
    await new Promise(r => setTimeout(r, 800))
    ElMessage.success('密码已更新（mock）')
    pwdForm.currentPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
  } finally {
    savingPwd.value = false
  }
}

/* ========== 会话管理（mock） ========== */
const sessions = ref([
  { id: 's1', device: 'Chrome · Windows 11', location: 'Ningbo, CN', lastActive: '刚刚', current: true },
  { id: 's2', device: 'Edge · Windows 10', location: 'Shanghai, CN', lastActive: '2 小时前', current: false },
  { id: 's3', device: 'Safari · iPhone', location: 'Ningbo, CN', lastActive: '昨天', current: false }
])

async function onRevokeSession(s) {
  try {
    await ElMessageBox.confirm(`撤销 ${s.device} 的登录？`, 'Confirm', { type: 'warning' })
    sessions.value = sessions.value.filter(x => x.id !== s.id)
    ElMessage.success('已撤销')
  } catch { /* cancel */ }
}

/* ========== 数据导出 / 删除 ========== */
function onExportData() {
  ElMessage.success('数据导出请求已提交（mock）')
}

async function onDeleteAccount() {
  try {
    await ElMessageBox.confirm(
      '删除账户将不可恢复，确定继续？',
      'Delete Account',
      { type: 'error', confirmButtonText: 'Delete', cancelButtonText: 'Cancel' }
    )
    ElMessage.warning('账户删除请求已提交（mock）')
  } catch { /* cancel */ }
}

/* ========== Feedback ========== */
const feedbackFormRef = ref(null)
const submittingFeedback = ref(false)
const feedbackForm = reactive({
  type: 'bug',
  title: '',
  description: '',
  email: user.email,
  files: []
})

const feedbackRules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
}

function onFeedbackFileChange(file, fileList) {
  feedbackForm.files = fileList
}
function onFeedbackFileRemove(file, fileList) {
  feedbackForm.files = fileList
}

async function onSubmitFeedback() {
  if (!feedbackFormRef.value) return
  try {
    await feedbackFormRef.value.validate()
  } catch { return }

  submittingFeedback.value = true
  try {
    await new Promise(r => setTimeout(r, 800))
    ElMessage.success('感谢反馈！（mock）')
    resetFeedback()
  } finally {
    submittingFeedback.value = false
  }
}

function resetFeedback() {
  feedbackForm.type = 'bug'
  feedbackForm.title = ''
  feedbackForm.description = ''
  feedbackForm.files = []
}

/* ========== 退出 ========== */
async function onLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', 'Logout', { type: 'warning' })
    ElMessage.success('已退出（mock）')
  } catch { /* cancel */ }
}

/* ========== 保存 / 重置 ========== */
function onSaveAll() {
  // mock：实际应 POST 到后端
  ElMessage.success('设置已保存（mock）')
}

function resetAll() {
  ElMessageBox.confirm('恢复默认设置？', 'Confirm', { type: 'warning' })
    .then(() => {
      Object.assign(settings, {
        theme: 'light',
        primaryColor: '#409EFF',
        fontSize: 14,
        fontFamily: 'system',
        compactMode: false,
        sidebarWidth: 'default',
        animations: true,
        notifyEmail: true,
        notifyDesktop: false,
        notifyTaskDone: true,
        notifyTaskFailed: true,
        notifyMerged: true,
        notifyWeekly: false,
        notifyFrequency: 'instant',
        language: 'en',
        timezone: 'Asia/Shanghai',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        numberFormat: '1,234.56',
        editorMode: 'edit',
        autoSave: true,
        autoSaveInterval: 30,
        spellCheck: true,
        lineNumbers: false,
        confirmClose: true,
        analytics: true,
        crashReports: true,
        showEmail: true,
        showPhone: false,
        twoFactor: false,
        sessionTimeout: 30
      })
      ElMessage.success('已恢复默认')
    })
    .catch(() => {})
}

onMounted(() => {
  // mock：可在此加载远程 settings
})
</script>

<style scoped lang="scss">
.profileLayout {
  display: flex;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
  min-height: 100vh;
  background: #f5f7fa;
}

/* ============ 左侧 ============ */
.profileCard {
  flex: 0 0 30%;
  max-width: 360px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.avatarBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 16px 8px 8px;
}

.userName {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-top: 12px;
}

.userRole {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}

.userEmail {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  word-break: break-all;
}

.infoList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.infoItem {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.infoLabel {
  color: #909399;
  white-space: nowrap;
}

.infoValue {
  color: #303133;
  text-align: right;
  word-break: break-all;
}

.statsRow {
  display: flex;
  justify-content: space-around;
}

.statItem {
  text-align: center;
}

.statValue {
  font-size: 18px;
  font-weight: 700;
  color: #409eff;
}

.statLabel {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.logoutBtn {
  width: 100%;
  margin-top: 16px;
}

/* ============ 右侧 ============ */
.settingsPanel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settingsTabs {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 8px 16px 16px;
}

.sectionCard {
  border: none;
  box-shadow: none;
}

.sectionHeader {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.hintText {
  font-size: 12px;
  color: #909399;
}

.previewBox {
  margin-top: 16px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  padding: 12px 16px;
}

.previewTitle {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.previewContent {
  padding: 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

/* 会话 */
.sessionList {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.sessionItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 8px 12px;
}

.sessionMain {
  display: flex;
  flex-direction: column;
}

.sessionDevice {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.sessionMeta {
  font-size: 12px;
  color: #909399;
}

/* 底部保存栏 */
.settingsFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 12px 16px;
}

@media (max-width: 992px) {
  .profileLayout {
    flex-direction: column;
  }
  .profileCard {
    flex: none;
    max-width: 100%;
  }
}
</style>
