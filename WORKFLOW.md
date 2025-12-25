# PeerLens Development Workflow

**Last Updated:** December 25, 2024  
**Version:** 1.0

---

## Table of Contents
1. [Roles & Responsibilities](#roles--responsibilities)
2. [Working Agreement](#working-agreement)
3. [Communication Protocol](#communication-protocol)
4. [Development Process](#development-process)
5. [Progress Tracking](#progress-tracking)
6. [File Management](#file-management)
7. [Local Testing](#local-testing)
8. [External Services Setup](#external-services-setup)
9. [Issue Resolution](#issue-resolution)
10. [Daily Workflow](#daily-workflow)

---

## Roles & Responsibilities

### AI Agent (Me)
**Primary Responsibilities:**
- ✅ Write ALL code (TypeScript, React, SQL, etc.)
- ✅ Create and manage MOST markdown documentation
- ✅ Implement features according to sprint plan
- ✅ Debug and fix code issues
- ✅ Run tests and verify functionality
- ✅ Provide step-by-step guidance for external setups
- ✅ Track progress via TODO lists
- ✅ Maintain code quality and consistency

**What I CANNOT do:**
- ❌ Create external accounts (Supabase, Resend, Vercel)
- ❌ Access external dashboards or UIs
- ❌ Verify DNS propagation
- ❌ Make payments or handle billing
- ❌ Test actual email delivery
- ❌ Access browser DevTools directly

### Human (You)
**Primary Responsibilities:**
- ✅ Guide overall direction and priorities
- ✅ Create external service accounts
- ✅ Configure services via their dashboards
- ✅ Verify UI/UX in browser
- ✅ Test email delivery and receipt
- ✅ Handle DNS configuration
- ✅ Make architecture decisions when unclear
- ✅ Provide feedback on implementation

---

## Working Agreement

### Decision Making
1. **Architecture decisions**: You make final call, I provide recommendations
2. **Code implementation**: I implement, you review if needed
3. **UI/UX changes**: You request, I implement
4. **External services**: You create accounts, I provide exact configuration steps

### Code Ownership
- I own all code files (.ts, .tsx, .js, .jsx, .css, .sql)
- I own technical documentation (.md files in project)
- You own business decisions and external service accounts

---

## Communication Protocol

### From You to Me
When requesting work, please specify:
1. **What** needs to be done (specific feature or fix)
2. **Why** it's needed (context helps me make better decisions)
3. **Any constraints** (deadlines, specific requirements)
4. **Blockers** you're facing that need my help

### From Me to You
I will:
1. **Ask clarifying questions** before implementing unclear requirements
2. **Provide status updates** every few tool calls when working on complex tasks
3. **Alert you** when I need you to perform external actions
4. **Explain** what commands do before running them
5. **Document** any assumptions I make

### External Action Requests
When I need you to do something external, I'll format it like this:

> 🔧 **EXTERNAL ACTION REQUIRED**
> 
> **Service:** [Supabase/Resend/Vercel/DNS]
> 
> **Steps:**
> 1. [Exact step with specific values]
> 2. [Next step]
> 
> **Verify:** [What to check to confirm success]
> 
> **Report back:** [What information I need from you]

---

## Development Process

### Sprint Workflow
1. **Sprint Start**
   - Review sprint goals from `sprint_breakdown.md`
   - Create TODO list for sprint tasks
   - Set up any required infrastructure

2. **Daily Development**
   - Work through TODO items
   - Test each feature as completed
   - Update progress regularly

3. **Sprint End**
   - Run acceptance criteria tests
   - Document any deviations
   - Prepare for next sprint

### Feature Implementation Flow
```
1. Read requirement → 2. Ask clarifications (if needed) → 3. Implement code
→ 4. Test locally → 5. Request your verification → 6. Fix any issues → 7. Mark complete
```

---

## Progress Tracking

### Sprint Progress Files
We maintain these files for tracking:

1. **`SPRINT_STATUS.md`** - Current sprint progress
   - TODO items with checkboxes
   - Completed items with timestamps
   - Blocked items with reasons
   - Sprint metrics (% complete, velocity)

2. **`CHANGELOG.md`** - All changes to requirements/implementation
   - Date, type (requirement/bug/feature), description
   - Links to relevant commits
   - Impact on timeline

3. **`DEV_LOG.md`** - Daily development notes
   - What was worked on
   - Decisions made
   - Issues encountered

### Progress Update Protocol
- I update `SPRINT_STATUS.md` after each task
- I log changes in `CHANGELOG.md` when requirements shift
- At session end, I summarize in `DEV_LOG.md`
- You can check progress anytime by reading these files

### Sprint Status Format
```markdown
## Sprint X: [Name]
**Started:** [Date]
**Target End:** [Date]
**Status:** 🟡 In Progress | ✅ Complete | 🔴 Blocked

### Progress: [X/Y] tasks (XX%)

#### ✅ Completed
- [x] Task name (completed: timestamp)

#### 🚧 In Progress
- [ ] Task name (started: timestamp)

#### 📋 TODO
- [ ] Task name

#### 🔴 Blocked
- [ ] Task name (blocked: reason)
```

---

## File Management

### Directory Structure
```
/peerlens
├── /app                 # Next.js app directory (AI managed)
├── /components          # React components (AI managed)
├── /lib                 # Utilities and helpers (AI managed)
├── /types              # TypeScript types (AI managed)
├── /public             # Static assets (AI managed)
├── /supabase           # Database migrations (AI managed)
├── /project-context    # Business docs (Human provided, AI reads)
├── WORKFLOW.md         # This file (AI managed, Human approved)
├── SPRINT_STATUS.md    # Current sprint progress (AI managed)
├── CHANGELOG.md        # Requirements/implementation changes (AI managed)
├── DEV_LOG.md          # Development log (AI managed)
├── ISSUES.md           # Known issues tracker (AI managed)
├── .env.local          # Environment variables (Human managed)
└── .env.example        # Example env vars (AI managed)
```

### File Creation Rules
- I create all code files without asking
- I create/update technical .md files without asking
- I ask before modifying files in `/project-context`
- You handle `.env.local` and secrets

---

## Local Testing

### Local Development Setup
1. **Prerequisites** (I'll check and guide installation):
   - Node.js 18+ 
   - npm or pnpm
   - Git

2. **Initial Setup** (I'll create all files):
   ```bash
   # Initialize Next.js project
   npm create next-app@latest . --typescript --tailwind --app
   
   # Install dependencies
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
   npm install resend react-hook-form zod
   npm install -D @types/node
   ```

3. **Environment Setup**:
   - I create `.env.example` with required vars
   - You create `.env.local` with actual values
   - Never commit `.env.local`

4. **Testing Flow**:
   ```bash
   # Start dev server
   npm run dev
   # Visit http://localhost:3000
   
   # Run type checking
   npm run type-check
   
   # Run linting
   npm run lint
   ```

### GitHub Repository Setup
1. **I will create**:
   - `.gitignore` (includes .env.local, node_modules, etc.)
   - `README.md` with setup instructions
   - Initial commit structure

2. **You will**:
   - Create repo on GitHub
   - Add remote: `git remote add origin [your-repo-url]`
   - Push when ready: `git push -u origin main`

3. **Branch Strategy**:
   - `main` - stable releases
   - `develop` - active development
   - `sprint-X` - sprint-specific work

---

## External Services Setup

### When Setting Up Services
1. **I provide**: Exact configuration values, SQL schemas, settings
2. **You execute**: In the service dashboard/UI
3. **You report back**: Success/failure, any error messages, generated values (URLs, keys)
4. **I verify**: By testing the integration

### Service Checklist
- [ ] Supabase: Project creation, auth config, database schema
- [ ] Resend: Account, domain verification, API keys
- [ ] Vercel: Deployment, environment variables, custom domain
- [ ] DNS: Records for email and app

---

## Issue Resolution

### When Issues Arise
1. **I encounter an error** → I debug and fix autonomously if possible
2. **External service issue** → I provide debugging steps for you
3. **Unclear requirement** → I ask for clarification
4. **Architecture decision needed** → I present options, you choose

### Issue Tracking
All issues logged in `ISSUES.md` with:
- Description
- Steps to reproduce
- Attempted solutions
- Resolution (when fixed)

---

## Daily Workflow

### Typical Session Flow
1. **Start**: You tell me what we're working on
2. **Check**: I read this WORKFLOW.md and current TODO list
3. **Work**: I implement features, you handle external tasks
4. **Test**: I run code tests, you verify in browser
5. **Document**: I update logs and documentation
6. **End**: I summarize what was completed

### Status Checkpoints
- After completing each major feature
- Before requiring external action
- When encountering blockers
- At session end

---

## Updates to This Document

This workflow will evolve. When we discover new patterns or issues:
1. You or I propose the change
2. We discuss if needed
3. I update this document
4. We follow the new process

---

## Quick Reference Commands

### For You to Run (When I Ask)
```bash
# Check current directory
pwd

# Install dependencies
npm install

# Run development server
npm run dev

# Check Supabase connection
npx supabase status

# View recent git changes
git status
git diff
```

### What I'll Handle
- All `npm` package installations (I'll tell you when to run `npm install`)
- All code modifications
- All git commits (when you request)
- All file creation/editing

---

## Agreement Confirmation

✅ **By following this workflow, we agree to:**
- Communicate clearly about needs and blockers
- Respect the division of responsibilities
- Update this document as we learn
- Focus on shipping the MVP efficiently

---

*Next Step: When you're ready to begin development, let me know which sprint to start with or if you want to modify this workflow first.*