# Sprint Breakdown
# Peer Feedback MVP

**Sprint Duration:** 1 week each  
**Total Sprints:** 6 (MVP launch in ~6 weeks)

---

## Overview

| Sprint | Focus | Deliverable You Can Test |
|--------|-------|-------------------------|
| 1 | Foundation | Sign up, land on empty dashboard |
| 2 | Requester Flow | Complete self-assessment, see invites created |
| 3 | Responder Flow | Fill out form via link, see response counted |
| 4 | Report | View report (both modes), conclude cycle |
| 5 | Email System | Receive real emails (invites, reminders, report ready) |
| 6 | Conversion & Polish | Nurture sequence, error handling, launch prep |

---

## Sprint 1: Foundation

**Goal:** Basic infrastructure, auth, empty dashboard

### Deliverables

| # | Task | Test |
|---|------|------|
| 1.1 | Supabase project setup | Can see project in Supabase dashboard |
| 1.2 | Database schema deployed | Tables visible in Supabase, RLS enabled |
| 1.3 | Next.js project scaffold | `npm run dev` works, see landing page |
| 1.4 | Magic link auth | Enter email → receive link → click → logged in |
| 1.5 | Protected dashboard route | Visit `/dashboard` logged out → redirect to login |
| 1.6 | Empty dashboard UI | Login → see "No feedback cycles yet" message |
| 1.7 | Logout | Click logout → session cleared → back to landing |

### Acceptance Criteria (What You'll Test)

```
1. Go to localhost:3000
2. See landing page with "Get Started" button
3. Click → go to login page
4. Enter your email
5. Check email → receive magic link
6. Click link → redirected to /dashboard
7. See "You haven't started any feedback cycles yet"
8. Click logout → back to landing
9. Try to visit /dashboard directly → redirected to login
```

### Technical Notes

- Use Supabase Auth (built-in magic link)
- Set magic link expiry to 24 hours in Supabase dashboard
- Middleware protects `/dashboard`, `/start`, `/report`

---

## Sprint 2: Requester Flow (Part 1)

**Goal:** Create cycle, complete self-assessment, invite peers

### Deliverables

| # | Task | Test |
|---|------|------|
| 2.1 | "Start feedback cycle" flow | Click button → choose mode (named/anonymous) |
| 2.2 | Mode selection screen | See explanation of both modes, select one |
| 2.3 | Self-assessment form | Rate yourself on 6 skills |
| 2.4 | Custom questions (optional) | Add up to 2 custom questions |
| 2.5 | Save self-assessment | Submit → data saved → move to invite step |
| 2.6 | Invite peers form | Enter 1-10 email addresses |
| 2.7 | Invitation records created | Submit → see invitations in database |
| 2.8 | Dashboard shows cycle | Return to dashboard → see cycle with status "Pending" |
| 2.9 | Cycle detail page | Click cycle → see response count (0/N) |

### Acceptance Criteria

```
1. Login → dashboard
2. Click "Start feedback cycle"
3. See two options: Named / Anonymous with explanations
4. Select "Anonymous" → proceed
5. See self-assessment form with 6 skills
6. Rate yourself on each (dropdown: Bottom 20% to Top 20%)
7. Optionally add 1-2 custom questions
8. Click "Next"
9. See invite form
10. Enter 3 email addresses
11. Click "Create invitations"
12. Redirected to dashboard
13. See your cycle: "Pending - 0 of 3 responses"
14. Click into cycle → see detail view
15. See list of invitations (emails, status: pending)

Verify in Supabase:
- feedback_cycles table has 1 row, mode='anonymous', status='pending'
- self_assessments table has 1 row with your ratings
- invitations table has 3 rows, status='pending'
```

### Technical Notes

- No emails sent yet (Sprint 5)
- Invitations created but `sent_at` is null
- Self-send template not implemented yet

---

## Sprint 3: Responder Flow

**Goal:** Responders can access form via token, submit feedback

### Deliverables

