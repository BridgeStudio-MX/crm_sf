import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconAlertTriangle, IconCheck, IconFileSearch } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  preSendParksToLegal,
  validateParksDocuments,
} from '@/parks-industrial/services/parks-legal.client';
import { type DocumentValidationResult } from '@/parks-industrial/types/parks-legal.types';

const StyledDocumentRow = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledResultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledResultItem = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledMismatch = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledSummary = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: ${themeCssVariables.spacing[2]} 0 0;
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const VALIDATION_DOCUMENTS = [
  'Acta constitutiva',
  'Carta de intención (LOI)',
  'INE representante',
  'CSF',
];

const resolveStatusColor = (
  status: 'ok' | 'warning' | 'error',
): 'green' | 'yellow' | 'red' => {
  if (status === 'ok') {
    return 'green';
  }

  if (status === 'warning') {
    return 'yellow';
  }

  return 'red';
};

type ParksDocumentValidationPanelProps = {
  casoLegalId: string;
  onValidationComplete?: (result: DocumentValidationResult) => void;
};

export const ParksDocumentValidationPanel = ({
  casoLegalId,
  onValidationComplete,
}: ParksDocumentValidationPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocumentValidationResult | null>(null);
  const [handoffMessage, setHandoffMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runValidation = async (simulateMismatch: boolean) => {
    setLoading(true);
    setError(null);
    setHandoffMessage(null);

    try {
      const validation = await validateParksDocuments({
        casoLegalId,
        uploads: VALIDATION_DOCUMENTS.map((documentType) => ({
          documentType,
          simulateMismatch:
            simulateMismatch && documentType === 'Acta constitutiva',
        })),
      });
      setResult(validation);
      onValidationComplete?.(validation);
    } catch (validationError) {
      const message =
        validationError instanceof Error
          ? validationError.message
          : 'No se pudo validar';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreSend = async () => {
    setLoading(true);
    setError(null);

    try {
      const handoff = await preSendParksToLegal(casoLegalId);
      setResult(handoff.validation);
      setHandoffMessage(handoff.message);
      onValidationComplete?.(handoff.validation);
    } catch (handoffError) {
      const message =
        handoffError instanceof Error
          ? handoffError.message
          : 'No se pudo enviar a legal';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParksSectionCard title={t`Validación documental IA`}>
      <StyledSummary>
        {t`Simula la carga de documentos y la IA extrae campos para detectar conflictos antes de legal.`}
      </StyledSummary>

      <StyledActions>
        <Button
          variant="primary"
          Icon={IconFileSearch}
          title={t`Validar documentos (OK)`}
          onClick={() => void runValidation(false)}
          disabled={loading}
        />
        <Button
          variant="secondary"
          accent="danger"
          Icon={IconAlertTriangle}
          title={t`Simular error en acta`}
          onClick={() => void runValidation(true)}
          disabled={loading}
        />
        <Button
          variant="secondary"
          Icon={IconCheck}
          title={t`Pre-enviar a Legal`}
          onClick={() => void handlePreSend()}
          disabled={loading}
        />
      </StyledActions>

      {loading ? <ParksLoadingSkeleton variant="list" /> : null}

      {result ? (
        <>
          <ParksStatusBadge
            color={
              result.overallStatus === 'green'
                ? 'green'
                : result.overallStatus === 'yellow'
                  ? 'yellow'
                  : 'red'
            }
            label={result.summary}
          />
          <StyledResultList>
            {result.items.map((item) => (
              <StyledResultItem key={item.documentType}>
                <StyledDocumentRow>
                  <strong>{item.documentType}</strong>
                  <ParksStatusBadge
                    color={resolveStatusColor(item.status)}
                    label={item.status}
                  />
                </StyledDocumentRow>
                {item.mismatches.map((mismatch) => (
                  <StyledMismatch key={`${mismatch.field}-${mismatch.found}`}>
                    {mismatch.field}: esperado "{mismatch.expected}" · encontrado
                    "{mismatch.found}"
                  </StyledMismatch>
                ))}
              </StyledResultItem>
            ))}
          </StyledResultList>
        </>
      ) : null}

      {handoffMessage ? (
        <ParksStatusBadge color="blue" label={handoffMessage} />
      ) : null}

      {error ? <StyledMismatch>{error}</StyledMismatch> : null}
    </ParksSectionCard>
  );
};
