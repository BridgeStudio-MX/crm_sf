import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconSparkles } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useParksAiAssistant } from '@/parks-industrial/hooks/useParksAiAssistant';

const StyledButtonWrapper = styled.div`
  border-radius: ${themeCssVariables.border.radius.pill};
  box-shadow: 0 0 14px ${themeCssVariables.color.green3};
  flex-shrink: 0;
  overflow: hidden;
  padding: 2px;
  position: relative;

  &::before {
    animation: parks-ai-border-spin 2.8s linear infinite;
    background: conic-gradient(
      from 0deg,
      ${themeCssVariables.color.green7},
      ${themeCssVariables.color.green4},
      ${themeCssVariables.color.green},
      ${themeCssVariables.color.green3},
      ${themeCssVariables.color.green8},
      ${themeCssVariables.color.green5},
      ${themeCssVariables.color.green7}
    );
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

const StyledButton = styled.button`
  align-items: center;
  background: linear-gradient(
    135deg,
    ${themeCssVariables.background.primary} 0%,
    ${themeCssVariables.color.green1} 100%
  );
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
  transition: background 0.2s ease, box-shadow 0.2s ease;
  z-index: 1;

  &:hover {
    background: linear-gradient(
      135deg,
      ${themeCssVariables.background.secondary} 0%,
      ${themeCssVariables.color.green2} 100%
    );
    box-shadow: inset 0 0 0 1px ${themeCssVariables.color.green3};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.green};
    outline-offset: 2px;
  }
`;

const StyledIconWrap = styled.span`
  align-items: center;
  color: ${themeCssVariables.color.green};
  display: flex;
  filter: drop-shadow(0 0 4px ${themeCssVariables.color.green3});
`;

const StyledLabel = styled.span`
  color: #ffffff;
  white-space: nowrap;
`;

export const ParksAiAssistantButton = () => {
  const { openAssistant } = useParksAiAssistant();

  return (
    <StyledButtonWrapper>
      <StyledButton
        type="button"
        title={t`Asistente Parks`}
        aria-label={t`Asistente Parks`}
        onClick={() => openAssistant()}
      >
        <StyledIconWrap>
          <IconSparkles size={16} />
        </StyledIconWrap>
        <StyledLabel>{t`Asistente IA`}</StyledLabel>
      </StyledButton>
    </StyledButtonWrapper>
  );
};
