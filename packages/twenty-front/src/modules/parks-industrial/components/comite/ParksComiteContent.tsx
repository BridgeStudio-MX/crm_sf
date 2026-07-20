import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IconAlertTriangle,
  IconBrain,
  IconBriefcase,
  IconBuildingWarehouse,
  IconCheck,
  IconClock,
  IconHistory,
  IconLayout,
  IconMinus,
  IconShield,
  IconUser,
  IconX,
  type IconComponent,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import {
  ParksSectionCard,
  StyledParksPageStack,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { ParksComitePlanoModal } from '@/parks-industrial/components/comite/ParksComitePlanoModal';
import {
  StyledParksTextarea,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import { PARKS_LEGAL_PIPELINE_PATH } from '@/parks-industrial/constants/parks-routes.constants';
import { ParksRoleLabel } from '@/parks-industrial/constants/parks-role-access.constants';
import {
  type ParksVisualAccent,
  PARKS_BRAND,
  PARKS_VIBE,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import {
  answerParksComiteQuestion,
  askParksComiteQuestion,
  decideParksComiteAsCeo,
  fetchParksComiteById,
  fetchParksComiteList,
  voteParksComite,
} from '@/parks-industrial/services/parks-comite.client';
import {
  type ComiteAutorizacion,
  type ComiteListSummary,
  type ComiteVotoValor,
} from '@/parks-industrial/types/parks-comite.types';
import {
  formatComiteCurrency,
  getComiteEstatusAccent,
  getComiteFlagSeveridadAccent,
  getComiteSemaforoAccent,
  getComiteTrackerHint,
  getComiteVotoAccent,
  getHoursUntil,
  parseComiteAuditoriaLine,
} from '@/parks-industrial/utils/parks-comite-format.util';
import {
  formatParksDate,
  formatParksNumber,
} from '@/parks-industrial/utils/parks-format.util';

const StyledLayout = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  max-height: 72vh;
  overflow-y: auto;
  padding-right: 2px;
`;

const StyledListCard = styled.button<{
  isActive: boolean;
  accent: ParksVisualAccent;
}>`
  background: ${({ isActive, accent }) =>
    isActive
      ? PARKS_VISUAL_THEME.accents[accent].backgroundGradient
      : themeCssVariables.background.primary};
  border: 1px solid
    ${({ isActive, accent }) =>
      isActive
        ? PARKS_VISUAL_THEME.accents[accent].border
        : themeCssVariables.border.color.medium};
  border-left: 4px solid
    ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${({ isActive }) =>
    isActive
      ? themeCssVariables.boxShadow.light
      : 'none'};
  color: inherit;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font: inherit;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.light};
    transform: translateY(-1px);
  }
`;

const StyledListTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.35;
`;

const StyledListMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledListFooter = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledVoteDots = styled.div`
  display: flex;
  gap: 4px;
`;

const StyledVoteDot = styled.span<{ accent: ParksVisualAccent }>`
  background: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
  border-radius: 50%;
  height: 8px;
  opacity: ${({ accent }) => (accent === 'yellow' ? 0.55 : 1)};
  width: 8px;
`;

const StyledDetail = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeroStrip = styled.div`
  background: linear-gradient(
    145deg,
    ${PARKS_BRAND.primarySoft} 0%,
    ${themeCssVariables.background.primary} 68%
  );
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeroTop = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
`;

const StyledEyebrow = styled.div`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const StyledTitle = styled.h2`
  color: ${themeCssVariables.font.color.primary};
  font-size: clamp(1.15rem, 2vw, 1.45rem);
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.02em;
  line-height: 1.25;
  margin: ${themeCssVariables.spacing[1]} 0 0;
`;

const StyledMeta = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: ${themeCssVariables.spacing[1]} 0 0;
`;

const StyledBadges = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCountdown = styled.div<{ urgent: boolean }>`
  align-items: center;
  background: ${({ urgent }) =>
    urgent
      ? PARKS_VISUAL_THEME.accents.orange.background
      : PARKS_VISUAL_THEME.accents.blue.background};
  border: 1px solid
    ${({ urgent }) =>
      urgent
        ? PARKS_VISUAL_THEME.accents.orange.border
        : PARKS_VISUAL_THEME.accents.blue.border};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ urgent }) =>
    urgent
      ? PARKS_VISUAL_THEME.accents.orange.accent
      : PARKS_VISUAL_THEME.accents.blue.accent};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: 6px;
  padding: 6px 12px;
  white-space: nowrap;
`;

const StyledIdentityRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const StyledIdentityChip = styled.div`
  align-items: flex-start;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledIdentityIcon = styled.span`
  align-items: center;
  background: ${PARKS_BRAND.primarySoft};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${PARKS_BRAND.primary};
  display: inline-flex;
  flex-shrink: 0;
  height: 28px;
  justify-content: center;
  margin-top: 1px;
  width: 28px;
`;

const StyledIdentityLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledIdentityValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledHeroDealGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
`;

const StyledDealTile = styled.div<{ wide?: boolean }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: 4px;
  grid-column: ${({ wide }) => (wide ? '1 / -1' : 'auto')};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledDealLabel = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledDealValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.01em;
  line-height: 1.35;
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledHeroActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPlanoButton = styled.button`
  align-items: center;
  align-self: flex-start;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: ${PARKS_VIBE.shadowSoft};
  color: ${PARKS_BRAND.primary};
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  min-height: 40px;
  padding: 0 ${themeCssVariables.spacing[3]};
  transition:
    background 120ms ease,
    border-color 120ms ease,
    box-shadow 120ms ease;

  &:hover {
    background: ${PARKS_BRAND.primarySoft};
    border-color: ${PARKS_BRAND.primary};
    box-shadow: ${PARKS_VIBE.shadowCard};
  }
`;

const StyledTrackerHint = styled.div`
  background: ${PARKS_BRAND.primarySoft};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledVoteRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledVoteCard = styled.div<{ accent: ParksVisualAccent }>`
  background: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[accent].backgroundGradient};
  border: 1px solid ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].border};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
  position: relative;

  &::before {
    background: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
    border-radius: ${themeCssVariables.border.radius.pill};
    content: '';
    height: 3px;
    left: ${themeCssVariables.spacing[3]};
    position: absolute;
    right: ${themeCssVariables.spacing[3]};
    top: 0;
  }
