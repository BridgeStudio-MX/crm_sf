import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksFormField } from '@/parks-industrial/components/ui/ParksFormField';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { StyledParksSelect } from '@/parks-industrial/components/ui/parks-form-control.styles';
import {
  LEGAL_LAWYER_OPTIONS,
} from '@/parks-industrial/constants/parks-legal-workflow.constants';
import {
  assignParksLegalLawyer,
  fetchParksLegalWorkflow,
  fetchParksLegalWorkload,
} from '@/parks-industrial/services/parks-legal.client';
import { type LawyerWorkloadItem } from '@/parks-industrial/types/parks-legal.types';

const StyledSummary = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: ${themeCssVariables.spacing[2]} 0 0;
`;

type ParksLegalLawyerPanelProps = {
  casoLegalId: string;
  onUpdated?: () => void;
};

export const ParksLegalLawyerPanel = ({
  casoLegalId,
  onUpdated,
}: ParksLegalLawyerPanelProps) => {
  const [abogadoAsignado, setAbogadoAsignado] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState(LEGAL_LAWYER_OPTIONS[0]);
  const [workload, setWorkload] = useState<LawyerWorkloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadLawyer = useCallback(async () => {
    setLoading(true);

    try {
      const [workloadItems, workflow] = await Promise.all([
        fetchParksLegalWorkload(),
        fetchParksLegalWorkflow(casoLegalId),
      ]);
      setWorkload(workloadItems);
      setAbogadoAsignado(workflow.casoLegal.abogadoAsignado ?? '');

      if (workflow.casoLegal.abogadoAsignado) {
        setSelectedLawyer(workflow.casoLegal.abogadoAsignado);
      }
    } finally {
      setLoading(false);
    }
  }, [casoLegalId]);

  useEffect(() => {
    void loadLawyer();
  }, [loadLawyer]);

  const handleAssign = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const updated = await assignParksLegalLawyer({
        casoLegalId,
        abogadoAsignado: selectedLawyer,
      });
      setAbogadoAsignado(updated.abogadoAsignado ?? selectedLawyer);
      onUpdated?.();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`No se pudo asignar el abogado`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  return (
    <ParksSectionCard title={t`Asignación de abogado`}>
      {abogadoAsignado ? (
        <ParksStatusBadge color="blue" label={abogadoAsignado} />
      ) : (
        <ParksStatusBadge color="gray" label={t`Sin abogado asignado`} />
      )}

      <ParksFormField label={t`Abogado`}>
        <StyledParksSelect
          value={selectedLawyer}
          onChange={(event) => setSelectedLawyer(event.target.value)}
        >
          {LEGAL_LAWYER_OPTIONS.map((lawyer) => (
            <option key={lawyer} value={lawyer}>
              {lawyer}
            </option>
          ))}
        </StyledParksSelect>
      </ParksFormField>

      {workload.length > 0 ? (
        <div style={{ marginBottom: 12 }}>
          {workload.map((item) => (
            <div
              key={item.abogadoAsignado}
              style={{
                color: themeCssVariables.font.color.secondary,
                fontSize: themeCssVariables.font.size.xs,
                marginTop: 4,
              }}
            >
              {item.abogadoAsignado}: {item.casosActivos} {t`activos`} ·{' '}
              {item.casosEnRiesgo} {t`en riesgo`}
            </div>
          ))}
        </div>
      ) : null}

      <Button
        title={t`Asignar abogado`}
        onClick={() => void handleAssign()}
        disabled={isSubmitting}
      />

      {errorMessage ? (
        <StyledSummary style={{ color: themeCssVariables.color.red }}>
          {errorMessage}
        </StyledSummary>
      ) : null}

      <StyledSummary>
        {t`Al asignar, el caso pasa a elaboración y el abogado recibe una notificación para continuar.`}
      </StyledSummary>
    </ParksSectionCard>
  );
};
