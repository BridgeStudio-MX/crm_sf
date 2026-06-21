import {
  RENOVACION_ALERT_THRESHOLDS_MONTHS,
  RENOVACION_ETAPA_BY_MONTHS,
  TIPO_DOCUMENTO_RENOVACION,
} from '../constants/parks.constants';
import { type ExpedienteContratoRecord } from '../types/parks.types';
import {
  diffCalendarMonthsUntil,
  isExactlyMonthsBeforeExpiry,
} from '../utils/date-months.util';
import { toSelectValue } from '../utils/select-value.util';
import { notificacionService } from './notificacion.service';
import { twentyDataService } from './twenty-data.service';

type RenovacionAlertDefinition = {
  monthsBefore: number;
  areas: string[];
  buildMessage: (
    expediente: ExpedienteContratoRecord,
    includeEscalation: boolean,
  ) => string;
};

const buildExpedienteLabel = (expediente: ExpedienteContratoRecord): string =>
  expediente.numeroExpediente ?? expediente.id;

const buildTenantLabel = (expediente: ExpedienteContratoRecord): string =>
  expediente.inquilino?.empresa ?? expediente.inquilinoId ?? 'Inquilino';

const buildNaveLabel = (expediente: ExpedienteContratoRecord): string =>
  expediente.nave?.identificador ?? expediente.naveId ?? 'N/A';

const ALERT_DEFINITIONS: RenovacionAlertDefinition[] = [
  {
    monthsBefore: 12,
    areas: ['Comercial'],
    buildMessage: (expediente) =>
      `Renovación en 12 meses — ${buildTenantLabel(expediente)} / nave ${buildNaveLabel(expediente)} — expediente ${buildExpedienteLabel(expediente)}. Iniciar contacto con cliente.`,
  },
  {
    monthsBefore: 6,
    areas: ['Comercial', 'Director Comercial'],
    buildMessage: (expediente, includeEscalation) =>
      includeEscalation
        ? `Renovación en 6 meses SIN actividad legal — escalar negociación. ${buildTenantLabel(expediente)} / ${buildExpedienteLabel(expediente)}`
        : `Renovación en 6 meses — ${buildTenantLabel(expediente)} / nave ${buildNaveLabel(expediente)} — caso legal activo detectado.`,
  },
  {
    monthsBefore: 3,
    areas: ['Comercial', 'Director Comercial', 'CEO'],
    buildMessage: (expediente) =>
      `ALERTA URGENTE — renovación en 3 meses. ${buildTenantLabel(expediente)} / nave ${buildNaveLabel(expediente)} / ${buildExpedienteLabel(expediente)}`,
  },
  {
    monthsBefore: 1,
    areas: ['Comercial', 'Director Comercial', 'CEO', 'Legal'],
    buildMessage: (expediente) =>
      `ALERTA CRÍTICA — renovación en 1 mes. ${buildTenantLabel(expediente)} / nave ${buildNaveLabel(expediente)} / vence ${expediente.fechaVencimiento}`,
  },
];

const updateOpportunityRenovacionStage = async (
  expediente: ExpedienteContratoRecord,
  monthsBefore: number,
): Promise<void> => {
  if (!expediente.inquilinoId || !expediente.naveId) {
    return;
  }

  const opportunity = await twentyDataService.findOpportunityByInquilinoAndNave(
    expediente.inquilinoId,
    expediente.naveId,
  );

  if (!opportunity) {
    return;
  }

  const etapaRenovacion = RENOVACION_ETAPA_BY_MONTHS[monthsBefore];

  if (!etapaRenovacion) {
    return;
  }

  const etapaRenovacionValue = toSelectValue(etapaRenovacion);

  if (opportunity.etapaRenovacion === etapaRenovacionValue) {
    return;
  }

  await twentyDataService.updateOpportunity(opportunity.id, {
    etapaRenovacion: etapaRenovacionValue,
  });
};

const processExpedienteAlert = async (
  expediente: ExpedienteContratoRecord,
  referenceDate: Date,
): Promise<number> => {
  const monthsRemaining = diffCalendarMonthsUntil(
    referenceDate,
    expediente.fechaVencimiento,
  );

  if (monthsRemaining <= 0) {
    return 0;
  }

  let alertsSent = 0;

  for (const alertDefinition of ALERT_DEFINITIONS) {
    if (
      !isExactlyMonthsBeforeExpiry(
        expediente.fechaVencimiento,
        alertDefinition.monthsBefore,
        referenceDate,
      )
    ) {
      continue;
    }

    let includeEscalation = false;

    if (alertDefinition.monthsBefore === 6 && expediente.inquilinoId && expediente.naveId) {
      const hasActiveRenovacion = await twentyDataService.hasActiveRenovacionCaso(
        expediente.inquilinoId,
        expediente.naveId,
      );

      includeEscalation = !hasActiveRenovacion;
    }

    const message = alertDefinition.buildMessage(
      expediente,
      includeEscalation,
    );

    for (const area of alertDefinition.areas) {
      if (alertDefinition.monthsBefore === 6 && area === 'Director Comercial' && !includeEscalation) {
        continue;
      }

      await notificacionService.notifyArea(area, message);
    }

    await twentyDataService.createTask(
      `[Renovación ${alertDefinition.monthsBefore}m] ${buildTenantLabel(expediente)}`,
      message,
    );

    await updateOpportunityRenovacionStage(
      expediente,
      alertDefinition.monthsBefore,
    );

    alertsSent += 1;

    console.log(
      `[renovacion.service] Alert ${alertDefinition.monthsBefore}m — ${buildExpedienteLabel(expediente)}`,
    );
  }

  return alertsSent;
};

export const renovacionService = {
  runDailyAlerts: async (referenceDate: Date = new Date()): Promise<void> => {
    const expedientesActivos =
      await twentyDataService.findExpedientesActivos();

    console.log(
      `[renovacion.service] Scanning ${expedientesActivos.length} active contracts (thresholds: ${RENOVACION_ALERT_THRESHOLDS_MONTHS.join(', ')} months)`,
    );

    let totalAlerts = 0;

    for (const expediente of expedientesActivos) {
      totalAlerts += await processExpedienteAlert(expediente, referenceDate);
    }

    console.log(
      `[renovacion.service] Completed — ${totalAlerts} alert(s) sent`,
    );
  },

  // Exposed for tests — documents which tipo legal dispara actividad a 6 meses
  renovacionDocumentType: TIPO_DOCUMENTO_RENOVACION,
};
