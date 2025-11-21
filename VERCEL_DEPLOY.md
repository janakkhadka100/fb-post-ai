# Vercel Deployment Guide (Nepali)

## 🚀 Vercel मा Frontend Deploy गर्ने तरिका

### Method 1: Vercel Dashboard बाट (सजिलो)

1. **Vercel Account बनाउनुहोस्**
   - https://vercel.com मा जानुहोस्
   - "Sign Up" click गर्नुहोस्
   - GitHub account बाट sign up गर्नुहोस् (recommended)

2. **Project Import गर्नुहोस्**
   - Dashboard मा "Add New Project" click गर्नुहोस्
   - आफ्नो GitHub repository select गर्नुहोस्
   - "Import" click गर्नुहोस्

3. **Project Configuration**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables Add गर्नुहोस्**
   - "Environment Variables" section मा जानुहोस्
   - Add गर्नुहोस्:
     ```
     Name: VITE_API_URL
     Value: https://your-backend-url.railway.app/api
     ```
   - (Backend URL आफ्नो backend deployment URL हुनुपर्छ)

5. **Deploy Click गर्नुहोस्**
   - "Deploy" button click गर्नुहोस्
   - Deployment complete हुनेसम्म पर्खनुहोस्

6. **URL पाउनुहोस्**
   - Deployment complete पछि आफ्नो app URL मिल्छ
   - Example: `https://fb-post-ai.vercel.app`

### Method 2: Vercel CLI बाट

1. **Vercel CLI Install गर्नुहोस्**
   ```bash
   npm install -g vercel
   ```

2. **Login गर्नुहोस्**
   ```bash
   vercel login
   ```

3. **Frontend Directory मा जानुहोस्**
   ```bash
   cd frontend
   ```

4. **Deploy गर्नुहोस्**
   ```bash
   vercel
   ```

5. **Production Deploy**
   ```bash
   vercel --prod
   ```

6. **Environment Variables Set गर्नुहोस्**
   ```bash
   vercel env add VITE_API_URL
   # Value enter गर्नुहोस्: https://your-backend-url.railway.app/api
   ```

## ⚙️ Configuration

### vercel.json (already created)

`frontend/vercel.json` file मा configuration छ। यदि चाहिन्छ भने update गर्न सक्नुहुन्छ।

### Environment Variables

Vercel Dashboard मा जानेर environment variables add गर्नुहोस्:

- **VITE_API_URL**: Backend API URL
  - Example: `https://fb-post-ai-backend.railway.app/api`

## 🔄 Auto-Deployment

GitHub integration enable गरेपछि:
- `main` branch मा push गर्दा automatic deploy हुन्छ
- Pull request create गर्दा preview deployment हुन्छ

## 📝 Important Notes

1. **Backend URL Update गर्नुहोस्**
   - Backend deploy गरेपछि आफ्नो backend URL लिनुहोस्
   - Vercel environment variable `VITE_API_URL` मा set गर्नुहोस्
   - Redeploy गर्नुहोस्

2. **Build Errors**
   - Build logs check गर्नुहोस्
   - Local मा `npm run build` test गर्नुहोस्
   - Dependencies check गर्नुहोस्

3. **CORS Issues**
   - Backend मा CORS enable गर्नुहोस्
   - Frontend URL allow गर्नुहोस्

## ✅ Deployment Checklist

- [ ] GitHub repository ready छ
- [ ] Frontend build successful छ (`npm run build`)
- [ ] Backend deployed छ र URL छ
- [ ] Environment variables set गरिएको छ
- [ ] Vercel project created छ
- [ ] Deployment successful छ
- [ ] Frontend backend सँग connect भएको छ

## 🐛 Troubleshooting

### Build Failed
```bash
# Local मा test गर्नुहोस्
cd frontend
npm run build
```

### API Connection Issues
- Backend URL check गर्नुहोस्
- Environment variable `VITE_API_URL` check गर्नुहोस्
- Backend CORS settings check गर्नुहोस्

### 404 Errors
- Vercel routing configuration check गर्नुहोस्
- `vercel.json` file check गर्नुहोस्

## 🎉 Success!

Deployment successful भएपछि:
- आफ्नो app URL share गर्न सक्नुहुन्छ
- Custom domain add गर्न सक्नुहुन्छ
- Analytics enable गर्न सक्नुहुन्छ

---

**Happy Deploying! 🚀**

