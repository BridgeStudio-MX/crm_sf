import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksFormField } from '@/parks-industrial/components/ui/ParksFormField';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { StyledParksSelect } from '@/parks-industrial/components/ui/parks-form-control.styles';
import { createParksActaRestitucion } from '@/parks-industrial/services/parks-legal.client';
import { type ParksCasoLegalRecord } from '@/parks-industrial/hooks/useParksRecords';

const StyledInput = styled.input`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

type ParksLegalActaRestitucionPanelProps = {
  casoLegal: ParksCasoLegalRecord;
};

export const ParksLegalActaRestitucionPanel = ({
  casoLegal,
}: ParksLegalActaRestitucionPanelProps) => {
  const [fechaSalida, setFechaSalida] = useState('');
  const [estadoNave, setEstadoNave] = useState('Bueno');
  const [decisionDeposito, setDecisionDeposito] = useState('Devolver 100%');
  const [montoDeposito, setMontoDeposito] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!casoLegal.inquilinoId || !casoLegal.naveId || !fechaSalida) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createParksActaRestitucion({
        casoLegalId: casoLegal.id,
        inquilinoId: casoLegal.inquilinoId,
        naveId: casoLegal.naveId,
        fechaSalidaCliente: fechaSalida,
        estadoNave,
        decisionDeposito,
        montoDepositoOriginal: Number(montoDeposito),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ParksSectionCard title={t`Acta de restitución`}>
      <ParksFormField label={t`Fecha salida cliente`}>
        <StyledInput
          type="date"
          value={fechaSalida}
          onChange={(event) => setFechaSalida(event.target.value)}
        />
      </ParksFormField>
      <ParksFormField label={t`Estado de la nave`}>
        <StyledParksSelect
          value={estadoNave}
          onChange={(event) => setEstadoNave(event.target.value)}
        >
          {['Excelente', 'Bueno', 'Con desperfectos', 'Daños mayores'].map(
            (option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ),
          )}
        </StyledParksSelect>
      </ParksFormField>
      <ParksFormField label={t`Decisión depósito`}>
        <StyledParksSelect
          value={decisionDeposito}
          onChange={(event) => setDecisionDeposito(event.target.value)}
        >
          {[
            'Devolver 100%',
            'Devolver parcial',
            'Retener 100%',
            'Aplicar a adeudos',
          ].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </StyledParksSelect>
      </ParksFormField>
      <ParksFormField label={t`Monto depósito original (USD)`}>
        <StyledInput
          type="number"
          value={montoDeposito}
          onChange={(event) => setMontoDeposito(event.target.value)}
        />
      </ParksFormField>
      <Button
        title={t`Crear acta de restitución`}
        onClick={() => void handleCreate()}
        disabled={isSubmitting}
      />
    </ParksSectionCard>
  );
};
