<template>
  <div class="login-container">
    <!-- 注册成功提示 -->
    <div v-if="showRegisterSuccess" class="success-toast" role="alert">
      注册成功，请登录
    </div>
    
    <!-- 动态背景粒子 -->
    <div class="particles-container">
      <div v-for="i in 20" :key="i" 
           class="particle"
           :style="getParticleStyle(i)"></div>
    </div>
    
    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 顶部品牌区域 -->
      <div class="brand-section">
        <!-- 动态光效 -->
        <div class="shimmer-effect"></div>
        <!-- 装饰圆点 -->
        <div class="decorative-dots">
          <div v-for="i in 8" :key="i" 
               class="decorative-dot"
               :style="getDotStyle(i)"></div>
        </div>
        <h1 class="brand-title">
          三角洲行动俱乐部
        </h1>
        <p class="brand-subtitle">专业护航服务 · 精英玩家社区</p>
        <!-- 装饰线条 -->
        <div class="decorative-line"></div>
      </div>

      <!-- 登录表单 -->
      <div class="form-container">
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- 用户名/邮箱输入 -->
          <div class="input-group">
            <label for="username" class="input-label">账号</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <i class="fa fa-user"></i>
              </span>
              <input
                type="text"
                id="username"
                v-model="form.username"
                :class="{'error-input': errors.username, 'normal-input': !errors.username}"
                class="text-input"
                placeholder="请输入用户名或邮箱"
                required
                @input="clearError('username')"
              >
              <!-- 输入框底部光效 -->
              <div class="input-glow"></div>
            </div>
            <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
          </div>

          <!-- 密码输入 -->
          <div class="input-group">
            <div class="password-header">
              <label for="password" class="input-label">密码</label>
              <a href="/forgot-password" class="forgot-password">忘记密码?</a>
            </div>
            <div class="input-wrapper">
              <span class="input-icon">
                <i class="fa fa-lock"></i>
              </span>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="form.password"
                :class="{'error-input': errors.password, 'normal-input': !errors.password}"
                class="text-input password-input"
                placeholder="请输入密码"
                required
                @input="clearError('password')"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
                aria-label="显示/隐藏密码"
              >
                <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </button>
              <!-- 输入框底部光效 -->
              <div class="input-glow"></div>
            </div>
            <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
          </div>

          <!-- 记住我选项 -->
          <div class="remember-me-group">
            <label class="remember-me-label" for="rememberMe">
              <input
                type="checkbox"
                v-model="form.rememberMe"
                class="remember-me-checkbox"
                id="rememberMe"
              >
              <div class="toggle-switch"></div>
              <span class="remember-me-text">记住我</span>
            </label>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="login-button"
            :aria-disabled="isLoading"
          >
            <!-- 按钮光效 -->
            <div class="button-shimmer"></div>
            <span v-if="!isLoading" class="button-text">登录账号</span>
            <span v-if="isLoading" class="loading-text">
              <i class="fa fa-spinner fa-spin"></i> 登录中...
            </span>
          </button>
        </form>

        <!-- 分隔线 -->
        <div class="divider">
          <div class="divider-line"></div>
          <div class="divider-text">其他登录方式</div>
        </div>

        <!-- 社交登录 -->
        <div class="social-login">
          <button class="social-button qq-button" aria-label="QQ登录">
            <i class="fa fa-qq"></i>
          </button>
          <button class="social-button weixin-button" aria-label="微信登录">
            <i class="fa fa-weixin"></i>
          </button>
          <button class="social-button weibo-button" aria-label="微博登录">
            <i class="fa fa-weibo"></i>
          </button>
        </div>

        <!-- 注册链接 -->
        <p class="register-link">
          还没有账号?
          <a href="/register" class="register-action" aria-label="前往注册页面">
            立即注册
            <span class="register-underline"></span>
          </a>
        </p>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <!-- 动态渐变球体 -->
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      
      <!-- 网格背景 -->
      <div class="grid-background"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// 路由实例
