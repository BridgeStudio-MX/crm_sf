import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IconMap, IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksPropertyImage } from '@/parks-industrial/components/ui/ParksPropertyImage';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { ParksToolSection } from '@/parks-industrial/components/ui/ParksToolSection';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { matchParksNaves } from '@/parks-industrial/services/parks-commercial.client';
import { type NaveMatchCandidate } from '@/parks-industrial/types/parks-commercial.types';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';
import { resolveParksNavePropertyImageUrl } from '@/parks-industrial/utils/parks-image.util';
import {
  formatParksTourNavesLabel,
  parseParksTourNavesMostradas,
  serializeParksTourNavesMostradas,
} from '@/parks-industrial/utils/parks-tour-naves.util';

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
  margin: 0;
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledMatchGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
`;

const StyledMatchCard = styled.button<{ isSelected: boolean; isPrimary: boolean }>`
  background: ${themeCssVariables.background.primary};
  border: 2px solid
    ${({ isPrimary, isSelected }) => {
      if (isPrimary) {
        return themeCssVariables.color.green;
      }

      if (isSelected) {
        return themeCssVariables.color.blue;
      }

      return themeCssVariables.border.color.medium;
    }};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  text-align: left;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledMatchTitle = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMatchMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.35;
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding-top: ${themeCssVariables.spacing[1]};
`;

type ParksNaveMatchPanelProps = {
  opportunityId: string;
  m2Requeridos?: number;
  industry?: string;
  linkedNaveId?: string | null;
  tourNavesMostradas?: string | null;
  continueLabel?: string;
  onNavesSaved?: (update: Partial<ParksOpportunityRecord>) => void;
};

export const ParksNaveMatchPanel = ({
  opportunityId,
  m2Requeridos,
  industry,
  linkedNaveId,
  tourNavesMostradas,
  continueLabel,
  onNavesSaved,
}: ParksNaveMatchPanelProps) => {
  const { updateOneRecord } = useUpdateOneRecord();
  const [matches, setMatches] = useState<NaveMatchCandidate[]>([]);
  const [totalDisponibles, setTotalDisponibles] = useState(0);
  const [selectedNaveIds, setSelectedNaveIds] = useState<string[]>([]);
  const [primaryNaveId, setPrimaryNaveId] = useState<string | null>(null);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parsedTourNaves = parseParksTourNavesMostradas(tourNavesMostradas);
    const initialIds =
      parsedTourNaves.length > 0
        ? parsedTourNaves.map((nave) => nave.id)
        : linkedNaveId
          ? [linkedNaveId]
          : [];

    setSelectedNaveIds(initialIds);
    setPrimaryNaveId(linkedNaveId ?? initialIds[0] ?? null);
  }, [linkedNaveId, tourNavesMostradas]);

  const loadMatches = useCallback(async () => {
    if (!m2Requeridos || m2Requeridos <= 0) {
      return;
    }

    setLoadingMatches(true);
    setError(null);

    try {
      const result = await matchParksNaves({
        opportunityId,
        m2Requeridos,
        industry,
        limit: 50,
      });
      setMatches(result.matches);
      setTotalDisponibles(result.totalDisponibles);
    } catch (matchError) {
      const message =
        matchError instanceof Error
          ? matchError.message
          : t`No se pudo cargar matching`;
      setError(message);
    } finally {
      setLoadingMatches(false);
    }
  }, [industry, m2Requeridos, opportunityId]);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  const selectedMatches = useMemo(
    () =>
      selectedNaveIds
        .map((naveId) => matches.find((match) => match.naveId === naveId))
        .filter((match): match is NaveMatchCandidate => Boolean(match)),
    [matches, selectedNaveIds],
  );

  const toggleNaveInTour = (naveId: string) => {
    setSelectedNaveIds((previous) => {
      if (previous.includes(naveId)) {
        const next = previous.filter((id) => id !== naveId);

        setPrimaryNaveId((currentPrimary) => {
          if (currentPrimary === naveId) {
            return next[0] ?? null;
          }

          return currentPrimary;
        });

        return next;
      }

      setPrimaryNaveId((currentPrimary) => currentPrimary ?? naveId);

      return [...previous, naveId];
    });
  };

  const handleContinue = async () => {
    if (selectedMatches.length === 0) {
      setError(t`Selecciona al menos una nave`);
      return;
    }

    const primaryMatch =
      selectedMatches.find((match) => match.naveId === primaryNaveId) ??
      selectedMatches[0];

    if (!primaryMatch) {
      return;
    }

    setLoadingSave(true);
    setError(null);

    try {
      const tourNavesPayload = serializeParksTourNavesMostradas(
        selectedMatches.map((match) => ({
          id: match.naveId,
          identificador: match.identificador,
          m2: match.m2,
          parqueNombre: match.parqueNombre,
        })),
      );

      await updateOneRecord({
        objectNameSingular: 'opportunity',
        idToUpdate: opportunityId,
        updateOneRecordInput: {
          naveVinculadaId: primaryMatch.naveId,
          tourNavesMostradas: tourNavesPayload,
          m2Ofertados: primaryMatch.m2,
          precioPorM2Usd: primaryMatch.precioUsdM2 ?? undefined,
        },
      });

      onNavesSaved?.({
        naveVinculadaId: primaryMatch.naveId,
        naveVinculada: {
          id: primaryMatch.naveId,
          identificador: primaryMatch.identificador,
        },
        tourNavesMostradas: tourNavesPayload,
        m2Ofertados: primaryMatch.m2,
        precioPorM2Usd: primaryMatch.precioUsdM2,
      });
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : t`No se pudieron guardar las naves`;
      setError(message);
    } finally {
      setLoadingSave(false);
    }
  };

  if (!m2Requeridos || m2Requeridos <= 0) {
    return (
      <ParksToolSection title={t`Elegir naves`} icon={IconMap}>
        <StyledHint>
          {t`Registra m² requeridos en el deal para ver naves disponibles.`}
        </StyledHint>
      </ParksToolSection>
    );
  }

  return (
    <ParksToolSection
      title={t`1 · Elegir naves`}
      icon={IconMap}
      hint={t`Toca para seleccionar · la primera queda como principal`}
      action={
        <Button
          variant="secondary"
          Icon={IconRefresh}
          title={t`Actualizar`}
          onClick={() => void loadMatches()}
          disabled={loadingMatches}
        />
      }
    >
      <StyledToolbar>
        <StyledHint>
          {t`${matches.length} de ${totalDisponibles} disponibles`}
        </StyledHint>
        {selectedNaveIds.length > 0 ? (
          <ParksStatusBadge
            color="blue"
            label={t`${selectedNaveIds.length} seleccionadas`}
          />
        ) : null}
      </StyledToolbar>

      {loadingMatches ? <ParksLoadingSkeleton variant="list" /> : null}

      {!loadingMatches && matches.length === 0 ? (
        <StyledHint>{t`Sin naves disponibles para este criterio.`}</StyledHint>
      ) : null}

      <StyledMatchGrid>
        {matches.map((match) => {
          const isSelected = selectedNaveIds.includes(match.naveId);
          const isPrimary = primaryNaveId === match.naveId;
          const imageUrl = resolveParksNavePropertyImageUrl({
            fotoInmuebleUrl: match.fotoInmuebleUrl,
            identificador: match.identificador,
            recordId: match.naveId,
          });

          return (
            <StyledMatchCard
              key={match.naveId}
              type="button"
              isSelected={isSelected}
              isPrimary={isPrimary}
              onClick={() => toggleNaveInTour(match.naveId)}
            >
              <ParksPropertyImage
                imageUrl={imageUrl}
                alt={match.identificador}
                fallbackLabel={match.identificador}
                height={110}
              />
              <StyledCardBody>
                <StyledMatchTitle>{match.identificador}</StyledMatchTitle>
                <StyledMatchMeta>
                  {formatParksNumber(match.m2)} m² · {match.matchScore}%
                </StyledMatchMeta>
                <StyledMatchMeta>
                  {match.parqueNombre ?? match.ubicacion ?? '—'}
                </StyledMatchMeta>
                {isPrimary ? (
                  <ParksStatusBadge color="green" label={t`Principal`} />
                ) : isSelected ? (
                  <ParksStatusBadge color="blue" label={t`Seleccionada`} />
                ) : null}
              </StyledCardBody>
            </StyledMatchCard>
          );
        })}
      </StyledMatchGrid>

      <StyledFooter>
        <StyledHint>
          {selectedMatches.length > 0
            ? formatParksTourNavesLabel(
                selectedMatches.map((match) => ({
                  id: match.naveId,
                  identificador: match.identificador,
                })),
              )
            : t`Selecciona una o más naves`}
        </StyledHint>
        <Button
          variant="primary"
          accent="blue"
          title={continueLabel ?? t`Continuar a agendar`}
          onClick={() => void handleContinue()}
          disabled={loadingSave || selectedMatches.length === 0}
        />
      </StyledFooter>

      {error ? <StyledError>{error}</StyledError> : null}
    </ParksToolSection>
  );
};
