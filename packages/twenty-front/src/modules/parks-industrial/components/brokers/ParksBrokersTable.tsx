import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { IconCoins, IconPlus, IconTrendingUp, IconUsers } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksNewBrokerModal } from '@/parks-industrial/components/brokers/ParksNewBrokerModal';
import {
  ParksDashboardFeaturedMetric,
  ParksDashboardFeaturedMetrics,
} from '@/parks-industrial/components/dashboard/ParksDashboardFeaturedMetrics';
import { ParksActionButton } from '@/parks-industrial/components/ui/ParksActionButton';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import {
  ParksSectionCard,
  StyledParksPageStack,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { StyledParksInput } from '@/parks-industrial/components/ui/parks-form-control.styles';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import {
  updateParksBroker,
  type ParksBroker,
} from '@/parks-industrial/services/parks-commercial.client';
import { formatParksUsd } from '@/parks-industrial/utils/parks-format.util';

const StyledFilter = styled(StyledParksInput)`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  max-width: 320px;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledTableWrapper = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 900px;
  width: 100%;
`;

const StyledHeaderCell = styled.th`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.secondary};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[2]};
  text-align: left;
`;

const StyledCell = styled.td`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledCompanyName = styled.div`
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledContactMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const getClasificacionColor = (clasificacion?: string): 'green' | 'gray' =>
  clasificacion === 'TOP_10' || clasificacion === 'Top 10' ? 'green' : 'gray';

type ParksBrokersTableProps = {
  brokers: ParksBroker[];
  onBrokersChanged: (brokers: ParksBroker[]) => void;
};

export const ParksBrokersTable = ({
  brokers,
  onBrokersChanged,
}: ParksBrokersTableProps) => {
  const [nameFilter, setNameFilter] = useState('');
  const [isNewBrokerModalOpen, setIsNewBrokerModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!nameFilter.trim()) {
      return brokers;
    }

    const normalized = nameFilter.trim().toLowerCase();

    return brokers.filter((broker) =>
      [broker.contacto, broker.empresa, broker.empresaBroker?.nombre]
        .filter(Boolean)
        .some((value) => (value ?? '').toLowerCase().includes(normalized)),
    );
  }, [brokers, nameFilter]);

  const totalComisionesUsd = brokers.reduce(
    (sum, broker) => sum + (broker.totalComisionesUsd ?? 0),
    0,
  );
  const totalPendienteUsd = brokers.reduce(
    (sum, broker) => sum + (broker.comisionesPendientesUsd ?? 0),
    0,
  );
  const activosCount = brokers.filter(
    (broker) => broker.activo !== false,
  ).length;
  const top10Count = brokers.filter(
    (broker) => getClasificacionColor(broker.clasificacion) === 'green',
  ).length;

  const handleToggleActivo = async (broker: ParksBroker) => {
    const updated = await updateParksBroker(broker.id, {
      activo: !(broker.activo !== false),
    });

    onBrokersChanged(
      brokers.map((item) =>
        item.id === broker.id ? { ...item, ...updated } : item,
      ),
    );
  };

  return (
    <StyledParksPageStack>
      <ParksPageHero
        eyebrow={t`Parks Industrial · Comercial`}
        title={t`Brokers y comisiones externas`}
        subtitle={t`Directorio de brokers, su clasificación y el estado de sus comisiones en cada Hoja de Acuerdos.`}
        stats={[
          {
            label: t`Brokers activos`,
            value: String(activosCount),
            hint: t`${brokers.length} registrados`,
          },
          {
            label: t`Top 10`,
            value: String(top10Count),
            hint: t`Comisión preferente`,
          },
          {
            label: t`Comisiones totales`,
            value: formatParksUsd(totalComisionesUsd),
            hint: t`Histórico`,
          },
          {
            label: t`Pendiente de pago`,
            value: formatParksUsd(totalPendienteUsd),
            hint: t`Por liquidar`,
          },
        ]}
      />

      <ParksDashboardFeaturedMetrics>
        <ParksDashboardFeaturedMetric
          label={t`Brokers registrados`}
          value={String(brokers.length)}
          hint={t`${activosCount} activos`}
          icon={IconUsers}
          accent="blue"
        />
        <ParksDashboardFeaturedMetric
          label={t`Comisiones totales`}
          value={formatParksUsd(totalComisionesUsd)}
          hint={t`Todos los estatus`}
          icon={IconCoins}
          accent="green"
        />
        <ParksDashboardFeaturedMetric
          label={t`Pendiente de pago`}
          value={formatParksUsd(totalPendienteUsd)}
          hint={t`Por liquidar`}
          icon={IconTrendingUp}
          accent={totalPendienteUsd > 0 ? 'orange' : 'green'}
        />
      </ParksDashboardFeaturedMetrics>

      <ParksSectionCard title={t`Directorio de brokers`} accent="blue">
        <StyledToolbar>
          <StyledFilter
            type="search"
            placeholder={t`Buscar broker...`}
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
          />
          <ParksActionButton
            title={t`Nuevo broker`}
            size="sm"
            Icon={IconPlus}
            onClick={() => setIsNewBrokerModalOpen(true)}
          />
        </StyledToolbar>

        {statusMessage ? (
          <ParksStatusBadge color="green" label={statusMessage} />
        ) : null}

        {filtered.length === 0 ? (
          <ParksEmptyState
            title={t`No hay brokers registrados`}
            description={t`Crea el primer broker para poder vincularlo a leads y calcular su comisión.`}
          />
        ) : (
          <StyledTableWrapper>
            <StyledTable>
              <thead>
                <tr>
                  <StyledHeaderCell>{t`Broker`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Empresa`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Clasificación`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Deals`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Comisión total`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Pendiente`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Estatus`}</StyledHeaderCell>
                </tr>
              </thead>
              <tbody>
                {filtered.map((broker) => (
                  <tr key={broker.id}>
                    <StyledCell>
                      <StyledCompanyName>
                        {broker.contacto ?? broker.empresa ?? '—'}
                      </StyledCompanyName>
                      <StyledContactMeta>
                        {broker.email ?? broker.telefono ?? '—'}
                      </StyledContactMeta>
                    </StyledCell>
                    <StyledCell>
                      {broker.empresaBroker?.nombre ?? broker.empresa ?? '—'}
                    </StyledCell>
                    <StyledCell>
                      <ParksStatusBadge
                        color={getClasificacionColor(broker.clasificacion)}
                        label={
                          getClasificacionColor(broker.clasificacion) ===
                          'green'
                            ? t`Top 10`
                            : t`No top 10`
                        }
                      />
                    </StyledCell>
                    <StyledCell>{broker.dealsCount ?? 0}</StyledCell>
                    <StyledCell>
                      {formatParksUsd(broker.totalComisionesUsd ?? 0)}
                    </StyledCell>
                    <StyledCell>
                      {formatParksUsd(broker.comisionesPendientesUsd ?? 0)}
                    </StyledCell>
                    <StyledCell>
                      <ParksActionButton
                        title={
                          broker.activo !== false ? t`Activo` : t`Inactivo`
                        }
                        size="sm"
                        variant={
                          broker.activo !== false ? 'secondary' : 'ghost'
                        }
                        onClick={() => {
                          void handleToggleActivo(broker);
                        }}
                      />
                    </StyledCell>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </StyledTableWrapper>
        )}
      </ParksSectionCard>

      {isNewBrokerModalOpen ? (
        <ParksNewBrokerModal
          onClose={() => setIsNewBrokerModalOpen(false)}
          onCreated={(broker) => {
            onBrokersChanged([broker, ...brokers]);
            setStatusMessage(t`Broker creado: ${broker.contacto ?? ''}`);
          }}
        />
      ) : null}
    </StyledParksPageStack>
  );
};
