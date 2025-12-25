# Product Requirements Document
# Peer Feedback for Product Managers

**Version:** 1.0  
**Last Updated:** December 2024  
**Author:** Daniel Orsher  
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Product Overview](#4-product-overview)
5. [Success Metrics](#5-success-metrics)
6. [User Journeys](#6-user-journeys)
7. [Feature Requirements](#7-feature-requirements)
8. [Information Architecture](#8-information-architecture)
9. [Content & Copy](#9-content--copy)
10. [Technical Requirements](#10-technical-requirements)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [MVP Scope](#12-mvp-scope)
13. [Future Roadmap](#13-future-roadmap)
14. [Open Questions](#14-open-questions)
15. [Appendix](#15-appendix)

---

## 1. Executive Summary

### What We're Building

A lightweight tool that helps professionals—starting with Product Managers—collect anonymous feedback from peers to identify blind spots and growth areas.

### How It Works

1. **Requester** rates themselves on 6 skills and invites 3-8 peers
2. **Responders** rate the requester and provide open-ended feedback (anonymously)
3. **Requester** receives a report comparing self-perception to peer perception

### Core Value Proposition

> "Find out what your colleagues would say about you—if they felt safe being honest."

### Why Now

- PMs don't get enough honest feedback (managers are busy, peers avoid conflict)
- 360 reviews are annual, slow, and HR-managed
- Self-awareness is the #1 predictor of career growth
- Remote work has reduced organic feedback opportunities

### Business Model

- **Free:** Respond to feedback requests
- **Paid ($50):** Request your own feedback cycle

Viral loop: Every requester invites 5-8 responders. A percentage of responders become requesters.

---

## 2. Problem Statement

### The Feedback Gap

| Source | Problem |
|--------|---------|
| Managers | Busy, give infrequent feedback, may not see day-to-day work |
| Peers | Avoid conflict, won't give honest feedback face-to-face |
| Skip-levels | Too distant, lack context |
| 360 reviews | Annual, HR-managed, formal, often sanitized |
| Self-assessment | Biased—we don't see our blind spots |

### What Professionals Actually Want

From user research and simulations:

- "Am I actually good at this, or am I fooling myself?"
- "What do people say about me when I'm not in the room?"
- "Is there something obvious I'm missing?"
- "Do people take me seriously?"

### Why Current Solutions Fail

| Solution | Failure Mode |
|----------|--------------|
| Asking directly | People hedge, relationship risk |
| Anonymous surveys (HR) | Generic questions, infrequent, low trust |
| Manager feedback | Limited perspective, power dynamics |
| Self-reflection | Can't see own blind spots |
| Peer conversations | Too awkward to be truly honest |

---

## 3. Target Users

### Primary: Product Managers (MVP)

| Segment | Description | Why They Need This |
|---------|-------------|-------------------|
| **Undersellers** | Self-critical, imposter syndrome | Need external validation of strengths |
| **Blind-spot seekers** | Suspect something's off, can't see it | Need honest mirror |
| **Career-stuck** | Passed over for promotion, unclear why | Need diagnosis |
| **New to role** | Career transitioners, new managers | Need confirmation they're on track |

### Secondary: Adjacent Roles (Post-MVP)

- Engineering Managers
- Designers
- Data Scientists
- Other cross-functional roles

### Anti-Personas (Not Target Users)

| Type | Why Not |
|------|---------|
| Someone seeking validation only | Won't value critical feedback |
| Someone with no peer relationships | Won't get responses |
| Senior executives (CPO/VP) | Need different mechanisms (pulse surveys, exec coaches) |

---

## 4. Product Overview

### Core Loop

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   REQUESTER                         RESPONDERS              │
│                                                             │
│   ┌─────────────┐                  ┌─────────────┐         │
│   │ Self-assess │                  │ Rate & give │         │
│   │ on 6 skills │                  │  feedback   │         │
│   └──────┬──────┘                  └──────┬──────┘         │
│          │                                │                 │
│          ▼                                │                 │
│   ┌─────────────┐                         │                 │
│   │Invite 3-8   │─────────────────────────┘                 │
│   │   peers     │                                           │
│   └──────┬──────┘                                           │
│          │                                                  │
│          ▼                                                  │
│   ┌─────────────┐                                           │
│   │  Receive    │                                           │
│   │   report    │                                           │
│   └─────────────┘                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### The 6 Skills (PM Version)

| Skill | What It Measures |
|-------|------------------|
| **Discovery & User Understanding** | Depth of customer/user insight |
| **Prioritization & Roadmap** | Quality of trade-off decisions |
| **Execution & Delivery** | Getting things shipped |
| **Communication** | Clarity, frequency, right audience |
| **Stakeholder Management** | Managing up, across, and down |
| **Technical Fluency** | Ability to work effectively with engineering |

### Rating Scale

Comparative framing (not 1-5):

- Bottom 20% — Noticeably weaker than most
- Below average — Some gaps compared to peers
- Average — About the same as most PMs
- Above average — Better than most PMs I've worked with
- Top 20% — Among the best I've seen
- Can't say — I don't have enough visibility

### Anonymity Model

- Responder names are never shown to requester
- Responses are pooled (no attribution)
- Requester sees how many responded, not who
- Open-ended feedback is shown verbatim but anonymized
- Daniel (or product) may paraphrase feedback to protect identity if needed

---

## 5. Success Metrics

### North Star Metric

**Feedback cycles completed per month**

A "completed cycle" = requester received report with 3+ responses.

### Primary Metrics

| Metric | Target (MVP) | Why It Matters |
|--------|--------------|----------------|
| Response rate | >60% | Below this, reports are thin |
| Responses per cycle | ≥3 | Minimum for useful patterns |
| Feedback quality score | >3.5/5 | Requester rates usefulness |
| Requester NPS | >40 | Would they recommend? |
| Responder → Requester conversion | >10% | Viral growth |

### Secondary Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Time to complete form (responder) | <3 min | Friction indicator |
| "Can't say" rate | 20-40% | Too low = bullshit ratings; too high = wrong respondents |
| Email capture rate ("Remind me later") | >25% | Funnel health |
| Nurture → Conversion rate | >15% | Email sequence effectiveness |
| 30-day action taken | >30% | Real behavior change |

### Guardrail Metrics

| Metric | Threshold | Action If Breached |
|--------|-----------|-------------------|
| Responder unsubscribe rate | <5% | Reduce email frequency |
| Report "not useful" rate | <20% | Improve report quality |
| Requester churn (doesn't complete setup) | <40% | Simplify onboarding |

---

## 6. User Journeys

### Journey 1: Requester (Happy Path)

```
1. DISCOVER
   - Hears about product from colleague, social, or search
   - Lands on homepage
   
2. SIGN UP
   - Enters email, creates account
   - Sees value prop: "Find out what colleagues would say"
   
3. SELF-ASSESS
   - Rates self on 6 skills
   - Adds 1-2 custom questions (optional)
   - Takes ~2 minutes
   
4. INVITE PEERS
   - Adds 3-8 email addresses
   - Chooses: send via product OR send yourself (template provided)
   - Guidance: "Include people from different contexts"
   
5. WAIT
   - Dashboard shows: "2 of 6 responded"
   - Can send reminders (max 2)
   - Receives email when 3+ respond: "Your report is ready"
   
6. RECEIVE REPORT
   - Side-by-side: self vs. peer ratings
   - Gaps flagged
   - Open-ended feedback (anonymized)
   - Suggested focus areas
   
7. REFLECT & ACT
   - Prompted: "What's one thing you'll try differently?"
   - 30-day follow-up email
```

### Journey 2: Responder (Happy Path)

```
1. RECEIVE INVITE
   - Personal message from requester (Slack/email)
   - "I'm trying to get honest feedback... anonymous... 2 min"
   
2. CLICK LINK
   - Sees: form for [Alex]
   
3. PRE-SCREEN
   - "How closely have you worked with [Alex]?"
   - If distant: "You can still continue, but use 'can't say' freely"
   
4. RELATIONSHIP ROUTING
   - "What's your relationship?" (Team / Cross-functional / Manager / Peer)
   - Form customizes to show relevant skills
   
5. COMPLETE FORM
   - 4-6 skill ratings (comparative scale)
   - "What should [Alex] keep doing?"
   - "What should [Alex] improve?"
   - "Anything else?" (optional)
   - Takes 2-3 minutes
   
6. SUBMIT
   - Confirmation: "Thanks — your feedback will be shared anonymously"
   
7. CONVERSION MOMENT
   - "If 5 colleagues filled this out about you, what would they say?"
   - [Start now] [Remind me later] [Close]
   
8A. IF "START NOW"
    - Goes to requester signup flow
    
8B. IF "REMIND ME LATER"
    - Enters email
    - Receives nurture sequence (Day 7, 21, 42)
    
8C. IF "CLOSE"
    - Exit. No further contact unless they respond to another request.
```

### Journey 3: Requester (Thin Feedback Path)

```
1-4. Same as happy path

5. WAIT (PROBLEM)
   - Only 2 of 6 respond after 2 weeks
   - Dashboard shows: "2 responses — consider sending reminders or adding peers"
   
6. OPTIONS
   A) Send reminders (up to 2)
   B) Invite more peers
   C) Request report anyway (with caveats)
   
7. THIN REPORT
   - Report clearly labeled: "Based on 2 responses — interpret with caution"
   - Less confident conclusions
   - Suggests: "Consider another round in 3-6 months with different peers"
```

---

## 7. Feature Requirements

### 7.1 Requester: Self-Assessment

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Rate self on 6 skills | P0 | Comparative scale |
| Add custom questions (up to 2) | P1 | Optional but valuable |
| Save progress | P1 | Can return later |
| Estimated time shown | P2 | "~2 minutes" |

**Custom Question Guidance:**
> "Ask something specific you've been wondering. Examples:
> - Do I give people enough context?
> - Am I too slow to make decisions?
> - Does my feedback land well?"

---

### 7.2 Requester: Invite Peers

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Add peer emails (3-8) | P0 | Minimum 3 required |
| Choose send method: product sends OR self-send with template | P0 | Self-send gets higher response |
| Guidance on who to invite | P1 | "Include different contexts" |
| Warn if inviting <3 | P1 | "We recommend at least 5" |
| Warn if all same team | P2 | "Consider cross-functional peers" |

**Who to Invite Guidance:**
> "For useful feedback, include people who:
> - Work with you regularly (at least monthly)
> - See different aspects of your work
> - Will be honest
>
> Consider: a close collaborator, a cross-functional partner, someone more senior, someone more junior."

---

### 7.3 Requester: Dashboard

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Show response count (X of Y) | P0 | Not WHO, just count |
| Send reminder (max 2 per person) | P0 | "Gentle nudge" template |
| Add more peers | P1 | After initial invite |
| Request report early | P2 | With <3 responses, show caveat |

---

### 7.4 Requester: Report

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Side-by-side ratings (self vs. peers) | P0 | With gap highlighted |
| Peer rating range shown | P1 | "3-5" not just average |
| "Can't say" count shown | P1 | Per skill |
| Open-ended feedback (pooled) | P0 | Verbatim, no attribution |
| Data quality indicator | P1 | "Based on X responses" |
| Contradictions acknowledged | P1 | "Mixed signals on communication" |
| Suggested focus areas | P2 | Based on gaps |
| Custom question responses | P0 | Pooled |
| "One thing I'll try" prompt | P1 | Commitment device |
| Export/save report | P2 | PDF or link |

**Report Data Quality Framing:**

| Responses | Label | Framing |
|-----------|-------|---------|
| 5+ | Strong | "Clear patterns emerged" |
| 3-4 | Moderate | "Some patterns visible; interpret thoughtfully" |
| 2 | Limited | "Very limited data; treat as directional signal only" |
| 1 | Insufficient | "Not enough data for meaningful patterns" |

---

### 7.5 Responder: Form

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Pre-screen: relationship closeness | P1 | Filters wrong respondents |
| Relationship routing | P1 | Customizes which skills shown |
| Skill ratings (comparative scale) | P0 | "Compared to other PMs..." |
| "Can't say" as equal option | P0 | Not hidden, not a skip |
| "What to keep doing?" | P0 | Required, min 1 sentence |
| "What to improve?" | P0 | Required, min 1 sentence |
| "Anything else?" | P0 | Optional |
| Custom questions (from requester) | P0 | If provided |
| Progress indicator | P2 | "3 of 4 sections" |
| Mobile-friendly | P0 | Many will open on phone |

**Comparative Rating Scale:**
```
○ Bottom 20% — Noticeably weaker than most
○ Below average — Some gaps compared to peers  
○ Average — About the same as most PMs
○ Above average — Better than most PMs I've worked with
○ Top 20% — Among the best I've seen
○ Can't say — I don't have enough visibility
```

---

### 7.6 Responder: Post-Submit & Conversion

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Confirmation message | P0 | "Thanks, feedback sent anonymously" |
| Reflection hook | P0 | "If 5 colleagues did this about you..." |
| "Start now" CTA | P0 | → Requester signup |
| "Remind me later" CTA | P0 | → Email capture |
| Nurture sequence (3 emails) | P0 | Day 7, 21, 42 |
| Unsubscribe link | P0 | In every email |
| Track: opened, clicked, converted | P1 | Funnel analytics |

---

### 7.7 Emails (Transactional)

| Email | Trigger | Content |
|-------|---------|---------|
| Invite (if product sends) | Requester clicks "Send via product" | Personal-feeling invite |
| Reminder 1 | Requester clicks "Send reminder" | Gentle nudge |
| Reminder 2 | Requester clicks "Send reminder" (2nd) | Last nudge |
| Report ready | 3+ responses received | "Your report is ready" |
| Nudge to complete | 7 days, still <3 responses | "2 of 5 have responded" |
| 30-day follow-up | 30 days after report | "Did you try anything different?" |

---

### 7.8 Emails (Nurture Sequence)

| Email | Day | Subject | Key Message |
|-------|-----|---------|-------------|
| 1 | 7 | "Still thinking about it?" | Direct reminder + link |
| 2 | 21 | "One thing people don't expect" | Most rate themselves lower than peers do |
| 3 | 42 | "Last check-in" | Final nudge, then stop |

---

## 8. Information Architecture

### Sitemap

```
/
├── Home (landing page)
├── /start
│   ├── Self-assessment
│   ├── Invite peers
│   └── Confirmation
├── /dashboard
│   ├── Response tracker
│   ├── Send reminders
│   └── Add peers
├── /report/[id]
│   ├── Summary
│   ├── Skill breakdown
│   ├── Open-ended feedback
│   └── Next steps
├── /respond/[id]
│   ├── Pre-screen
│   ├── Form
│   └── Post-submit
├── /login
├── /settings
└── /about
```

### Screen Inventory

| Screen | User | Purpose |
|--------|------|---------|
| Landing page | Visitor | Convert to requester |
| Self-assessment | Requester | Rate self on 6 skills |
| Invite peers | Requester | Add emails, choose send method |
| Dashboard | Requester | Track responses, send reminders |
| Report | Requester | View feedback, identify gaps |
| Pre-screen | Responder | Filter wrong respondents |
| Feedback form | Responder | Rate and give feedback |
| Post-submit | Responder | Conversion moment |
| Email capture | Responder | "Remind me later" |

---

## 9. Content & Copy

### Key Messages

| Context | Message |
|---------|---------|
| Value prop | "Find out what your colleagues would say—if they felt safe being honest." |
| Responder hook | "If 5 colleagues filled this out about you, what would they say?" |
| Anonymity assurance | "Responses are pooled. You'll see patterns, not individuals." |
| Fear reduction | "Most people rate themselves lower than their peers do." |
| Effort framing | "2 minutes to complete. One link to send." |

### Tone

- Direct, not corporate
- Warm, not clinical
- Confident, not salesy
- Honest about limitations

### Example Copy

**Landing page headline:**
> What would your colleagues say about you?
>
> Find out—anonymously.

**Self-assessment intro:**
> Rate yourself honestly. This is just for comparison—no one else sees your self-ratings.

**Invite peers intro:**
> Choose people who know your work. A mix of close collaborators and cross-functional partners works best.

**Responder intro:**
> [Alex] asked for your honest feedback. This takes about 2 minutes, and your responses are completely anonymous.

**Report intro:**
> Here's how you see yourself compared to how your peers see you.

---

## 10. Technical Requirements

### Platform

- **Web app** (responsive, mobile-friendly)
- No native app for MVP

### Authentication

- Email + magic link (no passwords for MVP)
- Optional: Google OAuth (post-MVP)

### Data Storage

- User accounts (email, name)
- Self-assessments
- Peer invitations (email, status)
- Responses (ratings, text, relationship metadata)
- Reports (generated, stored)

### Anonymization

- Responses stored with responder ID but never exposed to requester
- Report generation aggregates and removes identifiers
- Open-ended feedback shown verbatim but without attribution
- Future: NLP to flag potentially identifying content

### Email

- Transactional emails (invites, reminders, report ready)
- Nurture sequence (3 emails, Day 7/21/42)
- Unsubscribe management
- Track: opens, clicks, conversions

### Analytics

- Funnel tracking (sign up → self-assess → invite → report)
- Responder funnel (open → start → complete → convert)
- Email performance (open rate, click rate)
- Cohort analysis (by source, by role)

### Security & Privacy

- HTTPS everywhere
- Data encrypted at rest
- GDPR-compliant (delete on request)
- No selling of data
- Clear privacy policy

---

## 11. Risks & Mitigations

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low response rates | High | High | Personal invite guidance, reminders, short form |
| Generic/useless feedback | High | High | Better prompts, pattern language, minimum text length |
| Responders don't trust anonymity | Medium | High | Clear messaging, never break trust |
| Thin reports (few responses) | High | Medium | Data quality indicator, honest framing |
| No behavior change | High | Medium | 30-day follow-up, commitment prompt |
| Requester only invites "safe" people | Medium | Medium | Guidance on diversity of respondents |

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Email deliverability (spam) | Medium | High | Use reputable ESP, warm up domain |
| Identifying info in open-ended | Medium | Medium | Future: NLP flagging; now: manual review option |
| Scale issues | Low | Medium | Start simple, optimize later |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low conversion (responder → requester) | Medium | High | Optimize post-submit flow, nurture sequence |
| Low willingness to pay | Medium | High | Validate pricing early, consider freemium |
| Competition from HR tools | Low | Medium | Position as lightweight/personal, not enterprise |

---

## 12. MVP Scope

### In Scope (MVP)

| Feature | Notes |
|---------|-------|
| Self-assessment (6 skills) | Comparative scale |
| Invite peers (3-8) | Self-send with template + product-send option |
| Responder form | Pre-screen, routing, ratings, open-ended |
| Response tracking | Dashboard with count |
| Reminders | Max 2 per person |
| Report generation | Self vs. peer, gaps, verbatim feedback |
| Post-submit conversion | "Start now" / "Remind me later" |
| Nurture sequence | 3 emails |
| Basic analytics | Funnels, conversion |

### Out of Scope (MVP)

| Feature | Reason | When |
|---------|--------|------|
| Custom skill frameworks | Complexity | V2 |
| Team/company accounts | B2B complexity | V2 |
| Manager-specific flows | Different needs | V2 |
| Non-PM roles | Need role-specific skills | V2 |
| Native mobile app | Web is sufficient | V3+ |
| AI-generated insights | Complexity, accuracy risk | V3+ |
| Integration (Slack, HRIS) | Enterprise feature | V3+ |
| Longitudinal tracking | Need repeat usage first | V2 |

---

## 13. Future Roadmap

### V1.1 (Month 2-3)

- Custom questions (up to 2)
- Improved prompts based on feedback quality data
- A/B test conversion copy
- Role-based responder routing

### V2 (Month 4-6)

- Non-PM skill frameworks (EM, Design, Data)
- Team plans (group discount, shared insights)
- Longitudinal tracking ("Compare to 6 months ago")
- Manager-specific flow

### V3+ (Month 7+)

- AI-assisted insight generation
- Slack integration (invite via Slack, notifications)
- Enterprise tier (SSO, admin dashboard)
- Pulse surveys for leaders
- Coaching marketplace integration

---

## 14. Open Questions

### Product

| Question | Impact | How to Resolve |
|----------|--------|----------------|
| Is $50 the right price? | Revenue | Test pricing in early cohort |
| Minimum responses before report? | Quality | Start with 3, adjust based on feedback |
| How to handle identifying info in text? | Trust | Manual review for MVP, NLP later |
| Should manager be a separate form? | Experience | User research |

### Growth

| Question | Impact | How to Resolve |
|----------|--------|----------------|
| What's the actual responder → requester conversion rate? | Viral loop | Measure in beta |
| Does nurture sequence work? | Funnel | A/B test email timing and copy |
| What's the best acquisition channel? | CAC | Test content marketing, communities, paid |

### Technical

| Question | Impact | How to Resolve |
|----------|--------|----------------|
| Build vs. buy email? | Speed | Use SendGrid or similar for MVP |
| How to ensure anonymity at scale? | Trust | Define clear data architecture |

---

## 15. Appendix

### A. Persona Summaries (From Simulations)

**Undersellers (6 of 13 simulated personas):**
- Rate themselves lower than peers rate them
- Benefit most from external validation
- Highest willingness to pay
- Most likely to evangelize

**Oversellers (3 of 13):**
- Rate themselves higher than peers rate them
- Need more responses to believe feedback
- May dismiss thin data
- When feedback lands, it lands hard

**Career-stuck (2 of 13):**
- Can't figure out what's blocking them
- Feedback may clarify or confirm confusion
- Need diagnosis, not just data

**Leaders (3 of 13):**
- Get the least honest feedback by default
- Need different mechanisms (pulse surveys, skip-levels)
- This product may not serve them well in current form

---

### B. Responder Archetypes (From Simulations)

| Archetype | Feedback Quality | Conversion Likelihood |
|-----------|------------------|----------------------|
| Invested ally | High | Medium |
| Frustrated stakeholder | High (critical) | Low |
| Distant obligor | Low | Very low |
| Intimidated junior | Low (hedged) | Very low |
| Wrong respondent | Very low | Zero |
| Supportive manager | High (but redundant) | Medium |

---

### C. Competitive Landscape

| Competitor | Positioning | Our Difference |
|------------|-------------|----------------|
| 15Five, Lattice, Culture Amp | Enterprise HR tools | We're lightweight, personal, instant |
| SurveyMonkey, Typeform | Generic survey tools | We're purpose-built for peer feedback |
| Coaching services | High-touch, expensive | We're self-serve, affordable |
| Asking peers directly | Free | We enable honesty through anonymity |

---

### D. References

- All simulation files from product validation sessions
- Responder simulation (10 personas)
- Mitigation strategies document
- Conversion flow specifications

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product | | | |
| Engineering | | | |
| Design | | | |

---

*End of PRD*
