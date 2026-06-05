'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { updateAccount } from '@/app/(app)/accounts/actions';
import { centsToDollars, dollarsToCents } from '../../lib/utils/currency';
import type { Account, AccountType } from '../../lib/types/database';

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'cash', label: 'Cash' },
  { value: 'investment', label: 'Investment' },
  { value: 'other', label: 'Other' },
];

const PRESET_COLORS: string[] = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
];

interface EditAccountDialogProps {
  account: Account;
  isOpen: boolean;
  onClose: () => void;
}

interface FormFeedback {
  type: 'success' | 'error';
  message: string;
}

/**
 * Edit account dialog component.
 * Opens as a modal overlay, allows editing name, type, balance, and color.
 *
 * Validates: Requirements 7.3
 */
export function EditAccountDialog({ account, isOpen, onClose }: EditAccountDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(account.name);
  const [type, setType] = useState<AccountType>(account.type);
  const [balance, setBalance] = useState(centsToDollars(account.balance_cents).toFixed(2));
  const [color, setColor] = useState(account.color);
  const [customColor, setCustomColor] = useState('');
  const [isUsingCustomColor, setIsUsingCustomColor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  // Sync state when account prop changes
  useEffect(() => {
    setName(account.name);
    setType(account.type);
    setBalance(centsToDollars(account.balance_cents).toFixed(2));
    const isPreset = PRESET_COLORS.includes(account.color);
    setColor(account.color);
    setIsUsingCustomColor(!isPreset);
    setCustomColor(isPreset ? '' : account.color);
    setFeedback(null);
  }, [account]);

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

  // Handle escape key via native dialog behavior
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  function handleColorSelect(preset: string): void {
    setColor(preset);
    setIsUsingCustomColor(false);
  }

  function handleCustomColorChange(value: string): void {
    setCustomColor(value);
    setColor(value);
    setIsUsingCustomColor(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const balanceValue = parseFloat(balance || '0');
      if (isNaN(balanceValue)) {
        setFeedback({ type: 'error', message: 'Please enter a valid balance amount.' });
        setIsLoading(false);
        return;
      }

      const balanceCents = dollarsToCents(balanceValue);
      const selectedColor = isUsingCustomColor ? customColor : color;

      if (!selectedColor || !/^#[0-9a-fA-F]{6}$/.test(selectedColor)) {
        setFeedback({ type: 'error', message: 'Please select a valid color.' });
        setIsLoading(false);
        return;
      }

      const result = await updateAccount(account.id, {
        name: name.trim(),
        type,
        balance_cents: balanceCents,
        color: selectedColor,
      });

      if (!result.success) {
        setFeedback({ type: 'error', message: result.error ?? 'Failed to update account.' });
        return;
      }

      setFeedback({ type: 'success', message: 'Account updated successfully.' });
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
      aria-labelledby="edit-account-title"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="edit-account-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Edit Account
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

          {/* Account Name */}
          <div className="space-y-1">
            <label
              htmlFor="edit-account-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Account Name
            </label>
            <input
              ref={firstInputRef}
              id="edit-account-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. Main Checking"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
          </div>

          {/* Account Type */}
          <div className="space-y-1">
            <label
              htmlFor="edit-account-type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Account Type
            </label>
            <select
              id="edit-account-type"
              required
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              disabled={isLoading}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            >
              {ACCOUNT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Balance */}
          <div className="space-y-1">
            <label
              htmlFor="edit-account-balance"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Balance ($)
            </label>
            <input
              id="edit-account-balance"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              disabled={isLoading}
              placeholder="0.00"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Color
            </label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Account color">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleColorSelect(preset)}
                  disabled={isLoading}
                  aria-label={`Color ${preset}`}
                  aria-checked={!isUsingCustomColor && color === preset}
                  role="radio"
                  className={`w-7 h-7 rounded-full border-2 transition-all disabled:cursor-not-allowed ${
                    !isUsingCustomColor && color === preset
                      ? 'border-gray-900 dark:border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <label
                htmlFor="edit-custom-color"
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                Custom:
              </label>
              <input
                id="edit-custom-color"
                type="text"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                disabled={isLoading}
                placeholder="#ff5733"
                maxLength={7}
                className="w-24 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              />
              {isUsingCustomColor && customColor && /^#[0-9a-fA-F]{6}$/.test(customColor) && (
                <span
                  className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 inline-block"
                  style={{ backgroundColor: customColor }}
                  aria-hidden="true"
                />
              )}
            </div>
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
              disabled={isLoading || !name.trim()}
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
