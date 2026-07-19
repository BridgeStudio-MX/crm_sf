import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IconAlertTriangle,
  IconBrain,
  IconClock,
  IconRefresh,
  IconTargetArrow,
  IconUsers,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import { ParksProgressBar } from '@/parks-industrial/components/ui/ParksProgressBar';
import {
  ParksSectionCard,
  StyledParksPageStack,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { PARKS_LEADS_CEM_PATH } from '@/parks-industrial/constants/parks-routes.constants';
import {
  type ParksVisualAccent,
  PARKS_BRAND,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import {
  confirmarAsignacionInteligente,
  fetchAsignacionDashboard,
  seedAsignacionDemo,
} from '@/parks-industrial/services/parks-asignacion.client';
import { type AsignacionDashboard } from '@/parks-industrial/types/parks-asignacion.types';

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledConfigChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledChip = styled.span`
  align-items: center;
  background: ${PARKS_BRAND.primarySoft};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${PARKS_BRAND.primary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 6px;
  padding: 6px 12px;
`;

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const StyledLoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLoCard = styled.div<{ accent: ParksVisualAccent }>`
  background: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[accent].backgroundGradient};
  border: 1px solid ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].border};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  position: relative;

  &::before {
    background: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
    border-radius: ${themeCssVariables.border.radius.pill};
    content: '';
    height: 3px;
    left: ${themeCssVariables.spacing[3]};
    position: absolute;
    right: ${themeCssVariables.spacing[3]};
    top: 0;
  }
`;

const StyledLoHeader = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledLoName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledLoMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledLoStats = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledAlertItem = styled.div`
  align-items: flex-start;
  background: ${PARKS_VISUAL_THEME.accents.orange.background};
  border: 1px solid ${PARKS_VISUAL_THEME.accents.orange.border};
  border-left: 3px solid ${PARKS_VISUAL_THEME.accents.orange.accent};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  line-height: 1.4;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledAlertIcon = styled.span`
  color: ${PARKS_VISUAL_THEME.accents.orange.accent};
  flex-shrink: 0;
  margin-top: 2px;
`;

const StyledBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLeadIdentity = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
`;

const StyledLeadIdentityCopy = styled.div`
  min-width: 0;
`;

const StyledLeadBadges = styled(StyledBadges)`
  margin-top: 6px;
`;

const StyledLeadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledLeadCard = styled.div<{ accent: ParksVisualAccent }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left: 4px solid
    ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.strong};
    transform: translateY(-1px);
  }
`;

const StyledLeadHeader = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledLeadTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledLeadBody = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
`;

const StyledAiBox = styled.div`
  background: linear-gradient(
    135deg,
    ${PARKS_BRAND.primarySoft} 0%,
    ${themeCssVariables.background.primary} 75%
  );
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${PARKS_BRAND.primary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: 4px;
  line-height: 1.4;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledAiLabel = styled.span`
  align-items: center;
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: 6px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const StyledSuggestionRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledSuggestionCopy = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 160px;
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCountdown = styled.span<{ urgent: boolean }>`
  align-items: center;
  background: ${({ urgent }) =>
    urgent
      ? PARKS_VISUAL_THEME.accents.orange.background
      : PARKS_VISUAL_THEME.accents.blue.background};
  border: 1px solid
    ${({ urgent }) =>
      urgent
        ? PARKS_VISUAL_THEME.accents.orange.border
        : PARKS_VISUAL_THEME.accents.blue.border};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ urgent }) =>
    urgent
      ? PARKS_VISUAL_THEME.accents.orange.accent
      : PARKS_VISUAL_THEME.accents.blue.accent};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: 4px;
  padding: 4px 10px;
  white-space: nowrap;
`;

const StyledError = styled.p`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledScoreRing = styled.div<{ accent: ParksVisualAccent }>`
  align-items: center;
  background: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[accent].iconBackground};
  border: 1px solid ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].border};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 56px;
  justify-content: center;
  min-width: 56px;
  padding: 4px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    height: 48px;
    min-width: 48px;
  }
