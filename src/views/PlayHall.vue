<template>
  <div class="player-hall-page">
    <!-- 头部导航（复用项目现有Header） -->
    <Header 
      :current-user="currentUser" 
      :user-avatar="userAvatar"
      @logout="handleLogout"
    />

    <!-- 页面标题区 -->
    <section class="page-header">
      <div class="container">
        <div class="header-content">
          <h1>
            <i class="fa fa-users" style="color: #3b82f6;"></i> 
            三角洲行动·打手大厅
          </h1>
          <p>精选专业护航打手，根据段位、胜率、擅长领域精准匹配，安全高效完成您的需求</p>
        </div>
      </div>
    </section>

    <!-- 筛选与排序区 -->
    <section class="filter-sort-bar">
      <div class="container">
        <div class="filter-sort-container">
          <!-- 筛选区域 -->
          <div class="filter-group">
            <!-- 段位筛选 -->
            <div class="filter-item">
              <label>段位筛选</label>
              <select v-model="selectedRank" class="filter-select" @change="handleFilterChange">
                <option value="">全部段位</option>
                <option value="legend">传奇</option>
                <option value="master">大师</option>
                <option value="diamond">钻石</option>
                <option value="platinum">铂金</option>
              </select>
            </div>

            <!-- 擅长领域筛选 -->
            <div class="filter-item">
              <label>擅长领域</label>
              <select v-model="selectedSkill" class="filter-select" @change="handleFilterChange">
                <option value="">全部领域</option>
                <option value="tactical">战术指挥</option>
                <option value="snipe">精准狙击</option>
                <option value="assault">突击攻坚</option>
                <option value="equipment">装备获取</option>
                <option value="rank">段位冲刺</option>
              </select>
            </div>

            <!-- 价格范围筛选 -->
            <div class="filter-item">
              <label>价格范围</label>
              <select v-model="selectedPriceRange" class="filter-select" @change="handleFilterChange">
                <option value="">全部价格</option>
                <option value="0-100">¥0-¥100/小时</option>
                <option value="100-150">¥100-¥150/小时</option>
                <option value="150-200">¥150-¥200/小时</option>
                <option value="200+">¥200+/小时</option>
              </select>
            </div>
          </div>

          <!-- 排序区域 -->
          <div class="sort-group">
            <label>排序方式</label>
            <select v-model="sortType" class="sort-select" @change="handleSortChange">
              <option value="rating">评分优先</option>
              <option value="winRate">胜率优先</option>
              <option value="priceAsc">价格从低到高</option>
              <option value="priceDesc">价格从高到低</option>
              <option value="orders">完成订单多优先</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- 打手列表区 -->
    <section class="players-list">
      <div class="container">
        <!-- 筛选结果提示 -->
        <div class="result-tip">
          找到 <span class="highlight">{{ filteredPlayers.length }}</span> 位符合条件的专业打手
        </div>

        <!-- 打手卡片网格 -->
        <div class="players-grid">
          <!-- 打手卡片（复用组件） -->
            <PlayerProfileCard 
             v-for="player in filteredPlayers" 
                :key="player.id"
                :player="player"
                :is-compact="true" 
                @book-now="handleBookPlayer(player.id)"
                @view-detail="handleViewPlayerDetail(player.id)"
            />
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="filteredPlayers.length === 0">
          <i class="fa fa-search-minus" style="font-size: 3rem; color: #4b5563;"></i>
          <p>暂无符合条件的打手</p>
          <button class="reset-filter-btn" @click="resetFilters">重置筛选条件</button>
        </div>

        <!-- 分页控件 -->
        <div class="pagination" v-if="filteredPlayers.length > 0">
          <button 
            class="page-btn prev-btn" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <i class="fa fa-chevron-left"></i> 上一页
          </button>
          <div class="page-numbers">
            <span 
              class="page-number" 
              v-for="page in totalPages" 
              :key="page"
              :class="{ active: page === currentPage }"
              @click="currentPage = page"
            >
              {{ page }}
            </span>
          </div>
          <button 
            class="page-btn next-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            下一页 <i class="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- 页脚（复用项目现有Footer） -->
    <Footer />

    <!-- 背景装饰（保持与护航页面风格统一） -->
    <div class="background-decoration">
      <div class="bg-blob blob-1"></div>
      <div class="bg-blob blob-2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// 引入项目现有组件
import Header from '../layouts/Header.vue';
import Footer from '../layouts/Footer.vue';
// 引入打手卡片组件（下方会提供）
import PlayerProfileCard from '@/components/Players/PlayerProfileCard.vue';

