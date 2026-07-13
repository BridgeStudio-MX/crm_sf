import { twentyDataService } from './twenty-data.service';
import { notificacionService } from './notificacion.service';

const DAYS_WITHOUT_RESPONSE_FIRST = 5;
const DAYS_WITHOUT_RESPONSE_ESCALATION = 10;

export const versionFollowUpService = {
  scanPendingResponses: async (): Promise<void> => {
    const casosLegales = await twentyDataService.findCasosLegalesActivos();

    for (const casoLegal of casosLegales) {
      const versiones = await twentyDataService.findVersionesByCasoLegal(
        casoLegal.id,
      );
      const pendingVersion = versiones.find(
        (version) =>
          version.respuestaCliente === 'Pendiente' ||
          (version.respuestaCliente ?? '').includes('Pendiente'),
      );

      if (!pendingVersion?.fechaEnvio) {
        continue;
      }

      const daysSinceSend = Math.floor(
        (Date.now() - new Date(pendingVersion.fechaEnvio).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysSinceSend >= DAYS_WITHOUT_RESPONSE_ESCALATION) {
        await notificacionService.notifyArea(
          'Comercial',
          `Sin respuesta del cliente (${daysSinceSend} días) — caso ${casoLegal.referencia ?? casoLegal.id}. Escalar seguimiento.`,
        );
        continue;
      }

      if (daysSinceSend >= DAYS_WITHOUT_RESPONSE_FIRST) {
        await twentyDataService.createTask(
          `[Legal] Seguimiento versión ${pendingVersion.numeroVersion ?? ''}`,
          `Sin respuesta del cliente en ${daysSinceSend} días — coordinar con Comercial`,
        );
      }
    }
  },
};
