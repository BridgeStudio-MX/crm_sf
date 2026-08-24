import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksDashboardColumnChart } from '@/parks-industrial/components/dashboard/charts/ParksDashboardColumnChart';
import { ParksDashboardDonutChart } from '@/parks-industrial/components/dashboard/charts/ParksDashboardDonutChart';
import { ParksDashboardHorizontalBars } from '@/parks-industrial/components/dashboard/charts/ParksDashboardHorizontalBars';
import {
  ParksSectionCard,
  StyledParksTwoColumnGrid,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import {
  type ParksCeoBoardSection,
  type ParksCeoDailyKpis,
} from '@/parks-industrial/types/parks-ceo-dashboard.types';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';

type ParksCeoHoyChartsProps = {
  board: ParksCeoBoardSection;
  daily: ParksCeoDailyKpis;
};

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0 0 ${themeCssVariables.spacing[2]} 0;
`;

const formatMxnCompact = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  return `$${formatParksNumber(value)}`;
};

export const ParksCeoHoyCharts = ({ board, daily }: ParksCeoHoyChartsProps) => {
  const occupiedM2 = Math.round(
    (daily.ocupacionPct / 100) *
      board.ocupacionPorParque.reduce(
        (total, park) => total + park.metrosRentables,
        0,
      ),
  );
  const rentableM2 = board.ocupacionPorParque.reduce(
    (total, park) => total + park.metrosRentables,
    0,
  );
  const availableM2 = Math.max(rentableM2 - occupiedM2, 0);

  const ocupacionSlices = [
    {
      id: 'ocupado',
      label: t`Ocupado`,
      value: occupiedM2 || daily.ocupacionPct,
      color: themeCssVariables.color.green,
    },
    {
      id: 'disponible',
      label: t`Disponible`,
      value: availableM2 || Math.max(100 - daily.ocupacionPct, 1),
      color: themeCssVariables.color.orange,
    },
  ];

  const ocupacionItems = board.ocupacionTrend.map((point) => ({
    id: point.mesAnio,
    label: point.label,
    value: point.value,
    color: themeCssVariables.color.green,
    meta: `${point.value}%`,
  }));

  const mrrItems = [...board.mrrTrend, ...board.mrrForecast].map((point) => ({
    id: point.mesAnio,
    label: point.label,
    value: point.value,
    color: point.label.includes('*')
      ? themeCssVariables.color.purple
      : themeCssVariables.color.green,
    meta: formatMxnCompact(point.value),
  }));

  const carteraSlices = board.carteraAntiguedad.map((item, index) => ({
    id: item.rango,
    label: item.rango,
    value: item.monto,
    color:
      [
        themeCssVariables.color.green,
        themeCssVariables.color.yellow,
        themeCssVariables.color.orange,
        themeCssVariables.color.red,
      ][index] ?? themeCssVariables.color.gray,
  }));

  const vencimientoItems = daily.vencimientos.map((bucket) => ({
    id: `v-${bucket.dias}`,
    label: t`${bucket.dias}d`,
    value: bucket.contratos,
    color:
      bucket.dias <= 30
        ? themeCssVariables.color.red
        : bucket.dias <= 60
          ? themeCssVariables.color.orange
          : themeCssVariables.color.yellow,
    meta: `${formatParksNumber(bucket.m2EnRiesgo)} m²`,
  }));

  const parqueItems = board.ocupacionPorParque.map((park) => ({
    id: park.parqueId,
    label: park.parqueNombre,
    value: park.porcentajeOcupacion,
    displayValue: `${park.porcentajeOcupacion}%`,
    color:
      park.porcentajeOcupacion >= 85
        ? themeCssVariables.color.green
        : park.porcentajeOcupacion >= 70
          ? themeCssVariables.color.yellow
          : themeCssVariables.color.orange,
    meta: park.region,
  }));

  const fuenteSlices = board.fuentesProspecto.map((item, index) => ({
    id: item.canal,
    label: item.canal,
    value: item.dealsCerrados,
    color:
      [
        themeCssVariables.color.blue,
        themeCssVariables.color.purple,
        themeCssVariables.color.turquoise,
        themeCssVariables.color.green,
      ][index] ?? themeCssVariables.color.gray,
  }));

  return (
    <>
      <StyledParksTwoColumnGrid>
        <ParksSectionCard title={t`Ocupación del grupo`} accent="green">
          <StyledHint>{t`m² rentados vs disponibles — foto de hoy`}</StyledHint>
          <ParksDashboardDonutChart
            slices={ocupacionSlices}
            centerLabel={t`Ocupación`}
            centerValue={`${daily.ocupacionPct}%`}
          />
        </ParksSectionCard>
        <ParksSectionCard title={t`Ocupación en el tiempo`} accent="blue">
          <StyledHint>{t`Comparativo mensual del portafolio`}</StyledHint>
          <ParksDashboardColumnChart items={ocupacionItems} />
        </ParksSectionCard>
      </StyledParksTwoColumnGrid>

      <ParksSectionCard
        title={t`MRR 6 meses + forecast 3 meses`}
        accent="green"
      >
        <StyledHint>
          {t`Barras verdes = histórico · moradas = proyección`}
        </StyledHint>
        <ParksDashboardColumnChart items={mrrItems} />
      </ParksSectionCard>

      <StyledParksTwoColumnGrid>
        <ParksSectionCard title={t`Cartera por antigüedad`} accent="red">
          <StyledHint>{t`Cómo está envejeciendo lo que falta por cobrar`}</StyledHint>
          <ParksDashboardDonutChart
            slices={carteraSlices}
            centerLabel={t`Cartera`}
            centerValue={formatMxnCompact(
              board.carteraAntiguedad.reduce(
                (total, item) => total + item.monto,
                0,
              ),
            )}
          />
        </ParksSectionCard>
        <ParksSectionCard title={t`Contratos por vencer`} accent="orange">
          <StyledHint>{t`Cuántos contratos salen del portafolio si no se renuevan`}</StyledHint>
          <ParksDashboardColumnChart items={vencimientoItems} />
        </ParksSectionCard>
      </StyledParksTwoColumnGrid>

      <StyledParksTwoColumnGrid>
        <ParksSectionCard title={t`Ocupación por parque`} accent="sky">
          <ParksDashboardHorizontalBars items={parqueItems} />
        </ParksSectionCard>
        <ParksSectionCard title={t`De dónde llegan los deals`} accent="turquoise">
          <ParksDashboardDonutChart
            slices={fuenteSlices}
            centerLabel={t`Cerrados`}
            centerValue={String(
              board.fuentesProspecto.reduce(
                (total, item) => total + item.dealsCerrados,
                0,
              ),
            )}
          />
        </ParksSectionCard>
      </StyledParksTwoColumnGrid>
    </>
  );
};
