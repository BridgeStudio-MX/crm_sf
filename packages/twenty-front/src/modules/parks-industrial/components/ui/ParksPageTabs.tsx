import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';

export type ParksPageTab<T extends string> = {
  id: T;
  label: string;
  icon?: IconComponent;
  count?: number;
};

type ParksPageTabsProps<T extends string> = {
  tabs: ParksPageTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  children: ReactNode;
  ariaLabel?: string;
};

const StyledTabsRoot = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  overflow: hidden;
`;

const StyledTabList = styled.div`
  background: linear-gradient(
    180deg,
    ${PARKS_BRAND.primarySoft} 0%,
    ${themeCssVariables.background.primary} 100%
  );
  border-bottom: 1px solid ${PARKS_BRAND.borderSoft};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  overflow-x: auto;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[2]};
  }
`;

const StyledTabButton = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.primary : 'transparent'};
  border: 1px solid
    ${({ isActive }) =>
      isActive ? PARKS_BRAND.borderSoft : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${({ isActive }) =>
    isActive ? themeCssVariables.boxShadow.light : 'none'};
  color: ${({ isActive }) =>
    isActive ? PARKS_BRAND.primary : themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.medium};
  gap: 6px;
  padding: 8px 14px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
  white-space: nowrap;

  &:hover {
    color: ${({ isActive }) =>
      isActive ? PARKS_BRAND.primary : themeCssVariables.font.color.primary};
  }
`;

const StyledCount = styled.span`
  background: ${PARKS_BRAND.primarySoft};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  min-width: 18px;
  padding: 1px 6px;
  text-align: center;
`;

const StyledTabPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[4]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[3]};
  }
`;

export const ParksPageTabs = <T extends string>({
  tabs,
  activeTab,
  onTabChange,
  children,
  ariaLabel,
}: ParksPageTabsProps<T>) => (
  <StyledTabsRoot>
    <StyledTabList role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const TabIcon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <StyledTabButton
            key={tab.id}
            type="button"
            role="tab"
            id={`parks-page-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`parks-page-panel-${tab.id}`}
            isActive={isActive}
            onClick={() => onTabChange(tab.id)}
          >
            {TabIcon ? <TabIcon size={14} /> : null}
            {tab.label}
            {tab.count !== undefined ? (
              <StyledCount>{tab.count}</StyledCount>
            ) : null}
          </StyledTabButton>
        );
      })}
    </StyledTabList>

    <StyledTabPanel
      role="tabpanel"
      id={`parks-page-panel-${activeTab}`}
      aria-labelledby={`parks-page-tab-${activeTab}`}
    >
      {children}
    </StyledTabPanel>
  </StyledTabsRoot>
);
