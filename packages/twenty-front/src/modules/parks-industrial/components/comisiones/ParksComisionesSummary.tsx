import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';

import { type ParksComisionRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksProgressBar } from '@/parks-industrial/components/ui/ParksProgressBar';
import { formatParksUsd } from '@/parks-industrial/utils/parks-format.util';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledBrokerName = styled.div`
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledAmount = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type ParksComisionesSummaryProps = {
  comisiones: ParksComisionRecord[];
};

export const ParksComisionesSummary = ({
  comisiones,
}: ParksComisionesSummaryProps) => {
  const brokerRanking = useMemo(() => {
    const totals = new Map<string, { total: number; pending: number }>();

    for (const comision of comisiones) {
      const brokerName = comision.beneficiario ?? t`Sin broker`;
      const current = totals.get(brokerName) ?? { total: 0, pending: 0 };
      const amount = comision.montoUsd ?? 0;

      totals.set(brokerName, {
        total: current.total + amount,
        pending:
          comision.estatus === 'PENDIENTE'
            ? current.pending + amount
            : current.pending,
      });
    }

    return Array.from(totals.entries())
      .map(([brokerName, values]) => ({ brokerName, ...values }))
      .sort((left, right) => right.total - left.total)
      .slice(0, 5);
  }, [comisiones]);

  const maxTotal = Math.max(...brokerRanking.map((item) => item.total), 1);

  return (
    <ParksSectionCard title={t`Top brokers por comisiones`}>
      <StyledList>
        {brokerRanking.map((broker) => (
          <StyledRow key={broker.brokerName}>
            <StyledBrokerName>{broker.brokerName}</StyledBrokerName>
            <StyledAmount>
              {formatParksUsd(broker.total)} · {t`Pendiente`}:{' '}
              {formatParksUsd(broker.pending)}
            </StyledAmount>
            <ParksProgressBar
              label={t`Participación`}
              valueLabel={formatParksUsd(broker.total)}
              percentage={Math.round((broker.total / maxTotal) * 100)}
            />
          </StyledRow>
        ))}
      </StyledList>
    </ParksSectionCard>
  );
};
