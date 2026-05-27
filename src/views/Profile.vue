<!--
  【个人中心】用户资料展示与编辑页
  功能：头像上传、用户名/邮箱/手机显示、违规记录查看
  交互：上传头像 → 实时更新全局Store → 所有页面头像同步
  角色：所有登录用户
-->
<template>
  <div class="profile-page">
    <!-- 头部导航 -->
    <Header />

    <!-- 主内容区域 -->
    <main class="page-content">
      <div class="container">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1 class="page-title">个人资料</h1>
          <div class="page-actions">
            <button 
              class="edit-btn"
              @click="toggleEditMode"
              :disabled="isSubmitting"
            >
              <i class="fa fa-pencil" v-if="!isEditing"></i>
              <i class="fa fa-times" v-if="isEditing"></i>
              <span v-if="!isEditing">编辑资料</span>
              <span v-if="isEditing">取消编辑</span>
            </button>
          </div>
        </div>

        <!-- 个人资料卡片 -->
        <div class="profile-card">
          <!-- 头像区域 -->
          <div class="avatar-section">
            <div class="avatar-container">
              <img 
                :src="avatarPreview" 
                alt="用户头像" 
                class="profile-avatar"
              >
              <div class="avatar-overlay" v-if="isEditing">
                <label class="change-avatar-btn">
                  <i class="fa fa-camera"></i>
                  <span>更换头像</span>
                  <input 
                    type="file" 
                    class="avatar-input" 
                    accept="image/*"
                    @change="handleAvatarChange"
                  >
                </label>
              </div>
            </div>
            <div class="user-status">
              <h2 class="user-name">{{ form.username }}</h2>
              <div class="user-level">
                <span class="level-badge">{{ userLevel }}</span>
                <span class="member-since">会员 since {{ memberSince }}</span>
              </div>
            </div>
          </div>

          <!-- 个人信息表单 -->
          <form class="profile-form" @submit.prevent="handleSubmit">
            <div class="form-grid">
              <!-- 基本信息 -->
              <div class="form-section">
                <h3 class="section-title">基本信息</h3>
                <div class="form-group">
                  <label for="username" class="form-label">用户名</label>
                  <input
                    type="text"
                    id="username"
                    v-model="form.username"
                    :disabled="!isEditing"
                    :class="{'form-input': true, 'disabled-input': !isEditing, 'error-input': errors.username}"
                    maxlength="20"
                  >
                  <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
                </div>
                <div class="form-group">
                  <label for="email" class="form-label">邮箱地址</label>
                  <input
                    type="email"
                    id="email"
                    v-model="form.email"
                    :disabled="!isEditing"
                    :class="{'form-input': true, 'disabled-input': !isEditing, 'error-input': errors.email}"
                  >
                  <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
                </div>
                <div class="form-group">
                  <label for="phone" class="form-label">手机号码</label>
                  <input
                    type="tel"
                    id="phone"
                    v-model="form.phone"
                    :disabled="!isEditing"
                    :class="{'form-input': true, 'disabled-input': !isEditing, 'error-input': errors.phone}"
                    placeholder="选填"
                  >
                  <p v-if="errors.phone" class="error-message">{{ errors.phone }}</p>
                </div>
              </div>

              <!-- 个人简介 -->
              <div class="form-section">
                <h3 class="section-title">个人简介</h3>
                <div class="form-group">
                  <label for="bio" class="form-label">简介</label>
                  <textarea
                    id="bio"
                    v-model="form.bio"
                    :disabled="!isEditing"
                    :class="{'form-textarea': true, 'disabled-input': !isEditing}"
                    rows="4"
                    maxlength="150"
                    placeholder="简单介绍一下自己吧"
                  ></textarea>
                  <p class="char-count">{{ form.bio.length }}/150</p>
                </div>
                <div class="form-group">
                  <label for="gamePreference" class="form-label">偏好游戏</label>
                  <select
                    id="gamePreference"
                    v-model="form.gamePreference"
                    :disabled="!isEditing"
                    :class="{'form-select': true, 'disabled-input': !isEditing}"
                  >
                    <option value="">请选择偏好游戏</option>
                    <option value="delta">三角洲行动</option>
                    <option value="pubg">绝地求生</option>
                    <option value="cod">使命召唤</option>
                    <option value="apex">Apex英雄</option>
                    <option value="other">其他游戏</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 风控与账号状态 -->
            <div class="form-section violation-section" v-if="userStore.profile?.status">
              <h3 class="section-title"><i class="fa fa-shield"></i> 账号安全与风控</h3>
              <div class="status-banner" :class="'status-' + userStore.profile?.status.toLowerCase()">
                <div class="status-icon">
                  <i class="fa" :class="{
                    'fa-check-circle': userStore.profile?.status === 'ACTIVE',
                    'fa-exclamation-triangle': userStore.profile?.status === 'RESTRICTED',
                    'fa-ban': userStore.profile?.status === 'BANNED'
                  }"></i>
                </div>
                <div class="status-content">
                  <h4>当前账号状态：{{ 
                    userStore.profile?.status === 'ACTIVE' ? '正常' : 
                    (userStore.profile?.status === 'RESTRICTED' ? '功能受限' : '已封禁') 
                  }}</h4>
                  <p v-if="userStore.profile?.status === 'RESTRICTED'">您的账号目前无法下单、接单或申请结算。请查看下方违规记录或联系客服申诉。</p>
                  <p v-else-if="userStore.profile?.status === 'BANNED'">您的账号已被永久封禁，无法使用平台任何功能。</p>
                  <p v-else>账号状态良好，感谢您遵守平台规范。</p>
                </div>
              </div>
              
              <div class="violation-stats">
                <div class="v-stat">
                  <span>累计违规次数</span>
                  <strong :class="{'text-red': (userStore.profile?.violationCount || 0) > 0}">{{ userStore.profile?.violationCount || 0 }} 次</strong>
                </div>
                <div class="v-stat">
                  <span>风险评级</span>
                  <strong :class="{'text-red': userStore.profile?.isHighRisk, 'text-green': !userStore.profile?.isHighRisk}">
                    {{ userStore.profile?.isHighRisk ? '高风险' : '低风险' }}
                  </strong>
                </div>
                <button type="button" class="view-violation-btn" @click="showViolations = true">
                  查看违规记录与申诉
                </button>
              </div>
            </div>

            <!-- 安全设置 -->
            <div class="security-section">
              <h3 class="section-title">安全设置</h3>
              <div class="security-item">
                <div class="security-info">
                  <h4 class="security-title">修改密码</h4>
                  <p class="security-desc">建议定期更换密码以保障账户安全</p>
                </div>
                <router-link to="/profile/change-password" class="security-action">
                  前往修改
                  <i class="fa fa-arrow-right"></i>
                </router-link>
              </div>
              <div class="security-item">
                <div class="security-info">
                  <h4 class="security-title">绑定手机</h4>
                  <p class="security-desc" v-if="form.phone">已绑定: {{ maskPhone(form.phone) }}</p>
                  <p class="security-desc" v-else>未绑定手机，绑定后可用于登录和找回密码</p>
                </div>
                <button 
                  type="button"
                  class="security-action"
                  @click="isEditing ? handleBindPhone() : null"
                  :disabled="!isEditing"
                >
                  {{ form.phone ? '更换绑定' : '立即绑定' }}
                  <i class="fa fa-arrow-right"></i>
                </button>
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions" v-if="isEditing">
              <button 
                type="button"
                class="cancel-btn"
                @click="toggleEditMode"
                :disabled="isSubmitting"
              >
                取消
              </button>
              <button 
                type="submit"
                class="submit-btn"
                :disabled="isSubmitting"
              >
                <span v-if="!isSubmitting">保存修改</span>
                <span v-if="isSubmitting" class="loading">
                  <i class="fa fa-spinner fa-spin"></i> 保存中...
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- 账户统计 -->
        <div class="stats-card">
          <h3 class="section-title">账户统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ stats.completedOrders }}</span>
              <span class="stat-label">已完成订单</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.totalSpent }}</span>
              <span class="stat-label">累计消费 (元)</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.averageRating }}</span>
              <span class="stat-label">平均评分</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.membershipDays }}</span>
              <span class="stat-label">会员天数</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 违规记录弹窗 -->
    <div v-if="showViolations" class="modal-backdrop" @click.self="showViolations = false">
      <div class="modal-dialog violation-modal">
        <div class="modal-header">
          <h3>我的违规记录</h3>
          <button class="close-btn" @click="showViolations = false"><i class="fa fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div v-if="loadingViolations" class="text-center p-4">加载中...</div>
          <div v-else-if="myViolations.length === 0" class="text-center p-4 text-gray">暂无违规记录，请继续保持良好的行为习惯。</div>
          <ul v-else class="violation-list">
            <li v-for="v in myViolations" :key="v.id" class="violation-item">
              <div class="v-header">
                <span class="v-type">{{ getViolationTypeText(v.type) }}</span>
                <span class="v-date">{{ new Date(v.createdAt).toLocaleString() }}</span>
                <span class="v-status" :class="'v-status-' + v.status.toLowerCase()">{{ getViolationStatusText(v.status) }}</span>
              </div>
              <p class="v-desc">{{ v.description }}</p>
              
              <div v-if="v.status === 'PENDING'" class="v-actions">
                <button class="btn btn-primary btn-sm" @click="openAppeal(v)">提起申诉</button>
              </div>
              
              <div v-if="v.appealReason" class="v-appeal-box">
                <strong>您的申诉：</strong>
                <p>{{ v.appealReason }}</p>
              </div>
              
              <div v-if="v.adminAction" class="v-result-box">
                <strong>处理结果：{{ getAdminActionText(v.adminAction) }}</strong>
                <p v-if="v.adminNotes">{{ v.adminNotes }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 申诉弹窗 -->
    <div v-if="appealFor" class="modal-backdrop" @click.self="appealFor = null">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>违规申诉</h3>
          <button class="close-btn" @click="appealFor = null"><i class="fa fa-times"></i></button>
        </div>
        <div class="modal-body">
          <p class="mb-4 text-sm text-gray">针对违规事项：{{ getViolationTypeText(appealFor.type) }}<br>{{ appealFor.description }}</p>
          <div class="form-group">
            <label class="form-label">申诉理由</label>
            <textarea v-model="appealReason" class="form-textarea" rows="4" placeholder="请详细描述您的申诉理由，如果有相关证据（如订单截图、聊天记录）请联系客服提交，并在此处说明..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="appealFor = null">取消</button>
          <button class="btn btn-primary" @click="submitAppeal">提交申诉</button>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="showSuccessToast" class="success-toast" role="alert">
      <i class="fa fa-check-circle"></i>
      <span>{{ successMessage }}</span>
    </div>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { resolvePublicFileUrl } from '../api/publicUrl'
import { violationApi, type ViolationRecord } from '../api/violationApi'

// 导入组件
import Header from '../layouts/Header.vue'
import Footer from '../layouts/Footer.vue'

const userStore = useUserStore()

// 状态管理
const isEditing = ref(false)
const isSubmitting = ref(false)
const showSuccessToast = ref(false)
const successMessage = ref('')

const userLevel = ref('白银会员')
const memberSince = ref('2023年5月')

const showViolations = ref(false)
const loadingViolations = ref(false)
const myViolations = ref<ViolationRecord[]>([])
const appealFor = ref<ViolationRecord | null>(null)
const appealReason = ref('')

// 表单数据
const form = reactive({
  username: '',
  email: '',
  phone: '',
  avatar: 'https://picsum.photos/id/237/200/200',
  bio: '',
  gamePreference: ''
});

// 错误信息
const errors = reactive({
  username: '',
  email: '',
  phone: ''
});

// 账户统计
const stats = reactive({
  completedOrders: 12,
  totalSpent: 1580,
  averageRating: 4.8,
  membershipDays: 168
});

const DEFAULT_AVATAR = 'https://picsum.photos/id/237/200/200'

/** 头像展示：相对路径拼 API 根地址 */
const avatarPreview = computed(() => {
  const raw = form.avatar?.trim()
  if (!raw) return userStore.resolvedAvatarUrl
  if (raw.startsWith('data:') || raw.startsWith('http')) return raw
  return resolvePublicFileUrl(raw) || DEFAULT_AVATAR
})

const loadFormFromStore = () => {
  const p = userStore.profile
  if (!p) return
  form.username = p.username
  form.email = p.email
  form.phone = p.phone || ''
  form.avatar = p.avatar || ''
  form.bio = p.bio || ''
  form.gamePreference = p.gamePreference || ''
}

// 进入页面拉取服务端最新资料（与账户设置等页共用 store）
const initUserProfile = async () => {
  try {
    await userStore.loadUserFromServer()
    loadFormFromStore()
  } catch (e) {
    console.error('加载个人资料失败:', e)
    loadFormFromStore()
  }
}

// 切换编辑模式
const toggleEditMode = () => {
  if (isSubmitting.value) return

  const wasEditing = isEditing.value
  isEditing.value = !isEditing.value

  if (wasEditing) {
    loadFormFromStore()
  }

  if (!isEditing.value) {
    Object.keys(errors).forEach((key) => {
      errors[key as keyof typeof errors] = ''
    })
  }
}

// 选择图片后立即上传并写入资料，全站头像统一
const handleAvatarChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    input.value = ''
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小请不超过 2MB')
    input.value = ''
    return
  }

  try {
    await userStore.uploadAvatarFile(file)
    loadFormFromStore()
    showSuccessToast.value = true
    successMessage.value = '头像已上传并保存'
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)
  } catch (err) {
    console.error(err)
    alert('头像上传失败，请稍后重试')
  } finally {
    input.value = ''
  }
}

