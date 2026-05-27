<!--
  【登录页面】用户登录入口
  功能：账号密码登录、记住我、密码显隐切换
  交互：鼠标跟随聚光灯效果 + 光球动画背景
-->
<template>
  <div class="login-page" ref="pageRef">
    <div class="bg-container" ref="bgContainer">
      <div class="gradient-layer"></div>

      <div class="light-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>

      <div class="spotlight" :style="spotlightStyle"></div>

      <div class="cursor-follower" :style="cursorStyle">
        <span class="cursor-ring"></span>
        <span class="cursor-dot"></span>
      </div>
    </div>

    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <span class="login-brand">DELTA</span>
          <h1 class="login-title">欢迎回来</h1>
          <p class="login-subtitle">登录到您的账户</p>
        </div>

        <div v-if="showRegisterSuccess" class="success-toast">
          注册成功，请登录
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username" class="form-label">
              <i class="fa fa-user"></i> 账号
            </label>
            <div class="input-wrapper">
              <i class="fa fa-user input-icon"></i>
              <input
                type="text"
                id="username"
                v-model="form.username"
                class="form-input"
                :class="{ 'has-error': errors.username }"
                placeholder="用户名或邮箱"
                required
                @input="clearError('username')"
              />
            </div>
            <p v-if="errors.username" class="error-text">{{ errors.username }}</p>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">
              <i class="fa fa-lock"></i> 密码
            </label>
            <div class="input-wrapper">
              <i class="fa fa-lock input-icon"></i>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="form.password"
                class="form-input"
                :class="{ 'has-error': errors.password }"
                placeholder="输入密码"
                required
                @input="clearError('password')"
              />
              <button type="button" class="password-toggle" @click="showPassword = !showPassword" tabindex="-1">
                <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </button>
            </div>
            <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
          </div>

          <div class="form-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.rememberMe" class="checkbox-input" />
              <span>记住我</span>
            </label>
            <a href="/forgot-password" class="link">忘记密码？</a>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="!isLoading">登录</span>
            <span v-else>登录中...</span>
          </button>
        </form>

        <p v-if="showDemoAccountHint" class="demo-hint">
          演示账号：顾客 <strong>XiaoLiMao</strong>、打手 <strong>DaShou_YeXi</strong>、BOSS <strong>BOSS_Delta</strong>，密码均为 <strong>123456</strong>
        </p>

        <p class="register-prompt">
          还没有账号？<a href="/register" class="link">立即注册</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * 登录模块 - 核心业务逻辑
 * 流程：表单验证 → 调用 authApi.login() → 存储 Token → 拉取用户画像 → 跳转首页
 */
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi } from '../api/authApi'
import { setAuthToken, setAuthUser } from '../api/token'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notifications'

const router = useRouter()
const route = useRoute()
const bgContainer = ref<HTMLElement | null>(null)
const pageRef = ref<HTMLElement | null>(null)

// 鼠标位置跟踪 - 用于聚光灯跟随效果
const mousePos = ref({ x: 0, y: 0 })
const cursorPos = ref({ x: 0, y: 0 })

let orbAnimationFrame: number

const showRegisterSuccess = ref(false)

onMounted(() => {
  // 注册成功后跳转至此，展示成功提示
  if (route.query.registered === 'true') {
    showRegisterSuccess.value = true
    setTimeout(() => {
      showRegisterSuccess.value = false
    }, 3000)
  }

  const handleMouseMove = (e: MouseEvent) => {
    mousePos.value = { x: e.clientX, y: e.clientY }
    cursorPos.value = { x: e.clientX, y: e.clientY }
  }

  window.addEventListener('mousemove', handleMouseMove)

  // 背景光球漂浮动画
  const animateOrbs = () => {
    const time = Date.now() * 0.001
    const orbs = bgContainer.value?.querySelectorAll('.orb')
    orbs?.forEach((orb, i) => {
      const element = orb as HTMLElement
      const baseX = 20 + i * 30
      const baseY = 30 + i * 20
      const offsetX = Math.sin(time * 0.5 + i) * 10
      const offsetY = Math.cos(time * 0.3 + i * 0.5) * 10
      element.style.left = `${baseX + offsetX}%`
      element.style.top = `${baseY + offsetY}%`
    })
    orbAnimationFrame = requestAnimationFrame(animateOrbs)
  }

  animateOrbs()

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    cancelAnimationFrame(orbAnimationFrame)
  })
})

const cursorStyle = computed(() => ({
  '--cursor-x': `${cursorPos.value.x}px`,
  '--cursor-y': `${cursorPos.value.y}px`
}))

const spotlightStyle = computed(() => ({
  '--spotlight-x': `${mousePos.value.x}px`,
  '--spotlight-y': `${mousePos.value.y}px`
}))

const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  username: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)

const showDemoAccountHint =
  import.meta.env.DEV || String(import.meta.env.VITE_API_MODE || '').toLowerCase() === 'mock'

const clearError = (field: 'username' | 'password') => {
  errors[field] = ''
}

// 表单前端验证：非空 + 密码最小长度
const validateForm = (): boolean => {
  let isValid = true
  errors.username = ''
  errors.password = ''

  if (!form.username.trim()) {
    errors.username = '请输入用户名或邮箱'
    isValid = false
  }

  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度不能少于6位'
    isValid = false
  }

  return isValid
}

