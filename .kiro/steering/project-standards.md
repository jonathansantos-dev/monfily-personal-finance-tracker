---
inclusion: always
---

# Monfily — Project Standards

## Language
- All code, comments, variable names, and UI text must be in **English**
- No Portuguese anywhere in the codebase

## TypeScript
- Strict mode enabled — no `any`, no implicit types
- All props, function parameters, and return types must be explicitly typed

## Currency
- All monetary values displayed in **USD ($)**
- Format: `$1,234.56` — always 2 decimal places
- Store amounts as integers (cents) in the database to avoid floating point issues

## Code Quality
- No `console.log` in committed code
- All API calls must handle errors explicitly — never assume success
- No hardcoded strings in components — use constants or i18n keys

## Git
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`
- Never commit `.env` files
