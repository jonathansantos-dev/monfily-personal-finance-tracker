'use client';

import { useState } from 'react';
import { createCategory } from '@/app/(app)/categories/actions';

/** Preset emoji options for the icon selector */
const ICON_OPTIONS: string[] = [
  '🍔', '🚗', '🏠', '💊', '🎬', '💰', '📦', '🎓', '✈️', '🛒',
  '💻', '🏋️', '🎵', '🐾', '💡', '🎁', '🏥', '⚽', '🎮', '📱',
];

/** Preset color options for the color picker */
const COLOR_OPTIONS: string[] = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#EC4899', '#F43F5E', '#78716C',
];

interface FormState {
  name: string;
  icon: string;
  color: string;
}

const INITIAL_FORM_STATE: FormState = {
  name: '',
  icon: '🍔',
  color: '#3B82F6',
};

/**
 * Client component for creating a new category.
 * Provides name input, emoji icon selector grid, and color picker.
 *
 * Validates: Requirement 8.1
 */
export function CreateCategoryForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFeedback(null);

    if (!form.name.trim()) {
      setFeedback({ type: 'error', message: 'Category name is required' });
      return;
    }

    setIsSubmitting(true);

    const result = await createCategory({
      name: form.name.trim(),
      icon: form.icon,
      color: form.color,
    });

    setIsSubmitting(false);

    if (result.success) {
      setFeedback({ type: 'success', message: 'Category created successfully' });
      setForm(INITIAL_FORM_STATE);
    } else {
      setFeedback({ type: 'error', message: result.error ?? 'Failed to create category' });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        New Category
      </h2>

      {/* Feedback message */}
      {feedback && (
        <div
          role="alert"
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
              : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Name input */}
      <div>
        <label
          htmlFor="category-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Name
        </label>
        <input
          id="category-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g. Groceries"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
          required
        />
      </div>

      {/* Icon selector */}
      <div>
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Icon
        </span>
        <div
          role="radiogroup"
          aria-label="Category icon"
          className="grid grid-cols-10 gap-1"
        >
          {ICON_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              role="radio"
              aria-checked={form.icon === emoji}
              aria-label={`Icon ${emoji}`}
              onClick={() => setForm((prev) => ({ ...prev, icon: emoji }))}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition-all ${
                form.icon === emoji
                  ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Color
        </span>
        <div
          role="radiogroup"
          aria-label="Category color"
          className="flex flex-wrap gap-2"
        >
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={form.color === color}
              aria-label={`Color ${color}`}
              onClick={() => setForm((prev) => ({ ...prev, color }))}
              className={`w-8 h-8 rounded-full transition-all ${
                form.color === color
                  ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-indigo-500 scale-110'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: form.color + '20' }}
        >
          {form.icon}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {form.name || 'Category preview'}
        </span>
        <div
          className="w-3 h-3 rounded-full ml-auto"
          style={{ backgroundColor: form.color }}
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        {isSubmitting ? 'Creating...' : 'Create Category'}
      </button>
    </form>
  );
}
