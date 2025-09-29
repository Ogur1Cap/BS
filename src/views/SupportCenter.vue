<template>
  <div class="support-center-page">
    <!-- 头部导航（复用项目现有Header） -->
    <Header 
      :current-user="currentUser" 
      :user-avatar="userAvatar"
      @logout="handleLogout"
    />

    <!-- 页面标题区 -->
    <section class="page-header">
      <div class="container">
        <h1>
          <i class="fa fa-headphones" style="color: #3b82f6;"></i> 
          客服中心
        </h1>
        <p>专业客服团队为您解决三角洲行动护航服务相关问题，支持AI智能咨询与人工服务</p>
      </div>
    </section>

    <!-- 客服主体区 -->
    <section class="support-main">
      <div class="container">
        <div class="support-container">
          <!-- 左侧：客服类型选择 + AI配置 -->
          <div class="support-sidebar">
            <!-- 客服类型切换 -->
            <div class="service-type-tabs">
              <button 
                class="tab-btn" 
                :class="{ active: currentService === 'ai' }"
                @click="switchService('ai')"
              >
                <i class="fa fa-robot"></i> AI智能客服
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: currentService === 'human' }"
                @click="switchService('human')"
              >
                <i class="fa fa-user"></i> 人工服务
              </button>
            </div>

            <!-- AI客服配置（仅AI模式显示） -->
            <div class="ai-config" v-if="currentService === 'ai'">
              <h3 class="config-title">AI客服配置</h3>
              <div class="config-group">
                <label>预设问题分类</label>
                <select v-model="aiConfig.questionType" class="config-select" @change="updateAIService">
                  <option value="all">全部问题</option>
                  <option value="order">订单相关（预约/修改/退款）</option>
                  <option value="service">服务相关（护航/陪练）</option>
                  <option value="account">账号相关（安全/绑定）</option>
                  <option value="payment">支付相关（充值/账单）</option>
                </select>
              </div>
              <div class="config-group">
                <label>回复风格</label>
                <select v-model="aiConfig.replyStyle" class="config-select" @change="updateAIService">
                  <option value="professional">专业严谨</option>
                  <option value="friendly">亲切易懂</option>
                  <option value="concise">简洁高效</option>
                </select>
              </div>
              <div class="config-group">
                <label>上下文记忆</label>
                <label class="switch">
                  <input 
                    type="checkbox" 
                    v-model="aiConfig.contextMemory"
                    @change="updateAIService"
                  >
                  <span class="slider round"></span>
                </label>
                <span class="config-desc">开启后AI可记忆历史对话</span>
              </div>
              <button class="reset-ai-btn" @click="resetAIConfig">
                重置AI配置
              </button>
            </div>

            <!-- 人工服务说明（仅人工模式显示） -->
            <div class="human-info" v-if="currentService === 'human'">
              <h3 class="info-title">人工服务说明</h3>
              <div class="info-item">
                <i class="fa fa-clock-o"></i>
                <span>服务时间：9:00 - 23:00（全年无休）</span>
              </div>
              <div class="info-item">
                <i class="fa fa-bolt"></i>
                <span>紧急问题响应时间：5分钟内</span>
              </div>
              <div class="info-item">
                <i class="fa fa-list"></i>
                <span>支持范围：订单处理、服务纠纷、账号安全</span>
              </div>
              <div class="queue-status" v-if="isWaiting">
                <i class="fa fa-spinner fa-spin"></i>
                <span>当前排队人数：{{ queueCount }} 人，预计等待：{{ waitTime }} 分钟</span>
              </div>
            </div>
          </div>

          <!-- 右侧：客服交互区 -->
          <div class="support-interactive">
            <!-- AI客服对话窗口（AI模式） -->
            <div class="ai-chat" v-if="currentService === 'ai'">
              <!-- 对话历史 -->
              <div class="chat-history" ref="chatHistory">
                <!-- 欢迎消息（初始显示） -->
                <div class="message ai-message" v-if="chatMessages.length === 0">
                  <div class="message-avatar">
                    <i class="fa fa-robot"></i>
                  </div>
                  <div class="message-content">
                    <div class="message-sender">三角洲AI客服</div>
                    <div class="message-text">
                      您好！我是三角洲行动服务客服，可为您解答订单、护航服务、账号等问题。您可以：
                      <br>1. 直接描述您的问题
                      <br>2. 选择左侧预设问题分类快速咨询
                    </div>
                  </div>
                </div>

                <!-- 历史消息 -->
                <div 
                  v-for="(msg, index) in chatMessages" 
                  :key="index"
                  :class="['message', msg.sender === 'user' ? 'user-message' : 'ai-message']"
                >
                  <div class="message-avatar">
                    <i v-if="msg.sender === 'ai'" class="fa fa-robot"></i>
                    <img v-else :src="userAvatar" alt="用户头像">
                  </div>
                  <div class="message-content">
                    <div class="message-sender">
                      {{ msg.sender === 'user' ? currentUser?.username || '您' : '三角洲AI客服' }}
                    </div>
                    <div class="message-text">{{ msg.content }}</div>
                    <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
                  </div>
                </div>

                <!-- AI加载中 -->
                <div class="message ai-message" v-if="isAiLoading">
                  <div class="message-avatar">
                    <i class="fa fa-robot"></i>
                  </div>
                  <div class="message-content">
                    <div class="message-sender">三角洲AI客服</div>
                    <div class="loading-indicator">
                      <span class="dot"></span>
                      <span class="dot"></span>
                      <span class="dot"></span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 输入区域 -->
              <div class="chat-input">
                <textarea
                  v-model="userInput"
                  placeholder="请输入您的问题（例如：如何修改护航订单时间？）"
                  @keydown.enter.prevent="sendMessage"
                ></textarea>
                <div class="input-actions">
                  <button class="clear-btn" @click="clearInput" :disabled="!userInput">
                    <i class="fa fa-times"></i>
                  </button>
                  <button class="send-btn" @click="sendMessage" :disabled="!userInput || isAiLoading">
                    <i class="fa fa-paper-plane"></i> 
                  </button>
                </div>
              </div>

              <!-- 快捷问题 -->
              <div class="quick-questions">
                <span class="quick-title">常见问题：</span>
                <button 
                  class="quick-btn" 
                  v-for="(question, index) in quickQuestions" 
                  :key="index"
                  @click="sendQuickQuestion(question)"
                >
                  {{ question }}
                </button>
              </div>
            </div>

            <!-- 人工服务表单（人工模式） -->
            <div class="human-form" v-if="currentService === 'human'">
              <h3 class="form-title">发起人工服务</h3>
              <form class="service-form" @submit.prevent="submitHumanService">
                <div class="form-group">
                  <label for="username">用户名 *</label>
                  <input
                    type="text"
                    id="username"
                    v-model="humanForm.username"
                    readonly
                    class="form-control"
                  >
                </div>
                <div class="form-group">
                  <label for="contact">联系方式（手机号/微信） *</label>
                  <input
                    type="text"
                    id="contact"
                    v-model="humanForm.contact"
                    placeholder="请填写方便联系的方式"
                    class="form-control"
                    required
                  >
                </div>
                <div class="form-group">
                  <label for="problemType">问题类型 *</label>
                  <select
                    id="problemType"
                    v-model="humanForm.problemType"
                    class="form-control"
                    required
                  >
                    <option value="">请选择问题类型</option>
                    <option value="order">订单问题（修改/取消/退款）</option>
                    <option value="escort">护航服务问题（打手/效果）</option>
                    <option value="account">账号安全问题</option>
                    <option value="payment">支付问题</option>
                    <option value="other">其他问题</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="emergencyLevel">紧急程度</label>
                  <select
                    id="emergencyLevel"
                    v-model="humanForm.emergencyLevel"
                    class="form-control"
                  >
                    <option value="normal">普通（20分钟内响应）</option>
                    <option value="urgent">紧急（5分钟内响应）</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="problemDesc">问题描述 *</label>
                  <textarea
                    id="problemDesc"
                    v-model="humanForm.problemDesc"
                    placeholder="请详细描述您的问题，例如：我预约了今天19点的护航服务，想修改到21点"
                    rows="4"
                    class="form-control"
                    required
                  ></textarea>
                </div>
                <div class="form-actions">
                  <button 
                    type="submit" 
                    class="submit-btn"
                    :disabled="isSubmitting"
                  >
                    <i v-if="isSubmitting" class="fa fa-spinner fa-spin mr-2"></i>
                    {{ isSubmitting ? '提交中...' : '发起人工服务' }}
                  </button>
                  <button 
                    type="button" 
                    class="cancel-btn"
                    @click="resetHumanForm"
                    :disabled="isSubmitting"
                  >
                    重置
                  </button>
                </div>
              </form>

              <!-- 人工服务状态（提交后显示） -->
              <div class="human-status" v-if="isSubmitted">
                <div class="status-icon success">
                  <i class="fa fa-check"></i>
                </div>
                <h4>人工服务请求已提交！</h4>
                <p>您的服务编号：<span class="service-code">{{ serviceCode }}</span></p>
                <p>当前排队人数：<span class="queue-count">{{ queueCount }}</span> 人</p>
                <p>预计响应时间：<span class="wait-time">{{ waitTime }} 分钟</span></p>
                <p>我们将通过 <span class="contact-way">{{ humanForm.contact }}</span> 联系您，请保持畅通</p>
                <button class="check-status-btn" @click="checkServiceStatus">
                  <i class="fa fa-refresh"></i> 刷新状态
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 常见问题区（FAQ） -->
    <section class="support-faq">
      <div class="container">
        <h2 class="faq-title">
          <i class="fa fa-question-circle" style="color: #3b82f6;"></i> 
          常见问题
        </h2>
        <div class="faq-accordion">
          <FaqAccordionItem 
            question="AI客服可以解决哪些问题？"
            answer="AI客服可解决大部分常见问题，包括：订单进度查询、护航服务流程咨询、价格说明、账号绑定指引、支付问题排查等。复杂问题（如服务纠纷、特殊退款申请）建议转人工服务。"
          />
          <FaqAccordionItem 
            question="人工服务需要等待多久？"
            answer="普通问题响应时间约20分钟内，紧急问题（如订单临近、账号异常）响应时间约5分钟内。高峰期（如周末晚间）可能需要稍长时间，您可通过页面实时查看排队状态。"
          />
          <FaqAccordionItem 
            question="如何查询我的问题处理进度？"
            answer="发起人工服务后，系统会生成唯一服务编号，您可通过“刷新状态”按钮查看进度；也可在AI客服中发送“查询进度+服务编号”，获取实时处理情况。"
          />
          <FaqAccordionItem 
            question="AI客服的回复风格可以自定义吗？"
            answer="可以！您可在左侧AI配置区选择“专业严谨”“亲切易懂”“简洁高效”三种风格，也可开启“上下文记忆”功能，让AI记住历史对话内容，提升交互连贯性。"
          />
          <FaqAccordionItem 
            question="联系人工服务需要提供哪些信息？"
            answer="需提供用户名（系统自动填充）、有效联系方式（手机号/微信）、问题类型及详细描述。建议准确描述问题（如订单号、服务时间），帮助客服快速定位并解决问题。"
          />
        </div>
      </div>
    </section>

    <!-- 页脚（复用项目现有Footer） -->
    <Footer />

    <!-- 背景装饰（与项目风格统一） -->
    <div class="background-decoration">
      <div class="bg-blob blob-1"></div>
      <div class="bg-blob blob-2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
