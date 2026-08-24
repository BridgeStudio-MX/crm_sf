import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { PARKS_COMITE_ESTATUS_AJUSTES_PEDIDOS } from '@/parks-industrial/constants/parks-comite-gates.constants';
import {
  PARKS_BRAND,
  PARKS_VIBE,
} from '@/parks-industrial/constants/parks-theme.constants';
import { type ComiteAutorizacion } from '@/parks-industrial/types/parks-comite.types';
import { getComiteSemaforoAccent } from '@/parks-industrial/utils/parks-comite-format.util';
import { getComiteLiveAgendaReasons } from '@/parks-industrial/utils/parks-comite-live-session.util';

type ParksCeoComiteAgendaCardProps = {
  comite: ComiteAutorizacion;
  isActive: boolean;
  onSelect: () => void;
};

const StyledCard = styled.button<{ isActive: boolean }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid
    ${({ isActive }) =>
      isActive ? PARKS_BRAND.borderSoft : themeCssVariables.border.color.light};
  border-radius: ${PARKS_VIBE.radiusMd};
  box-shadow: ${({ isActive }) =>
    isActive ? PARKS_VIBE.shadowCard : 'none'};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 240px;
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${PARKS_BRAND.borderSoft};
  }
`;

const StyledClient = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.02em;
`;

const StyledMeta = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledReason = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

export const ParksCeoComiteAgendaCard = ({
  comite,
  isActive,
  onSelect,
}: ParksCeoComiteAgendaCardProps) => {
  const reasons = getComiteLiveAgendaReasons(comite);
  const headlineReason = reasons[0];

  return (
    <StyledCard type="button" isActive={isActive} onClick={onSelect}>
      {comite.estatus === PARKS_COMITE_ESTATUS_AJUSTES_PEDIDOS ? (
        <ParksStatusBadge
          label="Espera comercial"
          color="orange"
        />
      ) : (
        <ParksStatusBadge
          label={`${comite.deal.descuentoPorcentaje}% desc.`}
          color={getComiteSemaforoAccent(comite.deal.semaforoPrecio)}
        />
      )}
      <StyledClient>{comite.deal.clienteRazonSocial}</StyledClient>
      <StyledMeta>
        {comite.deal.parqueNombre} · {comite.deal.naveNomenclatura} ·{' '}
        {comite.deal.glaM2.toLocaleString('es-MX')} m²
      </StyledMeta>
      {headlineReason ? <StyledReason>{headlineReason}</StyledReason> : null}
    </StyledCard>
  );
};
