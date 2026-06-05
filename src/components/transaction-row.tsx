'use client';

import { useState } from 'react';
import { deleteTransaction } from '@/app/(app)/transactions/actions';
import type { TransactionWithRelations } from '@/app/(app)/transactions/actions';
import { EditTransactionDialog } from './edit-transaction-dialog';
import { formatCurrency } from '../../lib/utils/currency';
import type { Account, Category } from '../../lib/types/database';

interface TransactionRowProps {
  transaction: TransactionWithRelations;
  accounts: Account[];
  categories: Category[];
}

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
 * Client component rendering a single transaction row with edit and delete actions.
 * Delete calls deleteTransaction directly (which handles balance reversal).
 * Edit opens the EditTransactionDialog.
 *
 * Validates: Requirements 5.3, 5.4, 5.5
 */
export function TransactionRow({ transaction, accounts, categories }: TransactionRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isIncome = transaction.type === 'income';

  async function handleDelete(): Promise<void> {
    setError(null);
    setIsDeleting(true);

    try {
      const result = await deleteTransaction(transaction.id);

      if (!result.success) {
        setError(result.error ?? 'Failed to delete transaction.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {/* Category icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: transaction.categories?.color ?? '#6366f1' }}
          aria-hidden="true"
        >
          {transaction.categories?.icon ?? '📦'}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {transaction.categories?.name ?? 'Uncategorized'}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                isIncome
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {isIncome ? 'Income' : 'Expense'}
            </span>
          </div>

          {/* Account with color dot */}
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: transaction.accounts?.color ?? '#6366f1' }}
              aria-hidden="true"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {transaction.accounts?.name ?? 'Unknown Account'}
            </span>
          </div>

          {/* Description */}
          {transaction.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
              {transaction.description}
            </p>
          )}

          {/* Error message */}
          {error && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}
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
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {formatDate(transaction.date)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            aria-label="Edit transaction"
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete transaction"
            className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Edit dialog */}
      <EditTransactionDialog
        transaction={transaction}
        accounts={accounts}
        categories={categories}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </>
  );
}
