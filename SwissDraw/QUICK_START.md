# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Azure AD Setup (5 minutes)

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Click "New registration"
3. Name: **SwissDraw Tournament Manager**
4. Redirect URI: `http://localhost:5173/auth/callback`
5. Copy these values to `.env`:
   - **Application (client) ID** → `MICROSOFT_CLIENT_ID`
   - **Directory (tenant) ID** → `MICROSOFT_TENANT_ID`
6. Go to "Certificates & secrets" → New client secret
7. Copy the secret value → `MICROSOFT_CLIENT_SECRET`

### Step 2: Configure Environment

Edit `SwissDraw/.env`:

```env
MICROSOFT_CLIENT_ID=<paste-your-client-id>
MICROSOFT_CLIENT_SECRET=<paste-your-secret>
MICROSOFT_TENANT_ID=<paste-your-tenant-id>
AUTH_SECRET=<run command below to generate>
PUBLIC_URL=http://localhost:5173
ADMIN_EMAIL=jensenm@sbc.qld.edu.au
```

Generate `AUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 3: Run the App

```bash
cd SwissDraw
npm install
npm run dev
```

Visit http://localhost:5173 and sign in!

---

## 👤 User Guide

### As Admin (jensenm@sbc.qld.edu.au):
1. Sign in with Microsoft
2. You'll see the Admin Dashboard
3. Go to **Students** → Add students with chess.com usernames
4. Go to **Matches** → Record match results
5. Use **Recommendations** for AI-powered pairings

### As Student (other users):
1. Sign in with Microsoft
2. You'll see the User Dashboard
3. Go to **My Profile** → Link to your student record
4. Enter your chess.com username
5. View your stats and the leaderboard

---

## 📋 What Changed

✅ Microsoft authentication added  
✅ Split into Admin and User areas  
✅ Chess.com username required for students  
✅ You (jensenm@sbc.qld.edu.au) are the default admin  
✅ Role-based access control  
✅ Secure API endpoints  

---

## 🆘 Common Issues

**Can't login?**
- Check Azure AD credentials in `.env`
- Verify redirect URI matches in Azure portal

**Not seeing admin features?**
- Confirm your email is `jensenm@sbc.qld.edu.au`
- Check `ADMIN_EMAIL` in `.env`

**Students not saving?**
- Chess.com username is required
- Check browser console for errors

---

For detailed setup, see **SETUP.md**
