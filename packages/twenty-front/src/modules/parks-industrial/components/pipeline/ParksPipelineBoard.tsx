import { PointerActivationConstraints } from '@dnd-kit/dom';
import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { getParksOwnerName } from '@/parks-industrial/utils/parks-format.util';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { validateParksStageGate } from '@/parks-industrial/services/parks-commercial.client';
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
): ParksOpportunityRecord[] =>
  opportunities.filter((opportunity) => {
    if (opportunity.stage === 'PERDIDO') {
      return false;
    }

    const ownerName = getParksOwnerName(opportunity);
    const searchTarget = [
      opportunity.name,
      opportunity.inquilinoVinculado?.empresa,
      opportunity.naveVinculada?.identificador,
      ownerName,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch =
      filters.searchQuery.length === 0 ||
      searchTarget.includes(filters.searchQuery.toLowerCase());

    const matchesOwner =
      filters.ownerFilter.length === 0 || ownerName === filters.ownerFilter;

    return matchesSearch && matchesOwner;
  });

export const ParksPipelineBoard = ({
  opportunities,
  onOpportunitiesRefresh,
}: ParksPipelineBoardProps) => {
  const safeOpportunities = opportunities ?? [];
  const [items, setItems] = useState(safeOpportunities);
  const [filters, setFilters] = useState<ParksPipelineFilters>({
    searchQuery: '',
    ownerFilter: '',
  });
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
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

  const filteredItems = useMemo(
    () => filterOpportunities(items, filters),
    [filters, items],
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
      />

      <StyledDragHint>
        {t`Arrastra cards solo entre etapas operativas · LOI, Legal y Ganado requieren Flujo comercial · Si falta algo, verás qué completar`}
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
                  onSelectDeal={setSelectedDealId}
                  onOpenRecord={handleOpenRecord}
                />
              ))}
            </StyledBoard>
          </StyledBoardLayout>

          <ParksResponsiveSheet
            isOpen={selectedDeal !== null}
            onClose={() => setSelectedDealId(null)}
            focusId="parks-pipeline-deal-detail"
            ariaLabelledBy="parks-deal-detail-title"
          >
            {selectedDeal ? (
              <ParksPipelineDealDetail
                deal={selectedDeal}
                onClose={() => setSelectedDealId(null)}
                onMoveToStage={(dealId, stageId) => {
                  void handleDrop(dealId, stageId);
                }}
              />
            ) : null}
          </ParksResponsiveSheet>

          <ParksPipelineDragOverlay
            dealsById={dealsById}
            prospectScoresById={prospectScoresById}
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
