import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowRight, type IconComponent } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { ParksBrandLogo } from '@/parks-industrial/components/ui/ParksBrandLogo';

export type ParksPageHeroAction = {
  to: string;
  label: string;
  icon?: IconComponent;
};

export type ParksPageHeroStat = {
  label: string;
  value: string;
  hint?: string;
};

type ParksPageHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions?: ParksPageHeroAction[];
  stats?: ParksPageHeroStat[];
  sideContent?: ReactNode;
};

const heroTextMuted = `color-mix(in srgb, ${themeCssVariables.font.color.inverted} 72%, transparent)`;
const heroTextSecondary = `color-mix(in srgb, ${themeCssVariables.font.color.inverted} 86%, transparent)`;

const StyledHero = styled.section`
  background: linear-gradient(
    128deg,
    ${themeCssVariables.color.green12} 0%,
    ${PARKS_BRAND.primary} 38%,
    ${themeCssVariables.color.green11} 72%,
    ${PARKS_BRAND.accentSoft} 100%
  );
  border-radius: ${themeCssVariables.border.radius.xl};
  box-shadow:
    0 24px 48px ${themeCssVariables.color.green3},
    inset 0 1px 0 ${themeCssVariables.background.transparent.primary};
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
    ${PARKS_BRAND.accentSoft} 0%,
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

const StyledHeroGrid = styled.div<{ hasSide: boolean }>`
  display: grid;
  gap: ${themeCssVariables.spacing[5]};
  position: relative;
  z-index: 1;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    align-items: center;
    grid-template-columns: ${({ hasSide }) =>
      hasSide ? '1.15fr 0.85fr' : '1fr'};
  }
`;

const StyledHeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledHeroBrand = styled.div`
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledEyebrow = styled.div`
  color: ${heroTextMuted};
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
  color: ${heroTextSecondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.55;
  margin: 0;
  max-width: 560px;
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
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.background.transparent.medium};
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
    background: ${themeCssVariables.background.transparent.primary};
    transform: translateY(-1px);
  }
`;

const StyledSidePanel = styled.div`
  backdrop-filter: blur(12px);
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.background.transparent.medium};
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
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.background.transparent.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledStatLabel = styled.div`
  color: ${heroTextMuted};
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

export const ParksPageHero = ({
  eyebrow,
  title,
  subtitle,
  actions,
  stats,
  sideContent,
}: ParksPageHeroProps) => (
  <StyledHero>
    <StyledGlowOrb top="-40%" left="55%" size="420px" />
    <StyledGlowOrb top="20%" left="-15%" size="280px" />

    <StyledHeroGrid hasSide={isDefined(sideContent)}>
      <StyledHeroCopy>
        <StyledHeroBrand>
          <ParksBrandLogo variant="onDark" height={32} />
        </StyledHeroBrand>
        <StyledEyebrow>{eyebrow}</StyledEyebrow>
        <StyledHeroTitle>{title}</StyledHeroTitle>
        <StyledHeroSubtitle>{subtitle}</StyledHeroSubtitle>
        {actions && actions.length > 0 ? (
          <StyledHeroActions>
            {actions.map((action) => {
              const ActionIcon = action.icon;

              return (
                <StyledHeroAction key={action.to} to={action.to}>
                  {ActionIcon ? <ActionIcon size={16} /> : null}
                  {action.label}
                  <IconArrowRight size={14} />
                </StyledHeroAction>
              );
            })}
          </StyledHeroActions>
        ) : null}
      </StyledHeroCopy>

      {isDefined(sideContent) ? (
        <StyledSidePanel>{sideContent}</StyledSidePanel>
      ) : null}
    </StyledHeroGrid>

    {stats && stats.length > 0 ? (
      <StyledStatsRow>
        {stats.map((stat) => (
          <StyledStatCard key={stat.label}>
            <StyledStatLabel>{stat.label}</StyledStatLabel>
            <StyledStatValue>{stat.value}</StyledStatValue>
            {stat.hint ? <StyledStatHint>{stat.hint}</StyledStatHint> : null}
          </StyledStatCard>
        ))}
      </StyledStatsRow>
    ) : null}
  </StyledHero>
);
