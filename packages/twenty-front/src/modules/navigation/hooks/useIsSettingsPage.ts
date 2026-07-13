import { useLocation } from 'react-router-dom';

export const useIsSettingsPage = () => {
  const { pathname } = useLocation();

  return pathname === '/settings' || pathname.startsWith('/settings/');
};
