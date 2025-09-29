<template>
  <div class="help-center-simple">
    <!-- 头部导航（复用现有组件） -->
    <Header 
      :current-user="currentUser" 
      :user-avatar="userAvatar"
      @logout="handleLogout"
    />

    <!-- 核心内容区 -->
    <main class="main-content">
      <!-- 标题+搜索 -->
      <div class="top-bar">
        <div class="container">
          <h1>帮助中心</h1>
          <p>解决三角洲行动护航服务相关问题</p>
          
          <!-- 搜索框：快速定位答案 -->
          <div class="search-box">
            <input
              type="text"
              v-model="searchKeyword"
              placeholder="搜索问题（如：订单修改、退款）"
              @input="filterFaqs"
            >
            <button @click="filterFaqs"><i class="fa fa-search"></i></button>
          </div>
        </div>
      </div>

      <!-- FAQ分类区：核心内容，简化分类 -->
      <div class="faq-section">
        <div class="container">
          <!-- 分类标题（直接展示，不用复杂tabs） -->
          <div class="faq-categories">
            <button 
              class="category-btn" 
              :class="{ active: activeCategory === 'order' }"
              @click="activeCategory = 'order'"
            >
              订单问题
            </button>
            <button 
              class="category-btn" 
              :class="{ active: activeCategory === 'service' }"
              @click="activeCategory = 'service'"
            >
              服务问题
            </button>
            <button 
              class="category-btn" 
              :class="{ active: activeCategory === 'account' }"
              @click="activeCategory = 'account'"
            >
              账号问题
            </button>
          </div>

          <!-- 当前分类FAQ（手风琴组件，简化交互） -->
          <div class="faq-list">
            <FaqAccordionItem 
              v-for="(item, idx) in filteredFaqs" 
              :key="idx"
              :question="item.question"
              :answer="item.answer"
            />

            <!-- 空搜索结果提示 -->
            <div class="empty-tip" v-if="filteredFaqs.length === 0 && searchKeyword">
              <i class="fa fa-search-minus"></i>
              <p>没找到“{{ searchKeyword }}”相关问题</p>
              <button @click="resetSearch">清除搜索</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系客服入口：简化，直接跳转/展示核心方式 -->
      <div class="contact-section">
        <div class="container">
          <h2>还没解决？联系我们</h2>
          <div class="contact-ways">
            <a href="/support-center" class="contact-btn primary">
              <i class="fa fa-headphones"></i> 在线客服
            </a>
            <div class="contact-info">
              <p><i class="fa fa-weixin"></i> 官方微信：DeltaService_Offical</p>
              <p><i class="fa fa-phone"></i> 客服电话：400-888-8888（9:00-23:00）</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚（复用现有组件） -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

import Header from '../layouts/Header.vue';
import Footer from '../layouts/Footer.vue';
import FaqAccordionItem from '../components/Common/FaqAccordionItem.vue'; // 复用手风琴组件

const router = useRouter();

// —— 基础状态 ——
// 用户信息（简化，只保留必要字段）
const currentUser = ref<{ username?: string; avatar?: string } | null>(null);
const userAvatar = ref('https://picsum.photos/id/237/200/200');

// 搜索与分类
const searchKeyword = ref('');
const activeCategory = ref<'order' | 'service' | 'account'>('order');

// —— 简化版FAQ数据（聚焦核心问题，答案简洁） ——
const faqData = ref({
  // 订单问题（高频）
  order: [
    {
      question: '怎么修改护航订单时间？',
      answer: '进入“我的订单”→ 找到对应订单→ 点击“修改时间”→ 选择新时间提交（已接单需先和打手确认）'
    },
    {
      question: '订单能取消退款吗？',
      answer: '未接单：直接取消，全额退款（1-3天到账）；已接单未开始：扣5%手续费；已开始：按完成比例退'
    },
    {
      question: '订单“待接单”要等多久？',
      answer: '通常10-30分钟内接单，30分钟没接单可点击“加急匹配”（需额外5%费用）'
    }
  ],
  // 服务问题（核心）
  service: [
    {
      question: '护航会导致账号被封吗？',
      answer: '不会。所有打手手动操作，无作弊工具，至今零封号记录，可放心使用'
    },
    {
      question: '能指定打手吗？',
      answer: '可以：在“打手大厅”找到目标打手→ 点击“指定预约”；或下单时备注打手昵称'
    },
    {
      question: '装备代刷没刷到怎么办？',
      answer: '全额退款，或免费继续刷到完成（需下单时明确备注要刷的装备名称）'
    }
  ],
  // 账号问题（关键）
  account: [
    {
      question: '给打手账号，怎么保证安全？',
      answer: '1. 设临时密码（服务后改回）；2. 服务期间不登录；3. 结束后立即改密码+开保护'
    },
    {
      question: '账号被冻结了怎么办？',
      answer: '游戏官方冻结：走官方解冻流程；平台临时冻结：联系客服1-2小时内解'
    },
    {
      question: '忘记密码怎么找？',
      answer: '登录页点“忘记密码”→ 用绑定手机/邮箱收验证码→ 重置密码；无绑定联系客服'
    }
  ]
});

