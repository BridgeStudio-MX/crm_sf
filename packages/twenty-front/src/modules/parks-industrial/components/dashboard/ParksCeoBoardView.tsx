import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksDashboardColumnChart } from '@/parks-industrial/components/dashboard/charts/ParksDashboardColumnChart';
import { ParksDashboardDonutChart } from '@/parks-industrial/components/dashboard/charts/ParksDashboardDonutChart';
import { ParksDashboardHorizontalBars } from '@/parks-industrial/components/dashboard/charts/ParksDashboardHorizontalBars';
import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import {
  ParksSectionCard,
  StyledParksTwoColumnGrid,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { type ParksCeoBoardSection } from '@/parks-industrial/types/parks-ceo-dashboard.types';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';

type ParksCeoBoardViewSection =
  | 'portafolio'
  | 'ingresos'
  | 'retencion'
  | 'cobranza'
  | 'operacion';

type ParksCeoBoardViewProps = {
  board: ParksCeoBoardSection;
  sections?: ParksCeoBoardViewSection[];
};

const ALL_BOARD_SECTIONS: ParksCeoBoardViewSection[] = [
  'portafolio',
  'ingresos',
  'retencion',
  'cobranza',
  'operacion',
];

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledSectionTitle = styled.h3`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.04em;
  margin: ${themeCssVariables.spacing[2]} 0 0;
  text-transform: uppercase;
`;

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const StyledTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTableRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1.4fr 0.8fr 0.8fr 0.8fr;
  padding: ${themeCssVariables.spacing[2]} 0;

  &:last-child {
    border-bottom: none;
  }
`;

const StyledTableHead = styled(StyledTableRow)`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-transform: uppercase;
`;

const StyledCell = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
`;

const formatMxnCompact = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  return `$${formatParksNumber(value)}`;
};

