<template>
  <div class="gm-page">
    <header class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <i class="fa fa-crosshairs"></i>
            <span>三角洲行动 - 地图交互</span>
          </div>
          <nav class="main-nav">
            <a href="/" class="nav-link">首页</a>
            <a href="/map" class="nav-link active">地图</a>
            <a href="/strategy" class="nav-link">攻略合集</a>
          </nav>
          <div class="user-info">
            <img :src="userAvatar" class="user-avatar" alt="用户头像" @click="toggleUserMenu" />
            <div v-if="showUserMenu" class="user-menu">
              <a href="/profile">个人中心</a>
              <a href="/collection">我的收藏</a>
              <a href="#" @click.prevent="handleLogout">退出登录</a>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="gm-main">
      <section class="gm-workspace">
        <div class="gm-map-col">
          <div class="gm-toolbar">
            <div class="gm-modes">
              <button class="gm-mode-btn" :class="{ active: mode === 'inspect' }" @click="mode = 'inspect'">
                <i class="fa fa-eye"></i> 查看/选点
              </button>
              <button class="gm-mode-btn" :class="{ active: mode === 'mark' }" @click="mode = 'mark'">
                <i class="fa fa-flag"></i> 添加标记
              </button>
            </div>

            <div class="gm-toolbar-right">
              <div class="gm-scale-pill">
                <span>缩放</span>
                <b>{{ Math.round(view.scale * 100) }}%</b>
              </div>
              <button class="gm-icon-btn" :disabled="view.scale <= minScale" @click="adjustZoom(1)">
                <i class="fa fa-search-plus"></i>
              </button>
              <button class="gm-icon-btn" :disabled="view.scale >= maxScale" @click="adjustZoom(-1)">
                <i class="fa fa-search-minus"></i>
              </button>
              <button class="gm-icon-btn" @click="resetView">
                <i class="fa fa-crosshairs"></i>
              </button>
              <label class="gm-switch">
                <input type="checkbox" v-model="showGrid" />
                <span>网格</span>
              </label>
            </div>
          </div>

          <div class="gm-canvas-wrap" ref="canvasAreaRef">
            <canvas
              ref="canvasRef"
              class="gm-canvas"
              @wheel.prevent="handleWheel"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp"
              @mouseleave="onPointerLeave"
            />

            <div class="gm-overlay">
              <div v-if="hoverWorld" class="gm-readout">
                世界：({{ fmt(hoverWorld.x) }}, {{ fmt(hoverWorld.y) }})
              </div>
              <div v-if="selectedWorld" class="gm-selected">
                已选：({{ fmt(selectedWorld.x) }}, {{ fmt(selectedWorld.y) }})
              </div>
            </div>
          </div>

          <div class="gm-hint">左键拖拽平移；滚轮缩放；“添加标记”后点击地图落点。</div>
        </div>

        <aside class="gm-side">
          <div class="gm-card">
            <div class="gm-card-title">点位信息</div>
            <div class="gm-row">
              <span>缩放</span>
              <b>{{ Math.round(view.scale * 100) }}%</b>
            </div>
            <div class="gm-row" v-if="selectedWorld">
              <span>坐标</span>
              <b>{{ fmt(selectedWorld.x) }}, {{ fmt(selectedWorld.y) }}</b>
            </div>
            <div class="gm-row" v-else>
              <span>坐标</span>
              <b>未选择</b>
            </div>
          </div>

          <div class="gm-card">
            <div class="gm-card-title gm-card-title-row">
              <span>标记列表</span>
              <button class="gm-link-btn" :disabled="markers.length === 0" @click="clearMarkers">
                清空
              </button>
            </div>

            <div v-if="markers.length === 0" class="gm-empty">暂无标记。</div>

            <div v-else class="gm-marker-list">
              <div v-for="m in markers" :key="m.id" class="gm-marker-item">
                <button class="gm-marker-pick" :class="{ active: m.id === activeMarkerId }" @click="selectMarker(m.id)">
                  {{ m.label }}
                </button>
                <button class="gm-marker-del" @click="deleteMarker(m.id)">删除</button>
              </div>
            </div>

            <div v-if="activeMarker" class="gm-edit">
              <div class="gm-edit-title">编辑标记</div>
              <label class="gm-field">
                <span>名称</span>
                <input v-model="activeMarker.label" class="gm-input" />
              </label>
              <label class="gm-field">
                <span>备注</span>
                <textarea v-model="activeMarker.note" class="gm-textarea" rows="3"></textarea>
              </label>
            </div>
          </div>
        </aside>
      </section>
    </main>

    <footer class="page-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <i class="fa fa-crosshairs"></i>
            <span>三角洲行动地图库</span>
          </div>
          <div class="copyright">© 2025 三角洲行动地图库 版权所有 | 基于项目 BS 开发</div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userAvatar = ref('https://picsum.photos/id/237/100/100')
