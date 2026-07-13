import { useCallback, useEffect, useState } from 'react';

import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import {
  fetchParksNotifications,
  markAllParksNotificationsRead,
  markParksNotificationRead,
} from '@/parks-industrial/services/parks-commercial.client';
import { parksNotificationsUnreadCountState } from '@/parks-industrial/states/parksNotificationsUnreadCountState';
import { type BrokerNotification } from '@/parks-industrial/types/parks-commercial.types';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const REFRESH_INTERVAL_MS = 30_000;

export const useParksNotifications = () => {
  const { displayName, userEmail, parksRoleLabels } = useParksAccess();
  const [notifications, setNotifications] = useState<BrokerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setNavUnreadCount = useSetAtomState(
    parksNotificationsUnreadCountState,
  );

  const refresh = useCallback(async () => {
    try {
      const response = await fetchParksNotifications({
        viewerName: displayName || undefined,
        viewerEmail: userEmail || undefined,
        viewerRoleLabels: parksRoleLabels,
      });
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      setNavUnreadCount(response.unreadCount);
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
  }, [displayName, parksRoleLabels, setNavUnreadCount, userEmail]);

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
      const result = await markParksNotificationRead({
        notificationId,
        viewerName: displayName || undefined,
        viewerEmail: userEmail || undefined,
        viewerRoleLabels: parksRoleLabels,
      });
      setUnreadCount(result.unreadCount);
      setNavUnreadCount(result.unreadCount);
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );
    },
    [displayName, parksRoleLabels, setNavUnreadCount, userEmail],
  );

  const markAllRead = useCallback(async () => {
    await markAllParksNotificationsRead({
      viewerName: displayName || undefined,
      viewerEmail: userEmail || undefined,
      viewerRoleLabels: parksRoleLabels,
    });
    setUnreadCount(0);
    setNavUnreadCount(0);
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  }, [displayName, parksRoleLabels, setNavUnreadCount, userEmail]);

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
