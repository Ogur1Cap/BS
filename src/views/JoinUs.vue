<!--
  【加入我们】顾客申请成为打手的入驻页面
  功能：
    - 申请状态查询：已申请/审核中/已通过/已拒绝
    - 已是打手提示：展示打手信息和档案ID
    - 提交申请表单：昵称/时薪/擅长技能/个人简介
    - 审核流程：提交 → Boss审核 → 通过后开通打手工作台 + 大厅展示
  角色：仅顾客(level=0)可见
  交互：填写资料 → 提交 → 等待Boss审核 → 状态实时更新
-->
<template>
  <div class="join-us-page">
    <Header />
    <main class="ju-main">
      <div class="container">
        <header class="ju-hero">
          <div class="welcome">
            <div class="welcome-text">
              <span class="welcome-greeting"><i class="fa fa-user-plus"></i> 加入我们</span>
              <h1 class="welcome-title">申请成为认证打手</h1>
              <p class="welcome-date">提交资料后由平台 BOSS 审核；通过后您的大厅资料将对顾客可见，并可使用打手工作台接单。</p>
            </div>
          </div>
        </header>

        <div v-if="statusLoading" class="ju-card ju-muted">
          <div class="loading-state">
            <i class="fa fa-spinner fa-spin"></i>
            <span>加载申请状态中…</span>
          </div>
        </div>

        <!-- 已成为打手的提示 -->
        <div v-else-if="isPlayer" class="ju-card ju-ok">
          <div class="status-banner">
            <div class="status-icon">
              <i class="fa fa-trophy"></i>
            </div>
            <div class="status-content">
              <h2>您已是认证打手</h2>
              <p>您已经是平台认证的打手，可直接前往 <router-link to="/player-desk" class="ju-link">打手工作台</router-link> 接单。</p>
              <p class="ju-sub">如果您需要修改个人资料，请联系平台管理员。</p>
            </div>
          </div>
        </div>

        <!-- 申请被禁止的提示 -->
        <div v-else-if="isApplicationBanned" class="ju-card ju-reject">
          <div class="status-banner">
            <div class="status-icon">
              <i class="fa fa-ban"></i>
            </div>
            <div class="status-content">
              <h2>申请已被禁止</h2>
              <p>您的申请资格已被管理员禁止，无法提交新的申请。</p>
              <p class="ju-sub">如有疑问，请联系平台管理员。</p>
            </div>
          </div>
        </div>

        <div v-else-if="myApp && myApp.status === 'PENDING'" class="ju-card ju-warn">
          <div class="status-banner">
            <div class="status-icon">
              <i class="far fa-clock"></i>
            </div>
            <div class="status-content">
              <h2>审核中</h2>
              <p>您提交的申请正在审核，请耐心等待。展示昵称：<strong>{{ myApp.displayName }}</strong></p>
              <p class="ju-sub">提交时间：{{ formatTime(myApp.createdAt) }}</p>
            </div>
          </div>
        </div>

        <!-- 只有当用户仍是打手时才显示已通过提示 -->
        <div v-else-if="isPlayer && myApp && myApp.status === 'APPROVED'" class="ju-card ju-ok">
          <div class="status-banner">
            <div class="status-icon">
              <i class="fa fa-check-circle"></i>
            </div>
            <div class="status-content">
              <h2>已通过</h2>
              <p>恭喜！您的打手申请已通过。<strong>请重新登录</strong>以刷新权限并使用打手工作台。</p>
            </div>
          </div>
        </div>

        <div v-else-if="myApp && myApp.status === 'REJECTED'" class="ju-card ju-reject">
          <div class="status-banner">
            <div class="status-icon">
              <i class="fa fa-times-circle"></i>
            </div>
            <div class="status-content">
              <h2>未通过</h2>
              <p>{{ myApp.rejectReason || '未说明原因' }}</p>
              <p class="ju-sub">您可修改资料后再次提交申请。</p>
            </div>
          </div>
        </div>

        <!-- 被解除资格后重新申请的提示 -->
        <div v-else-if="wasPlayer" class="ju-card ju-info">
          <div class="status-banner">
            <div class="status-icon">
              <i class="fa fa-info-circle"></i>
            </div>
            <div class="status-content">
              <h2>重新申请</h2>
              <p>您曾是平台认证的打手，现在可以重新提交申请。</p>
              <p class="ju-sub">提交后将由平台 BOSS 重新审核。</p>
            </div>
          </div>
        </div>

        <form v-if="canShowForm" class="ju-card ju-form" @submit.prevent="onSubmit">
          <div class="section-header">
            <h2 class="section-title">填写入驻信息</h2>
            <span class="section-line"></span>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label class="ju-label">大厅展示昵称 <span class="req">*</span></label>
              <input v-model.trim="form.displayName" class="ju-input" maxlength="100" placeholder="2–100 字，将展示在打手大厅" />
            </div>

            <div class="form-group full-width">
              <label class="ju-label">自我介绍 <span class="req">*</span></label>
              <textarea
                v-model.trim="form.intro"
                class="ju-textarea"
                rows="5"
                maxlength="500"
                placeholder="10–500 字：经验、擅长模式、服务风格等"
              />
            </div>

            <div class="form-group">
              <label class="ju-label">擅长领域（选填）</label>
              <input v-model.trim="form.skills" class="ju-input" placeholder="逗号分隔，如：突击攻坚,装备获取" />
            </div>

            <div class="form-group">
              <label class="ju-label">期望段位标签（选填）</label>
              <select v-model="form.rankName" class="ju-input">
                <option value="铂金">铂金</option>
                <option value="钻石">钻石</option>
                <option value="大师">大师</option>
                <option value="传奇">传奇</option>
              </select>
            </div>

            <div class="form-group">
              <label class="ju-label">标签（选填）</label>
              <input v-model.trim="form.tags" class="ju-input" placeholder="逗号分隔，如：高效沟通,全程录屏" />
            </div>

            <div class="form-group">
              <label class="ju-label">期望时薪 ¥（选填）</label>
              <input v-model.number="form.pricePerHour" class="ju-input" type="number" min="1" step="1" placeholder="默认 99" />
            </div>

            <div class="form-group full-width">
              <label class="ju-label">联系备注（选填）</label>
              <input v-model.trim="form.contactNote" class="ju-input" placeholder="方便 BOSS 联系您的时段或方式说明" />
            </div>
          </div>

          <p v-if="formError" class="ju-error">{{ formError }}</p>

          <div class="ju-actions">
            <button type="button" class="ju-btn ju-btn-ghost" @click="router.push('/dashboard')">返回</button>
            <button type="submit" class="ju-btn ju-btn-primary" :disabled="submitting">
              {{ submitting ? '提交中…' : '提交申请' }}
            </button>
          </div>
        </form>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../layouts/Header.vue'
