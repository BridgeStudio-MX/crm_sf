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
  LEGAL_VERSION_DIRIGIDO_A_OPTIONS,
} from '@/parks-industrial/constants/parks-legal-workflow.constants';
import {
  createParksLegalVersion,
  fetchParksLegalWorkflow,
} from '@/parks-industrial/services/parks-legal.client';
import { type LegalVersionItem } from '@/parks-industrial/types/parks-legal.types';
import { formatParksDate } from '@/parks-industrial/utils/parks-format.util';

const StyledRow = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

type ParksLegalVersionPanelProps = {
  casoLegalId: string;
  onUpdated?: () => void;
};

export const ParksLegalVersionPanel = ({
  casoLegalId,
  onUpdated,
}: ParksLegalVersionPanelProps) => {
  const [versiones, setVersiones] = useState<LegalVersionItem[]>([]);
  const [dirigidoA, setDirigidoA] = useState(LEGAL_VERSION_DIRIGIDO_A_OPTIONS[0]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadVersions = useCallback(async () => {
    setLoading(true);

    try {
      const workflow = await fetchParksLegalWorkflow(casoLegalId);
      setVersiones(workflow.versiones);
    } finally {
      setLoading(false);
    }
  }, [casoLegalId]);

  useEffect(() => {
    void loadVersions();
  }, [loadVersions]);

  const handleCreateVersion = async (esVersionFinal: boolean) => {
    setIsSubmitting(true);

    try {
      await createParksLegalVersion({
        casoLegalId,
        enviadoPor: 'Abogado asignado',
        dirigidoA,
        esVersionFinal,
      });
      await loadVersions();
      onUpdated?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  return (
    <ParksSectionCard title={t`Versiones del documento`}>
      <ParksFormField label={t`Dirigido a`}>
        <StyledParksSelect
          value={dirigidoA}
          onChange={(event) => setDirigidoA(event.target.value)}
        >
          {LEGAL_VERSION_DIRIGIDO_A_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </StyledParksSelect>
      </ParksFormField>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <Button
          title={t`Registrar nueva versión`}
          onClick={() => void handleCreateVersion(false)}
          disabled={isSubmitting}
        />
        <Button
          title={t`Registrar versión final`}
          variant="secondary"
          onClick={() => void handleCreateVersion(true)}
          disabled={isSubmitting}
        />
      </div>

      {versiones.length === 0 ? (
        <p
          style={{
            color: themeCssVariables.font.color.secondary,
            marginTop: 12,
          }}
        >
          {t`Aún no hay versiones registradas.`}
        </p>
      ) : (
        <StyledList>
          {versiones.map((version) => (
            <StyledRow key={version.id}>
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <strong>
                  {version.titulo ?? `V${version.numeroVersion ?? '?'}`}
                </strong>
                {version.esVersionFinal ? (
                  <ParksStatusBadge color="green" label={t`Final`} />
                ) : null}
              </div>
              <div
                style={{
                  color: themeCssVariables.font.color.secondary,
                  fontSize: themeCssVariables.font.size.sm,
                  marginTop: 4,
                }}
              >
                {t`Enviado`}: {formatParksDate(version.fechaEnvio)} ·{' '}
                {version.dirigidoA ?? '—'} ·{' '}
                {version.respuestaCliente ?? t`Pendiente`}
              </div>
              {version.cambiosSolicitados ? (
                <div
                  style={{
                    fontSize: themeCssVariables.font.size.sm,
                    marginTop: 4,
                  }}
                >
                  {version.cambiosSolicitados}
                </div>
              ) : null}
            </StyledRow>
          ))}
        </StyledList>
      )}
    </ParksSectionCard>
  );
};
