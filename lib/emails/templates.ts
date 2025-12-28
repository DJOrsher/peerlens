/**
 * Email templates for PeerLens
 * Each template returns { subject, html, text }
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://peerlens.app'

// Base HTML wrapper
function wrapHtml(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PeerLens</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      color: #4f46e5;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 24px;
    }
    .button {
      display: inline-block;
      background-color: #4f46e5;
      color: white !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      margin: 16px 0;
    }
    .button:hover {
      background-color: #4338ca;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
    }
    .muted {
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">PeerLens</div>
  ${content}
  <div class="footer">
    <p>This email was sent by PeerLens. If you didn't expect this, you can ignore it.</p>
  </div>
</body>
</html>
`
}

// ===========================================
// INVITE EMAIL
// ===========================================

interface InviteEmailParams {
  requesterName: string
  requesterEmail: string
  respondLink: string
  isAnonymous: boolean
}

export function inviteEmail(params: InviteEmailParams) {
  const { requesterName, requesterEmail, respondLink, isAnonymous } = params

  const displayName = requesterName || requesterEmail.split('@')[0]

  const subject = `${displayName} is asking for your feedback`

  const html = wrapHtml(`
    <p>Hi,</p>

    <p><strong>${displayName}</strong> is looking to grow as a Product Manager and would value your honest feedback.</p>

    <p>This takes about 2-3 minutes. ${isAnonymous
      ? 'Your responses will be completely anonymous - they will never know who said what.'
      : 'Your name will be shown alongside your feedback.'
    }</p>

    <a href="${respondLink}" class="button">Give Feedback</a>

    <p class="muted">Or copy this link: ${respondLink}</p>

    <p>Thanks for helping ${displayName} improve!</p>
  `)

  const text = `
${displayName} is asking for your feedback

Hi,

${displayName} is looking to grow as a Product Manager and would value your honest feedback.

This takes about 2-3 minutes. ${isAnonymous
    ? 'Your responses will be completely anonymous - they will never know who said what.'
    : 'Your name will be shown alongside your feedback.'
  }

Give feedback here: ${respondLink}

Thanks for helping ${displayName} improve!

---
This email was sent by PeerLens.
`

  return { subject, html, text }
}

// ===========================================
// REMINDER EMAIL
// ===========================================

interface ReminderEmailParams {
  requesterName: string
  requesterEmail: string
  respondLink: string
  reminderNumber: number
}

export function reminderEmail(params: ReminderEmailParams) {
  const { requesterName, requesterEmail, respondLink, reminderNumber } = params

  const displayName = requesterName || requesterEmail.split('@')[0]

  const subject = reminderNumber === 1
    ? `Reminder: ${displayName} is still waiting for your feedback`
    : `Last chance to give ${displayName} feedback`

  const html = wrapHtml(`
    <p>Hi,</p>

    <p>${reminderNumber === 1
      ? `Just a friendly reminder - <strong>${displayName}</strong> is still hoping to hear from you.`
      : `This is a final reminder - <strong>${displayName}</strong> would really appreciate your input before they close this feedback round.`
    }</p>

    <p>It only takes 2-3 minutes, and your perspective matters.</p>

    <a href="${respondLink}" class="button">Give Feedback</a>

    <p class="muted">Or copy this link: ${respondLink}</p>
  `)

  const text = `
${subject}

Hi,

${reminderNumber === 1
    ? `Just a friendly reminder - ${displayName} is still hoping to hear from you.`
    : `This is a final reminder - ${displayName} would really appreciate your input before they close this feedback round.`
  }

It only takes 2-3 minutes, and your perspective matters.

Give feedback here: ${respondLink}

---
This email was sent by PeerLens.
`

  return { subject, html, text }
}

// ===========================================
// REPORT READY EMAIL
// ===========================================

interface ReportReadyEmailParams {
  userName: string
  responsesCount: number
  invitationsCount: number
  reportLink: string
}

export function reportReadyEmail(params: ReportReadyEmailParams) {
  const { userName, responsesCount, invitationsCount, reportLink } = params

  const displayName = userName || 'there'

  const subject = 'Your feedback report is ready'

  const html = wrapHtml(`
    <p>Hi ${displayName},</p>

    <p>Great news! Your feedback cycle is complete.</p>

    <p><strong>${responsesCount} of ${invitationsCount}</strong> peers responded with feedback for you.</p>

    <a href="${reportLink}" class="button">View Your Report</a>

    <p>Take your time reviewing the feedback. Remember:</p>
    <ul>
      <li>Look for patterns, not outliers</li>
      <li>The goal is growth, not validation</li>
      <li>Consider which feedback resonates most</li>
    </ul>

    <p>Good luck on your growth journey!</p>
  `)

  const text = `
Your feedback report is ready

Hi ${displayName},

Great news! Your feedback cycle is complete.

${responsesCount} of ${invitationsCount} peers responded with feedback for you.

View your report here: ${reportLink}

Take your time reviewing the feedback. Remember:
- Look for patterns, not outliers
- The goal is growth, not validation
- Consider which feedback resonates most

Good luck on your growth journey!

---
This email was sent by PeerLens.
`

  return { subject, html, text }
}

// ===========================================
// NO RESPONSES EMAIL
// ===========================================

interface NoResponsesEmailParams {
  userName: string
  dashboardLink: string
}

export function noResponsesEmail(params: NoResponsesEmailParams) {
  const { userName, dashboardLink } = params

  const displayName = userName || 'there'

  const subject = 'Your feedback cycle has closed'

  const html = wrapHtml(`
    <p>Hi ${displayName},</p>

    <p>Unfortunately, your feedback cycle has closed without receiving any responses.</p>

    <p>This happens sometimes - people are busy! Here are some tips for next time:</p>
    <ul>
      <li>Send a personal message along with the link</li>
      <li>Follow up verbally (Slack, in-person)</li>
      <li>Choose people you've worked with recently</li>
      <li>Keep the invite list small (5-8 people)</li>
    </ul>

    <a href="${dashboardLink}" class="button">Start a New Cycle</a>

    <p>Don't give up - honest feedback is worth pursuing!</p>
  `)

  const text = `
Your feedback cycle has closed

Hi ${displayName},

Unfortunately, your feedback cycle has closed without receiving any responses.

This happens sometimes - people are busy! Here are some tips for next time:
- Send a personal message along with the link
- Follow up verbally (Slack, in-person)
- Choose people you've worked with recently
- Keep the invite list small (5-8 people)

Start a new cycle: ${dashboardLink}

Don't give up - honest feedback is worth pursuing!

---
This email was sent by PeerLens.
`

  return { subject, html, text }
}

// ===========================================
// NURTURE EMAILS
// ===========================================

interface NurtureEmailParams {
  email: string
  unsubscribeLink: string
}

export function nurtureEmail1(params: NurtureEmailParams) {
  const { unsubscribeLink } = params
  const startLink = `${APP_URL}/start`

  const subject = 'Ready to get feedback on your PM skills?'

  const html = wrapHtml(`
    <p>Hi,</p>

    <p>A week ago, you gave feedback to a colleague using PeerLens. Thanks for being a great peer!</p>

    <p>Now here's a thought: <strong>what if you got the same kind of honest feedback about yourself?</strong></p>

    <p>It takes just 5 minutes to set up your own feedback cycle. You'll:</p>
    <ul>
      <li>Rate yourself on 6 key PM skills</li>
      <li>Invite 5-10 peers to give anonymous feedback</li>
      <li>Get a report comparing your self-perception to how others see you</li>
    </ul>

    <a href="${startLink}" class="button">Get Your Own Feedback</a>

    <p class="muted">The gap between how you see yourself and how others see you is where growth happens.</p>

    <div class="footer">
      <p><a href="${unsubscribeLink}">Unsubscribe from these reminders</a></p>
    </div>
  `)

  const text = `
Ready to get feedback on your PM skills?

Hi,

A week ago, you gave feedback to a colleague using PeerLens. Thanks for being a great peer!

Now here's a thought: what if you got the same kind of honest feedback about yourself?

It takes just 5 minutes to set up your own feedback cycle. You'll:
- Rate yourself on 6 key PM skills
- Invite 5-10 peers to give anonymous feedback
- Get a report comparing your self-perception to how others see you

Get your own feedback: ${startLink}

The gap between how you see yourself and how others see you is where growth happens.

---
Unsubscribe: ${unsubscribeLink}
`

  return { subject, html, text }
}

export function nurtureEmail2(params: NurtureEmailParams) {
  const { unsubscribeLink } = params
  const startLink = `${APP_URL}/start`

  const subject = 'The feedback you gave... now get your own'

  const html = wrapHtml(`
    <p>Hi,</p>

    <p>Three weeks ago, you helped a colleague understand their blind spots. That's a gift.</p>

    <p>Here's an uncomfortable truth: <strong>we all have blind spots we can't see.</strong></p>

    <p>The most growth-oriented PMs I know actively seek out feedback. They know that honest input from peers is more valuable than any self-assessment.</p>

    <p>Ready to discover what you can't see about yourself?</p>

    <a href="${startLink}" class="button">Start Your Feedback Cycle</a>

    <p class="muted">It's anonymous. It's honest. It's how you grow.</p>

    <div class="footer">
      <p><a href="${unsubscribeLink}">Unsubscribe from these reminders</a></p>
    </div>
  `)

  const text = `
The feedback you gave... now get your own

Hi,

Three weeks ago, you helped a colleague understand their blind spots. That's a gift.

Here's an uncomfortable truth: we all have blind spots we can't see.

The most growth-oriented PMs I know actively seek out feedback. They know that honest input from peers is more valuable than any self-assessment.

Ready to discover what you can't see about yourself?

Start your feedback cycle: ${startLink}

It's anonymous. It's honest. It's how you grow.

---
Unsubscribe: ${unsubscribeLink}
`

  return { subject, html, text }
}

export function nurtureEmail3(params: NurtureEmailParams) {
  const { unsubscribeLink } = params
  const startLink = `${APP_URL}/start`

  const subject = 'Last reminder: Your peers are ready to help you grow'

  const html = wrapHtml(`
    <p>Hi,</p>

    <p>This is my last email about getting your own feedback. I promise.</p>

    <p>Here's what I've learned: <strong>the PMs who seek feedback outperform those who don't.</strong> Not because feedback is magic, but because they're constantly calibrating their self-awareness.</p>

    <p>Your colleagues already have opinions about your strengths and growth areas. The question is: do you want to know what they are?</p>

    <a href="${startLink}" class="button">Yes, I Want to Know</a>

    <p>If not, no worries. I'll stop emailing. But the offer stands whenever you're ready.</p>

    <div class="footer">
      <p><a href="${unsubscribeLink}">Unsubscribe from these reminders</a></p>
    </div>
  `)

  const text = `
Last reminder: Your peers are ready to help you grow

Hi,

This is my last email about getting your own feedback. I promise.

Here's what I've learned: the PMs who seek feedback outperform those who don't. Not because feedback is magic, but because they're constantly calibrating their self-awareness.

Your colleagues already have opinions about your strengths and growth areas. The question is: do you want to know what they are?

Yes, I want to know: ${startLink}

If not, no worries. I'll stop emailing. But the offer stands whenever you're ready.

---
Unsubscribe: ${unsubscribeLink}
`

  return { subject, html, text }
}
