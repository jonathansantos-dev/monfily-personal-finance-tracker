# Implementation Plan: Monfily Personal Finance App

## Overview

This implementation plan breaks down the Monfily personal finance application into incremental coding tasks. The app is built with Next.js App Router, Supabase (Auth + PostgreSQL + Storage), TypeScript strict mode, and Tailwind CSS with dark mode. Each task builds on previous steps, starting with project setup and database schema, progressing through feature implementation, and ending with integration and polish. Property-based tests validate correctness properties defined in the design document.

## Tasks

- [x] 1. Project Setup and Configuration
  - [x] 1.1 Initialize Next.js project with App Router, TypeScript strict mode, Tailwind CSS, and ESLint
    - _Requirements: 11.1, 10.1_
  - [x] 1.2 Install and configure Supabase client libraries (`@supabase/supabase-js`, `@supabase/ssr`)
    - _Requirements: 11.1_
  - [x] 1.3 Create environment variables configuration (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
    - _Requirements: 11.1_
  - [x] 1.4 Create Supabase client utilities: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), `lib/supabase/middleware.ts`
    - _Requirements: 11.1, 2.3_
  - [x] 1.5 Configure Tailwind dark mode with class strategy
    - _Requirements: 10.1, 10.2_
  - [x] 1.6 Set up root layout with font loading and base providers
    - _Requirements: 10.4_

- [x] 2. Database Schema and RLS
  - [x] 2.1 Create SQL migration for `profiles` table with RLS policies
    - _Requirements: 11.1, 11.2, 9.1_
  - [x] 2.2 Create SQL migration for `accounts` table with type CHECK constraint and RLS policies
    - _Requirements: 7.2, 11.1, 11.2_
  - [x] 2.3 Create SQL migration for `categories` table with RLS policies
    - _Requirements: 8.1, 11.1, 11.2_
  - [x] 2.4 Create SQL migration for `transactions` table with type CHECK, amount CHECK, foreign keys, and RLS policies
    - _Requirements: 5.1, 5.2, 11.1, 11.2_
  - [x] 2.5 Create SQL migration for `adjust_account_balance` PostgreSQL function
    - _Requirements: 5.1, 5.3, 5.4, 5.5_
  - [x] 2.6 Create SQL migration for trigger to auto-create profile on user signup
    - _Requirements: 1.1_
  - [x] 2.7 Create Supabase Storage bucket configuration for avatars
    - _Requirements: 9.2_

- [x] 3. TypeScript Types and Currency Utilities
  - [x] 3.1 Create database types in `lib/types/database.ts` matching the schema (Account, Transaction, Category, Profile types)
    - _Requirements: 5.2, 7.1, 12.2, 12.3_
  - [x] 3.2 Implement `lib/utils/currency.ts` with `centsToDollars`, `dollarsToCents`, `formatCurrency`, `parseCurrencyInput`
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  - [ ]* 3.3 Write property-based test: currency round-trip (formatCurrency → parseCurrencyInput returns original cents)
    - **Property 1: Currency Round-Trip**
    - **Validates: Requirements 12.4**
  - [ ]* 3.4 Write property-based test: dollarsToCents always produces an integer
    - **Property 7: Cents Storage Integrity**
    - **Validates: Requirements 5.2, 7.1**

