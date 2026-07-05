'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DisbursementRepaymentChartProps {
  totalDisbursed: number;
  totalRepaid: number;
}

function formatCurrency(value: number) {
  return `N${value.toLocaleString()}`;
}

export function DisbursementRepaymentChart({
  totalDisbursed,
  totalRepaid,
}: DisbursementRepaymentChartProps) {
  const data = [
    { name: 'Disbursed', value: totalDisbursed, color: '#00296B' },
    { name: 'Paid Back', value: totalRepaid, color: '#D4A017' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-full h-full xl:h-[620px] flex flex-col">
      <div className="mb-4">
        <h3 className="font-semibold text-[#191919] text-[1.0625rem]">Loan Flow Overview</h3>
        <p className="text-sm text-[#7C7C7C] mt-1">Total disbursed loans vs total amount paid back</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl bg-[#F4F6FA] p-3">
          <p className="text-xs text-[#7C7C7C] mb-1">Total Disbursed</p>
          <p className="text-lg font-semibold text-[#191919]">{formatCurrency(totalDisbursed)}</p>
        </div>
        <div className="rounded-xl bg-[#FFF8E7] p-3">
          <p className="text-xs text-[#7C7C7C] mb-1">Total Paid Back</p>
          <p className="text-lg font-semibold text-[#191919]">{formatCurrency(totalRepaid)}</p>
        </div>
      </div>

      <div className="h-[320px] xl:h-auto xl:flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(value) => `N${Number(value).toLocaleString()}`}
              width={80}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Amount']}
              cursor={{ fill: 'rgba(0, 41, 107, 0.06)' }}
            />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={72}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