const showUserMenu = ref(false)
const toggleUserMenu = () => (showUserMenu.value = !showUserMenu.value)
const handleLogout = () => {
  localStorage.removeItem('bs_token')
  localStorage.removeItem('bs_user')
  router.push('/login')
}

onMounted(() => {
  const userStr = localStorage.getItem('bs_user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      userAvatar.value = user.avatar || userAvatar.value
    } catch {
      // ignore
    }
  } else {
    router.push('/login')
  }
})

type Marker = { id: string; x: number; y: number; label: string; note: string }

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasAreaRef = ref<HTMLDivElement | null>(null)

const bounds = reactive({ width: 1200, height: 800 })
const minScale = 0.25
const maxScale = 5
const mode = ref<'inspect' | 'mark'>('inspect')
const showGrid = ref(true)

const view = reactive({ scale: 1, offsetX: 0, offsetY: 0 })
const selectedWorld = ref<{ x: number; y: number } | null>(null)
const hoverWorld = ref<{ x: number; y: number } | null>(null)

const markers = ref<Marker[]>([])
const activeMarkerId = ref<string | null>(null)
const activeMarker = computed(() => {
  if (!activeMarkerId.value) return null
  return markers.value.find((m) => m.id === activeMarkerId.value) || null
})

const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : '0.0')

function clampWorld(wx: number, wy: number) {
  return { x: Math.min(bounds.width, Math.max(0, wx)), y: Math.min(bounds.height, Math.max(0, wy)) }
}
function worldToScreen(wx: number, wy: number) {
  return { sx: wx * view.scale + view.offsetX, sy: wy * view.scale + view.offsetY }
}
function screenToWorld(sx: number, sy: number) {
  return { wx: (sx - view.offsetX) / view.scale, wy: (sy - view.offsetY) / view.scale }
}

let resizeObserver: ResizeObserver | null = null
let dpr = 1
let initDone = false
let hasUserInteracted = false
let renderQueued = false

function scheduleRender() {
  if (renderQueued) return
  renderQueued = true
  requestAnimationFrame(() => {
    renderQueued = false
    render()
  })
}

function centerMap() {
  const el = canvasAreaRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  view.offsetX = rect.width / 2 - (bounds.width * view.scale) / 2
  view.offsetY = rect.height / 2 - (bounds.height * view.scale) / 2
}

