# Monfily — Personal Finance App

A modern personal finance web application built with Next.js App Router and Supabase. Track income, expenses, and net worth across multiple accounts with custom categories and visual charts.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Styling**: Tailwind CSS with dark mode
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([create one here](https://app.supabase.com))

### Local Development

1. Clone the repository:

```bash
git clone <repo-url>
cd monfily-web
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file from the example:

```bash
cp .env.local.example .env.local
```

4. Fill in your Supabase credentials (see [Environment Variables](#environment-variables)).

5. Run the Supabase migrations against your project (see `supabase/migrations/`).

6. Start the development server:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous (public) key |

These values are found in your Supabase dashboard under **Project Settings > API**.

> **Security**: Never expose the Supabase service role key on the client side. The anon key is safe for client use because Row Level Security (RLS) restricts data access per authenticated user.

## Deployment to Vercel

This project is configured for zero-config Vercel deployment:

1. Push the repository to GitHub/GitLab.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add the required environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. No custom build commands or server configuration needed.

### Vercel Configuration Notes

- No custom server — uses standard Next.js serverless deployment
- No `serverExternalPackages` or custom port configuration
- Framework preset: **Next.js** (auto-detected)
- Build command: `next build` (default)
- Output directory: `.next` (default)

## Database Setup

Run the SQL migrations in `supabase/migrations/` in order against your Supabase project:

1. `00001_create_profiles.sql` — User profiles with RLS
2. `00002_create_accounts.sql` — Financial accounts with RLS
3. `00003_create_categories.sql` — Transaction categories with RLS
4. `00004_create_transactions.sql` — Transactions with RLS
5. `00005_adjust_account_balance.sql` — Balance adjustment function
6. `00006_auto_create_profile.sql` — Auto-create profile on signup
7. `00007_seed_default_categories.sql` — Seed 7 default categories for new users

### Supabase Storage

Create a public bucket named `avatars` for user profile images.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth pages (login, signup)
│   ├── (app)/            # Protected pages (dashboard, transactions, etc.)
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing/redirect page
├── components/           # Shared UI components
├── middleware.ts         # Auth session refresh + route protection
lib/
├── supabase/             # Supabase client utilities
├── types/                # TypeScript type definitions
└── utils/                # Utility functions (currency, etc.)
```

## License

Private project.