| # | Task | Test |
|---|------|------|
| 3.1 | Public respond page | `/respond/[token]` loads without auth |
| 3.2 | Token validation | Invalid token → "Link not found" |
| 3.3 | Expired token handling | Expired token → "This link has expired" |
| 3.4 | Pre-screen question | "How closely have you worked with X?" |
| 3.5 | Relationship selection | Team / Cross-functional / Manager / Peer PM / Other |
| 3.6 | Skill ratings form | 6 skills with comparative scale + "Can't say" |
| 3.7 | Open-ended questions | Keep doing, Improve, Anything else |
| 3.8 | Custom questions display | If requester added custom Qs, show them |
| 3.9 | Anonymous note (Named mode) | If Named mode, show optional anonymous section |
| 3.10 | Submit response | Submit → response saved → confirmation |
| 3.11 | Response count updates | Dashboard shows "1 of 3 responses" |
| 3.12 | Prevent double submit | Revisit same token → "Already submitted" |

### Acceptance Criteria

```
1. Get an invitation token from Supabase (or cycle detail page)
2. Open /respond/[token] in incognito (not logged in)
3. See: "Alex is looking for your feedback"
4. Answer pre-screen: "How closely have you worked together?"
5. Select relationship: "Team"
6. See skill rating form
7. Rate each skill (some "Can't say" is fine)
8. Fill in "What should Alex keep doing?" (min 10 chars)
9. Fill in "What should Alex improve?" (min 10 chars)
10. Optionally fill "Anything else"
11. If custom questions exist, answer them
12. Click Submit
13. See confirmation: "Thanks! Your feedback has been submitted."
14. See "If 5 colleagues filled this out about you..." CTA

Back in main browser:
15. Refresh cycle detail page
16. See "1 of 3 responses"

Try submitting again:
17. Open same token link → "You've already submitted feedback"

Test invalid token:
18. Open /respond/invalid-uuid → "Link not found"
```

### Technical Notes

- Response writes use service role (bypasses RLS)
- Trigger updates `responses_count` on cycle
- Form validates min length on text fields

---

## Sprint 4: Report

**Goal:** Requester can conclude cycle and view report

### Deliverables

| # | Task | Test |
|---|------|------|
| 4.1 | "Conclude cycle" button | On cycle detail page when responses > 0 |
| 4.2 | Conclude confirmation | "Are you sure? You can't collect more responses after this." |
| 4.3 | Cycle status → concluded | After confirming, status changes |
| 4.4 | Report page route | `/report/[cycleId]` |
| 4.5 | Report access control | Only cycle owner can view |
| 4.6 | Anonymous report generation | Aggregated ratings, shuffled text, no names |
| 4.7 | Named report generation | Individual responses with attribution |
| 4.8 | Self vs peer comparison | Side-by-side ratings display |
| 4.9 | Gap highlighting | Show where peer avg differs from self |
| 4.10 | Open-ended feedback display | Pooled (anon) or attributed (named) |
| 4.11 | Custom question answers | Displayed appropriately per mode |
| 4.12 | Anonymous notes section (Named) | Shown separately without attribution |
| 4.13 | Empty report handling | "No responses received" message |

### Acceptance Criteria

**Test Anonymous Mode:**
```
1. Have a cycle with 2+ responses (Anonymous mode)
2. Go to cycle detail page
3. Click "Conclude cycle"
4. Confirm → cycle status changes to "Concluded"
5. Click "View Report"
6. See report with:
   - "2 of 3 peers responded"
   - Your self-ratings on left, peer averages on right
   - Gaps highlighted (e.g., "You rated yourself 2, peers rated 4")
   - Distribution shown (e.g., "2 Above Average, 0 Average")
   - "Can't say" counts shown
   - Open-ended feedback listed WITHOUT names
   - Feedback is shuffled (refresh a few times, order may vary)
   - NO relationship breakdown visible
```

**Test Named Mode:**
```
1. Create a new cycle in Named mode
2. Get 2 responses
3. Conclude
4. View report:
   - See individual responses with names/emails
   - See relationship type for each
   - See their specific ratings
   - See their specific text feedback
   - If they added an anonymous note, see it in separate section (unattributed)
```

**Test Edge Cases:**
```
- Conclude with 0 responses → "No responses received"
- Try to access report before concluding → error or redirect
- Try to access someone else's report → 404 or forbidden
```

