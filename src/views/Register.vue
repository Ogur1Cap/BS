<template>
  <div class="register-page">
    <!-- 注册卡片 -->
    <div class="register-card">
      <!-- 顶部品牌区域 -->
      <div class="brand-header">
        <div class="brand-decoration"></div>
        <h1 class="brand-title">账号注册</h1>
        <p class="brand-subtitle">加入三角洲行动俱乐部，享受专业服务</p>
      </div>

      <!-- 注册表单 -->
      <div class="form-container">
        <form @submit.prevent="handleRegister" class="register-form">
          <!-- 用户名输入 -->
          <div class="form-group">
            <label for="username" class="form-label">用户名</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <i class="fa fa-user"></i>
              </span>
              <input
                type="text"
                id="username"
                v-model="form.username"
                :class="{'input-error': errors.username}"
                class="form-input"
                placeholder="请设置用户名"
                required
              >
            </div>
            <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
          </div>

          <!-- 邮箱输入 -->
          <div class="form-group">
            <label for="email" class="form-label">邮箱</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <i class="fa fa-envelope"></i>
              </span>
              <input
                type="email"
                id="email"
                v-model="form.email"
                :class="{'input-error': errors.email}"
                class="form-input"
                placeholder="请输入邮箱地址"
                required
              >
            </div>
            <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
          </div>

          <!-- 密码输入 -->
          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <i class="fa fa-lock"></i>
              </span>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="form.password"
                :class="{'input-error': errors.password}"
                class="form-input"
                placeholder="请设置密码（至少6位）"
                required
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="toggle-password"
              >
                <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </button>
            </div>
            
            <!-- 密码强度指示器 -->
            <div v-if="form.password" class="password-strength">
              <div class="strength-bar">
                <div 
                  :class="passwordStrengthClass"
                  class="strength-indicator"
                  :style="{ width: passwordStrengthWidth }"
                ></div>
              </div>
              <p class="strength-text">{{ passwordStrengthText }}</p>
            </div>
            
            <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
          </div>

          <!-- 确认密码输入 -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">确认密码</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <i class="fa fa-lock"></i>
              </span>
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                v-model="form.confirmPassword"
                :class="{'input-error': errors.confirmPassword}"
                class="form-input"
                placeholder="请再次输入密码"
                required
              >
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="toggle-password"
              >
                <i :class="showConfirmPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</p>
          </div>

          <!-- 同意条款 -->
          <div class="terms-agreement">
            <div class="terms-checkbox">
              <input
                id="terms"
                v-model="form.agreeTerms"
                type="checkbox"
                :class="{'input-error': errors.agreeTerms}"
                class="terms-checkbox-input peer"
              >
              <div class="terms-checkbox-custom"></div>
            </div>
            <div class="terms-text">
              <label for="terms" class="terms-label">我已阅读并同意<a href="#" class="terms-link">服务条款</a>和<a href="#" class="terms-link">隐私政策</a></label>
              <p v-if="errors.agreeTerms" class="error-message">{{ errors.agreeTerms }}</p>
            </div>
          </div>

          <!-- 注册按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="register-button"
          >
            <span v-if="!isLoading">注册账号</span>
            <span v-if="isLoading" class="loading-indicator">
              <i class="fa fa-spinner fa-spin mr-2"></i> 注册中...
            </span>
          </button>
        </form>

        <!-- 登录链接 -->
        <p class="login-prompt">
          已有账号?
          <a href="/login" class="login-link">立即登录</a>
        </p>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decorations">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

// 路由实例
const router = useRouter();

// 表单状态
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
});

// 错误信息
const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: ''
});

// 显示密码切换
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 加载状态
const isLoading = ref(false);

// 密码强度计算
const passwordStrength = computed(() => {
  if (form.password.length < 6) return 0;
  
  let strength = 1;
  
  // 包含数字
  if (/\d/.test(form.password)) strength++;
  
  // 包含小写字母
  if (/[a-z]/.test(form.password)) strength++;
  
  // 包含大写字母
  if (/[A-Z]/.test(form.password)) strength++;
  
  // 包含特殊字符
  if (/[^A-Za-z0-9]/.test(form.password)) strength++;
  
  return strength;
});

// 密码强度相关样式和文本
const passwordStrengthClass = computed(() => {
  switch (passwordStrength.value) {
    case 0: return 'strength-weak';
    case 1: return 'strength-weak';
    case 2: return 'strength-medium';
    case 3: return 'strength-good';
    case 4: return 'strength-strong';
    default: return 'strength-weak';
  }
});

const passwordStrengthWidth = computed(() => {
  return `${(passwordStrength.value / 4) * 100}%`;
});

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0: return '密码长度至少6位';
    case 1: return '弱密码：建议增加密码复杂度';
    case 2: return '中密码：可以增加大写字母或特殊字符';
    case 3: return '良好：再增加一种字符类型会更安全';
    case 4: return '强密码：非常安全的密码';
    default: return '';
  }
});

// 表单验证
const validateForm = (): boolean => {
  let isValid = true;
  
  // 重置错误信息
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
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址';
    isValid = false;
  }
  
  // 验证密码
  if (!form.password) {
    errors.password = '请输入密码';
    isValid = false;
  } else if (form.password.length < 6) {
    errors.password = '密码长度不能少于6位';
    isValid = false;
  }
  
  // 验证确认密码
  if (!form.confirmPassword) {
    errors.confirmPassword = '请再次输入密码';
    isValid = false;
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = '两次输入的密码不一致';
    isValid = false;
  }
  
  // 验证同意条款
  if (!form.agreeTerms) {
    errors.agreeTerms = '请阅读并同意服务条款和隐私政策';
    isValid = false;
  }
  
  return isValid;
};

