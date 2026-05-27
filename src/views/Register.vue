<!--
  【注册页面】新用户创建账户入口
  功能：用户名/邮箱/密码/确认密码/服务条款勾选
  交互：表单验证 → 调用 authApi.register() → 成功后跳转登录页
  效果：与登录页一致的鼠标跟随聚光灯 + 光球动画背景
-->
<template>
  <div class="register-page" ref="pageRef">
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

    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <span class="register-brand">DELTA</span>
          <h1 class="register-title">创建账户</h1>
          <p class="register-subtitle">加入我们开始使用</p>
        </div>

        <form class="register-form" @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="username" class="form-label">
              <i class="fa fa-user"></i> 用户名
            </label>
            <div class="input-wrapper">
              <i class="fa fa-user input-icon"></i>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="form-input"
                :class="{ 'has-error': errors.username }"
                placeholder="设置用户名"
                required
              />
            </div>
            <p v-if="errors.username" class="error-text">{{ errors.username }}</p>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">
              <i class="fa fa-envelope"></i> 邮箱
            </label>
            <div class="input-wrapper">
              <i class="fa fa-envelope input-icon"></i>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-input"
                :class="{ 'has-error': errors.email }"
                placeholder="输入邮箱地址"
                required
              />
            </div>
            <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">
              <i class="fa fa-lock"></i> 密码
            </label>
            <div class="input-wrapper">
              <i class="fa fa-lock input-icon"></i>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'has-error': errors.password }"
                placeholder="设置密码（至少6位）"
                required
              />
              <button type="button" class="password-toggle" @click="showPassword = !showPassword" tabindex="-1">
                <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </button>
            </div>
            <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">
              <i class="fa fa-lock"></i> 确认密码
            </label>
            <div class="input-wrapper">
              <i class="fa fa-lock input-icon"></i>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'has-error': errors.confirmPassword }"
                placeholder="再次输入密码"
                required
              />
              <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword" tabindex="-1">
                <i :class="showConfirmPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</p>
          </div>

          <div class="terms-group">
            <label class="checkbox-label">
              <input
                id="terms"
                v-model="form.agreeTerms"
                type="checkbox"
                class="checkbox-input"
                :class="{ 'has-error': errors.agreeTerms }"
              />
              <span>我已阅读并同意服务条款和隐私政策</span>
            </label>
            <p v-if="errors.agreeTerms" class="error-text">{{ errors.agreeTerms }}</p>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="!isLoading">注册</span>
            <span v-else>注册中...</span>
          </button>
        </form>

        <p class="login-prompt">
          已有账号？<a href="/login" class="link">立即登录</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api/authApi'

const router = useRouter()

const bgContainer = ref<HTMLElement | null>(null)
const pageRef = ref<HTMLElement | null>(null)

const mousePos = ref({ x: 0, y: 0 })
const cursorPos = ref({ x: 0, y: 0 })

let orbAnimationFrame: number

onMounted(() => {
  const handleMouseMove = (e: MouseEvent) => {
    mousePos.value = { x: e.clientX, y: e.clientY }
    cursorPos.value = { x: e.clientX, y: e.clientY }
  }

  window.addEventListener('mousemove', handleMouseMove)

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
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)

const validateForm = (): boolean => {
  let isValid = true
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })

  if (!form.username.trim()) {
    errors.username = '请输入用户名'
    isValid = false
  } else if (form.username.length < 3 || form.username.length > 20) {
    errors.username = '用户名长度必须在3-20个字符之间'
    isValid = false
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    errors.username = '用户名只能包含字母、数字和下划线'
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = '请输入邮箱地址'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
    isValid = false
  }

  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度不能少于6位'
    isValid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = '请再次输入密码'
    isValid = false
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }

  if (!form.agreeTerms) {
    errors.agreeTerms = '请阅读并同意服务条款和隐私政策'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    await authApi.register({ username: form.username, email: form.email, password: form.password })

    router.push({
      path: '/login',
      query: { registered: 'true' }
    })
  } catch (error) {
    console.error('注册失败:', error)
    alert('注册失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-page {
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

.register-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
}

.register-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid var(--m-border);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 10px 15px -3px rgba(0, 0, 0, 0.08);
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-brand {
  font-family: var(--m-font-body);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: var(--m-accent);
}

.register-title {
  font-family: var(--m-font-display);
  font-size: 1.75rem;
  font-weight: 400;
  color: var(--m-text);
  margin-top: 0.75rem;
}

.register-subtitle {
  font-size: 0.9375rem;
  color: var(--m-text-muted);
  margin-top: 0.5rem;
}

.register-form {
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

.terms-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--m-text-secondary);
  cursor: pointer;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: var(--m-accent);
  flex-shrink: 0;
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
  padding: 0.875rem 1rem;
  background: var(--m-accent);
  color: white;
  border: none;
  border-radius: var(--m-radius-sm);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--m-transition);
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: var(--m-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.3);
}

.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.login-prompt {
  text-align: center;
  font-size: 0.875rem;
  color: var(--m-text-muted);
  margin-top: 1.5rem;
}
</style>
