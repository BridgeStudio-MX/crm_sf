import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconReportMoney,
  IconShield,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { type ParksCeoCommandMetrics } from '@/parks-industrial/hooks/useParksCeoCommandMetrics';
import { type CxcAccount } from '@/parks-industrial/types/parks-cxc.types';
import { type LegalDashboardCase } from '@/parks-industrial/types/parks-legal.types';
import { formatCxcCompactMoney } from '@/parks-industrial/utils/parks-cxc-format.util';
import { getParksLegalSemaforoBadgeColor } from '@/parks-industrial/utils/parks-format.util';

type ParksCeoAttentionBoardProps = {
  command: ParksCeoCommandMetrics;
  legalCases: LegalDashboardCase[];
  cxcPriorityAccounts: CxcAccount[];
};

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const StyledPulseCard = styled.div<{ tone: 'red' | 'orange' | 'yellow' | 'green' }>`
  background: ${({ tone }) =>
    tone === 'red'
      ? themeCssVariables.color.red1
      : tone === 'orange'
        ? themeCssVariables.color.orange1
        : tone === 'yellow'
          ? themeCssVariables.color.yellow1
          : themeCssVariables.color.green1};
  border: 1px solid
    ${({ tone }) =>
      tone === 'red'
        ? themeCssVariables.color.red3
        : tone === 'orange'
          ? themeCssVariables.color.orange3
          : tone === 'yellow'
            ? themeCssVariables.color.yellow3
            : themeCssVariables.color.green3};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledPulseTitle = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPulseValue = styled.div`
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.02em;
`;

const StyledPulseHint = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRow = styled.div`
  align-items: center;
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledRowMain = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledRowTitle = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRowMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledLink = styled(Link)`
  align-items: center;
  color: ${themeCssVariables.color.blue};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 4px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledTwoCol = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};

  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const ParksCeoAttentionBoard = ({
  command,
  legalCases,
  cxcPriorityAccounts,
}: ParksCeoAttentionBoardProps) => {
  const legalHot = legalCases
    .filter((legalCase) => {
      const semaforo = legalCase.semaforo?.toUpperCase() ?? '';

      return semaforo.includes('ROJO') || (legalCase.diasRestantes ?? 99) <= 2;
    })
    .slice(0, 4);

  const cxcHot = cxcPriorityAccounts.slice(0, 4);

  return (
    <>
      <ParksSectionCard title={t`Qué requiere tu atención hoy`} accent="red">
        <StyledGrid>
          <StyledPulseCard
            tone={command.legalEnRiesgo > 0 ? 'red' : 'green'}
          >
            <StyledPulseTitle>
              <IconShield size={16} />
              {t`Legal`}
            </StyledPulseTitle>
            <StyledPulseValue>{command.legalEnRiesgo}</StyledPulseValue>
            <StyledPulseHint>
              {t`Casos en semáforo rojo / riesgo. ${command.legalSlaVencidos} con SLA vencido.`}
            </StyledPulseHint>
          </StyledPulseCard>

          <StyledPulseCard
            tone={command.cxcCarteraVencida > 0 ? 'orange' : 'green'}
          >
            <StyledPulseTitle>
              <IconReportMoney size={16} />
              {t`CxC vencida`}
            </StyledPulseTitle>
            <StyledPulseValue>
              {formatCxcCompactMoney(command.cxcCarteraVencida)}
            </StyledPulseValue>
            <StyledPulseHint>
              {t`${command.cxcMoraGrave} en mora grave · forecast 30d ${formatCxcCompactMoney(command.cxcForecast30d)}`}
            </StyledPulseHint>
          </StyledPulseCard>

          <StyledPulseCard
            tone={command.contratosPorVencer > 0 ? 'yellow' : 'green'}
          >
            <StyledPulseTitle>
              <IconAlertTriangle size={16} />
              {t`Renovaciones`}
            </StyledPulseTitle>
            <StyledPulseValue>{command.contratosPorVencer}</StyledPulseValue>
            <StyledPulseHint>
              {t`Contratos por vencer en 90 días. ${command.cxcHoldovers} holdovers activos.`}
            </StyledPulseHint>
          </StyledPulseCard>

          <StyledPulseCard
            tone={command.cxcAnomaliasAbiertas > 0 ? 'orange' : 'green'}
          >
            <StyledPulseTitle>
              <IconAlertTriangle size={16} />
              {t`Anomalías CxC`}
            </StyledPulseTitle>
            <StyledPulseValue>{command.cxcAnomaliasAbiertas}</StyledPulseValue>
            <StyledPulseHint>
              {t`${command.cxcOcPendientes} órdenes de compra pendientes de registro.`}
            </StyledPulseHint>
          </StyledPulseCard>
        </StyledGrid>
      </ParksSectionCard>

      <StyledTwoCol>
        <ParksSectionCard
          title={t`Legal · casos calientes`}
          accent="purple"
          action={
            <StyledLink to={AppPath.ParksLegalDashboard}>
              {t`Ver todo`}
              <IconArrowRight size={14} />
            </StyledLink>
          }
        >
          {legalHot.length === 0 ? (
            <StyledPulseHint>{t`Sin casos legales críticos.`}</StyledPulseHint>
          ) : (
            <StyledList>
              {legalHot.map((legalCase) => (
                <StyledRow key={legalCase.id}>
                  <StyledRowMain>
                    <StyledRowTitle>
                      {legalCase.empresa ?? legalCase.referencia ?? legalCase.id}
                    </StyledRowTitle>
                    <StyledRowMeta>
                      {legalCase.abogadoAsignado ?? t`Sin abogado`} ·{' '}
                      {legalCase.estatus ?? '—'}
                    </StyledRowMeta>
                  </StyledRowMain>
                  <ParksStatusBadge
                    color={getParksLegalSemaforoBadgeColor(legalCase.semaforo)}
                    label={legalCase.semaforo ?? '—'}
                  />
                </StyledRow>
              ))}
            </StyledList>
          )}
        </ParksSectionCard>

        <ParksSectionCard
          title={t`CxC · cuentas prioritarias`}
          accent="orange"
          action={
            <StyledLink to={AppPath.ParksCxc}>
              {t`Ver cartera`}
              <IconArrowRight size={14} />
            </StyledLink>
          }
        >
          {cxcHot.length === 0 ? (
            <StyledPulseHint>{t`Sin cuentas prioritarias.`}</StyledPulseHint>
          ) : (
            <StyledList>
              {cxcHot.map((account) => (
                <StyledRow key={account.id}>
                  <StyledRowMain>
                    <StyledRowTitle>{account.empresa}</StyledRowTitle>
                    <StyledRowMeta>
                      {account.scoreLabel} ·{' '}
                      {formatCxcCompactMoney(account.montoAdeudoTotal)}
                    </StyledRowMeta>
                  </StyledRowMain>
                  <ParksStatusBadge
                    color={
                      account.scoreLabel === 'Crítico' ||
                      account.scoreLabel === 'Alto'
                        ? 'red'
                        : 'yellow'
                    }
                    label={account.estatusPagos}
                  />
                </StyledRow>
              ))}
            </StyledList>
          )}
        </ParksSectionCard>
      </StyledTwoCol>
    </>
  );
};
