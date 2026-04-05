<template>
  <div
    class="login-container"
    :style="pointerStyle"
    @mousemove="onPointerMove"
    @mouseleave="onPointerLeave"
  >
    <!-- 背景层：渐变 + 微网格 + 光晕，不抢表单焦点 -->
    <div class="auth-backdrop" aria-hidden="true" />

    <!-- 注册成功提示 -->
    <div v-if="showRegisterSuccess" class="success-toast" role="alert">
      注册成功，请登录
    </div>

    <div class="auth-shell">
    <div class="login-card">
      <header class="auth-header">
        <h1 class="auth-title">栗帽游戏服务平台</h1>
        <p class="auth-subtitle">专业护航服务 · 精英玩家社区</p>
      </header>

      <div class="form-container">
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="input-group">
            <label for="username" class="input-label">账号</label>
            <div class="input-wrapper">
              <span class="input-icon" aria-hidden="true">
                <i class="fa fa-user"></i>
              </span>
              <input
                type="text"
                id="username"
                v-model="form.username"
                :class="{ 'error-input': errors.username, 'normal-input': !errors.username }"
                class="text-input"
                placeholder="请输入用户名或邮箱"
                required
                @input="clearError('username')"
              />
            </div>
            <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
          </div>

          <div class="input-group">
            <div class="password-header">
              <label for="password" class="input-label">密码</label>
              <a href="/forgot-password" class="forgot-password">忘记密码?</a>
            </div>
            <div class="input-wrapper">
              <span class="input-icon" aria-hidden="true">
                <i class="fa fa-lock"></i>
              </span>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="form.password"
                :class="{ 'error-input': errors.password, 'normal-input': !errors.password }"
                class="text-input password-input"
                placeholder="请输入密码"
                required
                @input="clearError('password')"
              />
              <button
                type="button"
                class="password-toggle"
                aria-label="显示/隐藏密码"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </button>
            </div>
            <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
          </div>

          <div class="remember-me-group">
            <label class="remember-me-label" for="rememberMe">
              <input
                id="rememberMe"
                v-model="form.rememberMe"
                type="checkbox"
                class="remember-checkbox"
              />
              <span class="remember-me-text">记住我</span>
            </label>
          </div>

          <button
            type="submit"
            class="login-button"
            :disabled="isLoading"
            :aria-disabled="isLoading"
          >
            <span v-if="!isLoading" class="button-text">登录账号</span>
            <span v-else class="loading-text">
              <i class="fa fa-spinner fa-spin"></i> 登录中...
            </span>
          </button>
        </form>

        <p v-if="showDemoAccountHint" class="login-demo-hint">
          演示账号：顾客 <strong>XiaoLiMao</strong>、打手 <strong>DaShou_YeXi</strong>（或邮箱 dashou_yexi@demo.delta）、BOSS
          <strong>BOSS_Delta</strong>（或 boss@demo.delta），密码均为 <strong>123456</strong>
        </p>

        <p class="register-link">
          还没有账号?
          <a href="/register" class="register-action" aria-label="前往注册页面">立即注册</a>
        </p>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthPointerMotion } from '../composables/useAuthPointerMotion'
import { authApi } from '../api/authApi'
import { setAuthToken, setAuthUser } from '../api/token'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notifications'

const router = useRouter()
const route = useRoute()

const { onPointerMove, onPointerLeave, pointerStyle } = useAuthPointerMotion()

const showRegisterSuccess = ref(false)

onMounted(() => {
  if (route.query.registered === 'true') {
    showRegisterSuccess.value = true
    setTimeout(() => {
      showRegisterSuccess.value = false
    }, 3000)
  }
})

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

const handleLogin = async () => {
  if (!validateForm()) {
    const firstErrorField = errors.username ? 'username' : 'password'
    document.getElementById(firstErrorField)?.focus()
    return
  }

  isLoading.value = true

  try {
    const resp = await authApi.login({ username: form.username, password: form.password })

    setAuthToken(resp.token, form.rememberMe)
    setAuthUser(resp.user, form.rememberMe)

    const userStore = useUserStore()
    try {
      await userStore.loadUserFromServer()
    } catch {
      /* 兼容仅返回基础 user 的场景 */
    }

    void useNotificationStore()
      .refreshList()
      .catch(() => {})

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
.login-container {
  --auth-surface: #151b22;
  --auth-border: #2a3441;
  --auth-muted: #8b949e;
  --auth-text: #e6edf3;
  --auth-accent: #3d8bfd;
  --auth-accent-hover: #2f7ce8;
  /* 鼠标互动：由 composable 写入，默认 0 */
  --ptr-x: 0;
  --ptr-y: 0;

  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* 柔光随指针轻微移动，增加层次 */
.login-container::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(
    closest-side at calc(50% + var(--ptr-x) * 28vw) calc(45% + var(--ptr-y) * 22vh),
    rgba(61, 139, 253, 0.14) 0%,
    transparent 58%
  );
  opacity: 0.75;
  transition: opacity 0.35s ease;
}

/* 多层背景：冷色战术氛围；视差位移让层与指针反向微动 */
.auth-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 90% 70% at 8% 45%, rgba(55, 95, 125, 0.38) 0%, transparent 52%),
    radial-gradient(ellipse 65% 55% at 92% 78%, rgba(35, 65, 105, 0.32) 0%, transparent 48%),
    radial-gradient(ellipse 50% 40% at 55% 12%, rgba(61, 139, 253, 0.1) 0%, transparent 45%),
    linear-gradient(168deg, #070a0f 0%, #0c131c 42%, #0a1018 100%);
  transform: translate3d(calc(var(--ptr-x) * -14px), calc(var(--ptr-y) * -10px), 0);
  will-change: transform;
}

.auth-backdrop::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.55;
  transform: translate3d(calc(var(--ptr-x) * 8px), calc(var(--ptr-y) * 6px), 0);
  background-image:
    repeating-linear-gradient(
      -18deg,
      transparent,
      transparent 11px,
      rgba(255, 255, 255, 0.022) 11px,
      rgba(255, 255, 255, 0.022) 12px
    ),
    repeating-linear-gradient(
      72deg,
      transparent,
      transparent 48px,
      rgba(255, 255, 255, 0.018) 48px,
      rgba(255, 255, 255, 0.018) 49px
    );
}

