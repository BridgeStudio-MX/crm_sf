import { useCallback, useEffect } from 'react';

import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { fetchParksNotifications } from '@/parks-industrial/services/parks-commercial.client';
import { parksNotificationsUnreadCountState } from '@/parks-industrial/states/parksNotificationsUnreadCountState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const REFRESH_INTERVAL_MS = 15_000;

// Keeps the nav badge fresh even when Notificaciones page is closed.
export const useParksNotificationsUnreadCount = (): number => {
  const { displayName, userEmail, parksRoleLabels } = useParksAccess();
  const [unreadCount, setUnreadCount] = useAtomState(
    parksNotificationsUnreadCountState,
  );

  const refresh = useCallback(async () => {
    try {
      const response = await fetchParksNotifications({
        unreadOnly: true,
        viewerName: displayName || undefined,
        viewerEmail: userEmail || undefined,
        viewerRoleLabels: parksRoleLabels,
      });
      setUnreadCount(response.unreadCount);
    } catch {
      // Keep last known count if the parks service is briefly unavailable.
    }
  }, [displayName, parksRoleLabels, setUnreadCount, userEmail]);

  useEffect(() => {
    void refresh();

    const intervalId = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  return unreadCount;
};
