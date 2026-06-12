# Railway Deployment Guide for AfriFund Backend

## Required Environment Variables

The following environment variables **MUST** be configured in your Railway project:

### Essential (Required)
- `DATABASE_URL` - PostgreSQL connection string (automatically set when you add PostgreSQL service)
- `JWT_SECRET` - Secret key for JWT token generation (generate a strong random string)
- `NODE_ENV` - Set to `production` for production deployment

### Optional (Recommended)
- `PORT` - Application port (Railway auto-assigns, defaults to 3001)
- `API_PREFIX` - API route prefix (defaults to `api/v1`)
- `FRONTEND_URL` - Frontend URL for CORS (e.g., `https://your-frontend.railway.app`)
- `JWT_EXPIRES_IN` - JWT expiration time (defaults to `7d`)
- `JWT_REFRESH_SECRET` - Refresh token secret
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (defaults to `30d`)
- `PLATFORM_FEE_PERCENTAGE` - Platform fee percentage (defaults to `3.0`)

### Optional (Redis - for background jobs)
- `REDIS_URL` - Redis connection string (automatically set when you add Redis service)
  - OR -
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - Individual Redis connection details

**Note**: Redis is optional for MVP deployment. Background jobs will be disabled if Redis is not configured.

### Payment Providers (Optional - Mock for MVP)
- `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_ENCRYPTION_KEY`
- `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`
- `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, `MPESA_SHORTCODE`

## Step-by-Step Deployment

### 1. Create Railway Project
```bash
# If not already done
railway login
railway init
```

### 2. Add PostgreSQL Database
1. Go to your Railway project dashboard
2. Click "New Service" → "Database" → "PostgreSQL"
3. Wait for provisioning (~30 seconds)
4. Railway will automatically create `DATABASE_URL` variable
5. Verify the variable is linked to your backend service

### 3. Configure Required Environment Variables
In Railway dashboard, go to your backend service → "Variables" tab:

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
FRONTEND_URL=https://your-frontend-url.railway.app
```

**Generate JWT Secret:**
```bash
# Use this command to generate a secure random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Optional: Add Redis (for background jobs)
1. Click "New Service" → "Database" → "Redis"
2. Wait for provisioning
3. Railway will automatically create `REDIS_URL` variable

### 5. Deploy
```bash
# Railway will auto-deploy on git push
git push origin main

# Or use Railway CLI
railway up
```

### 6. Verify Deployment
Check the health endpoints:
- `https://your-backend.railway.app/api/v1/health` - Full health check
- `https://your-backend.railway.app/api/v1/health/ready` - Readiness probe
- `https://your-backend.railway.app/api/v1/health/live` - Liveness probe

## Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"
**Solution:**
1. Ensure PostgreSQL service is added to your Railway project
2. Verify `DATABASE_URL` exists in your service variables
3. Check that the variable is properly linked (not just a reference)
4. Redeploy after adding the variable

### Error: Database connection failed
**Solution:**
1. Check PostgreSQL service is running
2. Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
3. Check Railway PostgreSQL service logs for issues

### Error: Application crashes on startup
**Solution:**
1. Check Railway deployment logs
2. Ensure all required environment variables are set
3. Verify `NODE_ENV=production` is set
4. Check `JWT_SECRET` is configured

### Build succeeds but app crashes at runtime
**Solution:**
1. Missing environment variables - check Railway logs for specific errors
2. Database not accessible - verify PostgreSQL service is running
3. Check health endpoint for specific error details

## Railway Configuration

The `railway.json` file in the backend directory contains deployment configuration:
- Build command includes Prisma client generation
- Health check endpoint: `/api/v1/health`
- Auto-restart on failure

## Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory, Network usage
- **Health Checks**: Automatic health monitoring via `/api/v1/health`

## Environment Variable Validation

The application validates required environment variables at startup and provides helpful error messages if any are missing. Check the logs for specific guidance on missing variables.

## Database Migrations

Railway automatically runs database migrations during deployment:
```bash
# Migrations run via prisma generate during build
npx prisma generate
```

To run migrations manually:
```bash
railway run npx prisma migrate deploy
```

## Security Best Practices

1. ✅ Always use strong, randomly generated JWT secrets
2. ✅ Set `NODE_ENV=production` in production
3. ✅ Use Railway's built-in PostgreSQL (secured by default)
4. ✅ Configure CORS with specific frontend URL
5. ✅ Keep sensitive credentials in Railway environment variables (never in code)

## Support

For issues:
1. Check Railway deployment logs
2. Verify all required environment variables
3. Test health endpoints
4. Review error messages in application logs

## Cost Optimization

**Free Tier:**
- PostgreSQL: Included in free tier (500MB)
- Redis: Optional (only if you need background jobs)
- Backend service: Included

**Recommendations:**
- Start without Redis (saves resources)
- Monitor database size
- Use Railway's built-in monitoring