// 处理注册
const handleRegister = async () => {
  // 表单验证
  if (!validateForm()) {
    return;
  }
  
  // 显示加载状态
  isLoading.value = true;
  
  try {
    // 模拟注册请求
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟注册成功，跳转到登录页
    router.push({
      path: '/login',
      query: { registered: 'true' }
    });
    
  } catch (error) {
    console.error('注册失败:', error);
    alert('注册失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 页面容器 */
.register-page {
  min-height: 100vh;
  background: linear-gradient(to bottom right, #111827, #1f2937);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
}

/* 注册卡片 */
.register-card {
  width: 100%;
  max-width: 28rem;
  background: rgba(31, 41, 55, 0.5);
  backdrop-filter: blur(0.25rem);
  border-radius: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid rgba(55, 65, 81, 0.5);
  transition: all 0.3s ease;
}

.register-card:hover {
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.25);
  border-color: rgba(59, 130, 246, 0.3);
}

/* 品牌头部 */
.brand-header {
  background: linear-gradient(to right, #2563eb, #4f46e5);
  padding: 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.brand-decoration {
  position: absolute;
  inset: 0;
  opacity: 0.1;
}

.brand-decoration::before,
.brand-decoration::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: white;
}

.brand-decoration::before {
  right: -2.5rem;
  top: -2.5rem;
  width: 10rem;
  height: 10rem;
}

.brand-decoration::after {
  left: 2.5rem;
  bottom: 1.25rem;
  width: 5rem;
  height: 5rem;
}

.brand-title {
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: bold;
  color: white;
  position: relative;
  z-index: 10;
}

.brand-subtitle {
  color: rgba(224, 242, 254, 0.8);
  margin-top: 0.25rem;
  position: relative;
  z-index: 10;
}

/* 表单容器 */
.form-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* 表单样式 */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(209, 213, 219, 0.8);
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 2.5rem;
  border-radius: 0.5rem;
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid rgba(55, 65, 81, 1);
  color: rgba(229, 231, 235, 1);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.input-error {
  border-color: #ef4444 !important;
}

.input-error:focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

.input-icon {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 0.875rem;
  color: rgba(156, 163, 175, 1);
}

.toggle-password {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding-right: 0.875rem;
  color: rgba(156, 163, 175, 1);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.toggle-password:hover {
  color: rgba(229, 231, 235, 1);
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* 密码强度指示器 */
.password-strength {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.strength-bar {
  height: 0.375rem;
  width: 100%;
  background-color: #374151;
  border-radius: 9999px;
  overflow: hidden;
}

.strength-indicator {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-weak {
  background-color: #ef4444;
}

.strength-medium {
  background-color: #f97316;
}

.strength-good {
  background-color: #eab308;
}

.strength-strong {
  background-color: #10b981;
}

.strength-text {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* 同意条款 */
.terms-agreement {
  display: flex;
  align-items: flex-start;
}

.terms-checkbox {
  position: relative;
  margin-top: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.terms-checkbox-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 2;
}

.terms-checkbox-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(156, 163, 175, 0.6);
  border-radius: 0.375rem;
  background: rgba(31, 41, 55, 0.5);
  transition: all 0.2s ease;
  position: relative;
}

.terms-checkbox-input:checked + .terms-checkbox-custom {
  border-color: #3b82f6;
  background: #3b82f6;
}

.terms-checkbox-input:checked + .terms-checkbox-custom::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0.5rem;
  height: 0.25rem;
  border: 2px solid white;
  border-top: none;
  border-right: none;
  transform: translate(-50%, -60%) rotate(-45deg);
}

.terms-checkbox-input:focus + .terms-checkbox-custom {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.terms-checkbox-input.input-error + .terms-checkbox-custom {
  border-color: #ef4444;
}

.terms-text {
  margin-left: 0.5rem;
  flex: 1;
}

.terms-label {
  font-size: 0.875rem;
  color: rgba(209, 213, 219, 0.8);
}

.terms-link {
  color: #93c5fd;
  transition: color 0.2s ease;
}

.terms-link:hover {
  color: #bfdbfe;
}

/* 注册按钮 */
.register-button {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(to right, #2563eb, #4f46e5);
  color: white;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.3s ease;
  transform: translateZ(0);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.register-button:hover {
  background: linear-gradient(to right, #1d4ed8, #4338ca);
  transform: scale(1.02);
}

.register-button:active {
  transform: scale(0.98);
}

.register-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5), 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-indicator {
  display: flex;
  align-items: center;
}

/* 登录提示 */
.login-prompt {
  text-align: center;
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.login-link {
  color: #93c5fd;
  font-weight: 500;
  margin-left: 0.25rem;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: #bfdbfe;
}

/* 背景装饰 */
.background-decorations {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: multiply;
  filter: blur(7rem);
  opacity: 0.2;
}

.blob-1 {
  top: -10rem;
  right: -10rem;
  width: 24rem;
  height: 24rem;
  background-color: #2563eb;
  animation: blob 7s infinite;
}

.blob-2 {
  top: 10rem;
  left: -5rem;
  width: 18rem;
  height: 18rem;
  background-color: #8b5cf6;
  animation: blob 7s infinite 2s;
}

.blob-3 {
  bottom: 10rem;
  right: 5rem;
  width: 20rem;
  height: 20rem;
  background-color: #ec4899;
  animation: blob 7s infinite 4s;
}

@keyframes blob {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(7.5rem, -12.5rem) scale(1.1); }
  66% { transform: translate(-5rem, 5rem) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
}
</style>