- [x] 4. Authentication
  - [x] 4.1 Create `(auth)` route group layout (centered, minimal design)
    - _Requirements: 1.1, 2.1_
  - [x] 4.2 Implement signup page with email/password form, client-side validation (min 6 chars), and Supabase Auth signup
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 4.3 Implement login page with email/password form and Supabase Auth login
    - _Requirements: 2.1, 2.2_
  - [x] 4.4 Implement middleware for session refresh and route protection (redirect unauthenticated to /login, authenticated from /auth to /dashboard)
    - _Requirements: 2.3, 2.4_
  - [x] 4.5 Add logout server action and integrate into the protected layout
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Protected Layout and Navigation
  - [x] 5.1 Create `(app)` route group layout with sidebar navigation
    - _Requirements: 4.1_
  - [x] 5.2 Implement sidebar with links to Dashboard, Transactions, Accounts, Categories, Profile, Settings
    - _Requirements: 4.1_
  - [x] 5.3 Add user avatar and display name to sidebar header
    - _Requirements: 9.1, 9.2_
  - [x] 5.4 Implement responsive mobile navigation (hamburger menu)
    - _Requirements: 4.1_
  - [x] 5.5 Integrate dark mode class toggle into the protected layout based on user preference
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 6. Accounts Feature
  - [x] 6.1 Create server actions for accounts CRUD (`getAccounts`, `createAccount`, `updateAccount`, `deleteAccount`) in `app/(app)/accounts/actions.ts`
    - _Requirements: 7.1, 7.3, 7.5_
  - [x] 6.2 Implement accounts list page displaying all accounts with name, type, balance (formatted), and color
    - _Requirements: 7.6_
  - [x] 6.3 Implement create account form with name, type (dropdown: Checking, Savings, Credit Card, Wallet, Cash, Investment, Other), initial balance, and color picker
    - _Requirements: 7.1, 7.2_
  - [x] 6.4 Implement edit account dialog/form
    - _Requirements: 7.3_
  - [x] 6.5 Implement delete account with confirmation dialog warning about associated transaction deletion
    - _Requirements: 7.4, 7.5_
  - [x] 6.6 Wire balance adjustment to `adjust_account_balance` RPC on transaction mutations
    - _Requirements: 7.7, 5.1, 5.3, 5.4_

- [x] 7. Categories Feature
  - [x] 7.1 Create server actions for categories CRUD (`getCategories`, `createCategory`, `updateCategory`, `deleteCategory`) in `app/(app)/categories/actions.ts`
    - _Requirements: 8.1, 8.2, 8.3_
  - [x] 7.2 Implement categories list page displaying all categories with icon and color
    - _Requirements: 8.4_
  - [x] 7.3 Implement create category form with name, icon selector, and color picker
    - _Requirements: 8.1_
  - [x] 7.4 Implement edit category dialog/form
    - _Requirements: 8.2_
  - [x] 7.5 Implement delete category with check for associated transactions (prevent if in use)
    - _Requirements: 8.3_

- [x] 8. Transactions Feature
  - [x] 8.1 Create server actions for transactions CRUD (`getTransactions`, `createTransaction`, `updateTransaction`, `deleteTransaction`) in `app/(app)/transactions/actions.ts`
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6_
  - [x] 8.2 Implement transactions list page with amount (formatted), type badge, category, account, date, and description
    - _Requirements: 5.1, 12.1_
  - [x] 8.3 Implement create transaction form with amount input (dollars), type toggle (income/expense), category select, account select, date picker, and optional description
    - _Requirements: 5.1, 5.2_
  - [x] 8.4 Implement edit transaction dialog/form with balance recalculation on amount or account change
    - _Requirements: 5.3, 5.5_
  - [x] 8.5 Implement delete transaction with balance reversal
    - _Requirements: 5.4_
  - [x] 8.6 Implement transaction type filter (income, expense, all)
    - _Requirements: 6.1_
  - [x] 8.7 Implement date range filter with start and end date pickers
    - _Requirements: 6.2_
  - [x] 8.8 Implement combined filtering logic and empty state display
    - _Requirements: 6.3, 6.4_
  - [ ]* 8.9 Write property-based test: filter correctness (all returned transactions match active filters)
    - **Property 3: Filter Correctness**
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 9. Checkpoint - Ensure core features work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Dashboard
  - [x] 10.1 Create server actions/queries for dashboard data (`getTotalBalance`, `getMonthlyChartData`, `getRecentTransactions`) in `app/(app)/dashboard/actions.ts`
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 10.2 Implement total balance card displaying sum of all account balances formatted as USD
    - _Requirements: 4.1, 4.4_
  - [x] 10.3 Implement income vs. expenses bar/area chart for current month using Recharts
    - _Requirements: 4.2, 4.5_
  - [x] 10.4 Implement recent transactions list (10 most recent, ordered by date descending)
    - _Requirements: 4.3_
  - [x] 10.5 Implement empty states: $0.00 balance when no accounts, zero chart when no transactions
    - _Requirements: 4.4, 4.5_
  - [ ]* 10.6 Write property-based test: total balance equals sum of individual account balances
    - **Property 4: Total Balance Equals Sum of Accounts**
    - **Validates: Requirements 4.1**
  - [ ]* 10.7 Write property-based test: recent transactions are ordered descending and at most 10
    - **Property 6: Recent Transactions Ordering**
    - **Validates: Requirements 4.3**

