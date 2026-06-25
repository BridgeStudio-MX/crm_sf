import { useMemo } from 'react';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  useParksParques,
} from '@/parks-industrial/hooks/useParksParques';
import { useParksObjectMetadataItem } from '@/parks-industrial/hooks/useParksObjectMetadataItem';
import { useParksRecordGqlFields } from '@/parks-industrial/hooks/useParksRecordGqlFields';
import {
  getParksDaysUntil,
  getParksStackingStatus,
  type ParksStackingStatusColor,
  type ParksStackingStatusKey,
} from '@/parks-industrial/utils/parks-format.util';
import {
  buildParksNaveDisponibilidadMetrics,
  buildParksOperationalMetricsFromExpedientes,
  buildParksPortfolioMetricsFromParques,
} from '@/parks-industrial/utils/parks-portfolio-metrics.util';
import {
  buildParksRenovacionQueue,
  buildParksRenovacionesSummary,
} from '@/parks-industrial/utils/parks-renovaciones.util';
import {
  buildParksReservaItems,
  buildParksReservasSummary,
} from '@/parks-industrial/utils/parks-reservas.util';
import {
  buildParksDashboardIngresosPorRegion,
  buildParksDashboardNaveStatusSlices,
  buildParksDashboardOcupacionSlices,
  buildParksDashboardPipelineStages,
  buildParksDashboardPipelineSummary,
  buildParksDashboardRegionalSummaries,
  buildParksDashboardTopParques,
} from '@/parks-industrial/utils/parks-dashboard-charts.util';

export type ParksNaveRecord = ObjectRecord & {
  identificador?: string;
  m2?: number;
  precioBaseUsd?: number;
  estatus?: string;
  parqueId?: string;
  fotoInmuebleUrl?: string;
};

export type ParksExpedienteRecord = ObjectRecord & {
  fechaVencimiento?: string;
  rentaMensualUsd?: number;
  estatus?: string;
  inquilino?: ObjectRecord & { empresa?: string };
  nave?: ParksNaveRecord;
  casoLegal?: ObjectRecord & { id?: string; referencia?: string };
};

export type ParksStackingPlanNave = ParksNaveRecord & {
  expedienteActivo?: ParksExpedienteRecord | null;
  diasRestantes?: number | null;
  statusColor: ParksStackingStatusColor;
  statusKey: ParksStackingStatusKey;
};

export type ParksOpportunityRecord = ObjectRecord & {
  name?: string;
  stage?: string;
  etapaRenovacion?: string;
  m2Requeridos?: number;
  updatedAt?: string;
  amount?: { amountMicros?: number; currencyCode?: string };
  naveVinculada?: ObjectRecord & { identificador?: string };
  inquilinoVinculado?: ObjectRecord & { empresa?: string };
  owner?: ObjectRecord & {
    name?: { firstName?: string; lastName?: string };
  };
};

export type ParksHoldoverRecord = ObjectRecord & {
  referencia?: string;
  fechaInicioHoldover?: string;
  rentaBaseMensualUsd?: number;
  montoHoldoverMensual?: number;
  facturasEmitidas?: number;
  resolucion?: string;
  etapaPipeline?: string;
  inquilino?: ObjectRecord & { empresa?: string };
  nave?: ParksNaveRecord & { identificador?: string };
  casoLegal?: ObjectRecord & { id?: string; referencia?: string };
};

export type ParksCasoLegalRecord = ObjectRecord & {
  referencia?: string;
  notasCatalina?: string;
  semaforo?: string;
  estatus?: string;
  inquilino?: ObjectRecord & { empresa?: string };
  nave?: ObjectRecord & { identificador?: string };
  hojaDeAcuerdos?: ObjectRecord & {
    m2Acordados?: number;
    precioUsdM2?: number;
    plazoMeses?: number;
    fechaInicio?: string;
  };
};