### Technical Notes

- Report generation is server-side only
- Anonymous mode: shuffle text before returning
- Named mode: exclude `anonymous_note` from individual responses, collect separately

---

## Sprint 5: Email System

**Goal:** All emails working (invites, reminders, notifications)

**Prerequisites:**
- Resend account created
- Domain for sending (e.g., `mail.peerlens.com`)
- DNS access for SPF/DKIM/DMARC records

### Deliverables

| # | Task | Test |
|---|------|------|
| 5.1 | Resend account + domain setup | Domain verified in Resend |
| 5.2 | DNS records (SPF, DKIM, DMARC) | Green checkmarks in Resend |
| 5.3 | Invite email template | Well-formatted email with link |
| 5.4 | "Send invitations" feature | Button on cycle page → emails sent |
| 5.5 | Self-send template | Copy-paste template with unique links |
| 5.6 | Reminder email template | Different subject/body from invite |
| 5.7 | "Send reminder" feature | Button per invitation (max 2) |
| 5.8 | Report ready email | Sent when cycle is concluded |
| 5.9 | No responses email | Sent by cron after 5 days with 0 responses |
| 5.10 | Resend webhook handler | Receive and log events |
| 5.11 | Bounce handling | Mark invitation as bounced |
| 5.12 | Admin notifications | Email to admin on bounce/complaint |

### Implementation Plan

**Phase 1: Setup (5.1-5.2)**
```
Files to create:
- lib/resend.ts              # Resend client + sendEmail helper
- lib/emails/templates.ts    # HTML/text email templates

Environment variables needed:
- RESEND_API_KEY
- RESEND_WEBHOOK_SECRET
- ADMIN_EMAIL
```

**Phase 2: Invite Flow (5.3-5.5)**
```
Files to modify:
- lib/actions/cycles.ts      # Add sendInvitationEmails action
- app/dashboard/cycle/[cycleId]/CycleActions.tsx  # Wire up "Send" button

New files:
- lib/emails/invite.tsx      # Invite email template (React Email or HTML)

Flow:
1. User clicks "Send invitations" on cycle page
2. sendInvitationEmails() fetches unsent invitations
3. For each: send email via Resend, update sent_at
4. Update UI to show "Sent" status
```

**Phase 3: Reminders (5.6-5.7)**
```
Files to modify:
- lib/actions/cycles.ts      # Add sendReminder action
- app/dashboard/cycle/[cycleId]/page.tsx  # Add reminder button per invitation

New files:
- lib/emails/reminder.tsx    # Reminder email template

Constraints:
- Max 2 reminders per invitation (check reminder_count)
- Different subject/body than invite
```

**Phase 4: Report Ready (5.8)**
```
Files to modify:
- lib/actions/cycles.ts      # concludeCycle() triggers email

New files:
- lib/emails/report-ready.tsx

Flow:
1. User concludes cycle
2. After status update, send "Your feedback report is ready" email
3. Include link to /report/[cycleId]
```

**Phase 5: Webhooks & Bounce Handling (5.9-5.12)**
```
New files:
- app/api/webhooks/resend/route.ts  # Webhook handler
- lib/admin-notify.ts               # Admin notification helper

Webhook events to handle:
- email.delivered → log
- email.opened → log
- email.clicked → log
- email.bounced → mark invitation as bounced, notify admin
- email.complained → remove from all emails, notify admin urgently
```

**Phase 6: Cron Jobs (5.9)**
```
New files:
- app/api/cron/no-responses/route.ts

vercel.json:
{
  "crons": [
    { "path": "/api/cron/no-responses", "schedule": "0 10 * * *" }
  ]
}

Logic:
- Find cycles: status='pending', responses_count=0, created_at < 5 days ago
- For each: send "no responses" email, auto-conclude
```

### Acceptance Criteria

**Setup (do once, verify):**
```
1. Resend dashboard → domain verified (green checkmarks)
2. Test email via Resend dashboard → lands in inbox (not spam)
3. mail-tester.com score → 9+/10
```