- [x] 11. Profile, Settings, and Balance Integrity
  - [x] 11.1 Implement profile page with display name edit form
    - _Requirements: 9.1_
  - [x] 11.2 Implement avatar upload with client-side 2 MB validation and Supabase Storage integration
    - _Requirements: 9.2, 9.3_
  - [x] 11.3 Implement settings page with dark mode toggle
    - _Requirements: 10.1, 10.2_
  - [x] 11.4 Create server action for updating dark mode preference in profiles table
    - _Requirements: 10.3_
  - [x] 11.5 Ensure dark mode preference persists and applies on page load (server-side class injection)
    - _Requirements: 10.3, 10.4_
  - [ ]* 11.6 Write property-based test: account balance invariant (balance = initial + sum(income) - sum(expenses))
    - **Property 2: Transaction Balance Invariant**
    - **Validates: Requirements 5.1, 5.3, 5.4, 7.7**
  - [ ]* 11.7 Write property-based test: moving a transaction between accounts preserves total net worth
    - **Property 5: Transaction Move Preserves Net Worth**
    - **Validates: Requirements 5.5**

- [ ] 12. Final Integration and Polish
  - [ ] 12.1 Add loading skeletons for all data-fetching pages
    - _Requirements: 4.1_
  - [ ] 12.2 Add error boundaries and user-friendly error states for all server actions
    - _Requirements: 5.6_
  - [ ] 12.3 Ensure all interactive elements are keyboard-navigable and have appropriate ARIA labels
    - _Requirements: 4.1_
  - [ ] 12.4 Verify responsive layout across mobile, tablet, and desktop breakpoints
    - _Requirements: 4.1_
  - [ ] 12.5 Remove any `console.log` statements and verify no `any` types exist
    - _Requirements: 12.1_
  - [ ] 12.6 Verify Vercel deployment configuration (no custom server, env vars documented)
    - _Requirements: 11.1_

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based test tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 9 and 13) ensure incremental validation
- Property-based tests validate universal correctness properties defined in the design document
- Unit tests validate specific examples and edge cases
- All monetary values must be stored as integers (cents) and displayed in USD format ($1,234.56)
- TypeScript strict mode with no `any` types throughout
- Supabase RLS policies must be applied to all tables scoped to `auth.uid()`
- Dark mode uses Tailwind class strategy with preference persisted in the profiles table

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4", "1.5", "1.6"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7"] },
    { "id": 3, "tasks": ["3.1", "3.2"] },
    { "id": 4, "tasks": ["3.3", "3.4", "4.1", "4.2", "4.3"] },
    { "id": 5, "tasks": ["4.4", "4.5"] },
    { "id": 6, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5"] },
    { "id": 7, "tasks": ["6.1", "7.1"] },
    { "id": 8, "tasks": ["6.2", "6.3", "7.2", "7.3"] },
    { "id": 9, "tasks": ["6.4", "6.5", "7.4", "7.5"] },
    { "id": 10, "tasks": ["6.6", "8.1"] },
    { "id": 11, "tasks": ["8.2", "8.3"] },
    { "id": 12, "tasks": ["8.4", "8.5", "8.6", "8.7"] },
    { "id": 13, "tasks": ["8.8", "8.9"] },
    { "id": 14, "tasks": ["10.1"] },
    { "id": 15, "tasks": ["10.2", "10.3", "10.4", "10.5"] },
    { "id": 16, "tasks": ["10.6", "10.7", "11.1", "11.2", "11.3"] },
    { "id": 17, "tasks": ["11.4", "11.5", "11.6", "11.7"] },
    { "id": 18, "tasks": ["12.1", "12.2", "12.3", "12.4", "12.5", "12.6"] }
  ]
}
```
