/**
 * Loading skeleton for the Transactions page.
 * Shows animated placeholders matching the transactions layout:
 * - Page header
 * - Filter bar
 * - Transaction list with form sidebar
 */
export default function TransactionsLoading(): React.ReactElement {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Page header skeleton */}
      <div>
        <div className="h-8 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-56 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-3">
        <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-36 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-36 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transactions list skeleton */}
        <div className="lg:col-span-2 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>

        {/* Create form skeleton */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 space-y-4">
            <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
