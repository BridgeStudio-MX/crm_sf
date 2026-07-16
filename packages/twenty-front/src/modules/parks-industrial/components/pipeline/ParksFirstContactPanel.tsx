import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconCalendarEvent, IconPhone } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  ParksFormField,
  StyledParksFieldGrid,
} from '@/parks-industrial/components/ui/ParksFormField';
import {
  StyledParksInput,
  StyledParksSelect,
  StyledParksTextarea,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { ParksToolSection } from '@/parks-industrial/components/ui/ParksToolSection';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { registerParksFirstContact } from '@/parks-industrial/services/parks-commercial.client';

const PRIMER_CONTACTO_TIPOS = [
  'Llamada',
  'Videollamada',
  'Reunión presencial',
] as const;

const StyledSummary = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  line-height: 1.45;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSuccess = styled.div`
  color: ${themeCssVariables.color.green};
  font-size: ${themeCssVariables.font.size.sm};
`;

type ParksFirstContactPanelProps = {
  opportunityId: string;
  companyName: string;
  deal: ParksOpportunityRecord;
  onContactRegistered?: (update: Partial<ParksOpportunityRecord>) => void;
};

export const ParksFirstContactPanel = ({
  opportunityId,
  companyName,
  deal,
  onContactRegistered,
}: ParksFirstContactPanelProps) => {
  const [tipo, setTipo] = useState(
    deal.primerContactoTipo ?? PRIMER_CONTACTO_TIPOS[0],
  );
  const [fecha, setFecha] = useState(
    deal.primerContactoFecha ?? new Date().toISOString().slice(0, 10),
  );
  const [hora, setHora] = useState(deal.primerContactoHora ?? '10:00');
  const [notas, setNotas] = useState(deal.primerContactoNotas ?? '');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isRegistered = deal.primerContactoRealizado === true;

  const handleRegister = async (realizado: boolean) => {
    setIsBusy(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await registerParksFirstContact({
        opportunityId,
        tipo,
        fecha,
        hora,
        notas,
        realizado,
        companyName,
      });

      onContactRegistered?.({
        primerContactoTipo: tipo,
        primerContactoFecha: fecha,
        primerContactoHora: hora,
        primerContactoNotas: notas,
        primerContactoRealizado: realizado,
      });

      setSuccessMessage(
        realizado
          ? t`Primer contacto registrado. Ya puedes avanzar a agendar la visita.`
          : t`Contacto agendado. Aparece en Campo LO → Hoy y en tus tareas con fecha límite.`,
      );
    } catch (registerError) {
      const message =
        registerError instanceof Error
          ? registerError.message
          : t`No se pudo registrar el contacto`;
      setError(message);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <ParksToolSection
      title={t`Primer contacto con el lead`}
      icon={IconPhone}
      hint={t`Agenda o registra la llamada, videollamada o reunión antes de proponer visita a nave.`}
      embedded
    >
      {isRegistered ? (
        <StyledSummary>
          <ParksStatusBadge color="green" label={t`Contacto realizado`} />
          <div>
            <strong>{deal.primerContactoTipo}</strong> · {deal.primerContactoFecha}{' '}
            {deal.primerContactoHora}
          </div>
          {deal.primerContactoNotas ? <div>{deal.primerContactoNotas}</div> : null}
        </StyledSummary>
      ) : (
        <>
          <StyledParksFieldGrid>
            <ParksFormField label={t`Tipo de contacto`} htmlFor="contacto-tipo">
              <StyledParksSelect
                id="contacto-tipo"
                value={tipo}
                onChange={(event) => setTipo(event.target.value)}
              >
                {PRIMER_CONTACTO_TIPOS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </StyledParksSelect>
            </ParksFormField>
            <ParksFormField label={t`Fecha`} htmlFor="contacto-fecha">
              <StyledParksInput
                id="contacto-fecha"
                type="date"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
              />
            </ParksFormField>
            <ParksFormField label={t`Hora`} htmlFor="contacto-hora">
              <StyledParksInput
                id="contacto-hora"
                type="time"
                value={hora}
                onChange={(event) => setHora(event.target.value)}
              />
            </ParksFormField>
          </StyledParksFieldGrid>

          <ParksFormField label={t`Notas del levantamiento`} htmlFor="contacto-notas">
            <StyledParksTextarea
              id="contacto-notas"
              rows={3}
              value={notas}
              onChange={(event) => setNotas(event.target.value)}
              placeholder={t`Requerimientos aterrizados, objeciones, siguiente paso acordado…`}
            />
          </ParksFormField>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Button
              variant="secondary"
              Icon={IconCalendarEvent}
              title={t`Agendar contacto`}
              disabled={isBusy}
              onClick={() => void handleRegister(false)}
            />
            <Button
              variant="primary"
              Icon={IconPhone}
              title={t`Registrar contacto realizado`}
              disabled={isBusy}
              onClick={() => void handleRegister(true)}
            />
          </div>
        </>
      )}

      {successMessage ? <StyledSuccess>{successMessage}</StyledSuccess> : null}
      {error ? <StyledError>{error}</StyledError> : null}
    </ParksToolSection>
  );
};
