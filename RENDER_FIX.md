# 🔧 Fix Render Deployment - Blueprint Method

## Problem
Render is trying to use Docker instead of Node.js runtime because the service wasn't created via Blueprint.

## Solution: Use Blueprint Deploy

### Step 1: Delete Existing Service (if any)
1. Go to Render Dashboard: https://dashboard.render.com/
2. Select `afrifund-backend` (if it exists)
3. Click **Settings** → **Delete Web Service**
4. Confirm deletion

### Step 2: Deploy via Blueprint

1. **Go to Render Dashboard**: https://dashboard.render.com/

2. **Click "New" → "Blueprint"**

3. **Connect Repository**:
   - Authorize GitHub if needed
   - Select repository: `clipwith-me/Afrifund`
   - Branch: `claude/afrifund-mvp-platform-01C4cTj3aRufHDrWzXQVFGKN`

4. **Review Blueprint**:
   Render will detect `render.yaml` and show:
   ```
   Services to create:
   - afrifund-backend (Web Service)
   
   Databases to create:
   - afrifund-db (PostgreSQL)
   ```

5. **Click "Apply"**

6. **Wait for Deployment** (~5-10 minutes):
   - Database provisioning: ~2 min
   - Backend build & deploy: ~3-8 min

### Step 3: Verify Deployment

Once complete, test:
```bash
curl https://afrifund-backend.onrender.com/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "environment": "production"
}
```

### Step 4: Run Migrations

1. Go to `afrifund-backend` service in Render
2. Click **Shell** tab
3. Run:
```bash
npx prisma migrate deploy
```

## Why This Works

The Blueprint method:
- ✅ Uses `render.yaml` configuration
- ✅ Automatically sets `runtime: node`
- ✅ Sets `rootDir: backend` correctly
- ✅ Creates PostgreSQL database
- ✅ Links database to service
- ✅ Auto-generates JWT_SECRET
- ✅ No Dockerfile needed

---

## Alternative: Manual Configuration (If You Don't Want to Delete)

If you prefer to fix the existing service manually:

1. Go to your service in Render dashboard
2. Click **Settings**
3. Update these fields:
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Root Directory**: `backend`
4. Under **Environment**:
   - Add all variables from render.yaml
5. Click **Save Changes**
6. Manual deploy

**Note**: Blueprint method is easier and less error-prone.

---

## After Successful Deployment

Your backend will be at: `https://afrifund-backend.onrender.com`

Don't forget to:
1. ✅ Run database migrations
2. ✅ Test health endpoint
3. ✅ Test API from frontend

---

**Estimated time**: 10-15 minutes total
