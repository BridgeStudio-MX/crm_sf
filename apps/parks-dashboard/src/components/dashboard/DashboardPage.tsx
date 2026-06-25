import Link from 'next/link';
import {
  AlertTriangle,
  Building2,
  DollarSign,
  Percent,
} from 'lucide-react';

import { MetricCard } from '@/components/dashboard/MetricCard';
import { VencimientosChart } from '@/components/dashboard/VencimientosChart';
import { Badge, Card } from '@/components/ui/primitives';
import { parksDataService } from '@/lib/parks-data.service';
import {
  amountFromMicros,
  formatNumber,
  formatParksDate,
  formatUsd,
} from '@/lib/utils/format';

const buildVencimientosPorMes = (
  expedientes: Awaited<
    ReturnType<typeof parksDataService.getExpedientesActivos>
  >,
) => {
  const today = new Date();
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() + index, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = date.toLocaleDateString('es-MX', {
      month: 'short',
      year: '2-digit',
    });

    return { key, mes: label, contratos: 0, color: '#2563EB' };
  });

  for (const expediente of expedientes) {
    if (!expediente.fechaVencimiento) {
      continue;
    }

    const date = new Date(expediente.fechaVencimiento);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = months.find((month) => month.key === key);

    if (bucket) {
      bucket.contratos += 1;
    }
  }

  return months.map(({ mes, contratos, color }) => ({ mes, contratos, color }));
};

export const DashboardPage = async () => {
  const [parques, naves, expedientes, opportunities] = await Promise.all([
    parksDataService.getParques(),
    parksDataService.getNavesByParque(
      (await parksDataService.getParques())[0]?.id ?? '',
    ).catch(() => []),
    parksDataService.getExpedientesActivos(),
    parksDataService.getOpportunities(),
  ]);

  const allNavesCount = parques.reduce(
    (total, parque) => total + (parque.m2Totales ? 1 : 0),
    0,
  );
  const m2Rentados = parques.reduce(
    (total, parque) => total + (parque.m2Rentados ?? 0),
    0,
  );
  const m2Totales = parques.reduce(
    (total, parque) => total + (parque.m2Totales ?? 0),
    0,
  );
  const m2Disponibles = Math.max(m2Totales - m2Rentados, 0);
  const ocupacion =
    m2Totales > 0 ? Math.round((m2Rentados / m2Totales) * 100) : 0;
  const contratosPorVencer = expedientes.filter((expediente) => {
    if (!expediente.fechaVencimiento) {
      return false;
    }

    const dias =
      (new Date(expediente.fechaVencimiento).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24);

    return dias <= 90;
  }).length;
  const ingresosMensuales = expedientes.reduce(
    (total, expediente) => total + (expediente.rentaMensualUsd ?? 0),
    0,
  );
  const alertas = expedientes
    .filter((expediente) => {
      if (!expediente.fechaVencimiento) {
        return false;
      }

      const dias =
        (new Date(expediente.fechaVencimiento).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24);

      return dias <= 60;
    })
    .slice(0, 5);

  const recentDeals = opportunities.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Ejecutivo</h1>
        <p className="text-sm text-slate-600">
          Métricas consolidadas del grupo Parks Industrial
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="m² rentados / disponibles"
          value={`${formatNumber(m2Rentados)} / ${formatNumber(m2Disponibles)}`}
          icon={Building2}
          color="blue"
        />
        <MetricCard
          label="Tasa de ocupación"
          value={`${ocupacion}%`}
          trend={{ valor: 2.4, periodo: 'mes anterior' }}
          icon={Percent}
          color="green"
        />
        <MetricCard
          label="Ingresos mensuales estimados"
          value={formatUsd(ingresosMensuales)}
          icon={DollarSign}
          color="gray"
        />
        <MetricCard
          label="Contratos por vencer (90 días)"
          value={contratosPorVencer}
          icon={AlertTriangle}
          color={contratosPorVencer > 0 ? 'red' : 'green'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Vencimientos por mes</h2>
          <VencimientosChart data={buildVencimientosPorMes(expedientes)} />
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Alertas</h2>
          <div className="space-y-3">
            {alertas.length === 0 ? (
              <p className="text-sm text-slate-500">Sin alertas críticas</p>
            ) : (
              alertas.map((expediente) => (
                <div
                  key={expediente.id}
                  className="rounded-lg border border-red-100 bg-red-50 p-3"
                >
                  <p className="text-sm font-medium">
                    {expediente.inquilino?.empresa ?? 'Inquilino'}
                  </p>
                  <p className="text-xs text-slate-600">
                    Vence {formatParksDate(expediente.fechaVencimiento)}
                  </p>
                  <Link
                    href={`/contratos/${expediente.casoLegal?.id ?? expediente.id}/aprobacion`}
                    className="mt-2 inline-block text-xs font-medium text-red-700"
                  >
                    Ver contrato
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Ocupación por parque</h2>
          <div className="space-y-4">
            {parques.map((parque) => {
              const total = parque.m2Totales ?? 0;
              const rentados = parque.m2Rentados ?? 0;
              const pct = total > 0 ? Math.round((rentados / total) * 100) : 0;

              return (
                <div key={parque.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{parque.nombre}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-parks-blue"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Pipeline activo</h2>
          <div className="space-y-3">
            {recentDeals.map((deal) => (
              <div
                key={deal.id}
                className="rounded-lg border border-slate-200 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{deal.name}</p>
                  <Badge color="blue">{deal.stage ?? 'Sin etapa'}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {deal.naveVinculada?.identificador ?? 'Sin nave'} ·{' '}
                  {formatUsd(amountFromMicros(deal.amount?.amountMicros))}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <p className="text-xs text-slate-400">
        {allNavesCount} parques monitoreados · {naves.length} naves en parque
        principal
      </p>
    </div>
  );
};
