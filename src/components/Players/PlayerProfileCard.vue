<template>
  <div class="player-card" :class="{ 'compact-mode': isCompact }">
    <!-- 头像与基础信息（两种模式共用） -->
    <div class="card-header">
      <img :src="player.avatar" :alt="player.name" class="player-avatar">
      <div class="header-info">
        <div class="name-rank">
          <h3 class="player-name">{{ player.name }}</h3>
          <span 
            class="rank-tag" 
            :style="{ backgroundColor: player.rankColor + '20', color: player.rankColor, borderColor: player.rankColor + '40' }"
          >
            {{ player.rankText }}
          </span>
        </div>
        <div class="rating">
          <i class="fa fa-star" style="color: #f59e0b;"></i>
          <span>{{ player.rating.toFixed(1) }}</span>
          <span class="order-count">({{ player.completedOrders }}单)</span>
        </div>
      </div>
    </div>

    <!-- 核心信息（紧凑模式显示） -->
    <div class="core-info" v-if="isCompact">
      <div class="skills">
        <span class="skill-tag" v-for="skill in player.skills" :key="skill">
          {{ skill }}
        </span>
      </div>
      <div class="stats">
        <div class="stat-item">胜率: {{ player.winRate }}%</div>
        <div class="stat-item">¥{{ player.pricePerHour }}/小时</div>
      </div>
    </div>

    <!-- 详细信息（完整模式显示） -->
    <div class="detailed-info" v-else>
      <div class="section">
        <h4>擅长领域</h4>
        <div class="skills">
          <span class="skill-tag" v-for="skill in player.skills" :key="skill">
            {{ skill }}
          </span>
        </div>
      </div>
      
      <div class="section">
        <h4>服务标签</h4>
        <div class="tags">
          <span class="service-tag" v-for="tag in player.tags" :key="tag">
            {{ tag }}
          </span>
        </div>
      </div>
      
      <div class="section stats-section">
        <h4>核心数据</h4>
        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-label">胜率</span>
            <span class="stat-value">{{ player.winRate }}%</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">完成订单</span>
            <span class="stat-value">{{ player.completedOrders }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">服务价格</span>
            <span class="stat-value">¥{{ player.pricePerHour }}/小时</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>个人简介</h4>
        <p class="intro">{{ player.intro }}</p>
      </div>
    </div>

    <!-- 操作按钮（根据模式调整） -->
    <div class="card-actions">
      <button class="btn book-btn" @click="$emit('book-now')">
        立即预约
      </button>
      <button 
        class="btn detail-btn" 
        @click="$emit('view-detail')"
        v-if="isCompact"  
      >
        查看详情
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

// 打手数据类型定义
interface Player {
  id: string;
  name: string;
  avatar: string;
  rankText: string;
  rankColor: string;
  skills: string[];
  winRate: number;
  completedOrders: number;
  rating: number;
  pricePerHour: number;
  intro: string;
  tags: string[];
}

// Props定义：添加isCompact控制显示模式
const props = defineProps({
  player: {
    type: Object as () => Player,
    required: true
  },
  isCompact: {
    type: Boolean,
    default: false  // 默认完整模式
  }
});

// 事件定义
const emit = defineEmits(['book-now', 'view-detail']);
</script>

<style scoped>
.player-card {
  background-color: #1e293b;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(55, 65, 81, 0.5);
  transition: all 0.3s ease;
}

.player-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
}

/* 头部信息（共用样式） */
.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.player-avatar {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(59, 130, 246, 0.3);
}

.header-info {
  flex: 1;
}

.name-rank {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.player-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f3f4f6;
  margin: 0;
}

.rank-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.rating span:first-of-type {
  font-weight: 600;
  color: #f59e0b;
}

.order-count {
  color: #94a3b8;
  font-size: 0.8rem;
}

/* 紧凑模式样式 */
.compact-mode {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.core-info .skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.core-info .stats {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-top: 1px solid rgba(55, 65, 81, 0.3);
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
}

.stat-item {
  color: #e2e8f0;
  font-size: 0.9rem;
}

/* 完整模式样式 */
.detailed-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
}

.section:last-child {
  border-bottom: none;
}

.section h4 {
  margin: 0 0 0.75rem 0;
  color: #f3f4f6;
  font-size: 1rem;
}

.skills, .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  padding: 0.25rem 0.75rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 999px;
  font-size: 0.85rem;
}

.service-tag {
  padding: 0.25rem 0.75rem;
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-radius: 999px;
  font-size: 0.8rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-box {
  text-align: center;
  padding: 0.75rem;
  background-color: rgba(15, 23, 42, 0.5);
  border-radius: 0.5rem;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f3f4f6;
}

.intro {
  color: #94a3b8;
  line-height: 1.6;
  margin: 0;
}

/* 操作按钮（共用样式） */
.card-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.book-btn {
  background-color: #3b82f6;
  color: white;
}

.book-btn:hover {
  background-color: #2563eb;
}

.detail-btn {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.detail-btn:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-actions {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>