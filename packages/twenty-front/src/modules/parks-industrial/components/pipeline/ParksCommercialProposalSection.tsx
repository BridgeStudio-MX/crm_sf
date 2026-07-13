import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import {
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconFileText,
  IconShare,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksComposerPanel } from '@/parks-industrial/components/pipeline/ParksComposerPanel';
import { ParksNaveMatchPanel } from '@/parks-industrial/components/pipeline/ParksNaveMatchPanel';
import { ParksTourSchedulePanel } from '@/parks-industrial/components/pipeline/ParksTourSchedulePanel';
import { ParksFormField } from '@/parks-industrial/components/ui/ParksFormField';
import { StyledParksLinkValue } from '@/parks-industrial/components/ui/parks-form-control.styles';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { ParksToolSection } from '@/parks-industrial/components/ui/ParksToolSection';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import {
  createParksFichaTecnica,
  fetchCachedProspectEnrichment,
  markParksFichaSent,
} from '@/parks-industrial/services/parks-commercial.client';
import { type FichaTecnicaLink } from '@/parks-industrial/types/parks-commercial.types';
import {
  formatParksTourNavesLabel,
  parseParksTourNavesMostradas,
} from '@/parks-industrial/utils/parks-tour-naves.util';

const StyledStepRail = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledStepPill = styled.button<{ isActive: boolean; isDone: boolean }>`
  background: ${({ isActive, isDone }) => {
    if (isActive) {
      return themeCssVariables.color.blue1;
    }

    if (isDone) {
      return themeCssVariables.color.green1;
    }

    return themeCssVariables.background.secondary;
  }};
  border: 1px solid
    ${({ isActive, isDone }) => {
      if (isActive) {
        return themeCssVariables.color.blue;
      }

      if (isDone) {
        return themeCssVariables.color.green;
      }

      return themeCssVariables.border.color.light;
    }};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  flex: 1;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[2]};
  text-align: left;
`;

const StyledSummary = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSummaryTitle = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledSummaryMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledMaterialsActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

type ProposalStep = 'naves' | 'agendar' | 'listo';

type ParksCommercialProposalSectionProps = {
  opportunityId: string;
  companyName: string;
  m2Requeridos?: number;
  industry?: string;
  inquilinoId?: string;
  linkedNaveId?: string | null;
  linkedNaveIdentificador?: string | null;
  tourNavesMostradas?: string | null;
  tourFecha?: string | null;
  onNaveLinked?: (update: Partial<ParksOpportunityRecord>) => void;
  onTourScheduled?: (update: Partial<ParksOpportunityRecord>) => void;
};

