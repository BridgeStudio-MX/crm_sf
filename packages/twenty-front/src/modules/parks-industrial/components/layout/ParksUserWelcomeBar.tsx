import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksBrandLogo } from '@/parks-industrial/components/ui/ParksBrandLogo';
import { formatParksRoleLabelForDisplay } from '@/parks-industrial/constants/parks-role-access.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';

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

export const ParksUserWelcomeBar = () => {
  const { displayName, primaryParksRoleLabel, hasAnyParksNavAccess } =
    useParksAccess();

  if (!hasAnyParksNavAccess || !displayName) {
    return null;
  }

  return (
    <StyledWelcomeBar>
      <StyledWelcomeLeft>
        <ParksBrandLogo variant="auto" height={22} />
        <StyledWelcomeText>
          {t`Bienvenido`},{' '}
          <StyledWelcomeName>{displayName}</StyledWelcomeName>
        </StyledWelcomeText>
      </StyledWelcomeLeft>
      {primaryParksRoleLabel ? (
        <StyledRoleBadge>
          {formatParksRoleLabelForDisplay(primaryParksRoleLabel)}
        </StyledRoleBadge>
      ) : null}
    </StyledWelcomeBar>
  );
};