// 表单验证
const validateForm = (): boolean => {
  let isValid = true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^1[3-9]\d{9}$/;
  
  // 重置错误
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
  
  // 验证用户名
  if (!form.username.trim()) {
    errors.username = '请输入用户名';
    isValid = false;
  } else if (form.username.length < 3 || form.username.length > 20) {
    errors.username = '用户名长度必须在3-20个字符之间';
    isValid = false;
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    errors.username = '用户名只能包含字母、数字和下划线';
    isValid = false;
  }
  
  // 验证邮箱
  if (!form.email.trim()) {
    errors.email = '请输入邮箱地址';
    isValid = false;
  } else if (!emailRegex.test(form.email)) {
    errors.email = '请输入有效的邮箱地址';
    isValid = false;
  }
  
  // 验证手机号（如果填写）
  if (form.phone && !phoneRegex.test(form.phone)) {
    errors.phone = '请输入有效的手机号码';
    isValid = false;
  }
  
  return isValid;
};

// 处理表单提交
const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    await userStore.saveProfile({
      username: form.username,
      email: form.email,
      phone: form.phone || undefined,
      avatar: form.avatar,
      bio: form.bio,
      gamePreference: form.gamePreference
    })
    loadFormFromStore()
    isEditing.value = false
    Object.keys(errors).forEach((key) => {
      errors[key as keyof typeof errors] = ''
    })

    showSuccessToast.value = true
    successMessage.value = '个人资料更新成功'
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)
  } catch (error) {
    console.error('更新资料失败:', error)
    alert('更新资料失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

// 处理绑定手机
const handleBindPhone = () => {
  // 实际项目中这里会打开绑定手机的弹窗或页面
  alert('绑定手机功能将在后续版本中实现');
};

// 格式化手机号（中间四位用*代替）
const maskPhone = (phone: string) => {
  if (!phone) return '';
  return phone.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1****$3');
};

function getViolationStatusText(status: string) {
  switch (status) {
    case 'PENDING': return '待处理/可申诉'
    case 'APPEALED': return '申诉审核中'
    case 'RESOLVED': return '已处理'
    default: return status
  }
}

function getViolationTypeText(type: string) {
  switch (type) {
    case 'FAKE_ORDER': return '虚假下单'
    case 'MALICIOUS_REFUND': return '恶意退款'
    case 'ILLEGAL_ACCEPT': return '违规接单'
    case 'IMPROPER_SERVICE': return '不规范服务'
    default: return type
  }
}

function getAdminActionText(action: string) {
  switch (action) {
    case 'WARNING': return '警告'
    case 'RESTRICT': return '限制功能'
    case 'BAN': return '封禁账号'
    case 'DISMISS': return '撤销违规'
    default: return action
  }
}

async function loadMyViolations() {
  loadingViolations.value = true
  try {
    myViolations.value = await violationApi.getMyViolations()
  } catch (e) {
    console.error('获取违规记录失败', e)
  } finally {
    loadingViolations.value = false
  }
}

function openAppeal(v: ViolationRecord) {
  appealFor.value = v
  appealReason.value = ''
}

async function submitAppeal() {
  if (!appealFor.value || !appealReason.value.trim()) {
    alert('请填写申诉理由')
    return
  }
  try {
    await violationApi.submitAppeal(appealFor.value.id, appealReason.value.trim())
    showSuccessToast.value = true
    successMessage.value = '申诉提交成功，请等待处理'
    appealFor.value = null
    await loadMyViolations()
    setTimeout(() => { showSuccessToast.value = false }, 3000)
  } catch (e: any) {
    alert(e.message || '申诉提交失败')
  }
}

// 页面加载时初始化
onMounted(() => {
  initUserProfile();
  loadMyViolations();
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: var(--m-bg);
  color: var(--m-text);
}

.page-content {
  padding: 2rem 0 4rem;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--m-border);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--m-text);
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--m-accent);
  color: white;
  border: none;
  border-radius: var(--m-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--m-transition);
}

