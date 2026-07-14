import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconSparkles } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksRoleLabel } from '@/parks-industrial/constants/parks-role-access.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { useParksAiAssistant } from '@/parks-industrial/hooks/useParksAiAssistant';
import { hasAnyParksRoleLabel } from '@/parks-industrial/utils/parks-role-access.util';

const StyledButtonWrapper = styled.div<{ $ceoMode: boolean }>`
  border-radius: ${themeCssVariables.border.radius.pill};
  box-shadow: ${({ $ceoMode }) =>
    $ceoMode
      ? `0 0 0 1px ${PARKS_BRAND.borderSoft}, 0 8px 20px rgba(0, 104, 55, 0.22)`
      : `0 0 14px ${themeCssVariables.color.green3}`};
  flex-shrink: 0;
  overflow: hidden;
  padding: 2px;
  position: relative;

  &::before {
    animation: parks-ai-border-spin 2.8s linear infinite;
    background: ${({ $ceoMode }) =>
      $ceoMode
        ? `conic-gradient(
      from 0deg,
      ${PARKS_BRAND.primary},
      ${PARKS_BRAND.accent},
      #004d29,
      ${PARKS_BRAND.accent},
      ${PARKS_BRAND.primary}
    )`
        : `conic-gradient(
      from 0deg,
      ${themeCssVariables.color.green7},
      ${themeCssVariables.color.green4},
      ${themeCssVariables.color.green},
      ${themeCssVariables.color.green3},
      ${themeCssVariables.color.green8},
      ${themeCssVariables.color.green5},
      ${themeCssVariables.color.green7}
    )`};
    content: '';
    inset: -130%;
    position: absolute;
  }

  @keyframes parks-ai-border-spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
`;

const StyledButton = styled.button<{ $ceoMode: boolean }>`
  align-items: center;
  background: ${({ $ceoMode }) =>
    $ceoMode
      ? `linear-gradient(135deg, ${PARKS_BRAND.primary} 0%, #004d29 100%)`
      : `linear-gradient(
    135deg,
    ${themeCssVariables.background.primary} 0%,
    ${themeCssVariables.color.green1} 100%
  )`};
  border: none;
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
  padding: 6px ${themeCssVariables.spacing[3]} 6px
    ${themeCssVariables.spacing[2]};
  position: relative;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
  z-index: 1;

  &:hover {
    background: ${({ $ceoMode }) =>
      $ceoMode
        ? `linear-gradient(135deg, #007a40 0%, ${PARKS_BRAND.primary} 100%)`
        : `linear-gradient(
      135deg,
      ${themeCssVariables.background.secondary} 0%,
      ${themeCssVariables.color.green2} 100%
    )`};
    box-shadow: ${({ $ceoMode }) =>
      $ceoMode
        ? 'inset 0 0 0 1px rgba(255,255,255,0.18)'
        : `inset 0 0 0 1px ${themeCssVariables.color.green3}`};
  }

  &:focus-visible {
    outline: 2px solid ${PARKS_BRAND.accent};
    outline-offset: 2px;
  }
`;

const StyledIconWrap = styled.span<{ $ceoMode: boolean }>`
  align-items: center;
  color: ${({ $ceoMode }) =>
    $ceoMode ? PARKS_BRAND.accent : themeCssVariables.color.green};
  display: flex;
  filter: ${({ $ceoMode }) =>
    $ceoMode
      ? 'none'
      : `drop-shadow(0 0 4px ${themeCssVariables.color.green3})`};
`;

const StyledLabel = styled.span<{ $ceoMode: boolean }>`
  color: ${({ $ceoMode }) =>
    $ceoMode ? themeCssVariables.font.color.inverted : '#ffffff'};
  white-space: nowrap;
`;

const StyledCeoTag = styled.span`
  background: rgba(255, 255, 255, 0.16);
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.inverted};
  font-size: 10px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
  padding: 2px 6px;
  text-transform: uppercase;
`;

export const ParksAiAssistantButton = () => {
  const { openAssistant } = useParksAiAssistant();
  const { parksRoleLabels } = useParksAccess();
  const isCeo = hasAnyParksRoleLabel(parksRoleLabels, [ParksRoleLabel.CEO]);

  return (
    <StyledButtonWrapper $ceoMode={isCeo}>
      <StyledButton
        type="button"
        $ceoMode={isCeo}
        title={
          isCeo ? t`IA Dirección General` : t`Asistente Parks Industrial`
        }
        aria-label={
          isCeo ? t`IA Dirección General` : t`Asistente Parks Industrial`
        }
        onClick={() => openAssistant()}
      >
        <StyledIconWrap $ceoMode={isCeo}>
          <IconSparkles size={16} />
        </StyledIconWrap>
        <StyledLabel $ceoMode={isCeo}>
          {isCeo ? t`IA Dirección` : t`Asistente IA`}
        </StyledLabel>
        {isCeo ? <StyledCeoTag>{t`CEO`}</StyledCeoTag> : null}
      </StyledButton>
    </StyledButtonWrapper>
  );
};
