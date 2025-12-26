# PeerLens

A lightweight peer feedback tool for Product Managers to collect anonymous feedback and identify blind spots.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Resend account (for emails)

### Local Development

1. **Clone the repository**
```bash
git clone [your-repo-url]
cd peerlens
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
/peerlens
├── /app                 # Next.js app directory
├── /components          # Reusable React components
├── /lib                 # Utilities and helpers
├── /types              # TypeScript type definitions
├── /public             # Static assets
├── /supabase           # Database migrations and config
└── /project-context    # Product requirements and architecture docs
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## 📚 Documentation

- [Product Requirements](./project-context/prd_peer_feedback.md)
- [System Architecture](./project-context/system_architecture_v1.1.md)
- [Sprint Breakdown](./project-context/sprint_breakdown.md)
- [Development Workflow](./WORKFLOW.md)
- [Current Sprint Status](./SPRINT_STATUS.md)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Email**: Resend
- **Deployment**: Vercel

## 🔐 Environment Variables

See `.env.example` for required environment variables:
- Supabase connection details
- Resend API key
- App URLs

## 🤝 Contributing

This is a private project. See [WORKFLOW.md](./WORKFLOW.md) for development process.

## 📝 License

Private and confidential.

---

**Current Sprint**: Sprint 1 - Foundation (See [SPRINT_STATUS.md](./SPRINT_STATUS.md) for progress)