function resizeCanvas() {
  const canvas = canvasRef.value
  const area = canvasAreaRef.value
  if (!canvas || !area) return
  const rect = area.getBoundingClientRect()
  const w = Math.max(320, rect.width)
  const h = Math.max(420, rect.height)
  dpr = window.devicePixelRatio || 1
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  if (!initDone) {
    initDone = true
    centerMap()
  } else if (!hasUserInteracted) {
    centerMap()
  }
}

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.clientWidth
  const height = canvas.clientHeight
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  ctx.fillStyle = '#f7f7f8'
  ctx.fillRect(0, 0, width, height)

  const tl = worldToScreen(0, 0)
  const mapW = bounds.width * view.scale
  const mapH = bounds.height * view.scale

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.fillRect(tl.sx, tl.sy, mapW, mapH)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)'
  ctx.lineWidth = 2
  ctx.strokeRect(tl.sx, tl.sy, mapW, mapH)
  ctx.fillStyle = 'rgba(20, 20, 25, 0.55)'
  ctx.font = '14px Segoe UI, Arial'
  ctx.fillText('地图平面区域（待接入你的 2D 渲染）', tl.sx + 18, tl.sy + 28)

  if (showGrid.value) {
    const step = 100
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)'
    ctx.lineWidth = 1
    for (let x = -step; x <= bounds.width + step; x += step) {
      const p = worldToScreen(x, 0)
      ctx.beginPath()
      ctx.moveTo(p.sx, tl.sy)
      ctx.lineTo(p.sx, tl.sy + mapH)
      ctx.stroke()
    }
    for (let y = -step; y <= bounds.height + step; y += step) {
      const p = worldToScreen(0, y)
      ctx.beginPath()
      ctx.moveTo(tl.sx, p.sy)
      ctx.lineTo(tl.sx + mapW, p.sy)
      ctx.stroke()
    }
  }

  const drawCross = (wx: number, wy: number, color: string, alpha = 1) => {
    const p = worldToScreen(wx, wy)
    ctx.strokeStyle = color
    ctx.globalAlpha = alpha
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(p.sx - 12, p.sy)
    ctx.lineTo(p.sx + 12, p.sy)
    ctx.moveTo(p.sx, p.sy - 12)
    ctx.lineTo(p.sx, p.sy + 12)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  if (hoverWorld.value && mode.value === 'inspect') drawCross(hoverWorld.value.x, hoverWorld.value.y, '#666', 0.7)
  if (selectedWorld.value) drawCross(selectedWorld.value.x, selectedWorld.value.y, '#e53e3e', 0.9)

  for (const m of markers.value) {
    const p = worldToScreen(m.x, m.y)
    const isActive = m.id === activeMarkerId.value
    ctx.fillStyle = isActive ? '#e53e3e' : '#3182ce'
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(p.sx, p.sy, isActive ? 9 : 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    if (isActive) {
      ctx.fillStyle = 'rgba(20, 20, 25, 0.9)'
      ctx.font = '12px Segoe UI, Arial'
      ctx.textAlign = 'left'
      ctx.fillText(m.label, p.sx + 10, p.sy - 10)
    }
  }
}

function getCanvasRelativePosition(e: PointerEvent | WheelEvent) {
  const canvas = canvasRef.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  return { sx: e.clientX - rect.left, sy: e.clientY - rect.top }
}

function findMarkerAtScreen(sx: number, sy: number) {
  let best: Marker | null = null
  let bestD2 = Infinity
  const t = 14
  for (const m of markers.value) {
    const p = worldToScreen(m.x, m.y)
    const dx = p.sx - sx
    const dy = p.sy - sy
    const d2 = dx * dx + dy * dy
    if (d2 <= t * t && d2 < bestD2) {
      best = m
      bestD2 = d2
    }
  }
  return best
}

const dragState = reactive({ dragging: false, moved: false, startClientX: 0, startClientY: 0, startOffsetX: 0, startOffsetY: 0 })

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.setPointerCapture(e.pointerId)
  dragState.dragging = true
  dragState.moved = false
  dragState.startClientX = e.clientX
  dragState.startClientY = e.clientY
  dragState.startOffsetX = view.offsetX
  dragState.startOffsetY = view.offsetY
}

function onPointerMove(e: PointerEvent) {
  const pos = getCanvasRelativePosition(e)
  if (!pos) return
  if (dragState.dragging) {
    hasUserInteracted = true
    const dx = e.clientX - dragState.startClientX
    const dy = e.clientY - dragState.startClientY
    if (Math.abs(dx) + Math.abs(dy) > 5) dragState.moved = true
    view.offsetX = dragState.startOffsetX + dx
    view.offsetY = dragState.startOffsetY + dy
    scheduleRender()
    return
  }
  const w = screenToWorld(pos.sx, pos.sy)
  hoverWorld.value = clampWorld(w.wx, w.wy)
  scheduleRender()
}

