<template>
  <!--
  【BOSS 控制台】管理员后台 - 最高权限操作中心
  功能模块：
    1. 订单审核 - 处理打手提交的「完成申请」（同意/驳回）
    2. 转派订单 - 将订单从一个打手转给另一个打手
    3. 退款处理 - 审核用户退款申请（批准/拒绝）
    4. 违规管理 - 查看违规记录、处理申诉（警告/限制/封禁/撤销）
    5. 入驻审核 - 审核顾客提交的打手入驻申请
    6. 解除打手 - 移除打手权限
  角色：仅 userLevel >= 2（Boss管理员）
  -->
  <div class="boss-desk-page">
    <Header />

    <main class="bd-main">
      <div class="container">
        <header class="bd-hero">
          <div class="welcome">
            <div class="welcome-text">
              <span class="welcome-greeting"><i class="fa fa-shield"></i> BOSS 控制台 · 最高权限</span>
              <h1 class="welcome-title">订单审核与调度</h1>
              <p class="welcome-date">处理打手提交的「完成申请」，或转派订单并通知顾客。</p>
            </div>
            <div class="welcome-stats">
              <div class="stat">
                <span class="stat-value">{{ stats?.pendingCompletionCount ?? '—' }}</span>
                <span class="stat-label">待审核完成</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat">
                <span class="stat-value">{{ stats?.manageableOrderCount ?? '—' }}</span>
                <span class="stat-label">可调度订单</span>
              </div>
              <div v-if="stats?.pendingJoinCount != null" class="stat-divider"></div>
              <div v-if="stats?.pendingJoinCount != null" class="stat">
                <span class="stat-value">{{ stats.pendingJoinCount }}</span>
                <span class="stat-label">待审入驻</span>
              </div>
            </div>
          </div>
        </header>

        <div v-if="stats?.displayHint" class="bd-hint">
          <i class="far fa-lightbulb"></i> {{ stats.displayHint }}
        </div>

        <section class="bd-section">
          <div class="section-header">
            <h2 class="section-title"><i class="far fa-square-check"></i> 待审核完成申请</h2>
            <span class="section-line"></span>
            <button type="button" class="bd-refresh" :disabled="loading" @click="loadAll">
              <i class="fa" :class="loading ? 'fa-spinner fa-spin' : 'fa-refresh'"></i>
              刷新
            </button>
          </div>
          <div v-if="loading && !completionPending.length" class="bd-loading">
            <i class="fa fa-spinner fa-spin"></i>
            <span>加载中…</span>
          </div>
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
                  <i class="fa fa-check"></i> 同意完成
                </button>
                <button
                  type="button"
                  class="bd-btn bd-btn-ghost"
                  :disabled="actingId === String(row.id)"
                  @click="openReject(String(row.id))"
                >
                  <i class="fa fa-times"></i> 驳回
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section class="bd-section">
          <div class="section-header">
            <h2 class="section-title"><i class="fa fa-random"></i> 转派订单</h2>
            <span class="section-line"></span>
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

        <section class="bd-section">
          <div class="section-header">
            <h2 class="section-title"><i class="fa fa-credit-card"></i> 退款处理</h2>
            <span class="section-line"></span>
          </div>
          <p class="bd-sub">处理用户提交的退款申请，可批准或拒绝，并通知用户处理结果。</p>
          <div v-if="!refundOrders.length" class="bd-empty subtle">暂无待处理的退款申请。</div>
          <ul v-else class="bd-order-list">
            <li v-for="order in refundOrders" :key="'r-' + String(order.id)" class="bd-card">
              <div class="bd-card-main">
                <div class="bd-card-title">
                  <span class="bd-status-pill">{{ String(order.statusText || order.status) }}</span>
                  <span class="bd-game">{{ String(order.game || '—') }}</span>
                  <span class="bd-type">{{ String(order.serviceType || '') }}</span>
                </div>
                <div class="bd-meta">
                  <span><i class="fa fa-user"></i> {{ String(order.customerUsername || '—') }}</span>
                  <span><i class="fa fa-user-secret"></i> 打手：{{ deskPlayerName(order, '未指定') }}</span>
                  <span>#{{ String(order.id) }}</span>
                </div>
                <p class="bd-note"><strong>退款原因：</strong>{{ order.refundReason || '未提供' }}</p>
              </div>
              <div class="bd-card-actions">
                <button type="button" class="bd-btn bd-btn-success" :disabled="actingId === String(order.id)" @click="processRefund(String(order.id), true)">
                  批准
                </button>
                <button type="button" class="bd-btn bd-btn-danger" :disabled="actingId === String(order.id)" @click="processRefund(String(order.id), false)">
                  拒绝
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section class="bd-section" id="violation-management">
          <div class="section-header">
            <h2 class="section-title"><i class="fa fa-gavel"></i> 违规预警管理</h2>
            <span class="section-line"></span>
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
                  <span><i class="far fa-clock"></i> {{ new Date(row.createdAt).toLocaleString() }}</span>
                  <span v-if="row.relatedId"><i class="fa fa-link"></i> 关联ID: #{{ row.relatedId }}</span>
                </div>
                <p class="bd-note" style="color: #f87171;">
                  <strong>违规详情：</strong>{{ row.description }}
                </p>
                <div v-if="row.appealReason" class="bd-note appeal-box">
                  <strong><i class="far fa-comment-dots"></i> 用户申诉理由：</strong>
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
          <div class="section-header">
            <h2 class="section-title"><i class="fa fa-user-plus"></i> 打手入驻审核</h2>
            <span class="section-line"></span>
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
          <div class="section-header">
            <h2 class="section-title"><i class="fa fa-user-times"></i> 解除打手权限</h2>
            <span class="section-line"></span>
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
        <div class="bd-modal-header">
          <h3>拒绝入驻原因</h3>
          <button type="button" class="bd-modal-close" @click="joinRejectForId = null">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <textarea v-model="joinRejectReason" rows="3" placeholder="将通知申请人" class="bd-textarea"></textarea>
        <div class="bd-modal-actions">
          <button type="button" class="bd-btn bd-btn-ghost" @click="joinRejectForId = null">取消</button>
          <button type="button" class="bd-btn bd-btn-danger" @click="confirmJoinReject">确认拒绝</button>
        </div>
      </div>
    </div>

    <div v-if="rejectForId" class="bd-modal-backdrop" @click.self="rejectForId = null">
      <div class="bd-modal">
        <div class="bd-modal-header">
          <h3>驳回原因</h3>
          <button type="button" class="bd-modal-close" @click="rejectForId = null">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <textarea v-model="rejectReason" rows="3" placeholder="将通知顾客与打手" class="bd-textarea"></textarea>
        <div class="bd-modal-actions">
          <button type="button" class="bd-btn bd-btn-ghost" @click="rejectForId = null">取消</button>
          <button type="button" class="bd-btn bd-btn-danger" @click="confirmReject">确认驳回</button>
        </div>
      </div>
    </div>

    <div v-if="violationHandleFor" class="bd-modal-backdrop" @click.self="violationHandleFor = null">
      <div class="bd-modal bd-modal-wide">
        <div class="bd-modal-header">
          <h3>处理违规记录 #{{ violationHandleFor.id }}</h3>
          <button type="button" class="bd-modal-close" @click="violationHandleFor = null">
            <i class="fa fa-times"></i>
          </button>
        </div>
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
        <div class="bd-modal-header">
          <h3>转派订单 #{{ reassignFor.id }}</h3>
          <button type="button" class="bd-modal-close" @click="reassignFor = null">
            <i class="fa fa-times"></i>
          </button>
        </div>
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
/*
 * BOSS 控制台 - 核心业务逻辑
 * 管理功能：
 *   1. 订单审核 - approve() / reject() 处理打手完成申请
 *   2. 转派订单 - reassign() 将订单转给其他打手
 *   3. 退款处理 - processRefund() 批准/拒绝退款
 *   4. 违规管理 - openHandleViolation() 处理违规记录和申诉
 *   5. 入驻审核 - approveJoinApp() 审核打手入驻
 *   6. 解除打手 - revokePlayer() 移除打手权限
 */
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
import { useEscKey } from '../composables/useEscKey'

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
const refundOrders = ref<BossDeskOrder[]>([])

