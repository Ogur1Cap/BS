<template>
  <div class="game-map-page">
    <Header :current-user="currentUser" :user-avatar="userAvatar" @logout="handleLogout" />

    <main class="gm-main">
      <section class="gm-workspace container">
        <div class="gm-map-col">
          <div class="gm-toolbar gm-card">
            <div class="gm-toolbar-group">
              <div class="gm-title">零号大坝地图工具</div>
              <div class="gm-subtitle">分层查看 / 快速定位 / 点位过滤</div>
            </div>
            <div class="gm-toolbar-right">
              <div class="gm-scale-pill">
                <span>缩放</span>
                <b>{{ Math.round(view.scale * 100) }}%</b>
              </div>
              <button class="gm-icon-btn" :disabled="view.scale >= maxScale" @click="adjustZoom(1)" title="放大">
                <i class="fa fa-search-plus"></i>
              </button>
              <button class="gm-icon-btn" :disabled="view.scale <= minScale" @click="adjustZoom(-1)" title="缩小">
                <i class="fa fa-search-minus"></i>
              </button>
              <button class="gm-icon-btn" @click="resetView" title="重置视角">
                <i class="fa fa-crosshairs"></i>
              </button>
            </div>
          </div>

          <div class="gm-tabs-row">
            <div class="gm-tab-wrap">
              <button
                v-for="tab in modeTabs"
                :key="tab.value"
                class="gm-tab-btn"
                :class="{ active: selectedMapMode === tab.value }"
                @click="selectedMapMode = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>
            <div class="gm-tab-wrap">
              <button
                v-for="level in securityLevels"
                :key="level.value"
                class="gm-tab-btn gm-tab-btn-small"
                :class="{ active: selectedSecurity === level.value }"
                @click="selectedSecurity = level.value"
              >
                {{ level.label }}
              </button>
            </div>
            <div class="gm-floor-wrap">
              <button
                v-for="f in floorOptions"
                :key="f.value"
                class="gm-floor-btn"
                :class="{ active: selectedFloor === f.value }"
                @click="selectedFloor = f.value"
              >
                {{ f.label }}
              </button>
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
                坐标：({{ fmt(hoverWorld.x) }}, {{ fmt(hoverWorld.y) }})
              </div>
              <div class="gm-selected">
                楼层：{{ selectedFloorLabel }} | 显示点位：{{ visiblePois.length }}
              </div>
            </div>
          </div>
          <div class="gm-hint">左键拖拽平移，滚轮缩放；“添加标记”模式可在地图上落点。</div>
        </div>

        <aside class="gm-side">
          <div class="gm-card">
            <div class="gm-card-title">快速定位</div>
            <div class="gm-search">
              <input
                v-model.trim="searchKeyword"
                class="gm-input"
                type="text"
                placeholder="输入点位名，例如 行政补给站"
                @keyup.enter="jumpToFirstSearchPoi"
              />
              <button class="gm-link-btn" :disabled="!searchResultPois.length" @click="jumpToFirstSearchPoi">定位</button>
            </div>
            <div class="gm-empty" v-if="searchKeyword && !searchResultPois.length">未找到匹配点位</div>
            <div class="gm-list" v-if="searchResultPois.length">
              <button
                v-for="poi in searchResultPois.slice(0, 6)"
                :key="poi.id"
                class="gm-item-btn"
                @click="jumpToPoi(poi)"
              >
                {{ poi.name }}
              </button>
            </div>
          </div>

          <div class="gm-card">
            <div class="gm-card-title">地图图层</div>
            <label class="gm-switch-line">
              <input type="checkbox" v-model="showGrid" />
              <span>显示网格</span>
            </label>
            <label class="gm-switch-line">
              <input type="checkbox" v-model="showOfficialPois" />
              <span>显示官方点位</span>
            </label>
            <label class="gm-switch-line">
              <input type="checkbox" v-model="showCustomMarkers" />
              <span>显示自定义标记</span>
            </label>
            <label class="gm-switch-line">
              <input type="checkbox" v-model="eventEnabled" />
              <span>开启随机事件预览</span>
            </label>
          </div>

          <div class="gm-card">
            <div class="gm-card-title">交互模式</div>
            <div class="gm-tab-wrap">
              <button class="gm-tab-btn gm-tab-btn-small" :class="{ active: mode === 'inspect' }" @click="mode = 'inspect'">查看/选点</button>
              <button class="gm-tab-btn gm-tab-btn-small" :class="{ active: mode === 'mark' }" @click="mode = 'mark'">添加标记</button>
            </div>
            <div class="gm-row">
              <span>当前事件</span>
              <b>{{ activeEventLabel }}</b>
            </div>
            <div class="gm-row">
              <span>当前坐标</span>
              <b>{{ selectedWorld ? `${fmt(selectedWorld.x)}, ${fmt(selectedWorld.y)}` : '未选择' }}</b>
            </div>
          </div>

          <div class="gm-card">
            <div class="gm-card-title gm-card-title-row">
              <span>我的标记</span>
              <button class="gm-link-btn" :disabled="markers.length === 0" @click="clearMarkers">清空</button>
            </div>
            <div v-if="markers.length === 0" class="gm-empty">暂无标记</div>
            <div v-else class="gm-list">
              <div class="gm-marker-item" v-for="m in markers" :key="m.id">
                <button class="gm-item-btn" :class="{ active: m.id === activeMarkerId }" @click="selectMarker(m.id)">
                  {{ m.label }}
                </button>
                <button class="gm-del-btn" @click="deleteMarker(m.id)">删</button>
              </div>
            </div>
            <div v-if="activeMarker" class="gm-edit">
              <label class="gm-field">
                <span>名称</span>
                <input v-model="activeMarker.label" class="gm-input" @blur="persistActiveMarker" />
              </label>
              <label class="gm-field">
                <span>备注</span>
                <textarea v-model="activeMarker.note" class="gm-textarea" rows="3" @blur="persistActiveMarker"></textarea>
              </label>
            </div>
          </div>
        </aside>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../layouts/Header.vue'
