<template>
  <div class="boss-desk-page">
    <Header />

    <main class="bd-main">
      <div class="container">
        <header class="bd-hero">
          <div class="bd-hero-text">
            <span class="bd-badge"><i class="fa fa-shield"></i> BOSS 控制台 · 最高权限</span>
            <h1>订单审核与调度</h1>
            <p>处理打手提交的「完成申请」，或转派订单并通知顾客。</p>
          </div>
          <div class="bd-hero-stats">
            <div class="bd-stat">
              <span class="bd-stat-label">待审核完成</span>
              <span class="bd-stat-value bd-warn">{{ stats?.pendingCompletionCount ?? '—' }}</span>
            </div>
            <div class="bd-stat">
              <span class="bd-stat-label">可调度订单</span>
              <span class="bd-stat-value bd-ok">{{ stats?.manageableOrderCount ?? '—' }}</span>
            </div>
            <div v-if="stats?.pendingJoinCount != null" class="bd-stat">
              <span class="bd-stat-label">待审入驻</span>
              <span class="bd-stat-value bd-warn">{{ stats.pendingJoinCount }}</span>
            </div>
          </div>
        </header>

        <p v-if="stats?.displayHint" class="bd-hint">
          <i class="fa fa-lightbulb-o"></i> {{ stats.displayHint }}
        </p>

        <section class="bd-section">
          <div class="bd-section-head">
            <h2><i class="fa fa-check-square-o"></i> 待审核完成申请</h2>
            <button type="button" class="bd-refresh" :disabled="loading" @click="loadAll">
              <i class="fa" :class="loading ? 'fa-spinner fa-spin' : 'fa-refresh'"></i>
              刷新
            </button>
          </div>
          <div v-if="loading && !completionPending.length" class="bd-loading">加载中…</div>
          <div v-else-if="!completionPending.length" class="bd-empty">暂无待审核的完成申请。</div>
          <ul v-else class="bd-order-list">
            <li v-for="row in completionPending" :key="'c-' + String(row.id)" class="bd-card">
              <div class="bd-card-main">
                <div class="bd-card-title">
                  <span class="bd-tag">待审核</span>
                  <span class="bd-game">{{ String(row.game || '—') }}</span>
                  <span class="bd-type">{{ String(row.serviceType || '') }}</span>
                </div>
                <div class="bd-meta">
                  <span><i class="fa fa-user"></i> 顾客：{{ String(row.customerUsername || '—') }}</span>
                  <span><i class="fa fa-user-secret"></i> 打手：{{ deskPlayerName(row) }}</span>
                  <span><i class="fa fa-hashtag"></i> #{{ String(row.id) }}</span>
                </div>
                <p v-if="row.completionRequestNote" class="bd-note">
                  <strong>打手说明：</strong>{{ String(row.completionRequestNote) }}
                </p>
              </div>
              <div class="bd-card-actions">
                <button
                  type="button"
                  class="bd-btn bd-btn-primary"
                  :disabled="actingId === String(row.id)"
                  @click="approve(String(row.id))"
                >
                  同意完成
                </button>
                <button
                  type="button"
                  class="bd-btn bd-btn-ghost"
                  :disabled="actingId === String(row.id)"
                  @click="openReject(String(row.id))"
                >
                  驳回
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section class="bd-section">
          <div class="bd-section-head">
            <h2><i class="fa fa-random"></i> 转派订单</h2>
          </div>
          <p class="bd-sub">以下为待接单、进行中或待审核中的订单，可选择目标打手并填写备注（将通知顾客及相关打手）。</p>
          <div v-if="!manageable.length" class="bd-empty subtle">暂无可调度订单。</div>
          <ul v-else class="bd-order-list">
            <li v-for="row in manageable" :key="'m-' + String(row.id)" class="bd-card bd-card-muted">
              <div class="bd-card-main">
                <div class="bd-card-title">
                  <span class="bd-status-pill">{{ String(row.statusText || row.status) }}</span>
                  <span class="bd-game">{{ String(row.game || '—') }}</span>
                  <span class="bd-type">{{ String(row.serviceType || '') }}</span>
                </div>
                <div class="bd-meta">
                  <span><i class="fa fa-user"></i> {{ String(row.customerUsername || '—') }}</span>
                  <span><i class="fa fa-user-secret"></i> 当前打手：{{ deskPlayerName(row, '未指定') }}</span>
                  <span>#{{ String(row.id) }}</span>
                </div>
              </div>
              <div class="bd-card-actions">
                <button type="button" class="bd-btn bd-btn-warn" :disabled="actingId === String(row.id)" @click="openReassign(row)">
                  转派
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section class="bd-section" id="violation-management">
          <div class="bd-section-head">
            <h2><i class="fa fa-gavel"></i> 违规预警管理</h2>
            <button type="button" class="bd-refresh" :disabled="loading" @click="loadAll">
              <i class="fa" :class="loading ? 'fa-spinner fa-spin' : 'fa-refresh'"></i>
            </button>
          </div>
          <p class="bd-sub">处理系统自动监测到的违规行为和用户的申诉，维护平台秩序。</p>
          <div class="bd-tabs">
            <button class="bd-tab" :class="{ active: violationTab === 'pending' }" @click="violationTab = 'pending'">待处理预警 ({{ pendingViolations.length }})</button>
            <button class="bd-tab" :class="{ active: violationTab === 'appealed' }" @click="violationTab = 'appealed'">用户申诉 ({{ appealedViolations.length }})</button>
            <button class="bd-tab" :class="{ active: violationTab === 'all' }" @click="loadAllViolations(); violationTab = 'all'">全部记录</button>
          </div>
          
          <div v-if="currentViolations.length === 0" class="bd-empty subtle">暂无相关违规记录。</div>
          <ul v-else class="bd-order-list">
            <li v-for="row in currentViolations" :key="'v-' + row.id" class="bd-card">
              <div class="bd-card-main">
                <div class="bd-card-title">
                  <span class="bd-tag" :class="'v-' + row.status.toLowerCase()">{{ getViolationStatusText(row.status) }}</span>
                  <span class="bd-status-pill v-type">{{ getViolationTypeText(row.type) }}</span>
                  <span v-if="row.isHighRisk" class="bd-badge-danger"><i class="fa fa-exclamation-triangle"></i> 高风险</span>
                </div>
                <div class="bd-meta">
                  <span><i class="fa fa-user"></i> {{ row.username }} (ID: {{ row.userId }})</span>
                  <span><i class="fa fa-history"></i> 违规: {{ row.violationCount }}次</span>
                  <span><i class="fa fa-clock-o"></i> {{ new Date(row.createdAt).toLocaleString() }}</span>
                  <span v-if="row.relatedId"><i class="fa fa-link"></i> 关联ID: #{{ row.relatedId }}</span>
                </div>
                <p class="bd-note" style="color: #f87171;">
                  <strong>违规详情：</strong>{{ row.description }}
                </p>
                <div v-if="row.appealReason" class="bd-note appeal-box">
                  <strong><i class="fa fa-commenting-o"></i> 用户申诉理由：</strong>
                  <p>{{ row.appealReason }}</p>
                </div>
                <div v-if="row.adminAction" class="bd-note resolved-box">
                  <strong>处理结果：</strong>{{ getAdminActionText(row.adminAction) }}
                  <span v-if="row.adminNotes">({{ row.adminNotes }})</span>
                </div>
              </div>
              <div class="bd-card-actions" v-if="row.status !== 'RESOLVED'">
                <button type="button" class="bd-btn bd-btn-primary" @click="openHandleViolation(row)">处理</button>
              </div>
            </li>
          </ul>
        </section>

        <section class="bd-section">
          <div class="bd-section-head">
            <h2><i class="fa fa-user-plus"></i> 打手入驻审核</h2>
          </div>
          <p class="bd-sub">顾客在「加入我们」提交的资料，通过后将在打手大厅展示并开通打手工作台。</p>
          <div v-if="!joinPending.length" class="bd-empty subtle">暂无待审核入驻申请。</div>
          <ul v-else class="bd-order-list">
            <li v-for="row in joinPending" :key="'j-' + String(row.id)" class="bd-card">
              <div class="bd-card-main">
                <div class="bd-card-title">
                  <span class="bd-tag">入驻</span>
                  <span class="bd-game">{{ String(row.displayName || '—') }}</span>
                </div>
                <div class="bd-meta">
                  <span><i class="fa fa-user"></i> {{ String(row.applicantUsername || '—') }}</span>
                  <span><i class="fa fa-envelope"></i> {{ String(row.applicantEmail || '—') }}</span>
                  <span>时薪 ¥{{ row.pricePerHour ?? '—' }}</span>
                </div>
                <p class="bd-note">{{ String(row.intro || '') }}</p>
                <p v-if="row.skills" class="bd-note"><strong>擅长：</strong>{{ String(row.skills) }}</p>
              </div>
              <div class="bd-card-actions">
                <button
                  type="button"
                  class="bd-btn bd-btn-primary"
                  :disabled="actingId === 'j' + String(row.id)"
                  @click="approveJoinApp(String(row.id))"
                >
                  通过
                </button>
                <button type="button" class="bd-btn bd-btn-ghost" @click="openJoinReject(String(row.id))">拒绝</button>
              </div>
            </li>
          </ul>
        </section>

        <section class="bd-section">
          <div class="bd-section-head">
            <h2><i class="fa fa-user-times"></i> 解除打手权限</h2>
            <button type="button" class="bd-refresh" :disabled="loading" @click="loadAll">
              <i class="fa fa-refresh"></i>
            </button>
          </div>
          <p class="bd-sub">将打手账号降为普通顾客，并隐藏其在大厅的展示（历史订单仍保留）。</p>
          <div v-if="!playerAccounts.length" class="bd-empty subtle">当前无打手账号。</div>
          <ul v-else class="bd-order-list">
            <li v-for="acc in playerAccounts" :key="'a-' + acc.userId" class="bd-card bd-card-muted">
              <div class="bd-card-main">
                <div class="bd-meta">
                  <span><i class="fa fa-user"></i> {{ acc.username }}</span>
                  <span><i class="fa fa-id-badge"></i> {{ acc.playerName || '—' }}</span>
                  <span>档案 ID {{ acc.playerProfileId || '—' }}</span>
                </div>
              </div>
              <div class="bd-card-actions">
                <button
                  type="button"
                  class="bd-btn bd-btn-danger"
                  :disabled="actingId === 'r' + acc.userId"
                  @click="confirmRevoke(acc)"
                >
                  解除打手资格
                </button>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </main>

    <Footer />

    <div v-if="joinRejectForId" class="bd-modal-backdrop" @click.self="joinRejectForId = null">
      <div class="bd-modal">
        <h3>拒绝入驻原因</h3>
        <textarea v-model="joinRejectReason" rows="3" placeholder="将通知申请人" class="bd-textarea"></textarea>
        <div class="bd-modal-actions">
          <button type="button" class="bd-btn bd-btn-ghost" @click="joinRejectForId = null">取消</button>
          <button type="button" class="bd-btn bd-btn-danger" @click="confirmJoinReject">确认拒绝</button>
        </div>
      </div>
    </div>

    <div v-if="rejectForId" class="bd-modal-backdrop" @click.self="rejectForId = null">
      <div class="bd-modal">
        <h3>驳回原因</h3>
        <textarea v-model="rejectReason" rows="3" placeholder="将通知顾客与打手" class="bd-textarea"></textarea>
        <div class="bd-modal-actions">
          <button type="button" class="bd-btn bd-btn-ghost" @click="rejectForId = null">取消</button>
          <button type="button" class="bd-btn bd-btn-danger" @click="confirmReject">确认驳回</button>
        </div>
      </div>
    </div>

    <div v-if="violationHandleFor" class="bd-modal-backdrop" @click.self="violationHandleFor = null">
      <div class="bd-modal bd-modal-wide">
        <h3>处理违规记录 #{{ violationHandleFor.id }}</h3>
        <div class="bd-meta mb-2">用户: {{ violationHandleFor.username }} | 当前违规次数: {{ violationHandleFor.violationCount }}</div>
        
        <label class="bd-label">处理动作</label>
        <select v-model="violationAction" class="bd-select">
          <option value="WARNING">发出警告 (仅通知)</option>
          <option value="RESTRICT">限制账号功能 (禁止接单/下单)</option>
          <option value="BAN">封禁账号 (禁止登录)</option>
          <option value="DISMISS">撤销违规 (申诉通过/误判)</option>
        </select>
        
        <label class="bd-label">处理意见 (必填，将通知用户)</label>
        <textarea v-model="violationNotes" rows="3" placeholder="填写具体的处理依据和意见..." class="bd-textarea"></textarea>
        
        <div class="bd-modal-actions">
          <button type="button" class="bd-btn bd-btn-ghost" @click="violationHandleFor = null">取消</button>
          <button type="button" class="bd-btn bd-btn-primary" @click="confirmHandleViolation">确认处理</button>
        </div>
      </div>
    </div>

    <div v-if="reassignFor" class="bd-modal-backdrop" @click.self="reassignFor = null">
      <div class="bd-modal bd-modal-wide">
        <h3>转派订单 #{{ reassignFor.id }}</h3>
        <label class="bd-label">目标打手</label>
        <select v-model="reassignPlayerId" class="bd-select">
          <option disabled value="">请选择</option>
          <option v-for="p in players" :key="p.id" :value="String(p.id)">{{ p.name }}（ID {{ p.id }}）</option>
        </select>
        <label class="bd-label">备注（必填，通知顾客）</label>
        <textarea v-model="reassignRemark" rows="4" placeholder="例如：原打手临时无法服务，已为您更换同段位认证打手。" class="bd-textarea"></textarea>
        <div class="bd-modal-actions">
          <button type="button" class="bd-btn bd-btn-ghost" @click="reassignFor = null">取消</button>
          <button type="button" class="bd-btn bd-btn-primary" @click="confirmReassign">确认转派</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '../layouts/Header.vue'
