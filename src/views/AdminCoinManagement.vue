<!--
  【栗币管理】管理员为用户充值/扣减栗币
  功能：
    - 手动调整：输入用户ID + 金额（正数充值/负数扣减）
    - 快速充值预设：10/30/50/100/200/500 元快捷按钮
    - 用户钱包查询：输入ID查询余额和交易记录
  角色：仅 userLevel >= 2（Boss管理员）
-->
<template>
  <div class="ac-page">
    <Header />

    <main class="ac-main">
      <div class="container">
        <header class="ac-hero">
          <div class="welcome">
            <div class="welcome-text">
              <span class="welcome-greeting"><i class="fa fa-coins"></i> 栗币管理 · 管理员</span>
              <h1 class="welcome-title">栗币充值与管理</h1>
              <p class="welcome-date">为用户充值栗币，查询钱包余额与流水记录。</p>
            </div>
          </div>
        </header>

        <div v-if="error" class="ac-error"><i class="fa fa-exclamation-triangle"></i> {{ error }}</div>

        <div class="ac-columns">
          <section class="ac-section">
            <div class="section-header">
              <h2 class="section-title"><i class="fa fa-plus-circle"></i> 为用户充值</h2>
              <span class="section-line"></span>
            </div>
            <form class="ac-form" @submit.prevent="handleAdjust">
              <div class="form-group">
                <label class="form-label">用户ID</label>
                <input v-model.number="form.userId" type="number" min="1" step="1" class="form-input" placeholder="输入用户ID" required />
              </div>
              <div class="form-group">
                <label class="form-label">金额 (元)</label>
                <input v-model.number="form.amount" type="number" step="0.01" class="form-input" placeholder="正数=充值，负数=扣减" required />
                <span class="form-hint">正数为充值，负数为扣减</span>
              </div>
              <div class="form-group">
                <label class="form-label">备注</label>
                <input v-model="form.description" type="text" class="form-input" placeholder="例如：活动奖励" />
              </div>
              <button type="submit" class="ac-btn ac-btn-primary" :disabled="submitting">
                <i class="fa" :class="submitting ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                {{ submitting ? '提交中...' : '确认调整' }}
              </button>
            </form>
          </section>

          <section class="ac-section">
            <div class="section-header">
              <h2 class="section-title"><i class="fa fa-dollar-sign"></i> 快速充值预设</h2>
              <span class="section-line"></span>
            </div>
            <p class="ac-sub">快速为指定用户充值固定金额栗币。</p>
            <div class="preset-section">
              <div class="form-group">
                <label class="form-label">用户ID</label>
                <input v-model.number="presetForm.userId" type="number" min="1" class="form-input" placeholder="输入用户ID" />
              </div>
              <div class="preset-grid">
                <button v-for="p in presets" :key="p.amount" type="button" class="preset-btn" :disabled="!presetForm.userId || presetting" @click="handlePreset(p.amount, p.label)">
                  <span class="preset-val">¥{{ p.amount }}</span>
                  <span class="preset-label">{{ p.label }}</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        <section class="ac-section">
          <div class="section-header">
            <h2 class="section-title"><i class="fa fa-search"></i> 查询钱包</h2>
            <span class="section-line"></span>
          </div>
          <div class="query-section">
            <div class="form-inline">
              <input v-model.number="queryUserId" type="number" class="form-input" style="max-width: 200px" placeholder="输入用户ID查询" />
              <button type="button" class="ac-btn ac-btn-primary" :disabled="!queryUserId || querying" @click="handleQuery">
                <i class="fa" :class="querying ? 'fa-spinner fa-spin' : 'fa-search'"></i> 查询
              </button>
            </div>
            <div v-if="queriedWallet" class="query-result">
              <div class="qr-row">
                <span>用户钱包</span>
                <strong>{{ queriedWallet.wallet ? formatCoin(queriedWallet.wallet.balance) : '未找到' }}</strong>
              </div>
              <div v-if="queriedWallet.transactions?.length" class="qr-txs">
                <div class="qr-tx" v-for="tx in queriedWallet.transactions.slice(0, 10)" :key="tx.id">
                  <span class="qr-tx-type">{{ txLabel(tx.type) }}</span>
                  <span :class="tx.amount > 0 ? 'qr-tx-in' : 'qr-tx-out'">{{ tx.amount > 0 ? '+' : '' }}{{ formatCoin(tx.amount) }}</span>
                  <span class="qr-tx-time">{{ formatTime(tx.createdAt) }}</span>
                </div>
              </div>
              <p v-else class="qr-empty">暂无流水记录</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Header from '../layouts/Header.vue'
import Footer from '../layouts/Footer.vue'
import { walletApi } from '../api/walletApi'
import type { WalletInfo } from '../types/wallet'

const error = ref('')
const submitting = ref(false)
const presetting = ref(false)
const querying = ref(false)
const queriedWallet = ref<WalletInfo | null>(null)
const queryUserId = ref<number>(1)

