# SwissDraw Tournament Manager

A modern tournament management system with Microsoft authentication, built with SvelteKit.

## 🎯 Features

- **Microsoft SSO Authentication** - Secure login with school Microsoft accounts
- **Admin Dashboard** - Full tournament management for administrators
- **Student Portal** - Personal stats and leaderboard for students
- **Chess.com Integration** - Required usernames with direct profile links
- **Swiss-System Pairings** - AI-powered match recommendations
- **Real-time Leaderboard** - Live tournament standings

## 🚀 Quick Start

**👉 START HERE:** Read [`START_HERE.md`](START_HERE.md) for the fastest setup guide!

### Setup Process

1. **Azure AD Setup** (~10 minutes) - See [`START_HERE.md`](START_HERE.md)
2. **Local Testing** (~2 minutes) - Run `npm run dev`
3. **Deploy to Vercel** (~5 minutes) - Push and deploy

### Generated Security Key

Your pre-generated `AUTH_SECRET`:
```
Pjw868biuUPXunLUBR9bd+JA8A0u75rr3Vz99/rRhN4=
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[START_HERE.md](START_HERE.md)** | 🎯 Quick setup guide - read this first! |
| **[AZURE_VERCEL_SETUP.md](AZURE_VERCEL_SETUP.md)** | Detailed Azure AD + Vercel configuration |
| **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** | Track your setup progress |
| **[SETUP.md](SETUP.md)** | Complete technical documentation |
| **[QUICK_START.md](QUICK_START.md)** | Quick reference guide |

## 🏗️ Project Structure

```
/                      → Public landing page
├── /admin            → Admin dashboard (jensenm@sbc.qld.edu.au)
│   ├── students      → Manage students & chess.com usernames
│   ├── matches       → Record match results
│   ├── leaderboard   → View rankings
│   ├── history       → Match history
│   ├── opponents     → Find opponents by score
│   └── recommendations → AI match pairings
└── /user             → Student portal
    ├── profile       → Link account & view stats
    └── leaderboard   → View tournament standings
```

## 👥 User Roles

### Admin (jensenm@sbc.qld.edu.au)
- Full access to all features
- Manage students with chess.com usernames
- Record match results
- Generate match recommendations

### Students (other users)
- View personal stats
- View leaderboard
- Link to student profile
- Must provide chess.com username

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

Configured for Vercel deployment with:
- SvelteKit adapter-vercel
- Environment variable configuration
- Serverless function support

See [`AZURE_VERCEL_SETUP.md`](AZURE_VERCEL_SETUP.md) for deployment instructions.

## ⚠️ Important Notes

### Data Persistence
- Current setup uses **in-memory storage**
- Data resets on serverless cold starts
- For production, migrate to Vercel KV or database

### Security
- `MICROSOFT_CLIENT_SECRET` must be kept private
- `AUTH_SECRET` must be kept private
- Environment variables are in Vercel dashboard, not committed

### Chess.com Usernames
- **Required** for all students
- Validates on add/edit
- Links to chess.com profiles in leaderboard

## 🆘 Troubleshooting

### Can't login locally?
- Check `.env` file has all Azure credentials
- Verify redirect URI in Azure: `http://localhost:5173/auth/callback`

### Can't login on Vercel?
- Add environment variables in Vercel dashboard
- Update Azure redirect URI with Vercel URL
- Redeploy after adding environment variables

### Data disappearing?
- Expected with in-memory storage
- Implement Vercel KV for persistence

## 📧 Support

Administrator: jensenm@sbc.qld.edu.au

## 📄 License

See [LICENSE](../LICENSE) file for details.

---

**Built with:** SvelteKit, TypeScript, Auth.js, Microsoft Entra ID

**Deployed on:** Vercel