import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { IconCheck, IconCircle } from 'twenty-ui/icon';
import { Button, ButtonGroup } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  buildParksApprovalNotas,
  buildParksApprovalTimeline,
  getNextParksApprovalStage,
  parseParksApprovalStage,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksCasoLegalRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksDocumentValidationPanel } from '@/parks-industrial/components/legal/ParksDocumentValidationPanel';
import { ParksCxcHandoffPanel } from '@/parks-industrial/components/operations/ParksCxcHandoffPanel';
import { ParksContractEditorPanel } from '@/parks-industrial/components/legal/ParksContractEditorPanel';
import { ParksAiQuickActions } from '@/parks-industrial/components/ai/ParksAiQuickActions';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { useParksAiAssistant } from '@/parks-industrial/hooks/useParksAiAssistant';
import { buildParksApprovalQuickActions } from '@/parks-industrial/utils/parks-ai-quick-actions.util';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  appendParksApprovalComment,
  formatParksDate,
  formatParksNumber,
  formatParksUsd,
  parseParksApprovalComments,
} from '@/parks-industrial/utils/parks-format.util';
import { type DocumentValidationResult } from '@/parks-industrial/types/parks-legal.types';

const StyledLayout = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const StyledMainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledTimeline = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledTimelineItem = styled.li`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledNode = styled.div<{ status: string }>`
  align-items: center;
  animation: ${({ status }) =>
    status === 'active' ? 'parksApprovalPulse 1.8s ease-in-out infinite' : 'none'};
  background: ${({ status }) =>
    status === 'completed'
      ? themeCssVariables.color.green
      : status === 'active'
        ? themeCssVariables.color.blue
        : themeCssVariables.background.tertiary};
  border: 2px solid
    ${({ status }) =>
      status === 'pending'
        ? themeCssVariables.border.color.medium
        : 'transparent'};
  border-radius: 50%;
  color: ${({ status }) =>
    status === 'pending'
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.inverted};
  display: flex;
  flex-shrink: 0;
  height: 32px;
  justify-content: center;
  width: 32px;

  @keyframes parksApprovalPulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 ${themeCssVariables.color.blue3};
    }

    50% {
      box-shadow: 0 0 0 8px transparent;
    }
  }
`;

const StyledStageTitle = styled.div`
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledStageMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledTextarea = styled.textarea`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[2]};
  min-height: 80px;
  padding: ${themeCssVariables.spacing[2]};
  resize: vertical;
  width: 100%;
`;

const StyledSummaryRow = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: space-between;
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledOracleNotice = styled.div`
  background: ${themeCssVariables.color.yellow1};
  border: 1px solid ${themeCssVariables.color.yellow3};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  margin-top: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledCommentHistory = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledCommentItem = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]};
`;

const mapValidationToSemaforo = (
  result: DocumentValidationResult,
): string => {
  if (result.overallStatus === 'green') {
    return 'VERDE';
  }

  if (result.overallStatus === 'yellow') {
    return 'AMARILLO';
  }

  return 'ROJO';
};

type ParksApprovalTimelineProps = {
  casoLegal: ParksCasoLegalRecord;
};

