<!--
  【流水管理】管理员资金流水记录页面
  功能：
    - 总收入/总支出/净收入 统计概览
    - 新增流水记录（收入/支出 × 支付宝/微信/银行/现金）
    - 流水列表（支持删除记录）
  角色：仅 userLevel >= 2（Boss管理员）
  交互：表单提交 → 新增流水 → 实时更新统计数据
-->
<template>
  <div class="tr-page">
    <Header />

    <main class="tr-main">
      <div class="container">
        <header class="tr-hero">
          <div class="welcome">
            <div class="welcome-text">
              <span class="welcome-greeting"><i class="fa fa-book"></i> 流水管理 · 管理员</span>
              <h1 class="welcome-title">资金流水记录</h1>
              <p class="welcome-date">管理平台所有资金流水，记录收入与支出明细。</p>
            </div>
            <div class="welcome-stats">
              <div class="stat">
                <span class="stat-value income">¥{{ formatAmount(summary?.totalIncome ?? 0) }}</span>
                <span class="stat-label">总收入</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat">
                <span class="stat-value expense">¥{{ formatAmount(summary?.totalExpense ?? 0) }}</span>
                <span class="stat-label">总支出</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat">
                <span class="stat-value net">¥{{ formatAmount(summary?.netAmount ?? 0) }}</span>
                <span class="stat-label">净收入</span>
              </div>
            </div>
          </div>
        </header>

        <div v-if="error" class="tr-error">
          <i class="fa fa-exclamation-triangle"></i> {{ error }}
        </div>

        <section class="tr-section">
          <div class="section-header">
            <h2 class="section-title"><i class="fa fa-plus-circle"></i> 新增流水记录</h2>
            <span class="section-line"></span>
          </div>
          <form class="tr-form" @submit.prevent="handleCreate">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">类型</label>
                <select v-model="form.type" class="form-select" required>
                  <option value="">请选择</option>
                  <option value="INCOME">收入</option>
                  <option value="EXPENSE">支出</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">金额 (¥)</label>
                <input v-model.number="form.amount" type="number" step="0.01" min="0.01" placeholder="0.00" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">支付方式</label>
                <select v-model="form.paymentMethod" class="form-select">
                  <option value="">请选择</option>
                  <option value="alipay">支付宝</option>
                  <option value="wechat">微信支付</option>
                  <option value="bank">银行转账</option>
                  <option value="cash">现金</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">描述</label>
                <input v-model="form.description" type="text" placeholder="例如：平台服务费收入" class="form-input" />
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="tr-btn tr-btn-primary" :disabled="submitting">
                <i class="fa" :class="submitting ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                {{ submitting ? '提交中...' : '添加流水' }}
              </button>
            </div>
          </form>
        </section>

        <section class="tr-section">
          <div class="section-header">
            <h2 class="section-title"><i class="fa fa-list"></i> 流水记录</h2>
            <span class="section-line"></span>
            <button type="button" class="tr-refresh" :disabled="loading" @click="loadData">
              <i class="fa" :class="loading ? 'fa-spinner fa-spin' : 'fa-refresh'"></i>
              刷新
            </button>
          </div>
          <div v-if="loading && !transactions.length" class="tr-loading">
            <i class="fa fa-spinner fa-spin"></i> 加载中…
          </div>
          <div v-else-if="!transactions.length" class="tr-empty">暂无流水记录。</div>
          <div v-else class="tr-table-wrap">
            <table class="tr-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>类型</th>
                  <th>金额</th>
                  <th>支付方式</th>
                  <th>描述</th>
                  <th>时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in transactions" :key="row.id">
                  <td class="tr-id">{{ row.id }}</td>
                  <td>
                    <span class="tr-badge" :class="row.type === 'INCOME' ? 'badge-income' : 'badge-expense'">
                      {{ row.type === 'INCOME' ? '收入' : '支出' }}
                    </span>
                  </td>
                  <td class="tr-amount" :class="row.type === 'INCOME' ? 'income' : 'expense'">
                    {{ row.type === 'INCOME' ? '+' : '-' }}¥{{ formatAmount(row.amount) }}
                  </td>
                  <td>{{ paymentLabel(row.paymentMethod) }}</td>
                  <td class="tr-desc">{{ row.description || '—' }}</td>
                  <td class="tr-time">{{ formatTime(row.createdAt) }}</td>
                  <td>
                    <button type="button" class="tr-btn-sm tr-btn-danger" :disabled="deletingId === row.id" @click="handleDelete(row.id)">
                      <i class="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '../layouts/Header.vue'
import Footer from '../layouts/Footer.vue'
import { transactionApi } from '../api/transactionApi'
import type { Transaction, CreateTransactionPayload, TransactionSummary } from '../types/transaction'