`;

const StyledScoreValue = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1;
`;

const StyledScoreLabel = styled.span`
  font-size: 9px;
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.04em;
  opacity: 0.8;
  text-transform: uppercase;
`;

type LoEstado = AsignacionDashboard['equipo']['los'][number]['estado'];

const tierAccent = (tier: string): ParksVisualAccent => {
  if (tier.includes('AAA')) {
    return 'red';
  }

  if (tier.includes('Junior')) {
    return 'gray';
  }

  return 'orange';
};

const nivelAccent = (nivelLo: string): ParksVisualAccent => {
  if (nivelLo.includes('AAA') || nivelLo.includes('Senior')) {
    return 'green';
  }

  if (nivelLo.includes('Junior')) {
    return 'gray';
  }

  return 'blue';
};

const cargaAccent = (estado: LoEstado): ParksVisualAccent => {
  switch (estado) {
    case 'maximo':
      return 'red';
    case 'cerca':
      return 'orange';
    case 'inactivo':
      return 'gray';
    case 'ok':
      return 'green';
  }
};

const cargaLabel = (estado: LoEstado): string => {
  switch (estado) {
    case 'maximo':
      return t`Carga máxima`;
    case 'cerca':
      return t`Cerca del tope`;
    case 'inactivo':
      return t`Inactivo`;
    case 'ok':
      return t`Disponible`;
  }
};

const cargaBarColor = (estado: LoEstado): string => {
  switch (estado) {
    case 'maximo':
      return PARKS_VISUAL_THEME.accents.red.accent;
    case 'cerca':
      return PARKS_VISUAL_THEME.accents.orange.accent;
    case 'inactivo':
      return PARKS_VISUAL_THEME.accents.gray.accent;
    case 'ok':
      return PARKS_BRAND.primary;
  }
};

const hoursRemaining = (
  fechaClasificacion: string,
  maxHours: number,
): { label: string; hoursLeft: number } => {
  const elapsed =
    (Date.now() - new Date(fechaClasificacion).getTime()) / (1000 * 60 * 60);
  const remaining = Math.max(0, maxHours - elapsed);
  const hours = Math.floor(remaining);
  const minutes = Math.round((remaining - hours) * 60);

  return {
    label: t`Vence en ${hours}h ${minutes}min`,
    hoursLeft: remaining,
  };
};

