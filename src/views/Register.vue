<template>
  <div
    class="register-page"
    :style="pointerStyle"
    @mousemove="onPointerMove"
    @mouseleave="onPointerLeave"
  >
    <div class="auth-backdrop" aria-hidden="true" />
    <div class="auth-shell register-shell">
    <div class="register-card">
      <header class="auth-header">
        <h1 class="auth-title">账号注册</h1>
        <p class="auth-subtitle">加入栗帽游戏服务平台，享受专业服务</p>
      </header>

      <div class="form-container">
        <form class="register-form" @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="username" class="form-label">用户名</label>
            <div class="input-wrapper">
              <span class="input-icon" aria-hidden="true">
                <i class="fa fa-user"></i>
              </span>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="form-input"
                :class="{ 'input-error': errors.username }"
                placeholder="请设置用户名"
                required
              />
            </div>
            <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">邮箱</label>
            <div class="input-wrapper">
              <span class="input-icon" aria-hidden="true">
                <i class="fa fa-envelope"></i>
              </span>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-input"
                :class="{ 'input-error': errors.email }"
                placeholder="请输入邮箱地址"
                required
              />
            </div>
            <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <div class="input-wrapper">
              <span class="input-icon" aria-hidden="true">
                <i class="fa fa-lock"></i>
              </span>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'input-error': errors.password }"
                placeholder="请设置密码（至少6位）"
                required
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </button>
            </div>

            <div v-if="form.password" class="password-strength">
              <div class="strength-bar">
                <div
                  class="strength-indicator"
                  :class="passwordStrengthClass"
                  :style="{ width: passwordStrengthWidth }"
                />
              </div>
              <p class="strength-text">{{ passwordStrengthText }}</p>
            </div>

            <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">确认密码</label>
            <div class="input-wrapper">
              <span class="input-icon" aria-hidden="true">
                <i class="fa fa-lock"></i>
              </span>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'input-error': errors.confirmPassword }"
                placeholder="请再次输入密码"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <i :class="showConfirmPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</p>
          </div>

          <div class="terms-agreement">
            <div class="terms-checkbox">
              <input
                id="terms"
                v-model="form.agreeTerms"
                type="checkbox"
                class="terms-checkbox-input"
                :class="{ 'input-error': errors.agreeTerms }"
              />
              <div class="terms-checkbox-custom" />
            </div>
            <div class="terms-text">
              <label for="terms" class="terms-label">
                我已阅读并同意<a href="#" class="terms-link">服务条款</a>和<a href="#" class="terms-link">隐私政策</a>
              </label>
              <p v-if="errors.agreeTerms" class="error-message">{{ errors.agreeTerms }}</p>
            </div>
          </div>

          <button type="submit" class="register-button" :disabled="isLoading">
            <span v-if="!isLoading">注册账号</span>
            <span v-else class="loading-indicator">
              <i class="fa fa-spinner fa-spin"></i> 注册中...
            </span>
          </button>
        </form>

        <p class="login-prompt">
          已有账号?
          <a href="/login" class="login-link">立即登录</a>
        </p>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthPointerMotion } from '../composables/useAuthPointerMotion'
import { authApi } from '../api/authApi'

const router = useRouter()

const { onPointerMove, onPointerLeave, pointerStyle } = useAuthPointerMotion()

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

const passwordStrength = computed(() => {
  if (form.password.length < 6) return 0

  let strength = 1
  if (/\d/.test(form.password)) strength++
  if (/[a-z]/.test(form.password)) strength++
  if (/[A-Z]/.test(form.password)) strength++
  if (/[^A-Za-z0-9]/.test(form.password)) strength++
  return strength
})

const passwordStrengthClass = computed(() => {
  switch (passwordStrength.value) {
    case 0:
      return 'strength-weak'
    case 1:
      return 'strength-weak'
    case 2:
      return 'strength-medium'
    case 3:
      return 'strength-good'
    case 4:
      return 'strength-strong'
    default:
      return 'strength-weak'
  }
})