// 路由实例
const router = useRouter();

// —— 类型定义 ——
interface Player {
  id: string;
  name: string; // 打手昵称
  avatar: string; // 头像地址
  rank: 'legend' | 'master' | 'diamond' | 'platinum'; // 段位
  rankText: string; // 段位中文显示
  rankColor: string; // 段位标签颜色
  skills: string[]; // 擅长领域（如["战术指挥", "精准狙击"]）
  winRate: number; // 胜率（%）
  completedOrders: number; // 完成订单数
  rating: number; // 客户评分（1-5）
  pricePerHour: number; // 每小时价格（元）
  intro: string; // 简短介绍
  tags: string[]; // 标签（如["全程直播", "胜率保障"]）
}

// —— 状态管理 ——
// 用户信息（从本地存储获取）
const currentUser = ref<{ username: string; avatar?: string } | null>(null);
const userAvatar = ref('https://picsum.photos/id/237/200/200'); // 默认头像

// 筛选条件
const selectedRank = ref(''); // 选中的段位
const selectedSkill = ref(''); // 选中的擅长领域
const selectedPriceRange = ref(''); // 选中的价格范围
const sortType = ref('rating'); // 排序方式

// 分页状态
const currentPage = ref(1);
const pageSize = ref(8); // 每页显示8个打手

// —— 模拟打手数据（实际项目对接API） ——
const allPlayers = ref<Player[]>([
  {
    id: 'p1',
    name: '三角洲-猎鹰',
    avatar: 'https://picsum.photos/id/1012/300/300',
    rank: 'legend',
    rankText: '传奇',
    rankColor: '#f59e0b',
    skills: ['战术指挥', '精准狙击', '段位冲刺'],
    winRate: 82,
    completedOrders: 1246,
    rating: 4.9,
    pricePerHour: 180,
    intro: '5年三角洲行动资深玩家，擅长团队指挥与高难度任务攻坚，全程直播操作',
    tags: ['全程直播', '胜率保障', '段位包过']
  },
  {
    id: 'p2',
    name: '夜袭者',
    avatar: 'https://picsum.photos/id/1025/300/300',
    rank: 'master',
    rankText: '大师',
    rankColor: '#8b5cf6',
    skills: ['突击攻坚', '装备获取', '快速推进'],
    winRate: 78,
    completedOrders: 987,
    rating: 4.8,
    pricePerHour: 150,
    intro: '专注装备代刷与突击任务，1小时可完成3个高价值物资点清缴',
    tags: ['装备速刷', '突击专精', '高效完成']
  },
  {
    id: 'p3',
    name: '战术大师-凯',
    avatar: 'https://picsum.photos/id/1074/300/300',
    rank: 'diamond',
    rankText: '钻石',
    rankColor: '#3b82f6',
    skills: ['战略规划', '特殊任务', '新手指导'],
    winRate: 75,
    completedOrders: 856,
    rating: 4.7,
    pricePerHour: 130,
    intro: '擅长为新手定制成长计划，边护航边教学，让你快速掌握游戏技巧',
    tags: ['新手友好', '战术教学', '耐心指导']
  },
  {
    id: 'p4',
    name: '狙神-零度',
    avatar: 'https://picsum.photos/id/1062/300/300',
    rank: 'legend',
    rankText: '传奇',
    rankColor: '#f59e0b',
    skills: ['精准狙击', '远程压制', '点位控制'],
    winRate: 85,
    completedOrders: 762,
    rating: 4.9,
    pricePerHour: 200,
    intro: '狙击命中率92%，擅长远程压制与关键点位控制，帮你轻松突破敌方防线',
    tags: ['狙击专精', '高命中率', '远程压制']
  },
  {
    id: 'p5',
    name: '突击手-狂狼',
    avatar: 'https://picsum.photos/id/1084/300/300',
    rank: 'master',
    rankText: '大师',
    rankColor: '#8b5cf6',
    skills: ['突击攻坚', '近战格斗', '快速清场'],
    winRate: 76,
    completedOrders: 632,
    rating: 4.6,
    pricePerHour: 140,
    intro: '近战格斗专家，1v3无压力，适合需要快速清场的密集战斗场景',
    tags: ['近战专精', '快速清场', '1v多能力']
  },
  {
    id: 'p6',
    name: '物资专家-小满',
    avatar: 'https://picsum.photos/id/1066/300/300',
    rank: 'diamond',
    rankText: '钻石',
    rankColor: '#3b82f6',
    skills: ['装备获取', '物资规划', '资源最大化'],
    winRate: 72,
    completedOrders: 589,
    rating: 4.5,
    pricePerHour: 120,
    intro: '熟悉所有地图物资点，帮你高效收集稀有装备，资源利用率提升50%',
    tags: ['物资专家', '装备规划', '资源最大化']
  },
  {
    id: 'p7',
    name: '新手导师-老K',
    avatar: 'https://picsum.photos/id/1005/300/300',
    rank: 'platinum',
    rankText: '铂金',
    rankColor: '#10b981',
    skills: ['新手指导', '基础教学', '低段位护航'],
    winRate: 68,
    completedOrders: 423,
    rating: 4.7,
    pricePerHour: 90,
    intro: '专注新手护航，从基础操作到战术思路全程讲解，让新手快速上手',
    tags: ['新手导师', '基础教学', '耐心讲解']
  },
  {
    id: 'p8',
    name: '任务达人-阿泽',
    avatar: 'https://picsum.photos/id/1027/300/300',
    rank: 'master',
    rankText: '大师',
    rankColor: '#8b5cf6',
    skills: ['特殊任务', '剧情通关', '隐藏彩蛋'],
    winRate: 74,
    completedOrders: 398,
    rating: 4.6,
    pricePerHour: 135,
    intro: '熟悉所有特殊任务剧情与隐藏彩蛋，帮你100%完成任务成就',
    tags: ['任务专精', '成就党友好', '隐藏彩蛋']
  },
  {
    id: 'p9',
    name: '速刷王-闪电',
    avatar: 'https://picsum.photos/id/1059/300/300',
    rank: 'diamond',
    rankText: '钻石',
    rankColor: '#3b82f6',
    skills: ['装备速刷', '等级提升', '快速任务'],
    winRate: 70,
    completedOrders: 612,
    rating: 4.4,
    pricePerHour: 110,
    intro: '追求极致效率，装备刷取速度比行业平均快30%，适合时间紧张的玩家',
    tags: ['极速刷取', '效率优先', '等级提升']
  },
  {
    id: 'p10',
    name: '团队指挥-老周',
    avatar: 'https://picsum.photos/id/1079/300/300',
    rank: 'legend',
    rankText: '传奇',
    rankColor: '#f59e0b',
    skills: ['团队指挥', '多排护航', '大型战役'],
    winRate: 80,
    completedOrders: 876,
    rating: 4.8,
    pricePerHour: 190,
    intro: '擅长4人团队指挥，可带领全队完成大型战役任务，团队胜率提升40%',
    tags: ['团队指挥', '多排护航', '大型战役']
  }
]);

