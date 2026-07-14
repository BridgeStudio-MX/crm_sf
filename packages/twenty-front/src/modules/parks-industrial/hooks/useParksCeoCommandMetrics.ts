import { useCallback, useEffect, useState } from 'react';

import { useParksDashboardMetrics } from '@/parks-industrial/hooks/useParksRecords';
import { fetchParksCxcDashboard } from '@/parks-industrial/services/parks-cxc.client';
import { fetchParksLegalDashboard } from '@/parks-industrial/services/parks-legal.client';
import { type CxcDashboardResult } from '@/parks-industrial/types/parks-cxc.types';
import { type LegalDashboardResult } from '@/parks-industrial/types/parks-legal.types';

export type ParksCeoCommandMetrics = {
  ocupacion: number;
  ingresosMensuales: number;
  pipelineValueUsd: number;
  pipelineActiveDeals: number;
  contratosPorVencer: number;
  m2Totales: number;
  parqueCount: number;
  legalActivos: number;
  legalEnRiesgo: number;
  legalSlaVencidos: number;
  legalPausados: number;
  cxcCarteraTotal: number;
  cxcCarteraVencida: number;
  cxcMoraGrave: number;
  cxcForecast30d: number;
  cxcOcPendientes: number;
  cxcHoldovers: number;
  cxcAnomaliasAbiertas: number;
  healthScore: number;
  healthLabel: 'Óptimo' | 'Atención' | 'Crítico';
};

const clampScore = (value: number): number =>
  Math.max(0, Math.min(100, Math.round(value)));

const computeHealth = ({
  ocupacion,
  legalEnRiesgo,
  legalSlaVencidos,
  cxcCarteraTotal,
  cxcCarteraVencida,
  contratosPorVencer,
}: {
  ocupacion: number;
  legalEnRiesgo: number;
  legalSlaVencidos: number;
  cxcCarteraTotal: number;
  cxcCarteraVencida: number;
  contratosPorVencer: number;
}): { healthScore: number; healthLabel: ParksCeoCommandMetrics['healthLabel'] } => {
  let score = 100;

  // Occupancy below 85 starts costing points
  if (ocupacion < 70) {
    score -= 25;
  } else if (ocupacion < 85) {
    score -= 12;
  }

  score -= Math.min(30, legalEnRiesgo * 6 + legalSlaVencidos * 4);

  const moraPct =
    cxcCarteraTotal > 0 ? (cxcCarteraVencida / cxcCarteraTotal) * 100 : 0;

  if (moraPct >= 20) {
    score -= 25;
  } else if (moraPct >= 10) {
    score -= 14;
  } else if (moraPct >= 5) {
    score -= 7;
  }

  score -= Math.min(15, contratosPorVencer * 2);

  const healthScore = clampScore(score);
  const healthLabel: ParksCeoCommandMetrics['healthLabel'] =
    healthScore >= 80 ? 'Óptimo' : healthScore >= 60 ? 'Atención' : 'Crítico';

  return { healthScore, healthLabel };
};

export const useParksCeoCommandMetrics = () => {
  const {
    metrics,
    charts,
    expedientes,
    loading: portfolioLoading,
  } = useParksDashboardMetrics();
  const [legal, setLegal] = useState<LegalDashboardResult | null>(null);
  const [cxc, setCxc] = useState<CxcDashboardResult | null>(null);
  const [sideLoading, setSideLoading] = useState(true);
  const [sideError, setSideError] = useState<string | null>(null);

  const loadSideMetrics = useCallback(async () => {
    setSideLoading(true);
    setSideError(null);

    try {
      const [legalResult, cxcResult] = await Promise.all([
        fetchParksLegalDashboard(),
        fetchParksCxcDashboard(),
      ]);

      setLegal(legalResult);
      setCxc(cxcResult);
    } catch (error) {
      setSideError(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar métricas legales / CxC',
      );
    } finally {
      setSideLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSideMetrics();
  }, [loadSideMetrics]);

  const legalActivos = legal?.totalActivos ?? 0;
  const legalEnRiesgo = legal?.enRiesgo ?? 0;
  const legalSlaVencidos = legal?.slaVencidos ?? 0;
  const legalPausados = legal?.pausados ?? 0;
  const cxcCarteraTotal = cxc?.kpis.carteraTotal ?? 0;
  const cxcCarteraVencida = cxc?.kpis.carteraVencida ?? 0;
  const cxcMoraGrave = cxc?.kpis.moraGraveCount ?? 0;
  const cxcForecast30d = cxc?.forecast.d30.esperado ?? 0;
  const cxcOcPendientes = cxc?.kpis.ocPendientes ?? 0;
  const cxcHoldovers = cxc?.kpis.holdoversActivos ?? 0;
  const cxcAnomaliasAbiertas =
    cxc?.anomalies.filter((anomaly) => !anomaly.resolved).length ?? 0;

  const { healthScore, healthLabel } = computeHealth({
    ocupacion: metrics.ocupacion,
    legalEnRiesgo,
    legalSlaVencidos,
    cxcCarteraTotal,
    cxcCarteraVencida,
    contratosPorVencer: metrics.contratosPorVencer,
  });

  const command: ParksCeoCommandMetrics = {
    ocupacion: metrics.ocupacion,
    ingresosMensuales: metrics.ingresosMensuales,
    pipelineValueUsd: metrics.pipelineValueUsd,
    pipelineActiveDeals: metrics.pipelineActiveDeals,
    contratosPorVencer: metrics.contratosPorVencer,
    m2Totales: metrics.m2Totales,
    parqueCount: metrics.parqueCount,
    legalActivos,
    legalEnRiesgo,
    legalSlaVencidos,
    legalPausados,
    cxcCarteraTotal,
    cxcCarteraVencida,
    cxcMoraGrave,
    cxcForecast30d,
    cxcOcPendientes,
    cxcHoldovers,
    cxcAnomaliasAbiertas,
    healthScore,
    healthLabel,
  };

  return {
    command,
    charts,
    expedientes,
    metrics,
    legalCases: legal?.casos ?? [],
    cxcPriorityAccounts: cxc?.priorityAccounts ?? [],
    loading: portfolioLoading || sideLoading,
    sideError,
    refreshSideMetrics: loadSideMetrics,
  };
};
