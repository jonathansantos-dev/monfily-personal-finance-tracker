'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteAccount } from '@/app/(app)/accounts/actions';
import type { Account } from '../../lib/types/database';

interface DeleteAccountDialogProps {
  account: Account;
  isOpen: boolean;
  onClose: () => void;
}

interface FormFeedback {
  type: 'success' | 'error';
  message: string;
}

/**
 * Delete account confirmation dialog.
 * Warns the user that all associated transactions will also be deleted.
 * This action cannot be undone.
 *
 * Validates: Requirements 7.4, 7.5
 */
export function DeleteAccountDialog({ account, isOpen, onClose }: DeleteAccountDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Handle dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      cancelButtonRef.current?.focus();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  async function handleDelete(): Promise<void> {
    setFeedback(null);
    setIsLoading(true);

    try {
      const result = await deleteAccount(account.id);

      if (!result.success) {
        setFeedback({ type: 'error', message: result.error ?? 'Failed to delete account.' });
        return;
      }

      setFeedback({ type: 'success', message: 'Account deleted successfully.' });
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
      className="fixed inset-0 z-50 m-auto w-full max-w-sm rounded-lg border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-black/50 dark:border-gray-700 dark:bg-gray-900"
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-description"
    >
      <div className="p-6">
        {/* Warning Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 text-red-600 dark:text-red-400"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2
          id="delete-account-title"
          className="text-center text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          Delete Account
        </h2>

        <p
          id="delete-account-description"
          className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
        >
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {account.name}
          </span>
          ?
        </p>

        <p className="mt-2 text-center text-sm font-medium text-red-600 dark:text-red-400">
          All transactions associated with this account will also be deleted. This action cannot
          be undone.
        </p>

        {feedback && (
          <div
            role="alert"
            className={`mt-4 rounded-md border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-offset-gray-900"
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
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
