# Design Document

## Overview

Monfily is a Next.js App Router application backed by Supabase (Auth + PostgreSQL + Storage), deployed on Vercel. The architecture follows a client-server pattern where the Next.js frontend communicates directly with Supabase via the JavaScript client library. Row Level Security ensures data isolation per user. All monetary values are stored as integers (cents) and converted for display.

## Architecture

### Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode, no `any`)
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Styling**: Tailwind CSS with dark mode support via class strategy
- **Charts**: Recharts (lightweight, React-native charting)
- **Deployment**: Vercel
- **State**: React Server Components + client-side hooks for mutations

### Route Structure

```
app/
├── (auth)/
│   ├── layout.tsx          # Auth layout (centered, no nav)
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (app)/
│   ├── layout.tsx          # Protected layout (sidebar, nav, theme)
│   ├── dashboard/page.tsx
│   ├── transactions/page.tsx
│   ├── accounts/page.tsx
│   ├── categories/page.tsx
│   ├── profile/page.tsx
│   └── settings/page.tsx
├── layout.tsx              # Root layout (providers, fonts)
└── middleware.ts           # Session refresh + route protection
```

### Balance Recalculation Strategy

When a transaction is created, edited, or deleted, the associated account balance is updated atomically using Supabase RPC or a database function:

- **Create**: `account.balance_cents += amount_cents` (income) or `account.balance_cents -= amount_cents` (expense)
- **Delete**: Reverse the effect of the transaction
- **Edit (amount change)**: Apply the difference (new - old)
- **Edit (account change)**: Reverse on old account, apply on new account

This uses a PostgreSQL function to ensure atomicity:

```sql
CREATE OR REPLACE FUNCTION adjust_account_balance(
  p_account_id UUID,
  p_adjustment BIGINT
) RETURNS void AS $$
BEGIN
  UPDATE accounts
  SET balance_cents = balance_cents + p_adjustment,
      updated_at = now()
  WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Default Category Seeding

When a new user registers, a PostgreSQL trigger function fires AFTER INSERT on the `profiles` table to seed 7 default categories. Since the `profiles` table is already auto-created on user signup via the existing profile-creation trigger (task 2.6), this second trigger fires on the same INSERT event to populate the `categories` table.

**Approach**: A separate trigger function (`seed_default_categories`) attached to the `profiles` table AFTER INSERT. This keeps the profile-creation logic and category-seeding logic decoupled and independently modifiable.

```sql
CREATE OR REPLACE FUNCTION seed_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, icon, color) VALUES
    (NEW.id, 'Food', '🍔', '#f97316'),
    (NEW.id, 'Transport', '🚗', '#3b82f6'),
    (NEW.id, 'Housing', '🏠', '#8b5cf6'),
    (NEW.id, 'Health', '💊', '#10b981'),
    (NEW.id, 'Entertainment', '🎬', '#ec4899'),
    (NEW.id, 'Income', '💰', '#22c55e'),
    (NEW.id, 'Other', '📦', '#6b7280');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_seed_categories
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION seed_default_categories();
```

The function uses `SECURITY DEFINER` to bypass RLS during the insert (since the trigger runs in a system context, not as the authenticated user). The 7 categories cover common expense types plus an Income category and a general-purpose Other category, ensuring new users can immediately create transactions without manual setup.

### Dark Mode Implementation

- CSS class strategy via Tailwind (`darkMode: 'class'`)
- Theme preference stored in `profiles.dark_mode`
- On app load, server component reads preference and sets `<html class="dark">` conditionally
- Client-side toggle updates the class and persists via server action

### Avatar Upload

- Supabase Storage bucket: `avatars`
- Path: `{user_id}/avatar.{ext}`
- Client-side validation: max 2 MB, image types only
- Public URL stored in `profiles.avatar_url`

## Components and Interfaces

### Supabase Client Setup

```
lib/
├── supabase/
│   ├── client.ts           # Browser client (createBrowserClient)
│   ├── server.ts           # Server client (createServerClient with cookies)
│   └── middleware.ts        # Middleware client for session refresh
├── types/
│   └── database.ts          # Generated Supabase types
└── utils/
    └── currency.ts          # Cents ↔ dollars conversion + formatting