const violationTab = ref<'pending' | 'appealed' | 'all'>('pending')
const pendingViolations = ref<ViolationRecord[]>([])
const appealedViolations = ref<ViolationRecord[]>([])
const allViolations = ref<ViolationRecord[]>([])
const violationHandleFor = ref<ViolationRecord | null>(null)
const violationAction = ref('WARNING')
const violationNotes = ref('')

const showRejectModal = computed({
  get: () => rejectForId.value !== null,
  set: (v: boolean) => { if (!v) rejectForId.value = null }
})
const showJoinRejectModal = computed({
  get: () => joinRejectForId.value !== null,
  set: (v: boolean) => { if (!v) joinRejectForId.value = null }
})
const showViolationHandleModal = computed({
  get: () => violationHandleFor.value !== null,
  set: (v: boolean) => { if (!v) violationHandleFor.value = null }
})
const showReassignModal = computed({
  get: () => reassignFor.value !== null,
  set: (v: boolean) => { if (!v) reassignFor.value = null }
})

useEscKey(showRejectModal, () => { rejectForId.value = null })
useEscKey(showJoinRejectModal, () => { joinRejectForId.value = null })
useEscKey(showViolationHandleModal, () => { violationHandleFor.value = null })
useEscKey(showReassignModal, () => { reassignFor.value = null })

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
  const results = await Promise.allSettled([
    violationApi.getPendingViolations(),
    violationApi.getAppealedViolations()
  ])
  const [pending, appealed] = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    console.error('违规数据加载失败:', ['pending','appealed'][i], r.reason)
    return []
  })
  pendingViolations.value = pending as ViolationRecord[]
  appealedViolations.value = appealed as ViolationRecord[]
  if (violationTab.value === 'all') {
    await loadAllViolations()
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
  const results = await Promise.allSettled([
    bossDeskApi.getStats(),
    bossDeskApi.listCompletionPending(),
    bossDeskApi.listManageable(),
    bossDeskApi.listPlayers(),
    bossDeskApi.listJoinPending(),
    bossDeskApi.listPlayerAccounts(),
    bossDeskApi.listRefundPending()
  ])

  const [st, cp, mg, pl, jp, pa, ro] = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    console.error('BOSS 模块加载失败:', ['stats','completionPending','manageable','players','joinPending','playerAccounts','refundOrders'][i], r.reason)
    return null
  })

  if (st) stats.value = st as BossDeskStats
  if (cp) completionPending.value = cp as BossDeskOrder[]
  if (mg) manageable.value = mg as BossDeskOrder[]
  if (pl) players.value = pl as BossPlayerOption[]
  if (jp) joinPending.value = jp as BossJoinApplication[]
  if (pa) playerAccounts.value = pa as BossPlayerAccountRow[]
  if (ro) refundOrders.value = ro as BossDeskOrder[]

  await loadViolations()
  loading.value = false
}

