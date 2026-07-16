import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { IconBriefcase, IconCoins, IconPlus, IconUsers } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksNewEmpresaBrokerModal } from '@/parks-industrial/components/brokers/ParksNewEmpresaBrokerModal';
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
  updateParksEmpresaBroker,
  type ParksEmpresaBroker,
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
  min-width: 960px;
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

type ParksEmpresasBrokerTableProps = {
  empresas: ParksEmpresaBroker[];
  onEmpresasChanged: (empresas: ParksEmpresaBroker[]) => void;
};

export const ParksEmpresasBrokerTable = ({
  empresas,
  onEmpresasChanged,
}: ParksEmpresasBrokerTableProps) => {
  const [nameFilter, setNameFilter] = useState('');
  const [isNewEmpresaModalOpen, setIsNewEmpresaModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] =
    useState<ParksEmpresaBroker | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!nameFilter.trim()) {
      return empresas;
    }

    const normalized = nameFilter.trim().toLowerCase();

    return empresas.filter((empresa) =>
      (empresa.nombre ?? '').toLowerCase().includes(normalized),
    );
  }, [empresas, nameFilter]);

  const totalComisionesUsd = empresas.reduce(
    (sum, empresa) => sum + (empresa.totalComisionesUsd ?? 0),
    0,
  );
  const totalBrokersCount = empresas.reduce(
    (sum, empresa) => sum + (empresa.brokersCount ?? 0),
    0,
  );
  const activasCount = empresas.filter(
    (empresa) => empresa.activo !== false,
  ).length;

  const handleToggleActivo = async (empresa: ParksEmpresaBroker) => {
    const updated = await updateParksEmpresaBroker(empresa.id, {
      activo: !(empresa.activo !== false),
    });

    onEmpresasChanged(
      empresas.map((item) =>
        item.id === empresa.id ? { ...item, ...updated } : item,
      ),
    );
  };

  return (
    <StyledParksPageStack>
      <ParksPageHero
        eyebrow={t`Parks Industrial · Comercial`}
        title={t`Empresas de brokers`}
        subtitle={t`Directorio de firmas de brokers, su comisión pactada, sectores y zonas de operación.`}
        stats={[
          {
            label: t`Empresas activas`,
            value: String(activasCount),
            hint: t`${empresas.length} registradas`,
          },
          {
            label: t`Brokers vinculados`,
            value: String(totalBrokersCount),
            hint: t`En todas las empresas`,
          },
          {
            label: t`Comisiones totales`,
            value: formatParksUsd(totalComisionesUsd),
            hint: t`Histórico`,
          },
        ]}
      />

      <ParksDashboardFeaturedMetrics>
        <ParksDashboardFeaturedMetric
          label={t`Empresas registradas`}
          value={String(empresas.length)}
          hint={t`${activasCount} activas`}
          icon={IconBriefcase}
          accent="blue"
        />
        <ParksDashboardFeaturedMetric
          label={t`Brokers vinculados`}
          value={String(totalBrokersCount)}
          hint={t`Personas registradas`}
          icon={IconUsers}
          accent="purple"
        />
        <ParksDashboardFeaturedMetric
          label={t`Comisiones totales`}
          value={formatParksUsd(totalComisionesUsd)}
          hint={t`Todos los estatus`}
          icon={IconCoins}
          accent="green"
        />
      </ParksDashboardFeaturedMetrics>

      <ParksSectionCard title={t`Directorio de empresas`} accent="blue">
        <StyledToolbar>
          <StyledFilter
            type="search"
            placeholder={t`Buscar empresa...`}
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
          />
          <ParksActionButton
            title={t`Nueva empresa`}
            size="sm"
            Icon={IconPlus}
            onClick={() => setIsNewEmpresaModalOpen(true)}
          />
        </StyledToolbar>

        {statusMessage ? (
          <ParksStatusBadge color="green" label={statusMessage} />
        ) : null}

        {filtered.length === 0 ? (
          <ParksEmptyState
            title={t`No hay empresas de brokers registradas`}
            description={t`Crea la primera empresa para poder registrar a sus brokers.`}
          />
        ) : (
          <StyledTableWrapper>
            <StyledTable>
              <thead>
                <tr>
                  <StyledHeaderCell>{t`Empresa`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Clasificación`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`% Nuevo`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`% Preventa`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`% Renov.`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Sectores`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Zonas`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Brokers`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Comisión total`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Estatus`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Acciones`}</StyledHeaderCell>
                </tr>
              </thead>
              <tbody>
                {filtered.map((empresa) => (
                  <tr key={empresa.id}>
                    <StyledCell>
                      <StyledCompanyName>{empresa.nombre}</StyledCompanyName>
                      <StyledContactMeta>
                        {empresa.contactoPrincipal ?? empresa.email ?? '—'}
                      </StyledContactMeta>
                    </StyledCell>
                    <StyledCell>
                      <ParksStatusBadge
                        color={getClasificacionColor(empresa.clasificacion)}
                        label={
                          getClasificacionColor(empresa.clasificacion) ===
                          'green'
                            ? t`Top 10`
                            : t`No top 10`
                        }
                      />
                    </StyledCell>
                    <StyledCell>
                      {empresa.comisionPctNuevo ?? empresa.comisionPct ?? '—'}
                      {(empresa.comisionPctNuevo ?? empresa.comisionPct) !=
                      null
                        ? '%'
                        : ''}
                    </StyledCell>
                    <StyledCell>
                      {empresa.comisionPctPreventa ?? '—'}
                      {empresa.comisionPctPreventa != null ? '%' : ''}
                    </StyledCell>
                    <StyledCell>
                      {empresa.comisionPctRenovacion ?? '—'}
                      {empresa.comisionPctRenovacion != null ? '%' : ''}
                    </StyledCell>
                    <StyledCell>{empresa.sectores || '—'}</StyledCell>
                    <StyledCell>{empresa.zonasOperacion || '—'}</StyledCell>
                    <StyledCell>{empresa.brokersCount ?? 0}</StyledCell>
                    <StyledCell>
                      {formatParksUsd(empresa.totalComisionesUsd ?? 0)}
                    </StyledCell>
                    <StyledCell>
                      <ParksActionButton
                        title={
                          empresa.activo !== false ? t`Activo` : t`Inactivo`
                        }
                        size="sm"
                        variant={
                          empresa.activo !== false ? 'secondary' : 'ghost'
                        }
                        onClick={() => {
                          void handleToggleActivo(empresa);
                        }}
                      />
                    </StyledCell>
                    <StyledCell>
                      <ParksActionButton
                        title={t`Editar`}
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingEmpresa(empresa)}
                      />
                    </StyledCell>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </StyledTableWrapper>
        )}
      </ParksSectionCard>

      {isNewEmpresaModalOpen ? (
        <ParksNewEmpresaBrokerModal
          onClose={() => setIsNewEmpresaModalOpen(false)}
          onCreated={(empresa) => {
            onEmpresasChanged([empresa, ...empresas]);
            setStatusMessage(t`Empresa creada: ${empresa.nombre ?? ''}`);
          }}
        />
      ) : null}

      {editingEmpresa ? (
        <ParksNewEmpresaBrokerModal
          initialEmpresa={editingEmpresa}
          onClose={() => setEditingEmpresa(null)}
          onCreated={(empresa) => {
            onEmpresasChanged(
              empresas.map((item) =>
                item.id === empresa.id ? { ...item, ...empresa } : item,
              ),
            );
            setStatusMessage(t`Empresa actualizada: ${empresa.nombre ?? ''}`);
            setEditingEmpresa(null);
          }}
        />
      ) : null}
    </StyledParksPageStack>
  );
};
