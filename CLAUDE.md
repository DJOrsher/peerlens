# PeerLens - Claude Context

## Git Workflow (MUST FOLLOW)

**Branch Strategy:**
```
feature/* → staging → main
    ↓          ↓        ↓
 Preview   Staging  Production
```

| Branch | Environment | URL |
|--------|-------------|-----|
| `main` | Production | peerlens.app |
| `staging` | Staging | staging.peerlens.app |
| `feature/*` | Preview | *.vercel.app |

**Rules Claude MUST follow:**

1. **NEVER commit directly to `main`** - Always use PRs
2. **NEVER commit directly to `staging`** - Always use PRs
3. **Create feature branches from `staging`**, not from `main`
4. **All changes go through this flow:**
   - Create `feature/branch-name` from `staging`
   - Commit changes to feature branch
   - Push and create PR to `staging`
   - After staging is tested, create PR from `staging` to `main`

5. **Hotfixes only:** For critical production bugs, create `hotfix/*` from `main`, then merge back to both `main` AND `staging`

**Example workflow:**
```bash
# Start new work
git checkout staging
git pull origin staging
git checkout -b feature/my-feature

# Make changes, commit
git add .
git commit -m "feat: add feature"
git push -u origin feature/my-feature

# Then create PR: feature/my-feature → staging
# After staging approval: staging → main
```

---

## What This Is

Peer feedback tool for Product Managers. Users rate themselves on 6 skills, invite peers to provide anonymous/named feedback, then receive a report comparing self-perception to peer perception.

**Business model:** Free to respond, $50 to request your own cycle.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Actions, RSC)
- **Database:** Supabase (PostgreSQL + RLS + Auth)
- **Email:** Resend (peerlens.app domain)
- **Hosting:** Vercel
- **Validation:** Zod

## Code Map

```
app/
├── page.tsx                           # Landing page
├── login/page.tsx                     # Magic link auth
├── api/
│   └── webhooks/resend/route.ts       # Resend webhook handler (bounces, complaints)
├── dashboard/
│   ├── page.tsx                       # User's cycles list
│   └── cycle/[cycleId]/
│       ├── page.tsx                   # Cycle detail (invitations, status)
│       ├── CycleActions.tsx           # Send invitations, conclude, view report
│       ├── InvitationItem.tsx         # Individual invitation with reminder button
│       ├── ShareLink.tsx              # Shared link display + copy
│       └── ResponseProgress.tsx       # Real-time response count polling
├── start/
│   ├── page.tsx                       # Choose mode (anonymous/named)
│   └── [cycleId]/
│       ├── self-assessment/
│       │   ├── page.tsx               # Wizard container
│       │   └── SelfAssessmentWizard.tsx
│       └── invite/
│           ├── page.tsx               # Invite peers
│           └── InviteForm.tsx
├── respond/
│   ├── [token]/                       # Per-invitation link (system-sent)
│   │   ├── page.tsx                   # Public feedback form (no auth)
│   │   └── RespondWizard.tsx          # Multi-step responder form
│   └── c/[cycleToken]/                # Shared cycle link (user-sent)
│       ├── page.tsx                   # Asks for identity, then feedback
│       └── SharedRespondWizard.tsx    # Shared link responder form
└── report/[cycleId]/
    ├── page.tsx                       # Report page (requires concluded cycle)
    ├── SkillComparison.tsx            # Self vs peer rating comparison
    ├── AnonymousReport.tsx            # Anonymous mode: aggregated view
    └── NamedReport.tsx                # Named mode: individual responses

lib/
├── actions/
│   ├── auth.ts                        # requireAuth, signIn, signOut
│   ├── cycles.ts                      # CRUD for cycles, invitations, email sending
│   ├── report.ts                      # getReport (mode-aware generation)
│   ├── respond.ts                     # Submit response (uses service role)
│   └── templates.ts                   # Skill template queries
├── emails/
│   └── templates.ts                   # Email templates (invite, reminder, report-ready)
├── resend.ts                          # Resend client, sendEmail, logEmailEvent
├── supabase/
│   ├── server.ts                      # createClient, createServiceClient
│   └── client.ts                      # Browser client (unused)
└── validation.ts                      # Zod schemas, CONSTRAINTS

components/
└── ui/
    └── RadioGroup.tsx                 # Reusable radio button group

types/
└── database.ts                        # All types, enums, skill definitions
```

## Sprint Status

| Sprint | Focus | Status |
|--------|-------|--------|
| 1 | Foundation (Auth, Dashboard) | Done |
| 2 | Requester Flow (Cycles, Self-Assessment, Invitations) | Done |
| 3 | Responder Flow (Public form, Response submission) | Done |
| 4 | Report Generation | Done |
| 5 | Email System (Resend) | Done |
| 6 | Conversion & Polish | Done |

