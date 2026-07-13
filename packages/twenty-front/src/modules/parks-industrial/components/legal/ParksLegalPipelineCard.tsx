import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { IconClock, IconFileText } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getLegalEstatusLabel } from '@/parks-industrial/constants/parks-legal-workflow.constants';
import { type ParksCasoLegalRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  getParksLegalLawyerInitials,
  getParksLegalSemaforoBadgeColor,
  getParksLegalSemaforoLabel,
  type ParksPipelineStageTheme,
} from '@/parks-industrial/utils/parks-format.util';

const StyledCard = styled(Link)<{
  accentColor: string;
  backgroundTint: string;
  isPaused: boolean;
}>`
  background: ${({ backgroundTint, isPaused }) =>
    isPaused
      ? themeCssVariables.background.secondary
      : backgroundTint};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left: 4px solid ${({ accentColor }) => accentColor};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: block;
  margin-bottom: ${themeCssVariables.spacing[2]};
  opacity: ${({ isPaused }) => (isPaused ? 0.88 : 1)};
  padding: ${themeCssVariables.spacing[2]};
  text-decoration: none;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    border-color: ${({ accentColor }) => accentColor};
    box-shadow: ${themeCssVariables.boxShadow.strong};
    transform: translateY(-1px);
  }
`;

const StyledCardHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledReferencia = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledLawyerAvatar = styled.div<{ avatarColor: string }>`
  align-items: center;
  background: ${({ avatarColor }) => avatarColor};
  border-radius: 50%;
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTipoDocumento = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: 4px;
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledSlaHint = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: 4px;
`;

type ParksLegalPipelineCardProps = {
  casoLegal: ParksCasoLegalRecord;
  stageTheme: ParksPipelineStageTheme;
};

export const ParksLegalPipelineCard = ({
  casoLegal,
  stageTheme,
}: ParksLegalPipelineCardProps) => {
  const isPaused =
    casoLegal.documentacionCompleta === false ||
    casoLegal.estatus?.includes('Documentación incompleta');

  const diasLabel =
    casoLegal.diasTranscurridos !== undefined &&
    casoLegal.slaDiasHabiles !== undefined
      ? `${casoLegal.diasTranscurridos}/${casoLegal.slaDiasHabiles} ${t`días SLA`}`
      : null;

  return (
    <StyledCard
      accentColor={stageTheme.accent}
      backgroundTint={stageTheme.background}
      isPaused={isPaused}
      to={getAppPath(AppPath.ParksContratoAprobacion, {
        contratoId: casoLegal.id,
      })}
    >
      <StyledCardHeader>
        <div style={{ minWidth: 0, flex: 1 }}>
          <StyledReferencia>{casoLegal.referencia}</StyledReferencia>
          <StyledMeta>
            {casoLegal.inquilino?.empresa ?? '—'} ·{' '}
            {casoLegal.nave?.identificador ?? '—'}
          </StyledMeta>
          {casoLegal.tipoDocumento ? (
            <StyledTipoDocumento>
              <IconFileText size={12} />
              {casoLegal.tipoDocumento}
            </StyledTipoDocumento>
          ) : null}
        </div>
        <StyledLawyerAvatar avatarColor={stageTheme.accent}>
          {getParksLegalLawyerInitials(casoLegal.abogadoAsignado)}
        </StyledLawyerAvatar>
      </StyledCardHeader>

      <StyledFooter>
        <ParksStatusBadge
          color={getParksLegalSemaforoBadgeColor(casoLegal.semaforo)}
          label={getParksLegalSemaforoLabel(casoLegal.semaforo)}
        />
        {isPaused ? (
          <ParksStatusBadge color="gray" label={t`SLA pausado`} />
        ) : null}
      </StyledFooter>

      <StyledFooter style={{ marginTop: 8 }}>
        <ParksStatusBadge
          color="blue"
          label={getLegalEstatusLabel(casoLegal.estatus)}
        />
        {diasLabel ? (
          <StyledSlaHint>
            <IconClock size={12} />
            {diasLabel}
          </StyledSlaHint>
        ) : null}
      </StyledFooter>
    </StyledCard>
  );
};
