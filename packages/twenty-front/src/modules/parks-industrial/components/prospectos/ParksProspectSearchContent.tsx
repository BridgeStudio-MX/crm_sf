import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import {
  IconLayoutKanban,
  IconMail,
  IconSearch,
  IconTarget,
  IconUsers,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  ParksDashboardFeaturedMetric,
  ParksDashboardFeaturedMetrics,
} from '@/parks-industrial/components/dashboard/ParksDashboardFeaturedMetrics';
import { ParksFormField } from '@/parks-industrial/components/ui/ParksFormField';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import {
  ParksSectionCard,
  StyledParksPageStack,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { StyledParksSelect } from '@/parks-industrial/components/ui/parks-form-control.styles';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import {
  createParksBulkFollowUp,
  searchParksDemandProspects,
} from '@/parks-industrial/services/parks-commercial.client';
import {
  type DemandSearchProspect,
  type DemandSearchResult,
} from '@/parks-industrial/types/parks-commercial.types';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';

const StyledFiltersGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: ${themeCssVariables.spacing[3]};

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const StyledInput = styled.input`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledToolbar = styled.div`
  align-items: center;
  background: ${PARKS_BRAND.primarySoft};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledResults = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`;

const StyledProspectCard = styled.label`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left: 4px solid ${PARKS_BRAND.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.strong};
    transform: translateY(-1px);
  }
`;

const StyledProspectMain = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledProspectTitle = styled.strong`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledProspectMeta = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledMatchList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledFeedback = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const CITY_OPTIONS = [
  { value: 'all', label: 'Todas las regiones' },
  { value: 'guadalajara', label: 'Guadalajara' },
  { value: 'monterrey', label: 'Monterrey' },
  { value: 'querétaro', label: 'Querétaro' },
  { value: 'toluca', label: 'Toluca' },
];