const passwordStrengthWidth = computed(() => {
  return `${(passwordStrength.value / 4) * 100}%`
})

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0:
      return '密码长度至少6位'
    case 1:
      return '弱密码：建议增加密码复杂度'
    case 2:
      return '中密码：可以增加大写字母或特殊字符'
    case 3:
      return '良好：再增加一种字符类型会更安全'
    case 4:
      return '强密码：非常安全的密码'
    default:
      return ''
  }
})

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
/* 与登录页同套背景与偏左布局；注册表单较长时从上方留白滚动 */
.register-page {
  --auth-surface: #151b22;
  --auth-border: #2a3441;
  --auth-muted: #8b949e;
  --auth-text: #e6edf3;
  --auth-accent: #3d8bfd;
  --auth-accent-hover: #2f7ce8;
  --ptr-x: 0;
  --ptr-y: 0;

  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.register-page::after {
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
}

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

/* 注册字段多：顶部对齐，避免小屏垂直居中导致裁切 */
.register-shell {
  align-items: flex-start;
  padding-top: clamp(1.25rem, 4vh, 2.5rem);
  padding-bottom: clamp(1.25rem, 4vh, 2.5rem);
}

@media (max-width: 640px) {
  .auth-shell {
    justify-content: center;
    padding-right: clamp(1.25rem, 4vw, 2.5rem);
  }
}

.register-card {
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
  .register-page::after {
    opacity: 0;
  }

  .auth-backdrop,
  .auth-backdrop::before,
  .auth-backdrop::after,
  .register-card {
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
}

.auth-subtitle {
  margin-top: 0.35rem;
  font-size: 0.8125rem;
  color: var(--auth-muted);
  line-height: 1.45;
}

.form-container {
  padding: 1.25rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.8125rem;
  color: var(--auth-muted);
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.65rem 2.4rem;
  border-radius: 6px;
  border: 1px solid var(--auth-border);
  background: #0d1117;
  color: var(--auth-text);
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.15s ease;
}

.form-input:focus:not(.input-error) {
  border-color: var(--auth-accent);
}

.form-input::placeholder {
  color: #6e7681;
}

.input-error {
  border-color: #f85149 !important;
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

.toggle-password {
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

.toggle-password:hover {
  color: var(--auth-muted);
}

.error-message {
  color: #f85149;
  font-size: 0.75rem;
  margin: 0;
}

.password-strength {
  margin-top: 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.strength-bar {
  height: 4px;
  width: 100%;
  background: #21262d;
  border-radius: 2px;
  overflow: hidden;
}

.strength-indicator {
  height: 100%;
  transition: width 0.2s ease;
}

.strength-weak {
  background: #f85149;
}

.strength-medium {
  background: #d29922;
}

.strength-good {
  background: #e3b341;
}

.strength-strong {
  background: #238636;
}

.strength-text {
  font-size: 0.6875rem;
  color: #6e7681;
}

.terms-agreement {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.terms-checkbox {
  position: relative;
  margin-top: 0.1rem;
  width: 1.1rem;
  height: 1.1rem;
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
  width: 1.1rem;
  height: 1.1rem;
  border: 1px solid var(--auth-border);
  border-radius: 4px;
  background: #0d1117;
  position: relative;
  transition: border-color 0.15s ease;
}

.terms-checkbox-input:checked + .terms-checkbox-custom {
  border-color: var(--auth-accent);
  background: var(--auth-accent);
}

.terms-checkbox-input:checked + .terms-checkbox-custom::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 45%;
  width: 0.35rem;
  height: 0.2rem;
  border: 2px solid #fff;
  border-top: none;
  border-right: none;
  transform: translate(-50%, -50%) rotate(-45deg);
}

.terms-checkbox-input:focus-visible + .terms-checkbox-custom {
  outline: 2px solid var(--auth-accent);
  outline-offset: 2px;
}

.terms-checkbox-input.input-error + .terms-checkbox-custom {
  border-color: #f85149;
}

.terms-text {
  flex: 1;
  min-width: 0;
}

.terms-label {
  font-size: 0.8125rem;
  color: var(--auth-muted);
  line-height: 1.45;
}

.terms-link {
  color: var(--auth-accent);
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.register-button {
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-button:hover:not(:disabled) {
  background: var(--auth-accent-hover);
}

.register-button:focus-visible {
  outline: 2px solid var(--auth-accent);
  outline-offset: 2px;
}

.register-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.login-prompt {
  text-align: center;
  font-size: 0.8125rem;
  color: var(--auth-muted);
  margin: 0;
}

.login-link {
  margin-left: 0.25rem;
  color: var(--auth-accent);
  font-weight: 500;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
