<template>
  <div class="player-profile-card">
    <div class="player-header">
      <div class="rank-badge">{{ player.rank }}</div>
      <img :src="player.avatar" :alt="player.name" class="player-avatar">
      <div class="online-status" :class="{'online': isOnline}"></div>
    </div>
    
    <div class="player-info">
      <h3 class="player-name">{{ player.name }}</h3>
      <div class="player-level">等级: {{ player.level }}</div>
      
      <div class="player-stats">
        <div class="stat-item">
          <div class="stat-label">胜率</div>
          <div class="stat-value">{{ player.winRate }}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">完成订单</div>
          <div class="stat-value">{{ player.completedOrders }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">评分</div>
          <div class="stat-value">
            {{ player.rating }}
            <i class="fa fa-star"></i>
          </div>
        </div>
      </div>
      
      <div class="player-specialties">
        <div class="specialty-tag" v-for="(specialty, index) in player.specialty" :key="index">
          {{ specialty }}
        </div>
      </div>
    </div>
    
    <div class="player-footer">
      <div class="hourly-rate">
        <span class="currency">¥</span>
        <span class="amount">{{ player.price }}</span>
        <span class="per-hour">/小时</span>
      </div>
      
      <button class="book-btn" @click="$emit('book')">
        立即预约
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';

interface Player {
  id: string;
  name: string;
  avatar: string;
  level: number;
  rank: string;
  specialty: string[];
  winRate: number;
  completedOrders: number;
  rating: number;
  price: number;
}

const props = defineProps({
  player: {
    type: Object as () => Player,
    required: true
  }
});

// 模拟在线状态
const isOnline = ref(Math.random() > 0.3);
</script>

<style scoped>
.player-profile-card {
  background-color: #1e293b;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.player-profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border-color: rgba(59, 130, 246, 0.3);
}

/* 头部样式 */
.player-header {
  position: relative;
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.rank-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.25rem 0.75rem;
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.player-avatar {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #3b82f6;
  background-color: #0f172a;
}

.online-status {
  position: absolute;
  bottom: 1.5rem;
  right: 35%;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: #64748b;
  border: 2px solid #1e293b;
}

.online-status.online {
  background-color: #10b981;
}

/* 信息区域 */
.player-info {
  padding: 1.5rem;
  text-align: center;
  flex: 1;
}

.player-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.player-level {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.player-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  padding: 0.75rem 0.5rem;
  background-color: rgba(15, 23, 42, 0.5);
  border-radius: 0.5rem;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.stat-value i {
  color: #f59e0b;
  font-size: 0.75rem;
}

.player-specialties {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.specialty-tag {
  padding: 0.25rem 0.75rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
  border-radius: 999px;
  font-size: 0.75rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

/* 底部样式 */
.player-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hourly-rate {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.currency {
  color: #94a3b8;
  font-size: 0.875rem;
}

.amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.per-hour {
  color: #94a3b8;
  font-size: 0.75rem;
}

.book-btn {
  padding: 0.5rem 1.25rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.book-btn:hover {
  background-color: #3b82f6;
  color: white;
}

.player-profile-card:hover .book-btn {
  background-color: #3b82f6;
  color: white;
}
</style>
