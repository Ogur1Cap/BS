<template>
  <div class="bs-map-page">
    <header class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <i class="fa fa-crosshairs"></i>
            <span>三角洲行动 - 地图库</span>
          </div>
          <nav class="main-nav">
            <a href="/" class="nav-link">首页</a>
            <a href="/map" class="nav-link active">地图导航</a>
            <a href="/strategy" class="nav-link">攻略合集</a>
            <a href="/community" class="nav-link">玩家社区</a>
          </nav>
          <div class="user-info">
            <img :src="userAvatar" alt="用户头像" class="user-avatar" @click="toggleUserMenu">
            <div class="user-menu" v-if="showUserMenu">
              <a href="/profile">个人中心</a>
              <a href="/collection">我的收藏</a>
              <a href="#" @click="handleLogout">退出登录</a>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主视觉Banner -->
    <section class="map-banner">
      <div class="banner-overlay">
        <div class="container">
          <h1>战场地图全解析</h1>
          <p>精准标记资源点、战术点位，助力战术规划</p>
          <div class="banner-actions">
            <button class="btn-primary" @click="scrollToMapList">浏览地图</button>
            <button class="btn-secondary" @click="goToStrategy">查看攻略</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 地图筛选与列表区 -->
    <section class="map-list-section" ref="mapListRef">
      <div class="container">
        <!-- 筛选栏 -->
        <div class="map-filter">
          <h2>选择地图类型</h2>
          <div class="filter-tabs">
            <button class="filter-tab" :class="{ active: activeMapType === 'all' }" @click="activeMapType = 'all'">全部地图</button>
            <button class="filter-tab" :class="{ active: activeMapType === 'city' }" @click="activeMapType = 'city'">城市战区</button>
            <button class="filter-tab" :class="{ active: activeMapType === 'wild' }" @click="activeMapType = 'wild'">野外战场</button>
            <button class="filter-tab" :class="{ active: activeMapType === 'special' }" @click="activeMapType = 'special'">特殊模式</button>
          </div>
        </div>

        <!-- 地图卡片网格 -->
        <div class="map-card-grid">
          <div class="map-card" v-for="map in filteredMaps" :key="map.id" @click="openMapDetail(map.id)">
            <div class="card-thumb">
              <img :src="map.coverUrl" :alt="map.name">
              <div class="card-tag" v-if="map.isHot">热门</div>
              <div class="card-tag new" v-if="map.isNew">新地图</div>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ map.name }}</h3>
              <div class="card-meta">
                <span><i class="fa fa-map-marker"></i> {{ map.pointCount }}个战术点</span>
                <span><i class="fa fa-star"></i> {{ map.collectCount }}人收藏</span>
              </div>
              <p class="card-desc">{{ map.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 地图详情弹窗（核心交互） -->
    <div class="map-detail-modal" v-if="showMapModal">
      <div class="modal-mask" @click="closeMapModal"></div>
      <div class="modal-box">
        <!-- 弹窗头部 -->
        <div class="modal-header">
          <h2>{{ currentMap.name }}</h2>
          <div class="modal-tools">
            <button class="tool-btn" @click="toggleFullScreen" :title="isFullScreen ? '退出全屏' : '全屏查看'">
              <i class="fa" :class="isFullScreen ? 'fa-compress' : 'fa-expand'"></i>
            </button>
            <button class="tool-btn" @click="toggleCollectMap" :title="isCollected ? '取消收藏' : '收藏地图'">
              <i class="fa" :class="isCollected ? 'fa-star' : 'fa-star-o'"></i>
            </button>
            <button class="tool-btn close-btn" @click="closeMapModal" title="关闭">
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>

        <!-- 弹窗主体 -->
        <div class="modal-body">
          <!-- 地图控制栏 -->
          <div class="map-control">
            <div class="control-group left">
              <button class="control-btn" :class="{ active: mapMode === 'view' }" @click="mapMode = 'view'">
                <i class="fa fa-eye"></i> 查看模式
              </button>
              <button class="control-btn" :class="{ active: mapMode === 'mark' }" @click="mapMode = 'mark'">
                <i class="fa fa-flag"></i> 标记模式
              </button>
              <button class="control-btn" @click="clearUserMarks" :disabled="userMarks.length === 0">
                <i class="fa fa-trash"></i> 清除标记
              </button>
            </div>
            <div class="control-group right">
              <span class="zoom-label">缩放：{{ Math.round(zoomLevel * 100) }}%</span>
              <button class="zoom-btn" @click="adjustZoom(-0.1)" :disabled="zoomLevel <= 0.5">
                <i class="fa fa-search-minus"></i>
              </button>
              <button class="zoom-btn" @click="adjustZoom(0.1)" :disabled="zoomLevel >= 2">
                <i class="fa fa-search-plus"></i>
              </button>
            </div>
          </div>

          <!-- 地图展示区 -->
          <div class="map-display">
            <div 
              class="map-wrapper"
              @click="handleMapClick"
              :style="{ transform: `scale(${zoomLevel})`, transformOrigin: 'center', transition: 'transform 0.3s ease' }"
            >
              <img :src="currentMap.mapUrl" :alt="currentMap.name" class="map-img">

              <!-- 系统战术点标记 -->
              <div 
                class="system-marker"
                v-for="(point, idx) in currentMap.tacticalPoints"
                :key="idx"
                :style="{ left: `${point.x}%`, top: `${point.y}%` }"
                @click.stop="showPointDetail(point, idx)"
              >
                <div class="marker-dot" :style="{ backgroundColor: point.color }"></div>
                <div class="marker-tooltip" v-if="point.showTooltip">
                  <h4>{{ point.name }}</h4>
                  <p>{{ point.desc }}</p>
                  <div class="tooltip-tags">
                    <span v-for="tag in point.tags" :key="tag">{{ tag }}</span>
                  </div>
                </div>
              </div>

              <!-- 用户自定义标记 -->
              <div 
                class="user-marker"
                v-for="(mark, idx) in userMarks"
                :key="idx"
                :style="{ left: `${mark.x}%`, top: `${mark.y}%` }"
                @click.stop="showUserMarkDetail(mark, idx)"
              >
                <i class="fa fa-map-pin"></i>
                <div class="marker-tooltip" v-if="mark.showTooltip">
                  <h4>{{ mark.title }}</h4>
                  <p>{{ mark.desc || '无描述' }}</p>
                  <button class="delete-mark-btn" @click.stop="deleteUserMark(idx)">
                    <i class="fa fa-trash"></i> 删除
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 图例说明 -->
          <div class="map-legend">
            <h3>战术点图例</h3>
            <div class="legend-list">
              <div class="legend-item" v-for="type in tacticalTypes" :key="type.id">
                <div class="legend-color" :style="{ backgroundColor: type.color }"></div>
                <span>{{ type.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义标记输入弹窗 -->
    <div class="mark-input-modal" v-if="showMarkInputModal">
      <div class="modal-mask" @click="closeMarkInputModal"></div>
      <div class="modal-box small">
        <div class="modal-header">
          <h2>添加战术标记</h2>
          <button class="tool-btn close-btn" @click="closeMarkInputModal">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>标记名称 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="markForm.title" 
              class="form-control"
              placeholder="例如：伏击点、物资箱、狙击位"
            >
          </div>
          <div class="form-group">
            <label>标记描述</label>
            <textarea 
              v-model="markForm.desc" 
              class="form-control"
              rows="3"
              placeholder="输入标记详情（可选）"
            ></textarea>
          </div>
          <div class="form-group">
            <label>标记类型</label>
            <select v-model="markForm.type" class="form-control">
              <option value="ambush">伏击点</option>
              <option value="resource">资源点</option>
              <option value="snipe">狙击位</option>
              <option value="safe">安全区</option>
              <option value="danger">危险区</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeMarkInputModal">取消</button>
          <button class="btn-primary" @click="saveUserMark">确定添加</button>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="page-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <i class="fa fa-crosshairs"></i>
            <span>三角洲行动地图库</span>
          </div>
          <div class="footer-links">
            <a href="/about">关于我们</a>
            <a href="/terms">用户协议</a>
            <a href="/privacy">隐私政策</a>
            <a href="/feedback">反馈建议</a>
          </div>
          <div class="copyright">
            © 2025 三角洲行动地图库 版权所有 | 基于项目 BS 开发
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// ===== 基础状态 =====
const userAvatar = ref('https://picsum.photos/id/237/100/100'); // 项目用户头像默认值
const showUserMenu = ref(false);
const mapListRef = ref<HTMLDivElement | null>(null);

// ===== 地图核心数据（贴合项目：仅保留三角洲行动相关地图） =====
// 战术点类型定义
const tacticalTypes = ref([
  { id: 'high-resource', name: '高级资源区', color: '#e53e3e' },
  { id: 'mid-resource', name: '中级资源区', color: '#ed8936' },
  { id: 'ambush', name: '伏击点', color: '#9f7aea' },
  { id: 'snipe', name: '狙击位', color: '#3182ce' },
  { id: 'safe', name: '安全区', color: '#48bb78' },
  { id: 'danger', name: '危险区', color: '#f56565' },
  { id: 'task', name: '任务目标点', color: '#4299e1' }
]);

// 地图数据（纯三角洲行动相关）
const maps = reactive([
  {
    id: 'city-01',
    name: '都市核心区',
    type: 'city', // 城市战区
    coverUrl: 'https://picsum.photos/id/1031/600/400',
    mapUrl: 'https://picsum.photos/id/1031/1200/800',
    desc: '繁华都市改造的战场，高楼林立，巷战频发',
    pointCount: 32,
    collectCount: 25689,
    isHot: true,
    isNew: false,
    tacticalPoints: [
      { x: 28, y: 35, name: '中央广场', desc: '高级资源集中区，易守难攻', tags: ['高级资源', '热门'], color: '#e53e3e', showTooltip: false },
      { x: 65, y: 42, name: '金融中心', desc: '高楼密集，适合狙击和伏击', tags: ['狙击位', '伏击点'], color: '#3182ce', showTooltip: false },
      { x: 42, y: 68, name: '地下停车场', desc: '中级资源区，地形复杂', tags: ['中级资源', '防守'], color: '#ed8936', showTooltip: false },
      { x: 78, y: 25, name: '电视台', desc: '任务目标点，信号覆盖区', tags: ['任务目标', '战略'], color: '#4299e1', showTooltip: false },
      { x: 55, y: 82, name: '郊区安全屋', desc: '初期发育点，物资充足', tags: ['安全区', '初期'], color: '#48bb78', showTooltip: false }
    ]
  },
  {
    id: 'city-02',
    name: '港口工业区',
    type: 'city',
    coverUrl: 'https://picsum.photos/id/1047/600/400',
    mapUrl: 'https://picsum.photos/id/1047/1200/800',
    desc: '港口与工业区结合的战场，集装箱与厂房交织',
    pointCount: 28,
    collectCount: 18956,
    isHot: false,
    isNew: false,
    tacticalPoints: [
      { x: 35, y: 40, name: '集装箱码头', desc: '中级资源区，掩体丰富', tags: ['中级资源', '巷战'], color: '#ed8936', showTooltip: false },
      { x: 62, y: 32, name: '工厂仓库', desc: '高级资源区，封闭空间', tags: ['高级资源', '近战'], color: '#e53e3e', showTooltip: false },
      { x: 22, y: 75, name: '港口办公室', desc: '狙击点位，视野开阔', tags: ['狙击位', '战略'], color: '#3182ce', showTooltip: false }
    ]
  },
  {
    id: 'wild-01',
    name: '荒野训练营',
    type: 'wild', // 野外战场
    coverUrl: 'https://picsum.photos/id/1019/600/400',
    mapUrl: 'https://picsum.photos/id/1019/1200/800',
    desc: '开阔野外战场，地形起伏，适合远距离作战',
    pointCount: 24,
    collectCount: 15623,
    isHot: false,
    isNew: false,
    tacticalPoints: [
      { x: 48, y: 30, name: '山顶瞭望塔', desc: '绝佳狙击位，360度视野', tags: ['狙击位', '视野'], color: '#3182ce', showTooltip: false },
      { x: 72, y: 55, name: '废弃村落', desc: '中级资源区，适合小队集结', tags: ['中级资源', '集结'], color: '#ed8936', showTooltip: false },
      { x: 28, y: 65, name: '山谷伏击点', desc: '天然掩体，适合伏击', tags: ['伏击点', '隐蔽'], color: '#9f7aea', showTooltip: false }
    ]
  },
  {
    id: 'special-01',
    name: '夜间突袭',
    type: 'special', // 特殊模式
    coverUrl: 'https://picsum.photos/id/1039/600/400',
    mapUrl: 'https://picsum.photos/id/1039/1200/800',
    desc: '夜间模式专属地图，能见度低，依赖战术配合',
    pointCount: 20,
    collectCount: 12897,
    isHot: false,
    isNew: true,
    tacticalPoints: [
      { x: 38, y: 45, name: '灯光控制室', desc: '控制全场灯光，战略要点', tags: ['任务目标', '战略'], color: '#4299e1', showTooltip: false },
      { x: 68, y: 38, name: '废弃加油站', desc: '中级资源区，易守难攻', tags: ['中级资源', '防守'], color: '#ed8936', showTooltip: false },
      { x: 52, y: 70, name: '黑暗山谷', desc: '伏击绝佳地点，隐蔽性强', tags: ['伏击点', '隐蔽'], color: '#9f7aea', showTooltip: false }
    ]
  },
  {
    id: 'city-03',
    name: '老城区',
    type: 'city',
    coverUrl: 'https://picsum.photos/id/1048/600/400',
    mapUrl: 'https://picsum.photos/id/1048/1200/800',
    desc: '老式建筑群战场，街道狭窄，近战为主',
    pointCount: 26,
    collectCount: 16789,
    isHot: false,
    isNew: false,
    tacticalPoints: [
      { x: 42, y: 32, name: '老城广场', desc: '高级资源区，人流密集', tags: ['高级资源', '热门'], color: '#e53e3e', showTooltip: false },
      { x: 75, y: 58, name: '居民楼群', desc: '中级资源区，巷战频发', tags: ['中级资源', '巷战'], color: '#ed8936', showTooltip: false },
      { x: 25, y: 62, name: '屋顶狙击点', desc: '视野开阔，适合远程打击', tags: ['狙击位', '远程'], color: '#3182ce', showTooltip: false }
    ]
  }
]);

// ===== 筛选与地图状态 =====
const activeMapType = ref('all'); // 筛选类型：all/city/wild/special
const filteredMaps = computed(() => {
  if (activeMapType.value === 'all') return maps;
  return maps.filter(map => map.type === activeMapType.value);
});

// ===== 地图详情弹窗状态 =====
const showMapModal = ref(false);
const currentMap = ref(maps[0]); // 当前选中地图
const mapMode = ref('view'); // view/mark
const zoomLevel = ref(1);
const isFullScreen = ref(false);
const collectedMapIds = ref<string[]>([]); // 已收藏地图ID
const isCollected = computed(() => collectedMapIds.value.includes(currentMap.value.id));

// ===== 用户标记状态 =====
const userMarks = ref<Array<{
  x: number;
  y: number;
  title: string;
  desc?: string;
  type: string;
  showTooltip: boolean;
}>>([]);
const showMarkInputModal = ref(false);
const markForm = ref({
  title: '',
  desc: '',
  type: 'ambush',
  x: 0,
  y: 0
});

// ===== 页面交互方法 =====
// 滚动到地图列表
const scrollToMapList = () => {
  mapListRef.value?.scrollIntoView({ behavior: 'smooth' });
};

// 前往攻略页面
const goToStrategy = () => {
  router.push('/strategy');
};

// 用户菜单切换
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

// 登出处理（贴合项目路由）
const handleLogout = () => {
  localStorage.removeItem('bs_token');
  localStorage.removeItem('bs_user');
  router.push('/login');
};

// 打开地图详情
const openMapDetail = (mapId: string) => {
  const targetMap = maps.find(map => map.id === mapId);
  if (targetMap) currentMap.value = targetMap;
  showMapModal.value = true;
  zoomLevel.value = 1;
  mapMode.value = 'view';
  userMarks.value = [];
};

// 关闭地图详情
const closeMapModal = () => {
  showMapModal.value = false;
  isFullScreen.value = false;
  // 退出全屏
  if (document.fullscreenElement) {
    if (document.exitFullscreen) document.exitFullscreen();
    else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
    else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
  }
};

// 全屏切换
const toggleFullScreen = () => {
  const modalBox = document.querySelector('.modal-box') as HTMLElement;
  if (!modalBox) return;

  if (!isFullScreen.value) {
    // 进入全屏
    if (modalBox.requestFullscreen) modalBox.requestFullscreen();
    else if ((modalBox as any).webkitRequestFullscreen) (modalBox as any).webkitRequestFullscreen();
    else if ((modalBox as any).msRequestFullscreen) (modalBox as any).msRequestFullscreen();
  } else {
    // 退出全屏
    if (document.exitFullscreen) document.exitFullscreen();
    else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
    else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
  }
};

// 监听全屏状态变化
const handleFullScreenChange = () => {
  isFullScreen.value = !!document.fullscreenElement;
};

// 缩放调整
const adjustZoom = (delta: number) => {
  zoomLevel.value = Math.max(0.5, Math.min(2, zoomLevel.value + delta));
};

// 地图点击（标记模式）
const handleMapClick = (e: MouseEvent) => {
  if (mapMode.value !== 'mark') return;

  const mapWrapper = e.currentTarget as HTMLDivElement;
  const rect = mapWrapper.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  // 重置标记表单并打开输入弹窗
  markForm.value = {
    title: '',
    desc: '',
    type: 'ambush',
    x,
    y
  };
  showMarkInputModal.value = true;
};

// 显示系统战术点详情
const showPointDetail = (point: any, idx: number) => {
  // 关闭其他点的tooltip
  currentMap.value.tacticalPoints.forEach((p, i) => {
    if (i !== idx) p.showTooltip = false;
  });
  point.showTooltip = !point.showTooltip;
};

// 显示用户标记详情
const showUserMarkDetail = (mark: any, idx: number) => {
  // 关闭其他标记的tooltip
  userMarks.value.forEach((m, i) => {
    if (i !== idx) m.showTooltip = false;
  });
  mark.showTooltip = !mark.showTooltip;
};

// 保存用户标记
const saveUserMark = () => {
  if (!markForm.value.title.trim()) {
    alert('请输入标记名称');
    return;
  }

  userMarks.value.push({
    x: markForm.value.x,
    y: markForm.value.y,
    title: markForm.value.title,
    desc: markForm.value.desc,
    type: markForm.value.type,
    showTooltip: true
  });

  showMarkInputModal.value = false;
};

// 关闭标记输入弹窗
const closeMarkInputModal = () => {
  showMarkInputModal.value = false;
  markForm.value = { title: '', desc: '', type: 'ambush', x: 0, y: 0 };
};

// 删除用户标记
const deleteUserMark = (idx: number) => {
  userMarks.value.splice(idx, 1);
};

// 清除所有用户标记
const clearUserMarks = () => {
  if (confirm('确定清除所有自定义标记吗？')) {
    userMarks.value = [];
  }
};

// 收藏/取消收藏地图
const toggleCollectMap = () => {
  if (isCollected.value) {
    collectedMapIds.value = collectedMapIds.value.filter(id => id !== currentMap.value.id);
    alert(`已取消收藏 ${currentMap.value.name}`);
  } else {
    collectedMapIds.value.push(currentMap.value.id);
    alert(`已收藏 ${currentMap.value.name} 到我的收藏`);
  }
};

// ===== 生命周期 =====
onMounted(() => {
  // 监听全屏变化
  document.addEventListener('fullscreenchange', handleFullScreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
  document.addEventListener('MSFullscreenChange', handleFullScreenChange);

  // 初始化用户信息（从项目本地存储读取）
  const userStr = localStorage.getItem('bs_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    userAvatar.value = user.avatar || userAvatar.value;
  } else {
    router.push('/login'); // 未登录跳转登录页（贴合项目路由）
  }

  // 初始化收藏列表
  const collectedStr = localStorage.getItem('bs_collected_maps');
  if (collectedStr) {
    collectedMapIds.value = JSON.parse(collectedStr);
  }
});

onUnmounted(() => {
  // 移除事件监听
  document.removeEventListener('fullscreenchange', handleFullScreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
  document.removeEventListener('MSFullscreenChange', handleFullScreenChange);

  // 保存收藏列表到本地存储
  localStorage.setItem('bs_collected_maps', JSON.stringify(collectedMapIds.value));
});
</script>

<style scoped>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

.bs-map-page {
  min-height: 100vh;
  color: #333;
  background-color: #f8f9fa;
}

.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* 顶部导航 */
.page-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 999;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

.logo i {
  color: #e53e3e;
  font-size: 1.5rem;
}

.main-nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
}

.nav-link:hover, .nav-link.active {
  color: #e53e3e;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #e53e3e;
  border-radius: 3px;
}

.user-info {
  position: relative;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #eee;
  transition: border-color 0.2s;
}

.user-avatar:hover {
  border-color: #e53e3e;
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 160px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-top: 0.5rem;
  z-index: 1000;
}

.user-menu a {
  display: block;
  padding: 0.8rem 1rem;
  color: #666;
  text-decoration: none;
  transition: background-color 0.2s;
}

.user-menu a:hover {
  background-color: #f5f5f5;
  color: #e53e3e;
}

/* 主视觉Banner */
.map-banner {
  height: 420px;
  background-image: url('https://picsum.photos/id/1041/1920/420');
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.4) 100%);
  display: flex;
  align-items: center;
}

.banner-overlay .container {
  color: #fff;
}

.banner-overlay h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.banner-overlay p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 600px;
}

.banner-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.9rem 1.8rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background-color: #e53e3e;
  color: #fff;
}

.btn-primary:hover {
  background-color: #d32f2f;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 地图列表区 */
.map-list-section {
  padding: 3rem 0;
}

.map-filter {
  margin-bottom: 2rem;
}

.map-filter h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.filter-tabs {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.7rem 1.5rem;
  border-radius: 25px;
  background-color: #fff;
  border: 1px solid #eee;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.filter-tab:hover {
  border-color: #e53e3e;
  color: #e53e3e;
}

.filter-tab.active {
  background-color: #e53e3e;
  color: #fff;
  border-color: #e53e3e;
}

.map-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.map-card {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.map-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.card-thumb {
  position: relative;
  height: 200px;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.map-card:hover .card-thumb img {
  transform: scale(1.05);
}

.card-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
  background-color: #e53e3e;
}

.card-tag.new {
  background-color: #48bb78;
}

.card-body {
  padding: 1.2rem;
}

.card-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.card-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 0.8rem;
}

.card-meta span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.card-desc {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 地图详情弹窗 */
.map-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.modal-box {
  position: relative;
  background-color: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 1300px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-box.small {
  max-width: 500px;
  max-height: auto;
}

.modal-header {
  padding: 1.2rem 1.5rem;
  background-color: #fafafa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  color: #1a1a1a;
  margin: 0;
}

.modal-tools {
  display: flex;
  gap: 0.5rem;
}

.tool-btn {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: none;
  background-color: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tool-btn:hover {
  background-color: #f5f5f5;
  color: #e53e3e;
}

.tool-btn.close-btn:hover {
  color: #e53e3e;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 70px);
}

.modal-box.small .modal-body {
  max-height: none;
}

/* 地图控制栏 */
.map-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.control-group {
  display: flex;
  gap: 0.8rem;
}

.control-group.left {
  gap: 0.5rem;
}

.control-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: 1px solid #eee;
  background-color: #fff;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.control-btn.active {
  background-color: #e53e3e;
  color: #fff;
  border-color: #e53e3e;
}

.control-btn:hover:not(.active) {
  border-color: #ddd;
  background-color: #f9f9f9;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-label {
  font-size: 0.9rem;
  color: #666;
  margin-right: 0.5rem;
}

.zoom-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #eee;
  background-color: #fff;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.zoom-btn:hover {
  border-color: #e53e3e;
  color: #e53e3e;
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 地图展示区 */
.map-display {
  background-color: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  min-height: 500px;
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: auto;
  cursor: default;
}

.map-img {
  width: 100%;
  height: auto;
  display: block;
}

/* 标记样式 */
.system-marker, .user-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;
}

.marker-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #fff, 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.system-marker:hover .marker-dot {
  transform: scale(1.3);
}

.user-marker {
  color: #e53e3e;
  font-size: 26px;
  transition: transform 0.2s;
}

.user-marker:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.marker-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background-color: #fff;
  border-radius: 8px;
  padding: 0.9rem;
  width: 240px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 20;
  opacity: 1;
  transition: opacity 0.2s;
}

.marker-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 8px;
  border-style: solid;
  border-color: #fff transparent transparent transparent;
}