// 引入项目现有组件
import Header from '../layouts/Header.vue';
import Footer from '../layouts/Footer.vue';
import FaqAccordionItem from '../components/Common/FaqAccordionItem.vue'; // 修复：Common首字母大写

// 路由实例
const router = useRouter();

// —— 类型定义 ——
interface ChatMessage {
  sender: 'user' | 'ai';
  content: string;
  timestamp: number;
}

interface AIConfig {
  questionType: 'all' | 'order' | 'service' | 'account' | 'payment';
  replyStyle: 'professional' | 'friendly' | 'concise';
  contextMemory: boolean;
}

interface HumanForm {
  username: string;
  contact: string;
  problemType: '' | 'order' | 'escort' | 'account' | 'payment' | 'other';
  emergencyLevel: 'normal' | 'urgent';
  problemDesc: string;
}

// —— 状态管理 ——
// 用户信息
const currentUser = ref<{ username: string; avatar?: string } | undefined>(undefined);
const userAvatar = ref('https://picsum.photos/id/237/200/200'); // 默认头像

// 客服类型切换（ai/人工）
const currentService = ref<'ai' | 'human'>('ai');

// AI客服相关状态
const aiConfig = ref<AIConfig>({
  questionType: 'all',
  replyStyle: 'professional',
  contextMemory: true
});
const chatMessages = ref<ChatMessage[]>([]);
const userInput = ref('');
const isAiLoading = ref(false);
const chatHistory = ref<HTMLDivElement | null>(null);
// 快捷问题（贴合项目业务）
const quickQuestions = ref([
  '如何修改护航订单时间？',
  '护航服务如何退款？',
  '怎么查看我的订单进度？',
  '账号登录异常怎么办？',
  '人工服务怎么联系？'
]);

