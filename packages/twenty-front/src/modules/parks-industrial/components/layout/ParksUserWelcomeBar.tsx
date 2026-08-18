import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconHelpCircle } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksBrandLogo } from '@/parks-industrial/components/ui/ParksBrandLogo';
import { PARKS_GUIDED_TOUR_WELCOME_TARGET } from '@/parks-industrial/constants/parks-guided-tour.constants';
import { formatParksRoleLabelForDisplay } from '@/parks-industrial/constants/parks-role-access.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { useParksGuidedTour } from '@/parks-industrial/hooks/useParksGuidedTour';

const StyledWelcomeBar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-left: 3px solid ${PARKS_BRAND.primary};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledWelcomeLeft = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
`;

const StyledWelcomeText = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledWelcomeName = styled.strong`
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledRoleBadge = styled.span`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: 4px 10px;
`;

const StyledWelcomeActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

export const ParksUserWelcomeBar = () => {
  const { displayName, primaryParksRoleLabel, hasAnyParksNavAccess } =
    useParksAccess();
  const { isActive, startTour } = useParksGuidedTour();

  if (!hasAnyParksNavAccess || !displayName) {
    return null;
  }

  return (
    <StyledWelcomeBar data-parks-tour-target={PARKS_GUIDED_TOUR_WELCOME_TARGET}>
      <StyledWelcomeLeft>
        <ParksBrandLogo variant="auto" height={22} />
        <StyledWelcomeText>
          {t`Bienvenido`},{' '}
          <StyledWelcomeName>{displayName}</StyledWelcomeName>
        </StyledWelcomeText>
      </StyledWelcomeLeft>
      <StyledWelcomeActions>
        <Button
          variant="secondary"
          size="small"
          Icon={IconHelpCircle}
          title={isActive ? t`Tour en curso` : t`Explicar mi área`}
          disabled={isActive}
          onClick={startTour}
        />
        {primaryParksRoleLabel ? (
          <StyledRoleBadge>
            {formatParksRoleLabelForDisplay(primaryParksRoleLabel)}
          </StyledRoleBadge>
        ) : null}
      </StyledWelcomeActions>
    </StyledWelcomeBar>
  );
};
