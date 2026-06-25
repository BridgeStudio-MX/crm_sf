import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type ParksNaveRecord } from '@/parks-industrial/hooks/useParksRecords';
import { useParksReserveNave } from '@/parks-industrial/hooks/useParksReserveNave';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';

const StyledPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledNaveList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  max-height: 180px;
  overflow-y: auto;
`;

const StyledNaveOption = styled.button<{ isSelected: boolean }>`
  align-items: center;
  background: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.background.transparent.light
      : themeCssVariables.background.tertiary};
  border: 1px solid
    ${({ isSelected }) =>
      isSelected
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;
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

type ParksMapReserveNavePanelProps = {
  parqueId: string;
  parqueNombre?: string;
  naves: ParksNaveRecord[];
};

export const ParksMapReserveNavePanel = ({
  parqueId,
  parqueNombre,
  naves,
}: ParksMapReserveNavePanelProps) => {
  const { getDisponibleNavesInParque, reserveNave } = useParksReserveNave({
    parqueNombre,
  });
  const [selectedNaveId, setSelectedNaveId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservedNaveId, setReservedNaveId] = useState<string | null>(null);

  const disponibleNaves = getDisponibleNavesInParque(naves, parqueId);

  if (disponibleNaves.length === 0) {
    return (
      <StyledHint>
        {t`No hay naves disponibles en este parque para reservar.`}
      </StyledHint>
    );
  }

  const handleReserve = async () => {
    const selectedNave = disponibleNaves.find(
      (nave) => nave.id === selectedNaveId,
    );

    if (!selectedNave) {
      return;
    }

    setIsSubmitting(true);

    try {
      await reserveNave(selectedNave);
      setReservedNaveId(selectedNave.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledPanel>
      <StyledHint>
        {t`Selecciona una nave disponible para crear el deal y mostrarla en Reservas.`}
      </StyledHint>
      <StyledNaveList>
        {disponibleNaves.map((nave) => (
          <StyledNaveOption
            key={nave.id}
            type="button"
            isSelected={selectedNaveId === nave.id}
            onClick={() => setSelectedNaveId(nave.id)}
          >
            <span>{nave.identificador ?? t`Nave`}</span>
            <span>{formatParksNumber(nave.m2)} m²</span>
          </StyledNaveOption>
        ))}
      </StyledNaveList>
      {reservedNaveId ? (
        <>
          <StyledSuccess>
            {t`Nave reservada. Ya aparece en Reservas con deal en negociación.`}
          </StyledSuccess>
          <Button
            title={t`Ver reservas`}
            variant="secondary"
            fullWidth
            to={getAppPath(AppPath.ParksReservas)}
          />
        </>
      ) : (
        <Button
          title={t`Reservar nave seleccionada`}
          fullWidth
          disabled={!selectedNaveId || isSubmitting}
          onClick={() => void handleReserve()}
        />
      )}
    </StyledPanel>
  );
};
