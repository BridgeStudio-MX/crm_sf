import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from 'twenty-ui/input';
import { IconRefresh } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksCxcAccountCard } from '@/parks-industrial/components/cxc/ParksCxcAccountCard';
import { ParksCxcPipelineBoard } from '@/parks-industrial/components/cxc/ParksCxcPipelineBoard';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import { ParksPageTabs } from '@/parks-industrial/components/ui/ParksPageTabs';
import { getParksInquilino360Path } from '@/parks-industrial/constants/parks-routes.constants';
import { fetchParksCxcDashboard } from '@/parks-industrial/services/parks-cxc.client';
import {
  type CxcDashboardResult,
  type CxcRiskLabel,
} from '@/parks-industrial/types/parks-cxc.types';
import { formatCxcCompactMoney } from '@/parks-industrial/utils/parks-cxc-format.util';

type CxcCarteraTab =
  | 'pipeline'
  | 'prioridad'
  | 'todas'
  | 'oc'
  | 'holdover'
  | 'depositos';

const CARTERA_TABS: CxcCarteraTab[] = [
  'prioridad',
  'pipeline',
  'todas',
  'oc',
  'holdover',
  'depositos',
];

const isCxcCarteraTab = (value: string | null): value is CxcCarteraTab =>
  value != null && (CARTERA_TABS as string[]).includes(value);

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
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

const StyledAccountGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  min-width: 0;
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
`;

const RISK_FILTERS: Array<CxcRiskLabel | 'Todos'> = [
  'Todos',
  'Crítico',
  'Alto',
  'Medio',
  'Bajo',
];

export const ParksCxcCarteraContent = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dashboard, setDashboard] = useState<CxcDashboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<CxcRiskLabel | 'Todos'>('Todos');
  const [ejecutivoFilter, setEjecutivoFilter] = useState<string>('Todos');

  const activeTab: CxcCarteraTab = isCxcCarteraTab(searchParams.get('tab'))
    ? (searchParams.get('tab') as CxcCarteraTab)
    : 'prioridad';
  const deepLinkedAccountId = searchParams.get('accountId');

  const openAccount360 = useCallback(
    (accountId: string) => {
      navigate(`${getParksInquilino360Path(accountId)}?tab=cxc`);
    },
    [navigate],
  );

  // Deep links de notificaciones (?accountId=) abren directo el 360 del cliente
  useEffect(() => {
    if (deepLinkedAccountId) {
      openAccount360(deepLinkedAccountId);
    }
  }, [deepLinkedAccountId, openAccount360]);

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
          : t`No se pudo cargar la cartera CxC`,
      );
    } finally {
      setLoading(false);
    }
  }, [ejecutivoFilter, riskFilter]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleTabChange = (tab: CxcCarteraTab) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set('tab', tab);
        return next;
      },
      { replace: true },
    );
  };

  const handleSelectAccount = (accountId: string) => {
    openAccount360(accountId);
  };

  const filteredAccounts = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    if (activeTab === 'pipeline') {
      return dashboard.accounts;
    }

    const source =
      activeTab === 'prioridad'
        ? dashboard.priorityAccounts
        : dashboard.accounts;

    return source.filter((account) => {
      if (activeTab === 'oc') {
        return (
          account.ordenCompra?.estatus === 'Esperando OC' ||
          account.requiereOc === true
        );
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

  if (loading && !dashboard) {
    return <ParksLoadingSkeleton variant="dashboard" />;
  }

  if (error && !dashboard) {
    return (
      <ParksEmptyState
        title={t`No se pudo cargar la cartera`}
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

  return (
    <StyledStack>
      <ParksPageHero
        eyebrow={t`CxC · Operación`}
        title={t`Cartera y pipeline de cobranza`}
        subtitle={t`Haz clic en una tarjeta para abrir el portal 360 del cliente con el tab CxC activo.`}
        stats={[
          {
            label: t`Cuentas`,
            value: String(dashboard.accounts.length),
          },
          {
            label: t`OC pendientes`,
            value: String(dashboard.kpis.ocPendientes),
          },
          {
            label: t`Holdovers`,
            value: String(dashboard.kpis.holdoversActivos),
          },
          {
            label: t`Vencida`,
            value: formatCxcCompactMoney(dashboard.kpis.carteraVencida),
          },
        ]}
      />

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

      <StyledHint>
        {t`Pestañas: Prioridad · Pipeline (Legal→CxC) · Cartera · OC portal · Holdover · Depósitos`}
      </StyledHint>

      <ParksPageTabs
        ariaLabel={t`Cartera CxC`}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={[
          {
            id: 'prioridad',
            label: t`Prioridad`,
            count: dashboard.priorityAccounts.length,
          },
          {
            id: 'pipeline',
            label: t`Pipeline`,
            count: dashboard.accounts.length,
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
            count:
              dashboard.accounts.filter(
                (account) =>
                  account.deposito?.estatus === 'En proceso de devolución' ||
                  account.deposito?.estatus === 'Retenido',
              ).length,
          },
        ]}
      >
        {activeTab === 'pipeline' ? (
          <ParksCxcPipelineBoard
            accounts={dashboard.accounts}
            selectedAccountId={null}
            onSelectAccount={handleSelectAccount}
          />
        ) : filteredAccounts.length === 0 ? (
          <ParksEmptyState
            title={t`Sin cuentas en esta vista`}
            description={t`Cambia de pestaña o filtros para ver más cartera.`}
          />
        ) : (
          <StyledAccountGrid>
            {filteredAccounts.map((account) => (
              <ParksCxcAccountCard
                key={account.id}
                account={account}
                selected={false}
                onSelect={handleSelectAccount}
              />
            ))}
          </StyledAccountGrid>
        )}
      </ParksPageTabs>
    </StyledStack>
  );
};
