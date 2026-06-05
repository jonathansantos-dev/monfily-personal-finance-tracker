/**
 * Loading skeleton for the Settings page.
 * Shows animated placeholders matching the settings layout:
 * - Page header
 * - Appearance section with toggle
 */
export default function SettingsLoading(): React.ReactElement {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page header skeleton */}
      <div>
        <div className="h-8 w-28 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-60 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Appearance section skeleton */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="h-5 w-28 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-56 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
