# Sprint Status

## Current Sprint: Sprint 3 - Responder Flow

**Started:** December 26, 2024
**Target End:** January 2, 2025
**Status:** Not Started

### Progress: [0/12] tasks (0%)

#### TODO

| # | Task | Status |
|---|------|--------|
| 3.1 | Public respond page `/respond/[token]` | Pending |
| 3.2 | Token validation (invalid → "Link not found") | Pending |
| 3.3 | Expired token handling | Pending |
| 3.4 | Pre-screen question ("How closely worked together?") | Pending |
| 3.5 | Relationship selection (Team/Cross-functional/Manager/etc) | Pending |
| 3.6 | Skill ratings form (6 skills + "Can't say") | Pending |
| 3.7 | Open-ended questions (Keep doing, Improve, Anything else) | Pending |
| 3.8 | Custom questions display | Pending |
| 3.9 | Anonymous note (Named mode only) | Pending |
| 3.10 | Submit response + confirmation | Pending |
| 3.11 | Response count updates on dashboard | Pending |
| 3.12 | Prevent double submit | Pending |

---

## Sprint Goal

Responders can access form via token, submit feedback

---

## Acceptance Criteria

```
1. Get an invitation token from Supabase (or cycle detail page)
2. Open /respond/[token] in incognito (not logged in)
3. See: "[Name] is looking for your feedback"
4. Answer pre-screen: "How closely have you worked together?"
5. Select relationship: "Team"
6. See skill rating form
7. Rate each skill (some "Can't say" is fine)
8. Fill in "What should [Name] keep doing?" (min 10 chars)
9. Fill in "What should [Name] improve?" (min 10 chars)
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

---

## Technical Notes

- Response writes use service role (bypasses RLS)
- Trigger updates `responses_count` on cycle
- Form validates min length on text fields
- No auth required for respond page

---

## Database Tables Needed

- `responses` table (new)
- Update `invitations` status on submit
- Trigger to increment `responses_count` on `feedback_cycles`

---

## Previous Sprints

- `SPRINT_1_COMPLETE.md` - Foundation (Auth, Dashboard)
- `SPRINT_2_COMPLETE.md` - Requester Flow
