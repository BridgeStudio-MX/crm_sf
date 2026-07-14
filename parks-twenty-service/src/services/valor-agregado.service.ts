import { randomUUID } from 'crypto';

import { brokerNotificationStore } from './broker-notification.store';
import { naveMatchingService } from './nave-matching.service';
import { twentyDataService } from './twenty-data.service';
import { valorAgregadoStore } from './valor-agregado.store';
import {
  type ChecklistDocumentoVigencia,
  type ChecklistVigenciaResumen,
  type DocumentoVigenciaEstatus,
  type LeadResponseMetric,
  type LeadResponsePorLo,
  type OfertaRenovacionAnticipada,
  type OfertaRenovacionEstatus,
  type OfertaRenovacionIncentivo,
  type ValorAgregadoDashboard,
} from '../types/valor-agregado.types';

const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;
const ALERT_WINDOW_DAYS = 15;

const toDateOnly = (value: string | Date): string => {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
};

const daysBetween = (from: string, to: string): number => {
  const start = new Date(toDateOnly(from));
  const end = new Date(toDateOnly(to));
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
};

export const computeVigenciaEstatus = (
  fechaVencimiento?: string | null,
  referenceDate: Date = new Date(),
): {
  vigenciaEstatus: DocumentoVigenciaEstatus;
  diasParaVencer: number | null;
} => {
  if (!fechaVencimiento) {
    return { vigenciaEstatus: 'Sin fecha', diasParaVencer: null };
  }

  const diasParaVencer = daysBetween(
    toDateOnly(referenceDate),
    toDateOnly(fechaVencimiento),
  );

  if (diasParaVencer < 0) {
    return { vigenciaEstatus: 'Vencido', diasParaVencer };
  }

  if (diasParaVencer <= ALERT_WINDOW_DAYS) {
    return { vigenciaEstatus: 'Por vencer', diasParaVencer };
  }

  return { vigenciaEstatus: 'Vigente', diasParaVencer };
};

const buildAlertText = (documentos: ChecklistDocumentoVigencia[]): string => {
  const alerts = documentos
    .filter(
      (documento) =>
        documento.entregado &&
        (documento.vigenciaEstatus === 'Vencido' ||
          documento.vigenciaEstatus === 'Por vencer'),
    )
    .map((documento) => {
      if (documento.vigenciaEstatus === 'Vencido') {
        return `${documento.tipoDocumento} vencido`;
      }

      return `${documento.tipoDocumento} vence en ${documento.diasParaVencer} días`;
    });

  return alerts.join(', ');
};

const summarizePorLo = (
  metrics: LeadResponseMetric[],
): LeadResponsePorLo[] => {
  const byOfficer = new Map<string, LeadResponseMetric[]>();

  for (const metric of metrics) {
    const bucket = byOfficer.get(metric.leasingOfficer) ?? [];
    bucket.push(metric);
    byOfficer.set(metric.leasingOfficer, bucket);
  }

  return [...byOfficer.entries()].map(([leasingOfficer, items]) => {
    const withHours = items.filter(
      (item) => typeof item.tiempoPrimeraRespuestaHoras === 'number',
    );
    const promedioHoras =
      withHours.length === 0
        ? null
        : withHours.reduce(
            (sum, item) => sum + (item.tiempoPrimeraRespuestaHoras ?? 0),
            0,
          ) / withHours.length;
    const excelente = items.filter(
      (item) => item.semaforo === 'Excelente',
    ).length;
    const sinContacto48h = items.filter(
      (item) => item.semaforo === 'Sin contacto',
    ).length;

    return {
      leasingOfficer,
      totalLeads: items.length,
      promedioHoras:
        promedioHoras === null ? null : Math.round(promedioHoras * 10) / 10,
      pctExcelente:
        items.length === 0
          ? 0
          : Math.round((excelente / items.length) * 1000) / 10,
      sinContacto48h,
    };
  });
};

const resolveSemaforo = (
  horas: number | null | undefined,
  createdAt: string,
): LeadResponseMetric['semaforo'] => {
  if (horas === null || horas === undefined) {
    const ageHours =
      (Date.now() - new Date(createdAt).getTime()) / MS_PER_HOUR;

    return ageHours >= 48 ? 'Sin contacto' : 'Sin contacto';
  }

  if (horas <= 4) {
    return 'Excelente';
  }

  if (horas <= 8) {
    return 'Bueno';
  }

  if (horas <= 24) {
    return 'Regular';
  }

  return 'Tardío';
};

