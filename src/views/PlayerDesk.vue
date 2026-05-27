<template>
  <div class="player-desk-page">
    <Header />

    <main class="pd-main">
      <div class="container">
        <header class="pd-hero">
          <div class="welcome">
            <div class="welcome-text">
              <span class="welcome-greeting"><i class="fa fa-id-badge"></i> 打手工作台 · 1级权限</span>
              <h1 class="welcome-title">接单中心</h1>
              <p class="welcome-date">查看顾客指定您的订单，及时处理「待接单」请求；拒单将通知顾客重新匹配。</p>
            </div>
            <div class="welcome-stats">
              <div class="stat">
                <span class="stat-value">{{ stats?.pendingCount ?? '—' }}</span>
                <span class="stat-label">待接单</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat">
                <span class="stat-value">{{ stats?.servingCount ?? '—' }}</span>
                <span class="stat-label">服务中</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat">
                <span class="stat-value">{{ stats?.completedWeekCount ?? '—' }}</span>
                <span class="stat-label">近7日完成</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat">
                <router-link to="/wallet" class="stat-link">
                  <span class="stat-value wallet-value">{{ walletStore.balanceDisplay }}</span>
                  <span class="stat-label"><i class="fa fa-coins"></i> 我的收益</span>
                </router-link>
              </div>
            </div>
          </div>
        </header>

        <div v-if="stats?.displayHint" class="pd-hint">
          <i class="far fa-lightbulb"></i> {{ stats.displayHint }}
        </div>

        <section class="pd-section">
          <div class="section-header">
            <h2 class="section-title"><i class="fa fa-inbox"></i> 待接单</h2>
            <span class="section-line"></span>
            <button type="button" class="pd-refresh" :disabled="loading" @click="loadAll">
              <i class="fa" :class="loading ? 'fa-spinner fa-spin' : 'fa-refresh'"></i>
              刷新
            </button>
          </div>

          <div v-if="loading && !pending.length" class="pd-loading">
            <i class="fa fa-spinner fa-spin"></i>
            <span>加载中…</span>
          </div>
          <div v-else-if="!pending.length" class="pd-empty">暂无待处理订单，顾客下单指定您后会出现在这里。</div>
          <ul v-else class="pd-order-list">
            <li v-for="row in pending" :key="String(row.id)" class="pd-card">
              <div class="pd-card-main">
                <div class="pd-card-title">
                  <span class="pd-game">{{ String(row.game || '—') }}</span>
                  <span class="pd-type">{{ String(row.serviceType || '') }}</span>
                </div>
                <div class="pd-meta">
                  <span><i class="fa fa-user"></i> 顾客：{{ String(row.customerUsername || '—') }}</span>
                  <span><i class="far fa-clock"></i> {{ formatTime(String(row.createdAt || '')) }}</span>
                  <span v-if="row.amount != null"><i class="fa fa-yen-sign"></i> {{ row.amount }}</span>
                </div>
              </div>
              <div class="pd-card-actions">
                <button type="button" class="pd-btn pd-btn-primary" :disabled="actingId === String(row.id)" @click="accept(String(row.id))">
                  <i class="fa fa-check"></i> 接单
                </button>
                <button type="button" class="pd-btn pd-btn-ghost" :disabled="actingId === String(row.id)" @click="openReject(String(row.id))">
                  <i class="fa fa-times"></i> 拒单
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section class="pd-section">
          <div class="section-header">
            <h2 class="section-title"><i class="fa fa-play-circle"></i> 服务中</h2>
            <span class="section-line"></span>
          </div>
          <div v-if="!serving.length" class="pd-empty subtle">当前没有进行中的订单。</div>
          <ul v-else class="pd-order-list">
            <li v-for="row in serving" :key="'s-' + String(row.id)" class="pd-card pd-card-serving">
              <div class="pd-card-main">
                <div class="pd-card-title">
                  <span v-if="String(row.status) === 'COMPLETION_PENDING'" class="pd-tag-pending">
                    <i class="far fa-clock"></i> 待 BOSS 审核完成
                  </span>
                  <span v-else class="pd-tag-live">
                    <i class="fa fa-circle"></i> 进行中
                  </span>
                  <span class="pd-game">{{ String(row.game || '—') }}</span>
                  <span class="pd-type">{{ String(row.serviceType || '') }}</span>
                </div>
                <div class="pd-meta">
                  <span><i class="fa fa-user"></i> {{ String(row.customerUsername || '—') }}</span>
                  <span v-if="row.startTime"><i class="fa fa-calendar"></i> 约定：{{ formatTime(String(row.startTime)) }}</span>
                </div>
                <p v-if="row.completionRequestNote" class="pd-note">
                  <i class="fa fa-comment"></i> 已提交说明：{{ String(row.completionRequestNote) }}
                </p>
              </div>
              <div v-if="String(row.status) === 'IN_PROGRESS'" class="pd-card-actions">
                <button
                  type="button"
                  class="pd-btn pd-btn-primary"
                  :disabled="actingId === String(row.id)"
                  @click="openComplete(String(row.id))"
                >
                  <i class="fa fa-flag-checkered"></i> 申请完成订单
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section class="pd-tips">
          <div class="section-header">
            <h3 class="section-title"><i class="fa fa-shield"></i> 履约提示</h3>
            <span class="section-line"></span>
          </div>
          <ul>
            <li><i class="far fa-hand-pointer"></i> 接单后主动私聊或按平台约定联系顾客，确认地图、难度与上号时间。</li>
            <li><i class="far fa-bell"></i> 若无法承接请尽快拒单，避免顾客长时间等待。</li>
            <li><i class="fa fa-shield"></i> 服务全程遵守平台规范，拒绝任何作弊与账号共享风险行为。</li>
          </ul>
        </section>
      </div>
    </main>

    <Footer />

    <div v-if="completeForId" class="pd-modal-backdrop" @click.self="completeForId = null">
      <div class="pd-modal">
        <div class="pd-modal-header">
          <h3>申请完成订单</h3>
          <button type="button" class="pd-modal-close" @click="completeForId = null">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <p class="pd-modal-tip">提交后由平台 BOSS 审核，通过前订单仍为进行中。</p>
        <textarea v-model="completeNote" rows="4" placeholder="可选：履约说明、截图说明等" class="pd-textarea"></textarea>
        <div class="pd-modal-actions">
          <button type="button" class="pd-btn pd-btn-ghost" @click="completeForId = null">取消</button>
          <button type="button" class="pd-btn pd-btn-primary" @click="confirmComplete">提交申请</button>
        </div>
      </div>
    </div>

    <div v-if="rejectForId" class="pd-modal-backdrop" @click.self="rejectForId = null">
      <div class="pd-modal">
        <div class="pd-modal-header">
          <h3>拒单说明（可选）</h3>
          <button type="button" class="pd-modal-close" @click="rejectForId = null">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <textarea v-model="rejectReason" rows="4" placeholder="例如：当前档期已满、不擅长该地图等" class="pd-textarea"></textarea>
        <div class="pd-modal-actions">
          <button type="button" class="pd-btn pd-btn-ghost" @click="rejectForId = null">取消</button>
          <button type="button" class="pd-btn pd-btn-danger" @click="confirmReject">确认拒单</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * 打手工作台 - 核心业务逻辑
 * 功能：
 *   1. 待接单列表 - 查看顾客指定自己的订单
 *   2. 接单(accept) - 确认承接 → 订单进入「进行中」
 *   3. 拒单(reject) - 拒接订单 → 通知顾客重新匹配
 *   4. 申请完成 - 打手提交完成申请 → BOSS审核
 * 订单状态：pending(待接单) → IN_PROGRESS(进行中) → COMPLETION_PENDING(待审核) → COMPLETED(已完成)
 */
