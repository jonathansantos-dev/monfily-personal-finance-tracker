/**
 * Loading skeleton for the Profile page.
 * Shows animated placeholders matching the profile layout:
 * - Page header
 * - Avatar section
 * - Display name form section
 */
export default function ProfileLoading(): React.ReactElement {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page header skeleton */}
      <div>
        <div className="h-8 w-28 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-56 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Avatar section skeleton */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-4 flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-9 w-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>

      {/* Display name section skeleton */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-4 space-y-3">
          <div className="h-10 w-full max-w-sm rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-9 w-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
