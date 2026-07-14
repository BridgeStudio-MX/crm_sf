import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Button } from 'twenty-ui/input';
import { IconLink } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksPropertyImage } from '@/parks-industrial/components/ui/ParksPropertyImage';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { type ParksStackingPlanNave } from '@/parks-industrial/hooks/useParksRecords';
import { createParksFichaTecnica } from '@/parks-industrial/services/parks-commercial.client';
import {
  formatParksDate,
  formatParksNumber,
  formatParksUsd,
  getParksStackingStatusColor,
  type ParksStackingStatusKey,
} from '@/parks-industrial/utils/parks-format.util';
import { resolveParksNavePropertyImageUrl } from '@/parks-industrial/utils/parks-image.util';

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
`;

const StyledCard = styled.article<{ borderColor: string }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left: 4px solid ${({ borderColor }) => borderColor};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledCardBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
`;

const StyledRow = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: space-between;
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: auto;
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledError = styled.p`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
`;

const StyledSuccess = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
  overflow-wrap: anywhere;
`;

const StyledLinkActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const getStatusLabel = (statusKey: ParksStackingStatusKey): string => {
  switch (statusKey) {
    case 'available':
      return t`Disponible`;
    case 'active':
      return t`Activo`;
    case 'expiring_soon':
      return t`Vence pronto`;
    case 'renewal_due':
      return t`Por renovar`;
  }
};

type ParksStackingPlanNaveCardProps = {
  nave: ParksStackingPlanNave;
  parqueNombre: string;
  parqueUbicacion?: string;
};

const ParksStackingPlanNaveCard = ({
  nave,
  parqueNombre,
  parqueUbicacion,
}: ParksStackingPlanNaveCardProps) => {
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fichaPublicUrl, setFichaPublicUrl] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const borderColor = getParksStackingStatusColor(nave.statusColor);
  const naveLabel = nave.identificador ?? t`Nave`;
  const m2 = typeof nave.m2 === 'number' && nave.m2 > 0 ? nave.m2 : 0;

  const handleGenerateFichaLink = async () => {
    if (m2 <= 0) {
      setErrorMessage(t`Esta nave no tiene m² registrados`);
      return;
    }

    setBusy(true);
    setErrorMessage(null);
    setCopyMessage(null);

    try {
      const link = await createParksFichaTecnica({
        naveId: nave.id,
        naveIdentificador: naveLabel,
        parqueNombre,
        ubicacion: parqueUbicacion,
        m2,
        precioUsdM2:
          typeof nave.precioBaseUsd === 'number'
            ? nave.precioBaseUsd
            : undefined,
        source: 'stacking-plan',
      });

      setFichaPublicUrl(link.publicUrl);
      await navigator.clipboard.writeText(link.publicUrl);
      setCopyMessage(t`Link copiado`);
      window.open(link.publicUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`No se pudo generar el link de ficha técnica`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCopyLink = async () => {
    if (!fichaPublicUrl) {
      return;
    }

    await navigator.clipboard.writeText(fichaPublicUrl);
    setCopyMessage(t`Link copiado`);
  };

  return (
    <StyledCard borderColor={borderColor}>
      <ParksPropertyImage
        imageUrl={resolveParksNavePropertyImageUrl({
          fotoInmuebleUrl: nave.fotoInmuebleUrl,
          identificador: nave.identificador,
          recordId: nave.id,
        })}
        alt={naveLabel}
        fallbackLabel={naveLabel}
        accentColor={borderColor}
        height={132}
      />

      <StyledCardBody>
        <StyledHeader>
          <strong>{naveLabel}</strong>
          <ParksStatusBadge
            color={nave.statusColor}
            label={getStatusLabel(nave.statusKey)}
          />
        </StyledHeader>
        <StyledRow>
          <span>{t`m²`}</span>
          <span>{formatParksNumber(nave.m2)}</span>
        </StyledRow>
        <StyledRow>
          <span>{t`Inquilino`}</span>
          <span>
            {nave.expedienteActivo?.inquilino?.empresa ?? t`Disponible`}
          </span>
        </StyledRow>
        <StyledRow>
          <span>{t`Precio/m²`}</span>
          <span>{formatParksUsd(nave.precioBaseUsd)}</span>
        </StyledRow>
        {nave.expedienteActivo?.fechaVencimiento ? (
          <>
            <StyledRow>
              <span>{t`Vencimiento`}</span>
              <span>
                {formatParksDate(nave.expedienteActivo.fechaVencimiento)}
              </span>
            </StyledRow>
            <StyledRow>
              <span>{t`Días restantes`}</span>
              <span>{nave.diasRestantes ?? '—'}</span>
            </StyledRow>
          </>
        ) : null}

        <StyledActions>
          <Button
            title={busy ? t`Generando link…` : t`Generar link ficha`}
            Icon={IconLink}
            variant="secondary"
            size="small"
            disabled={busy || m2 <= 0}
            onClick={() => void handleGenerateFichaLink()}
          />
          <StyledHint>
            {t`Crea el link público de la ficha técnica para compartir con el prospecto.`}
          </StyledHint>
          {fichaPublicUrl ? (
            <>
              <StyledSuccess>{fichaPublicUrl}</StyledSuccess>
              <StyledLinkActions>
                <Button
                  title={copyMessage ?? t`Copiar link`}
                  variant="secondary"
                  size="small"
                  onClick={() => void handleCopyLink()}
                />
                <Button
                  title={t`Abrir`}
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    window.open(
                      fichaPublicUrl,
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }
                />
              </StyledLinkActions>
            </>
          ) : null}
          {errorMessage ? <StyledError>{errorMessage}</StyledError> : null}
        </StyledActions>
      </StyledCardBody>
    </StyledCard>
  );
};

type ParksStackingPlanGridProps = {
  naves: ParksStackingPlanNave[];
  parqueNombre: string;
  parqueUbicacion?: string;
};

export const ParksStackingPlanGrid = ({
  naves,
  parqueNombre,
  parqueUbicacion,
}: ParksStackingPlanGridProps) => (
  <StyledGrid>
    {naves.map((nave) => (
      <ParksStackingPlanNaveCard
        key={nave.id}
        nave={nave}
        parqueNombre={parqueNombre}
        parqueUbicacion={parqueUbicacion}
      />
    ))}
  </StyledGrid>
);
