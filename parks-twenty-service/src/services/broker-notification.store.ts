import { randomUUID } from 'node:crypto';

import {
  type BrokerNotification,
  type BrokerNotificationPriority,
  type BrokerNotificationType,
} from '../types/broker-notification.types';
import {
  isNotificationVisibleToViewer,
  type NotificationAudienceViewer,
  resolveAudienceRoleLabelsForArea,
} from './notification-audience.util';

type CreateBrokerNotificationInput = {
  type: BrokerNotificationType;
  priority?: BrokerNotificationPriority;
  title: string;
  body: string;
  area?: string;
  opportunityId?: string;
  opportunityName?: string;
  actionPath?: string;
  actionLabel?: string;
  audienceRoleLabels?: string[];
  audienceNames?: string[];
};

type ListBrokerNotificationsOptions = NotificationAudienceViewer & {
  unreadOnly?: boolean;
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

const filterForViewer = (
  items: BrokerNotification[],
  viewer: NotificationAudienceViewer,
): BrokerNotification[] =>
  items.filter((notification) =>
    isNotificationVisibleToViewer(notification, viewer),
  );

export const brokerNotificationStore = {
  list: (options?: ListBrokerNotificationsOptions): BrokerNotification[] => {
    seedDemoNotifications();

    const sorted = [...notifications].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );

    const visible = filterForViewer(sorted, {
      viewerName: options?.viewerName,
      viewerRoleLabels: options?.viewerRoleLabels,
    });

    if (options?.unreadOnly) {
      return visible.filter((notification) => !notification.read);
    }

    return visible;
  },

  getUnreadCount: (viewer?: NotificationAudienceViewer): number =>
    brokerNotificationStore.list({
      unreadOnly: true,
      viewerName: viewer?.viewerName,
      viewerRoleLabels: viewer?.viewerRoleLabels,
    }).length,

  add: (input: CreateBrokerNotificationInput): BrokerNotification => {
    const audienceRoleLabels = Array.isArray(input.audienceRoleLabels)
      ? input.audienceRoleLabels
      : resolveAudienceRoleLabelsForArea(input.area);

    const notification: BrokerNotification = {
      id: randomUUID(),
      type: input.type,
      priority: input.priority ?? 'normal',
      title: input.title,
      body: input.body,
      area: input.area,
      opportunityId: input.opportunityId,
      opportunityName: input.opportunityName,
      actionPath: input.actionPath,
      actionLabel: input.actionLabel,
      audienceRoleLabels,
      audienceNames: input.audienceNames,
      read: false,
      createdAt: new Date().toISOString(),
    };

    notifications.unshift(notification);

    return notification;
  },

  markRead: (notificationId: string): BrokerNotification | null => {
    const notification = notifications.find(
      (item) => item.id === notificationId,
    );

    if (!notification) {
      return null;
    }

    notification.read = true;

    return notification;
  },

  markAllRead: (viewer?: NotificationAudienceViewer): number => {
    const visibleIds = new Set(
      brokerNotificationStore.list(viewer).map((notification) => notification.id),
    );
    let updatedCount = 0;

    for (const notification of notifications) {
      if (visibleIds.has(notification.id) && !notification.read) {
        notification.read = true;
        updatedCount += 1;
      }
    }

    return updatedCount;
  },
};
