# PeerLens - Claude Context

## What This Is

Peer feedback tool for Product Managers. Users rate themselves on 6 skills, invite peers to provide anonymous/named feedback, then receive a report comparing self-perception to peer perception.

**Business model:** Free to respond, $50 to request your own cycle.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Actions, RSC)
- **Database:** Supabase (PostgreSQL + RLS + Auth)
- **Email:** Resend (not yet implemented)
- **Hosting:** Vercel
- **Validation:** Zod

## Code Map

```
app/
├── page.tsx                           # Landing page
├── login/page.tsx                     # Magic link auth
├── dashboard/
│   ├── page.tsx                       # User's cycles list
│   └── cycle/[cycleId]/
│       ├── page.tsx                   # Cycle detail (invitations, status)
│       └── CycleActions.tsx           # Send invitations / template modal
├── start/
│   ├── page.tsx                       # Choose mode (anonymous/named)
│   └── [cycleId]/
│       ├── self-assessment/
│       │   ├── page.tsx               # Wizard container
│       │   └── SelfAssessmentWizard.tsx
│       └── invite/
│           ├── page.tsx               # Invite peers
│           └── InviteForm.tsx
└── respond/[token]/
    ├── page.tsx                       # Public feedback form (no auth)
    └── RespondWizard.tsx              # Multi-step responder form

lib/
├── actions/
│   ├── auth.ts                        # requireAuth, signIn, signOut
│   ├── cycles.ts                      # CRUD for cycles, invitations
│   ├── respond.ts                     # Submit response (uses service role)
│   └── templates.ts                   # Skill template queries
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
| 4 | Report Generation | Not started |
| 5 | Email System (Resend) | Not started |
| 6 | Conversion & Polish | Not started |

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

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Supabase auth users |
| `feedback_cycles` | User's feedback cycles (mode, status) |
| `self_assessments` | User's self-ratings (1:1 with cycle) |
| `invitations` | Peers invited to respond (token, status) |
| `responses` | Peer feedback (ratings, text) |
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

To test responder flow without sending emails:
1. Create a cycle and add invitations
2. Get the invitation token from Supabase or cycle detail page
3. Visit `/respond/[token]` in incognito

## What's Not Implemented Yet

- Report generation (`/report/[cycleId]`)
- Email sending (Resend integration)
- Nurture sequence (responder → requester conversion)
- Payment (Stripe)
- Cron jobs (auto-conclude, expire invitations)

## Reference Docs

See `project-context/` for full documentation:
- `prd_peer_feedback.md` - Product requirements
- `sprint_breakdown.md` - Sprint details and acceptance criteria
- `system_architecture_v1.1.md` - Database schema, API routes, email system
