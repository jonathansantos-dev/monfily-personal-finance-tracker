import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { Sidebar } from '../../components/sidebar';
import { MobileNav } from '../../components/mobile-nav';
import { DarkModeScript } from '../../components/dark-mode-script';
import type { Profile } from '../../../lib/types/database';

/**
 * Protected layout for authenticated routes.
 * Fetches user profile for display name, avatar, and dark mode preference.
 * Renders sidebar navigation on desktop and mobile hamburger menu.
 *
 * Validates: Requirements 4.1, 9.1, 9.2, 10.1, 10.2, 10.3
 */
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, dark_mode')
    .eq('id', user.id)
    .single<Pick<Profile, 'display_name' | 'avatar_url' | 'dark_mode'>>();

  const displayName = profile?.display_name ?? null;
  const avatarUrl = profile?.avatar_url ?? null;
  const darkMode = profile?.dark_mode ?? false;

  return (
    <>
      <DarkModeScript darkMode={darkMode} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Desktop sidebar */}
        <Sidebar displayName={displayName} avatarUrl={avatarUrl} />

        {/* Mobile navigation */}
        <MobileNav displayName={displayName} avatarUrl={avatarUrl} />

        {/* Main content area */}
        <main className="md:pl-64 pt-14 md:pt-0">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