// 【管理功能-1】同意打手的完成申请 → 订单状态变为已完成 → 打手获得佣金
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

// 【管理功能-1】驳回完成申请 → 订单回退到进行中 → 打手可重新申请
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

// 【管理功能-2】转派订单：选择目标打手 → 填写备注 → 通知顾客和新打手
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

// 【管理功能-5】通过打手入驻申请 → 用户获得打手身份 → 在大厅展示
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

async function processRefund(orderId: string, approve: boolean) {
  actingId.value = orderId
  try {
    // 调用后端API处理退款
    await bossDeskApi.processRefund(orderId, approve)
    
    // 刷新数据
    await loadAll()
    
    // 显示成功消息
    alert(approve ? '退款申请已批准' : '退款申请已拒绝')
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
  background-color: var(--m-bg);
  color: var(--m-text);
  font-family: var(--m-font-body);
}

.bd-main {
  padding: 2.5rem 0 4rem;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1rem;
}

.bd-hero {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  padding: 2rem;
  border: 1px solid var(--m-border);
  position: relative;
  overflow: hidden;
}

.bd-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--m-accent);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--m-transition);
}

.bd-hero:hover::before {
  transform: scaleY(1);
}

.welcome {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.welcome-text {
  flex: 1;
  min-width: 300px;
}

.welcome-greeting {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--m-accent);
  margin-bottom: 0.75rem;
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  color: var(--m-text);
}

