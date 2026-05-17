# Matheye

Matheye is a Next.js App Router math learning platform built for Vercel and Neon.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` and `SESSION_SECRET`.
3. Run the database migration:
   ```bash
   npm run db:migrate
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

## Vercel

Set these environment variables in Vercel:

- `DATABASE_URL`
- `SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`

The app uses HTTP-only cookie sessions and stores course content in TypeScript files. Neon stores users, sessions, progress, practice sessions, and test results.
