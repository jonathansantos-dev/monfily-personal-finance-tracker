import { redirect } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/server';
import { DarkModeToggle } from '../../../components/dark-mode-toggle';
import type { Profile } from '../../../../lib/types/database';

/**
 * Settings page — displays user preferences including dark mode toggle.
 * Fetches the current dark mode preference from the profile and passes
 * it to the client-side toggle component.
 *
 * Validates: Requirements 10.1, 10.2, 10.3
 */
export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('dark_mode')
    .eq('id', user.id)
    .single<Pick<Profile, 'dark_mode'>>();

  const darkMode = profile?.dark_mode ?? false;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your application preferences
        </p>
      </div>

      {/* Appearance Section */}
      <section aria-label="Appearance settings" className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Appearance
        </h2>
        <DarkModeToggle initialDarkMode={darkMode} />
      </section>
    </div>
  );
}
