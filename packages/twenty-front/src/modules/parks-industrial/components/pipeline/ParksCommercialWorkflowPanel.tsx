import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode, useState } from 'react';
import {
  IconCalendarEvent,
  IconCheck,
  IconFileText,
  IconSend,
  IconX,
  type IconComponent,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  StyledParksInput,
  StyledParksSelect,
  StyledParksTextarea,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import {
  ParksFormField,
  StyledParksFieldGrid,
} from '@/parks-industrial/components/ui/ParksFormField';
import { ParksToolSection } from '@/parks-industrial/components/ui/ParksToolSection';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import {
  createParksHojaAcuerdos,
  markParksOpportunityLost,
  previewParksQuotation,
  registerParksTour,
  requestParksApproval,
  resolveParksApproval,
  sendParksQuotation,
  signParksHojaAcuerdos,
} from '@/parks-industrial/services/parks-commercial.client';

const StyledWorkflowSubsection = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[3]};

  &:first-of-type {
    border-top: none;
    padding-top: 0;
  }
`;

const StyledSubsectionTitle = styled.h5`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  margin: 0;
`;

const StyledSubsectionIcon = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const StyledActionsRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

const StyledResultBanner = styled.div<{ isError?: boolean }>`
  background: ${({ isError }) =>
    isError
      ? themeCssVariables.color.red1
      : themeCssVariables.color.green1};
  border: 1px solid
    ${({ isError }) =>
      isError ? themeCssVariables.color.red3 : themeCssVariables.color.green3};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isError }) =>
    isError ? themeCssVariables.color.red : themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledPreviewValue = styled.div`
  background: ${themeCssVariables.color.blue1};
  border: 1px solid ${themeCssVariables.color.blue3};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

type WorkflowSubsectionProps = {
  title: string;
  icon: IconComponent;
  children: ReactNode;
};

const WorkflowSubsection = ({
  title,
  icon: Icon,
  children,
}: WorkflowSubsectionProps) => (
  <StyledWorkflowSubsection>
    <StyledSubsectionTitle>
      <StyledSubsectionIcon>
        <Icon size={14} />
      </StyledSubsectionIcon>
      {title}
    </StyledSubsectionTitle>
    {children}
  </StyledWorkflowSubsection>
);

type ParksCommercialWorkflowPanelProps = {
  opportunity: ParksOpportunityRecord;
  attendedDecisorIds?: string[];
  onUpdated?: () => void;
  embedded?: boolean;
};

export const ParksCommercialWorkflowPanel = ({
  opportunity,
  attendedDecisorIds = [],
  onUpdated,
  embedded = false,
}: ParksCommercialWorkflowPanelProps) => {
  const companyName =
    opportunity.inquilinoVinculado?.empresa ?? opportunity.name ?? 'Prospecto';

  const [tourFecha, setTourFecha] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [tourFeedback, setTourFeedback] = useState('');
  const [tourProximosPasos, setTourProximosPasos] = useState('');
  const [m2Ofertados, setM2Ofertados] = useState(
    opportunity.m2Requeridos ?? 5000,
  );
  const [precioPorM2, setPrecioPorM2] = useState(0.9);
  const [rentaPreview, setRentaPreview] = useState<number | null>(null);
  const [condicionesPropuestas, setCondicionesPropuestas] = useState('');
  const [motivoPerdida, setMotivoPerdida] = useState('Pospuesto');
  const [competidor, setCompetidor] = useState('Prologis');
  const [fechaReactivacion, setFechaReactivacion] = useState('');
  const [hojaId, setHojaId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const runAction = async (action: () => Promise<void>, success: string) => {
    setIsBusy(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      await action();
      setStatusMessage(success);
      onUpdated?.();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`Error en la acción`,
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <ParksToolSection
      title={t`Flujo comercial`}
      icon={IconCalendarEvent}
      hint={t`Tour → cotización → aprobación → Hoja de Acuerdos`}
      embedded={embedded}
    >
      <WorkflowSubsection title={t`Registrar tour`} icon={IconCalendarEvent}>
        <StyledParksFieldGrid>
          <ParksFormField label={t`Fecha del tour`} htmlFor="tour-fecha">
            <StyledParksInput
              id="tour-fecha"
              type="date"
              value={tourFecha}
              onChange={(event) => setTourFecha(event.target.value)}
            />
          </ParksFormField>
          <ParksFormField
            label={t`Parque visitado`}
            hint={t`Se toma de la nave vinculada si existe`}
          >
            <StyledParksInput
              readOnly
              value={
                opportunity.naveVinculada?.identificador ?? t`Sin nave asignada`
              }
            />
          </ParksFormField>
          <ParksFormField label={t`Feedback del cliente`} fullWidth>
            <StyledParksTextarea
              placeholder={t`Impresiones, objeciones, interés...`}
              value={tourFeedback}
              onChange={(event) => setTourFeedback(event.target.value)}
            />
          </ParksFormField>
          <ParksFormField label={t`Próximos pasos`} fullWidth>
            <StyledParksTextarea
              placeholder={t`Cotización, segunda visita, aprobación interna...`}
              value={tourProximosPasos}
              onChange={(event) => setTourProximosPasos(event.target.value)}
            />
          </ParksFormField>
        </StyledParksFieldGrid>
        <StyledActionsRow>
          <Button
            title={t`Guardar tour`}
            size="small"
            disabled={isBusy}
            onClick={() => {
              void runAction(async () => {
                await registerParksTour({
                  opportunityId: opportunity.id,
                  tourFecha,
                  tourFeedback,
                  tourProximosPasos,
                  tourParque: opportunity.naveVinculada?.identificador,
                  companyName,
                  inquilinoId: opportunity.inquilinoVinculado?.id,
                  attendedDecisorIds,
                });
              }, t`Tour registrado · tarea +48h creada`);
            }}
          />
        </StyledActionsRow>
      </WorkflowSubsection>

      <WorkflowSubsection title={t`Cotización formal`} icon={IconSend}>
        <StyledParksFieldGrid>
          <ParksFormField label={t`m² ofertados`} htmlFor="m2-ofertados">
            <StyledParksInput
              id="m2-ofertados"
              type="number"
              min={0}
              value={m2Ofertados}
              onChange={(event) => setM2Ofertados(Number(event.target.value))}
            />
          </ParksFormField>
          <ParksFormField label={t`Precio USD/m²`} htmlFor="precio-m2">
            <StyledParksInput
              id="precio-m2"
              type="number"
              step="0.01"
              min={0}
              value={precioPorM2}
              onChange={(event) => setPrecioPorM2(Number(event.target.value))}
            />
          </ParksFormField>
        </StyledParksFieldGrid>
        {rentaPreview !== null ? (
          <StyledPreviewValue>
            {t`Renta mensual calculada`}: USD{' '}
            {rentaPreview.toLocaleString('en-US')}
          </StyledPreviewValue>
        ) : null}
        <StyledActionsRow>
          <Button
            title={t`Preview renta`}
            size="small"
            variant="secondary"
            disabled={isBusy}
            onClick={() => {
              void runAction(async () => {
                const preview = await previewParksQuotation({
                  m2Ofertados,
                  precioPorM2Usd: precioPorM2,
                });
                setRentaPreview(preview.rentaMensualCalculada);
              }, t`Renta calculada`);
            }}
          />
          <Button
            title={t`Enviar cotización`}
            size="small"
            disabled={isBusy}
            onClick={() => {
              void runAction(async () => {
                const result = await sendParksQuotation(opportunity.id, {
                  m2Ofertados,
                  precioPorM2Usd: precioPorM2,
                  companyName,
                });
                setRentaPreview(result.rentaMensualCalculada);
              }, t`Cotización enviada · seguimiento 5 días hábiles`);
            }}
          />
        </StyledActionsRow>
      </WorkflowSubsection>

      <WorkflowSubsection
        title={t`Aprobación condiciones especiales`}
        icon={IconCheck}
      >
        <ParksFormField
          label={t`Condiciones propuestas`}
          hint={t`Descuentos, plazos, mejoras — requiere aprobación CEM`}
          fullWidth
        >
          <StyledParksTextarea
            placeholder={t`Ej. 3% descuento año 1, 2 meses de gracia...`}
            value={condicionesPropuestas}
            onChange={(event) => setCondicionesPropuestas(event.target.value)}
          />
        </ParksFormField>
        <StyledActionsRow>
          <Button
            title={t`Solicitar aprobación`}
            size="small"
            disabled={isBusy || !condicionesPropuestas.trim()}
            onClick={() => {
              void runAction(async () => {
                await requestParksApproval({
                  opportunityId: opportunity.id,
                  companyName,
                  condicionesPropuestas,
                  descuentoPct: 3,
                });
              }, t`Aprobación solicitada al CEM`);
            }}
          />
          <Button
            title={t`Aprobar (CEM)`}
            size="small"
            variant="secondary"
            disabled={isBusy}
            onClick={() => {
              void runAction(async () => {
                await resolveParksApproval({
                  opportunityId: opportunity.id,
                  decision: 'Aprobada',
                  comentario: 'Aprobado en demo',
                  resolvedBy: 'Héctor Montelongo',
                });
              }, t`Aprobación concedida`);
            }}
          />
        </StyledActionsRow>
      </WorkflowSubsection>

      <WorkflowSubsection title={t`Hoja de Acuerdos`} icon={IconFileText}>
        <StyledActionsRow>
          <Button
            title={t`Generar Hoja`}
            size="small"
            disabled={isBusy}
            onClick={() => {
              void runAction(async () => {
                const result = await createParksHojaAcuerdos({
                  opportunityId: opportunity.id,
                  ejecutivoAsignado: 'LO demo',
                });
                setHojaId(result.hojaId);
              }, t`Hoja creada (borrador)`);
            }}
          />
          <Button
            title={t`Firmar CEM + cliente`}
            size="small"
            variant="secondary"
            disabled={isBusy || !hojaId}
            onClick={() => {
              if (!hojaId) {
                return;
              }

              void runAction(async () => {
                await signParksHojaAcuerdos(hojaId, {
                  opportunityId: opportunity.id,
                  firmadaPorCem: true,
                  firmadaPorCliente: true,
                  fechaFirma: new Date().toISOString().slice(0, 10),
                });
              }, t`Hoja firmada · lista para Legal (handoff off)`);
            }}
          />
        </StyledActionsRow>
      </WorkflowSubsection>

      <WorkflowSubsection title={t`Marcar como perdida`} icon={IconX}>
        <StyledParksFieldGrid>
          <ParksFormField label={t`Motivo`} htmlFor="motivo-perdida">
            <StyledParksSelect
              id="motivo-perdida"
              value={motivoPerdida}
              onChange={(event) => setMotivoPerdida(event.target.value)}
            >
              <option value="Competencia">{t`Competencia`}</option>
              <option value="Pospuesto">{t`Pospuesto`}</option>
              <option value="Sin disponibilidad">{t`Sin disponibilidad`}</option>
              <option value="No calificado">{t`No calificado`}</option>
              <option value="Otro">{t`Otro`}</option>
            </StyledParksSelect>
          </ParksFormField>
          {motivoPerdida === 'Competencia' ? (
            <ParksFormField label={t`Competidor`} htmlFor="competidor">
              <StyledParksSelect
                id="competidor"
                value={competidor}
                onChange={(event) => setCompetidor(event.target.value)}
              >
                <option value="Prologis">Prologis</option>
                <option value="Vesta">Vesta</option>
                <option value="Finsa">Finsa</option>
                <option value="Vynmsa">Vynmsa</option>
                <option value="American Industries">American Industries</option>
                <option value="Otro">Otro</option>
              </StyledParksSelect>
            </ParksFormField>
          ) : null}
          {motivoPerdida === 'Pospuesto' ? (
            <ParksFormField
              label={t`Fecha de reactivación`}
              htmlFor="fecha-reactivacion"
            >
              <StyledParksInput
                id="fecha-reactivacion"
                type="date"
                value={fechaReactivacion}
                onChange={(event) => setFechaReactivacion(event.target.value)}
              />
            </ParksFormField>
          ) : null}
        </StyledParksFieldGrid>
        <StyledActionsRow>
          <Button
            title={t`Registrar pérdida`}
            size="small"
            variant="secondary"
            disabled={isBusy}
            onClick={() => {
              void runAction(async () => {
                await markParksOpportunityLost({
                  opportunityId: opportunity.id,
                  motivoPerdida,
                  competidor:
                    motivoPerdida === 'Competencia' ? competidor : undefined,
                  fechaReactivacion:
                    motivoPerdida === 'Pospuesto'
                      ? fechaReactivacion
                      : undefined,
                  companyName,
                });
              }, t`Oportunidad marcada como perdida`);
            }}
          />
        </StyledActionsRow>
      </WorkflowSubsection>

      {statusMessage ? (
        <StyledResultBanner>{statusMessage}</StyledResultBanner>
      ) : null}
      {errorMessage ? (
        <StyledResultBanner isError>{errorMessage}</StyledResultBanner>
      ) : null}
    </ParksToolSection>
  );
};
