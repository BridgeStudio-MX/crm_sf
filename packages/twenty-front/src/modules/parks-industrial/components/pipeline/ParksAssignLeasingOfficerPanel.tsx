import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { StyledParksSelect } from '@/parks-industrial/components/ui/parks-form-control.styles';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { useParksLeasingOfficerOptions } from '@/parks-industrial/hooks/useParksLeasingOfficerOptions';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { assignParksLead } from '@/parks-industrial/services/parks-commercial.client';
import { getParksAssignedLeasingOfficerName } from '@/parks-industrial/utils/parks-format.util';
import { normalizeParksPipelineStageId } from '@/parks-industrial/utils/parksStageGateUtil';

const StyledRow = styled.div`
  align-items: end;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSelectWrap = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 180px;
`;

const StyledLabel = styled.label`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
  margin: 0 0 ${themeCssVariables.spacing[2]};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[2]};
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
    ? `${displayName}${primaryParksRoleLabel ? ' (CEM)' : ''}`
    : 'Héctor Montelongo (CEM)';

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
  );
};
