import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import {
  IconCopy,
  IconEye,
  IconFileText,
  IconMail,
  IconMap,
  IconMessage,
  IconRefresh,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksFormField } from '@/parks-industrial/components/ui/ParksFormField';
import {
  StyledParksLinkValue,
  StyledParksReadOnlyValue,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksProgressBar } from '@/parks-industrial/components/ui/ParksProgressBar';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { ParksToolSection } from '@/parks-industrial/components/ui/ParksToolSection';
import {
  createParksFichaTecnica,
  fetchCachedProspectEnrichment,
  generateParksSalesScript,
  markParksFichaSent,
  matchParksNaves,
  simulateParksFichaView,
} from '@/parks-industrial/services/parks-commercial.client';
import {
  type FichaTecnicaLink,
  type NaveMatchCandidate,
  type SalesScriptResult,
} from '@/parks-industrial/types/parks-commercial.types';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';

const StyledMatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledMatchCard = styled.button<{ isSelected: boolean }>`
  background: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.color.blue1
      : themeCssVariables.background.secondary};
  border: 1px solid
    ${({ isSelected }) =>
      isSelected
        ? themeCssVariables.color.blue3
        : themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
  width: 100%;

  &:hover {
    border-color: ${themeCssVariables.color.blue3};
  }
`;

const StyledMatchHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledMatchTitle = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMatchMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledMatchReason = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.35;
`;

const StyledActionGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const StyledScriptBlock = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledScriptTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledList = styled.ul`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: ${themeCssVariables.spacing[1]} 0 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledEmptyHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

type ParksCommercialProposalSectionProps = {
  opportunityId: string;
  companyName: string;
  m2Requeridos?: number;
  industry?: string;
};

