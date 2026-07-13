import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import {
  IconArrowRight,
  IconBuildingSkyscraper,
  IconClock,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { getLegalEstatusLabel } from '@/parks-industrial/constants/parks-legal-workflow.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { type LegalDashboardCase } from '@/parks-industrial/types/parks-legal.types';
import {
  getParksLegalLawyerInitials,
  getParksLegalSemaforoBadgeColor,
  getParksLegalSemaforoLabel,
} from '@/parks-industrial/utils/parks-format.util';

const StyledCard = styled(Link)<{ accentColor: string }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left: 4px solid ${({ accentColor }) => accentColor};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: block;
  padding: ${themeCssVariables.spacing[3]};
  text-decoration: none;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.strong};
    transform: translateY(-1px);
  }
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledReferencia = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledAvatar = styled.div`
  align-items: center;
  background: ${PARKS_BRAND.primarySoft};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: 50%;
  color: ${PARKS_BRAND.primary};
  display: flex;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledMeta = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: 6px;
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${PARKS_BRAND.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 4px;
  justify-content: space-between;
  margin-top: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledSla = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: 4px;
`;

const StyledFooterLink = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 4px;
`;

const getSlaAccentColor = (caso: LegalDashboardCase): string => {
  if (caso.slaPausado) {
    return themeCssVariables.font.color.secondary;
  }

  if (caso.semaforo === 'ROJO' || (caso.diasRestantes ?? 0) < 0) {
    return themeCssVariables.color.red;
  }

  if (caso.semaforo === 'NARANJA' || caso.semaforo === 'AMARILLO') {
    return themeCssVariables.color.orange;
  }

  return PARKS_BRAND.primary;
};

type ParksLegalDashboardCaseCardProps = {
  caso: LegalDashboardCase;
};

export const ParksLegalDashboardCaseCard = ({
  caso,
}: ParksLegalDashboardCaseCardProps) => {
  const accentColor = getSlaAccentColor(caso);

  return (
    <StyledCard
      accentColor={accentColor}
      to={getAppPath(AppPath.ParksContratoAprobacion, {
        contratoId: caso.id,
      })}
    >
      <StyledHeader>
        <div>
          <StyledReferencia>{caso.referencia}</StyledReferencia>
          <StyledMeta>
            <IconBuildingSkyscraper size={14} />
            {caso.empresa ?? '—'} · {caso.nave ?? '—'}
          </StyledMeta>
        </div>
        <StyledAvatar>
          {getParksLegalLawyerInitials(caso.abogadoAsignado)}
        </StyledAvatar>
      </StyledHeader>

      <StyledBadges>
        <ParksStatusBadge
          color={getParksLegalSemaforoBadgeColor(caso.semaforo)}
          label={getParksLegalSemaforoLabel(caso.semaforo)}
        />
        <ParksStatusBadge
          color="blue"
          label={getLegalEstatusLabel(caso.estatus)}
        />
        {caso.slaPausado ? (
          <ParksStatusBadge color="gray" label={t`SLA pausado`} />
        ) : null}
      </StyledBadges>

      <StyledFooter>
        <StyledSla>
          <IconClock size={12} />
          {caso.slaPausado
            ? t`Pausado`
            : `${caso.diasRestantes ?? '—'} ${t`días restantes`}`}
        </StyledSla>
        <StyledFooterLink>
          {t`Ver aprobación`}
          <IconArrowRight size={12} />
        </StyledFooterLink>
      </StyledFooter>
    </StyledCard>
  );
};
