export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'order' | 'system' | 'message';
  isRead: boolean;
  createdAt: string;
  relatedId?: string; // 关联的订单ID等
}
