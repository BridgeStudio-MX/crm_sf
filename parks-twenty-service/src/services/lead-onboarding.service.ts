import { brokerNotificationStore } from './broker-notification.store';
import { emailSequenceService } from './email-sequence.service';
import { prospectEnrichmentService } from './prospect-enrichment.service';
import { twentyDataService } from './twenty-data.service';

const DIRECTOR_REVIEW_M2_THRESHOLD = 5000;

const resolveCompanyName = (
  opportunityName: string | undefined,
  record: Record<string, unknown>,
): string => {
  if (opportunityName && opportunityName.trim().length > 0) {
    return opportunityName.trim();
  }

  const inquilino = record.inquilinoVinculado as
    | { empresa?: string }
    | undefined;

  if (inquilino?.empresa) {
    return inquilino.empresa;
  }

  return 'Nuevo prospecto';
};

const resolveM2Requeridos = (record: Record<string, unknown>): number => {
  if (typeof record.m2Requeridos === 'number') {
    return record.m2Requeridos;
  }

  return 0;
};

export const leadOnboardingService = {
  processNewOpportunity: async ({
    opportunityId,
    record,
  }: {
    opportunityId: string;
    record: Record<string, unknown>;
  }): Promise<void> => {
    const opportunityName =
      typeof record.name === 'string' ? record.name : undefined;
    const companyName = resolveCompanyName(opportunityName, record);
    const m2Requeridos = resolveM2Requeridos(record);

    const enrichment = await prospectEnrichmentService.enrich({
      opportunityId,
      companyName,
      m2Requeridos,
    });

    brokerNotificationStore.add({
      type: 'enrichment',
      priority: 'high',
      title: `IA enriqueció a ${companyName}`,
      body: `${enrichment.summary} Fit score: ${enrichment.fitScore}/100.`,
      area: 'Comercial',
      opportunityId,
      opportunityName: companyName,
    });

    await twentyDataService.createTask(
      '[Broker] Llamar al prospecto en 2 horas',
      `Contactar a ${companyName} para calificar requerimientos (m², presupuesto, fecha de ocupación). Oportunidad: ${opportunityId}.`,
    );

    brokerNotificationStore.add({
      type: 'task',
      priority: 'high',
      title: `Llamar a ${companyName} en 2 horas`,
      body: 'Tarea automática de seguimiento comercial al recibir el lead.',
      area: 'Broker',
      opportunityId,
      opportunityName: companyName,
    });

    await twentyDataService.createTask(
      '[Comercial] Preparar dossier de naves candidatas',
      `Armar shortlist de naves según ${m2Requeridos || 'm² pendientes'} m² y zona. Industria detectada: ${enrichment.industry}.`,
    );

    brokerNotificationStore.add({
      type: 'task',
      priority: 'normal',
      title: 'Preparar dossier de naves',
      body: `Industria: ${enrichment.industry}. Acciones sugeridas: ${enrichment.suggestedActions.slice(0, 2).join(' · ')}`,
      area: 'Comercial',
      opportunityId,
      opportunityName: companyName,
    });

    emailSequenceService.scheduleForNewLead({
      opportunityId,
      companyName,
      industryHint: enrichment.industry,
    });

    if (m2Requeridos >= DIRECTOR_REVIEW_M2_THRESHOLD) {
      await twentyDataService.createTask(
        '[Director Comercial] Revisar deal de alto ticket',
        `${companyName} requiere ${m2Requeridos} m² (umbral ${DIRECTOR_REVIEW_M2_THRESHOLD} m²). Validar estrategia y pricing.`,
      );

      brokerNotificationStore.add({
        type: 'alert',
        priority: 'high',
        title: `Deal alto ticket: ${companyName}`,
        body: `${m2Requeridos} m² requieren revisión del director comercial.`,
        area: 'Dirección',
        opportunityId,
        opportunityName: companyName,
      });
    }

    await twentyDataService.createNote(
      `[IA] Enriquecimiento — ${companyName}`,
      `${enrichment.summary}\n\nIndustria: ${enrichment.industry}\nFit: ${enrichment.fitScore}/100\nUrgencia: ${enrichment.urgency}\nSeñales: ${enrichment.investmentSignals.join('; ')}`,
    );

    console.log(
      `[lead-onboarding] Onboarding complete for opportunity ${opportunityId} (${companyName})`,
    );
  },
};
