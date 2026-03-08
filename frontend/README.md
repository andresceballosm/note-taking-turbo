This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Setup

1. Copy the environment variables template:

```bash
cp .env.example .env.local
```

2. Update the `AUTH_SECRET` in `.env.local`:

```bash
# Generate a secure random secret (32+ characters required)
openssl rand -base64 32
```

3. Update `.env.local` with your generated secret:

```env
AUTH_SECRET=your-generated-secret-here
```

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

This project uses [@t3-oss/env-nextjs](https://env.t3.gg/) for type-safe environment variable validation.

### Required Environment Variables

**NextAuth.js (Authentication)**
- `AUTH_SECRET`: Secret key for encrypting cookies and tokens (minimum 32 characters)
- `AUTH_URL`: The canonical URL of your site (e.g., `http://localhost:3000` for development)
- `AUTH_TRUST_HOST`: Set to `true` when behind a proxy (default: `true`)

**Application**
- `NODE_ENV`: Node environment (`development` or `production`)
- `APP_ENV`: Application environment (`development`, `staging`, or `production`)
- `PORT`: Server port (default: `3000`)
- `LOG_LEVEL`: Logging level (`DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`)

**Next.js**
- `NEXT_TELEMETRY_DISABLED`: Disable Next.js telemetry (default: `1`)

### Development vs Production

For development, the environment variables have sensible defaults defined in `/src/lib/env/serverEnv.mjs`.

For production, you MUST set:
- `AUTH_SECRET` to a securely generated random string
- `AUTH_URL` to your production domain
- All other required variables

### Troubleshooting

If you see errors like "AUTH_SECRET is required" or "{imported module}.auth is not a function":

1. Ensure `.env.local` exists and has the required variables
2. Restart the development server after changing environment variables
3. Verify `AUTH_SECRET` is at least 32 characters long
4. Check that there are no syntax errors in your `.env.local` file

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