// —— 计算属性：筛选+排序后的打手列表 ——
const filteredPlayers = computed<Player[]>(() => {
  let result = [...allPlayers.value];

  // 1. 段位筛选
  if (selectedRank.value) {
    result = result.filter(player => player.rank === selectedRank.value);
  }

  // 2. 擅长领域筛选（包含任一选中领域即可）
  if (selectedSkill.value) {
    // 映射筛选值到中文领域（如"tactical" → "战术指挥"）
    const skillMap: Record<string, string> = {
      'tactical': '战术指挥',
      'snipe': '精准狙击',
      'assault': '突击攻坚',
      'equipment': '装备获取',
      'rank': '段位冲刺'
    };
    const targetSkill = skillMap[selectedSkill.value];
    result = result.filter(player => player.skills.includes(targetSkill));
  }

  // 3. 价格范围筛选
  if (selectedPriceRange.value) {
    const [minPrice, maxPrice] = selectedPriceRange.value.split('-');
    result = result.filter(player => {
      if (maxPrice === '+') {
        return player.pricePerHour >= Number(minPrice);
      }
      return player.pricePerHour >= Number(minPrice) && player.pricePerHour <= Number(maxPrice);
    });
  }

  // 4. 排序
  switch (sortType.value) {
    case 'winRate':
      result.sort((a, b) => b.winRate - a.winRate); // 胜率从高到低
      break;
    case 'priceAsc':
      result.sort((a, b) => a.pricePerHour - b.pricePerHour); // 价格从低到高
      break;
    case 'priceDesc':
      result.sort((a, b) => b.pricePerHour - a.pricePerHour); // 价格从高到低
      break;
    case 'orders':
      result.sort((a, b) => b.completedOrders - a.completedOrders); // 完成订单多优先
      break;
    default:
      result.sort((a, b) => b.rating - a.rating); // 默认评分优先
  }

  // 5. 分页处理
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return result.slice(startIndex, endIndex);
});

