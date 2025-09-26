import { Notification } from '../type/notification';

// 模拟通知数据
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: '订单已完成',
    content: '您的"三角洲行动全程护航"订单已完成，感谢使用我们的服务',
    type: 'order',
    isRead: false,
    createdAt: '2023-10-17T15:30:00',
    relatedId: 'ORD-87621'
  },
  {
    id: 'notif-2',
    title: '新消息提醒',
    content: '打手"精英玩家007"已回复您的咨询',
    type: 'message',
    isRead: false,
    createdAt: '2023-10-17T10:15:00',
    relatedId: 'MSG-4567'
  },
  {
    id: 'notif-3',
    title: '系统公告',
    content: '本周特惠活动：所有护航服务享受8折优惠，截止日期10月31日',
    type: 'system',
    isRead: true,
    createdAt: '2023-10-16T09:00:00'
  },
  {
    id: 'notif-4',
    title: '订单已接单',
    content: '您的"绝地求生段位提升"订单已被打手接单',
    type: 'order',
    isRead: true,
    createdAt: '2023-10-15T20:45:00',
    relatedId: 'ORD-87542'
  }
];

// 通知服务
export const notificationService = {
  // 获取所有通知
  async getNotifications(): Promise<Notification[]> {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockNotifications];
  },
  
  // 获取未读通知数量
  async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications();
    return notifications.filter(notification => !notification.isRead).length;
  },
  
  // 标记通知为已读
  async markAsRead(notificationId: string): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      mockNotifications[index].isRead = true;
    }
    return [...mockNotifications];
  },
  
  // 删除通知
  async deleteNotification(notificationId: string): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      mockNotifications.splice(index, 1);
    }
    return [...mockNotifications];
  },
  
  // 标记所有通知为已读
  async markAllAsRead(): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockNotifications.forEach(n => {
      n.isRead = true;
    });
    return [...mockNotifications];
  }
};
