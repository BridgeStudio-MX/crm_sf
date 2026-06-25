import {
  OPPORTUNITY_STAGE_EN_PROCESO_LEGAL,
  OPPORTUNITY_STAGE_HOJA_FIRMADA,
  TIPO_CONTRATO_TO_TIPO_DOCUMENTO,
} from '../../constants/parks.constants';
import { leadOnboardingService } from '../../services/lead-onboarding.service';
import { slaService } from '../../services/sla.service';
import { twentyDataService } from '../../services/twenty-data.service';
import { type TwentyWebhookPayload } from '../../types/parks.types';
import { toIsoDateString, parseLocalDate } from '../../utils/business-days.util';
import { isSelectValueEqual, toSelectValue } from '../../utils/select-value.util';
import {
  parseTwentyWebhook,
  wasFieldUpdated,
} from '../webhook-payload.util';

const resolveTipoDocumento = (
  tipoContrato: string | undefined,
  tipoOperacion: string | undefined,
): string => {
  const sourceLabel = tipoContrato ?? tipoOperacion ?? 'Arrendamiento nuevo';

  return (
    TIPO_CONTRATO_TO_TIPO_DOCUMENTO[sourceLabel] ??
    TIPO_CONTRATO_TO_TIPO_DOCUMENTO['Arrendamiento nuevo']
  );
};

const isLeadStage = (stage: string | undefined): boolean => {
  if (!stage) {
    return true;
  }

  return (
    stage === 'LEAD_RECIBIDO' ||
    isSelectValueEqual(stage, 'LEAD_RECIBIDO') ||
    isSelectValueEqual(stage, 'Prospecto nuevo')
  );
};

const handleNewLead = async (
  parsedWebhook: NonNullable<ReturnType<typeof parseTwentyWebhook>>,
): Promise<void> => {
  const stage =
    typeof parsedWebhook.record.stage === 'string'
      ? parsedWebhook.record.stage
      : undefined;

  if (!isLeadStage(stage)) {
    return;
  }

  await leadOnboardingService.processNewOpportunity({
    opportunityId: parsedWebhook.recordId,
    record: parsedWebhook.record,
  });
};

const handleLegalHandoff = async (
  parsedWebhook: NonNullable<ReturnType<typeof parseTwentyWebhook>>,
): Promise<void> => {
  if (!wasFieldUpdated(parsedWebhook, 'stage')) {
    return;
  }

  const stage =
    typeof parsedWebhook.record.stage === 'string'
      ? parsedWebhook.record.stage
      : undefined;

  if (!isSelectValueEqual(stage, OPPORTUNITY_STAGE_HOJA_FIRMADA)) {
    return;
  }

  const opportunity = await twentyDataService.getOpportunityById(
    parsedWebhook.recordId,
  );

  if (!opportunity?.inquilinoVinculadoId || !opportunity.naveVinculadaId) {
    console.warn(
      `[oportunidad.handler] Missing inquilino/nave on opportunity ${parsedWebhook.recordId}`,
    );
    return;
  }

  const hojaDeAcuerdos = await twentyDataService.findHojaDeAcuerdosForHandoff(
    opportunity.inquilinoVinculadoId,
    opportunity.naveVinculadaId,
  );

  if (!hojaDeAcuerdos) {
    console.warn(
      `[oportunidad.handler] No hoja de acuerdos found for opportunity ${opportunity.id}`,
    );
    return;
  }

  const referencia =
    hojaDeAcuerdos.referencia ??
    `${opportunity.name ?? 'Oportunidad'} — Caso legal`;
  const tipoDocumento = resolveTipoDocumento(
    hojaDeAcuerdos.tipoContrato,
    opportunity.tipoOperacion,
  );
  const slaDiasHabiles = slaService.resolveSlaDiasHabiles(tipoDocumento);
  const fechaHojaAcuerdos = hojaDeAcuerdos.fechaFirma
    ? toIsoDateString(parseLocalDate(hojaDeAcuerdos.fechaFirma))
    : twentyDataService.todayIsoDate();

  const createdCasoLegal = await twentyDataService.createCasoLegal({
    referencia,
    tipoDocumento: toSelectValue(tipoDocumento),
    estatus: toSelectValue('Nuevo'),
    semaforo: 'AZUL',
    fechaHojaAcuerdos,
    slaDiasHabiles,
    diasTranscurridos: 0,
    documentacionCompleta: false,
    cotejoAprobado: false,
    esPropiedadFuno: hojaDeAcuerdos.nave?.esPropiedadFuno ?? false,
    hojaDeAcuerdosId: hojaDeAcuerdos.id,
    inquilinoId: opportunity.inquilinoVinculadoId,
    naveId: opportunity.naveVinculadaId,
  });

  if (!createdCasoLegal) {
    return;
  }

  await twentyDataService.updateOpportunity(opportunity.id, {
    stage: toSelectValue(OPPORTUNITY_STAGE_EN_PROCESO_LEGAL),
  });

  await twentyDataService.createTask(
    '[Comercial] Entregar documentación cliente',
    `Entregar documentación del cliente en 5 días hábiles. Caso legal: ${referencia}`,
  );

  console.log(
    `[oportunidad.handler] Handoff complete — caso ${createdCasoLegal.id} from opportunity ${opportunity.id}`,
  );
};

export const handleOportunidadWebhook = async (
  payload: TwentyWebhookPayload,
): Promise<void> => {
  const parsedWebhook = parseTwentyWebhook(payload);

  if (!parsedWebhook) {
    return;
  }

  if (parsedWebhook.action === 'created') {
    await handleNewLead(parsedWebhook);
    return;
  }

  if (parsedWebhook.action !== 'updated') {
    return;
  }

  await handleLegalHandoff(parsedWebhook);
};
