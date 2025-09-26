<template>
  <div class="profile-page">
    <!-- 头部导航 -->
    <Header 
      :current-user="currentUser" 
      :user-avatar="userAvatar"
      @logout="handleLogout"
    />

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
                :src="form.avatar" 
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
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

// 导入组件
import Header from '../layouts/Header.vue';
import Footer from '../layouts/Footer.vue';

// 路由实例
const router = useRouter();

// 状态管理
const isEditing = ref(false);
const isSubmitting = ref(false);
const showSuccessToast = ref(false);
const successMessage = ref('');

// 用户数据
const currentUser = ref<{ username: string } | undefined>(undefined);
const userAvatar = ref('https://picsum.photos/id/237/200/200');
const userLevel = ref('白银会员');
const memberSince = ref('2023年5月');

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

// 初始化用户数据
const initUserProfile = () => {
  // 从本地存储获取用户信息（实际项目中从API获取）
  const userStr = localStorage.getItem('delta_user') || sessionStorage.getItem('delta_user');
  if (userStr) {
    const userData = JSON.parse(userStr);
    currentUser.value = userData;
    
    // 模拟用户资料数据
    form.username = userData.username || '玩家_' + Math.floor(Math.random() * 10000);
    form.email = `user_${Math.floor(Math.random() * 10000)}@example.com`;
    form.avatar = userData.avatar || 'https://picsum.photos/id/237/200/200';
    userAvatar.value = form.avatar;
    
    // 模拟其他资料
    form.bio = '热爱游戏的玩家，擅长三角洲行动战术配合';
    form.gamePreference = 'delta';
  }
};

// 切换编辑模式
const toggleEditMode = () => {
  if (isSubmitting.value) return;
  
  isEditing.value = !isEditing.value;
  
  // 退出编辑模式时重置错误
  if (!isEditing.value) {
    Object.keys(errors).forEach(key => {
      errors[key as keyof typeof errors] = '';
    });
  }
};

// 处理头像上传
const handleAvatarChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // 简单验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    
    // 预览图片
    const reader = new FileReader();
    reader.onload = (event) => {
      form.avatar = event.target?.result as string;
      userAvatar.value = form.avatar;
      
      // 显示成功提示
      showSuccessToast.value = true;
      successMessage.value = '头像更新成功';
      
      // 3秒后隐藏提示
      setTimeout(() => {
        showSuccessToast.value = false;
      }, 3000);
      
      // 实际项目中这里会调用API上传图片
      console.log('上传头像:', file);
    };
    reader.readAsDataURL(file);
  }
};

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
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 更新本地存储的用户信息
    const userStr = localStorage.getItem('delta_user') || sessionStorage.getItem('delta_user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      userData.username = form.username;
      userData.avatar = form.avatar;
      
      if (localStorage.getItem('delta_user')) {
        localStorage.setItem('delta_user', JSON.stringify(userData));
      } else if (sessionStorage.getItem('delta_user')) {
        sessionStorage.setItem('delta_user', JSON.stringify(userData));
      }
      
      currentUser.value = userData;
    }
    
    // 切换到查看模式
    toggleEditMode();
    
    // 显示成功提示
    showSuccessToast.value = true;
    successMessage.value = '个人资料更新成功';
    
    // 3秒后隐藏提示
    setTimeout(() => {
      showSuccessToast.value = false;
    }, 3000);
    
  } catch (error) {
    console.error('更新资料失败:', error);
    alert('更新资料失败，请稍后重试');
  } finally {
    isSubmitting.value = false;
  }
};

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

// 处理登出
const handleLogout = () => {
  // 清除存储的登录信息
  localStorage.removeItem('delta_token');
  localStorage.removeItem('delta_user');
  sessionStorage.removeItem('delta_token');
  sessionStorage.removeItem('delta_user');
  
  // 跳转到登录页
  router.push('/login');
};

// 页面加载时初始化
onMounted(() => {
  initUserProfile();
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #111827;
  color: #f3f4f6;
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

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.5);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #f3f4f6;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.edit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-btn i {
  font-size: 0.875rem;
}

/* 个人资料卡片 */
.profile-card {
  background-color: #1f2937;
  border-radius: 1rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
  padding: 2rem;
  margin-bottom: 2rem;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
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
  border: 3px solid rgba(59, 130, 246, 0.3);
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(17, 24, 37, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
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
}

.user-level {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.level-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.member-since {
  color: #9ca3af;
  font-size: 0.875rem;
}

/* 表单样式 */
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
  background-color: rgba(17, 24, 37, 0.5);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgba(55, 65, 81, 0.3);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: #f3f4f6;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #3b82f6;
  margin-right: 0.75rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #d1d5db;
  font-size: 0.875rem;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background-color: rgba(17, 24, 37, 0.5);
  border: 1px solid #374151;
  color: #f3f4f6;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.form-textarea {
  resize: vertical;
}

.disabled-input {
  background-color: rgba(55, 65, 81, 0.2);
  cursor: not-allowed;
  color: #9ca3af;
}

.error-input {
  border-color: #ef4444 !important;
}

.error-input:focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

.error-message {
  margin: 0.25rem 0 0 0;
  color: #ef4444;
  font-size: 0.75rem;
}

.char-count {
  margin: 0.25rem 0 0 0;
  color: #6b7280;
  font-size: 0.75rem;
  text-align: right;
}

/* 安全设置区域 */
.security-section {
  background-color: rgba(17, 24, 37, 0.5);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgba(55, 65, 81, 0.3);
  margin-bottom: 2rem;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
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
  color: #f3f4f6;
}

.security-desc {
  margin: 0;
  color: #9ca3af;
  font-size: 0.875rem;
}

.security-action {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
}

.security-action:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.security-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: rgba(55, 65, 81, 0.3);
  color: #d1d5db;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover:not(:disabled) {
  background-color: rgba(55, 65, 81, 0.5);
  color: #f3f4f6;
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading i {
  animation: spin 1s linear infinite;
}

/* 统计卡片 */
.stats-card {
  background-color: #1f2937;
  border-radius: 1rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  background-color: rgba(17, 24, 37, 0.5);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(55, 65, 81, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #9ca3af;
  font-size: 0.875rem;
}

/* 成功提示 */
.success-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: #10b981;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: fadeInUp 0.3s ease forwards;
}

.success-toast i {
  font-size: 1.25rem;
}

/* 动画 */
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

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
    