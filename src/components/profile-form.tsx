'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/(app)/profile/actions';

interface ProfileFormProps {
  currentDisplayName: string;
}

/**
 * Client component for updating the user's display name.
 * Shows success/error feedback after submission.
 *
 * Validates: Requirements 9.1
 */
export function ProfileForm({ currentDisplayName }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setError('Display name cannot be empty');
      setIsSubmitting(false);
      return;
    }

    const result = await updateProfile({ display_name: trimmedName });

    if (result.success) {
      setSuccessMessage('Display name updated successfully');
      setDisplayName(trimmedName);
    } else {
      setError(result.error ?? 'Failed to update display name');
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="display-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Display Name
        </label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
          disabled={isSubmitting}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* Success message */}
      {successMessage && (
        <p className="text-sm text-green-600 dark:text-green-400" role="status">
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-900 transition-colors"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
