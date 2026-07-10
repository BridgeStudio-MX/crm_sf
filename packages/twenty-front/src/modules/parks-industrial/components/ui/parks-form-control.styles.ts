import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const sharedFieldStyles = `
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
  min-height: 36px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &::placeholder {
    color: ${themeCssVariables.font.color.tertiary};
  }

  &:hover:not(:disabled) {
    border-color: ${themeCssVariables.color.gray3};
  }

  &:focus-visible {
    border-color: ${themeCssVariables.color.blue};
    box-shadow: 0 0 0 3px ${themeCssVariables.color.blue3};
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const StyledParksInput = styled.input`
  ${sharedFieldStyles}
  padding: ${themeCssVariables.spacing[2]};
`;

export const StyledParksSelect = styled.select`
  appearance: none;
  ${sharedFieldStyles}
  background-image: linear-gradient(
      45deg,
      transparent 50%,
      ${themeCssVariables.font.color.tertiary} 50%
    ),
    linear-gradient(
      135deg,
      ${themeCssVariables.font.color.tertiary} 50%,
      transparent 50%
    );
  background-position:
    calc(100% - 16px) calc(50% - 2px),
    calc(100% - 11px) calc(50% - 2px);
  background-repeat: no-repeat;
  background-size:
    5px 5px,
    5px 5px;
  cursor: pointer;
  padding: ${themeCssVariables.spacing[2]}
    calc(${themeCssVariables.spacing[2]} + 20px)
    ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};

  option {
    background: ${themeCssVariables.background.primary};
    color: ${themeCssVariables.font.color.primary};
  }
`;

export const StyledParksTextarea = styled.textarea`
  ${sharedFieldStyles}
  min-height: 72px;
  padding: ${themeCssVariables.spacing[2]};
  resize: vertical;
  width: 100%;
`;

export const StyledParksReadOnlyValue = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  min-height: 36px;
  padding: ${themeCssVariables.spacing[2]};
  word-break: break-word;
`;

export const StyledParksLinkValue = styled(StyledParksReadOnlyValue)`
  color: ${themeCssVariables.color.blue};
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: ${themeCssVariables.font.size.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
