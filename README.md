# Monfily — Personal Finance Tracker

A SaaS-style personal finance web app for tracking income, expenses, and net worth across multiple accounts — with custom categories and visual charts.

## The Story

This project was conceived years ago and sat untouched due to the demands of a full-time senior engineering role. In June 2026, I attended a live workshop on **Spec-Driven Development** using [Kiro IDE](https://kiro.dev), presented by Saurabh Dahal (Developer Relations Engineer, AWS) at the AWS Builder Center.

I applied the methodology the same day. Within hours, Monfily went from a stale idea to a fully functional application running in production — complete with authentication, database migrations, and connected to Supabase.

This is what Spec-Driven Development looks like in practice: three structured files (`requirements.md`, `design.md`, `tasks.md`) give the AI agent enough context to reason, build, and iterate without constant hand-holding. For a senior developer with limited time, it's a force multiplier.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Styling**: Tailwind CSS with dark mode
- **Charts**: Recharts
- **Deployment**: Vercel

## Features

- Multi-account tracking (checking, savings, investments)
- Income and expense management with custom categories
- Net worth dashboard with visual charts
- Supabase authentication (sign up, login, session management)
- Fully responsive dark UI

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([create one here](https://app.supabase.com))

### Setup

```bash
git clone https://github.com/jonathansantos-dev/monfily-personal-finance-tracker.git
cd monfily-personal-finance-tracker
npm install
cp .env.local.example .env.local
```

Fill in your Supabase credentials in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Run the migrations against your Supabase project, then:

```bash
npm run dev
```

## Built With Kiro

This project was built using [Kiro IDE](https://kiro.dev) following the Spec-Driven Development methodology. The specs live in `.kiro/specs/` and drove 100% of the implementation — from database schema to UI components.

---

Open to contributions and feedback.
