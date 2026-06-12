#!/bin/bash

API_URL="https://afrifund.up.railway.app/api/v1"

echo "🧪 Testing AfriFund API"
echo "======================="
echo ""

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s "$API_URL/health" | jq '.' || curl -s "$API_URL/health"
echo ""

# Test registration
echo ""
echo "2. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@afrifund.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User",
    "role": "CREATOR"
  }')

echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# Test login
echo ""
echo "3. Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@afrifund.com",
    "password": "Test123!@#"
  }')

echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo ""
    echo "✅ Authentication successful!"
    echo "Access Token: $TOKEN"

    # Test authenticated endpoint
    echo ""
    echo "4. Testing authenticated endpoint (user profile)..."
    curl -s "$API_URL/users/me" \
      -H "Authorization: Bearer $TOKEN" | jq '.' 2>/dev/null || curl -s "$API_URL/users/me" -H "Authorization: Bearer $TOKEN"
else
    echo ""
    echo "⚠️  Could not extract access token. User might already exist."
fi

echo ""
echo ""
echo "✅ API testing complete!"