const mapChecklistFromCaso = async (
  casoLegalId: string,
  empresa: string,
): Promise<ChecklistVigenciaResumen | null> => {
  const documents =
    await twentyDataService.findDocumentosChecklistByCasoLegal(casoLegalId);

  if (documents.length === 0) {
    return null;
  }

  const mapped: ChecklistDocumentoVigencia[] = documents.map((document) => {
    const tipoDocumento =
      document.titulo ?? document.tipoDocumento ?? 'Documento';
    const fechaVencimiento =
      valorAgregadoStore.getVencimiento(document.id) ??
      (document as { fechaVencimiento?: string }).fechaVencimiento ??
      null;
    const { vigenciaEstatus, diasParaVencer } =
      computeVigenciaEstatus(fechaVencimiento);

    return {
      documentoChecklistId: document.id,
      tipoDocumento,
      entregado: Boolean(document.entregado),
      fechaEntrega: (document as { fechaEntrega?: string }).fechaEntrega,
      fechaVencimiento,
      vigenciaEstatus,
      diasParaVencer,
    };
  });

  const documentosConAlerta = buildAlertText(mapped);
  const checklistDocumentosVigentes = mapped
    .filter((documento) => documento.entregado)
    .every(
      (documento) =>
        documento.vigenciaEstatus === 'Vigente' ||
        documento.vigenciaEstatus === 'Sin fecha',
    );

  return {
    casoLegalId,
    empresa,
    checklistDocumentosVigentes,
    documentosConAlerta,
    documentos: mapped,
  };
};

