import { useCallback, useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  createOfertaRenovacion,
  fetchValorAgregadoDashboard,
  updateOfertaRenovacionEstatus,
} from '@/parks-industrial/services/parks-valor-agregado.client';
import { type ValorAgregadoDashboard } from '@/parks-industrial/types/parks-valor-agregado.types';

type TabKey =
  | 'f1'
  | 'f2'
  | 'f3'
  | 'f4'
  | 'f5'
  | 'f6'
  | 'f7'
  | 'f8';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'f1', label: 'Docs vigencia' },
  { key: 'f2', label: 'Expansión' },
  { key: 'f3', label: 'Vencimientos' },
  { key: 'f4', label: 'ROI canal' },
  { key: 'f5', label: 'Ofertas renovación' },
  { key: 'f6', label: 'Match naves' },
  { key: 'f7', label: 'Tiempo respuesta' },
  { key: 'f8', label: 'Brokers top 10' },
];

const StyledRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTab = styled.button<{ active: boolean }>`
  background: ${({ active }) =>
    active
      ? themeCssVariables.color.blue
      : themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ active }) =>
    active ? themeCssVariables.font.color.inverted : themeCssVariables.font.color.primary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledMuted = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledRow = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledError = styled.p`
  color: ${themeCssVariables.font.color.danger};
  margin: 0;
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledButton = styled.button`
  background: ${themeCssVariables.color.blue};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.inverted};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const formatMoney = (value: number): string =>
  `$${value.toLocaleString('es-MX')}`;

export const ParksValorAgregadoContent = () => {
  const [tab, setTab] = useState<TabKey>('f1');
  const [dashboard, setDashboard] = useState<ValorAgregadoDashboard | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setErrorMessage(null);

    try {
      const result = await fetchValorAgregadoDashboard();
      setDashboard(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error al cargar',
      );
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreateOferta = async () => {
    setBusy(true);
    setErrorMessage(null);

    try {
      await createOfertaRenovacion({
        casoLegalId: 'caso-renov-manual',
        empresa: 'Cliente demo renovación',
        loNombre: 'Tim Apple',
        tipoIncentivo: 'Combinación',
        diasGraciaAdicionales: 10,
        descuentoPorcentaje: 2,
        observaciones: 'Oferta creada desde UI Valor agregado',
      });
      await refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error al crear oferta',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleAcceptOferta = async (ofertaId: string) => {
    setBusy(true);
    setErrorMessage(null);

    try {
      await updateOfertaRenovacionEstatus({
        ofertaId,
        estatus: 'Aceptada',
      });
      await refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error al aceptar oferta',
      );
    } finally {
      setBusy(false);
    }
  };

  if (!dashboard && !errorMessage) {
    return <StyledMuted>Cargando valor agregado…</StyledMuted>;
  }

  return (
    <StyledRoot>
      <StyledMuted>
        Generado {dashboard?.generatedAt ?? '—'} · Solo agrega reportes y
        automatizaciones; no modifica flujos existentes.
      </StyledMuted>
      {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}
      <StyledTabs>
        {TABS.map((item) => (
          <StyledTab
            key={item.key}
            active={tab === item.key}
            type="button"
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </StyledTab>
        ))}
      </StyledTabs>

      {tab === 'f1' && dashboard ? (
        <StyledCard>
          <StyledTitle>F1 — Validez de documentos</StyledTitle>
          <StyledMuted>
            Alertas de documentos vencidos o por vencer en casos activos.
          </StyledMuted>
          {dashboard.f1ChecklistAlertas.length === 0 ? (
            <StyledMuted>Sin alertas de vigencia.</StyledMuted>
          ) : (
            dashboard.f1ChecklistAlertas.map((item) => (
              <StyledRow key={item.casoLegalId}>
                <strong>{item.empresa}</strong>
                <div>{item.documentosConAlerta}</div>
              </StyledRow>
            ))
          )}
        </StyledCard>
      ) : null}

      {tab === 'f2' && dashboard ? (
        <StyledCard>
          <StyledTitle>F2 — Oportunidades de expansión</StyledTitle>
          {dashboard.f2Expansiones.map((item) => (
            <StyledRow key={item.id}>
              <strong>{item.inquilinoNombre}</strong>
              <div>
                {item.mesesOcupado} meses en {item.naveActual} ·{' '}
                {item.parqueNombre}
              </div>
              <div>
                Disponibles:{' '}
                {item.navesDisponibles
                  .map(
                    (nave) =>
                      `${nave.identificador} (${nave.m2.toLocaleString('es-MX')} m²)`,
                  )
                  .join(', ')}
              </div>
            </StyledRow>
          ))}
        </StyledCard>
      ) : null}

      {tab === 'f3' && dashboard ? (
        <StyledCard>
          <StyledTitle>F3 — Concentración de vencimientos</StyledTitle>
          {dashboard.f3Concentracion.map((item) => (
            <StyledRow key={item.parqueNombre}>
              <strong>
                {item.parqueNombre} · {item.porcentajeRiesgo}%{' '}
                {item.alerta ? '⚠️' : ''}
              </strong>
              <div>
                {item.contratosProximos90d} contratos ·{' '}
                {item.m2EnRiesgo.toLocaleString('es-MX')} m² en riesgo (umbral{' '}
                {item.umbralPct}%)
              </div>
            </StyledRow>
          ))}
        </StyledCard>
      ) : null}

      {tab === 'f4' && dashboard ? (
        <StyledCard>
          <StyledTitle>F4 — ROI por canal</StyledTitle>
          {dashboard.f4RoiCanal.map((item) => (
            <StyledRow key={item.canalOrigen}>
              <strong>{item.canalOrigen}</strong>
              <div>
                Cierre {item.tasaCierrePct}% · Ciclo{' '}
                {item.diasCicloPromedio ?? '—'}d · Revenue anual{' '}
                {formatMoney(item.revenueAnualizadoUsd)} · Comisiones{' '}
                {formatMoney(item.costoComisionesUsd)}
              </div>
            </StyledRow>
          ))}
        </StyledCard>
      ) : null}

      {tab === 'f5' && dashboard ? (
        <StyledCard>
          <StyledTitle>F5 — Ofertas de renovación anticipada</StyledTitle>
          <StyledActions>
            <StyledButton
              type="button"
              disabled={busy}
              onClick={() => void handleCreateOferta()}
            >
              Crear oferta demo
            </StyledButton>
          </StyledActions>
          {dashboard.f5Ofertas.map((item) => (
            <StyledRow key={item.id}>
              <strong>
                {item.empresa} · {item.estatus}
              </strong>
              <div>
                {item.tipoIncentivo} · vence {item.fechaVencimientoOferta}
              </div>
              {item.estatus === 'Enviada al cliente' ||
              item.estatus === 'Borrador' ? (
                <StyledButton
                  type="button"
                  disabled={busy}
                  onClick={() => void handleAcceptOferta(item.id)}
                >
                  Marcar aceptada
                </StyledButton>
              ) : null}
            </StyledRow>
          ))}
        </StyledCard>
      ) : null}

      {tab === 'f6' && dashboard ? (
        <StyledCard>
          <StyledTitle>F6 — Match automático de naves</StyledTitle>
          {dashboard.f6Matches.map((item) => (
            <StyledRow key={item.opportunityId}>
              <strong>
                {item.opportunityName} · {item.matchCount} matches
              </strong>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                {item.matchNavesSugeridas}
              </pre>
            </StyledRow>
          ))}
        </StyledCard>
      ) : null}

      {tab === 'f7' && dashboard ? (
        <StyledCard>
          <StyledTitle>F7 — Tiempo de respuesta por LO</StyledTitle>
          {dashboard.f7TiempoRespuesta.map((item) => (
            <StyledRow key={item.leasingOfficer}>
              <strong>{item.leasingOfficer}</strong>
              <div>
                {item.totalLeads} leads · promedio {item.promedioHoras ?? '—'}h ·{' '}
                {item.pctExcelente}% en ≤4h · sin contacto 48h:{' '}
                {item.sinContacto48h}
              </div>
            </StyledRow>
          ))}
        </StyledCard>
      ) : null}

      {tab === 'f8' && dashboard ? (
        <StyledCard>
          <StyledTitle>F8 — Brokers top 10</StyledTitle>
          <StyledMuted>Alertas de disponibilidad recientes</StyledMuted>
          {dashboard.f8BrokerAlerts.map((item) => (
            <StyledRow key={item.id}>
              <strong>
                {item.brokerEmpresa} ← {item.naveIdentificador}
              </strong>
              <div>{item.parqueNombre}</div>
              <a href={item.draftMailto}>Abrir mailto</a>
            </StyledRow>
          ))}
          <StyledMuted>Inactivos ≥45 días</StyledMuted>
          {dashboard.f8Inactivos.map((item) => (
            <StyledRow key={item.empresa}>
              <strong>{item.empresa}</strong>
              <div>
                {item.diasSinActividad} días · {item.zonasOperacion ?? '—'}
              </div>
            </StyledRow>
          ))}
        </StyledCard>
      ) : null}
    </StyledRoot>
  );
};
