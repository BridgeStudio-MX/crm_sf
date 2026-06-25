import { useCallback, useEffect, useState } from 'react';

import {
  fetchParksNotifications,
  markAllParksNotificationsRead,
  markParksNotificationRead,
} from '@/parks-industrial/services/parks-commercial.client';
import { type BrokerNotification } from '@/parks-industrial/types/parks-commercial.types';

const REFRESH_INTERVAL_MS = 30_000;

export const useParksNotifications = () => {
  const [notifications, setNotifications] = useState<BrokerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetchParksNotifications();
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      setError(null);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : 'No se pudieron cargar las notificaciones';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const intervalId = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  const markRead = useCallback(
    async (notificationId: string) => {
      const result = await markParksNotificationRead(notificationId);
      setUnreadCount(result.unreadCount);
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );
    },
    [],
  );

  const markAllRead = useCallback(async () => {
    await markAllParksNotificationsRead();
    setUnreadCount(0);
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  };
};
