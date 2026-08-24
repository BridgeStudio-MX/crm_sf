import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'twenty-ui/input';
import {
  IconAlertTriangle,
  IconCashBanknote,
  IconCoin,
  IconLayoutKanban,
  IconRefresh,
  IconReportMoney,
  IconUsers,
  IconWallet,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksDashboardHorizontalBars } from '@/parks-industrial/components/dashboard/charts/ParksDashboardHorizontalBars';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { resolveCxcPipelineStage } from '@/parks-industrial/constants/parks-cxc-pipeline.constants';
import {
  getParksInquilino360Path,
  PARKS_CXC_CARTERA_PATH,
  PARKS_NOTIFICACIONES_PATH,
} from '@/parks-industrial/constants/parks-routes.constants';
import {
  PARKS_BRAND,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';
import {
  fetchParksCxcDashboard,
  resolveParksCxcAnomaly,
} from '@/parks-industrial/services/parks-cxc.client';
import { type CxcDashboardResult } from '@/parks-industrial/types/parks-cxc.types';
import {
  formatCxcCompactMoney,
  formatCxcMoney,
  getCxcAnomalyAccent,
  getCxcRiskAccent,
} from '@/parks-industrial/utils/parks-cxc-format.util';

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

const StyledBento = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1.1fr 0.9fr;
  }
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

const StyledHandoffBanner = styled.div`
  align-items: center;
  background: linear-gradient(
    100deg,
    ${PARKS_BRAND.primarySoft} 0%,
    ${themeCssVariables.background.primary} 55%
  );
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledHandoffText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledHandoffTitle = styled.strong`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledHandoffDetail = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledHandoffActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLink = styled(Link)`
  align-items: center;
  color: ${PARKS_BRAND.primary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 6px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

type ParksCxcDashboardContentProps = {
  variant?: 'cxc' | 'cfo';
};

export const ParksCxcDashboardContent = ({
  variant = 'cxc',
}: ParksCxcDashboardContentProps) => {
  const [dashboard, setDashboard] = useState<CxcDashboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchParksCxcDashboard();
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
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handoffAccounts = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return dashboard.accounts.filter((account) => {
      const stage = resolveCxcPipelineStage(account);

      return stage === 'recibido_legal' || stage === 'alta_oracle';
    });
  }, [dashboard]);

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

  const carteraHref = `${PARKS_CXC_CARTERA_PATH}?tab=pipeline`;

  return (
    <StyledStack>
      <ParksPageHero
        eyebrow={
          variant === 'cfo' ? t`Finanzas · Cobranza` : t`Cuentas por cobrar`
        }
        title={
          variant === 'cfo' ? t`Forecast y cartera` : t`Dashboard CxC`
        }
        subtitle={
          variant === 'cfo'
            ? t`Cobros esperados a 7 / 30 / 90 días, mora y anomalías. Baja a Cartera para el trabajo diario.`
            : t`KPIs, forecast y anomalías. El trabajo diario (pipeline, OC, holdovers) está en Cartera.`
        }
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

      <StyledActionsRow>
        <Link to={PARKS_CXC_CARTERA_PATH}>
          <Button
            title={t`Abrir cartera / pipeline`}
            Icon={IconLayoutKanban}
            variant="primary"
          />
        </Link>
        <Button
          title={t`Actualizar`}
          Icon={IconRefresh}
          variant="secondary"
          onClick={() => void loadDashboard()}
        />
      </StyledActionsRow>

      {handoffAccounts.length > 0 ? (
        <StyledHandoffBanner>
          <StyledHandoffText>
            <StyledHandoffTitle>
              {t`${handoffAccounts.length} cliente(s) nuevos desde Legal`}
            </StyledHandoffTitle>
            <StyledHandoffDetail>
              {handoffAccounts
                .slice(0, 3)
                .map((account) => account.empresa)
                .join(' · ')}
              {handoffAccounts.length > 3
                ? ` · +${handoffAccounts.length - 3}`
                : ''}
            </StyledHandoffDetail>
          </StyledHandoffText>
          <StyledHandoffActions>
            <Link to={carteraHref}>
              <Button title={t`Ver en pipeline`} variant="primary" />
            </Link>
            <StyledLink to={PARKS_NOTIFICACIONES_PATH}>
              {t`Ver notificaciones`}
            </StyledLink>
          </StyledHandoffActions>
        </StyledHandoffBanner>
      ) : null}

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
                const accountHref = anomaly.accountId
                  ? `${getParksInquilino360Path(anomaly.accountId)}?tab=cxc`
                  : PARKS_CXC_CARTERA_PATH;

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
                    <StyledHandoffActions>
                      <StyledLink to={accountHref}>{t`Abrir cuenta`}</StyledLink>
                      <Button
                        title={t`Marcar resuelta`}
                        variant="secondary"
                        onClick={() => void handleResolveAnomaly(anomaly.id)}
                      />
                    </StyledHandoffActions>
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
    </StyledStack>
  );
};