import Footer from '../layouts/Footer.vue'
import {
  bossDeskApi,
  type BossDeskOrder,
  type BossDeskStats,
  type BossJoinApplication,
  type BossPlayerAccountRow,
  type BossPlayerOption
} from '../api/bossDeskApi'
import { violationApi, type ViolationRecord } from '../api/violationApi'
import { computed } from 'vue'

const stats = ref<BossDeskStats | null>(null)
const completionPending = ref<BossDeskOrder[]>([])
const manageable = ref<BossDeskOrder[]>([])
const players = ref<BossPlayerOption[]>([])
const joinPending = ref<BossJoinApplication[]>([])
const playerAccounts = ref<BossPlayerAccountRow[]>([])
const loading = ref(true)
const actingId = ref<string | null>(null)
const rejectForId = ref<string | null>(null)
const rejectReason = ref('')
const joinRejectForId = ref<string | null>(null)
const joinRejectReason = ref('')
const reassignFor = ref<BossDeskOrder | null>(null)
const reassignPlayerId = ref('')
const reassignRemark = ref('')

const violationTab = ref<'pending' | 'appealed' | 'all'>('pending')
const pendingViolations = ref<ViolationRecord[]>([])
const appealedViolations = ref<ViolationRecord[]>([])
const allViolations = ref<ViolationRecord[]>([])
const violationHandleFor = ref<ViolationRecord | null>(null)
const violationAction = ref('WARNING')
const violationNotes = ref('')

