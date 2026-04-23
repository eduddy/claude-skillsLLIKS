# Deploying PromptVault to Vercel + Neon

## 1 — Create a Neon database

1. Go to https://neon.tech and create a free project
2. From **Connection Details**, copy:
   - **Pooled connection string** → `DATABASE_URL`
   - **Direct connection string** → `DIRECT_URL`

## 2 — Set up the schema

```bash
# Install deps
pnpm install

# Copy env file and fill in values
cp .env.example .env.local

# Push schema to Neon (creates tables)
pnpm db:push

# Seed built-in AI services
pnpm db:seed
```

## 3 — Deploy to Vercel

```bash
# Install Vercel CLI (if needed)
pnpm add -g vercel

# Deploy
vercel

# Or link to an existing project
vercel link && vercel --prod
```

## 4 — Add environment variables in Vercel

In your Vercel project dashboard → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `DIRECT_URL` | Neon direct connection string |
| `AUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your Vercel deployment URL |
| `GITHUB_CLIENT_ID` | *(optional)* GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | *(optional)* GitHub OAuth app secret |
| `GOOGLE_CLIENT_ID` | *(optional)* Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | *(optional)* Google OAuth client secret |

## 5 — Re-deploy after adding env vars

```bash
vercel --prod
```

## Local development

```bash
pnpm install
cp .env.example .env.local   # fill in values
pnpm db:push
pnpm db:seed
pnpm dev                      # http://localhost:3000
```
