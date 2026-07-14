import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconCheck } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { PARKS_LO_CAMPO_CHECKLIST_ITEMS } from '@/parks-industrial/constants/parks-lo-campo.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
  margin: 0 0 ${themeCssVariables.spacing[1]};
`;

const StyledProgress = styled.div`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledItem = styled.button<{ $done: boolean }>`
  align-items: center;
  background: ${({ $done }) =>
    $done ? PARKS_BRAND.accentSoft : themeCssVariables.background.primary};
  border: 1px solid
    ${({ $done }) =>
      $done ? PARKS_BRAND.accent : PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  min-height: 56px;
  padding: 12px 14px;
  text-align: left;
  width: 100%;
`;

const StyledCheck = styled.span<{ $done: boolean }>`
  align-items: center;
  background: ${({ $done }) =>
    $done ? PARKS_BRAND.primary : themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ $done }) =>
    $done
      ? themeCssVariables.font.color.inverted
      : themeCssVariables.font.color.tertiary};
  display: inline-flex;
  flex-shrink: 0;
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const StyledLabel = styled.span<{ $done: boolean }>`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-decoration: ${({ $done }) => ($done ? 'line-through' : 'none')};
`;

export const ParksLoCampoChecklist = () => {
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    setDoneIds((current) => {
      const next = new Set(current);

      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }

      return next;
    });
  };

  const doneCount = doneIds.size;
  const totalCount = PARKS_LO_CAMPO_CHECKLIST_ITEMS.length;

  return (
    <StyledStack>
      <StyledHint>
        {t`Checklist de campo. Márcalo mientras avanzas el tour — no se pierde si cambias de pestaña.`}
      </StyledHint>
      <StyledProgress>
        {t`${doneCount} de ${totalCount} listos`}
      </StyledProgress>
      {PARKS_LO_CAMPO_CHECKLIST_ITEMS.map((item) => {
        const isDone = doneIds.has(item.id);

        return (
          <StyledItem
            key={item.id}
            type="button"
            $done={isDone}
            onClick={() => toggleItem(item.id)}
          >
            <StyledCheck $done={isDone}>
              {isDone ? <IconCheck size={16} /> : null}
            </StyledCheck>
            <StyledLabel $done={isDone}>{item.label}</StyledLabel>
          </StyledItem>
        );
      })}
    </StyledStack>
  );
};
