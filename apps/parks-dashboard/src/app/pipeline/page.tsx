import { PipelineBoard } from '@/components/pipeline/PipelineBoard';
import { Card } from '@/components/ui/primitives';
import { parksDataService } from '@/lib/parks-data.service';
import { getTwentyConfig } from '@/lib/twenty-api';

const PipelineRoute = async () => {
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

  const opportunities = await parksDataService.getOpportunities();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pipeline Comercial</h1>
        <p className="text-sm text-slate-600">
          Arrastra deals entre etapas para actualizar su estatus
        </p>
      </div>
      <PipelineBoard opportunities={opportunities} />
    </div>
  );
};

export default PipelineRoute;
