import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { IconCheck, type IconComponent } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

export type ParksModalTab<T extends string> = {
  id: T;
  label: string;
  isComplete?: boolean;
  icon?: IconComponent;
  description?: string;
  stepIndex?: number;
};

type ParksModalTabsProps<T extends string> = {
  tabs: ParksModalTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  children: ReactNode;
  fillHeight?: boolean;
  ariaLabel?: string;
};

const StyledTabsRoot = styled.div<{ fillHeight: boolean }>`
  display: flex;
  flex: ${({ fillHeight }) => (fillHeight ? '1' : '0 1 auto')};
  flex-direction: column;
  min-height: ${({ fillHeight }) => (fillHeight ? '0' : 'auto')};
  overflow: hidden;
`;

const StyledTabList = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[3]};
  overflow-x: auto;
  padding: 0 ${themeCssVariables.spacing[4]};
  scroll-padding-inline-end: ${themeCssVariables.spacing[4]};
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    gap: ${themeCssVariables.spacing[2]};
    padding: 0 ${themeCssVariables.spacing[3]};
  }
`;

const StyledTabButton = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: transparent;
  border: none;
  border-bottom: 2px solid
    ${({ isActive }) =>
      isActive ? themeCssVariables.color.blue : 'transparent'};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.secondary};
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
  margin-bottom: -1px;
  padding: ${themeCssVariables.spacing[3]} 2px;
  transition: color 0.15s ease;
  white-space: nowrap;

  &:hover {
    color: ${({ isActive }) =>
      isActive
        ? themeCssVariables.color.blue
        : themeCssVariables.font.color.primary};
  }
`;

const StyledStepBadge = styled.span<{ isActive: boolean; isComplete: boolean }>`
  align-items: center;
  color: ${({ isActive, isComplete }) => {
    if (isComplete) {
      return themeCssVariables.color.green;
    }

    if (isActive) {
      return themeCssVariables.color.blue;
    }

    return themeCssVariables.font.color.tertiary;
  }};
  display: inline-flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledTabPanel = styled.div<{ fillHeight: boolean }>`
  display: flex;
  flex: ${({ fillHeight }) => (fillHeight ? '1' : '0 1 auto')};
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-height: ${({ fillHeight }) => (fillHeight ? '0' : 'auto')};
  overflow-y: ${({ fillHeight }) => (fillHeight ? 'auto' : 'visible')};
  padding: ${themeCssVariables.spacing[4]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[3]};
  }
`;

const StyledPanelHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.45;
  margin: 0;
`;

export const ParksModalTabs = <T extends string>({
  tabs,
  activeTab,
  onTabChange,
  children,
  fillHeight = true,
  ariaLabel,
}: ParksModalTabsProps<T>) => {
  const activeTabMeta = tabs.find((tab) => tab.id === activeTab);

  return (
    <StyledTabsRoot fillHeight={fillHeight}>
      <StyledTabList role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <StyledTabButton
              key={tab.id}
              type="button"
              role="tab"
              id={`parks-modal-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`parks-modal-panel-${tab.id}`}
              isActive={isActive}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.stepIndex !== undefined ? (
                <StyledStepBadge isActive={isActive} isComplete={!!tab.isComplete}>
                  {tab.isComplete ? <IconCheck size={12} /> : tab.stepIndex}
                </StyledStepBadge>
              ) : null}
              {TabIcon ? <TabIcon size={14} /> : null}
              {tab.label}
            </StyledTabButton>
          );
        })}
      </StyledTabList>

      <StyledTabPanel
        role="tabpanel"
        id={`parks-modal-panel-${activeTab}`}
        aria-labelledby={`parks-modal-tab-${activeTab}`}
        fillHeight={fillHeight}
      >
        {activeTabMeta?.description ? (
          <StyledPanelHint>{activeTabMeta.description}</StyledPanelHint>
        ) : null}
        {children}
      </StyledTabPanel>
    </StyledTabsRoot>
  );
};
