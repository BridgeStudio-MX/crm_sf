import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  ParksBrandLogo,
  ParksBrandLogoMark,
} from '@/parks-industrial/components/ui/ParksBrandLogo';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';

const StyledParksNavSection = styled.div<{ isPrimary: boolean }>`
  position: relative;
  margin-top: ${({ isPrimary }) =>
    isPrimary ? '0' : themeCssVariables.spacing[1]};
  padding-top: ${({ isPrimary }) =>
    isPrimary ? '0' : themeCssVariables.spacing[2]};

  &::before {
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${PARKS_BRAND.borderSoft} 20%,
      ${PARKS_BRAND.borderSoft} 80%,
      transparent 100%
    );
    content: '';
    display: ${({ isPrimary }) => (isPrimary ? 'none' : 'block')};
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  .navigation-drawer-item {
    border-left: 2px solid transparent;
    border-radius: 0 ${themeCssVariables.border.radius.sm}
      ${themeCssVariables.border.radius.sm} 0;
    margin-left: 2px;
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      transform 0.15s ease;
  }

  .navigation-drawer-item[aria-selected='true'] {
    background: ${PARKS_BRAND.primarySoft};
    border-left-color: ${PARKS_BRAND.primary};
    color: ${themeCssVariables.font.color.primary};
    font-weight: ${themeCssVariables.font.weight.medium};
  }

  .navigation-drawer-item:hover:not([aria-selected='true']) {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledBrandHeader = styled.div`
  padding: 0 ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledGroupsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

type ParksNavigationBrandPanelProps = {
  children: ReactNode;
  isPrimary?: boolean;
};

export const ParksNavigationBrandPanel = ({
  children,
  isPrimary = false,
}: ParksNavigationBrandPanelProps) => (
  <StyledParksNavSection isPrimary={isPrimary}>
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <StyledBrandHeader>
          <ParksBrandLogoMark>
            <ParksBrandLogo variant="auto" height={20} />
          </ParksBrandLogoMark>
        </StyledBrandHeader>
      </NavigationDrawerAnimatedCollapseWrapper>
      {children}
    </NavigationDrawerSection>
  </StyledParksNavSection>
);

export const ParksNavigationGroupsStack = StyledGroupsStack;
