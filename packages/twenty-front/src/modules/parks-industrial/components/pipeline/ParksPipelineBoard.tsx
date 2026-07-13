import { PointerActivationConstraints } from '@dnd-kit/dom';
import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { PARKS_VISIBLE_PIPELINE_STAGES } from '@/parks-industrial/constants/parks-industrial.constants';
import { useParksProspectScores } from '@/parks-industrial/hooks/useParksProspectScores';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import {
  type ParksPipelineFilters,
  ParksPipelineToolbar,
} from '@/parks-industrial/components/pipeline/ParksPipelineToolbar';
import { ParksUnassignedLeadsBanner } from '@/parks-industrial/components/pipeline/ParksUnassignedLeadsBanner';
import { ParksPipelineColumn } from '@/parks-industrial/components/pipeline/ParksPipelineColumn';
import { ParksPipelineDealDetail } from '@/parks-industrial/components/pipeline/ParksPipelineDealDetail';
import { ParksNewLeadModal } from '@/parks-industrial/components/pipeline/ParksNewLeadModal';
import { ParksPipelineDragOverlay } from '@/parks-industrial/components/pipeline/ParksPipelineDragOverlay';
import { ParksStageGateModal } from '@/parks-industrial/components/pipeline/ParksStageGateModal';
import { ParksResponsiveSheet } from '@/parks-industrial/components/ui/ParksResponsiveSheet';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import {
  getParksAssignedLeasingOfficerName,
  getParksOwnerName,
  isParksOpportunityAssignedToViewer,
} from '@/parks-industrial/utils/parks-format.util';
import { ParksRoleLabel } from '@/parks-industrial/constants/parks-role-access.constants';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { validateParksStageGate } from '@/parks-industrial/services/parks-commercial.client';
import {
  PARKS_FLUJO_SECTION_IDS,
  type ParksDealGuideTab,
} from '@/parks-industrial/utils/parks-stage-guide.util';
import {
  buildParksStageGateOpportunityInput,
  normalizeParksPipelineStageId,
  type ParksStageGateResult,
  validateParksStageTransition,
} from '@/parks-industrial/utils/parksStageGateUtil';
import {
  buildOptimisticOpportunityRecord,
  type ParksLeadCreatedPayload,
} from '@/parks-industrial/utils/parks-pipeline.util';
import { Button } from 'twenty-ui/input';

const PIPELINE_DND_SENSORS = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 8 }),
    ],
  }),
  KeyboardSensor,
];

const StyledBoardLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledBoard = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  overflow-x: auto;
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledDragHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

type ParksPipelineBoardProps = {
  opportunities: ParksOpportunityRecord[];
  onOpportunitiesRefresh?: () => void;
};