const router = useRouter();
const route = useRoute();

// 注册成功提示状态
const showRegisterSuccess = ref(false);

// 组件挂载后的初始化
onMounted(() => {
  // 添加页面进入动画
  document.querySelector('.login-container')?.classList.add('animate-fade-in');
  
  // 检测是否从注册页跳转
  if (route.query.registered === 'true') {
    showRegisterSuccess.value = true;
    // 3秒后自动隐藏提示
    setTimeout(() => {
      showRegisterSuccess.value = false;
    }, 3000);
  }
});

// 表单状态
const form = reactive({
  username: '',
  password: '',
  rememberMe: false
});

// 错误信息
const errors = reactive({
  username: '',
  password: ''
});

// 显示密码切换
const showPassword = ref(false);
// 加载状态
const isLoading = ref(false);

// 清除单个字段错误
const clearError = (field: 'username' | 'password') => {
  errors[field] = '';
};

// 获取粒子样式（增强随机性和层次感）
const getParticleStyle = (index: number) => {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${2 + Math.random() * 2}s`,
    width: `${2 + Math.random() * 4}px`,
    height: `${2 + Math.random() * 4}px`,
    opacity: `${0.1 + Math.random() * 0.3}`
  };
};

// 获取装饰圆点样式（限制在品牌区域内）
const getDotStyle = (index: number) => {
  return {
    left: `${10 + Math.random() * 80}%`,
    top: `${10 + Math.random() * 80}%`,
    width: `${8 + Math.random() * 4}px`,
    height: `${8 + Math.random() * 4}px`
  };
};

// 表单验证
const validateForm = (): boolean => {
  let isValid = true;
  
  // 重置错误信息
  errors.username = '';
  errors.password = '';
  
  // 验证用户名
  if (!form.username.trim()) {
    errors.username = '请输入用户名或邮箱';
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
  
  return isValid;
};

// 处理登录
const handleLogin = async () => {
  // 表单验证
  if (!validateForm()) {
    // 聚焦第一个错误字段
    const firstErrorField = errors.username ? 'username' : 'password';
    document.getElementById(firstErrorField)?.focus();
    return;
  }
  
  // 显示加载状态
  isLoading.value = true;
  
  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 模拟登录成功，获取token
    const mockToken = 'delta_action_club_token_' + Date.now();
    
    // 存储登录状态
    if (form.rememberMe) {
      localStorage.setItem('delta_token', mockToken);
      localStorage.setItem('delta_user', JSON.stringify({ username: form.username }));
    } else {
      sessionStorage.setItem('delta_token', mockToken);
      sessionStorage.setItem('delta_user', JSON.stringify({ username: form.username }));
    }
    
    // 登录成功后跳转到首页
    router.push('/dashboard');
    
  } catch (error) {
    console.error('登录失败:', error);
    errors.password = '账号或密码错误，请重新输入';
  } finally {
    // 隐藏加载状态
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 登录容器 */
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

/* 成功提示 */
.success-toast {
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  z-index: 50;
  font-weight: 500;
  animation: fadeInOut 3s forwards;
}

/* 粒子容器 */
.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 粒子 */
.particle {
  position: absolute;
  background-color: rgba(59, 130, 246, 0.5);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* 登录卡片 */
.login-card {
  width: 100%;
  max-width: 28rem;
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.8) 50%, rgba(31, 41, 55, 0.8) 100%);
  backdrop-filter: blur(20px);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  border: 1px solid rgba(55, 65, 81, 0.3);
  transition: all 0.5s ease;
  z-index: 10;
}

.login-card:hover {
  box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.6);
  border-color: rgba(59, 130, 246, 0.5);
  transform: scale(1.02);
}

/* 品牌区域 */
.brand-section {
  background: linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%);
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* 动态光效 */
.shimmer-effect {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
  animation: shimmer 3s infinite;
}

/* 装饰圆点容器 */
.decorative-dots {
  position: absolute;
  inset: 0;
  opacity: 0.2;
}

/* 装饰圆点 */
.decorative-dot {
  position: absolute;
  background-color: white;
  border-radius: 50%;
}

/* 品牌标题 */
.brand-title {
  font-size: clamp(1.8rem, 5vw, 2.2rem);
  font-weight: bold;
  color: white;
  position: relative;
  z-index: 10;
  letter-spacing: 0.025em;
}

/* 品牌副标题 */
.brand-subtitle {
  color: rgba(191, 219, 254, 0.9);
  margin-top: 0.5rem;
  position: relative;
  z-index: 10;
  font-size: 0.875rem;
  font-weight: 300;
  letter-spacing: 0.05em;
}

/* 装饰线条 */
.decorative-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 5rem;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%);
}

/* 表单容器 */
.form-container {
  padding: 2rem;
}

/* 登录表单 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 输入组 */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 输入标签 */
.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #d1d5db;
  letter-spacing: 0.025em;
}

/* 输入包装器 */
.input-wrapper {
  position: relative;
}

/* 输入图标 */
.input-icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #9ca3af;
  transition: color 0.3s ease;
  font-size: 1.125rem;
}

.input-wrapper:focus-within .input-icon {
  color: #60a5fa;
}

/* 文本输入框 */
.text-input {
  width: 100%;
  padding-left: 3rem;
  padding-right: 1rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-radius: 0.75rem;
  background-color: rgba(55, 65, 81, 0.3);
  border: 2px solid;
  outline: none;
  transition: all 0.3s ease;
  color: #f3f4f6;
}

.text-input::placeholder {
  color: #9ca3af;
}

.text-input:hover {
  background-color: rgba(55, 65, 81, 0.4);
}

/* 正常输入框 */
.normal-input {
  border-color: rgba(75, 85, 99, 0.5);
}

.normal-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

/* 错误输入框 */
.error-input {
  border-color: #ef4444;
}

.error-input:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
}

/* 密码输入框 */
.password-input {
  padding-right: 3rem;
}

/* 输入框光效 */
.input-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%);
  transition: width 0.3s ease;
}

.input-wrapper:focus-within .input-glow {
  width: 100%;
}

/* 密码头部 */
.password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 忘记密码 */
.forgot-password {
  font-size: 0.75rem;
  color: #60a5fa;
  transition: color 0.3s ease;
  font-weight: 500;
  text-decoration: none;
}

.forgot-password:hover {
  color: #93c5fd;
  text-decoration: underline;
}

/* 密码切换按钮 */
.password-toggle {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: #9ca3af;
  transition: color 0.3s ease;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.125rem;
}

.password-toggle:hover {
  color: #60a5fa;
}

/* 错误消息 */
.error-message {
  color: #f87171;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-weight: 500;
  animation: shake 0.5s;
}

/* 记住我组 */
.remember-me-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 记住我标签 */
.remember-me-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

/* 记住我复选框 */
.remember-me-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* 切换开关 */
.toggle-switch {
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background-color: rgba(55, 65, 81, 0.5);
  border-radius: 9999px;
  transition: all 0.3s ease;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 1.25rem;
  height: 1.25rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.remember-me-checkbox:checked + .toggle-switch {
  background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%);
}

.remember-me-checkbox:checked + .toggle-switch::after {
  transform: translateX(1.5rem);
  border-color: white;
}

/* 记住我文本 */
.remember-me-text {
  margin-left: 0.75rem;
  font-size: 0.875rem;
  color: #d1d5db;
  font-weight: 500;
  letter-spacing: 0.025em;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%);
  color: white;
  font-weight: 600;
  border-radius: 0.75rem;
  transition: all 0.5s ease;
  transform: scale(1);
  outline: none;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(90deg, #1d4ed8 0%, #4338ca 50%, #6d28d9 100%);
  transform: scale(1.02);
}

.login-button:active:not(:disabled) {
  transform: scale(0.98);
}

.login-button:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 按钮光效 */
.button-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
  transform: skewX(-12deg) translateX(-100%);
  transition: transform 0.7s ease;
}

.login-button:hover:not(:disabled) .button-shimmer {
  transform: skewX(-12deg) translateX(100%);
}

/* 按钮文本 */
.button-text {
  position: relative;
  z-index: 10;
  letter-spacing: 0.05em;
}

/* 加载文本 */
.loading-text {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 10;
}

.loading-text i {
  margin-right: 0.5rem;
}

/* 分隔线 */
.divider {
  position: relative;
  margin: 1.5rem 0;
}

/* 分隔线 */
.divider-line {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
}

.divider-line::before {
  content: '';
  width: 100%;
  border-top: 1px solid rgba(55, 65, 81, 0.5);
}

/* 分隔文本 */
.divider-text {
  position: relative;
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.8) 100%);
  padding: 0.25rem 1rem;
  font-size: 0.75rem;
  color: rgba(156, 163, 175, 0.8);
  font-weight: 500;
  letter-spacing: 0.05em;
}

/* 社交登录 */
.social-login {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* 社交按钮 */
.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(55, 65, 81, 0.3);
  border-radius: 0.75rem;
  background: transparent;
  color: #d1d5db;
  transition: all 0.3s ease;
  cursor: pointer;
  transform: scale(1);
}

.social-button:hover {
  background-color: rgba(55, 65, 81, 0.3);
  transform: scale(1.05);
}

/* QQ按钮 */
.qq-button:hover {
  border-color: rgba(59, 130, 246, 0.5);
}

.qq-button i {
  color: #60a5fa;
  font-size: 1.25rem;
  transition: color 0.3s ease;
}

.qq-button:hover i {
  color: #93c5fd;
}

/* 微信按钮 */
.weixin-button:hover {
  border-color: rgba(34, 197, 94, 0.5);
}

.weixin-button i {
  color: #4ade80;
  font-size: 1.25rem;
  transition: color 0.3s ease;
}

.weixin-button:hover i {
  color: #86efac;
}

/* 微博按钮 */
.weibo-button:hover {
  border-color: rgba(239, 68, 68, 0.5);
}

.weibo-button i {
  color: #ef4444;
  font-size: 1.25rem;
  transition: color 0.3s ease;
}

.weibo-button:hover i {
  color: #f87171;
}

/* 注册链接 */
.register-link {
  text-align: center;
  font-size: 0.875rem;
  color: rgba(156, 163, 175, 0.8);
  font-weight: 500;
  letter-spacing: 0.025em;
  margin: 0;
}

/* 注册操作 */
.register-action {
  color: #60a5fa;
  font-weight: 600;
  transition: color 0.3s ease;
  margin-left: 0.5rem;
  position: relative;
  text-decoration: none;
}

.register-action:hover {
  color: #93c5fd;
}

/* 注册下划线 */
.register-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #60a5fa;
  transition: width 0.3s ease;
}

.register-action:hover .register-underline {
  width: 100%;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

/* 渐变球体 */
.blob {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: multiply;
  filter: blur(96px);
  opacity: 0.3;
  animation: blob 7s infinite;
}

.blob-1 {
  top: -10rem;
  right: -10rem;
  width: 24rem;
  height: 24rem;
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
}

.blob-2 {
  top: 10rem;
  left: -5rem;
  width: 18rem;
  height: 18rem;
  background: linear-gradient(90deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
  animation-delay: 2s;
}

.blob-3 {
  bottom: 10rem;
  right: 5rem;
  width: 20rem;
  height: 20rem;
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%);
  animation-delay: 4s;
}

/* 网格背景 */
.grid-background {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(31, 41, 55, 0) 0%, rgba(31, 41, 55, 0.1) 50%, rgba(31, 41, 55, 0.3) 100%);
}

/* 动画定义 */
@keyframes pulse {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.2); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes blob {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -20px); }
  10% { opacity: 1; transform: translate(-50%, 0); }
  90% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -20px); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease forwards;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
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
    