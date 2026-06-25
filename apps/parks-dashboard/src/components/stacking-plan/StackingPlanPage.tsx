import Link from 'next/link';

import {
  StackingPlanHeader,
  StackingPlanLegend,
} from '@/components/stacking-plan/StackingPlanHeader';
import { StackingPlanGrid } from '@/components/stacking-plan/StackingPlanGrid';
import { Card } from '@/components/ui/primitives';
import { parksDataService } from '@/lib/parks-data.service';

type StackingPlanPageProps = {
  parqueId: string;
};

export const StackingPlanPage = async ({ parqueId }: StackingPlanPageProps) => {
  const { parque, naves } = await parksDataService.getStackingPlan(parqueId);

  if (!parque) {
    return (
      <Card>
        <h1 className="text-xl font-semibold">Parque no encontrado</h1>
        <Link href="/dashboard" className="mt-2 inline-block text-sm text-blue-600">
          Volver al dashboard
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <StackingPlanHeader parqueNombre={parque.nombre} naves={naves} />
      <StackingPlanLegend />
      <StackingPlanGrid naves={naves} />
    </div>
  );
};
