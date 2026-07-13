import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import {
  IconAlertTriangle,
  IconFileCheck,
  IconFileText,
  IconLayoutKanban,
  IconShield,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  ParksDashboardFeaturedMetric,
  ParksDashboardFeaturedMetrics,
} from '@/parks-industrial/components/dashboard/ParksDashboardFeaturedMetrics';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import {
  ParksSectionCard,
  StyledParksPageStack,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { getLegalEstatusLabel } from '@/parks-industrial/constants/parks-legal-workflow.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { type ParksCasoLegalRecord } from '@/parks-industrial/hooks/useParksRecords';
import {
  getParksLegalLawyerInitials,
  getParksLegalSemaforoBadgeColor,
  getParksLegalSemaforoLabel,
} from '@/parks-industrial/utils/parks-format.util';

const StyledCardGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`;

const StyledCard = styled(Link)<{ accentColor: string }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left: 4px solid ${({ accentColor }) => accentColor};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: block;
  padding: ${themeCssVariables.spacing[3]};
  text-decoration: none;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.strong};
    transform: translateY(-1px);
  }
`;

const StyledCardHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledReferencia = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledAvatar = styled.div`
  align-items: center;
  background: ${PARKS_BRAND.primarySoft};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: 50%;
  color: ${PARKS_BRAND.primary};
  display: flex;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-top: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const getSemaforoAccent = (semaforo?: string | null): string => {
  if (semaforo === 'ROJO') {
    return themeCssVariables.color.red;
  }

  if (semaforo === 'AMARILLO' || semaforo === 'NARANJA') {
    return themeCssVariables.color.orange;
  }

  if (semaforo === 'VERDE') {
    return PARKS_BRAND.primary;
  }

  return themeCssVariables.font.color.secondary;
};

const isEnRiesgo = (semaforo?: string | null): boolean =>
  semaforo === 'ROJO' || semaforo === 'NARANJA' || semaforo === 'AMARILLO';

type ParksContratosListProps = {
  casosLegales: ParksCasoLegalRecord[];
};

export const ParksContratosList = ({
  casosLegales,
}: ParksContratosListProps) => {
  const sortedCasos = [...casosLegales].sort((left, right) => {
    if (left.semaforo === 'ROJO' && right.semaforo !== 'ROJO') {
      return -1;
    }

    if (right.semaforo === 'ROJO' && left.semaforo !== 'ROJO') {
      return 1;
    }

    return (left.referencia ?? '').localeCompare(right.referencia ?? '');
  });

  const enRiesgoCount = sortedCasos.filter((caso) =>
    isEnRiesgo(caso.semaforo),
  ).length;
  const verdesCount = sortedCasos.filter(
    (caso) => caso.semaforo === 'VERDE',
  ).length;

  return (
    <StyledParksPageStack>
      <ParksPageHero
        eyebrow={t`Parks Industrial · Legal`}
        title={t`Contratos en aprobación`}
        subtitle={t`Casos legales ordenados por prioridad de semáforo. Abre cada expediente para continuar el workflow.`}
        actions={[
          {
            to: AppPath.ParksLegalPipeline,
            label: t`Pipeline legal`,
            icon: IconLayoutKanban,
          },
          {
            to: AppPath.ParksLegalDashboard,
            label: t`Dashboard legal`,
            icon: IconShield,
          },
        ]}
        stats={[
          {
            label: t`Casos activos`,
            value: String(sortedCasos.length),
            hint: t`En cartera`,
          },
          {
            label: t`Requieren atención`,
            value: String(enRiesgoCount),
            hint: t`Rojo / naranja / amarillo`,
          },
          {
            label: t`Semáforo verde`,
            value: String(verdesCount),
            hint: t`En buen ritmo`,
          },
          {
            label: t`En revisión`,
            value: String(sortedCasos.length - verdesCount),
            hint: t`Sin verde`,
          },
        ]}
      />

      <ParksDashboardFeaturedMetrics>
        <ParksDashboardFeaturedMetric
          label={t`Casos activos`}
          value={String(sortedCasos.length)}
          hint={t`Expedientes legales`}
          icon={IconFileText}
          accent="green"
        />
        <ParksDashboardFeaturedMetric
          label={t`Requieren atención`}
          value={String(enRiesgoCount)}
          hint={t`Priorizar hoy`}
          icon={IconAlertTriangle}
          accent={enRiesgoCount > 0 ? 'red' : 'green'}
        />
        <ParksDashboardFeaturedMetric
          label={t`Listos / verdes`}
          value={String(verdesCount)}
          hint={t`Semáforo saludable`}
          icon={IconFileCheck}
          accent="blue"
        />
      </ParksDashboardFeaturedMetrics>

      <ParksSectionCard title={t`Expedientes`} accent="green">
        {sortedCasos.length === 0 ? (
          <ParksEmptyState
            title={t`No hay contratos en aprobación`}
            description={t`Los casos legales aparecerán aquí cuando entren al flujo de revisión.`}
          />
        ) : (
          <StyledCardGrid>
            {sortedCasos.map((caso) => (
              <StyledCard
                key={caso.id}
                accentColor={getSemaforoAccent(caso.semaforo)}
                to={getAppPath(AppPath.ParksContratoAprobacion, {
                  contratoId: caso.id,
                })}
              >
                <StyledCardHeader>
                  <div>
                    <StyledReferencia>
                      {caso.referencia ?? t`Sin referencia`}
                    </StyledReferencia>
                    <StyledMeta>
                      {caso.inquilino?.empresa ?? t`Sin inquilino`} ·{' '}
                      {caso.nave?.identificador ?? t`Sin nave`}
                    </StyledMeta>
                  </div>
                  <StyledAvatar>
                    {getParksLegalLawyerInitials(caso.abogadoAsignado)}
                  </StyledAvatar>
                </StyledCardHeader>
                <StyledBadges>
                  <ParksStatusBadge
                    color={getParksLegalSemaforoBadgeColor(caso.semaforo)}
                    label={getParksLegalSemaforoLabel(caso.semaforo)}
                  />
                  <ParksStatusBadge
                    color="blue"
                    label={getLegalEstatusLabel(caso.estatus)}
                  />
                </StyledBadges>
                <StyledFooter>{t`Ver aprobación →`}</StyledFooter>
              </StyledCard>
            ))}
          </StyledCardGrid>
        )}
      </ParksSectionCard>
    </StyledParksPageStack>
  );
};
