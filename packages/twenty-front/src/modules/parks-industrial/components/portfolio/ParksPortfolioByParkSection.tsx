import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { IconChevronDown } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  getParksPipelineStageColor,
  getParksPipelineStageLabel,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { PARKS_BRAND, PARKS_VIBE } from '@/parks-industrial/constants/parks-theme.constants';
import { useParksParques } from '@/parks-industrial/hooks/useParksParques';
import {
  useParksNaves,
  useParksOpportunities,
} from '@/parks-industrial/hooks/useParksRecords';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';
import { getParksOcupacionMetricAccent } from '@/parks-industrial/utils/parks-portfolio-metrics.util';
import {
  buildParksPortfolioByPark,
  type ParksPortfolioLeadItem,
  type ParksPortfolioNaveItem,
  type ParksPortfolioParkRow,
} from '@/parks-industrial/utils/parks-portfolio-by-park.util';

const EMPTY_PARQUES: ReturnType<typeof useParksParques>['records'] = [];
const EMPTY_NAVES: ReturnType<typeof useParksNaves>['records'] = [];
const EMPTY_OPPORTUNITIES: ReturnType<
  typeof useParksOpportunities
>['records'] = [];

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledIntro = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0 0 ${themeCssVariables.spacing[3]} 0;
`;

const StyledParkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledChevron = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
  flex-shrink: 0;
  transition: transform 0.15s ease;
`;

const StyledParkDetails = styled.details`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${PARKS_VIBE.radiusMd};
  overflow: hidden;

  &[open] ${StyledChevron} {
    transform: rotate(180deg);
  }
`;

const StyledParkSummary = styled.summary`
  align-items: center;
  cursor: pointer;
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: minmax(0, 1.4fr) auto;
  list-style: none;
  padding: ${themeCssVariables.spacing[3]};

  &::-webkit-details-marker {
    display: none;
  }

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: minmax(0, 1.6fr) auto auto;
  }
`;

const StyledParkIdentity = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledParkCopy = styled.div`
  min-width: 0;
`;

const StyledParkName = styled.div`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledParkMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 2px;
`;

const StyledParkStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-end;
`;

const StyledParkLink = styled(Link)`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledParkBody = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[3]};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const StyledColumnTitle = styled.h4`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0 0 ${themeCssVariables.spacing[2]} 0;
`;

const StyledItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledItem = styled.div`
  background: ${PARKS_VIBE.surfaceMuted};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${PARKS_VIBE.radiusSm};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledItemHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledItemName = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledItemMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 4px;
`;

const StyledLeadLink = styled(Link)`
  color: inherit;
  text-decoration: none;

  &:hover ${StyledItemName} {
    color: ${PARKS_BRAND.primary};
  }
`;

const StyledEmptyHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
`;

const StyledUnmatchedBlock = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
`;

const buildStackingPlanPath = (parqueId: string) =>
  getAppPath(AppPath.ParksStackingPlan, { parqueId });

const buildLeadPath = (leadId: string) =>
  getAppPath(AppPath.RecordShowPage, {
    objectNameSingular: 'opportunity',
    objectRecordId: leadId,
  });

const ParksPortfolioNaveRow = ({ nave }: { nave: ParksPortfolioNaveItem }) => (
  <StyledItem>
    <StyledItemHeader>
      <StyledItemName>{nave.identificador}</StyledItemName>
      <ParksStatusBadge label={t`Disponible`} color="green" />
    </StyledItemHeader>
    <StyledItemMeta>
      {formatParksNumber(nave.m2)} m²
      {nave.precioBaseUsd > 0
        ? ` · ${formatParksUsd(nave.precioBaseUsd)}`
        : ''}
    </StyledItemMeta>
  </StyledItem>
);

const ParksPortfolioLeadRow = ({ lead }: { lead: ParksPortfolioLeadItem }) => (
  <StyledLeadLink to={buildLeadPath(lead.id)}>
    <StyledItem>
      <StyledItemHeader>
        <StyledItemName>{lead.name}</StyledItemName>
        <ParksStatusBadge
          label={getParksPipelineStageLabel(lead.stage)}
          color={getParksPipelineStageColor(lead.stage)}
        />
      </StyledItemHeader>
      <StyledItemMeta>
        {lead.m2Requeridos > 0
          ? `${formatParksNumber(lead.m2Requeridos)} m²`
          : t`Sin m²`}
        {lead.pipelineValueUsd > 0
          ? ` · ${formatParksUsd(lead.pipelineValueUsd)}`
          : ''}
        {lead.naveIdentificador ? ` · ${lead.naveIdentificador}` : ''}
        {lead.leasingOfficer ? ` · ${lead.leasingOfficer}` : ''}
      </StyledItemMeta>
    </StyledItem>
  </StyledLeadLink>
);

