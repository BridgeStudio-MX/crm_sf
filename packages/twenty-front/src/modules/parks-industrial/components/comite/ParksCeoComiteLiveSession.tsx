import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksCeoComiteAgendaCard } from '@/parks-industrial/components/comite/ParksCeoComiteAgendaCard';
import { ParksCeoComiteFeaturedPanel } from '@/parks-industrial/components/comite/ParksCeoComiteFeaturedPanel';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { PARKS_VIBE } from '@/parks-industrial/constants/parks-theme.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import {
  decideParksComiteAsCeo,
  fetchParksComiteList,
  requestParksComiteSessionAdjustments,
} from '@/parks-industrial/services/parks-comite.client';
import { type ComiteAutorizacion } from '@/parks-industrial/types/parks-comite.types';
import { isComiteOnLiveAgenda } from '@/parks-industrial/utils/parks-comite-live-session.util';

const StyledAgendaStrip = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  overflow-x: auto;
  padding-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledToolbar = styled.div`
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
`;

const StyledToolbarCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledToolbarTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledToolbarHint = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledResolvedHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

export const ParksCeoComiteLiveSession = () => {
  const { comiteId: routeComiteId } = useParams<{ comiteId?: string }>();
  const { displayName, userEmail } = useParksAccess();
  const [comites, setComites] = useState<ComiteAutorizacion[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    routeComiteId ?? null,
  );
  const [note, setNote] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [isProjectionMode, setIsProjectionMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const pickAgendaId = useCallback(
    (nextComites: ComiteAutorizacion[], currentId: string | null) => {
      const agendaIds = nextComites
        .filter(isComiteOnLiveAgenda)
        .map((comite) => comite.id);

      if (currentId && agendaIds.includes(currentId)) {
        return currentId;
      }

      if (routeComiteId && agendaIds.includes(routeComiteId)) {
        return routeComiteId;
      }

      return agendaIds[0] ?? null;
    },
    [routeComiteId],
  );

  useEffect(() => {
    let isCancelled = false;

    const loadAgenda = async () => {
      try {
        const result = await fetchParksComiteList(userEmail || undefined);

        if (isCancelled) {
          return;
        }

        setComites(result.comites);
        setSelectedId((currentId) => pickAgendaId(result.comites, currentId));
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setComites([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : t`No se pudo cargar la sesión de comité`,
        );
      } finally {
        if (!isCancelled) {
          setHasLoaded(true);
        }
      }
    };

    void loadAgenda();

    return () => {
      isCancelled = true;
    };
  }, [pickAgendaId, userEmail]);

  const agenda = (comites ?? []).filter(isComiteOnLiveAgenda);
  const selected =
    agenda.find((comite) => comite.id === selectedId) ?? agenda[0] ?? null;
  const resolvedCount = (comites ?? []).length - agenda.length;

  const handleSelect = (comiteId: string) => {
    setSelectedId(comiteId);
    setNote('');
    setErrorMessage(null);
  };

  const handleRequestAdjustments = async () => {
    if (!selected) {
      return;
    }

    if (!note.trim()) {
      setErrorMessage(t`Anota el ajuste que pide la sala`);
      return;
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      const updated = await requestParksComiteSessionAdjustments({
        comiteId: selected.id,
        texto: note.trim(),
        viewerNombre: displayName || 'CEO',
      });
      setComites((current) =>
        (current ?? []).map((comite) =>
          comite.id === updated.id ? updated : comite,
        ),
      );
      setNote('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`No se pudo registrar el ajuste`,
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleDecide = async (decision: 'Aprueba' | 'Rechaza') => {
    if (!selected) {
      return;
    }

    if (decision === 'Rechaza' && !note.trim()) {
      setErrorMessage(t`El rechazo en sala requiere el motivo`);
      return;
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      const updated = await decideParksComiteAsCeo({
        comiteId: selected.id,
        decision,
        comentario: note.trim() || undefined,
        viewerEmail: userEmail || undefined,
        viewerNombre: displayName || 'CEO',
      });
      const nextComites = (comites ?? []).map((comite) =>
        comite.id === updated.id ? updated : comite,
      );
      setComites(nextComites);
      setSelectedId(pickAgendaId(nextComites, selected.id));
      setNote('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`No se pudo registrar la decisión`,
      );
    } finally {
      setIsBusy(false);
    }
  };

  if (!hasLoaded && comites === null) {
    return <ParksLoadingSkeleton variant="dashboard" />;
  }

  if (agenda.length === 0) {
    return (
      <StyledParksPageStack>
        <ParksEmptyState
          title={t`No hay deals en sesión`}
          description={t`Cuando un deal supera el umbral de m², descuento o tipo de cliente, aparece aquí para proyectarlo y resolverlo en vivo.`}
        />
      </StyledParksPageStack>
    );
  }

  return (
    <StyledParksPageStack
      style={{ gap: isProjectionMode ? PARKS_VIBE.space.xl : undefined }}
    >
      <StyledToolbar>
        <StyledToolbarCopy>
          <StyledToolbarTitle>
            {t`${agenda.length} deal${agenda.length === 1 ? '' : 's'} en la mesa`}
          </StyledToolbarTitle>
          <StyledToolbarHint>
            {t`Proyecta, discute en sala, pide ajustes y resuelve. No hay votación por login.`}
          </StyledToolbarHint>
        </StyledToolbarCopy>
        <Button
          variant={isProjectionMode ? 'primary' : 'secondary'}
          title={
            isProjectionMode ? t`Salir de proyección` : t`Modo proyección`
          }
          onClick={() => setIsProjectionMode((current) => !current)}
        />
      </StyledToolbar>
      {isProjectionMode ? null : (
        <StyledAgendaStrip>
          {agenda.map((comite) => (
            <ParksCeoComiteAgendaCard
              key={comite.id}
              comite={comite}
              isActive={comite.id === selected?.id}
              onSelect={() => handleSelect(comite.id)}
            />
          ))}
        </StyledAgendaStrip>
      )}
      {selected ? (
        <ParksCeoComiteFeaturedPanel
          comite={selected}
          note={note}
          isBusy={isBusy}
          isProjectionMode={isProjectionMode}
          onNoteChange={setNote}
          onRequestAdjustments={() => {
            void handleRequestAdjustments();
          }}
          onApprove={() => {
            void handleDecide('Aprueba');
          }}
          onReject={() => {
            void handleDecide('Rechaza');
          }}
        />
      ) : null}
      {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}
      {resolvedCount > 0 && !isProjectionMode ? (
        <StyledResolvedHint>
          {t`${resolvedCount} deal${resolvedCount === 1 ? '' : 's'} ya resueltos en sesiones anteriores — no se proyectan.`}
        </StyledResolvedHint>
      ) : null}
    </StyledParksPageStack>
  );
};