.auth-backdrop::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translate3d(calc(var(--ptr-x) * -5px), calc(var(--ptr-y) * -4px), 0);
  background:
    radial-gradient(ellipse 100% 60% at 70% 35%, rgba(61, 139, 253, 0.07) 0%, transparent 55%),
    linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 38%);
}

/* 卡片靠右、垂直居中；小屏仍居中 */
.auth-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1.5rem clamp(1.25rem, 4vw, 2.5rem);
  padding-right: clamp(1.5rem, 10vw, 6rem);
  max-width: 120rem;
  margin: 0 auto;
  perspective: 1100px;
}

@media (max-width: 640px) {
  .auth-shell {
    justify-content: center;
    padding-right: clamp(1.25rem, 4vw, 2.5rem);
  }
}

.success-toast {
  position: fixed;
  top: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  background: #238636;
  color: #fff;
  padding: 0.6rem 1.1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  z-index: 50;
  animation: fadeInOut 3s forwards;
}

.login-card {
  width: 100%;
  max-width: 26rem;
  background: var(--auth-surface);
  border: 1px solid var(--auth-border);
  border-radius: 8px;
  overflow: hidden;
  transform: translate3d(calc(var(--ptr-x) * 10px), calc(var(--ptr-y) * 6px), 0)
    rotateX(calc(var(--ptr-y) * -2.5deg)) rotateY(calc(var(--ptr-x) * 2.5deg));
  transform-style: preserve-3d;
  transition: transform 0.22s ease-out;
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .login-container::after {
    opacity: 0;
  }

  .auth-backdrop,
  .auth-backdrop::before,
  .auth-backdrop::after,
  .login-card {
    transform: none !important;
  }
}

.auth-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--auth-border);
}

.auth-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--auth-text);
  letter-spacing: 0.02em;
  line-height: 1.35;
}

.auth-subtitle {
  margin-top: 0.35rem;
  font-size: 0.8125rem;
  color: var(--auth-muted);
  font-weight: 400;
  line-height: 1.45;
}

.form-container {
  padding: 1.25rem 1.5rem 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.input-label {
  font-size: 0.8125rem;
  color: var(--auth-muted);
}

.password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password {
  font-size: 0.75rem;
  color: var(--auth-accent);
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6e7681;
  font-size: 0.95rem;
  pointer-events: none;
}

.text-input {
  width: 100%;
  padding: 0.65rem 0.75rem 0.65rem 2.35rem;
  border-radius: 6px;
  border: 1px solid var(--auth-border);
  background: #0d1117;
  color: var(--auth-text);
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.15s ease;
}

.password-input {
  padding-right: 2.5rem;
}

.text-input::placeholder {
  color: #6e7681;
}

.normal-input:focus {
  border-color: var(--auth-accent);
}

.error-input {
  border-color: #f85149;
}

.error-input:focus {
  border-color: #f85149;
}

.password-toggle {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6e7681;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.95rem;
}

.password-toggle:hover {
  color: var(--auth-muted);
}

.error-message {
  color: #f85149;
  font-size: 0.75rem;
  margin: 0;
}

.remember-me-group {
  padding-top: 0.15rem;
}

.remember-me-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.remember-checkbox {
  width: 0.95rem;
  height: 0.95rem;
  accent-color: var(--auth-accent);
  cursor: pointer;
}

.remember-me-text {
  font-size: 0.8125rem;
  color: var(--auth-muted);
}

.login-button {
  margin-top: 0.25rem;
  width: 100%;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 6px;
  background: var(--auth-accent);
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
}

.login-button:hover:not(:disabled) {
  background: var(--auth-accent-hover);
}

.login-button:focus-visible {
  outline: 2px solid var(--auth-accent);
  outline-offset: 2px;
}

.login-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.button-text,
.loading-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.login-demo-hint {
  margin-top: 0.85rem;
  font-size: 0.7rem;
  line-height: 1.5;
  color: #6e7681;
  text-align: center;
}

.login-demo-hint strong {
  color: #8b949e;
  font-weight: 600;
}

.register-link {
  text-align: center;
  font-size: 0.8125rem;
  color: var(--auth-muted);
  margin: 1rem 0 0;
}

.register-action {
  margin-left: 0.35rem;
  color: var(--auth-accent);
  text-decoration: none;
  font-weight: 500;
}

.register-action:hover {
  text-decoration: underline;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translate(-50%, -6px);
  }
  12% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  88% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -6px);
  }
}
</style>
