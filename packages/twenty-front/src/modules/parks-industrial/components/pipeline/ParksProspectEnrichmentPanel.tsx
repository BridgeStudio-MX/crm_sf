import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconRefresh, IconSparkles } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksProgressBar } from '@/parks-industrial/components/ui/ParksProgressBar';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { useParksProspectEnrichment } from '@/parks-industrial/hooks/useParksProspectEnrichment';

const StyledPanel = styled.div`
  background: linear-gradient(
    180deg,
    ${themeCssVariables.color.purple1} 0%,
    ${themeCssVariables.background.primary} 100%
  );
  border: 1px solid ${themeCssVariables.color.purple3};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSummary = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
`;

const StyledMetaGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const StyledMetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledMetaLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  text-transform: uppercase;
`;

const StyledMetaValue = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledList = styled.ul`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

type ParksProspectEnrichmentPanelProps = {
  opportunityId: string;
  companyName: string;
  m2Requeridos?: number;
  autoLoad?: boolean;
};

export const ParksProspectEnrichmentPanel = ({
  opportunityId,
  companyName,
  m2Requeridos,
  autoLoad = true,
}: ParksProspectEnrichmentPanelProps) => {
  const { enrichment, loading, error, loadEnrichment } =
    useParksProspectEnrichment({
      opportunityId,
      companyName,
      m2Requeridos,
      autoLoad,
    });

  return (
    <StyledPanel>
      <StyledHeader>
        <StyledTitle>
          <IconSparkles size={16} />
          {t`Enriquecimiento IA`}
        </StyledTitle>
        <Button
          variant="secondary"
          Icon={IconRefresh}
          title={t`Actualizar`}
          onClick={() => void loadEnrichment()}
          disabled={loading}
        />
      </StyledHeader>

      {loading ? <ParksLoadingSkeleton variant="list" /> : null}

      {error ? <StyledError>{error}</StyledError> : null}

      {!loading && enrichment ? (
        <>
          <StyledSummary>{enrichment.summary}</StyledSummary>

          <div>
            <StyledMetaLabel>{t`Fit score`}</StyledMetaLabel>
            <ParksProgressBar
              label={t`Fit score`}
              valueLabel={`${enrichment.fitScore}/100`}
              percentage={enrichment.fitScore}
            />
          </div>

          <StyledMetaGrid>
            <StyledMetaItem>
              <StyledMetaLabel>{t`Industria`}</StyledMetaLabel>
              <StyledMetaValue>{enrichment.industry}</StyledMetaValue>
            </StyledMetaItem>
            <StyledMetaItem>
              <StyledMetaLabel>{t`Empleados`}</StyledMetaLabel>
              <StyledMetaValue>
                {enrichment.employeeCountEstimate}
              </StyledMetaValue>
            </StyledMetaItem>
            <StyledMetaItem>
              <StyledMetaLabel>{t`Ingresos est.`}</StyledMetaLabel>
              <StyledMetaValue>{enrichment.revenueEstimateUsd}</StyledMetaValue>
            </StyledMetaItem>
            <StyledMetaItem>
              <StyledMetaLabel>{t`Urgencia`}</StyledMetaLabel>
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
            </StyledMetaItem>
          </StyledMetaGrid>

          <div>
            <StyledMetaLabel>{t`Acciones sugeridas`}</StyledMetaLabel>
            <StyledList>
              {enrichment.suggestedActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </StyledList>
          </div>

          {enrichment.usedLlm ? (
            <ParksStatusBadge color="green" label={t`OpenAI`} />
          ) : (
            <ParksStatusBadge color="blue" label={t`Demo mock`} />
          )}
        </>
      ) : null}
    </StyledPanel>
  );
};