.welcome-date {
  margin: 0;
  color: var(--m-text-secondary);
  max-width: 36rem;
  line-height: 1.5;
}

.welcome-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background-color: var(--m-bg);
  border-radius: var(--m-radius-sm);
  padding: 1rem 1.5rem;
  border: 1px solid var(--m-border);
}

.stat {
  text-align: center;
  min-width: 8rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--m-text);
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--m-text-secondary);
  margin-top: 0.25rem;
}

.stat-divider {
  width: 1px;
  height: 3rem;
  background-color: var(--m-border);
}

.bd-hint {
  font-size: 0.85rem;
  color: var(--m-text-secondary);
  margin: 0 0 2rem;
  line-height: 1.5;
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius-sm);
  padding: 1rem;
  border: 1px solid var(--m-border);
}

.bd-section {
  margin-bottom: 2.5rem;
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  padding: 1.5rem;
  border: 1px solid var(--m-border);
  position: relative;
  overflow: hidden;
}

.bd-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--m-accent);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--m-transition);
}

.bd-section:hover::before {
  transform: scaleY(1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--m-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.5), transparent);
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
  color: var(--m-text);
}

.bd-sub {
  font-size: 0.85rem;
  color: var(--m-text-secondary);
  margin: 0 0 1rem;
  line-height: 1.5;
}

.bd-refresh {
  background-color: var(--m-bg);
  border: 1px solid var(--m-border);
  color: var(--m-text);
  border-radius: var(--m-radius-sm);
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all var(--m-transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bd-refresh:hover:not(:disabled) {
  border-color: var(--m-accent);
  color: var(--m-accent);
}

.bd-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bd-loading,
.bd-empty {
  text-align: center;
  padding: 2rem;
  color: var(--m-text-secondary);
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
  background-color: var(--m-bg);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  padding: 1rem 1.15rem;
  transition: all var(--m-transition);
  position: relative;
  overflow: hidden;
}

.bd-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--m-accent);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--m-transition);
}

.bd-card:hover::before {
  transform: scaleY(1);
}

.bd-card:hover {
  border-color: var(--m-accent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  background-color: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  padding: 0.15rem 0.45rem;
  border-radius: 0.25rem;
}

.bd-status-pill {
  font-size: 0.7rem;
  background-color: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  padding: 0.15rem 0.5rem;
  border-radius: 0.25rem;
}

.bd-game {
  font-weight: 600;
  color: var(--m-text);
}

.bd-type {
  font-size: 0.85rem;
  color: var(--m-text-secondary);
}

.bd-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  font-size: 0.8rem;
  color: var(--m-text-secondary);
}

.bd-note {
  margin: 0.65rem 0 0;
  font-size: 0.8rem;
  color: var(--m-text);
  line-height: 1.45;
}

.bd-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.bd-btn {
  border-radius: var(--m-radius-sm);
  padding: 0.45rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--m-border);
  transition: all var(--m-transition);
  position: relative;
  overflow: hidden;
}

.bd-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--m-accent);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--m-transition);
}

.bd-btn:hover::before {
  transform: scaleY(1);
}

.bd-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bd-btn-primary {
  background-color: var(--m-accent);
  color: white;
  border-color: var(--m-accent);
}

.bd-btn-primary:hover:not(:disabled) {
  background-color: var(--m-accent-hover);
  border-color: var(--m-accent-hover);
}

.bd-btn-ghost {
  background-color: var(--m-bg);
  border-color: var(--m-border);
  color: var(--m-text);
}

.bd-btn-ghost:hover:not(:disabled) {
  border-color: var(--m-accent);
  color: var(--m-accent);
}

.bd-btn-danger {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(248, 113, 113, 0.5);
  color: #fecaca;
}

.bd-btn-danger:hover:not(:disabled) {
  background-color: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fecaca;
}