const currentViolations = computed(() => {
  if (violationTab.value === 'pending') return pendingViolations.value
  if (violationTab.value === 'appealed') return appealedViolations.value
  return allViolations.value
})

function getViolationStatusText(status: string) {
  switch (status) {
    case 'PENDING': return '待处理'
    case 'APPEALED': return '申诉中'
    case 'RESOLVED': return '已处理'
    default: return status
  }
}

function getViolationTypeText(type: string) {
  switch (type) {
    case 'FAKE_ORDER': return '虚假下单'
    case 'MALICIOUS_REFUND': return '恶意退款'
    case 'ILLEGAL_ACCEPT': return '违规接单'
    case 'IMPROPER_SERVICE': return '不规范服务'
    default: return type
  }
}

function getAdminActionText(action: string) {
  switch (action) {
    case 'WARNING': return '警告'
    case 'RESTRICT': return '限制功能'
    case 'BAN': return '封禁账号'
    case 'DISMISS': return '撤销违规'
    default: return action
  }
}

async function loadViolations() {
  try {
    const [pending, appealed] = await Promise.all([
      violationApi.getPendingViolations(),
      violationApi.getAppealedViolations()
    ])
    pendingViolations.value = pending
    appealedViolations.value = appealed
    if (violationTab.value === 'all') {
      await loadAllViolations()
    }
  } catch (e) {
    console.error('加载违规记录失败', e)
  }
}