import Footer from '../layouts/Footer.vue'
import { joinApplicationApi, type JoinApplicationDto } from '../api/joinApplicationApi'

const router = useRouter()
const statusLoading = ref(true)
const submitting = ref(false)
const formError = ref('')
const myApp = ref<JoinApplicationDto | null>(null)
const isPlayer = ref(false) // 是否已是打手
const wasPlayer = ref(false) // 是否曾经是打手
const isApplicationBanned = ref(false) // 是否被禁止申请

const form = reactive({
  displayName: '',
  intro: '',
  skills: '',
  rankName: '铂金',
  tags: '',
  pricePerHour: 99 as number | undefined,
  contactNote: ''
})

const canShowForm = computed(() => {
  if (statusLoading.value) return false
  if (isPlayer.value) return false // 已是打手，不显示表单
  if (isApplicationBanned.value) return false // 被禁止申请，不显示表单
  if (!myApp.value) return true // 没有申请记录，显示表单
  if (myApp.value.status === 'REJECTED') return true // 申请被拒绝，显示表单
  if (wasPlayer.value) return true // 曾经是打手，现在可以重新申请
  if (!isPlayer.value && myApp.value && myApp.value.status === 'APPROVED') return true // 曾经通过申请但现在不是打手，允许重新申请
  return false
})

function formatTime(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('zh-CN')
}

async function loadStatus() {
  statusLoading.value = true
  try {
    const res = await joinApplicationApi.getMy()
    myApp.value = res.application

    const extended = res as { hasApplication: boolean; application: JoinApplicationDto | null; isPlayer?: boolean; wasPlayer?: boolean; isApplicationBanned?: boolean }
    isPlayer.value = extended.isPlayer || false
    wasPlayer.value = extended.wasPlayer || false
    isApplicationBanned.value = extended.isApplicationBanned || false
  } catch {
    myApp.value = null
    isPlayer.value = false
    wasPlayer.value = false
    isApplicationBanned.value = false
  } finally {
    statusLoading.value = false
  }
}

async function onSubmit() {
  formError.value = ''
  if (form.displayName.length < 2) {
    formError.value = '展示昵称至少 2 个字'
    return
  }
  if (form.intro.length < 10) {
    formError.value = '自我介绍至少 10 个字'
    return
  }
  submitting.value = true
  try {
    await joinApplicationApi.submit({
      displayName: form.displayName,
      intro: form.intro,
      skills: form.skills || undefined,
      rankName: form.rankName || undefined,
      tags: form.tags || undefined,
      pricePerHour: form.pricePerHour,
      contactNote: form.contactNote || undefined
    })
    await loadStatus()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : '提交失败'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadStatus()
})
</script>

<style scoped>
.join-us-page {
  min-height: 100vh;
  background: var(--m-bg);
  color: var(--m-text);
}

.ju-main {
  padding: 2.5rem 0 4rem;
}

.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 2rem;
}