```

### Currency Utilities

```typescript
// lib/utils/currency.ts
export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[$,]/g, '');
  const dollars = parseFloat(cleaned);
  if (isNaN(dollars)) throw new Error('Invalid currency input');
  return Math.round(dollars * 100);
}
```

### Middleware (Route Protection + Session Refresh)

```typescript
// middleware.ts
// - Refreshes Supabase session on every request
// - Redirects unauthenticated users from /(app)/* to /login
// - Redirects authenticated users from /(auth)/* to /dashboard
```

### Data Access Layer

Server actions and data fetching are organized per domain:

```
app/(app)/
├── dashboard/
│   └── actions.ts          # getTotalBalance, getMonthlyChart, getRecentTransactions
├── transactions/
│   └── actions.ts          # createTransaction, updateTransaction, deleteTransaction, getTransactions
├── accounts/
│   └── actions.ts          # createAccount, updateAccount, deleteAccount, getAccounts
├── categories/
│   └── actions.ts          # createCategory, updateCategory, deleteCategory, getCategories
├── profile/
│   └── actions.ts          # updateProfile, uploadAvatar
└── settings/
    └── actions.ts          # updateDarkMode
```

### Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Accounts: full CRUD scoped to user
CREATE POLICY "Users can manage own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);

-- Categories: full CRUD scoped to user
CREATE POLICY "Users can manage own categories" ON categories FOR ALL USING (auth.uid() = user_id);

-- Transactions: full CRUD scoped to user
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
```

## Data Models

### Database Schema

```sql
-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  dark_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Accounts table
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit_card', 'wallet', 'cash', 'investment', 'other')),
  balance_cents BIGINT NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Key Data Relationships

- **profiles** — 1:1 with `auth.users`, stores display preferences
- **accounts** — Many per user, each has a running `balance_cents`
- **categories** — Many per user, referenced by transactions (ON DELETE RESTRICT)
- **transactions** — Many per user, linked to one account and one category

### TypeScript Interfaces

```typescript
interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}

interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'wallet' | 'cash' | 'investment' | 'other';
  balance_cents: number;
  color: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  type: 'income' | 'expense';
  amount_cents: number;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Currency Round-Trip

*For any* valid cent integer value, formatting to a display string then parsing back SHALL produce the original cent value.

```
forAll(cents: integer) =>
  parseCurrencyInput(formatCurrency(cents)) === cents
```

**Constraints**: cents is a safe integer within the range [-999_999_999_99, 999_999_999_99] (max ~$10 billion)

**Validates: Requirements 12.4**

### Property 2: Transaction Balance Invariant

*For any* account and its associated transactions, the account balance SHALL always equal the initial balance plus the sum of all income transactions minus the sum of all expense transactions on that account.

```
forAll(account, transactions[]) =>
  account.balance_cents === account.initial_balance_cents
    + sum(transactions.filter(t => t.type === 'income').map(t => t.amount_cents))
    - sum(transactions.filter(t => t.type === 'expense').map(t => t.amount_cents))
```

**Validates: Requirements 5.1, 5.3, 5.4, 7.7**

### Property 3: Filter Correctness

*For any* set of transactions and any combination of type filter and date range, all transactions returned by the filter function SHALL satisfy all active filter criteria.

```
forAll(transactions[], typeFilter, dateRange) =>
  filterTransactions(transactions, { type: typeFilter, dateRange })
    .every(t =>
      (typeFilter === 'all' || t.type === typeFilter) &&
      t.date >= dateRange.start &&
      t.date <= dateRange.end
    )
```

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 4: Total Balance Equals Sum of Accounts

*For any* set of user accounts, the displayed total balance SHALL equal the sum of all individual account balances.

```
forAll(accounts[]) =>
  getTotalBalance(accounts) === sum(accounts.map(a => a.balance_cents))
```

**Validates: Requirements 4.1**

### Property 5: Transaction Move Preserves Net Worth

*For any* transaction moved from one account to another, the total sum of all account balances SHALL remain unchanged.

```
forAll(accounts[], transaction, newAccountId) =>
  sumBefore(accounts) === sumAfter(moveTransaction(transaction, newAccountId))
```

**Validates: Requirements 5.5**

### Property 6: Recent Transactions Ordering

*For any* set of transactions, the recent transactions list SHALL always be ordered by date descending and contain at most 10 items.

