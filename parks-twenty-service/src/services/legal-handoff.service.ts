import { brokerNotificationStore } from './broker-notification.store';
import { documentValidationService } from './document-validation.service';
import { notificacionService } from './notificacion.service';
import { twentyDataService } from './twenty-data.service';
import { type PreSendLegalResult } from '../types/legal.types';
import { toSelectValue } from '../utils/select-value.util';

export const legalHandoffService = {
  preSendToLegal: async (
    casoLegalId: string,
  ): Promise<PreSendLegalResult> => {
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);

    if (!casoLegal) {
      return {
        casoLegalId,
        canSend: false,
        validation: {
          casoLegalId,
          overallStatus: 'red',
          items: [],
          summary: 'Caso legal no encontrado.',
          usedLlm: false,
          validatedAt: new Date().toISOString(),
        },
        message: 'Caso legal no encontrado.',
      };
    }

    const validation = await documentValidationService.validateWithLlm({
      casoLegalId,
    });

    const canSend = validation.overallStatus !== 'red';
    const referencia = casoLegal.referencia ?? casoLegalId;

    if (!canSend) {
      await twentyDataService.updateCasoLegal(casoLegalId, {
        semaforo: 'ROJO',
        estatus: toSelectValue('Documentación incompleta'),
      });

      brokerNotificationStore.add({
        type: 'alert',
        priority: 'high',
        title: `Validación documental fallida — ${referencia}`,
        body: validation.summary,
        area: 'Comercial',
      });

      return {
        casoLegalId,
        canSend: false,
        validation,
        message:
          'No se puede enviar a legal: corrige los conflictos documentales detectados.',
      };
    }

    await twentyDataService.updateCasoLegal(casoLegalId, {
      semaforo: validation.overallStatus === 'green' ? 'VERDE' : 'AMARILLO',
      documentacionCompleta: validation.overallStatus === 'green',
    });

    await notificacionService.notificarCatalina(casoLegal);

    await twentyDataService.createTask(
      '[Legal] Revisar paquete comercial pre-validado',
      `${referencia}: documentación ${validation.overallStatus === 'green' ? 'consistente' : 'con advertencias'}. ${validation.summary}`,
    );

    brokerNotificationStore.add({
      type: 'task',
      priority: 'normal',
      title: `Paquete enviado a Legal — ${referencia}`,
      body: validation.summary,
      area: 'Legal — Catalina',
    });

    return {
      casoLegalId,
      canSend: true,
      validation,
      message:
        validation.overallStatus === 'green'
          ? 'Paquete pre-validado y enviado a Legal (Catalina).'
          : 'Paquete enviado con advertencias — Legal debe revisar.',
    };
  },
};
