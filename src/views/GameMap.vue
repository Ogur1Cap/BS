<template>
  <div class="game-map-page">
    <!-- 头部导航 -->
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
            <i class="fa fa-map-o" style="color: #3b82f6;"></i> 
            游戏地图导航
          </h1>
          <p>探索游戏地图，标记关键位置，规划战术路线</p>
        </div>
      </div>
    </section>

    <!-- 地图控制与显示区 -->
    <section class="map-container">
      <div class="container">
        <!-- 地图控制栏 -->
        <div class="map-controls">
          <div class="map-selector">
            <label>选择地图：</label>
            <select v-model="selectedMap" @change="loadMap">
              <option value="delta_main">三角洲行动 - 城市战区</option>
              <option value="apex-kings">Apex英雄 - 国王峡谷</option>
              <option value="pubg-erangel">绝地求生 - 艾伦格</option>
            </select>
          </div>
          
          <div class="map-tools">
            <button class="btn secondary" @click="zoomIn">
              <i class="fa fa-search-plus"></i> 放大
            </button>
            <button class="btn secondary" @click="zoomOut">
              <i class="fa fa-search-minus"></i> 缩小
            </button>
            <button class="btn secondary" @click="resetView">
              <i class="fa fa-refresh"></i> 重置视图
            </button>
            <button class="btn secondary" :class="{ active: isAddingMarker }" @click="toggleAddMarker">
              <i class="fa fa-map-marker"></i> {{ isAddingMarker ? '取消标记' : '添加标记' }}
            </button>
            <button class="btn secondary" @click="clearMarkers">
              <i class="fa fa-trash"></i> 清除标记
            </button>
          </div>
        </div>
        
        <!-- 地图显示区域 -->
        <div class="map-wrapper">
          <div 
            class="map-canvas"
            ref="mapCanvas"
            @click="handleMapClick"
            :style="{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center',
              transition: 'transform 0.3s ease'
            }"
          >
            <!-- 地图图片 -->
            <img 
              :src="currentMapImage" 
              :alt="currentMapName" 
              class="map-image"
              ref="mapImage"
            >
            
            <!-- 互动标记点 -->
            <div 
              v-for="marker in markers" 
              :key="marker.id"
              class="map-marker"
              :style="{
                left: `${marker.x}%`,
                top: `${marker.y}%`,
                backgroundColor: marker.color
              }"
              @click.stop="showMarkerDetails(marker)"
            >
              <i class="fa fa-flag"></i>
              <div class="marker-tooltip" v-if="marker.showTooltip">
                <h4>{{ marker.title }}</h4>
                <p>{{ marker.description }}</p>
                <div class="marker-actions">
                  <button @click.stop="editMarker(marker)">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button @click.stop="removeMarker(marker.id)">
                    <i class="fa fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 地图图例 -->
        <div class="map-legend">
          <h3>地图图例</h3>
          <div class="legend-items">
            <div class="legend-item">
              <div class="legend-color" style="background-color: #3b82f6;"></div>
              <span>安全区</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #ef4444;"></div>
              <span>危险区域</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #10b981;"></div>
              <span>资源点</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #f59e0b;"></div>
              <span>任务目标</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 标记编辑弹窗 -->
    <div class="modal-backdrop" v-if="showMarkerModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingMarker ? '编辑标记' : '添加标记' }}</h3>
          <button class="close-btn" @click="closeMarkerModal">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>标记名称</label>
            <input 
              type="text" 
              v-model="markerForm.title" 
              class="form-control"
              placeholder="输入标记名称"
            >
          </div>
          <div class="form-group">
            <label>标记描述</label>
            <textarea 
              v-model="markerForm.description" 
              class="form-control"
              rows="3"
              placeholder="输入标记描述"
            ></textarea>
          </div>
          <div class="form-group">
            <label>标记类型</label>
            <select v-model="markerForm.color" class="form-control">
              <option value="#3b82f6">安全区</option>
              <option value="#ef4444">危险区域</option>
              <option value="#10b981">资源点</option>
              <option value="#f59e0b">任务目标</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="closeMarkerModal">取消</button>
          <button class="btn primary" @click="saveMarker">保存</button>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <Footer />

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="bg-blob blob-1"></div>
      <div class="bg-blob blob-2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Header from '../layouts/Header.vue';
import Footer from '../layouts/Footer.vue';

// 路由实例
const router = useRouter();

// 类型定义
interface Marker {
  id: string;
  x: number; // 百分比坐标
  y: number; // 百分比坐标
  title: string;
  description: string;
  color: string;
  showTooltip: boolean;
}

