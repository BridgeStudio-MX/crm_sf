import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { type CreateParksLeadInput } from '@/parks-industrial/services/parks-commercial.client';

export type ParksLeadCreatedPayload = {
  opportunityId: string;
  inquilinoId: string;
  lead: CreateParksLeadInput;
};

export const buildOptimisticOpportunityRecord = ({
  opportunityId,
  inquilinoId,
  lead,
}: ParksLeadCreatedPayload): ParksOpportunityRecord => ({
  id: opportunityId,
  name: `${lead.empresa.trim()} — ${lead.ubicacionDeseada} — ${lead.metrosCuadradosRequeridos} m²`,
  stage: 'LEAD_RECIBIDO',
  m2Requeridos: lead.metrosCuadradosRequeridos,
  ubicacionDeseada: lead.ubicacionDeseada,
  giroEmpresa: lead.giroEmpresa,
  plazoContratoMeses: lead.plazoContratoMeses,
  presupuestoMensualUsd: lead.presupuestoMensualUsd,
  tipoOperacion: lead.tipoOperacion,
  updatedAt: new Date().toISOString(),
  inquilinoVinculado: {
    id: inquilinoId,
    empresa: lead.empresa.trim(),
  },
});
