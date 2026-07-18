import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Button } from 'twenty-ui/input';
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconCurrencyDollar,
  IconMail,
  IconMap,
  IconPhone,
  IconReportMoney,
  IconUser,
  IconX,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksCxcAccountExpediente } from '@/parks-industrial/components/cxc/ParksCxcAccountExpediente';
import { ParksCxcCalendarioPagos } from '@/parks-industrial/components/cxc/ParksCxcCalendarioPagos';
import { ParksKpiTile } from '@/parks-industrial/components/ui/ParksDetailField';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  CXC_PIPELINE_STAGES,
  resolveCxcPipelineStage,
} from '@/parks-industrial/constants/parks-cxc-pipeline.constants';
import {
  PARKS_BRAND,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import {
  addParksCxcCobranzaAction,
  advanceParksCxcDepositStep,
  applyParksCxcPayment,
  registerParksCxcOc,
  sendParksCxcOcReminder,
  suggestParksCxcPayment,
} from '@/parks-industrial/services/parks-cxc.client';
import {
  type CxcAccount,
  type CxcCobranzaActionType,
  type CxcPaymentSuggestion,
} from '@/parks-industrial/types/parks-cxc.types';
import { formatCxcMoney } from '@/parks-industrial/utils/parks-cxc-format.util';

type ParksCxcAccountDetailPanelProps = {
  account: CxcAccount;
  onClose?: () => void;
  onAccountUpdated: (account: CxcAccount) => void;
  embedded?: boolean;
};

const StyledWorkspace = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledHero = styled.div`
  background: linear-gradient(
    145deg,
    ${PARKS_VISUAL_THEME.accents.green.background} 0%,
    ${themeCssVariables.background.primary} 55%,
    ${PARKS_VISUAL_THEME.accents.yellow.background} 100%
  );
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[4]};
  position: relative;

  &::before {
    background: ${PARKS_BRAND.primary};
    content: '';
    height: 3px;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }
`;

const StyledHeroTop = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
`;

const StyledIdentity = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledEyebrow = styled.span`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const StyledTitle = styled.h2`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledCloseButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledStageStrip = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  overflow-x: auto;
  padding-bottom: 2px;
`;

const StyledStageChip = styled.span<{ active: boolean; past: boolean }>`
  background: ${({ active, past }) =>
    active
      ? PARKS_BRAND.primary
      : past
        ? PARKS_BRAND.primarySoft
        : themeCssVariables.background.primary};
  border: 1px solid
    ${({ active, past }) =>
      active || past
        ? PARKS_BRAND.borderSoft
        : themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ active }) =>
    active ? '#fff' : themeCssVariables.font.color.secondary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: 4px 10px;
  white-space: nowrap;
`;

const StyledKpiGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const StyledColumns = styled.div`
  align-items: start;
  display: grid;
  gap: ${themeCssVariables.spacing[4]};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
  }
`;

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-width: 0;
`;

const StyledContactRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: 8px;
`;

const StyledContactName = styled.strong`
  color: ${themeCssVariables.font.color.primary};
  display: block;
  font-size: ${themeCssVariables.font.size.md};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledFactorList = styled.ul`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledInvoiceRow = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: space-between;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledChecklist = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCheckItem = styled.div<{ done: boolean }>`
  align-items: center;
  color: ${({ done }) =>
    done ? PARKS_BRAND.primary : themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: 8px;
`;

const StyledInput = styled.input`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledTextArea = styled.textarea`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 88px;
  padding: ${themeCssVariables.spacing[2]};
  resize: vertical;
  width: 100%;
`;

const StyledSuggestion = styled.div`
  background: ${PARKS_BRAND.primarySoft};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledOptionCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNote = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
`;

const StyledMessage = styled.p`
  background: ${PARKS_BRAND.primarySoft};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledActivityItem = styled.div`
  border-left: 2px solid ${PARKS_BRAND.borderSoft};
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledActivityTitle = styled.strong`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledInvoiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const formatActivityTime = (isoDate: string): string => {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getRiskColor = (
  label: CxcAccount['scoreLabel'],
): 'green' | 'yellow' | 'red' => {
  if (label === 'Bajo') {
    return 'green';
  }

  if (label === 'Medio') {
    return 'yellow';
  }

  return 'red';
};

const getPaymentColor = (
  status: CxcAccount['estatusPagos'],
): 'green' | 'yellow' | 'red' | 'gray' => {
  if (status === 'Al corriente') {
    return 'green';
  }

  if (status === 'Mora leve') {
    return 'yellow';
  }

  if (status === 'Inactivo') {
    return 'gray';
  }

  return 'red';
};

export const ParksCxcAccountDetailPanel = ({
  account,
  onClose,
  onAccountUpdated,
  embedded = false,
}: ParksCxcAccountDetailPanelProps) => {
  const { displayName } = useParksAccess();
  const actorName = displayName || account.ejecutivoNombre;
  const [ocNumber, setOcNumber] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(
    account.montoAdeudoTotal > 0
      ? String(account.montoAdeudoTotal)
      : String(account.rentaMensual),
  );
  const [actionNote, setActionNote] = useState('');
  const [compromisoFecha, setCompromisoFecha] = useState(
    account.seguimientoCobranza?.compromisoPagoFecha ?? '',
  );
  const [compromisoMonto, setCompromisoMonto] = useState(
    account.seguimientoCobranza?.compromisoMonto != null
      ? String(account.seguimientoCobranza.compromisoMonto)
      : account.montoAdeudoTotal > 0
        ? String(account.montoAdeudoTotal)
        : '',
  );
  const [proximaAccionFecha, setProximaAccionFecha] = useState(
    account.seguimientoCobranza?.proximaAccionFecha ?? '',
  );
  const [suggestion, setSuggestion] = useState<CxcPaymentSuggestion | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const activities = account.actividadesCobranza ?? [];
  const seguimiento = account.seguimientoCobranza;
  const stageId = resolveCxcPipelineStage(account);
  const stageIndex = CXC_PIPELINE_STAGES.findIndex(
    (stage) => stage.id === stageId,
  );
  const stageMeta = CXC_PIPELINE_STAGES[stageIndex];
  const openInvoices = account.facturas.filter(
    (invoice) =>
      invoice.estatus !== 'Pagada' && invoice.estatus !== 'Cancelada',
  );

  const handleRegisterOc = async () => {
    if (!ocNumber.trim()) {
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const updated = await registerParksCxcOc(account.id, ocNumber.trim());
      onAccountUpdated(updated);
      setMessage(t`OC registrada. Solicita factura a Jesús y carga al portal.`);
      setOcNumber('');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t`Error al registrar OC`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleOcReminder = async (escalate = false) => {
    setBusy(true);
    setMessage(null);

    try {
      const updated = await sendParksCxcOcReminder(account.id, {
        escalate,
        createdBy: actorName,
      });
      onAccountUpdated(updated);
      setMessage(
        escalate
          ? t`Escalado a Claudia — notificación enviada a Gerente CxC`
          : t`Recordatorio OC registrado`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t`Error en recordatorio OC`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDepositStep = async (
    step: 'caratula' | 'carta' | 'firmas' | 'devolver',
  ) => {
    setBusy(true);
    setMessage(null);

    try {
      const updated = await advanceParksCxcDepositStep(account.id, step);
      onAccountUpdated(updated);
      setMessage(t`Checklist de depósito actualizado`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t`Error en depósito`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSuggestPayment = async () => {
    const amount = Number(paymentAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const result = await suggestParksCxcPayment(account.id, amount);
      setSuggestion(result);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t`Error al sugerir aplicación`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleApplyPayment = async (invoiceIds: string[]) => {
    const amount = Number(paymentAmount);

    if (!Number.isFinite(amount) || amount <= 0 || invoiceIds.length === 0) {
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const updated = await applyParksCxcPayment(account.id, {
        pagoMonto: amount,
        invoiceIds,
        note: actionNote.trim() || undefined,
        appliedBy: actorName,
      });
      onAccountUpdated(updated);
      setSuggestion(null);
      setActionNote('');
      setMessage(t`Pago aplicado a la(s) factura(s) seleccionada(s)`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t`Error al aplicar pago`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCobranzaAction = async (type: CxcCobranzaActionType) => {
    setBusy(true);
    setMessage(null);

    const compromisoMontoNumber = Number(compromisoMonto);

    try {
      const updated = await addParksCxcCobranzaAction(account.id, {
        type,
        detail: actionNote.trim() || undefined,
        createdBy: actorName,
        compromisoPagoFecha: compromisoFecha.trim() || undefined,
        compromisoMonto:
          Number.isFinite(compromisoMontoNumber) && compromisoMontoNumber > 0
            ? compromisoMontoNumber
            : undefined,
        proximaAccionFecha: proximaAccionFecha.trim() || undefined,
        proximaAccionNota: actionNote.trim() || undefined,
      });
      onAccountUpdated(updated);
      setActionNote('');
      setMessage(
        type === 'escalar_claudia'
          ? t`Escalado a Claudia — notificación enviada a Gerente CxC`
          : type === 'compromiso_pago'
            ? t`Compromiso de pago marcado en la plataforma`
            : t`Seguimiento registrado en la plataforma`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t`Error al registrar acción`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <StyledWorkspace>
      <StyledHero>
        <StyledHeroTop>
          <StyledIdentity>
            <StyledEyebrow>{t`Expediente CxC`}</StyledEyebrow>
            <StyledTitle>{account.empresa}</StyledTitle>
            <StyledSubtitle>
              <IconMap size={12} style={{ marginRight: 4 }} />
              {account.nave} · {account.parque} · {account.rfc}
            </StyledSubtitle>
          </StyledIdentity>
          {onClose && !embedded ? (
            <StyledCloseButton
              type="button"
              onClick={onClose}
              aria-label={t`Cerrar`}
            >
              <IconX size={16} />
            </StyledCloseButton>
          ) : null}
        </StyledHeroTop>

        <StyledBadges>
          <ParksStatusBadge
            label={`${account.scoreLabel} ${account.scoreRiesgo}`}
            color={getRiskColor(account.scoreLabel)}
          />
          <ParksStatusBadge
            label={account.estatusPagos}
            color={getPaymentColor(account.estatusPagos)}
          />
          <ParksStatusBadge label={account.cicloEstatus} color="gray" />
          {account.requiereOc ? (
            <ParksStatusBadge label={t`Requiere OC`} color="yellow" />
          ) : (
            <ParksStatusBadge label={t`Sin OC`} color="green" />
          )}
          <ParksStatusBadge label={account.tipoCliente} color="blue" />
          {seguimiento?.estado && seguimiento.estado !== 'Sin seguimiento' ? (
            <ParksStatusBadge
              label={`${t`Seguimiento`}: ${seguimiento.estado}`}
              color={
                seguimiento.estado === 'Escalado'
                  ? 'red'
                  : seguimiento.estado === 'Compromiso de pago'
                    ? 'yellow'
                    : 'blue'
              }
            />
          ) : null}
          {stageMeta ? (
            <ParksStatusBadge
              label={`${t`Etapa`}: ${stageMeta.label}`}
              color="blue"
            />
          ) : null}
        </StyledBadges>

        <StyledStageStrip>
          {CXC_PIPELINE_STAGES.map((stage, index) => (
            <StyledStageChip
              key={stage.id}
              active={stage.id === stageId}
              past={index < stageIndex}
              title={stage.description}
            >
              {stage.label}
            </StyledStageChip>
          ))}
        </StyledStageStrip>
      </StyledHero>

      <StyledKpiGrid>
        <ParksKpiTile
          label={t`Adeudo total`}
          accent="yellow"
          value={formatCxcMoney(account.montoAdeudoTotal, account.moneda)}
        />
        <ParksKpiTile
          label={t`Renta mensual`}
          accent="green"
          value={formatCxcMoney(account.rentaMensual, account.moneda)}
        />
        <ParksKpiTile
          label={t`Días en mora`}
          accent={account.diasEnMora > 0 ? 'yellow' : 'default'}
          value={String(account.diasEnMora)}
        />
        <ParksKpiTile
          label={t`Facturas abiertas`}
          accent="blue"
          value={String(openInvoices.length)}
        />
      </StyledKpiGrid>

      {message ? <StyledMessage>{message}</StyledMessage> : null}

      <ParksCxcCalendarioPagos account={account} />

      <StyledColumns>
        <StyledColumn>
          <ParksCxcAccountExpediente account={account} />
        </StyledColumn>

        <StyledColumn>
          <ParksSectionCard title={t`Seguimiento operativo`} accent="green">
            {seguimiento && seguimiento.estado !== 'Sin seguimiento' ? (
              <StyledSuggestion>
                <strong>{seguimiento.estado}</strong>
                {seguimiento.compromisoPagoFecha ? (
                  <StyledNote>
                    {t`Compromiso de pago:`}{' '}
                    {seguimiento.compromisoPagoFecha}
                    {seguimiento.compromisoMonto != null
                      ? ` · ${formatCxcMoney(seguimiento.compromisoMonto, account.moneda)}`
                      : ''}
                  </StyledNote>
                ) : null}
                {seguimiento.proximaAccionFecha ? (
                  <StyledNote>
                    {t`Próxima acción:`} {seguimiento.proximaAccionFecha}
                    {seguimiento.proximaAccionNota
                      ? ` — ${seguimiento.proximaAccionNota}`
                      : ''}
                  </StyledNote>
                ) : null}
                {seguimiento.ultimoContactoAt ? (
                  <StyledNote>
                    {t`Último contacto:`}{' '}
                    {formatActivityTime(seguimiento.ultimoContactoAt)}
                    {seguimiento.ultimoContactoTipo
                      ? ` · ${seguimiento.ultimoContactoTipo}`
                      : ''}
                  </StyledNote>
                ) : null}
              </StyledSuggestion>
            ) : (
              <StyledNote>
                {t`Sin seguimiento activo. Registra una llamada, compromiso o próxima acción.`}
              </StyledNote>
            )}
            <StyledTextArea
              value={actionNote}
              onChange={(event) => setActionNote(event.target.value)}
              placeholder={t`Nota de llamada, compromiso del cliente, próximo paso…`}
            />
            <StyledInput
              type="date"
              value={compromisoFecha}
              onChange={(event) => setCompromisoFecha(event.target.value)}
              aria-label={t`Fecha compromiso de pago`}
            />
            <StyledInput
              type="number"
              value={compromisoMonto}
              onChange={(event) => setCompromisoMonto(event.target.value)}
              placeholder={t`Monto compromiso de pago`}
            />
            <StyledInput
              type="date"
              value={proximaAccionFecha}
              onChange={(event) => setProximaAccionFecha(event.target.value)}
              aria-label={t`Fecha próxima acción`}
            />
            <StyledActions>
              <Button
                title={t`Llamada`}
                onClick={() => void handleCobranzaAction('llamada')}
                disabled={busy}
                variant="secondary"
              />
              <Button
                title={t`Email`}
                onClick={() => void handleCobranzaAction('email')}
                disabled={busy}
                variant="secondary"
              />
              <Button
                title={t`WhatsApp`}
                onClick={() => void handleCobranzaAction('whatsapp')}
                disabled={busy}
                variant="secondary"
              />
              <Button
                title={t`Guardar nota`}
                onClick={() => void handleCobranzaAction('nota')}
                disabled={busy || !actionNote.trim()}
                variant="secondary"
              />
              <Button
                title={t`Marcar compromiso`}
                onClick={() => void handleCobranzaAction('compromiso_pago')}
                disabled={busy || (!compromisoFecha && !actionNote.trim())}
                variant="primary"
              />
              <Button
                title={t`Escalar a Claudia`}
                onClick={() => void handleCobranzaAction('escalar_claudia')}
                disabled={busy}
                variant="secondary"
              />
            </StyledActions>
            <StyledNote>
              {t`Ejecutivo:`} {account.ejecutivoNombre} · {account.diaPagoAcordado}
            </StyledNote>
          </ParksSectionCard>

          <ParksSectionCard title={t`Contacto de pagos`} accent="sky">
            <StyledContactName>
              <IconUser size={14} style={{ marginRight: 6 }} />
              {account.contactoPagosNombre}
            </StyledContactName>
            <StyledContactRow>
              <IconMail size={14} />
              {account.contactoPagosEmail}
            </StyledContactRow>
            <StyledContactRow>
              <IconPhone size={14} />
              {account.contactoPagosTelefono}
            </StyledContactRow>
          </ParksSectionCard>

          {account.facturas.length > 0 ? (
            <ParksSectionCard title={t`Facturas`} accent="blue">
              <StyledInvoiceList>
                {account.facturas.map((invoice) => (
                  <StyledInvoiceRow key={invoice.id}>
                    <div>
                      <div>{invoice.numeroFactura}</div>
                      <StyledNote>
                        {invoice.tipo} · {invoice.estatus}
                        {invoice.diasVencida > 0
                          ? ` · ${invoice.diasVencida}d`
                          : ''}
                      </StyledNote>
                    </div>
                    <strong>
                      {formatCxcMoney(invoice.monto, invoice.moneda)}
                    </strong>
                  </StyledInvoiceRow>
                ))}
              </StyledInvoiceList>
            </ParksSectionCard>
          ) : null}

          {account.ordenCompra ? (
            <ParksSectionCard title={t`Orden de compra (portal)`} accent="yellow">
              <StyledNote>
                {account.ordenCompra.estatus}
                {account.ordenCompra.diasSinOc > 0
                  ? ` · ${account.ordenCompra.diasSinOc}d sin OC`
                  : ''}
                {account.ordenCompra.numeroOc
                  ? ` · ${account.ordenCompra.numeroOc}`
                  : ''}
                {` · ${account.ordenCompra.intentosRecordatorio} recordatorios`}
              </StyledNote>
              {account.ordenCompra.estatus === 'Esperando OC' ? (
                <>
                  <StyledActions>
                    <Button
                      title={t`Enviar recordatorio`}
                      onClick={() => void handleOcReminder(false)}
                      disabled={busy}
                      variant="secondary"
                    />
                    <Button
                      title={t`Escalar OC`}
                      onClick={() => void handleOcReminder(true)}
                      disabled={busy}
                      variant="primary"
                    />
                  </StyledActions>
                  <StyledInput
                    value={ocNumber}
                    onChange={(event) => setOcNumber(event.target.value)}
                    placeholder={t`Número de OC recibida`}
                  />
                  <Button
                    title={t`Registrar OC`}
                    onClick={() => void handleRegisterOc()}
                    disabled={busy || !ocNumber.trim()}
                    variant="primary"
                  />
                </>
              ) : null}
            </ParksSectionCard>
          ) : null}

          {account.deposito ? (
            <ParksSectionCard title={t`Depósito en garantía`} accent="purple">
              <StyledNote>
                {formatCxcMoney(account.deposito.montoOriginal, account.moneda)}{' '}
                →{' '}
                {formatCxcMoney(
                  account.deposito.montoADevolver,
                  account.moneda,
                )}{' '}
                · {account.deposito.estatus}
              </StyledNote>
              {account.deposito.razonRetencion ? (
                <StyledNote>{account.deposito.razonRetencion}</StyledNote>
              ) : null}
              <StyledChecklist>
                <StyledCheckItem done={account.deposito.caratulaBancariaRecibida}>
                  <IconCheck size={14} />
                  {t`Carátula bancaria`}
                </StyledCheckItem>
                <StyledCheckItem done={account.deposito.cartaSolicitudRecibida}>
                  <IconCheck size={14} />
                  {t`Carta de solicitud`}
                </StyledCheckItem>
                <StyledCheckItem done={account.deposito.enProcesoFirmasInternas}>
                  <IconCheck size={14} />
                  {t`Firmas internas`}
                </StyledCheckItem>
              </StyledChecklist>
              <StyledActions>
                {!account.deposito.caratulaBancariaRecibida ? (
                  <Button
                    title={t`Marcar carátula`}
                    onClick={() => void handleDepositStep('caratula')}
                    disabled={busy}
                    variant="secondary"
                  />
                ) : null}
                {!account.deposito.cartaSolicitudRecibida ? (
                  <Button
                    title={t`Marcar carta`}
                    onClick={() => void handleDepositStep('carta')}
                    disabled={busy}
                    variant="secondary"
                  />
                ) : null}
                {account.deposito.caratulaBancariaRecibida &&
                account.deposito.cartaSolicitudRecibida &&
                !account.deposito.enProcesoFirmasInternas ? (
                  <Button
                    title={t`Iniciar firmas`}
                    onClick={() => void handleDepositStep('firmas')}
                    disabled={busy}
                    variant="secondary"
                  />
                ) : null}
                {account.deposito.estatus === 'En proceso de devolución' ? (
                  <Button
                    title={t`Confirmar devolución`}
                    onClick={() => void handleDepositStep('devolver')}
                    disabled={busy}
                    variant="primary"
                  />
                ) : null}
              </StyledActions>
            </ParksSectionCard>
          ) : null}

          {account.holdover ? (
            <ParksSectionCard title={t`Holdover`} accent="red">
              <StyledNote>
                <IconClock size={12} style={{ marginRight: 4 }} />
                {t`${account.holdover.diasEnHoldover} días`} ·{' '}
                {formatCxcMoney(account.holdover.montoPendiente, account.moneda)}{' '}
                {t`pendiente`}
              </StyledNote>
            </ParksSectionCard>
          ) : null}

          {account.escalacionInpc ? (
            <ParksSectionCard title={t`Escalación INPC`} accent="orange">
              <StyledNote>
                {account.escalacionInpc.porcentajeInpc}% ·{' '}
                {formatCxcMoney(
                  account.escalacionInpc.rentaAnterior,
                  account.moneda,
                )}{' '}
                →{' '}
                {formatCxcMoney(
                  account.escalacionInpc.rentaNueva,
                  account.moneda,
                )}
              </StyledNote>
              <StyledNote>
                {t`Aplica en`} {account.escalacionInpc.diasParaAplicacion}d ·{' '}
                {account.escalacionInpc.estatus}
              </StyledNote>
            </ParksSectionCard>
          ) : null}

          <ParksSectionCard title={t`Aplicación de pago`} accent="green">
            <StyledInput
              type="number"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
              placeholder={t`Monto del pago`}
            />
            <Button
              title={t`Sugerir aplicación`}
              Icon={IconCurrencyDollar}
              onClick={() => void handleSuggestPayment()}
              disabled={busy}
              variant="secondary"
            />
            {suggestion ? (
              <StyledSuggestion>
                <strong>{suggestion.suggestion}</strong>
                <StyledNote>{suggestion.justification}</StyledNote>
                {suggestion.options.map((option) => (
                  <StyledOptionCard key={option.label}>
                    <div>
                      <strong>{option.label}</strong>
                      <StyledNote>{option.detail}</StyledNote>
                    </div>
                    <Button
                      title={t`Aplicar esta opción`}
                      onClick={() => void handleApplyPayment(option.invoiceIds)}
                      disabled={busy || option.invoiceIds.length === 0}
                      variant="primary"
                    />
                  </StyledOptionCard>
                ))}
              </StyledSuggestion>
            ) : null}
          </ParksSectionCard>

          <ParksSectionCard title={t`Bitácora de cobranza`} accent="gray">
            {activities.length === 0 ? (
              <StyledNote>{t`Sin acciones registradas aún.`}</StyledNote>
            ) : (
              activities.slice(0, 12).map((activity) => (
                <StyledActivityItem key={activity.id}>
                  <StyledActivityTitle>{activity.label}</StyledActivityTitle>
                  <StyledNote>{activity.detail}</StyledNote>
                  <StyledNote>
                    {activity.createdBy} ·{' '}
                    {formatActivityTime(activity.createdAt)}
                  </StyledNote>
                </StyledActivityItem>
              ))
            )}
            {account.notasCobranza ? (
              <StyledNote>
                {t`Última nota:`} {account.notasCobranza}
              </StyledNote>
            ) : null}
          </ParksSectionCard>

          <ParksSectionCard title={t`Factores de riesgo IA`} accent="red">
            <StyledFactorList>
              {account.scoreFactores.map((factor) => (
                <li key={factor}>{factor}</li>
              ))}
            </StyledFactorList>
            <StyledNote style={{ marginTop: 8 }}>
              <IconAlertTriangle size={12} style={{ marginRight: 4 }} />
              <IconReportMoney size={12} style={{ marginRight: 4 }} />
              {t`Score`} {account.scoreRiesgo} · {account.scoreLabel}
            </StyledNote>
          </ParksSectionCard>
        </StyledColumn>
      </StyledColumns>
    </StyledWorkspace>
  );
};
