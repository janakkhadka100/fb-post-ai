# Facebook Post AI Agent - नेपाली गाइड

## 🎯 परियोजना बारे

यो एक स्वचालित Facebook posting system हो जसले:
- OpenAI को मद्दतले AI content generate गर्छ
- Facebook Pages मा automatic post गर्छ
- Content moderation गर्छ
- Job queue system use गर्छ
- Beautiful web interface छ

## ✅ के के Ready छ?

### Backend (Server)
- ✅ Node.js + Express API
- ✅ OpenAI integration
- ✅ Facebook Graph API integration
- ✅ Redis job queue
- ✅ Content moderation
- ✅ Audit logging
- ✅ Security features

### Frontend (Web Interface)
- ✅ React-based modern UI
- ✅ Dashboard
- ✅ Page management
- ✅ Post creation
- ✅ Job monitoring
- ✅ Audit logs viewer

### Configuration
- ✅ Environment variables setup
- ✅ CORS configuration
- ✅ Deployment configs
- ✅ GitHub workflows

## 🚀 GitHub मा Upload गर्ने तरिका

### Step 1: GitHub Repository बनाउनुहोस्

1. https://github.com मा जानुहोस्
2. "New repository" click गर्नुहोस्
3. Repository name: `fb-post-ai`
4. "Create repository" click गर्नुहोस्

### Step 2: Code Upload गर्नुहोस्

```bash
cd "/Users/macbookair/Documents/fb post ai"

# Git initialize (यदि पहिले गरिएको छैन भने)
git init

# सबै files add गर्नुहोस्
git add .

# Commit गर्नुहोस्
git commit -m "Initial commit: Facebook Post AI Agent"

# GitHub repository URL add गर्नुहोस् (आफ्नो URL use गर्नुहोस्)
git remote add origin https://github.com/YOUR_USERNAME/fb-post-ai.git

# Main branch set गर्नुहोस्
git branch -M main

# GitHub मा push गर्नुहोस्
git push -u origin main
```

**Detailed Guide:** `GITHUB_SETUP.md` हेर्नुहोस्

## 🌐 Vercel मा Deploy गर्ने तरिका

### Method 1: Vercel Dashboard (सजिलो)

1. **Vercel Account बनाउनुहोस्**
   - https://vercel.com मा जानुहोस्
   - GitHub account बाट sign up गर्नुहोस्

2. **Project Import**
   - "Add New Project" click गर्नुहोस्
   - आफ्नो GitHub repository select गर्नुहोस्

3. **Configuration**
   ```
   Framework: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

4. **Environment Variable**
   ```
   Name: VITE_API_URL
   Value: https://your-backend-url.railway.app/api
   ```

5. **Deploy Click गर्नुहोस्**

**Detailed Guide:** `VERCEL_DEPLOY.md` हेर्नुहोस्

## 🔧 Backend Deploy गर्ने तरिका

### Railway (Recommended)

1. https://railway.app मा जानुहोस्
2. GitHub repository connect गर्नुहोस्
3. Environment variables add गर्नुहोस्:
   - `OPENAI_API_KEY`
   - `FACEBOOK_APP_ID`
   - `FACEBOOK_APP_SECRET`
   - `FACEBOOK_ACCESS_TOKEN`
   - `REDIS_HOST` (Railway Redis service)
   - `REDIS_PORT`
4. Redis service add गर्नुहोस्
5. Deploy!

### Render

1. https://render.com मा जानुहोस्
2. New Web Service create गर्नुहोस्
3. GitHub repository connect गर्नुहोस्
4. Environment variables add गर्नुहोस्
5. Deploy!

**Detailed Guide:** `DEPLOYMENT.md` हेर्नुहोस्

## 📋 Environment Variables

### Backend (Railway/Render)
```
OPENAI_API_KEY=your_openai_key
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_ACCESS_TOKEN=your_access_token
REDIS_HOST=your_redis_host
REDIS_PORT=6379
PORT=3000
NODE_ENV=production
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.railway.app/api
```

## 📁 Project Structure

```
fb-post-ai/
├── src/              # Backend code
├── frontend/         # Frontend code
├── logs/            # Application logs
├── storage/          # Media storage
├── README.md         # Main documentation
├── GITHUB_SETUP.md   # GitHub setup guide
├── VERCEL_DEPLOY.md  # Vercel deployment guide
└── DEPLOYMENT.md     # Deployment instructions
```

## 🎯 Workflow

1. **Local Development**
   ```bash
   # Backend start
   npm start
   
   # Frontend start (new terminal)
   cd frontend && npm run dev
   ```

2. **GitHub Push**
   ```bash
   git add .
   git commit -m "Your message"
   git push
   ```

3. **Auto Deploy**
   - Vercel: Automatic on push
   - Railway/Render: Auto-deploy enabled

## ✅ Checklist

### GitHub Upload
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] All files uploaded
- [ ] `.env` file NOT uploaded (in `.gitignore`)

### Backend Deploy
- [ ] Railway/Render account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Redis service added
- [ ] Deployment successful
- [ ] Backend URL obtained

### Frontend Deploy
- [ ] Vercel account created
- [ ] Repository connected
- [ ] Configuration set
- [ ] Environment variable `VITE_API_URL` set
- [ ] Deployment successful
- [ ] Frontend URL obtained

### Testing
- [ ] Backend health check works
- [ ] Frontend loads correctly
- [ ] API connection works
- [ ] Pages discovery works
- [ ] Post creation works (dry-run)

## 🐛 Troubleshooting

### GitHub Upload Issues
- Git credentials check गर्नुहोस्
- Repository URL verify गर्नुहोस्
- `.gitignore` check गर्नुहोस्

### Deployment Issues
- Environment variables verify गर्नुहोस्
- Build logs check गर्नुहोस्
- Backend URL verify गर्नुहोस्

### Connection Issues
- CORS settings check गर्नुहोस्
- API URL verify गर्नुहोस्
- Network connectivity check गर्नुहोस्

## 📚 Documentation Files

- `README.md` - Main English documentation
- `README_NEPALI.md` - यो file (नेपाली)
- `GITHUB_SETUP.md` - GitHub setup guide
- `VERCEL_DEPLOY.md` - Vercel deployment guide
- `DEPLOYMENT.md` - Detailed deployment guide
- `QUICKSTART.md` - Quick start guide
- `SETUP_COMPLETE.md` - Setup completion summary

## 🎉 Success!

सबै setup complete भएपछि:
- ✅ GitHub मा code upload भएको छ
- ✅ Backend deploy भएको छ
- ✅ Frontend deploy भएको छ
- ✅ Environment variables set भएका छन्
- ✅ System ready छ!

## 📞 Support

यदि कुनै समस्या आयो भने:
1. Documentation files हेर्नुहोस्
2. Logs check गर्नुहोस्
3. Environment variables verify गर्नुहोस्
4. Error messages carefully read गर्नुहोस्

---

**शुभकामना! 🚀**

