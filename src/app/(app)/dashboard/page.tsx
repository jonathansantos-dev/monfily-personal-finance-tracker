import { getTotalBalance, getMonthlyChartData, getRecentTransactions } from './actions';
import type { DashboardTransaction } from './actions';
import { MonthlyChart } from '@/components/monthly-chart';
import { formatCurrency } from '../../../../lib/utils/currency';

/**
 * Formats a date string (YYYY-MM-DD) to a human-readable format.
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Dashboard page — server component that displays:
 * - Total balance card (sum of all accounts)
 * - Income vs. Expenses bar chart for the current month
 * - Recent transactions list (10 most recent)
 *
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5
 */
export default async function DashboardPage(): Promise<React.ReactElement> {
  const [balanceResult, chartResult, transactionsResult] = await Promise.all([
    getTotalBalance(),
    getMonthlyChartData(),
    getRecentTransactions(),
  ]);

  const totalBalanceCents = balanceResult.data ?? 0;
  const chartData = chartResult.data ?? { income: 0, expenses: 0 };
  const recentTransactions = transactionsResult.data ?? [];
  const hasAccounts = balanceResult.success && balanceResult.data !== undefined;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>

      {/* Total Balance Card */}
      <TotalBalanceCard
        totalCents={totalBalanceCents}
        hasAccounts={hasAccounts && totalBalanceCents !== 0}
      />

      {/* Income vs Expenses Chart */}
      <MonthlyChart data={chartData} />

      {/* Recent Transactions */}
      <RecentTransactionsList transactions={recentTransactions} />
    </div>
  );
}

/**
 * Total balance card displaying the sum of all account balances formatted as USD.
 * Shows $0.00 with a message when no accounts exist (Req 4.4).
 */
function TotalBalanceCard({
  totalCents,
  hasAccounts,
}: {
  totalCents: number;
  hasAccounts: boolean;
}): React.ReactElement {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</p>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
        {formatCurrency(totalCents)}
      </p>
      {!hasAccounts && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No accounts yet</p>
      )}
    </div>
  );
}

/**
 * Recent transactions list showing the 10 most recent transactions.
 * Displays category icon, name, colored amount, and date.
 * Shows empty state when no transactions exist.
 *
 * Validates: Requirements 4.3
 */
function RecentTransactionsList({
  transactions,
}: {
  transactions: DashboardTransaction[];
}): React.ReactElement {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Recent Transactions
      </h2>

      {transactions.length === 0 ? (
        <div className="mt-6 flex h-32 items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No transactions yet</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-800" role="list">
          {transactions.map((transaction) => (
            <RecentTransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Single transaction item in the recent transactions list.
 * Shows category icon, category name, amount (colored by type), and date.
 */
function RecentTransactionItem({
  transaction,
}: {
  transaction: DashboardTransaction;
}): React.ReactElement {
  const isIncome = transaction.type === 'income';

  return (
    <li className="flex items-center gap-3 py-3">
      {/* Category icon */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm"
        style={{ backgroundColor: transaction.categories?.color ?? '#6366f1' }}
        aria-hidden="true"
      >
        {transaction.categories?.icon ?? '📦'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {transaction.categories?.name ?? 'Uncategorized'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {transaction.accounts?.name ?? 'Unknown Account'}
        </p>
      </div>

      {/* Amount and date */}
      <div className="text-right shrink-0">
        <p
          className={`text-sm font-semibold ${
            isIncome
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount_cents)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(transaction.date)}
        </p>
      </div>
    </li>
  );
}
