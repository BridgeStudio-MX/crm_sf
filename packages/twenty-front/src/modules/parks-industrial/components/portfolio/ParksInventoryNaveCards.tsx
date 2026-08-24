import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { PARKS_BRAND, PARKS_VIBE } from '@/parks-industrial/constants/parks-theme.constants';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';
import { type ParksPortfolioNaveItem } from '@/parks-industrial/utils/parks-portfolio-by-park.util';
import {
  getParksNaveKindColor,
  getParksNaveKindLabel,
} from '@/parks-industrial/utils/parks-portfolio-metrics.util';

type ParksInventoryNaveCardsProps = {
  naves: ParksPortfolioNaveItem[];
  onSelectNave: (naveId: string) => void;
};

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.button`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${PARKS_VIBE.radiusMd};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: ${PARKS_BRAND.borderSoft};
    box-shadow: ${PARKS_VIBE.shadowCard};
  }
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMeta = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledEmpty = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

export const ParksInventoryNaveCards = ({
  naves,
  onSelectNave,
}: ParksInventoryNaveCardsProps) => {
  if (naves.length === 0) {
    return <StyledEmpty>{t`Este parque aún no tiene naves.`}</StyledEmpty>;
  }

  return (
    <StyledGrid>
      {naves.map((nave) => (
        <StyledCard
          key={nave.id}
          type="button"
          onClick={() => onSelectNave(nave.id)}
        >
          <StyledName>{nave.identificador}</StyledName>
          <StyledMeta>
            {formatParksNumber(nave.m2)} m²
            {nave.precioBaseUsd > 0
              ? ` · ${formatParksUsd(nave.precioBaseUsd)} / m²`
              : ''}
          </StyledMeta>
          <StyledBadgeRow>
            <ParksStatusBadge
              color={getParksNaveKindColor(nave.kind)}
              label={getParksNaveKindLabel(nave.kind)}
            />
            {nave.kind === 'construccion' && nave.entregaEstimada ? (
              <ParksStatusBadge
                color="orange"
                label={t`Entrega ${nave.entregaEstimada}`}
              />
            ) : null}
            <ParksStatusBadge
              color={nave.interestCount > 0 ? 'blue' : 'gray'}
              label={
                nave.interestCount > 0
                  ? t`${nave.interestCount} en pipeline`
                  : t`Sin pipeline`
              }
            />
          </StyledBadgeRow>
          {nave.kind === 'disponible' && nave.daysVacant !== null ? (
            <StyledMeta>{t`${nave.daysVacant} días vacía`}</StyledMeta>
          ) : null}
          {nave.kind === 'construccion' ? (
            <StyledMeta>
              {t`Se puede pre-rentar antes de la entrega.`}
            </StyledMeta>
          ) : null}
        </StyledCard>
      ))}
    </StyledGrid>
  );
};
