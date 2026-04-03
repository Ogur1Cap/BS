<template>
  <div class="join-us-page">
    <Header />
    <main class="ju-main">
      <div class="container">
        <header class="ju-hero">
          <span class="ju-badge"><i class="fa fa-user-plus"></i> 加入我们</span>
          <h1>申请成为认证打手</h1>
          <p>提交资料后由平台 BOSS 审核；通过后您的大厅资料将对顾客可见，并可使用打手工作台接单。</p>
        </header>

        <div v-if="statusLoading" class="ju-card ju-muted">加载申请状态中…</div>

        <div v-else-if="myApp && myApp.status === 'PENDING'" class="ju-card ju-warn">
          <h2><i class="fa fa-clock-o"></i> 审核中</h2>
          <p>您提交的申请正在审核，请耐心等待。展示昵称：<strong>{{ myApp.displayName }}</strong></p>
          <p class="ju-sub">提交时间：{{ formatTime(myApp.createdAt) }}</p>
        </div>

        <div v-else-if="myApp && myApp.status === 'APPROVED'" class="ju-card ju-ok">
          <h2><i class="fa fa-check-circle"></i> 已通过</h2>
          <p>恭喜！您的打手申请已通过。<strong>请重新登录</strong>以刷新权限并使用打手工作台。</p>
        </div>

        <div v-else-if="myApp && myApp.status === 'REJECTED'" class="ju-card ju-reject">
          <h2><i class="fa fa-times-circle"></i> 未通过</h2>
          <p>{{ myApp.rejectReason || '未说明原因' }}</p>
          <p class="ju-sub">您可修改资料后再次提交申请。</p>
        </div>

        <form v-if="canShowForm" class="ju-card ju-form" @submit.prevent="onSubmit">
          <h2 class="ju-form-title">填写入驻信息</h2>
          <label class="ju-label">大厅展示昵称 <span class="req">*</span></label>
          <input v-model.trim="form.displayName" class="ju-input" maxlength="100" placeholder="2–100 字，将展示在打手大厅" />

          <label class="ju-label">自我介绍 <span class="req">*</span></label>
          <textarea
            v-model.trim="form.intro"
            class="ju-textarea"
            rows="5"
            maxlength="500"
            placeholder="10–500 字：经验、擅长模式、服务风格等"
          />

          <label class="ju-label">擅长领域（选填）</label>
          <input v-model.trim="form.skills" class="ju-input" placeholder="逗号分隔，如：突击攻坚,装备获取" />

          <label class="ju-label">期望段位标签（选填）</label>
          <select v-model="form.rankName" class="ju-input">
            <option value="铂金">铂金</option>
            <option value="钻石">钻石</option>
            <option value="大师">大师</option>
            <option value="传奇">传奇</option>
          </select>

          <label class="ju-label">标签（选填）</label>
          <input v-model.trim="form.tags" class="ju-input" placeholder="逗号分隔，如：高效沟通,全程录屏" />

          <label class="ju-label">期望时薪 ¥（选填）</label>
          <input v-model.number="form.pricePerHour" class="ju-input" type="number" min="1" step="1" placeholder="默认 99" />

          <label class="ju-label">联系备注（选填）</label>
          <input v-model.trim="form.contactNote" class="ju-input" placeholder="方便 BOSS 联系您的时段或方式说明" />

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
  if (!myApp.value) return true
  if (myApp.value.status === 'REJECTED') return true
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
  } catch {
    myApp.value = null
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
  background: linear-gradient(165deg, #0f172a 0%, #111827 50%);
  color: #e5e7eb;
}
.ju-main {
  padding: 2rem 0 4rem;
}
.container {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 1rem;
}
.ju-hero {
  margin-bottom: 1.5rem;
}
.ju-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: #38bdf8;
  margin-bottom: 0.5rem;
}
.ju-hero h1 {
  margin: 0 0 0.5rem;
  font-size: 1.65rem;
}
.ju-hero p {
  margin: 0;
  color: #94a3b8;
  line-height: 1.55;
  font-size: 0.95rem;
}
.ju-card {
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid rgba(71, 85, 105, 0.45);
  border-radius: 12px;
  padding: 1.25rem 1.35rem;
  margin-bottom: 1rem;
}
.ju-muted {
  color: #94a3b8;
  text-align: center;
}
.ju-warn {
  border-color: rgba(251, 191, 36, 0.35);
}
.ju-ok {
  border-color: rgba(52, 211, 153, 0.35);
}
.ju-reject {
  border-color: rgba(248, 113, 113, 0.35);
}
.ju-card h2 {
  margin: 0 0 0.65rem;
  font-size: 1.05rem;
}
.ju-sub {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0.5rem 0 0;
}
.ju-form-title {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}
.ju-label {
  display: block;
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0.75rem 0 0.35rem;
}
.req {
  color: #f87171;
}
.ju-input,
.ju-textarea {
  width: 100%;
  box-sizing: border-box;
  background: #0f172a;
  border: 1px solid rgba(71, 85, 105, 0.7);
  border-radius: 8px;
  color: #f1f5f9;
  padding: 0.5rem 0.65rem;
  font-size: 0.9rem;
}
.ju-textarea {
  resize: vertical;
}
.ju-error {
  color: #fca5a5;
  font-size: 0.85rem;
  margin: 0.75rem 0 0;
}
.ju-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.25rem;
}
.ju-btn {
  border-radius: 8px;
  padding: 0.5rem 1.1rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: 1px solid transparent;
}
.ju-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ju-btn-primary {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: #fff;
}
.ju-btn-ghost {
  background: transparent;
  border-color: rgba(148, 163, 184, 0.4);
  color: #e2e8f0;
}
</style>
