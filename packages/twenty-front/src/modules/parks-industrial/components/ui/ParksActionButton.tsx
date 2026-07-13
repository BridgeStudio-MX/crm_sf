import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';

export type ParksActionButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ParksActionButtonSize = 'sm' | 'md';

type ParksActionButtonProps = {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: ParksActionButtonVariant;
  size?: ParksActionButtonSize;
  Icon?: IconComponent;
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit';
  fullWidth?: boolean;
};

const StyledButton = styled.button`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  line-height: 1.2;
  transition:
    background 120ms ease,
    border-color 120ms ease,
    color 120ms ease,
    box-shadow 120ms ease;
  white-space: nowrap;

  &[data-size='sm'] {
    font-size: ${themeCssVariables.font.size.sm};
    min-height: 32px;
    padding: 0 ${themeCssVariables.spacing[3]};
  }

  &[data-size='md'] {
    font-size: ${themeCssVariables.font.size.sm};
    min-height: 40px;
    padding: 0 ${themeCssVariables.spacing[4]};
  }

  &[data-full-width='true'] {
    width: 100%;
  }

  &[data-variant='primary'] {
    background: ${PARKS_BRAND.primary};
    border-color: ${PARKS_BRAND.primary};
    box-shadow: ${themeCssVariables.boxShadow.light};
    color: #ffffff;
  }

  &[data-variant='primary']:hover:not(:disabled) {
    background: #005a2f;
    border-color: #005a2f;
  }

  &[data-variant='secondary'] {
    background: ${themeCssVariables.background.primary};
    border-color: ${themeCssVariables.border.color.medium};
    box-shadow: ${themeCssVariables.boxShadow.light};
    color: ${themeCssVariables.font.color.primary};
  }

  &[data-variant='secondary']:hover:not(:disabled) {
    background: ${themeCssVariables.background.secondary};
    border-color: ${PARKS_BRAND.primary};
    color: ${PARKS_BRAND.primary};
  }

  &[data-variant='ghost'] {
    background: ${themeCssVariables.background.transparent.light};
    border-color: ${themeCssVariables.border.color.light};
    color: ${themeCssVariables.font.color.secondary};
  }

  &[data-variant='ghost']:hover:not(:disabled) {
    background: ${themeCssVariables.background.secondary};
    color: ${themeCssVariables.font.color.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  &:focus-visible {
    outline: 2px solid ${PARKS_BRAND.accent};
    outline-offset: 2px;
  }
`;

const StyledIconSlot = styled.span`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
`;

export const ParksActionButton = ({
  title,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  Icon,
  iconPosition = 'left',
  type = 'button',
  fullWidth = false,
}: ParksActionButtonProps) => {
  const iconNode = Icon ? (
    <StyledIconSlot>
      <Icon size={size === 'sm' ? 14 : 16} />
    </StyledIconSlot>
  ) : null;

  return (
    <StyledButton
      type={type}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth ? 'true' : 'false'}
      disabled={disabled}
      onClick={onClick}
    >
      {iconPosition === 'left' ? iconNode : null}
      <span>{title}</span>
      {iconPosition === 'right' ? iconNode : null}
    </StyledButton>
  );
};

type ParksActionBarProps = {
  hint?: ReactNode;
  children: ReactNode;
};

const StyledActionBar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledActionBarHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
  margin: 0;
  min-width: 160px;
`;

const StyledActionBarButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  margin-left: auto;
`;

export const ParksActionBar = ({ hint, children }: ParksActionBarProps) => (
  <StyledActionBar>
    {hint ? <StyledActionBarHint>{hint}</StyledActionBarHint> : null}
    <StyledActionBarButtons>{children}</StyledActionBarButtons>
  </StyledActionBar>
);