async function loadAllViolations() {
  try {
    allViolations.value = await violationApi.getAllViolations()
  } catch (e) {
    console.error('加载全部违规记录失败', e)
  }
}

function openHandleViolation(row: ViolationRecord) {
  violationHandleFor.value = row
  violationAction.value = row.status === 'APPEALED' ? 'DISMISS' : 'WARNING'
  violationNotes.value = ''
}

async function confirmHandleViolation() {
  if (!violationHandleFor.value) return
  if (!violationNotes.value.trim()) {
    alert('请填写处理意见')
    return
  }
  try {
    await violationApi.handleViolation(
      violationHandleFor.value.id,
      violationAction.value,
      violationNotes.value.trim()
    )
    violationHandleFor.value = null
    await loadViolations()
    // 可能会影响用户信息，可选重载整体
  } catch (e) {
    console.error(e)
    alert(e instanceof Error ? e.message : '处理失败')
  }
}

function deskPlayerName(row: BossDeskOrder, emptyLabel = '—'): string {
  const p = row.player as { name?: string } | undefined
  const n = p?.name
  return n ? String(n) : emptyLabel
}

async function loadAll() {
  loading.value = true
  try {
    const [st, cp, mg, pl, jp, pa] = await Promise.all([
      bossDeskApi.getStats(),
      bossDeskApi.listCompletionPending(),
      bossDeskApi.listManageable(),
      bossDeskApi.listPlayers(),
      bossDeskApi.listJoinPending(),
      bossDeskApi.listPlayerAccounts()
    ])
    await loadViolations()
    stats.value = st
    completionPending.value = cp
    manageable.value = mg
    players.value = pl
    joinPending.value = jp
    playerAccounts.value = pa
  } catch (e) {
    console.error(e)
    alert(e instanceof Error ? e.message : '加载失败')
  } finally {
    loading.value = false
  }
}