`;

const StyledVoteName = styled.strong`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledVoteRole = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledVoteComment = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-style: italic;
  line-height: 1.4;
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledError = styled.p`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledQuestion = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[3]};

  &:first-of-type {
    border-top: none;
    padding-top: 0;
  }
`;

const StyledQuestionAuthor = styled.strong`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledAnswerBox = styled.div`
  background: ${PARKS_VISUAL_THEME.accents.green.background};
  border: 1px solid ${PARKS_VISUAL_THEME.accents.green.border};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledSeatHint = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledVotePriorityPanel = styled.div<{ accent: ParksVisualAccent }>`
  background: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[accent].backgroundGradient};
  border: 2px solid ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
  border-radius: ${PARKS_VIBE.radiusMd};
  box-shadow: ${PARKS_VIBE.shadowHover};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
  position: sticky;
  top: ${themeCssVariables.spacing[2]};
  z-index: 2;
`;

const StyledVotePriorityHeader = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledVotePriorityTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.02em;
  margin: 0;
`;

const StyledVotePriorityEyebrow = styled.div`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.08em;
  margin-bottom: 4px;
  text-transform: uppercase;
`;

const StyledVotePriorityActions = styled.div<{ columns: 2 | 3 }>`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(
    ${({ columns }) => columns},
    minmax(0, 1fr)
  );

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledVoteDecisionButton = styled.button<{
  tone: 'approve' | 'reject' | 'abstain';
}>`
  align-items: center;
  border-radius: ${PARKS_VIBE.radiusMd};
  border-style: solid;
  border-width: 2px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-family: inherit;
  gap: 6px;
  justify-content: center;
  min-height: 88px;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
  transition:
    background 140ms ease,
    border-color 140ms ease,
    box-shadow 140ms ease,
    transform 140ms ease;
  width: 100%;

  ${({ tone }) => {
    if (tone === 'approve') {
      return `
        background: ${PARKS_BRAND.primary};
        border-color: ${PARKS_BRAND.primary};
        box-shadow: 0 8px 18px rgba(0, 104, 55, 0.28);
        color: #ffffff;

        &:hover:not(:disabled) {
          background: #005a2f;
          border-color: #005a2f;
          box-shadow: 0 10px 22px rgba(0, 104, 55, 0.34);
          transform: translateY(-1px);
        }
      `;
    }

    if (tone === 'reject') {
      return `
        background: ${PARKS_VISUAL_THEME.accents.red.background};
        border-color: ${PARKS_VISUAL_THEME.accents.red.accent};
        box-shadow: 0 6px 14px rgba(180, 35, 24, 0.12);
        color: ${PARKS_VISUAL_THEME.accents.red.accent};

        &:hover:not(:disabled) {
          background: ${themeCssVariables.color.red3};
          box-shadow: 0 8px 18px rgba(180, 35, 24, 0.18);
          transform: translateY(-1px);
        }
      `;
    }

    return `
      background: ${themeCssVariables.background.primary};
      border-color: ${PARKS_VIBE.borderStrong};
      box-shadow: ${PARKS_VIBE.shadowSoft};
      color: ${PARKS_VIBE.textSecondary};

      &:hover:not(:disabled) {
        background: ${PARKS_VIBE.surfaceMuted};
        border-color: ${PARKS_VIBE.textMuted};
        color: ${PARKS_VIBE.textPrimary};
        transform: translateY(-1px);
      }
    `;
  }}

  &:disabled {
    box-shadow: none;
    cursor: not-allowed;
    opacity: 0.45;
    transform: none;
  }

  &:focus-visible {
    outline: 2px solid ${PARKS_BRAND.accent};
    outline-offset: 2px;
  }
`;

const StyledVoteDecisionIcon = styled.span`
  align-items: center;
  display: inline-flex;
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const StyledVoteDecisionLabel = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.01em;
  line-height: 1.2;
`;

const StyledVoteDecisionHint = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.02em;
  line-height: 1.2;
  opacity: 0.85;
  text-transform: uppercase;