const transactions = ref<Transaction[]>([])
const summary = ref<TransactionSummary | null>(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const deletingId = ref<number | null>(null)

const form = ref<CreateTransactionPayload>({
  type: '' as 'INCOME' | 'EXPENSE',
  amount: 0,
  paymentMethod: '',
  description: ''
})

function formatAmount(val: number): string {
  return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

function paymentLabel(method?: string): string {
  const map: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    bank: '银行转账',
    cash: '现金'
  }
  return method ? map[method] || method : '—'
}

async function loadData() {
  loading.value = true
  error.value = ''
  const results = await Promise.allSettled([
    transactionApi.list(),
    transactionApi.getSummary()
  ])
  {
    const r0 = results[0]
    if (r0.status === 'fulfilled') transactions.value = r0.value
    else console.error('流水列表加载失败:', r0.reason)
  }
  {
    const r1 = results[1]
    if (r1.status === 'fulfilled') summary.value = r1.value
    else console.error('流水汇总加载失败:', r1.reason)
  }
  loading.value = false
}

async function handleCreate() {
  if (!form.value.type) {
    alert('请选择类型')
    return
  }
  if (!form.value.amount || form.value.amount <= 0) {
    alert('金额必须大于 0')
    return
  }
  submitting.value = true
  error.value = ''
  try {
    await transactionApi.create({
      type: form.value.type,
      amount: form.value.amount,
      paymentMethod: form.value.paymentMethod || undefined,
      description: form.value.description?.trim() || undefined
    })
    form.value = { type: '' as 'INCOME' | 'EXPENSE', amount: 0, paymentMethod: '', description: '' }
    await loadData()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '添加失败'
    console.error(e)
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number) {
  if (!confirm('确定删除此流水记录？')) return
  deletingId.value = id
  try {
    await transactionApi.delete(id)
    await loadData()
  } catch (e) {
    console.error(e)
    alert(e instanceof Error ? e.message : '删除失败')
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  void loadData()
})
</script>

<style scoped>
.tr-page {
  min-height: 100vh;
  background-color: var(--m-bg);
  color: var(--m-text);
  font-family: var(--m-font-body);
}

.tr-main {
  padding: 2.5rem 0 4rem;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1rem;
}

.tr-hero {
  margin-bottom: 2rem;
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  padding: 2rem;
  border: 1px solid var(--m-border);
  position: relative;
  overflow: hidden;
}

.tr-hero::before {
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

.tr-hero:hover::before {
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
  min-width: 7rem;
}

.stat-value {
  display: block;
  font-size: 1.3rem;
  font-weight: 700;
}

.stat-value.income { color: #34d399; }
.stat-value.expense { color: #f87171; }
.stat-value.net { color: var(--m-accent); }

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

.tr-error {
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

.tr-section {
  margin-bottom: 2.5rem;
  background-color: var(--m-bg-secondary);
  border-radius: var(--m-radius);
  padding: 1.5rem;
  border: 1px solid var(--m-border);
  position: relative;
  overflow: hidden;
}

.tr-section::before {
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

.tr-section:hover::before {
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

.tr-form {
  background-color: var(--m-bg);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  padding: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 160px;
}

.form-group.flex-1 {
  flex: 2;
  min-width: 200px;
}

.form-label {
  display: block;
  font-size: 0.75rem;
  color: var(--m-text-secondary);
  margin-bottom: 0.35rem;
  font-weight: 600;
}

.form-input,
.form-select {
  width: 100%;
  background-color: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: var(--m-radius-sm);
  color: var(--m-text);
  padding: 0.5rem 0.65rem;
  font-size: 0.85rem;
  transition: border-color var(--m-transition);
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--m-accent);
  box-shadow: 0 0 0 3px var(--m-accent-light);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.tr-btn {
  border-radius: var(--m-radius-sm);
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--m-border);
  transition: all var(--m-transition);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.tr-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tr-btn-primary {
  background-color: var(--m-accent);
  color: white;
  border-color: var(--m-accent);
}

.tr-btn-primary:hover:not(:disabled) {
  background-color: var(--m-accent-hover);
}

.tr-btn-sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  border-radius: var(--m-radius-sm);
  cursor: pointer;
  border: 1px solid var(--m-border);
  transition: all var(--m-transition);
}

.tr-btn-sm:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.tr-btn-danger {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(248, 113, 113, 0.3);
  color: #fca5a5;
}

.tr-btn-danger:hover:not(:disabled) {
  background-color: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fecaca;
}

.tr-refresh {
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

.tr-refresh:hover:not(:disabled) {
  border-color: var(--m-accent);
  color: var(--m-accent);
}

.tr-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tr-loading,
.tr-empty {
  text-align: center;
  padding: 2rem;
  color: var(--m-text-secondary);
}

.tr-table-wrap {
  overflow-x: auto;
}

.tr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.tr-table th {
  text-align: left;
  padding: 0.65rem 0.75rem;
  font-weight: 600;
  color: var(--m-text-secondary);
  border-bottom: 1px solid var(--m-border);
  white-space: nowrap;
}

.tr-table td {
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid var(--m-border-light);
  color: var(--m-text);
}

.tr-table tbody tr {
  transition: background-color var(--m-transition);
}

.tr-table tbody tr:hover {
  background-color: var(--m-bg);
}

.tr-id {
  font-weight: 600;
  color: var(--m-text-muted);
  font-size: 0.75rem;
}

.tr-amount {
  font-weight: 700;
  font-family: var(--m-font-display);
}

.tr-amount.income { color: #34d399; }
.tr-amount.expense { color: #f87171; }

.tr-desc {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tr-time {
  font-size: 0.75rem;
  color: var(--m-text-secondary);
  white-space: nowrap;
}

.tr-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 0.25rem;
}

.badge-income {
  background-color: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.badge-expense {
  background-color: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

@media (max-width: 768px) {
  .welcome {
    flex-direction: column;
    align-items: flex-start;
  }

  .welcome-stats {
    width: 100%;
    justify-content: space-around;
  }

  .form-row {
    flex-direction: column;
  }

  .form-group {
    min-width: 100%;
  }
}

@media (max-width: 480px) {
  .tr-hero {
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

  .tr-section {
    padding: 1.25rem;
  }
}
</style>
