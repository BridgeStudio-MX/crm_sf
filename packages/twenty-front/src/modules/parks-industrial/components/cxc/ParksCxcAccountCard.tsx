import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  IconAlertTriangle,
  IconBuildingWarehouse,
  IconClock,
  IconUser,
} from 'twenty-ui/icon';
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

type ParksCxcAccountCardProps = {
  account: CxcAccount;
  onSelect: (accountId: string) => void;
  selected?: boolean;
};

const StyledCard = styled.button<{ accentColor: string; selected: boolean }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid
    ${({ selected }) =>
      selected ? PARKS_BRAND.borderSoft : themeCssVariables.border.color.medium};
  border-left: 4px solid ${({ accentColor }) => accentColor};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${({ selected }) =>
    selected
      ? themeCssVariables.boxShadow.strong
      : themeCssVariables.boxShadow.light};
  cursor: pointer;
  display: block;
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;
  width: 100%;

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

const StyledEmpresa = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledRiskScore = styled.div<{ accent: string }>`
  align-items: center;
  background: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[accent as keyof typeof PARKS_VISUAL_THEME.accents]
      ?.iconBackground ?? PARKS_BRAND.primarySoft};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[accent as keyof typeof PARKS_VISUAL_THEME.accents]
      ?.accent ?? PARKS_BRAND.primary};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: 4px;
  padding: 4px 10px;
`;

const StyledMeta = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.sm};
  gap: 8px;
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledMetaItem = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 4px;
`;

const StyledBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledFooter = styled.div`
  align-items: flex-end;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: space-between;
  margin-top: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledAmount = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledAmountHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledAlert = styled.div`
  align-items: center;
  color: ${themeCssVariables.color.orange};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 4px;
`;

export const ParksCxcAccountCard = ({
  account,
  onSelect,
  selected = false,
}: ParksCxcAccountCardProps) => {
  const riskAccent = getCxcRiskAccent(account.scoreLabel);
  const accentColor = PARKS_VISUAL_THEME.accents[riskAccent].accent;
  const adeudoLabel =
    account.montoAdeudoTotal > 0
      ? formatCxcMoney(account.montoAdeudoTotal, account.moneda)
      : formatCxcMoney(account.rentaMensual, account.moneda);

  return (
    <StyledCard
      type="button"
      accentColor={accentColor}
      selected={selected}
      onClick={() => onSelect(account.id)}
    >
      <StyledHeader>
        <StyledEmpresa>{account.empresa}</StyledEmpresa>
        <StyledRiskScore accent={riskAccent}>
          {account.scoreLabel} {account.scoreRiesgo}
        </StyledRiskScore>
      </StyledHeader>

      <StyledMeta>
        <StyledMetaItem>
          <IconBuildingWarehouse size={14} />
          {account.nave} · {account.parque}
        </StyledMetaItem>
        <StyledMetaItem>
          <IconUser size={14} />
          {account.ejecutivoNombre}
        </StyledMetaItem>
        {account.diasEnMora > 0 ? (
          <StyledMetaItem>
            <IconClock size={14} />
            {t`${account.diasEnMora}d en mora`}
          </StyledMetaItem>
        ) : null}
      </StyledMeta>

      <StyledBadges>
        <ParksStatusBadge
          label={account.estatusPagos}
          color={
            account.estatusPagos === 'Al corriente'
              ? 'green'
              : account.estatusPagos === 'Mora leve'
                ? 'yellow'
                : account.estatusPagos === 'Inactivo'
                  ? 'gray'
                  : 'red'
          }
        />
        <ParksStatusBadge label={account.tipoCliente} color="blue" />
        {account.ordenCompra?.estatus === 'Esperando OC' ? (
          <ParksStatusBadge
            label={t`OC ${account.ordenCompra.diasSinOc}d`}
            color="yellow"
          />
        ) : null}
        {account.holdover ? (
          <ParksStatusBadge
            label={t`Holdover ${account.holdover.diasEnHoldover}d`}
            color="red"
          />
        ) : null}
        {account.deposito?.estatus === 'En proceso de devolución' ? (
          <ParksStatusBadge label={t`Depósito`} color="blue" />
        ) : null}
        {account.escalacionInpc ? (
          <ParksStatusBadge
            label={t`INPC ${account.escalacionInpc.diasParaAplicacion}d`}
            color="blue"
          />
        ) : null}
      </StyledBadges>

      <StyledFooter>
        <div>
          <StyledAmount>{adeudoLabel}</StyledAmount>
          <StyledAmountHint>
            {account.montoAdeudoTotal > 0
              ? t`Adeudo total`
              : t`Renta mensual`}
          </StyledAmountHint>
        </div>
        {account.ordenCompra?.estatus === 'Esperando OC' ||
        account.scoreLabel === 'Crítico' ? (
          <StyledAlert>
            <IconAlertTriangle size={14} />
            {t`Acción hoy`}
          </StyledAlert>
        ) : null}
      </StyledFooter>
    </StyledCard>
  );
};
