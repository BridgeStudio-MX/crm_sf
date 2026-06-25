import { ParksMap } from '@/components/mapa/ParksMap';
import { Card } from '@/components/ui/primitives';
import { parksDataService } from '@/lib/parks-data.service';
import { getTwentyConfig } from '@/lib/twenty-api';

const MapaRoute = async () => {
  if (!getTwentyConfig().hasApiKey) {
    return (
      <Card>
        <h1 className="text-xl font-semibold">Configuración requerida</h1>
      </Card>
    );
  }

  const parques = await parksDataService.getParques();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mapa de parques</h1>
        <p className="text-sm text-slate-600">
          Ubicación y ocupación de parques industriales
        </p>
      </div>
      <ParksMap parques={parques} />
    </div>
  );
};

export default MapaRoute;