export const valorAgregadoService = {
  getDashboard: (): ValorAgregadoDashboard => {
    const store = valorAgregadoStore.getState();

    return {
      generatedAt: new Date().toISOString(),
      f1ChecklistAlertas: store.checklist.filter(
        (item) => !item.checklistDocumentosVigentes,
      ),
      f2Expansiones: store.expansiones,
      f3Concentracion: store.concentracion,
      f4RoiCanal: [...store.roiCanal].sort(
        (left, right) =>
          right.revenueAnualizadoUsd - left.revenueAnualizadoUsd,
      ),
      f5Ofertas: store.ofertas,
      f6Matches: store.matches,
      f7TiempoRespuesta: summarizePorLo(store.leadResponses),
      f7Detalle: store.leadResponses,
      f8BrokerAlerts: store.brokerAlerts,
      f8Inactivos: store.brokerInactivos.filter(
        (broker) => broker.diasSinActividad >= 45,
      ),
    };
  },

  // F1 — compute / alert document validity
  evaluateChecklistVigencia: async (
    casoLegalId: string,
  ): Promise<ChecklistVigenciaResumen> => {
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);
    const fromLive = await mapChecklistFromCaso(
      casoLegalId,
      casoLegal?.referencia ?? casoLegalId,
    );

    if (fromLive) {
      const existing = valorAgregadoStore
        .getState()
        .checklist.filter((item) => item.casoLegalId !== casoLegalId);
      valorAgregadoStore.setChecklist([fromLive, ...existing]);
      return fromLive;
    }

    const demo = valorAgregadoStore
      .getState()
      .checklist.find((item) => item.casoLegalId === casoLegalId);

    if (demo) {
      return demo;
    }

    return {
      casoLegalId,
      empresa: casoLegal?.referencia ?? casoLegalId,
      checklistDocumentosVigentes: true,
      documentosConAlerta: '',
      documentos: [],
    };
  },

  setDocumentoVencimiento: async ({
    documentoChecklistId,
    casoLegalId,
    fechaVencimiento,
  }: {
    documentoChecklistId: string;
    casoLegalId: string;
    fechaVencimiento: string;
  }): Promise<ChecklistVigenciaResumen> => {
    valorAgregadoStore.setVencimiento(documentoChecklistId, fechaVencimiento);

    try {
      await twentyDataService.updateDocumentoChecklist(documentoChecklistId, {
        fechaVencimiento,
      });
    } catch {
      // Field may not exist yet in metadata — store overlay still works
    }

    return valorAgregadoService.evaluateChecklistVigencia(casoLegalId);
  },

  assertChecklistVigenteOrThrow: async (casoLegalId: string): Promise<void> => {
    try {
      const resumen =
        await valorAgregadoService.evaluateChecklistVigencia(casoLegalId);

      if (!resumen.checklistDocumentosVigentes) {
        throw new Error(
          `Hay documentos vencidos. Actualizar antes de continuar. ${resumen.documentosConAlerta}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Only block when expired docs were detected — never block if checklist missing
      if (message.startsWith('Hay documentos vencidos')) {
        throw error;
      }
    }
  },

  runDailyDocumentAlerts: async (): Promise<{ notified: number }> => {
    const store = valorAgregadoStore.getState();
    let notified = 0;

    for (const checklist of store.checklist) {
      const porVencer = checklist.documentos.filter(
        (documento) =>
          documento.entregado &&
          documento.vigenciaEstatus === 'Por vencer' &&
          typeof documento.diasParaVencer === 'number' &&
          documento.diasParaVencer >= 0 &&
          documento.diasParaVencer <= ALERT_WINDOW_DAYS,
      );

      for (const documento of porVencer) {
        brokerNotificationStore.add({
          type: 'alert',
          priority: 'high',
          title: `⚠️ Documento por vencer — ${checklist.empresa}`,
          body: `La ${documento.tipoDocumento} vence en ${documento.diasParaVencer} días. Solicitar al cliente una nueva antes de continuar el proceso legal.`,
          area: 'Comercial',
          actionPath: `/parks/contratos/${checklist.casoLegalId}`,
          actionLabel: 'Ver caso',
          audienceRoleLabels: [
            'Parks — Ejecutivo Comercial',
            'Parks — Director Comercial',
          ],
        });
        notified += 1;
      }
    }

    return { notified };
  },

  // F2 — expansion detection
  runExpansionDetection: async (): Promise<{ created: number }> => {
    const store = valorAgregadoStore.getState();
    let created = 0;

    for (const expansion of store.expansiones) {
      if (!expansion.taskCreated || expansion.navesDisponibles.length === 0) {
        continue;
      }

      brokerNotificationStore.add({
        type: 'task',
        priority: 'normal',
        title: `💡 Oportunidad de expansión — ${expansion.inquilinoNombre}`,
        body: `Llevan ${expansion.mesesOcupado} meses en ${expansion.naveActual} del parque ${expansion.parqueNombre}. Hay ${expansion.navesDisponibles.length} nave(s) disponible(s): ${expansion.navesDisponibles
          .map(
            (nave) =>
              `${nave.identificador} (${nave.m2.toLocaleString('es-MX')} m² · $${nave.precioBaseUsd}/m²)`,
          )
          .join('; ')}.`,
        area: 'Comercial',
        actionPath: '/parks/prospectos',
        actionLabel: 'Ver prospectos',
        audienceRoleLabels: [
          'Parks — Ejecutivo Comercial',
          'Parks — Director Comercial',
        ],
        audienceNames: ['Tim Apple'],
      });
      created += 1;
    }

    return { created };
  },

  // F3 — concentration alerts
  runConcentrationAlerts: async (): Promise<{ notified: number }> => {
    const store = valorAgregadoStore.getState();
    let notified = 0;

    for (const parque of store.concentracion.filter((item) => item.alerta)) {
      brokerNotificationStore.add({
        type: 'alert',
        priority: 'high',
        title: `⚠️ Concentración de vencimientos — ${parque.parqueNombre}`,
        body: `${parque.contratosProximos90d} contratos que suman ${parque.m2EnRiesgo.toLocaleString('es-MX')} m² (${parque.porcentajeRiesgo}% del parque) vencen en los próximos 90 días. Contratos: ${parque.contratos
          .map((contrato) => `${contrato.empresa} (${contrato.fechaVencimiento})`)
          .join(', ')}.`,
        area: 'Comercial',
        actionPath: '/parks/valor-agregado',
        actionLabel: 'Ver reporte',
        audienceRoleLabels: [
          'Parks — CEO',
          'Parks — Director Comercial',
          'Parks — Director Legal',
        ],
      });
      notified += 1;
    }

    return { notified };
  },

  // F5 — early renewal offers
  createOferta: (input: {
    casoLegalId: string;
    empresa: string;
    loNombre: string;
    tipoIncentivo: OfertaRenovacionIncentivo;
    diasGraciaAdicionales?: number;
    descuentoPorcentaje?: number;
    descripcionMejoras?: string;
    observaciones?: string;
    fechaVencimientoOferta?: string;
  }): OfertaRenovacionAnticipada => {
    const now = new Date();
    const defaultExpiry = new Date(now);
    defaultExpiry.setDate(defaultExpiry.getDate() + 30);

    const oferta: OfertaRenovacionAnticipada = {
      id: `oferta-${randomUUID()}`,
      casoLegalId: input.casoLegalId,
      empresa: input.empresa,
      loNombre: input.loNombre,
      tipoIncentivo: input.tipoIncentivo,
      diasGraciaAdicionales: input.diasGraciaAdicionales,
      descuentoPorcentaje: input.descuentoPorcentaje,
      descripcionMejoras: input.descripcionMejoras,
      observaciones: input.observaciones,
      fechaOferta: toDateOnly(now),
      fechaVencimientoOferta:
        input.fechaVencimientoOferta ?? toDateOnly(defaultExpiry),
      estatus: 'Borrador',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    valorAgregadoStore.upsertOferta(oferta);
    return oferta;
  },

  updateOfertaEstatus: async ({
    ofertaId,
    estatus,
  }: {
    ofertaId: string;
    estatus: OfertaRenovacionEstatus;
  }): Promise<OfertaRenovacionAnticipada> => {
    const existing = valorAgregadoStore.getOferta(ofertaId);

    if (!existing) {
      throw new Error('Oferta not found');
    }

    let next: OfertaRenovacionAnticipada = {
      ...existing,
      estatus,
      updatedAt: new Date().toISOString(),
    };

    if (estatus === 'Aceptada' && !existing.oportunidadRenovacionId) {
      const opportunityId = `renov-${randomUUID()}`;
      next = {
        ...next,
        oportunidadRenovacionId: opportunityId,
      };

      brokerNotificationStore.add({
        type: 'alert',
        priority: 'high',
        title: '✅ El cliente aceptó la oferta de renovación anticipada',
        body: `Se creó la oportunidad de renovación para ${existing.empresa}. Incentivo: ${existing.tipoIncentivo}. Las condiciones están en la descripción.`,
        area: 'Comercial',
        actionPath: '/parks/renovaciones',
        actionLabel: 'Ver renovaciones',
        audienceRoleLabels: [
          'Parks — Ejecutivo Comercial',
          'Parks — Director Comercial',
        ],
        audienceNames: [existing.loNombre],
      });

      try {
        await twentyDataService.createTask(
          `Proceder renovación anticipada — ${existing.empresa}`,
          `Oferta ${existing.id} aceptada. Incentivo: ${existing.tipoIncentivo}. ${existing.observaciones ?? ''}`,
        );
      } catch {
        // demo environments may lack task object
      }
    }

    valorAgregadoStore.upsertOferta(next);
    return next;
  },

  expireOfertas: (): { expired: number } => {
    const today = toDateOnly(new Date());
    let expired = 0;

    for (const oferta of valorAgregadoStore.listOfertas()) {
      if (
        oferta.estatus === 'Enviada al cliente' &&
        oferta.fechaVencimientoOferta < today
      ) {
        valorAgregadoStore.upsertOferta({
          ...oferta,
          estatus: 'Expirada',
          updatedAt: new Date().toISOString(),
        });
        expired += 1;
      }
    }

    return { expired };
  },

  // F6 — auto match on Calificado
  generateMatchForOpportunity: async (input: {
    opportunityId: string;
    opportunityName?: string;
    m2Requeridos?: number;
    ubicacionDeseada?: string;
    presupuestoMensualUsd?: number;
    leasingOfficerNombre?: string;
  }): Promise<{
    opportunityId: string;
    opportunityName: string;
    matchNavesSugeridas: string;
    matchCount: number;
    notified: boolean;
  }> => {
    const m2 = input.m2Requeridos ?? 5_000;
    const matchResult = await naveMatchingService.match({
      opportunityId: input.opportunityId,
      m2Requeridos: m2,
      cityFilter: input.ubicacionDeseada,
      limit: 20,
    });
    const matches = matchResult.matches;
    const top = matches.slice(0, 3);
    const matchNavesSugeridas =
      top.length === 0
        ? ''
        : top
            .map(
              (nave) =>
                `🏭 ${nave.identificador} — ${nave.parqueNombre ?? 'Parque'}
${nave.m2.toLocaleString('es-MX')} m² | $${nave.precioUsdM2 ?? 0} USD/m²/mes
Disponible: Inmediata
Match: ${Math.round(nave.matchScore)}%
———`,
            )
            .join('\n');

    const result = {
      opportunityId: input.opportunityId,
      opportunityName: input.opportunityName ?? input.opportunityId,
      matchNavesSugeridas,
      matchCount: matches.length,
      notified: true,
    };

    valorAgregadoStore.pushMatch(result);

    if (matches.length === 0) {
      brokerNotificationStore.add({
        type: 'alert',
        priority: 'high',
        title: `⚠️ Sin disponibilidad para ${result.opportunityName}`,
        body: `No hay naves disponibles que coincidan con ${m2} m² en ${input.ubicacionDeseada ?? 'ubicación solicitada'}. Considera build-to-suit o marcar como Perdido — Sin disponibilidad.`,
        area: 'Comercial',
        opportunityId: input.opportunityId,
        actionPath: `/object/opportunity/${input.opportunityId}`,
        actionLabel: 'Ver oportunidad',
        audienceRoleLabels: ['Parks — Ejecutivo Comercial'],
        audienceNames: input.leasingOfficerNombre
          ? [input.leasingOfficerNombre]
          : undefined,
      });
    } else {
      brokerNotificationStore.add({
        type: 'alert',
        priority: 'normal',
        title: `📋 Naves sugeridas para ${result.opportunityName}`,
        body: `Se calificó el lead. Hay ${matches.length} naves disponibles que coinciden. Las 3 mejores están en Valor agregado / oportunidad.`,
        area: 'Comercial',
        opportunityId: input.opportunityId,
        actionPath: `/object/opportunity/${input.opportunityId}`,
        actionLabel: 'Ver oportunidad',
        audienceRoleLabels: ['Parks — Ejecutivo Comercial'],
        audienceNames: input.leasingOfficerNombre
          ? [input.leasingOfficerNombre]
          : undefined,
      });
    }

    try {
      await twentyDataService.updateOpportunity(input.opportunityId, {
        matchNavesSugeridas,
      });
    } catch {
      // Optional field — overlay is enough for demo
    }

    return result;
  },

  // F7 — first response metrics
  registerPrimeraActividad: (input: {
    opportunityId: string;
    nombre: string;
    leasingOfficer: string;
    createdAt: string;
    activityAt?: string;
  }): LeadResponseMetric => {
    const activityAt = input.activityAt ?? new Date().toISOString();
    const horas =
      (new Date(activityAt).getTime() - new Date(input.createdAt).getTime()) /
      MS_PER_HOUR;
    const rounded = Math.round(horas * 10) / 10;

    const metric: LeadResponseMetric = {
      opportunityId: input.opportunityId,
      nombre: input.nombre,
      leasingOfficer: input.leasingOfficer,
      createdAt: input.createdAt,
      fechaPrimeraActividad: activityAt,
      tiempoPrimeraRespuestaHoras: rounded,
      semaforo: resolveSemaforo(rounded, input.createdAt),
    };

    valorAgregadoStore.upsertLeadResponse(metric);
    return metric;
  },

  // F8 — broker outreach + inactivity
  notifyBrokersOnNaveDisponible: (input: {
    naveIdentificador: string;
    parqueNombre: string;
    ubicacionEstado?: string;
    m2: number;
    precioBaseUsd: number;
  }): {
    sent: number;
    alerts: Array<{
      id: string;
      brokerEmpresa: string;
      naveIdentificador: string;
      draftMailto: string;
    }>;
  } => {
    const zoneHint = (input.ubicacionEstado ?? '')
      .toLowerCase()
      .split(',')[0]
      ?.trim();

    const brokers = valorAgregadoStore
      .getState()
      .brokerInactivos.filter((broker) => {
        if (broker.clasificacion !== 'Top 10') {
          return false;
        }

        if (!zoneHint) {
          return true;
        }

        return (broker.zonasOperacion ?? '').toLowerCase().includes(zoneHint);
      });

    const buildAlert = (broker: {
      brokerId: string;
      empresa: string;
    }) => {
      const brokerEmail = `${broker.empresa
        .replace(/\s+/g, '.')
        .toLowerCase()}@broker.demo`;
      const draftMailto = `mailto:${brokerEmail}?subject=${encodeURIComponent(
        `Disponibilidad exclusiva — ${input.naveIdentificador} | ${input.parqueNombre}`,
      )}&body=${encodeURIComponent(
        `Hola,\n\nAntes de publicarla, te comparto que acaba de quedar disponible:\n\n📍 ${input.parqueNombre}\n📐 ${input.m2} m² disponibles\n💰 Desde $${input.precioBaseUsd} USD/m²/mes\n📅 Disponibilidad: Inmediata\n\n¿Tienes algún cliente interesado?\n\nParks Industrial`,
      )}`;

      const alert = {
        id: `broker-alert-${randomUUID()}`,
        brokerId: broker.brokerId,
        brokerEmpresa: broker.empresa,
        brokerEmail,
        naveIdentificador: input.naveIdentificador,
        parqueNombre: input.parqueNombre,
        m2: input.m2,
        precioBaseUsd: input.precioBaseUsd,
        sentAt: new Date().toISOString(),
        draftMailto,
      };

      valorAgregadoStore.pushBrokerAlert(alert);

      brokerNotificationStore.add({
        type: 'email',
        priority: 'normal',
        title: `Alerta disponibilidad enviada — ${broker.empresa}`,
        body: `${input.naveIdentificador} · ${input.parqueNombre} · ${input.m2} m²`,
        area: 'Comercial',
        actionPath: '/parks/valor-agregado',
        actionLabel: 'Ver outreach',
        audienceRoleLabels: ['Parks — Director Comercial'],
      });

      return {
        id: alert.id,
        brokerEmpresa: alert.brokerEmpresa,
        naveIdentificador: alert.naveIdentificador,
        draftMailto: alert.draftMailto,
      };
    };

    const alerts =
      brokers.length > 0
        ? brokers.map((broker) => buildAlert(broker))
        : [
            buildAlert({
              brokerId: 'broker-newmark',
              empresa: 'Newmark Parks Top',
            }),
          ];

    return { sent: alerts.length, alerts };
  },

  runBrokerInactivityScan: async (): Promise<{ tasks: number }> => {
    const inactivos = valorAgregadoStore
      .getState()
      .brokerInactivos.filter((broker) => broker.diasSinActividad >= 45);

    if (inactivos.length === 0) {
      return { tasks: 0 };
    }

    brokerNotificationStore.add({
      type: 'task',
      priority: 'normal',
      title: '🤝 Reactivar relación con broker(s) del top 10',
      body: `Los siguientes brokers del top 10 llevan 45+ días sin actividad:\n${inactivos
        .map(
          (broker) =>
            `· ${broker.empresa} — ${broker.diasSinActividad} días`,
        )
        .join('\n')}`,
      area: 'Comercial',
      actionPath: '/parks/valor-agregado',
      actionLabel: 'Ver brokers',
      audienceRoleLabels: ['Parks — Director Comercial'],
      audienceNames: ['Héctor Montelongo'],
    });

    try {
      await twentyDataService.createTask(
        'Reactivar brokers top 10 inactivos',
        inactivos
          .map(
            (broker) =>
              `${broker.empresa}: ${broker.diasSinActividad} días sin actividad`,
          )
          .join('\n'),
      );
    } catch {
      // optional
    }

    return { tasks: 1 };
  },

  runDailyJobs: async (): Promise<Record<string, number>> => {
    const docs = await valorAgregadoService.runDailyDocumentAlerts();
    const expired = valorAgregadoService.expireOfertas();
    return {
      documentAlerts: docs.notified,
      ofertasExpiradas: expired.expired,
    };
  },

  runWeeklyJobs: async (): Promise<Record<string, number>> => {
    const expansion = await valorAgregadoService.runExpansionDetection();
    const brokers = await valorAgregadoService.runBrokerInactivityScan();
    return {
      expansiones: expansion.created,
      brokerTasks: brokers.tasks,
    };
  },

  runMonthlyJobs: async (): Promise<Record<string, number>> => {
    const concentration = await valorAgregadoService.runConcentrationAlerts();
    return { concentrationAlerts: concentration.notified };
  },
};