export type ParksComisionRecord = ObjectRecord & {
  tipo?: string;
  beneficiario?: string;
  montoUsd?: number;
  baseCalculo?: string;
  estatus?: string;
  casoLegal?: ObjectRecord & { referencia?: string };
  hojaDeAcuerdos?: ObjectRecord & {
    referencia?: string;
    nave?: ObjectRecord & { identificador?: string };
  };
};

export const useParksNaves = () => {
  const { isParksMetadataReady } = useParksObjectMetadataItem('nave');
  const { recordGqlFields } = useParksRecordGqlFields('nave', 1);

  return useFindManyRecords<ParksNaveRecord>({
    objectNameSingular: 'nave',
    recordGqlFields,
    limit: 500,
    orderBy: [{ identificador: 'AscNullsLast' }],
    skip: !isParksMetadataReady,
  });
};

export const useParksExpedientesActivos = () => {
  const { isParksMetadataReady } = useParksObjectMetadataItem(
    'expedienteContrato',
  );
  const { recordGqlFields } = useParksRecordGqlFields('expedienteContrato', 1);

  return useFindManyRecords<ParksExpedienteRecord>({
    objectNameSingular: 'expedienteContrato',
    recordGqlFields,
    filter: { estatus: { eq: 'ACTIVO' } },
    limit: 200,
    skip: !isParksMetadataReady,
  });
};

export const useParksOpportunities = () => {
  const { recordGqlFields } = useParksRecordGqlFields('opportunity', 1);

  return useFindManyRecords<ParksOpportunityRecord>({
    objectNameSingular: 'opportunity',
    recordGqlFields,
    orderBy: [{ updatedAt: 'DescNullsLast' }],
    limit: 100,
  });
};

export const useParksCasosLegales = () => {
  const { isParksMetadataReady } = useParksObjectMetadataItem('casoLegal');
  const { recordGqlFields } = useParksRecordGqlFields('casoLegal', 1);

  return useFindManyRecords<ParksCasoLegalRecord>({
    objectNameSingular: 'casoLegal',
    recordGqlFields,
    orderBy: [{ updatedAt: 'DescNullsLast' }],
    limit: 100,
    skip: !isParksMetadataReady,
  });
};

export const useParksCasoLegal = (casoLegalId?: string) => {
  const { isParksMetadataReady } = useParksObjectMetadataItem('casoLegal');
  const { recordGqlFields } = useParksRecordGqlFields('casoLegal', 1);

  const { records, loading } = useFindManyRecords<ParksCasoLegalRecord>({
    objectNameSingular: 'casoLegal',
    recordGqlFields,
    filter: casoLegalId ? { id: { eq: casoLegalId } } : undefined,
    limit: 1,
    skip: !casoLegalId || !isParksMetadataReady,
  });

  return { casoLegal: records[0], loading };
};

export const useParksComisiones = () => {
  const { isParksMetadataReady } = useParksObjectMetadataItem('comision');
  const { recordGqlFields } = useParksRecordGqlFields('comision', 1);

  return useFindManyRecords<ParksComisionRecord>({
    objectNameSingular: 'comision',
    recordGqlFields,
    orderBy: [{ createdAt: 'DescNullsLast' }],
    limit: 100,
    skip: !isParksMetadataReady,
  });
};

export const useParksHoldovers = () => {
  const { isParksMetadataReady } = useParksObjectMetadataItem('holdover');
  const { recordGqlFields } = useParksRecordGqlFields('holdover', 1);

  return useFindManyRecords<ParksHoldoverRecord>({
    objectNameSingular: 'holdover',
    recordGqlFields,
    orderBy: [{ updatedAt: 'DescNullsLast' }],
    limit: 100,
    skip: !isParksMetadataReady,
  });
};