export const ParksCommercialProposalSection = ({
  opportunityId,
  companyName,
  m2Requeridos,
  industry,
}: ParksCommercialProposalSectionProps) => {
  const [matches, setMatches] = useState<NaveMatchCandidate[]>([]);
  const [selectedMatch, setSelectedMatch] =
    useState<NaveMatchCandidate | null>(null);
  const [fichaLink, setFichaLink] = useState<FichaTecnicaLink | null>(null);
  const [salesScript, setSalesScript] = useState<SalesScriptResult | null>(
    null,
  );
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingFicha, setLoadingFicha] = useState(false);
  const [loadingScript, setLoadingScript] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [resolvedIndustry, setResolvedIndustry] = useState(industry);

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

  const loadMatches = useCallback(async () => {
    if (!m2Requeridos || m2Requeridos <= 0) {
      return;
    }

    setLoadingMatches(true);
    setError(null);

    try {
      const result = await matchParksNaves({
        opportunityId,
        m2Requeridos,
        industry: resolvedIndustry,
      });
      setMatches(result.matches);
      setSelectedMatch(result.matches[0] ?? null);
    } catch (matchError) {
      const message =
        matchError instanceof Error
          ? matchError.message
          : 'No se pudo cargar matching';
      setError(message);
    } finally {
      setLoadingMatches(false);
    }
  }, [m2Requeridos, opportunityId, resolvedIndustry]);

  const loadSalesScript = useCallback(async () => {
    setLoadingScript(true);

    try {
      const script = await generateParksSalesScript({
        opportunityId,
        companyName,
        industry: resolvedIndustry,
        m2Requeridos,
        naveDestacada: selectedMatch?.identificador,
      });
      setSalesScript(script);
    } catch (scriptError) {
      const message =
        scriptError instanceof Error
          ? scriptError.message
          : 'No se pudo generar el guion';
      setError(message);
    } finally {
      setLoadingScript(false);
    }
  }, [
    companyName,
    resolvedIndustry,
    m2Requeridos,
    opportunityId,
    selectedMatch?.identificador,
  ]);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  useEffect(() => {
    if (selectedMatch) {
      void loadSalesScript();
    }
  }, [loadSalesScript, selectedMatch]);

  const handleCreateFicha = async () => {
    if (!selectedMatch) {
      return;
    }

    setLoadingFicha(true);
    setError(null);

    try {
      const link = await createParksFichaTecnica({
        opportunityId,
        opportunityName: companyName,
        naveId: selectedMatch.naveId,
        naveIdentificador: selectedMatch.identificador,
        parqueNombre: selectedMatch.parqueNombre,
        ubicacion: selectedMatch.ubicacion,
        m2: selectedMatch.m2,
        precioUsdM2: selectedMatch.precioUsdM2,
      });
      setFichaLink(link);
    } catch (fichaError) {
      const message =
        fichaError instanceof Error
          ? fichaError.message
          : 'No se pudo generar la ficha';
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

  const handleSimulateView = async () => {
    if (!fichaLink) {
      return;
    }

    const updatedLink = await simulateParksFichaView(fichaLink.token);
    setFichaLink(updatedLink);
    setCopyMessage(t`Vista simulada — revisa Notificaciones`);
  };

  if (!m2Requeridos || m2Requeridos <= 0) {
    return (
      <ParksToolSection title={t`Matching IA de naves`} icon={IconMap}>
        <StyledEmptyHint>
          {t`Registra m² requeridos en el deal para activar matching de naves.`}
        </StyledEmptyHint>
      </ParksToolSection>
    );
  }

  return (
    <>
      <ParksToolSection
        title={t`Matching IA de naves`}
        icon={IconMap}
        hint={t`Selecciona la nave con mejor fit para generar ficha y guion`}
        action={
          <Button
            variant="secondary"
            Icon={IconRefresh}
            title={t`Actualizar`}
            onClick={() => void loadMatches()}
            disabled={loadingMatches}
          />
        }
      >
        {loadingMatches ? <ParksLoadingSkeleton variant="list" /> : null}

        {!loadingMatches && matches.length === 0 ? (
          <StyledEmptyHint>
            {t`Sin naves disponibles para este criterio.`}
          </StyledEmptyHint>
        ) : null}

        <StyledMatchList>
          {matches.map((match) => (
            <StyledMatchCard
              key={match.naveId}
              type="button"
              isSelected={selectedMatch?.naveId === match.naveId}
              onClick={() => setSelectedMatch(match)}
            >
              <StyledMatchHeader>
                <StyledMatchTitle>{match.identificador}</StyledMatchTitle>
                <ParksStatusBadge
                  color="blue"
                  label={`${match.matchScore}%`}
                />
              </StyledMatchHeader>
              <StyledMatchMeta>
                {formatParksNumber(match.m2)} m² ·{' '}
                {match.parqueNombre ?? t`Parque`} · {match.ubicacion ?? '—'}
              </StyledMatchMeta>
              <ParksProgressBar
                label={t`Match`}
                valueLabel={`${match.matchScore}%`}
                percentage={match.matchScore}
              />
              <StyledMatchReason>
                {match.matchReasons.join(' · ')}
              </StyledMatchReason>
            </StyledMatchCard>
          ))}
        </StyledMatchList>
      </ParksToolSection>

      {selectedMatch ? (
        <ParksToolSection
          title={t`Ficha técnica + link tracker`}
          icon={IconFileText}
          hint={t`Genera el link público y registra envíos por email o WhatsApp`}
        >
          <StyledActionGrid>
            <Button
              variant="primary"
              title={t`Generar ficha y link`}
              onClick={() => void handleCreateFicha()}
              disabled={loadingFicha}
            />
            {fichaLink ? (
              <>
                <Button
                  variant="secondary"
                  Icon={IconCopy}
                  title={t`Copiar link`}
                  onClick={() => void handleCopyLink()}
                />
                <Button
                  variant="secondary"
                  Icon={IconMail}
                  title={t`Marcar enviado email`}
                  onClick={() =>
                    void markParksFichaSent({
                      token: fichaLink.token,
                      sentVia: 'email',
                    }).then(setFichaLink)
                  }
                />
                <Button
                  variant="secondary"
                  Icon={IconMessage}
                  title={t`Marcar enviado WhatsApp`}
                  onClick={() =>
                    void markParksFichaSent({
                      token: fichaLink.token,
                      sentVia: 'whatsapp',
                    }).then(setFichaLink)
                  }
                />
                <Button
                  variant="secondary"
                  accent="blue"
                  Icon={IconEye}
                  title={t`Simular apertura prospecto`}
                  onClick={() => void handleSimulateView()}
                />
              </>
            ) : null}
          </StyledActionGrid>

          {fichaLink ? (
            <>
              <ParksFormField label={t`Link público`} hint={t`Comparte con el prospecto`}>
                <StyledParksLinkValue title={fichaLink.publicUrl}>
                  {fichaLink.publicUrl}
                </StyledParksLinkValue>
              </ParksFormField>
              <ParksFormField label={t`Estado del tracker`}>
                <StyledParksReadOnlyValue>
                  {t`Vistas:`} {fichaLink.viewCount}
                  {fichaLink.sentVia
                    ? ` · ${t`Enviado por`} ${fichaLink.sentVia}`
                    : ''}
                </StyledParksReadOnlyValue>
              </ParksFormField>
            </>
          ) : null}

          {copyMessage ? (
            <ParksStatusBadge color="green" label={copyMessage} />
          ) : null}
        </ParksToolSection>
      ) : null}

      <ParksToolSection
        title={t`Guion comercial`}
        icon={IconFileText}
        hint={t`Generado con contexto del prospecto y nave seleccionada`}
        action={
          <Button
            variant="secondary"
            Icon={IconRefresh}
            title={t`Regenerar`}
            onClick={() => void loadSalesScript()}
            disabled={loadingScript}
          />
        }
      >
        {loadingScript ? <ParksLoadingSkeleton variant="list" /> : null}

        {salesScript ? (
          <>
            <StyledScriptTitle>{salesScript.scriptTitle}</StyledScriptTitle>
            <StyledScriptBlock>{salesScript.openingLine}</StyledScriptBlock>
            <StyledScriptBlock>
              <strong>{t`Preguntas de descubrimiento`}</strong>
              <StyledList>
                {salesScript.discoveryQuestions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </StyledList>
            </StyledScriptBlock>
            <StyledScriptBlock>{salesScript.valueProposition}</StyledScriptBlock>
            <StyledScriptBlock>
              <strong>{t`Agenda de visita`}</strong>
              <StyledList>
                {salesScript.visitAgenda.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </StyledList>
            </StyledScriptBlock>
            <StyledScriptBlock>{salesScript.closingLine}</StyledScriptBlock>
            <ParksStatusBadge
              color={salesScript.usedLlm ? 'green' : 'blue'}
              label={salesScript.usedLlm ? t`OpenAI` : t`Demo mock`}
            />
          </>
        ) : null}
      </ParksToolSection>

      {error ? <StyledError>{error}</StyledError> : null}
    </>
  );
};