interface MapConfig {
  id: string;
  name: string;
  imageUrl: string;
}

// 状态管理
const currentUser = ref<{ username?: string; avatar?: string } | null>(null);
const userAvatar = ref('https://picsum.photos/id/237/200/200');

// 地图配置
const maps = ref<MapConfig[]>([
  {
    id: 'delta-main',
    name: '三角洲行动 - 城市战区',
    imageUrl: 'https://picsum.photos/id/1015/1200/800'
  },
  {
    id: 'apex-kings',
    name: 'Apex英雄 - 国王峡谷',
    imageUrl: 'https://picsum.photos/id/1016/1200/800'
  },
  {
    id: 'pubg-erangel',
    name: '绝地求生 - 艾伦格',
    imageUrl: 'https://picsum.photos/id/1018/1200/800'
  }
]);

// 地图状态
const selectedMap = ref('delta-main');
const currentMapImage = ref(maps.value[0].imageUrl);
const currentMapName = ref(maps.value[0].name);
const zoomLevel = ref(1);
const mapCanvas = ref<HTMLDivElement | null>(null);
const mapImage = ref<HTMLImageElement | null>(null);

// 标记状态
const markers = ref<Marker[]>([]);
const isAddingMarker = ref(false);
const showMarkerModal = ref(false);
const editingMarker = ref<Marker | null>(null);
const markerForm = ref<Partial<Marker>>({
  title: '',
  description: '',
  color: '#3b82f6'
});

// 初始化
onMounted(() => {
  // 获取用户信息
  const userStr = localStorage.getItem('delta_user') || sessionStorage.getItem('delta_user');
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
    userAvatar.value = currentUser.value?.avatar || userAvatar.value;
  } else {
    router.push('/login');
  }

  // 加载默认地图标记
  loadDefaultMarkers();
});

// 计算属性
const filteredMaps = computed(() => {
  return maps.value;
});

// 地图控制方法
const loadMap = () => {
  const map = maps.value.find(m => m.id === selectedMap.value);
  if (map) {
    currentMapImage.value = map.imageUrl;
    currentMapName.value = map.name;
  }
  // 重置地图状态
  zoomLevel.value = 1;
  markers.value = [];
  loadDefaultMarkers();
};

const zoomIn = () => {
  if (zoomLevel.value < 2) {
    zoomLevel.value += 0.1;
  }
};

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value -= 0.1;
  }
};

const resetView = () => {
  zoomLevel.value = 1;
};

// 标记管理方法
const loadDefaultMarkers = () => {
  // 根据当前地图加载默认标记
  if (selectedMap.value === 'delta-main') {
    markers.value = [
      {
        id: 'm1',
        x: 30,
        y: 40,
        title: '主资源区',
        description: '高价值装备刷新点，竞争激烈',
        color: '#10b981',
        showTooltip: false
      },
      {
        id: 'm2',
        x: 60,
        y: 50,
        title: '安全屋',
        description: '初期安全区域，适合新手发育',
        color: '#3b82f6',
        showTooltip: false
      },
      {
        id: 'm3',
        x: 45,
        y: 70,
        title: '敌方据点',
        description: '敌方高概率驻守区域',
        color: '#ef4444',
        showTooltip: false
      }
    ];
  }
};

const toggleAddMarker = () => {
  isAddingMarker.value = !isAddingMarker.value;
  if (!isAddingMarker.value) {
    closeMarkerModal();
  }
};

const handleMapClick = (e: MouseEvent) => {
  if (!isAddingMarker.value || !mapCanvas.value) return;
  
  // 计算点击位置的百分比
  const rect = mapCanvas.value.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  
  // 重置表单并打开弹窗
  editingMarker.value = null;
  markerForm.value = {
    title: '',
    description: '',
    color: '#3b82f6',
    x,
    y
  };
  showMarkerModal.value = true;
};

const showMarkerDetails = (marker: Marker) => {
  // 切换标记的 tooltip 显示状态
  markers.value = markers.value.map(m => 
    m.id === marker.id ? { ...m, showTooltip: !m.showTooltip } : 
    { ...m, showTooltip: false }
  );
};

const editMarker = (marker: Marker) => {
  editingMarker.value = marker;
  markerForm.value = { ...marker };
  showMarkerModal.value = true;
};

const removeMarker = (id: string) => {
  markers.value = markers.value.filter(marker => marker.id !== id);
};

