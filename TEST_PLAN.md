# PeerLens Comprehensive Test Plan

This document outlines all test cases for the PeerLens application. Tests are organized by feature area and include both happy paths and edge cases. Each test can be executed manually or automated.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Requester Flow - Cycle Creation](#2-requester-flow---cycle-creation)
3. [Requester Flow - Self-Assessment](#3-requester-flow---self-assessment)
4. [Requester Flow - Invitations](#4-requester-flow---invitations)
5. [Requester Flow - Cycle Management](#5-requester-flow---cycle-management)
6. [Responder Flow - Email Invitation](#6-responder-flow---email-invitation)
7. [Responder Flow - Shared Link](#7-responder-flow---shared-link)
8. [Report Generation](#8-report-generation)
9. [Email System](#9-email-system)
10. [Cron Jobs](#10-cron-jobs)
11. [Conversion & Nurture Flow](#11-conversion--nurture-flow)
12. [Error Handling & Edge Cases](#12-error-handling--edge-cases)
13. [Security](#13-security)
14. [Mobile Responsiveness](#14-mobile-responsiveness)
15. [Performance](#15-performance)

---

## Test Case Format

Each test case includes:
- **ID**: Unique identifier (AREA-XXX)
- **Description**: What is being tested
- **Preconditions**: Required state before test
- **Steps**: Actions to perform
- **Expected Result**: What should happen
- **Edge Cases**: Variations to test

---

## 1. Authentication

### AUTH-001: Magic Link Sign In - Valid Email
**Description**: User can sign in with a valid email address
**Preconditions**: User is not authenticated
**Steps**:
1. Navigate to `/login`
2. Enter valid email address
3. Click "Send magic link"
4. Check email inbox
5. Click magic link in email

**Expected Result**:
- Success message displayed after sending
- Email received within 60 seconds
- Clicking link redirects to `/dashboard`
- User session created (visible in cookies)

---

### AUTH-002: Magic Link Sign In - Invalid Email
**Description**: Invalid email addresses are rejected
**Preconditions**: User is not authenticated
**Steps**:
1. Navigate to `/login`
2. Enter invalid email (e.g., "notanemail", "test@", "@domain.com")
3. Click "Send magic link"

**Expected Result**:
- Error message displayed
- No email sent
- User remains on login page

---

### AUTH-003: Magic Link - Expired Link
**Description**: Expired magic links are rejected
**Preconditions**: Magic link older than 24 hours
**Steps**:
1. Use an expired magic link

**Expected Result**:
- Error message about expired link
- Redirect to login page
- Option to request new link

---

### AUTH-004: Already Authenticated - Login Page Redirect
**Description**: Authenticated users redirected from login
**Preconditions**: User is authenticated
**Steps**:
1. Navigate to `/login`

**Expected Result**:
- Immediate redirect to `/dashboard`

---

### AUTH-005: Sign Out
**Description**: User can sign out successfully
**Preconditions**: User is authenticated
**Steps**:
1. Click "Sign out" button in header
2. Verify session cleared

**Expected Result**:
- Redirect to `/` (home page)
- Session cookies cleared
- Attempting to access `/dashboard` redirects to `/login`

---

### AUTH-006: Protected Route Access - Unauthenticated
**Description**: Unauthenticated users cannot access protected routes
**Preconditions**: User is not authenticated
**Steps**:
1. Directly navigate to `/dashboard`
2. Directly navigate to `/start`
3. Directly navigate to `/report/[any-uuid]`

**Expected Result**:
- Redirect to `/login` for all routes
- `next` parameter preserved in URL

---

### AUTH-007: Session Persistence
**Description**: Session persists across page refreshes
**Preconditions**: User is authenticated
**Steps**:
1. Navigate to `/dashboard`
2. Refresh page
3. Close browser tab
4. Open new tab to `/dashboard`

**Expected Result**:
- User remains authenticated
- No re-login required

---

## 2. Requester Flow - Cycle Creation

### CYCLE-001: Create Anonymous Cycle
**Description**: User can create an anonymous feedback cycle
**Preconditions**: User is authenticated
**Steps**:
1. Navigate to `/start`
2. Select "Anonymous" mode
3. Click "Continue"

**Expected Result**:
- New cycle created with `mode: 'anonymous'`
- Redirect to `/start/[cycleId]/self-assessment`
- Cycle visible in dashboard with "Anonymous" badge

---

### CYCLE-002: Create Named Cycle
**Description**: User can create a named feedback cycle
**Preconditions**: User is authenticated
**Steps**:
1. Navigate to `/start`
2. Select "Named" mode
3. Click "Continue"

**Expected Result**:
- New cycle created with `mode: 'named'`
- Redirect to `/start/[cycleId]/self-assessment`
- Cycle visible in dashboard with "Named" badge

---

### CYCLE-003: Mode Selection Required
**Description**: User must select a mode before continuing
**Preconditions**: User is authenticated
**Steps**:
1. Navigate to `/start`
2. Click "Continue" without selecting mode

**Expected Result**:
- Error message or disabled button
- User remains on mode selection page

---

### CYCLE-004: Multiple Active Cycles
**Description**: User can have multiple cycles in different states
**Preconditions**: User has existing cycles
**Steps**:
1. Create new cycle while existing cycles are active
2. View dashboard

**Expected Result**:
- All cycles displayed in list
- Each cycle shows correct status
- Can manage each independently

---

## 3. Requester Flow - Self-Assessment

### SELF-001: Complete Self-Assessment - All Skills
**Description**: User rates themselves on all 6 skills
**Preconditions**: Cycle created, on self-assessment page
**Steps**:
1. For each of 6 skills:
   - Read skill description
   - Select a rating (not "can't say")
   - Wait for auto-advance (400ms)
2. Review selections
3. Click "Continue"

**Expected Result**:
- All skills rated
- Auto-advance works after each selection
- Progress indicator updates
- Self-assessment saved to database
- Redirect to invite page

---

### SELF-002: Self-Assessment - Back Navigation
**Description**: User can go back to previous skills
**Preconditions**: On self-assessment, multiple skills rated
**Steps**:
1. Rate first 3 skills
2. Click "Back" button
3. Change rating for previous skill
4. Continue forward

**Expected Result**:
- Can navigate backward
- Previous rating displayed when returning
- Can change rating
- Final ratings reflect changes

---

### SELF-003: Self-Assessment - "Can't Say" Not Available
**Description**: Self-assessment excludes "Can't say" option
**Preconditions**: On self-assessment page
**Steps**:
1. View rating options for any skill

**Expected Result**:
- Only 5 options available: Bottom 20%, Below Avg, Average, Above Avg, Top 20%
- "Can't say" option NOT present

---

### SELF-004: Self-Assessment - Incomplete Submission Prevented
**Description**: Cannot continue without rating all skills
**Preconditions**: On self-assessment, some skills not rated
**Steps**:
1. Rate only 3 of 6 skills
2. Attempt to proceed to next section

**Expected Result**:
- Continue button disabled or shows error
- Must rate all skills before proceeding

---

### SELF-005: Add Custom Questions - None
**Description**: User can skip custom questions
**Preconditions**: Self-assessment complete, on custom questions step
**Steps**:
1. Don't add any custom questions
2. Click "Continue"

**Expected Result**:
- No custom questions saved
- Redirect to invite page
- Responders won't see custom questions section

---

### SELF-006: Add Custom Questions - Maximum (5)
**Description**: User can add up to 5 custom questions
**Preconditions**: On custom questions step
**Steps**:
1. Add 5 custom questions
2. Attempt to add 6th question

**Expected Result**:
- 5 questions added successfully
- "Add question" button disabled or hidden after 5
- All 5 questions saved to database

---

### SELF-007: Custom Questions - Empty Question Validation
**Description**: Empty custom questions are not allowed
**Preconditions**: On custom questions step
**Steps**:
1. Click "Add question"
2. Leave question text empty
3. Try to add another or continue

**Expected Result**:
- Empty questions not saved
- Validation message shown
- Must enter text or remove question

---

### SELF-008: Edit Self-Assessment Before Sending
**Description**: User can return to edit self-assessment
**Preconditions**: Self-assessment complete, invitations not sent
**Steps**:
1. Complete self-assessment
2. Add invitations
3. Return to self-assessment page
4. Make changes

**Expected Result**:
- Previous ratings loaded
- Can modify ratings
- Changes saved when continuing

---

## 4. Requester Flow - Invitations

### INV-001: Add Minimum Invitations (3)
**Description**: User can add exactly 3 invitations
**Preconditions**: Self-assessment complete, on invite page
**Steps**:
1. Enter 3 valid email addresses
2. Click "Save invitations"

**Expected Result**:
- 3 invitations created
- Each has unique token
- Status: "pending"
- Redirect to cycle detail page

---

### INV-002: Add Maximum Invitations (10)
**Description**: User can add up to 10 invitations
**Preconditions**: On invite page
**Steps**:
1. Enter 10 valid email addresses
2. Click "Save invitations"

**Expected Result**:
- 10 invitations created
- All saved successfully

---

### INV-003: Fewer Than 3 Invitations Rejected
**Description**: Must have at least 3 invitations
**Preconditions**: On invite page
**Steps**:
1. Enter only 2 email addresses
2. Click "Save invitations"

**Expected Result**:
- Error message: minimum 3 required
- Invitations not saved

---

### INV-004: More Than 10 Invitations Rejected
**Description**: Cannot add more than 10 invitations
**Preconditions**: On invite page
**Steps**:
1. Enter 11 email addresses
2. Click "Save invitations"

**Expected Result**:
- Error message: maximum 10 allowed
- Cannot add 11th email field

---

### INV-005: Duplicate Email Addresses Rejected
**Description**: Same email cannot be invited twice
**Preconditions**: On invite page
**Steps**:
1. Enter same email in 2 different fields
2. Click "Save invitations"

**Expected Result**:
- Error message about duplicate
- Must use unique emails

---

### INV-006: Email Case Insensitivity
**Description**: Emails are case-insensitive
**Preconditions**: On invite page
**Steps**:
1. Enter "Test@Example.com"
2. Enter "test@example.com" in another field
3. Try to save

**Expected Result**:
- Treated as duplicate
- Error message shown
- Emails normalized to lowercase

---

### INV-007: Email Trimming
**Description**: Whitespace trimmed from emails
**Preconditions**: On invite page
**Steps**:
1. Enter "  test@example.com  "
2. Save invitations

**Expected Result**:
- Email saved as "test@example.com"
- No leading/trailing spaces

---

### INV-008: Invalid Email Format Rejected
**Description**: Invalid email formats are rejected
**Preconditions**: On invite page
**Steps**:
1. Enter invalid emails: "notanemail", "missing@domain", "@nodomain.com"
2. Try to save

**Expected Result**:
- Validation errors for each invalid email
- Must fix before saving

---

### INV-009: Add More Invitations Later
**Description**: Can add invitations after initial save
**Preconditions**: Cycle has 3 invitations, status pending
**Steps**:
1. Go to cycle detail page
2. Click "Add more"
3. Add 2 more emails
4. Save

**Expected Result**:
- Now has 5 total invitations
- New invitations have pending status
- Total doesn't exceed 10

---

## 5. Requester Flow - Cycle Management

### MGT-001: Send All Invitations
**Description**: Send invitations to all unsent recipients
**Preconditions**: Cycle with unsent invitations
**Steps**:
1. Go to cycle detail page
2. Click "Send invitations"
3. Confirm

**Expected Result**:
- All invitations marked as sent
- `sent_at` timestamp set
- Cycle status changes to "active"
- Success message with count

---

### MGT-002: Send Reminder - First Reminder
**Description**: Can send first reminder to non-responders
**Preconditions**: Invitation sent, not responded, 0 reminders
**Steps**:
1. Go to cycle detail page
2. Click "Send reminder" on invitation
3. Confirm

**Expected Result**:
- Reminder email sent
- `reminder_count` = 1
- `last_reminder_at` updated
- Can send 1 more reminder

---

### MGT-003: Send Reminder - Second (Final) Reminder
**Description**: Can send second and final reminder
**Preconditions**: Invitation with 1 reminder sent
**Steps**:
1. Click "Send reminder" again

**Expected Result**:
- Second reminder email sent
- `reminder_count` = 2
- "Send reminder" button disabled/hidden
- Cannot send more reminders

---

### MGT-004: Send Reminder - Maximum Exceeded
**Description**: Cannot send more than 2 reminders
**Preconditions**: Invitation with 2 reminders already
**Steps**:
1. Attempt to send another reminder (via API or UI)

**Expected Result**:
- Reminder not sent
- Error: "Maximum reminders already sent"

---

### MGT-005: Cannot Remind Responded Invitation
**Description**: Can't send reminders to those who responded
**Preconditions**: Invitation with status "responded"
**Steps**:
1. View invitation in cycle detail

**Expected Result**:
- No "Send reminder" button
- Status shows "Responded"

---

### MGT-006: Conclude Cycle Manually
**Description**: User can manually conclude an active cycle
**Preconditions**: Active cycle with at least 1 response
**Steps**:
1. Go to cycle detail page
2. Click "Conclude cycle"
3. Confirm

**Expected Result**:
- Cycle status changes to "concluded"
- "Report ready" email sent to user
- "View report" button appears
- Can no longer send reminders

---

### MGT-007: Conclude Cycle - Zero Responses
**Description**: Can conclude cycle with no responses
**Preconditions**: Active cycle with 0 responses
**Steps**:
1. Click "Conclude cycle"
2. Confirm

**Expected Result**:
- Cycle concluded
- Report shows empty state
- No "report ready" email (uses different template)

---

### MGT-008: View Response Progress
**Description**: Real-time response count updates
**Preconditions**: Active cycle displayed
**Steps**:
1. View cycle detail page
2. Have responder submit response (in another browser)
3. Wait for polling interval

**Expected Result**:
- Response count updates without refresh
- Progress bar reflects new count

---

### MGT-009: Copy Shared Link
**Description**: Can copy public shared link
**Preconditions**: Active cycle
**Steps**:
1. Go to cycle detail page
2. Find "Share link" section
3. Click copy button

**Expected Result**:
- Link copied to clipboard
- Link format: `{APP_URL}/respond/c/{shared_token}`
- Toast confirmation shown

---

## 6. Responder Flow - Email Invitation

### RESP-001: Access Valid Invitation Link
**Description**: Responder can access invitation via email link
**Preconditions**: Valid invitation token, invitation not expired
**Steps**:
1. Click link from invitation email
2. Land on `/respond/[token]`

**Expected Result**:
- Respond wizard loads
- Requester name displayed
- Cycle mode visible (affects later steps)
- No authentication required

---

### RESP-002: Invalid Invitation Token
**Description**: Invalid tokens show error
**Preconditions**: None
**Steps**:
1. Navigate to `/respond/invalid-token`

**Expected Result**:
- Error message: "Invitation not found"
- No form displayed
- Link to homepage

---

### RESP-003: Already Responded
**Description**: Cannot respond twice to same invitation
**Preconditions**: Previously submitted response for this invitation
**Steps**:
1. Click invitation link again

**Expected Result**:
- Message: "Already responded"
- Previous response acknowledged
- Cannot submit again

---

### RESP-004: Expired Invitation
**Description**: Cannot respond to expired invitation
**Preconditions**: Invitation older than 30 days (expired)
**Steps**:
1. Click expired invitation link

**Expected Result**:
- Error: "This invitation has expired"
- Cannot proceed with response

---

### RESP-005: Pre-screen - Both Fields Required
**Description**: Must answer closeness and relationship
**Preconditions**: On respond wizard, pre-screen step
**Steps**:
1. Select closeness only
2. Try to continue

**Expected Result**:
- Continue button disabled
- Must select both fields

---

### RESP-006: Skill Ratings - All Required
**Description**: Must rate all 6 skills
**Preconditions**: On skill rating step
**Steps**:
1. Rate 5 of 6 skills
2. Try to continue

**Expected Result**:
- Cannot proceed without all ratings
- Clear indication of missing ratings

---

### RESP-007: Skill Ratings - Can't Say Option
**Description**: "Can't say" is available for responders
**Preconditions**: On skill rating step
**Steps**:
1. View rating options for any skill

**Expected Result**:
- 6 options including "Can't say"
- Can select "Can't say" if lacking visibility

---

### RESP-008: Open-Ended - Minimum Character Count
**Description**: Keep doing and improve require minimum 10 characters
**Preconditions**: On open-ended step
**Steps**:
1. Enter "Good" (4 chars) for "Keep doing"
2. Try to continue

**Expected Result**:
- Validation error: minimum 10 characters
- Character count displayed
- Cannot proceed until met

---

### RESP-009: Open-Ended - "Anything Else" Optional
**Description**: "Anything else" field is optional
**Preconditions**: On open-ended step
**Steps**:
1. Fill required fields (10+ chars each)
2. Leave "Anything else" empty
3. Continue

**Expected Result**:
- Can proceed without "Anything else"
- Field saved as null/empty

---

### RESP-010: Custom Questions - If Present
**Description**: Custom questions step appears when cycle has them
**Preconditions**: Cycle has custom questions
**Steps**:
1. Complete previous steps
2. Observe custom questions step

**Expected Result**:
- Custom questions displayed in order
- Each question has text input
- All fields optional

---

### RESP-011: Custom Questions - If Not Present
**Description**: Custom questions step skipped when none exist
**Preconditions**: Cycle has no custom questions
**Steps**:
1. Complete previous steps
2. Observe step progression

**Expected Result**:
- Jumps from open-ended to confirm (or anonymous note)
- No custom questions step shown
- Step counter reflects fewer total steps

---

### RESP-012: Anonymous Note - Named Mode Only
**Description**: Anonymous note step only in named mode
**Preconditions**: Named cycle
**Steps**:
1. Complete response to named cycle

**Expected Result**:
- Anonymous note step appears
- Can add note that won't be attributed
- Optional field

---

### RESP-013: Anonymous Note - Not In Anonymous Mode
**Description**: Anonymous note not shown in anonymous mode
**Preconditions**: Anonymous cycle
**Steps**:
1. Complete response to anonymous cycle

**Expected Result**:
- No anonymous note step
- Goes directly to confirmation

---

### RESP-014: Submit Response Successfully
**Description**: Complete response submission
**Preconditions**: All required fields completed
**Steps**:
1. Complete all steps
2. Review summary on confirm step
3. Click "Submit feedback"

**Expected Result**:
- Success message displayed
- Response saved to database
- Invitation status updated to "responded"
- Cycle response count incremented
- ConversionCTA displayed

---

### RESP-015: Submit - Pending State
**Description**: UI shows pending state during submission
**Preconditions**: On confirm step
**Steps**:
1. Click "Submit feedback"
2. Observe button state

**Expected Result**:
- Button shows "Submitting..."
- Button disabled during submission
- No double-submit possible

---

## 7. Responder Flow - Shared Link

### SHARE-001: Access Shared Link
**Description**: Anyone can access cycle via shared link
**Preconditions**: Valid shared token
**Steps**:
1. Navigate to `/respond/c/[cycleToken]`

**Expected Result**:
- Respond wizard loads
- Identity step shown first (optional)
- No authentication required

---

### SHARE-002: Invalid Shared Token
**Description**: Invalid tokens show error
**Preconditions**: None
**Steps**:
1. Navigate to `/respond/c/invalid-token`

**Expected Result**:
- Error: "Cycle not found"
- No form displayed

---

### SHARE-003: Shared Link - Concluded Cycle
**Description**: Cannot respond to concluded cycle
**Preconditions**: Cycle status = concluded
**Steps**:
1. Access shared link for concluded cycle

**Expected Result**:
- Error: "This feedback cycle has ended"
- Cannot proceed

---

### SHARE-004: Identity Step - Provide Both Fields
**Description**: Can provide name and email
**Preconditions**: On shared respond wizard, identity step
**Steps**:
1. Enter name
2. Enter email
3. Continue

**Expected Result**:
- Identity saved with response
- Visible to requester in report

---

### SHARE-005: Identity Step - Provide Email Only
**Description**: Name is optional
**Preconditions**: On identity step
**Steps**:
1. Enter email only
2. Continue

**Expected Result**:
- Can proceed
- Email displayed in report (if named mode)

---

### SHARE-006: Identity Step - Skip Entirely
**Description**: Can skip identity step
**Preconditions**: On identity step
**Steps**:
1. Leave both fields empty
2. Click "Skip" or "Continue"

**Expected Result**:
- Can proceed without identity
- Response anonymous (no email/name attached)

---

### SHARE-007: Multiple Responses Same Person
**Description**: Same person can submit multiple responses via shared link
**Preconditions**: Shared link, previous response submitted
**Steps**:
1. Submit response
2. Access shared link again
3. Submit another response

**Expected Result**:
- Second response accepted
- Both responses appear in report
- (Note: This is a known limitation - no duplicate prevention)

---

### SHARE-008: Shared Link Email Validation
**Description**: If email provided, must be valid format
**Preconditions**: On identity step
**Steps**:
1. Enter invalid email format
2. Try to continue

**Expected Result**:
- Validation error shown
- Must fix or remove email

---

## 8. Report Generation

### RPT-001: Access Report - Concluded Cycle
**Description**: Can view report for concluded cycle
**Preconditions**: Cycle status = concluded, user is owner
**Steps**:
1. Go to `/report/[cycleId]`

**Expected Result**:
- Report loads successfully
- Summary stats displayed
- All responses shown

---

### RPT-002: Access Report - Not Concluded
**Description**: Cannot access report before conclusion
**Preconditions**: Cycle status = active
**Steps**:
1. Navigate directly to `/report/[cycleId]`

**Expected Result**:
- Redirect to cycle detail page
- Message: "Cycle not yet concluded"

---

### RPT-003: Access Report - Not Owner
**Description**: Cannot view other users' reports
**Preconditions**: Authenticated as different user
**Steps**:
1. Navigate to report URL for another user's cycle

**Expected Result**:
- 404 or "Not found" error
- Cannot view report

---

### RPT-004: Anonymous Report - Skill Aggregation
**Description**: Skills show aggregated peer ratings
**Preconditions**: Anonymous cycle with multiple responses
**Steps**:
1. View skill comparison section

**Expected Result**:
- Self-rating displayed
- Peer average calculated (numeric 1-5)
- Distribution shown (count per rating)
- "Can't say" count separate
- Gap = peer_avg - self_rating

---

### RPT-005: Anonymous Report - Gap Calculation
**Description**: Gaps calculated correctly
**Preconditions**: Self-rating and peer ratings exist
**Steps**:
1. Check gap indicators

**Expected Result**:
- Positive gap: "Peers rate you higher" (green)
- Negative gap: "You rate yourself higher" (amber)
- Near zero: "Aligned" (gray)
- Difference shown with sign

---

### RPT-006: Anonymous Report - Open-Ended Pooled
**Description**: Open-ended feedback is pooled and shuffled
**Preconditions**: Multiple responses with open-ended feedback
**Steps**:
1. View open-ended sections

**Expected Result**:
- All "keep doing" responses grouped
- All "improve" responses grouped
- Order randomized
- No attribution

---

### RPT-007: Anonymous Report - Responses Shuffled
**Description**: Individual responses in random order
**Preconditions**: Multiple responses
**Steps**:
1. View individual responses section
2. Refresh page multiple times

**Expected Result**:
- Response order varies (shuffled)
- Labeled "Respondent #1", "#2", etc.
- No identifying info shown

---

### RPT-008: Named Report - Attribution
**Description**: Named mode shows who gave which feedback
**Preconditions**: Named cycle with responses
**Steps**:
1. View report for named cycle

**Expected Result**:
- Each response shows responder email/name
- Relationship and closeness visible
- Full feedback attributed

---

### RPT-009: Named Report - Anonymous Notes Separate
**Description**: Anonymous notes unattributed
**Preconditions**: Named cycle with anonymous notes
**Steps**:
1. View anonymous notes section

**Expected Result**:
- Notes displayed separately
- No attribution
- Shuffled order

---

### RPT-010: Report - Zero Responses
**Description**: Empty state for no responses
**Preconditions**: Concluded cycle with 0 responses
**Steps**:
1. View report

**Expected Result**:
- Empty state message
- "No responses received"
- Suggestion to try again
- Link to start new cycle

---

### RPT-011: Report - Custom Question Answers
**Description**: Custom question responses displayed
**Preconditions**: Cycle with custom questions and responses
**Steps**:
1. View custom questions section

**Expected Result**:
- Questions displayed in order
- All answers grouped by question
- Anonymous mode: shuffled, no attribution
- Named mode: attributed

---

### RPT-012: Report - Mixed Response Sources
**Description**: Report includes both email and shared link responses
**Preconditions**: Responses from both sources
**Steps**:
1. View report

**Expected Result**:
- All responses included
- Shared link responses show provided identity (if any)
- No distinction in UI between sources

---

## 9. Email System

### EMAIL-001: Invitation Email - Anonymous Mode
**Description**: Anonymous invitation email sent correctly
**Preconditions**: Anonymous cycle, invitations added
**Steps**:
1. Send invitations

**Expected Result**:
- Email received by invitee
- Contains requester name
- Mentions "anonymous" feedback
- Contains unique respond link
- Professional formatting

---

### EMAIL-002: Invitation Email - Named Mode
**Description**: Named invitation email sent correctly
**Preconditions**: Named cycle
**Steps**:
1. Send invitations

**Expected Result**:
- Email mentions feedback will be attributed
- Different copy than anonymous

---

### EMAIL-003: Reminder Email - First
**Description**: First reminder email correct
**Preconditions**: Invitation sent, not responded
**Steps**:
1. Send reminder

**Expected Result**:
- "Still waiting..." subject/copy
- Original respond link included
- Reminder tone appropriate

---

### EMAIL-004: Reminder Email - Second (Final)
**Description**: Second reminder email is final
**Preconditions**: 1 reminder already sent
**Steps**:
1. Send second reminder

**Expected Result**:
- "Last chance..." messaging
- Urgency conveyed
- Same respond link

---

### EMAIL-005: Report Ready Email
**Description**: Notification when report available
**Preconditions**: Cycle concluded with responses
**Steps**:
1. Conclude cycle

**Expected Result**:
- Email sent to requester
- Contains link to report
- Shows response count

---

### EMAIL-006: No Responses Email
**Description**: Email when auto-concluded with 0 responses
**Preconditions**: Cycle auto-concluded by cron
**Steps**:
1. Wait for auto-conclude cron

**Expected Result**:
- Different email template
- Tips for next attempt
- Encourages trying again

---

### EMAIL-007: Bounce Handling
**Description**: Bounced emails marked correctly
**Preconditions**: Send to invalid email address
**Steps**:
1. Send invitation to bouncing email
2. Wait for webhook

**Expected Result**:
- Invitation status = "bounced"
- Admin notified
- No further emails to that address

---

### EMAIL-008: Complaint Handling
**Description**: Spam complaints handled
**Preconditions**: Recipient marks email as spam
**Steps**:
1. Simulate complaint webhook

**Expected Result**:
- Lead unsubscribed immediately
- Admin notified (high priority)
- No further emails

---

## 10. Cron Jobs

### CRON-001: Auto-Conclude - 5 Days, Zero Responses
**Description**: Cycles auto-conclude after 5 days with no responses
**Preconditions**: Active cycle, 0 responses, created 5+ days ago
**Steps**:
1. Trigger `/api/cron/auto-conclude`

**Expected Result**:
- Cycle status = concluded
- No-responses email sent
- Logged in cron output

---

### CRON-002: Auto-Conclude - Has Responses (Skip)
**Description**: Cycles with responses not auto-concluded
**Preconditions**: Active cycle with 1+ responses, 5+ days old
**Steps**:
1. Trigger auto-conclude cron

**Expected Result**:
- Cycle NOT concluded
- Still active
- Skipped in cron logic

---

### CRON-003: Auto-Conclude - Less Than 5 Days (Skip)
**Description**: Recent cycles not auto-concluded
**Preconditions**: Active cycle, 0 responses, created 3 days ago
**Steps**:
1. Trigger auto-conclude cron

**Expected Result**:
- Cycle NOT concluded
- Still active

---

### CRON-004: Expire Invitations - 30 Days
**Description**: Pending invitations expire after 30 days
**Preconditions**: Pending invitation created 30+ days ago
**Steps**:
1. Trigger `/api/cron/expire-invitations`

**Expected Result**:
- Invitation status = "expired"
- Cannot respond anymore

---

### CRON-005: Expire - Already Responded (Skip)
**Description**: Responded invitations not expired
**Preconditions**: Invitation responded 30+ days ago
**Steps**:
1. Trigger expire cron

**Expected Result**:
- Status remains "responded"
- Not changed to expired

---

### CRON-006: Nurture Email - Day 7
**Description**: First nurture email sent 7 days after signup
**Preconditions**: Nurture lead, 7 days old, 0 emails sent
**Steps**:
1. Trigger `/api/cron/nurture`

**Expected Result**:
- Email 1 sent
- `emails_sent` = 1
- `next_email_at` = now + 14 days

---

### CRON-007: Nurture Email - Day 21
**Description**: Second nurture email sent
**Preconditions**: Lead with 1 email sent, 14+ days since last
**Steps**:
1. Trigger nurture cron

**Expected Result**:
- Email 2 sent
- `emails_sent` = 2
- `next_email_at` = now + 21 days

---

### CRON-008: Nurture Email - Day 42 (Final)
**Description**: Third and final nurture email
**Preconditions**: Lead with 2 emails sent, 21+ days since last
**Steps**:
1. Trigger nurture cron

**Expected Result**:
- Email 3 sent
- `emails_sent` = 3
- `status` = "completed"
- No more emails scheduled

---

### CRON-009: Nurture - Unsubscribed (Skip)
**Description**: Unsubscribed leads not emailed
**Preconditions**: Lead with `status: 'unsubscribed'`
**Steps**:
1. Trigger nurture cron

**Expected Result**:
- No email sent
- Lead skipped

---

### CRON-010: Cron Authentication
**Description**: Cron endpoints require secret
**Preconditions**: None
**Steps**:
1. Call cron endpoint without Authorization header
2. Call with wrong secret
3. Call with correct secret

**Expected Result**:
- Without header: 401 Unauthorized
- Wrong secret: 401 Unauthorized
- Correct secret: 200 OK

---

## 11. Conversion & Nurture Flow

### CONV-001: Conversion CTA - Displayed After Response
**Description**: CTA shown after submitting response
**Preconditions**: Just submitted a response
**Steps**:
1. Complete response submission
2. View success screen

**Expected Result**:
- ConversionCTA component visible
- "Start now" and "Remind me later" buttons
- Compelling copy

---

### CONV-002: Conversion - Start Now
**Description**: "Start now" links to cycle creation
**Preconditions**: On success screen after response
**Steps**:
1. Click "Start now"

**Expected Result**:
- Navigates to `/start`
- (User may need to authenticate)

---

### CONV-003: Conversion - Remind Me Later (With Email)
**Description**: Email capture for nurture with known email
**Preconditions**: Responded via email invitation (email known)
**Steps**:
1. Click "Remind me later"

**Expected Result**:
- Immediately submits (email pre-filled)
- Success message: "We'll remind you in a week"
- Nurture lead created

---

### CONV-004: Conversion - Remind Me Later (No Email)
**Description**: Email capture modal for shared link responders
**Preconditions**: Responded via shared link, no email provided
**Steps**:
1. Click "Remind me later"
2. Modal opens
3. Enter email
4. Click "Remind me"

**Expected Result**:
- Modal displayed
- Email required
- Lead created on submit
- Success message shown

---

### CONV-005: Conversion - Invalid Email in Modal
**Description**: Email validation in capture modal
**Preconditions**: Modal open
**Steps**:
1. Enter invalid email
2. Click submit

**Expected Result**:
- Validation error
- Must enter valid email

---

### CONV-006: Unsubscribe Flow
**Description**: Lead can unsubscribe from nurture
**Preconditions**: Active nurture lead
**Steps**:
1. Navigate to `/unsubscribe/[leadId]`

**Expected Result**:
- Confirmation message
- Lead status = "unsubscribed"
- No more nurture emails

---

### CONV-007: Unsubscribe - Invalid Lead ID
**Description**: Invalid unsubscribe link handled
**Preconditions**: None
**Steps**:
1. Navigate to `/unsubscribe/invalid-id`

**Expected Result**:
- Error message or graceful handling
- No crash

---

## 12. Error Handling & Edge Cases

### ERR-001: Global Error Boundary
**Description**: Uncaught errors show friendly message
**Preconditions**: Trigger an error
**Steps**:
1. Cause an unexpected error

**Expected Result**:
- Error boundary catches
- Friendly error page displayed
- "Try again" button works
- Error logged (console/service)

---

### ERR-002: 404 Page
**Description**: Not found pages show custom 404
**Preconditions**: None
**Steps**:
1. Navigate to `/nonexistent-page`

**Expected Result**:
- Custom 404 page
- Links to home and dashboard
- Not browser default 404

---

### ERR-003: Network Error During Submission
**Description**: Form handles network failures
**Preconditions**: Response form filled
**Steps**:
1. Disconnect network
2. Click submit

**Expected Result**:
- Error message displayed
- Form data not lost
- Can retry when online

---

### ERR-004: Concurrent Submissions
**Description**: Double-click prevention
**Preconditions**: On any submit button
**Steps**:
1. Click submit rapidly multiple times

**Expected Result**:
- Only one submission processed
- Button disabled during pending
- No duplicate records

---

### ERR-005: Unicode/Special Characters in Feedback
**Description**: Special characters handled correctly
**Preconditions**: On feedback form
**Steps**:
1. Enter unicode: emojis, Chinese characters, RTL text
2. Submit

**Expected Result**:
- Saved correctly
- Displayed correctly in report
- No encoding issues

---

### ERR-006: Very Long Text Input
**Description**: Long text handled appropriately
**Preconditions**: On feedback form
**Steps**:
1. Enter 10,000+ character response
2. Submit

**Expected Result**:
- Either accepted and truncated, or
- Character limit enforced with message
- No UI breaking

---

### ERR-007: Database Connection Failure
**Description**: DB errors handled gracefully
**Preconditions**: Simulate DB connection issue
**Steps**:
1. Attempt operation with DB down

**Expected Result**:
- User-friendly error message
- No sensitive info exposed
- Retry possible

---

### ERR-008: Email Service Failure
**Description**: Email failures don't break main flow
**Preconditions**: Resend service unavailable
**Steps**:
1. Try to send invitations

**Expected Result**:
- Invitations created in DB
- Error logged for email failure
- User notified of partial failure
- Admin alerted

---

## 13. Security

### SEC-001: XSS Prevention - Stored
**Description**: User input sanitized in output
**Preconditions**: None
**Steps**:
1. Submit feedback with script tags: `<script>alert('xss')</script>`
2. View in report

**Expected Result**:
- Script NOT executed
- Text displayed as literal characters
- React escapes by default

---

### SEC-002: XSS Prevention - Reflected
**Description**: URL parameters sanitized
**Preconditions**: None
**Steps**:
1. Add script to URL: `/report/123?x=<script>alert('xss')</script>`

**Expected Result**:
- Script NOT executed
- Parameter ignored or sanitized

---

### SEC-003: CSRF Protection
**Description**: Actions protected against CSRF
**Preconditions**: None
**Steps**:
1. Attempt cross-site form submission

**Expected Result**:
- Request rejected
- SameSite cookies prevent CSRF
- Server actions validate origin

---

### SEC-004: SQL Injection Prevention
**Description**: Parameterized queries prevent injection
**Preconditions**: None
**Steps**:
1. Submit input with SQL: `'; DROP TABLE users; --`

**Expected Result**:
- Query parameterized
- Input treated as literal string
- No SQL executed

---

### SEC-005: Authorization - Cycle Ownership
**Description**: Users can only access own cycles
**Preconditions**: Two users with cycles
**Steps**:
1. User A tries to access User B's cycle/report

**Expected Result**:
- 404 Not Found
- No data leakage
- RLS enforces ownership

---

### SEC-006: Rate Limiting
**Description**: Rapid requests are limited
**Preconditions**: None
**Steps**:
1. Send 100 requests in 1 second

**Expected Result**:
- Requests throttled or rejected
- 429 Too Many Requests (if implemented)
- (Note: May need additional implementation)

---

### SEC-007: Token Security - UUID Randomness
**Description**: Invitation tokens are unpredictable
**Preconditions**: Multiple invitations
**Steps**:
1. Examine multiple invitation tokens

**Expected Result**:
- UUID v4 format
- Cryptographically random
- Not sequential or guessable

---

### SEC-008: Session Security
**Description**: Sessions properly secured
**Preconditions**: Authenticated session
**Steps**:
1. Examine session cookies

**Expected Result**:
- HttpOnly flag set
- Secure flag (in production)
- SameSite attribute
- Reasonable expiry

---

## 14. Mobile Responsiveness

### MOB-001: Landing Page - Mobile
**Description**: Homepage renders correctly on mobile
**Preconditions**: Mobile viewport (375px)
**Steps**:
1. Load homepage on mobile

**Expected Result**:
- No horizontal scroll
- Text readable
- Buttons tappable (44px min)
- Images scaled

---

### MOB-002: Login Page - Mobile
**Description**: Login works on mobile
**Preconditions**: Mobile viewport
**Steps**:
1. Load login page
2. Enter email
3. Submit

**Expected Result**:
- Form fields full width
- Keyboard doesn't break layout
- Submit button accessible

---

### MOB-003: Dashboard - Mobile
**Description**: Dashboard usable on mobile
**Preconditions**: Mobile viewport, authenticated
**Steps**:
1. View dashboard with cycles

**Expected Result**:
- Cycles stack vertically
- Status badges visible
- Tap targets sufficient

---

### MOB-004: Self-Assessment Wizard - Mobile
**Description**: Wizard works on mobile
**Preconditions**: Mobile viewport
**Steps**:
1. Complete self-assessment on mobile

**Expected Result**:
- Radio options full width
- Progress visible
- Navigation buttons reachable
- Content not clipped

---

### MOB-005: Response Wizard - Mobile
**Description**: Response form works on mobile
**Preconditions**: Mobile viewport
**Steps**:
1. Complete full response on mobile

**Expected Result**:
- All steps accessible
- Textarea usable
- Submit works
- No horizontal scroll

---

### MOB-006: Report - Mobile
**Description**: Report readable on mobile
**Preconditions**: Mobile viewport, concluded cycle
**Steps**:
1. View report on mobile

**Expected Result**:
- Summary cards stack
- Skill comparisons stack
- Open-ended feedback readable
- No overflow issues

---

### MOB-007: Touch Targets
**Description**: All interactive elements meet size requirements
**Preconditions**: Mobile viewport
**Steps**:
1. Inspect all buttons, links, inputs

**Expected Result**:
- Minimum 44x44px touch targets
- Adequate spacing between targets
- No accidental taps

---

### MOB-008: Orientation Change
**Description**: App handles orientation changes
**Preconditions**: Mobile device
**Steps**:
1. Load page in portrait
2. Rotate to landscape
3. Rotate back

**Expected Result**:
- Layout adapts
- No content lost
- Scroll position maintained

---

## 15. Performance

### PERF-001: Page Load - Homepage
**Description**: Homepage loads quickly
**Preconditions**: None
**Steps**:
1. Measure homepage load time

**Expected Result**:
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Time to Interactive < 3.5s

---

### PERF-002: Page Load - Dashboard
**Description**: Dashboard loads quickly
**Preconditions**: User with 10 cycles
**Steps**:
1. Measure dashboard load time

**Expected Result**:
- Page loads < 2s
- Cycles displayed without delay
- No layout shift

---

### PERF-003: Report Generation - Large
**Description**: Report handles many responses
**Preconditions**: Cycle with 50+ responses
**Steps**:
1. View report

**Expected Result**:
- Loads within 3s
- All responses displayed
- Page remains interactive

---

### PERF-004: Form Submission Time
**Description**: Forms submit quickly
**Preconditions**: Filled form
**Steps**:
1. Measure time from click to success

**Expected Result**:
- Feedback within 200ms (pending state)
- Complete within 2s
- No timeout

---

### PERF-005: Email Sending - Batch
**Description**: Bulk email sending performs well
**Preconditions**: Cycle with 10 invitations
**Steps**:
1. Send all invitations

**Expected Result**:
- All sent within 10s
- UI remains responsive
- Progress indication

---

### PERF-006: Real-time Polling Efficiency
**Description**: Polling doesn't overload server
**Preconditions**: Active cycle displayed
**Steps**:
1. Monitor network requests over 5 minutes

**Expected Result**:
- Polling interval reasonable (10-30s)
- Minimal data transferred
- Pauses when tab inactive

---

---

## Test Environment Setup

### Prerequisites
1. Node.js 18+
2. Local Supabase or connection to dev instance
3. Resend API key (test mode)
4. `.env.local` configured

### Test Data
- Create test users via magic link
- Seed cycles in various states
- Create invitations in all statuses
- Generate responses with varied content

### Automation Recommendations
1. **Unit Tests**: Zod validation, utility functions
2. **Integration Tests**: Server actions with test DB
3. **E2E Tests**: Playwright for critical user flows
4. **API Tests**: Cron job endpoints
5. **Visual Regression**: Screenshot comparison for UI

---

## Test Execution Checklist

### Pre-Release Checklist
- [ ] All AUTH tests pass
- [ ] All CYCLE tests pass
- [ ] All SELF tests pass
- [ ] All INV tests pass
- [ ] All MGT tests pass
- [ ] All RESP tests pass (email + shared)
- [ ] All RPT tests pass (anonymous + named)
- [ ] All EMAIL tests pass
- [ ] All CRON tests pass
- [ ] All CONV tests pass
- [ ] All ERR tests pass
- [ ] All SEC tests pass
- [ ] All MOB tests pass
- [ ] All PERF tests pass

---

*Last updated: Sprint 6 completion*
