import { StackingPlanPage } from '@/components/stacking-plan/StackingPlanPage';
import { Card } from '@/components/ui/primitives';
import { getTwentyConfig } from '@/lib/twenty-api';

type PageProps = {
  params: { parqueId: string };
};

const StackingPlanRoute = async ({ params }: PageProps) => {
  if (!getTwentyConfig().hasApiKey) {
    return (
      <Card>
        <h1 className="text-xl font-semibold">Configuración requerida</h1>
        <p className="mt-2 text-sm text-slate-600">
          Configura TWENTY_API_URL y TWENTY_API_KEY en .env.local
        </p>
      </Card>
    );
  }

  return <StackingPlanPage parqueId={params.parqueId} />;
};

export default StackingPlanRoute;
