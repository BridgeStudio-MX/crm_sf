import { NAVE_ESTATUS_RENTADA } from '../constants/parks.constants';
import { type CasoLegalRecord, type NotificacionTicket } from '../types/parks.types';
import { toSelectValue } from '../utils/select-value.util';
import { comisionService } from './comision.service';
import { twentyDataService } from './twenty-data.service';

const buildTicketsCierre = (casoLegal: CasoLegalRecord): NotificacionTicket[] => {
  const empresa = casoLegal.inquilino?.empresa ?? 'Cliente';
  const naveIdentificador =
    casoLegal.nave?.identificador ?? casoLegal.naveId ?? 'N/A';
  const precioUsdM2 = casoLegal.hojaDeAcuerdos?.precioUsdM2 ?? 0;
  const m2Acordados = casoLegal.hojaDeAcuerdos?.m2Acordados ?? 0;

  return [
    {
      area: 'Comercial',
      titulo: `Contrato firmado — ${empresa}`,
      descripcion:
        'Contrato completo con todas las firmas. Procede a calcular comisión.',
    },
    {
      area: 'CxC',
      titulo: `Emitir factura pagos iniciales — ${empresa}`,
      descripcion: `Depósito en garantía + primera renta. Nave: ${naveIdentificador}`,
    },
    {
      area: 'Facturación',
      titulo: `Configurar factura mensual recurrente — ${empresa}`,
      descripcion: `${precioUsdM2} USD/m² × ${m2Acordados} m²`,
    },
    {
      area: 'Tenant',
      titulo: `Coordinar entrega de nave — ${naveIdentificador}`,
      descripcion:
        'Levantamiento de acta de entrega. Coordinar accesos y condiciones.',
    },
    {
      area: 'Administrador Parque',
      titulo: `Nuevo inquilino — ${empresa}`,
      descripcion: `Nave ${naveIdentificador}. Configurar accesos, credenciales y servicios.`,
    },
  ];
};

export const notificacionService = {
  notifyArea: async (area: string, message: string): Promise<void> => {
    console.log(`[notificacion.service] [${area}] ${message}`);
    await twentyDataService.createNote(`[${area}] Notificación Parks`, message);
  },

  notificarCatalina: async (casoLegal: CasoLegalRecord): Promise<void> => {
    const referencia = casoLegal.referencia ?? casoLegal.id;
    const message = `Nuevo caso legal asignado: ${referencia} (${casoLegal.tipoDocumento ?? 'tipo pendiente'})`;

    await twentyDataService.updateCasoLegal(casoLegal.id, {
      notasCatalina: message,
    });

    await notificacionService.notifyArea('Legal — Catalina', message);
  },

  dispararTicketCierre: async (casoLegal: CasoLegalRecord): Promise<void> => {
    const tickets = buildTicketsCierre(casoLegal);

    for (const ticket of tickets) {
      await twentyDataService.createTask(
        `[${ticket.area}] ${ticket.titulo}`,
        ticket.descripcion,
      );
      console.log(
        `[notificacion.service] Ticket ${ticket.area}: ${ticket.titulo}`,
      );
    }

    if (casoLegal.naveId) {
      await twentyDataService.updateNave(casoLegal.naveId, {
        estatus: toSelectValue(NAVE_ESTATUS_RENTADA),
      });
    }

    if (casoLegal.hojaDeAcuerdosId) {
      await comisionService.calculateForHojaAcuerdos(casoLegal.hojaDeAcuerdosId);
    }

    if (casoLegal.nave?.esPropiedadFuno) {
      console.log(
        '[notificacion.service] FUNO property — Oracle expediente archivado (Paso 9+)',
      );
      return;
    }

    console.log(
      `[notificacion.service] Cierre multi-área completado — ${casoLegal.referencia ?? casoLegal.id}`,
    );
  },
};
