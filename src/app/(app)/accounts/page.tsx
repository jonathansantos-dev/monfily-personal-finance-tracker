import { getAccounts } from './actions';
import { CreateAccountForm } from '../../../components/create-account-form';
import { AccountCard } from '../../../components/account-card';

/**
 * Accounts page — displays all user accounts and a form to create new ones.
 *
 * Validates: Requirements 7.1, 7.2, 7.6
 */
export default async function AccountsPage() {
  const result = await getAccounts();
  const accounts = result.success ? (result.data ?? []) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Accounts
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your financial accounts
        </p>
      </div>

      {/* Accounts List */}
      <section aria-label="Accounts list">
        {accounts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
              />
            </svg>
            <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">
              No accounts yet
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create your first account below to start tracking your finances.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        )}
      </section>

      {/* Create Account Form */}
      <section aria-label="Create new account">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Create New Account
          </h2>
          <CreateAccountForm />
        </div>
      </section>
    </div>
  );
}
