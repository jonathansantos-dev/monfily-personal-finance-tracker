# Requirements Document

## Introduction

Monfily is a modern personal finance web application that helps individuals track income, expenses, and net worth in one place. Built with Next.js App Router and Supabase, it provides a single-user experience where each authenticated user manages their own financial data securely. All monetary values are stored in cents and displayed in USD format ($1,234.56).

## Glossary

- **Monfily**: The personal finance web application
- **User**: An authenticated individual using the application to manage personal finances
- **Auth_Module**: The authentication subsystem responsible for sign-up, login, logout, and session management via Supabase Auth
- **Dashboard**: The main overview page displaying financial summaries and recent activity
- **Transaction**: A financial record representing either income or an expense, associated with a category and an account
- **Account**: A financial container with a name, type, balance, and color
- **Account_Type**: The classification of an account — one of: Checking, Savings, Credit Card, Wallet, Cash, Investment, Other
- **Category**: A user-defined classification with an icon and color used to organize transactions
- **Profile_Module**: The subsystem responsible for managing user profile information (name and avatar)
- **Settings_Module**: The subsystem responsible for user preferences such as dark mode
- **RLS**: Row Level Security — Supabase PostgreSQL policy that restricts data access to the owning user via `auth.uid()`
- **Cents**: Integer representation of monetary amounts (e.g., $12.50 stored as 1250)
- **Balance**: The current amount of money in an account, stored in cents
- **Net_Worth**: The sum of all account balances for a user
- **Default_Categories**: The 7 pre-defined categories automatically created for each new user upon registration: Food, Transport, Housing, Health, Entertainment, Income, Other

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to create an account with email and password, so that I can start tracking my finances.

#### Acceptance Criteria

1. WHEN a user submits a valid email and password, THE Auth_Module SHALL create a new user account via Supabase Auth
2. WHEN a user submits an email that is already registered, THE Auth_Module SHALL display an error message indicating the email is already in use
3. WHEN a user submits a password shorter than 6 characters, THE Auth_Module SHALL display an error message indicating the password is too short
4. WHEN registration succeeds, THE Auth_Module SHALL redirect the user to the Dashboard

### Requirement 2: User Login

**User Story:** As a returning user, I want to log in with my credentials, so that I can access my financial data.

#### Acceptance Criteria

1. WHEN a user submits valid email and password credentials, THE Auth_Module SHALL authenticate the user and redirect to the Dashboard
2. WHEN a user submits invalid credentials, THE Auth_Module SHALL display an error message indicating authentication failed
3. WHILE a valid session exists, THE Auth_Module SHALL persist the session across browser refreshes
4. WHEN a user visits a protected route without a valid session, THE Auth_Module SHALL redirect the user to the login page

### Requirement 3: User Logout

**User Story:** As a logged-in user, I want to log out, so that I can secure my account on shared devices.

#### Acceptance Criteria

1. WHEN a user triggers the logout action, THE Auth_Module SHALL terminate the current session via Supabase Auth
2. WHEN logout completes, THE Auth_Module SHALL redirect the user to the login page
3. WHEN logout completes, THE Auth_Module SHALL clear all cached user data from the client

### Requirement 4: Dashboard Overview

**User Story:** As a user, I want to see a summary of my finances on the dashboard, so that I can quickly understand my financial position.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Dashboard SHALL display the total balance across all accounts formatted as USD ($1,234.56)
2. WHEN the Dashboard loads, THE Dashboard SHALL display an income vs. expenses chart for the current calendar month
3. WHEN the Dashboard loads, THE Dashboard SHALL display a list of the 10 most recent transactions ordered by date descending
4. WHEN a user has no accounts, THE Dashboard SHALL display a total balance of $0.00
5. WHEN a user has no transactions for the current month, THE Dashboard SHALL display the chart with zero values for both income and expenses

### Requirement 5: Transaction Management

**User Story:** As a user, I want to log, edit, and delete transactions, so that I can maintain an accurate record of my income and expenses.

#### Acceptance Criteria

1. WHEN a user submits a new transaction with amount, type (income or expense), category, account, date, and optional description, THE Monfily SHALL create the transaction record and update the associated account balance
2. THE Monfily SHALL store transaction amounts as integers in cents
3. WHEN a user edits an existing transaction, THE Monfily SHALL update the transaction record and recalculate the associated account balance
4. WHEN a user deletes a transaction, THE Monfily SHALL remove the transaction record and recalculate the associated account balance
5. WHEN a user changes the account on an existing transaction, THE Monfily SHALL recalculate balances for both the previous and new accounts
6. IF a transaction submission fails due to a network error, THEN THE Monfily SHALL display an error message and preserve the user's input

### Requirement 6: Transaction Filtering

**User Story:** As a user, I want to filter my transactions by type and date range, so that I can find specific records quickly.

#### Acceptance Criteria