.bd-btn-warn {
  background-color: rgba(245, 158, 11, 0.15);
  border-color: rgba(251, 191, 36, 0.4);
  color: #fcd34d;
}

.bd-btn-warn:hover:not(:disabled) {
  background-color: rgba(245, 158, 11, 0.25);
  border-color: #f59e0b;
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
  background-color: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius);
  padding: 1.25rem;
  width: 100%;
  max-width: 420px;
  position: relative;
  overflow: hidden;
}

.bd-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--m-accent);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--m-transition);
}

.bd-modal:hover::before {
  transform: scaleY(1);
}

.bd-modal-wide {
  max-width: 480px;
}

.bd-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--m-border);
}

.bd-modal-header h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--m-text);
}

.bd-modal-close {
  background-color: var(--m-bg);
  border: 1px solid var(--m-border);
  color: var(--m-text-secondary);
  width: 2rem;
  height: 2rem;
  border-radius: var(--m-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--m-transition);
}

.bd-modal-close:hover {
  border-color: #ef4444;
  color: #fecaca;
  background-color: rgba(239, 68, 68, 0.1);
}

.bd-modal h3 {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  color: var(--m-text);
}

.bd-textarea,
.bd-select {
  width: 100%;
  margin-bottom: 0.75rem;
  background-color: var(--m-bg);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  color: var(--m-text);
  padding: 0.5rem 0.65rem;
  font-size: 0.85rem;
  transition: border-color var(--m-transition);
}

.bd-textarea:focus,
.bd-select:focus {
  outline: none;
  border-color: var(--m-accent);
  box-shadow: 0 0 0 3px var(--m-accent-light);
}

.bd-textarea {
  resize: vertical;
  min-height: 5rem;
}

.bd-label {
  display: block;
  font-size: 0.75rem;
  color: var(--m-text-secondary);
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
  border-bottom: 1px solid var(--m-border);
  padding-bottom: 0.5rem;
}

.bd-tab {
  background-color: var(--m-bg);
  border: 1px solid var(--m-border);
  color: var(--m-text-secondary);
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: var(--m-radius-sm);
  font-weight: 600;
  transition: all var(--m-transition);
  position: relative;
  overflow: hidden;
}

.bd-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--m-accent);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--m-transition);
}

.bd-tab:hover::before {
  transform: scaleY(1);
}

.bd-tab:hover {
  border-color: var(--m-accent);
  color: var(--m-accent);
}

.bd-tab.active {
  background-color: var(--m-accent-light);
  border-color: var(--m-accent);
  color: var(--m-accent);
}

.bd-tab.active::before {
  transform: scaleY(1);
}

.bd-badge-danger {
  font-size: 0.65rem;
  font-weight: 700;
  background-color: rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 0.15rem 0.45rem;
  border-radius: 0.25rem;
}

.v-pending { background-color: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.v-appealed { background-color: rgba(139, 92, 246, 0.2); color: #a78bfa; }
.v-resolved { background-color: rgba(16, 185, 129, 0.2); color: #34d399; }

.v-type {
  background-color: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.appeal-box {
  background-color: rgba(6, 182, 212, 0.1);
  border-left: 3px solid #06b6d4;
  padding: 0.5rem 0.75rem;
  border-radius: 0 0.25rem 0.25rem 0;
  margin-top: 0.5rem;
}

.appeal-box p {
  margin: 0.25rem 0 0;
  color: var(--m-text);
}

.resolved-box {
  background-color: rgba(16, 185, 129, 0.1);
  border-left: 3px solid #10b981;
  padding: 0.5rem 0.75rem;
  border-radius: 0 0.25rem 0.25rem 0;
  margin-top: 0.5rem;
}

.mb-2 { margin-bottom: 0.5rem; }

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .welcome-stats {
    width: 100%;
    justify-content: space-around;
  }
  
  .bd-card {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .bd-card-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .bd-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
  }
  
  .bd-tab {
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .bd-hero {
    padding: 1.5rem;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .welcome-stats {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .stat-divider {
    width: 100%;
    height: 1px;
  }
  
  .bd-section {
    padding: 1.25rem;
  }
  
  .bd-card-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .bd-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
