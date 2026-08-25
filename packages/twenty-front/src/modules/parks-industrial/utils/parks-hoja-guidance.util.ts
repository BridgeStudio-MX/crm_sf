import { t } from '@lingui/core/macro';

import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';

export type ParksHojaPrerequisite = {
  id: 'inquilino' | 'nave' | 'aprobacion';
  label: string;
  howToFix: string;
  done: boolean;
};

const isApprovalResolved = (
  opportunity: ParksOpportunityRecord,
): boolean => {
  if (!opportunity.aprobacionRequerida) {
    return true;
  }

  const status = String(opportunity.estatusAprobacion ?? '').toLowerCase();

  return (
    opportunity.estatusAprobacion === 'APROBADA' || status.includes('aprobada')
  );
};

export const buildParksHojaPrerequisites = (
  opportunity: ParksOpportunityRecord,
): ParksHojaPrerequisite[] => {
  const hasInquilino = Boolean(opportunity.inquilinoVinculado?.id);
  const hasNave = Boolean(
    opportunity.naveVinculada?.id ?? opportunity.naveVinculadaId,
  );

  return [
    {
      id: 'inquilino',
      label: t`Cuenta / inquilino vinculado`,
      howToFix: t`Abre el registro del deal o Contexto y asegúrate de que haya una cuenta Parks ligada.`,
      done: hasInquilino,
    },
    {
      id: 'nave',
      label: t`Nave vinculada`,
      howToFix: t`Ve al tab Visita → Naves y agenda, elige una nave y guárdala.`,
      done: hasNave,
    },
    {
      id: 'aprobacion',
      label: t`Aprobación de condiciones especiales`,
      howToFix: t`Ve al tab Negociar → Aprobaciones y resuelve la solicitud pendiente (aprobar o quitar la condición).`,
      done: isApprovalResolved(opportunity),
    },
  ];
};

export const getParksHojaBlockingPrerequisites = (
  opportunity: ParksOpportunityRecord,
): ParksHojaPrerequisite[] =>
  buildParksHojaPrerequisites(opportunity).filter(
    (prerequisite) => !prerequisite.done,
  );

export const formatParksHojaErrorGuidance = (rawMessage: string): string => {
  const message = rawMessage.trim();
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('inquilino') ||
    lowerMessage.includes('nave') ||
    lowerMessage.includes('must have')
  ) {
    return t`No se pudo generar la Hoja: falta inquilino o nave.

Pasos:
1. Tab Visita → vincula una nave al deal
2. Confirma que el deal tenga cuenta/inquilino
3. Vuelve a Cerrar → Generar Hoja`;
  }

  if (
    lowerMessage.includes('aprobacion') ||
    lowerMessage.includes('approval') ||
    lowerMessage.includes('special-condition')
  ) {
    return t`No se pudo generar la Hoja: hay una aprobación pendiente.

Pasos:
1. Tab Negociar → sección Aprobaciones
2. Aprueba o cancela la condición especial
3. Vuelve a Cerrar → Generar Hoja`;
  }

  if (
    lowerMessage.includes('firmada') ||
    lowerMessage.includes('already signed')
  ) {
    return t`Esta Hoja ya está firmada o enviada a Legal y no se puede editar.

Siguiente paso: revisa Comité (si GLA > 20,000 m²) o el pipeline Legal.`;
  }

  if (
    lowerMessage.includes('not found') ||
    lowerMessage.includes('no encontr')
  ) {
    return t`No se encontró el registro de la Hoja.

Pasos:
1. Recarga el deal
2. Si no hay borrador, pulsa Generar Hoja de nuevo
3. Si el error continúa, vuelve a abrir el deal desde Pipeline`;
  }

  return message;
};