`;

type VoteDecisionButtonProps = {
  tone: 'approve' | 'reject' | 'abstain';
  label: string;
  hint: string;
  Icon: IconComponent;
  disabled?: boolean;
  onClick: () => void;
};

const VoteDecisionButton = ({
  tone,
  label,
  hint,
  Icon,
  disabled = false,
  onClick,
}: VoteDecisionButtonProps) => (
  <StyledVoteDecisionButton
    type="button"
    tone={tone}
    disabled={disabled}
    onClick={onClick}
  >
    <StyledVoteDecisionIcon>
      <Icon size={22} stroke={2.25} />
    </StyledVoteDecisionIcon>
    <StyledVoteDecisionLabel>{label}</StyledVoteDecisionLabel>
    <StyledVoteDecisionHint>{hint}</StyledVoteDecisionHint>
  </StyledVoteDecisionButton>
);

const StyledFlagList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFlagRow = styled.div<{ accent: ParksVisualAccent }>`
  align-items: flex-start;
  background: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].background};
  border: 1px solid ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].border};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledFlagIcon = styled.div<{ accent: ParksVisualAccent }>`
  align-items: center;
  color: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
  display: flex;
  flex-shrink: 0;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const StyledFlagBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px;
`;

const StyledFlagHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledFlagTitle = styled.strong`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledFlagDetail = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledIaSummary = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledAuditList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledAuditItem = styled.li`
  border-left: 2px solid ${PARKS_VISUAL_THEME.accents.gray.border};
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: ${themeCssVariables.spacing[3]};
  position: relative;

  &::before {
    background: ${PARKS_VISUAL_THEME.accents.blue.accent};
    border-radius: ${themeCssVariables.border.radius.rounded};
    content: '';
    height: 8px;
    left: -5px;
    position: absolute;
    top: 4px;
    width: 8px;
  }
`;

const StyledAuditTime = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-variant-numeric: tabular-nums;
`;

