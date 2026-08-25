import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { ParksSegmentedControl } from '@/parks-industrial/components/ui/ParksSegmentedControl';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { getLegalEstatusLabel } from '@/parks-industrial/constants/parks-legal-workflow.constants';
import {
  PARKS_BRAND,
  PARKS_VIBE,
} from '@/parks-industrial/constants/parks-theme.constants';
import { type ParksCasoLegalRecord } from '@/parks-industrial/hooks/useParksRecords';
import {
  getParksLegalLawyerInitials,
  getParksLegalSemaforoBadgeColor,
  getParksLegalSemaforoLabel,
} from '@/parks-industrial/utils/parks-format.util';

type ParksContratosLayout = 'tarjetas' | 'lista';

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

const StyledTableShell = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${PARKS_VIBE.radiusMd};
  overflow: hidden;
`;

const StyledTableScroll = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  min-width: 760px;
  width: 100%;
`;

const StyledTableHeadCell = styled.th`
  background: ${themeCssVariables.background.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  text-align: left;
  white-space: nowrap;
`;

const StyledTableRow = styled.tr`
  cursor: pointer;
  transition: background 0.12s ease;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  &:not(:last-child) td {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledTableCell = styled.td`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  vertical-align: middle;
`;

const StyledReferenciaLink = styled.span`
  color: ${PARKS_BRAND.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledSecondaryText = styled.span`
  color: ${themeCssVariables.font.color.secondary};
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
  const navigate = useNavigate();
  const [layout, setLayout] = useState<ParksContratosLayout>('tarjetas');

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

      <ParksSectionCard
        title={t`Expedientes`}
        accent="green"
        action={
          <ParksSegmentedControl
            value={layout}
            onChange={setLayout}
            options={[
              { id: 'tarjetas', label: t`Tarjetas` },
              { id: 'lista', label: t`Lista` },
            ]}
          />
        }
      >
        {sortedCasos.length === 0 ? (
          <ParksEmptyState
            title={t`No hay contratos en aprobación`}
            description={t`Los casos legales aparecerán aquí cuando entren al flujo de revisión.`}
          />
        ) : layout === 'lista' ? (
          <StyledTableShell>
            <StyledTableScroll>
              <StyledTable>
                <thead>
                  <tr>
                    <StyledTableHeadCell>{t`Referencia`}</StyledTableHeadCell>
                    <StyledTableHeadCell>{t`Inquilino`}</StyledTableHeadCell>
                    <StyledTableHeadCell>{t`Nave`}</StyledTableHeadCell>
                    <StyledTableHeadCell>{t`Semáforo`}</StyledTableHeadCell>
                    <StyledTableHeadCell>{t`Estatus`}</StyledTableHeadCell>
                    <StyledTableHeadCell>{t`Abogado`}</StyledTableHeadCell>
                  </tr>
                </thead>
                <tbody>
                  {sortedCasos.map((caso) => (
                    <StyledTableRow
                      key={caso.id}
                      onClick={() =>
                        navigate(
                          getAppPath(AppPath.ParksContratoAprobacion, {
                            contratoId: caso.id,
                          }),
                        )
                      }
                    >
                      <StyledTableCell>
                        <StyledReferenciaLink>
                          {caso.referencia ?? t`Sin referencia`}
                        </StyledReferenciaLink>
                      </StyledTableCell>
                      <StyledTableCell>
                        {caso.inquilino?.empresa ?? t`Sin inquilino`}
                      </StyledTableCell>
                      <StyledTableCell>
                        <StyledSecondaryText>
                          {caso.nave?.identificador ?? t`Sin nave`}
                        </StyledSecondaryText>
                      </StyledTableCell>
                      <StyledTableCell>
                        <ParksStatusBadge
                          color={getParksLegalSemaforoBadgeColor(caso.semaforo)}
                          label={getParksLegalSemaforoLabel(caso.semaforo)}
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <ParksStatusBadge
                          color="blue"
                          label={getLegalEstatusLabel(caso.estatus)}
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <StyledSecondaryText>
                          {caso.abogadoAsignado?.trim() || t`Sin asignar`}
                        </StyledSecondaryText>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </tbody>
              </StyledTable>
            </StyledTableScroll>
          </StyledTableShell>
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