function onPointerUp(e: PointerEvent) {
  if (!dragState.dragging) return
  dragState.dragging = false
  const pos = getCanvasRelativePosition(e)
  if (!pos) return
  if (dragState.moved) return

  hasUserInteracted = true
  const w = screenToWorld(pos.sx, pos.sy)
  const clamped = clampWorld(w.wx, w.wy)

  if (mode.value === 'mark') {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`
    markers.value.push({ id, x: clamped.x, y: clamped.y, label: `标记 ${markers.value.length + 1}`, note: '' })
    activeMarkerId.value = id
    selectedWorld.value = { x: clamped.x, y: clamped.y }
    scheduleRender()
    return
  }

  const hit = findMarkerAtScreen(pos.sx, pos.sy)
  if (hit) {
    activeMarkerId.value = hit.id
    selectedWorld.value = { x: hit.x, y: hit.y }
  } else {
    activeMarkerId.value = null
    selectedWorld.value = { x: clamped.x, y: clamped.y }
  }
  scheduleRender()
}

function onPointerLeave() {
  hoverWorld.value = null
  scheduleRender()
}

function handleWheel(e: WheelEvent) {
  const pos = getCanvasRelativePosition(e)
  if (!pos) return
  const wBefore = screenToWorld(pos.sx, pos.sy)
  const factor = Math.exp(-e.deltaY * 0.0015)
  const nextScale = Math.max(minScale, Math.min(maxScale, view.scale * factor))
  if (nextScale === view.scale) return

  view.scale = nextScale
  view.offsetX = pos.sx - wBefore.wx * view.scale
  view.offsetY = pos.sy - wBefore.wy * view.scale
  hasUserInteracted = true
  scheduleRender()
}

function resetView() {
  hasUserInteracted = false
  view.scale = 1
  centerMap()
  scheduleRender()
}

function adjustZoom(direction: 1 | -1) {
  const nextScale = direction === 1 ? view.scale * 1.12 : view.scale / 1.12
  view.scale = Math.max(minScale, Math.min(maxScale, nextScale))
  hasUserInteracted = true
  centerMap()
  scheduleRender()
}

function clearMarkers() {
  if (markers.value.length === 0) return
  if (!confirm('确定清空所有标记吗？')) return
  markers.value = []
  activeMarkerId.value = null
  selectedWorld.value = null
  scheduleRender()
}

function deleteMarker(id: string) {
  markers.value = markers.value.filter((m) => m.id !== id)
  if (activeMarkerId.value === id) activeMarkerId.value = null
  selectedWorld.value = null
  scheduleRender()
}

function selectMarker(id: string) {
  const m = markers.value.find((mm) => mm.id === id)
  if (!m) return
  activeMarkerId.value = id
  selectedWorld.value = { x: m.x, y: m.y }
  scheduleRender()
}

watch(() => [markers.value.length, showGrid.value, mode.value], () => scheduleRender())

onMounted(async () => {
  await nextTick()
  resizeCanvas()
  scheduleRender()
  if (canvasAreaRef.value) {
    resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
      scheduleRender()
    })
    resizeObserver.observe(canvasAreaRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
.gm-page {
  min-height: 100vh;
  background: #f8f9fa;
  color: #111;
}
.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.page-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.header-content {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
}
.logo i {
  color: #e53e3e;
}
.main-nav {
  display: flex;
  gap: 2rem;
}
.nav-link {
  color: #666;
  text-decoration: none;
  font-weight: 600;
}
.nav-link.active,
.nav-link:hover {
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
}
.user-avatar:hover {
  border-color: #e53e3e;
}
.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  min-width: 160px;
}
.user-menu a {
  display: block;
  padding: 0.75rem 1rem;
  color: #666;
  text-decoration: none;
  font-weight: 600;
}
.user-menu a:hover {
  background: #f5f5f5;
  color: #e53e3e;
}
.gm-main {
  padding: 2rem 0 2.5rem;
}
.gm-workspace {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.5rem;
}
.gm-map-col {
  min-width: 0;
}
.gm-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}
.gm-modes {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.gm-mode-btn {
  padding: 0.65rem 1.05rem;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
  background: #fff;
  cursor: pointer;
  color: #555;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.gm-mode-btn.active {
  border-color: #e53e3e;
  background: #e53e3e;
  color: #fff;
}
.gm-toolbar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.gm-scale-pill {
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #eee;
  color: #666;
  font-size: 0.92rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.gm-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #eee;
  background: #fff;
  cursor: pointer;
  color: #666;
}
.gm-icon-btn:hover:not(:disabled) {
  border-color: #e53e3e;
  color: #e53e3e;
}
.gm-icon-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.gm-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #eee;
  cursor: pointer;
  color: #666;
  font-weight: 700;
}
.gm-canvas-wrap {
  position: relative;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  overflow: hidden;
  min-height: 620px;
}
.gm-canvas {
  width: 100%;
  height: 640px;
  touch-action: none;
  display: block;
}
.gm-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.gm-readout {
  position: absolute;
  left: 14px;
  top: 14px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 0.65rem 0.85rem;
  font-size: 0.92rem;
  color: #333;
}
.gm-selected {
  position: absolute;
  right: 14px;
  top: 14px;
  background: rgba(229, 62, 62, 0.08);
  border: 1px solid rgba(229, 62, 62, 0.22);
  border-radius: 12px;
  padding: 0.6rem 0.85rem;
  color: #b83232;
  font-weight: 800;
  font-size: 0.92rem;
}
.gm-hint {
  margin-top: 0.8rem;
  color: #666;
  font-size: 0.95rem;
}
.gm-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.gm-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 1rem;
}
.gm-card-title {
  font-weight: 900;
  color: #1a1a1a;
  margin-bottom: 0.8rem;
}
.gm-card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
}
.gm-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.55rem 0;
  border-top: 1px dashed #f1f1f1;
  color: #666;
  gap: 0.8rem;
}
.gm-row:first-of-type {
  border-top: none;
  padding-top: 0;
}
.gm-row b {
  color: #1a1a1a;
  font-weight: 900;
}
.gm-empty {
  padding: 0.6rem 0.2rem;
  color: #666;
}
.gm-marker-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.gm-marker-item {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}
.gm-marker-pick {
  flex: 1;
  text-align: left;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #eee;
  background: #fff;
  cursor: pointer;
  font-weight: 800;
}
.gm-marker-pick:hover {
  background: #fafafa;
}
.gm-marker-pick.active {
  border-color: rgba(229, 62, 62, 0.45);
  background: rgba(229, 62, 62, 0.08);
  color: #b83232;
}
.gm-marker-del {
  border-radius: 10px;
  border: 1px solid rgba(229, 62, 62, 0.25);
  background: rgba(229, 62, 62, 0.08);
  color: #b83232;
  cursor: pointer;
  padding: 0.55rem 0.7rem;
  font-weight: 900;
}
.gm-link-btn {
  border: 0;
  background: transparent;
  color: #e53e3e;
  font-weight: 900;
  cursor: pointer;
}
.gm-link-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.gm-edit {
  margin-top: 1rem;
  border-top: 1px dashed #f1f1f1;
  padding-top: 0.9rem;
}
.gm-edit-title {
  font-weight: 900;
  margin-bottom: 0.6rem;
}
.gm-field {
  display: grid;
  gap: 0.35rem;
  margin-top: 0.65rem;
}
.gm-field:first-of-type {
  margin-top: 0;
}
.gm-field span {
  color: #666;
  font-weight: 700;
}
.gm-input {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  outline: none;
  font-size: 0.95rem;
}
.gm-textarea {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  outline: none;
  resize: vertical;
}
.page-footer {
  background: #1a1a1a;
  color: #999;
  margin-top: 2.5rem;
  padding: 2.5rem 0;
}
.footer-content {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
  align-items: center;
}
.footer-logo {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  font-weight: 800;
  color: #fff;
}
.footer-logo i {
  color: #e53e3e;
}
@media (max-width: 992px) {
  .gm-workspace {
    grid-template-columns: 1fr;
  }
}
</style>
