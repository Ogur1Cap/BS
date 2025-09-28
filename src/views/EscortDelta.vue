<template>
  <div class="delta-escort-page">
    <!-- 导航栏 -->
    <Header 
      :current-user="currentUser" 
      :user-avatar="userAvatar"
      @logout="handleLogout"
    />

    <!-- 主视觉区域 -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <div class="hero-text">
          <div class="game-badge">三角洲行动</div>
          <h1>专业护航服务</h1>
          <p>由精英战术小队提供支援，突破防线，攻克难关，提升段位</p>
          <div class="cta-buttons">
            <button class="btn primary" @click="scrollToServices">
              查看服务 <i class="fa fa-arrow-right ml-2"></i>
            </button>
            <button class="btn secondary" @click="scrollToPlayers">
              选择打手
            </button>
          </div>
        </div>
        <div class="hero-image">
          <img src="/src/image/fengmian.png" alt="三角洲行动护航场景" class="main-visual">
        </div>
      </div>
      <div class="hero-wave"></div>
    </section>

    <!-- 服务统计 -->
    <section class="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ stats.completedOrders }}</div>
            <div class="stat-label">成功护航订单</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.proPlayers }}</div>
            <div class="stat-label">专业护航打手</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.satisfactionRate }}%</div>
            <div class="stat-label">客户满意度</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.avgCompletionTime }}</div>
            <div class="stat-label">平均完成时间</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 服务类型 -->
    <section class="services" ref="servicesSection">
      <div class="container">
        <div class="section-header">
          <h2>护航服务类型</h2>
          <p>根据您的需求选择合适的护航方案，我们提供全方位支援</p>
        </div>
        
        <div class="services-grid">
          <ServicePackageCard 
            icon="fa-shield"
            title="全程战术护航"
            description="专业打手全程陪同，提供战术支援，确保任务顺利完成"
            price="298"
            duration="3小时"
            popular
            features="实时语音指挥|战术规划指导|全程保驾护航|高难度任务优先"
            @select="selectService('fullEscort')"
          />
          
          <ServicePackageCard 
            icon="fa-trophy"
            title="段位冲刺"
            description="针对性提升战术水平，高效安全提升段位等级"
            price="368"
            duration="至目标段位"
            features="胜率保障|段位提升规划|战术技巧传授|专属陪练"
            @select="selectService('rankBoost')"
          />
          
          <ServicePackageCard 
            icon="fa-box"
            title="装备物资获取"
            description="专业刷取稀有装备、武器和关键物资，节省宝贵时间"
            price="158"
            duration="按件计费"
            features="稀有装备保障|高效刷取|安全操作|按需定制"
            @select="selectService('equipment')"
          />
          
          <ServicePackageCard 
            icon="fa-flag-checkered"
            title="特殊任务攻坚"
            description="针对高难度特殊任务提供专业攻坚支援"
            price="198"
            duration="单任务"
            features="任务攻略|高效完成|奖励最大化|失败包补"
            @select="selectService('specialMission')"
          />
        </div>
      </div>
    </section>

    <!-- 护航流程 -->
    <section class="process">
      <div class="container">
        <div class="section-header">
          <h2>护航服务流程</h2>
          <p>简单五步，即可享受专业护航服务</p>
        </div>
        
        <div class="process-timeline">
          <div class="timeline-track"></div>
          
          <div class="timeline-step step-1">
            <div class="step-icon">1</div>
            <div class="step-content">
              <h3>选择服务类型</h3>
              <p>根据您的需求选择合适的护航服务套餐</p>
            </div>
          </div>
          
          <div class="timeline-step step-2">
            <div class="step-icon">2</div>
            <div class="step-content">
              <h3>填写需求信息</h3>
              <p>提供游戏账号信息和具体需求细节</p>
            </div>
          </div>
          
          <div class="timeline-step step-3">
            <div class="step-icon">3</div>
            <div class="step-content">
              <h3>匹配专业打手</h3>
              <p>系统根据您的需求匹配最合适的专业护航人员</p>
            </div>
          </div>
          
          <div class="timeline-step step-4">
            <div class="step-icon">4</div>
            <div class="step-content">
              <h3>开始护航服务</h3>
              <p>按照约定时间，打手开始提供专业护航服务</p>
            </div>
          </div>
          
          <div class="timeline-step step-5">
            <div class="step-icon">5</div>
            <div class="step-content">
              <h3>完成验收评价</h3>
              <p>服务完成后确认验收，并对服务进行评价</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 精英打手 -->
    <section class="top-players" ref="playersSection">
      <div class="container">
        <div class="section-header">
          <h2>精英护航打手</h2>
          <p>通过严格筛选的专业玩家，为您提供顶级护航服务</p>
        </div>
        
        <div class="players-grid">
          <PlayerProfileCard 
            v-for="player in topPlayers" 
            :key="player.id"
            :player="player"
            @book="bookPlayer(player.id)"
          />
        </div>
        
        <div class="view-all-players">
          <router-link to="/players" class="link">查看全部打手 <i class="fa fa-chevron-right ml-1"></i></router-link>
        </div>
      </div>
    </section>

    <!-- 用户评价 -->
    <section class="testimonials">
      <div class="container">
        <div class="section-header">
          <h2>客户评价</h2>
          <p>看看其他玩家对我们护航服务的真实评价</p>
        </div>
        
        <div class="testimonials-slider">
          <TestimonialCard 
            v-for="testimonial in testimonials" 
            :key="testimonial.id"
            :testimonial="testimonial"
          />
        </div>
      </div>
    </section>

    <!-- 立即下单 -->
    <section class="order-section">
      <div class="container">
        <div class="order-card">
          <div class="order-header">
            <h2>立即预约护航服务</h2>
            <p v-if="selectedService" class="selected-service">
              已选服务: {{ getServiceName(selectedService) }}
            </p>
          </div>
          
          <form class="order-form" @submit.prevent="submitOrder">
            <div class="form-grid">
              <div class="form-group">
                <label for="serviceType">服务类型 *</label>
                <select 
                  id="serviceType" 
                  v-model="formData.serviceType" 
                  class="form-control"
                  required
                >
                  <option value="">请选择服务类型</option>
                  <option value="fullEscort">全程战术护航</option>
                  <option value="rankBoost">段位冲刺</option>
                  <option value="equipment">装备物资获取</option>
                  <option value="specialMission">特殊任务攻坚</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="gameAccount">游戏账号 *</label>
                <input 
                  type="text" 
                  id="gameAccount" 
                  v-model="formData.gameAccount" 
                  class="form-control"
                  placeholder="请输入您的游戏账号"
                  required
                >
              </div>
              
              <div class="form-group">
                <label for="playerId">指定打手 (可选)</label>
                <select 
                  id="playerId" 
                  v-model="formData.playerId" 
                  class="form-control"
                >
                  <option value="">不指定打手</option>
                  <option v-for="player in topPlayers" :value="player.id" :key="player.id">
                    {{ player.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="startTime">期望开始时间 *</label>
                <input 
                  type="datetime-local" 
                  id="startTime" 
                  v-model="formData.startTime" 
                  class="form-control"
                  required
                >
              </div>
              
              <div class="form-group full-width">
                <label for="requirements">具体需求说明</label>
                <textarea 
                  id="requirements" 
                  v-model="formData.requirements" 
                  class="form-control"
                  rows="4"
                  placeholder="请详细描述您的具体需求，如目标段位、需要获取的装备、特殊任务要求等"
                ></textarea>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn submit-btn">
                确认提交 <i class="fa fa-check ml-2"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- 常见问题 -->
    <section class="faq">
      <div class="container">
        <div class="section-header">
          <h2>常见问题</h2>
          <p>关于三角洲行动护航服务的常见疑问解答</p>
        </div>
        
        <div class="faq-accordion">
          <FaqAccordionItem 
            question="护航服务是否会导致账号被封禁？"
            answer="我们承诺所有护航服务均由专业玩家手动操作，严格遵守游戏规则，不使用任何作弊软件或脚本，确保账号安全。至今已完成超过10000+订单，保持零封号记录。"
          />
          
          <FaqAccordionItem 
            question="如何保证我的账号信息安全？"
            answer="我们采取严格的信息保密措施，所有打手均签署保密协议。您可以选择仅提供必要的游戏登录信息，服务完成后建议及时修改密码。我们的系统也会对所有账号信息进行加密处理。"
          />
          
          <FaqAccordionItem 
            question="如果服务未达到预期效果怎么办？"
            answer="我们承诺达到约定的服务目标，如未达成，将根据实际完成情况提供部分或全额退款。段位提升服务提供胜率保障，装备获取服务保证指定物品到手。"
          />
          
          <FaqAccordionItem 
            question="可以要求打手使用特定战术或打法吗？"
            answer="当然可以。在下单时，您可以在需求说明中详细描述您希望的战术风格、打法要求等，我们的打手会尽量满足您的个性化需求。"
          />
          
          <FaqAccordionItem 
            question="服务过程中我可以观看实时操作吗？"
            answer="是的，我们提供全程直播服务选项，您可以实时观看打手操作，学习战术技巧。部分高端服务套餐已包含直播功能，基础套餐可额外付费添加。"
          />
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Header from '../layouts/Header.vue';
import Footer from '../layouts/Footer.vue';
import ServicePackageCard from '@/components/Escort/ServicePackageCard.vue';
import PlayerProfileCard from '@/components/Players/PlayerProfileCard.vue';
import TestimonialCard from '@/components/Common/TestimonialCard.vue';
import FaqAccordionItem from '@/components/Common/FaqAccordionItem.vue';

// 路由实例
const router = useRouter();

// DOM引用
const servicesSection = ref<HTMLElement | null>(null);
const playersSection = ref<HTMLElement | null>(null);

// 用户信息
const currentUser = ref<{ username: string } | undefined>(undefined);
const userAvatar = ref('https://picsum.photos/id/1005/200/200');

// 服务选择状态
const selectedService = ref<string | null>(null);

// 表单数据
const formData = ref({
  serviceType: '',
  gameAccount: '',
  playerId: '',
  startTime: '',
  requirements: ''
});

// 服务统计数据
const stats = ref({
  completedOrders: '12,500+',
  proPlayers: 86,
  satisfactionRate: 98,
  avgCompletionTime: '2.5小时'
});

// 顶级打手数据
const topPlayers = ref([
  {
    id: 'p1',
    name: '三角洲-猎鹰',
    avatar: 'https://picsum.photos/id/1012/300/300',
    level: 99,
    rank: '传奇',
    specialty: ['战术指挥', '精准狙击', '团队协作'],
    winRate: 82,
    completedOrders: 1246,
    rating: 4.9,
    price: 180
  },
  {
    id: 'p2',
    name: '夜袭者',
    avatar: 'https://picsum.photos/id/1025/300/300',
    level: 97,
    rank: '大师',
    specialty: ['突击攻坚', '装备获取', '快速推进'],
    winRate: 78,
    completedOrders: 987,
    rating: 4.8,
    price: 150
  },
  {
    id: 'p3',
    name: '战术大师-凯',
    avatar: 'https://picsum.photos/id/1074/300/300',
    level: 95,
    rank: '钻石',
    specialty: ['战略规划', '特殊任务', '段位冲刺'],
    winRate: 75,
    completedOrders: 856,
    rating: 4.7,
    price: 130
  }
]);

// 用户评价数据
const testimonials = ref([
  {
    id: 't1',
    username: '战场雄鹰',
    avatar: 'https://picsum.photos/id/1027/100/100',
    rating: 5,
    content: '猎鹰的护航服务太棒了！不仅帮我顺利完成了几个卡在很久的特殊任务，还教了我很多实用的战术技巧，现在自己也能轻松应对了。',
    service: '特殊任务攻坚'
  },
  {
    id: 't2',
    username: '三角洲新兵',
    avatar: 'https://picsum.photos/id/1066/100/100',
    rating: 5,
    content: '作为新手，一直苦于无法提升段位。夜袭者带我打了两天，不仅段位提升了两个等级，还学到了很多走位和射击技巧，非常值得！',
    service: '段位冲刺'
  },
  {
    id: 't3',
    username: '装备收藏家',
    avatar: 'https://picsum.photos/id/1074/100/100',
    rating: 4,
    content: '凯帮我刷到了梦寐以求的稀有装备，效率很高，全程直播操作，非常透明。唯一遗憾是比预计时间多花了1小时，但总体很满意。',
    service: '装备物资获取'
  }
]);

// 获取服务名称
const getServiceName = (serviceKey: string) => {
  const serviceMap: Record<string, string> = {
    'fullEscort': '全程战术护航',
    'rankBoost': '段位冲刺',
    'equipment': '装备物资获取',
    'specialMission': '特殊任务攻坚'
  };
  return serviceMap[serviceKey] || '';
};

// 选择服务
const selectService = (serviceType: string) => {
  selectedService.value = serviceType;
  formData.value.serviceType = serviceType;
  
  // 滚动到下单区域
  const orderSection = document.querySelector('.order-section');
  orderSection?.scrollIntoView({ behavior: 'smooth' });
};

// 预约打手
const bookPlayer = (playerId: string) => {
  formData.value.playerId = playerId;
  
  // 滚动到下单区域
  const orderSection = document.querySelector('.order-section');
  orderSection?.scrollIntoView({ behavior: 'smooth' });
};

// 滚动到服务区域
const scrollToServices = () => {
  servicesSection.value?.scrollIntoView({ behavior: 'smooth' });
};

// 滚动到打手区域
const scrollToPlayers = () => {
  playersSection.value?.scrollIntoView({ behavior: 'smooth' });
};

// 提交订单
const submitOrder = () => {
  // 实际项目中这里会调用API提交订单
  console.log('提交订单:', formData.value);
  alert('订单提交成功！我们将尽快为您安排专业打手提供护航服务。');
  router.push('/orders');
};

// 处理登出
const handleLogout = () => {
  localStorage.removeItem('delta_token');
  localStorage.removeItem('delta_user');
  sessionStorage.removeItem('delta_token');
  sessionStorage.removeItem('delta_user');
  router.push('/login');
};

// 页面加载
onMounted(() => {
  // 获取用户信息
  const userStr = localStorage.getItem('delta_user') || sessionStorage.getItem('delta_user');
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
  } else {
    router.push('/login');
  }
  
  // 设置默认时间为当前时间加1小时
  const defaultTime = new Date();
  defaultTime.setHours(defaultTime.getHours() + 1);
  formData.value.startTime = defaultTime.toISOString().slice(0, 16);
});
</script>

<style scoped>
.delta-escort-page {
  min-height: 100vh;
  background-color: #0f172a;
  color: #e2e8f0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.section-header p {
  color: #94a3b8;
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
}

.btn.primary {
  background-color: #3b82f6;
  color: white;
}

.btn.primary:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
}

