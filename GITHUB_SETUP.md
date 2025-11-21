# GitHub Setup Guide

## 📦 GitHub मा Upload गर्ने तरिका

### Step 1: GitHub Repository बनाउनुहोस्

1. GitHub मा जानुहोस्: https://github.com
2. "New repository" click गर्नुहोस्
3. Repository name: `fb-post-ai` (वा आफ्नो चाहिएको नाम)
4. Description: "Autonomous Facebook posting agent with OpenAI"
5. Public वा Private छान्नुहोस्
6. "Create repository" click गर्नुहोस्

### Step 2: Local Repository Setup

```bash
# Project directory मा जानुहोस्
cd "/Users/macbookair/Documents/fb post ai"

# Git initialize (यदि पहिले गरिएको छैन भने)
git init

# सबै files add गर्नुहोस्
git add .

# First commit गर्नुहोस्
git commit -m "Initial commit: Facebook Post AI Agent with frontend"

# GitHub repository URL add गर्नुहोस् (आफ्नो URL use गर्नुहोस्)
git remote add origin https://github.com/YOUR_USERNAME/fb-post-ai.git

# Main branch set गर्नुहोस्
git branch -M main

# GitHub मा push गर्नुहोस्
git push -u origin main
```

### Step 3: Verify

GitHub repository मा जानेर check गर्नुहोस् कि सबै files upload भएका छन्।

## 🔐 Important: Environment Variables

**कृपया ध्यान दिनुहोस्:** `.env` file GitHub मा upload हुँदैन (यो `.gitignore` मा छ)।

Production मा deploy गर्दा environment variables manually set गर्नुपर्छ।

## 📝 Commit Messages

```bash
# नयाँ features add गर्दा
git add .
git commit -m "Add: new feature description"

# Bug fix गर्दा
git commit -m "Fix: bug description"

# Documentation update
git commit -m "Docs: update documentation"
```

## 🔄 Updates Push गर्ने

```bash
# Changes check गर्नुहोस्
git status

# Changes add गर्नुहोस्
git add .

# Commit गर्नुहोस्
git commit -m "Your commit message"

# GitHub मा push गर्नुहोस्
git push
```

## 🌿 Branches

```bash
# नयाँ branch बनाउनुहोस्
git checkout -b feature/new-feature

# Changes commit गर्नुहोस्
git add .
git commit -m "Add new feature"

# Branch push गर्नुहोस्
git push -u origin feature/new-feature

# Main branch मा फर्कनुहोस्
git checkout main
```

## ✅ Checklist

- [ ] `.env` file `.gitignore` मा छ
- [ ] सबै source code files add भएका छन्
- [ ] `README.md` update भएको छ
- [ ] `package.json` मा सबै dependencies छन्
- [ ] Frontend build configuration ready छ
- [ ] Backend configuration ready छ

## 🚀 Next Steps

GitHub मा upload पछि:
1. Vercel मा deploy गर्नुहोस् (frontend)
2. Railway/Render मा deploy गर्नुहोस् (backend)
3. Environment variables set गर्नुहोस्
4. Test गर्नुहोस्

See `DEPLOYMENT.md` for detailed deployment instructions.