### Sprint 6 Completed Features
- **Cron jobs**: Auto-conclude (5 days, 0 responses), expire invitations (30 days), nurture emails
- **Conversion CTA**: Post-response signup prompt with email capture
- **Nurture sequence**: Day 7, 21, 42 emails with unsubscribe flow
- **Loading states**: Skeleton loaders for all main pages
- **Error handling**: Global error boundary and 404 page
- **Mobile responsive**: Fixed grid layouts for mobile
- **CI/CD**: GitHub Actions + Vercel staging/production environments

## Key Concepts

### Feedback Modes

- **Anonymous:** Ratings aggregated, text pooled/shuffled, no attribution
- **Named:** Individual responses with attribution, plus optional anonymous note section

### The 6 PM Skills

1. Discovery & User Understanding
2. Prioritization & Roadmap
3. Execution & Delivery
4. Communication
5. Stakeholder Management
6. Technical Fluency

### Rating Scale (Comparative)

- Bottom 20%, Below average, Average, Above average, Top 20%, Can't say

### Invitation Links (Dual-Token System)

Two ways to share feedback links:

| Method | Token Type | Tracking | Use Case |
|--------|------------|----------|----------|
| **System sends email** | Per-invitation token | Full (who responded) | Automated flow |
| **User shares link** | Per-cycle shared token | By responder identity | Manual sharing |

**Per-invitation tokens** (`/respond/[token]`):
- Created when invitations are added
- Unique per peer email
- System sends email with personalized link
- Tracks exactly who responded

**Shared cycle token** (`/respond/c/[cycleToken]`):
- One link for entire cycle
- User copies and shares manually (Slack, email, etc.)
- Responders optionally provide name/email
- If they don't identify → fully anonymous
- If they do → can be attributed (in named mode)

## Important Patterns

### Authentication

Magic link via Supabase. Protected routes use `requireAuth()` from `lib/actions/auth.ts`.

```typescript
// In any server action or page
const user = await requireAuth() // Throws redirect if not authenticated
```

### Server Actions vs Service Role

- **User actions** (cycles, invitations): Use normal Supabase client with RLS
- **Response submission**: Uses service role client to bypass RLS (responses table has no client-side policies)

```typescript
// lib/supabase/server.ts exports both
import { createClient, createServiceClient } from '@/lib/supabase/server'
```

### Validation

Centralized in `lib/validation.ts`:

```typescript
import { responseSchema, CONSTRAINTS } from '@/lib/validation'

// CONSTRAINTS.INVITATIONS_MIN = 3
// CONSTRAINTS.FEEDBACK_TEXT_MIN = 10
```

### Report Generation

Reports are generated on-demand via `lib/actions/report.ts`:

```typescript
import { getReport } from '@/lib/actions/report'

const result = await getReport(cycleId)
// Returns { report: AnonymousReport | NamedReport } or { error: string }
```

**Anonymous mode:** Ratings aggregated, text shuffled, no attribution
**Named mode:** Individual responses with attribution, anonymous notes collected separately

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Supabase auth users |
| `feedback_cycles` | User's feedback cycles (mode, status, shared_token) |
| `self_assessments` | User's self-ratings (1:1 with cycle) |
| `invitations` | Peers invited to respond (token, status) - for system-sent emails |
| `responses` | Peer feedback (ratings, text, responder_email/name for shared links) |
| `custom_questions` | Optional questions added by requester |
| `skill_template_questions` | Skill definitions from template |

## Common Tasks

### Add a new page

1. Create `app/path/page.tsx` (server component)
2. Add `await requireAuth()` if protected
3. Create client components in same folder if needed

### Add a server action

1. Add to `lib/actions/[domain].ts`
2. Mark with `'use server'`
3. Use `requireAuth()` for protected actions
4. Use `createServiceClient()` if bypassing RLS

### Modify database types

1. Update `types/database.ts`
2. Types like `CycleWithDetails`, `CycleInvitation` are exported from `types/database.ts`

## Testing Locally

```bash
npm run dev          # Start dev server
npm run build        # Type check + build
```

To test responder flow:
- **Shared link (user-sent):** Copy link from cycle detail page, visit `/respond/c/[cycleToken]`
- **Personal link (system-sent):** Get invitation token from Supabase, visit `/respond/[token]`

## Post-MVP Features (Not Yet Implemented)

- Payment (Stripe) - $50 to request feedback cycle
- 30-day follow-up email
- Text generalization for anonymity
- Multiple cycles history view
- Account deletion flow
- Analytics dashboard

## Reference Docs

See `project-context/` for full documentation:
- `prd_peer_feedback.md` - Product requirements
- `sprint_breakdown.md` - Sprint details and acceptance criteria
- `system_architecture_v1.1.md` - Database schema, API routes, email system
