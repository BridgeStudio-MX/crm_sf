import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  getParksRenovacionRiskLabel,
  getParksRenovacionStackingStatus,
  type ParksRenovacionQueueItem,
  type ParksRenovacionRiskBand,
} from '@/parks-industrial/utils/parks-renovaciones.util';
import {
  formatParksDate,
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';

type ParksRenovacionesQueueProps = {
  items: ParksRenovacionQueueItem[];
  activeRiskFilter: ParksRenovacionRiskBand | 'all';
  onRiskFilterChange: (filter: ParksRenovacionRiskBand | 'all') => void;
};

const StyledFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledFilterChip = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.color.blue1 : themeCssVariables.background.secondary};
  border: 1px solid
    ${({ isActive }) =>
      isActive
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.xs};
  padding: 6px 12px;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledCard = styled.div<{ accentColor: string }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left: 4px solid ${({ accentColor }) => accentColor};
  border-radius: ${themeCssVariables.border.radius.md};
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};

  @media (min-width: 720px) {
    align-items: center;
    grid-template-columns: 1.4fr 1fr auto;
  }
`;

const StyledPrimary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledTitle = styled.div`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledMetrics = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const StyledMetric = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledMetricLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledMetricValue = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-top: 2px;
`;

const StyledActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const RISK_FILTERS: Array<ParksRenovacionRiskBand | 'all'> = [
  'all',
  'critical',
  'attention',
  'planning',
];

export const ParksRenovacionesQueue = ({
  items,
  activeRiskFilter,
  onRiskFilterChange,
}: ParksRenovacionesQueueProps) => {
  const filteredItems =
    activeRiskFilter === 'all'
      ? items
      : items.filter((item) => item.riskBand === activeRiskFilter);

  return (
    <>
      <StyledFilters>
        {RISK_FILTERS.map((filter) => (
          <StyledFilterChip
            key={filter}
            type="button"
            isActive={activeRiskFilter === filter}
            onClick={() => onRiskFilterChange(filter)}
          >
            {filter === 'all' ? t`Todos` : getParksRenovacionRiskLabel(filter)}
          </StyledFilterChip>
        ))}
      </StyledFilters>

      {filteredItems.length === 0 ? (
        <ParksEmptyState
          title={t`Sin renovaciones en este filtro`}
          description={t`Los contratos activos con vencimiento en 12 meses aparecerán aquí automáticamente.`}
        />
      ) : (
        <StyledList>
          {filteredItems.map((item) => {
            const stackingStatus = getParksRenovacionStackingStatus(
              item.diasRestantes,
            );
            const casoLegalId = item.expediente.casoLegal?.id;

            return (
              <StyledCard
                key={item.id}
                accentColor={
                  stackingStatus.color === 'green'
                    ? '#16A34A'
                    : stackingStatus.color === 'yellow'
                      ? '#D97706'
                      : stackingStatus.color === 'red'
                        ? '#DC2626'
                        : '#6B7280'
                }
              >
                <StyledPrimary>
                  <StyledTitle>
                    {item.expediente.inquilino?.empresa ?? t`Inquilino`}
                  </StyledTitle>
                  <StyledMeta>
                    {item.expediente.nave?.identificador ?? t`Sin nave`}
                    {item.parqueNombre ? ` · ${item.parqueNombre}` : ''}
                  </StyledMeta>
                  <div style={{ marginTop: 8 }}>
                    <ParksStatusBadge
                      label={getParksRenovacionRiskLabel(item.riskBand)}
                      color={stackingStatus.color}
                    />
                  </div>
                </StyledPrimary>

                <StyledMetrics>
                  <StyledMetric>
                    <StyledMetricLabel>{t`Vencimiento`}</StyledMetricLabel>
                    <StyledMetricValue>
                      {formatParksDate(item.expediente.fechaVencimiento)}
                    </StyledMetricValue>
                  </StyledMetric>
                  <StyledMetric>
                    <StyledMetricLabel>{t`Días restantes`}</StyledMetricLabel>
                    <StyledMetricValue>
                      {item.diasRestantes ?? '—'}
                    </StyledMetricValue>
                  </StyledMetric>
                  <StyledMetric>
                    <StyledMetricLabel>{t`Renta mensual`}</StyledMetricLabel>
                    <StyledMetricValue>
                      {formatParksUsd(item.ingresoMensualUsd)}
                    </StyledMetricValue>
                  </StyledMetric>
                  <StyledMetric>
                    <StyledMetricLabel>{t`Etapa`}</StyledMetricLabel>
                    <StyledMetricValue>{item.etapaRenovacion}</StyledMetricValue>
                  </StyledMetric>
                </StyledMetrics>

                <StyledActions>
                  {casoLegalId ? (
                    <UndecoratedLink
                      to={getAppPath(AppPath.ParksContratoAprobacion, {
                        contratoId: casoLegalId,
                      })}
                    >
                      <span style={{ fontSize: 12 }}>{t`Ver expediente`}</span>
                    </UndecoratedLink>
                  ) : (
                    <span style={{ color: themeCssVariables.font.color.tertiary, fontSize: 12 }}>
                      {t`Sin caso legal`}
                    </span>
                  )}
                  <StyledMeta>
                    {formatParksNumber(item.expediente.nave?.m2 ?? 0)} m²
                  </StyledMeta>
                </StyledActions>
              </StyledCard>
            );
          })}
        </StyledList>
      )}
    </>
  );
};
