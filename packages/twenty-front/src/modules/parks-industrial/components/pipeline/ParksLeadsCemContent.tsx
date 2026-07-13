import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import {
  IconAlertTriangle,
  IconClock,
  IconLayoutKanban,
  IconUserPlus,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  ParksDashboardFeaturedMetric,
  ParksDashboardFeaturedMetrics,
} from '@/parks-industrial/components/dashboard/ParksDashboardFeaturedMetrics';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import {
  ParksSectionCard,
  StyledParksPageStack,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { StyledParksSelect } from '@/parks-industrial/components/ui/parks-form-control.styles';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { useParksLeasingOfficerOptions } from '@/parks-industrial/hooks/useParksLeasingOfficerOptions';
import { useParksUnassignedLeads } from '@/parks-industrial/hooks/useParksUnassignedLeads';
import { assignParksLead } from '@/parks-industrial/services/parks-commercial.client';
import {
  formatParksCanalOrigenLabel,
  formatParksLeadAgeLabel,
  formatParksUbicacionDeseadaLabel,
} from '@/parks-industrial/utils/parks-unassigned-leads.util';

const StyledCardGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;

const StyledLeadCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left: 4px solid ${PARKS_BRAND.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.strong};
    transform: translateY(-1px);
  }
`;

const StyledLeadName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledLeadMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledActions = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[3]};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
`;

const getLeadAgeHours = (createdAt?: string): number => {
  if (!createdAt) {
    return 0;
  }

  const createdAtMs = Date.parse(createdAt);

  if (Number.isNaN(createdAtMs)) {
    return 0;
  }

  return Math.floor((Date.now() - createdAtMs) / (1000 * 60 * 60));
};

export const ParksLeadsCemContent = () => {
  const {
    leads,
    setLeads,
    isLoading,
    errorMessage,
    setErrorMessage,
  } = useParksUnassignedLeads();
  const leasingOfficerOptions = useParksLeasingOfficerOptions();
  const { displayName, primaryParksRoleLabel } = useParksAccess();
  const [selectedLoByLeadId, setSelectedLoByLeadId] = useState<
    Record<string, string>
  >({});
  const [assigningLeadId, setAssigningLeadId] = useState<string | null>(null);

  const defaultLeasingOfficer = leasingOfficerOptions[0] ?? 'Edgard Vargas';
  const assignedByLabel = displayName
    ? `${displayName}${primaryParksRoleLabel ? ' (CEM)' : ''}`
    : 'Héctor Montelongo (CEM)';

  const staleLeadsCount = leads.filter(
    (lead) => getLeadAgeHours(lead.createdAt) >= 24,
  ).length;
  const canalCount = new Set(
    leads.map((lead) => lead.canalOrigen).filter(Boolean),
  ).size;

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
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`No se pudo asignar`,
      );
    } finally {
      setAssigningLeadId(null);
    }
  };

  if (isLoading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  return (
    <StyledParksPageStack>
      <ParksPageHero
        eyebrow={t`Parks Industrial · Comercial`}
        title={t`Cola de leads CEM`}
        subtitle={t`Asigna cada lead a un Leasing Officer. Se crea tarea de contacto en 24h para no perder velocidad comercial.`}
        actions={[
          {
            to: AppPath.ParksPipeline,
            label: t`Pipeline comercial`,
            icon: IconLayoutKanban,
          },
        ]}
        stats={[
          {
            label: t`Sin asignar`,
            value: String(leads.length),
            hint: t`Pendientes CEM`,
          },
          {
            label: t`+24 horas`,
            value: String(staleLeadsCount),
            hint: t`Priorizar hoy`,
          },
          {
            label: t`Canales`,
            value: String(canalCount),
            hint: t`Orígenes activos`,
          },
          {
            label: t`LO disponibles`,
            value: String(leasingOfficerOptions.length),
            hint: t`Para asignar`,
          },
        ]}
      />

      <ParksDashboardFeaturedMetrics>
        <ParksDashboardFeaturedMetric
          label={t`Leads sin asignar`}
          value={String(leads.length)}
          hint={t`Cola CEM`}
          icon={IconUserPlus}
          accent="green"
        />
        <ParksDashboardFeaturedMetric
          label={t`Antiguos (+24h)`}
          value={String(staleLeadsCount)}
          hint={t`Riesgo de enfriamiento`}
          icon={IconClock}
          accent={staleLeadsCount > 0 ? 'orange' : 'green'}
        />
        <ParksDashboardFeaturedMetric
          label={t`Canales distintos`}
          value={String(canalCount)}
          hint={t`Diversidad de origen`}
          icon={IconAlertTriangle}
          accent="blue"
        />
      </ParksDashboardFeaturedMetrics>

      {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}

      <ParksSectionCard title={t`Leads pendientes`} accent="green">
        {leads.length === 0 ? (
          <ParksEmptyState
            title={t`No hay leads pendientes`}
            description={t`La cola CEM está vacía. Los nuevos leads sin asignar aparecerán aquí.`}
          />
        ) : (
          <StyledCardGrid>
            {leads.map((lead) => {
              const canalLabel = formatParksCanalOrigenLabel(lead.canalOrigen);
              const ubicacionLabel = formatParksUbicacionDeseadaLabel(
                lead.ubicacionDeseada,
              );
              const m2Label = lead.m2Requeridos
                ? `${lead.m2Requeridos.toLocaleString('es-MX')} m²`
                : null;
              const ageLabel = formatParksLeadAgeLabel(lead.createdAt);
              const isAssigning = assigningLeadId === lead.id;
              const isStale = getLeadAgeHours(lead.createdAt) >= 24;

              return (
                <StyledLeadCard key={lead.id}>
                  <div>
                    <StyledLeadName>{lead.name ?? lead.id}</StyledLeadName>
                    <StyledLeadMeta>
                      {[ubicacionLabel, m2Label, ageLabel]
                        .filter(Boolean)
                        .join(' · ')}
                    </StyledLeadMeta>
                  </div>
                  <StyledBadges>
                    <ParksStatusBadge
                      color="blue"
                      label={canalLabel ?? t`Sin canal`}
                    />
                    {isStale ? (
                      <ParksStatusBadge color="orange" label={t`+24h`} />
                    ) : null}
                  </StyledBadges>
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
                      title={isAssigning ? t`Asignando…` : t`Asignar`}
                      size="small"
                      variant="secondary"
                      disabled={assigningLeadId !== null}
                      onClick={() => {
                        void handleAssign(lead.id);
                      }}
                    />
                  </StyledActions>
                </StyledLeadCard>
              );
            })}
          </StyledCardGrid>
        )}
      </ParksSectionCard>
    </StyledParksPageStack>
  );
};
