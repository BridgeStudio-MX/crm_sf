import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksInventoryParkGrid } from '@/parks-industrial/components/portfolio/ParksInventoryParkGrid';
import { ParksInventoryParkList } from '@/parks-industrial/components/portfolio/ParksInventoryParkList';
import { ParksInventoryParkMap } from '@/parks-industrial/components/portfolio/ParksInventoryParkMap';
import {
  ParksInventoryNaveWorkspace,
  ParksInventoryParkWorkspace,
  type ParksInventoryParkView,
} from '@/parks-industrial/components/portfolio/ParksInventoryWorkspace';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksSegmentedControl } from '@/parks-industrial/components/ui/ParksSegmentedControl';
import { PARKS_INVENTORY_TOUR_TARGETS } from '@/parks-industrial/constants/parks-guided-tour.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { useParksGuidedTour } from '@/parks-industrial/hooks/useParksGuidedTour';
import { useParksPortfolioByPark } from '@/parks-industrial/hooks/useParksPortfolioByPark';
import { resolveParksInventoryTourSelection } from '@/parks-industrial/utils/parks-inventory-tour.util';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';

type ParksInventoryExplorerProps = {
  title?: string;
  showPipelineLink?: boolean;
};

type ParksInventoryLayout = 'parques' | 'lista' | 'mapa';

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledToolbarRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledIntro = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
  min-width: 200px;
`;

const StyledCrumbRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledCrumbButton = styled.button`
  background: none;
  border: none;
  color: ${PARKS_BRAND.primary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledCrumbCurrent = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledTourAnchor = styled.div`
  min-width: 0;
`;

const StyledLink = styled(Link)`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const ParksInventoryExplorer = ({
  title,
  showPipelineLink = false,
}: ParksInventoryExplorerProps) => {
  const { portfolio, loading } = useParksPortfolioByPark();
  const { isActive: isTourActive, currentStep } = useParksGuidedTour();
  const [localParkId, setLocalParkId] = useState<string | null>(null);
  const [localNaveId, setLocalNaveId] = useState<string | null>(null);
  const [localParkView, setLocalParkView] =
    useState<ParksInventoryParkView>('pipeline');
  const [localInventoryLayout, setLocalInventoryLayout] =
    useState<ParksInventoryLayout>('parques');
  const tourSelection = resolveParksInventoryTourSelection(
    portfolio.parks,
    currentStep?.inventoryFocus,
  );
  const isTourDriving = isTourActive && Boolean(currentStep?.inventoryFocus);
  const selectedParkId = isTourDriving
    ? tourSelection.selectedParkId
    : localParkId;
  const selectedNaveId = isTourDriving
    ? tourSelection.selectedNaveId
    : localNaveId;
  const parkView = isTourDriving ? tourSelection.parkView : localParkView;
  // Guided tour anchors the parks grid; keep Parques layout while the tour drives.
  const inventoryLayout = isTourDriving ? 'parques' : localInventoryLayout;

  const selectedPark =
    portfolio.parks.find((park) => park.parqueId === selectedParkId) ?? null;
  const selectedNave =
    selectedPark?.allNaves.find((nave) => nave.id === selectedNaveId) ?? null;

  const handleSelectPark = (parqueId: string) => {
    setLocalParkId(parqueId);
    setLocalNaveId(null);
    setLocalParkView('pipeline');
  };

  const handleBackToParks = () => {
    setLocalParkId(null);
    setLocalNaveId(null);
    setLocalParkView('pipeline');
  };

  const handleBackToPark = () => {
    setLocalNaveId(null);
    setLocalParkView('naves');
  };

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  if (portfolio.parqueCount === 0) {
    return (
      <ParksEmptyState
        title={t`Aún no hay parques en cartera`}
        description={t`Cuando existan parques, aquí verás ocupación, naves en obra y el pipeline de cada nivel.`}
      />
    );
  }

  return (
    <ParksSectionCard
      title={title ?? t`Parques, naves y pipeline`}
      accent="green"
      action={
        showPipelineLink ? (
          <StyledLink to={AppPath.ParksPipeline}>
            {t`Ver pipeline operativo`}
          </StyledLink>
        ) : undefined
      }
    >
      {selectedPark === null ? (
        <>
          <StyledToolbarRow>
            <StyledIntro>
              {t`Empieza por el parque. Entra al pipeline de ese parque o cambia a tarjetas de naves — incluidas las que aún están en construcción.`}
            </StyledIntro>
            <ParksSegmentedControl
              value={inventoryLayout}
              onChange={setLocalInventoryLayout}
              options={[
                { id: 'parques', label: t`Parques` },
                { id: 'lista', label: t`Lista` },
                { id: 'mapa', label: t`Mapa` },
              ]}
            />
          </StyledToolbarRow>
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
              label={t`En construcción`}
              value={portfolio.constructionNaveCount}
              accent="orange"
              trend={t`pre-renta abierta`}
            />
            <ParksMetricCard
              label={t`Pipeline ligado`}
              value={formatParksUsd(portfolio.pipelineValueUsd)}
              accent="blue"
            />
          </StyledMetricsGrid>
          <StyledTourAnchor
            data-parks-tour-target={PARKS_INVENTORY_TOUR_TARGETS.parks}
          >
            {inventoryLayout === 'lista' ? (
              <ParksInventoryParkList
                parks={portfolio.parks}
                onSelectPark={handleSelectPark}
              />
            ) : null}
            {inventoryLayout === 'mapa' ? (
              <ParksInventoryParkMap
                parks={portfolio.parks}
                onSelectPark={handleSelectPark}
              />
            ) : null}
            {inventoryLayout === 'parques' ? (
              <ParksInventoryParkGrid
                parks={portfolio.parks}
                onSelectPark={handleSelectPark}
              />
            ) : null}
          </StyledTourAnchor>
        </>
      ) : (
        <>
          <StyledCrumbRow>
            <StyledCrumbButton type="button" onClick={handleBackToParks}>
              {t`Parques`}
            </StyledCrumbButton>
            <StyledCrumbCurrent>/</StyledCrumbCurrent>
            {selectedNave ? (
              <>
                <StyledCrumbButton type="button" onClick={handleBackToPark}>
                  {selectedPark.nombre}
                </StyledCrumbButton>
                <StyledCrumbCurrent>/</StyledCrumbCurrent>
                <StyledCrumbCurrent>
                  {selectedNave.identificador}
                </StyledCrumbCurrent>
              </>
            ) : (
              <StyledCrumbCurrent>{selectedPark.nombre}</StyledCrumbCurrent>
            )}
          </StyledCrumbRow>
          {selectedNave ? (
            <StyledTourAnchor
              data-parks-tour-target={PARKS_INVENTORY_TOUR_TARGETS.nave}
            >
              <ParksInventoryNaveWorkspace
                park={selectedPark}
                nave={selectedNave}
              />
            </StyledTourAnchor>
          ) : (
            <StyledTourAnchor
              data-parks-tour-target={
                parkView === 'naves'
                  ? PARKS_INVENTORY_TOUR_TARGETS.naves
                  : PARKS_INVENTORY_TOUR_TARGETS.parkPipeline
              }
            >
              <ParksInventoryParkWorkspace
                park={selectedPark}
                view={parkView}
                onChangeView={setLocalParkView}
                onSelectNave={setLocalNaveId}
              />
            </StyledTourAnchor>
          )}
        </>
      )}
    </ParksSectionCard>
  );
};