```
forAll(transactions[]) =>
  getRecentTransactions(transactions).length <= 10 &&
  isDescendingByDate(getRecentTransactions(transactions))
```

**Validates: Requirements 4.3**

### Property 7: Cents Storage Integrity

*For any* user-entered dollar amount, converting to cents for storage SHALL produce an integer value (no fractional cents).

```
forAll(amount: dollarInput) =>
  Number.isInteger(dollarsToCents(amount))
```

**Validates: Requirements 5.2, 7.1**

### Property 8: Dashboard Monthly Aggregation

*For any* set of transactions in the current month, the monthly chart income total SHALL equal the sum of all income transactions and the monthly chart expense total SHALL equal the sum of all expense transactions for that month.

```
forAll(transactions[]) =>
  monthlyIncome === sum(currentMonthTransactions.filter(t => t.type === 'income').map(t => t.amount_cents)) &&
  monthlyExpenses === sum(currentMonthTransactions.filter(t => t.type === 'expense').map(t => t.amount_cents))
```

**Validates: Requirements 4.2**

### Property 9: Default Category Seeding Completeness

*For any* newly registered user, after profile creation the user SHALL have exactly 7 categories with the names: Food, Transport, Housing, Health, Entertainment, Income, Other — each with its specified icon and color.

```
forAll(newUser) =>
  const categories = getCategoriesForUser(newUser.id)
  categories.length === 7 &&
  categories.map(c => c.name).sort() === ['Entertainment', 'Food', 'Health', 'Housing', 'Income', 'Other', 'Transport'] &&
  categories.every(c => c.icon !== null && c.color !== null)
```

**Validates: Requirements 13.1, 13.2, 13.3**

## Error Handling

### Authentication Errors

- **Invalid credentials**: Display inline error message on the login form; do not reveal whether email or password was incorrect
- **Registration with existing email**: Display specific error indicating email is already in use
- **Session expiration**: Middleware detects expired session and redirects to login; no data loss for in-progress forms

### Data Mutation Errors

- **Network failure on transaction create/edit**: Display toast error, preserve user input in form state so they can retry without re-entering data (Requirement 5.6)
- **Network failure on account/category CRUD**: Display toast error with retry option
- **Constraint violations** (e.g., deleting a category in use): Display specific message explaining why the action cannot be completed (Requirement 8.3)

### File Upload Errors

- **Avatar exceeds 2 MB**: Reject before upload, display file size error (Requirement 9.3)
- **Invalid file type**: Reject non-image files client-side before attempting upload
- **Storage upload failure**: Display error toast with retry option

### General Strategy

- All server actions return a structured result: `{ success: boolean; error?: string; data?: T }`
- Client components display errors via toast notifications or inline form messages
- No unhandled promise rejections — all async operations wrapped in try/catch
- Never expose internal error details to the user; log them server-side

## Testing Strategy

### Unit Tests

- **Framework**: Vitest
- **Focus**: Pure utility functions (currency conversion, filtering logic, balance calculations)
- **Coverage targets**: All functions in `lib/utils/` and data transformation logic in server actions

### Property-Based Tests

- **Framework**: fast-check (with Vitest as runner)
- **Minimum iterations**: 100 per property test
- **Tag format**: `Feature: monfily-app, Property {number}: {property_text}`
- **Scope**: All 9 correctness properties defined above — currency round-trip, balance invariants, filter correctness, aggregation, ordering, net worth preservation, and default category seeding

### Integration Tests

- **Supabase RLS policies**: Verify that cross-user data access is denied
- **Balance recalculation**: End-to-end tests for create/edit/delete transaction flows ensuring account balances update correctly
- **Auth flows**: Login, registration, logout, and session persistence

### End-to-End Tests

- **Framework**: Playwright
- **Critical paths**: Registration → Login → Create Account → Add Transaction → View Dashboard
- **Dark mode**: Toggle and verify theme persistence across page navigations

## Non-Functional Requirements

- **Performance**: Dashboard loads in under 2 seconds on 3G connection
- **Accessibility**: All interactive elements keyboard-navigable, ARIA labels on icons
- **Responsive**: Mobile-first design, breakpoints at sm/md/lg
- **Security**: No service role key exposed client-side, all mutations via server actions or RPC