**Test Invite Flow:**
```
1. Create new cycle, add 2 invitations (use your real emails)
2. On cycle page, click "Send invitations"
3. Check both email inboxes
4. Verify:
   - Email from "Peer Feedback <feedback@mail.yourapp.com>"
   - Subject: "[Your name] asked for your feedback"
   - Body has explanation + link
   - Link works (goes to respond page)
5. In Supabase: invitations have sent_at timestamp
```

**Test Self-Send:**
```
1. Create cycle, add invitations
2. Click "Get template to send yourself"
3. See template with unique links for each person
4. Copy template, paste into Slack/email, send manually
5. Verify links work
```

**Test Reminders:**
```
1. On cycle page, see "Send reminder" button next to pending invitation
2. Click → reminder email sent
3. Button now shows "1 reminder sent"
4. Click again → second reminder sent
5. Button now shows "2 reminders sent (max)"
6. Button disabled
```

**Test Report Ready:**
```
1. Have a cycle with responses
2. Conclude cycle
3. Check your email → "Your feedback report is ready"
4. Link in email goes to report page
```

**Test Bounce Handling:**
```
1. Create invitation to fake email (bounce@resend.dev or similar)
2. Send invitation
3. Wait for bounce webhook (may take minutes)
4. Check: invitation status = 'bounced'
5. Check: admin received notification email
```

### Technical Notes

- Use Resend's test emails for bounce testing
- Webhook signature verification is critical
- Plain text version required for all emails

---

## Sprint 6: Conversion, Polish & Launch Prep

**Goal:** Nurture sequence, error handling, final polish

### Deliverables

| # | Task | Test |
|---|------|------|
| 6.1 | Post-submit conversion CTA | "If 5 colleagues..." with Start now / Remind me later |
| 6.2 | "Start now" flow | Goes to signup/start |
| 6.3 | "Remind me later" → email capture | Modal, save to nurture_leads |
| 6.4 | Nurture email 1 (Day 7) | Template + cron job |
| 6.5 | Nurture email 2 (Day 21) | Template + cron job |
| 6.6 | Nurture email 3 (Day 42) | Template + cron job |
| 6.7 | Unsubscribe flow | Link in email → removes from sequence |
| 6.8 | Auto-conclude cron | 5 days + 0 responses → conclude + email |
| 6.9 | Expire invitations cron | 30 days old → mark expired |
| 6.10 | Error logging | All errors logged with context |
| 6.11 | Admin alerts | Critical errors → email to admin |
| 6.12 | Loading states | All forms show loading during submit |
| 6.13 | Error messages | User-friendly errors, not technical |
| 6.14 | Mobile responsive | All pages work on phone |
| 6.15 | Landing page | Clear value prop, CTA to start |
| 6.16 | Production deploy | Live on real domain |

### Acceptance Criteria

**Test Conversion Flow:**
```
1. Submit feedback as responder
2. See confirmation + "If 5 colleagues filled this out..."
3. Click "Remind me later"
4. Enter email → submit
5. See confirmation: "We'll remind you in a week"
6. Check nurture_leads table → new row, next_email_at = now + 7 days

(Manually trigger cron or wait)
7. Receive nurture email 1 at day 7
8. Receive nurture email 2 at day 21
9. Receive nurture email 3 at day 42
10. No more emails after that
```

**Test Unsubscribe:**
```
1. Click "Stop reminders" link in nurture email
2. See confirmation page
3. Check nurture_leads → status = 'unsubscribed'
4. No more emails
```

**Test Auto-Conclude:**
```
1. Create cycle with 3 invitations
2. Don't respond to any
3. Wait 5 days (or manually trigger cron)
4. Receive "no responses" email
5. Cycle status = 'concluded'
```

**Test Error Handling:**
```
1. Try to submit response with empty required fields → see validation errors
2. Try to access /respond/invalid-token → see "Link not found"
3. Try to view report you don't own → see 404 or forbidden
4. Disconnect internet, try to submit → see error message, not crash
```

**Test Mobile:**
```
1. Open app on phone
2. Complete full requester flow
3. Complete full responder flow
4. View report
5. Everything readable and tappable
```

