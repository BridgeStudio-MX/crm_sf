import Link from 'next/link';

import { ApprovalTimeline } from '@/components/approval/ApprovalTimeline';
import { Badge, Card } from '@/components/ui/primitives';
import { parksDataService } from '@/lib/parks-data.service';
import {
  buildApprovalTimeline,
  parseApprovalStage,
} from '@/lib/utils/constants';

type ApprovalPageProps = {
  casoLegalId: string;
};

export const ApprovalPage = async ({ casoLegalId }: ApprovalPageProps) => {
  const casoLegal = await parksDataService.getCasoLegal(casoLegalId);

  if (!casoLegal) {
    return (
      <Card>
        <h1 className="text-xl font-semibold">Caso no encontrado</h1>
        <Link href="/contratos" className="mt-2 inline-block text-sm text-blue-600">
          Ver todos los contratos
        </Link>
      </Card>
    );
  }

  const currentStage = parseApprovalStage(casoLegal.notasCatalina);
  const timeline = buildApprovalTimeline(currentStage, casoLegal.notasCatalina);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Aprobación de contrato</h1>
        <Badge color="blue">{casoLegal.referencia}</Badge>
        <Badge
          color={
            casoLegal.semaforo === 'ROJO'
              ? 'red'
              : casoLegal.semaforo === 'AMARILLO'
                ? 'yellow'
                : 'green'
          }
        >
          {casoLegal.semaforo ?? casoLegal.estatus ?? 'En revisión'}
        </Badge>
      </div>

      <ApprovalTimeline
        casoLegal={casoLegal}
        timeline={timeline}
        currentStage={currentStage}
      />
    </div>
  );
};