// 人工服务相关状态
const humanForm = ref<HumanForm>({
  username: '',
  contact: '',
  problemType: '',
  emergencyLevel: 'normal',
  problemDesc: ''
});
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const isWaiting = ref(false);
const queueCount = ref(0);
const waitTime = ref(0);
const serviceCode = ref(''); // 人工服务编号

// —— 计算属性 ——
// 根据AI配置生成回复前缀（模拟自定义风格）
const aiReplyPrefix = computed(() => {
  switch (aiConfig.value.replyStyle) {
    case 'friendly':
      return '您好！';
    case 'concise':
      return '答：';
    default: // professional
      return '尊敬的用户，您好！';
  }
});

// —— AI客服核心方法 ——
// 切换客服类型
const switchService = (type: 'ai' | 'human') => {
  currentService.value = type;
  // 切换到人工时，获取排队状态
  if (type === 'human') {
    getQueueStatus();
  }
};

// 更新AI配置（模拟生效）
const updateAIService = () => {
  // 实际项目中可通过API将配置发送给后端，此处仅做前端提示
  if (chatMessages.value.length > 0) { // 修复：chatMessages.length -> chatMessages.value.length
    addAIMessage(`已更新AI配置：问题分类=${aiConfig.value.questionType}，回复风格=${aiConfig.value.replyStyle}，上下文记忆=${aiConfig.value.contextMemory ? '开启' : '关闭'}，后续回复将按新配置生成`);
  }
};

