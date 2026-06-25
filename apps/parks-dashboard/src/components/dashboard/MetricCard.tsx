import { type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

type MetricCardProps = {
  label: string;
  value: string | number;
  trend?: { valor: number; periodo: string };
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  icon?: LucideIcon;
};

const colorMap = {
  green: 'border-green-200 bg-green-50 text-green-900',
  yellow: 'border-amber-200 bg-amber-50 text-amber-900',
  red: 'border-red-200 bg-red-50 text-red-900',
  blue: 'border-blue-200 bg-blue-50 text-blue-900',
  gray: 'border-slate-200 bg-white text-slate-900',
};

export const MetricCard = ({
  label,
  value,
  trend,
  color = 'gray',
  icon: Icon,
}: MetricCardProps) => (
  <div className={cn('rounded-xl border p-4 shadow-sm', colorMap[color])}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium opacity-80">{label}</p>
        <p className="mt-2 text-2xl font-bold">{value}</p>
        {trend ? (
          <p className="mt-1 text-xs opacity-70">
            {trend.valor > 0 ? '+' : ''}
            {trend.valor}% vs {trend.periodo}
          </p>
        ) : null}
      </div>
      {Icon ? <Icon className="opacity-60" size={22} /> : null}
    </div>
  </div>
);