import Footer from '../layouts/Footer.vue'
import zeroMap from '../image/Zero.jpeg'
import { isMockMode } from '../api/apiMode'
import { gameMapApi } from '../api/gameMapApi'
import type { MapMarkerDto } from '../types/gameMap'

type DrawMode = 'inspect' | 'mark'
type SceneMode = 'normal' | 'attack' | 'occupy'
type Security = 'normal' | 'secret' | 'top-secret'
type Floor = 1 | 2 | 3 | 4
type EventKey = 'none' | 'crash' | 'bridge' | 'fire'
type PoiType = 'resource' | 'spawn' | 'extract' | 'boss' | 'vehicle'
type Marker = { id: string; x: number; y: number; label: string; note: string }
type Poi = {
  id: string
  name: string
  x: number
  y: number
  floor: Floor
  type: PoiType
  modes: SceneMode[]
  security: Security[]
}

const router = useRouter()
const currentUser = ref<{ username?: string; avatar?: string }>({ username: '' })
const userAvatar = ref('https://picsum.photos/id/237/200/200')

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasAreaRef = ref<HTMLDivElement | null>(null)
const mapImage = new Image()
mapImage.src = zeroMap

const bounds = reactive({ width: 1800, height: 1200 })
const minScale = 0.35
const maxScale = 4
const view = reactive({ scale: 1, offsetX: 0, offsetY: 0 })
const mode = ref<DrawMode>('inspect')
const showGrid = ref(true)
const showOfficialPois = ref(true)
const showCustomMarkers = ref(true)
const eventEnabled = ref(false)

const selectedMapMode = ref<SceneMode>('normal')
const selectedSecurity = ref<Security>('normal')
const selectedFloor = ref<Floor>(1)
const selectedWorld = ref<{ x: number; y: number } | null>(null)
const hoverWorld = ref<{ x: number; y: number } | null>(null)
const searchKeyword = ref('')

const modeTabs = [
  { value: 'normal', label: '常规' },
  { value: 'attack', label: '攻防' },
  { value: 'occupy', label: '占领' }
] as const
const securityLevels = [
  { value: 'normal', label: '常规' },
  { value: 'secret', label: '机密' },
  { value: 'top-secret', label: '绝密' }
] as const
const floorOptions = [
  { value: 1, label: '1F' },
  { value: 2, label: '2F' },
  { value: 3, label: '3F' },
  { value: 4, label: '4F' }
] as const

