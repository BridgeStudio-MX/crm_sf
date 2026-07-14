import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import {
  IconArrowRight,
  IconBuildingSkyscraper,
  IconLayoutKanban,
  IconMap,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksDashboardDonutChart } from '@/parks-industrial/components/dashboard/charts/ParksDashboardDonutChart';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { type ParksDashboardChartSlice } from '@/parks-industrial/utils/parks-dashboard-charts.util';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';

type ParksDashboardHeroProps = {
  ocupacion: number;
  ocupacionSlices: ParksDashboardChartSlice[];
  parqueCount: number;
  m2Totales: number;
  pipelineValueUsd: number;
  pipelineActiveDeals: number;
  ingresosMensuales: number;
};

const StyledHero = styled.section`
  background: linear-gradient(
    128deg,
    #003d20 0%,
    ${PARKS_BRAND.primary} 38%,
    #0a7a45 72%,
    rgba(141, 198, 63, 0.35) 100%
  );
  border-radius: ${themeCssVariables.border.radius.xl};
  box-shadow:
    0 24px 48px rgba(0, 61, 32, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  color: ${themeCssVariables.font.color.inverted};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[5]};
  position: relative;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[6]};
  }
`;

const StyledGlowOrb = styled.div<{ top: string; left: string; size: string }>`
  background: radial-gradient(
    circle,
    rgba(141, 198, 63, 0.35) 0%,
    transparent 68%
  );
  border-radius: 50%;
  height: ${({ size }) => size};
  left: ${({ left }) => left};
  pointer-events: none;
  position: absolute;
  top: ${({ top }) => top};
  width: ${({ size }) => size};
`;

const StyledHeroGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[5]};
  position: relative;
  z-index: 1;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    align-items: center;
    grid-template-columns: 1.15fr 0.85fr;
  }
`;

const StyledHeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledEyebrow = styled.div`
  color: rgba(255, 255, 255, 0.72);
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const StyledHeroTitle = styled.h2`
  font-size: clamp(1.75rem, 3vw, 2.35rem);
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.03em;
  line-height: 1.08;
  margin: 0;
`;

const StyledHeroSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.82);
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.55;
  margin: 0;
  max-width: 520px;
`;

const StyledHeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledHeroAction = styled(Link)`
  align-items: center;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.inverted};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 6px;
  padding: 8px 14px;
  text-decoration: none;
  transition:
    background 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const StyledChartPanel = styled.div`
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledStatsRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: ${themeCssVariables.spacing[4]};
  position: relative;
  z-index: 1;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const StyledStatCard = styled.div`
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.11);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledStatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: ${themeCssVariables.font.size.xs};
  letter-spacing: 0.02em;
`;

const StyledStatValue = styled.div`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-top: 6px;
`;

const StyledStatHint = styled.div`
  color: ${PARKS_BRAND.accent};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 4px;
`;

export const ParksDashboardHero = ({
  ocupacion,
  ocupacionSlices,
  parqueCount,
  m2Totales,
  pipelineValueUsd,
  pipelineActiveDeals,
  ingresosMensuales,
}: ParksDashboardHeroProps) => (
  <StyledHero>
    <StyledGlowOrb top="-40%" left="55%" size="420px" />
    <StyledGlowOrb top="20%" left="-15%" size="280px" />

    <StyledHeroGrid>
      <StyledHeroCopy>
        <StyledEyebrow>{t`Parks Industrial · Cartera`}</StyledEyebrow>
        <StyledHeroTitle>{t`Centro de mando comercial`}</StyledHeroTitle>
        <StyledHeroSubtitle>
          {t`Ocupación, ingresos, pipeline y riesgos de vencimiento en una sola vista para decidir dónde enfocar el equipo.`}
        </StyledHeroSubtitle>
        <StyledHeroActions>
          <StyledHeroAction to={AppPath.ParksPipeline}>
            <IconLayoutKanban size={16} />
            {t`Pipeline`}
            <IconArrowRight size={14} />
          </StyledHeroAction>
          <StyledHeroAction to={AppPath.ParksMapa}>
            <IconMap size={16} />
            {t`Mapa de Inventario`}
            <IconArrowRight size={14} />
          </StyledHeroAction>
          <StyledHeroAction to={AppPath.ParksStackingPlanIndex}>
            <IconBuildingSkyscraper size={16} />
            {t`Stacking Plan`}
            <IconArrowRight size={14} />
          </StyledHeroAction>
        </StyledHeroActions>
      </StyledHeroCopy>

      <StyledChartPanel>
        <ParksDashboardDonutChart
          slices={ocupacionSlices}
          centerLabel={t`Ocupación global`}
          centerValue={`${ocupacion}%`}
          variant="inverted"
        />
      </StyledChartPanel>
    </StyledHeroGrid>

    <StyledStatsRow>
      <StyledStatCard>
        <StyledStatLabel>{t`Parques activos`}</StyledStatLabel>
        <StyledStatValue>{parqueCount}</StyledStatValue>
        <StyledStatHint>{t`En cartera`}</StyledStatHint>
      </StyledStatCard>
      <StyledStatCard>
        <StyledStatLabel>{t`Superficie total`}</StyledStatLabel>
        <StyledStatValue>{formatParksNumber(m2Totales)} m²</StyledStatValue>
        <StyledStatHint>{t`Inventario`}</StyledStatHint>
      </StyledStatCard>
      <StyledStatCard>
        <StyledStatLabel>{t`Pipeline activo`}</StyledStatLabel>
        <StyledStatValue>{formatParksUsd(pipelineValueUsd)}</StyledStatValue>
        <StyledStatHint>
          {pipelineActiveDeals} {t`deals`}
        </StyledStatHint>
      </StyledStatCard>
      <StyledStatCard>
        <StyledStatLabel>{t`Ingresos / mes`}</StyledStatLabel>
        <StyledStatValue>{formatParksUsd(ingresosMensuales)}</StyledStatValue>
        <StyledStatHint>{t`Estimado`}</StyledStatHint>
      </StyledStatCard>
    </StyledStatsRow>
  </StyledHero>
);
