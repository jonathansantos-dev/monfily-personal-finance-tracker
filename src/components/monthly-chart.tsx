'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';
import type { MonthlyChartData } from '@/app/(app)/dashboard/actions';
import { formatCurrency } from '../../lib/utils/currency';

interface MonthlyChartProps {
  data: MonthlyChartData;
}

interface ChartDataItem {
  name: string;
  amount: number;
  fill: string;
}

/**
 * Custom tooltip component for the bar chart.
 */
function CustomTooltip({ active, payload }: TooltipProps<number, string>): React.ReactElement | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0];

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {item.name}: {formatCurrency(item.value ?? 0)}
      </p>
    </div>
  );
}

/**
 * Client component displaying income vs. expenses as a bar chart for the current month.
 * Uses Recharts BarChart with responsive container.
 * Shows zero-height bars when no transactions exist (Req 4.5).
 *
 * Validates: Requirements 4.2, 4.5
 */
export function MonthlyChart({ data }: MonthlyChartProps): React.ReactElement {
  const chartData: ChartDataItem[] = [
    { name: 'Income', amount: data.income, fill: '#22c55e' },
    { name: 'Expenses', amount: data.expenses, fill: '#ef4444' },
  ];

  const hasData = data.income > 0 || data.expenses > 0;

  const currentMonth = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Income vs. Expenses
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{currentMonth}</p>

      {!hasData ? (
        <div className="mt-6 flex h-48 items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No transactions this month
          </p>
        </div>
      ) : (
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fill: '#6b7280' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value: number) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