const defaultPois: Poi[] = [
  { id: 'p1', name: '行政补给站', x: 360, y: 250, floor: 1, type: 'resource', modes: ['normal', 'attack'], security: ['normal', 'secret'] },
  { id: 'p2', name: '观察塔出生点', x: 210, y: 780, floor: 1, type: 'spawn', modes: ['normal', 'occupy'], security: ['normal', 'secret', 'top-secret'] },
  { id: 'p3', name: '下水道撤离点', x: 1460, y: 1020, floor: 1, type: 'extract', modes: ['normal'], security: ['normal', 'secret'] },
  { id: 'p4', name: '博弈首领点', x: 1280, y: 420, floor: 2, type: 'boss', modes: ['attack'], security: ['secret', 'top-secret'] },
  { id: 'p5', name: '装甲补给车位', x: 820, y: 680, floor: 2, type: 'vehicle', modes: ['occupy', 'attack'], security: ['normal', 'secret'] },
  { id: 'p6', name: '指挥层资源箱', x: 970, y: 300, floor: 3, type: 'resource', modes: ['normal', 'attack'], security: ['secret', 'top-secret'] },
  { id: 'p7', name: '顶层临时撤离', x: 1540, y: 190, floor: 4, type: 'extract', modes: ['occupy'], security: ['top-secret'] }
]

const allPois = ref<Poi[]>([...defaultPois])

/** 后端 POI 行 → 画布逻辑用的结构 */
function poiFromApiRow(raw: Record<string, unknown>): Poi {
  const f = Number(raw.floor)
  const floor = (f >= 1 && f <= 4 ? f : 1) as Floor
  return {
    id: String(raw.id),
    name: String(raw.name ?? ''),
    x: Number(raw.x),
    y: Number(raw.y),
    floor,
    type: (raw.type as PoiType) || 'resource',
    modes: (Array.isArray(raw.modes) ? raw.modes : ['normal']) as SceneMode[],
    security: (Array.isArray(raw.security) ? raw.security : ['normal']) as Security[]
  }
}

function toLocalMarker(d: MapMarkerDto): Marker {
  return {
    id: String(d.id),
    x: Number(d.x),
    y: Number(d.y),
    label: d.label,
    note: d.note ?? ''
  }
}

/** 名称 / 备注失焦时同步到后端（真实模式） */
async function persistActiveMarker() {
  const m = activeMarker.value
  if (!m || isMockMode()) return
  try {
    const list = await gameMapApi.updateMarker(m.id, { label: m.label, note: m.note })
    markers.value = list.map(toLocalMarker)
    activeMarkerId.value = m.id
  } catch {
    /* 网络异常时保留本地编辑，不打扰操作 */
  }
  scheduleRender()
}

const markers = ref<Marker[]>([])
const activeMarkerId = ref<string | null>(null)
const activeMarker = computed(() => markers.value.find((m) => m.id === activeMarkerId.value) ?? null)

const selectedFloorLabel = computed(() => floorOptions.find((f) => f.value === selectedFloor.value)?.label ?? '1F')
const activeEvent = computed<EventKey>(() => {
  if (!eventEnabled.value) return 'none'
  const keyPool: EventKey[] = ['crash', 'bridge', 'fire']
  const index = selectedFloor.value % keyPool.length
  return keyPool[index]
})
const activeEventLabel = computed(() => {
  const map: Record<EventKey, string> = {
    none: '无',
    crash: '坠机事件',
    bridge: '断桥事件',
    fire: '森林山火'
  }
  return map[activeEvent.value]
})

const visiblePois = computed(() => {
  return allPois.value.filter((p) => {
    return (
      p.floor === selectedFloor.value &&
      p.modes.includes(selectedMapMode.value) &&
      p.security.includes(selectedSecurity.value)
    )
  })
})
const searchResultPois = computed(() => {
  if (!searchKeyword.value) return visiblePois.value
  const q = searchKeyword.value.toLowerCase()
  return visiblePois.value.filter((p) => p.name.toLowerCase().includes(q))
})

const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : '0.0')

let resizeObserver: ResizeObserver | null = null
let dpr = 1
let initDone = false
let hasUserInteracted = false
let renderQueued = false

const isAuthenticated = () => !!localStorage.getItem('delta_token') || !!sessionStorage.getItem('delta_token')
const handleLogout = () => {
  localStorage.removeItem('delta_token')
  localStorage.removeItem('delta_user')
  sessionStorage.removeItem('delta_token')
  sessionStorage.removeItem('delta_user')
  router.push('/login')
}

