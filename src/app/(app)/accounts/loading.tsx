/**
 * Loading skeleton for the Accounts page.
 * Shows animated placeholders matching the accounts layout:
 * - Page header
 * - Account cards grid
 * - Create account form
 */
export default function AccountsLoading(): React.ReactElement {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page header skeleton */}
      <div>
        <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-56 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Account cards grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
            <div className="mt-4 h-6 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>

      {/* Create form skeleton */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 space-y-4">
        <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