async function approve(orderId: string) {
  actingId.value = orderId
  try {
    await bossDeskApi.approveCompletion(orderId)
    await loadAll()
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

async function confirmReject() {
  const id = rejectForId.value
  if (!id) return
  actingId.value = id
  try {
    await bossDeskApi.rejectCompletion(id, rejectReason.value.trim() || undefined)
    rejectForId.value = null
    await loadAll()
  } catch (e) {
    console.error(e)
    alert(e instanceof Error ? e.message : '操作失败')
  } finally {
    actingId.value = null
  }
}

function openReassign(row: BossDeskOrder) {
  reassignFor.value = row
  reassignPlayerId.value = ''
  reassignRemark.value = ''
}

async function confirmReassign() {
  const row = reassignFor.value
  if (!row) return
  const id = String(row.id)
  const pid = Number(reassignPlayerId.value)
  const remark = reassignRemark.value.trim()
  if (!pid || Number.isNaN(pid)) {
    alert('请选择目标打手')
    return
  }
  if (!remark) {
    alert('请填写转派备注')
    return
  }
  actingId.value = id
  try {
    await bossDeskApi.reassignOrder(id, pid, remark)
    reassignFor.value = null
    await loadAll()
  } catch (e) {
    console.error(e)
    alert(e instanceof Error ? e.message : '操作失败')
  } finally {
    actingId.value = null
  }
}

async function approveJoinApp(applicationId: string) {
  actingId.value = 'j' + applicationId
  try {
    await bossDeskApi.approveJoin(applicationId)
    await loadAll()
  } catch (e) {
    console.error(e)
    alert(e instanceof Error ? e.message : '操作失败')
  } finally {
    actingId.value = null
  }
}

function openJoinReject(applicationId: string) {
  joinRejectForId.value = applicationId
  joinRejectReason.value = ''
}

async function confirmJoinReject() {
  const id = joinRejectForId.value
  if (!id) return
  actingId.value = 'j' + id
  try {
    await bossDeskApi.rejectJoin(id, joinRejectReason.value.trim() || undefined)
    joinRejectForId.value = null
    await loadAll()
  } catch (e) {
    console.error(e)
    alert(e instanceof Error ? e.message : '操作失败')
  } finally {
    actingId.value = null
  }
}

async function confirmRevoke(acc: BossPlayerAccountRow) {
  if (!confirm(`确定解除「${acc.username}」的打手资格？其将变为普通顾客。`)) return
  actingId.value = 'r' + acc.userId
  try {
    await bossDeskApi.revokePlayer(acc.userId)
    await loadAll()
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
.boss-desk-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #111827 45%);
  color: #e5e7eb;
}

.bd-main {
  padding: 2rem 0 4rem;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1rem;
}

.bd-hero {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.bd-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #fbbf24;
  margin-bottom: 0.5rem;
}

.bd-hero h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.bd-hero p {
  margin: 0;
  color: #9ca3af;
  max-width: 36rem;
  line-height: 1.5;
}

.bd-hero-stats {
  display: flex;
  gap: 1rem;
}

.bd-stat {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.75rem;
  padding: 0.75rem 1.25rem;
  min-width: 7rem;
}

.bd-stat-label {
  display: block;
  font-size: 0.7rem;
  color: #9ca3af;
}

.bd-stat-value {
  font-size: 1.35rem;
  font-weight: 700;
}

.bd-warn {
  color: #fbbf24;
}

.bd-ok {
  color: #34d399;
}

.bd-hint {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 1.5rem;
  line-height: 1.5;
}

.bd-section {
  margin-bottom: 2.5rem;
}

.bd-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.bd-section-head h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}

.bd-sub {
  font-size: 0.85rem;
  color: #9ca3af;
  margin: 0 0 1rem;
  line-height: 1.5;
}

.bd-refresh {
  background: rgba(51, 65, 85, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.5);
  color: #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
  font-size: 0.8rem;
}

.bd-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bd-loading,
.bd-empty {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.bd-empty.subtle {
  padding: 1rem;
}

.bd-order-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bd-card {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: flex-start;
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid rgba(71, 85, 105, 0.45);
  border-radius: 0.75rem;
  padding: 1rem 1.15rem;
}

.bd-card-muted {
  opacity: 0.95;
}

.bd-card-main {
  flex: 1;
  min-width: 200px;
}

.bd-card-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.bd-tag {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  padding: 0.15rem 0.45rem;
  border-radius: 0.25rem;
}

.bd-status-pill {
  font-size: 0.7rem;
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  padding: 0.15rem 0.5rem;
  border-radius: 0.25rem;
}

.bd-game {
  font-weight: 600;
}

.bd-type {
  font-size: 0.85rem;
  color: #9ca3af;
}

.bd-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.bd-note {
  margin: 0.65rem 0 0;
  font-size: 0.8rem;
  color: #cbd5e1;
  line-height: 1.45;
}

.bd-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.bd-btn {
  border-radius: 0.5rem;
  padding: 0.45rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.bd-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bd-btn-primary {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: #fff;
}

.bd-btn-ghost {
  background: transparent;
  border-color: rgba(148, 163, 184, 0.45);
  color: #e2e8f0;
}

.bd-btn-danger {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(248, 113, 113, 0.5);
  color: #fecaca;
}

.bd-btn-warn {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(251, 191, 36, 0.4);
  color: #fcd34d;
}

.bd-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 80;
  padding: 1rem;
}

.bd-modal {
  background: #1e293b;
  border: 1px solid rgba(71, 85, 105, 0.6);
  border-radius: 0.75rem;
  padding: 1.25rem;
  width: 100%;
  max-width: 420px;
}

.bd-modal-wide {
  max-width: 480px;
}

.bd-modal h3 {
  margin: 0 0 1rem;
  font-size: 1.05rem;
}

.bd-textarea,
.bd-select {
  width: 100%;
  margin-bottom: 0.75rem;
  background: #0f172a;
  border: 1px solid rgba(71, 85, 105, 0.7);
  border-radius: 0.5rem;
  color: #e2e8f0;
  padding: 0.5rem 0.65rem;
  font-size: 0.85rem;
}

.bd-textarea {
  resize: vertical;
  min-height: 5rem;
}

.bd-label {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.35rem;
}

.bd-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.bd-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.5);
  padding-bottom: 0.5rem;
}

.bd-tab {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 0.25rem;
  font-weight: 600;
  transition: all 0.2s;
}

.bd-tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
}

.bd-tab.active {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.bd-badge-danger {
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 0.15rem 0.45rem;
  border-radius: 0.25rem;
}

.v-pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.v-appealed { background: rgba(139, 92, 246, 0.2); color: #a78bfa; }
.v-resolved { background: rgba(16, 185, 129, 0.2); color: #34d399; }

.v-type {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.appeal-box {
  background: rgba(139, 92, 246, 0.1);
  border-left: 3px solid #8b5cf6;
  padding: 0.5rem 0.75rem;
  border-radius: 0 0.25rem 0.25rem 0;
  margin-top: 0.5rem;
}

.appeal-box p {
  margin: 0.25rem 0 0;
  color: #e2e8f0;
}

.resolved-box {
  background: rgba(16, 185, 129, 0.1);
  border-left: 3px solid #10b981;
  padding: 0.5rem 0.75rem;
  border-radius: 0 0.25rem 0.25rem 0;
  margin-top: 0.5rem;
}

.mb-2 { margin-bottom: 0.5rem; }
</style>
