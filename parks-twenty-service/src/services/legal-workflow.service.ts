import {
  CASO_LEGAL_ESTATUS_DOCS_INCOMPLETAS,
  CASO_LEGAL_ESTATUS_ELABORACION,
  CASO_LEGAL_ESTATUS_FLUJO_FIRMAS,
  CASO_LEGAL_ESTATUS_PRIMERA_VERSION,
  FLUJO_FIRMAS_ESTATUS_FIRMADO,
} from '../constants/parks.constants';
import {
  CASO_LEGAL_ESTATUS_COTEJO,
  CASO_LEGAL_ESTATUS_ESPERA_FIRMA_CLIENTE,
  CASO_LEGAL_ESTATUS_FUNO,
  CASO_LEGAL_ESTATUS_NEGOCIACION,
  CASO_LEGAL_ESTATUS_VERSION_FINAL,
  LEGAL_PIPELINE_STAGES,
  resolveLegalLawyerEmail,
} from '../constants/legal-workflow.constants';
import { type CasoLegalRecord } from '../types/parks.types';
import { isSelectValueEqual, toSelectValue } from '../utils/select-value.util';
import { toIsoDateString } from '../utils/business-days.util';
import { checklistService } from './checklist.service';
import { firmasService } from './firmas.service';
import { brokerNotificationStore } from './broker-notification.store';
import { notificacionService } from './notificacion.service';
import { semaforoService } from './semaforo.service';
import { slaService } from './sla.service';
import { twentyDataService } from './twenty-data.service';
import { buildContratoAprobacionActionPath } from '../utils/notification-action-path.util';

export type LegalTimelineStageStatus = 'completed' | 'active' | 'pending';

export type LegalTimelineStage = {
  id: string;
  label: string;
  estatus: string;
  responsable: string;
  status: LegalTimelineStageStatus;
};

const normalizeEstatus = (estatus: string | undefined): string => {
  if (!estatus) {
    return 'Nuevo';
  }

  const match = LEGAL_PIPELINE_STAGES.find((stage) =>
    isSelectValueEqual(estatus, stage.estatus),
  );

  return match?.estatus ?? estatus;
};

const buildTimeline = (estatus: string | undefined): LegalTimelineStage[] => {
  const normalizedEstatus = normalizeEstatus(estatus);
  const activeIndex = LEGAL_PIPELINE_STAGES.findIndex((stage) =>
    isSelectValueEqual(normalizedEstatus, stage.estatus),
  );
  const resolvedIndex = activeIndex >= 0 ? activeIndex : 0;

  return LEGAL_PIPELINE_STAGES.map((stage, index) => {
    let status: LegalTimelineStageStatus = 'pending';

    if (index < resolvedIndex) {
      status = 'completed';
    } else if (index === resolvedIndex) {
      status = 'active';
    }

    return {
      id: stage.id,
      label: stage.label,
      estatus: stage.estatus,
      responsable: stage.responsable,
      status,
    };
  });
};

const recomputeDocumentacionCompleta = async (
  casoLegalId: string,
): Promise<boolean> => {
  const documents =
    await twentyDataService.findDocumentosChecklistByCasoLegal(casoLegalId);

  if (documents.length === 0) {
    return false;
  }

  return documents.every((document) => document.entregado === true);
};

const refreshSemaforo = async (casoLegalId: string): Promise<void> => {
  const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);

  if (casoLegal) {
    await semaforoService.updateForCaso(casoLegal);
  }
};

