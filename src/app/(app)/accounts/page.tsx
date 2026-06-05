import { getAccounts } from './actions';
import { formatCurrency } from '../../../../lib/utils/currency';
import { CreateAccountForm } from '../../../components/create-account-form';
import type { AccountType } from '../../../../lib/types/database';

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  wallet: 'Wallet',
  cash: 'Cash',
  investment: 'Investment',
  other: 'Other',
};

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
              <div
                key={account.id}
                className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                {/* Color indicator bar */}
                <div
                  className="absolute inset-y-0 left-0 w-1"
                  style={{ backgroundColor: account.color }}
                  aria-hidden="true"
                />

                <div className="pl-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: account.color }}
                      aria-hidden="true"
                    />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {account.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {ACCOUNT_TYPE_LABELS[account.type]}
                  </p>
                  <p className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(account.balance_cents)}
                  </p>
                </div>
              </div>
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
