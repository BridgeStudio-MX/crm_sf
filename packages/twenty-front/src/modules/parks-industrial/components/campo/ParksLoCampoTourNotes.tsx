import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconDeviceFloppy, IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { PARKS_LO_CAMPO_RECOMMENDATION_CHIPS } from '@/parks-industrial/constants/parks-lo-campo.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import {
  type ParksOpportunityRecord,
} from '@/parks-industrial/hooks/useParksRecords';
import { registerParksTour } from '@/parks-industrial/services/parks-commercial.client';
import {
  formatParksTourNavesLabel,
  parseParksTourNavesMostradas,
} from '@/parks-industrial/utils/parks-tour-naves.util';

type ParksLoCampoTourNotesProps = {
  deal: ParksOpportunityRecord;
  onSaved: (update: Partial<ParksOpportunityRecord>) => void;
};

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.label`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledTextArea = styled.textarea`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.45;
  min-height: 110px;
  padding: 12px 14px;
  resize: vertical;
  width: 100%;
`;

const StyledInput = styled.input`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  min-height: 48px;
  padding: 12px 14px;
  width: 100%;
`;

const StyledChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledChip = styled.button`
  align-items: center;
  background: ${PARKS_BRAND.primarySoft};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${PARKS_BRAND.primary};
  cursor: pointer;
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 6px;
  min-height: 40px;
  padding: 8px 12px;
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledStatus = styled.p<{ $tone: 'ok' | 'error' }>`
  color: ${({ $tone }) =>
    $tone === 'ok' ? PARKS_BRAND.primary : themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  position: sticky;
  bottom: 0;
  padding-top: ${themeCssVariables.spacing[2]};
`;

const buildDefaultTourFecha = (existing?: string | null): string => {
  if (existing && existing.trim().length > 0) {
    return existing.slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
};

const appendChipToText = (current: string, chip: string): string => {
  const trimmed = current.trim();

  if (trimmed.includes(chip)) {
    return trimmed;
  }

  return trimmed.length > 0 ? `${trimmed}\n• ${chip}` : `• ${chip}`;
};

export const ParksLoCampoTourNotes = ({
  deal,
  onSaved,
}: ParksLoCampoTourNotesProps) => {
  const [tourFecha, setTourFecha] = useState(
    buildDefaultTourFecha(deal.tourFecha),
  );
  const [comentarios, setComentarios] = useState(deal.tourFeedback ?? '');
  const [recomendaciones, setRecomendaciones] = useState(
    deal.tourProximosPasos ?? '',
  );
  const [asistentes, setAsistentes] = useState(deal.tourAsistentes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<'ok' | 'error'>('ok');

  const tourNaves = parseParksTourNavesMostradas(deal.tourNavesMostradas);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      await registerParksTour({
        opportunityId: deal.id,
        tourFecha,
        tourFeedback: comentarios.trim(),
        tourProximosPasos: recomendaciones.trim(),
        tourAsistentes: asistentes.trim() || undefined,
        tourParque:
          tourNaves[0]?.parqueNombre ??
          deal.naveVinculada?.identificador ??
          undefined,
        tourNavesMostradas: deal.tourNavesMostradas ?? undefined,
        companyName: deal.name,
      });

      onSaved({
        tourFecha,
        tourFeedback: comentarios.trim(),
        tourProximosPasos: recomendaciones.trim(),
        tourAsistentes: asistentes.trim(),
        stage: 'TOUR_VISITA',
      });

      setStatusTone('ok');
      setStatusMessage(t`Tour guardado. Ya está en el CRM.`);
    } catch (error) {
      setStatusTone('error');
      setStatusMessage(
        error instanceof Error
          ? error.message
          : t`No se pudo guardar el tour`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StyledForm>
      <StyledHint>
        {tourNaves.length > 0
          ? t`Naves del tour: ${formatParksTourNavesLabel(tourNaves)}`
          : t`Anota en campo. Al guardar, el feedback queda en el deal.`}
      </StyledHint>

      <StyledField>
        <StyledLabel htmlFor="lo-campo-fecha">{t`Fecha del tour`}</StyledLabel>
        <StyledInput
          id="lo-campo-fecha"
          type="date"
          value={tourFecha}
          onChange={(event) => setTourFecha(event.target.value)}
        />
      </StyledField>

      <StyledField>
        <StyledLabel htmlFor="lo-campo-asistentes">
          {t`Quién asistió`}
        </StyledLabel>
        <StyledInput
          id="lo-campo-asistentes"
          value={asistentes}
          placeholder={t`Ej. Dir. Operaciones + broker`}
          onChange={(event) => setAsistentes(event.target.value)}
        />
      </StyledField>

      <StyledField>
        <StyledLabel htmlFor="lo-campo-comentarios">
          {t`Comentarios del tour`}
        </StyledLabel>
        <StyledTextArea
          id="lo-campo-comentarios"
          value={comentarios}
          placeholder={t`Qué dijo el cliente, objeciones, reacciones a la nave…`}
          onChange={(event) => setComentarios(event.target.value)}
        />
      </StyledField>

      <StyledField>
        <StyledLabel>{t`Recomendaciones rápidas`}</StyledLabel>
        <StyledChips>
          {PARKS_LO_CAMPO_RECOMMENDATION_CHIPS.map((chip) => (
            <StyledChip
              key={chip}
              type="button"
              onClick={() =>
                setRecomendaciones((current) =>
                  appendChipToText(current, chip),
                )
              }
            >
              <IconPlus size={14} />
              {chip}
            </StyledChip>
          ))}
        </StyledChips>
      </StyledField>

      <StyledField>
        <StyledLabel htmlFor="lo-campo-recomendaciones">
          {t`Recomendaciones / próximos pasos`}
        </StyledLabel>
        <StyledTextArea
          id="lo-campo-recomendaciones"
          value={recomendaciones}
          placeholder={t`Qué recomiendas hacer después del tour`}
          onChange={(event) => setRecomendaciones(event.target.value)}
        />
      </StyledField>

      {statusMessage ? (
        <StyledStatus $tone={statusTone}>{statusMessage}</StyledStatus>
      ) : null}

      <StyledActions>
        <Button
          accent="blue"
          variant="primary"
          Icon={IconDeviceFloppy}
          title={isSaving ? t`Guardando…` : t`Guardar tour`}
          disabled={isSaving || !tourFecha}
          onClick={() => void handleSave()}
          fullWidth
        />
      </StyledActions>
    </StyledForm>
  );
};