.edit-btn:hover:not(:disabled) {
  background-color: var(--m-accent-hover);
}

.edit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-btn i {
  font-size: 0.875rem;
}

.profile-card {
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  border: 1px solid var(--m-border);
  padding: 2rem;
  margin-bottom: 2rem;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--m-border);
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid var(--m-accent);
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--m-transition);
  cursor: pointer;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.change-avatar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  cursor: pointer;
}

.change-avatar-btn i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.change-avatar-btn span {
  font-size: 0.875rem;
  font-weight: 500;
}

.avatar-input {
  display: none;
}

.user-status {
  flex: 1;
}

.user-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--m-text);
}

.user-level {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.level-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: var(--m-accent-light);
  color: var(--m-accent);
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid var(--m-border);
}

.member-since {
  color: var(--m-text-secondary);
  font-size: 0.875rem;
}

.profile-form {
  margin-top: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-section {
  background-color: var(--m-bg);
  border-radius: var(--m-radius);
  padding: 1.5rem;
  border: 1px solid var(--m-border);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: var(--m-text);
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: var(--m-accent);
  margin-right: 0.75rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--m-text-secondary);
  font-size: 0.875rem;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: var(--m-radius-sm);
  background-color: var(--m-bg);
  border: 1px solid var(--m-border);
  color: var(--m-text);
  font-size: 1rem;
  transition: all var(--m-transition);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--m-accent);
  box-shadow: 0 0 0 3px var(--m-accent-light);
}

