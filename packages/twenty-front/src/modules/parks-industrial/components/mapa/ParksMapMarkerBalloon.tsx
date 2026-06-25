import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { IconBuildingSkyscraper, IconMap, IconX } from 'twenty-ui/icon';
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

const BALLOON_WIDTH_PX = 288;

const StyledBalloonShell = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  overflow: hidden;
  position: relative;
  width: ${BALLOON_WIDTH_PX}px;

  &::after {
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-top: 9px solid ${themeCssVariables.background.primary};
    bottom: -8px;
    content: '';
    filter: drop-shadow(0 2px 1px rgba(0, 0, 0, 0.12));
    left: 50%;
    position: absolute;
    transform: translateX(-50%);
    z-index: 1;
  }

  &::before {
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid ${themeCssVariables.border.color.medium};
    bottom: -10px;
    content: '';
    left: 50%;
    position: absolute;
    transform: translateX(-50%);
    z-index: 0;
  }
`;

const StyledAccentRail = styled.div<{ accentColor: string }>`
  background: ${({ accentColor }) => accentColor};
  height: 3px;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 2;
`;

const StyledImageWrap = styled.div`
  position: relative;
`;

const StyledCloseButton = styled.button`
  align-items: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  border: none;
  border-radius: 999px;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  height: 28px;
  justify-content: center;
  position: absolute;
  right: ${themeCssVariables.spacing[2]};
  top: ${themeCssVariables.spacing[2]};
  width: 28px;
  z-index: 2;

  &:hover {
    background: rgba(0, 0, 0, 0.72);
  }
`;

const StyledBalloonBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledBalloonHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledBalloonTitle = styled.h4`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.3;
  margin: 0;
`;

const StyledBalloonMeta = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: 4px;
  margin-top: ${themeCssVariables.spacing[1]};
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

const StyledStatsRow = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledBalloonFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[3]};
`;

type ParksMapMarkerBalloonProps = {
  parque: ParksParqueRecord;
  onClose: () => void;
};

export const ParksMapMarkerBalloon = ({
  parque,
  onClose,
}: ParksMapMarkerBalloonProps) => {
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
    <StyledBalloonShell
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
    >
      <StyledAccentRail accentColor={accentColor} />

      <StyledImageWrap>
        <ParksPropertyImage
          imageUrl={parqueEntranceImageUrl}
          alt={parque.nombre ?? t`Parque`}
          fallbackLabel={parque.nombre ?? t`Parque`}
          accentColor={accentColor}
          height={132}
          showBorderRadius={false}
        />
        <StyledCloseButton
          type="button"
          onClick={onClose}
          aria-label={t`Cerrar`}
        >
          <IconX size={14} />
        </StyledCloseButton>
      </StyledImageWrap>

      <StyledBalloonBody>
        <StyledBalloonHeader>
          <div>
            <StyledBalloonTitle>{parque.nombre}</StyledBalloonTitle>
            <StyledBalloonMeta>
              <IconMap size={12} />
              {parque.ubicacion ?? t`Sin ubicación`}
            </StyledBalloonMeta>
          </div>
          <StyledOcupacionBadge badgeColor={accentColor}>
            {ocupacion}%
          </StyledOcupacionBadge>
        </StyledBalloonHeader>

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
      </StyledBalloonBody>

      <StyledBalloonFooter>
        <Button
          title={t`Ver stacking plan`}
          variant="secondary"
          fullWidth
          to={getAppPath(AppPath.ParksStackingPlan, { parqueId: parque.id })}
        />
      </StyledBalloonFooter>
    </StyledBalloonShell>
  );
};
