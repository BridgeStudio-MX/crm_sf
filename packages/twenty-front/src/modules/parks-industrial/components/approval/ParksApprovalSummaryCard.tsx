import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  IconBuildingSkyscraper,
  IconCalendar,
  IconCurrencyDollar,
  IconFileText,
  IconUser,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksDetailField } from '@/parks-industrial/components/ui/ParksDetailField';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { getLegalEstatusLabel } from '@/parks-industrial/constants/parks-legal-workflow.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { type ParksCasoLegalRecord } from '@/parks-industrial/hooks/useParksRecords';
import {
  formatParksDate,
  formatParksNumber,
  formatParksUsd,
  getParksLegalSemaforoBadgeColor,
  getParksLegalSemaforoLabel,
} from '@/parks-industrial/utils/parks-format.util';

type ParksApprovalSummaryCardProps = {
  casoLegal: ParksCasoLegalRecord;
};

const StyledCard = styled.aside`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  overflow: hidden;
  position: sticky;
  top: ${themeCssVariables.spacing[4]};
`;

const StyledHeader = styled.div`
  background: linear-gradient(
    135deg,
    ${PARKS_BRAND.primarySoft} 0%,
    ${themeCssVariables.background.primary} 55%
  );
  border-bottom: 1px solid ${PARKS_BRAND.borderSoft};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.h3`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
  margin: 0;
  text-transform: uppercase;
`;

const StyledReference = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

export const ParksApprovalSummaryCard = ({
  casoLegal,
}: ParksApprovalSummaryCardProps) => {
  const hoja = casoLegal.hojaDeAcuerdos;
  const rentaEstimada =
    (hoja?.m2Acordados ?? 0) * (hoja?.precioUsdM2 ?? 0);

  return (
    <StyledCard>
      <StyledHeader>
        <StyledTitle>{t`Resumen del caso`}</StyledTitle>
        <StyledReference>{casoLegal.referencia}</StyledReference>
        <StyledBadges>
          <ParksStatusBadge
            color="blue"
            label={getLegalEstatusLabel(casoLegal.estatus)}
          />
          <ParksStatusBadge
            color={getParksLegalSemaforoBadgeColor(casoLegal.semaforo)}
            label={getParksLegalSemaforoLabel(casoLegal.semaforo)}
          />
        </StyledBadges>
      </StyledHeader>
      <StyledBody>
        <ParksDetailField
          label={t`Inquilino`}
          value={casoLegal.inquilino?.empresa ?? '—'}
          icon={IconBuildingSkyscraper}
          accent="green"
        />
        <ParksDetailField
          label={t`Nave`}
          value={casoLegal.nave?.identificador ?? '—'}
          icon={IconFileText}
          accent="blue"
        />
        <ParksDetailField
          label={t`Abogado asignado`}
          value={casoLegal.abogadoAsignado ?? t`Sin asignar`}
          icon={IconUser}
          accent="purple"
        />
        <ParksDetailField
          label={t`Tipo documento`}
          value={casoLegal.tipoDocumento ?? '—'}
          icon={IconFileText}
          accent="default"
        />
        <ParksDetailField
          label={t`m² acordados`}
          value={formatParksNumber(hoja?.m2Acordados)}
          icon={IconBuildingSkyscraper}
          accent="yellow"
        />
        <ParksDetailField
          label={t`Renta mensual estimada`}
          value={formatParksUsd(rentaEstimada)}
          icon={IconCurrencyDollar}
          accent="green"
        />
        <ParksDetailField
          label={t`Inicio contrato`}
          value={formatParksDate(hoja?.fechaInicio)}
          icon={IconCalendar}
          accent="blue"
        />
      </StyledBody>
    </StyledCard>
  );
};
