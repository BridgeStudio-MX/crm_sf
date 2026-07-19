import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  PARKS_BRAND,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';
import { type CxcAccount } from '@/parks-industrial/types/parks-cxc.types';
import {
  formatCxcMoney,
  getCxcRiskAccent,
} from '@/parks-industrial/utils/parks-cxc-format.util';

type ParksCxcPipelineCardProps = {
  account: CxcAccount;
  selected?: boolean;
  onSelect: (accountId: string) => void;
};

const StyledCard = styled.button<{ selected: boolean; accent: string }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid
    ${({ selected }) =>
      selected ? PARKS_BRAND.borderSoft : themeCssVariables.border.color.medium};
  border-left: 3px solid ${({ accent }) => accent};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  width: 100%;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.light};
  }
`;

const StyledEmpresa = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledAmount = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

export const ParksCxcPipelineCard = ({
  account,
  selected = false,
  onSelect,
}: ParksCxcPipelineCardProps) => {
  const accent =
    PARKS_VISUAL_THEME.accents[getCxcRiskAccent(account.scoreLabel)].accent;
  const contratoRef = account.contrato?.referenciaLegal;
  const handoffHint = account.recibidoDeLegalAt
    ? t`Desde Legal`
    : account.cicloEstatus;

  return (
    <StyledCard
      type="button"
      selected={selected}
      accent={accent}
      onClick={() => onSelect(account.id)}
    >
      <StyledEmpresa>{account.empresa}</StyledEmpresa>
      <StyledMeta>
        {account.nave} · {account.parque}
        {contratoRef ? ` · ${contratoRef}` : ''}
      </StyledMeta>
      <StyledRow>
        <ParksStatusBadge
          label={account.estatusPagos}
          color={
            account.estatusPagos === 'Al corriente'
              ? 'green'
              : account.estatusPagos === 'Mora leve'
                ? 'yellow'
                : 'red'
          }
        />
        {account.requiereOc ? (
          <ParksStatusBadge label={t`Requiere OC`} color="yellow" />
        ) : null}
        {account.portalPago?.portalNombre ? (
          <ParksStatusBadge label={t`Portal`} color="blue" />
        ) : null}
      </StyledRow>
      <StyledAmount>
        {formatCxcMoney(account.rentaMensual, account.moneda)}
        <StyledMeta> / {t`mes`}</StyledMeta>
      </StyledAmount>
      <StyledMeta>
        {handoffHint} · {account.ejecutivoNombre}
      </StyledMeta>
    </StyledCard>
  );
};
