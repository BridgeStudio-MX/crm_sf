import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Captures the last non-settings URL so ✕ in Settings returns to Parks,
// even when entry used a plain Link without openSettingsMenu().
export const SettingsEntryEffect = () => {
  const { pathname, search } = useLocation();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  const setNavigationDrawerExpandedMemorized = useSetAtomState(
    navigationDrawerExpandedMemorizedState,
  );
  const setNavigationMemorizedUrl = useSetAtomState(navigationMemorizedUrlState);
  const lastNonSettingsPathRef = useRef('/parks/pipeline');

  useEffect(() => {
    const isSettingsPath =
      pathname === '/settings' || pathname.startsWith('/settings/');

    if (!isSettingsPath) {
      lastNonSettingsPathRef.current = `${pathname}${search}`;
      return;
    }

    setNavigationDrawerExpandedMemorized(isNavigationDrawerExpanded);
    setNavigationMemorizedUrl(lastNonSettingsPathRef.current);
  }, [
    pathname,
    search,
    isNavigationDrawerExpanded,
    setNavigationDrawerExpandedMemorized,
    setNavigationMemorizedUrl,
  ]);

  return null;
};
