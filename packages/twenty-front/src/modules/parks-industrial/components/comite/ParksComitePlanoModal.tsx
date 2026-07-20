import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { createPortal } from 'react-dom';
import { IconX } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  PARKS_BRAND,
  PARKS_VIBE,
} from '@/parks-industrial/constants/parks-theme.constants';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';
import { MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID } from '@/ui/layout/modal/constants/ModalClickOutsideListenerExcludedClassName';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';

type ParksComitePlanoModalProps = {
  naveNomenclatura: string;
  parqueNombre: string;
  glaM2: number;
  onClose: () => void;
};

const StyledBackdrop = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.overlayPrimary};
  display: flex;
  inset: 0;
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]};
  position: fixed;
  z-index: ${RootStackingContextZIndices.RootModalBackDrop};
`;

const StyledModal = styled.div`
  background: ${PARKS_VIBE.surface};
  border: 1px solid ${PARKS_VIBE.border};
  border-radius: ${PARKS_VIBE.radiusLg};
  box-shadow: ${PARKS_VIBE.shadowHover};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  max-height: min(90vh, 720px);
  max-width: 720px;
  overflow: auto;
  padding: ${themeCssVariables.spacing[4]};
  width: min(100%, 720px);
  z-index: ${RootStackingContextZIndices.RootModal};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    max-height: 92vh;
    padding: ${themeCssVariables.spacing[3]};
  }
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
`;

const StyledEyebrow = styled.div`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const StyledTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 4px 0 0;
`;

const StyledMeta = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 4px 0 0;
`;

const StyledCloseButton = styled.button`
  align-items: center;
  background: ${PARKS_VIBE.surfaceMuted};
  border: 1px solid ${PARKS_VIBE.border};
  border-radius: ${PARKS_VIBE.radiusSm};
  color: ${PARKS_VIBE.textSecondary};
  cursor: pointer;
  display: inline-flex;
  height: 36px;
  justify-content: center;
  width: 36px;

  &:hover {
    color: ${PARKS_VIBE.textPrimary};
  }
`;

const StyledPlanFrame = styled.div`
  background: ${PARKS_VIBE.surfaceMuted};
  border: 1px solid ${PARKS_VIBE.border};
  border-radius: ${PARKS_VIBE.radiusMd};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledNote = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
  margin: 0;
`;

export const ParksComitePlanoModal = ({
  naveNomenclatura,
  parqueNombre,
  glaM2,
  onClose,
}: ParksComitePlanoModalProps) => {
  const glaLabel = formatParksNumber(glaM2);

  return createPortal(
    <StyledBackdrop
      role="presentation"
      onClick={onClose}
      id={MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID}
    >
      <StyledModal
        role="dialog"
        aria-modal="true"
        aria-label={t`Plano de la nave`}
        onClick={(event) => event.stopPropagation()}
      >
        <StyledHeader>
          <div>
            <StyledEyebrow>{t`Plano de planta`}</StyledEyebrow>
            <StyledTitle>{naveNomenclatura}</StyledTitle>
            <StyledMeta>
              {parqueNombre} · {glaLabel} m² GLA
            </StyledMeta>
          </div>
          <StyledCloseButton
            type="button"
            aria-label={t`Cerrar`}
            onClick={onClose}
          >
            <IconX size={18} />
          </StyledCloseButton>
        </StyledHeader>

        <StyledPlanFrame>
          <svg
            viewBox="0 0 480 260"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={t`Plano esquemático de ${naveNomenclatura}`}
            width="100%"
            height="auto"
          >
            <rect width="480" height="260" fill="#f7f8fa" />
            <rect
              x="24"
              y="28"
              width="320"
              height="180"
              fill="#e8f2ea"
              stroke={PARKS_BRAND.primary}
              strokeWidth="2"
            />
            <text
              x="184"
              y="118"
              textAnchor="middle"
              fill={PARKS_BRAND.primary}
              fontSize="14"
              fontWeight="700"
            >
              ALMACÉN / GLA
            </text>
            <text
              x="184"
              y="140"
              textAnchor="middle"
              fill="#5f6b7a"
              fontSize="12"
            >
              {glaLabel} m²
            </text>
            <rect
              x="24"
              y="28"
              width="70"
              height="48"
              fill="#d4e8d8"
              stroke={PARKS_BRAND.primary}
              strokeWidth="1.5"
            />
            <text
              x="59"
              y="56"
              textAnchor="middle"
              fill="#1a1f27"
              fontSize="10"
            >
              OFICINAS
            </text>
            <rect
              x="360"
              y="40"
              width="90"
              height="150"
              fill="#eef1ef"
              stroke="#8f9aa8"
              strokeWidth="1.5"
            />
            <text
              x="405"
              y="118"
              textAnchor="middle"
              fill="#5f6b7a"
              fontSize="10"
            >
              PATIO
            </text>
            <g fill={PARKS_BRAND.primary}>
              <rect x="348" y="55" width="12" height="10" />
              <rect x="348" y="75" width="12" height="10" />
              <rect x="348" y="95" width="12" height="10" />
              <rect x="348" y="115" width="12" height="10" />
              <rect x="348" y="135" width="12" height="10" />
              <rect x="348" y="155" width="12" height="10" />
            </g>
            <text x="24" y="240" fill="#5f6b7a" fontSize="10">
              {naveNomenclatura} · Layout esquemático Parks
            </text>
          </svg>
        </StyledPlanFrame>

        <StyledNote>
          {t`Plano de planta esquemático para deliberación del comité. No sustituye el layout CAD definitivo de la nave.`}
        </StyledNote>
      </StyledModal>
    </StyledBackdrop>,
    document.body,
  );
};
