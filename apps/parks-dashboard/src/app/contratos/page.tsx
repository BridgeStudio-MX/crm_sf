import Link from 'next/link';

import { Badge, Card } from '@/components/ui/primitives';
import { parksDataService } from '@/lib/parks-data.service';
import { getTwentyConfig } from '@/lib/twenty-api';
import { parseApprovalStage } from '@/lib/utils/constants';

const ContratosRoute = async () => {
  if (!getTwentyConfig().hasApiKey) {
    return (
      <Card>
        <h1 className="text-xl font-semibold">Configuración requerida</h1>
      </Card>
    );
  }

  const casos = await parksDataService.getCasosLegales();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contratos en aprobación</h1>
        <p className="text-sm text-slate-600">
          Casos legales activos con flujo de aprobación
        </p>
      </div>

      <div className="grid gap-4">
        {casos.map((caso) => {
          const stage = parseApprovalStage(caso.notasCatalina);

          return (
            <Card key={caso.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{caso.referencia}</p>
                  <p className="text-sm text-slate-600">
                    {caso.inquilino?.empresa ?? 'Sin inquilino'} ·{' '}
                    {caso.nave?.identificador ?? 'Sin nave'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color="blue">{stage}</Badge>
                  <Link
                    href={`/contratos/${caso.id}/aprobacion`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Ver aprobación
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ContratosRoute;
