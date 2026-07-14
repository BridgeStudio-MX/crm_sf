import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getParksPipelineStageLabel } from '@/parks-industrial/constants/parks-industrial.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import {
  type ParksOpportunityRecord,
} from '@/parks-industrial/hooks/useParksRecords';
import {
  formatParksTourNavesLabel,
  parseParksTourNavesMostradas,
} from '@/parks-industrial/utils/parks-tour-naves.util';

type ParksLoCampoDealPickerProps = {
  deals: ParksOpportunityRecord[];
  selectedDealId: string | null;
  onSelectDeal: (dealId: string) => void;
};

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLabel = styled.label`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledSelect = styled.select`
  appearance: none;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  min-height: 48px;
  padding: 12px 14px;
  width: 100%;
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
`;

export const ParksLoCampoDealPicker = ({
  deals,
  selectedDealId,
  onSelectDeal,
}: ParksLoCampoDealPickerProps) => {
  const selectedDeal =
    deals.find((deal) => deal.id === selectedDealId) ?? null;
  const tourNaves = selectedDeal
    ? parseParksTourNavesMostradas(selectedDeal.tourNavesMostradas)
    : [];

  return (
    <StyledStack>
      <StyledLabel htmlFor="lo-campo-deal">{t`Deal del tour`}</StyledLabel>
      <StyledSelect
        id="lo-campo-deal"
        value={selectedDealId ?? ''}
        onChange={(event) => onSelectDeal(event.target.value)}
      >
        <option value="" disabled>
          {t`Selecciona un deal`}
        </option>
        {deals.map((deal) => (
          <option key={deal.id} value={deal.id}>
            {deal.name ?? t`Sin nombre`}
            {deal.stage
              ? ` · ${getParksPipelineStageLabel(deal.stage)}`
              : ''}
          </option>
        ))}
      </StyledSelect>
      {selectedDeal ? (
        <StyledMeta>
          {selectedDeal.naveVinculada?.identificador
            ? t`Nave: ${selectedDeal.naveVinculada.identificador}`
            : t`Sin nave vinculada`}
          {tourNaves.length > 0
            ? ` · ${formatParksTourNavesLabel(tourNaves)}`
            : ''}
          {selectedDeal.m2Requeridos
            ? ` · ${selectedDeal.m2Requeridos.toLocaleString('es-MX')} m²`
            : ''}
        </StyledMeta>
      ) : null}
    </StyledStack>
  );
};
