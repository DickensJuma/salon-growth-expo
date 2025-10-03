#!/bin/bash
# Quick deployment script for production

echo "🚀 Salon Growth Expo - Production Deployment"
echo "============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from project root."
    exit 1
fi

echo "✅ Project root confirmed"
echo ""

# Check Node version
NODE_VERSION=$(node --version)
echo "📦 Node.js version: $NODE_VERSION"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   Copy .env.example to .env and fill in your values"
    echo ""
fi

# Run security tests
echo "🔐 Running security tests..."
cd backend
node test-security.js
if [ $? -ne 0 ]; then
    echo "❌ Security tests failed!"
    exit 1
fi
cd ..
echo ""

# Check for git repository
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - Production ready backend"
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR-USERNAME/salon-growth-expo.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. Deploy Backend to Render:"
echo "   - Go to https://render.com"
echo "   - Connect your GitHub repo"
echo "   - Create 'New Web Service'"
echo "   - Use render.yaml configuration"
echo "   - Add environment variables in dashboard"
echo ""
echo "3. Build & Upload Frontend to cPanel:"
echo "   npm run build"
echo "   - Upload dist/ contents to /public_html/event/"
echo "   - Add .htaccess for SPA routing"
echo ""
echo "4. Update Frontend API URL:"
echo "   - Edit src/config.ts with your Render backend URL"
echo "   - Rebuild: npm run build"
echo "   - Re-upload to cPanel"
echo ""
echo "🎉 You're ready to launch!"
