/**
 * Loading skeleton for the Dashboard page.
 * Shows animated placeholders matching the dashboard layout:
 * - Total balance card skeleton
 * - Chart area skeleton
 * - Recent transactions list skeleton
 */
export default function DashboardLoading(): React.ReactElement {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 w-40 rounded bg-gray-200 dark:bg-gray-700" />

      {/* Total Balance Card skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-3 h-9 w-48 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Chart skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="h-5 w-56 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-4 h-48 w-full rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Recent Transactions skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
