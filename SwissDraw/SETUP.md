# SwissDraw Setup Guide

## Overview
SwissDraw is now configured with Microsoft authentication and split into admin and user areas.

## Features
- **Microsoft Authentication**: Login using school Microsoft accounts
- **Admin Area**: Full tournament management (jensenm@sbc.qld.edu.au is default admin)
- **User Area**: Students can view their stats and leaderboard
- **Chess.com Integration**: Required chess.com usernames for all students

---

## Setup Instructions

### 1. Azure AD Configuration

You need to register this application in Azure Active Directory:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations** → **New registration**
3. Fill in the details:
   - **Name**: SwissDraw Tournament Manager
   - **Supported account types**: Accounts in this organizational directory only (Single tenant)
   - **Redirect URI**: 
     - Type: Web
     - URI: `http://localhost:5173/auth/callback` (for development)
     - For production, add: `https://yourdomain.com/auth/callback`

4. After creation, note down:
   - **Application (client) ID**
   - **Directory (tenant) ID**

5. Create a **Client Secret**:
   - Go to **Certificates & secrets** → **New client secret**
   - Description: "SwissDraw Secret"
   - Expires: 24 months (or your preference)
   - Copy the **Value** (not the Secret ID)

6. Configure API permissions:
   - Go to **API permissions**
   - Default should have `User.Read` - this is sufficient
   - If not, add: Microsoft Graph → Delegated permissions → `User.Read`, `openid`, `profile`, `email`

### 2. Environment Configuration

Update the `.env` file in the `SwissDraw` directory with your Azure credentials:

```env
# Microsoft Azure AD Configuration
MICROSOFT_CLIENT_ID=your_application_client_id_from_azure
MICROSOFT_CLIENT_SECRET=your_client_secret_value_from_azure
MICROSOFT_TENANT_ID=your_directory_tenant_id_from_azure

# Auth.js Configuration
# Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
AUTH_SECRET=your_generated_random_secret_here

# Application URL
PUBLIC_URL=http://localhost:5173

# Default Admin Email
ADMIN_EMAIL=jensenm@sbc.qld.edu.au
```

To generate a secure `AUTH_SECRET`, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Install Dependencies

```bash
cd SwissDraw
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

---

## User Roles

### Admin (jensenm@sbc.qld.edu.au)
- Full access to all features
- Manage students (add/edit/delete) with chess.com usernames
- Record match results
- Generate match recommendations
- View complete statistics
- Access opponent finder

### Regular Users (Students)
- View personal tournament stats
- View leaderboard
- Link to student profile
- Must provide chess.com username

---

## Application Structure

```
SwissDraw/
├── src/
│   ├── routes/
│   │   ├── +page.svelte              # Public landing page with Microsoft login
│   │   ├── admin/                    # Admin-only routes
│   │   │   ├── +layout.svelte        # Admin navigation & guards
│   │   │   ├── +page.svelte          # Admin dashboard
│   │   │   ├── students/             # Student management
│   │   │   ├── matches/              # Match recording
│   │   │   ├── leaderboard/          # Full leaderboard
│   │   │   ├── history/              # Match history
│   │   │   ├── opponents/            # Opponent finder
│   │   │   └── recommendations/      # AI match pairings
│   │   ├── user/                     # User routes
│   │   │   ├── +layout.svelte        # User navigation & guards
│   │   │   ├── +page.svelte          # User dashboard
│   │   │   ├── profile/              # Profile & stats
│   │   │   └── leaderboard/          # Read-only leaderboard
│   │   └── api/
│   │       ├── students/+server.ts   # Student CRUD (requires auth)
│   │       ├── matches/+server.ts    # Match CRUD (requires auth)
│   │       └── users/+server.ts      # User management
│   ├── lib/
│   │   ├── users.ts                  # User management utilities
│   │   ├── students.ts               # Student utilities (updated with chess.com)
│   │   └── matches.ts                # Match utilities
│   ├── auth.ts                       # Auth.js configuration
│   ├── hooks.server.ts               # Server-side authentication hooks
│   └── app.d.ts                      # TypeScript types
└── data/
    ├── users.json                    # User data (auto-created)
    ├── students.json                 # Student data (in-memory)
    └── matches.json                  # Match data (in-memory)
```

---

## First Time Setup

1. Start the development server
2. Navigate to http://localhost:5173
3. Click "Sign in with Microsoft"
4. Login with `jensenm@sbc.qld.edu.au` (or your configured admin email)
5. You'll be redirected to the admin dashboard
6. Add students with their chess.com usernames
7. Other users who login will be directed to the user area

---

## Chess.com Username Requirement

- **Required**: Every student MUST have a chess.com username
- **Admin Task**: When adding students, the chess.com username field is mandatory
- **User Task**: When users link their profile, they must provide their chess.com username
- **Link to Profile**: Leaderboards display clickable links to chess.com profiles

---

## Security Features

✅ Microsoft SSO authentication  
✅ Role-based access control (Admin vs User)  
✅ Protected API endpoints  
✅ Automatic user creation on first login  
✅ Session management  
✅ Default admin assignment (jensenm@sbc.qld.edu.au)  

---

## Production Deployment

### For Vercel:

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard:
   - `MICROSOFT_CLIENT_ID`
   - `MICROSOFT_CLIENT_SECRET`
   - `MICROSOFT_TENANT_ID`
   - `AUTH_SECRET`
   - `PUBLIC_URL` (your production URL)
   - `ADMIN_EMAIL`

4. Update Azure AD redirect URIs to include your production URL:
   - `https://your-vercel-domain.vercel.app/auth/callback`

5. **Important**: In production, consider migrating from in-memory storage to:
   - Vercel KV (Redis)
   - PostgreSQL (Vercel Postgres)
   - Or another persistent database

---

## Known Limitations

⚠️ **In-Memory Storage**: Students and matches data is stored in memory and will reset on serverless cold starts. For production, implement persistent storage.

⚠️ **Users Data**: Stored in `data/users.json` file - works for development but consider database for production.

---

## Troubleshooting

### "Unauthorized" errors
- Ensure you're logged in
- Check if your email matches the admin email in `.env`
- Clear browser cookies and try logging in again

### Microsoft login not working
- Verify Azure AD credentials in `.env`
- Check redirect URI matches in Azure portal
- Ensure `AUTH_SECRET` is set

### Students not showing
- Check if you're in the admin area
- Verify API endpoints are working (check browser console)
- Ensure you're authenticated

### Chess.com username not saving
- Ensure field is not empty when submitting
- Check browser console for error messages
- Verify API endpoint is accessible

---

## Support

For issues or questions, contact the administrator at jensenm@sbc.qld.edu.au
