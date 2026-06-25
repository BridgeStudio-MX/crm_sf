'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type VencimientosChartProps = {
  data: { mes: string; contratos: number; color: string }[];
};

export const VencimientosChart = ({ data }: VencimientosChartProps) => (
  <div className="h-72 w-full overflow-x-auto">
    <ResponsiveContainer width="100%" height="100%" minWidth={480}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="contratos" fill="#2563EB" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
