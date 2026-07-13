import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconBuildingSkyscraper } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { ParksKpiTile } from '@/parks-industrial/components/ui/ParksDetailField';
import {
  getLegalEstatusLabel,
  type LegalTimelineStage,
} from '@/parks-industrial/constants/parks-legal-workflow.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { type ParksCasoLegalRecord } from '@/parks-industrial/hooks/useParksRecords';
import {
  formatParksDate,
  formatParksNumber,
  formatParksUsd,
  getParksLegalLawyerInitials,
  getParksLegalSemaforoBadgeColor,
  getParksLegalSemaforoLabel,
} from '@/parks-industrial/utils/parks-format.util';

type ParksApprovalCaseHeroProps = {
  casoLegal: ParksCasoLegalRecord;
  timeline: LegalTimelineStage[];
};

const heroTextMuted = `color-mix(in srgb, ${themeCssVariables.font.color.inverted} 72%, transparent)`;
const heroTextSecondary = `color-mix(in srgb, ${themeCssVariables.font.color.inverted} 86%, transparent)`;

const StyledHero = styled.section`
  background: linear-gradient(
    128deg,
    ${themeCssVariables.color.green12} 0%,
    ${PARKS_BRAND.primary} 42%,
    ${themeCssVariables.color.green11} 78%,
    ${PARKS_BRAND.accentSoft} 100%
  );
  border-radius: ${themeCssVariables.border.radius.xl};
  box-shadow: 0 20px 44px ${themeCssVariables.color.green3};
  color: ${themeCssVariables.font.color.inverted};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[5]};
  position: relative;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[6]};
  }
`;

const StyledGlow = styled.div`
  background: radial-gradient(
    circle,
    ${PARKS_BRAND.accentSoft} 0%,
    transparent 68%
  );
  height: 280px;
  pointer-events: none;
  position: absolute;
  right: -60px;
  top: -80px;
  width: 280px;
`;

const StyledHeroGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  position: relative;
  z-index: 1;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    align-items: start;
    grid-template-columns: 1.2fr 0.8fr;
  }
`;

const StyledHeroMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledEyebrow = styled.div`
  color: ${heroTextMuted};
  font-size: ${themeCssVariables.font.size.xs};
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const StyledTitleRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
`;

const StyledTitle = styled.h2`
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0;
`;

const StyledAvatar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.primary};
  border: 1px solid ${themeCssVariables.background.transparent.secondary};
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 44px;
  justify-content: center;
  width: 44px;
`;

const StyledMetaRow = styled.div`
  align-items: center;
  color: ${heroTextSecondary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledProgressBlock = styled.div`
  backdrop-filter: blur(10px);
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.background.transparent.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledProgressHeader = styled.div`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledProgressLabel = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledProgressValue = styled.span`
  color: ${PARKS_BRAND.accent};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledProgressTrack = styled.div`
  background: ${themeCssVariables.background.transparent.medium};
  border-radius: 999px;
  height: 8px;
  overflow: hidden;
`;

const StyledProgressFill = styled.div<{ width: number }>`
  background: linear-gradient(
    90deg,
    ${PARKS_BRAND.accent},
    ${themeCssVariables.font.color.inverted}
  );
  border-radius: 999px;
  height: 100%;
  transition: width 0.35s ease;
  width: ${({ width }) => width}%;
`;

const StyledProgressHint = styled.div`
  color: ${heroTextMuted};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledKpiGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: ${themeCssVariables.spacing[4]};
  position: relative;
  z-index: 1;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

export const ParksApprovalCaseHero = ({
  casoLegal,
  timeline,
}: ParksApprovalCaseHeroProps) => {
  const hoja = casoLegal.hojaDeAcuerdos;
  const rentaEstimada =
    (hoja?.m2Acordados ?? 0) * (hoja?.precioUsdM2 ?? 0);
  const completedStages = timeline.filter(
    (stage) => stage.status === 'completed',
  ).length;
  const progressPct = Math.round((completedStages / timeline.length) * 100);
  const activeStage = timeline.find((stage) => stage.status === 'active');

  return (
    <>
      <StyledHero>
        <StyledGlow />
        <StyledHeroGrid>
          <StyledHeroMain>
            <StyledEyebrow>{t`Flujo de aprobación legal`}</StyledEyebrow>
            <StyledTitleRow>
              <StyledTitle>{casoLegal.referencia}</StyledTitle>
              <StyledAvatar>
                {getParksLegalLawyerInitials(casoLegal.abogadoAsignado)}
              </StyledAvatar>
            </StyledTitleRow>
            <StyledMetaRow>
              <IconBuildingSkyscraper size={16} />
              {casoLegal.inquilino?.empresa ?? t`Sin inquilino`}
              {' · '}
              {casoLegal.nave?.identificador ?? t`Sin nave`}
            </StyledMetaRow>
            <StyledBadges>
              <ParksStatusBadge
                color="blue"
                label={getLegalEstatusLabel(casoLegal.estatus)}
              />
              <ParksStatusBadge
                color={getParksLegalSemaforoBadgeColor(casoLegal.semaforo)}
                label={getParksLegalSemaforoLabel(casoLegal.semaforo)}
              />
              {casoLegal.abogadoAsignado ? (
                <ParksStatusBadge
                  color="gray"
                  label={casoLegal.abogadoAsignado}
                />
              ) : null}
            </StyledBadges>
          </StyledHeroMain>

          <StyledProgressBlock>
            <StyledProgressHeader>
              <StyledProgressLabel>{t`Avance del workflow`}</StyledProgressLabel>
              <StyledProgressValue>{progressPct}%</StyledProgressValue>
            </StyledProgressHeader>
            <StyledProgressTrack>
              <StyledProgressFill width={progressPct} />
            </StyledProgressTrack>
            <StyledProgressHint>
              {activeStage
                ? t`Etapa actual: ${activeStage.label}`
                : t`Workflow completado`}
            </StyledProgressHint>
          </StyledProgressBlock>
        </StyledHeroGrid>
      </StyledHero>

      <StyledKpiGrid>
        <ParksKpiTile
          label={t`Tipo documento`}
          value={casoLegal.tipoDocumento ?? '—'}
          accent="green"
        />
        <ParksKpiTile
          label={t`m² acordados`}
          value={formatParksNumber(hoja?.m2Acordados)}
          accent="blue"
        />
        <ParksKpiTile
          label={t`Renta mensual`}
          value={formatParksUsd(rentaEstimada)}
          accent="purple"
        />
        <ParksKpiTile
          label={t`Inicio`}
          value={formatParksDate(hoja?.fechaInicio)}
          accent="yellow"
        />
      </StyledKpiGrid>
    </>
  );
};
