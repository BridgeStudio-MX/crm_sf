import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { IconBuildingSkyscraper, IconMap } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type ParksParqueRecord } from '@/parks-industrial/hooks/useParksParques';
import { ParksProgressBar } from '@/parks-industrial/components/ui/ParksProgressBar';
import { ParksPropertyImage } from '@/parks-industrial/components/ui/ParksPropertyImage';
import {
  formatParksNumber,
  getParksOcupacionColor,
  getParksParqueM2Disponibles,
  getParksParqueOcupacion,
} from '@/parks-industrial/utils/parks-format.util';
import { resolveParksParqueEntranceImageUrl } from '@/parks-industrial/utils/parks-image.util';

const StyledCard = styled.div<{ accentColor: string; isSelected: boolean }>`
  background: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.background.transparent.light
      : themeCssVariables.background.primary};
  border: 1px solid
    ${({ isSelected, accentColor }) =>
      isSelected ? accentColor : themeCssVariables.border.color.medium};
  border-left: 4px solid ${({ accentColor }) => accentColor};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${({ isSelected }) =>
    isSelected ? themeCssVariables.boxShadow.light : 'none'};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  width: 100%;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.light};
  }
`;

const StyledCardSelectableArea = styled.button`
  appearance: none;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  display: block;
  font: inherit;
  padding: 0;
  text-align: left;
  width: 100%;
`;

const StyledCardBody = styled.div`
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledCardFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[3]};
`;

const StyledCardHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledCardTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledCardMeta = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: 4px;
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledStatsRow = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledOcupacionBadge = styled.span<{ badgeColor: string }>`
  background: ${themeCssVariables.background.tertiary};
  border: 1px solid ${({ badgeColor }) => badgeColor};
  border-radius: 999px;
  color: ${({ badgeColor }) => badgeColor};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: 2px 8px;
`;

type ParksParqueSidebarCardProps = {
  parque: ParksParqueRecord;
  isSelected: boolean;
  onSelect: (parqueId: string) => void;
};

export const ParksParqueSidebarCard = ({
  parque,
  isSelected,
  onSelect,
}: ParksParqueSidebarCardProps) => {
  const ocupacion = getParksParqueOcupacion(
    parque.m2Totales,
    parque.m2Rentados,
  );
  const accentColor = getParksOcupacionColor(ocupacion);
  const m2Disponibles = getParksParqueM2Disponibles(
    parque.m2Totales,
    parque.m2Rentados,
  );
  const parqueEntranceImageUrl = resolveParksParqueEntranceImageUrl({
    fotoEntradaUrl: parque.fotoEntradaUrl,
    nombre: parque.nombre,
    ubicacion: parque.ubicacion,
    recordId: parque.id,
  });

  return (
    <StyledCard accentColor={accentColor} isSelected={isSelected}>
      <StyledCardSelectableArea
        type="button"
        onClick={() => onSelect(parque.id)}
        aria-pressed={isSelected}
        aria-label={parque.nombre ?? t`Parque`}
      >
        <ParksPropertyImage
          imageUrl={parqueEntranceImageUrl}
          alt={parque.nombre ?? t`Parque`}
          fallbackLabel={parque.nombre ?? t`Parque`}
          accentColor={accentColor}
          height={112}
        />

        <StyledCardBody>
          <StyledCardHeader>
            <div>
              <StyledCardTitle>{parque.nombre}</StyledCardTitle>
              <StyledCardMeta>
                <IconMap size={12} />
                {parque.ubicacion ?? t`Sin ubicación`}
              </StyledCardMeta>
            </div>
            <StyledOcupacionBadge badgeColor={accentColor}>
              {ocupacion}%
            </StyledOcupacionBadge>
          </StyledCardHeader>

          <ParksProgressBar
            label={t`Ocupación`}
            valueLabel={`${ocupacion}%`}
            percentage={ocupacion}
            accentColor={accentColor}
          />

          <StyledStatsRow>
            <span>
              <IconBuildingSkyscraper size={12} />{' '}
              {formatParksNumber(parque.m2Rentados)} m² {t`rentados`}
            </span>
            <span>
              {formatParksNumber(m2Disponibles)} m² {t`libres`}
            </span>
          </StyledStatsRow>
        </StyledCardBody>
      </StyledCardSelectableArea>

      <StyledCardFooter>
        <Button
          title={t`Ver stacking plan`}
          variant="secondary"
          fullWidth
          to={getAppPath(AppPath.ParksStackingPlan, { parqueId: parque.id })}
        />
      </StyledCardFooter>
    </StyledCard>
  );
};