.form-textarea {
  resize: vertical;
}

.disabled-input {
  background-color: var(--m-bg-tertiary);
  cursor: not-allowed;
  color: var(--m-text-muted);
}

.error-input {
  border-color: var(--m-danger) !important;
}

.error-input:focus {
  box-shadow: 0 0 0 3px var(--m-danger-light) !important;
}

.error-message {
  margin: 0.25rem 0 0 0;
  color: var(--m-danger);
  font-size: 0.75rem;
}

.char-count {
  margin: 0.25rem 0 0 0;
  color: var(--m-text-muted);
  font-size: 0.75rem;
  text-align: right;
}

.security-section {
  background-color: var(--m-bg);
  border-radius: var(--m-radius);
  padding: 1.5rem;
  border: 1px solid var(--m-border);
  margin-bottom: 2rem;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--m-border);
}

.security-item:last-child {
  border-bottom: none;
}

.security-info {
  flex: 1;
}

.security-title {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: var(--m-text);
}

.security-desc {
  margin: 0;
  color: var(--m-text-secondary);
  font-size: 0.875rem;
}

.security-action {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--m-accent);
  text-decoration: none;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: var(--m-radius-sm);
  transition: background-color var(--m-transition);
}

.security-action:hover {
  background-color: var(--m-accent-light);
}

