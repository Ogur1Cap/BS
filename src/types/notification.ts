export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'order' | 'system' | 'message';
  isRead: boolean;
  createdAt: string;
  relatedId?: string; // 关联的订单ID等
  /** Mock：仅顾客或仅打手可见，缺省为双方共用列表（兼容旧数据） */
  visibleFor?: 'all' | 'player' | 'customer'
}