const ParksPortfolioParkCard = ({
  park,
  defaultOpen,
}: {
  park: ParksPortfolioParkRow;
  defaultOpen: boolean;
}) => (
  <StyledParkDetails defaultOpen={defaultOpen}>
    <StyledParkSummary>
      <StyledParkIdentity>
        <StyledChevron>
          <IconChevronDown size={16} />
        </StyledChevron>
        <StyledParkCopy>
          <StyledParkName>{park.nombre}</StyledParkName>
          <StyledParkMeta>
            {park.ubicacion ?? t`Sin ubicación`} ·{' '}
            {formatParksNumber(park.m2Disponibles)} m² {t`libres`}
          </StyledParkMeta>
        </StyledParkCopy>
      </StyledParkIdentity>
      <StyledParkStats>
        <ParksStatusBadge
          label={`${park.ocupacion}%`}
          color={getParksOcupacionMetricAccent(park.ocupacion)}
        />
        <ParksStatusBadge
          label={t`${park.availableNaves.length} naves`}
          color="green"
        />
        <ParksStatusBadge
          label={t`${park.leads.length} leads`}
          color="blue"
        />
      </StyledParkStats>
      <StyledParkLink
        to={buildStackingPlanPath(park.parqueId)}
        onClick={(event) => event.stopPropagation()}
      >
        {t`Ver plano`}
      </StyledParkLink>
    </StyledParkSummary>
    <StyledParkBody>
      <div>
        <StyledColumnTitle>{t`Naves disponibles`}</StyledColumnTitle>
        {park.availableNaves.length === 0 ? (
          <StyledEmptyHint>{t`No hay naves disponibles en este parque.`}</StyledEmptyHint>
        ) : (
          <StyledItemList>
            {park.availableNaves.map((nave) => (
              <ParksPortfolioNaveRow key={nave.id} nave={nave} />
            ))}
          </StyledItemList>
        )}
      </div>
      <div>
        <StyledColumnTitle>
          {t`Leads del parque`}
          {park.pipelineValueUsd > 0
            ? ` · ${formatParksUsd(park.pipelineValueUsd)}`
            : ''}
        </StyledColumnTitle>
        {park.leads.length === 0 ? (
          <StyledEmptyHint>{t`No hay leads activos ligados a este parque.`}</StyledEmptyHint>
        ) : (
          <StyledItemList>
            {park.leads.map((lead) => (
              <ParksPortfolioLeadRow key={lead.id} lead={lead} />
            ))}
          </StyledItemList>
        )}
      </div>
    </StyledParkBody>
  </StyledParkDetails>
);

type ParksPortfolioByParkSectionProps = {
  showIntro?: boolean;
};

export const ParksPortfolioByParkSection = ({
  showIntro = true,
}: ParksPortfolioByParkSectionProps) => {
  const { records: parques, loading: parquesLoading } = useParksParques();
  const { records: naves, loading: navesLoading } = useParksNaves();
  const { records: opportunities, loading: opportunitiesLoading } =
    useParksOpportunities();

  const portfolio = useMemo(
    () =>
      buildParksPortfolioByPark({
        parques: parques ?? EMPTY_PARQUES,
        naves: naves ?? EMPTY_NAVES,
        opportunities: opportunities ?? EMPTY_OPPORTUNITIES,
      }),
    [naves, opportunities, parques],
  );

  if (parquesLoading || navesLoading || opportunitiesLoading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  if (portfolio.parqueCount === 0) {
    return (
      <ParksEmptyState
        title={t`Aún no hay parques en cartera`}
        description={t`Cuando existan parques industriales, aquí verás naves disponibles y leads de cada uno.`}
      />
    );
  }

  return (
    <ParksSectionCard
      title={t`Pipeline por parque`}
      accent="green"
      action={
        <StyledParkLink to={AppPath.ParksPipeline}>
          {t`Ver pipeline`}
        </StyledParkLink>
      }
    >
      {showIntro ? (
        <StyledIntro>
          {t`Todos los parques del grupo. Abre uno para ver naves disponibles y los leads de ese parque.`}
        </StyledIntro>
      ) : null}

      <StyledMetricsGrid>
        <ParksMetricCard
          label={t`Parques`}
          value={portfolio.parqueCount}
          accent="green"
        />
        <ParksMetricCard
          label={t`Naves disponibles`}
          value={portfolio.availableNaveCount}
          accent="green"
          trend={`${formatParksNumber(portfolio.availableM2)} m²`}
        />
        <ParksMetricCard
          label={t`Leads activos`}
          value={portfolio.leadCount}
          accent="blue"
        />
        <ParksMetricCard
          label={t`Pipeline`}
          value={formatParksUsd(portfolio.pipelineValueUsd)}
          accent="blue"
        />
      </StyledMetricsGrid>

      <StyledParkList>
        {portfolio.parks.map((park, index) => (
          <ParksPortfolioParkCard
            key={park.parqueId}
            park={park}
            defaultOpen={index === 0}
          />
        ))}
      </StyledParkList>

      {portfolio.unmatchedLeads.length > 0 ? (
        <StyledUnmatchedBlock>
          <StyledColumnTitle>
            {t`Leads sin parque asignado`} · {portfolio.unmatchedLeads.length}
          </StyledColumnTitle>
          <StyledItemList>
            {portfolio.unmatchedLeads.map((lead) => (
              <ParksPortfolioLeadRow key={lead.id} lead={lead} />
            ))}
          </StyledItemList>
        </StyledUnmatchedBlock>
      ) : null}
    </ParksSectionCard>
  );
};
