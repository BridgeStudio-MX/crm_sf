import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import { IconTrash, IconUserPlus, IconUsers } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  PARKS_DECISOR_MAX_COUNT,
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
import {
  deleteParksDecisor,
  fetchParksDecisores,
  upsertParksDecisor,
} from '@/parks-industrial/services/parks-commercial.client';
import { type DecisorCliente } from '@/parks-industrial/types/parks-commercial.types';

const StyledDecisorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledDecisorCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledDecisorHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledDecisorName = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledDecisorMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.xs};
  gap: 2px;
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
  margin: 0;
`;

const StyledError = styled.p`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledTourAttendanceRow = styled.label`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[2]};
`;

type ParksDecisoresPanelProps = {
  opportunityId?: string;
  inquilinoId?: string;
  showTourAttendance?: boolean;
  selectedTourDecisorIds?: string[];
  onTourSelectionChange?: (decisorIds: string[]) => void;
  embedded?: boolean;
};

const emptyForm = {
  nombre: '',
  correo: '',
  telefono: '',
  rol: 'DUENO_EMPRESA' as ParksDecisorRol,
};

export const ParksDecisoresPanel = ({
  opportunityId,
  inquilinoId,
  showTourAttendance = false,
  selectedTourDecisorIds = [],
  onTourSelectionChange,
  embedded = false,
}: ParksDecisoresPanelProps) => {
  const [decisores, setDecisores] = useState<DecisorCliente[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDecisores = useCallback(async () => {
    if (!opportunityId && !inquilinoId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const records = await fetchParksDecisores({
        opportunityId,
        inquilinoId,
      });
      setDecisores(records);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`No se pudieron cargar decisores`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [inquilinoId, opportunityId]);

  useEffect(() => {
    void loadDecisores();
  }, [loadDecisores]);

  const handleAddDecisor = async () => {
    if (!form.nombre.trim()) {
      setErrorMessage(t`Indica el nombre del decisor`);
      return;
    }

    if (decisores.length >= PARKS_DECISOR_MAX_COUNT) {
      setErrorMessage(
        t`Máximo ${PARKS_DECISOR_MAX_COUNT} decisores por cuenta u oportunidad`,
      );
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await upsertParksDecisor({
        opportunityId,
        inquilinoId,
        nombre: form.nombre,
        correo: form.correo,
        telefono: form.telefono,
        rol: form.rol,
      });
      setForm(emptyForm);
      await loadDecisores();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`No se pudo guardar el decisor`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveDecisor = async (decisorId: string) => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await deleteParksDecisor({ decisorId, opportunityId });
      await loadDecisores();
      onTourSelectionChange?.(
        selectedTourDecisorIds.filter((selectedId) => selectedId !== decisorId),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`No se pudo eliminar el decisor`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTourSelection = (decisorId: string) => {
    if (!onTourSelectionChange) {
      return;
    }

    const nextSelection = selectedTourDecisorIds.includes(decisorId)
      ? selectedTourDecisorIds.filter((selectedId) => selectedId !== decisorId)
      : [...selectedTourDecisorIds, decisorId];

    onTourSelectionChange(nextSelection);
  };

  return (
    <ParksToolSection
      title={t`Decisores del cliente`}
      icon={IconUsers}
      hint={t`Entre 2 y 5 personas del lado del cliente (doc. maestro §4.8)`}
      embedded={embedded}
    >
      <StyledHint>
        {t`Registra dueño, logística, operaciones, ampliación o broker del cliente. Se reutilizan en tour, negociación y Cuenta 360.`}
      </StyledHint>

      {isLoading ? <StyledHint>{t`Cargando decisores…`}</StyledHint> : null}
      {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}

      <StyledDecisorList>
        {decisores.map((decisor) => (
          <StyledDecisorCard key={decisor.id}>
            <StyledDecisorHeader>
              <div>
                <StyledDecisorName>{decisor.nombre}</StyledDecisorName>
                <ParksStatusBadge
                  color="blue"
                  label={PARKS_DECISOR_ROLE_LABELS[decisor.rol]}
                />
              </div>
              <Button
                variant="secondary"
                size="small"
                Icon={IconTrash}
                title={t`Eliminar`}
                disabled={isSaving}
                onClick={() => void handleRemoveDecisor(decisor.id)}
              />
            </StyledDecisorHeader>
            <StyledDecisorMeta>
              {decisor.correo ? <span>{decisor.correo}</span> : null}
              {decisor.telefono ? <span>{decisor.telefono}</span> : null}
              {decisor.asistioTour ? (
                <span>{t`Asistió al tour`}</span>
              ) : null}
            </StyledDecisorMeta>
            {showTourAttendance ? (
              <StyledTourAttendanceRow>
                <input
                  type="checkbox"
                  checked={selectedTourDecisorIds.includes(decisor.id)}
                  onChange={() => toggleTourSelection(decisor.id)}
                />
                {t`Asistió al tour`}
              </StyledTourAttendanceRow>
            ) : null}
          </StyledDecisorCard>
        ))}
      </StyledDecisorList>

      {decisores.length < PARKS_DECISOR_MAX_COUNT ? (
        <>
          <StyledParksFieldGrid>
            <ParksFormField label={t`Nombre`} fullWidth>
              <StyledParksInput
                value={form.nombre}
                placeholder={t`Nombre completo`}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nombre: event.target.value,
                  }))
                }
              />
            </ParksFormField>
            <ParksFormField label={t`Rol en la decisión`}>
              <StyledParksSelect
                value={form.rol}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rol: event.target.value as ParksDecisorRol,
                  }))
                }
              >
                {PARKS_DECISOR_ROLES.map((rol) => (
                  <option key={rol} value={rol}>
                    {PARKS_DECISOR_ROLE_LABELS[rol]}
                  </option>
                ))}
              </StyledParksSelect>
            </ParksFormField>
            <ParksFormField label={t`Correo`}>
              <StyledParksInput
                type="email"
                value={form.correo}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    correo: event.target.value,
                  }))
                }
              />
            </ParksFormField>
            <ParksFormField label={t`Teléfono`}>
              <StyledParksInput
                value={form.telefono}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    telefono: event.target.value,
                  }))
                }
              />
            </ParksFormField>
          </StyledParksFieldGrid>
          <Button
            variant="secondary"
            Icon={IconUserPlus}
            title={t`Agregar decisor`}
            disabled={isSaving}
            onClick={() => void handleAddDecisor()}
          />
        </>
      ) : null}
    </ParksToolSection>
  );
};
