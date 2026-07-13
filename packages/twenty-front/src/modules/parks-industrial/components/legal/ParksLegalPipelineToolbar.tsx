import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  IconAlertTriangle,
  IconClock,
  IconLayoutKanban,
  IconUser,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import {
  StyledParksInput,
  StyledParksSelect,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import { LEGAL_KANBAN_STAGES } from '@/parks-industrial/constants/parks-legal-workflow.constants';
import { type ParksCasoLegalRecord } from '@/parks-industrial/hooks/useParksRecords';
import { getParksLegalStageTheme } from '@/parks-industrial/utils/parks-format.util';

const StyledToolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSearchInput = styled(StyledParksInput)`
  min-width: 220px;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledFilterSelect = styled(StyledParksSelect)`
  min-width: 200px;
`;

const StyledMetrics = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StyledLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLegendItem = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
`;

const StyledLegendDot = styled.span<{ dotColor: string }>`
  background: ${({ dotColor }) => dotColor};
  border-radius: 50%;
  display: inline-block;
  height: 8px;
  width: 8px;
`;

const StyledLegendLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

export type ParksLegalPipelineFilters = {
  searchQuery: string;
  lawyerFilter: string;
  semaforoFilter: string;
};

type ParksLegalPipelineToolbarProps = {
  casosLegales: ParksCasoLegalRecord[];
  filters: ParksLegalPipelineFilters;
  onFiltersChange: (filters: ParksLegalPipelineFilters) => void;
  filteredCount: number;
};

export const ParksLegalPipelineToolbar = ({
  casosLegales,
  filters,
  onFiltersChange,
  filteredCount,
}: ParksLegalPipelineToolbarProps) => {
  const lawyerOptions = Array.from(
    new Set(
      casosLegales
        .map((casoLegal) => casoLegal.abogadoAsignado)
        .filter(Boolean) as string[],
    ),
  ).sort();

  const riesgoCount = casosLegales.filter(
    (casoLegal) =>
      casoLegal.semaforo === 'ROJO' || casoLegal.semaforo === 'NARANJA',
  ).length;

  const pausadosCount = casosLegales.filter(
    (casoLegal) =>
      casoLegal.documentacionCompleta === false ||
      casoLegal.estatus?.includes('Documentación incompleta'),
  ).length;

  return (
    <StyledToolbar>
      <StyledMetrics>
        <ParksMetricCard
          label={t`Casos activos`}
          value={casosLegales.length}
          icon={IconLayoutKanban}
          accent="purple"
        />
        <ParksMetricCard
          label={t`En riesgo`}
          value={riesgoCount}
          icon={IconAlertTriangle}
          accent="orange"
        />
        <ParksMetricCard
          label={t`SLA pausados`}
          value={pausadosCount}
          icon={IconClock}
          accent="gray"
        />
        <ParksMetricCard
          label={t`Mostrando`}
          value={`${filteredCount} / ${casosLegales.length}`}
          icon={IconUser}
          accent="sky"
        />
      </StyledMetrics>

      <StyledFilters>
        <StyledSearchInput
          type="search"
          placeholder={t`Buscar referencia, inquilino o nave...`}
          value={filters.searchQuery}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              searchQuery: event.target.value,
            })
          }
        />
        <StyledFilterSelect
          value={filters.lawyerFilter}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              lawyerFilter: event.target.value,
            })
          }
        >
          <option value="">{t`Todos los abogados`}</option>
          {lawyerOptions.map((lawyerName) => (
            <option key={lawyerName} value={lawyerName}>
              {lawyerName}
            </option>
          ))}
        </StyledFilterSelect>
        <StyledFilterSelect
          value={filters.semaforoFilter}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              semaforoFilter: event.target.value,
            })
          }
        >
          <option value="">{t`Todos los semáforos`}</option>
          <option value="ROJO">{t`Crítico`}</option>
          <option value="NARANJA">{t`En riesgo`}</option>
          <option value="AMARILLO">{t`Atención`}</option>
          <option value="VERDE">{t`En tiempo`}</option>
        </StyledFilterSelect>
      </StyledFilters>

      <StyledLegend>
        {LEGAL_KANBAN_STAGES.map((stage) => {
          const stageTheme = getParksLegalStageTheme(stage.id);

          return (
            <StyledLegendItem key={stage.id}>
              <StyledLegendDot dotColor={stageTheme.accent} />
              <StyledLegendLabel>{stage.label}</StyledLegendLabel>
            </StyledLegendItem>
          );
        })}
      </StyledLegend>
    </StyledToolbar>
  );
};