// 重置AI配置
const resetAIConfig = () => {
  aiConfig.value = {
    questionType: 'all',
    replyStyle: 'professional',
    contextMemory: true
  };
  addAIMessage('已重置AI客服配置为默认状态（全部问题+专业严谨风格+开启上下文记忆）');
};

// 发送消息
const sendMessage = () => {
  if (!userInput.value.trim() || isAiLoading.value) return;
  
  // 添加用户消息
  const userMsg: ChatMessage = {
    sender: 'user',
    content: userInput.value.trim(),
    timestamp: Date.now()
  };
  chatMessages.value.push(userMsg);
  userInput.value = '';
  
  // 滚动到底部
  scrollToBottom();
  
  // AI加载中
  isAiLoading.value = true;
  
  // 模拟AI思考时间（1-2秒）
  setTimeout(() => {
    generateAIReply(userMsg.content);
    isAiLoading.value = false;
    scrollToBottom();
  }, Math.random() * 1000 + 1000);
};

// 发送快捷问题
const sendQuickQuestion = (question: string) => {
  userInput.value = question;
  sendMessage();
};

// 生成AI回复（模拟逻辑，实际项目对接AI接口）
const generateAIReply = (userContent: string) => {
  let reply = '';
  
  // 根据问题类型和内容生成回复（贴合项目业务）
  if (userContent.includes('订单') || userContent.includes('修改') || userContent.includes('取消')) {
    reply = `${aiReplyPrefix.value}您可通过“个人中心-我的订单”找到对应护航订单，点击“修改时间”或“申请取消”；若订单已临近（1小时内），建议转人工服务快速处理。`;
  } else if (userContent.includes('退款') || userContent.includes('退费')) {
    reply = `${aiReplyPrefix.value}未开始的护航服务可申请全额退款，已开始的服务按完成比例退款。您可在订单详情页点击“申请退款”，或告知订单号，我为您查询退款进度。`;
  } else if (userContent.includes('进度') || userContent.includes('查看')) {
    reply = `${aiReplyPrefix.value}您可通过“个人中心-我的订单”查看当前订单进度；若您能提供订单号，我可帮您实时查询最新状态。`;
  } else if (userContent.includes('账号') || userContent.includes('登录')) {
    reply = `${aiReplyPrefix.value}若出现登录异常，建议先清除浏览器缓存后重试；若提示“账号锁定”，可能是异地登录保护，可通过绑定手机号接收验证码解锁，或转人工协助处理。`;
  } else if (userContent.includes('人工') || userContent.includes('客服')) {
    reply = `${aiReplyPrefix.value}您可点击左侧“人工服务”切换至人工客服，填写联系方式和问题描述即可发起请求，紧急问题将优先处理。`;
  } else {
    reply = `${aiReplyPrefix.value}您的问题已收到，为了更准确地解答，建议您：1. 补充问题细节（如订单号、服务类型）；2. 选择左侧“问题分类”筛选；3. 若问题复杂，可转人工服务获取一对一帮助。`;
  }
  
  // 添加AI消息
  addAIMessage(reply);
};