// 总页数
const totalPages = computed(() => {
  const filteredTotal = allPlayers.value.filter(player => {
    // 复制筛选逻辑（计算总数量）
    const rankMatch = !selectedRank.value || player.rank === selectedRank.value;
    const skillMatch = !selectedSkill.value 
      ? true 
      : player.skills.includes(skillMap[selectedSkill.value]);
    const priceMatch = !selectedPriceRange.value 
      ? true 
      : (() => {
          const [min, max] = selectedPriceRange.value.split('-');
          return max === '+' 
            ? player.pricePerHour >= Number(min) 
            : player.pricePerHour >= Number(min) && player.pricePerHour <= Number(max);
        })();
    return rankMatch && skillMatch && priceMatch;
  }).length;
  return Math.ceil(filteredTotal / pageSize.value);
});

// —— 方法 ——
// 筛选条件变化（重置页码）
const handleFilterChange = () => {
  currentPage.value = 1;
};

// 排序方式变化（重置页码）
const handleSortChange = () => {
  currentPage.value = 1;
};

// 重置筛选条件
const resetFilters = () => {
  selectedRank.value = '';
  selectedSkill.value = '';
  selectedPriceRange.value = '';
  sortType.value = 'rating';
  currentPage.value = 1;
};

// 预约打手（跳转至下单页，携带打手ID）
const handleBookPlayer = (playerId: string) => {
  router.push({
    path: '/escort/order',
    query: { playerId } // 携带打手ID到下单页
  });
};

// 查看打手详情
const handleViewPlayerDetail = (playerId: string) => {
  router.push(`/player/detail/${playerId}`);
};

// 处理登出
const handleLogout = () => {
  localStorage.removeItem('delta_token');
  localStorage.removeItem('delta_user');
  sessionStorage.removeItem('delta_token');
  sessionStorage.removeItem('delta_user');
  router.push('/login');
};

// 页面加载时获取用户信息
onMounted(() => {
  const userStr = localStorage.getItem('delta_user') || sessionStorage.getItem('delta_user');
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
    userAvatar.value = currentUser.value.avatar || userAvatar.value;
  } else {
    // 未登录跳转至登录页
    router.push('/login');
  }
});
</script>

<style scoped>
/* 页面基础样式 */
.player-hall-page {
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
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #f3f4f6;
}

.header-content p {
  font-size: 1.1rem;
  color: #94a3b8;
  max-width: 800px;
}

/* 筛选与排序区 */
.filter-sort-bar {
  padding: 1.5rem 0;
  background-color: #1e293b;
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
}

.filter-sort-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 180px;
}

.filter-item label {
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 500;
}

.filter-select, .sort-select {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: #0f172a;
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #e2e8f0;
  font-size: 0.95rem;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-select:focus, .sort-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.sort-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sort-group label {
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 500;
}

/* 打手列表区 */
.players-list {
  padding: 3rem 0 4rem;
}

.result-tip {
  font-size: 1rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.highlight {
  color: #3b82f6;
  font-weight: 600;
  font-size: 1.1rem;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: #1e293b;
  border-radius: 1rem;
  border: 1px dashed rgba(55, 65, 81, 0.5);
}

.empty-state p {
  color: #94a3b8;
  margin: 1rem 0 1.5rem;
  font-size: 1.1rem;
}

.reset-filter-btn {
  padding: 0.75rem 1.5rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-filter-btn:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

/* 分页控件 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  background-color: #1e293b;
  color: #e2e8f0;
  border: 1px solid rgba(55, 65, 81, 0.5);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number.active {
  background-color: #3b82f6;
  color: white;
}

.page-number:hover:not(.active) {
  background-color: #1e293b;
}

/* 背景装饰（与护航页面统一） */
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
  top: 20rem;
  right: -20rem;
  width: 40rem;
  height: 40rem;
  background-color: #3b82f6;
}

.blob-2 {
  bottom: -10rem;
  left: -20rem;
  width: 40rem;
  height: 40rem;
  background-color: #8b5cf6;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .filter-sort-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-group {
    width: 100%;
  }

  .filter-item {
    width: 100%;
    min-width: auto;
  }

  .sort-group {
    width: 100%;
  }

  .players-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    gap: 0.5rem;
  }

  .page-btn {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}
</style>