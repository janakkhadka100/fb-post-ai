# Backend Deployment Guide

## 🚀 Quick Backend Deploy (Railway - Recommended)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"

### Step 2: Deploy Backend
1. Click "Deploy from GitHub repo"
2. Select `janakkhadka100/fb-post-ai`
3. Railway will auto-detect Node.js

### Step 3: Add Redis
1. Click "+ New" → "Database" → "Add Redis"
2. Railway will create Redis instance

### Step 4: Set Environment Variables
In Railway project settings, add these variables:

```
OPENAI_API_KEY=your_openai_key
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_ACCESS_TOKEN=your_access_token
REDIS_HOST=redis.railway.internal (or provided by Railway)
REDIS_PORT=6379
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://frontend-iveqmirjl-janaks-projects-69446763.vercel.app
```

### Step 5: Get Backend URL
1. After deployment, Railway provides a URL
2. Example: `https://fb-post-ai-production.up.railway.app`
3. Copy this URL

### Step 6: Update Vercel Environment Variable
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app/api
   ```
4. Redeploy frontend

## ✅ Verification

After deployment:
1. Check backend health: `https://your-backend-url/api/health`
2. Should return: `{"status":"healthy",...}`
3. Frontend should now connect successfully

---

**Quick Deploy Link:** https://railway.app/new

