'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type TypeFilter = 'all' | 'income' | 'expense';

/**
 * Transaction filters component with type toggle and date range pickers.
 * Uses URL search params for filter state so it works with server-side rendering.
 *
 * Validates: Requirements 6.1, 6.2
 */
export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = (searchParams.get('type') as TypeFilter) ?? 'all';
  const currentStartDate = searchParams.get('startDate') ?? '';
  const currentEndDate = searchParams.get('endDate') ?? '';

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      router.push(`/transactions?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleTypeChange(type: TypeFilter): void {
    updateFilters({ type: type === 'all' ? '' : type });
  }

  function handleStartDateChange(value: string): void {
    updateFilters({ startDate: value });
  }

  function handleEndDateChange(value: string): void {
    updateFilters({ endDate: value });
  }

  function handleClearFilters(): void {
    router.push('/transactions');
  }

  const hasActiveFilters = currentType !== 'all' || currentStartDate || currentEndDate;

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Type filter */}
      <div className="space-y-2">
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Type
        </span>
        <div
          className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
          role="radiogroup"
          aria-label="Transaction type filter"
        >
          <button
            type="button"
            role="radio"
            aria-checked={currentType === 'all'}
            onClick={() => handleTypeChange('all')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${
              currentType === 'all'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={currentType === 'income'}
            onClick={() => handleTypeChange('income')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${
              currentType === 'income'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={currentType === 'expense'}
            onClick={() => handleTypeChange('expense')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${
              currentType === 'expense'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Expense
          </button>
        </div>
      </div>

      {/* Date range */}
      <div className="space-y-2">
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Date Range
        </span>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="filter-start-date" className="sr-only">
              Start date
            </label>
            <input
              id="filter-start-date"
              type="date"
              value={currentStartDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              aria-label="Start date"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
          </div>
          <div>
            <label htmlFor="filter-end-date" className="sr-only">
              End date
            </label>
            <input
              id="filter-end-date"
              type="date"
              value={currentEndDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              aria-label="End date"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
          </div>
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
