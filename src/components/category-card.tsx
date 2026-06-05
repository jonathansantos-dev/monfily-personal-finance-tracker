'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCategory } from '@/app/(app)/categories/actions';
import { EditCategoryDialog } from '@/components/edit-category-dialog';
import type { Category } from '../../lib/types/database';

interface CategoryCardProps {
  category: Category;
}

/**
 * Client component displaying a single category card with edit/delete actions.
 * Edit opens a dialog; delete calls the server action and displays errors
 * if the category is in use.
 *
 * Validates: Requirements 8.2, 8.3
 */
export function CategoryCard({ category }: CategoryCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(): Promise<void> {
    setError(null);
    setIsDeleting(true);

    const result = await deleteCategory(category.id);

    setIsDeleting(false);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error ?? 'Failed to delete category');
    }
  }

  function handleEditSuccess(): void {
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-col gap-2 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors hover:border-gray-300 dark:hover:border-gray-700">
        <div className="flex items-center gap-3">
          {/* Icon with colored background */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: category.color + '20' }}
          >
            {category.icon}
          </div>

          {/* Name */}
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {category.name}
          </span>

          {/* Color indicator */}
          <div
            className="w-3 h-3 rounded-full ml-auto shrink-0"
            style={{ backgroundColor: category.color }}
            aria-label={`Color: ${category.color}`}
          />
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-medium"
          >
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            aria-label={`Edit category ${category.name}`}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-gray-200 dark:border-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label={`Delete category ${category.name}`}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 border border-gray-200 dark:border-gray-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Edit dialog */}
      <EditCategoryDialog
        category={category}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