// 添加AI消息
const addAIMessage = (content: string) => {
  const aiMsg: ChatMessage = {
    sender: 'ai',
    content,
    timestamp: Date.now()
  };
  chatMessages.value.push(aiMsg);
  scrollToBottom();
};

// 清空输入框
const clearInput = () => {
  userInput.value = '';
};

// 滚动到对话底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight;
    }
  });
};

// —— 人工服务核心方法 ——
// 获取排队状态（模拟）
const getQueueStatus = () => {
  isWaiting.value = true;
  // 模拟随机排队人数（1-10人）
  queueCount.value = Math.floor(Math.random() * 10) + 1;
  // 计算等待时间（普通1人=2分钟，紧急1人=0.5分钟）
  const emergencyLevel = humanForm.value.emergencyLevel || 'normal'; // 修复：添加默认值
  waitTime.value = Math.ceil(
    emergencyLevel === 'urgent' 
      ? queueCount.value * 0.5 
      : queueCount.value * 2
  );
};

// 提交人工服务请求
const submitHumanService = () => {
  isSubmitting.value = true;
  
  // 模拟提交（实际项目对接API）
  setTimeout(() => {
    isSubmitting.value = false;
    isSubmitted.value = true;
    // 生成随机服务编号（DELTA-SERVICE-YYYYMMDDXXXX）
    const date = new Date();
    const dateStr = date.getFullYear() + 
      String(date.getMonth() + 1).padStart(2, '0') + 
      String(date.getDate()).padStart(2, '0');
    const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    serviceCode.value = `DELTA-SERVICE-${dateStr}${randomStr}`;
    // 更新排队状态
    getQueueStatus();
  }, 1500);
};

// 重置人工表单
const resetHumanForm = () => {
  humanForm.value = {
    username: currentUser.value?.username || '', // 修复：currentUser -> currentUser.value
    contact: '',
    problemType: '',
    emergencyLevel: 'normal',
    problemDesc: ''
  };
};

// 检查服务状态（模拟刷新）
const checkServiceStatus = () => {
  // 模拟排队人数减少
  if (queueCount.value > 0) {
    queueCount.value = Math.max(0, queueCount.value - Math.floor(Math.random() * 3));
    const emergencyLevel = humanForm.value.emergencyLevel || 'normal'; // 修复：添加默认值
    waitTime.value = Math.ceil(
      emergencyLevel === 'urgent' 
        ? queueCount.value * 0.5 
        : queueCount.value * 2
    );
  }
  // 若排队人数为0，提示已接通
  if (queueCount.value === 0) {
    addHumanNotice('已接通人工客服，正在为您转接...');
  }
};

// 添加人工服务通知（模拟）
const addHumanNotice = (content: string) => {
  // 实际项目中可通过弹窗或消息提示
  alert(content);
};

// —— 通用方法 ——
// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
};

// 处理登出
const handleLogout = () => {
  localStorage.removeItem('delta_token');
  localStorage.removeItem('delta_user');
  sessionStorage.removeItem('delta_token');
  sessionStorage.removeItem('delta_user');
  router.push('/login');
};

// 页面加载初始化
onMounted(() => {
  // 获取用户信息
  const userStr = localStorage.getItem('delta_user') || sessionStorage.getItem('delta_user');
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
    userAvatar.value = currentUser.value?.avatar || userAvatar.value; // 修复：currentUser -> currentUser.value
    // 填充人工表单用户名
    humanForm.value.username = currentUser.value?.username || ''; // 修复：currentUser -> currentUser.value
  } else {
    // 未登录跳转至登录页
    router.push('/login');
  }
});
</script>

