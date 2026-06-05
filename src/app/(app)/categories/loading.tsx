/**
 * Loading skeleton for the Categories page.
 * Shows animated placeholders matching the categories layout:
 * - Page header
 * - Category cards grid with form sidebar
 */
export default function CategoriesLoading(): React.ReactElement {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Page header skeleton */}
      <div>
        <div className="h-8 w-36 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-64 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories grid skeleton */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create form skeleton */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 space-y-4">
            <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
