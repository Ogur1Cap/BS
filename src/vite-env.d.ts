/// <reference types="vite/client" />

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 需要的最小 userLevel（0 顾客 / 1 打手） */
    minUserLevel?: number
    /** 仅顾客可访问（打手 / BOSS 将重定向首页） */
    customerOnly?: boolean
    /** 仅打手（1 级）可访问 */
    playerOnly?: boolean
  }
}

