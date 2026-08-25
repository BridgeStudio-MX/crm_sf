import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconRefresh, IconSparkles } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksDetailField } from '@/parks-industrial/components/ui/ParksDetailField';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksProgressBar } from '@/parks-industrial/components/ui/ParksProgressBar';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { ParksToolSection } from '@/parks-industrial/components/ui/ParksToolSection';
import { useParksProspectEnrichment } from '@/parks-industrial/hooks/useParksProspectEnrichment';

const StyledSummary = styled.p`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledMetaGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const StyledActionsBlock = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSectionLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  display: block;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.03em;
  margin-bottom: ${themeCssVariables.spacing[2]};
  text-transform: uppercase;
`;

const StyledList = styled.ul`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledEmbeddedActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledFitScoreBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAiChipRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAiChip = styled.span`
  align-items: center;
  background: ${themeCssVariables.color.purple1};
  border: 1px solid ${themeCssVariables.color.purple4};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.color.purple11};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: 6px;
  padding: 3px 10px;
`;

const StyledFitScoreValue = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: 6px;
`;

const StyledAiHint = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

type ParksProspectEnrichmentPanelProps = {
  opportunityId: string;
  companyName: string;
  m2Requeridos?: number;
  autoLoad?: boolean;
  embedded?: boolean;
};

export const ParksProspectEnrichmentPanel = ({
  opportunityId,
  companyName,
  m2Requeridos,
  autoLoad = true,
  embedded = false,
}: ParksProspectEnrichmentPanelProps) => {
  const { enrichment, loading, error, loadEnrichment } =
    useParksProspectEnrichment({
      opportunityId,
      companyName,
      m2Requeridos,
      autoLoad,
    });

  return (
    <ParksToolSection
      title={t`Análisis inteligente de prospecto`}
      icon={IconSparkles}
      variant="purple"
      embedded={embedded}
      action={
        <Button
          variant="secondary"
          Icon={IconRefresh}
          title={t`Actualizar`}
          onClick={() => void loadEnrichment()}
          disabled={loading}
        />
      }
    >
      {embedded ? (
        <StyledEmbeddedActions>
          <Button
            variant="secondary"
            Icon={IconRefresh}
            title={t`Actualizar`}
            onClick={() => void loadEnrichment()}
            disabled={loading}
          />
        </StyledEmbeddedActions>
      ) : null}

      {loading ? <ParksLoadingSkeleton variant="list" /> : null}

      {error ? <StyledError>{error}</StyledError> : null}

      {!loading && enrichment ? (
        <>
          <StyledSummary>{enrichment.summary}</StyledSummary>

          <ParksDetailField
            label={t`Fit score`}
            icon={IconSparkles}
            accent="purple"
            value={
              <StyledFitScoreBlock>
                <StyledAiChipRow>
                  <StyledAiChip>
                    <IconSparkles size={14} />
                    {t`IA`}
                  </StyledAiChip>
                  <StyledFitScoreValue>
                    <IconSparkles size={16} />
                    {`${enrichment.fitScore}/100`}
                  </StyledFitScoreValue>
                </StyledAiChipRow>
                <ParksProgressBar
                  label={t`Fit score IA`}
                  valueLabel={`${enrichment.fitScore}/100`}
                  percentage={enrichment.fitScore}
                />
                <StyledAiHint>
                  {t`Calificación generada por análisis de IA del prospecto, mercado y empresa.`}
                </StyledAiHint>
              </StyledFitScoreBlock>
            }
          />

          <StyledMetaGrid>
            <ParksDetailField
              label={t`Industria`}
              accent="blue"
              value={enrichment.industry}
            />
            <ParksDetailField
              label={t`Empleados`}
              value={enrichment.employeeCountEstimate}
            />
            <ParksDetailField
              label={t`Ingresos est.`}
              value={enrichment.revenueEstimateUsd}
            />
            <ParksDetailField
              label={t`Urgencia`}
              accent={
                enrichment.urgency === 'alta'
                  ? 'yellow'
                  : enrichment.urgency === 'media'
                    ? 'default'
                    : 'default'
              }
              value={
                <ParksStatusBadge
                  color={
                    enrichment.urgency === 'alta'
                      ? 'red'
                      : enrichment.urgency === 'media'
                        ? 'yellow'
                        : 'gray'
                  }
                  label={enrichment.urgency}
                />
              }
            />
          </StyledMetaGrid>

          <StyledActionsBlock>
            <StyledSectionLabel>{t`Acciones sugeridas`}</StyledSectionLabel>
            <StyledList>
              {enrichment.suggestedActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </StyledList>
          </StyledActionsBlock>

          {enrichment.investmentSignals.length > 0 ? (
            <StyledActionsBlock>
              <StyledSectionLabel>{t`Señales de mercado / inversión`}</StyledSectionLabel>
              <StyledList>
                {enrichment.investmentSignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </StyledList>
            </StyledActionsBlock>
          ) : null}

          {enrichment.linkedInSignals.length > 0 ? (
            <StyledActionsBlock>
              <StyledSectionLabel>{t`Señales de la empresa`}</StyledSectionLabel>
              <StyledList>
                {enrichment.linkedInSignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </StyledList>
            </StyledActionsBlock>
          ) : null}

          {enrichment.usedLlm ? (
            <ParksStatusBadge color="green" label={t`OpenAI`} />
          ) : (
            <ParksStatusBadge color="blue" label={t`Demo mock`} />
          )}
        </>
      ) : null}
    </ParksToolSection>
  );
};
