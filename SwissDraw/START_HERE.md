# 🚀 START HERE - Azure AD Setup

## What You Need to Do Right Now

I've prepared everything for you. Just follow these steps:

---

## Step 1: Open Azure Portal (2 minutes)

1. **Open this link:** https://portal.azure.com
2. **Sign in** with your school Microsoft admin account
3. **Search** for "Azure Active Directory" in the top search bar
4. **Click** on Azure Active Directory

---

## Step 2: Create App Registration (3 minutes)

1. In the left sidebar, click **App registrations**
2. Click **+ New registration** at the top

Fill in the form:
- **Name:** `SwissDraw Tournament Manager`
- **Supported account types:** Select **"Accounts in this organizational directory only"**
- **Redirect URI:** 
  - Platform: **Web**
  - URL: `http://localhost:5173/auth/callback`

3. Click **Register**

---

## Step 3: Copy Your IDs (1 minute)

You'll now see an "Overview" page with important information.

**COPY THESE TWO VALUES:**

```
Application (client) ID: 6f176213-f2c5-40d2-b670-ea83170fba2a
Directory (tenant) ID:   009be90d-e582-4e52-93ca-8814f907cb7e
```

Keep these safe - you'll need them in a moment!

---

## Step 4: Create Client Secret (2 minutes)

1. In the left sidebar, click **Certificates & secrets**
2. Click **+ New client secret**
3. Description: `SwissDraw Secret`
4. Expires: **24 months**
5. Click **Add**

**⚠️ IMPORTANT:** You'll see a secret VALUE appear - **COPY IT NOW!**

It looks like: `a1B2c3D4e5F6~g7H8i9J0k1L2m3N4o5P6q7R8s9T0`

**You can ONLY see this ONCE!** If you miss it, you'll need to create a new one.

---

## Step 5: Update Your .env File (2 minutes)

1. **Copy** the file `.env.local.template` to `.env`:
   ```bash
   copy .env.local.template .env
   ```

2. **Open** `.env` in your text editor

3. **Replace** these placeholders with the values you copied:
   - `MICROSOFT_CLIENT_ID=` ← Paste your Application (client) ID
   - `MICROSOFT_CLIENT_SECRET=` ← Paste your client secret value
   - `MICROSOFT_TENANT_ID=` ← Paste your Directory (tenant) ID

4. **Save** the file

**Your .env should look like:**
```env
MICROSOFT_CLIENT_ID=12345678-1234-1234-1234-123456789abc
MICROSOFT_CLIENT_SECRET=a1B2c3D4e5F6~g7H8i9J0k1L2m3N4o5P6q7R8s9T0
MICROSOFT_TENANT_ID=87654321-4321-4321-4321-cba987654321
AUTH_SECRET=Pjw868biuUPXunLUBR9bd+JA8A0u75rr3Vz99/rRhN4=
PUBLIC_URL=http://localhost:5173
ADMIN_EMAIL=jensenm@sbc.qld.edu.au
```

---

## Step 6: Test Locally (1 minute)

Run these commands:

```bash
npm run dev
```

1. Open http://localhost:5173
2. Click **"Sign in with Microsoft"**
3. Login with `jensenm@sbc.qld.edu.au`
4. You should see the **Admin Dashboard**! 🎉

---

## Step 7: Deploy to Vercel (5 minutes)

### First, push to GitHub:

```bash
git add .
git commit -m "Add Microsoft authentication"
git push
```

### Then deploy to Vercel:

1. Go to https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. Import your repository
4. **Root Directory:** Select `SwissDraw`
5. Click **Deploy** (it will build but won't work yet - that's OK!)

### Copy your Vercel URL:

After deployment, copy the URL (e.g., `swissdraw-abc123.vercel.app`)

### Go back to Azure Portal:

1. Your App Registration → **Authentication**
2. Under **Web** redirect URIs, click **+ Add URI**
3. Add: `https://YOUR-VERCEL-URL.vercel.app/auth/callback`
4. Click **Save**

### Add Environment Variables to Vercel:

1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add these (same values from your .env file):

| Variable | Value |
|----------|-------|
| `MICROSOFT_CLIENT_ID` | Your Application ID |
| `MICROSOFT_CLIENT_SECRET` | Your client secret |
| `MICROSOFT_TENANT_ID` | Your Directory ID |
| `AUTH_SECRET` | `Pjw868biuUPXunLUBR9bd+JA8A0u75rr3Vz99/rRhN4=` |
| `PUBLIC_URL` | `https://your-vercel-url.vercel.app` |
| `ADMIN_EMAIL` | `jensenm@sbc.qld.edu.au` |

3. Make sure to select **All environments** for each variable
4. Click **Save**

### Redeploy:

1. Go to **Deployments** tab
2. Click **...** on the latest deployment
3. Click **Redeploy**

---

## ✅ You're Done!

Your app is now live at your Vercel URL!

### Test it:
1. Visit your Vercel URL
2. Sign in with Microsoft
3. Add students with chess.com usernames
4. Invite students to login and view their stats!

---

## 🆘 Need Help?

**Microsoft login not working locally?**
- Check your .env file has all three IDs filled in
- Make sure there are no extra spaces or quotes
- Verify the redirect URI in Azure is exactly: `http://localhost:5173/auth/callback`

**Login not working on Vercel?**
- Verify you added all environment variables in Vercel dashboard
- Check the redirect URI in Azure includes your Vercel URL
- Make sure you redeployed after adding environment variables

**I lost my client secret!**
- Go back to Azure Portal → Your App → Certificates & secrets
- Delete the old secret and create a new one
- Update both .env and Vercel environment variables

---

## 📚 More Documentation

- **AZURE_VERCEL_SETUP.md** - Detailed step-by-step guide
- **SETUP.md** - Complete technical documentation
- **QUICK_START.md** - Quick reference guide

---

Good luck! 🚀