<style scoped>
/* 页面基础样式 */
.support-center-page {
  min-height: 100vh;
  background-color: #0f172a;
  color: #e2e8f0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 页面标题区 */
.page-header {
  padding: 2rem 0;
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
  text-align: center;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #f3f4f6;
}

.page-header p {
  font-size: 1.1rem;
  color: #94a3b8;
  max-width: 800px;
  margin: 0 auto;
}

/* 客服主体区 */
.support-main {
  padding: 3rem 0;
}

.support-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

/* 左侧侧边栏 */
.support-sidebar {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 客服类型切换 tabs */
.service-type-tabs {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tab-btn {
  padding: 1rem;
  background-color: #1e293b;
  border: 1px solid rgba(55, 65, 81, 0.5);
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tab-btn:hover {
  border-color: rgba(59, 130, 246, 0.5);
}

.tab-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.tab-btn i {
  font-size: 1.1rem;
}

/* AI配置区 */
.ai-config {
  background-color: #1e293b;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
}

.config-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #f3f4f6;
}

.config-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.config-group label {
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.config-select {
  padding: 0.75rem;
  background-color: #0f172a;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.config-select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-left: auto;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #4b5563;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #3b82f6;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.config-desc {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-left: 0.5rem;
}

.reset-ai-btn {
  padding: 0.75rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.reset-ai-btn:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

/* 人工服务说明区 */
.human-info {
  background-color: #1e293b;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
}

.info-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #f3f4f6;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #e2e8f0;
}

.info-item i {
  color: #3b82f6;
  font-size: 1.1rem;
  width: 1.5rem;
  text-align: center;
}

.queue-status {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #e2e8f0;
}

.queue-status i {
  color: #3b82f6;
}

/* 右侧交互区 */
.support-interactive {
  flex: 2;
  min-width: 350px;
}

/* AI聊天窗口 */
.ai-chat {
  background-color: #1e293b;
  border-radius: 0.75rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
  display: flex;
  flex-direction: column;
  height: 600px;
}

/* 聊天历史 */
.chat-history {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 消息样式 */
.message {
  display: flex;
  gap: 0.75rem;
  max-width: 80%;
}

.user-message {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-message .message-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.message-avatar i {
  color: #3b82f6;
  font-size: 1.25rem;
}

.message-content {
  background-color: #0f172a;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
}

.user-message .message-content {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.message-sender {
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #94a3b8;
}

.user-message .message-sender {
  color: rgba(255, 255, 255, 0.8);
}

.message-text {
  line-height: 1.5;
  margin-bottom: 0.25rem;
}

.message-time {
  font-size: 0.7rem;
  color: #94a3b8;
  text-align: right;
}

.user-message .message-time {
  color: rgba(255, 255, 255, 0.6);
}

/* 加载指示器 */
.loading-indicator {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.loading-indicator .dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: #3b82f6;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-indicator .dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-indicator .dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 聊天输入区 */
.chat-input {
  padding: 1rem;
  border-top: 1px solid rgba(55, 65, 81, 0.5);
  display: flex;
  gap: 0.75rem;
}

.chat-input textarea {
  flex: 1;
  padding: 0.75rem;
  background-color: #0f172a;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.5rem;
  color: #e2e8f0;
  resize: none;
  min-height: 4rem;
  font-family: inherit;
}

.chat-input textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.input-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.clear-btn, .send-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.clear-btn {
  background-color: rgba(107, 114, 128, 0.2);
  color: #94a3b8;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn:hover:not(:disabled) {
  background-color: rgba(107, 114, 128, 0.3);
  color: #d1d5db;
}

.send-btn {
  background-color: #3b82f6;
  color: white;
}

.send-btn:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.send-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

/* 快捷问题区 */
.quick-questions {
  padding: 0 1rem 1rem;
  border-top: 1px solid rgba(55, 65, 81, 0.3);
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

/* 人工服务状态 */
.human-status {
  text-align: center;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.status-icon.success {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.human-status h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f3f4f6;
  margin: 0;
}

.human-status p {
  color: #e2e8f0;
  margin: 0;
  font-size: 0.95rem;
}

.service-code,
.queue-count,
.wait-time,
.contact-way {
  color: #3b82f6;
  font-weight: 600;
}

.check-status-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.check-status-btn:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

/* 常见问题区 */
.support-faq {
  padding: 3rem 0 4rem;
  background-color: #1e293b;
}

.faq-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #f3f4f6;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.faq-accordion {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(128px);
  opacity: 0.1;
}

.blob-1 {
  top: 30rem;
  right: -20rem;
  width: 40rem;
  height: 40rem;
  background-color: #3b82f6;
}

.blob-2 {
  bottom: -15rem;
  left: -20rem;
  width: 40rem;
  height: 40rem;
  background-color: #8b5cf6;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .support-container {
    flex-direction: column;
  }
  
  .ai-chat,
  .human-form {
    height: 500px;
  }
  
  .message {
    max-width: 90%;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn {
    width: 100%;
  }
  
  .quick-questions {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.75rem;
  }
  
  .page-header p {
    font-size: 1rem;
  }
  
  .ai-chat,
  .human-form {
    height: 450px;
  }
  
  .chat-history {
    padding: 1rem;
  }
  
  .message-content {
    padding: 0.5rem 0.75rem;
  }
  
  .faq-title {
    font-size: 1.5rem;
  }
}


.quick-title {
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 500;
}

.quick-btn {
  padding: 0.5rem 0.75rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-btn:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

/* 人工服务表单 */
.human-form {
  background-color: #1e293b;
  border-radius: 0.75rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
  padding: 1.5rem;
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #f3f4f6;
}

.service-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.95rem;
  color: #e2e8f0;
  font-weight: 500;
}

.form-control {
  padding: 0.75rem;
  background-color: #0f172a;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.form-control:read-only {
  background-color: rgba(15, 23, 42, 0.7);
  cursor: not-allowed;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.submit-btn, .cancel-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.submit-btn {
  background-color: #3b82f6;
  color: white;
  flex: 1;
}

.submit-btn:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: rgba(107, 114, 128, 0.2);
  color: #94a3b8;
  width: 120px;
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn:hover:not(:disabled) {
  background-color: rgba(107, 114, 128, 0.3);
  color: #d1d5db;
}

/* 人工服务状态 */
.human-status {
  text-align: center;
  padding:2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.status-icon.success {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.human-status h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f3f4f6;
  margin: 0;
}

.human-status p {
  color: #e2e8f0;
  margin: 0;
  font-size: 0.95rem;
}

.service-code, .queue-count, .wait-time, .contact-way {color: #3b82f6;font-weight: 600;}
.check-status-btn {margin-top: 1rem;padding: 0.75rem 1.5rem;background-color: rgba(59, 130, 246, 0.1);color: #3b82f6;border: 1px solid rgba(59, 130, 246, 0.3);border-radius: 0.5rem;cursor: pointer;transition: all 0.3s ease;display: flex;align-items: center;gap: 0.5rem;}
.check-status-btn:hover {background-color: rgba(59, 130, 246, 0.2);}
/* 常见问题区 */.support-faq {padding: 3rem 0 4rem;background-color: #1e293b;}
.faq-title {font-size: 1.75rem;font-weight: 700;margin-bottom: 2rem;color: #f3f4f6;text-align: center;display: flex;align-items: center;justify-content: center;gap: 0.75rem;}
.faq-accordion {max-width: 800px;margin: 0 auto;display: flex;flex-direction: column;gap: 1rem;}
/* 背景装饰 */.background-decoration {position: absolute;inset: 0;pointer-events: none;overflow: hidden;z-index: 0;}
.bg-blob {position: absolute;border-radius: 50%;filter: blur(128px);opacity: 0.1;}
.blob-1 {top: 30rem;right: -20rem;width: 40rem;height: 40rem;background-color: #3b82f6;}
.blob-2 {bottom: -15rem;left: -20rem;width: 40rem;height: 40rem;background-color: #8b5cf6;}
/* 响应式调整 */@media (max-width: 768px) {.support-container {flex-direction: column;}
.ai-chat, .human-form {height: 500px;}
.message {max-width: 90%;}
.form-actions {flex-direction: column;}
.cancel-btn {width: 100%;}
.quick-questions {flex-direction: column;align-items: flex-start;}}
@media (max-width: 480px) {.page-header h1 {font-size: 1.75rem;}
.page-header p {font-size: 1rem;}
.ai-chat, .human-form {height: 450px;}
.chat-history {padding: 1rem;}
.message-content {padding: 0.5rem 0.75rem;}
.faq-title {font-size: 1.5rem;}}

</style>