import { ref, computed, onMounted } from 'vue'
import Header from '../layouts/Header.vue'
import Footer from '../layouts/Footer.vue'
import { playerDeskApi, type PlayerDeskStats, type PlayerDeskOrder } from '../api/playerDeskApi'
import { useWalletStore } from '../stores/wallet'
import { useEscKey } from '../composables/useEscKey'

const walletStore = useWalletStore()

const stats = ref<PlayerDeskStats | null>(null)
const pending = ref<PlayerDeskOrder[]>([])
const serving = ref<PlayerDeskOrder[]>([])
const loading = ref(true)
const actingId = ref<string | null>(null)
const rejectForId = ref<string | null>(null)
const rejectReason = ref('')
const completeForId = ref<string | null>(null)
const completeNote = ref('')

const showRejectModal = computed({
  get: () => rejectForId.value !== null,
  set: (v: boolean) => { if (!v) rejectForId.value = null }
})
const showCompleteModal = computed({
  get: () => completeForId.value !== null,
  set: (v: boolean) => { if (!v) completeForId.value = null }
})

useEscKey(showRejectModal, () => { rejectForId.value = null })
useEscKey(showCompleteModal, () => { completeForId.value = null })

async function loadAll() {
  loading.value = true
  try {
    const [st, p, s] = await Promise.all([
      playerDeskApi.getStats(),
      playerDeskApi.listPending(),
      playerDeskApi.listServing()
    ])
    stats.value = st
    pending.value = p
    serving.value = s
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function formatTime(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// 【核心交互-1】接单：确认承接订单 → 状态从pending变为IN_PROGRESS
async function accept(orderId: string) {
  actingId.value = orderId
  try {
    pending.value = await playerDeskApi.acceptOrder(orderId)
    const [st, s] = await Promise.all([playerDeskApi.getStats(), playerDeskApi.listServing()])
    stats.value = st
    serving.value = s
  } catch (e) {
    console.error(e)
    alert(e instanceof Error ? e.message : '操作失败')
  } finally {
    actingId.value = null
  }
}

function openReject(orderId: string) {
  rejectForId.value = orderId
  rejectReason.value = ''
}

function openComplete(orderId: string) {
  completeForId.value = orderId
  completeNote.value = ''
}

// 【核心交互-3】申请完成订单 → 打手提交完成说明 → 等待BOSS审核
async function confirmComplete() {
  const id = completeForId.value
  if (!id) return
  actingId.value = id
  try {
    serving.value = await playerDeskApi.requestOrderComplete(id, completeNote.value.trim() || undefined)
    stats.value = await playerDeskApi.getStats()
    completeForId.value = null
  } catch (e) {
    console.error(e)
    alert(e instanceof Error ? e.message : '操作失败')
  } finally {
    actingId.value = null
  }
}

// 【核心交互-2】拒单：拒绝订单 → 通知顾客重新匹配打手
async function confirmReject() {
  const id = rejectForId.value
  if (!id) return
  actingId.value = id
  try {
    pending.value = await playerDeskApi.rejectOrder(id, rejectReason.value.trim() || undefined)
    stats.value = await playerDeskApi.getStats()
    rejectForId.value = null
  } catch (e) {
    console.error(e)
    alert(e instanceof Error ? e.message : '操作失败')
  } finally {
    actingId.value = null
  }
}

onMounted(() => {
  void loadAll()
  walletStore.ensureLoaded()
})
</script>

<style scoped>
.player-desk-page {
  min-height: 100vh;
  background: var(--m-bg);
  color: var(--m-text);
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.pd-main {
  padding-top: 2.5rem;
}

.pd-hero {
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

.welcome-text {
  flex: 1;
}

.welcome-greeting {
  font-size: 0.875rem;
  color: var(--m-accent);
  margin-bottom: 0.5rem;
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

.welcome-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--m-accent);
  line-height: 1;
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--m-text-muted);
  margin-top: 0.25rem;
  display: block;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(180deg, transparent, var(--m-border), transparent);
}

.pd-hint {
  font-size: 0.9375rem;
  color: var(--m-text-secondary);
  background: var(--m-accent-light);
  border-left: 3px solid var(--m-accent);
  padding: 1rem 1.25rem;
  border-radius: 0 var(--m-radius-sm) var(--m-radius-sm) 0;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.pd-hint i {
  color: var(--m-accent);
  font-size: 1.125rem;
  margin-top: 0.125rem;
}

.pd-section {
  margin-bottom: 2.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.section-title {
  font-family: var(--m-font-display);
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--m-text);
  white-space: nowrap;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--m-border), transparent);
}

.pd-refresh {
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  color: var(--m-text-secondary);
  padding: 0.5rem 1rem;
  border-radius: var(--m-radius-sm);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--m-transition);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.pd-refresh:hover:not(:disabled) {
  border-color: var(--m-accent);
  color: var(--m-accent);
  background: var(--m-accent-light);
}

.pd-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pd-loading,
.pd-empty {
  padding: 3rem 2rem;
  text-align: center;
  color: var(--m-text-muted);
  background: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  border: 1px dashed var(--m-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.pd-loading i {
  font-size: 1.5rem;
  color: var(--m-accent);
}

.pd-empty.subtle {
  border-style: solid;
  background: var(--m-bg-secondary);
}

.pd-order-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pd-card {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem;
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius);
  box-shadow: var(--m-shadow-sm);
  transition: all var(--m-transition);
}

.pd-card:hover {
  box-shadow: var(--m-shadow-md);
  transform: translateY(-2px);
}

.pd-card-serving {
  border-left: 3px solid var(--m-success);
  background: linear-gradient(90deg, var(--m-success-light) 0%, var(--m-bg-secondary) 100%);
}

.pd-card-main {
  flex: 1;
  min-width: 250px;
}

.pd-card-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.pd-game {
  font-weight: 600;
  color: var(--m-text);
  font-size: 1.125rem;
}

.pd-type {
  font-size: 0.875rem;
  color: var(--m-text-secondary);
}

.pd-tag-live {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--m-success);
  background: var(--m-success-light);
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.pd-tag-live i {
  animation: pulse 2s infinite;
  font-size: 0.5rem;
}

.pd-tag-pending {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--m-warning);
  background: var(--m-warning-light);
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.pd-note {
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
  color: var(--m-text-secondary);
  line-height: 1.6;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.pd-note i {
  color: var(--m-accent);
  margin-top: 0.125rem;
}

.pd-modal-tip {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--m-text-secondary);
  line-height: 1.6;
}

.pd-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
  font-size: 0.875rem;
  color: var(--m-text-muted);
}

.pd-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.pd-meta i {
  color: var(--m-text-muted);
}

.pd-card-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.pd-btn {
  border: none;
  border-radius: var(--m-radius-sm);
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--m-transition);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.pd-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.pd-btn-primary {
  background: var(--m-accent);
  color: #fff;
}

.pd-btn-primary:hover:not(:disabled) {
  background: var(--m-accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--m-shadow-md);
}

.pd-btn-ghost {
  background: var(--m-bg);
  border: 1px solid var(--m-border);
  color: var(--m-text-secondary);
}

.pd-btn-ghost:hover:not(:disabled) {
  border-color: var(--m-accent);
  color: var(--m-accent);
  background: var(--m-accent-light);
  transform: translateY(-1px);
}

.pd-btn-danger {
  background: var(--m-danger);
  color: #fff;
}

.pd-btn-danger:hover:not(:disabled) {
  background: var(--m-danger-hover);
  transform: translateY(-1px);
  box-shadow: var(--m-shadow-md);
}

.pd-tips {
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius);
  padding: 1.5rem;
  box-shadow: var(--m-shadow-sm);
}

.pd-tips ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pd-tips li {
  color: var(--m-text-secondary);
  font-size: 0.9375rem;
  line-height: 1.6;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.pd-tips li i {
  color: var(--m-accent);
  margin-top: 0.125rem;
  font-size: 1rem;
}

.pd-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.pd-modal {
  width: 100%;
  max-width: 450px;
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius);
  padding: 1.5rem;
  box-shadow: var(--m-shadow-lg);
}

.pd-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.pd-modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--m-text);
}