// —— 计算属性：筛选FAQ ——
const filteredFaqs = computed(() => {
  // 先拿当前分类的FAQ
  let targetFaqs = faqData.value[activeCategory.value];
  
  // 有搜索词则过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase();
    targetFaqs = targetFaqs.filter(item => 
      item.question.toLowerCase().includes(keyword) || 
      item.answer.toLowerCase().includes(keyword)
    );
  }
  
  return targetFaqs;
});

// —— 简化方法 ——
// 筛选FAQ
const filterFaqs = () => {}; // 计算属性自动响应，方法仅作触发用
// 重置搜索
const resetSearch = () => {
  searchKeyword.value = '';
};
// 登出（简化，复用原有逻辑）
const handleLogout = () => {
  localStorage.removeItem('delta_token');
  localStorage.removeItem('delta_user');
  router.push('/login');
};

// —— 初始化：简化，只加载用户信息 ——
const init = () => {
  const userStr = localStorage.getItem('delta_user') || sessionStorage.getItem('delta_user');
  if (userStr) currentUser.value = JSON.parse(userStr);
};
init();
</script>

<style scoped>
/* 基础样式：简化，减少装饰 */
.help-center-simple {
  min-height: 100vh;
  background-color: #0f172a;
  color: #e2e8f0;
  font-family: 'Segoe UI', sans-serif;
}

.container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 顶部标题+搜索 */
.top-bar {
  padding: 2rem 0;
  text-align: center;
  border-bottom: 1px solid #1e293b;
}

.top-bar h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #f3f4f6;
}

.top-bar p {
  color: #94a3b8;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

/* 搜索框：简化样式 */
.search-box {
  max-width: 500px;
  margin: 0 auto;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 0.8rem 0.8rem 0.8rem 2.5rem;
  background-color: #1e293b;
  border: 1px solid #3b82f633;
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.95rem;
}

.search-box button {
  position: absolute;
  left: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

/* FAQ分类区：简化 */
.faq-section {
  padding: 2.5rem 0;
}

/* 分类按钮：简化样式，横向排列 */
.faq-categories {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  overflow-x: auto; /* 小屏可滚动 */
  padding-bottom: 0.5rem;
}

.category-btn {
  padding: 0.5rem 1.2rem;
  background-color: #1e293b;
  border: 1px solid #3b82f633;
  border-radius: 0.5rem;
  color: #94a3b8;
  font-size: 0.95rem;
  cursor: pointer;
  white-space: nowrap; /* 防止文字换行 */
}

.category-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* FAQ列表：简化间距 */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

/* 空提示：简化样式 */
.empty-tip {
  text-align: center;
  padding: 2rem 1rem;
  background-color: #1e293b;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.empty-tip i {
  font-size: 2rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.empty-tip p {
  color: #94a3b8;
  margin-bottom: 1rem;
}

.empty-tip button {
  padding: 0.5rem 1rem;
  background-color: #3b82f633;
  color: #3b82f6;
  border: 1px solid #3b82f655;
  border-radius: 0.5rem;
  cursor: pointer;
}

/* 联系客服区：简化布局 */
.contact-section {
  padding: 2.5rem 0;
  background-color: #1e293b;
  text-align: center;
}

.contact-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #f3f4f6;
}

/* 联系方式：简化，横向排列（大屏）/ 纵向（小屏） */
.contact-ways {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}

.contact-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.primary {
  background-color: #3b82f6;
  color: white;
}

/* 联系信息：简化排版 */
.contact-info {
  text-align: left;
  color: #94a3b8;
  font-size: 0.95rem;
}

.contact-info p {
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 响应式：简化适配 */
@media (max-width: 768px) {
  .contact-ways {
    flex-direction: column;
    text-align: center;
  }
  
  .contact-info {
    text-align: center;
  }
}
</style>