export const useParksRenovaciones = () => {
  const { records: parques, loading: parquesLoading } = useParksParques();
  const { records: expedientes, loading: expedientesLoading } =
    useParksExpedientesActivos();
  const { records: opportunities, loading: opportunitiesLoading } =
    useParksOpportunities();
  const { records: naves, loading: navesLoading } = useParksNaves();
  const { isParksMetadataReady: isHoldoverMetadataReady } =
    useParksObjectMetadataItem('holdover');

  const queue = useMemo(
    () =>
      buildParksRenovacionQueue({
        expedientes,
        opportunities,
        parques,
        naves,
      }),
    [expedientes, naves, opportunities, parques],
  );

  const summary = useMemo(
    () =>
      buildParksRenovacionesSummary({
        queue,
        holdovers: [],
      }),
    [queue],
  );

  return {
    queue,
    isHoldoverMetadataReady,
    summary,
    loading:
      parquesLoading ||
      expedientesLoading ||
      opportunitiesLoading ||
      navesLoading,
  };
};

export const useParksReservas = () => {
  const { records: parques, loading: parquesLoading } = useParksParques();
  const { records: naves, loading: navesLoading } = useParksNaves();
  const { records: opportunities, loading: opportunitiesLoading } =
    useParksOpportunities();

  const reservas = useMemo(
    () =>
      buildParksReservaItems({
        naves,
        opportunities,
        parques,
      }),
    [naves, opportunities, parques],
  );

  const summary = useMemo(
    () => buildParksReservasSummary({ reservas, naves }),
    [naves, reservas],
  );

  return {
    reservas,
    summary,
    loading: parquesLoading || navesLoading || opportunitiesLoading,
  };
};

export const useParksStackingPlan = (parqueId?: string) => {
  const { isParksMetadataReady: isParqueReady } =
    useParksObjectMetadataItem('parque');
  const { isParksMetadataReady: isNaveReady } =
    useParksObjectMetadataItem('nave');
  const { isParksMetadataReady: isExpedienteReady } = useParksObjectMetadataItem(
    'expedienteContrato',
  );

  const { recordGqlFields: parqueFields } = useParksRecordGqlFields('parque', 1);
  const { recordGqlFields: naveFields } = useParksRecordGqlFields('nave', 1);
  const { recordGqlFields: expedienteFields } = useParksRecordGqlFields(
    'expedienteContrato',
    1,
  );

  const isReady = isParqueReady && isNaveReady && isExpedienteReady;

  const { record: parque, loading: parqueLoading } = useFindOneRecord({
    objectNameSingular: 'parque',
    objectRecordId: parqueId,
    recordGqlFields: parqueFields,
    skip: !parqueId || !isParqueReady,
  });

  const { records: naves, loading: navesLoading } =
    useFindManyRecords<ParksNaveRecord>({
      objectNameSingular: 'nave',
      recordGqlFields: naveFields,
      filter: parqueId ? { parqueId: { eq: parqueId } } : undefined,
      orderBy: [{ identificador: 'AscNullsLast' }],
      limit: 100,
      skip: !parqueId || !isNaveReady,
    });

  const { records: expedientes, loading: expedientesLoading } =
    useFindManyRecords<ParksExpedienteRecord>({
      objectNameSingular: 'expedienteContrato',
      recordGqlFields: expedienteFields,
      filter: { estatus: { eq: 'ACTIVO' } },
      limit: 200,
      skip: !parqueId || !isExpedienteReady,
    });

  const stackingNaves = useMemo((): ParksStackingPlanNave[] => {
    const expedienteByNaveId = new Map(
      expedientes
        .filter((expediente) => expediente.nave?.id)
        .map((expediente) => [expediente.nave!.id, expediente]),
    );

    return naves.map((nave) => {
      const expedienteActivo = expedienteByNaveId.get(nave.id) ?? null;
      const diasRestantes = getParksDaysUntil(
        expedienteActivo?.fechaVencimiento,
      );
      const hasContract =
        Boolean(expedienteActivo) || nave.estatus === 'RENTADA';
      const status = getParksStackingStatus(diasRestantes, hasContract);

      return {
        ...nave,
        expedienteActivo,
        diasRestantes,
        statusColor: status.color,
        statusKey: status.statusKey,
      };
    });
  }, [expedientes, naves]);

  return {
    parque,
    stackingNaves,
    loading: !isReady || parqueLoading || navesLoading || expedientesLoading,
  };
};

