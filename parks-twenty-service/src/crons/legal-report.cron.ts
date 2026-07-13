import cron from 'node-cron';

import { legalReportService } from '../services/legal-report.service';
import { notificacionService } from '../services/notificacion.service';

export const registerLegalReportCron = (): void => {
  // Lunes 7:30 AM — reporte quincenal (cada 2 semanas aproximado: 1er y 3er lunes)
  cron.schedule('30 7 * * 1', async () => {
    const weekNumber = Math.ceil(new Date().getDate() / 7);

    if (weekNumber !== 1 && weekNumber !== 3) {
      return;
    }

    try {
      const report = await legalReportService.generateQuincenalReport();

      await notificacionService.notifyArea(
        'Legal — Catalina',
        `Reporte quincenal generado (${report.rowCount} filas)`,
      );
      await notificacionService.notifyArea(
        'Director Legal',
        `Reporte quincenal legal disponible — ${report.rowCount} casos`,
      );
      await notificacionService.notifyArea(
        'CEM',
        `Reporte quincenal renovaciones/legal — ${report.rowCount} filas`,
      );
      await notificacionService.notifyArea(
        'CEO',
        `Reporte quincenal legal Parks Industrial`,
      );

      console.log(
        `[legal-report.cron] Quincenal report generated — ${report.rowCount} rows`,
      );
    } catch (error) {
      console.error('[legal-report.cron] Failed:', error);
    }
  });
};
