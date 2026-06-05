# Monfily × Kiro — Step-by-Step Guide

> Complete walkthrough to build Monfily 100% with Kiro spec-driven development.  
> Follow every step in order. Do not skip.

---

## BEFORE YOU START — One-time Kiro setup

### Step 0A — Install global skills (do this once, works for all projects)

In Kiro, open the **Agent panel** (ghost icon in left sidebar).  
Click **+** on "Agent steering and skills" → **Global agent skills** → **Import skill from GitHub**

Import these 5 skills one by one (paste each URL):

```
https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md
https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md
https://github.com/mblode/agent-skills/blob/main/skills/ui-design/SKILL.md
https://github.com/anthropics/skills/blob/main/skills/theme-factory/SKILL.md
https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
```

✅ Done when all 5 appear in `~/.kiro/skills/`

---

### Step 0B — Set GitHub token (skip if already done)

Open PowerShell and run:
```powershell
[System.Environment]::SetEnvironmentVariable("GITHUB_PERSONAL_ACCESS_TOKEN", "ghp_YOUR_TOKEN_HERE", "User")
```
Replace `ghp_YOUR_TOKEN_HERE` with your actual GitHub Personal Access Token.  
Restart Kiro after running this.

---

## STEP 1 — Create the project folder

1. Create a new empty folder: `D:\kclan\projects\Monfily\monfily-kiro\`
2. Copy the entire `.kiro\` folder from this `KIRO_SETUP\` directory into `monfily-kiro\`

Result:
```
monfily-kiro/
└── .kiro/
    ├── steering/
    │   ├── project-standards.md
    │   └── tech-constraints.md
    └── settings/
        └── mcp.json
```

3. Open `monfily-kiro\` in **Kiro** (File → Open Folder)

---

## STEP 2 — Select the model

Bottom-left of Kiro → click the model selector → choose **Claude Opus 4.6** (use your workshop credits)

---

## STEP 3 — Open a new chat session and switch to Spec Mode

1. Open a new chat session (right sidebar)
2. At the top of the chat panel, switch from **Vibe** to **Spec** mode

---

## STEP 4 — Paste the initial prompt

Copy and paste this **exactly** into Kiro's Spec mode chat:

---

```
Build me Monfily — a modern personal finance web app.

About the product:
- Name: Monfily
- Purpose: Help individuals track income, expenses, and net worth in one place
- Currency: USD ($) — all monetary values in dollars
- Users: Single-user accounts (each user sees only their own data)

Core features:
- Authentication: sign up, log in, log out, session persistence
- Dashboard: total balance across accounts, income vs expenses chart for current month, recent transactions
- Transactions: log income and expenses, categorize them, filter by type and date range, edit and delete
- Accounts: manage multiple accounts (checking, savings, credit card, wallet, investments, etc.), each with a balance and color
- Categories: create custom categories with icon and color for organizing transactions
- Profile: edit name and avatar
- Settings: dark mode toggle

Constraints (non-negotiable):
- Backend: Supabase (Auth + PostgreSQL) — no custom server
- Deploy: Vercel
- Language: English everywhere
- Currency: USD only

Everything else — architecture, UI library, component structure, state management, design system — you decide. Make it look polished and production-ready. I want to be proud to show this to other engineers.
```

---

## STEP 5 — Review the Requirements document

Kiro will generate `requirements.md` first.

**Read it carefully.** Check:
- Are all 6 features covered? (auth, dashboard, transactions, accounts, categories, profile/settings)
- Is USD mentioned correctly?
- Are there any features you don't want?

**Before approving**, ask Kiro:
```
Review this requirements document. Are there any gaps or ambiguities that could cause problems during implementation? Suggest improvements.
```

Once happy → **Approve requirements**

---

## STEP 6 — Review the Design document

Kiro will generate `design.md`.

**Before approving**, run this prompt:
```
Use /vercel-react-best-practices and /ui-design and /frontend-design skills to review this design document. Are there performance patterns, accessibility improvements, or UI design principles we should incorporate? Update the design document with your recommendations.
```

Wait for Kiro to update the design. Read the updated version.

**Then ask:**
```
Does this design handle authentication edge cases correctly? What happens if the Supabase session expires mid-session? Make sure the design addresses this.
```

Once satisfied → **Approve design**

---

## STEP 7 — Review the Tasks document

Kiro will generate `tasks.md` — a numbered implementation plan.

Read through it. Check:
- Does it start with project setup / dependencies?
- Is auth implemented before protected routes?
- Are database tables created before the services that use them?

**Do not change the tasks** — Kiro owns them. Just approve.

→ **Approve tasks**

---

## STEP 8 — Run the tasks

Two options:

**Option A — Run all at once:**
```
Run all tasks.
```

**Option B — Run one at a time (recommended for learning):**
```
Run task 1.
```
Review the output, then: `Run task 2.` and so on.

For showing Saurabh, Option B is better — you'll understand every decision Kiro made.

---

## STEP 9 — Test after tasks complete

Once all tasks are done:
```
npm install
npm run dev
```

Open `http://localhost:3000` and test:
- [ ] Sign up with a new email
- [ ] Log in / log out
- [ ] Create a bank account
- [ ] Add an income transaction
- [ ] Add an expense transaction
- [ ] View the dashboard chart
- [ ] Create a custom category
- [ ] Toggle dark mode

---

## STEP 10 — Deploy to Vercel

1. Push `monfily-kiro/` to a new GitHub repo: `jonathansantos-dev/monfily`
2. Connect at [vercel.com](https://vercel.com) → Import repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
4. Deploy

Live URL: `monfily.vercel.app` (or similar)

---

## AFTER DEPLOY — Message to Saurabh on LinkedIn

Once it's live, send this on LinkedIn:

> "Hi Saurabh — I commented on your Kiro article on AWS Builder Center earlier this week. Took your workshop, used the spec-driven workflow to build Monfily — a personal finance app — 100% with Kiro. Here's what it produced: [vercel URL] and [github URL]. The spec files are in .kiro/specs/ if you're curious what Kiro decided on its own. Would love your feedback."

---

## Reference — Kiro spec files location

After completing, your project will have:
```
monfily-kiro/
└── .kiro/
    ├── steering/          ← injected into every session
    ├── settings/mcp.json  ← GitHub MCP
    └── specs/monfily/
        ├── requirements.md  ← what Kiro decided
        ├── design.md        ← what Kiro decided
        └── tasks.md         ← what Kiro decided
```
