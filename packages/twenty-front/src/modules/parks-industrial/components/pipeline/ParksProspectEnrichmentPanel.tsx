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
      title={t`Enriquecimiento IA`}
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
            accent="purple"
            value={
              <ParksProgressBar
                label={t`Fit score`}
                valueLabel={`${enrichment.fitScore}/100`}
                percentage={enrichment.fitScore}
              />
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
