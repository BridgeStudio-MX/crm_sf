import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import {
  IconCopy,
  IconEye,
  IconMail,
  IconMap,
  IconMessage,
  IconRefresh,
  IconFileText,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksProgressBar } from '@/parks-industrial/components/ui/ParksProgressBar';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
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

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledPanelTitle = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

const StyledMatchCard = styled.button<{ isSelected: boolean }>`
  background: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.background.transparent.light
      : themeCssVariables.background.primary};
  border: 1px solid
    ${({ isSelected }) =>
      isSelected
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;
`;

const StyledMatchHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledMatchMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledScriptBlock = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
`;

const StyledList = styled.ul`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledLinkBox = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.xs};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[2]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
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
      <StyledPanel>
        <StyledMatchMeta>
          {t`Registra m² requeridos en el deal para activar matching de naves.`}
        </StyledMatchMeta>
      </StyledPanel>
    );
  }

  return (
    <StyledSection>
      <StyledPanel>
        <StyledPanelTitle>
          <span>
            <IconMap size={16} /> {t`Matching IA de naves`}
          </span>
          <Button
            variant="secondary"
            Icon={IconRefresh}
            title={t`Actualizar`}
            onClick={() => void loadMatches()}
            disabled={loadingMatches}
          />
        </StyledPanelTitle>

        {loadingMatches ? <ParksLoadingSkeleton variant="list" /> : null}

        {!loadingMatches && matches.length === 0 ? (
          <StyledMatchMeta>{t`Sin naves disponibles para este criterio.`}</StyledMatchMeta>
        ) : null}

        {matches.map((match) => (
          <StyledMatchCard
            key={match.naveId}
            type="button"
            isSelected={selectedMatch?.naveId === match.naveId}
            onClick={() => setSelectedMatch(match)}
          >
            <StyledMatchHeader>
              <strong>{match.identificador}</strong>
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
            <StyledMatchMeta>{match.matchReasons.join(' · ')}</StyledMatchMeta>
          </StyledMatchCard>
        ))}
      </StyledPanel>

      {selectedMatch ? (
        <StyledPanel>
          <StyledPanelTitle>
            <span>{t`Ficha técnica + link tracker`}</span>
          </StyledPanelTitle>

          <StyledActions>
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
          </StyledActions>

          {fichaLink ? (
            <>
              <StyledLinkBox>{fichaLink.publicUrl}</StyledLinkBox>
              <StyledMatchMeta>
                {t`Vistas:`} {fichaLink.viewCount}
                {fichaLink.sentVia
                  ? ` · ${t`Enviado por`} ${fichaLink.sentVia}`
                  : ''}
              </StyledMatchMeta>
            </>
          ) : null}

          {copyMessage ? (
            <ParksStatusBadge color="green" label={copyMessage} />
          ) : null}
        </StyledPanel>
      ) : null}

      <StyledPanel>
        <StyledPanelTitle>
          <span>
            <IconFileText size={16} /> {t`Guion comercial`}
          </span>
          <Button
            variant="secondary"
            Icon={IconRefresh}
            title={t`Regenerar`}
            onClick={() => void loadSalesScript()}
            disabled={loadingScript}
          />
        </StyledPanelTitle>

        {loadingScript ? <ParksLoadingSkeleton variant="list" /> : null}

        {salesScript ? (
          <>
            <strong>{salesScript.scriptTitle}</strong>
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
      </StyledPanel>

      {error ? <StyledError>{error}</StyledError> : null}
    </StyledSection>
  );
};
