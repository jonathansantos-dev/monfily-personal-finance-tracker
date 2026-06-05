'use client';

import { FormEvent, useState } from 'react';
import { createAccount } from '@/app/(app)/accounts/actions';
import { dollarsToCents } from '../../lib/utils/currency';
import type { AccountType } from '../../lib/types/database';

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
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
];

interface FormFeedback {
  type: 'success' | 'error';
  message: string;
}

export function CreateAccountForm() {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [customColor, setCustomColor] = useState('');
  const [isUsingCustomColor, setIsUsingCustomColor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

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

      const result = await createAccount({
        name: name.trim(),
        type,
        balance_cents: balanceCents,
        color: selectedColor,
      });

      if (!result.success) {
        setFeedback({ type: 'error', message: result.error ?? 'Failed to create account.' });
        return;
      }

      setFeedback({ type: 'success', message: 'Account created successfully.' });
      setName('');
      setType('checking');
      setBalance('');
      setColor(PRESET_COLORS[0]);
      setCustomColor('');
      setIsUsingCustomColor(false);
    } catch {
      setFeedback({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
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

      {/* Account Name */}
      <div className="space-y-1">
        <label
          htmlFor="account-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Account Name
        </label>
        <input
          id="account-name"
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
          htmlFor="account-type"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Account Type
        </label>
        <select
          id="account-type"
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

      {/* Initial Balance */}
      <div className="space-y-1">
        <label
          htmlFor="account-balance"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Initial Balance ($)
        </label>
        <input
          id="account-balance"
          type="number"
          step="0.01"
          min="0"
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
              className={`w-8 h-8 rounded-full border-2 transition-all disabled:cursor-not-allowed ${
                !isUsingCustomColor && color === preset
                  ? 'border-gray-900 dark:border-white scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <label
            htmlFor="custom-color"
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            Custom:
          </label>
          <input
            id="custom-color"
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
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 inline-block"
              style={{ backgroundColor: customColor }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !name.trim()}
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
          'Create Account'
        )}
      </button>
    </form>
  );
}
