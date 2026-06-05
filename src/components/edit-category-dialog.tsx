'use client';

import { useState, useEffect, useRef } from 'react';
import { updateCategory } from '@/app/(app)/categories/actions';
import type { Category } from '../../lib/types/database';

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

interface EditCategoryDialogProps {
  category: Category;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormState {
  name: string;
  icon: string;
  color: string;
}

/**
 * Modal dialog for editing a category's name, icon, and color.
 * Reuses the same icon/color selectors as the create form.
 *
 * Validates: Requirement 8.2
 */
export function EditCategoryDialog({ category, isOpen, onClose, onSuccess }: EditCategoryDialogProps) {
  const [form, setForm] = useState<FormState>({
    name: category.name,
    icon: category.icon,
    color: category.color,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ name: category.name, icon: category.icon, color: category.color });
      setError(null);
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen, category]);

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>): void {
    if (event.target === dialogRef.current) {
      onClose();
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Category name is required');
      return;
    }

    setIsSubmitting(true);

    const result = await updateCategory(category.id, {
      name: form.name.trim(),
      icon: form.icon,
      color: form.color,
    });

    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error ?? 'Failed to update category');
    }
  }

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-0 shadow-xl backdrop:bg-black/50"
      aria-labelledby="edit-category-title"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2
            id="edit-category-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Edit Category
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm font-medium"
          >
            {error}
          </div>
        )}

        {/* Name input */}
        <div>
          <label
            htmlFor="edit-category-name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Name
          </label>
          <input
            id="edit-category-name"
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

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
