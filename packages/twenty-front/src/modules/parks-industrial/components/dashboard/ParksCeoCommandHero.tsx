import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuildingSkyscraper,
  IconCurrencyDollar,
  IconFileCheck,
  IconReportMoney,
  IconShield,
  IconTarget,
  IconUsers,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { ParksBrandLogo } from '@/parks-industrial/components/ui/ParksBrandLogo';
import {
  PARKS_COMMAND_CENTER,
} from '@/parks-industrial/constants/parks-theme.constants';
import { type ParksCeoCommandMetrics } from '@/parks-industrial/hooks/useParksCeoCommandMetrics';
import { formatCxcCompactMoney } from '@/parks-industrial/utils/parks-cxc-format.util';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';

type ParksCeoCommandHeroProps = {
  command: ParksCeoCommandMetrics;
};

const StyledHero = styled.section`
  background: ${PARKS_COMMAND_CENTER.background};
  border: 1px solid ${PARKS_COMMAND_CENTER.panelBorder};
  border-radius: ${themeCssVariables.border.radius.xl};
  box-shadow: ${PARKS_COMMAND_CENTER.boxShadow};
  color: ${PARKS_COMMAND_CENTER.text};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[5]};
  position: relative;

  &::before {
    background: ${PARKS_COMMAND_CENTER.accentBar};
    content: '';
    height: 4px;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[6]};
  }
`;

const StyledOrb = styled.div<{ top: string; right: string; size: string }>`
  background: ${PARKS_COMMAND_CENTER.glowOrb};
  border-radius: 50%;
  height: ${({ size }) => size};
  pointer-events: none;
  position: absolute;
  right: ${({ right }) => right};
  top: ${({ top }) => top};
  width: ${({ size }) => size};
`;

const StyledTopRow = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  position: relative;
  z-index: 1;
`;

const StyledHeroBrand = styled.div`
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledCopy = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 220px;
`;

const StyledEyebrow = styled.div`
  color: ${PARKS_COMMAND_CENTER.textMuted};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const StyledTitle = styled.h2`
  font-size: clamp(1.85rem, 3.2vw, 2.6rem);
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0;
`;

const StyledSubtitle = styled.p`
  color: ${PARKS_COMMAND_CENTER.textSecondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
  max-width: 42rem;
`;

const StyledHealthCard = styled.div`
  backdrop-filter: blur(10px);
  background: ${PARKS_COMMAND_CENTER.panelBackground};
  border: 1px solid ${PARKS_COMMAND_CENTER.panelBorder};
  border-radius: ${themeCssVariables.border.radius.md};
  min-width: 148px;
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

const StyledHealthScore = styled.div`
  font-size: clamp(2.4rem, 4vw, 3.2rem);
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.04em;
  line-height: 1;
`;

const StyledHealthLabel = styled.div`
  color: ${PARKS_COMMAND_CENTER.textMuted};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const StyledKpiGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: ${themeCssVariables.spacing[5]};
  position: relative;
  z-index: 1;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: 1100px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
`;

const StyledKpi = styled.div`
  backdrop-filter: blur(8px);
  background: ${PARKS_COMMAND_CENTER.panelBackground};
  border: 1px solid ${PARKS_COMMAND_CENTER.panelBorder};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: ${themeCssVariables.spacing[3]};
  transition:
    transform 0.2s ease,
    background 0.2s ease;

  &:hover {
    background: ${PARKS_COMMAND_CENTER.actionHoverBackground};
    transform: translateY(-2px);
  }
`;

const StyledKpiLabel = styled.div`
  align-items: center;
  color: ${PARKS_COMMAND_CENTER.textMuted};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: 6px;
`;

const StyledKpiValue = styled.div`
  font-size: clamp(1.15rem, 1.8vw, 1.45rem);
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.02em;
  line-height: 1.15;
`;

const StyledKpiHint = styled.div`
  color: ${PARKS_COMMAND_CENTER.textMuted};
  font-size: 11px;
`;

const StyledLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[4]};
  position: relative;
  z-index: 1;
`;

const StyledLink = styled(Link)`
  align-items: center;
  background: ${PARKS_COMMAND_CENTER.actionBackground};
  border: 1px solid ${PARKS_COMMAND_CENTER.actionBorder};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${PARKS_COMMAND_CENTER.actionText};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 6px;
  padding: 8px 12px;
  text-decoration: none;
  transition: background 0.15s ease;

  &:hover {
    background: ${PARKS_COMMAND_CENTER.actionHoverBackground};
  }
`;

const getHealthBadgeColor = (
  label: ParksCeoCommandMetrics['healthLabel'],
): 'green' | 'yellow' | 'red' => {
  if (label === 'Óptimo') {
    return 'green';
  }

  if (label === 'Atención') {
    return 'yellow';
  }

  return 'red';
};

