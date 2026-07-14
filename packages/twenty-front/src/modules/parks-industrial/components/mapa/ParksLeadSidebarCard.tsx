import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  getParksPipelineStageLabel,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  formatParksNumber,
} from '@/parks-industrial/utils/parks-format.util';
import {
  formatParksCanalOrigenLabel,
  formatParksUbicacionDeseadaLabel,
} from '@/parks-industrial/utils/parks-unassigned-leads.util';
import { PARKS_MAP_LEAD_MARKER_COLOR } from '@/parks-industrial/utils/parks-map-leads.util';

const StyledCard = styled.div<{ isSelected: boolean; isChecked: boolean }>`
  background: ${({ isSelected, isChecked }) =>
    isSelected || isChecked
      ? themeCssVariables.background.transparent.light
      : themeCssVariables.background.primary};
  border: 1px solid
    ${({ isSelected, isChecked }) =>
      isSelected || isChecked
        ? PARKS_MAP_LEAD_MARKER_COLOR
        : themeCssVariables.border.color.medium};
  border-left: 4px solid ${PARKS_MAP_LEAD_MARKER_COLOR};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${({ isSelected }) =>
    isSelected ? themeCssVariables.boxShadow.light : 'none'};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
`;

const StyledBodyRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledCheckbox = styled.input`
  accent-color: ${PARKS_MAP_LEAD_MARKER_COLOR};
  flex-shrink: 0;
  margin-top: 2px;
`;

const StyledSelectableArea = styled.button`
  appearance: none;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  display: block;
  flex: 1;
  font: inherit;
  min-width: 0;
  padding: 0;
  text-align: left;
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledStats = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[3]};
`;

type ParksLeadSidebarCardProps = {
  lead: ParksOpportunityRecord;
  isSelected: boolean;
  isChecked: boolean;
  onSelect: (leadId: string) => void;
  onToggleCheck: (leadId: string) => void;
};

export const ParksLeadSidebarCard = ({
  lead,
  isSelected,
  isChecked,
  onSelect,
  onToggleCheck,
}: ParksLeadSidebarCardProps) => {
  const ubicacionLabel =
    formatParksUbicacionDeseadaLabel(lead.ubicacionDeseada) ??
    t`Sin ubicación`;
  const canalLabel = formatParksCanalOrigenLabel(lead.canalOrigen);

  return (
    <StyledCard isSelected={isSelected} isChecked={isChecked}>
      <StyledBodyRow>
        <StyledCheckbox
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggleCheck(lead.id)}
          aria-label={t`Seleccionar lead para oferta`}
        />
        <StyledSelectableArea
          type="button"
          onClick={() => onSelect(lead.id)}
          aria-pressed={isSelected}
        >
          <StyledHeader>
            <StyledTitle>{lead.name ?? t`Lead sin nombre`}</StyledTitle>
            <ParksStatusBadge
              color="blue"
              label={getParksPipelineStageLabel(lead.stage)}
            />
          </StyledHeader>
          <StyledMeta>
            {ubicacionLabel}
            {canalLabel ? ` · ${canalLabel}` : ''}
          </StyledMeta>
          <StyledStats>
            <span>
              {formatParksNumber(lead.m2Requeridos)} {t`m² requeridos`}
            </span>
            {lead.leasingOfficerAsignado ? (
              <span>{lead.leasingOfficerAsignado}</span>
            ) : (
              <span>{t`Sin LO`}</span>
            )}
          </StyledStats>
        </StyledSelectableArea>
      </StyledBodyRow>
      <StyledFooter>
        <UndecoratedLink to={AppPath.ParksPipeline}>
          <Button title={t`Ver en pipeline`} variant="secondary" size="small" />
        </UndecoratedLink>
      </StyledFooter>
    </StyledCard>
  );
};
