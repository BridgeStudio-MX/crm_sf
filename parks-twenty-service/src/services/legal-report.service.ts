import { CASO_LEGAL_ESTATUS_CERRADO } from '../constants/parks.constants';
import { isSelectValueEqual } from '../utils/select-value.util';
import { twentyDataService } from './twenty-data.service';

export type LegalQuincenalReportRow = {
  empresa: string;
  nave: string;
  parque: string;
  fechaVencimiento: string;
  diasRestantes: number;
  estatus: string;
  abogadoAsignado: string;
  semaforo: string;
  tipoDocumento: string;
};

const buildCsv = (rows: LegalQuincenalReportRow[]): string => {
  const header =
    'Empresa,Nave,Parque,Vencimiento,Días restantes,Estatus,Abogado,Semáforo,Tipo documento';
  const lines = rows.map(
    (row) =>
      `"${row.empresa}","${row.nave}","${row.parque}","${row.fechaVencimiento}",${row.diasRestantes},"${row.estatus}","${row.abogadoAsignado}","${row.semaforo}","${row.tipoDocumento}"`,
  );

  return [header, ...lines].join('\n');
};

export const legalReportService = {
  generateQuincenalReport: async () => {
    const [casosLegales, expedientes] = await Promise.all([
      twentyDataService.findCasosLegalesActivos(),
      twentyDataService.findExpedientesActivos(),
    ]);

    const expedienteByCaso = new Map(
      expedientes.map((expediente) => [
        expediente.casoLegalId,
        expediente,
      ]),
    );

    const rows: LegalQuincenalReportRow[] = casosLegales
      .filter(
        (casoLegal) =>
          !isSelectValueEqual(casoLegal.estatus, CASO_LEGAL_ESTATUS_CERRADO),
      )
      .map((casoLegal) => {
        const expediente = expedienteByCaso.get(casoLegal.id);
        const fechaVencimiento = expediente?.fechaVencimiento ?? '';
        const diasRestantes = fechaVencimiento
          ? Math.ceil(
              (new Date(fechaVencimiento).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            )
          : casoLegal.slaDiasHabiles - casoLegal.diasTranscurridos;

        return {
          empresa: casoLegal.inquilino?.empresa ?? '—',
          nave: casoLegal.nave?.identificador ?? '—',
          parque: casoLegal.nave?.parque?.nombre ?? '—',
          fechaVencimiento,
          diasRestantes,
          estatus: casoLegal.estatus,
          abogadoAsignado: casoLegal.abogadoAsignado ?? 'Sin asignar',
          semaforo: casoLegal.semaforo ?? '—',
          tipoDocumento: casoLegal.tipoDocumento ?? '—',
        };
      });

    return {
      generatedAt: new Date().toISOString(),
      rowCount: rows.length,
      rows,
      csv: buildCsv(rows),
    };
  },
};
