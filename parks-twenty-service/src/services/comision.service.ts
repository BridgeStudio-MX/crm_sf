import { type HojaDeAcuerdosRecord } from '../types/parks.types';
import { toSelectValue } from '../utils/select-value.util';
import {
  calculateRentaTotalContrato,
  resolveApplicableCommissionRate,
} from '../utils/commission-rate.util';
import { twentyDataService } from './twenty-data.service';

const ORIGEN_LABEL: Record<string, string> = {
  DIRECTO: 'Directo',
  BROKER_TOP_10: 'Broker Top 10',
  BROKER_NO_TOP_10: 'Broker fuera Top 10',
};

const TIPO_CONTRATO_LABEL: Record<string, string> = {
  NUEVO: 'Nuevo',
  RENOVACION: 'Renovación',
};

const ESTATUS_NAVE_LABEL: Record<string, string> = {
  CONSTRUIDA: 'Construida',
  POR_CONSTRUIR: 'Por construir',
};

const TIER_SNAPSHOT_LABEL: Record<string, string> = {
  DIRECTO: 'Directo',
  TOP_10: 'Top 10',
  NO_TOP_10: 'No top 10',
};

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

    const opportunityId = hojaDeAcuerdos.oportunidadVinculadaId;
    const opportunity = opportunityId
      ? await twentyDataService.getOpportunityById(opportunityId)
      : null;

    const folio =
      hojaDeAcuerdos.folio ??
      opportunity?.folio ??
      hojaDeAcuerdos.referencia ??
      hojaDeAcuerdos.id;

    let brokerOverrides:
      | {
          comisionPctNuevo?: number | null;
          comisionPctPreventa?: number | null;
          comisionPctRenovacion?: number | null;
          comisionPct?: number | null;
        }
      | undefined;
    let brokerClasificacion: string | null | undefined;
    let brokerNombre = 'Broker externo';

    if (hojaDeAcuerdos.brokerId) {
      const brokers = await twentyDataService.findAllBrokers();
      const broker = brokers.find((item) => item.id === hojaDeAcuerdos.brokerId);
      brokerNombre =
        broker?.empresa ??
        broker?.contacto ??
        hojaDeAcuerdos.broker?.empresa ??
        hojaDeAcuerdos.broker?.contacto ??
        'Broker externo';
      brokerClasificacion = broker?.clasificacion;

      if (broker?.empresaBrokerId) {
        const empresas = await twentyDataService.findAllEmpresasBroker();
        const empresa = empresas.find(
          (item) => item.id === broker.empresaBrokerId,
        );

        if (empresa) {
          brokerClasificacion = empresa.clasificacion ?? brokerClasificacion;
          brokerOverrides = {
            comisionPct: empresa.comisionPct,
            comisionPctNuevo: empresa.comisionPctNuevo,
            comisionPctPreventa: empresa.comisionPctPreventa,
            comisionPctRenovacion: empresa.comisionPctRenovacion,
          };
        }
      }
    }

    const rate = resolveApplicableCommissionRate({
      hasBroker: Boolean(hojaDeAcuerdos.brokerId),
      brokerClasificacion,
      esquemaComision: hojaDeAcuerdos.esquemaComision,
      tipoContratoOrOperacion:
        hojaDeAcuerdos.tipoContrato ?? opportunity?.tipoOperacion,
      naveEstatus: nave?.estatus,
      brokerOverrides,
      hojaBrokerComisionPct:
        rateUsesHojaPct(hojaDeAcuerdos) ? hojaDeAcuerdos.brokerComisionPct : null,
    });

    const rentaTotalContrato = calculateRentaTotalContrato(
      hojaDeAcuerdos.precioUsdM2,
      hojaDeAcuerdos.m2Acordados,
      hojaDeAcuerdos.plazoMeses,
    );
    const montoUsd = rentaTotalContrato * (rate.pctAplicado / 100);
    const fechaCierre = twentyDataService.todayIsoDate();
    const clienteNombre =
      opportunity?.name?.split('—')[0]?.trim() ??
      hojaDeAcuerdos.referencia ??
      'Cliente';
    const leasingOfficer =
      hojaDeAcuerdos.ejecutivoAsignado ??
      opportunity?.leasingOfficerAsignado ??
      'Ejecutivo comercial';

    const commonFields = {
      folio,
      clienteNombre,
      leasingOfficer,
      origenDeal: toSelectValue(ORIGEN_LABEL[rate.origen]),
      tipoContratoComision: toSelectValue(
        TIPO_CONTRATO_LABEL[rate.tipoContrato],
      ),
      estatusNaveComision: toSelectValue(
        ESTATUS_NAVE_LABEL[rate.estatusNave],
      ),
      brokerTierSnapshot: toSelectValue(
        TIER_SNAPSHOT_LABEL[rate.brokerTierSnapshot],
      ),
      rentaTotalContrato,
      pctAplicado: rate.pctAplicado,
      montoUsd,
      baseCalculo: `${rentaTotalContrato.toFixed(2)} USD × ${rate.pctAplicado}% (${rate.source})`,
      estatus: toSelectValue('Pendiente'),
      tipoPago: toSelectValue(
        rate.tipoPago === 'interno' ? 'Interno' : 'Externo',
      ),
      fechaCierre,
      aplicaFuno: false,
      hojaDeAcuerdosId: hojaDeAcuerdos.id,
      opportunityId: opportunityId ?? undefined,
      ...(casoLegalId ? { casoLegalId } : {}),
    };

    if (rate.origen === 'DIRECTO') {
      await twentyDataService.createComision({
        ...commonFields,
        tipo: toSelectValue('Interna ejecutivo'),
        beneficiario: leasingOfficer,
      });
    } else {
      await twentyDataService.createComision({
        ...commonFields,
        tipo: toSelectValue('Broker externo'),
        beneficiario: brokerNombre,
        brokerId: hojaDeAcuerdos.brokerId,
      });
    }

    if (opportunityId) {
      await twentyDataService.updateOpportunity(opportunityId, {
        fechaCierreReal: fechaCierre,
        costoBrokerComision:
          rate.tipoPago === 'externo' ? montoUsd : undefined,
      });
    }

    console.log(
      `[comision.service] Comisión ${rate.tipoPago} ${rate.pctAplicado}% → USD ${montoUsd.toFixed(2)} · folio ${folio}`,
    );
  },
};

const rateUsesHojaPct = (hoja: HojaDeAcuerdosRecord): boolean =>
  Boolean(hoja.brokerId) &&
  typeof hoja.brokerComisionPct === 'number' &&
  hoja.brokerComisionPct > 0;
