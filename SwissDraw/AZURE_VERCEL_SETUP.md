# Azure AD + Vercel Setup Guide

## Part 1: Azure AD Configuration

### Step 1: Create App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** (search for it in the top bar)
3. Click **App registrations** in the left sidebar
4. Click **+ New registration**

### Step 2: Configure Registration

Fill in these details:

**Name:** `SwissDraw Tournament Manager`

**Supported account types:**
- Select: **Accounts in this organizational directory only (Single tenant)**
- This ensures only your school's Microsoft accounts can log in

**Redirect URI:**
- Platform: **Web**
- Add BOTH of these URLs (click "+ Add URI" for the second one):
  ```
  http://localhost:5173/auth/callback
  https://your-app-name.vercel.app/auth/callback
  ```
  
  ⚠️ **Important:** Replace `your-app-name` with your actual Vercel domain name
  - You can add this later if you don't have the Vercel URL yet
  - The exact URL must match - no trailing slashes!

### Step 3: Save and Note Application Details

After clicking **Register**, you'll see the Overview page.

**Copy these values** (you'll need them soon):

```
Application (client) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Directory (tenant) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Step 4: Create Client Secret

1. In the left sidebar, click **Certificates & secrets**
2. Click **+ New client secret**
3. Description: `SwissDraw Production Secret`
4. Expires: **24 months** (or your preference)
5. Click **Add**
6. **IMMEDIATELY COPY THE VALUE** (the long string under "Value" column)
   - ⚠️ You can only see this ONCE! If you lose it, you'll need to create a new one

### Step 5: Configure API Permissions (Verify)

1. Click **API permissions** in the left sidebar
2. You should see:
   - **Microsoft Graph** → **User.Read** (Delegated)
3. If not present, click **+ Add a permission**:
   - Select **Microsoft Graph**
   - Select **Delegated permissions**
   - Search and check:
     - `User.Read`
     - `openid`
     - `profile`
     - `email`
   - Click **Add permissions**

4. Click **Grant admin consent for [Your Organization]** (if you have permissions)

### Step 6: Add Additional Redirect URIs Later (Optional)

If you deploy to multiple environments:
- Staging: `https://staging-swissdraw.vercel.app/auth/callback`
- Production: `https://swissdraw.vercel.app/auth/callback`
- Preview: Vercel provides preview URLs - you can add these as needed

---

## Part 2: Local Development Setup

### Generate AUTH_SECRET

Open PowerShell and run:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output.

### Update .env File

Edit `SwissDraw/.env`:

```env
# Microsoft Azure AD Configuration
MICROSOFT_CLIENT_ID=<paste Application (client) ID from Azure>
MICROSOFT_CLIENT_SECRET=<paste client secret VALUE from Azure>
MICROSOFT_TENANT_ID=<paste Directory (tenant) ID from Azure>

# Auth.js Configuration
AUTH_SECRET=<paste generated secret from command above>

# Application URL (for local development)
PUBLIC_URL=http://localhost:5173

# Default Admin Email
ADMIN_EMAIL=jensenm@sbc.qld.edu.au
```

### Test Locally

```bash
npm run dev
```

Visit http://localhost:5173 and test the Microsoft login!

---

## Part 3: Vercel Deployment

### Step 1: Push to GitHub

If not already done:

```bash
git init
git add .
git commit -m "Add Microsoft authentication"
git branch -M main
git remote add origin https://github.com/yourusername/swissdraw.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New...** → **Project**
3. Import your GitHub repository
4. **Framework Preset:** SvelteKit (should auto-detect)
5. **Root Directory:** `SwissDraw`
6. Click **Deploy** (it will fail first time - this is expected!)

### Step 3: Configure Environment Variables in Vercel

1. After deployment attempt, go to your project settings
2. Click **Settings** → **Environment Variables**
3. Add these variables (one at a time):

| Name | Value | Environment |
|------|-------|-------------|
| `MICROSOFT_CLIENT_ID` | Your Application (client) ID | Production, Preview, Development |
| `MICROSOFT_CLIENT_SECRET` | Your client secret value | Production, Preview, Development |
| `MICROSOFT_TENANT_ID` | Your Directory (tenant) ID | Production, Preview, Development |
| `AUTH_SECRET` | Your generated secret | Production, Preview, Development |
| `ADMIN_EMAIL` | jensenm@sbc.qld.edu.au | Production, Preview, Development |
| `PUBLIC_URL` | https://your-app.vercel.app | Production only |

⚠️ **Security Note:** Make sure `MICROSOFT_CLIENT_SECRET` and `AUTH_SECRET` are kept private!

### Step 4: Update Azure Redirect URI

1. Go back to Azure Portal
2. Your app registration → **Authentication**
3. Under **Web** redirect URIs, add your actual Vercel URL:
   ```
   https://your-actual-vercel-url.vercel.app/auth/callback
   ```
4. Click **Save**

### Step 5: Redeploy on Vercel

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click **...** on the latest deployment → **Redeploy**
3. Check "Use existing Build Cache"
4. Click **Redeploy**

---

## Part 4: Vercel-Specific Considerations

### ⚠️ Important: Data Persistence

Your current setup uses **in-memory storage** for students and matches. This will reset on:
- Each new deployment
- Serverless function cold starts
- Server restarts

### Recommended: Upgrade to Vercel KV (Redis)

For production, you should use persistent storage:

1. **Vercel KV (Redis)** - Easiest option
   ```bash
   npm install @vercel/kv
   ```
   Then update your data functions to use KV instead of in-memory arrays

2. **Alternative Options:**
   - Vercel Postgres
   - Supabase
   - MongoDB Atlas
   - Firebase

For now, the app will work but data will be temporary. Let me know if you want help setting up Vercel KV!

### Environment Variable Access

The `.env` file is only for local development. Vercel uses the environment variables you set in the dashboard.

---

## Part 5: Testing Checklist

### Local Testing
- [ ] Run `npm run dev`
- [ ] Visit http://localhost:5173
- [ ] Click "Sign in with Microsoft"
- [ ] Login with jensenm@sbc.qld.edu.au
- [ ] Verify you see Admin Dashboard
- [ ] Add a student with chess.com username
- [ ] Logout and login with another school account
- [ ] Verify they see User Dashboard

### Production Testing (After Vercel Deployment)
- [ ] Visit your Vercel URL
- [ ] Click "Sign in with Microsoft"
- [ ] Login and verify authentication works
- [ ] Check admin/user routing works correctly
- [ ] Add test data and verify it works

---

## Troubleshooting

### "Redirect URI mismatch" error
- Verify the redirect URI in Azure **exactly** matches your URL
- No trailing slashes: `https://app.vercel.app/auth/callback` ✓
- With trailing slash: `https://app.vercel.app/auth/callback/` ✗

### "AADSTS50011: The reply URL specified in the request does not match"
- The URL in Azure must exactly match what's being used
- Check both `http://localhost:5173` and your Vercel URL are added

### Environment variables not working on Vercel
- Make sure you selected all three environments (Production, Preview, Development)
- Redeploy after adding environment variables
- Check they're visible in Settings → Environment Variables

### Authentication works locally but not on Vercel
- Verify `PUBLIC_URL` is set to your production URL in Vercel env vars
- Check `AUTH_SECRET` is set in Vercel
- Verify Azure redirect URI includes your Vercel URL

### Data disappears on Vercel
- Expected behavior with in-memory storage
- Implement Vercel KV or database for persistence

---

## Quick Reference

### Your Configuration Values

Fill these in for reference:

```
Azure Application (client) ID: _________________________
Azure Directory (tenant) ID:   _________________________
Vercel Project URL:            _________________________
Admin Email:                   jensenm@sbc.qld.edu.au
```

### Useful Links

- Azure Portal: https://portal.azure.com
- Vercel Dashboard: https://vercel.com/dashboard
- Your App Registrations: https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps

---

## Next Steps After Setup

1. ✅ Test authentication locally
2. ✅ Deploy to Vercel
3. ✅ Test authentication on Vercel
4. 🔄 Consider implementing Vercel KV for data persistence
5. 📧 Invite other teachers/students to test

Need help with any of these steps? Just ask!