export const useParksDashboardMetrics = () => {
  const { records: parques, loading: parquesLoading } = useParksParques();
  const { records: expedientes, loading: expedientesLoading } =
    useParksExpedientesActivos();
  const { records: opportunities, loading: opportunitiesLoading } =
    useParksOpportunities();
  const { records: naves, loading: navesLoading } = useParksNaves();

  const metrics = useMemo(() => {
    const portfolioMetrics = buildParksPortfolioMetricsFromParques(parques);
    const operationalMetrics =
      buildParksOperationalMetricsFromExpedientes(expedientes);
    const naveDisponibilidad = buildParksNaveDisponibilidadMetrics(naves);
    const pipelineSummary = buildParksDashboardPipelineSummary(opportunities);
    const alertas = expedientes
      .filter((expediente) => {
        const dias = getParksDaysUntil(expediente.fechaVencimiento);

        return dias !== null && dias <= 60;
      })
      .slice(0, 5);

    return {
      m2Rentados: portfolioMetrics.m2Rentados,
      m2Disponibles: portfolioMetrics.m2Disponibles,
      m2Totales: portfolioMetrics.m2Totales,
      parqueCount: portfolioMetrics.parqueCount,
      ocupacion: portfolioMetrics.ocupacion,
      contratosPorVencer: operationalMetrics.contratosPorVencer,
      ingresosMensuales: operationalMetrics.ingresosMensuales,
      navesDisponibles: naveDisponibilidad.navesDisponiblesCount,
      m2CatalogoDisponible: naveDisponibilidad.m2CatalogoDisponible,
      pipelineActiveDeals: pipelineSummary.activeDeals,
      pipelineValueUsd: pipelineSummary.pipelineValueUsd,
      alertas,
      parques,
      recentDeals: opportunities
        .filter(
          (opportunity) =>
            opportunity.stage !== 'PERDIDO' &&
            opportunity.stage !== 'GANADO',
        )
        .slice(0, 5),
    };
  }, [expedientes, naves, opportunities, parques]);

  const charts = useMemo(() => {
    const portfolioMetrics = buildParksPortfolioMetricsFromParques(parques);

    return {
      ocupacionSlices: buildParksDashboardOcupacionSlices(
        portfolioMetrics.m2Rentados,
        portfolioMetrics.m2Disponibles,
      ),
      naveStatusSlices: buildParksDashboardNaveStatusSlices(naves),
      pipelineStages: buildParksDashboardPipelineStages(opportunities),
      topParques: buildParksDashboardTopParques(parques),
      ingresosPorRegion: buildParksDashboardIngresosPorRegion(
        expedientes,
        parques,
        naves,
      ),
      regionalSummaries: buildParksDashboardRegionalSummaries(parques),
    };
  }, [expedientes, naves, opportunities, parques]);

  return {
    metrics,
    charts,
    expedientes,
    loading:
      parquesLoading ||
      expedientesLoading ||
      opportunitiesLoading ||
      navesLoading,
  };
};

export const buildParksVencimientosPorMes = (
  expedientes: ParksExpedienteRecord[],
) => {
  const today = new Date();
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() + index, 1);

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      mes: date.toLocaleDateString('es-MX', {
        month: 'short',
        year: '2-digit',
      }),
      contratos: 0,
    };
  });

  for (const expediente of expedientes) {
    if (!expediente.fechaVencimiento) {
      continue;
    }

    const date = new Date(expediente.fechaVencimiento);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = months.find((month) => month.key === key);

    if (bucket) {
      bucket.contratos += 1;
    }
  }

  return months.map(({ mes, contratos }) => ({ mes, contratos }));
};
