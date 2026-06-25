import { type StackingPlanNave } from '@/lib/types';
import { Button } from '@/components/ui/primitives';

type StackingPlanHeaderProps = {
  parqueNombre: string;
  naves: StackingPlanNave[];
};

export const StackingPlanHeader = ({
  parqueNombre,
  naves,
}: StackingPlanHeaderProps) => {
  const total = naves.length;
  const ocupadas = naves.filter(
    (nave) => nave.statusColor !== 'gray',
  ).length;
  const disponibles = naves.filter((nave) => nave.statusColor === 'gray').length;
  const porRenovar = naves.filter(
    (nave) => nave.statusColor === 'yellow' || nave.statusColor === 'red',
  ).length;
  const fechaReporte = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold">{parqueNombre}</h1>
        <p className="text-sm text-slate-600">Reporte al {fechaReporte}</p>
        <p className="mt-2 text-sm">
          {total} naves · {ocupadas} ocupadas · {disponibles} disponibles ·{' '}
          {porRenovar} por renovar
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary">Exportar a Excel</Button>
        <Button>Nueva Nave</Button>
      </div>
    </div>
  );
};

export const StackingPlanLegend = () => (
  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
    <span className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full bg-parks-green" />
      Activo (&gt;180 días)
    </span>
    <span className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full bg-parks-yellow" />
      Por renovar (90–180 días)
    </span>
    <span className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full bg-parks-red" />
      Vence pronto (&lt;90 días)
    </span>
    <span className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full bg-parks-gray" />
      Disponible
    </span>
  </div>
);
