import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowRight, type IconComponent } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  PARKS_BRAND,
  PARKS_COMMAND_CENTER,
  PARKS_VIBE,
} from '@/parks-industrial/constants/parks-theme.constants';
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

const heroTextMuted = PARKS_COMMAND_CENTER.textMuted;
const heroTextSecondary = PARKS_COMMAND_CENTER.textSecondary;

const StyledHero = styled.section`
  background: ${PARKS_COMMAND_CENTER.background};
  border: 1px solid ${PARKS_COMMAND_CENTER.panelBorder};
  border-radius: ${PARKS_VIBE.radiusLg};
  box-shadow: ${PARKS_COMMAND_CENTER.boxShadow};
  color: ${PARKS_COMMAND_CENTER.text};
  overflow: hidden;
  padding: ${PARKS_VIBE.space.xl};
  position: relative;

  &::before {
    background: ${PARKS_COMMAND_CENTER.accentBar};
    content: '';
    height: ${PARKS_VIBE.accentBarHeight};
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    padding: ${PARKS_VIBE.space.xxl};
  }
`;

const StyledGlowOrb = styled.div<{ top: string; left: string; size: string }>`
  background: ${PARKS_COMMAND_CENTER.glowOrb};
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
  gap: ${PARKS_VIBE.space.xl};
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
  gap: ${PARKS_VIBE.space.md};
`;

const StyledHeroBrand = styled.div`
  margin-bottom: ${PARKS_VIBE.space.xs};
`;

const StyledEyebrow = styled.div`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const StyledHeroTitle = styled.h2`
  color: ${PARKS_COMMAND_CENTER.text};
  font-size: clamp(1.65rem, 2.6vw, 2.1rem);
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin: 0;
`;

const StyledHeroSubtitle = styled.p`
  color: ${heroTextSecondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  margin: 0;
  max-width: 560px;
`;

const StyledHeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${PARKS_VIBE.space.sm};
  margin-top: ${PARKS_VIBE.space.xs};
`;

const StyledHeroAction = styled(Link)`
  align-items: center;
  background: ${PARKS_COMMAND_CENTER.actionBackground};
  border: 1px solid ${PARKS_COMMAND_CENTER.actionBorder};
  border-radius: ${PARKS_VIBE.radiusSm};
  color: ${PARKS_COMMAND_CENTER.actionText};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 6px;
  padding: 8px 14px;
  text-decoration: none;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background: ${PARKS_COMMAND_CENTER.actionHoverBackground};
    box-shadow: ${PARKS_VIBE.shadowSoft};
    transform: translateY(-1px);
  }
`;

const StyledSidePanel = styled.div`
  background: ${PARKS_COMMAND_CENTER.panelBackground};
  border: 1px solid ${PARKS_COMMAND_CENTER.panelBorder};
  border-radius: ${PARKS_VIBE.radiusMd};
  box-shadow: ${PARKS_VIBE.shadowSoft};
  padding: ${PARKS_VIBE.space.lg};
`;

const StyledStatsRow = styled.div`
  display: grid;
  gap: ${PARKS_VIBE.space.md};
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: ${PARKS_VIBE.space.xl};
  position: relative;
  z-index: 1;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const StyledStatCard = styled.div`
  background: ${PARKS_VIBE.surface};
  border: 1px solid ${PARKS_COMMAND_CENTER.panelBorder};
  border-radius: ${PARKS_VIBE.radiusSm};
  box-shadow: ${PARKS_VIBE.shadowSoft};
  padding: ${PARKS_VIBE.space.md};
`;

const StyledStatLabel = styled.div`
  color: ${heroTextMuted};
  font-size: ${themeCssVariables.font.size.xs};
  letter-spacing: 0.02em;
`;

const StyledStatValue = styled.div`
  color: ${PARKS_COMMAND_CENTER.text};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-top: 6px;
`;

const StyledStatHint = styled.div`
  color: ${PARKS_COMMAND_CENTER.statHint};
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
          <ParksBrandLogo variant="green" height={32} />
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
