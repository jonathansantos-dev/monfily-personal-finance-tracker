'use client';

import { FormEvent, useState } from 'react';
import { createTransaction } from '@/app/(app)/transactions/actions';
import { dollarsToCents } from '../../lib/utils/currency';
import type { TransactionType, Account, Category } from '../../lib/types/database';

interface CreateTransactionFormProps {
  accounts: Account[];
  categories: Category[];
}

interface FormFeedback {
  type: 'success' | 'error';
  message: string;
}

/**
 * Client component for creating a new transaction.
 * Accepts accounts and categories as props (fetched server-side).
 * Amount is entered in dollars and converted to cents on submit.
 *
 * Validates: Requirements 5.1, 5.2
 */
export function CreateTransactionForm({ accounts, categories }: CreateTransactionFormProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const dollarValue = parseFloat(amount);
      if (isNaN(dollarValue) || dollarValue <= 0) {
        setFeedback({ type: 'error', message: 'Please enter a valid amount greater than zero.' });
        setIsLoading(false);
        return;
      }

      if (!accountId) {
        setFeedback({ type: 'error', message: 'Please select an account.' });
        setIsLoading(false);
        return;
      }

      if (!categoryId) {
        setFeedback({ type: 'error', message: 'Please select a category.' });
        setIsLoading(false);
        return;
      }

      if (!date) {
        setFeedback({ type: 'error', message: 'Please select a date.' });
        setIsLoading(false);
        return;
      }

      const amountCents = dollarsToCents(dollarValue);

      const result = await createTransaction({
        account_id: accountId,
        category_id: categoryId,
        type,
        amount_cents: amountCents,
        description: description.trim() || undefined,
        date,
      });

      if (!result.success) {
        setFeedback({ type: 'error', message: result.error ?? 'Failed to create transaction.' });
        return;
      }

      setFeedback({ type: 'success', message: 'Transaction created successfully.' });
      setAmount('');
      setType('expense');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch {
      setFeedback({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  }

  const hasAccounts = accounts.length > 0;
  const hasCategories = categories.length > 0;

  if (!hasAccounts || !hasCategories) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {!hasAccounts && !hasCategories
            ? 'Create at least one account and one category before adding transactions.'
            : !hasAccounts
              ? 'Create at least one account before adding transactions.'
              : 'Create at least one category before adding transactions.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {feedback && (
        <div
          role="alert"
          className={`rounded-md border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Amount */}
      <div className="space-y-1">
        <label
          htmlFor="transaction-amount"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Amount ($)
        </label>
        <input
          id="transaction-amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isLoading}
          placeholder="0.00"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
        />
      </div>

      {/* Type Toggle */}
      <div className="space-y-1">
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Type
        </span>
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden" role="radiogroup" aria-label="Transaction type">
          <button
            type="button"
            role="radio"
            aria-checked={type === 'expense'}
            onClick={() => setType('expense')}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:cursor-not-allowed ${
              type === 'expense'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={type === 'income'}
            onClick={() => setType('income')}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:cursor-not-allowed ${
              type === 'income'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {/* Category Select */}
      <div className="space-y-1">
        <label
          htmlFor="transaction-category"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Category
        </label>
        <select
          id="transaction-category"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={isLoading}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Account Select */}
      <div className="space-y-1">
        <label
          htmlFor="transaction-account"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Account
        </label>
        <select
          id="transaction-account"
          required
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          disabled={isLoading}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className="space-y-1">
        <label
          htmlFor="transaction-date"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Date
        </label>
        <input
          id="transaction-date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={isLoading}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label
          htmlFor="transaction-description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description (optional)
        </label>
        <textarea
          id="transaction-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          placeholder="Add a note..."
          rows={2}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !amount}
        className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-900"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
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
            Creating...
          </span>
        ) : (
          'Create Transaction'
        )}
      </button>
    </form>
  );
}