.btn.secondary {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn.secondary:hover {
  background-color: rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

/* 英雄区域 */
.hero {
  position: relative;
  padding: 6rem 0;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.7) 100%), 
              url('/images/delta-bg.jpg') center/cover no-repeat;
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 3rem;
}

.hero-text {
  flex: 1;
  min-width: 300px;
}

.game-badge {
  display: inline-block;
  padding: 0.25rem 1rem;
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.hero-text h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: white;
  line-height: 1.2;
}

.hero-text p {
  font-size: 1.25rem;
  color: #94a3b8;
  margin-bottom: 2rem;
  max-width: 600px;
}

.cta-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.hero-image {
  flex: 1;
  min-width: 300px;
}

.main-visual {
  width: 100%;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  transition: transform 0.5s ease;
}

.main-visual:hover {
  transform: scale(1.02);
}

.hero-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
}

.hero-wave svg {
  position: relative;
  display: block;
  width: calc(100% + 1.3px);
  height: 60px;
}

.hero-wave .shape-fill {
  fill: #0f172a;
}

/* 统计区域 */
.stats {
  padding: 4rem 0;
  background-color: #1e293b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background-color: rgba(15, 23, 42, 0.5);
  border-radius: 1rem;
  border: 1px solid rgba(59, 130, 246, 0.1);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  border-color: rgba(59, 130, 246, 0.3);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #94a3b8;
  font-size: 1rem;
}

