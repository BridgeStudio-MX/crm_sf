import { envConfig } from '../config/env.config';
import { type HojaDeAcuerdosRecord } from '../types/parks.types';
import { toSelectValue } from '../utils/select-value.util';
import { twentyDataService } from './twenty-data.service';

const calculateValorTotalContrato = (
  hojaDeAcuerdos: HojaDeAcuerdosRecord,
): number =>
  hojaDeAcuerdos.precioUsdM2 *
  hojaDeAcuerdos.m2Acordados *
  hojaDeAcuerdos.plazoMeses;

export const comisionService = {
  calculateForHojaAcuerdos: async (hojaDeAcuerdosId: string): Promise<void> => {
    const hojaDeAcuerdos =
      await twentyDataService.getHojaDeAcuerdosById(hojaDeAcuerdosId);

    if (!hojaDeAcuerdos) {
      console.warn(
        `[comision.service] Hoja de acuerdos not found: ${hojaDeAcuerdosId}`,
      );
      return;
    }

    await comisionService.calcularComisiones(hojaDeAcuerdos);
  },

  calcularComisiones: async (
    hojaDeAcuerdos: HojaDeAcuerdosRecord,
    casoLegalId?: string,
  ): Promise<void> => {
    const existingComisiones =
      await twentyDataService.findComisionesByHojaDeAcuerdos(hojaDeAcuerdos.id);

    if (existingComisiones.length > 0) {
      console.log(
        `[comision.service] Comisiones already exist for hoja ${hojaDeAcuerdos.id}`,
      );
      return;
    }

    const nave = hojaDeAcuerdos.nave;

    if (nave?.esPropiedadFuno) {
      await twentyDataService.createNote(
        'Propiedad FUNO — sin comisión interna',
        `Hoja ${hojaDeAcuerdos.referencia ?? hojaDeAcuerdos.id}: comisión va directo a FIBRA. No aplica comisión interna Parks.`,
      );

      console.log(
        `[comision.service] FUNO property — skipped internal commissions`,
      );
      return;
    }

    const valorTotalContrato = calculateValorTotalContrato(hojaDeAcuerdos);
    const comisionEjecutivoPct = envConfig.comisionEjecutivoPct;
    const montoEjecutivo = valorTotalContrato * comisionEjecutivoPct;

    await twentyDataService.createComision({
      tipo: toSelectValue('Interna ejecutivo'),
      beneficiario:
        hojaDeAcuerdos.ejecutivoAsignado ?? 'Ejecutivo comercial',
      montoUsd: montoEjecutivo,
      baseCalculo: `${valorTotalContrato.toFixed(2)} USD × ${comisionEjecutivoPct}`,
      estatus: toSelectValue('Pendiente'),
      aplicaFuno: false,
      hojaDeAcuerdosId: hojaDeAcuerdos.id,
      ...(casoLegalId ? { casoLegalId } : {}),
    });

    const brokerComisionPct = hojaDeAcuerdos.brokerComisionPct ?? 0;

    if (hojaDeAcuerdos.brokerId && brokerComisionPct > 0) {
      const brokerNombre =
        hojaDeAcuerdos.broker?.empresa ??
        hojaDeAcuerdos.broker?.contacto ??
        'Broker externo';
      const montoBroker = valorTotalContrato * (brokerComisionPct / 100);

      await twentyDataService.createComision({
        tipo: toSelectValue('Broker externo'),
        beneficiario: brokerNombre,
        montoUsd: montoBroker,
        baseCalculo: `${valorTotalContrato.toFixed(2)} USD × ${brokerComisionPct}%`,
        estatus: toSelectValue('Pendiente'),
        aplicaFuno: false,
        hojaDeAcuerdosId: hojaDeAcuerdos.id,
        ...(casoLegalId ? { casoLegalId } : {}),
      });
    }

    console.log(
      `[comision.service] Comisiones calculated for hoja ${hojaDeAcuerdos.referencia ?? hojaDeAcuerdos.id}`,
    );
  },
};
