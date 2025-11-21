# Facebook Post AI Agent

An autonomous posting agent that fully automates posting to multiple Facebook Pages using OpenAI content generation and Meta Graph API.

## 🌟 Features

- ✅ **Secure Secret Management**: Environment variables only, never logged or exposed
- ✅ **OpenAI Integration**: GPT-4o-mini content generation with 3 variants per post
- ✅ **Content Moderation**: Automatic OpenAI moderation on all generated content
- ✅ **Facebook Graph API**: Full integration with pages and groups
- ✅ **Job Queue**: BullMQ with Redis for reliable scheduling
- ✅ **Audit Logging**: Immutable audit trail with token redaction
- ✅ **Rate Limit Handling**: Exponential backoff and retry logic
- ✅ **Dry Run Mode**: Test posting without actually posting
- ✅ **Media Support**: Image uploads with alt-text generation
- ✅ **Modern Web UI**: React-based frontend with beautiful design

## 📁 Project Structure

```
fb-post-ai/
├── src/                    # Backend source code
│   ├── api/               # Express routes
│   ├── config/            # Configuration management
│   ├── queues/            # BullMQ job queues
│   ├── services/          # Business logic services
│   ├── utils/             # Utilities (logger, etc.)
│   ├── workers/           # Background workers
│   └── index.js           # Application entry point
├── frontend/              # React frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── api/          # API client
│   │   └── App.jsx       # Main app component
│   └── package.json
├── logs/                  # Application logs
├── storage/               # Media storage
└── package.json          # Backend dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Redis (for job queue)
- Facebook App with appropriate permissions
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd fb-post-ai
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

4. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Facebook Configuration
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token

# Server Configuration
PORT=3000
NODE_ENV=development

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Facebook Graph API Version
FACEBOOK_API_VERSION=21.0

# Retry Configuration
MAX_RETRIES=3
RETRY_DELAY_MS=1000

# Dry Run Mode
DRY_RUN=false
```

5. **Start Redis**
```bash
redis-server
```

6. **Start the backend**
```bash
npm start
```

7. **Start the frontend** (in a new terminal)
```bash
cd frontend
npm run dev
```

## 🌐 Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000 (or configured port)

## 📚 API Documentation

### Health Check
```bash
GET /api/health
```

### Discover Pages
```bash
GET /api/pages
```

### Schedule a Post
```bash
POST /api/posts
Content-Type: application/json

{
  "pageId": "123456789",
  "postType": "text",
  "locale": "en",
  "tone": "professional",
  "keyMessages": ["Message 1", "Message 2"],
  "hashtags": true,
  "cta": "Learn more",
  "publishTime": "2024-01-01T12:00:00Z",
  "approvalMode": "auto"
}
```

### Get Job Status
```bash
GET /api/jobs/:jobId
```

### Queue Statistics
```bash
GET /api/queue/stats
```

### Audit Logs
```bash
GET /api/audit?requestId=req-123&pageId=123456789
```

## 🔒 Security Features

- **Token Redaction**: All logs automatically redact API keys and tokens
- **Secure Config**: Environment variables only, never hardcoded
- **Audit Trail**: Immutable logs with sensitive data redacted
- **Moderation**: All content checked via OpenAI Moderation API
- **Rate Limiting**: Respects Facebook rate limits with exponential backoff

## 🎨 Frontend Features

- **Dashboard**: System status and queue statistics
- **Pages**: Discover and manage Facebook pages
- **Create Post**: Generate and schedule posts with AI
- **Jobs**: Monitor scheduled and active posting jobs
- **Audit Logs**: View system activity and audit trail

## 🚢 Deployment

### Backend Deployment

The backend can be deployed to:
- Railway
- Render
- Heroku
- AWS EC2
- Any Node.js hosting service

**Required Environment Variables:**
- All variables from `.env` file
- Ensure Redis is accessible (use Redis Cloud or similar)

### Frontend Deployment (Vercel)

1. **Build the frontend**
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel**
```bash
npm install -g vercel
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

**Vercel Configuration:**
- Build Command: `cd frontend && npm run build`
- Output Directory: `frontend/dist`
- Install Command: `cd frontend && npm install`

**Environment Variables in Vercel:**
- `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app/api`)

## 📝 Development

```bash
# Backend development
npm run dev

# Frontend development
cd frontend
npm run dev
```

## 🧪 Testing

Use dry-run mode to test without posting:

```bash
# Set in .env
DRY_RUN=true

# Or use the dry-run endpoint
POST /api/posts/dry-run
```

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## ⚠️ Important Notes

- Never commit `.env` file to version control
- All tokens are automatically redacted from logs
- Use dry-run mode for testing
- Review audit logs regularly
- Ensure Facebook token has required scopes:
  - `pages_manage_posts`
  - `pages_read_engagement`
  - `pages_manage_metadata`

## 🆘 Support

For issues or questions:
1. Check the logs in `logs/` directory
2. Review audit logs via `/api/audit`
3. Verify environment variables are set correctly
4. Ensure Redis is running and accessible

## 📊 Workflow

1. **Startup**: Validates environment, OpenAI connection, and Facebook token
2. **Content Generation**: Creates 3 variants using OpenAI
3. **Moderation**: Checks all variants for policy violations
4. **Media Handling**: Downloads/uploads media if needed
5. **Approval**: Manual or automatic based on `approvalMode`
6. **Scheduling**: Adds job to queue for execution at `publishTime`
7. **Posting**: Worker processes job, posts to Facebook
8. **Audit**: All actions logged securely

---

**Made with ❤️ for automated social media management**