const StyledAuditMessage = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
`;

const StyledFieldBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledFieldLabel = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const votoLabel = (voto: ComiteVotoValor): string => {
  switch (voto) {
    case 'Aprueba':
      return t`Aprueba`;
    case 'Rechaza':
      return t`Rechaza`;
    case 'Se abstiene':
      return t`Se abstiene`;
    case 'Pendiente':
      return t`Pendiente`;
  }
};

const shortenEstatus = (estatus: ComiteAutorizacion['estatus']): string => {
  if (estatus.startsWith('Abierto')) {
    return t`En deliberación`;
  }

  if (estatus.startsWith('Resuelto — Aprobado')) {
    return t`Aprobado`;
  }

  if (estatus.startsWith('Resuelto — Rechazado')) {
    return t`Rechazado`;
  }

  if (estatus.startsWith('Cancelado')) {
    return t`Cancelado`;
  }

  if (estatus.startsWith('Vencido')) {
    return t`Escalado CEO`;
  }

  return estatus;
};

export const ParksComiteContent = () => {
  const { comiteId: routeComiteId } = useParams<{ comiteId?: string }>();
  const { userEmail, displayName, parksRoleLabels } = useParksAccess();
  const viewerEmail = userEmail?.toLowerCase() ?? '';
  // Email fallback: workspace role labels can lag behind demo login mapping
  const isCeo =
    parksRoleLabels.includes(ParksRoleLabel.CEO) ||
    viewerEmail === 'jony.ive@apple.dev';
  const [loading, setLoading] = useState(true);
  const [comites, setComites] = useState<ComiteAutorizacion[]>([]);
  const [summary, setSummary] = useState<ComiteListSummary | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    routeComiteId ?? null,
  );
  const [selected, setSelected] = useState<ComiteAutorizacion | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [comentario, setComentario] = useState('');
  const [preguntaTexto, setPreguntaTexto] = useState('');
  const [respuestaTexto, setRespuestaTexto] = useState('');
  const [ceoComentario, setCeoComentario] = useState('');
  const [isPlanoOpen, setIsPlanoOpen] = useState(false);

  const refreshList = useCallback(async () => {
    const result = await fetchParksComiteList(viewerEmail || undefined);
    setComites(result.comites);
    setSummary(result.summary);
    return result.comites;
  }, [viewerEmail]);

  const loadSelected = useCallback(async (comiteId: string) => {
    const detail = await fetchParksComiteById(comiteId);
    setSelected(detail);
    setSelectedId(detail.id);
    return detail;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const list = await refreshList();
        const escalatedForCeo = list.find(
          (comite) => comite.resolucion === 'Empate — escalar',
        );
        // CEO demo: open the empate case first so Aprobar / Rechazar is visible
        const initialId =
          routeComiteId ??
          (isCeo ? escalatedForCeo?.id : undefined) ??
          list[0]?.id;

        if (initialId && !cancelled) {
          await loadSelected(initialId);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : t`No se pudo cargar el comité`,
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, [isCeo, loadSelected, refreshList, routeComiteId, viewerEmail]);

  const mySeat = useMemo(() => {
    if (!selected || !viewerEmail) {
      return null;
    }

    return (
      selected.miembros.find(
        (member) => member.email.toLowerCase() === viewerEmail,
      ) ?? null
    );
  }, [selected, viewerEmail]);

  const canVote =
    Boolean(mySeat) &&
    mySeat?.voto === 'Pendiente' &&
    selected?.estatus === 'Abierto — en deliberación';

  const canCeoDecide =
    isCeo && selected?.resolucion === 'Empate — escalar';

  const hoursRemaining = selected
    ? getHoursUntil(selected.fechaLimiteResolucion)
    : 0;
  const isUrgent =
    selected?.estatus === 'Abierto — en deliberación' && hoursRemaining <= 8;

  const handleSelect = async (comiteId: string) => {
    setBusy(true);
    setErrorMessage(null);
    setComentario('');
    setPreguntaTexto('');
    setRespuestaTexto('');
    setCeoComentario('');
    setIsPlanoOpen(false);

    try {
      await loadSelected(comiteId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`No se pudo abrir el comité`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleVote = async (voto: Exclude<ComiteVotoValor, 'Pendiente'>) => {
    if (!selected || !mySeat) {
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      const updated = await voteParksComite({
        comiteId: selected.id,
        memberId: mySeat.memberId,
        voto,
        comentario: comentario.trim() || undefined,
        viewerEmail: viewerEmail || undefined,
      });
      setSelected(updated);
      setComentario('');
      await refreshList();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`No se pudo registrar el voto`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCeoDecision = async (decision: 'Aprueba' | 'Rechaza') => {
    if (!selected || !canCeoDecide) {
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      const updated = await decideParksComiteAsCeo({
        comiteId: selected.id,
        decision,
        comentario: ceoComentario.trim() || undefined,
        viewerEmail: viewerEmail || undefined,
        viewerNombre: displayName || undefined,
      });
      setSelected(updated);
      setCeoComentario('');
      await refreshList();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`No se pudo registrar la decisión del CEO`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleAsk = async () => {
    if (!selected || !mySeat || !preguntaTexto.trim()) {
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      const updated = await askParksComiteQuestion({
        comiteId: selected.id,
        memberId: mySeat.memberId,
        preguntaTexto,
      });
      setSelected(updated);
      setPreguntaTexto('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`No se pudo enviar la pregunta`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleAnswer = async (preguntaId: string) => {
    if (!selected || !respuestaTexto.trim()) {
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      const updated = await answerParksComiteQuestion({
        comiteId: selected.id,
        preguntaId,
        respuestaTexto,
        respuestaPorNombre:
          displayName || userEmail || selected.leasingOfficerNombre,
      });
      setSelected(updated);
      setRespuestaTexto('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`No se pudo responder la pregunta`,
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  if (comites.length === 0) {
    return (
      <StyledParksPageStack>
        <ParksPageHero
          eyebrow={t`Parks Industrial · Gobernanza`}
          title={t`Comité de Autorización`}
          subtitle={t`Cuando una Hoja de Acuerdos quede firmada por CEM y cliente, el caso se abrirá aquí para votación.`}
        />
        <ParksEmptyState
          title={t`No hay comités`}
          description={t`Cuando una Hoja de Acuerdos quede firmada por CEM y cliente, se abrirá aquí.`}
        />
      </StyledParksPageStack>
    );
  }

  return (
    <StyledParksPageStack>
      <ParksPageHero
        eyebrow={t`Parks Industrial · Gobernanza`}
        title={t`Comité de Autorización`}
        subtitle={t`Tres miembros, mayoría simple. Solo deals con GLA mayor a 20,000 m². Gate entre Hoja firmada y pipeline Legal.`}
        actions={[
          {
            to: PARKS_LEGAL_PIPELINE_PATH,
            label: t`Pipeline Legal`,
            icon: IconBriefcase,
          },
        ]}
        stats={
          summary
            ? [
                {
                  label: isCeo ? t`Pendientes CEO` : t`Mis pendientes`,
                  value: String(
                    isCeo
                      ? summary.tiedCount
                      : summary.pendingVotesForViewer,
                  ),
                  hint: isCeo
                    ? t`Empates por tu voto`
                    : t`Requieren tu voto`,
                },
                {
                  label: t`En deliberación`,
                  value: String(summary.openCount),
                  hint: t`Abiertos ahora`,
                },
                {
                  label: t`Aprobados`,
                  value: String(summary.approvedCount),
                  hint: t`Resueltos a favor`,
                },
                {
                  label: t`Rechazados`,
                  value: String(summary.rejectedCount),
                  hint: t`Bloqueados`,
                },
              ]
            : undefined
        }
      />

      <StyledLayout>
        <ParksSectionCard title={t`Casos del comité`} accent="green">
          <StyledList>
            {comites.map((comite) => {
              const needsCeoVote = comite.resolucion === 'Empate — escalar';
              const estatusAccent = needsCeoVote
                ? 'orange'
                : getComiteEstatusAccent(comite.estatus);

              return (
                <StyledListCard
                  key={comite.id}
                  type="button"
                  isActive={selectedId === comite.id}
                  accent={estatusAccent}
                  onClick={() => void handleSelect(comite.id)}
                >
                  <StyledListTitle>
                    {comite.deal.clienteRazonSocial}
                  </StyledListTitle>
                  <StyledListMeta>
                    {comite.referencia} · {comite.deal.naveNomenclatura}
                  </StyledListMeta>
                  <StyledListFooter>
                    <ParksStatusBadge
                      color={estatusAccent}
                      label={
                        needsCeoVote
                          ? t`Tu voto CEO`
                          : shortenEstatus(comite.estatus)
                      }
                    />
                    <StyledVoteDots aria-hidden>
                      {comite.miembros.map((member) => (
                        <StyledVoteDot
                          key={member.memberId}
                          accent={getComiteVotoAccent(member.voto)}
                          title={`${member.nombre}: ${votoLabel(member.voto)}`}
                        />
                      ))}
                    </StyledVoteDots>
                  </StyledListFooter>
                </StyledListCard>
              );
            })}
          </StyledList>
        </ParksSectionCard>

        {selected ? (
          <StyledDetail>
            <StyledHeroStrip>
              <StyledHeroTop>
                <div>
                  <StyledEyebrow>
                    {t`Comité`} · {selected.referencia}
                  </StyledEyebrow>
                  <StyledTitle>{selected.deal.clienteRazonSocial}</StyledTitle>
                  <StyledMeta>
                    {selected.deal.clienteGiro} · {selected.deal.parqueNombre}
                  </StyledMeta>
                </div>
                <StyledBadges>
                  <ParksStatusBadge
                    color={getComiteEstatusAccent(selected.estatus)}
                    label={shortenEstatus(selected.estatus)}
                  />
                  <ParksStatusBadge
                    color={getComiteSemaforoAccent(
                      selected.deal.semaforoPrecio,
                    )}
                    label={`${selected.deal.semaforoPrecio} −${selected.deal.descuentoPorcentaje}%`}
                  />
                  {selected.flagsIaAtipicas.length > 0 ? (
                    <ParksStatusBadge
                      color={
                        selected.flagsIaAtipicas.some(
                          (flag) => flag.severidad === 'Alta',
                        )
                          ? 'red'
                          : 'orange'
                      }
                      label={t`IA · ${selected.flagsIaAtipicas.length} atípicas`}
                    />
                  ) : (
                    <ParksStatusBadge
                      color="green"
                      label={t`IA · sin atípicas`}
                    />
                  )}
                  {selected.resolucion === 'Empate — escalar' ? (
                    <ParksStatusBadge
                      color="orange"
                      label={t`Requiere CEO`}
                    />
                  ) : null}
                  {selected.estatus === 'Abierto — en deliberación' ? (
                    <StyledCountdown urgent={isUrgent}>
                      <IconClock size={14} />
                      {t`Vence en ${hoursRemaining}h`}
                    </StyledCountdown>
                  ) : (
                    <StyledCountdown urgent={false}>
                      {selected.resolucion}
                    </StyledCountdown>
                  )}
                </StyledBadges>
              </StyledHeroTop>

              <StyledIdentityRow>
                <StyledIdentityChip>
                  <StyledIdentityIcon>
                    <IconBuildingWarehouse size={14} />
                  </StyledIdentityIcon>
                  <div>
                    <StyledIdentityLabel>{t`Nave`}</StyledIdentityLabel>
                    <StyledIdentityValue>
                      {selected.deal.naveNomenclatura}
                    </StyledIdentityValue>
                  </div>
                </StyledIdentityChip>
                <StyledIdentityChip>
                  <StyledIdentityIcon>
                    <IconUser size={14} />
                  </StyledIdentityIcon>
                  <div>
                    <StyledIdentityLabel>{t`Presentado por`}</StyledIdentityLabel>
                    <StyledIdentityValue>
                      {selected.leasingOfficerNombre}
                    </StyledIdentityValue>
                  </div>
                </StyledIdentityChip>
                <StyledIdentityChip>
                  <StyledIdentityIcon>
                    <IconShield size={14} />
                  </StyledIdentityIcon>
                  <div>
                    <StyledIdentityLabel>{t`CEM firmante`}</StyledIdentityLabel>
                    <StyledIdentityValue>
                      {selected.cemQueFirmoNombre}
                    </StyledIdentityValue>
                  </div>
                </StyledIdentityChip>
              </StyledIdentityRow>

              <StyledHeroDealGrid>
                <StyledDealTile>
                  <StyledDealLabel>{t`Portafolio`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.portafolio || '—'}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Fecha comité`}</StyledDealLabel>
                  <StyledDealValue>
                    {formatParksDate(selected.fechaCreacion)}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Parque industrial`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.parqueNombre}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Nomenclatura`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.naveNomenclatura}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Pisos`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.pisos || '—'}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Nombre del comercio`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.nombreComercio}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Razón social`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.clienteRazonSocial}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Giro / Subgiro`}</StyledDealLabel>
                  <StyledDealValue>{selected.deal.clienteGiro}</StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`GLA (cliente)`}</StyledDealLabel>
                  <StyledDealValue>
                    {formatParksNumber(selected.deal.glaClienteM2)} m²
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`GLA (local)`}</StyledDealLabel>
                  <StyledDealValue>
                    {formatParksNumber(selected.deal.glaM2)} m²
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Costo por m²`}</StyledDealLabel>
                  <StyledDealValue>
                    {formatComiteCurrency(
                      selected.deal.precioAcordadoM2,
                      selected.deal.moneda,
                    )}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Precio en lista`}</StyledDealLabel>
                  <StyledDealValue>
                    {formatComiteCurrency(
                      selected.deal.precioListaM2,
                      selected.deal.moneda,
                    )}
                    /m²
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Renta mensual`}</StyledDealLabel>
                  <StyledDealValue>
                    {formatComiteCurrency(
                      selected.deal.rentaMensual,
                      selected.deal.moneda,
                    )}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`% Renta variable`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.rentaVariablePct == null
                      ? '—'
                      : `${selected.deal.rentaVariablePct}%`}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Mantenimiento pactado`}</StyledDealLabel>
                  <StyledDealValue>
                    {formatComiteCurrency(
                      selected.deal.mantenimientoPactado,
                      selected.deal.moneda,
                    )}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`% de incremento`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.incrementoTipo === 'INPC'
                      ? 'INPC'
                      : `${selected.deal.incrementoValor}%`}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Moneda`}</StyledDealLabel>
                  <StyledDealValue>{selected.deal.moneda}</StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Plazo forzoso`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.plazoMeses} {t`meses`}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Prórroga`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.prorrogaMeses > 0
                      ? `${selected.deal.prorrogaMeses} ${t`meses`}`
                      : '—'}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Guante pactado`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.guantePactado > 0
                      ? formatComiteCurrency(
                          selected.deal.guantePactado,
                          selected.deal.moneda,
                        )
                      : '—'}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Depósitos en garantía`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.depositosGarantiaMeses} {t`meses`}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Rentas adelantadas`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.rentasAdelantadasMeses} {t`meses`}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Período de gracia`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.periodoGraciaMeses} {t`meses`}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Adeudo sin IVA`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.adeudoSinIva == null
                      ? '—'
                      : formatComiteCurrency(
                          selected.deal.adeudoSinIva,
                          selected.deal.moneda,
                        )}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Broker`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.brokerNombre} ·{' '}
                    {selected.deal.brokerClasificacion}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>{t`Nº giros operando`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.numeroGirosOperando == null
                      ? '—'
                      : String(selected.deal.numeroGirosOperando)}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile>
                  <StyledDealLabel>
                    {t`Costo locatario anterior`}
                  </StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.rentaContratoAnterior == null
                      ? '—'
                      : `${formatComiteCurrency(
                          selected.deal.rentaContratoAnterior,
                          selected.deal.moneda,
                        )}/m²`}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile wide>
                  <StyledDealLabel>{t`Cotización`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.cotizacionReferencia || '—'}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile wide>
                  <StyledDealLabel>{t`Condiciones especiales`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.condicionesEspeciales || '—'}
                  </StyledDealValue>
                </StyledDealTile>
                <StyledDealTile wide>
                  <StyledDealLabel>{t`Observaciones`}</StyledDealLabel>
                  <StyledDealValue>
                    {selected.deal.observacionesEntregaNave || '—'}
                  </StyledDealValue>
                </StyledDealTile>
              </StyledHeroDealGrid>

              <StyledHeroActions>
                <StyledPlanoButton
                  type="button"
                  onClick={() => setIsPlanoOpen(true)}
                >
                  <IconLayout size={16} />
                  {t`Ver plano de la nave`}
                </StyledPlanoButton>
                <ParksStatusBadge
                  color={
                    selected.deal.clienteAdeudosActivos ? 'red' : 'green'
                  }
                  label={
                    selected.deal.clienteAdeudosActivos
                      ? t`Adeudos activos`
                      : t`Sin adeudos`
                  }
                />
                <ParksStatusBadge
                  color={selected.deal.esPropiedadFuno ? 'orange' : 'gray'}
                  label={
                    selected.deal.esPropiedadFuno
                      ? t`Propiedad FUNO`
                      : t`Propiedad propia`
                  }
                />
              </StyledHeroActions>
            </StyledHeroStrip>

            {selected.estatus === 'Abierto — en deliberación' && mySeat ? (
              <StyledVotePriorityPanel accent="green">
                <StyledVotePriorityHeader>
                  <div>
                    <StyledVotePriorityEyebrow>
                      {t`Acción requerida`}
                    </StyledVotePriorityEyebrow>
                    <StyledVotePriorityTitle>
                      {t`Tu voto`}
                    </StyledVotePriorityTitle>
                  </div>
                  <ParksStatusBadge
                    color={getComiteVotoAccent(mySeat.voto)}
                    label={
                      mySeat.voto === 'Pendiente'
                        ? t`Pendiente de votar`
                        : votoLabel(mySeat.voto)
                    }
                  />
                </StyledVotePriorityHeader>
                <StyledSeatHint style={{ marginBottom: 0 }}>
                  {t`Asiento`}: {mySeat.nombre} · {mySeat.rolEtiqueta}
                  {mySeat.voto !== 'Pendiente'
                    ? ` · ${t`Ya votaste`}: ${votoLabel(mySeat.voto)}`
                    : ` · ${t`Decide primero; el resto del expediente queda abajo.`}`}
                </StyledSeatHint>
                <StyledFieldBlock style={{ marginTop: 0 }}>
                  <StyledFieldLabel>
                    {t`Comentarios (obligatorio si rechazas)`}
                  </StyledFieldLabel>
                  <StyledParksTextarea
                    rows={3}
                    value={comentario}
                    onChange={(event) => setComentario(event.target.value)}
                    placeholder={t`Agrega contexto para el resto del comité…`}
                    disabled={!canVote}
                  />
                </StyledFieldBlock>
                <StyledVotePriorityActions columns={3}>
                  <VoteDecisionButton
                    tone="approve"
                    label={t`Aprobar`}
                    hint={t`A favor`}
                    Icon={IconCheck}
                    disabled={busy || !canVote}
                    onClick={() => void handleVote('Aprueba')}
                  />
                  <VoteDecisionButton
                    tone="reject"
                    label={t`Rechazar`}
                    hint={t`En contra`}
                    Icon={IconX}
                    disabled={busy || !canVote}
                    onClick={() => void handleVote('Rechaza')}
                  />
                  <VoteDecisionButton
                    tone="abstain"
                    label={t`Abstenerme`}
                    hint={t`Sin postura`}
                    Icon={IconMinus}
                    disabled={busy || !canVote}
                    onClick={() => void handleVote('Se abstiene')}
                  />
                </StyledVotePriorityActions>
                <StyledFieldBlock>
                  <StyledFieldLabel>
                    {t`Hacer una pregunta (no bloquea el voto)`}
                  </StyledFieldLabel>
                  <StyledParksTextarea
                    rows={2}
                    value={preguntaTexto}
                    onChange={(event) => setPreguntaTexto(event.target.value)}
                    placeholder={t`Pregunta al LO / CEM`}
                  />
                  <Button
                    title={t`Enviar pregunta`}
                    size="small"
                    variant="secondary"
                    disabled={busy || !preguntaTexto.trim()}
                    onClick={() => void handleAsk()}
                  />
                </StyledFieldBlock>
              </StyledVotePriorityPanel>
            ) : null}

            {selected.resolucion === 'Empate — escalar' ? (
              <StyledVotePriorityPanel accent="orange">
                <StyledVotePriorityHeader>
                  <div>
                    <StyledVotePriorityEyebrow>
                      {canCeoDecide
                        ? t`Acción requerida · CEO`
                        : t`Empate · escalado`}
                    </StyledVotePriorityEyebrow>
                    <StyledVotePriorityTitle>
                      {t`Tu voto · CEO`}
                    </StyledVotePriorityTitle>
                  </div>
                  <ParksStatusBadge
                    color="orange"
                    label={
                      canCeoDecide ? t`Pendiente de tu voto` : t`Pendiente CEO`
                    }
                  />
                </StyledVotePriorityHeader>
                <StyledSeatHint style={{ marginBottom: 0 }}>
                  {t`El trío empató (1 aprueba · 1 rechaza · 1 se abstiene). Tu voto como Director General resuelve el comité.`}
                </StyledSeatHint>
                {canCeoDecide ? (
                  <>
                    <StyledFieldBlock style={{ marginTop: 0 }}>
                      <StyledFieldLabel>
                        {t`Comentarios (obligatorio si rechazas)`}
                      </StyledFieldLabel>
                      <StyledParksTextarea
                        rows={3}
                        value={ceoComentario}
                        onChange={(event) =>
                          setCeoComentario(event.target.value)
                        }
                        placeholder={t`Agrega contexto para Legal / Comercial…`}
                        disabled={busy}
                      />
                    </StyledFieldBlock>
                    <StyledVotePriorityActions columns={2}>
                      <VoteDecisionButton
                        tone="approve"
                        label={t`Aprobar`}
                        hint={t`Resuelve a favor`}
                        Icon={IconCheck}
                        disabled={busy}
                        onClick={() => void handleCeoDecision('Aprueba')}
                      />
                      <VoteDecisionButton
                        tone="reject"
                        label={t`Rechazar`}
                        hint={t`Resuelve en contra`}
                        Icon={IconX}
                        disabled={busy}
                        onClick={() => void handleCeoDecision('Rechaza')}
                      />
                    </StyledVotePriorityActions>
                  </>
                ) : (
                  <StyledMeta style={{ margin: 0 }}>
                    {t`Pendiente del voto del CEO. Inicia sesión como Director General para Aprueba / Rechaza.`}
                  </StyledMeta>
                )}
              </StyledVotePriorityPanel>
            ) : null}

            <ParksSectionCard title={t`Votos actuales`} accent="blue">
              <StyledTrackerHint>
                {getComiteTrackerHint(selected)}
              </StyledTrackerHint>
              <StyledVoteRow>
                {selected.miembros.map((member) => {
                  const voteAccent = getComiteVotoAccent(member.voto);

                  return (
                    <StyledVoteCard key={member.memberId} accent={voteAccent}>
                      <StyledVoteName>{member.nombre}</StyledVoteName>
                      <StyledVoteRole>{member.rolEtiqueta}</StyledVoteRole>
                      <div style={{ marginTop: 8 }}>
                        <ParksStatusBadge
                          color={voteAccent}
                          label={votoLabel(member.voto)}
                        />
                      </div>
                      {member.comentario ? (
                        <StyledVoteComment>
                          “{member.comentario}”
                        </StyledVoteComment>
                      ) : null}
                    </StyledVoteCard>
                  );
                })}
              </StyledVoteRow>
            </ParksSectionCard>

            {selected.flagsIaAtipicas.length > 0 ? (
              <ParksSectionCard
                title={t`Flags IA · condiciones atípicas`}
                accent="orange"
              >
                <StyledIaSummary>
                  <IconBrain size={13} style={{ verticalAlign: '-2px' }} />{' '}
                  {t`La IA comparó este deal contra la banda histórica del portafolio y detectó ${selected.flagsIaAtipicas.length} condición(es) fuera de estándar.`}
                </StyledIaSummary>
                <StyledFlagList>
                  {selected.flagsIaAtipicas.map((flag) => {
                    const flagAccent = getComiteFlagSeveridadAccent(
                      flag.severidad,
                    );

                    return (
                      <StyledFlagRow key={flag.id} accent={flagAccent}>
                        <StyledFlagIcon accent={flagAccent}>
                          <IconAlertTriangle size={16} />
                        </StyledFlagIcon>
                        <StyledFlagBody>
                          <StyledFlagHeader>
                            <StyledFlagTitle>{flag.titulo}</StyledFlagTitle>
                            <ParksStatusBadge
                              color={flagAccent}
                              label={flag.severidad}
                            />
                          </StyledFlagHeader>
                          <StyledFlagDetail>{flag.detalle}</StyledFlagDetail>
                        </StyledFlagBody>
                      </StyledFlagRow>
                    );
                  })}
                </StyledFlagList>
              </ParksSectionCard>
            ) : null}

            <ParksSectionCard
              title={t`Preguntas del comité (${selected.preguntas.length})`}
              accent="sky"
            >
              {selected.preguntas.length === 0 ? (
                <StyledMeta style={{ margin: 0 }}>
                  {t`Sin preguntas aún`}
                </StyledMeta>
              ) : (
                selected.preguntas.map((pregunta) => (
                  <StyledQuestion key={pregunta.id}>
                    <StyledQuestionAuthor>
                      {pregunta.preguntaPorNombre}
                    </StyledQuestionAuthor>
                    <StyledMeta style={{ margin: 0 }}>
                      {pregunta.preguntaTexto}
                    </StyledMeta>
                    {pregunta.resuelta ? (
                      <StyledAnswerBox>
                        <strong>{pregunta.respuestaPorNombre}</strong>
                        {': '}
                        {pregunta.respuestaTexto}
                      </StyledAnswerBox>
                    ) : (
                      <StyledFieldBlock>
                        <StyledFieldLabel>
                          {t`Respuesta del LO / CEM`}
                        </StyledFieldLabel>
                        <StyledParksTextarea
                          rows={2}
                          value={respuestaTexto}
                          onChange={(event) =>
                            setRespuestaTexto(event.target.value)
                          }
                          placeholder={t`Escribe la respuesta…`}
                        />
                        <Button
                          title={t`Responder`}
                          size="small"
                          variant="secondary"
                          disabled={busy || !respuestaTexto.trim()}
                          onClick={() => void handleAnswer(pregunta.id)}
                        />
                      </StyledFieldBlock>
                    )}
                  </StyledQuestion>
                ))
              )}
            </ParksSectionCard>

            {selected.resumenRazonesRechazo ? (
              <ParksSectionCard title={t`Razones de rechazo`} accent="red">
                <StyledMeta style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {selected.resumenRazonesRechazo}
                </StyledMeta>
              </ParksSectionCard>
            ) : null}

            <ParksSectionCard
              title={t`Bitácora del comité (${selected.auditoria.length})`}
              accent="gray"
            >
              <StyledIaSummary>
                <IconHistory size={13} style={{ verticalAlign: '-2px' }} />{' '}
                {t`Registro inmutable de eventos. Cada voto, pregunta y resolución queda auditado para consejo.`}
              </StyledIaSummary>
              {selected.auditoria.length === 0 ? (
                <StyledMeta style={{ margin: 0 }}>
                  {t`Sin eventos registrados`}
                </StyledMeta>
              ) : (
                <StyledAuditList>
                  {selected.auditoria.map((line, index) => {
                    const entry = parseComiteAuditoriaLine(line);

                    return (
                      <StyledAuditItem key={`${index}-${line}`}>
                        {entry.timestamp ? (
                          <StyledAuditTime>{entry.timestamp}</StyledAuditTime>
                        ) : null}
                        <StyledAuditMessage>
                          {entry.mensaje}
                        </StyledAuditMessage>
                      </StyledAuditItem>
                    );
                  })}
                </StyledAuditList>
              )}
            </ParksSectionCard>

            {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}
          </StyledDetail>
        ) : null}
      </StyledLayout>

      {isPlanoOpen && selected ? (
        <ParksComitePlanoModal
          naveNomenclatura={selected.deal.naveNomenclatura}
          parqueNombre={selected.deal.parqueNombre}
          glaM2={selected.deal.glaM2}
          onClose={() => setIsPlanoOpen(false)}
        />
      ) : null}
    </StyledParksPageStack>
  );
};
