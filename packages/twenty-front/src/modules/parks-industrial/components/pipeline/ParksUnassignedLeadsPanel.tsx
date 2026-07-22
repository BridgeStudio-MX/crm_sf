import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  StyledParksSelect,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { useParksLeasingOfficerOptions } from '@/parks-industrial/hooks/useParksLeasingOfficerOptions';
import { useParksUnassignedLeads } from '@/parks-industrial/hooks/useParksUnassignedLeads';
import {
  assignParksLead,
} from '@/parks-industrial/services/parks-commercial.client';
import {
  formatParksCanalOrigenLabel,
  formatParksLeadAgeLabel,
  formatParksUbicacionDeseadaLabel,
  PARKS_UNASSIGNED_LEADS_PREVIEW_COUNT,
} from '@/parks-industrial/utils/parks-unassigned-leads.util';
import { PARKS_LEADS_CEM_PATH } from '@/parks-industrial/constants/parks-routes.constants';
import { useState } from 'react';

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledTitle = styled.h4`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
`;

const StyledRow = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledLeadInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 200px;
`;

const StyledLeadName = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledLeadMetaRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledCanalBadge = styled.span`
  background: ${themeCssVariables.background.transparent.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.color.blue};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: 1px ${themeCssVariables.spacing[1]};
`;

const StyledLeadMeta = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledLeadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: center;
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledVerMasLink = styled(Link)`
  color: ${themeCssVariables.color.blue};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

export type ParksLeadAssignedPayload = {
  opportunityId: string;
  leasingOfficerName: string;
};

type ParksUnassignedLeadsPanelProps = {
  onAssigned?: (payload: ParksLeadAssignedPayload) => void;
  refreshKey?: number;
  // compact = dashboard (3 + asignar); full = página Leads Director Comercial
  variant?: 'compact' | 'full';
};

