#!/bin/bash
set -e

echo "🗄️  AfriFund Database Migration Script"
echo "======================================"
echo ""

# Check if Railway CLI is logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged into Railway CLI"
    echo ""
    echo "Please run: railway login"
    echo "This will open a browser for authentication."
    echo ""
    exit 1
fi

echo "✅ Railway CLI authenticated"
echo ""

# Check if linked to project
if ! railway status &> /dev/null; then
    echo "🔗 Linking to Railway project..."
    railway link
fi

echo "✅ Linked to Railway project"
echo ""

# Run migrations
echo "🚀 Running database migrations..."
railway run npx prisma migrate deploy

echo ""
echo "✅ Migrations completed successfully!"
echo ""
echo "Next steps:"
echo "1. Test your API: curl https://afrifund.up.railway.app/api/v1/health"
echo "2. Create a test user"
echo "3. Deploy your frontend"
