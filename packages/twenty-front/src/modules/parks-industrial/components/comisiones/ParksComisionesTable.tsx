import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useMemo, useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import {
  IconCoins,
  IconCurrencyDollar,
  IconTarget,
  IconUsers,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksComisionesSummary } from '@/parks-industrial/components/comisiones/ParksComisionesSummary';
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
import { StyledParksInput } from '@/parks-industrial/components/ui/parks-form-control.styles';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { type ParksComisionRecord } from '@/parks-industrial/hooks/useParksRecords';
import { registerParksPayment } from '@/parks-industrial/services/parks-operations.client';
import {
  formatParksUsd,
  getParksComisionStatusColor,
} from '@/parks-industrial/utils/parks-format.util';

const StyledFilter = styled(StyledParksInput)`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  max-width: 320px;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledTableWrapper = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 720px;
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

const StyledFooter = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const getComisionStatusLabel = (estatus?: string | null): string => {
  if (estatus === 'APROBADA' || estatus === 'Aprobada') {
    return t`Aprobada`;
  }

  if (
    estatus === 'PENDIENTE' ||
    estatus === 'Pendiente' ||
    estatus === 'CALCULADA' ||
    estatus === 'Calculada'
  ) {
    return t`Pendiente`;
  }

  return estatus ?? t`Pendiente`;
};

const isPendingComision = (estatus?: string | null): boolean => {
  if (!estatus) {
    return true;
  }

  const normalized = estatus.toUpperCase();

  return (
    normalized.includes('PENDIENTE') || normalized.includes('CALCULADA')
  );
};

type ParksComisionesTableProps = {
  comisiones: ParksComisionRecord[];
};

export const ParksComisionesTable = ({
  comisiones,
}: ParksComisionesTableProps) => {
  const [items, setItems] = useState(comisiones);
  const [brokerFilter, setBrokerFilter] = useState('');
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  useEffect(() => {
    setItems(comisiones);
  }, [comisiones]);

  const filtered = useMemo(() => {
    if (!brokerFilter) {
      return items;
    }

    return items.filter((comision) =>
      (comision.beneficiario ?? '')
        .toLowerCase()
        .includes(brokerFilter.toLowerCase()),
    );
  }, [brokerFilter, items]);

  const totalPendiente = filtered
    .filter((comision) => isPendingComision(comision.estatus))
    .reduce((sum, comision) => sum + (comision.montoUsd ?? 0), 0);

  const totalMonto = filtered.reduce(
    (sum, comision) => sum + (comision.montoUsd ?? 0),
    0,
  );

  const pendingCount = filtered.filter((comision) =>
    isPendingComision(comision.estatus),
  ).length;

  const brokerCount = new Set(
    filtered.map((comision) => comision.beneficiario).filter(Boolean),
  ).size;

  const handleRegisterPayment = async (comisionId: string) => {
    setItems((previous) =>
      previous.map((comision) =>
        comision.id === comisionId
          ? { ...comision, estatus: 'APROBADA' }
          : comision,
      ),
    );

    try {
      const result = await registerParksPayment(comisionId);
      setPaymentMessage(result.message);
    } catch {
      setItems(comisiones);
      setPaymentMessage(t`No se pudo registrar el pago`);
    }
  };

  return (
    <StyledParksPageStack>
      <ParksPageHero
        eyebrow={t`Parks Industrial · Comercial`}
        title={t`Comisiones y ranking`}
        subtitle={t`Monitorea montos pendientes, registra pagos y reconoce el desempeño de brokers en el periodo.`}
        actions={[
          {
            to: AppPath.ParksMiDesempeno,
            label: t`Mi desempeño`,
            icon: IconTarget,
          },
        ]}
        stats={[
          {
            label: t`Total filtrado`,
            value: formatParksUsd(totalMonto),
            hint: t`Suma de montos`,
          },
          {
            label: t`Pendiente`,
            value: formatParksUsd(totalPendiente),
            hint: t`${pendingCount} comisiones`,
          },
          {
            label: t`Brokers`,
            value: String(brokerCount),
            hint: t`En el filtro`,
          },
          {
            label: t`Registros`,
            value: String(filtered.length),
            hint: t`Filas visibles`,
          },
        ]}
      />

      <ParksDashboardFeaturedMetrics>
        <ParksDashboardFeaturedMetric
          label={t`Total comisiones`}
          value={formatParksUsd(totalMonto)}
          hint={t`Vista filtrada`}
          icon={IconCoins}
          accent="green"
        />
        <ParksDashboardFeaturedMetric
          label={t`Pendiente de pago`}
          value={formatParksUsd(totalPendiente)}
          hint={t`${pendingCount} por liquidar`}
          icon={IconCurrencyDollar}
          accent={pendingCount > 0 ? 'orange' : 'green'}
        />
        <ParksDashboardFeaturedMetric
          label={t`Brokers activos`}
          value={String(brokerCount)}
          hint={t`En ranking / tabla`}
          icon={IconUsers}
          accent="blue"
        />
      </ParksDashboardFeaturedMetrics>

      <ParksComisionesSummary comisiones={items} />

      <ParksSectionCard title={t`Comisiones registradas`} accent="green">
        <StyledToolbar>
          <StyledFilter
            type="search"
            placeholder={t`Filtrar por broker...`}
            value={brokerFilter}
            onChange={(event) => setBrokerFilter(event.target.value)}
          />
          {paymentMessage ? (
            <ParksStatusBadge color="green" label={paymentMessage} />
          ) : null}
        </StyledToolbar>

        {filtered.length === 0 ? (
          <ParksEmptyState title={t`No hay comisiones para mostrar`} />
        ) : (
          <StyledTableWrapper>
            <StyledTable>
              <thead>
                <tr>
                  <StyledHeaderCell>{t`Broker`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Deal / contrato`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Nave`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Monto`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Estatus`}</StyledHeaderCell>
                  <StyledHeaderCell>{t`Acciones`}</StyledHeaderCell>
                </tr>
              </thead>
              <tbody>
                {filtered.map((comision) => (
                  <tr key={comision.id}>
                    <StyledCell>{comision.beneficiario ?? '—'}</StyledCell>
                    <StyledCell>
                      {comision.casoLegal?.referencia ??
                        comision.hojaDeAcuerdos?.referencia ??
                        '—'}
                    </StyledCell>
                    <StyledCell>
                      {comision.hojaDeAcuerdos?.nave?.identificador ?? '—'}
                    </StyledCell>
                    <StyledCell>{formatParksUsd(comision.montoUsd)}</StyledCell>
                    <StyledCell>
                      <ParksStatusBadge
                        color={getParksComisionStatusColor(comision.estatus)}
                        label={getComisionStatusLabel(comision.estatus)}
                      />
                    </StyledCell>
                    <StyledCell>
                      {isPendingComision(comision.estatus) ? (
                        <Button
                          title={t`Registrar pago`}
                          onClick={() =>
                            void handleRegisterPayment(comision.id)
                          }
                        />
                      ) : (
                        '—'
                      )}
                    </StyledCell>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </StyledTableWrapper>
        )}
      </ParksSectionCard>

      <StyledFooter>
        {t`Total comisiones pendientes`}: {formatParksUsd(totalPendiente)}
      </StyledFooter>
    </StyledParksPageStack>
  );
};
