#!/bin/bash

# Gatherly Deployment Script for Render
# Run this before pushing to GitHub

echo "🚀 Preparing Gatherly for Render deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please update with your values!"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Test build
echo "🔨 Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi

# Create dist directory if it doesn't exist
mkdir -p dist

echo ""
echo "✅ All checks passed!"
echo ""
echo "📋 Next steps:"
echo "1. Commit your changes: git add . && git commit -m 'Prepare for deployment'"
echo "2. Push to GitHub: git push origin main"
echo "3. Deploy on Render.com"
echo ""
echo "🌐 After deployment, update AppContext.jsx with your Render URL"
echo ""
