import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IconShield } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import {
  StyledParksTextarea,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import {
  answerParksComiteQuestion,
  askParksComiteQuestion,
  fetchParksComiteById,
  fetchParksComiteList,
  voteParksComite,
} from '@/parks-industrial/services/parks-comite.client';
import {
  type ComiteAutorizacion,
  type ComiteListSummary,
  type ComiteVotoValor,
} from '@/parks-industrial/types/parks-comite.types';
import {
  formatComiteCurrency,
  getComiteSemaforoColor,
  getComiteTrackerHint,
  getHoursUntil,
} from '@/parks-industrial/utils/parks-comite-format.util';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledMetrics = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
`;

const StyledLayout = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  max-height: 70vh;
  overflow-y: auto;
`;

const StyledListCard = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive
      ? themeCssVariables.background.transparent.light
      : themeCssVariables.background.primary};
  border: 1px solid
    ${({ isActive }) =>
      isActive
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-left: 4px solid
    ${({ isActive }) =>
      isActive ? themeCssVariables.color.blue : '#1e3a5f'};
  border-radius: ${themeCssVariables.border.radius.md};
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
`;

const StyledDetail = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeader = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  padding-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h2`
  color: #1e3a5f;
  font-size: ${themeCssVariables.font.size.lg};
  margin: 0;
`;

const StyledMeta = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: ${themeCssVariables.spacing[1]} 0 0;
`;

const StyledGrid2 = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledPanelTitle = styled.strong`
  color: #1e3a5f;
  display: block;
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledBroker = styled.div`
  background: rgba(234, 88, 12, 0.08);
  border: 1px solid rgba(234, 88, 12, 0.35);
  border-radius: ${themeCssVariables.border.radius.sm};
  color: #9a3412;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledSemaforo = styled.span<{ color: string }>`
  background: ${({ color }) => color};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: white;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: 2px 8px;
`;

const StyledVoteCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledVoteRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledError = styled.p`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledQuestion = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const votoLabel = (voto: ComiteVotoValor): string => {
  switch (voto) {
    case 'Aprueba':
      return '✅ Aprueba';
    case 'Rechaza':
      return '❌ Rechaza';
    case 'Se abstiene':
      return '— Se abstiene';
    case 'Pendiente':
      return '⏳ Pendiente';
  }
};

export const ParksComiteContent = () => {
  const { comiteId: routeComiteId } = useParams<{ comiteId?: string }>();
  const { userEmail, displayName } = useParksAccess();
  const viewerEmail = userEmail?.toLowerCase() ?? '';
  const [loading, setLoading] = useState(true);
  const [comites, setComites] = useState<ComiteAutorizacion[]>([]);
  const [summary, setSummary] = useState<ComiteListSummary | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    routeComiteId ?? null,
  );
  const [selected, setSelected] = useState<ComiteAutorizacion | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [comentario, setComentario] = useState('');
  const [preguntaTexto, setPreguntaTexto] = useState('');
  const [respuestaTexto, setRespuestaTexto] = useState('');

  const refreshList = useCallback(async () => {
    const result = await fetchParksComiteList(viewerEmail || undefined);
    setComites(result.comites);
    setSummary(result.summary);
    return result.comites;
  }, [viewerEmail]);

  const loadSelected = useCallback(async (comiteId: string) => {
    const detail = await fetchParksComiteById(comiteId);
    setSelected(detail);
    setSelectedId(detail.id);
    return detail;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const list = await refreshList();
        const initialId = routeComiteId ?? list[0]?.id;

        if (initialId && !cancelled) {
          await loadSelected(initialId);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : t`No se pudo cargar el comité`,
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, [loadSelected, refreshList, routeComiteId, viewerEmail]);

  const mySeat = useMemo(() => {
    if (!selected || !viewerEmail) {
      return null;
    }

    return (
      selected.miembros.find(
        (member) => member.email.toLowerCase() === viewerEmail,
      ) ?? null
    );
  }, [selected, viewerEmail]);

  const canVote =
    Boolean(mySeat) &&
    mySeat?.voto === 'Pendiente' &&
    selected?.estatus === 'Abierto — en deliberación';

  const handleSelect = async (comiteId: string) => {
    setBusy(true);
    setErrorMessage(null);
    setComentario('');
    setPreguntaTexto('');
    setRespuestaTexto('');

    try {
      await loadSelected(comiteId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`No se pudo abrir el comité`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleVote = async (voto: Exclude<ComiteVotoValor, 'Pendiente'>) => {
    if (!selected || !mySeat) {
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      const updated = await voteParksComite({
        comiteId: selected.id,
        memberId: mySeat.memberId,
        voto,
        comentario: comentario.trim() || undefined,
        viewerEmail: viewerEmail || undefined,
      });
      setSelected(updated);
      setComentario('');
      await refreshList();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`No se pudo registrar el voto`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleAsk = async () => {
    if (!selected || !mySeat || !preguntaTexto.trim()) {
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      const updated = await askParksComiteQuestion({
        comiteId: selected.id,
        memberId: mySeat.memberId,
        preguntaTexto,
      });
      setSelected(updated);
      setPreguntaTexto('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`No se pudo enviar la pregunta`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleAnswer = async (preguntaId: string) => {
    if (!selected || !respuestaTexto.trim()) {
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      const updated = await answerParksComiteQuestion({
        comiteId: selected.id,
        preguntaId,
        respuestaTexto,
        respuestaPorNombre:
          displayName || userEmail || selected.leasingOfficerNombre,
      });
      setSelected(updated);
      setRespuestaTexto('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`No se pudo responder la pregunta`,
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  if (comites.length === 0) {
    return (
      <ParksEmptyState
        title={t`No hay comités`}
        description={t`Cuando una Hoja de Acuerdos quede firmada por CEM y cliente, se abrirá aquí.`}
      />
    );
  }

  return (
    <StyledStack>
      {summary ? (
        <StyledMetrics>
          <ParksMetricCard
            label={t`En deliberación`}
            value={summary.openCount}
            icon={IconShield}
            accent="blue"
          />
          <ParksMetricCard
            label={t`Aprobados`}
            value={summary.approvedCount}
            accent="green"
          />
          <ParksMetricCard
            label={t`Rechazados`}
            value={summary.rejectedCount}
            accent="red"
          />
          <ParksMetricCard
            label={t`Mis votos pendientes`}
            value={summary.pendingVotesForViewer}
            accent="orange"
          />
        </StyledMetrics>
      ) : null}

      <StyledLayout>
        <StyledList>
          {comites.map((comite) => (
            <StyledListCard
              key={comite.id}
              type="button"
              isActive={selectedId === comite.id}
              onClick={() => void handleSelect(comite.id)}
            >
              <strong>{comite.deal.clienteRazonSocial}</strong>
              <StyledMeta>
                {comite.referencia} · {comite.deal.naveNomenclatura}
              </StyledMeta>
              <StyledMeta>
                {comite.estatus} · ✅ {comite.votosAprueba} ❌{' '}
                {comite.votosRechaza} ⏳ {comite.votosPendientes}
              </StyledMeta>
            </StyledListCard>
          ))}
        </StyledList>

        {selected ? (
          <StyledDetail>
            <StyledHeader>
              <div>
                <StyledTitle>
                  {t`Comité de Autorización`} · {selected.referencia}
                </StyledTitle>
                <StyledMeta>
                  🏭 {selected.deal.naveNomenclatura} ·{' '}
                  {selected.deal.parqueNombre}
                </StyledMeta>
                <StyledMeta>
                  👤 {selected.deal.clienteRazonSocial} ·{' '}
                  {selected.deal.clienteGiro}
                </StyledMeta>
                <StyledMeta>
                  {t`Presentado por`} {selected.leasingOfficerNombre} · CEM{' '}
                  {selected.cemQueFirmoNombre}
                </StyledMeta>
              </div>
              <div>
                <StyledMeta>
                  ⏱{' '}
                  {selected.estatus === 'Abierto — en deliberación'
                    ? t`Vence en ${getHoursUntil(selected.fechaLimiteResolucion)} horas`
                    : selected.resolucion}
                </StyledMeta>
                <StyledSemaforo
                  color={getComiteSemaforoColor(selected.deal.semaforoPrecio)}
                >
                  {selected.deal.semaforoPrecio} −
                  {selected.deal.descuentoPorcentaje}%
                </StyledSemaforo>
              </div>
            </StyledHeader>

            <StyledGrid2>
              <StyledPanel>
                <StyledPanelTitle>{t`Precio`}</StyledPanelTitle>
                <StyledMeta>
                  {t`Lista`}:{' '}
                  {formatComiteCurrency(
                    selected.deal.precioListaM2,
                    selected.deal.moneda,
                  )}
                  /m²
                </StyledMeta>
                <StyledMeta>
                  {t`Acordado`}:{' '}
                  {formatComiteCurrency(
                    selected.deal.precioAcordadoM2,
                    selected.deal.moneda,
                  )}
                  /m²
                </StyledMeta>
                <StyledMeta>
                  {t`Renta mensual`}:{' '}
                  {formatComiteCurrency(
                    selected.deal.rentaMensual,
                    selected.deal.moneda,
                  )}
                </StyledMeta>
              </StyledPanel>
              <StyledPanel>
                <StyledPanelTitle>{t`Condiciones`}</StyledPanelTitle>
                <StyledMeta>
                  {formatParksNumber(selected.deal.glaM2)} m² ·{' '}
                  {selected.deal.plazoMeses} {t`meses`}
                </StyledMeta>
                <StyledMeta>
                  {t`Gracia`}: {selected.deal.periodoGraciaMeses} ·{' '}
                  {t`Depósito`}: {selected.deal.depositosGarantiaMeses}
                </StyledMeta>
                <StyledMeta>
                  {t`Guante`}:{' '}
                  {formatComiteCurrency(
                    selected.deal.guantePactado,
                    selected.deal.moneda,
                  )}
                </StyledMeta>
              </StyledPanel>
            </StyledGrid2>

            <StyledBroker>
              🤝 BROKER: {selected.deal.brokerNombre} ·{' '}
              {selected.deal.brokerClasificacion}
              {selected.deal.clienteAdeudosActivos
                ? ` · ⚠️ ${t`Adeudos activos`}`
                : ` · ${t`Sin adeudos activos`}`}
              {selected.deal.esPropiedadFuno
                ? ` · ⚠️ FUNO`
                : ` · ${t`Propiedad propia`}`}
            </StyledBroker>

            {selected.deal.condicionesEspeciales ? (
              <StyledPanel>
                <StyledPanelTitle>{t`Condiciones especiales`}</StyledPanelTitle>
                <StyledMeta>{selected.deal.condicionesEspeciales}</StyledMeta>
              </StyledPanel>
            ) : null}

            <StyledPanel>
              <StyledPanelTitle>{t`Votos actuales`}</StyledPanelTitle>
              <StyledMeta>{getComiteTrackerHint(selected)}</StyledMeta>
              <StyledVoteRow>
                {selected.miembros.map((member) => (
                  <StyledVoteCard key={member.memberId}>
                    <strong>{member.nombre}</strong>
                    <StyledMeta>{member.rolEtiqueta}</StyledMeta>
                    <StyledMeta>{votoLabel(member.voto)}</StyledMeta>
                    {member.comentario ? (
                      <StyledMeta>“{member.comentario}”</StyledMeta>
                    ) : null}
                  </StyledVoteCard>
                ))}
              </StyledVoteRow>
            </StyledPanel>

            <StyledPanel>
              <StyledPanelTitle>
                {t`Preguntas del comité`} ({selected.preguntas.length})
              </StyledPanelTitle>
              {selected.preguntas.length === 0 ? (
                <StyledMeta>{t`Sin preguntas aún`}</StyledMeta>
              ) : (
                selected.preguntas.map((pregunta) => (
                  <StyledQuestion key={pregunta.id}>
                    <strong>{pregunta.preguntaPorNombre}</strong>
                    <StyledMeta>{pregunta.preguntaTexto}</StyledMeta>
                    {pregunta.resuelta ? (
                      <StyledMeta>
                        ✅ {pregunta.respuestaPorNombre}:{' '}
                        {pregunta.respuestaTexto}
                      </StyledMeta>
                    ) : (
                      <>
                        <StyledMeta>{t`Sin respuesta aún`}</StyledMeta>
                        <StyledParksTextarea
                          rows={2}
                          value={respuestaTexto}
                          onChange={(event) =>
                            setRespuestaTexto(event.target.value)
                          }
                          placeholder={t`Respuesta del LO / CEM`}
                        />
                        <Button
                          title={t`Responder`}
                          size="small"
                          variant="secondary"
                          disabled={busy || !respuestaTexto.trim()}
                          onClick={() => void handleAnswer(pregunta.id)}
                        />
                      </>
                    )}
                  </StyledQuestion>
                ))
              )}
            </StyledPanel>

            {selected.estatus === 'Abierto — en deliberación' ? (
              <StyledPanel>
                <StyledPanelTitle>{t`Tu voto`}</StyledPanelTitle>
                {mySeat ? (
                  <>
                    <StyledMeta>
                      {t`Asiento`}: {mySeat.nombre} · {mySeat.rolEtiqueta}
                    </StyledMeta>
                    <StyledParksTextarea
                      rows={3}
                      value={comentario}
                      onChange={(event) => setComentario(event.target.value)}
                      placeholder={t`Comentarios (obligatorio si rechazas)`}
                    />
                    <StyledActions>
                      <Button
                        title={t`Aprobar`}
                        variant="primary"
                        size="small"
                        disabled={busy || !canVote}
                        onClick={() => void handleVote('Aprueba')}
                      />
                      <Button
                        title={t`Rechazar`}
                        variant="secondary"
                        size="small"
                        disabled={busy || !canVote}
                        onClick={() => void handleVote('Rechaza')}
                      />
                      <Button
                        title={t`Abstenerme`}
                        variant="secondary"
                        size="small"
                        disabled={busy || !canVote}
                        onClick={() => void handleVote('Se abstiene')}
                      />
                    </StyledActions>
                    <StyledMeta>
                      {t`Hacer una pregunta (no bloquea el voto)`}
                    </StyledMeta>
                    <StyledParksTextarea
                      rows={2}
                      value={preguntaTexto}
                      onChange={(event) => setPreguntaTexto(event.target.value)}
                      placeholder={t`Pregunta al LO / CEM`}
                    />
                    <Button
                      title={t`Enviar pregunta`}
                      size="small"
                      variant="secondary"
                      disabled={busy || !preguntaTexto.trim()}
                      onClick={() => void handleAsk()}
                    />
                  </>
                ) : (
                  <StyledMeta>
                    {t`Modo lectura: no tienes asiento de voto en este comité. Puedes seguir el tracker y el hilo Q&A.`}
                  </StyledMeta>
                )}
              </StyledPanel>
            ) : null}

            {selected.resumenRazonesRechazo ? (
              <StyledPanel>
                <StyledPanelTitle>{t`Razones de rechazo`}</StyledPanelTitle>
                <StyledMeta style={{ whiteSpace: 'pre-wrap' }}>
                  {selected.resumenRazonesRechazo}
                </StyledMeta>
              </StyledPanel>
            ) : null}

            {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}
          </StyledDetail>
        ) : null}
      </StyledLayout>
    </StyledStack>
  );
};
