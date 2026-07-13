import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { fetchParksLegalWorkflow } from '@/parks-industrial/services/parks-legal.client';
import { type LegalWorkflowSla } from '@/parks-industrial/types/parks-legal.types';
import { formatParksDate } from '@/parks-industrial/utils/parks-format.util';

const StyledRow = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: space-between;
  margin-top: ${themeCssVariables.spacing[2]};
`;

type ParksLegalSlaPanelProps = {
  casoLegalId: string;
};

export const ParksLegalSlaPanel = ({ casoLegalId }: ParksLegalSlaPanelProps) => {
  const [sla, setSla] = useState<LegalWorkflowSla | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSla = useCallback(async () => {
    setLoading(true);

    try {
      const workflow = await fetchParksLegalWorkflow(casoLegalId);
      setSla(workflow.sla);
    } finally {
      setLoading(false);
    }
  }, [casoLegalId]);

  useEffect(() => {
    void loadSla();
  }, [loadSla]);

  if (loading || !sla) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  const pctUsed =
    sla.diasHabiles > 0
      ? Math.min(100, Math.round((sla.diasTranscurridos / sla.diasHabiles) * 100))
      : 0;

  const badgeColor =
    sla.pausado ? 'yellow' : pctUsed >= 80 ? 'red' : pctUsed >= 50 ? 'yellow' : 'blue';

  return (
    <ParksSectionCard title={t`SLA legal`}>
      <ParksStatusBadge
        color={badgeColor}
        label={
          sla.pausado
            ? t`SLA pausado — documentación incompleta`
            : `${sla.diasTranscurridos}/${sla.diasHabiles} ${t`días hábiles`}`
        }
      />
      <StyledRow>
        <span>{t`Días restantes`}</span>
        <span>{sla.diasRestantes ?? '—'}</span>
      </StyledRow>
      <StyledRow>
        <span>{t`Fecha límite`}</span>
        <span>{formatParksDate(sla.fechaLimite)}</span>
      </StyledRow>
      <StyledRow>
        <span>{t`Avance SLA`}</span>
        <span>{pctUsed}%</span>
      </StyledRow>
    </ParksSectionCard>
  );
};
