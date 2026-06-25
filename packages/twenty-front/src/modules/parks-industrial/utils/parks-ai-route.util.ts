import { AppPath } from 'twenty-shared/types';
import { t } from '@lingui/core/macro';

import { type ParksAiScreen } from '@/parks-industrial/types/parks-ai.types';

export const resolveParksAiScreenFromPath = (
  pathname: string,
): ParksAiScreen => {
  if (pathname.includes(AppPath.ParksMapa)) {
    return 'map';
  }

  if (pathname.includes(AppPath.ParksDashboard)) {
    return 'dashboard';
  }

  if (pathname.includes(AppPath.ParksPipeline)) {
    return 'pipeline';
  }

  if (pathname.includes(AppPath.ParksContratos)) {
    return 'contratos';
  }

  if (pathname.includes(AppPath.ParksContratoAprobacion)) {
    return 'approval';
  }

  if (
    pathname.includes(AppPath.ParksStackingPlanIndex) ||
    pathname.includes('/parks/parque/')
  ) {
    return 'stacking-plan';
  }

  if (pathname.includes(AppPath.ParksComisiones)) {
    return 'comisiones';
  }

  if (pathname.includes(AppPath.ParksRenovaciones)) {
    return 'renovaciones';
  }

  if (pathname.includes(AppPath.ParksReservas)) {
    return 'reservas';
  }

  return 'unknown';
};

export const getParksAiScreenLabel = (screen: ParksAiScreen): string => {
  const labels: Record<ParksAiScreen, string> = {
    dashboard: t`Dashboard ejecutivo`,
    map: t`Mapa de cartera`,
    pipeline: t`Pipeline comercial`,
    contratos: t`Contratos`,
    approval: t`Aprobación legal`,
    'stacking-plan': t`Stacking plan`,
    comisiones: t`Comisiones`,
    renovaciones: t`Renovaciones`,
    reservas: t`Reservas`,
    unknown: t`Parks Industrial`,
  };

  return labels[screen];
};
