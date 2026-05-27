<template>
  <button
    v-show="visible"
    class="scroll-top-btn"
    :class="{ 'is-visible': visible }"
    @click="scrollToTop"
    aria-label="回到顶部"
  >
    <i class="fa fa-arrow-up"></i>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const threshold = 400

let ticking = false

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      visible.value = window.scrollY > threshold
      ticking = false
    })
    ticking = true
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.scroll-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: var(--m-bg-secondary);
  border: 1px solid var(--m-border);
  color: var(--m-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 50;
  opacity: 0;
  transform: translateY(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.scroll-top-btn.is-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.scroll-top-btn:hover {
  border-color: var(--m-accent);
  color: var(--m-accent);
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.15);
  transform: translateY(-2px);
}

.scroll-top-btn i {
  font-size: 0.85rem;
}
</style>
