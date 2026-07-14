import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'twenty-ui/input';
import {
  IconAlertTriangle,
  IconCashBanknote,
  IconCoin,
  IconRefresh,
  IconReportMoney,
  IconUsers,
  IconWallet,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksCxcAccountCard } from '@/parks-industrial/components/cxc/ParksCxcAccountCard';
import { ParksCxcAccountDetailPanel } from '@/parks-industrial/components/cxc/ParksCxcAccountDetailPanel';
import { ParksDashboardHorizontalBars } from '@/parks-industrial/components/dashboard/charts/ParksDashboardHorizontalBars';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import { ParksPageTabs } from '@/parks-industrial/components/ui/ParksPageTabs';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  PARKS_BRAND,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';
import {
  fetchParksCxcDashboard,
  resolveParksCxcAnomaly,
} from '@/parks-industrial/services/parks-cxc.client';
import {
  type CxcAccount,
  type CxcDashboardResult,
  type CxcRiskLabel,
} from '@/parks-industrial/types/parks-cxc.types';
import {
  formatCxcCompactMoney,
  formatCxcMoney,
  getCxcAnomalyAccent,
  getCxcRiskAccent,
} from '@/parks-industrial/utils/parks-cxc-format.util';

type CxcCarteraTab = 'prioridad' | 'todas' | 'oc' | 'holdover' | 'depositos';

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
`;

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSelect = styled.select`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: 8px 12px;
`;

const StyledBento = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1.1fr 0.9fr;
  }
`;

const StyledMainGrid = styled.div<{ hasDetail: boolean }>`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: ${({ hasDetail }) =>
      hasDetail ? '1fr 380px' : '1fr'};
  }
`;

const StyledAccountGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`;

const StyledAnomalyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAnomalyCard = styled.div<{ accent: string }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-left: 3px solid ${({ accent }) => accent};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledAnomalyTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledAnomalyDetail = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.45;
`;

const StyledEjecutivoRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1.2fr 0.6fr 0.8fr;
  padding: ${themeCssVariables.spacing[2]} 0;

  &:last-child {
    border-bottom: none;
  }