export const ParksApprovalTimeline = ({
  casoLegal,
}: ParksApprovalTimelineProps) => {
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateOneRecord } = useUpdateOneRecord();
  const { setContextPatch } = useParksAiAssistant();

  useEffect(() => {
    setContextPatch({
      screen: 'approval',
      casoLegalId: casoLegal.id,
    });
  }, [casoLegal.id, setContextPatch]);

  const currentStage = parseParksApprovalStage(casoLegal.notasCatalina);
  const timeline = buildParksApprovalTimeline(
    currentStage,
    casoLegal.notasCatalina ?? undefined,
  );
  const commentHistory = parseParksApprovalComments(casoLegal.notasCatalina);
  const hoja = casoLegal.hojaDeAcuerdos;
  const rentaEstimada =
    (hoja?.m2Acordados ?? 0) * (hoja?.precioUsdM2 ?? 0);

  const getSemaforoColor = (): 'red' | 'yellow' | 'green' | 'gray' => {
    if (casoLegal.semaforo === 'ROJO') {
      return 'red';
    }

    if (casoLegal.semaforo === 'AMARILLO') {
      return 'yellow';
    }

    if (casoLegal.semaforo === 'VERDE') {
      return 'green';
    }

    return 'gray';
  };

  const handleApprove = async () => {
    const nextStage = getNextParksApprovalStage(currentStage);

    if (!nextStage) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateOneRecord({
        objectNameSingular: 'casoLegal',
        idToUpdate: casoLegal.id,
        updateOneRecordInput: {
          notasCatalina: buildParksApprovalNotas(nextStage, comentario),
          estatus: nextStage === 'firma' ? 'APROBADO' : 'EN_REVISION',
        },
      });
      setComentario('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (comentario.trim().length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateOneRecord({
        objectNameSingular: 'casoLegal',
        idToUpdate: casoLegal.id,
        updateOneRecordInput: {
          notasCatalina: appendParksApprovalComment(
            casoLegal.notasCatalina,
            `[RECHAZO] ${comentario.trim()}`,
          ),
          estatus: 'EN_REVISION',
          semaforo: 'ROJO',
        },
      });
      setComentario('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidationComplete = async (result: DocumentValidationResult) => {
    await updateOneRecord({
      objectNameSingular: 'casoLegal',
      idToUpdate: casoLegal.id,
      updateOneRecordInput: {
        semaforo: mapValidationToSemaforo(result),
      },
    });
  };

  return (
    <StyledLayout>
      <StyledMainColumn>
        <ParksAiQuickActions actions={buildParksApprovalQuickActions()} />
        <ParksSectionCard title={t`Flujo de aprobación`}>
          <StyledTimeline>
            {timeline.map((stage) => (
              <StyledTimelineItem key={stage.id}>
                <StyledNode status={stage.status}>
                  {stage.status === 'completed' ? (
                    <IconCheck size={16} />
                  ) : (
                    <IconCircle size={14} />
                  )}
                </StyledNode>
                <div style={{ flex: 1 }}>
                  <StyledStageTitle>{stage.label}</StyledStageTitle>
                  <StyledStageMeta>
                    {t`Responsable`}: {stage.responsable}
                  </StyledStageMeta>
                  {stage.id === 'oracle' &&
                  (stage.status === 'active' || stage.status === 'pending') ? (
                    <StyledOracleNotice>
                      {t`Integración Oracle ERP en configuración. Esta etapa mostrará el estatus de alta del cliente y contrato en el ERP cuando TI Parks active el conector.`}
                    </StyledOracleNotice>
                  ) : null}
                  {stage.status === 'active' && stage.id !== 'oracle' ? (
                    <>
                      <ParksStatusBadge color="blue" label={t`Etapa actual`} />
                      <StyledTextarea
                        value={comentario}
                        onChange={(event) => setComentario(event.target.value)}
                        placeholder={t`Comentarios de aprobación o motivo de rechazo...`}
                        rows={3}
                      />
                    </>
                  ) : stage.status === 'active' && stage.id === 'oracle' ? (
                    <ParksStatusBadge
                      color="yellow"
                      label={t`Pendiente de integración`}
                    />
                  ) : null}
                </div>
              </StyledTimelineItem>
            ))}
          </StyledTimeline>

          {getNextParksApprovalStage(currentStage) ? (
            <ButtonGroup>
              <Button
                title={t`Aprobar etapa`}
                onClick={() => void handleApprove()}
                disabled={isSubmitting}
              />
              <Button
                title={t`Rechazar`}
                variant="secondary"
                accent="danger"
                onClick={() => void handleReject()}
                disabled={isSubmitting || comentario.trim().length === 0}
              />
            </ButtonGroup>
          ) : (
            <ParksStatusBadge color="green" label={t`Contrato aprobado`} />
          )}
        </ParksSectionCard>

        {commentHistory.length > 0 ? (
          <ParksSectionCard title={t`Historial de comentarios`}>
            <StyledCommentHistory>
              {commentHistory.map((comment, index) => (
                <StyledCommentItem key={`${comment}-${index}`}>
                  {comment}
                </StyledCommentItem>
              ))}
            </StyledCommentHistory>
          </ParksSectionCard>
        ) : null}

        <ParksDocumentValidationPanel
          casoLegalId={casoLegal.id}
          onValidationComplete={(result) => void handleValidationComplete(result)}
        />
      </StyledMainColumn>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ParksCxcHandoffPanel
          casoLegalId={casoLegal.id}
          referencia={casoLegal.referencia}
        />
        <ParksContractEditorPanel casoLegalId={casoLegal.id} />
        <ParksSectionCard title={t`Resumen del contrato`}>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <strong>{casoLegal.referencia}</strong>
            <ParksStatusBadge
              color={getSemaforoColor()}
              label={casoLegal.semaforo ?? t`Sin semáforo`}
            />
          </div>
          <StyledSummaryRow>
            <span>{t`Inquilino`}</span>
            <span>{casoLegal.inquilino?.empresa ?? '—'}</span>
          </StyledSummaryRow>
          <StyledSummaryRow>
            <span>{t`Nave`}</span>
            <span>{casoLegal.nave?.identificador ?? '—'}</span>
          </StyledSummaryRow>
          <StyledSummaryRow>
            <span>{t`m² acordados`}</span>
            <span>{formatParksNumber(hoja?.m2Acordados)}</span>
          </StyledSummaryRow>
          <StyledSummaryRow>
            <span>{t`Precio USD/m²`}</span>
            <span>{formatParksUsd(hoja?.precioUsdM2)}</span>
          </StyledSummaryRow>
          <StyledSummaryRow>
            <span>{t`Plazo`}</span>
            <span>
              {hoja?.plazoMeses ? `${hoja.plazoMeses} ${t`meses`}` : '—'}
            </span>
          </StyledSummaryRow>
          <StyledSummaryRow>
            <span>{t`Renta mensual estimada`}</span>
            <span>{formatParksUsd(rentaEstimada)}</span>
          </StyledSummaryRow>
          <StyledSummaryRow>
            <span>{t`Inicio`}</span>
            <span>{formatParksDate(hoja?.fechaInicio)}</span>
          </StyledSummaryRow>
        </ParksSectionCard>
      </div>
    </StyledLayout>
  );
};
