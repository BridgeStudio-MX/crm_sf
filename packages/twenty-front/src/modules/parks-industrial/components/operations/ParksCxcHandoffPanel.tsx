import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconBuildingSkyscraper } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  fetchParksCxcHandoff,
  triggerParksCxcHandoff,
} from '@/parks-industrial/services/parks-operations.client';
import { formatParksUsd } from '@/parks-industrial/utils/parks-format.util';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPanel = styled.div`
  background: ${themeCssVariables.color.yellow1};
  border: 1px solid ${themeCssVariables.color.yellow3};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledText = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
`;

type ParksCxcHandoffPanelProps = {
  casoLegalId: string;
  referencia?: string;
};

export const ParksCxcHandoffPanel = ({
  casoLegalId,
  referencia,
}: ParksCxcHandoffPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [handoffSummary, setHandoffSummary] = useState<string | null>(null);

  const handleHandoff = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const existing = await fetchParksCxcHandoff(casoLegalId);

      if (existing) {
        setHandoffSummary(
          `${existing.empresa} · ${existing.naveIdentificador} · renta ${formatParksUsd(existing.rentaMensualUsd)}`,
        );
        setMessage(t`Handoff CxC ya registrado para este caso.`);
        return;
      }

      const result = await triggerParksCxcHandoff(casoLegalId);
      setHandoffSummary(
        `${result.handoff.empresa} · ${result.handoff.naveIdentificador}`,
      );
      setMessage(result.message);
    } catch (handoffError) {
      const errorMessage =
        handoffError instanceof Error
          ? handoffError.message
          : 'No se pudo enviar a CxC';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledPanel>
      <strong>
        <IconBuildingSkyscraper size={16} /> {t`Handoff a Cuentas por Cobrar`}
      </strong>
      <StyledText>
        {t`Genera tickets de alta de cliente, facturación inicial y calendario de rentas para el área CxC.`}
        {referencia ? ` (${referencia})` : ''}
      </StyledText>
      <Button
        variant="primary"
        title={t`Enviar a CxC`}
        onClick={() => void handleHandoff()}
        disabled={loading}
      />
      {message ? <ParksStatusBadge color="blue" label={message} /> : null}
      {handoffSummary ? (
        <StyledText>{handoffSummary}</StyledText>
      ) : null}
    </StyledPanel>
  );
};