/* 服务类型区域 */
.services {
  padding: 6rem 0;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

/* 流程区域 */
.process {
  padding: 6rem 0;
  background-color: #1e293b;
  position: relative;
  overflow: hidden;
}

.process::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/images/grid-pattern.png') repeat;
  opacity: 0.05;
  z-index: 1;
}

.process-timeline {
  position: relative;
  z-index: 2;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;
}

.timeline-track {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transform: translateY(-50%);
  z-index: 1;
}

.timeline-step {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  float: left;
  width: 20%;
  padding: 0 1rem;
}

.step-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: #0f172a;
  border: 3px solid #3b82f6;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  z-index: 2;
  background-clip: padding-box;
}

.step-content {
  text-align: center;
}

.step-content h3 {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white;
}

.step-content p {
  color: #94a3b8;
  font-size: 0.875rem;
}

/* 精英打手区域 */
.top-players {
  padding: 6rem 0;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.view-all-players {
  text-align: center;
  margin-top: 2rem;
}

.link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.link:hover {
  color: #60a5fa;
}

/* 用户评价区域 */
.testimonials {
  padding: 6rem 0;
  background-color: #1e293b;
}

.testimonials-slider {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

/* 下单区域 */
.order-section {
  padding: 6rem 0;
}

.order-card {
  background-color: #1e293b;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.order-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.order-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
}

.selected-service {
  color: #3b82f6;
  font-style: italic;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #e2e8f0;
}

.form-control {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: #0f172a;
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #e2e8f0;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.form-actions {
  margin-top: 2rem;
  text-align: right;
}

.submit-btn {
  background-color: #3b82f6;
  color: white;
  padding: 0.875rem 2rem;
}

.submit-btn:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
}

/* 常见问题区域 */
.faq {
  padding: 6rem 0;
  background-color: #1e293b;
}

.faq-accordion {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .hero-text h1 {
    font-size: 2.5rem;
  }
  
  .timeline-step {
    width: 50%;
    margin-bottom: 2rem;
  }
  
  .timeline-step:nth-child(odd) {
    clear: both;
  }
  
  .timeline-track {
    width: 4px;
    height: 100%;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 4rem 0;
  }
  
  .hero-text h1 {
    font-size: 2rem;
  }
  
  .section-header h2 {
    font-size: 1.75rem;
  }
  
  .process-timeline {
    padding: 1rem 0;
  }
  
  .timeline-step {
    width: 100%;
    float: none;
    margin-bottom: 2rem;
  }
  
  .timeline-track {
    left: 2rem;
  }
  
  .form-group.full-width {
    grid-column: 1;
  }
}

@media (max-width: 576px) {
  .hero-text h1 {
    font-size: 1.75rem;
  }
  
  .hero-text p {
    font-size: 1rem;
  }
  
  .cta-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
