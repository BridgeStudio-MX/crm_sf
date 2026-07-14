import { useCallback, useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  confirmarAsignacionInteligente,
  fetchAsignacionDashboard,
  seedAsignacionDemo,
} from '@/parks-industrial/services/parks-asignacion.client';
import { type AsignacionDashboard } from '@/parks-industrial/types/parks-asignacion.types';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';

const StyledRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
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
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledBadge = styled.span<{ tone: string }>`
  background: ${({ tone }) => tone};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.inverted};
  display: inline-block;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: 2px 8px;
  width: fit-content;
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

  &:disabled {
    opacity: 0.6;
  }
`;

const StyledGhostButton = styled(StyledButton)`
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledError = styled.p`
  color: ${themeCssVariables.font.color.danger};
  margin: 0;
`;

const tierTone = (tier: string): string => {
  if (tier.includes('AAA')) {
    return '#c62828';
  }

  if (tier.includes('Junior')) {
    return '#546e7a';
  }

  return '#ef6c00';
};

const hoursRemainingLabel = (
  fechaClasificacion: string,
  maxHours: number,
): string => {
  const elapsed =
    (Date.now() - new Date(fechaClasificacion).getTime()) / (1000 * 60 * 60);
  const remaining = Math.max(0, maxHours - elapsed);
  const hours = Math.floor(remaining);
  const minutes = Math.round((remaining - hours) * 60);

  return `Vence en ${hours}h ${minutes}min`;
};

export const ParksAsignacionContent = () => {
  const { displayName } = useParksAccess();
  const [dashboard, setDashboard] = useState<AsignacionDashboard | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setErrorMessage(null);

    try {
      setDashboard(await fetchAsignacionDashboard());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error al cargar',
      );
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSeed = async () => {
    setBusy(true);

    try {
      await seedAsignacionDemo();
      await refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error al regenerar demo',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async (
    opportunityId: string,
    leasingOfficerName: string,
    suggested?: string | null,
  ) => {
    setBusy(true);
    setErrorMessage(null);

    try {
      await confirmarAsignacionInteligente({
        opportunityId,
        leasingOfficerName,
        assignedBy: displayName || 'Héctor Montelongo',
        razonCambio:
          suggested && suggested !== leasingOfficerName
            ? `CEM eligió ${leasingOfficerName} en lugar de ${suggested}`
            : undefined,
      });
      await refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error al asignar',
      );
    } finally {
      setBusy(false);
    }
  };

  if (!dashboard && !errorMessage) {
    return <StyledMuted>Cargando asignación inteligente…</StyledMuted>;
  }

  return (
    <StyledRoot>
      <StyledActions>
        <StyledGhostButton
          type="button"
          disabled={busy}
          onClick={() => void handleSeed()}
        >
          Regenerar escenarios demo
        </StyledGhostButton>
      </StyledActions>
      {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}
      <StyledMuted>
        Actualizado {dashboard?.generatedAt ?? '—'} · Einstein{' '}
        {dashboard?.config.einsteinScoringActivo ? 'activo' : 'off'} · Umbral
        AAA {dashboard?.config.umbralM2Aaa.toLocaleString('es-MX')} m²
      </StyledMuted>

      <StyledGrid>
        <StyledCard>
          <StyledTitle>Estado del equipo</StyledTitle>
          {dashboard?.equipo.los.map((lo) => (
            <StyledRow key={lo.id}>
              <strong>
                {lo.nombre} · {lo.nivelLo}
              </strong>
              <div>
                {lo.cargaActual}/{lo.cargaMaximaLeads} leads · Tasa{' '}
                {lo.tasaConversionHistorica}% · {lo.pctCarga}%{' '}
                {lo.estado === 'cerca'
                  ? '⚠️'
                  : lo.estado === 'maximo'
                    ? '🚨'
                    : '✅'}
              </div>
              <StyledMuted>{lo.especialidadSectores}</StyledMuted>
            </StyledRow>
          ))}
          {(dashboard?.equipo.alertas.length ?? 0) > 0 ? (
            <>
              <StyledTitle>Alertas</StyledTitle>
              {dashboard?.equipo.alertas.map((alerta) => (
                <StyledMuted key={alerta}>{alerta}</StyledMuted>
              ))}
            </>
          ) : null}
        </StyledCard>

        <StyledCard>
          <StyledTitle>
            Leads pendientes de asignación (
            {dashboard?.equipo.pendientes.length ?? 0})
          </StyledTitle>
          {(dashboard?.equipo.pendientes.length ?? 0) === 0 ? (
            <StyledMuted>No hay leads pendientes.</StyledMuted>
          ) : (
            dashboard?.equipo.pendientes.map((lead) => {
              const maxHours = lead.tierCalculado.includes('AAA')
                ? dashboard.config.maxHorasSinAsignarAaa
                : dashboard.config.maxHorasSinAsignarEstandar;

              return (
                <StyledRow key={lead.id}>
                  <StyledBadge tone={tierTone(lead.tierCalculado)}>
                    {lead.tierCalculado} · {lead.puntajeTotal}/100 ·{' '}
                    {lead.scoreFinalUsado}
                  </StyledBadge>
                  <strong>{lead.empresa}</strong>
                  <StyledMuted>
                    {hoursRemainingLabel(lead.fechaClasificacion, maxHours)}
                  </StyledMuted>
                  <StyledMuted>{lead.explicacionTier}</StyledMuted>
                  {lead.einsteinRazonTop ? (
                    <StyledMuted>🤖 {lead.einsteinRazonTop}</StyledMuted>
                  ) : null}
                  {lead.mensajeCarga ? (
                    <StyledMuted>{lead.mensajeCarga}</StyledMuted>
                  ) : null}
                  <StyledMuted>
                    Sugerido: {lead.loSugerido1}
                    {lead.loSugerido2 ? ` · Alt: ${lead.loSugerido2}` : ''}
                  </StyledMuted>
                  <StyledActions>
                    {lead.loSugerido1 ? (
                      <StyledButton
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void handleAssign(
                            lead.opportunityId,
                            lead.loSugerido1!,
                            lead.loSugerido1,
                          )
                        }
                      >
                        Asignar a {lead.loSugerido1}
                      </StyledButton>
                    ) : null}
                    {lead.loSugerido2 ? (
                      <StyledGhostButton
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void handleAssign(
                            lead.opportunityId,
                            lead.loSugerido2!,
                            lead.loSugerido1,
                          )
                        }
                      >
                        Asignar a {lead.loSugerido2}
                      </StyledGhostButton>
                    ) : null}
                  </StyledActions>
                </StyledRow>
              );
            })
          )}
        </StyledCard>
      </StyledGrid>
    </StyledRoot>
  );
};
