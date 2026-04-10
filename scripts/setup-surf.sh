#!/bin/bash
# Setup script to configure polymarket-wallets for Surf CLI

set -e

echo "🔄 Polymarket Wallets - Surf CLI Setup"
echo "======================================"

# Check if surf CLI is installed
if ! command -v surf &> /dev/null; then
    echo "❌ Surf CLI not found. Installing..."
    curl -fsSL https://agent.asksurf.ai/cli/releases/install.sh | sh
    echo "✅ Surf CLI installed"
else
    echo "✅ Surf CLI found"
fi

# Check if API key is configured
if [ -z "$SURF_API_KEY" ]; then
    if grep -q "SURF_API_KEY=" .env.local 2>/dev/null; then
        echo "✅ API key found in .env.local"
    else
        echo "❌ No API key found. Please add SURF_API_KEY to your .env.local file"
        echo "   Get your API key from: https://agents.asksurf.ai"
        echo "   Example: SURF_API_KEY=sk-your_api_key_here"
        exit 1
    fi
else
    echo "✅ API key found in environment"
fi

# Test surf CLI connection
echo "🔌 Testing Surf CLI connection..."
if surf search-prediction-market --limit 1 > /dev/null 2>&1; then
    echo "✅ Surf CLI connection successful"
else
    echo "❌ Surf CLI connection failed"
    echo "   Please check your API key and try: surf login"
    exit 1
fi

# Enable Surf API mode
echo "🔄 Enabling Surf CLI mode..."
if grep -q "USE_SURF_API=" .env.local; then
    sed -i '' 's/USE_SURF_API=.*/USE_SURF_API=true/' .env.local
else
    echo "USE_SURF_API=true" >> .env.local
fi

echo "✅ Surf CLI mode enabled"
echo
echo "🎉 Setup complete! The app will now use Surf CLI instead of ClickHouse"
echo
echo "To switch back to ClickHouse:"
echo "  Set USE_SURF_API=false in .env.local"
echo
echo "To test the setup:"
echo "  npm run dev"
echo "  Visit http://localhost:3000"