.security-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--m-bg-tertiary);
  color: var(--m-text);
  border: none;
  border-radius: var(--m-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--m-transition);
}

.cancel-btn:hover:not(:disabled) {
  background-color: var(--m-border);
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--m-accent);
  color: white;
  border: none;
  border-radius: var(--m-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--m-transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--m-accent-hover);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading i {
  animation: spin 1s linear infinite;
}

.stats-card {
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  border: 1px solid var(--m-border);
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  background-color: var(--m-bg);
  border-radius: var(--m-radius);
  padding: 1.5rem;
  text-align: center;
  border: 1px solid var(--m-border);
  transition: transform var(--m-transition), box-shadow var(--m-transition);
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--m-shadow-md);
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--m-accent);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--m-text-secondary);
  font-size: 0.875rem;
}

.violation-section {
  border-color: var(--m-danger-light) !important;
  background-color: var(--m-danger-light) !important;
}

.status-banner {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--m-radius-sm);
  margin-bottom: 1.5rem;
}

.status-active {
  background: var(--m-success-light);
  border: 1px solid var(--m-success);
}

.status-active i { color: var(--m-success); }

.status-restricted {
  background: var(--m-warning-light);
  border: 1px solid var(--m-warning);
}

.status-restricted i { color: var(--m-warning); }

