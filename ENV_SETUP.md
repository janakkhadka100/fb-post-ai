# Environment Variables Setup

## Important: Create .env File

The `.env` file is gitignored for security. You need to create it manually.

## Quick Setup

1. Copy the example file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your credentials:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Facebook Configuration
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token

# Storage Configuration
STORAGE_CONNECTION=file://./storage

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

# Dry Run Mode (set to true for testing)
DRY_RUN=false
```

## Security Reminders

- ✅ `.env` is already in `.gitignore`
- ✅ Never commit `.env` to version control
- ✅ All logs automatically redact tokens
- ✅ Use `DRY_RUN=true` for testing

## Verification

After creating `.env`, verify it works:

```bash
npm start
```

The application will validate all environment variables on startup.

