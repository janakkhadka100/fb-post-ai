#!/bin/bash

# Setup script for Facebook Post AI Agent

echo "Setting up Facebook Post AI Agent..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your actual credentials:"
    echo "   - OPENAI_API_KEY"
    echo "   - FACEBOOK_APP_ID"
    echo "   - FACEBOOK_APP_SECRET"
    echo "   - FACEBOOK_ACCESS_TOKEN"
    echo ""
else
    echo ".env file already exists"
fi

# Create necessary directories
echo "Creating directories..."
mkdir -p logs/audit
mkdir -p storage/media
mkdir -p storage/uploads

# Install dependencies
echo "Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your credentials"
echo "2. Make sure Redis is running: redis-server"
echo "3. Start the application: npm start"
echo ""

