# Sprint Status

## Current Sprint: Sprint 2 - Requester Flow

**Started:** December 25, 2024
**Target End:** January 1, 2025
**Status:** In Progress

### Progress: [7/9] tasks (78%)

#### DONE

| # | Task | Status |
|---|------|--------|
| 2.1 | "Start feedback cycle" flow | Done |
| 2.2 | Mode selection screen (Named/Anonymous) | Done |
| 2.3 | Self-assessment form (6 skills) | Done |
| 2.4 | Custom questions (optional, up to 2) | Done |
| 2.5 | Save self-assessment | Done |
| 2.6 | Invite peers form (1-10 emails) | Done |
| 2.7 | Invitation records created | Done |

#### IN PROGRESS

| # | Task | Status |
|---|------|--------|
| 2.8 | Dashboard shows cycle with status | Needs DB migration |
| 2.9 | Cycle detail page | Needs DB migration |

---

## Sprint Goal

Create cycle, complete self-assessment, invite peers

---

## Acceptance Criteria

```
1. Login to dashboard
2. Click "Start feedback cycle"
3. See two options: Named / Anonymous with explanations
4. Select "Anonymous" and proceed
5. See self-assessment form with 6 skills
6. Rate yourself on each (dropdown: Bottom 20% to Top 20%)
7. Optionally add 1-2 custom questions
8. Click "Next"
9. See invite form
10. Enter 3 email addresses
11. Click "Create invitations"
12. Redirected to dashboard
13. See your cycle: "Pending - 0 of 3 responses"
14. Click into cycle to see detail view
15. See list of invitations (emails, status: pending)

Verify in Supabase:
- feedback_cycles table has 1 row, mode='anonymous', status='pending'
- self_assessments table has 1 row with your ratings
- invitations table has 3 rows, status='pending'
```

---

## Technical Notes

- No emails sent yet (Sprint 5)
- Invitations created but `sent_at` is null
- Self-send template not implemented yet

---

## Dependencies

- Sprint 1 complete (Auth, Dashboard)
- Database schema already includes: feedback_cycles, self_assessments, invitations tables

---

## Previous Sprint

See `SPRINT_1_COMPLETE.md` for Sprint 1 history.
