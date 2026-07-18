import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  IconCheck,
  IconCircleDashed,
  IconExternalLink,
  IconFileText,
  IconFileCheck,
  IconCalendarEvent,
  IconBuildingWarehouse,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksDetailField } from '@/parks-industrial/components/ui/ParksDetailField';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { type CxcAccount } from '@/parks-industrial/types/parks-cxc.types';
import { formatCxcMoney } from '@/parks-industrial/utils/parks-cxc-format.util';

type ParksCxcAccountExpedienteProps = {
  account: CxcAccount;
};

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledFieldGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: 1fr;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const StyledNote = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
`;

const StyledCallout = styled.div<{ tone: 'warning' | 'info' | 'success' }>`
  background: ${({ tone }) =>
    tone === 'warning'
      ? 'rgba(245, 158, 11, 0.08)'
      : tone === 'success'
        ? PARKS_BRAND.primarySoft
        : themeCssVariables.background.secondary};
  border: 1px solid
    ${({ tone }) =>
      tone === 'warning'
        ? 'rgba(245, 158, 11, 0.35)'
        : tone === 'success'
          ? PARKS_BRAND.borderSoft
          : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledCalloutTitle = styled.strong`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledLink = styled.a`
  align-items: center;
  color: ${PARKS_BRAND.primary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 6px;
  text-decoration: none;
  width: fit-content;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledPasos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPaso = styled.div<{ done: boolean }>`
  align-items: flex-start;
  background: ${({ done }) =>
    done ? PARKS_BRAND.primarySoft : themeCssVariables.background.primary};
  border: 1px solid
    ${({ done }) =>
      done ? PARKS_BRAND.borderSoft : themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${({ done }) =>
    done ? PARKS_BRAND.primary : themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledPasoBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledPasoLabel = styled.strong`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const ParksCxcAccountExpediente = ({
  account,
}: ParksCxcAccountExpedienteProps) => {
  const hoja = account.hojaAcuerdos;
  const contrato = account.contrato;
  const portal = account.portalPago;

  return (
    <StyledStack>
      {account.recibidoDeLegalAt ? (
        <StyledCallout tone="info">
          <StyledCalloutTitle>{t`Handoff desde Legal`}</StyledCalloutTitle>
          <StyledNote>
            {t`Recibido`} {formatDate(account.recibidoDeLegalAt)}
            {contrato?.referenciaLegal
              ? ` · ${contrato.referenciaLegal}`
              : ''}
            {contrato?.abogadoAsignado
              ? ` · ${t`Abogado`}: ${contrato.abogadoAsignado}`
              : ''}
          </StyledNote>
        </StyledCallout>
      ) : null}

      {account.requiereOc || portal?.requiereOc ? (
        <StyledCallout tone="warning">
          <StyledCalloutTitle>
            {t`Cliente requiere orden de compra (OC)`}
          </StyledCalloutTitle>
          <StyledNote>
            {portal?.instrucciones ??
              t`No se emite factura hasta registrar la OC. Luego se carga al portal del cliente.`}
          </StyledNote>
          {portal?.portalNombre ? (
            <StyledNote>
              {t`Portal:`} {portal.portalNombre}
            </StyledNote>
          ) : null}
          {portal?.portalUrl ? (
            <StyledLink
              href={portal.portalUrl}
              target="_blank"
              rel="noreferrer"
            >
              {t`Abrir portal de pago`}
              <IconExternalLink size={14} />
            </StyledLink>
          ) : null}
        </StyledCallout>
      ) : (
        <StyledCallout tone="success">
          <StyledCalloutTitle>{t`Sin portal / sin OC`}</StyledCalloutTitle>
          <StyledNote>
            {portal?.instrucciones ??
              t`Factura directa por transferencia a cuenta Fibra Uno.`}
          </StyledNote>
        </StyledCallout>
      )}

      {hoja ? (
        <ParksSectionCard title={t`Hoja de Acuerdos`} accent="purple">
          <StyledFieldGrid>
            <ParksDetailField
              label={t`Folio`}
              icon={IconFileText}
              accent="purple"
              value={hoja.folio ?? '—'}
            />
            <ParksDetailField
              label={t`Leasing officer`}
              icon={IconFileText}
              value={hoja.leasingOfficer ?? '—'}
            />
            <ParksDetailField
              label={t`m² acordados`}
              value={hoja.m2Acordados.toLocaleString('es-MX')}
            />
            <ParksDetailField
              label={t`USD / m²`}
              value={String(hoja.precioUsdM2 || '—')}
            />
            <ParksDetailField
              label={t`Renta mensual`}
              accent="green"
              value={formatCxcMoney(hoja.rentaMensual, hoja.moneda)}
            />
            <ParksDetailField
              label={t`Plazo`}
              value={`${hoja.plazoMeses} ${t`meses`}`}
            />
            <ParksDetailField
              label={t`Periodo de gracia`}
              value={`${hoja.mesesGracia} ${t`meses`}`}
            />
            <ParksDetailField
              label={t`Depósito`}
              value={`${hoja.mesesDeposito} ${t`meses`}`}
            />
            <ParksDetailField
              label={t`Renta adelantada`}
              value={`${hoja.mesesRentaAdelantada} ${t`meses`}`}
            />
            <ParksDetailField
              label={t`Escalación`}
              value={`${hoja.escalacionTipo ?? '—'}${
                hoja.escalacionPct != null ? ` ${hoja.escalacionPct}%` : ''
              }`}
            />
            <ParksDetailField
              label={t`Fecha de firma`}
              icon={IconCalendarEvent}
              value={formatDate(hoja.fechaFirma)}
            />
          </StyledFieldGrid>
        </ParksSectionCard>
      ) : null}

      {contrato ? (
        <ParksSectionCard title={t`Contrato firmado`} accent="blue">
          <StyledFieldGrid>
            <ParksDetailField
              label={t`Referencia legal`}
              icon={IconFileCheck}
              accent="blue"
              value={contrato.referenciaLegal}
            />
            <ParksDetailField
              label={t`Tipo de documento`}
              value={contrato.tipoDocumento}
            />
            <ParksDetailField
              label={t`Inicio`}
              value={formatDate(contrato.fechaInicio)}
            />
            <ParksDetailField
              label={t`Vencimiento`}
              value={formatDate(contrato.fechaVencimiento)}
            />
            <ParksDetailField
              label={t`Abogado asignado`}
              value={contrato.abogadoAsignado ?? '—'}
            />
            <ParksDetailField
              label={t`Propiedad FUNO`}
              value={contrato.esPropiedadFuno ? t`Sí` : t`No`}
            />
            <ParksDetailField
              label={t`Estatus legal`}
              value={contrato.estatusLegal}
            />
            <ParksDetailField
              label={t`Cuenta bancaria`}
              icon={IconBuildingWarehouse}
              accent={account.cuentaBancaria ? 'green' : 'yellow'}
              value={account.cuentaBancaria ?? t`Pendiente Fibra Uno`}
            />
          </StyledFieldGrid>
          <StyledNote style={{ marginTop: 12 }}>
            {account.jesusContratoDadoAlta
              ? t`Alta Oracle confirmada por Jesús`
              : t`Pendiente alta Oracle (Jesús / Contratos y Facturación)`}
          </StyledNote>
        </ParksSectionCard>
      ) : null}

      {portal && portal.pasos.length > 0 ? (
        <ParksSectionCard
          title={
            portal.requiereOc
              ? t`Proceso OC → portal de pago`
              : t`Proceso de facturación`
          }
          accent="yellow"
        >
          <StyledPasos>
            {portal.pasos.map((paso) => (
              <StyledPaso key={paso.id} done={paso.done}>
                {paso.done ? (
                  <IconCheck size={16} />
                ) : (
                  <IconCircleDashed size={16} />
                )}
                <StyledPasoBody>
                  <StyledPasoLabel>{paso.label}</StyledPasoLabel>
                  <StyledNote>{paso.detail}</StyledNote>
                </StyledPasoBody>
              </StyledPaso>
            ))}
          </StyledPasos>
        </ParksSectionCard>
      ) : null}
    </StyledStack>
  );
};
