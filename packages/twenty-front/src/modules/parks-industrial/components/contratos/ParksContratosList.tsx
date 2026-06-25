import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  getParksApprovalStageLabel,
  parseParksApprovalStage,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksCasoLegalRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const getSemaforoColor = (
  semaforo?: string | null,
): 'red' | 'yellow' | 'green' | 'gray' => {
  if (semaforo === 'ROJO') {
    return 'red';
  }

  if (semaforo === 'AMARILLO') {
    return 'yellow';
  }

  if (semaforo === 'VERDE') {
    return 'green';
  }

  return 'gray';
};

type ParksContratosListProps = {
  casosLegales: ParksCasoLegalRecord[];
};

export const ParksContratosList = ({ casosLegales }: ParksContratosListProps) => {
  const sortedCasos = [...casosLegales].sort((left, right) => {
    const leftStage = parseParksApprovalStage(left.notasCatalina);
    const rightStage = parseParksApprovalStage(right.notasCatalina);

    if (leftStage === 'legal' && rightStage !== 'legal') {
      return -1;
    }

    if (rightStage === 'legal' && leftStage !== 'legal') {
      return 1;
    }

    if (left.semaforo === 'ROJO' && right.semaforo !== 'ROJO') {
      return -1;
    }

    return 0;
  });

  if (sortedCasos.length === 0) {
    return (
      <ParksEmptyState
        title={t`No hay contratos en aprobación`}
        description={t`Los casos legales aparecerán aquí cuando entren al flujo de revisión.`}
      />
    );
  }

  return (
    <StyledList>
      {sortedCasos.map((caso) => {
        const stage = parseParksApprovalStage(caso.notasCatalina);

        return (
          <StyledCard key={caso.id}>
            <StyledHeader>
              <strong>{caso.referencia}</strong>
              <ParksStatusBadge
                color={getSemaforoColor(caso.semaforo)}
                label={caso.semaforo ?? t`Sin semáforo`}
              />
            </StyledHeader>
            <StyledMeta>
              {caso.inquilino?.empresa ?? t`Sin inquilino`} ·{' '}
              {caso.nave?.identificador ?? t`Sin nave`}
            </StyledMeta>
            <StyledMeta>{getParksApprovalStageLabel(stage)}</StyledMeta>
            <UndecoratedLink
              to={getAppPath(AppPath.ParksContratoAprobacion, {
                contratoId: caso.id,
              })}
            >
              <span style={{ fontSize: 12 }}>{t`Ver aprobación`}</span>
            </UndecoratedLink>
          </StyledCard>
        );
      })}
    </StyledList>
  );
};
