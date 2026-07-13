import { envConfig } from '../config/env.config';
import { OPPORTUNITY_STAGE_HOJA_FIRMADA } from '../constants/parks.constants';
import { type DealWinPreview } from '../types/commercial.types';
import { isSelectValueEqual } from '../utils/select-value.util';
import { twentyDataService } from './twenty-data.service';

export const dealWinService = {
  getPreview: async (opportunityId: string): Promise<DealWinPreview> => {
    const opportunity =
      await twentyDataService.getOpportunityById(opportunityId);

    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    let companyName = opportunity.name ?? 'Prospecto';

    if (opportunity.inquilinoVinculadoId) {
      const inquilino = await twentyDataService.getInquilinoById(
        opportunity.inquilinoVinculadoId,
      );

      if (inquilino?.empresa) {
        companyName = inquilino.empresa;
      }
    }

    let naveIdentificador: string | undefined;

    if (opportunity.naveVinculadaId) {
      try {
        const naveResponse = await twentyDataService.getNaveById(
          opportunity.naveVinculadaId,
        );
        naveIdentificador = naveResponse?.identificador;
      } catch {
        naveIdentificador = undefined;
      }
    }

    const isHojaFirmada = isSelectValueEqual(
      opportunity.stage,
      OPPORTUNITY_STAGE_HOJA_FIRMADA,
    );

    const steps = [
      '1. Hoja de Acuerdos firmada (CEM + cliente)',
      envConfig.parksLegalHandoffEnabled
        ? '2. Auto-creación de caso legal + reserva de nave'
        : '2. Reserva de nave en cartera (handoff legal deshabilitado en demo)',
      '3. Validación documental + checklist legal',
      '4. Contrato generado y flujo de firmas',
      '5. Al cierre legal → expediente/contrato activo sin doble captura',
    ];

    return {
      opportunityId,
      companyName,
      naveIdentificador,
      willCreateCasoLegal: envConfig.parksLegalHandoffEnabled,
      willReserveNave: Boolean(opportunity.naveVinculadaId),
      willOpenExpedienteOnClose: true,
      steps,
      ...(isHojaFirmada ? {} : {}),
    };
  },
};