const clearMarkers = () => {
  if (confirm('确定要清除所有标记吗？')) {
    markers.value = [];
  }
};

// 弹窗控制
const closeMarkerModal = () => {
  showMarkerModal.value = false;
  markerForm.value = {
    title: '',
    description: '',
    color: '#3b82f6'
  };
  editingMarker.value = null;
};

const saveMarker = () => {
  if (!markerForm.value.title) {
    alert('请输入标记名称');
    return;
  }
  
  if (editingMarker.value) {
    // 更新现有标记
    markers.value = markers.value.map(m => 
      m.id === editingMarker.value!.id 
        ? { ...m, ...markerForm.value, showTooltip: true } 
        : m
    );
  } else if (markerForm.value.x !== undefined && markerForm.value.y !== undefined) {
    // 添加新标记
    const newMarker: Marker = {
      id: `m-${Date.now()}`,
      x: markerForm.value.x,
      y: markerForm.value.y,
      title: markerForm.value.title || '',
      description: markerForm.value.description || '',
      color: markerForm.value.color || '#3b82f6',
      showTooltip: true
    };
    markers.value.push(newMarker);
  }
  
  closeMarkerModal();
};

// 登出处理
const handleLogout = () => {
  localStorage.removeItem('delta_token');
  sessionStorage.removeItem('delta_token');
  localStorage.removeItem('delta_user');
  sessionStorage.removeItem('delta_user');
  router.push('/login');
};
</script>

<style scoped>
.game-map-page {
  min-height: 100vh;
  background-color: #0f172a;
  color: #e2e8f0;
  font-family: 'Segoe UI', sans-serif;
  position: relative;
}

.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

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
}

/* 地图容器样式 */
.map-container {
  padding: 3rem 0;
}

.map-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  padding: 1rem;
  background-color: #1e293b;
  border-radius: 0.75rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
}

.map-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.map-selector label {
  font-weight: 500;
  color: #e2e8f0;
}

.map-selector select {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: #0f172a;
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #e2e8f0;
  cursor: pointer;
}

.map-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

/* 地图画布样式 */
.map-wrapper {
  width: 100%;
  overflow: auto;
  background-color: #1e293b;
  border-radius: 0.75rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
  padding: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.map-canvas {
  width: 100%;
  height: auto;
  position: relative;
  cursor: grab;
}

.map-canvas:active {
  cursor: grabbing;
}

.map-image {
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

/* 标记点样式 */
.map-marker {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
  z-index: 10;
}

.map-marker:hover {
  transform: translate(-50%, -50%) scale(1.2);
  z-index: 20;
}

.marker-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1e293b;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem;
  width: 200px;
  margin-bottom: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  z-index: 30;
}

.marker-tooltip h4 {
  margin: 0 0 0.25rem 0;
  color: #f3f4f6;
  font-size: 0.9rem;
}

.marker-tooltip p {
  margin: 0 0 0.5rem 0;
  color: #94a3b8;
  font-size: 0.8rem;
}

.marker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.marker-actions button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s ease;
}

.marker-actions button:hover {
  color: #3b82f6;
}

/* 地图图例 */
.map-legend {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #1e293b;
  border-radius: 0.75rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
}

.map-legend h3 {
  margin: 0 0 1rem 0;
  color: #f3f4f6;
  font-size: 1.1rem;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

/* 弹窗样式 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal {
  width: 100%;
  max-width: 500px;
  background-color: #1e293b;
  border-radius: 1rem;
  border: 1px solid rgba(59, 130, 246, 0.3);
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.5);
}

.modal-header h3 {
  margin: 0;
  color: #f3f4f6;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.25rem;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #ef4444;
}

.modal-body {
  padding: 1.25rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: #0f172a;
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #e2e8f0;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(55, 65, 81, 0.5);
}

/* 按钮样式复用自项目 */
.btn {
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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

.btn.secondary:hover, .btn.secondary.active {
  background-color: rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

/* 背景装饰复用 */
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
  top: -20rem;
  right: -20rem;
  width: 40rem;
  height: 40rem;
  background-color: #3b82f6;
}

.blob-2 {
  bottom: -20rem;
  left: -20rem;
  width: 40rem;
  height: 40rem;
  background-color: #8b5cf6;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .map-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .map-selector {
    width: 100%;
  }
  
  .map-selector select {
    flex: 1;
    width: 100%;
  }
  
  .map-tools {
    justify-content: center;
  }
  
  .marker-tooltip {
    width: 160px;
    font-size: 0.8rem;
  }
}
</style>