function clampWorld(wx: number, wy: number) {
  return { x: Math.min(bounds.width, Math.max(0, wx)), y: Math.min(bounds.height, Math.max(0, wy)) }
}
function worldToScreen(wx: number, wy: number) {
  return { sx: wx * view.scale + view.offsetX, sy: wy * view.scale + view.offsetY }
}
function screenToWorld(sx: number, sy: number) {
  return { wx: (sx - view.offsetX) / view.scale, wy: (sy - view.offsetY) / view.scale }
}
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
  const h = Math.max(460, rect.height)
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
function drawGrid(ctx: CanvasRenderingContext2D, mapLeft: number, mapTop: number, mapW: number, mapH: number) {
  if (!showGrid.value) return
  const step = 120
  ctx.save()
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)'
  ctx.lineWidth = 1
  for (let x = 0; x <= bounds.width; x += step) {
    const p = worldToScreen(x, 0)
    ctx.beginPath()
    ctx.moveTo(p.sx, mapTop)
    ctx.lineTo(p.sx, mapTop + mapH)
    ctx.stroke()
  }
  for (let y = 0; y <= bounds.height; y += step) {
    const p = worldToScreen(0, y)
    ctx.beginPath()
    ctx.moveTo(mapLeft, p.sy)
    ctx.lineTo(mapLeft + mapW, p.sy)
    ctx.stroke()
  }
  ctx.restore()
}
function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.clientWidth
  const height = canvas.clientHeight
  const mapLeft = view.offsetX
  const mapTop = view.offsetY
  const mapW = bounds.width * view.scale
  const mapH = bounds.height * view.scale

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, width, height)

  if (mapImage.complete) {
    ctx.save()
    ctx.globalAlpha = 0.92
    ctx.drawImage(mapImage, mapLeft, mapTop, mapW, mapH)
    ctx.restore()
  } else {
    ctx.fillStyle = 'rgba(148, 163, 184, 0.06)'
    ctx.fillRect(mapLeft, mapTop, mapW, mapH)
  }

  ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)'
  ctx.lineWidth = 2
  ctx.strokeRect(mapLeft, mapTop, mapW, mapH)
  drawGrid(ctx, mapLeft, mapTop, mapW, mapH)

  if (eventEnabled.value) {
    const eventTone: Record<EventKey, string> = {
      none: 'transparent',
      crash: 'rgba(249, 115, 22, 0.08)',
      bridge: 'rgba(239, 68, 68, 0.08)',
      fire: 'rgba(234, 179, 8, 0.08)'
    }
    ctx.fillStyle = eventTone[activeEvent.value]
    ctx.fillRect(mapLeft, mapTop, mapW, mapH)
  }

  if (showOfficialPois.value) {
    for (const poi of visiblePois.value) {
      const p = worldToScreen(poi.x, poi.y)
      const colors: Record<PoiType, string> = {
        resource: '#60a5fa',
        spawn: '#34d399',
        extract: '#fbbf24',
        boss: '#f87171',
        vehicle: '#c084fc'
      }
      ctx.fillStyle = colors[poi.type]
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(p.sx, p.sy, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  }

  if (showCustomMarkers.value) {
    for (const m of markers.value) {
      const p = worldToScreen(m.x, m.y)
      const isActive = m.id === activeMarkerId.value
      ctx.fillStyle = isActive ? '#ef4444' : '#93c5fd'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(p.sx, p.sy, isActive ? 9 : 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      if (isActive) {
        ctx.fillStyle = '#f8fafc'
        ctx.font = '12px Segoe UI, Arial'
        ctx.fillText(m.label, p.sx + 10, p.sy - 10)
      }
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
  const threshold = 14
  for (const m of markers.value) {
    const p = worldToScreen(m.x, m.y)
    const dx = p.sx - sx
    const dy = p.sy - sy
    const d2 = dx * dx + dy * dy
    if (d2 <= threshold * threshold && d2 < bestD2) {
      best = m
      bestD2 = d2
    }
  }
  return best
}
function findPoiAtScreen(sx: number, sy: number) {
  let best: Poi | null = null
  let bestD2 = Infinity
  const threshold = 12
  for (const p of visiblePois.value) {
    const s = worldToScreen(p.x, p.y)
    const dx = s.sx - sx
    const dy = s.sy - sy
    const d2 = dx * dx + dy * dy
    if (d2 <= threshold * threshold && d2 < bestD2) {
      best = p
      bestD2 = d2
    }
  }
  return best
}

const dragState = reactive({
  dragging: false,
  moved: false,
  startClientX: 0,
  startClientY: 0,
  startOffsetX: 0,
  startOffsetY: 0
})

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
  selectedWorld.value = { x: clamped.x, y: clamped.y }

  if (mode.value === 'mark') {
    const label = `标记 ${markers.value.length + 1}`
    if (isMockMode()) {
      const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`
      markers.value.push({ id, x: clamped.x, y: clamped.y, label, note: '' })
      activeMarkerId.value = id
    } else {
      void gameMapApi
        .addMarker({ x: clamped.x, y: clamped.y, label, note: '' })
        .then((list) => {
          markers.value = list.map(toLocalMarker)
          activeMarkerId.value = markers.value[0]?.id ?? null
          scheduleRender()
        })
        .catch(() => {
          scheduleRender()
        })
    }
    scheduleRender()
    return
  }

  const marker = findMarkerAtScreen(pos.sx, pos.sy)
  if (marker) {
    activeMarkerId.value = marker.id
    selectedWorld.value = { x: marker.x, y: marker.y }
  } else {
    activeMarkerId.value = null
    const poi = findPoiAtScreen(pos.sx, pos.sy)
    if (poi) selectedWorld.value = { x: poi.x, y: poi.y }
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
  view.scale = Math.max(minScale, Math.min(maxScale, direction === 1 ? view.scale * 1.15 : view.scale / 1.15))
  hasUserInteracted = true
  centerMap()
  scheduleRender()
}
async function clearMarkers() {
  if (!markers.value.length) return
  if (!confirm('确定清空所有标记吗？')) return
  if (isMockMode()) {
    markers.value = []
    activeMarkerId.value = null
    selectedWorld.value = null
    scheduleRender()
    return
  }
  const ids = markers.value.map((m) => m.id)
  try {
    let last: MapMarkerDto[] = []
    for (const id of ids) {
      last = await gameMapApi.deleteMarker(id)
    }
    markers.value = last.map(toLocalMarker)
    activeMarkerId.value = null
    selectedWorld.value = null
  } catch {
    /* 忽略 */
  }
  scheduleRender()
}
async function deleteMarker(id: string) {
  if (isMockMode()) {
    markers.value = markers.value.filter((m) => m.id !== id)
    if (activeMarkerId.value === id) activeMarkerId.value = null
    scheduleRender()
    return
  }
  try {
    const list = await gameMapApi.deleteMarker(id)
    markers.value = list.map(toLocalMarker)
    if (activeMarkerId.value === id) activeMarkerId.value = null
  } catch {
    /* 忽略 */
  }
  scheduleRender()
}
function selectMarker(id: string) {
  const marker = markers.value.find((m) => m.id === id)
  if (!marker) return
  activeMarkerId.value = id
  selectedWorld.value = { x: marker.x, y: marker.y }
  focusAt(marker.x, marker.y)
}
function focusAt(wx: number, wy: number) {
  const area = canvasAreaRef.value
  if (!area) return
  const rect = area.getBoundingClientRect()
  view.offsetX = rect.width / 2 - wx * view.scale
  view.offsetY = rect.height / 2 - wy * view.scale
  scheduleRender()
}
function jumpToPoi(poi: Poi) {
  selectedFloor.value = poi.floor
  selectedWorld.value = { x: poi.x, y: poi.y }
  focusAt(poi.x, poi.y)
}
function jumpToFirstSearchPoi() {
  if (!searchResultPois.value.length) return
  jumpToPoi(searchResultPois.value[0])
}

watch(
  () => [
    selectedFloor.value,
    selectedMapMode.value,
    selectedSecurity.value,
    showGrid.value,
    showOfficialPois.value,
    showCustomMarkers.value,
    eventEnabled.value,
    mode.value,
    markers.value.length
  ],
  () => scheduleRender()
)

onMounted(async () => {
  if (!isAuthenticated()) {
    router.push('/login')
    return
  }

  try {
    const userStr = localStorage.getItem('delta_user') || sessionStorage.getItem('delta_user')
    if (userStr) {
      const user = JSON.parse(userStr)
      currentUser.value = user
      userAvatar.value = user.avatar || userAvatar.value
    }
  } catch {
    // ignore parse error
  }

  // 真实后端：同步官方 POI 与用户标记（失败则沿用页面内置默认数据）
  if (!isMockMode()) {
    try {
      const pois = await gameMapApi.listPois()
      if (pois.length) {
        allPois.value = pois.map((row) => poiFromApiRow(row as Record<string, unknown>))
      } else {
        allPois.value = [...defaultPois]
      }
      const ms = await gameMapApi.listMarkers()
      markers.value = ms.map(toLocalMarker)
    } catch {
      allPois.value = [...defaultPois]
    }
  }

  await nextTick()
  resizeCanvas()
  scheduleRender()
  mapImage.onload = () => {
    bounds.width = mapImage.naturalWidth || bounds.width
    bounds.height = mapImage.naturalHeight || bounds.height
    resetView()
  }
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
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
.game-map-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #111827 0%, #0f172a 100%);
  color: #e5e7eb;
}
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.2rem;
}
.gm-main {
  padding: 1.4rem 0 3rem;
}
.gm-workspace {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 1rem;
}
.gm-map-col {
  min-width: 0;
}
.gm-card {
  background: rgba(2, 6, 23, 0.35);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 14px;
  padding: 0.9rem;
}
.gm-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  gap: 0.8rem;
}
.gm-toolbar-group {
  min-width: 0;
}
.gm-title {
  font-weight: 800;
  color: #f8fafc;
}
.gm-subtitle {
  margin-top: 0.15rem;
  color: #94a3b8;
  font-size: 0.9rem;
}
.gm-toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.gm-scale-pill {
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: #0b1220;
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #cbd5e1;
  display: flex;
  gap: 0.45rem;
  font-size: 0.9rem;
}
.gm-icon-btn {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 10px;
  background: #0b1220;
  color: #cbd5e1;
  cursor: pointer;
}
.gm-icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.gm-tabs-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.7rem;
  margin-bottom: 0.8rem;
}
.gm-tab-wrap,
.gm-floor-wrap {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}
.gm-tab-btn,
.gm-floor-btn {
  border: 1px solid rgba(148, 163, 184, 0.26);
  background: #0b1220;
  color: #cbd5e1;
  border-radius: 10px;
  padding: 0.45rem 0.7rem;
  cursor: pointer;
  font-size: 0.88rem;
}
.gm-tab-btn.active,
.gm-floor-btn.active {
  background: #2563eb;
  color: #fff;
  border-color: rgba(59, 130, 246, 0.6);
}
.gm-tab-btn-small {
  padding: 0.4rem 0.6rem;
}
.gm-canvas-wrap {
  position: relative;
  height: 680px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.22);
}
.gm-canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
}
.gm-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.gm-readout,
.gm-selected {
  position: absolute;
  top: 14px;
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  font-size: 0.88rem;
}
.gm-readout {
  left: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(2, 6, 23, 0.85);
}
.gm-selected {
  right: 14px;
  border: 1px solid rgba(59, 130, 246, 0.35);
  background: rgba(37, 99, 235, 0.2);
}
.gm-hint {
  margin-top: 0.7rem;
  color: #94a3b8;
  font-size: 0.9rem;
}
.gm-side {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.gm-card-title {
  color: #f8fafc;
  font-weight: 800;
  margin-bottom: 0.75rem;
}
.gm-card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.gm-search {
  display: flex;
  gap: 0.5rem;
}
.gm-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.gm-item-btn {
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: #0b1220;
  color: #e5e7eb;
  border-radius: 9px;
  padding: 0.5rem 0.65rem;
  cursor: pointer;
  text-align: left;
}
.gm-item-btn.active {
  border-color: rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.12);
}
.gm-marker-item {
  display: flex;
  gap: 0.4rem;
}
.gm-del-btn {
  width: 32px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.12);
  color: #fecaca;
  border-radius: 8px;
  cursor: pointer;
}
.gm-switch-line {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.55rem;
  color: #cbd5e1;
}
.gm-row {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  color: #94a3b8;
  padding-top: 0.6rem;
  border-top: 1px dashed rgba(148, 163, 184, 0.2);
  margin-top: 0.6rem;
}
.gm-row b {
  color: #f1f5f9;
}
.gm-link-btn {
  border: none;
  background: transparent;
  color: #60a5fa;
  cursor: pointer;
  font-weight: 700;
}
.gm-link-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.gm-empty {
  color: #94a3b8;
  font-size: 0.88rem;
}
.gm-edit {
  margin-top: 0.7rem;
  border-top: 1px dashed rgba(148, 163, 184, 0.2);
  padding-top: 0.7rem;
}
.gm-field {
  display: grid;
  gap: 0.3rem;
  margin-top: 0.5rem;
}
.gm-field span {
  color: #94a3b8;
}
.gm-input,
.gm-textarea {
  border: 1px solid rgba(148, 163, 184, 0.26);
  border-radius: 9px;
  padding: 0.55rem 0.65rem;
  outline: none;
  background: #0b1220;
  color: #e5e7eb;
}
@media (max-width: 1080px) {
  .gm-workspace {
    grid-template-columns: 1fr;
  }
}
</style>