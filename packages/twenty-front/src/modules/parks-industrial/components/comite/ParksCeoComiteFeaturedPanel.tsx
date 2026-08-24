import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { PARKS_COMITE_ESTATUS_AJUSTES_PEDIDOS } from '@/parks-industrial/constants/parks-comite-gates.constants';
import {
  PARKS_BRAND,
  PARKS_COMMAND_CENTER,
  PARKS_VIBE,
} from '@/parks-industrial/constants/parks-theme.constants';
import { type ComiteAutorizacion } from '@/parks-industrial/types/parks-comite.types';
import { getComiteSemaforoAccent } from '@/parks-industrial/utils/parks-comite-format.util';
import {
  getComiteLiveAgendaReasons,
  getComiteLiveAgreements,
} from '@/parks-industrial/utils/parks-comite-live-session.util';
import { StyledParksTextarea } from '@/parks-industrial/components/ui/parks-form-control.styles';

type ParksCeoComiteFeaturedPanelProps = {
  comite: ComiteAutorizacion;
  note: string;
  isBusy: boolean;
  isProjectionMode: boolean;
  onNoteChange: (value: string) => void;
  onRequestAdjustments: () => void;
  onApprove: () => void;
  onReject: () => void;
};

const StyledPanel = styled.section<{ isProjectionMode: boolean }>`
  background: ${PARKS_COMMAND_CENTER.background};
  border: 1px solid ${PARKS_COMMAND_CENTER.panelBorder};
  border-radius: ${PARKS_VIBE.radiusLg};
  box-shadow: ${PARKS_COMMAND_CENTER.boxShadow};
  display: flex;
  flex-direction: column;
  gap: ${({ isProjectionMode }) =>
    isProjectionMode ? PARKS_VIBE.space.xl : PARKS_VIBE.space.lg};
  padding: ${({ isProjectionMode }) =>
    isProjectionMode ? PARKS_VIBE.space.xxl : PARKS_VIBE.space.xl};
  position: relative;

  &::before {
    background: ${PARKS_COMMAND_CENTER.accentBar};
    content: '';
    height: ${PARKS_VIBE.accentBarHeight};
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }
`;

const StyledEyebrow = styled.p`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
`;

const StyledClient = styled.h2<{ isProjectionMode: boolean }>`
  font-size: ${({ isProjectionMode }) =>
    isProjectionMode ? '2.15rem' : '1.55rem'};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin: ${themeCssVariables.spacing[1]} 0 0;
`;

const StyledLocation = styled.p<{ isProjectionMode: boolean }>`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${({ isProjectionMode }) =>
    isProjectionMode
      ? themeCssVariables.font.size.lg
      : themeCssVariables.font.size.md};
  margin: ${themeCssVariables.spacing[1]} 0 0;
`;

const StyledReasonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const StyledAgreement = styled.div`
  background: ${PARKS_COMMAND_CENTER.panelBackground};
  border: 1px solid ${PARKS_COMMAND_CENTER.panelBorder};
  border-radius: ${PARKS_VIBE.radiusMd};
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const StyledValue = styled.span<{ isProjectionMode: boolean }>`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${({ isProjectionMode }) =>
    isProjectionMode
      ? themeCssVariables.font.size.lg
      : themeCssVariables.font.size.sm};
  line-height: 1.4;
  white-space: pre-wrap;
`;

const StyledSectionTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNoteLabel = styled.label`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

export const ParksCeoComiteFeaturedPanel = ({
  comite,
  note,
  isBusy,
  isProjectionMode,
  onNoteChange,
  onRequestAdjustments,
  onApprove,
  onReject,
}: ParksCeoComiteFeaturedPanelProps) => {
  const reasons = getComiteLiveAgendaReasons(comite);
  const agreements = getComiteLiveAgreements(comite);
  const adjustments = comite.ajustesSesion ?? [];

  return (
    <StyledPanel isProjectionMode={isProjectionMode}>
      <div>
        <StyledEyebrow>
          {comite.estatus === PARKS_COMITE_ESTATUS_AJUSTES_PEDIDOS
            ? t`Espera comercial`
            : t`En sesión`}{' '}
          · {comite.referencia}
        </StyledEyebrow>
        <StyledClient isProjectionMode={isProjectionMode}>
          {comite.deal.clienteRazonSocial}
        </StyledClient>
        <StyledLocation isProjectionMode={isProjectionMode}>
          {comite.deal.parqueNombre} · {comite.deal.naveNomenclatura} ·{' '}
          {comite.deal.glaM2.toLocaleString('es-MX')} m² ·{' '}
          {comite.deal.clienteGiro}
        </StyledLocation>
      </div>
      <StyledReasonRow>
        <ParksStatusBadge
          label={t`Semáforo ${comite.deal.semaforoPrecio}`}
          color={getComiteSemaforoAccent(comite.deal.semaforoPrecio)}
        />
        {reasons.map((reason) => (
          <ParksStatusBadge key={reason} label={reason} color="orange" />
        ))}
      </StyledReasonRow>
      <StyledSectionTitle>{t`Acuerdos sobre la mesa`}</StyledSectionTitle>
      <StyledGrid>
        {agreements.map((agreement) => (
          <StyledAgreement key={agreement.label}>
            <StyledLabel>{agreement.label}</StyledLabel>
            <StyledValue isProjectionMode={isProjectionMode}>
              {agreement.value}
            </StyledValue>
          </StyledAgreement>
        ))}
      </StyledGrid>
      {adjustments.length > 0 ? (
        <div>
          <StyledSectionTitle>{t`Ajustes pedidos en sala`}</StyledSectionTitle>
          <StyledGrid>
            {adjustments.map((adjustment) => (
              <StyledAgreement key={`${adjustment.fecha}-${adjustment.texto}`}>
                <StyledLabel>{adjustment.registradoPor}</StyledLabel>
                <StyledValue isProjectionMode={isProjectionMode}>
                  {adjustment.texto}
                </StyledValue>
              </StyledAgreement>
            ))}
          </StyledGrid>
        </div>
      ) : null}
      <StyledNoteLabel>
        {t`Notas de la sesión (ajustes o motivo de rechazo)`}
        <StyledParksTextarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder={t`Ej. Bajar gracia a 2 meses y entrega a 30 días.`}
        />
      </StyledNoteLabel>
      <StyledActions>
        <Button
          variant="secondary"
          onClick={onRequestAdjustments}
          disabled={isBusy}
          title={t`Pedir ajustes a comercial`}
        />
        <Button
          variant="secondary"
          onClick={onReject}
          disabled={isBusy}
          title={t`Negar`}
          accent="danger"
        />
        <Button
          variant="primary"
          onClick={onApprove}
          disabled={isBusy}
          title={t`Aprobar`}
        />
      </StyledActions>
    </StyledPanel>
  );
};