`;

const StyledForecastGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const StyledForecastCard = styled.div`
  background: linear-gradient(
    160deg,
    ${PARKS_BRAND.primarySoft} 0%,
    ${themeCssVariables.background.primary} 70%
  );
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledForecastLabel = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const StyledForecastValue = styled.div`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledForecastMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const RISK_FILTERS: Array<CxcRiskLabel | 'Todos'> = [
  'Todos',
  'Crítico',
  'Alto',
  'Medio',
  'Bajo',
];

export const ParksCxcDashboardContent = () => {
  const [dashboard, setDashboard] = useState<CxcDashboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<CxcRiskLabel | 'Todos'>('Todos');
  const [ejecutivoFilter, setEjecutivoFilter] = useState<string>('Todos');
  const [activeTab, setActiveTab] = useState<CxcCarteraTab>('prioridad');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchParksCxcDashboard({
        ejecutivoId:
          ejecutivoFilter === 'Todos' ? undefined : ejecutivoFilter,
        riskLabel: riskFilter === 'Todos' ? undefined : riskFilter,
      });
      setDashboard(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : t`No se pudo cargar el dashboard CxC`,
      );
    } finally {
      setLoading(false);
    }
  }, [ejecutivoFilter, riskFilter]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const selectedAccount = useMemo(() => {
    if (!dashboard || !selectedAccountId) {
      return null;
    }

    return (
      dashboard.accounts.find((account) => account.id === selectedAccountId) ??
      dashboard.priorityAccounts.find(
        (account) => account.id === selectedAccountId,
      ) ??
      null
    );
  }, [dashboard, selectedAccountId]);

  const filteredAccounts = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const source =
      activeTab === 'prioridad'
        ? dashboard.priorityAccounts
        : dashboard.accounts;

    return source.filter((account) => {
      if (activeTab === 'oc') {
        return account.ordenCompra?.estatus === 'Esperando OC';
      }

      if (activeTab === 'holdover') {
        return account.holdover != null;
      }

      if (activeTab === 'depositos') {
        return (
          account.deposito?.estatus === 'En proceso de devolución' ||
          account.deposito?.estatus === 'Retenido'
        );
      }

      return true;
    });
  }, [activeTab, dashboard]);

  const handleAccountUpdated = (updated: CxcAccount) => {
    setDashboard((previous) => {
      if (!previous) {
        return previous;
      }

      const patchList = (list: CxcAccount[]) =>
        list.map((account) =>
          account.id === updated.id ? updated : account,
        );

      return {
        ...previous,
        accounts: patchList(previous.accounts),
        priorityAccounts: patchList(previous.priorityAccounts),
      };
    });
  };

  const handleResolveAnomaly = async (anomalyId: string) => {
    try {
      await resolveParksCxcAnomaly(anomalyId, 'Revisada desde dashboard CxC');
      await loadDashboard();
    } catch {
      // keep UI stable
    }
  };

  if (loading && !dashboard) {
    return <ParksLoadingSkeleton variant="dashboard" />;
  }

  if (error && !dashboard) {
    return (
      <ParksEmptyState
        title={t`No se pudo cargar CxC`}
        description={error}
        action={
          <Button
            title={t`Reintentar`}
            onClick={() => void loadDashboard()}
            variant="secondary"
          />
        }
      />
    );
  }

  if (!dashboard) {
    return null;
  }

  const riskBars = dashboard.riskDistribution.map((item) => ({
    id: item.label,
    label: item.label,
    value: item.count,
    displayValue: `${item.count} · ${formatCxcCompactMoney(item.monto)}`,
    color: PARKS_VISUAL_THEME.accents[getCxcRiskAccent(item.label)].accent,
  }));

  return (
    <StyledStack>
      <ParksPageHero
        eyebrow={t`Cuentas por cobrar`}
        title={t`Cola operativa de cobranza`}
        subtitle={t`Abre una cuenta: aplica pagos, registra llamadas/emails, da seguimiento a OC y actualiza depósitos. KPIs y forecast arriba; el trabajo diario está en el panel.`}
        stats={[
          {
            label: t`Cartera`,
            value: formatCxcCompactMoney(dashboard.kpis.carteraTotal),
            hint: t`Activa + adeudos`,
          },
          {
            label: t`Vencida`,
            value: formatCxcCompactMoney(dashboard.kpis.carteraVencida),
            hint: t`${dashboard.kpis.moraGraveCount} mora grave/holdover`,
          },
          {
            label: t`Forecast 30d`,
            value: formatCxcCompactMoney(dashboard.forecast.d30.esperado),
            hint: t`${dashboard.forecast.d30.probabilidadPct}% probabilidad`,
          },
          {
            label: t`OC pendientes`,
            value: String(dashboard.kpis.ocPendientes),
            hint: t`Clientes con portal`,
          },
        ]}
      />

      <StyledMetricsGrid>
        <ParksMetricCard
          label={t`Cuentas activas`}
          value={dashboard.kpis.cuentasActivas}
          icon={IconUsers}
          accent="green"
        />
        <ParksMetricCard
          label={t`Al corriente`}
          value={formatCxcCompactMoney(dashboard.kpis.carteraCorriente)}
          icon={IconWallet}
          accent="sky"
        />
        <ParksMetricCard
          label={t`Holdovers`}
          value={dashboard.kpis.holdoversActivos}
          icon={IconAlertTriangle}
          accent="red"
          trend={t`Doble renta activa`}
        />
        <ParksMetricCard
          label={t`Depósitos en proceso`}
          value={dashboard.kpis.depositosEnProceso}
          icon={IconCashBanknote}
          accent="purple"
        />
        <ParksMetricCard
          label={t`Notas de crédito`}
          value={dashboard.kpis.notasCreditoPendientes}
          icon={IconReportMoney}
          accent="orange"
          trend={t`Pendientes CEO`}
        />
        <ParksMetricCard
          label={t`En riesgo 30d`}
          value={formatCxcCompactMoney(dashboard.forecast.d30.enRiesgo)}
          icon={IconCoin}
          accent="yellow"
        />
      </StyledMetricsGrid>

      <ParksSectionCard title={t`Forecast de cobranza`} accent="green">
        <StyledForecastGrid>
          {(
            [
              ['7 días', dashboard.forecast.d7],
              ['30 días', dashboard.forecast.d30],
              ['90 días', dashboard.forecast.d90],
            ] as const
          ).map(([label, bucket]) => (
            <StyledForecastCard key={label}>
              <StyledForecastLabel>{label}</StyledForecastLabel>
              <StyledForecastValue>
                {formatCxcCompactMoney(bucket.esperado)}
              </StyledForecastValue>
              <StyledForecastMeta>
                {t`En riesgo`} {formatCxcCompactMoney(bucket.enRiesgo)} ·{' '}
                {bucket.probabilidadPct}%
              </StyledForecastMeta>
            </StyledForecastCard>
          ))}
        </StyledForecastGrid>
      </ParksSectionCard>

      <StyledBento>
        <ParksSectionCard
          title={t`Anomalías del día`}
          accent="orange"
          action={
            <ParksStatusBadge
              label={`${dashboard.anomalies.length}`}
              color="orange"
            />
          }
        >
          {dashboard.anomalies.length === 0 ? (
            <ParksEmptyState
              title={t`Sin anomalías`}
              description={t`Los reportes diarios no muestran inconsistencias.`}
            />
          ) : (
            <StyledAnomalyList>
              {dashboard.anomalies.map((anomaly) => {
                const accentKey = getCxcAnomalyAccent(anomaly.severity);

                return (
                  <StyledAnomalyCard
                    key={anomaly.id}
                    accent={PARKS_VISUAL_THEME.accents[accentKey].accent}
                  >
                    <StyledAnomalyTitle>{anomaly.title}</StyledAnomalyTitle>
                    <StyledAnomalyDetail>
                      {anomaly.empresa} — {anomaly.detail}
                    </StyledAnomalyDetail>
                    <StyledAnomalyDetail>
                      {anomaly.suggestedAction}
                    </StyledAnomalyDetail>
                    <Button
                      title={t`Marcar resuelta`}
                      variant="secondary"
                      onClick={() => void handleResolveAnomaly(anomaly.id)}
                    />
                  </StyledAnomalyCard>
                );
              })}
            </StyledAnomalyList>
          )}
        </ParksSectionCard>

        <ParksSectionCard title={t`Distribución de riesgo`} accent="red">
          <ParksDashboardHorizontalBars items={riskBars} />
          <div style={{ marginTop: 16 }}>
            {dashboard.ejecutivos.map((ejecutivo) => (
              <StyledEjecutivoRow key={ejecutivo.ejecutivoId}>
                <div>
                  <strong>{ejecutivo.ejecutivoNombre}</strong>
                  <StyledAnomalyDetail>
                    {ejecutivo.cuentas} {t`cuentas`} · {ejecutivo.ocPendientes}{' '}
                    OC
                  </StyledAnomalyDetail>
                </div>
                <ParksStatusBadge
                  label={`${ejecutivo.enMora} mora`}
                  color={ejecutivo.enMora > 0 ? 'yellow' : 'green'}
                />
                <strong>
                  {formatCxcMoney(ejecutivo.montoVencido, 'MXN')}
                </strong>
              </StyledEjecutivoRow>
            ))}
          </div>
        </ParksSectionCard>
      </StyledBento>

      <StyledToolbar>
        <StyledFilters>
          <StyledSelect
            value={riskFilter}
            onChange={(event) =>
              setRiskFilter(event.target.value as CxcRiskLabel | 'Todos')
            }
          >
            {RISK_FILTERS.map((filter) => (
              <option key={filter} value={filter}>
                {filter === 'Todos' ? t`Todo el riesgo` : filter}
              </option>
            ))}
          </StyledSelect>
          <StyledSelect
            value={ejecutivoFilter}
            onChange={(event) => setEjecutivoFilter(event.target.value)}
          >
            <option value="Todos">{t`Todos los ejecutivos`}</option>
            {dashboard.ejecutivos.map((ejecutivo) => (
              <option key={ejecutivo.ejecutivoId} value={ejecutivo.ejecutivoId}>
                {ejecutivo.ejecutivoNombre}
              </option>
            ))}
          </StyledSelect>
        </StyledFilters>
        <Button
          title={t`Actualizar`}
          Icon={IconRefresh}
          variant="secondary"
          onClick={() => void loadDashboard()}
        />
      </StyledToolbar>

      <ParksPageTabs
        ariaLabel={t`Cartera CxC`}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            id: 'prioridad',
            label: t`Prioridad`,
            count: dashboard.priorityAccounts.length,
          },
          {
            id: 'todas',
            label: t`Cartera`,
            count: dashboard.accounts.length,
          },
          {
            id: 'oc',
            label: t`OC portal`,
            count: dashboard.kpis.ocPendientes,
          },
          {
            id: 'holdover',
            label: t`Holdover`,
            count: dashboard.kpis.holdoversActivos,
          },
          {
            id: 'depositos',
            label: t`Depósitos`,
            count: dashboard.kpis.depositosEnProceso + 1,
          },
        ]}
      >
        <StyledMainGrid hasDetail={selectedAccount != null}>
          {filteredAccounts.length === 0 ? (
            <ParksEmptyState
              title={t`Sin cuentas en esta vista`}
              description={t`Cambia filtros o pestaña para ver más cartera.`}
            />
          ) : (
            <StyledAccountGrid>
              {filteredAccounts.map((account) => (
                <ParksCxcAccountCard
                  key={account.id}
                  account={account}
                  selected={account.id === selectedAccountId}
                  onSelect={setSelectedAccountId}
                />
              ))}
            </StyledAccountGrid>
          )}

          {selectedAccount ? (
            <ParksCxcAccountDetailPanel
              account={selectedAccount}
              onClose={() => setSelectedAccountId(null)}
              onAccountUpdated={handleAccountUpdated}
            />
          ) : null}
        </StyledMainGrid>
      </ParksPageTabs>
    </StyledStack>
  );
};
