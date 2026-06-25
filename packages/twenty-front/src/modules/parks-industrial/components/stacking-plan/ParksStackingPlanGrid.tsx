import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { ParksPropertyImage } from '@/parks-industrial/components/ui/ParksPropertyImage';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { type ParksStackingPlanNave } from '@/parks-industrial/hooks/useParksRecords';
import {
  formatParksDate,
  formatParksNumber,
  formatParksUsd,
  getParksStackingStatusColor,
  type ParksStackingStatusKey,
} from '@/parks-industrial/utils/parks-format.util';
import { resolveParksNavePropertyImageUrl } from '@/parks-industrial/utils/parks-image.util';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  overflow: hidden;
`;

const StyledCardBody = styled.div`
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

type ParksStackingPlanGridProps = {
  naves: ParksStackingPlanNave[];
};

export const ParksStackingPlanGrid = ({ naves }: ParksStackingPlanGridProps) => (
  <StyledGrid>
    {naves.map((nave) => {
      const borderColor = getParksStackingStatusColor(nave.statusColor);

      return (
        <StyledCard key={nave.id} borderColor={borderColor}>
          <ParksPropertyImage
            imageUrl={resolveParksNavePropertyImageUrl({
              fotoInmuebleUrl: nave.fotoInmuebleUrl,
              identificador: nave.identificador,
              recordId: nave.id,
            })}
            alt={nave.identificador ?? t`Nave`}
            fallbackLabel={nave.identificador ?? t`Nave`}
            accentColor={borderColor}
            height={132}
          />

          <StyledCardBody>
            <StyledHeader>
              <strong>{nave.identificador}</strong>
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
          </StyledCardBody>
        </StyledCard>
      );
    })}
  </StyledGrid>
);
