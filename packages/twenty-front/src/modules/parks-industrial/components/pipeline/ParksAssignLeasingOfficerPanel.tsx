import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { StyledParksSelect } from '@/parks-industrial/components/ui/parks-form-control.styles';
import {
  PARKS_BRAND,
  PARKS_VIBE,
} from '@/parks-industrial/constants/parks-theme.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { useParksLeasingOfficerOptions } from '@/parks-industrial/hooks/useParksLeasingOfficerOptions';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { assignParksLead } from '@/parks-industrial/services/parks-commercial.client';
import { getParksAssignedLeasingOfficerName } from '@/parks-industrial/utils/parks-format.util';
import { normalizeParksPipelineStageId } from '@/parks-industrial/utils/parksStageGateUtil';

const StyledHint = styled.p`
  color: ${PARKS_VIBE.textSecondary};
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0 0 ${PARKS_VIBE.space.md};
`;

const StyledRow = styled.div`
  align-items: end;
  display: flex;
  flex-wrap: wrap;
  gap: ${PARKS_VIBE.space.sm};
`;

const StyledSelectWrap = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
`;

const StyledLabel = styled.label`
  color: ${PARKS_VIBE.textMuted};
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${PARKS_VIBE.space.sm};
`;

const StyledAssignShell = styled.div`
  & > section {
    background: linear-gradient(
      145deg,
      #ffffff 0%,
      ${PARKS_BRAND.accentSoft} 100%
    );
  }
`;

type ParksAssignLeasingOfficerPanelProps = {
  deal: ParksOpportunityRecord;
  onAssigned?: (
    dealId: string,
    update: Partial<ParksOpportunityRecord>,
  ) => void;
};

export const ParksAssignLeasingOfficerPanel = ({
  deal,
  onAssigned,
}: ParksAssignLeasingOfficerPanelProps) => {
  const { canAccessRoute, displayName, primaryParksRoleLabel } =
    useParksAccess();
  const leasingOfficerOptions = useParksLeasingOfficerOptions();
  const [selectedLo, setSelectedLo] = useState(
    leasingOfficerOptions[0] ?? '',
  );
  const [isAssigning, setIsAssigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stageId = normalizeParksPipelineStageId(deal.stage);
  const alreadyAssigned = Boolean(getParksAssignedLeasingOfficerName(deal));
  const canAssign =
    canAccessRoute('leadsCem') &&
    (stageId === 'LEAD_RECIBIDO' || stageId === 'PROSPECTO_NUEVO') &&
    !alreadyAssigned;

  if (!canAssign) {
    return null;
  }

  const assignedByLabel = displayName
    ? `${displayName}${primaryParksRoleLabel ? ' (Director Comercial)' : ''}`
    : 'Héctor Montelongo (Director Comercial)';

  const handleAssign = async () => {
    if (!selectedLo.trim()) {
      setErrorMessage(t`Selecciona un Leasing Officer`);
      return;
    }

    setIsAssigning(true);
    setErrorMessage(null);

    try {
      await assignParksLead({
        opportunityId: deal.id,
        leasingOfficerName: selectedLo,
        assignedBy: assignedByLabel,
      });

      onAssigned?.(deal.id, {
        asignadoPor: `${assignedByLabel} → ${selectedLo}`,
        leasingOfficerAsignado: selectedLo,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`No se pudo asignar`,
      );
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <StyledAssignShell>
      <ParksSectionCard title={t`Asignar a Leasing Officer`} accent="green">
        <StyledHint>
          {t`Este lead aún no tiene LO. Asígnarlo para que pueda avanzar en el pipeline y se cree la tarea de contacto en 24h.`}
        </StyledHint>
        <StyledRow>
          <StyledSelectWrap>
            <StyledLabel htmlFor={`parks-assign-lo-${deal.id}`}>
              {t`Leasing Officer`}
            </StyledLabel>
            <StyledParksSelect
              id={`parks-assign-lo-${deal.id}`}
              value={selectedLo}
              disabled={isAssigning}
              onChange={(event) => setSelectedLo(event.target.value)}
            >
              {leasingOfficerOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </StyledParksSelect>
          </StyledSelectWrap>
          <Button
            title={isAssigning ? t`Asignando…` : t`Asignar a LO`}
            variant="primary"
            size="small"
            disabled={isAssigning || !selectedLo}
            onClick={() => {
              void handleAssign();
            }}
          />
        </StyledRow>
        {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}
      </ParksSectionCard>
    </StyledAssignShell>
  );
};
