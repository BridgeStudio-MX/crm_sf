import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import { IconCalendarEvent, IconUserPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  PARKS_DECISOR_ROLE_LABELS,
  PARKS_DECISOR_ROLES,
  type ParksDecisorRol,
} from '@/parks-industrial/constants/parks-decisor.constants';
import {
  ParksFormField,
  StyledParksFieldGrid,
} from '@/parks-industrial/components/ui/ParksFormField';
import {
  StyledParksInput,
  StyledParksSelect,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { ParksToolSection } from '@/parks-industrial/components/ui/ParksToolSection';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import {
  fetchParksDecisores,
  registerParksTour,
  upsertParksDecisor,
} from '@/parks-industrial/services/parks-commercial.client';
import { type DecisorCliente } from '@/parks-industrial/types/parks-commercial.types';
import {
  formatParksTourNavesLabel,
  parseParksTourNavesMostradas,
} from '@/parks-industrial/utils/parks-tour-naves.util';

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

const StyledAttendeeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledAttendeeRow = styled.label`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledAttendeeName = styled.span`
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

type ParksTourSchedulePanelProps = {
  opportunityId: string;
  companyName: string;
  inquilinoId?: string;
  linkedNaveIdentificador?: string | null;
  tourNavesMostradas?: string | null;
  onBack?: () => void;
  onTourScheduled?: (update: Partial<ParksOpportunityRecord>) => void;
};

const buildDefaultDateTimeLocal = (): string => {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const ParksTourSchedulePanel = ({
  opportunityId,
  companyName,
  inquilinoId,
  linkedNaveIdentificador,
  tourNavesMostradas,
  onBack,
  onTourScheduled,
}: ParksTourSchedulePanelProps) => {
  const [tourDateTime, setTourDateTime] = useState(buildDefaultDateTimeLocal);
  const [decisores, setDecisores] = useState<DecisorCliente[]>([]);
  const [attendedDecisorIds, setAttendedDecisorIds] = useState<string[]>([]);
  const [isLoadingDecisores, setIsLoadingDecisores] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newRol, setNewRol] = useState<ParksDecisorRol>('DUENO_EMPRESA');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const tourNavesLabel =
    formatParksTourNavesLabel(
      parseParksTourNavesMostradas(tourNavesMostradas),
    ) ||
    linkedNaveIdentificador ||
    t`Sin naves`;

  const loadDecisores = useCallback(async () => {
    setIsLoadingDecisores(true);

    try {
      const records = await fetchParksDecisores({
        opportunityId,
        inquilinoId,
      });
      setDecisores(records);
    } catch {
      // Keep schedule usable even if decisores fail to load
    } finally {
      setIsLoadingDecisores(false);
    }
  }, [inquilinoId, opportunityId]);

  useEffect(() => {
    void loadDecisores();
  }, [loadDecisores]);

  const toggleAttendee = (decisorId: string) => {
    setAttendedDecisorIds((previous) =>
      previous.includes(decisorId)
        ? previous.filter((id) => id !== decisorId)
        : [...previous, decisorId],
    );
  };

  const handleAddContact = async () => {
    if (!newNombre.trim()) {
      setError(t`Indica el nombre del contacto`);
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      const created = await upsertParksDecisor({
        opportunityId,
        inquilinoId,
        nombre: newNombre.trim(),
        rol: newRol,
      });
      await loadDecisores();
      if (created?.id) {
        setAttendedDecisorIds((previous) => [...previous, created.id]);
      }
      setNewNombre('');
      setShowAddForm(false);
    } catch (addError) {
      const message =
        addError instanceof Error
          ? addError.message
          : t`No se pudo agregar el contacto`;
      setError(message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleScheduleTour = async () => {
    if (!tourDateTime) {
      setError(t`Indica fecha y hora`);
      return;
    }

    if (attendedDecisorIds.length === 0) {
      setError(t`Marca al menos un contacto que va al tour`);
      return;
    }

    setIsScheduling(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const [tourFecha, tourHora = ''] = tourDateTime.split('T');

      await registerParksTour({
        opportunityId,
        tourFecha,
        tourHora,
        tourParque: linkedNaveIdentificador ?? undefined,
        tourNavesMostradas:
          tourNavesMostradas ?? linkedNaveIdentificador ?? undefined,
        tourProximosPasos: t`Visita confirmada · ${tourHora || 'hora por definir'}`,
        companyName,
        inquilinoId,
        attendedDecisorIds,
      });

      onTourScheduled?.({
        stage: 'TOUR_VISITA',
        tourFecha,
        tourHora,
        tourNavesMostradas: tourNavesMostradas ?? undefined,
        tourAsistentes: attendedDecisorIds.join(','),
      });

      setSuccessMessage(
        t`Listo · ${tourFecha} ${tourHora} · ${attendedDecisorIds.length} asistentes`,
      );
    } catch (scheduleError) {
      const message =
        scheduleError instanceof Error
          ? scheduleError.message
          : t`No se pudo agendar el tour`;
      setError(message);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <ParksToolSection
      title={t`2 · Agendar visita`}
      icon={IconCalendarEvent}
      hint={t`Fecha, hora y quién acompaña`}
    >
      <StyledHint>{t`Naves: ${tourNavesLabel}`}</StyledHint>

      <StyledParksFieldGrid>
        <ParksFormField
          label={t`Fecha y hora`}
          htmlFor="tour-datetime"
          fullWidth
        >
          <StyledParksInput
            id="tour-datetime"
            type="datetime-local"
            value={tourDateTime}
            onChange={(event) => setTourDateTime(event.target.value)}
          />
        </ParksFormField>
      </StyledParksFieldGrid>

      <StyledHint>{t`Quién va al tour`}</StyledHint>

      {isLoadingDecisores ? (
        <StyledHint>{t`Cargando contactos…`}</StyledHint>
      ) : null}

      {!isLoadingDecisores && decisores.length === 0 ? (
        <StyledHint>
          {t`Aún no hay contactos. Agrega al menos uno abajo.`}
        </StyledHint>
      ) : null}

      <StyledAttendeeList>
        {decisores.map((decisor) => (
          <StyledAttendeeRow key={decisor.id}>
            <input
              type="checkbox"
              checked={attendedDecisorIds.includes(decisor.id)}
              onChange={() => toggleAttendee(decisor.id)}
            />
            <StyledAttendeeName>{decisor.nombre}</StyledAttendeeName>
            <ParksStatusBadge
              color="gray"
              label={PARKS_DECISOR_ROLE_LABELS[decisor.rol]}
            />
          </StyledAttendeeRow>
        ))}
      </StyledAttendeeList>

      {showAddForm ? (
        <StyledParksFieldGrid>
          <ParksFormField label={t`Nombre`} fullWidth>
            <StyledParksInput
              value={newNombre}
              placeholder={t`Nombre completo`}
              onChange={(event) => setNewNombre(event.target.value)}
            />
          </ParksFormField>
          <ParksFormField label={t`Rol`}>
            <StyledParksSelect
              value={newRol}
              onChange={(event) =>
                setNewRol(event.target.value as ParksDecisorRol)
              }
            >
              {PARKS_DECISOR_ROLES.map((rol) => (
                <option key={rol} value={rol}>
                  {PARKS_DECISOR_ROLE_LABELS[rol]}
                </option>
              ))}
            </StyledParksSelect>
          </ParksFormField>
          <Button
            variant="secondary"
            title={t`Guardar contacto`}
            disabled={isAdding}
            onClick={() => void handleAddContact()}
          />
        </StyledParksFieldGrid>
      ) : (
        <Button
          variant="secondary"
          Icon={IconUserPlus}
          title={t`Agregar contacto`}
          onClick={() => setShowAddForm(true)}
        />
      )}

      <StyledActions>
        {onBack ? (
          <Button
            variant="secondary"
            title={t`Cambiar naves`}
            onClick={onBack}
          />
        ) : (
          <span />
        )}
        <Button
          variant="primary"
          accent="blue"
          title={t`Agendar tour`}
          disabled={isScheduling}
          onClick={() => void handleScheduleTour()}
        />
      </StyledActions>

      {successMessage ? (
        <ParksStatusBadge color="green" label={successMessage} />
      ) : null}
      {error ? <StyledError>{error}</StyledError> : null}
    </ParksToolSection>
  );
};
