import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type ParksEmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px dashed ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  min-height: 160px;
  padding: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  max-width: 360px;
`;

export const ParksEmptyState = ({
  title,
  description,
  action,
}: ParksEmptyStateProps) => (
  <StyledContainer>
    <StyledTitle>{title}</StyledTitle>
    {description ? <StyledDescription>{description}</StyledDescription> : null}
    {action}
  </StyledContainer>
);
