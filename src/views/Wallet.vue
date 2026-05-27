<template>
  <div class="w-page">
    <Header />

    <main class="w-main">
      <div class="container">
        <div v-if="error" class="w-error"><i class="fa fa-exclamation-triangle"></i> {{ error }}</div>

        <template v-if="store.loaded">
          <header class="w-hero">
            <div class="balance-card">
              <div class="balance-glow"></div>
              <div class="balance-header">
                <i class="fa fa-coins"></i>
                <span class="balance-label">{{ nickname }} 的栗币</span>
              </div>
              <div class="balance-amount" :class="{ 'bounce-in': animateBalance }">{{ store.balanceDisplay }}</div>
              <div class="balance-sub">累计充值 {{ store.totalRechargedDisplay }} 栗币</div>
              <div class="balance-actions">
                <button type="button" class="ba-btn ba-btn-primary" @click="showRecharge = true">
                  <i class="fa fa-plus-circle"></i> 充值
                </button>
                <button type="button" class="ba-btn ba-btn-ghost" @click="showRecharge = true">
                  <i class="fa fa-history"></i> 明细
                </button>
              </div>
            </div>

            <div class="stats-row">
              <div class="stat-card">
                <i class="fa fa-arrow-down stat-icon in"></i>
                <div class="stat-body">
                  <span class="stat-label">本月收入</span>
                  <span class="stat-value in">{{ (store.monthlyIncome / 100).toFixed(0) }}</span>
                </div>
              </div>
              <div class="stat-card">
                <i class="fa fa-arrow-up stat-icon out"></i>
                <div class="stat-body">
                  <span class="stat-label">本月消费</span>
                  <span class="stat-value out">{{ (store.monthlySpending / 100).toFixed(0) }}</span>
                </div>
              </div>
              <div class="stat-card">
                <i class="fa fa-right-left stat-icon net"></i>
                <div class="stat-body">
                  <span class="stat-label">交易笔数</span>
                  <span class="stat-value net">{{ store.transactions.length }}</span>
                </div>
              </div>
            </div>
          </header>

          <section class="w-section">
            <div class="section-header">
              <h2 class="section-title"><i class="fa fa-list"></i> 交易流水</h2>
              <span class="section-line"></span>
              <div class="tx-filter">
                <button v-for="f in filterOptions" :key="f.value" class="filter-btn" :class="{ active: txFilter === f.value }" @click="txFilter = f.value">{{ f.label }}</button>
              </div>
              <button type="button" class="w-refresh" :disabled="store.loading" @click="store.refresh()">
                <i class="fa" :class="store.loading ? 'fa-spinner fa-spin' : 'fa-refresh'"></i>
              </button>
            </div>
            <div v-if="!filteredTxs.length" class="w-empty">
              <i class="fa fa-inbox"></i>
              <p>暂无交易记录</p>
            </div>
            <div v-else class="w-tx-list">
              <div v-for="tx in filteredTxs" :key="tx.id" class="w-tx-item" :class="tx.amount > 0 ? 'tx-in' : 'tx-out'">
                <div class="tx-icon">
                  <i :class="txIcon(tx.type)"></i>
                </div>
                <div class="tx-info">
                  <div class="tx-top">
                    <span class="tx-type">{{ txLabel(tx.type) }}</span>
                    <span class="tx-date">{{ formatTime(tx.createdAt) }}</span>
                  </div>
                  <span class="tx-desc">{{ tx.description || txTypeDesc(tx.type) }}</span>
                  <span v-if="tx.orderId" class="tx-ref">订单 #{{ tx.orderId }}</span>
                </div>
                <div class="tx-side">
                  <span :class="tx.amount > 0 ? 'amount-in' : 'amount-out'">
                    {{ tx.amount > 0 ? '+' : '' }}{{ formatCoin(Math.abs(tx.amount)) }}
                  </span>
                  <span class="tx-balance">余额 {{ formatCoin(tx.balanceAfter) }}</span>
                </div>
              </div>
            </div>
          </section>
        </template>

        <div v-if="store.loading && !store.loaded" class="w-loading"><i class="fa fa-spinner fa-spin"></i> 加载中…</div>
      </div>
    </main>

    <Footer />

    <div v-if="showRecharge" class="w-modal-backdrop" @click.self="showRecharge = false">
      <div class="w-modal">
        <div class="w-modal-header">
          <h3><i class="fa fa-coins"></i> 充值栗币</h3>
          <button type="button" class="w-modal-close" @click="showRecharge = false"><i class="fa fa-times"></i></button>
        </div>
        <div class="w-modal-body">
          <p class="w-modal-desc">选择充值金额，<strong>1 元 = 100 栗币</strong></p>
          <div class="recharge-presets">
            <button v-for="preset in rechargePresets" :key="preset.val" type="button" class="preset-btn" :class="{ active: rechargeAmount === preset.val }" @click="rechargeAmount = preset.val">
              <span class="preset-val">¥{{ preset.val }}</span>
              <span class="preset-coins">+{{ preset.val * 100 }} 🪙</span>
            </button>
          </div>
          <div class="recharge-custom">
            <label class="w-label">自定义金额</label>
            <div class="recharge-input-wrap">
              <span class="recharge-currency">¥</span>
              <input v-model.number="rechargeAmount" type="number" min="1" step="1" class="w-input" placeholder="输入金额" />
              <span class="recharge-preview" v-if="rechargeAmount > 0">≈ {{ formatCoin(rechargeAmount * 100) }}</span>
            </div>
          </div>
        </div>
        <div class="w-modal-actions">
          <button type="button" class="w-btn w-btn-ghost" @click="showRecharge = false">取消</button>
          <button type="button" class="w-btn w-btn-primary" :disabled="!rechargeAmount || rechargeAmount <= 0 || recharging" @click="handleRecharge">
            <i class="fa" :class="recharging ? 'fa-spinner fa-spin' : 'fa-check'"></i>
            {{ recharging ? '充值中...' : '确认充值 ¥' + (rechargeAmount || 0) }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="rechargeSuccess" class="success-overlay" @click="rechargeSuccess = false">
      <div class="success-card">
        <div class="success-icon"><i class="fa fa-check-circle"></i></div>
        <div class="success-text">充值成功！</div>
        <div class="success-amount">+{{ formatCoin(rechargeSuccessAmount) }}</div>
        <button class="success-btn" @click="rechargeSuccess = false">知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Header from '../layouts/Header.vue'
import Footer from '../layouts/Footer.vue'
import { useWalletStore } from '../stores/wallet'
import { useUserStore } from '../stores/user'
import { useEscKey } from '../composables/useEscKey'

const store = useWalletStore()
const userStore = useUserStore()
const error = ref('')
const showRecharge = ref(false)
const rechargeAmount = ref(10)
const recharging = ref(false)
const rechargeSuccess = ref(false)
const rechargeSuccessAmount = ref(0)
const animateBalance = ref(false)
const txFilter = ref<'all' | 'in' | 'out'>('all')

useEscKey(showRecharge, () => { showRecharge.value = false })

const nickname = computed(() => userStore.displayName)

const rechargePresets = [
  { val: 10 }, { val: 30 }, { val: 50 },
  { val: 100 }, { val: 200 }, { val: 500 }
]

const filterOptions = [
  { value: 'all' as const, label: '全部' },
  { value: 'in' as const, label: '收入' },
  { value: 'out' as const, label: '支出' }
]

const filteredTxs = computed(() => {
  if (txFilter.value === 'in') return store.transactions.filter(t => t.amount > 0)
  if (txFilter.value === 'out') return store.transactions.filter(t => t.amount < 0)
  return store.transactions
})

function formatCoin(val: number): string {
  return (val / 100).toLocaleString('zh-CN', { minimumFractionDigits: 0 }) + ' 🪙'
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const isThisYear = d.getFullYear() === now.getFullYear()
  if (isToday) return '今天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (isThisYear) return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function txIcon(type: string): string {
  const map: Record<string, string> = {
    RECHARGE: 'fa-plus-circle',
    ORDER_PAY: 'fa-shopping-cart',
    ORDER_REFUND: 'fa-undo',
    ADMIN_ADJUST: 'fa-cog',
    PLAYER_PAYOUT: 'fa-money-check'
  }
  return map[type] || 'fa-circle'
}

function txLabel(type: string): string {
  const map: Record<string, string> = {
    RECHARGE: '充值', ORDER_PAY: '订单支付', ORDER_REFUND: '退款',
    ADMIN_ADJUST: '调整', PLAYER_PAYOUT: '打手结算'
  }
  return map[type] || type
}

function txTypeDesc(type: string): string {
  const map: Record<string, string> = {
    RECHARGE: '栗币充值到账', ORDER_PAY: '使用栗币支付订单',
    ORDER_REFUND: '订单退款退回', ADMIN_ADJUST: '管理员调整余额',
    PLAYER_PAYOUT: '打手服务结算'
  }
  return map[type] || ''
}

async function handleRecharge() {
  if (!rechargeAmount.value || rechargeAmount.value <= 0) return
  recharging.value = true
  error.value = ''
  try {
    const amount = rechargeAmount.value
    await store.recharge(amount, '用户充值')
    showRecharge.value = false
    rechargeSuccessAmount.value = Math.round(amount * 100)
    rechargeSuccess.value = true
    animateBalance.value = true
    rechargeAmount.value = 10
    setTimeout(() => { animateBalance.value = false }, 600)
    setTimeout(() => { rechargeSuccess.value = false }, 3000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '充值失败'
  } finally {
    recharging.value = false
  }
}

onMounted(() => {
  store.ensureLoaded().catch(() => { error.value = '加载钱包失败' })
})
</script>

<style scoped>
.w-page {
  min-height: 100vh;
  background-color: var(--m-bg);
  color: var(--m-text);
  font-family: var(--m-font-body);
}

.w-main { padding: 2.5rem 0 4rem; }

.container { max-width: 720px; margin: 0 auto; padding: 0 1rem; }

.w-error {
  padding: 0.75rem 1rem; margin-bottom: 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: var(--m-radius-sm);
  color: #fca5a5; font-size: 0.85rem;
  display: flex; align-items: center; gap: 0.5rem;
}

.w-loading, .w-empty {
  text-align: center; padding: 3rem 1rem; color: var(--m-text-secondary);
}

.w-empty i { font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.3; }
.w-empty p { margin: 0; font-size: 0.9rem; }

.w-hero { margin-bottom: 1.5rem; }

.balance-card {
  background: linear-gradient(135deg, #0f1f3d 0%, #1e40af 50%, #0891b2 100%);
  border-radius: 1rem; padding: 2rem 2rem 1.5rem;
  color: white; position: relative; overflow: hidden;
  margin-bottom: 1rem;
}

.balance-glow {
  position: absolute; top: -40%; right: -20%;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, transparent 60%);
  pointer-events: none;
}

.balance-header {
  display: flex; align-items: center; gap: 0.5rem;
  margin-bottom: 0.75rem; position: relative;
}

.balance-header i { font-size: 1.25rem; color: #fbbf24; }
.balance-label { font-size: 0.9rem; opacity: 0.85; }

.balance-amount {
  font-size: 3rem; font-weight: 700;
  font-family: var(--m-font-display);
  margin-bottom: 0.4rem; position: relative;
  text-shadow: 0 2px 12px rgba(0,0,0,0.25);
  letter-spacing: 0.02em;
}

.balance-amount.bounce-in { animation: bounceIn 0.5s ease; }

@keyframes bounceIn {
  0% { transform: scale(1); }
  40% { transform: scale(1.08); }
  70% { transform: scale(0.97); }
  100% { transform: scale(1); }
}

.balance-sub { font-size: 0.8rem; opacity: 0.6; margin-bottom: 1.25rem; position: relative; }

.balance-actions {
  display: flex; gap: 0.75rem; position: relative;
}

.ba-btn {
  padding: 0.55rem 1.25rem; border-radius: 100px;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: all var(--m-transition);
  display: inline-flex; align-items: center; gap: 0.4rem;
}

.ba-btn-primary {
  background: white; color: #1e40af; border: none;
}
.ba-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }

.ba-btn-ghost {
  background: rgba(255,255,255,0.12); color: white;
  border: 1px solid rgba(255,255,255,0.2);
}
.ba-btn-ghost:hover { background: rgba(255,255,255,0.2); }

.stats-row {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;
}

.stat-card {
  display: flex; align-items: center; gap: 0.75rem;
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: 14px; 
  padding: 1.1rem 1.15rem;
  transition: all 0.25s ease;
}

.stat-card:hover {
  border-color: var(--m-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.stat-icon { font-size: 1rem; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon.in { background: rgba(16,185,129,0.1); color: #059669; }
.stat-icon.out { background: rgba(239,68,68,0.08); color: #dc2626; }
.stat-icon.net { background: rgba(99,102,241,0.1); color: #7c3aed; }

.stat-body { display: flex; flex-direction: column; gap: 0.1rem; }
.stat-label { font-size: 0.7rem; color: var(--m-text-secondary); }
.stat-value { font-size: 1.15rem; font-weight: 700; }
.stat-value.in { color: #34d399; }
.stat-value.out { color: #f87171; }
.stat-value.net { color: #a78bfa; }

.w-section {
  margin-bottom: 2rem;
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  padding: 1.5rem;
  border: 1px solid var(--m-border);
}

.section-header {
  display: flex; align-items: center;
  margin-bottom: 1.25rem; gap: 0.75rem; flex-wrap: wrap;
}

.section-title {
  margin: 0; font-size: 1rem; font-weight: 700;
  color: var(--m-text); display: flex; align-items: center; gap: 0.5rem;
  white-space: nowrap;
}

.section-line { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(59,130,246,0.5), transparent); }

.tx-filter { display: flex; gap: 0.25rem; }

.filter-btn {
  background: transparent; border: 1px solid var(--m-border-light);
  color: var(--m-text-secondary); padding: 0.3rem 0.6rem;
  border-radius: var(--m-radius-sm); font-size: 0.75rem;
  cursor: pointer; transition: all var(--m-transition);
}

.filter-btn.active {
  background: var(--m-accent-light); border-color: var(--m-accent);
  color: var(--m-accent); font-weight: 600;
}

.filter-btn:hover:not(.active) { border-color: var(--m-border); }

.w-refresh {
  background: transparent; border: 1px solid var(--m-border);
  color: var(--m-text-secondary); border-radius: var(--m-radius-sm);
  padding: 0.4rem 0.6rem; cursor: pointer; transition: all var(--m-transition);
}
.w-refresh:hover { border-color: var(--m-accent); color: var(--m-accent); }

.w-tx-list { display: flex; flex-direction: column; gap: 0.4rem; }

.w-tx-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.8rem 1rem;
  background-color: var(--m-bg);
  border: 1px solid var(--m-border-light);
  border-radius: var(--m-radius-sm);
  transition: all var(--m-transition);
}

.w-tx-item:hover { border-color: var(--m-border); }

.tx-icon {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 0.85rem;
}

.tx-in .tx-icon { background: rgba(16,185,129,0.12); color: #34d399; }
.tx-out .tx-icon { background: rgba(239,68,68,0.12); color: #f87171; }

.tx-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }

.tx-top { display: flex; align-items: center; gap: 0.5rem; }

.tx-type { font-size: 0.85rem; font-weight: 600; color: var(--m-text); }

.tx-date { font-size: 0.7rem; color: var(--m-text-muted); }

.tx-desc { font-size: 0.75rem; color: var(--m-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.tx-ref { font-size: 0.7rem; color: var(--m-accent); }

.tx-side { display: flex; flex-direction: column; align-items: flex-end; gap: 0.1rem; flex-shrink: 0; }

.amount-in { font-size: 0.9rem; font-weight: 700; color: #34d399; }
.amount-out { font-size: 0.9rem; font-weight: 700; color: #f87171; }

.tx-balance { font-size: 0.65rem; color: var(--m-text-muted); }

@media (max-width: 640px) {
  .stats-row { grid-template-columns: 1fr; }
  .balance-amount { font-size: 2.2rem; }
  .tx-filter { order: 10; width: 100%; }
}

/* Modal styles */
.w-modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 80; padding: 1rem;
}

.w-modal {
  background-color: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius);
  padding: 1.5rem; width: 100%; max-width: 440px;
}

.w-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.25rem; padding-bottom: 1rem;
  border-bottom: 1px solid var(--m-border);
}

.w-modal-header h3 {
  margin: 0; font-size: 1.1rem; font-weight: 700;
  color: var(--m-text); display: flex; align-items: center; gap: 0.5rem;
}

.w-modal-close {
  background: transparent; border: 1px solid var(--m-border);
  color: var(--m-text-secondary); width: 2rem; height: 2rem;
  border-radius: var(--m-radius-sm); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--m-transition);
}
.w-modal-close:hover { border-color: #ef4444; color: #f87171; }

.w-modal-desc { font-size: 0.85rem; color: var(--m-text-secondary); margin: 0 0 1rem; }
.w-modal-desc strong { color: var(--m-accent); }

.recharge-presets {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem; margin-bottom: 1rem;
}

.preset-btn {
  background: var(--m-bg); border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm); cursor: pointer;
  transition: all var(--m-transition);
  padding: 0.65rem 0.5rem; text-align: center;
}

.preset-btn:hover { border-color: var(--m-accent); }
.preset-btn.active { border-color: var(--m-accent); background: var(--m-accent-light); }

.preset-val { display: block; font-size: 1rem; font-weight: 700; color: var(--m-text); }
.preset-coins { display: block; font-size: 0.7rem; color: var(--m-text-muted); margin-top: 0.15rem; }

.recharge-custom { margin-bottom: 1rem; }

.w-label { display: block; font-size: 0.75rem; color: var(--m-text-secondary); margin-bottom: 0.35rem; font-weight: 600; }

.recharge-input-wrap {
  position: relative; display: flex; align-items: center;
}

.recharge-currency {
  position: absolute; left: 0.75rem;
  font-size: 1rem; font-weight: 700; color: var(--m-text-secondary);
}

.w-input {
  width: 100%; background: var(--m-bg);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  color: var(--m-text); padding: 0.6rem 0.75rem 0.6rem 2rem;
  font-size: 1rem; font-weight: 600; box-sizing: border-box;
}
.w-input:focus { outline: none; border-color: var(--m-accent); }

.recharge-preview {
  position: absolute; right: 0.75rem;
  font-size: 0.8rem; color: var(--m-text-muted);
}

.w-modal-actions {
  display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;
}

.w-btn {
  border-radius: var(--m-radius-sm); padding: 0.5rem 1.25rem;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  border: 1px solid var(--m-border); transition: all var(--m-transition);
  display: inline-flex; align-items: center; gap: 0.4rem;
}
.w-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.w-btn-primary { background-color: var(--m-accent); color: white; border-color: var(--m-accent); }
.w-btn-primary:hover:not(:disabled) { background-color: var(--m-accent-hover); }

.w-btn-ghost { background: transparent; color: var(--m-text-secondary); }
.w-btn-ghost:hover { border-color: var(--m-accent); color: var(--m-accent); }

/* Success overlay */
.success-overlay {
  position: fixed; inset: 0; z-index: 90;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.success-card {
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: 1rem; padding: 2.5rem 2rem;
  text-align: center; max-width: 320px; width: 100%;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.success-icon { font-size: 3rem; color: #34d399; margin-bottom: 1rem; }
.success-text { font-size: 1.25rem; font-weight: 700; color: var(--m-text); margin-bottom: 0.5rem; }
.success-amount { font-size: 1.5rem; font-weight: 700; color: #34d399; margin-bottom: 1.5rem; }

.success-btn {
  background: var(--m-accent); color: white; border: none;
  padding: 0.6rem 2rem; border-radius: 100px;
  font-weight: 600; cursor: pointer;
  transition: all var(--m-transition);
}
.success-btn:hover { background: var(--m-accent-hover); }

@media (max-width: 480px) {
  .balance-amount { font-size: 2rem; }
  .recharge-presets { grid-template-columns: repeat(3, 1fr); }
}
</style>
