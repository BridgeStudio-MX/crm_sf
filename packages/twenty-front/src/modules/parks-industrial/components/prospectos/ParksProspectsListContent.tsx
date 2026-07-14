import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { IconBuildingWarehouse, IconSearch, IconUsers } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import {
  ParksSectionCard,
  StyledParksPageStack,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  getParksPipelineStageColor,
  getParksPipelineStageLabel,
  PARKS_PIPELINE_STAGES,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { getParksInquilino360Path } from '@/parks-industrial/constants/parks-routes.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { useParksProspectScores } from '@/parks-industrial/hooks/useParksProspectScores';
import {
  type ParksOpportunityRecord,
  useParksOpportunities,
} from '@/parks-industrial/hooks/useParksRecords';
import {
  formatParksNumber,
  getParksAssignedLeasingOfficerName,
  getParksOwnerName,
} from '@/parks-industrial/utils/parks-format.util';
import {
  formatParksProspectUrgencyLabel,
  getParksProspectScoreBadgeColor,
} from '@/parks-industrial/utils/parks-prospect-scoring.util';

const CLIENT_STAGE = 'GANADO_CONTRATO_FIRMADO';

const EMPTY_OPPORTUNITIES: ParksOpportunityRecord[] = [];

type ParksProspectsListContentProps = {
  variant: 'prospectos' | 'clientes';
};

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;

  @media (min-width: ${MOBILE_VIEWPORT + 1}px) {
    width: auto;
  }
`;

const StyledSearchWrap = styled.label`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 200px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledSearchInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 40px;
  outline: none;
  width: 100%;
`;

const StyledSelect = styled.select`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 40px;
  padding: 0 12px;
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  white-space: nowrap;
`;

const StyledTableScroll = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  min-width: 720px;
  width: 100%;
`;

const StyledTh = styled.th`
  border-bottom: 1px solid ${PARKS_BRAND.borderSoft};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  text-align: left;
  text-transform: uppercase;
`;

const StyledTd = styled.td`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[3]};
  vertical-align: middle;
`;

const StyledRow = styled.tr`
  cursor: pointer;
  transition: background 0.12s ease;

  &:hover {
    background: ${PARKS_BRAND.primarySoft};
  }
`;

const StyledDealName = styled.div`
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledDealMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 2px;
`;

const StyledMobileList = styled.div`
  display: none;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: flex;
  }
`;

const StyledDesktopTable = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledMobileCard = styled(Link)`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  text-decoration: none;
`;

const StyledMobileTop = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const getDealStage = (deal: ParksOpportunityRecord): string =>
  deal.stage ?? 'LEAD_RECIBIDO';

const isClientDeal = (deal: ParksOpportunityRecord): boolean =>
  getDealStage(deal) === CLIENT_STAGE;

const isProspectDeal = (deal: ParksOpportunityRecord): boolean =>
  !isClientDeal(deal);

const getPipelineDealPath = (dealId: string): string =>
  `${AppPath.ParksPipeline}?dealId=${encodeURIComponent(dealId)}`;

const resolveDealTargetPath = (deal: ParksOpportunityRecord): string => {
  // Prospecto y cliente: abrir el 360 del inquilino; pipeline solo si no hay vínculo.
  if (deal.inquilinoVinculado?.id) {
    return getParksInquilino360Path(deal.inquilinoVinculado.id);
  }

  return getPipelineDealPath(deal.id);
};

export const ParksProspectsListContent = ({
  variant,
}: ParksProspectsListContentProps) => {
  const navigate = useNavigate();
  const { records, loading, error } = useParksOpportunities();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  const scopedDeals = useMemo(() => {
    const source = records ?? EMPTY_OPPORTUNITIES;

    return source.filter((deal) =>
      variant === 'clientes' ? isClientDeal(deal) : isProspectDeal(deal),
    );
  }, [records, variant]);

  const prospectScoresById = useParksProspectScores(
    variant === 'prospectos' ? scopedDeals : EMPTY_OPPORTUNITIES,
  );

  const stageOptions = useMemo(() => {
    if (variant === 'clientes') {
      return PARKS_PIPELINE_STAGES.filter(
        (stage) => stage.id === CLIENT_STAGE,
      );
    }

    return PARKS_PIPELINE_STAGES.filter((stage) => stage.id !== CLIENT_STAGE);
  }, [variant]);

  const filteredDeals = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return scopedDeals
      .filter((deal) => {
        if (
          stageFilter !== 'all' &&
          getDealStage(deal) !== stageFilter
        ) {
          return false;
        }

        if (normalizedQuery.length === 0) {
          return true;
        }

        const haystack = [
          deal.name,
          deal.inquilinoVinculado?.empresa,
          deal.ubicacionDeseada,
          deal.giroEmpresa,
          deal.canalOrigen,
          getParksOwnerName(deal),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .sort((left, right) =>
        (right.updatedAt ?? '').localeCompare(left.updatedAt ?? ''),
      );
  }, [scopedDeals, searchQuery, stageFilter]);

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  if (error) {
    return (
      <ParksEmptyState
        title={
          variant === 'clientes'
            ? t`No se pudieron cargar los clientes`
            : t`No se pudieron cargar los prospectos`
        }
        description={t`Recarga la página o vuelve a iniciar sesión.`}
      />
    );
  }

  const isClientes = variant === 'clientes';

  return (
    <StyledParksPageStack>
      <ParksPageHero
        title={isClientes ? t`Clientes` : t`Todos los prospectos`}
        description={
          isClientes
            ? t`Deals con contrato firmado. Abre la cuenta 360 del inquilino.`
            : t`Todos los leads del pipeline con su etapa. Abre un row para ir al 360 del prospecto.`
        }
        accent={isClientes ? 'green' : 'blue'}
        icon={isClientes ? IconBuildingWarehouse : IconUsers}
        metrics={[
          {
            label: isClientes ? t`Clientes` : t`Prospectos`,
            value: String(scopedDeals.length),
          },
          {
            label: t`Filtrados`,
            value: String(filteredDeals.length),
          },
        ]}
      />

      <ParksSectionCard
        title={isClientes ? t`Lista de clientes` : t`Lista de prospectos`}
      >
        <StyledToolbar>
          <StyledFilters>
            <StyledSearchWrap>
              <IconSearch size={16} />
              <StyledSearchInput
                value={searchQuery}
                placeholder={t`Buscar empresa, ubicación, LO…`}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </StyledSearchWrap>
            {!isClientes ? (
              <StyledSelect
                value={stageFilter}
                onChange={(event) => setStageFilter(event.target.value)}
                aria-label={t`Filtrar por etapa`}
              >
                <option value="all">{t`Todas las etapas`}</option>
                {stageOptions.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.label}
                  </option>
                ))}
              </StyledSelect>
            ) : null}
          </StyledFilters>
          <StyledCount>
            {t`${filteredDeals.length} de ${scopedDeals.length}`}
          </StyledCount>
        </StyledToolbar>

        {filteredDeals.length === 0 ? (
          <ParksEmptyState
            title={
              isClientes ? t`Sin clientes` : t`Sin prospectos`
            }
            description={
              isClientes
                ? t`Cuando un deal llegue a contrato firmado aparecerá aquí.`
                : t`No hay prospectos con estos filtros. Crea uno desde Pipeline.`
            }
          />
        ) : (
          <>
            <StyledDesktopTable>
              <StyledTableScroll>
                <StyledTable>
                  <thead>
                    <tr>
                      <StyledTh>
                        {isClientes ? t`Cliente` : t`Prospecto`}
                      </StyledTh>
                      <StyledTh>{t`Etapa`}</StyledTh>
                      <StyledTh>{t`m²`}</StyledTh>
                      <StyledTh>{t`LO`}</StyledTh>
                      {!isClientes ? <StyledTh>{t`Score`}</StyledTh> : null}
                      <StyledTh>{t`Canal`}</StyledTh>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeals.map((deal) => {
                      const score = prospectScoresById[deal.id];
                      const stageId = getDealStage(deal);
                      const targetPath = resolveDealTargetPath(deal);

                      return (
                        <StyledRow
                          key={deal.id}
                          onClick={() => navigate(targetPath)}
                        >
                          <StyledTd>
                            <StyledDealName>
                              {deal.inquilinoVinculado?.empresa ??
                                deal.name ??
                                t`Sin nombre`}
                            </StyledDealName>
                            <StyledDealMeta>
                              {deal.ubicacionDeseada ||
                                deal.giroEmpresa ||
                                deal.naveVinculada?.identificador ||
                                t`Sin ubicación`}
                            </StyledDealMeta>
                          </StyledTd>
                          <StyledTd>
                            <ParksStatusBadge
                              color={getParksPipelineStageColor(stageId)}
                              label={getParksPipelineStageLabel(stageId)}
                            />
                          </StyledTd>
                          <StyledTd>
                            {deal.m2Requeridos
                              ? formatParksNumber(deal.m2Requeridos)
                              : '—'}
                          </StyledTd>
                          <StyledTd>
                            {getParksAssignedLeasingOfficerName(deal) ??
                              getParksOwnerName(deal)}
                          </StyledTd>
                          {!isClientes ? (
                            <StyledTd>
                              {score ? (
                                <ParksStatusBadge
                                  color={getParksProspectScoreBadgeColor(
                                    score.tier,
                                  )}
                                  label={`${score.fitScore} · ${formatParksProspectUrgencyLabel(score.urgency)}`}
                                />
                              ) : (
                                '—'
                              )}
                            </StyledTd>
                          ) : null}
                          <StyledTd>{deal.canalOrigen ?? '—'}</StyledTd>
                        </StyledRow>
                      );
                    })}
                  </tbody>
                </StyledTable>
              </StyledTableScroll>
            </StyledDesktopTable>

            <StyledMobileList>
              {filteredDeals.map((deal) => {
                const score = prospectScoresById[deal.id];
                const stageId = getDealStage(deal);

                return (
                  <StyledMobileCard
                    key={deal.id}
                    to={resolveDealTargetPath(deal)}
                  >
                    <StyledMobileTop>
                      <div>
                        <StyledDealName>
                          {deal.inquilinoVinculado?.empresa ??
                            deal.name ??
                            t`Sin nombre`}
                        </StyledDealName>
                        <StyledDealMeta>
                          {getParksAssignedLeasingOfficerName(deal) ??
                            getParksOwnerName(deal)}
                          {deal.m2Requeridos
                            ? ` · ${formatParksNumber(deal.m2Requeridos)} m²`
                            : ''}
                        </StyledDealMeta>
                      </div>
                      <ParksStatusBadge
                        color={getParksPipelineStageColor(stageId)}
                        label={getParksPipelineStageLabel(stageId)}
                      />
                    </StyledMobileTop>
                    {!isClientes && score ? (
                      <ParksStatusBadge
                        color={getParksProspectScoreBadgeColor(score.tier)}
                        label={`${score.fitScore} · ${formatParksProspectUrgencyLabel(score.urgency)}`}
                      />
                    ) : null}
                  </StyledMobileCard>
                );
              })}
            </StyledMobileList>
          </>
        )}
      </ParksSectionCard>
    </StyledParksPageStack>
  );
};
