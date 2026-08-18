import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import {
  ParksSectionCard,
  StyledParksTwoColumnGrid,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { type ParksCeoExecutiveIndicators } from '@/parks-industrial/types/parks-ceo-dashboard.types';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';

type ParksCeoExecutiveIndicatorsViewProps = {
  indicators: ParksCeoExecutiveIndicators;
  pendingActions?: number;
};

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
`;

const StyledAreas = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
`;

const StyledAreaCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledAreaLabel = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-bottom: 4px;
`;

const StyledAreaValue = styled.div`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledNote = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: ${themeCssVariables.spacing[2]} 0 0;
`;

const StyledTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1.6fr 0.7fr 0.7fr;
  padding: ${themeCssVariables.spacing[2]} 0;

  &:last-child {
    border-bottom: none;
  }
`;

const StyledHead = styled(StyledRow)`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-transform: uppercase;
`;

const StyledSlaGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const StyledSlaCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledSlaBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFooterMeta = styled.p`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: ${themeCssVariables.spacing[4]} 0 0;
  padding-top: ${themeCssVariables.spacing[3]};
`;

const formatSignedPct = (value: number): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
};

export const ParksCeoExecutiveIndicatorsView = ({
  indicators,
  pendingActions = 0,
}: ParksCeoExecutiveIndicatorsViewProps) => {
  const terminados = indicators.ocupacion.find(
    (item) => item.key === 'terminados',
  );

  return (
    <StyledStack>
      <ParksPageHero
        eyebrow={t`Panel Ejecutivo · CEO`}
        title={t`Panel de Indicadores — Consolidado`}
        subtitle={t`Rollup Comercial + Legal + CxC. Misma lectura del Power BI, con UI Parks.`}
        actions={[
          {
            to: AppPath.ParksStackingPlanIndex,
            label: t`Parques y naves`,
          },
          {
            to: AppPath.ParksDashboardComercial,
            label: t`Panel Comercial`,
          },
          {
            to: AppPath.ParksLegalDashboard,
            label: t`Panel Legal`,
          },
        ]}
        stats={[
          {
            label: t`Performance`,
            value: `${indicators.performanceConsolidadoPct}%`,
            hint: t`Índice consolidado`,
          },
          {
            label: t`Ocupación`,
            value: `${terminados?.ocupacionPct ?? 0}%`,
            hint: t`Meta ${indicators.ocupacionMetaTerminados}%`,
          },
          {
            label: t`No renovados`,
            value: String(indicators.contratosNoRenovados),
            hint: `${indicators.pctNoRenovados}%`,
          },
          {
            label: t`Pendientes`,
            value: String(pendingActions),
            hint: t`Bandeja CEO`,
          },
        ]}
      />

      <ParksSectionCard title={t`1 · Salud del negocio`} accent="green">
        <StyledMetricsGrid>
          <ParksMetricCard
            label={t`Performance consolidado`}
            value={`${indicators.performanceConsolidadoPct}%`}
            trend={t`Ponderado por área`}
            accent="green"
          />
          {indicators.ocupacion.map((gauge) => (
            <ParksMetricCard
              key={gauge.key}
              label={gauge.label}
              value={`${gauge.ocupacionPct}%`}
              trend={t`Meta ${gauge.metaPct}% · Var ${formatSignedPct(gauge.variacionPct)}`}
              accent={
                gauge.ocupacionPct >= gauge.metaPct ? 'green' : 'orange'
              }
            />
          ))}
        </StyledMetricsGrid>
        <StyledAreas>
          {indicators.performanceAreas.map((area) => (
            <StyledAreaCard key={area.area}>
              <StyledAreaLabel>
                {area.area} · {area.ponderacionPct}%
              </StyledAreaLabel>
              <StyledAreaValue>{area.scorePct}%</StyledAreaValue>
            </StyledAreaCard>
          ))}
        </StyledAreas>
        <StyledNote>{indicators.performanceFormulaNote}</StyledNote>
      </ParksSectionCard>

      <StyledParksTwoColumnGrid>
        <ParksSectionCard title={t`2 · Riesgo inmediato`} accent="orange">
          <StyledMetricsGrid>
            <ParksMetricCard
              label={t`Contratos NO renovados`}
              value={String(indicators.contratosNoRenovados)}
              trend={`${indicators.pctNoRenovados}%`}
              accent="orange"
            />
            <ParksMetricCard
              label={t`M² NO renovados`}
              value={formatParksNumber(indicators.m2NoRenovados)}
              accent="orange"
            />
            <ParksMetricCard
              label={t`% Incremento renovación`}
              value={`${indicators.renovacionIncrementoPct}%`}
              trend={t`Meta ${indicators.renovacionIncrementoMetaPct}%`}
              accent={
                indicators.renovacionIncrementoPct >=
                indicators.renovacionIncrementoMetaPct
                  ? 'green'
                  : 'yellow'
              }
            />
            <ParksMetricCard
              label={t`Firmadas antes de vencer`}
              value={`${indicators.renovacionesFirmadasAntesVencerPct}%`}
              trend={t`Meta ${indicators.renovacionesFirmadasMetaPct}%`}
              accent="blue"
            />
          </StyledMetricsGrid>
        </ParksSectionCard>

        <ParksSectionCard
          title={t`Litigios y extrajudiciales`}
          accent="orange"
        >
          <StyledTable>
            <StyledHead>
              <div>{t`Categoría`}</div>
              <div>{t`En proceso`}</div>
              <div>{t`%`}</div>
            </StyledHead>
            {indicators.litigios.map((row) => (
              <StyledRow key={row.categoria}>
                <div>{row.categoria}</div>
                <div>{row.enProceso}</div>
                <div>{row.porcentaje.toFixed(2)}%</div>
              </StyledRow>
            ))}
          </StyledTable>
        </ParksSectionCard>
      </StyledParksTwoColumnGrid>

      <ParksSectionCard title={t`5 · Pipeline y contratos nuevos`} accent="blue">
        <StyledMetricsGrid>
          <ParksMetricCard
            label={t`Hojas nuevos`}
            value={String(indicators.hojasAcuerdoNuevos)}
            accent="blue"
          />
          <ParksMetricCard
            label={t`Hojas renovación`}
            value={String(indicators.hojasAcuerdoRenovacion)}
            accent="blue"
          />
          <ParksMetricCard
            label={t`Var. contratos nuevos`}
            value={formatSignedPct(indicators.varContratosNuevosPct)}
          />
          <ParksMetricCard
            label={t`Var. m² rentados`}
            value={formatSignedPct(indicators.varM2RentadosPct)}
          />
          <ParksMetricCard
            label={t`Var. valor m² MXN`}
            value={formatSignedPct(indicators.varValorM2MxnPct)}
          />
          <ParksMetricCard
            label={t`Var. valor m² USD`}
            value={formatSignedPct(indicators.varValorM2UsdPct)}
          />
          <ParksMetricCard
            label={t`Var. años promedio renta`}
            value={formatSignedPct(indicators.varAnosPromedioRentaPct)}
          />
        </StyledMetricsGrid>
      </ParksSectionCard>

      <ParksSectionCard title={t`7 · Cumplimiento legal (SLA)`} accent="purple">
        <StyledSlaGrid>
          {indicators.legalSla.map((block) => (
            <StyledSlaCard key={block.key}>
              <ParksMetricCard
                label={block.label}
                value={`${block.cumplimientoPct}%`}
                trend={t`Meta ${block.metaPct}% · ${block.diasPromedioCierre}d / ${block.metaDiasCierre}d`}
                accent={
                  block.cumplimientoPct >= block.metaPct ? 'green' : 'orange'
                }
              />
              <StyledSlaBadges>
                <ParksStatusBadge
                  color="red"
                  label={t`Abiertos ${block.abiertos}`}
                />
                <ParksStatusBadge
                  color="yellow"
                  label={t`Fuera de tiempo ${block.fueraDeTiempo}`}
                />
              </StyledSlaBadges>
            </StyledSlaCard>
          ))}
        </StyledSlaGrid>
        <StyledFooterMeta>
          {t`Última actualización`}: {indicators.ultimaActualizacionLabel} ·{' '}
          {t`Segmento`}: {indicators.filters.segmento}
        </StyledFooterMeta>
      </ParksSectionCard>
    </StyledStack>
  );
};
