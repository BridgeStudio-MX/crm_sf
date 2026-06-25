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

import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { PARKS_VISIBLE_RENOVACION_STAGES } from '@/parks-industrial/constants/parks-industrial.constants';
import { ParksRenovacionesKanbanColumn } from '@/parks-industrial/components/renovaciones/ParksRenovacionesKanbanColumn';
import { ParksRenovacionesKanbanDragOverlay } from '@/parks-industrial/components/renovaciones/ParksRenovacionesKanbanDragOverlay';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import {
  buildParksRenovacionKanbanItems,
  type ParksRenovacionKanbanItem,
  type ParksRenovacionQueueItem,
} from '@/parks-industrial/utils/parks-renovaciones.util';

const RENOVACION_DND_SENSORS = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 8 }),
    ],
  }),
  KeyboardSensor,
];

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

type ParksRenovacionesKanbanBoardProps = {
  queue: ParksRenovacionQueueItem[];
  opportunities: ParksOpportunityRecord[];
};

export const ParksRenovacionesKanbanBoard = ({
  queue,
  opportunities,
}: ParksRenovacionesKanbanBoardProps) => {
  const initialItems = useMemo(
    () => buildParksRenovacionKanbanItems({ queue, opportunities }),
    [opportunities, queue],
  );
  const [items, setItems] = useState(initialItems);
  const [selectedDragId, setSelectedDragId] = useState<string | null>(null);
  const [draggingDragId, setDraggingDragId] = useState<string | null>(null);
  const { updateOneRecord } = useUpdateOneRecord();
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: 'opportunity',
  });

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const itemsByDragId = useMemo(
    () => new Map(items.map((item) => [item.dragId, item])),
    [items],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, ParksRenovacionKanbanItem[]>();

    for (const stage of PARKS_VISIBLE_RENOVACION_STAGES) {
      map.set(stage.id, []);
    }

    for (const item of items) {
      const stageId = item.etapaRenovacionStageId;
      const bucket = map.get(stageId) ?? map.get('ALERTA_12_MESES')!;
      bucket.push(item);
    }

    return map;
  }, [items]);

  const resolveOpportunityId = useCallback(
    async (item: ParksRenovacionKanbanItem): Promise<string | null> => {
      if (item.opportunityId) {
        return item.opportunityId;
      }

      const expediente = item.expediente;
      const naveId = expediente.nave?.id;
      const inquilinoId = expediente.inquilino?.id;

      if (!naveId) {
        return null;
      }

      const createdOpportunity = await createOneRecord({
        name: t`Renovación — ${item.tenantLabel}`,
        stage: 'EN_NEGOCIACION',
        etapaRenovacion: item.etapaRenovacionStageId,
        m2Requeridos: expediente.nave?.m2 ?? 0,
        naveVinculadaId: naveId,
        ...(inquilinoId ? { inquilinoVinculadoId: inquilinoId } : {}),
        tipoOperacion: 'Renovación',
        canalOrigen: 'Directo',
      });

      return createdOpportunity?.id ?? null;
    },
    [createOneRecord],
  );

  const handleDrop = useCallback(
    async (dragId: string, newStageId: string) => {
      const item = items.find((kanbanItem) => kanbanItem.dragId === dragId);

      if (!item || item.etapaRenovacionStageId === newStageId) {
        return;
      }

      const previousItems = items;

      setItems((previous) =>
        previous.map((kanbanItem) =>
          kanbanItem.dragId === dragId
            ? { ...kanbanItem, etapaRenovacionStageId: newStageId }
            : kanbanItem,
        ),
      );

      try {
        const opportunityId = await resolveOpportunityId(item);

        if (!opportunityId) {
          throw new Error('Missing opportunity');
        }

        await updateOneRecord({
          objectNameSingular: 'opportunity',
          idToUpdate: opportunityId,
          updateOneRecordInput: { etapaRenovacion: newStageId },
        });

        setItems((previous) =>
          previous.map((kanbanItem) =>
            kanbanItem.dragId === dragId
              ? {
                  ...kanbanItem,
                  opportunityId,
                  dragId: opportunityId,
                  etapaRenovacionStageId: newStageId,
                }
              : kanbanItem,
          ),
        );
      } catch {
        setItems(previousItems);
      }
    },
    [items, resolveOpportunityId, updateOneRecord],
  );

  const handleDragStart = useCallback(
    (event: { operation: { source: { id: unknown } | null } }) => {
      const sourceId = event.operation.source?.id;

      if (sourceId != null) {
        setDraggingDragId(String(sourceId));
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
      setDraggingDragId(null);

      const sourceId = event.operation.source?.id;
      const targetId = event.operation.target?.id;

      if (sourceId == null || targetId == null) {
        return;
      }

      void handleDrop(String(sourceId), String(targetId));
    },
    [handleDrop],
  );

  if (items.length === 0) {
    return (
      <ParksEmptyState
        title={t`No hay renovaciones en cola`}
        description={t`Los contratos por vencer aparecerán aquí para gestionar su etapa de renovación.`}
      />
    );
  }

  return (
    <StyledParksPageStack>
      <StyledDragHint>
        {t`Arrastra cada renovación entre etapas · Se actualiza opportunity.etapaRenovacion en Twenty`}
      </StyledDragHint>

      <DragDropProvider
        sensors={RENOVACION_DND_SENSORS}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <StyledBoard>
          {PARKS_VISIBLE_RENOVACION_STAGES.map((stage) => (
            <ParksRenovacionesKanbanColumn
              key={stage.id}
              stage={stage}
              items={grouped.get(stage.id) ?? []}
              selectedDragId={selectedDragId}
              draggingDragId={draggingDragId}
              onSelectItem={setSelectedDragId}
            />
          ))}
        </StyledBoard>

        <ParksRenovacionesKanbanDragOverlay itemsByDragId={itemsByDragId} />
      </DragDropProvider>
    </StyledParksPageStack>
  );
};