const formatGeneratedAt = (iso?: string): string => {
  if (!iso) {
    return '—';
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return date.toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

export const ParksAsignacionContent = () => {
  const { displayName } = useParksAccess();
  const [dashboard, setDashboard] = useState<AsignacionDashboard | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setErrorMessage(null);

    try {
      setDashboard(await fetchAsignacionDashboard());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`Error al cargar`,
      );
    } finally {
      setLoading(false);
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
        error instanceof Error
          ? error.message
          : t`Error al regenerar demo`,
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
        error instanceof Error ? error.message : t`Error al asignar`,
      );
    } finally {
      setBusy(false);
    }
  };

  const stats = useMemo(() => {
    if (!dashboard) {
      return undefined;
    }

    const aaaCount = dashboard.equipo.pendientes.filter((lead) =>
      lead.tierCalculado.includes('AAA'),
    ).length;
    const alertCount = dashboard.equipo.alertas.length;
    const availableLos = dashboard.equipo.los.filter(
      (lo) => lo.activoParaAsignacion && lo.estado !== 'maximo',
    ).length;

    return [
      {
        label: t`Pendientes`,
        value: String(dashboard.equipo.pendientes.length),
        hint: t`Por asignar`,
      },
      {
        label: t`Cuentas AAA`,
        value: String(aaaCount),
        hint: t`Prioridad alta`,
      },
      {
        label: t`LOs disponibles`,
        value: String(availableLos),
        hint: t`Con capacidad`,
      },
      {
        label: t`Alertas`,
        value: String(alertCount),
        hint: alertCount > 0 ? t`Revisar carga` : t`Sin alertas`,
      },
    ];
  }, [dashboard]);

  if (loading && !dashboard) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  return (
    <StyledParksPageStack>
      <ParksPageHero
        eyebrow={t`Parks Industrial · Comercial`}
        title={t`Asignación inteligente`}
        subtitle={t`Rank de cuenta (AAA / Estándar / Junior) emparejado con el nivel del LO. Top sugerencias, carga y fallbacks para que ningún lead se pierda.`}
        actions={[
          {
            to: PARKS_LEADS_CEM_PATH,
            label: t`Cola CEM`,
            icon: IconUsers,
          },
        ]}
        stats={stats}
      />

      <StyledToolbar>
        <StyledConfigChips>
          <StyledChip>
            {t`Umbral AAA`}{' '}
            {dashboard?.config.umbralM2Aaa.toLocaleString('es-MX') ?? '—'} m²
          </StyledChip>
          <StyledChip>
            <IconClock size={14} />
            {t`Actualizado`} {formatGeneratedAt(dashboard?.generatedAt)}
          </StyledChip>
        </StyledConfigChips>
        <Button
          title={t`Regenerar demo`}
          variant="secondary"
          size="small"
          Icon={IconRefresh}
          disabled={busy}
          onClick={() => void handleSeed()}
        />
      </StyledToolbar>

      {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}

      <StyledGrid>
        <ParksSectionCard title={t`Estado del equipo`} accent="green">
          {(dashboard?.equipo.los.length ?? 0) === 0 ? (
            <ParksEmptyState
              title={t`Sin equipo`}
              description={t`No hay LOs configurados para asignación.`}
            />
          ) : (
            <StyledLoList>
              {dashboard?.equipo.los.map((lo) => {
                const estadoAccent = cargaAccent(lo.estado);
                const nivel = nivelAccent(lo.nivelLo);

                return (
                  <StyledLoCard key={lo.id} accent={estadoAccent}>
                    <StyledLoHeader>
                      <div>
                        <StyledLoName>{lo.nombre}</StyledLoName>
                        <StyledLoMeta>{lo.especialidadSectores}</StyledLoMeta>
                      </div>
                      <StyledBadges>
                        <ParksStatusBadge
                          color={nivel}
                          label={lo.nivelLo}
                        />
                        <ParksStatusBadge
                          color={estadoAccent}
                          label={cargaLabel(lo.estado)}
                        />
                      </StyledBadges>
                    </StyledLoHeader>
                    <ParksProgressBar
                      label={t`Carga`}
                      valueLabel={`${lo.cargaActual}/${lo.cargaMaximaLeads} · ${lo.pctCarga}%`}
                      percentage={lo.pctCarga}
                      accentColor={cargaBarColor(lo.estado)}
                    />
                    <StyledLoStats>
                      <span>
                        {t`Conversión`} {lo.tasaConversionHistorica}%
                      </span>
                      {!lo.activoParaAsignacion ? (
                        <span>{t`Fuera de rotación`}</span>
                      ) : null}
                    </StyledLoStats>
                  </StyledLoCard>
                );
              })}
            </StyledLoList>
          )}

          {(dashboard?.equipo.alertas.length ?? 0) > 0 ? (
            <StyledAlertList>
              {dashboard?.equipo.alertas.map((alerta) => (
                <StyledAlertItem key={alerta}>
                  <StyledAlertIcon>
                    <IconAlertTriangle size={14} />
                  </StyledAlertIcon>
                  <span>{alerta}</span>
                </StyledAlertItem>
              ))}
            </StyledAlertList>
          ) : null}
        </ParksSectionCard>

        <ParksSectionCard
          title={t`Leads pendientes (${dashboard?.equipo.pendientes.length ?? 0})`}
          accent="blue"
        >
          {(dashboard?.equipo.pendientes.length ?? 0) === 0 ? (
            <ParksEmptyState
              title={t`Nada pendiente`}
              description={t`No hay leads por asignar. Regenera el demo o crea leads nuevos.`}
            />
          ) : (
            <StyledLeadList>
              {dashboard?.equipo.pendientes.map((lead) => {
                const accent = tierAccent(lead.tierCalculado);
                const maxHours = lead.tierCalculado.includes('AAA')
                  ? dashboard.config.maxHorasSinAsignarAaa
                  : dashboard.config.maxHorasSinAsignarEstandar;
                const countdown = hoursRemaining(
                  lead.fechaClasificacion,
                  maxHours,
                );
                const isUrgent = countdown.hoursLeft <= 4;

                return (
                  <StyledLeadCard key={lead.id} accent={accent}>
                    <StyledLeadHeader>
                      <StyledLeadIdentity>
                        <StyledScoreRing accent={accent}>
                          <StyledScoreValue>
                            {lead.puntajeTotal}
                          </StyledScoreValue>
                          <StyledScoreLabel>/100</StyledScoreLabel>
                        </StyledScoreRing>
                        <StyledLeadIdentityCopy>
                          <StyledLeadTitle>{lead.empresa}</StyledLeadTitle>
                          <StyledLeadBadges>
                            <ParksStatusBadge
                              color={accent}
                              label={lead.tierCalculado}
                            />
                            <ParksStatusBadge
                              color="sky"
                              label={lead.scoreFinalUsado}
                            />
                            <StyledCountdown urgent={isUrgent}>
                              <IconClock size={12} />
                              {countdown.label}
                            </StyledCountdown>
                          </StyledLeadBadges>
                        </StyledLeadIdentityCopy>
                      </StyledLeadIdentity>
                    </StyledLeadHeader>

                    <StyledLeadBody>{lead.explicacionTier}</StyledLeadBody>

                    {lead.iaRazonTop || lead.razonSugerencia1 ? (
                      <StyledAiBox>
                        <StyledAiLabel>
                          <IconBrain size={14} />
                          {t`Motor IA`}
                        </StyledAiLabel>
                        {lead.iaRazonTop ?? lead.razonSugerencia1}
                      </StyledAiBox>
                    ) : null}

                    {lead.mensajeCarga ? (
                      <StyledLeadBody>{lead.mensajeCarga}</StyledLeadBody>
                    ) : null}

                    {lead.situacionFallback ? (
                      <StyledLeadBody>{lead.situacionFallback}</StyledLeadBody>
                    ) : null}

                    <StyledSuggestionRow>
                      <StyledSuggestionCopy>
                        <strong>{t`Sugerido`}:</strong>{' '}
                        {lead.loSugerido1 ?? t`Sin match`}
                        {lead.loSugerido2
                          ? ` · ${t`Alt`}: ${lead.loSugerido2}`
                          : ''}
                        {lead.loSugerido3
                          ? ` · ${t`Alt 2`}: ${lead.loSugerido3}`
                          : ''}
                      </StyledSuggestionCopy>
                      <StyledActions>
                        {lead.loSugerido1 ? (
                          <Button
                            title={t`Asignar a ${lead.loSugerido1}`}
                            variant="primary"
                            size="small"
                            Icon={IconTargetArrow}
                            disabled={busy}
                            onClick={() =>
                              void handleAssign(
                                lead.opportunityId,
                                lead.loSugerido1!,
                                lead.loSugerido1,
                              )
                            }
                          />
                        ) : null}
                        {lead.loSugerido2 ? (
                          <Button
                            title={t`Alt: ${lead.loSugerido2}`}
                            variant="secondary"
                            size="small"
                            disabled={busy}
                            onClick={() =>
                              void handleAssign(
                                lead.opportunityId,
                                lead.loSugerido2!,
                                lead.loSugerido1,
                              )
                            }
                          />
                        ) : null}
                      </StyledActions>
                    </StyledSuggestionRow>
                  </StyledLeadCard>
                );
              })}
            </StyledLeadList>
          )}
        </ParksSectionCard>
      </StyledGrid>
    </StyledParksPageStack>
  );
};
