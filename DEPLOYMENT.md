# PeerLens Deployment Guide

This guide covers setting up staging and production environments with Vercel and GitHub CI/CD.

## Overview

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Production | `main` | peerlens.app | Live users |
| Staging | `staging` | staging.peerlens.app | Testing before prod |
| Preview | PR branches | *.vercel.app | PR review |

---

## Prerequisites

1. **GitHub Repository** - Code pushed to GitHub
2. **Vercel Account** - Free tier works
3. **Two Supabase Projects** - One for staging, one for production
4. **Resend Account** - For email sending
5. **Domain** (optional) - For custom domains

---

## Step 1: Create Supabase Projects

You need **two separate Supabase projects** to keep staging and production data isolated.

### 1.1 Create Production Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Name it `peerlens-prod` (or similar)
3. Save the project URL and keys from Settings > API:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 1.2 Create Staging Project

1. Create another project named `peerlens-staging`
2. Save the same credentials for staging

### 1.3 Run Migrations on Both Projects

For each project, run all migrations in order:

```bash
# Connect to Supabase project
npx supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Or run migrations manually via SQL Editor in Supabase dashboard
# Copy content from supabase/migrations/*.sql files
```

Migration files to run (in order):
1. `001_initial_schema.sql`
2. `002_self_assessment.sql`
3. `003_skill_templates.sql`
4. `004_shared_cycle_link.sql`
5. `005_email_tracking.sql`
6. `006_nurture_and_cron.sql`

---

## Step 2: Configure Resend

### 2.1 Create API Keys

