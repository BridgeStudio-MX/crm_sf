import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useMemo, useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import {
  IconCoins,
  IconCurrencyDollar,
  IconDownload,
  IconTarget,
  IconUsers,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksCommissionRateMatrixPanel } from '@/parks-industrial/components/comisiones/ParksCommissionRateMatrixPanel';
import { ParksComisionesSummary } from '@/parks-industrial/components/comisiones/ParksComisionesSummary';
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
import {
  StyledParksInput,
  StyledParksSelect,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import { ParksRoleLabel } from '@/parks-industrial/constants/parks-role-access.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { type ParksComisionRecord } from '@/parks-industrial/hooks/useParksRecords';
import {
  approveParksCommission,
  fetchParksCommissionDashboard,
  fetchParksCommissionRates,
  getParksCommissionExportUrl,
  markParksCommissionPaid,
  type ParksCommissionDashboard,
  type ParksCommissionRateMatrix,
  rejectParksCommission,
  saveParksCommissionRates,
} from '@/parks-industrial/services/parks-commission.client';
import { hasAnyParksRoleLabel } from '@/parks-industrial/utils/parks-role-access.util';
import {
  formatParksUsd,
  getParksComisionStatusColor,
} from '@/parks-industrial/utils/parks-format.util';

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledFilters = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 240px;
`;

const StyledFilter = styled(StyledParksInput)`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  max-width: 280px;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledSelect = styled(StyledParksSelect)`
  max-width: 200px;
`;

const StyledTableShell = styled.div`
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

const StyledTableWrapper = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  min-width: 980px;
  width: 100%;
`;

const StyledHeaderCell = styled.th`
  background: ${PARKS_BRAND.primarySoft};
  border-bottom: 1px solid ${PARKS_BRAND.borderSoft};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;

  &[data-align='right'] {
    text-align: right;
  }

  &[data-align='center'] {
    text-align: center;
  }
`;

const StyledRow = styled.tr`
  background: ${themeCssVariables.background.primary};
  transition: background 0.12s ease;

  &:nth-child(even) {
    background: ${themeCssVariables.background.secondary};
  }

  &:hover {
    background: ${PARKS_BRAND.primarySoft};
  }

  &:last-child td {
    border-bottom: none;
  }
`;

const StyledCell = styled.td`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[3]};
  vertical-align: middle;

  &[data-align='right'] {
    text-align: right;
  }

  &[data-align='center'] {
    text-align: center;
  }
`;

const StyledPrimary = styled.div`
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 2px;
`;

const StyledAmount = styled.span`
  font-feature-settings: 'tnum';
  font-weight: ${themeCssVariables.font.weight.semiBold};
  white-space: nowrap;
`;

const StyledPct = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-feature-settings: 'tnum';
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
`;

const StyledMuted = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledFooterNotes = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const formatEnumLabel = (value?: string | null): string => {
  if (!value) {
    return '—';
  }

  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getTipoPagoLabel = (comision: ParksComisionRecord): string => {
  const raw = (comision.tipoPago ?? comision.tipo ?? '').toUpperCase();

  if (raw.includes('EXTERNO') || raw.includes('BROKER')) {
    return t`Externo`;
  }

  if (raw.includes('INTERNO') || raw.includes('INTERNA')) {
    return t`Interno`;
  }

  return formatEnumLabel(comision.tipoPago ?? comision.tipo);
};

const getComisionStatusLabel = (estatus?: string | null): string => {
  if (!estatus) {
    return t`Pendiente de autorizar`;
  }

  const normalized = estatus.toUpperCase();

  if (normalized.includes('PAGADA')) {
    return t`Pagada`;
  }

  if (
    normalized.includes('PENDIENTE DE PAGO') ||
    normalized.includes('PENDIENTE_DE_PAGO')
  ) {
    return t`Aprobada · pendiente pago`;
  }

  if (normalized.includes('APROBADA')) {
    return t`Aprobada · pendiente pago`;
  }

  if (normalized.includes('RECHAZADA')) {
    return t`Rechazada`;
  }

  if (normalized.includes('DISPUTA')) {
    return t`En disputa`;
  }

  return t`Pendiente de autorizar`;
};

const isPendingValidation = (estatus?: string | null): boolean => {
  if (!estatus) {
    return true;
  }

  const normalized = estatus.toUpperCase();

  return (
    (normalized.includes('PENDIENTE') || normalized.includes('CALCULADA')) &&
    !normalized.includes('PAGO')
  );
};

const isReadyToPay = (estatus?: string | null): boolean => {
  if (!estatus) {
    return false;
  }

  const normalized = estatus.toUpperCase();

  return (
    normalized.includes('APROBADA') ||
    normalized.includes('PENDIENTE DE PAGO') ||
    normalized.includes('PENDIENTE_DE_PAGO')
  );
};

type ParksComisionesTableProps = {
  comisiones: ParksComisionRecord[];
};

export const ParksComisionesTable = ({
  comisiones: initialComisiones,
}: ParksComisionesTableProps) => {
  const { displayName, parksRoleLabels, hasFullParksAccess } = useParksAccess();
  const canManageCommissions =
    hasFullParksAccess ||
    hasAnyParksRoleLabel(parksRoleLabels, [
      ParksRoleLabel.DirectorComercial,
      ParksRoleLabel.AdminSistema,
    ]);
  const isCeoViewer =
    !canManageCommissions &&
    hasAnyParksRoleLabel(parksRoleLabels, [ParksRoleLabel.CEO]);
  const [dashboard, setDashboard] = useState<ParksCommissionDashboard | null>(
    null,
  );
  const [items, setItems] = useState(initialComisiones);
  const [search, setSearch] = useState('');
  const [tipoPagoFilter, setTipoPagoFilter] = useState('all');
  const [estatusFilter, setEstatusFilter] = useState('all');
  const [matrix, setMatrix] = useState<ParksCommissionRateMatrix | null>(null);
  const [matrixMessage, setMatrixMessage] = useState<string | null>(null);
  const [matrixError, setMatrixError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [nextDashboard, nextMatrix] = await Promise.all([
          fetchParksCommissionDashboard(),
          fetchParksCommissionRates(),
        ]);
        setDashboard(nextDashboard);
        setItems(nextDashboard.comisiones);
        setMatrix(nextMatrix);
      } catch {
        setItems(initialComisiones);
      }
    })();
  }, [initialComisiones]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((comision) => {
      if (tipoPagoFilter !== 'all') {
        const tipoPago = (
          comision.tipoPago ??
          comision.tipo ??
          ''
        ).toUpperCase();
        if (tipoPagoFilter === 'interno' && !tipoPago.includes('INTERNO')) {
          return false;
        }
        if (
          tipoPagoFilter === 'externo' &&
          !tipoPago.includes('EXTERNO') &&
          !tipoPago.includes('BROKER')
        ) {
          return false;
        }
      }

      if (estatusFilter !== 'all') {
        const color = getParksComisionStatusColor(comision.estatus);
        if (estatusFilter !== color) {
          return false;
        }
      }

      if (!query) {
        return true;
      }

      return [
        comision.folio,
        comision.clienteNombre,
        comision.beneficiario,
        comision.leasingOfficer,
        comision.origenDeal,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [estatusFilter, items, search, tipoPagoFilter]);

  const handleApprove = async (comisionId: string) => {
    setIsBusy(true);
    setError(null);
    try {
      const updated = await approveParksCommission({
        comisionId,
        aprobadoPor: displayName || 'Director Comercial',
      });
      setItems((previous) =>
        previous.map((item) =>
          item.id === comisionId ? { ...item, ...updated } : item,
        ),
      );
      setMessage(t`Comisión autorizada — pendiente de pago`);
    } catch (approveError) {
      setError(
        approveError instanceof Error
          ? approveError.message
          : t`No se pudo aprobar`,
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleReject = async (comisionId: string) => {
    const motivo = window.prompt(t`Motivo del rechazo`);
    if (!motivo?.trim()) {
      return;
    }

    setIsBusy(true);
    setError(null);
    try {
      const updated = await rejectParksCommission({
        comisionId,
        aprobadoPor: displayName || 'Director Comercial',
        motivoAjuste: motivo,
      });
      setItems((previous) =>
        previous.map((item) =>
          item.id === comisionId ? { ...item, ...updated } : item,
        ),
      );
      setMessage(t`Comisión rechazada`);
    } catch (rejectError) {
      setError(
        rejectError instanceof Error
          ? rejectError.message
          : t`No se pudo rechazar`,
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handlePay = async (comisionId: string) => {
    setIsBusy(true);
    setError(null);
    try {
      const updated = await markParksCommissionPaid(comisionId);
      setItems((previous) =>
        previous.map((item) =>
          item.id === comisionId ? { ...item, ...updated } : item,
        ),
      );
      setMessage(t`Comisión marcada como pagada`);
    } catch (payError) {
      setError(
        payError instanceof Error ? payError.message : t`No se pudo pagar`,
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveMatrix = async () => {
    if (!matrix) {
      setMatrixError(t`No hay matriz cargada para guardar`);
      return;
    }

    setIsBusy(true);
    setMatrixError(null);
    setMatrixMessage(null);

    try {
      const saved = await saveParksCommissionRates(matrix);
      setMatrix(saved.matrix);

      if (saved.dashboard) {
        setDashboard(saved.dashboard);
        setItems(saved.dashboard.comisiones);
      } else {
        const nextDashboard = await fetchParksCommissionDashboard();
        setDashboard(nextDashboard);
        setItems(nextDashboard.comisiones);
      }

      const updatedCount = saved.recalculated?.updated ?? 0;
      setMatrixMessage(
        updatedCount > 0
          ? t`Matriz guardada · ${updatedCount} comisiones pendientes recalculadas`
          : t`Matriz guardada · sin comisiones pendientes por recalcular`,
      );
    } catch (saveError) {
      setMatrixError(
        saveError instanceof Error
          ? saveError.message
          : t`No se pudo guardar la matriz`,
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <StyledParksPageStack>
      <ParksPageHero
        eyebrow={
          isCeoViewer
            ? t`Command Center · CEO`
            : t`Director Comercial · Héctor`
        }
        title={
          isCeoViewer ? t`Comisiones (consulta)` : t`Motor de comisiones`
        }
        subtitle={
          isCeoViewer
            ? t`Vista informativa: totales, desglose y detalle por folio. La gestión y aprobación las opera Comercial.`
            : t`Cálculo por folio, matriz configurable y autorización comercial. Interno (LO) y externo (broker).`
        }
        actions={[
          {
            to: AppPath.ParksPipeline,
            label: t`Pipeline`,
            icon: IconTarget,
          },
          {
            to: AppPath.ParksBrokers,
            label: t`Brokers`,
            icon: IconUsers,
          },
        ]}
        stats={[
          {
            label: t`Periodo actual`,
            value: formatParksUsd(dashboard?.totalPeriodo ?? 0),
            hint: t`Cierres del mes`,
          },
          {
            label: t`Interno`,
            value: formatParksUsd(dashboard?.byTipoPago.interno ?? 0),
            hint: t`Bono LO`,
          },
          {
            label: t`Externo`,
            value: formatParksUsd(dashboard?.byTipoPago.externo ?? 0),
            hint: t`Pago broker`,
          },
          {
            label: t`Pendientes de autorizar`,
            value: String(dashboard?.pendientesValidacion ?? 0),
            hint: formatParksUsd(dashboard?.pendientesMonto ?? 0),
          },
        ]}
      />

      <ParksDashboardFeaturedMetrics>
        <ParksDashboardFeaturedMetric
          label={t`Directo`}
          value={formatParksUsd(dashboard?.byOrigen.directo ?? 0)}
          hint={t`Origen LO interno`}
          icon={IconCoins}
          accent="green"
        />
        <ParksDashboardFeaturedMetric
          label={t`Broker Top 10`}
          value={formatParksUsd(dashboard?.byOrigen.top10 ?? 0)}
          hint={t`Socios estratégicos`}
          icon={IconUsers}
          accent="blue"
        />
        <ParksDashboardFeaturedMetric
          label={t`Fuera Top 10`}
          value={formatParksUsd(dashboard?.byOrigen.noTop10 ?? 0)}
          hint={t`Brokers estándar`}
          icon={IconCurrencyDollar}
          accent="yellow"
        />
      </ParksDashboardFeaturedMetrics>

      <ParksComisionesSummary comisiones={items} />

      {matrix && canManageCommissions ? (
        <ParksCommissionRateMatrixPanel
          matrix={matrix}
          isBusy={isBusy}
          message={matrixMessage}
          error={matrixError}
          onChange={setMatrix}
          onSave={() => {
            void handleSaveMatrix();
          }}
        />
      ) : null}

      {isCeoViewer && matrix ? (
        <ParksCommissionRateMatrixPanel matrix={matrix} readOnly />
      ) : null}

      <ParksSectionCard title={t`Comisiones por folio`} accent="green">
        <StyledToolbar>
          <StyledFilters>
            <StyledFilter
              placeholder={t`Buscar folio, cliente, LO, broker…`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <StyledSelect
              value={tipoPagoFilter}
              onChange={(event) => setTipoPagoFilter(event.target.value)}
            >
              <option value="all">{t`Todos los tipos`}</option>
              <option value="interno">{t`Interno`}</option>
              <option value="externo">{t`Externo`}</option>
            </StyledSelect>
            <StyledSelect
              value={estatusFilter}
              onChange={(event) => setEstatusFilter(event.target.value)}
            >
              <option value="all">{t`Todos los estatus`}</option>
              <option value="yellow">{t`Pendiente`}</option>
              <option value="blue">{t`Aprobada / por pagar`}</option>
              <option value="green">{t`Pagada`}</option>
              <option value="red">{t`Rechazada`}</option>
            </StyledSelect>
          </StyledFilters>
          <Button
            variant="secondary"
            Icon={IconDownload}
            title={t`Exportar CSV`}
            onClick={() => {
              window.open(getParksCommissionExportUrl(), '_blank');
            }}
          />
        </StyledToolbar>

        {filtered.length === 0 ? (
          <ParksEmptyState title={t`Sin comisiones con estos filtros`} />
        ) : (
          <StyledTableShell>
            <StyledTableWrapper>
              <StyledTable>
                <thead>
                  <tr>
                    <StyledHeaderCell>{t`Folio`}</StyledHeaderCell>
                    <StyledHeaderCell>{t`Cliente`}</StyledHeaderCell>
                    <StyledHeaderCell>{t`Beneficiario`}</StyledHeaderCell>
                    <StyledHeaderCell>{t`Origen`}</StyledHeaderCell>
                    <StyledHeaderCell data-align="right">
                      {t`%`}
                    </StyledHeaderCell>
                    <StyledHeaderCell data-align="right">
                      {t`Monto`}
                    </StyledHeaderCell>
                    <StyledHeaderCell data-align="center">
                      {t`Estatus`}
                    </StyledHeaderCell>
                    <StyledHeaderCell data-align="right">
                      {t`Acciones`}
                    </StyledHeaderCell>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((comision) => (
                    <StyledRow key={comision.id}>
                      <StyledCell>
                        <StyledPrimary>
                          {comision.folio ?? '—'}
                        </StyledPrimary>
                      </StyledCell>
                      <StyledCell>
                        <StyledPrimary>
                          {comision.clienteNombre ?? '—'}
                        </StyledPrimary>
                      </StyledCell>
                      <StyledCell>
                        <StyledPrimary>
                          {comision.beneficiario ?? '—'}
                        </StyledPrimary>
                        <StyledMeta>
                          {getTipoPagoLabel(comision)}
                          {comision.leasingOfficer
                            ? ` · LO ${comision.leasingOfficer}`
                            : ''}
                        </StyledMeta>
                      </StyledCell>
                      <StyledCell>
                        <StyledPrimary>
                          {formatEnumLabel(comision.origenDeal)}
                        </StyledPrimary>
                        <StyledMeta>
                          {formatEnumLabel(comision.tipoContratoComision)}
                          {comision.estatusNaveComision
                            ? ` · ${formatEnumLabel(comision.estatusNaveComision)}`
                            : ''}
                        </StyledMeta>
                      </StyledCell>
                      <StyledCell data-align="right">
                        <StyledPct>
                          {comision.pctAplicado != null
                            ? `${comision.pctAplicado}%`
                            : '—'}
                        </StyledPct>
                      </StyledCell>
                      <StyledCell data-align="right">
                        <StyledAmount>
                          {formatParksUsd(comision.montoUsd ?? 0)}
                        </StyledAmount>
                      </StyledCell>
                      <StyledCell data-align="center">
                        <ParksStatusBadge
                          color={getParksComisionStatusColor(comision.estatus)}
                          label={getComisionStatusLabel(comision.estatus)}
                        />
                      </StyledCell>
                      <StyledCell data-align="right">
                        <StyledActions>
                          {canManageCommissions &&
                          isPendingValidation(comision.estatus) ? (
                            <>
                              <ParksActionButton
                                size="sm"
                                title={t`Autorizar`}
                                disabled={isBusy}
                                onClick={() =>
                                  void handleApprove(comision.id)
                                }
                              />
                              <ParksActionButton
                                size="sm"
                                variant="secondary"
                                title={t`Rechazar`}
                                disabled={isBusy}
                                onClick={() =>
                                  void handleReject(comision.id)
                                }
                              />
                            </>
                          ) : null}
                          {canManageCommissions &&
                          isReadyToPay(comision.estatus) ? (
                            <ParksActionButton
                              size="sm"
                              variant="secondary"
                              title={t`Marcar pagada`}
                              disabled={isBusy}
                              onClick={() => void handlePay(comision.id)}
                            />
                          ) : null}
                          {!canManageCommissions ? (
                            <StyledMuted>{t`Solo consulta`}</StyledMuted>
                          ) : null}
                        </StyledActions>
                      </StyledCell>
                    </StyledRow>
                  ))}
                </tbody>
              </StyledTable>
            </StyledTableWrapper>
          </StyledTableShell>
        )}

        <StyledFooterNotes>
          {message ? (
            <div style={{ color: themeCssVariables.color.green }}>
              {message}
            </div>
          ) : null}
          {error ? <StyledError>{error}</StyledError> : null}
          {dashboard && dashboard.stalePendientes > 0 ? (
            <StyledError>
              {t`${dashboard.stalePendientes} comisiones llevan más de 7 días sin autorizar`}
            </StyledError>
          ) : null}
        </StyledFooterNotes>
      </ParksSectionCard>
    </StyledParksPageStack>
  );
};
