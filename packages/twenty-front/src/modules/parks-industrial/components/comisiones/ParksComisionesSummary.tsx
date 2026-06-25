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

const StyledBrokerRank = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  justify-content: center;
  min-width: 24px;
`;

const StyledBrokerRow = styled.div`
  align-items: center;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: auto 1fr;
`;

const StyledBrokerHeader = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
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
    const totals = new Map<
      string,
      { total: number; pending: number; dealCount: number }
    >();

    for (const comision of comisiones) {
      const brokerName = comision.beneficiario ?? t`Sin broker`;
      const current = totals.get(brokerName) ?? {
        total: 0,
        pending: 0,
        dealCount: 0,
      };
      const amount = comision.montoUsd ?? 0;
      const dealKey =
        comision.casoLegal?.referencia ??
        comision.hojaDeAcuerdos?.referencia ??
        comision.id;

      totals.set(brokerName, {
        total: current.total + amount,
        pending:
          comision.estatus === 'PENDIENTE' ||
          comision.estatus === 'Pendiente' ||
          comision.estatus === 'CALCULADA' ||
          comision.estatus === 'Calculada'
            ? current.pending + amount
            : current.pending,
        dealCount: current.dealCount + 1,
      });
    }

    return Array.from(totals.entries())
      .map(([brokerName, values]) => ({ brokerName, ...values }))
      .sort((left, right) => right.total - left.total)
      .slice(0, 5);
  }, [comisiones]);

  const maxTotal = Math.max(...brokerRanking.map((item) => item.total), 1);

  return (
    <ParksSectionCard title={t`Ranking de brokers`}>
      <StyledList>
        {brokerRanking.length === 0 ? (
          <StyledAmount>{t`Sin comisiones registradas`}</StyledAmount>
        ) : (
          brokerRanking.map((broker, index) => (
          <StyledBrokerRow key={broker.brokerName}>
            <StyledBrokerRank>#{index + 1}</StyledBrokerRank>
            <StyledRow>
              <StyledBrokerHeader>
                <StyledBrokerName>{broker.brokerName}</StyledBrokerName>
                <StyledAmount>
                  {t`${broker.dealCount} deals`}
                </StyledAmount>
              </StyledBrokerHeader>
              <StyledAmount>
                {formatParksUsd(broker.total)} · {t`Pendiente`}:{' '}
                {formatParksUsd(broker.pending)}
              </StyledAmount>
              <ParksProgressBar
                label={t`Meta del periodo`}
                valueLabel={formatParksUsd(broker.total)}
                percentage={Math.round((broker.total / maxTotal) * 100)}
              />
            </StyledRow>
          </StyledBrokerRow>
          ))
        )}
      </StyledList>
    </ParksSectionCard>
  );
};
