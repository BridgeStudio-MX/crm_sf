import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useMemo, useState } from 'react';
import { IconMail } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { sendParksMapOutreach } from '@/parks-industrial/services/parks-commercial.client';
import {
  type MapOutreachResult,
} from '@/parks-industrial/types/parks-commercial.types';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';
import {
  type ParksMapOfferableNave,
} from '@/parks-industrial/utils/parks-map-offerable-naves.util';
import {
  StyledParksSelect,
  StyledParksTextarea,
} from '@/parks-industrial/components/ui/parks-form-control.styles';

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.strong`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
`;

const StyledSuccess = styled.p`
  color: ${themeCssVariables.color.green};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
`;

const StyledError = styled.p`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPreview = styled.pre`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
  max-height: 140px;
  overflow: auto;
  padding: ${themeCssVariables.spacing[2]};
  white-space: pre-wrap;
`;

type ParksMapLeadOutreachPanelProps = {
  selectedLeads: ParksOpportunityRecord[];
  offerableNaves: ParksMapOfferableNave[];
  onClearSelection: () => void;
};

const buildCompanyName = (lead: ParksOpportunityRecord): string => {
  const name = lead.name?.trim() ?? '';
  const separatorIndex = name.indexOf('—');

  if (separatorIndex > 0) {
    return name.slice(0, separatorIndex).trim();
  }

  return name || t`Prospecto`;
};

export const ParksMapLeadOutreachPanel = ({
  selectedLeads,
  offerableNaves,
  onClearSelection,
}: ParksMapLeadOutreachPanelProps) => {
  const [selectedNaveId, setSelectedNaveId] = useState(
    offerableNaves[0]?.naveId ?? '',
  );
  const [personalNote, setPersonalNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<MapOutreachResult | null>(null);

  useEffect(() => {
    if (
      offerableNaves.length > 0 &&
      !offerableNaves.some((nave) => nave.naveId === selectedNaveId)
    ) {
      setSelectedNaveId(offerableNaves[0]!.naveId);
    }
  }, [offerableNaves, selectedNaveId]);

  const selectedNave = useMemo(
    () =>
      offerableNaves.find((nave) => nave.naveId === selectedNaveId) ??
      offerableNaves[0] ??
      null,
    [offerableNaves, selectedNaveId],
  );

  const previewBody = useMemo(() => {
    if (!selectedNave || selectedLeads.length === 0) {
      return '';
    }

    const sampleLead = selectedLeads[0]!;
    const companyName = buildCompanyName(sampleLead);
    const demandLine = sampleLead.m2Requeridos
      ? t`Vi que buscan cerca de ${formatParksNumber(sampleLead.m2Requeridos)} m²`
      : t`Vi su interés en espacio industrial`;
    const regionLine = sampleLead.ubicacionDeseada
      ? ` en ${sampleLead.ubicacionDeseada}`
      : '';
    const noteBlock = personalNote.trim()
      ? `\n${personalNote.trim()}\n`
      : '';

    return [
      t`Hola equipo ${companyName},`,
      '',
      `${demandLine}${regionLine}.`,
      '',
      `• ${selectedNave.naveIdentificador}`,
      `• ${selectedNave.parqueNombre ?? 'Parks'}`,
      `• ${formatParksNumber(selectedNave.m2)} m²`,
      `• ${selectedNave.availabilityLabel}`,
      noteBlock,
      t`(+ ${selectedLeads.length - 1} leads más con el mismo template)`,
    ].join('\n');
  }, [personalNote, selectedLeads, selectedNave]);

  const handleSend = async () => {
    if (!selectedNave || selectedLeads.length === 0) {
      setErrorMessage(t`Selecciona leads y una nave`);
      return;
    }

    setBusy(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const outreachResult = await sendParksMapOutreach({
        leads: selectedLeads.map((lead) => ({
          opportunityId: lead.id,
          opportunityName: lead.name ?? t`Lead`,
          companyName: buildCompanyName(lead),
          ubicacionDeseada: lead.ubicacionDeseada,
          m2Requeridos: lead.m2Requeridos,
        })),
        nave: {
          naveId: selectedNave.naveId,
          naveIdentificador: selectedNave.naveIdentificador,
          parqueNombre: selectedNave.parqueNombre,
          ubicacion: selectedNave.ubicacion,
          m2: selectedNave.m2,
          precioUsdM2: selectedNave.precioUsdM2,
          availabilityLabel: selectedNave.availabilityLabel,
        },
        personalNote: personalNote.trim() || undefined,
      });

      setResult(outreachResult);

      const firstDraft = outreachResult.drafts[0];

      if (firstDraft) {
        await navigator.clipboard.writeText(
          `${firstDraft.subject}\n\n${firstDraft.body}`,
        );
        window.open(firstDraft.mailtoUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`No se pudo preparar el email`,
      );
    } finally {
      setBusy(false);
    }
  };

  if (selectedLeads.length === 0) {
    return null;
  }

  return (
    <StyledPanel>
      <StyledTitle>
        {selectedLeads.length === 1
          ? t`Ofertar nave a 1 lead`
          : t`Ofertar nave a ${selectedLeads.length} leads`}
      </StyledTitle>
      <StyledHint>
        {t`Elige una nave disponible o próxima a liberar. Se genera el email, se registra en CRM y se abre tu cliente de correo.`}
      </StyledHint>

      {offerableNaves.length === 0 ? (
        <StyledError>
          {t`No hay naves disponibles ni próximas a liberar en cartera.`}
        </StyledError>
      ) : (
        <>
          <StyledParksSelect
            value={selectedNave?.naveId ?? ''}
            onChange={(event) => setSelectedNaveId(event.target.value)}
            aria-label={t`Nave a ofertar`}
          >
            {offerableNaves.some((nave) => nave.kind === 'disponible') ? (
              <optgroup label={t`Disponibles`}>
                {offerableNaves
                  .filter((nave) => nave.kind === 'disponible')
                  .map((nave) => (
                    <option key={nave.naveId} value={nave.naveId}>
                      {nave.naveIdentificador}
                      {nave.parqueNombre ? ` · ${nave.parqueNombre}` : ''}
                      {` · ${formatParksNumber(nave.m2)} m²`}
                    </option>
                  ))}
              </optgroup>
            ) : null}
            {offerableNaves.some((nave) => nave.kind === 'proxima') ? (
              <optgroup label={t`Próximas a liberar`}>
                {offerableNaves
                  .filter((nave) => nave.kind === 'proxima')
                  .map((nave) => (
                    <option key={nave.naveId} value={nave.naveId}>
                      {nave.naveIdentificador}
                      {nave.parqueNombre ? ` · ${nave.parqueNombre}` : ''}
                      {` · ${nave.availabilityLabel}`}
                    </option>
                  ))}
              </optgroup>
            ) : null}
          </StyledParksSelect>

          <StyledParksTextarea
            value={personalNote}
            onChange={(event) => setPersonalNote(event.target.value)}
            placeholder={t`Nota personal opcional (tour, ficha, timing…)`}
            rows={2}
          />

          <StyledPreview>{previewBody}</StyledPreview>

          <StyledActions>
            <Button
              title={busy ? t`Preparando…` : t`Enviar oferta por email`}
              Icon={IconMail}
              variant="primary"
              size="small"
              disabled={busy || !selectedNave}
              onClick={() => void handleSend()}
            />
            <Button
              title={t`Limpiar selección`}
              variant="secondary"
              size="small"
              disabled={busy}
              onClick={onClearSelection}
            />
          </StyledActions>
        </>
      )}

      {result ? <StyledSuccess>{result.message}</StyledSuccess> : null}
      {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}
    </StyledPanel>
  );
};
