# System Architecture (Updated)
# Peer Feedback Product

**Stack:** Next.js + Supabase (with RLS) + Resend  
**Version:** 1.1  
**Last Updated:** December 2024

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Feedback Modes](#2-feedback-modes)
3. [Database Schema](#3-database-schema)
4. [Row Level Security Policies](#4-row-level-security-policies)
5. [API Routes](#5-api-routes)
6. [Authentication Flow](#6-authentication-flow)
7. [Email System](#7-email-system)
8. [Key Flows](#8-key-flows)
9. [Error Handling](#9-error-handling)
10. [Security Considerations](#10-security-considerations)
11. [Infrastructure](#11-infrastructure)
12. [Monitoring & Observability](#12-monitoring--observability)

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  CLIENTS                                     │
│                                                                             │
│     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐             │
│     │   Browser    │     │   Mobile     │     │   Email      │             │
│     │   (Web App)  │     │   (PWA)      │     │   Links      │             │
│     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘             │
│            │                    │                    │                      │
└────────────┼────────────────────┼────────────────────┼──────────────────────┘
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NEXT.JS (Vercel)                               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         App Router                                   │   │
│  │                                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │   Pages     │  │   API       │  │  Server     │  │  Middleware│ │   │
│  │  │  (RSC)      │  │  Routes     │  │  Actions    │  │  (Auth)    │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
             │                                           │
             │                                           │
             ▼                                           ▼
┌─────────────────────────────────┐     ┌─────────────────────────────────────┐
│         SUPABASE                │     │              RESEND                  │
│                                 │     │                                      │
│  ┌───────────────────────────┐ │     │  ┌─────────────────────────────────┐│
│  │      PostgreSQL           │ │     │  │       Transactional Emails      ││
│  │      + RLS Policies       │ │     │  │       - Invites                 ││
│  └───────────────────────────┘ │     │  │       - Reminders               ││
│                                 │     │  │       - Report ready            ││
│  ┌───────────────────────────┐ │     │  │       - Nurture sequence        ││
│  │      Auth (Magic Link)    │ │     │  └─────────────────────────────────┘│
│  │      (24hr expiry)        │ │     │                                      │
│  └───────────────────────────┘ │     │  ┌─────────────────────────────────┐│
│                                 │     │  │       Webhooks                  ││
│  ┌───────────────────────────┐ │     │  │       - Delivered               ││
│  │      Edge Functions       │ │     │  │       - Opened                  ││
│  │      (Scheduled jobs)     │ │     │  │       - Clicked                 ││
│  └───────────────────────────┘ │     │  │       - Bounced                 ││
│                                 │     │  └─────────────────────────────────┘│
└─────────────────────────────────┘     │                                      │
                                        └─────────────────────────────────────┘
```

---

## 2. Feedback Modes

The product supports two distinct modes, chosen by the requester at cycle creation.

### Named Mode

| Aspect | Behavior |
|--------|----------|
| Responder identity | Shown next to their feedback |
| Skill ratings | Attributed to individual |
| Open-ended text | Attributed to individual |
| Relationship type | Shown |
| Optional anonymous section | Responder can add text that WON'T be attributed |
| Use case | High-trust teams, manager feedback, when attribution adds value |

**Report structure (Named):**
```
Response from: sarah@company.com (Team - Engineering)
├── Ratings: Discovery: Above Average, Execution: Top 20%, ...
├── Keep doing: "Your specs are incredibly clear..."
├── Improve: "Sometimes you commit to dates without checking..."
└── Anonymous note: [if provided, shown separately, unattributed]
```

### Anonymous Mode

| Aspect | Behavior |
|--------|----------|
| Responder identity | NEVER shown |
| Skill ratings | Aggregated (averages, distributions) |
| Open-ended text | Pooled, unattributed, shuffled |
| Relationship type | Collected but NEVER shown in report |
| Response count | Shown (e.g., "4 of 6 responded") |
| Use case | Peer feedback, sensitive topics, when honesty requires safety |

**Key anonymity rules:**
- Requester sees response COUNT only, never WHO
- Even with 1 response, anonymity holds (requester doesn't know which person responded)
- Relationship breakdown never shown (would de-anonymize)
- No minimum response threshold — requester can conclude anytime
- Future: Text may be generalized/paraphrased for extra anonymity

**Report structure (Anonymous):**
```
Responses: 4 of 6 peers

Skill Ratings (aggregated):
├── Discovery: Avg 3.8 (range: 3-5), 1 "can't say"
├── Execution: Avg 4.2 (range: 4-5)
└── ...

What to keep doing:
├── "Your specs are incredibly clear..."
├── "Always available when I have questions..."
└── ...

What to improve:
├── "Sometimes commits to dates without checking..."
├── "Could push back more on scope..."
└── ...
```

---

## 2.1 Invitation Link System (Dual-Token)

The product supports two methods for sharing feedback links:

### System-Sent Emails (Per-Invitation Token)

- Each invitation record has a unique `token`
- System sends personalized email to each peer
- URL: `/respond/[token]`
- Full tracking: know exactly who responded
- Used when requester wants system to handle email delivery

### User-Shared Link (Per-Cycle Token)

- Each cycle has a single `shared_token`
- Requester copies link and shares manually (Slack, email, etc.)
- URL: `/respond/c/[cycleToken]`
- Responders optionally provide name/email
- If responder identifies → tracked (in named mode, shown with attribution)
- If responder doesn't identify → anonymous response
- Used when requester prefers manual sharing

| Aspect | Per-Invitation | Shared Cycle |
|--------|---------------|--------------|
| URL | `/respond/[token]` | `/respond/c/[cycleToken]` |
| Uniqueness | Per peer | Per cycle |
| Tracking | Full (who responded) | Optional (responder chooses) |
| Delivery | System sends email | User shares manually |
| Identity | Pre-filled from invitation | Responder enters (optional) |

---

## 3. Database Schema

### Updated Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │ feedback_cycles │       │   invitations   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │──┐    │ id (PK)         │
│ email           │  │    │ user_id (FK)    │──┘    │ cycle_id (FK)   │──┐
│ name            │  │    │ mode            │ NEW   │ email           │  │
│ created_at      │  │    │ status          │       │ token           │  │
│ updated_at      │  └───▶│ created_at      │       │ status          │  │
└─────────────────┘       │ concluded_at    │       │ sent_at         │  │
                          │ invitations_cnt │       │ reminder_count  │  │
                          │ responses_cnt   │       │ responded_at    │  │
                          └─────────────────┘       └─────────────────┘  │
                                   │                         │           │
                                   ▼                         │           │
                          ┌─────────────────┐                │           │
                          │self_assessments │                │           │
                          ├─────────────────┤                │           │
                          │ id (PK)         │                │           │
                          │ cycle_id (FK)   │◀───────────────┘           │
                          │ skill_ratings   │                            │
                          │ custom_questions│                            │
                          └─────────────────┘                            │
                                                                         │
                          ┌─────────────────┐                            │
                          │   responses     │                            │
                          ├─────────────────┤                            │
                          │ id (PK)         │                            │
                          │ invitation_id   │◀───────────────────────────┘
                          │ relationship    │
                          │ closeness       │
                          │ skill_ratings   │
                          │ keep_doing      │
                          │ improve         │
                          │ anything_else   │
                          │ anonymous_note  │ NEW (for Named mode)
                          │ custom_answers  │
                          └─────────────────┘
```

### Table Definitions

```sql
-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- FEEDBACK CYCLES
-- ============================================
CREATE TYPE feedback_mode AS ENUM (
  'named',      -- Attributed feedback
  'anonymous'   -- Pooled, unattributed feedback
);

CREATE TYPE cycle_status AS ENUM (
  'draft',      -- Self-assessment not complete
  'pending',    -- Waiting for responses
  'concluded'   -- Requester concluded the cycle (can view report)
);

CREATE TABLE feedback_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  mode feedback_mode NOT NULL DEFAULT 'anonymous',
  status cycle_status DEFAULT 'draft',

  -- Shared token for user-distributed links (one per cycle)
  shared_token UUID UNIQUE DEFAULT gen_random_uuid(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  concluded_at TIMESTAMPTZ,
  report_viewed_at TIMESTAMPTZ,

  -- Denormalized counts
  invitations_count INT DEFAULT 0,
  responses_count INT DEFAULT 0,

  -- Auto-conclude after 5 days with 0 responses
  auto_conclude_at TIMESTAMPTZ
);

CREATE INDEX idx_cycles_user ON feedback_cycles(user_id);
CREATE INDEX idx_cycles_status ON feedback_cycles(status);
CREATE INDEX idx_cycles_auto_conclude ON feedback_cycles(auto_conclude_at) 
  WHERE status = 'pending';

-- ============================================
-- SELF ASSESSMENTS
-- ============================================
CREATE TABLE self_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID UNIQUE NOT NULL REFERENCES feedback_cycles(id) ON DELETE CASCADE,
  
  skill_ratings JSONB NOT NULL DEFAULT '{}',
  custom_questions TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVITATIONS
-- ============================================
CREATE TYPE invitation_status AS ENUM (
  'pending',
  'completed',
  'expired',
  'bounced'
);

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES feedback_cycles(id) ON DELETE CASCADE,
  
  email TEXT NOT NULL,
  name TEXT,  -- Optional: for Named mode display
  token UUID UNIQUE DEFAULT gen_random_uuid(),
  
  status invitation_status DEFAULT 'pending',
  
  sent_at TIMESTAMPTZ,
  sent_via TEXT,  -- 'product' or 'self'
  reminder_count INT DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  
  UNIQUE(cycle_id, email)
);

CREATE INDEX idx_invitations_cycle ON invitations(cycle_id);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);

-- ============================================
-- RESPONSES
-- ============================================
CREATE TYPE relationship_type AS ENUM (
  'team',
  'cross_functional',
  'manager',
  'peer_pm',
  'other'
);

CREATE TYPE closeness_level AS ENUM (
  'very_close',
  'somewhat',
  'not_much',
  'barely'
);

CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Either invitation_id (system-sent) or cycle_id (shared link) - one must be set
  invitation_id UUID UNIQUE REFERENCES invitations(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES feedback_cycles(id) ON DELETE CASCADE,

  -- For shared-link responses: optional responder identity
  responder_email TEXT,
  responder_name TEXT,

  closeness closeness_level NOT NULL,
  relationship relationship_type NOT NULL,

  skill_ratings JSONB NOT NULL DEFAULT '{}',

  keep_doing TEXT NOT NULL,
  improve TEXT NOT NULL,
  anything_else TEXT,

  -- For Named mode: optional anonymous section
  anonymous_note TEXT,

  custom_answers TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure either invitation_id or cycle_id is set
  CONSTRAINT response_source CHECK (invitation_id IS NOT NULL OR cycle_id IS NOT NULL)
);

-- ============================================
-- NURTURE LEADS
-- ============================================
CREATE TYPE nurture_status AS ENUM (
  'active',
  'converted',
  'unsubscribed',
  'completed'
);

CREATE TABLE nurture_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source_cycle_id UUID REFERENCES feedback_cycles(id) ON DELETE SET NULL,
  
  status nurture_status DEFAULT 'active',
  emails_sent INT DEFAULT 0,
  next_email_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX idx_nurture_status ON nurture_leads(status);
CREATE INDEX idx_nurture_next_email ON nurture_leads(next_email_at) 
  WHERE status = 'active';

-- ============================================
-- EMAIL EVENTS
-- ============================================
CREATE TYPE email_type AS ENUM (
  'invite',
  'reminder',
  'report_ready',
  'no_responses',
  'nurture_1',
  'nurture_2',
  'nurture_3',
  'follow_up_30d'
);

CREATE TYPE email_event_type AS ENUM (
  'sent',
  'delivered',
  'opened',
  'clicked',
  'bounced',
  'complained'
);

CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  email_type email_type NOT NULL,
  recipient_email TEXT NOT NULL,
  event_type email_event_type NOT NULL,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_events_recipient ON email_events(recipient_email);
CREATE INDEX idx_email_events_type ON email_events(email_type, event_type);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update counts when invitation added
CREATE OR REPLACE FUNCTION update_invitation_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feedback_cycles
  SET 
    invitations_count = (SELECT COUNT(*) FROM invitations WHERE cycle_id = NEW.cycle_id),
    updated_at = NOW()
  WHERE id = NEW.cycle_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_invitation_insert
  AFTER INSERT ON invitations
  FOR EACH ROW EXECUTE FUNCTION update_invitation_count();

-- Update counts and invitation status when response added
CREATE OR REPLACE FUNCTION on_response_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_cycle_id UUID;
BEGIN
  -- Get cycle_id from invitation
  SELECT cycle_id INTO v_cycle_id FROM invitations WHERE id = NEW.invitation_id;
  
  -- Update invitation status
  UPDATE invitations
  SET status = 'completed', responded_at = NOW()
  WHERE id = NEW.invitation_id;
  
  -- Update cycle response count
  UPDATE feedback_cycles
  SET 
    responses_count = (
      SELECT COUNT(*) FROM responses r
      JOIN invitations i ON r.invitation_id = i.id
      WHERE i.cycle_id = v_cycle_id
    ),
    updated_at = NOW()
  WHERE id = v_cycle_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_response_insert
  AFTER INSERT ON responses
  FOR EACH ROW EXECUTE FUNCTION on_response_insert();
```

---

## 4. Row Level Security Policies

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurture_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS
-- ============================================
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- FEEDBACK CYCLES
-- ============================================
CREATE POLICY cycles_select_own ON feedback_cycles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY cycles_insert_own ON feedback_cycles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY cycles_update_own ON feedback_cycles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- SELF ASSESSMENTS
-- ============================================
CREATE POLICY self_assessments_all ON self_assessments
  FOR ALL USING (
    cycle_id IN (SELECT id FROM feedback_cycles WHERE user_id = auth.uid())
  );

-- ============================================
-- INVITATIONS
-- ============================================
-- Requester can see invitations for their cycles (status only, for dashboard)
CREATE POLICY invitations_select ON invitations
  FOR SELECT USING (
    cycle_id IN (SELECT id FROM feedback_cycles WHERE user_id = auth.uid())
  );

CREATE POLICY invitations_insert ON invitations
  FOR INSERT WITH CHECK (
    cycle_id IN (SELECT id FROM feedback_cycles WHERE user_id = auth.uid())
  );

CREATE POLICY invitations_update ON invitations
  FOR UPDATE USING (
    cycle_id IN (SELECT id FROM feedback_cycles WHERE user_id = auth.uid())
  );

-- ============================================
-- RESPONSES
-- ============================================
-- NO client-side access to responses
-- All response operations go through service role via API routes
-- This protects anonymity even in Named mode (server controls what's returned)

-- ============================================
-- NURTURE / EMAIL EVENTS
-- ============================================
-- No client access - server only
```

---

## 5. API Routes

```
/api
├── /auth
│   ├── POST /login              # Send magic link (24hr expiry)
│   ├── GET  /callback           # Handle magic link
│   └── POST /logout
│
├── /cycles
│   ├── POST /                   # Create cycle (specify mode)
│   ├── GET  /                   # List user's cycles
│   ├── GET  /:id                # Cycle details + response count
│   ├── POST /:id/conclude       # Conclude cycle (enable report)
│   ├── GET  /:id/report         # Get report (mode-aware)
│   └── POST /:id/remind         # Send reminders
│
├── /self-assessment
│   ├── POST /                   # Create/update
│   └── GET  /:cycleId
│
├── /invitations
│   ├── POST /                   # Create invitations
│   ├── POST /send               # Send via product
│   └── GET  /template           # Self-send template
│
├── /respond
│   ├── GET  /:token             # Get form data (public)
│   └── POST /:token             # Submit response (public)
│
├── /nurture
│   ├── POST /subscribe          # "Remind me later"
│   └── POST /unsubscribe
│
├── /webhooks
│   └── POST /resend             # Email events
│
└── /cron
    ├── POST /send-nurture       # Daily nurture emails
    ├── POST /auto-conclude      # Conclude cycles with 0 responses after 5 days
    └── POST /expire-invitations # Expire 30-day old invitations
```

### Report Generation (Mode-Aware)

```typescript
// app/api/cycles/[id]/report/route.ts

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Verify ownership
  const { data: { user } } = await supabase.auth.getUser();
  const { data: cycle } = await supabase
    .from('feedback_cycles')
    .select('*, self_assessments(*)')
    .eq('id', params.id)
    .eq('user_id', user?.id)
    .single();
  
  if (!cycle) return new Response('Not found', { status: 404 });
  if (cycle.status !== 'concluded') {
    return Response.json({ error: 'Cycle not concluded yet' }, { status: 400 });
  }
  
  // Get responses via service role
  const serviceSupabase = createServiceClient();
  const { data: responses } = await serviceSupabase
    .from('responses')
    .select('*, invitations!inner(cycle_id, email, name)')
    .eq('invitations.cycle_id', params.id);
  
  if (!responses?.length) {
    return Response.json({ 
      responses_count: 0,
      message: 'No responses received'
    });
  }
  
  // Branch based on mode
  if (cycle.mode === 'named') {
    return Response.json(generateNamedReport(cycle, responses));
  } else {
    return Response.json(generateAnonymousReport(cycle, responses));
  }
}

function generateNamedReport(cycle: any, responses: any[]) {
  // Collect anonymous notes separately
  const anonymousNotes = responses
    .map(r => r.anonymous_note)
    .filter(Boolean);
  
  // Shuffle anonymous notes so order doesn't reveal identity
  shuffleArray(anonymousNotes);
  
  return {
    mode: 'named',
    responses_count: responses.length,
    invitations_count: cycle.invitations_count,
    self_ratings: cycle.self_assessments?.skill_ratings,
    
    // Individual responses with attribution
    responses: responses.map(r => ({
      from: {
        email: r.invitations.email,
        name: r.invitations.name,
      },
      relationship: r.relationship,
      closeness: r.closeness,
      skill_ratings: r.skill_ratings,
      keep_doing: r.keep_doing,
      improve: r.improve,
      anything_else: r.anything_else,
      custom_answers: r.custom_answers,
      // anonymous_note intentionally excluded here
    })),
    
    // Anonymous notes shown separately, unattributed
    anonymous_notes: anonymousNotes,
  };
}

function generateAnonymousReport(cycle: any, responses: any[]) {
  const skills = [
    'discovery', 'prioritization', 'execution',
    'communication', 'stakeholder_management', 'technical_fluency'
  ];
  
  // Aggregate ratings
  const peerRatings: Record<string, any> = {};
  const numericMap: Record<string, number> = {
    'bottom_20': 1, 'below_average': 2, 'average': 3,
    'above_average': 4, 'top_20': 5,
  };
  
  for (const skill of skills) {
    const validRatings = responses
      .map(r => r.skill_ratings[skill])
      .filter(r => r && r !== 'cant_say');
    
    const cantSayCount = responses
      .filter(r => r.skill_ratings[skill] === 'cant_say').length;
    
    const numericRatings = validRatings.map(r => numericMap[r]);
    const average = numericRatings.length
      ? numericRatings.reduce((a, b) => a + b, 0) / numericRatings.length
      : null;
    
    // Distribution
    const distribution: Record<string, number> = {};
    for (const rating of validRatings) {
      distribution[rating] = (distribution[rating] || 0) + 1;
    }
    
    // Range
    const min = numericRatings.length ? Math.min(...numericRatings) : null;
    const max = numericRatings.length ? Math.max(...numericRatings) : null;
    
    peerRatings[skill] = {
      average,
      min,
      max,
      distribution,
      cant_say_count: cantSayCount,
      response_count: validRatings.length,
    };
  }
  
  // Calculate gaps (peer avg - self rating)
  const selfRatings = cycle.self_assessments?.skill_ratings || {};
  const gaps: Record<string, number | null> = {};
  
  for (const skill of skills) {
    const selfNumeric = numericMap[selfRatings[skill]] || null;
    const peerAvg = peerRatings[skill].average;
    gaps[skill] = (selfNumeric && peerAvg) ? peerAvg - selfNumeric : null;
  }
  
  // Collect and shuffle open-ended
  const keepDoing = responses.map(r => r.keep_doing).filter(Boolean);
  const improve = responses.map(r => r.improve).filter(Boolean);
  const anythingElse = responses.map(r => r.anything_else).filter(Boolean);
  
  shuffleArray(keepDoing);
  shuffleArray(improve);
  shuffleArray(anythingElse);
  
  // Custom question answers
  const customQuestions = cycle.self_assessments?.custom_questions || [];
  const customAnswers: Record<string, string[]> = {};
  
  for (let i = 0; i < customQuestions.length; i++) {
    const answers = responses.map(r => r.custom_answers?.[i]).filter(Boolean);
    shuffleArray(answers);
    customAnswers[customQuestions[i]] = answers;
  }
  
  return {
    mode: 'anonymous',
    responses_count: responses.length,
    invitations_count: cycle.invitations_count,
    self_ratings: selfRatings,
    peer_ratings: peerRatings,
    gaps,
    open_ended: {
      keep_doing: keepDoing,
      improve: improve,
      anything_else: anythingElse,
    },
    custom_answers: customAnswers,
    // relationship data intentionally excluded
  };
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
```

---

## 6. Authentication Flow

**Magic links expire after 24 hours.**

```typescript
// app/api/auth/login/route.ts
export async function POST(req: Request) {
  const { email } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/api/auth/callback`,
      // Supabase default is 1 hour, we can configure in dashboard for 24hr
    },
  });
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  
  return Response.json({ success: true });
}
```

---

## 7. Email System

### 7.1 Email Types

| Email | Trigger | Recipient |
|-------|---------|-----------|
| Invite | Requester sends invitations | Peer |
| Reminder (max 2) | Requester clicks "remind" | Peer |
| Report ready | Requester concludes cycle | Requester |
| No responses | 5 days, 0 responses | Requester |
| Nurture 1 | Day 7 after "remind me later" | Responder |
| Nurture 2 | Day 21 | Responder |
| Nurture 3 | Day 42 (last) | Responder |
| 30-day follow-up | 30 days after report viewed | Requester |

### 7.2 Domain & Deliverability Setup

**CRITICAL: Complete this before sending any emails.**

#### Step 1: Create Subdomain

Use a subdomain for transactional email:
- App: `peerfeedback.com`
- Email: `mail.peerfeedback.com`

Why? Protects your root domain reputation.

#### Step 2: DNS Records

Add these records to your DNS provider:

**SPF Record:**
```
Type: TXT
Name: mail.peerfeedback.com
Value: v=spf1 include:resend.com ~all
```

**DKIM Record:**
```
Type: TXT
Name: resend._domainkey.mail.peerfeedback.com
Value: [provided by Resend]
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc.mail.peerfeedback.com
Value: v=DMARC1; p=none; rua=mailto:dmarc-reports@peerfeedback.com
```

Start with `p=none` (monitoring). Move to `p=quarantine` after 2 weeks if no issues.

#### Step 3: Verify in Resend

1. Resend Dashboard → Domains → Add Domain
2. Enter `mail.peerfeedback.com`
3. Add DNS records they provide
4. Click Verify
5. Wait for green checkmarks (15 min - 48 hours)

#### Step 4: Warm-Up Schedule

| Week | Daily Volume | Activity |
|------|--------------|----------|
| 1 | 20-50 | Founder + friends testing |
| 2 | 50-100 | Beta users |
| 3 | 100-300 | Early adopters |
| 4+ | Scale as needed | Normal operation |

#### Step 5: Monitoring

Watch these in Resend dashboard:

| Metric | Healthy | Warning | Action |
|--------|---------|---------|--------|
| Delivery rate | >98% | <95% | Check bounce reasons |
| Open rate | >40% | <20% | Check spam folders |
| Bounce rate | <2% | >5% | Clean email list |
| Spam complaints | <0.1% | >0.3% | Review content/frequency |

### 7.3 Email Configuration

```typescript
// lib/resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  type: EmailType;
  metadata?: Record<string, any>;
}

export async function sendEmail(params: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Peer Feedback <feedback@mail.peerfeedback.com>',
      replyTo: 'support@peerfeedback.com',
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      tags: [
        { name: 'type', value: params.type },
      ],
    });
    
    if (error) throw error;
    
    // Log successful send
    await logEmailEvent(params.to, params.type, 'sent', params.metadata);
    
    return data;
  } catch (error) {
    // Log failure and notify admin
    console.error('Email send failed:', { to: params.to, type: params.type, error });
    await notifyAdmin('email_send_failed', { to: params.to, type: params.type, error });
    throw error;
  }
}
```

### 7.4 Webhook Handler

```typescript
// app/api/webhooks/resend/route.ts
import { headers } from 'next/headers';
import { Webhook } from 'svix';

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = headers();
  
  // Verify webhook signature
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');
  
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing headers', { status: 400 });
  }
  
  const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET!);
  let event: any;
  
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }
  
  const { type, data } = event;
  const recipientEmail = data.to?.[0];
  const emailType = data.tags?.find((t: any) => t.name === 'type')?.value;
  
  // Map Resend events to our types
  const eventMap: Record<string, string> = {
    'email.delivered': 'delivered',
    'email.opened': 'opened',
    'email.clicked': 'clicked',
    'email.bounced': 'bounced',
    'email.complained': 'complained',
  };
  
  const eventType = eventMap[type];
  if (!eventType) return new Response('OK');
  
  // Log event
  await logEmailEvent(recipientEmail, emailType, eventType, data);
  
  // Handle bounces
  if (eventType === 'bounced') {
    await handleBounce(recipientEmail, data);
  }
  
  // Handle complaints (spam reports)
  if (eventType === 'complained') {
    await handleComplaint(recipientEmail, data);
  }
  
  return new Response('OK');
}

async function handleBounce(email: string, data: any) {
  const supabase = createServiceClient();
  
  // Mark invitation as bounced
  await supabase
    .from('invitations')
    .update({ status: 'bounced' })
    .eq('email', email)
    .eq('status', 'pending');
  
  // Remove from nurture
  await supabase
    .from('nurture_leads')
    .update({ status: 'unsubscribed' })
    .eq('email', email);
  
  // Notify admin
  await notifyAdmin('email_bounced', { email, reason: data.bounce?.message });
}

async function handleComplaint(email: string, data: any) {
  // This is serious - someone marked us as spam
  await notifyAdmin('spam_complaint', { email, data });
  
  // Remove from all future emails
  const supabase = createServiceClient();
  await supabase
    .from('nurture_leads')
    .update({ status: 'unsubscribed' })
    .eq('email', email);
}
```

---

## 8. Error Handling

### Admin Notification System

All critical errors notify admin for manual intervention.

```typescript
// lib/admin-notify.ts

type AlertType = 
  | 'email_send_failed'
  | 'email_bounced'
  | 'spam_complaint'
  | 'response_write_failed'
  | 'cycle_auto_concluded';

export async function notifyAdmin(type: AlertType, data: any) {
  // For MVP: Send email to admin
  // Later: Slack webhook, PagerDuty, etc.
  
  await sendEmail({
    to: process.env.ADMIN_EMAIL!,
    subject: `[Alert] ${type}`,
    text: JSON.stringify(data, null, 2),
    html: `<pre>${JSON.stringify(data, null, 2)}</pre>`,
    type: 'admin_alert' as any,
  });
  
  // Also log to console for Vercel logs
  console.error(`[ADMIN ALERT] ${type}:`, data);
}
```

### Error Scenarios

| Scenario | Handling |
|----------|----------|
| **Response write fails** | Log full details, notify admin, show error to user, admin manually fixes |
| **Email bounces** | Mark invitation as bounced, remove from nurture, notify admin |
| **Email marked as spam** | Remove from all emails, notify admin immediately |
| **0 responses after 5 days** | Auto-conclude cycle, send "no responses" email to requester |
| **Expired token accessed** | Show friendly message: "This link has expired. Contact [requester] for a new one." |
| **Requester deletes account mid-cycle** | For MVP: Block deletion if active cycle. Show: "Please conclude your feedback cycle first." |

### Cron: Auto-Conclude Empty Cycles

```typescript
// app/api/cron/auto-conclude/route.ts

export async function POST(req: Request) {
  // Verify cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const supabase = createServiceClient();
  
  // Find cycles pending for 5+ days with 0 responses
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data: cycles } = await supabase
    .from('feedback_cycles')
    .select('*, users(email, name)')
    .eq('status', 'pending')
    .eq('responses_count', 0)
    .lt('updated_at', fiveDaysAgo);
  
  if (!cycles?.length) {
    return Response.json({ concluded: 0 });
  }
  
  for (const cycle of cycles) {
    // Conclude the cycle
    await supabase
      .from('feedback_cycles')
      .update({ 
        status: 'concluded',
        concluded_at: new Date().toISOString(),
      })
      .eq('id', cycle.id);
    
    // Send "no responses" email
    await sendEmail({
      to: cycle.users.email,
      subject: 'Your feedback cycle has concluded',
      html: noResponsesEmailHtml(cycle.users.name),
      text: noResponsesEmailText(cycle.users.name),
      type: 'no_responses',
    });
    
    // Notify admin
    await notifyAdmin('cycle_auto_concluded', { 
      cycle_id: cycle.id, 
      user_email: cycle.users.email 
    });
  }
  
  return Response.json({ concluded: cycles.length });
}
```

---

## 9. Security Considerations

### Anonymity Protection (Anonymous Mode)

```typescript
// NEVER return in Anonymous mode:
// - invitation_id or any link to specific responder
// - response timestamps
// - relationship type
// - response order (always shuffle)
// - any metadata that could identify

// ALWAYS:
// - Shuffle open-ended before returning
// - Use service role for response queries
// - Return only aggregated/pooled data
```

### Rate Limiting

```typescript
// Apply to:
// POST /api/auth/login - 5/minute (prevent enumeration)
// POST /api/respond/:token - 3/minute (prevent spam)
// POST /api/invitations/send - 10/minute (prevent email spam)
```

### Input Validation

```typescript
// lib/validation.ts
import { z } from 'zod';

export const createCycleSchema = z.object({
  mode: z.enum(['named', 'anonymous']),
});

export const responseSchema = z.object({
  closeness: z.enum(['very_close', 'somewhat', 'not_much', 'barely']),
  relationship: z.enum(['team', 'cross_functional', 'manager', 'peer_pm', 'other']),
  skill_ratings: z.record(z.enum([
    'bottom_20', 'below_average', 'average', 
    'above_average', 'top_20', 'cant_say'
  ])),
  keep_doing: z.string().min(10).max(2000),
  improve: z.string().min(10).max(2000),
  anything_else: z.string().max(2000).optional(),
  anonymous_note: z.string().max(2000).optional(),
  custom_answers: z.array(z.string().max(1000)).optional(),
});

export const invitationsSchema = z.object({
  cycle_id: z.string().uuid(),
  emails: z.array(z.string().email()).min(1).max(10),
});
```

---

## 10. Infrastructure

### Vercel Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/send-nurture",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/auto-conclude",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/cron/expire-invitations",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=
RESEND_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_URL=https://peerfeedback.com
CRON_SECRET=
ADMIN_EMAIL=admin@peerfeedback.com
```

---

## 11. Monitoring & Observability

### Key Metrics

```sql
-- Daily cycles by mode
SELECT 
  DATE(created_at) as date,
  mode,
  COUNT(*) as count
FROM feedback_cycles
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), mode;

-- Response rates by mode
SELECT 
  mode,
  AVG(responses_count::float / NULLIF(invitations_count, 0)) as avg_response_rate
FROM feedback_cycles
WHERE status = 'concluded'
GROUP BY mode;

-- Nurture funnel
SELECT 
  status,
  COUNT(*) as count
FROM nurture_leads
GROUP BY status;

-- Email deliverability
SELECT 
  email_type,
  event_type,
  COUNT(*) as count
FROM email_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY email_type, event_type;
```

---

## File Structure

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts
│   ├── (app)/
│   │   ├── dashboard/page.tsx
│   │   ├── start/
│   │   │   ├── page.tsx           # Choose mode
│   │   │   ├── assess/page.tsx    # Self-assessment
│   │   │   └── invite/page.tsx    # Invite peers
│   │   └── report/[id]/page.tsx
│   ├── respond/[token]/page.tsx   # Public responder form
│   ├── api/
│   │   ├── auth/
│   │   ├── cycles/
│   │   ├── self-assessment/
│   │   ├── invitations/
│   │   ├── respond/
│   │   ├── nurture/
│   │   ├── webhooks/
│   │   └── cron/
│   └── page.tsx                   # Landing
├── components/
├── lib/
│   ├── supabase/
│   ├── resend.ts
│   ├── emails/
│   ├── validation.ts
│   └── admin-notify.ts
├── types/
└── middleware.ts
```

---

*End of Architecture Document v1.1*
