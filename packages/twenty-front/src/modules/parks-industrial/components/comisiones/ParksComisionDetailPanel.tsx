import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import {
  IconAlertTriangle,
  IconCoins,
  IconCurrencyDollar,
  IconPercentage,
  IconX,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksActionButton } from '@/parks-industrial/components/ui/ParksActionButton';
import {
  ParksDetailField,
  ParksKpiTile,
} from '@/parks-industrial/components/ui/ParksDetailField';
import { ParksResponsiveSheet } from '@/parks-industrial/components/ui/ParksResponsiveSheet';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { StyledParksTextarea } from '@/parks-industrial/components/ui/parks-form-control.styles';
import {
  PARKS_BRAND,
  PARKS_VIBE,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';
import { type ParksComisionRecord } from '@/parks-industrial/hooks/useParksRecords';
import {
  formatParksDate,
  formatParksUsd,
  getParksComisionStatusColor,
} from '@/parks-industrial/utils/parks-format.util';

type ParksComisionDetailPanelProps = {
  comision: ParksComisionRecord;
  onClose: () => void;
  canManage?: boolean;
  isBusy?: boolean;
  onApprove?: (comentario?: string) => void | Promise<void>;
  onReject?: (comentario: string) => void | Promise<void>;
};

const StyledPanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledEyebrow = styled.div`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const StyledTitle = styled.h2`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.02em;
  margin: 4px 0 0;
`;

const StyledSubtitle = styled.p`
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
  flex-shrink: 0;
  height: 36px;
  justify-content: center;
  width: 36px;

  &:hover {
    color: ${PARKS_VIBE.textPrimary};
  }
`;

const StyledScroll = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
`;

const StyledBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledKpiGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(3, minmax(0, 1fr));
`;

const StyledFormulaCard = styled.div`
  background: ${PARKS_VISUAL_THEME.accents.green.backgroundGradient};
  border: 1px solid ${PARKS_VISUAL_THEME.accents.green.border};
  border-radius: ${PARKS_VIBE.radiusMd};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledFormulaTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledFormulaSteps = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledFormulaStep = styled.li`
  align-items: baseline;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledFormulaLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledFormulaValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-feature-settings: 'tnum';
  font-weight: ${themeCssVariables.font.weight.semiBold};
  text-align: right;
`;

const StyledBaseCalculo = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
  margin: 0;
  word-break: break-word;
`;

const StyledSectionTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledFieldGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr;
`;

const StyledNote = styled.div`
  align-items: flex-start;
  background: ${PARKS_VISUAL_THEME.accents.orange.background};
  border: 1px solid ${PARKS_VISUAL_THEME.accents.orange.border};
  border-radius: ${PARKS_VIBE.radiusSm};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[2]};
  line-height: 1.4;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledDecisionBlock = styled.div`
  border-top: 1px solid ${PARKS_VIBE.border};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[3]};
`;

const StyledDecisionLabel = styled.label`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledDecisionHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
  margin: 0;
