import { randomUUID } from 'node:crypto';

import {
  type BrokerNotification,
  type BrokerNotificationPriority,
  type BrokerNotificationType,
} from '../types/broker-notification.types';

type CreateBrokerNotificationInput = {
  type: BrokerNotificationType;
  priority?: BrokerNotificationPriority;
  title: string;
  body: string;
  area?: string;
  opportunityId?: string;
  opportunityName?: string;
};

const notifications: BrokerNotification[] = [];

const seedDemoNotifications = (): void => {
  if (notifications.length > 0) {
    return;
  }

  const demoItems: CreateBrokerNotificationInput[] = [
    {
      type: 'system',
      priority: 'low',
      title: 'Centro de notificaciones activo',
      body: 'Las alertas de leads, enriquecimiento IA y tareas automáticas aparecerán aquí.',
      area: 'Parks',
    },
  ];

  for (const item of demoItems) {
    brokerNotificationStore.add(item);
  }
};

export const brokerNotificationStore = {
  list: (options?: { unreadOnly?: boolean }): BrokerNotification[] => {
    seedDemoNotifications();

    const sorted = [...notifications].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );

    if (options?.unreadOnly) {
      return sorted.filter((notification) => !notification.read);
    }

    return sorted;
  },

  getUnreadCount: (): number =>
    brokerNotificationStore.list({ unreadOnly: true }).length,

  add: (input: CreateBrokerNotificationInput): BrokerNotification => {
    const notification: BrokerNotification = {
      id: randomUUID(),
      type: input.type,
      priority: input.priority ?? 'normal',
      title: input.title,
      body: input.body,
      area: input.area,
      opportunityId: input.opportunityId,
      opportunityName: input.opportunityName,
      read: false,
      createdAt: new Date().toISOString(),
    };

    notifications.unshift(notification);

    return notification;
  },

  markRead: (notificationId: string): BrokerNotification | null => {
    const notification = notifications.find((item) => item.id === notificationId);

    if (!notification) {
      return null;
    }

    notification.read = true;

    return notification;
  },

  markAllRead: (): number => {
    let updatedCount = 0;

    for (const notification of notifications) {
      if (!notification.read) {
        notification.read = true;
        updatedCount += 1;
      }
    }

    return updatedCount;
  },
};
