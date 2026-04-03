<template>
  <div class="player-desk-page">
    <Header />

    <main class="pd-main">
      <div class="container">
        <header class="pd-hero">
          <div class="pd-hero-text">
            <span class="pd-badge"><i class="fa fa-id-badge"></i> 打手工作台 · 1级权限</span>
            <h1>接单中心</h1>
            <p>查看顾客指定您的订单，及时处理「待接单」请求；拒单将通知顾客重新匹配。</p>
          </div>
          <div class="pd-hero-stats">
            <div class="pd-stat">
              <span class="pd-stat-label">待接单</span>
              <span class="pd-stat-value pd-warn">{{ stats?.pendingCount ?? '—' }}</span>
            </div>
            <div class="pd-stat">
              <span class="pd-stat-label">服务中</span>
              <span class="pd-stat-value pd-ok">{{ stats?.servingCount ?? '—' }}</span>
            </div>
            <div class="pd-stat">
              <span class="pd-stat-label">近7日完成</span>
              <span class="pd-stat-value">{{ stats?.completedWeekCount ?? '—' }}</span>
            </div>
          </div>
        </header>

        <p v-if="stats?.displayHint" class="pd-hint">
          <i class="fa fa-lightbulb-o"></i> {{ stats.displayHint }}
        </p>

        <section class="pd-section">
          <div class="pd-section-head">
            <h2><i class="fa fa-inbox"></i> 待接单</h2>
            <button type="button" class="pd-refresh" :disabled="loading" @click="loadAll">
              <i class="fa" :class="loading ? 'fa-spinner fa-spin' : 'fa-refresh'"></i>
              刷新
            </button>
          </div>

          <div v-if="loading && !pending.length" class="pd-loading">加载中…</div>
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
                  <span><i class="fa fa-clock-o"></i> {{ formatTime(String(row.createdAt || '')) }}</span>
                  <span v-if="row.amount != null"><i class="fa fa-cny"></i> {{ row.amount }}</span>
                </div>
              </div>
              <div class="pd-card-actions">
                <button type="button" class="pd-btn pd-btn-primary" :disabled="actingId === String(row.id)" @click="accept(String(row.id))">
                  接单
                </button>
                <button type="button" class="pd-btn pd-btn-ghost" :disabled="actingId === String(row.id)" @click="openReject(String(row.id))">
                  拒单
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section class="pd-section">
          <div class="pd-section-head">
            <h2><i class="fa fa-play-circle"></i> 服务中</h2>
          </div>
          <div v-if="!serving.length" class="pd-empty subtle">当前没有进行中的订单。</div>
          <ul v-else class="pd-order-list">
            <li v-for="row in serving" :key="'s-' + String(row.id)" class="pd-card pd-card-serving">
              <div class="pd-card-main">
                <div class="pd-card-title">
                  <span v-if="String(row.status) === 'COMPLETION_PENDING'" class="pd-tag-pending">待 BOSS 审核完成</span>
                  <span v-else class="pd-tag-live">进行中</span>
                  <span class="pd-game">{{ String(row.game || '—') }}</span>
                  <span class="pd-type">{{ String(row.serviceType || '') }}</span>
                </div>
                <div class="pd-meta">
                  <span><i class="fa fa-user"></i> {{ String(row.customerUsername || '—') }}</span>
                  <span v-if="row.startTime"><i class="fa fa-calendar"></i> 约定：{{ formatTime(String(row.startTime)) }}</span>
                </div>
                <p v-if="row.completionRequestNote" class="pd-note">
                  已提交说明：{{ String(row.completionRequestNote) }}
                </p>
              </div>
              <div v-if="String(row.status) === 'IN_PROGRESS'" class="pd-card-actions">
                <button
                  type="button"
                  class="pd-btn pd-btn-primary"
                  :disabled="actingId === String(row.id)"
                  @click="openComplete(String(row.id))"
                >
                  申请完成订单
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section class="pd-tips">
          <h3><i class="fa fa-shield"></i> 履约提示</h3>
          <ul>
            <li>接单后主动私聊或按平台约定联系顾客，确认地图、难度与上号时间。</li>
            <li>若无法承接请尽快拒单，避免顾客长时间等待。</li>
            <li>服务全程遵守平台规范，拒绝任何作弊与账号共享风险行为。</li>
          </ul>
        </section>
      </div>
    </main>

    <Footer />

    <div v-if="completeForId" class="pd-modal-backdrop" @click.self="completeForId = null">
      <div class="pd-modal">
        <h3>申请完成订单</h3>
        <p class="pd-modal-tip">提交后由平台 BOSS 审核，通过前订单仍为进行中。</p>
        <textarea v-model="completeNote" rows="3" placeholder="可选：履约说明、截图说明等" class="pd-textarea"></textarea>
        <div class="pd-modal-actions">
          <button type="button" class="pd-btn pd-btn-ghost" @click="completeForId = null">取消</button>
          <button type="button" class="pd-btn pd-btn-primary" @click="confirmComplete">提交申请</button>
        </div>
      </div>
    </div>

    <div v-if="rejectForId" class="pd-modal-backdrop" @click.self="rejectForId = null">
      <div class="pd-modal">
        <h3>拒单说明（可选）</h3>
        <textarea v-model="rejectReason" rows="3" placeholder="例如：当前档期已满、不擅长该地图等" class="pd-textarea"></textarea>
        <div class="pd-modal-actions">
          <button type="button" class="pd-btn pd-btn-ghost" @click="rejectForId = null">取消</button>
          <button type="button" class="pd-btn pd-btn-danger" @click="confirmReject">确认拒单</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '../layouts/Header.vue'
