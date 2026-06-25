import { type StackingPlanNave } from '@/lib/types';
import { formatNumber, formatParksDate, formatUsd } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

const statusBorder = {
  green: 'border-l-parks-green',
  yellow: 'border-l-parks-yellow',
  red: 'border-l-parks-red',
  gray: 'border-l-parks-gray',
};

const statusBadge = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-slate-100 text-slate-700',
};

type StackingPlanGridProps = {
  naves: StackingPlanNave[];
};

export const StackingPlanGrid = ({ naves }: StackingPlanGridProps) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {naves.map((nave) => (
      <article
        key={nave.id}
        className={cn(
          'rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm',
          statusBorder[nave.statusColor],
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{nave.identificador}</h3>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              statusBadge[nave.statusColor],
            )}
          >
            {nave.statusLabel}
          </span>
        </div>

        <dl className="mt-3 space-y-1 text-sm text-slate-600">
          <div className="flex justify-between">
            <dt>m²</dt>
            <dd>{formatNumber(nave.m2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Inquilino</dt>
            <dd className="max-w-[60%] truncate text-right">
              {nave.expedienteActivo?.inquilino?.empresa ?? 'Disponible'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Vencimiento</dt>
            <dd>{formatParksDate(nave.expedienteActivo?.fechaVencimiento)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Días restantes</dt>
            <dd>
              {nave.diasRestantes !== null && nave.diasRestantes !== undefined
                ? `${nave.diasRestantes} días`
                : '—'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Precio/m²</dt>
            <dd>{formatUsd(nave.precioBaseUsd)}</dd>
          </div>
        </dl>
      </article>
    ))}
  </div>
);
