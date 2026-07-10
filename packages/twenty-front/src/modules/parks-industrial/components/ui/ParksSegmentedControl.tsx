import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type ParksSegmentedControlOption<T extends string> = {
  id: T;
  label: string;
  count?: number;
};

type ParksSegmentedControlProps<T extends string> = {
  options: ParksSegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

const StyledControl = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.color.blue3};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: inline-flex;
  gap: 2px;
  padding: 3px;
`;

const StyledOption = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive
      ? `linear-gradient(135deg, ${themeCssVariables.color.blue1} 0%, ${themeCssVariables.background.primary} 100%)`
      : 'transparent'};
  border: 1px solid
    ${({ isActive }) =>
      isActive ? themeCssVariables.color.blue3 : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-shadow: ${({ isActive }) =>
    isActive ? themeCssVariables.boxShadow.light : 'none'};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.medium};
  padding: 6px 14px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
  white-space: nowrap;

  &:hover {
    color: ${({ isActive }) =>
      isActive
        ? themeCssVariables.color.blue
        : themeCssVariables.font.color.primary};
  }
`;

const StyledCount = styled.span`
  background: ${themeCssVariables.background.transparent.blue};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.color.blue};
  font-size: ${themeCssVariables.font.size.xs};
  margin-left: 6px;
  padding: 1px 6px;
`;

export const ParksSegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: ParksSegmentedControlProps<T>) => (
  <StyledControl>
    {options.map((option) => (
      <StyledOption
        key={option.id}
        type="button"
        isActive={value === option.id}
        onClick={() => onChange(option.id)}
      >
        {option.label}
        {option.count !== undefined ? (
          <StyledCount>{option.count}</StyledCount>
        ) : null}
      </StyledOption>
    ))}
  </StyledControl>
);
