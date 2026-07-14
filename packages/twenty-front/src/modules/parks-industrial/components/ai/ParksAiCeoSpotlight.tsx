import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  IconAlertTriangle,
  IconChartBar,
  IconListCheck,
  IconLayoutKanban,
  IconReportMoney,
  IconSparkles,
  type IconComponent,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import {
  type ParksAiQuickAction,
  type ParksAiQuickActionVisual,
} from '@/parks-industrial/types/parks-ai.types';

type ParksAiCeoSpotlightProps = {
  actions: ParksAiQuickAction[];
  isLoading: boolean;
  ceoName?: string | null;
  onSelectAction: (action: ParksAiQuickAction) => void;
};

const VISUAL_ICON_BY_KEY: Record<ParksAiQuickActionVisual, IconComponent> = {
  briefing: IconSparkles,
  approvals: IconListCheck,
  risk: IconAlertTriangle,
  cash: IconReportMoney,
  pipeline: IconLayoutKanban,
};

const VISUAL_ACCENT_BY_KEY: Record<
  ParksAiQuickActionVisual,
  { background: string; border: string; icon: string }
> = {
  briefing: {
    background: PARKS_BRAND.primarySoft,
    border: PARKS_BRAND.borderSoft,
    icon: PARKS_BRAND.primary,
  },
  approvals: {
    background: themeCssVariables.color.orange2,
    border: themeCssVariables.color.orange6,
    icon: themeCssVariables.color.orange11,
  },
  risk: {
    background: themeCssVariables.color.red2,
    border: themeCssVariables.color.red6,
    icon: themeCssVariables.color.red11,
  },
  cash: {
    background: themeCssVariables.color.yellow2,
    border: themeCssVariables.color.yellow6,
    icon: themeCssVariables.color.yellow11,
  },
  pipeline: {
    background: themeCssVariables.color.blue2,
    border: themeCssVariables.color.blue6,
    icon: themeCssVariables.color.blue11,
  },
};

const StyledRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledHero = styled.div`
  background:
    radial-gradient(
      circle at 12% 20%,
      rgba(141, 198, 63, 0.28) 0%,
      transparent 42%
    ),
    linear-gradient(145deg, ${PARKS_BRAND.primary} 0%, #003d22 72%);
  border-radius: ${themeCssVariables.border.radius.xl};
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[4]};
  position: relative;
`;

const StyledHeroBadge = styled.span`
  align-items: center;
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: ${themeCssVariables.border.radius.pill};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: 6px;
  letter-spacing: 0.04em;
  padding: 4px 10px;
  text-transform: uppercase;
`;

const StyledHeroTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.25;
  margin: 0;
`;

const StyledHeroCopy = styled.p`
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  margin: 0;
  opacity: 0.92;
`;

const StyledHeroMetrics = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledHeroMetric = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledHeroMetricValue = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledHeroMetricLabel = styled.span`
  font-size: 10px;
  letter-spacing: 0.03em;
  opacity: 0.8;
  text-transform: uppercase;
`;

const StyledSectionLabel = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr;
`;

const StyledCard = styled.button<{
  $background: string;
  $border: string;
}>`
  align-items: flex-start;
  background: ${({ $background }) => $background};
  border: 1px solid ${({ $border }) => $border};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: auto 1fr;
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.light};
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
    transform: none;
  }
`;

const StyledIconBadge = styled.span<{ $color: string }>`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ $color }) => $color};
  display: inline-flex;
  height: 36px;
  justify-content: center;
  width: 36px;
`;

const StyledCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const StyledCardTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledCardDescription = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

export const ParksAiCeoSpotlight = ({
  actions,
  isLoading,
  ceoName,
  onSelectAction,
}: ParksAiCeoSpotlightProps) => (
  <StyledRoot>
    <StyledHero>
      <StyledHeroBadge>
        <IconChartBar size={12} />
        {t`IA · Dirección General`}
      </StyledHeroBadge>
      <StyledHeroTitle>
        {ceoName
          ? t`${ceoName}, tu copiloto ejecutivo`
          : t`Tu copiloto ejecutivo`}
      </StyledHeroTitle>
      <StyledHeroCopy>
        {t`Pregunta en lenguaje natural o toca una capacidad. La IA prioriza lo que requiere tu decisión: firmas, riesgos, cobranza y pulso comercial.`}
      </StyledHeroCopy>
      <StyledHeroMetrics>
        <StyledHeroMetric>
          <StyledHeroMetricValue>{t`60s`}</StyledHeroMetricValue>
          <StyledHeroMetricLabel>{t`Briefing`}</StyledHeroMetricLabel>
        </StyledHeroMetric>
        <StyledHeroMetric>
          <StyledHeroMetricValue>{t`1 inbox`}</StyledHeroMetricValue>
          <StyledHeroMetricLabel>{t`Decisiones`}</StyledHeroMetricLabel>
        </StyledHeroMetric>
        <StyledHeroMetric>
          <StyledHeroMetricValue>{t`Riesgo`}</StyledHeroMetricValue>
          <StyledHeroMetricLabel>{t`Antes del board`}</StyledHeroMetricLabel>
        </StyledHeroMetric>
      </StyledHeroMetrics>
    </StyledHero>

    <StyledSectionLabel>{t`Capacidades ejecutivas`}</StyledSectionLabel>
    <StyledGrid>
      {actions.map((action) => {
        const visual = action.visual ?? 'briefing';
        const Icon = VISUAL_ICON_BY_KEY[visual];
        const accent = VISUAL_ACCENT_BY_KEY[visual];

        return (
          <StyledCard
            key={action.id}
            type="button"
            disabled={isLoading}
            $background={accent.background}
            $border={accent.border}
            onClick={() => onSelectAction(action)}
          >
            <StyledIconBadge $color={accent.icon}>
              <Icon size={18} />
            </StyledIconBadge>
            <StyledCardBody>
              <StyledCardTitle>{action.label}</StyledCardTitle>
              {action.description ? (
                <StyledCardDescription>{action.description}</StyledCardDescription>
              ) : null}
            </StyledCardBody>
          </StyledCard>
        );
      })}
    </StyledGrid>
  </StyledRoot>
);