.ju-hero {
  margin-bottom: 2rem;
}

.welcome {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  padding: 2rem 2.5rem;
  background: linear-gradient(135deg, var(--m-bg-secondary) 0%, var(--m-bg-secondary) 70%, var(--m-accent-light) 100%);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius);
  box-shadow: var(--m-shadow-sm);
  position: relative;
  overflow: hidden;
}

.welcome::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--m-accent), #06b6d4);
}

.welcome-greeting {
  font-size: 0.875rem;
  color: var(--m-accent);
  margin-bottom: 0.25rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.welcome-title {
  font-family: var(--m-font-display);
  font-size: 1.75rem;
  font-weight: 400;
  color: var(--m-text);
  margin-bottom: 0.5rem;
}

.welcome-date {
  font-size: 0.9375rem;
  color: var(--m-text-secondary);
  margin: 0;
  line-height: 1.6;
}

.ju-card {
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius);
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--m-shadow-sm);
  transition: all var(--m-transition);
}

.ju-card:hover {
  box-shadow: var(--m-shadow-md);
}

.ju-muted {
  color: var(--m-text-secondary);
  text-align: center;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1rem;
}

.loading-state i {
  font-size: 1.25rem;
}

.ju-warn {
  border-left: 4px solid var(--m-warning);
  background: linear-gradient(135deg, var(--m-bg-secondary) 0%, var(--m-warning-light) 100%);
}

.ju-ok {
  border-left: 4px solid var(--m-success);
  background: linear-gradient(135deg, var(--m-bg-secondary) 0%, var(--m-success-light) 100%);
}

.ju-reject {
  border-left: 4px solid var(--m-danger);
  background: linear-gradient(135deg, var(--m-bg-secondary) 0%, var(--m-danger-light) 100%);
}

.ju-info {
  border-left: 4px solid var(--m-accent);
  background: linear-gradient(135deg, var(--m-bg-secondary) 0%, var(--m-accent-light) 100%);
}

.ju-info .status-icon {
  color: var(--m-accent);
}

.ju-link {
  color: var(--m-accent);
  font-weight: 600;
  text-decoration: none;
  transition: color var(--m-transition);
}

.ju-link:hover {
  color: var(--m-accent-hover);
  text-decoration: underline;
}

.status-banner {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.status-icon {
  font-size: 2.5rem;
  padding-top: 0.25rem;
  flex-shrink: 0;
}

.ju-warn .status-icon {
  color: var(--m-warning);
}

.ju-ok .status-icon {
  color: var(--m-success);
}

.ju-reject .status-icon {
  color: var(--m-danger);
}

.status-content h2 {
  margin: 0 0 0.65rem;
  font-size: 1.25rem;
  color: var(--m-text);
  font-weight: 600;
}

.status-content p {
  margin: 0;
  color: var(--m-text-secondary);
  line-height: 1.6;
}

.ju-sub {
  font-size: 0.875rem;
  color: var(--m-text-muted);
  margin: 0.75rem 0 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-family: var(--m-font-display);
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--m-text);
  white-space: nowrap;
  margin: 0;
}

.section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--m-border), transparent);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.ju-label {
  display: block;
  font-size: 0.875rem;
  color: var(--m-text-secondary);
  margin: 0 0 0.5rem;
  font-weight: 500;
}

.req {
  color: var(--m-danger);
}

.ju-input,
.ju-textarea {
  width: 100%;
  box-sizing: border-box;
  background: var(--m-bg);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  color: var(--m-text);
  padding: 0.875rem 1rem;
  font-size: 1rem;
  transition: all var(--m-transition);
}

.ju-input:focus,
.ju-textarea:focus {
  outline: none;
  border-color: var(--m-accent);
  box-shadow: 0 0 0 3px var(--m-accent-light);
}

.ju-textarea {
  resize: vertical;
}

.ju-error {
  color: var(--m-danger);
  font-size: 0.875rem;
  margin: 1rem 0 0;
  padding: 0.75rem 1rem;
  background: var(--m-danger-light);
  border-radius: var(--m-radius-sm);
  border: 1px solid var(--m-danger-light);
}

.ju-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.75rem;
}

.ju-btn {
  border-radius: var(--m-radius-sm);
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--m-transition);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.ju-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ju-btn-primary {
  background: var(--m-accent);
  color: #fff;
}

.ju-btn-primary:hover:not(:disabled) {
  background: var(--m-accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--m-shadow-md);
}

.ju-btn-ghost {
  background: var(--m-bg);
  border-color: var(--m-border);
  color: var(--m-text);
}

.ju-btn-ghost:hover:not(:disabled) {
  border-color: var(--m-accent);
  color: var(--m-accent);
  background: var(--m-accent-light);
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .welcome {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .ju-actions {
    flex-direction: column-reverse;
  }

  .ju-btn {
    justify-content: center;
  }
}
</style>
