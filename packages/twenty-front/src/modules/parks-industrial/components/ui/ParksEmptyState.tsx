import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  PARKS_BRAND,
  PARKS_VIBE,
} from '@/parks-industrial/constants/parks-theme.constants';

type ParksEmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

const StyledContainer = styled.div`
  align-items: center;
  background: ${PARKS_VIBE.surface};
  border: 1px dashed ${PARKS_VIBE.borderStrong};
  border-radius: ${PARKS_VIBE.radiusMd};
  box-shadow: ${PARKS_VIBE.shadowSoft};
  display: flex;
  flex-direction: column;
  gap: ${PARKS_VIBE.space.sm};
  justify-content: center;
  min-height: 160px;
  padding: ${PARKS_VIBE.space.xxl};
  text-align: center;
`;

const StyledTitle = styled.div`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledDescription = styled.div`
  color: ${PARKS_VIBE.textSecondary};
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
