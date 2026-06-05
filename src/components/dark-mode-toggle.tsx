'use client';

import { useState } from 'react';
import { updateDarkMode } from '@/app/(app)/settings/actions';

interface DarkModeToggleProps {
  initialDarkMode: boolean;
}

/**
 * Client component that renders a toggle switch for dark mode.
 * On toggle, it calls the updateDarkMode server action to persist
 * the preference and immediately applies the theme class.
 *
 * Validates: Requirements 10.1, 10.2, 10.3
 */
export function DarkModeToggle({ initialDarkMode }: DarkModeToggleProps) {
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    const newValue = !darkMode;
    setError(null);
    setIsUpdating(true);

    // Optimistically apply the theme
    setDarkMode(newValue);
    const html = document.documentElement;
    if (newValue) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    const result = await updateDarkMode(newValue);

    if (!result.success) {
      // Revert on failure
      setDarkMode(!newValue);
      if (newValue) {
        html.classList.remove('dark');
      } else {
        html.classList.add('dark');
      }
      setError(result.error ?? 'Failed to update preference');
    }

    setIsUpdating(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Moon/Sun icon */}
          {darkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-indigo-500 dark:text-indigo-400"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-yellow-500"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              />
            </svg>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Dark Mode
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {darkMode ? 'Currently using dark theme' : 'Currently using light theme'}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={darkMode}
          aria-label="Toggle dark mode"
          onClick={handleToggle}
          disabled={isUpdating}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
            darkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              darkMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