export const ParksCommercialProposalSection = ({
  opportunityId,
  companyName,
  m2Requeridos,
  industry,
  inquilinoId,
  linkedNaveId,
  linkedNaveIdentificador,
  tourNavesMostradas,
  tourFecha,
  onNaveLinked,
  onTourScheduled,
}: ParksCommercialProposalSectionProps) => {
  const hasSavedNaves = Boolean(tourNavesMostradas || linkedNaveId);
  const hasScheduledTour = Boolean(tourFecha);

  const [step, setStep] = useState<ProposalStep>(() => {
    if (hasScheduledTour) {
      return 'listo';
    }

    if (hasSavedNaves) {
      return 'agendar';
    }

    return 'naves';
  });
  const [showMaterials, setShowMaterials] = useState(false);
  const [fichaLink, setFichaLink] = useState<FichaTecnicaLink | null>(null);
  const [loadingFicha, setLoadingFicha] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [resolvedIndustry, setResolvedIndustry] = useState(industry);
  const [tourNavesDraft, setTourNavesDraft] = useState(tourNavesMostradas);
  const [primaryNaveId, setPrimaryNaveId] = useState(linkedNaveId);
  const [primaryNaveIdentificador, setPrimaryNaveIdentificador] = useState(
    linkedNaveIdentificador,
  );
  const [tourFechaDraft, setTourFechaDraft] = useState(tourFecha);

  useEffect(() => {
    setPrimaryNaveId(linkedNaveId);
    setPrimaryNaveIdentificador(linkedNaveIdentificador);
    setTourNavesDraft(tourNavesMostradas);
    setTourFechaDraft(tourFecha);
  }, [
    linkedNaveId,
    linkedNaveIdentificador,
    tourNavesMostradas,
    tourFecha,
  ]);

  useEffect(() => {
    if (industry) {
      setResolvedIndustry(industry);
      return;
    }

    void fetchCachedProspectEnrichment(opportunityId).then((enrichment) => {
      if (enrichment?.industry) {
        setResolvedIndustry(enrichment.industry);
      }
    });
  }, [industry, opportunityId]);

  const navesLabel =
    formatParksTourNavesLabel(
      parseParksTourNavesMostradas(tourNavesDraft),
    ) ||
    primaryNaveIdentificador ||
    t`Sin naves`;

  const handleCreateFicha = async () => {
    if (!primaryNaveId || !primaryNaveIdentificador) {
      setError(t`Guarda primero una nave`);
      return;
    }

    setLoadingFicha(true);
    setError(null);

    try {
      const tourNaves = parseParksTourNavesMostradas(tourNavesDraft);
      const primaryTourNave =
        tourNaves.find((nave) => nave.id === primaryNaveId) ?? tourNaves[0];

      const link = await createParksFichaTecnica({
        opportunityId,
        opportunityName: companyName,
        naveId: primaryNaveId,
        naveIdentificador: primaryNaveIdentificador,
        parqueNombre: primaryTourNave?.parqueNombre,
        m2: primaryTourNave?.m2 ?? m2Requeridos ?? 0,
      });
      setFichaLink(link);
    } catch (fichaError) {
      const message =
        fichaError instanceof Error
          ? fichaError.message
          : t`No se pudo generar la ficha`;
      setError(message);
    } finally {
      setLoadingFicha(false);
    }
  };

  const handleCopyLink = async () => {
    if (!fichaLink) {
      return;
    }

    await navigator.clipboard.writeText(fichaLink.publicUrl);
    await markParksFichaSent({ token: fichaLink.token, sentVia: 'link' });
    setCopyMessage(t`Link copiado`);
  };

  return (
    <>
      <StyledStepRail>
        <StyledStepPill
          type="button"
          isActive={step === 'naves'}
          isDone={step !== 'naves' && Boolean(primaryNaveId || tourNavesDraft)}
          onClick={() => setStep('naves')}
        >
          {t`1 · Naves`}
        </StyledStepPill>
        <StyledStepPill
          type="button"
          isActive={step === 'agendar'}
          isDone={step === 'listo'}
          onClick={() => {
            if (primaryNaveId || tourNavesDraft) {
              setStep('agendar');
            }
          }}
        >
          {t`2 · Agendar`}
        </StyledStepPill>
        <StyledStepPill
          type="button"
          isActive={step === 'listo'}
          isDone={step === 'listo'}
          onClick={() => {
            if (tourFechaDraft) {
              setStep('listo');
            }
          }}
        >
          {t`3 · Listo`}
        </StyledStepPill>
      </StyledStepRail>

      {step === 'naves' ? (
        <ParksNaveMatchPanel
          opportunityId={opportunityId}
          m2Requeridos={m2Requeridos}
          industry={resolvedIndustry}
          linkedNaveId={primaryNaveId}
          tourNavesMostradas={tourNavesDraft}
          continueLabel={t`Continuar a agendar`}
          onNavesSaved={(update) => {
            setPrimaryNaveId(
              update.naveVinculadaId ?? update.naveVinculada?.id ?? null,
            );
            setPrimaryNaveIdentificador(
              update.naveVinculada?.identificador ?? null,
            );
            setTourNavesDraft(update.tourNavesMostradas ?? null);
            onNaveLinked?.(update);
            setStep('agendar');
          }}
        />
      ) : null}

      {step === 'agendar' ? (
        <ParksTourSchedulePanel
          opportunityId={opportunityId}
          companyName={companyName}
          inquilinoId={inquilinoId}
          linkedNaveIdentificador={primaryNaveIdentificador}
          tourNavesMostradas={tourNavesDraft}
          onBack={() => setStep('naves')}
          onTourScheduled={(update) => {
            setTourFechaDraft(update.tourFecha ?? null);
            onTourScheduled?.(update);
            setStep('listo');
          }}
        />
      ) : null}

      {step === 'listo' ? (
        <StyledSummary>
          <StyledSummaryTitle>{t`Visita lista`}</StyledSummaryTitle>
          <StyledSummaryMeta>
            {t`Naves:`} {navesLabel}
          </StyledSummaryMeta>
          {tourFechaDraft ? (
            <StyledSummaryMeta>
              {t`Fecha:`} {tourFechaDraft}
            </StyledSummaryMeta>
          ) : null}
          <ParksStatusBadge color="green" label={t`Etapa: Visita agendada`} />
          <StyledMaterialsActions>
            <Button
              variant="secondary"
              title={t`Editar naves`}
              onClick={() => setStep('naves')}
            />
            <Button
              variant="secondary"
              title={t`Reagendar`}
              onClick={() => setStep('agendar')}
            />
          </StyledMaterialsActions>
        </StyledSummary>
      ) : null}

      {(primaryNaveId || tourNavesDraft) && (
        <ParksToolSection
          title={t`Materiales (opcional)`}
          icon={IconShare}
          hint={t`Ficha y brochure para compartir con el prospecto`}
          action={
            <Button
              variant="secondary"
              Icon={showMaterials ? IconChevronUp : IconChevronDown}
              title={showMaterials ? t`Ocultar` : t`Mostrar`}
              onClick={() => setShowMaterials((previous) => !previous)}
            />
          }
        >
          {showMaterials ? (
            <>
              <StyledMaterialsActions>
                <Button
                  variant="primary"
                  Icon={IconFileText}
                  title={t`Generar ficha`}
                  disabled={loadingFicha || !primaryNaveId}
                  onClick={() => void handleCreateFicha()}
                />
                {fichaLink ? (
                  <Button
                    variant="secondary"
                    Icon={IconCopy}
                    title={t`Copiar link`}
                    onClick={() => void handleCopyLink()}
                  />
                ) : null}
              </StyledMaterialsActions>

              {fichaLink ? (
                <ParksFormField label={t`Link público`}>
                  <StyledParksLinkValue title={fichaLink.publicUrl}>
                    {fichaLink.publicUrl}
                  </StyledParksLinkValue>
                </ParksFormField>
              ) : null}

              {copyMessage ? (
                <ParksStatusBadge color="green" label={copyMessage} />
              ) : null}

              <ParksComposerPanel
                opportunityId={opportunityId}
                companyName={companyName}
                selectedNave={
                  primaryNaveId && primaryNaveIdentificador
                    ? {
                        naveId: primaryNaveId,
                        identificador: primaryNaveIdentificador,
                        m2: m2Requeridos ?? 0,
                        matchScore: 0,
                        matchReasons: [],
                      }
                    : undefined
                }
              />
            </>
          ) : (
            <StyledSummaryMeta>
              {t`Ábrelo cuando quieras compartir ficha o brochure.`}
            </StyledSummaryMeta>
          )}
        </ParksToolSection>
      )}

      {error ? <StyledError>{error}</StyledError> : null}
    </>
  );
};