const form = ref({ userId: 1, amount: 10, description: '' })
const presetForm = ref({ userId: 1 })
const presets = [
  { amount: 10, label: '小额充值' },
  { amount: 50, label: '标准充值' },
  { amount: 100, label: '大额充值' },
  { amount: 500, label: 'VIP充值' },
  { amount: 1000, label: '至尊充值' },
  { amount: 5000, label: '对公充值' }
]

function formatCoin(val: number): string {
  return (val / 100).toLocaleString('zh-CN', { minimumFractionDigits: 0 }) + ' 栗币'
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function txLabel(type: string): string {
  const map: Record<string, string> = {
    RECHARGE: '充值', ORDER_PAY: '支付', ORDER_REFUND: '退款',
    ADMIN_ADJUST: '调整', PLAYER_PAYOUT: '结算'
  }
  return map[type] || type
}

async function handleAdjust() {
  if (!form.value.userId || !form.value.amount) return
  submitting.value = true
  error.value = ''
  try {
    await walletApi.adminAdjust({
      userId: form.value.userId,
      amount: form.value.amount,
      description: form.value.description?.trim() || '管理员调整'
    })
    form.value = { userId: 1, amount: 10, description: '' }
    queryUserId.value = form.value.userId
  } catch (e) {
    error.value = e instanceof Error ? e.message : '调整失败'
  } finally {
    submitting.value = false
  }
}

async function handlePreset(amount: number, label: string) {
  if (!presetForm.value.userId) return
  presetting.value = true
  error.value = ''
  try {
    await walletApi.adminAdjust({ userId: presetForm.value.userId, amount, description: label })
    queryUserId.value = presetForm.value.userId
    await handleQuery()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '充值失败'
  } finally {
    presetting.value = false
  }
}

async function handleQuery() {
  if (!queryUserId.value) return
  querying.value = true
  try {
    queriedWallet.value = await walletApi.getInfo()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '查询失败'
  } finally {
    querying.value = false
  }
}
</script>

<style scoped>
.ac-page {
  min-height: 100vh;
  background-color: var(--m-bg);
  color: var(--m-text);
  font-family: var(--m-font-body);
}

.ac-main { padding: 2.5rem 0 4rem; }

.container { max-width: 960px; margin: 0 auto; padding: 0 1rem; }

.ac-hero {
  margin-bottom: 2rem;
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  padding: 2rem;
  border: 1px solid var(--m-border);
}

.welcome { display: flex; gap: 2rem; align-items: center; }
.welcome-text { flex: 1; }
.welcome-greeting { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--m-accent); margin-bottom: 0.75rem; }
.welcome-title { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.75rem; color: var(--m-text); }
.welcome-date { margin: 0; color: var(--m-text-secondary); }

.ac-error {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: var(--m-radius-sm);
  color: #fca5a5;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ac-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .ac-columns { grid-template-columns: 1fr; }
}

.ac-section {
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  padding: 1.5rem;
  border: 1px solid var(--m-border);
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--m-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(59,130,246,0.5), transparent);
}

.ac-sub {
  font-size: 0.85rem;
  color: var(--m-text-secondary);
  margin: 0 0 1rem;
}

.ac-form, .preset-section, .query-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.75rem;
  color: var(--m-text-secondary);
  font-weight: 600;
}

.form-input {
  background: var(--m-bg);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  color: var(--m-text);
  padding: 0.5rem 0.65rem;
  font-size: 0.85rem;
  box-sizing: border-box;
  width: 100%;
}

.form-input:focus {
  outline: none;
  border-color: var(--m-accent);
}

.form-hint {
  font-size: 0.7rem;
  color: var(--m-text-muted);
}

.form-inline {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.ac-btn {
  border-radius: var(--m-radius-sm);
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--m-border);
  transition: all var(--m-transition);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.ac-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.ac-btn-primary {
  background-color: var(--m-accent);
  color: white;
  border-color: var(--m-accent);
}

.ac-btn-primary:hover:not(:disabled) { background-color: var(--m-accent-hover); }

.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.preset-btn {
  background: var(--m-bg);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  color: var(--m-text);
  padding: 0.6rem 0.5rem;
  cursor: pointer;
  transition: all var(--m-transition);
  text-align: center;
}

.preset-btn:hover:not(:disabled) { border-color: var(--m-accent); }
.preset-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.preset-val { display: block; font-weight: 700; font-size: 0.9rem; }
.preset-label { display: block; font-size: 0.7rem; color: var(--m-text-muted); margin-top: 0.15rem; }

.query-result {
  background: var(--m-bg);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  padding: 1rem;
}

.qr-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--m-border-light);
  font-size: 0.9rem;
  color: var(--m-text-secondary);
}

.qr-row strong { color: var(--m-accent); font-size: 1.1rem; }

.qr-txs { margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }

.qr-tx {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--m-text-secondary);
}

.qr-tx-type { font-weight: 500; }
.qr-tx-in { color: #34d399; font-weight: 600; }
.qr-tx-out { color: #f87171; font-weight: 600; }
.qr-tx-time { font-size: 0.7rem; color: var(--m-text-muted); }

.qr-empty {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: var(--m-text-muted);
  text-align: center;
}
</style>
