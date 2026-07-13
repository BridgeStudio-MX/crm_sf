import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';

import { type ParksComisionRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksProgressBar } from '@/parks-industrial/components/ui/ParksProgressBar';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { formatParksUsd } from '@/parks-industrial/utils/parks-format.util';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledBrokerRank = styled.div`
  align-items: center;
  background: ${PARKS_BRAND.primarySoft};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${PARKS_BRAND.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 28px;
  justify-content: center;
  min-width: 28px;
`;

const StyledBrokerRow = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: auto 1fr;
  padding: ${themeCssVariables.spacing[3]};
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.strong};
    transform: translateY(-1px);
  }
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
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
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
    <ParksSectionCard title={t`Ranking de brokers`} accent="green">
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
