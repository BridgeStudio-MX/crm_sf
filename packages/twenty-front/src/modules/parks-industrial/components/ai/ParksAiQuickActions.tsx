import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { useParksAiAssistant } from '@/parks-industrial/hooks/useParksAiAssistant';
import { type ParksAiQuickAction } from '@/parks-industrial/types/parks-ai.types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledQuickActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledQuickActionButton = styled.button`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};

  &:hover {
    border-color: ${themeCssVariables.color.blue};
    color: ${themeCssVariables.font.color.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

type ParksAiQuickActionsProps = {
  actions: ParksAiQuickAction[];
};

export const ParksAiQuickActions = ({ actions }: ParksAiQuickActionsProps) => {
  const { isLoading, runQuickAction } = useParksAiAssistant();

  if (actions.length === 0) {
    return null;
  }

  return (
    <StyledQuickActions>
      {actions.map((action) => (
        <StyledQuickActionButton
          key={action.id}
          type="button"
          disabled={isLoading}
          onClick={() => void runQuickAction(action)}
        >
          {action.label}
        </StyledQuickActionButton>
      ))}
    </StyledQuickActions>
  );
};
