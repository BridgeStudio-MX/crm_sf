import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import { IconCheck, IconCircle } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  fetchParksLegalWorkflow,
  markParksLegalSignature,
  registerParksLegalCotejo,
} from '@/parks-industrial/services/parks-legal.client';
import { type LegalFirmaItem } from '@/parks-industrial/types/parks-legal.types';

const StyledRow = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const isSignedStatus = (estatus?: string): boolean =>
  (estatus ?? '').toLowerCase().includes('firmado');

const isActiveStatus = (estatus?: string): boolean =>
  (estatus ?? '').toLowerCase().includes('enviado');

type ParksLegalFirmasPanelProps = {
  casoLegalId: string;
  cotejoAprobado?: boolean;
  onUpdated?: () => void;
};

export const ParksLegalFirmasPanel = ({
  casoLegalId,
  cotejoAprobado,
  onUpdated,
}: ParksLegalFirmasPanelProps) => {
  const [firmas, setFirmas] = useState<LegalFirmaItem[]>([]);
  const [discrepancia, setDiscrepancia] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFirmas = useCallback(async () => {
    setLoading(true);

    try {
      const workflow = await fetchParksLegalWorkflow(casoLegalId);
      setFirmas(workflow.firmas);
    } finally {
      setLoading(false);
    }
  }, [casoLegalId]);

  useEffect(() => {
    void loadFirmas();
  }, [loadFirmas]);

  const handleCotejo = async (aprobado: boolean) => {
    setIsSubmitting(true);

    try {
      const workflow = await registerParksLegalCotejo({
        casoLegalId,
        aprobado,
        discrepancia: aprobado ? undefined : discrepancia,
        realizadoPor: 'Catalina Moreno',
      });
      setFirmas(workflow.firmas);
      onUpdated?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSign = async (firma: LegalFirmaItem) => {
    setIsSubmitting(true);

    try {
      const workflow = await markParksLegalSignature({
        casoLegalId,
        flujoFirmasId: firma.id,
      });
      setFirmas(workflow.firmas);
      onUpdated?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  return (
    <ParksSectionCard title={t`Cotejo y flujo de firmas`}>
      {!cotejoAprobado ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            value={discrepancia}
            onChange={(event) => setDiscrepancia(event.target.value)}
            placeholder={t`Detalle de discrepancia (si aplica)...`}
            rows={2}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Button
              title={t`Aprobar cotejo`}
              onClick={() => void handleCotejo(true)}
              disabled={isSubmitting}
            />
            <Button
              title={t`Rechazar cotejo`}
              variant="secondary"
              accent="danger"
              onClick={() => void handleCotejo(false)}
              disabled={isSubmitting || discrepancia.trim().length === 0}
            />
          </div>
        </div>
      ) : (
        <ParksStatusBadge color="green" label={t`Cotejo aprobado`} />
      )}

      {firmas.length === 0 ? (
        <p
          style={{
            color: themeCssVariables.font.color.secondary,
            marginTop: 12,
          }}
        >
          {t`El flujo de firmas se genera automáticamente al aprobar el cotejo.`}
        </p>
      ) : (
        <StyledList>
          {firmas.map((firma) => (
            <StyledRow key={firma.id}>
              <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
                {isSignedStatus(firma.estatus) ? (
                  <IconCheck size={16} color={themeCssVariables.color.green} />
                ) : (
                  <IconCircle size={14} />
                )}
                <div>
                  <div>{firma.firmante ?? firma.rol}</div>
                  <div
                    style={{
                      color: themeCssVariables.font.color.secondary,
                      fontSize: themeCssVariables.font.size.xs,
                    }}
                  >
                    {t`Orden`} {firma.orden} · {firma.estatus ?? t`Pendiente`}
                  </div>
                </div>
              </div>
              {isActiveStatus(firma.estatus) && !isSignedStatus(firma.estatus) ? (
                <Button
                  title={t`Registrar firma`}
                  variant="secondary"
                  onClick={() => void handleSign(firma)}
                  disabled={isSubmitting}
                />
              ) : null}
            </StyledRow>
          ))}
        </StyledList>
      )}
    </ParksSectionCard>
  );
};
