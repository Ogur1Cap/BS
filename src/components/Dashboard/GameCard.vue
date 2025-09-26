<template>
  <div class="game-card">
    <div class="game-image">
      <img :src="game.imageUrl" :alt="game.name" class="game-img">
      <div class="game-overlay">
        <span class="players-count">
          <i class="fa fa-users"></i> {{ game.players }}
        </span>
      </div>
    </div>
    <div class="game-info">
      <h3 class="game-name">{{ game.name }}</h3>
      <div class="game-rating">
        <i class="fa fa-star"></i>
        <span class="rating-value">{{ game.rating }}</span>
      </div>
    </div>
    <router-link :to="'/escort?gameId=' + game.id" class="book-button">立即预约</router-link>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

// 定义游戏数据类型
interface Game {
  id: number;
  name: string;
  imageUrl: string;
  players: number;
  rating: number;
}

// 定义props
const props = defineProps({
  game: {
    type: Object as () => Game,
    required: true
  }
});
</script>

<style scoped>
.game-card {
  background-color: #1f2937;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(55, 65, 81, 0.5);
  transition: all 0.3s ease;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
}

.game-image {
  position: relative;
  height: 140px;
}

.game-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.game-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(17, 24, 37, 0.9), transparent);
}

.players-count {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  background-color: rgba(17, 24, 37, 0.7);
  backdrop-filter: blur(4px);
  color: #f3f4f6;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
}

.players-count i {
  margin-right: 0.25rem;
  font-size: 0.625rem;
}

.game-info {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-name {
  font-weight: 600;
  color: #f3f4f6;
}

.game-rating {
  display: flex;
  align-items: center;
  color: #f59e0b;
  font-weight: 600;
}

.game-rating i {
  margin-right: 0.25rem;
  font-size: 0.875rem;
}

.book-button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  text-align: center;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  border-top: 1px solid rgba(55, 65, 81, 0.5);
}

.book-button:hover {
  background-color: #3b82f6;
  color: white;
}
</style>
    