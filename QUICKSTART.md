# Quick Start Guide

## 1. Initial Setup

```bash
# Run setup script
./setup.sh

# Or manually:
npm install
mkdir -p logs/audit storage/media storage/uploads
```

## 2. Configure Environment

Edit `.env` file with your credentials:

```bash
OPENAI_API_KEY=sk-proj-...
FACEBOOK_APP_ID=24456868714005344
FACEBOOK_APP_SECRET=40bc262bdeb36f8538309e3c3da9ad00
FACEBOOK_ACCESS_TOKEN=EAFbjZAHwEQ2ABPZAbdRUPOjiVB55IFHjZAQHtueX1ZCMN2D1UAlojLCf3avcv5bIyqZA0I5aZCnntB1oLCQrg2ZBb3d18IJqBPAHwnnLWWAHZAb4KbfsFwcRq17NwwXFqs4iHydjRO3DndJP8BOWhXROmmLZCARkNjUote9NvzeL1W14m79C6K91hbZCukhZC2bY3ouKD9ODxi15EpQAZBinLAZDZD
```

## 3. Start Redis

```bash
redis-server
```

## 4. Start the Application

```bash
npm start
```

The server will start on `http://localhost:3000`

## 5. Test the API

### Discover Pages

```bash
curl http://localhost:3000/api/pages
```

### Schedule a Post (Dry Run)

```bash
curl -X POST http://localhost:3000/api/posts/dry-run \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "YOUR_PAGE_ID",
    "postType": "text",
    "locale": "en",
    "tone": "professional",
    "keyMessages": ["Test message 1", "Test message 2"],
    "hashtags": true,
    "publishTime": "2024-12-31T12:00:00Z",
    "approvalMode": "auto"
  }'
```

### Schedule a Real Post

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "YOUR_PAGE_ID",
    "postType": "text",
    "locale": "en",
    "tone": "professional",
    "keyMessages": ["Your key message here"],
    "hashtags": true,
    "publishTime": "2024-12-31T12:00:00Z",
    "approvalMode": "auto"
  }'
```

### Check Job Status

```bash
curl http://localhost:3000/api/jobs/JOB_ID
```

### Get Queue Stats

```bash
curl http://localhost:3000/api/queue/stats
```

## Example: Post with Image

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "YOUR_PAGE_ID",
    "postType": "image",
    "mediaUrl": "https://example.com/image.jpg",
    "mediaDescription": "A beautiful sunset over mountains",
    "locale": "en",
    "tone": "casual",
    "keyMessages": ["Check out this amazing view!"],
    "hashtags": true,
    "publishTime": "2024-12-31T12:00:00Z",
    "approvalMode": "auto"
  }'
```

## Security Notes

- Never commit `.env` file to git
- All tokens are automatically redacted from logs
- Use dry-run mode for testing
- Review audit logs regularly

## Troubleshooting

### Redis Connection Error

Make sure Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

### Facebook Token Invalid

1. Check token expiration
2. Verify required scopes are granted
3. Regenerate token if needed

### OpenAI API Error

1. Verify API key is correct
2. Check account has credits
3. Verify model availability

