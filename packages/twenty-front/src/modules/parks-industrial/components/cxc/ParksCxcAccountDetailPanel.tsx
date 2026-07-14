import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Button } from 'twenty-ui/input';
import {
  IconCheck,
  IconMail,
  IconPhone,
  IconX,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
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
  onClose: () => void;
  onAccountUpdated: (account: CxcAccount) => void;
};

const StyledPanel = styled.aside`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.xl};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  max-height: calc(100vh - 180px);
  overflow: auto;
  padding: ${themeCssVariables.spacing[4]};
  position: sticky;
  top: ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: ${themeCssVariables.spacing[1]} 0 0;
`;

const StyledCloseButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSection = styled.section`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[3]};
`;

const StyledSectionTitle = styled.h4`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledContactRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: 8px;
`;

const StyledFactorList = styled.ul`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledInvoiceRow = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
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
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledTextArea = styled.textarea`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 72px;
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

export const ParksCxcAccountDetailPanel = ({
  account,
  onClose,
  onAccountUpdated,
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
  const [suggestion, setSuggestion] = useState<CxcPaymentSuggestion | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const activities = account.actividadesCobranza ?? [];

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
          ? t`Escalado a Claudia (Gerente CxC)`
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

    try {
      const updated = await addParksCxcCobranzaAction(account.id, {
        type,
        detail: actionNote.trim() || undefined,
        createdBy: actorName,
      });
      onAccountUpdated(updated);
      setActionNote('');
      setMessage(t`Acción de cobranza registrada`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t`Error al registrar acción`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <StyledPanel>
      <StyledHeader>
        <div>
          <StyledTitle>{account.empresa}</StyledTitle>
          <StyledSubtitle>
            {account.nave} · {account.parque} · {account.rfc}
          </StyledSubtitle>
        </div>
        <StyledCloseButton type="button" onClick={onClose} aria-label={t`Cerrar`}>
          <IconX size={16} />
        </StyledCloseButton>
      </StyledHeader>

      <StyledBadges>
        <ParksStatusBadge
          label={`${account.scoreLabel} ${account.scoreRiesgo}`}
          color={
            account.scoreLabel === 'Bajo'
              ? 'green'
              : account.scoreLabel === 'Medio'
                ? 'yellow'
                : 'red'
          }
        />
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
        <ParksStatusBadge label={account.cicloEstatus} color="gray" />
      </StyledBadges>

      <StyledSection>
        <StyledSectionTitle>{t`Seguimiento operativo`}</StyledSectionTitle>
        <StyledTextArea
          value={actionNote}
          onChange={(event) => setActionNote(event.target.value)}
          placeholder={t`Nota de llamada, compromiso del cliente, próximo paso…`}
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
            title={t`Escalar a Claudia`}
            onClick={() => void handleCobranzaAction('escalar_claudia')}
            disabled={busy}
            variant="primary"
          />
        </StyledActions>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t`Contacto de pagos`}</StyledSectionTitle>
        <StyledContactRow>{account.contactoPagosNombre}</StyledContactRow>
        <StyledContactRow>
          <IconMail size={14} />
          {account.contactoPagosEmail}
        </StyledContactRow>
        <StyledContactRow>
          <IconPhone size={14} />
          {account.contactoPagosTelefono}
        </StyledContactRow>
        <StyledNote>
          {t`Ejecutivo:`} {account.ejecutivoNombre} · {account.diaPagoAcordado}
        </StyledNote>
      </StyledSection>

      {account.facturas.length > 0 ? (
        <StyledSection>
          <StyledSectionTitle>{t`Facturas`}</StyledSectionTitle>
          {account.facturas.map((invoice) => (
            <StyledInvoiceRow key={invoice.id}>
              <div>
                <div>{invoice.numeroFactura}</div>
                <StyledNote>
                  {invoice.tipo} · {invoice.estatus}
                </StyledNote>
              </div>
              <strong>
                {formatCxcMoney(invoice.monto, invoice.moneda)}
              </strong>
            </StyledInvoiceRow>
          ))}
        </StyledSection>
      ) : null}

      {account.ordenCompra ? (
        <StyledSection>
          <StyledSectionTitle>{t`Orden de compra (portal)`}</StyledSectionTitle>
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
                  variant="secondary"
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
        </StyledSection>
      ) : null}

      {account.deposito ? (
        <StyledSection>
          <StyledSectionTitle>{t`Depósito en garantía`}</StyledSectionTitle>
          <StyledNote>
            {formatCxcMoney(account.deposito.montoOriginal, account.moneda)} →{' '}
            {formatCxcMoney(account.deposito.montoADevolver, account.moneda)} ·{' '}
            {account.deposito.estatus}
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
        </StyledSection>
      ) : null}

      {account.holdover ? (
        <StyledSection>
          <StyledSectionTitle>{t`Holdover`}</StyledSectionTitle>
          <StyledNote>
            {t`${account.holdover.diasEnHoldover} días`} ·{' '}
            {formatCxcMoney(account.holdover.montoPendiente, account.moneda)}{' '}
            {t`pendiente`}
          </StyledNote>
        </StyledSection>
      ) : null}

      {account.escalacionInpc ? (
        <StyledSection>
          <StyledSectionTitle>{t`Escalación INPC`}</StyledSectionTitle>
          <StyledNote>
            {account.escalacionInpc.porcentajeInpc}% ·{' '}
            {formatCxcMoney(
              account.escalacionInpc.rentaAnterior,
              account.moneda,
            )}{' '}
            →{' '}
            {formatCxcMoney(account.escalacionInpc.rentaNueva, account.moneda)}
          </StyledNote>
          <StyledNote>
            {t`Aplica en`} {account.escalacionInpc.diasParaAplicacion}d ·{' '}
            {account.escalacionInpc.estatus}
          </StyledNote>
        </StyledSection>
      ) : null}

      <StyledSection>
        <StyledSectionTitle>{t`Aplicación de pago`}</StyledSectionTitle>
        <StyledInput
          type="number"
          value={paymentAmount}
          onChange={(event) => setPaymentAmount(event.target.value)}
          placeholder={t`Monto del pago`}
        />
        <Button
          title={t`Sugerir aplicación`}
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
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t`Bitácora de cobranza`}</StyledSectionTitle>
        {activities.length === 0 ? (
          <StyledNote>{t`Sin acciones registradas aún.`}</StyledNote>
        ) : (
          activities.slice(0, 12).map((activity) => (
            <StyledActivityItem key={activity.id}>
              <StyledActivityTitle>{activity.label}</StyledActivityTitle>
              <StyledNote>{activity.detail}</StyledNote>
              <StyledNote>
                {activity.createdBy} · {formatActivityTime(activity.createdAt)}
              </StyledNote>
            </StyledActivityItem>
          ))
        )}
        {account.notasCobranza ? (
          <StyledNote>
            {t`Última nota:`} {account.notasCobranza}
          </StyledNote>
        ) : null}
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t`Factores de riesgo IA`}</StyledSectionTitle>
        <StyledFactorList>
          {account.scoreFactores.map((factor) => (
            <li key={factor}>{factor}</li>
          ))}
        </StyledFactorList>
      </StyledSection>

      {message ? <StyledNote>{message}</StyledNote> : null}
    </StyledPanel>
  );
};