export const ParksProspectSearchContent = () => {
  const [m2Min, setM2Min] = useState('5000');
  const [m2Max, setM2Max] = useState('20000');
  const [cityFilter, setCityFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DemandSearchResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  const matchingCount =
    result?.prospects.filter((prospect) => prospect.matchingNaves.length > 0)
      .length ?? 0;

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setBulkMessage(null);

    try {
      const searchResult = await searchParksDemandProspects({
        m2Min: Number.parseInt(m2Min, 10) || undefined,
        m2Max: Number.parseInt(m2Max, 10) || undefined,
        cityFilter: cityFilter === 'all' ? undefined : cityFilter,
        sectorFilter: sectorFilter.trim() || undefined,
        limit: 50,
      });

      setResult(searchResult);
      setSelectedIds([]);
    } catch (searchError) {
      const message =
        searchError instanceof Error
          ? searchError.message
          : 'No se pudo buscar prospectos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [cityFilter, m2Max, m2Min, sectorFilter]);

  const toggleSelection = (opportunityId: string) => {
    setSelectedIds((previous) =>
      previous.includes(opportunityId)
        ? previous.filter((id) => id !== opportunityId)
        : [...previous, opportunityId],
    );
  };

  const handleBulkFollowUp = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bulkResult = await createParksBulkFollowUp(selectedIds);
      setBulkMessage(bulkResult.message);
    } catch (bulkError) {
      const message =
        bulkError instanceof Error
          ? bulkError.message
          : 'No se pudieron crear tareas';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderProspect = (prospect: DemandSearchProspect) => (
    <StyledProspectCard key={prospect.opportunityId}>
      <input
        type="checkbox"
        checked={selectedIds.includes(prospect.opportunityId)}
        onChange={() => toggleSelection(prospect.opportunityId)}
      />
      <StyledProspectMain>
        <StyledProspectTitle>{prospect.companyName}</StyledProspectTitle>
        <StyledProspectMeta>
          {formatParksNumber(prospect.m2Requeridos ?? 0)} m² ·{' '}
          {prospect.ubicacionDeseada ?? t`Sin ubicación`} ·{' '}
          {prospect.sector ?? t`Sector N/D`}
        </StyledProspectMeta>
        <StyledProspectMeta>
          {prospect.stage ?? t`Sin etapa`} ·{' '}
          {prospect.canalOrigen ?? t`Canal N/D`}
        </StyledProspectMeta>
        {prospect.matchingNaves.length > 0 ? (
          <StyledMatchList>
            {prospect.matchingNaves.map((nave) => (
              <ParksStatusBadge
                key={nave.naveId}
                color="green"
                label={`${nave.identificador} (${nave.matchScore}%)`}
              />
            ))}
          </StyledMatchList>
        ) : (
          <ParksStatusBadge color="gray" label={t`Sin naves compatibles`} />
        )}
      </StyledProspectMain>
    </StyledProspectCard>
  );

  return (
    <StyledParksPageStack>
      <ParksPageHero
        eyebrow={t`Parks Industrial · Comercial`}
        title={t`Búsqueda de prospectos`}
        subtitle={t`Encuentra demanda por m², región y sector, y cruza con naves disponibles — estilo Ascendix adaptado a Parks.`}
        actions={[
          {
            to: AppPath.ParksPipeline,
            label: t`Pipeline`,
            icon: IconLayoutKanban,
          },
        ]}
        stats={[
          {
            label: t`Resultados`,
            value: String(result?.totalMatches ?? 0),
            hint: t`Matches totales`,
          },
          {
            label: t`Con naves`,
            value: String(matchingCount),
            hint: t`Match disponible`,
          },
          {
            label: t`Seleccionados`,
            value: String(selectedIds.length),
            hint: t`Para seguimiento`,
          },
          {
            label: t`Mostrados`,
            value: String(result?.prospects.length ?? 0),
            hint: t`En esta página`,
          },
        ]}
      />

      <ParksDashboardFeaturedMetrics>
        <ParksDashboardFeaturedMetric
          label={t`Prospectos encontrados`}
          value={String(result?.totalMatches ?? 0)}
          hint={t`Según filtros actuales`}
          icon={IconUsers}
          accent="green"
        />
        <ParksDashboardFeaturedMetric
          label={t`Con match de nave`}
          value={String(matchingCount)}
          hint={t`Listos para contactar`}
          icon={IconTarget}
          accent="blue"
        />
        <ParksDashboardFeaturedMetric
          label={t`Seleccionados`}
          value={String(selectedIds.length)}
          hint={t`Bulk follow-up`}
          icon={IconMail}
          accent={selectedIds.length > 0 ? 'orange' : 'gray'}
        />
      </ParksDashboardFeaturedMetrics>

      <ParksSectionCard title={t`Filtros de demanda`} accent="green">
        <StyledFiltersGrid>
          <ParksFormField label={t`m² mínimo`}>
            <StyledInput
              type="number"
              value={m2Min}
              onChange={(event) => setM2Min(event.target.value)}
            />
          </ParksFormField>
          <ParksFormField label={t`m² máximo`}>
            <StyledInput
              type="number"
              value={m2Max}
              onChange={(event) => setM2Max(event.target.value)}
            />
          </ParksFormField>
          <ParksFormField label={t`Región`}>
            <StyledParksSelect
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
            >
              {CITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </StyledParksSelect>
          </ParksFormField>
          <ParksFormField label={t`Sector / giro`}>
            <StyledInput
              value={sectorFilter}
              onChange={(event) => setSectorFilter(event.target.value)}
              placeholder={t`Logística, automotriz…`}
            />
          </ParksFormField>
        </StyledFiltersGrid>

        <StyledToolbar>
          <Button
            variant="primary"
            Icon={IconSearch}
            title={t`Buscar prospectos`}
            onClick={() => void runSearch()}
            disabled={loading}
          />
          <Button
            variant="secondary"
            Icon={IconMail}
            title={t`Crear tareas de seguimiento (${selectedIds.length})`}
            onClick={() => void handleBulkFollowUp()}
            disabled={loading || selectedIds.length === 0}
          />
        </StyledToolbar>

        {loading ? <ParksLoadingSkeleton variant="list" /> : null}

        {result ? (
          <>
            <ParksStatusBadge
              color="blue"
              label={`${result.totalMatches} prospectos · ${result.prospects.length} mostrados`}
            />
            <StyledResults>
              {result.prospects.map(renderProspect)}
            </StyledResults>
          </>
        ) : null}

        <StyledFeedback>
          {bulkMessage ? (
            <ParksStatusBadge color="green" label={bulkMessage} />
          ) : null}
          {error ? <ParksStatusBadge color="red" label={error} /> : null}
          {!result && !loading ? (
            <ParksStatusBadge
              color="gray"
              label={t`Usa los filtros y pulsa Buscar para ver prospectos con naves compatibles.`}
            />
          ) : null}
        </StyledFeedback>
      </ParksSectionCard>
    </StyledParksPageStack>
  );
};