export const legalWorkflowService = {
  buildTimeline,

  getWorkflow: async (casoLegalId: string) => {
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);

    if (!casoLegal) {
      return null;
    }

    const [checklist, versiones, firmas] = await Promise.all([
      twentyDataService.findDocumentosChecklistByCasoLegal(casoLegalId),
      twentyDataService.findVersionesByCasoLegal(casoLegalId),
      twentyDataService.findFlujosFirmasByCasoLegal(casoLegalId),
    ]);

    const slaRestante =
      casoLegal.slaDiasHabiles > 0
        ? Math.max(
            0,
            casoLegal.slaDiasHabiles - (casoLegal.diasTranscurridos ?? 0),
          )
        : null;

    return {
      casoLegal,
      checklist,
      versiones,
      firmas,
      timeline: buildTimeline(casoLegal.estatus),
      sla: {
        diasHabiles: casoLegal.slaDiasHabiles,
        diasTranscurridos: casoLegal.diasTranscurridos ?? 0,
        diasRestantes: slaRestante,
        fechaLimite: casoLegal.slaFechaLimite,
        pausado:
          !casoLegal.documentacionCompleta &&
          isSelectValueEqual(
            casoLegal.estatus,
            CASO_LEGAL_ESTATUS_DOCS_INCOMPLETAS,
          ),
      },
    };
  },

  assignLawyer: async (
    casoLegalId: string,
    abogadoAsignado: string,
  ): Promise<CasoLegalRecord | null> => {
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);

    // Live Twenty select options do not include "Asignado"; use En elaboración
    const updated = await twentyDataService.updateCasoLegal(casoLegalId, {
      abogadoAsignado,
      estatus: toSelectValue(CASO_LEGAL_ESTATUS_ELABORACION),
    });

    if (!updated) {
      throw new Error(
        `No se pudo asignar abogado al caso ${casoLegalId}. Revisa opciones de estatus en Twenty.`,
      );
    }

    const referencia = casoLegal?.referencia ?? casoLegalId;
    const slaDias = casoLegal?.slaDiasHabiles ?? 0;
    const slaLimite = casoLegal?.slaFechaLimite ?? '—';

    const lawyerEmail = resolveLegalLawyerEmail(abogadoAsignado);
    const audienceNames = lawyerEmail
      ? [abogadoAsignado, lawyerEmail]
      : [abogadoAsignado];

    brokerNotificationStore.add({
      type: 'alert',
      priority: 'high',
      title: `Nuevo caso asignado — ${referencia}`,
      body: `SLA: ${slaDias} días hábiles · Vence: ${slaLimite}. Revisa documentación y elabora el borrador.`,
      area: 'Legal',
      actionPath: buildContratoAprobacionActionPath(casoLegalId),
      actionLabel: 'Abrir caso',
      // Names-only (+ email alias): only the assigned lawyer sees this
      audienceRoleLabels: [],
      audienceNames,
    });

    await notificacionService.notifyArea(
      abogadoAsignado,
      `Nuevo caso asignado: ${referencia} | SLA: ${slaDias} días | Vence: ${slaLimite}`,
    );

    await twentyDataService.createTask(
      `[${abogadoAsignado}] Revisar documentación y elaborar borrador`,
      `Caso ${referencia} — revisar checklist en 3 días hábiles`,
    );

    return twentyDataService.getCasoLegalById(casoLegalId);
  },

  pauseSla: async ({
    casoLegalId,
    motivoPausa,
  }: {
    casoLegalId: string;
    motivoPausa: string;
  }) => {
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);
    const diasPausados = (casoLegal?.diasPausados ?? 0) + 1;

    await twentyDataService.updateCasoLegal(casoLegalId, {
      slaPausado: true,
      fechaPausaSla: toIsoDateString(new Date()),
      motivoPausa,
      diasPausados,
      estatus: toSelectValue(CASO_LEGAL_ESTATUS_DOCS_INCOMPLETAS),
      documentacionCompleta: false,
    });

    const missingDocs =
      await twentyDataService.findDocumentosChecklistByCasoLegal(casoLegalId);
    const pending = missingDocs
      .filter((document) => !document.entregado)
      .map((document) => document.titulo ?? document.tipoDocumento)
      .join(', ');

    await notificacionService.notifyArea(
      'Comercial',
      `SLA pausado — caso ${casoLegal?.referencia ?? casoLegalId}. Documentos faltantes: ${pending || motivoPausa}`,
    );
  },

  resumeSla: async (casoLegalId: string) => {
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);

    if (!casoLegal) {
      return;
    }

    await twentyDataService.updateCasoLegal(casoLegalId, {
      slaPausado: false,
      documentacionCompleta: true,
      estatus: toSelectValue(CASO_LEGAL_ESTATUS_ELABORACION),
    });

    await slaService.reanudarSLA(casoLegal);
  },

  registerNdaSigned: async (casoLegalId: string) => {
    await twentyDataService.updateCasoLegal(casoLegalId, {
      ndaFirmado: true,
      slaPausado: false,
      estatus: toSelectValue(CASO_LEGAL_ESTATUS_ELABORACION),
    });

    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);

    if (casoLegal) {
      await slaService.reanudarSLA(casoLegal);
    }
  },

  getClientHistory: async (casoLegalId: string) => {
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);

    if (!casoLegal?.inquilinoId) {
      return [];
    }

    const allCasos = await twentyDataService.findAllCasosLegales();

    return allCasos.filter(
      (item) => item.inquilinoId === casoLegal.inquilinoId,
    );
  },

  ensureChecklist: async (casoLegalId: string): Promise<void> => {
    await checklistService.generateForCasoLegal(casoLegalId);
  },

  updateChecklistItem: async ({
    casoLegalId,
    documentoChecklistId,
    entregado,
  }: {
    casoLegalId: string;
    documentoChecklistId: string;
    entregado: boolean;
  }): Promise<{ documentacionCompleta: boolean }> => {
    await twentyDataService.updateDocumentoChecklist(documentoChecklistId, {
      entregado,
      fechaEntrega: entregado ? toIsoDateString(new Date()) : null,
    });

    const documentacionCompleta =
      await recomputeDocumentacionCompleta(casoLegalId);

    await twentyDataService.updateCasoLegal(casoLegalId, {
      documentacionCompleta,
      estatus: toSelectValue(
        documentacionCompleta
          ? CASO_LEGAL_ESTATUS_ELABORACION
          : CASO_LEGAL_ESTATUS_DOCS_INCOMPLETAS,
      ),
    });

    if (!documentacionCompleta) {
      const missingDocs = (
        await twentyDataService.findDocumentosChecklistByCasoLegal(casoLegalId)
      )
        .filter((document) => !document.entregado)
        .map((document) => document.titulo ?? document.tipoDocumento)
        .join(', ');

      await notificacionService.notifyArea(
        'Comercial',
        `Documentación incompleta — faltan: ${missingDocs}`,
      );
    } else {
      await legalWorkflowService.resumeSla(casoLegalId);
    }

    await refreshSemaforo(casoLegalId);

    return { documentacionCompleta };
  },

  advanceEstatus: async (
    casoLegalId: string,
    nextEstatus: string,
  ): Promise<CasoLegalRecord | null> => {
    await twentyDataService.updateCasoLegal(casoLegalId, {
      estatus: toSelectValue(nextEstatus),
    });

    if (isSelectValueEqual(nextEstatus, CASO_LEGAL_ESTATUS_PRIMERA_VERSION)) {
      await slaService.registrarHito(
        casoLegalId,
        'primera_version',
        new Date(),
      );
    }

    await refreshSemaforo(casoLegalId);

    return twentyDataService.getCasoLegalById(casoLegalId);
  },

  registerCotejo: async ({
    casoLegalId,
    aprobado,
    discrepancia,
    realizadoPor,
  }: {
    casoLegalId: string;
    aprobado: boolean;
    discrepancia?: string;
    realizadoPor?: string;
  }): Promise<void> => {
    const auditLine = `[Cotejo ${new Date().toISOString()}] ${realizadoPor ?? 'Catalina'}: ${aprobado ? 'Coinciden' : `Discrepancia — ${discrepancia ?? 'sin detalle'}`}`;
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);
    const notasCatalina = casoLegal?.notasCatalina
      ? `${casoLegal.notasCatalina}\n${auditLine}`
      : auditLine;

    if (aprobado) {
      await twentyDataService.updateCasoLegal(casoLegalId, {
        cotejoAprobado: true,
        estatus: toSelectValue(CASO_LEGAL_ESTATUS_FLUJO_FIRMAS),
        notasCatalina,
      });

      const refreshedCaso = await twentyDataService.getCasoLegalById(casoLegalId);

      if (refreshedCaso) {
        await firmasService.iniciarFlujoFirmas(refreshedCaso);

        if (
          refreshedCaso.esPropiedadFuno ||
          refreshedCaso.nave?.esPropiedadFuno
        ) {
          await twentyDataService.updateCasoLegal(casoLegalId, {
            estatus: toSelectValue(CASO_LEGAL_ESTATUS_FUNO),
          });
        }
      }

      return;
    }

    await twentyDataService.updateCasoLegal(casoLegalId, {
      cotejoAprobado: false,
      estatus: toSelectValue(
        discrepancia
          ? CASO_LEGAL_ESTATUS_ESPERA_FIRMA_CLIENTE
          : CASO_LEGAL_ESTATUS_COTEJO,
      ),
      notasCatalina,
    });
  },

  createVersion: async ({
    casoLegalId,
    enviadoPor,
    dirigidoA,
    respuestaCliente,
    cambiosSolicitados,
    esVersionFinal,
  }: {
    casoLegalId: string;
    enviadoPor: string;
    dirigidoA: string;
    respuestaCliente?: string;
    cambiosSolicitados?: string;
    esVersionFinal?: boolean;
  }) => {
    const existingVersions =
      await twentyDataService.findVersionesByCasoLegal(casoLegalId);
    const numeroVersion = existingVersions.length + 1;
    const today = toIsoDateString(new Date());

    const createdVersion = await twentyDataService.createVersionDocumento({
      titulo: `Versión ${numeroVersion}`,
      numeroVersion,
      fechaEnvio: today,
      enviadoPor,
      dirigidoA: toSelectValue(dirigidoA),
      respuestaCliente: toSelectValue(respuestaCliente ?? 'Pendiente'),
      cambiosSolicitados: cambiosSolicitados ?? null,
      esVersionFinal: esVersionFinal ?? false,
      casoLegalId,
    });

    const nextEstatus = esVersionFinal
      ? CASO_LEGAL_ESTATUS_VERSION_FINAL
      : numeroVersion === 1
        ? CASO_LEGAL_ESTATUS_PRIMERA_VERSION
        : CASO_LEGAL_ESTATUS_NEGOCIACION;

    await twentyDataService.updateCasoLegal(casoLegalId, {
      estatus: toSelectValue(nextEstatus),
    });

    if (numeroVersion === 1) {
      await slaService.registrarHito(
        casoLegalId,
        'primera_version',
        new Date(),
      );
    }

    await refreshSemaforo(casoLegalId);

    return createdVersion;
  },

  updateVersionResponse: async ({
    versionDocumentoId,
    casoLegalId,
    respuestaCliente,
    cambiosSolicitados,
    esVersionFinal,
  }: {
    versionDocumentoId: string;
    casoLegalId: string;
    respuestaCliente: string;
    cambiosSolicitados?: string;
    esVersionFinal?: boolean;
  }) => {
    await twentyDataService.updateVersionDocumento(versionDocumentoId, {
      respuestaCliente: toSelectValue(respuestaCliente),
      cambiosSolicitados: cambiosSolicitados ?? null,
      esVersionFinal: esVersionFinal ?? false,
    });

    if (esVersionFinal || respuestaCliente === 'Aceptada') {
      await twentyDataService.updateCasoLegal(casoLegalId, {
        estatus: toSelectValue(CASO_LEGAL_ESTATUS_VERSION_FINAL),
      });
    } else if (respuestaCliente === 'Modificaciones solicitadas') {
      await twentyDataService.updateCasoLegal(casoLegalId, {
        estatus: toSelectValue(CASO_LEGAL_ESTATUS_NEGOCIACION),
      });
    }

    await refreshSemaforo(casoLegalId);
  },

  markSignatureSigned: async ({
    casoLegalId,
    flujoFirmasId,
    fechaFirma,
  }: {
    casoLegalId: string;
    flujoFirmasId: string;
    fechaFirma?: string;
  }): Promise<void> => {
    await twentyDataService.updateFlujoFirmas(flujoFirmasId, {
      estatus: toSelectValue(FLUJO_FIRMAS_ESTATUS_FIRMADO),
      fechaFirma: fechaFirma ?? toIsoDateString(new Date()),
    });

    await firmasService.advanceAfterSignature(casoLegalId);
    await refreshSemaforo(casoLegalId);
  },
};