import Footer from '../layouts/Footer.vue'
import { playerDeskApi, type PlayerDeskStats, type PlayerDeskOrder } from '../api/playerDeskApi'

const stats = ref<PlayerDeskStats | null>(null)
const pending = ref<PlayerDeskOrder[]>([])
const serving = ref<PlayerDeskOrder[]>([])
const loading = ref(true)
const actingId = ref<string | null>(null)
const rejectForId = ref<string | null>(null)
const rejectReason = ref('')
const completeForId = ref<string | null>(null)
const completeNote = ref('')

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
})
</script>

<style scoped>
.player-desk-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0c1222 0%, #111827 40%);
  color: #e5e7eb;
}
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1rem 3rem;
}
.pd-main {
  padding-top: 1.5rem;
}
.pd-hero {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.pd-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.12);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  margin-bottom: 0.5rem;
}
.pd-hero h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #f9fafb;
  margin: 0 0 0.35rem;
}
.pd-hero p {
  margin: 0;
  color: #94a3b8;
  max-width: 36rem;
  line-height: 1.5;
  font-size: 0.95rem;
}
.pd-hero-stats {
  display: flex;
  gap: 1rem;
}
.pd-stat {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  min-width: 5.5rem;
  text-align: center;
}
.pd-stat-label {
  display: block;
  font-size: 0.72rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}
.pd-stat-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: #f1f5f9;
}
.pd-warn {
  color: #fbbf24;
}
.pd-ok {
  color: #34d399;
}
.pd-hint {
  font-size: 0.88rem;
  color: #cbd5e1;
  background: rgba(59, 130, 246, 0.08);
  border-left: 3px solid #3b82f6;
  padding: 0.65rem 0.85rem;
  border-radius: 0 8px 8px 0;
  margin-bottom: 1.5rem;
}
.pd-section {
  margin-bottom: 2rem;
}
.pd-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.pd-section-head h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #f3f4f6;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.pd-refresh {
  background: rgba(55, 65, 81, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #e5e7eb;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
}
.pd-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pd-loading,
.pd-empty {
  padding: 2rem;
  text-align: center;
  color: #64748b;
  background: rgba(2, 6, 23, 0.35);
  border-radius: 12px;
  border: 1px dashed rgba(71, 85, 105, 0.4);
}
.pd-empty.subtle {
  border-style: solid;
  border-color: rgba(51, 65, 85, 0.35);
}
.pd-order-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.pd-card {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.1rem;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(71, 85, 105, 0.35);
  border-radius: 14px;
}
.pd-card-serving {
  border-color: rgba(16, 185, 129, 0.25);
  background: rgba(6, 78, 59, 0.12);
}
.pd-card-main {
  flex: 1;
  min-width: 200px;
}
.pd-card-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}
.pd-game {
  font-weight: 700;
  color: #f9fafb;
}
.pd-type {
  font-size: 0.85rem;
  color: #94a3b8;
}
.pd-tag-live {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6ee7b7;
  background: rgba(16, 185, 129, 0.15);
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
}
.pd-tag-pending {
  font-size: 0.7rem;
  font-weight: 700;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.12);
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
}
.pd-note {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: #cbd5e1;
  line-height: 1.45;
}
.pd-modal-tip {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.45;
}
.pd-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  font-size: 0.82rem;
  color: #9ca3af;
}
.pd-meta i {
  margin-right: 0.25rem;
  opacity: 0.85;
}
.pd-card-actions {
  display: flex;
  gap: 0.5rem;
}
.pd-btn {
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.pd-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.pd-btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
}
.pd-btn-ghost {
  background: rgba(51, 65, 85, 0.5);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.25);
}
.pd-btn-danger {
  background: rgba(220, 38, 38, 0.9);
  color: #fff;
}
.pd-tips {
  margin-top: 2rem;
  padding: 1rem 1.2rem;
  background: rgba(2, 6, 23, 0.45);
  border-radius: 14px;
  border: 1px solid rgba(55, 65, 81, 0.4);
}
.pd-tips h3 {
  margin: 0 0 0.65rem;
  font-size: 0.95rem;
  color: #e5e7eb;
}
.pd-tips ul {
  margin: 0;
  padding-left: 1.2rem;
  color: #94a3b8;
  font-size: 0.88rem;
  line-height: 1.6;
}
.pd-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}
.pd-modal {
  width: 100%;
  max-width: 400px;
  background: #1e293b;
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 14px;
  padding: 1.25rem;
}
.pd-modal h3 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: #f1f5f9;
}
.pd-textarea {
  width: 100%;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid rgba(71, 85, 105, 0.6);
  background: #0f172a;
  color: #e5e7eb;
  padding: 0.5rem 0.65rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 1rem;
}
.pd-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
