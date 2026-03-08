# Quick Fix: NextAuth "auth is not a function" Error

## TL;DR

The error occurred because NextAuth environment variables were missing from the validation schema.

## Fix in 3 Steps

### 1. Ensure .env.local exists

```bash
cp .env.example .env.local
```

### 2. Verify these variables are in .env.local

```env
AUTH_SECRET=development-secret-key-min-32-chars-required-change-in-prod
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

### 3. Restart the dev server

```bash
npm run dev
```

## What Changed

| File | Change |
|------|--------|
| `serverEnv.mjs` | Added AUTH_SECRET, AUTH_URL, AUTH_TRUST_HOST to schema |
| `.env.local` | Created with NextAuth variables |
| `auth.ts` | Added validation checks |
| `proxy.ts` | Added try-catch error handling |

## Production Setup

Generate a secure secret:
```bash
openssl rand -base64 32
```

Set in your production environment:
```env
AUTH_SECRET=<your-generated-secret>
AUTH_URL=https://yourdomain.com
AUTH_TRUST_HOST=true
```

## Still Having Issues?

Check:
1. `.env.local` exists and has correct variables
2. AUTH_SECRET is at least 32 characters
3. No syntax errors in .env.local
4. Dev server was restarted after changes

See `NEXTAUTH_FIX.md` for full details.