**Production Deploy:**
```
1. Domain configured
2. Environment variables set
3. Cron jobs scheduled
4. Resend webhooks pointing to production
5. One full cycle works end-to-end on production
```

---

## Post-MVP (Not in These Sprints)

Deferred to later:

- Payment / Stripe integration
- 30-day follow-up email
- Text generalization for anonymity
- Account deletion flow
- Multiple cycles history view
- "Compare to previous cycle" feature
- Team/company accounts
- Non-PM skill frameworks

---

## Sprint-by-Sprint Summary

| Sprint | Duration | End State |
|--------|----------|-----------|
| **Sprint 1** | Week 1 | Can sign up, see empty dashboard |
| **Sprint 2** | Week 2 | Can create cycle, self-assess, add invitations |
| **Sprint 3** | Week 3 | Responders can submit feedback via link |
| **Sprint 4** | Week 4 | Can conclude cycle and view report |
| **Sprint 5** | Week 5 | All emails working |
| **Sprint 6** | Week 6 | Conversion, polish, live on production |

---

## Dependencies & Blockers

| Sprint | Depends On | Potential Blocker |
|--------|------------|-------------------|
| 1 | Supabase account | None |
| 2 | Sprint 1 complete | None |
| 3 | Sprint 2 complete | None |
| 4 | Sprint 3 complete | None |
| 5 | Resend account, domain DNS access | DNS propagation (up to 48hr) |
| 6 | Sprint 5 complete | None |

**Recommendation:** Start domain/DNS setup in Sprint 4 so it's ready for Sprint 5.

---

## Effort Estimates

Assuming 1 developer:

| Sprint | Estimated Effort | Risk |
|--------|-----------------|------|
| 1 | 3-4 days | Low |
| 2 | 4-5 days | Low |
| 3 | 4-5 days | Low |
| 4 | 4-5 days | Medium (report logic) |
| 5 | 4-5 days | Medium (email deliverability) |
| 6 | 5-6 days | Medium (polish always takes longer) |

**Total: ~25-30 dev days**

---

## Testing Checklist (For You)

After each sprint, run through these:

### Sprint 1 Checklist
- [ ] Magic link received
- [ ] Login works
- [ ] Dashboard loads (empty)
- [ ] Logout works
- [ ] Protected routes redirect when logged out

### Sprint 2 Checklist
- [ ] Create cycle (choose mode)
- [ ] Self-assessment saves
- [ ] Custom questions save
- [ ] Invitations created
- [ ] Dashboard shows cycle
- [ ] Cycle detail shows invitations

### Sprint 3 Checklist
- [ ] Respond page loads (no auth)
- [ ] Form submits
- [ ] Response count updates
- [ ] Can't double-submit
- [ ] Invalid token handled

### Sprint 4 Checklist
- [x] Conclude cycle works
- [x] Anonymous report shows aggregated data
- [x] Named report shows individual data
- [x] Gaps displayed correctly
- [x] Text is shuffled (anonymous)
- [x] Can't access others' reports

**Sprint 4 Completion Notes (Dec 2024):**
- Report generation fully implemented with mode-aware logic
- Anonymous mode: aggregated ratings + shuffled open-ended + individual responses (no identity)
- Named mode: individual responses with attribution + anonymous notes section
- Added post-Sprint 4 enhancements:
  - Dual-token system (per-invitation + per-cycle shared token)
  - Polling for response count updates (30-second interval)
  - Individual responses visible in anonymous mode (shuffled, no identity)
  - Auto-advance on skill selection in self-assessment wizard

### Sprint 5 Checklist
- [ ] Invite email received (in inbox, not spam)
- [ ] Links in email work
- [ ] Reminder email works
- [ ] Max 2 reminders enforced
- [ ] Report ready email works
- [ ] Bounces handled

### Sprint 6 Checklist
- [ ] Conversion CTA shows after submit
- [ ] "Remind me later" captures email
- [ ] Nurture emails send (test manually)
- [ ] Unsubscribe works
- [ ] Auto-conclude works
- [ ] Mobile works
- [ ] Production deploy works

---

*End of Sprint Breakdown*
