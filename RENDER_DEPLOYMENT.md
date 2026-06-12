# 🚀 Render Deployment Guide

## Deploy Backend to Render

### Option 1: One-Click Deploy with Blueprint (Recommended)

1. **Push your code to GitHub** (if not already done)

2. **Go to Render Dashboard**: https://dashboard.render.com/

3. **Click "New" → "Blueprint"**

4. **Connect your GitHub repository**
   - Select `Afrifund` repository
   - Render will automatically detect `render.yaml`

5. **Review the blueprint**
   - Backend service: `afrifund-backend`
   - PostgreSQL database: `afrifund-db`
   - Environment variables will be auto-configured

6. **Click "Apply"**
   - Render will create both the database and backend service
   - Database connection will be automatically linked
   - JWT_SECRET will be auto-generated

7. **Wait for deployment** (~5-10 minutes)
   - Database provisioning: ~2 minutes
   - Build and deploy: ~3-8 minutes

8. **Your backend will be live at**:
   - `https://afrifund-backend.onrender.com`
   - Health check: `https://afrifund-backend.onrender.com/api/v1/health`

### Option 2: Manual Deployment

If you prefer manual setup:

1. **Create PostgreSQL Database**
   - Dashboard → New → PostgreSQL
   - Name: `afrifund-db`
   - Plan: Free
   - Region: Oregon (or your preferred region)
   - Click "Create Database"

2. **Create Web Service**
   - Dashboard → New → Web Service
   - Connect your repository
   - Name: `afrifund-backend`
   - Region: Same as database
   - Branch: `claude/afrifund-mvp-platform-01C4cTj3aRufHDrWzXQVFGKN` (or main)
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm run start:prod`
   - Plan: Free

3. **Configure Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=<copy from your PostgreSQL database>
   JWT_SECRET=<generate a secure random string>
   JWT_EXPIRATION=7d
   PORT=10000
   ```

4. **Add Health Check**
   - Path: `/api/v1/health`
   - This ensures Render monitors your service

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment

### Step 3: Run Database Migrations

After deployment succeeds:

**Option A: Using Render Shell**
```bash
# From Render dashboard → Your Service → Shell tab
npx prisma migrate deploy
```

**Option B: Using Render CLI** (Install first: `npm install -g render-cli`)
```bash
render login
render shell afrifund-backend
npx prisma migrate deploy
```

**Option C: Add migration to build command**
Update Build Command to:
```
npm install && npx prisma generate && npm run build && npx prisma migrate deploy
```

### Step 4: Test Your API

```bash
# Health check
curl https://afrifund-backend.onrender.com/api/v1/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-06-12T...",
  "uptime": 123.45,
  "database": "connected",
  "environment": "production"
}
```

---

## Important Notes

### Free Tier Limitations
- **Cold starts**: Service spins down after 15 minutes of inactivity
- **First request**: May take 30-60 seconds after cold start
- **Database**: 90 days retention, 256MB storage
- **Bandwidth**: 100GB/month

### Production Recommendations
For production use, consider upgrading to paid plans:
- **Starter Plan ($7/month)**: No cold starts, better performance
- **Database**: Paid plans offer more storage and better performance

### Environment Variables
- `DATABASE_URL`: Auto-linked from PostgreSQL service
- `JWT_SECRET`: Use Render's "Generate Value" for security
- Never commit secrets to git

### Monitoring
- Render provides:
  - Service logs (last 7 days on free tier)
  - Metrics (CPU, memory, requests)
  - Automatic health checks
  - Deploy notifications

---

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### Database Connection Fails
- Verify `DATABASE_URL` is set correctly
- Check database service is running
- Ensure services are in the same region for better latency

### Migrations Fail
- Run migrations manually via Shell
- Check Prisma schema is valid
- Verify database permissions

---

## Next Steps

1. ✅ Backend deployed to Render
2. ⏭️ Deploy frontend to Vercel (see VERCEL_DEPLOYMENT.md)
3. ⏭️ Update frontend environment variables with Render backend URL
4. ⏭️ Test end-to-end flow

---

**Your Render backend URL**: `https://afrifund-backend.onrender.com`

Use this URL in your Vercel frontend configuration.