export const ParksCeoBoardView = ({
  board,
  sections = ALL_BOARD_SECTIONS,
}: ParksCeoBoardViewProps) => {
  const ocupacionItems = board.ocupacionTrend.map((point) => ({
    id: point.mesAnio,
    label: point.label,
    value: point.value,
    color: themeCssVariables.color.green,
    meta: `${point.value}%`,
  }));

  const absorcionItems = board.absorcionTrend.map((point) => ({
    id: point.mesAnio,
    label: point.label,
    value: Math.max(point.value, 0),
    color:
      point.value >= 0
        ? themeCssVariables.color.blue
        : themeCssVariables.color.red,
    meta: `${formatParksNumber(point.value)} m²`,
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

  const churnItems = board.churnPorCausa.map((item) => ({
    id: item.causa,
    label: item.causa,
    value: item.m2Perdidos,
    displayValue: `${formatParksNumber(item.m2Perdidos)} m²`,
    color: themeCssVariables.color.orange,
    meta: formatMxnCompact(item.revenueAnualizado),
  }));

  const carteraSlices = board.carteraAntiguedad.map((item, index) => ({
    id: item.rango,
    label: item.rango,
    value: item.monto,
    color: [
      themeCssVariables.color.green,
      themeCssVariables.color.yellow,
      themeCssVariables.color.orange,
      themeCssVariables.color.red,
    ][index] ?? themeCssVariables.color.gray,
  }));

  const fuenteSlices = board.fuentesProspecto.map((item, index) => ({
    id: item.canal,
    label: item.canal,
    value: item.dealsCerrados,
    color: [
      themeCssVariables.color.blue,
      themeCssVariables.color.purple,
      themeCssVariables.color.turquoise,
      themeCssVariables.color.green,
    ][index] ?? themeCssVariables.color.gray,
  }));

  const showPortafolio = sections.includes('portafolio');
  const showIngresos = sections.includes('ingresos');
  const showRetencion = sections.includes('retencion');
  const showCobranza = sections.includes('cobranza');
  const showOperacion = sections.includes('operacion');

  return (
    <StyledStack>
      {showPortafolio ? (
        <>
      <StyledSectionTitle>{t`1 · Portafolio`}</StyledSectionTitle>
      <StyledParksTwoColumnGrid>
        <ParksSectionCard title={t`% Ocupación — 6 meses`} accent="green">
          <ParksDashboardColumnChart items={ocupacionItems} />
        </ParksSectionCard>
        <ParksSectionCard title={t`Absorción neta mensual`} accent="blue">
          <ParksDashboardColumnChart items={absorcionItems} />
        </ParksSectionCard>
      </StyledParksTwoColumnGrid>

      <ParksSectionCard title={t`Ocupación por parque`} accent="sky">
        <StyledTable>
          <StyledTableHead>
            <StyledCell>{t`Parque`}</StyledCell>
            <StyledCell>{t`Región`}</StyledCell>
            <StyledCell>{t`Ocupación`}</StyledCell>
            <StyledCell>{t`Δ mes`}</StyledCell>
          </StyledTableHead>
          {board.ocupacionPorParque.map((parque) => (
            <StyledTableRow key={parque.parqueId}>
              <StyledCell>{parque.parqueNombre}</StyledCell>
              <StyledCell>{parque.region}</StyledCell>
              <StyledCell>{parque.porcentajeOcupacion}%</StyledCell>
              <StyledCell>
                {parque.variacionMensualPts > 0 ? '+' : ''}
                {parque.variacionMensualPts} pts
              </StyledCell>
            </StyledTableRow>
          ))}
        </StyledTable>
      </ParksSectionCard>

        </>
      ) : null}

      {showIngresos ? (
        <>
      <StyledSectionTitle>{t`2 · Ingresos`}</StyledSectionTitle>
      <ParksSectionCard
        title={t`MRR 6 meses + forecast 3 meses`}
        accent="green"
      >
        <ParksDashboardColumnChart items={mrrItems} />
      </ParksSectionCard>
      <StyledMetricsGrid>
        <ParksMetricCard
          label={t`Revenue / m² rentado`}
          value={`$${board.revenuePorM2}`}
          accent="green"
          trend={t`▲ ${board.revenuePorM2YoYPct}% YoY`}
        />
        <ParksMetricCard
          label={t`Ticket promedio USD/m²`}
          value={`$${board.ticketPromedioM2}`}
          accent="blue"
          trend={t`${board.ticketDeltaPts >= 0 ? '+' : ''}${board.ticketDeltaPts} vs mes ant`}
        />
        <ParksMetricCard
          label={t`NOI / m² (estimado)`}
          value={`$${board.noiPorM2}`}
          accent="purple"
          trend={t`Costo op. ~25% del MRR`}
        />
      </StyledMetricsGrid>

        </>
      ) : null}

      {showRetencion ? (
        <>
      <StyledSectionTitle>{t`3 · Renovaciones y retención`}</StyledSectionTitle>
      <StyledMetricsGrid>
        <ParksMetricCard
          label={t`Tasa renovación YTD`}
          value={`${board.tasaRenovacionYtd}%`}
          accent={
            board.tasaRenovacionYtd >= board.metaRenovacion ? 'green' : 'yellow'
          }
          trend={t`Meta industria ≥ ${board.metaRenovacion}%`}
        />
      </StyledMetricsGrid>
      <StyledParksTwoColumnGrid>
        <ParksSectionCard title={t`Churn de m² por causa`} accent="orange">
          <ParksDashboardHorizontalBars items={churnItems} />
        </ParksSectionCard>
        <ParksSectionCard
          title={t`Contratos por vencer (6 meses)`}
          accent="yellow"
        >
          <StyledTable>
            <StyledTableHead>
              <StyledCell>{t`Mes`}</StyledCell>
              <StyledCell>{t`Contratos`}</StyledCell>
              <StyledCell>{t`m²`}</StyledCell>
              <StyledCell>{t`Estatus`}</StyledCell>
            </StyledTableHead>
            {board.contratosPorVencer6m.map((row) => (
              <StyledTableRow key={row.mesAnio}>
                <StyledCell>{row.mesAnio}</StyledCell>
                <StyledCell>{row.contratos}</StyledCell>
                <StyledCell>{formatParksNumber(row.m2)}</StyledCell>
                <StyledCell>{row.estatusRenovacionDominante}</StyledCell>
              </StyledTableRow>
            ))}
          </StyledTable>
        </ParksSectionCard>
      </StyledParksTwoColumnGrid>

        </>
      ) : null}

      {showCobranza ? (
        <>
      <StyledSectionTitle>{t`4 · Cobranza y riesgo`}</StyledSectionTitle>
      <StyledMetricsGrid>
        <ParksMetricCard
          label={t`Índice cobranza 12m`}
          value={`${board.indiceCobranza12m}%`}
          accent="green"
        />
        <ParksMetricCard
          label={t`Holdovers activos`}
          value={board.holdoversActivos}
          accent="yellow"
          trend={formatMxnCompact(board.holdoverMontoRiesgo)}
        />
        <ParksMetricCard
          label={t`Notas crédito 12m`}
          value={formatMxnCompact(board.notasCredito12m)}
          accent="orange"
          trend={t`${board.notasCreditoPctMrr}% del MRR anual`}
        />
      </StyledMetricsGrid>
      <ParksSectionCard title={t`Cartera por antigüedad`} accent="red">
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

        </>
      ) : null}

      {showOperacion ? (
        <>
      <StyledSectionTitle>{t`5 · Eficiencia operativa`}</StyledSectionTitle>
      <StyledMetricsGrid>
        <ParksMetricCard
          label={t`Ciclo de venta`}
          value={`${board.cicloVentaDias} d`}
          accent="blue"
        />
        <ParksMetricCard
          label={t`SLA legal cumplido`}
          value={`${board.slaCumplimientoPct}%`}
          accent={board.slaCumplimientoPct >= 90 ? 'green' : 'yellow'}
          trend={t`Meta ≥ 90%`}
        />
        <ParksMetricCard
          label={t`Ciclo legal vs SLA`}
          value={`${board.cicloLegalDias} / ${board.slaLegalDias} d`}
          accent="purple"
        />
      </StyledMetricsGrid>
      <ParksSectionCard
        title={t`Fuentes de prospecto (deals cerrados)`}
        accent="turquoise"
      >
        <ParksDashboardDonutChart
          slices={fuenteSlices}
          centerLabel={t`Deals`}
          centerValue={String(
            board.fuentesProspecto.reduce(
              (total, item) => total + item.dealsCerrados,
              0,
            ),
          )}
        />
      </ParksSectionCard>
        </>
      ) : null}
    </StyledStack>
  );
};