.marker-tooltip h4 {
  font-size: 1rem;
  margin-bottom: 0.3rem;
  color: #1a1a1a;
}

.marker-tooltip p {
  font-size: 0.85rem;
  margin-bottom: 0.6rem;
  color: #666;
  line-height: 1.4;
}

.tooltip-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tooltip-tags span {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background-color: #f5f5f5;
  color: #666;
  border-radius: 4px;
}

.delete-mark-btn {
  background-color: #fef2f2;
  color: #e53e3e;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-mark-btn:hover {
  background-color: #fee2e2;
}

/* 图例样式 */
.map-legend {
  margin-top: 1.5rem;
  background-color: #fafafa;
  border-radius: 12px;
  padding: 1.2rem;
  border: 1px solid #eee;
}

.map-legend h3 {
  font-size: 1rem;
  margin-bottom: 0.8rem;
  color: #1a1a1a;
}

.legend-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  color: #666;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

/* 标记输入弹窗表单样式 */
.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #e53e3e;
}

.form-control {
  width: 100%;
  padding: 0.9rem;
  border: 1px solid #eee;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
}

/* 页脚样式 */
.page-footer {
  background-color: #1a1a1a;
  color: #999;
  padding: 3rem 0;
  margin-top: 3rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.footer-logo i {
  color: #e53e3e;
  font-size: 1.5rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.footer-links a {
  color: #999;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #e53e3e;
}

.copyright {
  font-size: 0.85rem;
  opacity: 0.7;
}

/* 响应式适配 */
@media (max-width: 992px) {
  .main-nav {
    gap: 1.5rem;
  }

  .banner-overlay h1 {
    font-size: 2rem;
  }

  .banner-overlay p {
    font-size: 1rem;
  }

  .map-card-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-content {
    height: auto;
    padding: 1rem 0;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .main-nav {
    order: 3;
    width: 100%;
    justify-content: center;
    gap: 1rem;
  }

  .map-banner {
    height: 350px;
  }

  .banner-overlay h1 {
    font-size: 1.8rem;
  }

  .banner-actions {
    flex-direction: column;
    gap: 0.8rem;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
  }

  .map-control {
    flex-direction: column;
    align-items: flex-start;
  }

  .control-group.right {
    width: 100%;
    justify-content: flex-end;
  }

  .map-display {
    min-height: 350px;
  }

  .marker-tooltip {
    width: 200px;
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .map-card-grid {
    grid-template-columns: 1fr;
  }

  .modal-box {
    max-height: 85vh;
  }

  .modal-body {
    padding: 1rem;
  }

  .map-control {
    gap: 0.8rem;
  }

  .control-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}

/* 全屏模式适配 */
.modal-box.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  border-radius: 0;
}

.fullscreen .modal-body {
  max-height: calc(100vh - 70px);
}
</style>