`;

const StyledDecisionError = styled.p`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
`;

const StyledDecisionActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

const formatEnumLabel = (value?: string | null): string => {
  if (!value) {
    return '—';
  }

  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const isExternalTipoPago = (comision: ParksComisionRecord): boolean => {
  const raw = (comision.tipoPago ?? comision.tipo ?? '').toUpperCase();

  return raw.includes('EXTERNO') || raw.includes('BROKER');
};

const getTipoPagoLabel = (comision: ParksComisionRecord): string => {
  if (isExternalTipoPago(comision)) {
    return t`Externo`;
  }

  const raw = (comision.tipoPago ?? comision.tipo ?? '').toUpperCase();

  if (raw.includes('INTERNO') || raw.includes('INTERNA')) {
    return t`Interno`;
  }

  return formatEnumLabel(comision.tipoPago ?? comision.tipo);
};

const getComisionStatusLabel = (estatus?: string | null): string => {
  if (!estatus) {
    return t`Pendiente de autorizar`;
  }

  const normalized = estatus.toUpperCase();

  if (normalized.includes('PAGAD')) {
    return t`Pagada`;
  }

  if (
    normalized.includes('PENDIENTE DE PAGO') ||
    normalized.includes('PENDIENTE_DE_PAGO')
  ) {
    return t`Pendiente de pago`;
  }

  if (normalized.includes('APROB') || normalized.includes('AUTORIZ')) {
    return t`Autorizada`;
  }

  if (normalized.includes('RECHAZ')) {
    return t`Rechazada`;
  }

  if (normalized.includes('DISPUTA')) {
    return t`En disputa`;
  }

  return t`Pendiente de autorizar`;
};

const isPendingValidation = (estatus?: string | null): boolean => {
  if (!estatus) {
    return true;
  }

  const normalized = estatus.toUpperCase();

  return (
    (normalized.includes('PENDIENTE') || normalized.includes('CALCULADA')) &&
    !normalized.includes('PAGO')
  );
};

export const ParksComisionDetailPanel = ({
  comision,
  onClose,
  canManage = false,
  isBusy = false,
  onApprove,
  onReject,
}: ParksComisionDetailPanelProps) => {
  const [comentario, setComentario] = useState('');
  const [decisionError, setDecisionError] = useState<string | null>(null);

  const rentaTotal = comision.rentaTotalContrato ?? 0;
  const pctAplicado = comision.pctAplicado ?? 0;
  const montoUsd = comision.montoUsd ?? 0;
  const hasAjuste =
    comision.ajusteMonto != null ||
    Boolean(comision.motivoAjuste) ||
    Boolean(comision.aprobadoPor);
  const isFuno = comision.aplicaFuno === true;
  const canDecide =
    canManage &&
    isPendingValidation(comision.estatus) &&
    Boolean(onApprove) &&
    Boolean(onReject);

  const handleApproveClick = () => {
    setDecisionError(null);
    void onApprove?.(comentario.trim() || undefined);
  };

  const handleRejectClick = () => {
    const trimmed = comentario.trim();

    if (!trimmed) {
      setDecisionError(t`El rechazo requiere un comentario.`);
      return;
    }

    setDecisionError(null);
    void onReject?.(trimmed);
  };

  return (
    <ParksResponsiveSheet
      isOpen
      onClose={onClose}
      focusId="parks-comision-detail-sheet"
      ariaLabelledBy="parks-comision-detail-title"
    >
      <StyledPanel>
        <StyledHeader>
          <div>
            <StyledEyebrow>{t`Despliegue de comisión`}</StyledEyebrow>
            <StyledTitle id="parks-comision-detail-title">
              {comision.folio ?? t`Sin folio`}
            </StyledTitle>
            <StyledSubtitle>
              {comision.clienteNombre ?? t`Cliente sin nombre`}
            </StyledSubtitle>
          </div>
          <StyledCloseButton
            type="button"
            aria-label={t`Cerrar`}
            onClick={onClose}
          >
            <IconX size={16} />
          </StyledCloseButton>
        </StyledHeader>

        <StyledScroll>
          <StyledBadges>
            <ParksStatusBadge
              color={getParksComisionStatusColor(comision.estatus)}
              label={getComisionStatusLabel(comision.estatus)}
            />
            <ParksStatusBadge
              color={isExternalTipoPago(comision) ? 'orange' : 'green'}
              label={getTipoPagoLabel(comision)}
            />
            {isFuno ? (
              <ParksStatusBadge color="orange" label={t`Propiedad FUNO`} />
            ) : null}
          </StyledBadges>

          <StyledKpiGrid>
            <ParksKpiTile
              label={t`Renta total`}
              accent="blue"
              value={formatParksUsd(rentaTotal)}
            />
            <ParksKpiTile
              label={t`% aplicado`}
              accent="yellow"
              value={`${pctAplicado}%`}
            />
            <ParksKpiTile
              label={t`Comisión`}
              accent="green"
              value={formatParksUsd(montoUsd)}
            />
          </StyledKpiGrid>

          <StyledFormulaCard>
            <StyledFormulaTitle>
              <IconCurrencyDollar
                size={14}
                style={{ verticalAlign: '-2px' }}
              />{' '}
              {t`Cómo se calcula`}
            </StyledFormulaTitle>
            <StyledFormulaSteps>
              <StyledFormulaStep>
                <StyledFormulaLabel>{t`1. Renta total del contrato`}</StyledFormulaLabel>
                <StyledFormulaValue>
                  {formatParksUsd(rentaTotal)}
                </StyledFormulaValue>
              </StyledFormulaStep>
              <StyledFormulaStep>
                <StyledFormulaLabel>{t`2. Porcentaje aplicado`}</StyledFormulaLabel>
                <StyledFormulaValue>{pctAplicado}%</StyledFormulaValue>
              </StyledFormulaStep>
              <StyledFormulaStep>
                <StyledFormulaLabel>{t`3. Monto de comisión`}</StyledFormulaLabel>
                <StyledFormulaValue>
                  {formatParksUsd(montoUsd)}
                </StyledFormulaValue>
              </StyledFormulaStep>
            </StyledFormulaSteps>
            {comision.baseCalculo ? (
              <StyledBaseCalculo>{comision.baseCalculo}</StyledBaseCalculo>
            ) : (
              <StyledBaseCalculo>
                {formatParksUsd(rentaTotal)} × {pctAplicado}% ={' '}
                {formatParksUsd(montoUsd)}
              </StyledBaseCalculo>
            )}
          </StyledFormulaCard>

          {isFuno ? (
            <StyledNote>
              <IconAlertTriangle size={16} />
              <span>
                {t`Propiedad FUNO: la comisión no se paga al equipo interno de Parks; va a la FIBRA. Este folio quedó registrado solo para trazabilidad.`}
              </span>
            </StyledNote>
          ) : null}

          <StyledSectionTitle>{t`Clasificación`}</StyledSectionTitle>
          <StyledFieldGrid>
            <ParksDetailField
              label={t`Origen del deal`}
              value={formatEnumLabel(comision.origenDeal)}
              icon={IconCoins}
              accent="green"
            />
            <ParksDetailField
              label={t`Tipo de contrato`}
              value={formatEnumLabel(comision.tipoContratoComision)}
              accent="blue"
            />
            <ParksDetailField
              label={t`Estatus de nave`}
              value={formatEnumLabel(comision.estatusNaveComision)}
              accent="default"
            />
            <ParksDetailField
              label={t`Tier broker`}
              value={formatEnumLabel(comision.brokerTierSnapshot)}
              accent="yellow"
            />
            <ParksDetailField
              label={t`Beneficiario`}
              value={comision.beneficiario || '—'}
              accent="green"
            />
            <ParksDetailField
              label={t`Leasing Officer`}
              value={comision.leasingOfficer || '—'}
              accent="default"
            />
            <ParksDetailField
              label={t`Esquema de pago`}
              value={getTipoPagoLabel(comision)}
              icon={IconPercentage}
              accent="purple"
            />
          </StyledFieldGrid>

          {hasAjuste ? (
            <>
              <StyledSectionTitle>{t`Ajustes y autorización`}</StyledSectionTitle>
              <StyledFieldGrid>
                <ParksDetailField
                  label={t`Ajuste de monto`}
                  value={
                    comision.ajusteMonto != null
                      ? formatParksUsd(comision.ajusteMonto)
                      : '—'
                  }
                  accent="yellow"
                />
                <ParksDetailField
                  label={t`Motivo del ajuste`}
                  value={comision.motivoAjuste || '—'}
                  accent="default"
                />
                <ParksDetailField
                  label={t`Aprobado por`}
                  value={comision.aprobadoPor || '—'}
                  accent="green"
                />
                <ParksDetailField
                  label={t`Fecha de aprobación`}
                  value={formatParksDate(comision.fechaAprobacion)}
                  accent="default"
                />
                <ParksDetailField
                  label={t`Fecha de pago`}
                  value={formatParksDate(comision.fechaPago)}
                  accent="default"
                />
              </StyledFieldGrid>
            </>
          ) : null}
        </StyledScroll>

        {canDecide ? (
          <StyledDecisionBlock>
            <StyledDecisionLabel htmlFor="parks-comision-decision-comment">
              {t`Comentarios`}
            </StyledDecisionLabel>
            <StyledParksTextarea
              id="parks-comision-decision-comment"
              value={comentario}
              disabled={isBusy}
              placeholder={t`Opcional al autorizar; obligatorio al rechazar`}
              onChange={(event) => {
                setComentario(event.target.value);
                if (decisionError) {
                  setDecisionError(null);
                }
              }}
            />
            <StyledDecisionHint>
              {t`Usa el comentario para dejar constancia del ajuste o del motivo de rechazo.`}
            </StyledDecisionHint>
            {decisionError ? (
              <StyledDecisionError>{decisionError}</StyledDecisionError>
            ) : null}
            <StyledDecisionActions>
              <ParksActionButton
                size="sm"
                variant="secondary"
                title={t`Rechazar`}
                disabled={isBusy}
                onClick={handleRejectClick}
              />
              <ParksActionButton
                size="sm"
                title={t`Autorizar`}
                disabled={isBusy}
                onClick={handleApproveClick}
              />
            </StyledDecisionActions>
          </StyledDecisionBlock>
        ) : null}
      </StyledPanel>
    </ParksResponsiveSheet>
  );
};
