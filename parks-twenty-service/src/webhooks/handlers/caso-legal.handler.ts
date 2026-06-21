import {
  CASO_LEGAL_ESTATUS_CERRADO,
  CASO_LEGAL_ESTATUS_DOCS_INCOMPLETAS,
  CASO_LEGAL_ESTATUS_ELABORACION,
  CASO_LEGAL_ESTATUS_PRIMERA_VERSION,
} from '../../constants/parks.constants';
import { checklistService } from '../../services/checklist.service';
import { expedienteService } from '../../services/expediente.service';
import { firmasService } from '../../services/firmas.service';
import { notificacionService } from '../../services/notificacion.service';
import { pdfService } from '../../services/pdf.service';
import { semaforoService } from '../../services/semaforo.service';
import { slaService } from '../../services/sla.service';
import { twentyDataService } from '../../services/twenty-data.service';
import { type TwentyWebhookPayload } from '../../types/parks.types';
import { isSelectValueEqual, toSelectValue } from '../../utils/select-value.util';
import {
  mapWebhookRecordToCasoLegal,
  parseTwentyWebhook,
  wasFieldUpdated,
} from '../webhook-payload.util';

const loadFullCasoLegal = async (casoLegalId: string) =>
  twentyDataService.getCasoLegalById(casoLegalId);

export const handleCasoLegalWebhook = async (
  payload: TwentyWebhookPayload,
): Promise<void> => {
  const parsedWebhook = parseTwentyWebhook(payload);

  if (!parsedWebhook) {
    console.warn('[caso-legal.handler] Invalid webhook payload');
    return;
  }

  const casoLegalSnapshot = mapWebhookRecordToCasoLegal(parsedWebhook.record);

  if (parsedWebhook.action === 'created') {
    await slaService.iniciarSLA(casoLegalSnapshot);
    await checklistService.generarChecklist(casoLegalSnapshot);
    await notificacionService.notificarCatalina(casoLegalSnapshot);
    await semaforoService.updateForCaso(casoLegalSnapshot);
    return;
  }

  if (parsedWebhook.action !== 'updated') {
    return;
  }

  const fullCasoLegal =
    (await loadFullCasoLegal(parsedWebhook.recordId)) ?? casoLegalSnapshot;

  if (
    wasFieldUpdated(parsedWebhook, 'documentacionCompleta') &&
    fullCasoLegal.documentacionCompleta === true
  ) {
    await slaService.reanudarSLA(fullCasoLegal);
    await twentyDataService.updateCasoLegal(fullCasoLegal.id, {
      estatus: toSelectValue(CASO_LEGAL_ESTATUS_ELABORACION),
    });
    await pdfService.generateForCasoLegal(fullCasoLegal.id);
  }

  if (
    wasFieldUpdated(parsedWebhook, 'documentacionCompleta') &&
    fullCasoLegal.documentacionCompleta === false
  ) {
    await twentyDataService.updateCasoLegal(fullCasoLegal.id, {
      estatus: toSelectValue(CASO_LEGAL_ESTATUS_DOCS_INCOMPLETAS),
    });
    await notificacionService.notifyArea(
      'Comercial',
      `Documentación incompleta — caso ${fullCasoLegal.referencia ?? fullCasoLegal.id}`,
    );
  }

  if (
    wasFieldUpdated(parsedWebhook, 'estatus') &&
    isSelectValueEqual(
      fullCasoLegal.estatus,
      CASO_LEGAL_ESTATUS_PRIMERA_VERSION,
    )
  ) {
    await slaService.registrarHito(
      fullCasoLegal.id,
      'primera_version',
      new Date(),
    );
  }

  if (
    wasFieldUpdated(parsedWebhook, 'cotejoAprobado') &&
    fullCasoLegal.cotejoAprobado === true
  ) {
    await firmasService.iniciarFlujoFirmas(fullCasoLegal);
  }

  if (
    wasFieldUpdated(parsedWebhook, 'estatus') &&
    isSelectValueEqual(fullCasoLegal.estatus, CASO_LEGAL_ESTATUS_CERRADO)
  ) {
    const casoLegalWithRelations =
      (await loadFullCasoLegal(fullCasoLegal.id)) ?? fullCasoLegal;

    await notificacionService.dispararTicketCierre(casoLegalWithRelations);
    await expedienteService.abrirExpediente(casoLegalWithRelations);
    await slaService.cerrarSLA(fullCasoLegal.id);
  }

  const refreshedCasoLegal =
    (await loadFullCasoLegal(fullCasoLegal.id)) ?? fullCasoLegal;

  await semaforoService.updateForCaso(refreshedCasoLegal);
};