export const ParksCeoCommandHero = ({ command }: ParksCeoCommandHeroProps) => {
  const moraPct =
    command.cxcCarteraTotal > 0
      ? Math.round((command.cxcCarteraVencida / command.cxcCarteraTotal) * 100)
      : 0;

  return (
    <StyledHero>
      <StyledOrb top="-40px" right="-20px" size="220px" />
      <StyledOrb top="40%" right="18%" size="140px" />

      <StyledTopRow>
        <StyledCopy>
          <StyledHeroBrand>
            <ParksBrandLogo variant="green" height={32} />
          </StyledHeroBrand>
          <StyledEyebrow>{t`Vista CEO · Parks Industrial`}</StyledEyebrow>
          <StyledTitle>{t`Command Center`}</StyledTitle>
          <StyledSubtitle>
            {t`Pulso del negocio en una sola pantalla: ocupación, ingresos, pipeline, riesgo legal y cartera CxC.`}
          </StyledSubtitle>
          <div>
            <ParksStatusBadge
              color={getHealthBadgeColor(command.healthLabel)}
              label={t`Salud del grupo · ${command.healthLabel}`}
            />
          </div>
        </StyledCopy>

        <StyledHealthCard>
          <StyledHealthScore>{command.healthScore}</StyledHealthScore>
          <StyledHealthLabel>{t`Índice de salud`}</StyledHealthLabel>
        </StyledHealthCard>
      </StyledTopRow>

      <StyledKpiGrid>
        <StyledKpi>
          <StyledKpiLabel>
            <IconBuildingSkyscraper size={14} />
            {t`Ocupación`}
          </StyledKpiLabel>
          <StyledKpiValue>{command.ocupacion}%</StyledKpiValue>
          <StyledKpiHint>
            {t`${command.parqueCount} parques · ${formatParksNumber(command.m2Totales)} m²`}
          </StyledKpiHint>
        </StyledKpi>

        <StyledKpi>
          <StyledKpiLabel>
            <IconCurrencyDollar size={14} />
            {t`Ingresos / mes`}
          </StyledKpiLabel>
          <StyledKpiValue>
            {formatParksUsd(command.ingresosMensuales)}
          </StyledKpiValue>
          <StyledKpiHint>{t`Cartera activa estimada`}</StyledKpiHint>
        </StyledKpi>

        <StyledKpi>
          <StyledKpiLabel>
            <IconTarget size={14} />
            {t`Pipeline`}
          </StyledKpiLabel>
          <StyledKpiValue>
            {formatParksUsd(command.pipelineValueUsd)}
          </StyledKpiValue>
          <StyledKpiHint>
            {t`${command.pipelineActiveDeals} deals activos`}
          </StyledKpiHint>
        </StyledKpi>

        <StyledKpi>
          <StyledKpiLabel>
            <IconReportMoney size={14} />
            {t`Cartera CxC`}
          </StyledKpiLabel>
          <StyledKpiValue>
            {formatCxcCompactMoney(command.cxcCarteraTotal)}
          </StyledKpiValue>
          <StyledKpiHint>
            {t`${moraPct}% vencida · ${formatCxcCompactMoney(command.cxcCarteraVencida)}`}
          </StyledKpiHint>
        </StyledKpi>

        <StyledKpi>
          <StyledKpiLabel>
            <IconShield size={14} />
            {t`Legal en riesgo`}
          </StyledKpiLabel>
          <StyledKpiValue>{command.legalEnRiesgo}</StyledKpiValue>
          <StyledKpiHint>
            {t`${command.legalSlaVencidos} SLA vencidos · ${command.legalActivos} activos`}
          </StyledKpiHint>
        </StyledKpi>

        <StyledKpi>
          <StyledKpiLabel>
            <IconAlertTriangle size={14} />
            {t`Vencen ≤90d`}
          </StyledKpiLabel>
          <StyledKpiValue>{command.contratosPorVencer}</StyledKpiValue>
          <StyledKpiHint>
            {t`${command.cxcHoldovers} holdovers · ${command.cxcOcPendientes} OC`}
          </StyledKpiHint>
        </StyledKpi>
      </StyledKpiGrid>

      <StyledLinks>
        <StyledLink to={AppPath.ParksComite}>
          <IconUsers size={14} />
          {t`Sesión de comité`}
          <IconArrowRight size={14} />
        </StyledLink>
        <StyledLink to={AppPath.ParksStackingPlanIndex}>
          <IconBuildingSkyscraper size={14} />
          {t`Inventario`}
          <IconArrowRight size={14} />
        </StyledLink>
        <StyledLink to={AppPath.ParksLegalDashboard}>
          <IconFileCheck size={14} />
          {t`Legal`}
          <IconArrowRight size={14} />
        </StyledLink>
        <StyledLink to={AppPath.ParksCxc}>
          <IconReportMoney size={14} />
          {t`CxC`}
          <IconArrowRight size={14} />
        </StyledLink>
        <StyledLink to={AppPath.ParksRenovaciones}>
          <IconAlertTriangle size={14} />
          {t`Renovaciones`}
          <IconArrowRight size={14} />
        </StyledLink>
        <StyledLink to={AppPath.ParksContratos}>
          <IconShield size={14} />
          {t`Contratos`}
          <IconArrowRight size={14} />
        </StyledLink>
      </StyledLinks>
    </StyledHero>
  );
};