const filterOpportunities = (
  opportunities: ParksOpportunityRecord[],
  filters: ParksPipelineFilters,
  viewerName?: string | null,
): ParksOpportunityRecord[] =>
  opportunities.filter((opportunity) => {
    if (opportunity.stage === 'PERDIDO') {
      return false;
    }

    const ownerName = getParksOwnerName(opportunity);
    const leasingOfficerName = getParksAssignedLeasingOfficerName(opportunity);
    const searchTarget = [
      opportunity.name,
      opportunity.inquilinoVinculado?.empresa,
      opportunity.naveVinculada?.identificador,
      ownerName,
      leasingOfficerName,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch =
      filters.searchQuery.length === 0 ||
      searchTarget.includes(filters.searchQuery.toLowerCase());

    let matchesOwner = true;

    if (filters.ownerFilter === '__MINE__') {
      matchesOwner = isParksOpportunityAssignedToViewer(
        opportunity,
        viewerName,
      );
    } else if (filters.ownerFilter === '__UNASSIGNED__') {
      matchesOwner = !leasingOfficerName;
    } else if (filters.ownerFilter.length > 0) {
      matchesOwner = ownerName === filters.ownerFilter;
    }

    return matchesSearch && matchesOwner;
  });

export const ParksPipelineBoard = ({
  opportunities,
  onOpportunitiesRefresh,
}: ParksPipelineBoardProps) => {
  const { displayName, parksRoleLabels } = useParksAccess();
  const isLeasingOfficer = parksRoleLabels.includes(
    ParksRoleLabel.EjecutivoComercial,
  );
  const safeOpportunities = opportunities ?? [];
  const [items, setItems] = useState(safeOpportunities);
  const [filters, setFilters] = useState<ParksPipelineFilters>({
    searchQuery: '',
    ownerFilter: '',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [deepLinkTab, setDeepLinkTab] = useState<ParksDealGuideTab | undefined>();
  const [deepLinkScrollTarget, setDeepLinkScrollTarget] = useState<
    string | undefined
  >();
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [unassignedLeadsRefreshKey, setUnassignedLeadsRefreshKey] = useState(0);
  const [stageGateBlocker, setStageGateBlocker] = useState<{
    result: Extract<ParksStageGateResult, { ok: false }>;
    dealName?: string;
  } | null>(null);
  const prospectScoresById = useParksProspectScores(items);
  const { updateOneRecord } = useUpdateOneRecord();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  useEffect(() => {
    if (safeOpportunities.length === 0) {
      return;
    }

    setItems(safeOpportunities);
  }, [safeOpportunities]);

  useEffect(() => {
    const dealIdFromQuery = searchParams.get('dealId');

    if (!dealIdFromQuery) {
      return;
    }

    setSelectedDealId(dealIdFromQuery);

    const tabFromQuery = searchParams.get('tab');
    const sectionFromQuery = searchParams.get('section');

    const resolveDeepLinkTab = (): ParksDealGuideTab | undefined => {
      if (
        tabFromQuery === 'resumen' ||
        tabFromQuery === 'prospecto' ||
        tabFromQuery === 'propuesta' ||
        tabFromQuery === 'actividad' ||
        tabFromQuery === 'decisores' ||
        tabFromQuery === 'guion' ||
        tabFromQuery === 'cotizacion' ||
        tabFromQuery === 'aprobacion' ||
        tabFromQuery === 'hoja'
      ) {
        return tabFromQuery;
      }

      // Legacy deep-links still use tab=flujo&section=...
      if (tabFromQuery === 'flujo') {
        if (sectionFromQuery === 'aprobacion') {
          return 'aprobacion';
        }

        if (sectionFromQuery === 'hoja') {
          return 'hoja';
        }

        return 'cotizacion';
      }

      if (sectionFromQuery === 'aprobacion') {
        return 'aprobacion';
      }

      if (sectionFromQuery === 'hoja') {
        return 'hoja';
      }

      if (
        sectionFromQuery === 'tour' ||
        sectionFromQuery === 'cotizacion'
      ) {
        return 'cotizacion';
      }

      return undefined;
    };

    const resolvedTab = resolveDeepLinkTab();

    if (resolvedTab) {
      setDeepLinkTab(resolvedTab);
    }

    if (sectionFromQuery === 'hoja') {
      setDeepLinkScrollTarget(PARKS_FLUJO_SECTION_IDS.hoja);
    } else if (sectionFromQuery === 'cotizacion') {
      setDeepLinkScrollTarget(PARKS_FLUJO_SECTION_IDS.cotizacion);
    } else if (sectionFromQuery === 'aprobacion') {
      setDeepLinkScrollTarget(PARKS_FLUJO_SECTION_IDS.aprobacion);
    } else if (sectionFromQuery === 'tour') {
      setDeepLinkScrollTarget(PARKS_FLUJO_SECTION_IDS.tour);
    }
  }, [searchParams]);

  const clearDealDeepLink = () => {
    setSelectedDealId(null);
    setDeepLinkTab(undefined);
    setDeepLinkScrollTarget(undefined);

    if (
      searchParams.has('dealId') ||
      searchParams.has('tab') ||
      searchParams.has('section')
    ) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('dealId');
      nextParams.delete('tab');
      nextParams.delete('section');
      setSearchParams(nextParams, { replace: true });
    }
  };

  const filteredItems = useMemo(
    () => filterOpportunities(items, filters, displayName),
    [displayName, filters, items],
  );

  const dealsById = useMemo(
    () => new Map(items.map((deal) => [deal.id, deal])),
    [items],
  );

  const selectedDeal = useMemo(
    () => items.find((item) => item.id === selectedDealId) ?? null,
    [items, selectedDealId],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, ParksOpportunityRecord[]>();

    for (const stage of PARKS_VISIBLE_PIPELINE_STAGES) {
      map.set(stage.id, []);
    }

    for (const opportunity of filteredItems) {
      const stage = normalizeParksPipelineStageId(opportunity.stage);
      const bucket = map.get(stage) ?? map.get('LEAD_RECIBIDO')!;
      bucket.push(opportunity);
    }

    return map;
  }, [filteredItems]);

  const handleDrop = useCallback(
    async (opportunityId: string, newStage: string) => {
      const opportunity = items.find((item) => item.id === opportunityId);

      if (!opportunity || opportunity.stage === newStage) {
        return;
      }

      setStageGateBlocker(null);

      const gateInput = buildParksStageGateOpportunityInput(opportunity);
      const localGateResult = validateParksStageTransition(
        opportunity.stage,
        newStage,
        gateInput,
      );

      if (!localGateResult.ok) {
        setStageGateBlocker({
          result: localGateResult,
          dealName: opportunity.name,
        });
        return;
      }

      try {
        const remoteGateResult = await validateParksStageGate({
          targetStage: newStage,
          opportunity: gateInput,
        });

        if (!remoteGateResult.ok) {
          setStageGateBlocker({
            result: {
              ok: false,
              error:
                remoteGateResult.error ?? t`No se puede avanzar de etapa`,
              missingRequirements: remoteGateResult.missingRequirements ?? [],
              targetStageLabel: newStage,
              actionHint: remoteGateResult.actionHint,
            },
            dealName: opportunity.name,
          });
          return;
        }
      } catch {
        // Client gate already passed; allow move if parks service is unreachable
      }

      setItems((previous) =>
        previous.map((item) =>
          item.id === opportunityId ? { ...item, stage: newStage } : item,
        ),
      );

      try {
        await updateOneRecord({
          objectNameSingular: 'opportunity',
          idToUpdate: opportunityId,
          updateOneRecordInput: { stage: newStage },
        });
      } catch {
        setItems(opportunities);
      }
    },
    [items, opportunities, updateOneRecord],
  );

  const handleDragStart = useCallback(
    (event: { operation: { source: { id: unknown } | null } }) => {
      const sourceId = event.operation.source?.id;

      if (sourceId != null) {
        setDraggingDealId(String(sourceId));
      }
    },
    [],
  );

  const handleDragEnd = useCallback(
    (event: {
      operation: {
        source: { id: unknown } | null;
        target: { id: unknown } | null;
      };
    }) => {
      setDraggingDealId(null);

      const sourceId = event.operation.source?.id;
      const targetId = event.operation.target?.id;

      if (sourceId == null || targetId == null) {
        return;
      }

      void handleDrop(String(sourceId), String(targetId));
    },
    [handleDrop],
  );

  const handleOpenRecord = useCallback(
    (dealId: string) => {
      openRecordInSidePanel({
        recordId: dealId,
        objectNameSingular: 'opportunity',
        resetNavigationStack: true,
      });
    },
    [openRecordInSidePanel],
  );

  const handleLeadCreated = useCallback(
    (payload: ParksLeadCreatedPayload) => {
      setItems((previous) => {
        if (previous.some((item) => item.id === payload.opportunityId)) {
          return previous;
        }

        return [...previous, buildOptimisticOpportunityRecord(payload)];
      });
      setUnassignedLeadsRefreshKey((previous) => previous + 1);
      void Promise.resolve(onOpportunitiesRefresh?.()).catch(() => undefined);
    },
    [onOpportunitiesRefresh],
  );

  if (items.length === 0) {
    return (
      <StyledParksPageStack>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <Button
            title={t`Nuevo lead`}
            variant="primary"
            onClick={() => setIsNewLeadModalOpen(true)}
          />
        </div>
        <ParksUnassignedLeadsBanner refreshKey={unassignedLeadsRefreshKey} />
        <ParksEmptyState
          title={t`No hay deals en el pipeline`}
          description={t`Los prospectos comerciales aparecerán aquí cuando se registren en Parks Industrial.`}
        />
        {isNewLeadModalOpen && (
          <ParksNewLeadModal
            onClose={() => setIsNewLeadModalOpen(false)}
            onCreated={handleLeadCreated}
          />
        )}
      </StyledParksPageStack>
    );
  }

  return (
    <StyledParksPageStack>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
        }}
      >
        <Button
          title={t`Nuevo lead`}
          variant="primary"
          onClick={() => setIsNewLeadModalOpen(true)}
        />
      </div>

      <ParksUnassignedLeadsBanner refreshKey={unassignedLeadsRefreshKey} />

      {stageGateBlocker ? (
        <ParksStageGateModal
          gateResult={stageGateBlocker.result}
          dealName={stageGateBlocker.dealName}
          onClose={() => setStageGateBlocker(null)}
        />
      ) : null}

      <ParksPipelineToolbar
        opportunities={items}
        filters={filters}
        onFiltersChange={setFilters}
        filteredCount={filteredItems.length}
        viewerName={displayName}
        isLeasingOfficer={isLeasingOfficer}
      />

      <StyledDragHint>
        {isLeasingOfficer
          ? t`Verde = asignado a ti · Usa el filtro para ver todos o solo sin asignar · Arrastra entre etapas operativas`
          : t`Arrastra cards solo entre etapas operativas · LOI, Legal y Ganado requieren tab Hoja · Si falta algo, verás qué completar`}
      </StyledDragHint>

      {filteredItems.length === 0 ? (
        <ParksEmptyState title={t`Ningún deal coincide con los filtros`} />
      ) : (
        <DragDropProvider
          sensors={PIPELINE_DND_SENSORS}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <StyledBoardLayout>
            <StyledBoard>
              {PARKS_VISIBLE_PIPELINE_STAGES.map((stage) => (
                <ParksPipelineColumn
                  key={stage.id}
                  stage={stage}
                  deals={grouped.get(stage.id) ?? []}
                  selectedDealId={selectedDealId}
                  draggingDealId={draggingDealId}
                  prospectScoresById={prospectScoresById}
                  viewerName={displayName}
                  onSelectDeal={setSelectedDealId}
                  onOpenRecord={handleOpenRecord}
                />
              ))}
            </StyledBoard>
          </StyledBoardLayout>

          <ParksResponsiveSheet
            isOpen={selectedDeal !== null}
            onClose={clearDealDeepLink}
            focusId="parks-pipeline-deal-detail"
            ariaLabelledBy="parks-deal-detail-title"
          >
            {selectedDeal ? (
              <ParksPipelineDealDetail
                deal={selectedDeal}
                onClose={clearDealDeepLink}
                initialTab={deepLinkTab}
                initialScrollTarget={deepLinkScrollTarget}
                onMoveToStage={(dealId, stageId) => {
                  void handleDrop(dealId, stageId);
                }}
                onDealUpdated={(dealId, update) => {
                  setItems((previous) =>
                    previous.map((item) =>
                      item.id === dealId ? { ...item, ...update } : item,
                    ),
                  );
                }}
              />
            ) : null}
          </ParksResponsiveSheet>

          <ParksPipelineDragOverlay
            dealsById={dealsById}
            prospectScoresById={prospectScoresById}
            viewerName={displayName}
          />
        </DragDropProvider>
      )}

      {isNewLeadModalOpen && (
        <ParksNewLeadModal
          onClose={() => setIsNewLeadModalOpen(false)}
          onCreated={handleLeadCreated}
        />
      )}
    </StyledParksPageStack>
  );
};
