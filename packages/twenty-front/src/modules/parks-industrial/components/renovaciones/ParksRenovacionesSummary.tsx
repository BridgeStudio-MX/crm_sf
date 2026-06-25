import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  IconAlertTriangle,
  IconCalendarEvent,
  IconCurrencyDollar,
  IconRefresh,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import { type ParksRenovacionesSummary as ParksRenovacionesSummaryData } from '@/parks-industrial/utils/parks-renovaciones.util';
import { formatParksUsd } from '@/parks-industrial/utils/parks-format.util';

type ParksRenovacionesSummaryProps = {
  summary: ParksRenovacionesSummaryData;
};

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const StyledHero = styled.div`
  background: linear-gradient(
    135deg,
    ${themeCssVariables.color.orange1} 0%,
    ${themeCssVariables.background.primary} 50%,
    ${themeCssVariables.color.red1} 100%
  );
  border: 1px solid ${themeCssVariables.color.orange3};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeroTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledHeroText = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  margin: 0;
  max-width: 640px;
`;

export const ParksRenovacionesSummary = ({
  summary,
}: ParksRenovacionesSummaryProps) => (
  <>
    <StyledHero>
      <StyledHeroTitle>{t`Centro de renovaciones`}</StyledHeroTitle>
      <StyledHeroText>
        {t`Prioriza contratos por riesgo de vacancia e ingreso. Los casos críticos requieren acción comercial y legal antes del vencimiento.`}
      </StyledHeroText>
    </StyledHero>
    <StyledGrid>
      <ParksMetricCard
        label={t`En cola (12 meses)`}
        value={summary.totalEnCola}
        icon={IconCalendarEvent}
        accent="blue"
      />
      <ParksMetricCard
        label={t`Casos críticos`}
        value={summary.criticos}
        icon={IconAlertTriangle}
        accent={summary.criticos > 0 ? 'red' : 'green'}
        trend={t`< 90 días para vencer`}
      />
      <ParksMetricCard
        label={t`Ingreso en riesgo`}
        value={formatParksUsd(summary.ingresoEnRiesgoUsd)}
        icon={IconCurrencyDollar}
        accent="yellow"
        trend={t`Crítico + atención`}
      />
      <ParksMetricCard
        label={t`Holdovers activos`}
        value={summary.holdoversActivos}
        icon={IconRefresh}
        accent={summary.holdoversActivos > 0 ? 'red' : 'gray'}
        trend={formatParksUsd(summary.montoHoldoverMensualUsd)}
      />
    </StyledGrid>
  </>
);
