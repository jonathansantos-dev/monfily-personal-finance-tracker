import { getCategories } from './actions';
import { CreateCategoryForm } from '@/components/create-category-form';
import type { Category } from '../../../../lib/types/database';

/**
 * Categories list page — server component.
 * Fetches all user categories and renders them as cards with icon and color.
 * Includes the CreateCategoryForm for adding new categories.
 *
 * Validates: Requirement 8.4
 */
export default async function CategoriesPage() {
  const result = await getCategories();

  const categories: Category[] = result.success && result.data ? result.data : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Categories
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Organize your transactions with custom categories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories list */}
        <div className="lg:col-span-2 space-y-4">
          {!result.success && (
            <div
              role="alert"
              className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm font-medium"
            >
              {result.error ?? 'Failed to load categories'}
            </div>
          )}

          {result.success && categories.length === 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
              <div className="text-4xl mb-3">🏷️</div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No categories yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create your first category to start organizing transactions.
              </p>
            </div>
          )}

          {categories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>

        {/* Create category form */}
        <div className="lg:col-span-1">
          <CreateCategoryForm />
        </div>
      </div>
    </div>
  );
}

/** Individual category card displaying icon, name, and color indicator. */
function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors hover:border-gray-300 dark:hover:border-gray-700">
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
  );
}
