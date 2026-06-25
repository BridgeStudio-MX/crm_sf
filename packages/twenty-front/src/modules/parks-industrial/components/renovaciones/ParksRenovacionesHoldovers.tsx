import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getParksHoldoverStageLabel } from '@/parks-industrial/constants/parks-industrial.constants';
import { useParksHoldovers } from '@/parks-industrial/hooks/useParksRecords';
import { useParksObjectMetadataItem } from '@/parks-industrial/hooks/useParksObjectMetadataItem';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  formatParksDate,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';
import { isParksSelectValueEqual } from '@/parks-industrial/utils/parks-select-value.util';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledCard = styled.div`
  background: linear-gradient(
    135deg,
    ${themeCssVariables.color.red1},
    ${themeCssVariables.background.primary}
  );
  border: 1px solid ${themeCssVariables.color.red3};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledTitle = styled.div`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: 4px;
`;

const StyledMetrics = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledMetric = styled.div`
  background: ${themeCssVariables.background.primary};
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

export const ParksRenovacionesHoldovers = () => {
  const { isParksMetadataReady } = useParksObjectMetadataItem('holdover');

  if (!isParksMetadataReady) {
    return (
      <ParksEmptyState
        title={t`Holdovers no configurados`}
        description={t`Ejecuta setup-objects en parks-twenty-service para habilitar el objeto holdover en este workspace.`}
      />
    );
  }

  return <ParksRenovacionesHoldoversContent />;
};

const ParksRenovacionesHoldoversContent = () => {
  const { records: holdovers } = useParksHoldovers();
  const activeHoldovers = holdovers.filter((holdover) =>
    isParksSelectValueEqual(holdover.resolucion, 'Activo'),
  );

  if (activeHoldovers.length === 0) {
    return (
      <ParksEmptyState
        title={t`Sin holdovers activos`}
        description={t`Cuando un contrato vence sin renovación firmada, el caso aparecerá aquí con seguimiento legal y financiero.`}
      />
    );
  }

  return (
    <StyledList>
      {activeHoldovers.map((holdover) => (
        <StyledCard key={holdover.id}>
          <StyledHeader>
            <div>
              <StyledTitle>{holdover.referencia ?? t`Holdover`}</StyledTitle>
              <StyledMeta>
                {holdover.inquilino?.empresa ?? t`Inquilino`} ·{' '}
                {holdover.nave?.identificador ?? t`Sin nave`}
              </StyledMeta>
            </div>
            <ParksStatusBadge
              label={getParksHoldoverStageLabel(holdover.etapaPipeline)}
              color="red"
            />
          </StyledHeader>
          <StyledMetrics>
            <StyledMetric>
              <StyledMetricLabel>{t`Inicio`}</StyledMetricLabel>
              <StyledMetricValue>
                {formatParksDate(holdover.fechaInicioHoldover)}
              </StyledMetricValue>
            </StyledMetric>
            <StyledMetric>
              <StyledMetricLabel>{t`Renta base`}</StyledMetricLabel>
              <StyledMetricValue>
                {formatParksUsd(holdover.rentaBaseMensualUsd ?? 0)}
              </StyledMetricValue>
            </StyledMetric>
            <StyledMetric>
              <StyledMetricLabel>{t`Monto holdover`}</StyledMetricLabel>
              <StyledMetricValue>
                {formatParksUsd(holdover.montoHoldoverMensual ?? 0)}
              </StyledMetricValue>
            </StyledMetric>
          </StyledMetrics>
        </StyledCard>
      ))}
    </StyledList>
  );
};