.status-banned {
  background: var(--m-danger-light);
  border: 1px solid var(--m-danger);
}

.status-banned i { color: var(--m-danger); }

.status-icon {
  font-size: 2rem;
  padding-top: 0.25rem;
}

.status-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: var(--m-text);
}

.status-content p {
  margin: 0;
  color: var(--m-text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.violation-stats {
  display: flex;
  gap: 2rem;
  align-items: center;
  background: var(--m-bg);
  padding: 1rem 1.5rem;
  border-radius: var(--m-radius-sm);
}

.v-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.v-stat span {
  font-size: 0.8rem;
  color: var(--m-text-secondary);
}

.v-stat strong {
  font-size: 1.25rem;
  color: var(--m-text);
}

.text-red { color: var(--m-danger); }
.text-green { color: var(--m-success); }

.view-violation-btn {
  margin-left: auto;
  background: transparent;
  border: 1px solid var(--m-accent);
  color: var(--m-accent);
  padding: 0.5rem 1rem;
  border-radius: var(--m-radius-sm);
  cursor: pointer;
  transition: all var(--m-transition);
}

.view-violation-btn:hover {
  background: var(--m-accent-light);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-dialog {
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius);
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.violation-modal {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--m-border);
}

.modal-header h3 {
  margin: 0;
  color: var(--m-text);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--m-text-muted);
  cursor: pointer;
  font-size: 1.25rem;
}

.close-btn:hover { color: var(--m-text); }

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--m-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: var(--m-radius-sm);
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--m-accent);
  color: white;
}

.btn-primary:hover {
  background: var(--m-accent-hover);
}

.btn-ghost {
  background: transparent;
  border-color: var(--m-border);
  color: var(--m-text);
}

.btn-ghost:hover {
  background: var(--m-bg-tertiary);
}

.violation-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.violation-item {
  background: var(--m-bg);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  padding: 1rem;
}

.v-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.v-type {
  font-weight: 600;
  color: var(--m-danger);
}

.v-date {
  font-size: 0.8rem;
  color: var(--m-text-muted);
}

.v-status {
  margin-left: auto;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--m-radius-sm);
}

.v-status-pending {
  background: var(--m-warning-light);
  color: var(--m-warning);
}

.v-status-appealed {
  background: var(--m-accent-light);
  color: var(--m-accent);
}

.v-status-resolved {
  background: var(--m-success-light);
  color: var(--m-success);
}

.v-desc {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--m-text);
}

.v-appeal-box {
  background: var(--m-accent-light);
  padding: 0.75rem;
  border-radius: var(--m-radius-sm);
  border-left: 3px solid var(--m-accent);
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.v-appeal-box p {
  margin: 0.25rem 0 0;
  color: var(--m-accent);
}

.v-result-box {
  background: var(--m-success-light);
  padding: 0.75rem;
  border-radius: var(--m-radius-sm);
  border-left: 3px solid var(--m-success);
  font-size: 0.85rem;
}

.v-result-box p {
  margin: 0.25rem 0 0;
  color: var(--m-success);
}

.text-center { text-align: center; }
.p-4 { padding: 1rem; }
.text-gray { color: var(--m-text-muted); }
.text-sm { font-size: 0.875rem; }
.mb-4 { margin-bottom: 1rem; }

.success-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: var(--m-success);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--m-radius-sm);
  box-shadow: var(--m-shadow-lg);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: fadeInUp 0.3s ease forwards;
}

.success-toast i {
  font-size: 1.25rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .user-level {
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .violation-stats {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .view-violation-btn {
    margin-left: 0;
    width: 100%;
  }
}
</style>
    