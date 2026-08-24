import {
  PARKS_COMITE_ESTATUS_AJUSTES_PEDIDOS,
  PARKS_COMITE_MIN_GLA_M2,
  requiresParksComiteByGla,
} from '@/parks-industrial/constants/parks-comite-gates.constants';
import { type ComiteAutorizacion } from '@/parks-industrial/types/parks-comite.types';
import { type ParksStatusBadgeColor } from '@/parks-industrial/components/ui/ParksStatusBadge';

const PRE_LEGAL_STAGES = new Set([
  'LEAD_RECIBIDO',
  'CALIFICADO',
  'TOUR_VISITA',
  'COTIZACION_ENVIADA',
  'EN_NEGOCIACION',
  'HOJA_DE_ACUERDOS_FIRMADA',
]);

export type ParksComitePipelineMarker = {
  kind: 'preview' | 'en-sesion' | 'ajustes';
  label: string;
  color: ParksStatusBadgeColor;
};

export const isParksComiteAwaitingAdjustments = (
  comite: Pick<ComiteAutorizacion, 'estatus'> | null | undefined,
): boolean => comite?.estatus === PARKS_COMITE_ESTATUS_AJUSTES_PEDIDOS;

export const isParksComiteActiveOnDeal = (
  comite: Pick<ComiteAutorizacion, 'estatus'> | null | undefined,
): boolean => {
  if (!comite) {
    return false;
  }

  return (
    !comite.estatus.startsWith('Resuelto') &&
    !comite.estatus.startsWith('Cancelado')
  );
};

export const getParksComiteGlaLegend = (glaM2: number): string | null => {
  if (!requiresParksComiteByGla(glaM2)) {
    return null;
  }

  return `GLA ${glaM2.toLocaleString('es-MX')} m² > ${PARKS_COMITE_MIN_GLA_M2.toLocaleString('es-MX')} m²: al firmar la Hoja este deal pasa a Comité (sesión CEO) antes de Legal. Legal no lo ve hasta que se apruebe.`;
};

export const resolveParksComitePipelineMarker = ({
  glaM2,
  stage,
  comite,
}: {
  glaM2: number;
  stage?: string | null;
  comite?: Pick<ComiteAutorizacion, 'estatus'> | null;
}): ParksComitePipelineMarker | null => {
  if (isParksComiteAwaitingAdjustments(comite)) {
    return {
      kind: 'ajustes',
      label: 'Comité pidió ajustes',
      color: 'orange',
    };
  }

  if (isParksComiteActiveOnDeal(comite)) {
    return {
      kind: 'en-sesion',
      label: 'En comité',
      color: 'blue',
    };
  }

  if (
    !requiresParksComiteByGla(glaM2) ||
    !stage ||
    !PRE_LEGAL_STAGES.has(stage)
  ) {
    return null;
  }

  if (stage === 'HOJA_DE_ACUERDOS_FIRMADA') {
    return {
      kind: 'en-sesion',
      label: 'En comité',
      color: 'blue',
    };
  }

  return {
    kind: 'preview',
    label: 'Pasará por comité',
    color: 'orange',
  };
};
