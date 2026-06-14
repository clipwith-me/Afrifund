# Required Environment Variables for Render

Add these environment variables to your Render service:

## Backend Service Environment Variables

```
NODE_ENV=production
PORT=10000
JWT_SECRET=(generate a secure random string)
JWT_EXPIRATION=7d
DATABASE_URL=(link from your PostgreSQL database)

# Prisma Configuration (Important!)
PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
```

## How to Add Environment Variables

1. Go to your service in Render dashboard
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add each variable above
5. For DATABASE_URL: Click "Add from database" → Select your PostgreSQL database
6. Click **"Save Changes"**
7. Redeploy the service

## Why These Are Needed

- `PRISMA_CLI_BINARY_TARGETS`: Tells Prisma which OpenSSL version to use
- `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING`: Prevents checksum validation errors during deployment