.pd-modal-close {
  background: none;
  border: none;
  color: var(--m-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1.25rem;
  transition: color var(--m-transition);
}

.pd-modal-close:hover {
  color: var(--m-text);
}

.pd-textarea {
  width: 100%;
  box-sizing: border-box;
  border-radius: var(--m-radius-sm);
  border: 1px solid var(--m-border);
  background: var(--m-bg);
  color: var(--m-text);
  padding: 0.875rem 1rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 1.25rem;
  font-size: 0.9375rem;
  transition: border-color var(--m-transition), box-shadow var(--m-transition);
}

.pd-textarea:focus {
  outline: none;
  border-color: var(--m-accent);
  box-shadow: 0 0 0 3px var(--m-accent-light);
}

.pd-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem 3rem;
  }

  .welcome {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .welcome-stats {
    width: 100%;
    justify-content: space-around;
  }

  .pd-card {
    flex-direction: column;
    align-items: stretch;
  }

  .pd-card-actions {
    width: 100%;
    justify-content: stretch;
  }

  .pd-card-actions .pd-btn {
    flex: 1;
    justify-content: center;
  }
}

.stat-link {
  text-decoration: none;
  color: inherit;
  display: block;
  transition: all var(--m-transition);
}

.stat-link:hover {
  transform: translateY(-2px);
}

.wallet-value {
  color: #fbbf24 !important;
}
</style>
