import { getProfile } from './actions';
import { ProfileForm } from '../../../components/profile-form';
import { AvatarUpload } from '../../../components/avatar-upload';

/**
 * Profile page — displays the user's profile info and allows editing
 * display name and uploading an avatar.
 *
 * Validates: Requirements 9.1, 9.2
 */
export default async function ProfilePage() {
  const result = await getProfile();
  const profile = result.success ? result.data : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your personal information
        </p>
      </div>

      {/* Avatar Section */}
      <section aria-label="Avatar" className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Avatar
        </h2>
        <AvatarUpload
          currentAvatarUrl={profile?.avatar_url ?? null}
          displayName={profile?.display_name ?? null}
        />
      </section>

      {/* Display Name Section */}
      <section aria-label="Display name" className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Display Name
        </h2>
        <ProfileForm currentDisplayName={profile?.display_name ?? ''} />
      </section>
    </div>
  );
}
