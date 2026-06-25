'use client';

import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/primitives';
import { UPDATE_OPPORTUNITY_STAGE } from '@/lib/graphql/queries';
import { type OpportunityRecord } from '@/lib/types';
import { twentyClientMutate } from '@/lib/twenty-client';
import { PIPELINE_STAGES } from '@/lib/utils/constants';
import {
  amountFromMicros,
  formatNumber,
  formatUsd,
} from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

type PipelineBoardProps = {
  opportunities: OpportunityRecord[];
};

const getOwnerName = (opportunity: OpportunityRecord): string => {
  const firstName = opportunity.owner?.name?.firstName ?? '';
  const lastName = opportunity.owner?.name?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || 'Sin asignar';
};

const getDaysInStageColor = (updatedAt?: string): 'gray' | 'yellow' | 'red' => {
  if (!updatedAt) {
    return 'gray';
  }

  const days = Math.floor(
    (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days > 30) {
    return 'red';
  }

  if (days > 14) {
    return 'yellow';
  }

  return 'gray';
};

type DealCardProps = {
  deal: OpportunityRecord;
};

const DealCard = ({ deal }: DealCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: deal.id });

  const daysColor = getDaysInStageColor(deal.updatedAt);
  const daysInStage = deal.updatedAt
    ? Math.floor(
        (Date.now() - new Date(deal.updatedAt).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-3 shadow-sm',
        isDragging && 'opacity-60',
      )}
      {...listeners}
      {...attributes}
    >
      <p className="font-medium">{deal.name}</p>
      <p className="mt-1 text-xs text-slate-600">
        {deal.inquilinoVinculado?.empresa ?? 'Prospecto'}
      </p>
      <p className="mt-2 text-sm font-semibold">
        {formatUsd(amountFromMicros(deal.amount?.amountMicros))}
      </p>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
        <span>{deal.naveVinculada?.identificador ?? 'Sin nave'}</span>
        <span>·</span>
        <span>{formatNumber(deal.m2Requeridos)} m²</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{getOwnerName(deal)}</p>
      <span
        className={cn(
          'mt-2 inline-flex rounded-full px-2 py-0.5 text-xs',
          daysColor === 'red' && 'bg-red-100 text-red-800',
          daysColor === 'yellow' && 'bg-amber-100 text-amber-800',
          daysColor === 'gray' && 'bg-slate-100 text-slate-600',
        )}
      >
        {daysInStage} días en etapa
      </span>
    </div>
  );
};

type PipelineColumnProps = {
  stageId: string;
  stageLabel: string;
  deals: OpportunityRecord[];
};

const PipelineColumn = ({
  stageId,
  stageLabel,
  deals,
}: PipelineColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: stageId });
  const totalValue = deals.reduce(
    (sum, deal) => sum + amountFromMicros(deal.amount?.amountMicros),
    0,
  );

  return (
    <div className="min-w-[280px] flex-shrink-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{stageLabel}</h3>
        <div className="flex items-center gap-2">
          <Badge>{deals.length}</Badge>
          <span className="text-xs text-slate-500">
            {formatUsd(totalValue)}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'min-h-[420px] space-y-3 rounded-xl border border-dashed p-3',
          isOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 bg-slate-50',
        )}
      >
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
};

export const PipelineBoard = ({ opportunities }: PipelineBoardProps) => {
  const router = useRouter();
  const [items, setItems] = useState(opportunities);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const grouped = useMemo(() => {
    const map = new Map<string, OpportunityRecord[]>();

    for (const stage of PIPELINE_STAGES) {
      map.set(stage.id, []);
    }

    for (const opportunity of items) {
      const stage = opportunity.stage ?? 'LEAD_RECIBIDO';
      const bucket = map.get(stage) ?? map.get('LEAD_RECIBIDO')!;
      bucket.push(opportunity);
    }

    return map;
  }, [items]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const opportunityId = String(active.id);
    const newStage = String(over.id);
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
      await twentyClientMutate(UPDATE_OPPORTUNITY_STAGE, {
        id: opportunityId,
        stage: newStage,
      });
      router.refresh();
    } catch {
      setItems(opportunities);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stageId={stage.id}
            stageLabel={stage.label}
            deals={grouped.get(stage.id) ?? []}
          />
        ))}
      </div>
    </DndContext>
  );
};
