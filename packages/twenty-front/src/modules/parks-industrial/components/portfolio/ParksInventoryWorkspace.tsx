import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksInventoryMiniPipeline } from '@/parks-industrial/components/portfolio/ParksInventoryMiniPipeline';
import { ParksInventoryNaveCards } from '@/parks-industrial/components/portfolio/ParksInventoryNaveCards';
import { ParksSegmentedControl } from '@/parks-industrial/components/ui/ParksSegmentedControl';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';
import {
  isParksParkUnderConstruction,
  type ParksPortfolioNaveItem,
  type ParksPortfolioParkRow,
} from '@/parks-industrial/utils/parks-portfolio-by-park.util';
import {
  getParksNaveKindColor,
  getParksNaveKindLabel,
} from '@/parks-industrial/utils/parks-portfolio-metrics.util';

export type ParksInventoryParkView = 'pipeline' | 'naves';

type ParksInventoryParkWorkspaceProps = {
  park: ParksPortfolioParkRow;
  view: ParksInventoryParkView;
  onChangeView: (view: ParksInventoryParkView) => void;
  onSelectNave: (naveId: string) => void;
};

type ParksInventoryNaveWorkspaceProps = {
  park: ParksPortfolioParkRow;
  nave: ParksPortfolioNaveItem;
};

const StyledHeaderRow = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledHeaderCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledMeta = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
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

export const ParksInventoryParkWorkspace = ({
  park,
  view,
  onChangeView,
  onSelectNave,
}: ParksInventoryParkWorkspaceProps) => {
  const isConstruction = isParksParkUnderConstruction(park);
  const stackingPath = getAppPath(AppPath.ParksStackingPlan, {
    parqueId: park.parqueId,
  });

  return (
    <>
      <StyledHeaderRow>
        <StyledHeaderCopy>
          <StyledTitle>{park.nombre}</StyledTitle>
          <StyledMeta>
            {park.ubicacion ?? t`Sin ubicación`}
            {isConstruction
              ? ` · ${t`parque en obra`}`
              : ` · ${park.ocupacion}% ${t`ocupación`}`}
          </StyledMeta>
          <StyledBadgeRow>
            {park.constructionNaveCount > 0 ? (
              <ParksStatusBadge
                color="orange"
                label={t`${park.constructionNaveCount} naves en construcción`}
              />
            ) : null}
            <ParksStatusBadge
              color="blue"
              label={t`${park.leads.length} leads`}
            />
          </StyledBadgeRow>
          {!park.parqueId.startsWith('demo-') ? (
            <StyledLink to={stackingPath}>{t`Ver plano de ocupación`}</StyledLink>
          ) : null}
        </StyledHeaderCopy>
        <ParksSegmentedControl
          value={view}
          onChange={onChangeView}
          options={[
            { id: 'pipeline', label: t`Pipeline`, count: park.leads.length },
            { id: 'naves', label: t`Naves`, count: park.totalNaveCount },
          ]}
        />
      </StyledHeaderRow>
      {view === 'pipeline' ? (
        <ParksInventoryMiniPipeline
          leads={park.leads}
          emptyLabel={t`Este parque no tiene leads activos.`}
        />
      ) : (
        <ParksInventoryNaveCards
          naves={park.allNaves}
          onSelectNave={onSelectNave}
        />
      )}
    </>
  );
};

export const ParksInventoryNaveWorkspace = ({
  park,
  nave,
}: ParksInventoryNaveWorkspaceProps) => (
  <>
    <StyledHeaderCopy>
      <StyledTitle>
        {nave.identificador}
        <StyledMeta>{` · ${park.nombre}`}</StyledMeta>
      </StyledTitle>
      <StyledMeta>
        {formatParksNumber(nave.m2)} m²
        {nave.precioBaseUsd > 0
          ? ` · ${formatParksUsd(nave.precioBaseUsd)} / m²`
          : ''}
      </StyledMeta>
      <StyledBadgeRow>
        <ParksStatusBadge
          color={getParksNaveKindColor(nave.kind)}
          label={getParksNaveKindLabel(nave.kind)}
        />
        {nave.kind === 'construccion' && nave.entregaEstimada ? (
          <ParksStatusBadge
            color="orange"
            label={t`Entrega ${nave.entregaEstimada}`}
          />
        ) : null}
      </StyledBadgeRow>
      {nave.kind === 'construccion' ? (
        <StyledMeta>
          {t`Nave en construcción: se puede pre-rentar y avanzar pipeline antes de la entrega.`}
        </StyledMeta>
      ) : null}
    </StyledHeaderCopy>
    <ParksInventoryMiniPipeline
      leads={nave.leads}
      emptyLabel={t`Esta nave no tiene leads en pipeline.`}
    />
  </>
);
