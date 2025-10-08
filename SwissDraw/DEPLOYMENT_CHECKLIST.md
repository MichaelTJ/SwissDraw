# 📋 Deployment Checklist

Use this checklist to track your progress setting up SwissDraw.

---

## Azure AD Setup

- [ ] Opened Azure Portal (portal.azure.com)
- [ ] Created new App Registration named "SwissDraw Tournament Manager"
- [ ] Set to "Single tenant" (school accounts only)
- [ ] Added redirect URI: `http://localhost:5173/auth/callback`
- [ ] Copied Application (client) ID
- [ ] Copied Directory (tenant) ID
- [ ] Created client secret
- [ ] Copied client secret VALUE

---

## Local Configuration

- [ ] Copied `.env.local.template` to `.env`
- [ ] Pasted Application (client) ID into `.env`
- [ ] Pasted client secret into `.env`
- [ ] Pasted Directory (tenant) ID into `.env`
- [ ] Verified AUTH_SECRET is present: `Pjw868biuUPXunLUBR9bd+JA8A0u75rr3Vz99/rRhN4=`
- [ ] Ran `npm install`
- [ ] Ran `npm run dev`

---

## Local Testing

- [ ] Opened http://localhost:5173
- [ ] Saw landing page with "Sign in with Microsoft" button
- [ ] Clicked sign in button
- [ ] Successfully logged in with jensenm@sbc.qld.edu.au
- [ ] Redirected to Admin Dashboard
- [ ] Added a test student with chess.com username
- [ ] Viewed leaderboard
- [ ] Logged out successfully
- [ ] Logged in with different school account
- [ ] Verified non-admin sees User Dashboard
- [ ] Student was able to link profile

---

## GitHub Setup

- [ ] Initialized git repository (`git init`)
- [ ] Added all files (`git add .`)
- [ ] Made initial commit
- [ ] Created GitHub repository
- [ ] Pushed to GitHub

---

## Vercel Deployment

### Initial Deploy
- [ ] Created Vercel account
- [ ] Imported GitHub repository
- [ ] Set root directory to `SwissDraw`
- [ ] Completed first deployment
- [ ] Copied Vercel URL

### Azure Configuration for Production
- [ ] Went back to Azure Portal
- [ ] Opened App Registration → Authentication
- [ ] Added production redirect URI: `https://[VERCEL-URL]/auth/callback`
- [ ] Saved changes

### Environment Variables
- [ ] Opened Vercel project settings
- [ ] Added MICROSOFT_CLIENT_ID (all environments)
- [ ] Added MICROSOFT_CLIENT_SECRET (all environments)
- [ ] Added MICROSOFT_TENANT_ID (all environments)
- [ ] Added AUTH_SECRET (all environments)
- [ ] Added PUBLIC_URL with Vercel URL (production only)
- [ ] Added ADMIN_EMAIL: jensenm@sbc.qld.edu.au (all environments)

### Redeploy
- [ ] Went to Deployments tab
- [ ] Redeployed latest deployment

---

## Production Testing

- [ ] Visited Vercel URL
- [ ] Landing page loads correctly
- [ ] Clicked "Sign in with Microsoft"
- [ ] Successfully logged in as admin
- [ ] Admin dashboard loads
- [ ] Can add students
- [ ] Can record matches
- [ ] Can view leaderboard
- [ ] Logged out and logged in as regular user
- [ ] User dashboard loads
- [ ] User can link profile
- [ ] Chess.com links work

---

## User Onboarding

- [ ] Added all students to the system with chess.com usernames
- [ ] Sent login instructions to students
- [ ] Verified students can login
- [ ] Verified students can link their profiles
- [ ] Tested match recording workflow
- [ ] Verified leaderboard updates correctly

---

## Optional: Data Persistence (Recommended for Production)

- [ ] Considered implementing Vercel KV for persistent storage
- [ ] Or chosen alternative database solution
- [ ] Migrated from in-memory storage

---

## Documentation Review

- [ ] Read START_HERE.md
- [ ] Reviewed AZURE_VERCEL_SETUP.md
- [ ] Bookmarked SETUP.md for reference
- [ ] Shared relevant docs with team members

---

## 🎉 Completion

Once all boxes are checked, your SwissDraw Tournament Manager is fully deployed and ready to use!

**Your Configuration:**

```
Azure Application ID: _______________________________
Azure Tenant ID:      _______________________________
Vercel URL:           _______________________________
Admin Email:          jensenm@sbc.qld.edu.au
```

**Important URLs:**
- Production: https://[your-vercel-url].vercel.app
- Azure Portal: https://portal.azure.com
- Vercel Dashboard: https://vercel.com/dashboard

---

**Date Setup Completed:** _______________

**Deployed By:** Jensen McCarthy

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
