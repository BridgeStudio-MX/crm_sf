'use client';

import { Check, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button, Card } from '@/components/ui/primitives';
import { UPDATE_CASO_LEGAL } from '@/lib/graphql/queries';
import {
  type ApprovalStage,
  type ApprovalStageId,
  type CasoLegalRecord,
} from '@/lib/types';
import { twentyClientMutate } from '@/lib/twenty-client';
import {
  buildApprovalNotas,
  getNextApprovalStage,
  parseApprovalStage,
} from '@/lib/utils/constants';
import { formatNumber, formatParksDate, formatUsd } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

type ApprovalTimelineProps = {
  casoLegal: CasoLegalRecord;
  timeline: ApprovalStage[];
  currentStage: ApprovalStageId;
};

export const ApprovalTimeline = ({
  casoLegal,
  timeline,
  currentStage,
}: ApprovalTimelineProps) => {
  const router = useRouter();
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    const nextStage = getNextApprovalStage(currentStage);

    if (!nextStage) {
      return;
    }

    setIsSubmitting(true);

    try {
      await twentyClientMutate(UPDATE_CASO_LEGAL, {
        id: casoLegal.id,
        data: {
          notasCatalina: buildApprovalNotas(nextStage, comentario),
          estatus: nextStage === 'firma' ? 'APROBADO' : 'EN_REVISION',
        },
      });
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const hoja = casoLegal.hojaDeAcuerdos;
  const rentaEstimada =
    (hoja?.m2Acordados ?? 0) * (hoja?.precioUsdM2 ?? 0);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <h2 className="mb-6 text-lg font-semibold">Flujo de aprobación</h2>
        <ol className="space-y-6">
          {timeline.map((stage) => (
            <li key={stage.id} className="flex gap-4">
              <div
                className={cn(
                  'mt-1 flex h-8 w-8 items-center justify-center rounded-full border-2',
                  stage.status === 'completed' &&
                    'border-green-600 bg-green-600 text-white',
                  stage.status === 'active' &&
                    'approval-pulse border-blue-600 bg-blue-600 text-white',
                  stage.status === 'pending' &&
                    'border-slate-300 text-slate-400',
                )}
              >
                {stage.status === 'completed' ? (
                  <Check size={16} />
                ) : (
                  <Circle size={14} />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{stage.label}</p>
                <p className="text-sm text-slate-600">
                  Responsable: {stage.responsable}
                </p>
                {stage.status === 'active' ? (
                  <textarea
                    value={comentario}
                    onChange={(event) => setComentario(event.target.value)}
                    placeholder="Comentarios de aprobación..."
                    className="mt-3 w-full rounded-lg border border-slate-300 p-3 text-sm"
                    rows={3}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        {getNextApprovalStage(currentStage) ? (
          <Button
            className="mt-6"
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            Aprobar etapa actual
          </Button>
        ) : (
          <p className="mt-6 text-sm font-medium text-green-700">
            Contrato aprobado en todas las etapas
          </p>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Resumen del contrato</h2>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-slate-500">Referencia</dt>
            <dd className="font-medium">{casoLegal.referencia}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Inquilino</dt>
            <dd>{casoLegal.inquilino?.empresa ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Nave</dt>
            <dd>{casoLegal.nave?.identificador ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">m² acordados</dt>
            <dd>{formatNumber(hoja?.m2Acordados)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Precio USD/m²</dt>
            <dd>{formatUsd(hoja?.precioUsdM2)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Plazo</dt>
            <dd>{hoja?.plazoMeses ? `${hoja.plazoMeses} meses` : '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Renta mensual estimada</dt>
            <dd className="font-semibold">{formatUsd(rentaEstimada)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Inicio</dt>
            <dd>{formatParksDate(hoja?.fechaInicio)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
};
