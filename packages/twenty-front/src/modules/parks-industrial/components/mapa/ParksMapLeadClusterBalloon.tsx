import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconX } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type ParksMapLeadMarker } from '@/parks-industrial/utils/parks-map-leads.util';
import { PARKS_MAP_LEAD_MARKER_COLOR } from '@/parks-industrial/utils/parks-map-leads.util';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';

const StyledBalloon = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  min-width: 220px;
  overflow: hidden;
  width: 260px;
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledSubtitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledCloseButton = styled.button`
  appearance: none;
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  padding: 0;
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledStat = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledAccent = styled.div`
  background: ${PARKS_MAP_LEAD_MARKER_COLOR};
  height: 3px;
  width: 100%;
`;

type ParksMapLeadClusterBalloonProps = {
  marker: ParksMapLeadMarker;
  onClose: () => void;
};

export const ParksMapLeadClusterBalloon = ({
  marker,
  onClose,
}: ParksMapLeadClusterBalloonProps) => (
  <StyledBalloon>
    <StyledAccent />
    <StyledHeader>
      <div>
        <StyledTitle>{marker.label}</StyledTitle>
        <StyledSubtitle>{t`Demanda activa en la región`}</StyledSubtitle>
      </div>
      <StyledCloseButton
        type="button"
        onClick={onClose}
        aria-label={t`Cerrar`}
      >
        <IconX size={16} />
      </StyledCloseButton>
    </StyledHeader>
    <StyledBody>
      <StyledStat>
        <strong>{marker.leadCount}</strong>{' '}
        {marker.leadCount === 1 ? t`lead` : t`leads`}
      </StyledStat>
      <StyledStat>
        {formatParksNumber(marker.totalM2)} {t`m² demandados`}
      </StyledStat>
      <StyledStat>
        {t`Revisa el listado en el panel derecho.`}
      </StyledStat>
    </StyledBody>
  </StyledBalloon>
);
