# Deployment Guide

## 🚀 Vercel Deployment (Frontend)

### Step 1: Prepare Frontend

1. **Build the frontend locally to test**
```bash
cd frontend
npm run build
```

2. **Set environment variables**
   - Create `.env.production` or set in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel

# For production deployment
vercel --prod
```

#### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. Add Environment Variables:
   - `VITE_API_URL`: Your backend API URL

7. Click "Deploy"

### Step 3: Configure Backend URL

After deploying, update the API URL in Vercel environment variables to point to your backend.

## 🔧 Backend Deployment

### Option 1: Railway

1. Go to [Railway](https://railway.app)
2. Create new project
3. Connect GitHub repository
4. Add service → Deploy from GitHub repo
5. Set root directory to project root (not frontend)
6. Add environment variables from `.env`
7. Add Redis service (or use external Redis)

### Option 2: Render

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables
6. Add Redis service

### Option 3: Heroku

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create your-app-name

# Add Redis addon
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set OPENAI_API_KEY=your_key
heroku config:set FACEBOOK_APP_ID=your_id
# ... set all other variables

# Deploy
git push heroku main
```

## 📋 Environment Variables Checklist

### Backend (Required)
- `OPENAI_API_KEY`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_ACCESS_TOKEN`
- `REDIS_HOST`
- `REDIS_PORT`
- `PORT` (optional, defaults to 3000)

### Frontend (Required for Production)
- `VITE_API_URL` - Backend API URL (e.g., `https://your-backend.railway.app/api`)

## 🔗 Connecting Frontend to Backend

1. **Get your backend URL** (e.g., `https://your-backend.railway.app`)

2. **Update Vercel environment variable**:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```

3. **Redeploy frontend** (automatic if using GitHub integration)

## ✅ Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Frontend environment variable `VITE_API_URL` is set
- [ ] Redis is accessible from backend
- [ ] All environment variables are set
- [ ] Health check endpoint works: `GET /api/health`
- [ ] Frontend can connect to backend API
- [ ] CORS is configured (if needed)

## 🐛 Troubleshooting

### Frontend can't connect to backend

1. Check `VITE_API_URL` is set correctly
2. Verify backend is running
3. Check CORS settings in backend
4. Verify backend URL is accessible

### Backend connection issues

1. Verify all environment variables are set
2. Check Redis connection
3. Verify Facebook token is valid
4. Check logs for errors

### Build failures

1. Check Node.js version (requires 18+)
2. Verify all dependencies are in package.json
3. Check build logs for specific errors

## 🔄 Continuous Deployment

With GitHub integration:
- Push to `main` branch → Auto-deploy to Vercel
- Backend: Configure auto-deploy in Railway/Render

## 📝 Notes

- Frontend is static and can be deployed to any static hosting
- Backend requires Node.js runtime and Redis
- Consider using environment-specific configurations
- Use production-ready Redis (Redis Cloud, Upstash, etc.)