1. WHEN a user selects a transaction type filter (income, expense, or all), THE Monfily SHALL display only transactions matching the selected type
2. WHEN a user selects a date range, THE Monfily SHALL display only transactions within that date range (inclusive)
3. WHEN a user applies both type and date range filters simultaneously, THE Monfily SHALL display only transactions matching both criteria
4. WHEN no transactions match the applied filters, THE Monfily SHALL display an empty state message

### Requirement 7: Account Management

**User Story:** As a user, I want to manage multiple financial accounts, so that I can track money across different sources.

#### Acceptance Criteria

1. WHEN a user creates a new account with a name, initial balance, and color, THE Monfily SHALL store the account with the balance in cents
2. WHEN a user creates a new account, THE Monfily SHALL require the user to select an account type from the following options: Checking, Savings, Credit Card, Wallet, Cash, Investment, Other
3. WHEN a user edits an account, THE Monfily SHALL update the account name, type, color, or manually adjusted balance
4. WHEN a user initiates account deletion, THE Monfily SHALL display a confirmation dialog warning that all associated transactions will also be deleted
5. WHEN a user confirms account deletion, THE Monfily SHALL remove the account and all associated transactions
6. THE Monfily SHALL display each account with its name, type, current balance formatted as USD, and assigned color
7. WHEN a user creates a transaction on an account, THE Monfily SHALL automatically update that account balance (add for income, subtract for expense)

### Requirement 8: Category Management

**User Story:** As a user, I want to create custom categories with icons and colors, so that I can organize my transactions meaningfully.

#### Acceptance Criteria

1. WHEN a user creates a new category with a name, icon, and color, THE Monfily SHALL store the category associated with the user
2. WHEN a user edits a category, THE Monfily SHALL update the category name, icon, or color
3. WHEN a user deletes a category that has associated transactions, THE Monfily SHALL prevent deletion and display a message indicating the category is in use
4. THE Monfily SHALL display each category with its assigned icon and color in all category selection interfaces

### Requirement 9: Profile Management

**User Story:** As a user, I want to edit my name and avatar, so that I can personalize my account.

#### Acceptance Criteria

1. WHEN a user updates their display name, THE Profile_Module SHALL save the new name and reflect it across the application
2. WHEN a user uploads a new avatar image, THE Profile_Module SHALL store the image via Supabase Storage and display it across the application
3. IF an avatar upload exceeds 2 MB, THEN THE Profile_Module SHALL reject the upload and display a file size error message

### Requirement 10: Dark Mode Setting

**User Story:** As a user, I want to toggle dark mode, so that I can use the app comfortably in low-light environments.

#### Acceptance Criteria

1. WHEN a user enables dark mode, THE Settings_Module SHALL apply the dark color theme to all application pages
2. WHEN a user disables dark mode, THE Settings_Module SHALL apply the light color theme to all application pages
3. THE Settings_Module SHALL persist the dark mode preference across sessions
4. WHEN a new user accesses the application for the first time, THE Settings_Module SHALL default to the light color theme

### Requirement 11: Data Security via Row Level Security

**User Story:** As a user, I want my financial data to be private, so that no other user can access my records.

#### Acceptance Criteria

1. THE Monfily SHALL enforce Supabase Row Level Security policies on all database tables
2. THE Monfily SHALL scope all RLS policies to `auth.uid()` so that each user accesses only their own data
3. WHEN an unauthenticated request reaches a protected table, THE Monfily SHALL deny access and return no data

### Requirement 12: Currency Display Formatting

**User Story:** As a user, I want all monetary values displayed consistently, so that I can read amounts without confusion.

#### Acceptance Criteria

1. THE Monfily SHALL display all monetary values in USD format: `$1,234.56` with comma-separated thousands and exactly 2 decimal places
2. THE Monfily SHALL convert stored cent values to dollar amounts for display by dividing by 100
3. THE Monfily SHALL convert user-entered dollar amounts to cent values for storage by multiplying by 100 and rounding to the nearest integer
4. FOR ALL valid cent integer values, converting to display format then parsing back to cents SHALL produce the original value (round-trip property)

### Requirement 13: Default Category Seeding

**User Story:** As a new user, I want default categories to exist immediately after registration, so that I can create transactions without needing to set up categories first.

#### Acceptance Criteria

1. WHEN a new user successfully registers, THE Monfily SHALL automatically create 7 default categories for that user: Food (🍔, #f97316), Transport (🚗, #3b82f6), Housing (🏠, #8b5cf6), Health (💊, #10b981), Entertainment (🎬, #ec4899), Income (💰, #22c55e), Other (📦, #6b7280)
2. THE Monfily SHALL store each default category with a name, icon (emoji), and color (hex code) associated with the registered user
3. WHEN default categories are created, THE Monfily SHALL ensure the user can immediately create transactions without manually creating a category first
4. THE Monfily SHALL allow the user to edit any default category name, icon, or color after registration
5. THE Monfily SHALL allow the user to delete a default category after registration, subject to the existing deletion constraint that prevents deletion of categories with associated transactions (Requirement 8.3)
