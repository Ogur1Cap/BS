<template>
  <router-link :to="`/play-hall?game=${game.id}`" class="game-card">
    <div class="card-media">
      <img :src="game.imageUrl" :alt="game.name" class="card-img" />
      <div class="card-shine"></div>
      <div class="card-badge">
        <span class="badge-players">
          <i class="fa fa-users"></i> {{ game.players.toLocaleString() }}
        </span>
      </div>
      <div class="card-gradient"></div>
    </div>
    <div class="card-body">
      <div class="card-info">
        <span class="card-name">{{ game.name }}</span>
        <div class="card-meta">
          <span class="meta-rating">
            <i class="fa fa-star"></i>
            {{ game.rating.toFixed(1) }}
          </span>
          <span class="meta-divider">·</span>
          <span class="meta-hot">热门</span>
        </div>
      </div>
      <span class="card-arrow">→</span>
    </div>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  game: {
    id: number
    name: string
    imageUrl: string
    players: number
    rating: number
  }
}>()
</script>

<style scoped>
.game-card {
  display: flex;
  flex-direction: column;
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
}

.game-card:hover {
  border-color: var(--m-accent);
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-4px);
}

.card-media {
  aspect-ratio: 16 / 10;
  overflow: hidden;
  position: relative;
  background: var(--m-bg);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.game-card:hover .card-img {
  transform: scale(1.08);
}

.card-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%);
  transform: translateX(-100%);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.game-card:hover .card-shine {
  transform: translateX(100%);
}

.card-badge {
  position: absolute;
  top: 0.625rem;
  right: 0.625rem;
}

.badge-players {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  padding: 0.25rem 0.6rem;
  border-radius: 100px;
}

.badge-players i {
  font-size: 0.65rem;
}

.card-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-card:hover .card-gradient {
  opacity: 1;
}

.card-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.card-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--m-text);
  line-height: 1.3;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--m-text-muted);
}

.meta-rating {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  color: #f59e0b;
  font-weight: 600;
}

.meta-rating i {
  font-size: 0.65rem;
}

.meta-divider {
  color: var(--m-border);
}

.meta-hot {
  color: #ef4444;
  font-weight: 600;
  font-size: 0.7rem;
}

.card-arrow {
  font-size: 1.1rem;
  color: var(--m-text-muted);
  transition: all 0.2s ease;
  opacity: 0;
  transform: translateX(-4px);
}

.game-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--m-accent);
}
</style>
