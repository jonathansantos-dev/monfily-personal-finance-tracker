import { Suspense } from 'react';
import { getTransactions } from './actions';
import { getAccounts } from '../accounts/actions';
import { getCategories } from '../categories/actions';
import { CreateTransactionForm } from '@/components/create-transaction-form';
import { TransactionRow } from '@/components/transaction-row';
import { TransactionFilters } from '@/components/transaction-filters';

interface TransactionsPageProps {
  searchParams: Promise<{
    type?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

/**
 * Transactions page — server component.
 * Reads URL searchParams for filter state and passes them to getTransactions.
 * Renders the transaction list with edit/delete actions, filters, and create form.
 *
 * Validates: Requirements 5.1, 5.3, 5.4, 6.1, 6.2, 12.1
 */
export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const params = await searchParams;

  const typeParam = params.type;
  const typeFilter: 'income' | 'expense' | 'all' =
    typeParam === 'income' || typeParam === 'expense' ? typeParam : 'all';

  const filters = {
    type: typeFilter,
    startDate: params.startDate,
    endDate: params.endDate,
  };

  const [transactionsResult, accountsResult, categoriesResult] = await Promise.all([
    getTransactions(filters),
    getAccounts(),
    getCategories(),
  ]);

  const transactions = transactionsResult.success ? (transactionsResult.data ?? []) : [];
  const accounts = accountsResult.success ? (accountsResult.data ?? []) : [];
  const categories = categoriesResult.success ? (categoriesResult.data ?? []) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track your income and expenses
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={null}>
        <TransactionFilters />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transactions list */}
        <div className="lg:col-span-2 space-y-3">
          <section aria-label="Transactions list">
            {!transactionsResult.success && (
              <div
                role="alert"
                className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm font-medium"
              >
                {transactionsResult.error ?? 'Failed to load transactions'}
              </div>
            )}

            {transactionsResult.success && transactions.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                  />
                </svg>
                <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No transactions found
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {typeFilter !== 'all' || params.startDate || params.endDate
                    ? 'Try adjusting your filters to see more results.'
                    : 'Add your first transaction using the form to start tracking.'}
                </p>
              </div>
            )}

            {transactions.length > 0 && (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    accounts={accounts}
                    categories={categories}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Create transaction form */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              New Transaction
            </h2>
            <CreateTransactionForm accounts={accounts} categories={categories} />
          </div>
        </div>
      </div>
    </div>
  );
}
