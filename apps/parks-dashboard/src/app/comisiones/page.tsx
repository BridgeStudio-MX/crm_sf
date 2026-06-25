import {
  ComisionSummaryByBroker,
  ComisionesTable,
} from '@/components/comisiones/ComisionesTable';
import { Card } from '@/components/ui/primitives';
import { parksDataService } from '@/lib/parks-data.service';
import { getTwentyConfig } from '@/lib/twenty-api';

const ComisionesRoute = async () => {
  if (!getTwentyConfig().hasApiKey) {
    return (
      <Card>
        <h1 className="text-xl font-semibold">Configuración requerida</h1>
      </Card>
    );
  }

  const comisiones = await parksDataService.getComisiones();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Motor de comisiones</h1>
        <p className="text-sm text-slate-600">
          Comisiones de brokers por deal y contrato
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ComisionesTable comisiones={comisiones} />
        </div>
        <ComisionSummaryByBroker comisiones={comisiones} />
      </div>
    </div>
  );
};

export default ComisionesRoute;