// 【核心交互】登录处理：验证 → 调用后端 → Token持久化 → 加载用户画像 → 通知刷新 → 跳转
const handleLogin = async () => {
  if (!validateForm()) {
    const firstErrorField = errors.username ? 'username' : 'password'
    document.getElementById(firstErrorField)?.focus()
    return
  }

  isLoading.value = true

  try {
    const resp = await authApi.login({ username: form.username, password: form.password })

    // 将 Token 和用户基本信息持久化到 localStorage/sessionStorage
    setAuthToken(resp.token, form.rememberMe)
    setAuthUser(resp.user, form.rememberMe)

    // 从服务端拉取完整的用户画像（头像、昵称、权限等级等）
    const userStore = useUserStore()
    try {
      await userStore.loadUserFromServer()
    } catch {
      /* 兼容仅返回基础 user 的场景 */
    }

    // 预热通知 store
    void useNotificationStore()
      .refreshList()
      .catch(() => {})

    // 登录成功后跳转到目标页（支持 redirect 参数）
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    router.push(redirect || '/dashboard')
  } catch (error) {
    console.error('登录失败:', error)
    errors.password = '账号或密码错误，请重新输入'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FAFAFA;
  position: relative;
  overflow: hidden;
  padding: 2rem 1.5rem;
}

.bg-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.gradient-layer {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 30%, rgba(37, 99, 235, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 70% 70%, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
}

.light-orbs {
  position: absolute;
  inset: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(59, 130, 246, 0.08));
  left: 20%;
  top: 30%;
  animation: float-1 8s ease-in-out infinite;
}

.orb-2 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(37, 99, 235, 0.06));
  left: 50%;
  top: 50%;
  animation: float-2 10s ease-in-out infinite;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(59, 130, 246, 0.05));
  left: 70%;
  top: 20%;
  animation: float-3 12s ease-in-out infinite;
}

@keyframes float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -20px) scale(1.05); }
}

@keyframes float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-25px, 30px) scale(1.08); }
}

@keyframes float-3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, 25px) scale(1.03); }
}

.spotlight {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%),
    rgba(37, 99, 235, 0.08) 0%,
    rgba(37, 99, 235, 0.04) 30%,
    transparent 60%
  );
  pointer-events: none;
}

.cursor-follower {
  position: fixed;
  left: 0;
  top: 0;
  width: 50px;
  height: 50px;
  pointer-events: none;
  transform: translate(calc(var(--cursor-x) - 25px), calc(var(--cursor-y) - 25px));
  z-index: 1000;
}

.cursor-ring {
  position: absolute;
  inset: 0;
  border: 1.5px solid var(--m-accent);
  border-radius: 50%;
  opacity: 0.6;
  animation: pulse-ring 1.5s ease-out infinite;
}

.cursor-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 6px;
  height: 6px;
  background: var(--m-accent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.8;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.04),
    0 10px 15px -3px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.02);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-brand {
  font-family: var(--m-font-body);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--m-accent);
  text-transform: uppercase;
}

.login-title {
  font-family: var(--m-font-display);
  font-size: 1.75rem;
  font-weight: 400;
  color: var(--m-text);
  margin-top: 0.75rem;
  letter-spacing: -0.01em;
}

.login-subtitle {
  font-size: 0.9rem;
  color: var(--m-text-muted);
  margin-top: 0.5rem;
}

.success-toast {
  background: var(--m-success);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: var(--m-radius-sm);
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1.5rem;
  animation: fadeInOut 3s forwards;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--m-text);
}

.form-label i {
  margin-right: 0.35rem;
  color: var(--m-accent);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  color: var(--m-text-muted);
  font-size: 0.875rem;
  pointer-events: none;
  transition: color var(--m-transition);
}

.form-input:focus ~ .input-icon,
.input-wrapper:focus-within .input-icon {
  color: var(--m-accent);
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  font-size: 0.9375rem;
  color: var(--m-text);
  background: white;
  transition: all var(--m-transition);
}

.password-toggle {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--m-text-muted);
  cursor: pointer;
  padding: 0.375rem;
  font-size: 0.9375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--m-transition);
}

.password-toggle:hover {
  color: var(--m-accent);
}

.form-input:focus {
  outline: none;
  border-color: var(--m-accent);
  box-shadow: 0 0 0 3px var(--m-accent-light);
}

.form-input::placeholder {
  color: var(--m-text-muted);
}

.form-input.has-error {
  border-color: var(--m-danger);
}

.error-text {
  font-size: 0.8125rem;
  color: var(--m-danger);
  margin: 0;
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--m-text-secondary);
  cursor: pointer;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: var(--m-accent);
}

.link {
  font-size: 0.875rem;
  color: var(--m-accent);
  transition: color var(--m-transition);
}

.link:hover {
  color: var(--m-accent-hover);
}

.submit-btn {
  width: 100%;
  padding: 0.85rem 1rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0.5rem;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.demo-hint {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--m-bg-tertiary);
  border-radius: var(--m-radius-sm);
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--m-text-muted);
  text-align: center;
}

.demo-hint strong {
  color: var(--m-text-secondary);
  font-weight: 500;
}

.register-prompt {
  text-align: center;
  font-size: 0.875rem;
  color: var(--m-text-muted);
  margin-top: 1.5rem;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-4px);
  }
  12% {
    opacity: 1;
    transform: translateY(0);
  }
  88% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-4px);
  }
}
</style>
