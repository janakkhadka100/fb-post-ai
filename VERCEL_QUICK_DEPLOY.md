# 🚀 Vercel Quick Deploy Guide

## ✅ GitHub Push Complete!

Code successfully pushed to: https://github.com/janakkhadka100/fb-post-ai

## 🌐 Vercel मा Deploy गर्ने तरिका

### Option 1: Vercel Dashboard (सजिलो - Recommended)

1. **Vercel Dashboard मा जानुहोस्**
   - https://vercel.com/dashboard मा जानुहोस्
   - Login गर्नुहोस् (यदि पहिले नै login भएको छ भने skip गर्नुहोस्)

2. **New Project Add गर्नुहोस्**
   - "Add New..." button click गर्नुहोस्
   - "Project" select गर्नुहोस्

3. **GitHub Repository Import गर्नुहोस्**
   - "Import Git Repository" section मा
   - `janakkhadka100/fb-post-ai` search गर्नुहोस् वा list बाट select गर्नुहोस्
   - "Import" click गर्नुहोस्

4. **Project Configuration**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **Environment Variables Add गर्नुहोस्**
   - "Environment Variables" section मा click गर्नुहोस्
   - Add गर्नुहोस्:
     ```
     Name: VITE_API_URL
     Value: https://your-backend-url.railway.app/api
     ```
   - ⚠️ Note: Backend deploy गरेपछि मात्र यो URL set गर्नुहोस्
   - अहिलेको लागि placeholder राख्न सक्नुहुन्छ

6. **Deploy Click गर्नुहोस्**
   - "Deploy" button click गर्नुहोस्
   - Deployment complete हुनेसम्म पर्खनुहोस् (2-3 minutes)

7. **Deployment URL पाउनुहोस्**
   - Deployment complete पछि आफ्नो app URL मिल्छ
   - Example: `https://fb-post-ai.vercel.app`

### Option 2: Vercel CLI (Terminal बाट)

```bash
# Frontend directory मा जानुहोस्
cd "/Users/macbookair/Documents/fb post ai/frontend"

# Vercel login (यदि पहिले नै login भएको छैन भने)
vercel login

# Deploy गर्नुहोस्
vercel

# Production deploy
vercel --prod
```

## ⚙️ Important Configuration

### Root Directory
Vercel मा **Root Directory** `frontend` set गर्नुहोस् किनभने frontend code `frontend/` folder मा छ।

### Environment Variables

**अहिलेको लागि:**
```
VITE_API_URL=https://placeholder-url.com/api
```

**Backend deploy गरेपछि:**
```
VITE_API_URL=https://your-actual-backend-url.railway.app/api
```

## 🔄 Auto-Deployment

GitHub integration enable भएपछि:
- `main` branch मा push गर्दा automatic deploy हुन्छ
- Pull request create गर्दा preview deployment हुन्छ

## ✅ Deployment Checklist

- [ ] Vercel account login भएको छ
- [ ] GitHub repository import गरिएको छ
- [ ] Root Directory: `frontend` set गरिएको छ
- [ ] Build Command: `npm run build` set गरिएको छ
- [ ] Output Directory: `dist` set गरिएको छ
- [ ] Environment variable `VITE_API_URL` add गरिएको छ
- [ ] Deploy button click गरिएको छ
- [ ] Deployment successful भएको छ

## 🎉 Success!

Deployment successful भएपछि:
- ✅ Frontend live हुनेछ
- ✅ आफ्नो app URL share गर्न सक्नुहुन्छ
- ✅ Custom domain add गर्न सक्नुहुन्छ

## 📝 Next Steps

1. **Backend Deploy गर्नुहोस्** (Railway/Render)
2. **Backend URL update गर्नुहोस्** Vercel environment variable मा
3. **Redeploy गर्नुहोस्** (automatic हुन्छ यदि auto-deploy enable छ भने)

---

**Happy Deploying! 🚀**

