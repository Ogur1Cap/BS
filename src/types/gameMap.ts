/** 地图标记 DTO（与后端 user_map_markers 序列化一致） */
export interface MapMarkerDto {
  id: string
  x: number
  y: number
  label: string
  note: string
}
