import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { IconCheck, type IconComponent } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  PARKS_BRAND,
  PARKS_VIBE,
} from '@/parks-industrial/constants/parks-theme.constants';

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
  background: ${PARKS_VIBE.surfaceMuted};
  border-bottom: 1px solid ${PARKS_VIBE.border};
  display: flex;
  flex-shrink: 0;
  gap: ${PARKS_VIBE.space.md};
  overflow-x: auto;
  padding: 0 ${PARKS_VIBE.space.lg};
  scroll-padding-inline-end: ${PARKS_VIBE.space.lg};
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    gap: ${PARKS_VIBE.space.sm};
    padding: 0 ${PARKS_VIBE.space.md};
  }
`;

const StyledTabButton = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: transparent;
  border: none;
  border-bottom: 2px solid
    ${({ isActive }) => (isActive ? PARKS_BRAND.primary : 'transparent')};
  color: ${({ isActive }) =>
    isActive ? PARKS_BRAND.primary : PARKS_VIBE.textSecondary};
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.medium};
  gap: 6px;
  margin-bottom: -1px;
  padding: 12px 2px;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
  white-space: nowrap;

  &:hover {
    color: ${({ isActive }) =>
      isActive ? PARKS_BRAND.primary : PARKS_VIBE.textPrimary};
  }
`;

const StyledStepBadge = styled.span<{ isActive: boolean; isComplete: boolean }>`
  align-items: center;
  background: ${({ isActive, isComplete }) => {
    if (isComplete) {
      return PARKS_BRAND.accentSoft;
    }

    if (isActive) {
      return PARKS_BRAND.primarySoft;
    }

    return 'rgba(50, 51, 56, 0.06)';
  }};
  border-radius: ${PARKS_VIBE.radiusPill};
  color: ${({ isActive, isComplete }) => {
    if (isComplete || isActive) {
      return PARKS_BRAND.primary;
    }

    return PARKS_VIBE.textMuted;
  }};
  display: inline-flex;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 18px;
  justify-content: center;
  min-width: 18px;
  padding: 0 5px;
`;

const StyledTabPanel = styled.div<{ fillHeight: boolean }>`
  background: ${PARKS_VIBE.surface};
  display: flex;
  flex: ${({ fillHeight }) => (fillHeight ? '1' : '0 1 auto')};
  flex-direction: column;
  gap: ${PARKS_VIBE.space.md};
  min-height: ${({ fillHeight }) => (fillHeight ? '0' : 'auto')};
  overflow-y: ${({ fillHeight }) => (fillHeight ? 'auto' : 'visible')};
  padding: ${PARKS_VIBE.space.lg};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${PARKS_VIBE.space.md};
  }
`;

const StyledPanelHint = styled.p`
  color: ${PARKS_VIBE.textMuted};
  font-family: ${PARKS_VIBE.fontFamily};
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
                <StyledStepBadge
                  isActive={isActive}
                  isComplete={!!tab.isComplete}
                >
                  {tab.isComplete ? <IconCheck size={11} /> : tab.stepIndex}
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
