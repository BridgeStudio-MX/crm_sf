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
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import {
  type ParksPipelineFilters,
  ParksPipelineToolbar,
} from '@/parks-industrial/components/pipeline/ParksPipelineToolbar';
import { ParksPipelineColumn } from '@/parks-industrial/components/pipeline/ParksPipelineColumn';
import { ParksPipelineDealDetail } from '@/parks-industrial/components/pipeline/ParksPipelineDealDetail';
import { ParksPipelineDragOverlay } from '@/parks-industrial/components/pipeline/ParksPipelineDragOverlay';
import { ParksDetailDrawer } from '@/parks-industrial/components/ui/ParksDetailDrawer';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { getParksOwnerName } from '@/parks-industrial/utils/parks-format.util';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';

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
}: ParksPipelineBoardProps) => {
  const [items, setItems] = useState(opportunities);
  const [filters, setFilters] = useState<ParksPipelineFilters>({
    searchQuery: '',
    ownerFilter: '',
  });
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const { updateOneRecord } = useUpdateOneRecord();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  useEffect(() => {
    setItems(opportunities);
  }, [opportunities]);

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
      const stage = opportunity.stage ?? 'LEAD_RECIBIDO';
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

  if (items.length === 0) {
    return (
      <ParksEmptyState
        title={t`No hay deals en el pipeline`}
        description={t`Los prospectos comerciales aparecerán aquí cuando se registren en Twenty.`}
      />
    );
  }

  return (
    <StyledParksPageStack>
      <ParksPipelineToolbar
        opportunities={items}
        filters={filters}
        onFiltersChange={setFilters}
        filteredCount={filteredItems.length}
      />

      <StyledDragHint>
        {t`Arrastra cualquier card a otra columna para cambiar de etapa · Clic para detalle · Doble clic para abrir registro`}
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
                  onSelectDeal={setSelectedDealId}
                  onOpenRecord={handleOpenRecord}
                />
              ))}
            </StyledBoard>
          </StyledBoardLayout>

          <ParksDetailDrawer
            isOpen={selectedDeal !== null}
            onClose={() => setSelectedDealId(null)}
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
          </ParksDetailDrawer>

          <ParksPipelineDragOverlay dealsById={dealsById} />
        </DragDropProvider>
      )}
    </StyledParksPageStack>
  );
};
