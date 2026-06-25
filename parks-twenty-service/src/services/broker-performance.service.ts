import { twentyDataService } from './twenty-data.service';
import {
  type BrokerDealSnapshot,
  type BrokerPerformanceMetrics,
} from '../types/operations.types';

const CLOSED_STAGE_KEYWORDS = [
  'HOJA_FIRMADA',
  'EN_PROCESO_LEGAL',
  'FIRMADO',
  'CERRADO',
  'LEGAL',
];

const isClosedStage = (stage?: string): boolean => {
  if (!stage) {
    return false;
  }

  const normalized = stage.toUpperCase();

  return CLOSED_STAGE_KEYWORDS.some((keyword) =>
    normalized.includes(keyword),
  );
};

const microsToUsd = (amountMicros?: number): number =>
  amountMicros ? amountMicros / 1_000_000 : 0;

const buildBrokerRanking = (
  comisiones: Awaited<ReturnType<typeof twentyDataService.findAllComisiones>>,
): Map<string, number> => {
  const totals = new Map<string, number>();

  for (const comision of comisiones) {
    const brokerName = comision.beneficiario ?? 'Sin broker';
    const current = totals.get(brokerName) ?? 0;
    totals.set(brokerName, current + (comision.montoUsd ?? 0));
  }

  return totals;
};

export const brokerPerformanceService = {
  getMetrics: async (
    brokerName = 'Broker Demo',
  ): Promise<BrokerPerformanceMetrics> => {
    const [comisiones, opportunities] = await Promise.all([
      twentyDataService.findAllComisiones(),
      twentyDataService.findOpportunitiesSummary(),
    ]);

    const rankingMap = buildBrokerRanking(comisiones);
    const sortedBrokers = Array.from(rankingMap.entries()).sort(
      (left, right) => right[1] - left[1],
    );

    const resolvedBrokerName =
      sortedBrokers.find(([name]) =>
        name.toLowerCase().includes(brokerName.toLowerCase().split(' ')[0]),
      )?.[0] ??
      sortedBrokers[0]?.[0] ??
      brokerName;

    const brokerComisiones = comisiones.filter(
      (comision) => comision.beneficiario === resolvedBrokerName,
    );

    const comisionesAprobadasUsd = brokerComisiones
      .filter((comision) =>
        (comision.estatus ?? '').toUpperCase().includes('APROBADA'),
      )
      .reduce((sum, comision) => sum + (comision.montoUsd ?? 0), 0);

    const comisionesPendientesUsd = brokerComisiones
      .filter((comision) => {
        const estatus = (comision.estatus ?? '').toUpperCase();
        return estatus.includes('PENDIENTE') || estatus.includes('CALCULADA');
      })
      .reduce((sum, comision) => sum + (comision.montoUsd ?? 0), 0);

    const dealsActivos = opportunities.filter(
      (opportunity) => !isClosedStage(opportunity.stage),
    ).length;
    const dealsCerrados = opportunities.filter((opportunity) =>
      isClosedStage(opportunity.stage),
    ).length;

    const ticketPromedioUsd =
      opportunities.length > 0
        ? opportunities.reduce(
            (sum, opportunity) =>
              sum + microsToUsd(opportunity.amount?.amountMicros),
            0,
          ) / opportunities.length
        : 0;

    const m2Totales = opportunities.reduce(
      (sum, opportunity) => sum + (opportunity.m2Requeridos ?? 0),
      0,
    );

    const metaMensualUsd = 25000;
    const avanceMetaPct = Math.min(
      100,
      Math.round((comisionesAprobadasUsd / metaMensualUsd) * 100),
    );

    const rankingPosition =
      sortedBrokers.findIndex(([name]) => name === resolvedBrokerName) + 1 ||
      1;

    const recentDeals: BrokerDealSnapshot[] = opportunities
      .slice(0, 5)
      .map((opportunity) => ({
        dealId: opportunity.id,
        dealName: opportunity.name ?? 'Deal',
        stage: opportunity.stage,
        m2Requeridos: opportunity.m2Requeridos,
        ticketUsd: microsToUsd(opportunity.amount?.amountMicros),
        updatedAt: opportunity.updatedAt,
      }));

    return {
      brokerName: resolvedBrokerName,
      rankingPosition: rankingPosition > 0 ? rankingPosition : 1,
      totalBrokers: Math.max(sortedBrokers.length, 1),
      dealsActivos,
      dealsCerrados,
      comisionesAprobadasUsd,
      comisionesPendientesUsd,
      ticketPromedioUsd,
      m2Totales,
      metaMensualUsd,
      avanceMetaPct,
      recentDeals,
      generatedAt: new Date().toISOString(),
    };
  },
};