export const ParksUnassignedLeadsPanel = ({
  onAssigned,
  refreshKey = 0,
  variant = 'compact',
}: ParksUnassignedLeadsPanelProps) => {
  const {
    leads,
    setLeads,
    isLoading,
    errorMessage,
    setErrorMessage,
  } = useParksUnassignedLeads(refreshKey);
  const leasingOfficerOptions = useParksLeasingOfficerOptions();
  const { displayName, primaryParksRoleLabel } = useParksAccess();
  const [selectedLoByLeadId, setSelectedLoByLeadId] = useState<
    Record<string, string>
  >({});
  const [assigningLeadId, setAssigningLeadId] = useState<string | null>(null);

  const defaultLeasingOfficer = leasingOfficerOptions[0] ?? 'Edgard Vargas';
  const assignedByLabel = displayName
    ? `${displayName}${primaryParksRoleLabel ? ' (Director Comercial)' : ''}`
    : 'Héctor Montelongo (Director Comercial)';

  const isCompact = variant === 'compact';

  const visibleLeads = isCompact
    ? leads.slice(0, PARKS_UNASSIGNED_LEADS_PREVIEW_COUNT)
    : leads;
  const hiddenLeadCount = isCompact
    ? Math.max(0, leads.length - PARKS_UNASSIGNED_LEADS_PREVIEW_COUNT)
    : 0;

  const handleAssign = async (opportunityId: string) => {
    const leasingOfficerName =
      selectedLoByLeadId[opportunityId] ?? defaultLeasingOfficer;

    setAssigningLeadId(opportunityId);
    setErrorMessage(null);

    try {
      await assignParksLead({
        opportunityId,
        leasingOfficerName,
        assignedBy: assignedByLabel,
      });

      setLeads((previous) =>
        previous.filter((lead) => lead.id !== opportunityId),
      );
      setSelectedLoByLeadId((previous) => {
        const next = { ...previous };
        delete next[opportunityId];
        return next;
      });
      onAssigned?.({ opportunityId, leasingOfficerName });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`No se pudo asignar`,
      );
    } finally {
      setAssigningLeadId(null);
    }
  };

  if (isLoading) {
    return (
      <StyledPanel>
        <StyledHint>{t`Cargando leads sin asignar…`}</StyledHint>
      </StyledPanel>
    );
  }

  if (leads.length === 0 && !errorMessage) {
    if (isCompact) {
      return (
        <StyledPanel>
          <StyledHint>{t`No hay leads pendientes de asignación Director Comercial.`}</StyledHint>
        </StyledPanel>
      );
    }

    return (
      <StyledPanel>
        <StyledTitle>{t`Leads sin asignar (Director Comercial)`}</StyledTitle>
        <StyledHint>{t`No hay leads pendientes de asignación.`}</StyledHint>
      </StyledPanel>
    );
  }

  return (
    <StyledPanel>
      <StyledHeader>
        <StyledTitle>{t`Leads sin asignar (Director Comercial)`}</StyledTitle>
        <StyledCount>
          {leads.length === 1
            ? t`1 pendiente`
            : t`${leads.length} pendientes`}
        </StyledCount>
      </StyledHeader>
      <StyledHint>
        {t`Asigna cada lead a un Leasing Officer. Se crea tarea de contacto en 24h.`}
      </StyledHint>
      {errorMessage && (
        <StyledLeadMeta style={{ color: 'inherit' }}>{errorMessage}</StyledLeadMeta>
      )}
      <StyledLeadList>
        {visibleLeads.map((lead) => {
          const canalLabel = formatParksCanalOrigenLabel(lead.canalOrigen);
          const ubicacionLabel = formatParksUbicacionDeseadaLabel(
            lead.ubicacionDeseada,
          );
          const m2Label = lead.m2Requeridos
            ? `${lead.m2Requeridos.toLocaleString('es-MX')} m²`
            : null;
          const ageLabel = formatParksLeadAgeLabel(lead.createdAt);
          const detailParts = [ubicacionLabel, m2Label, ageLabel].filter(
            Boolean,
          );
          const isAssigning = assigningLeadId === lead.id;

          return (
            <StyledRow key={lead.id}>
              <StyledLeadInfo>
                <StyledLeadName>{lead.name ?? lead.id}</StyledLeadName>
                {lead.folio ? (
                  <StyledLeadMeta>
                    <strong>{lead.folio}</strong>
                  </StyledLeadMeta>
                ) : null}
                <StyledLeadMetaRow>
                  {canalLabel ? (
                    <StyledCanalBadge>{canalLabel}</StyledCanalBadge>
                  ) : (
                    <StyledCanalBadge>{t`Sin canal`}</StyledCanalBadge>
                  )}
                  {detailParts.length > 0 && (
                    <StyledLeadMeta>{detailParts.join(' · ')}</StyledLeadMeta>
                  )}
                </StyledLeadMetaRow>
              </StyledLeadInfo>
              <StyledActions>
                <StyledParksSelect
                  value={
                    selectedLoByLeadId[lead.id] ?? defaultLeasingOfficer
                  }
                  disabled={isAssigning || assigningLeadId !== null}
                  onChange={(event) =>
                    setSelectedLoByLeadId((previous) => ({
                      ...previous,
                      [lead.id]: event.target.value,
                    }))
                  }
                >
                  {leasingOfficerOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </StyledParksSelect>
                <Button
                  title={isAssigning ? t`Asignando…` : t`Asignar a LO`}
                  size="small"
                  variant="secondary"
                  disabled={assigningLeadId !== null}
                  onClick={() => {
                    void handleAssign(lead.id);
                  }}
                />
              </StyledActions>
            </StyledRow>
          );
        })}
      </StyledLeadList>
      {isCompact && hiddenLeadCount > 0 && (
        <StyledFooter>
          <StyledVerMasLink to={PARKS_LEADS_CEM_PATH}>
            {t`Ver más (${hiddenLeadCount})`}
          </StyledVerMasLink>
        </StyledFooter>
      )}
    </StyledPanel>
  );
};