1. Go to [resend.com](https://resend.com) and create an account
2. Add and verify your domain (e.g., `peerlens.app`)
3. Create two API keys:
   - **Production**: Full access
   - **Staging**: Use the same key or create a test key

### 2.2 Set Up Webhooks

1. Go to Resend Dashboard > Webhooks
2. Add webhook endpoint:
   - **Production**: `https://peerlens.app/api/webhooks/resend`
   - **Staging**: `https://staging.peerlens.app/api/webhooks/resend`
3. Select events: `email.sent`, `email.delivered`, `email.bounced`, `email.complained`
4. Save the webhook signing secret for each environment

---

## Step 3: Set Up Vercel

### 3.1 Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your `peerlens` repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3.2 Configure Environment Variables

In Vercel project settings > Environment Variables, add variables for each environment:

#### Production Variables (Environment: Production)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your prod Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your prod anon key |
| `SUPABASE_URL` | Your prod Supabase URL |
| `SUPABASE_ANON_KEY` | Your prod anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your prod service role key |
| `RESEND_API_KEY` | Your Resend API key |
| `RESEND_WEBHOOK_SECRET` | Your prod webhook secret |
| `RESEND_FROM_EMAIL` | `PeerLens <feedback@peerlens.app>` |
| `ADMIN_EMAIL` | Your admin email |
| `NEXT_PUBLIC_APP_URL` | `https://peerlens.app` |

> Note: `CRON_SECRET` is automatically set by Vercel for production crons.

#### Preview/Staging Variables (Environment: Preview)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your staging Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your staging anon key |
| `SUPABASE_URL` | Your staging Supabase URL |
| `SUPABASE_ANON_KEY` | Your staging anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your staging service role key |
| `RESEND_API_KEY` | Your Resend API key (or test key) |
| `RESEND_WEBHOOK_SECRET` | Your staging webhook secret |
| `RESEND_FROM_EMAIL` | `PeerLens Staging <staging@peerlens.app>` |
| `ADMIN_EMAIL` | Your admin email |
| `NEXT_PUBLIC_APP_URL` | `https://staging.peerlens.app` |
| `CRON_SECRET` | Generate with `openssl rand -base64 32` |

### 3.3 Configure Git Integration

In Vercel project settings > Git:

1. **Production Branch**: `main`
2. **Preview Branches**: Enable for all branches

This means:
- Pushes to `main` → Deploy to production
- Pushes to `staging` → Deploy to preview (staging URL)
- Pull requests → Deploy to unique preview URL

### 3.4 Set Up Staging Domain (Optional)

1. Go to Vercel project > Settings > Domains
2. Add `staging.peerlens.app` (or your staging domain)
3. Configure it to deploy from the `staging` branch:
   - Click the domain settings
   - Set "Git Branch" to `staging`

---

## Step 4: Create Staging Branch

```bash
# Create and push staging branch
git checkout -b staging
git push -u origin staging

# Return to main
git checkout main
```

---

## Step 5: GitHub Branch Protection (Recommended)

### 5.1 Protect Main Branch

Go to GitHub repo > Settings > Branches > Add rule:

- **Branch name pattern**: `main`
- **Require pull request reviews before merging**: Yes
- **Require status checks to pass**: Yes
  - Select: `Lint & Type Check`, `Build`
- **Require branches to be up to date**: Yes

### 5.2 Protect Staging Branch

Add another rule for `staging` with similar (or relaxed) settings.

---

## Workflow

### Development Flow

```
feature-branch → staging → main
       ↓            ↓        ↓
   PR Preview   Staging   Production
```

1. **Create feature branch** from `staging`
   ```bash
   git checkout staging
   git pull
   git checkout -b feature/my-feature
   ```

2. **Develop and push**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   git push -u origin feature/my-feature
   ```

3. **Create PR to staging**
   - GitHub Actions runs CI (lint, typecheck, build)
   - Vercel creates preview deployment
   - Review and test on preview URL

4. **Merge to staging**
   - Deploys automatically to staging environment
   - Test on staging.peerlens.app

5. **Create PR from staging to main**
   - Final review
   - Merge to deploy to production

### Hotfix Flow

For urgent production fixes:

```bash
git checkout main
git pull
git checkout -b hotfix/critical-fix
# Make fix
git push -u origin hotfix/critical-fix
# Create PR directly to main
# After merge, also merge main back to staging
```

---

## Cron Jobs

Vercel cron jobs are defined in `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/auto-conclude", "schedule": "0 10 * * *" },
    { "path": "/api/cron/expire-invitations", "schedule": "0 11 * * *" },
    { "path": "/api/cron/nurture", "schedule": "0 12 * * *" }
  ]
}
```

- Crons only run in **production** (Vercel Pro/Enterprise) or on manual trigger
- Vercel automatically sets `CRON_SECRET` and validates requests
- For staging, trigger manually:
  ```bash
  curl -X GET https://staging.peerlens.app/api/cron/auto-conclude \
    -H "Authorization: Bearer YOUR_STAGING_CRON_SECRET"
  ```

---

## Monitoring

### Vercel

- **Deployments**: View all deployments and their status
- **Logs**: Real-time function logs
- **Analytics**: Performance and usage (Pro plan)

### Supabase

- **Database**: Monitor queries and connections
- **Auth**: Track user signups and sessions
- **Logs**: API and database logs

### Resend

- **Email logs**: Delivery status and events
- **Webhooks**: Event delivery history

---

## Troubleshooting

### Build Fails

1. Check GitHub Actions output for errors
2. Ensure all env vars are set in Vercel
3. Run `npm run build` locally to reproduce

### Emails Not Sending

1. Verify `RESEND_API_KEY` is correct
2. Check domain is verified in Resend
3. Check Resend dashboard for delivery status

### Database Errors

1. Verify Supabase credentials
2. Check migrations ran successfully
3. Verify RLS policies allow the operation

### Cron Jobs Not Running

1. Crons only run on Vercel Pro/Enterprise in production
2. For staging, trigger manually with correct `CRON_SECRET`
3. Check function logs in Vercel dashboard

---

## Checklist

### Before First Deploy

- [ ] Created staging Supabase project
- [ ] Created production Supabase project
- [ ] Ran all migrations on both projects
- [ ] Set up Resend with verified domain
- [ ] Created webhook endpoints for both environments
- [ ] Connected repo to Vercel
- [ ] Set all environment variables in Vercel
- [ ] Created `staging` branch
- [ ] Configured branch protection rules

### Before Production Deploy

- [ ] All tests pass on staging
- [ ] Tested critical flows manually
- [ ] Verified email sending works
- [ ] Checked mobile responsiveness
- [ ] Reviewed security settings
- [ ] Confirmed custom domain is set up

---

## Environment Comparison

| Feature | Local | Staging | Production |
|---------|-------|---------|------------|
| Database | Local/Dev Supabase | Staging Supabase | Prod Supabase |
| Emails | Test mode / Resend | Real emails | Real emails |
| Crons | Manual trigger | Manual trigger | Automatic |
| Domain | localhost:3000 | staging.peerlens.app | peerlens.app |
| Data | Test data | Test data | Real users |
