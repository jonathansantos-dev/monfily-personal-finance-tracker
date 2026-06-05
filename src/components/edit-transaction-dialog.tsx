'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { updateTransaction } from '@/app/(app)/transactions/actions';
import type { TransactionWithRelations } from '@/app/(app)/transactions/actions';
import { centsToDollars, dollarsToCents } from '../../lib/utils/currency';
import type { TransactionType, Account, Category } from '../../lib/types/database';

interface EditTransactionDialogProps {
  transaction: TransactionWithRelations;
  accounts: Account[];
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

interface FormFeedback {
  type: 'success' | 'error';
  message: string;
}

/**
 * Edit transaction dialog component.
 * Opens as a modal overlay, allows editing amount, type, category, account, date, description.
 * Calls updateTransaction server action which handles balance recalculation.
 *
 * Validates: Requirements 5.3, 5.5
 */
export function EditTransactionDialog({
  transaction,
  accounts,
  categories,
  isOpen,
  onClose,
}: EditTransactionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState(centsToDollars(transaction.amount_cents).toFixed(2));
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [categoryId, setCategoryId] = useState(transaction.category_id);
  const [accountId, setAccountId] = useState(transaction.account_id);
  const [date, setDate] = useState(transaction.date);
  const [description, setDescription] = useState(transaction.description ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  // Sync state when transaction prop changes
  useEffect(() => {
    setAmount(centsToDollars(transaction.amount_cents).toFixed(2));
    setType(transaction.type);
    setCategoryId(transaction.category_id);
    setAccountId(transaction.account_id);
    setDate(transaction.date);
    setDescription(transaction.description ?? '');
    setFeedback(null);
  }, [transaction]);

  // Handle dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      firstInputRef.current?.focus();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

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

      const result = await updateTransaction(transaction.id, {
        account_id: accountId,
        category_id: categoryId,
        type,
        amount_cents: amountCents,
        description: description.trim() || undefined,
        date,
      });

      if (!result.success) {
        setFeedback({ type: 'error', message: result.error ?? 'Failed to update transaction.' });
        return;
      }

      setFeedback({ type: 'success', message: 'Transaction updated successfully.' });
      setTimeout(() => {
        onClose();
      }, 600);
    } catch {
      setFeedback({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-lg border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-black/50 dark:border-gray-700 dark:bg-gray-900"
      aria-labelledby="edit-transaction-title"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="edit-transaction-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Edit Transaction
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              htmlFor="edit-transaction-amount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Amount ($)
            </label>
            <input
              ref={firstInputRef}
              id="edit-transaction-amount"
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
            <div
              className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
              role="radiogroup"
              aria-label="Transaction type"
            >
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
              htmlFor="edit-transaction-category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Category
            </label>
            <select
              id="edit-transaction-category"
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
              htmlFor="edit-transaction-account"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Account
            </label>
            <select
              id="edit-transaction-account"
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
              htmlFor="edit-transaction-date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Date
            </label>
            <input
              id="edit-transaction-date"
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
              htmlFor="edit-transaction-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description (optional)
            </label>
            <textarea
              id="edit-transaction-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              placeholder="Add a note..."
              rows={2}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount}
              className="flex flex-1 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-900"
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
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
