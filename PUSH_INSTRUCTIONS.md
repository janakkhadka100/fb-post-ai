# GitHub Push Instructions

## Step 1: GitHub मा Repository बनाउनुहोस्

1. https://github.com/janakkhadka100 मा जानुहोस्
2. "New repository" button click गर्नुहोस् (वा https://github.com/new)
3. Repository details:
   - **Name**: `fb-post-ai`
   - **Description**: "Autonomous Facebook posting agent with OpenAI content generation"
   - **Visibility**: Public वा Private (आफ्नो choice)
   - **⚠️ Important**: "Initialize with README" UNCHECK गर्नुहोस् (हामीले already code छ)
4. "Create repository" click गर्नुहोस्

## Step 2: Code Push गर्नुहोस्

Repository बनाएपछि, यो command run गर्नुहोस्:

```bash
cd "/Users/macbookair/Documents/fb post ai"
git push -u origin main
```

यदि authentication चाहिन्छ भने, GitHub credentials use गर्नुहोस्।

## Alternative: GitHub CLI use गर्ने

यदि GitHub CLI installed छ भने:

```bash
gh repo create fb-post-ai --public --source=. --remote=origin --push
```

---

**Repository बनाएपछि मलाई थाहा दिनुहोस्, म push गर्न मद्दत गर्छु!**

