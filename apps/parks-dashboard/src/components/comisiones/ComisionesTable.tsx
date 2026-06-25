'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Badge, Button, Card } from '@/components/ui/primitives';
import { UPDATE_COMISION } from '@/lib/graphql/queries';
import { type ComisionRecord } from '@/lib/types';
import { twentyClientMutate } from '@/lib/twenty-client';
import { formatUsd } from '@/lib/utils/format';

type ComisionesTableProps = {
  comisiones: ComisionRecord[];
};

const statusColor = (
  estatus?: string,
): 'yellow' | 'green' | 'blue' | 'gray' => {
  if (estatus === 'PAGADA') {
    return 'green';
  }

  if (estatus === 'APROBADA') {
    return 'blue';
  }

  if (estatus === 'PENDIENTE') {
    return 'yellow';
  }

  return 'gray';
};

export const ComisionesTable = ({ comisiones }: ComisionesTableProps) => {
  const router = useRouter();
  const [items, setItems] = useState(comisiones);
  const [brokerFilter, setBrokerFilter] = useState('');

  const filtered = useMemo(() => {
    if (!brokerFilter) {
      return items;
    }

    return items.filter((comision) =>
      (comision.beneficiario ?? '')
        .toLowerCase()
        .includes(brokerFilter.toLowerCase()),
    );
  }, [items, brokerFilter]);

  const totalPendiente = filtered
    .filter((comision) => comision.estatus === 'PENDIENTE')
    .reduce((sum, comision) => sum + (comision.montoUsd ?? 0), 0);

  const totalMes = filtered.reduce(
    (sum, comision) => sum + (comision.montoUsd ?? 0),
    0,
  );

  const handleApprove = async (comisionId: string) => {
    setItems((previous) =>
      previous.map((comision) =>
        comision.id === comisionId
          ? { ...comision, estatus: 'APROBADA' }
          : comision,
      ),
    );

    try {
      await twentyClientMutate(UPDATE_COMISION, {
        id: comisionId,
        data: { estatus: 'APROBADA' },
      });
      router.refresh();
    } catch {
      setItems(comisiones);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Filtrar por broker..."
          value={brokerFilter}
          onChange={(event) => setBrokerFilter(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Broker</th>
              <th className="px-4 py-3 font-medium">Deal / contrato</th>
              <th className="px-4 py-3 font-medium">Nave</th>
              <th className="px-4 py-3 font-medium">Base</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((comision) => (
              <tr key={comision.id} className="border-b border-slate-100">
                <td className="px-4 py-3">{comision.beneficiario ?? '—'}</td>
                <td className="px-4 py-3">
                  {comision.casoLegal?.referencia ??
                    comision.hojaDeAcuerdos?.referencia ??
                    '—'}
                </td>
                <td className="px-4 py-3">
                  {comision.hojaDeAcuerdos?.nave?.identificador ?? '—'}
                </td>
                <td className="px-4 py-3">{comision.baseCalculo ?? '—'}</td>
                <td className="px-4 py-3 font-medium">
                  {formatUsd(comision.montoUsd)}
                </td>
                <td className="px-4 py-3">
                  <Badge color={statusColor(comision.estatus)}>
                    {comision.estatus ?? 'PENDIENTE'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {comision.estatus === 'PENDIENTE' ? (
                    <Button
                      variant="secondary"
                      className="px-3 py-1 text-xs"
                      onClick={() => handleApprove(comision.id)}
                    >
                      Aprobar pago
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-600">Total comisiones pendientes</p>
          <p className="text-xl font-bold">{formatUsd(totalPendiente)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-600">Total comisiones (filtro)</p>
          <p className="text-xl font-bold">{formatUsd(totalMes)}</p>
        </Card>
      </div>
    </div>
  );
};

type ComisionSummaryByBrokerProps = {
  comisiones: ComisionRecord[];
};

export const ComisionSummaryByBroker = ({
  comisiones,
}: ComisionSummaryByBrokerProps) => {
  const ranking = useMemo(() => {
    const map = new Map<string, { deals: number; total: number }>();

    for (const comision of comisiones) {
      const broker = comision.beneficiario ?? 'Sin broker';
      const current = map.get(broker) ?? { deals: 0, total: 0 };
      current.deals += 1;
      current.total += comision.montoUsd ?? 0;
      map.set(broker, current);
    }

    return [...map.entries()]
      .map(([broker, stats]) => ({ broker, ...stats }))
      .sort((left, right) => right.total - left.total);
  }, [comisiones]);

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Ranking de brokers</h2>
      <div className="space-y-4">
        {ranking.map((entry, index) => (
          <div key={entry.broker}>
            <div className="mb-1 flex justify-between text-sm">
              <span>
                #{index + 1} {entry.broker}
              </span>
              <span>{formatUsd(entry.total)}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-parks-blue"
                style={{
                  width: `${Math.min(
                    100,
                    (entry.total / (ranking[0]?.total || 1)) * 100,
                  )}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {entry.deals} deals cerrados
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
