import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksLegalPipelineColumn } from '@/parks-industrial/components/legal/ParksLegalPipelineColumn';
import {
  type ParksLegalPipelineFilters,
  ParksLegalPipelineToolbar,
} from '@/parks-industrial/components/legal/ParksLegalPipelineToolbar';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import {
  LEGAL_KANBAN_STAGES,
  matchLegalEstatus,
} from '@/parks-industrial/constants/parks-legal-workflow.constants';
import { type ParksCasoLegalRecord } from '@/parks-industrial/hooks/useParksRecords';

const StyledBoardLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledBoard = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  overflow-x: auto;
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledDragHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const filterCasosLegales = (
  casosLegales: ParksCasoLegalRecord[],
  filters: ParksLegalPipelineFilters,
): ParksCasoLegalRecord[] =>
  casosLegales.filter((casoLegal) => {
    const searchTarget = [
      casoLegal.referencia,
      casoLegal.inquilino?.empresa,
      casoLegal.nave?.identificador,
      casoLegal.abogadoAsignado,
      casoLegal.tipoDocumento,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch =
      filters.searchQuery.length === 0 ||
      searchTarget.includes(filters.searchQuery.toLowerCase());

    const matchesLawyer =
      filters.lawyerFilter.length === 0 ||
      casoLegal.abogadoAsignado === filters.lawyerFilter;

    const matchesSemaforo =
      filters.semaforoFilter.length === 0 ||
      casoLegal.semaforo === filters.semaforoFilter;

    return matchesSearch && matchesLawyer && matchesSemaforo;
  });

type ParksLegalPipelineBoardProps = {
  casosLegales: ParksCasoLegalRecord[];
};

export const ParksLegalPipelineBoard = ({
  casosLegales,
}: ParksLegalPipelineBoardProps) => {
  const [filters, setFilters] = useState<ParksLegalPipelineFilters>({
    searchQuery: '',
    lawyerFilter: '',
    semaforoFilter: '',
  });

  const filteredCasosLegales = useMemo(
    () => filterCasosLegales(casosLegales, filters),
    [casosLegales, filters],
  );

  if (casosLegales.length === 0) {
    return (
      <ParksEmptyState
        title={t`Sin casos legales activos`}
        description={t`Los casos aparecen cuando el comercial envía contratos a Legal. Si estás en local de demo, ejecuta: cd parks-twenty-service && npm run seed:demo`}
      />
    );
  }

  return (
    <StyledParksPageStack>
      <ParksLegalPipelineToolbar
        casosLegales={casosLegales}
        filters={filters}
        onFiltersChange={setFilters}
        filteredCount={filteredCasosLegales.length}
      />

      <StyledBoardLayout>
        <StyledDragHint>
          {t`Haz clic en un caso para abrir el flujo de aprobación y gestionar versiones, firmas y SLA.`}
        </StyledDragHint>

        {filteredCasosLegales.length === 0 ? (
          <ParksEmptyState
            title={t`Sin resultados`}
            description={t`Ajusta los filtros para ver casos en el pipeline legal.`}
          />
        ) : (
          <StyledBoard>
            {LEGAL_KANBAN_STAGES.map((stage) => {
              const columnCases = filteredCasosLegales.filter((casoLegal) =>
                matchLegalEstatus(casoLegal.estatus, stage.estatus),
              );

              return (
                <ParksLegalPipelineColumn
                  key={stage.id}
                  stage={stage}
                  casosLegales={columnCases}
                />
              );
            })}
          </StyledBoard>
        )}
      </StyledBoardLayout>
    </StyledParksPageStack>
  );
};
