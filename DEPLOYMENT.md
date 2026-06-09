# AfriFund Deployment Guide

## 🚀 Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (free tier available)

### Step 2: Deploy Backend
1. Click "New Project" → "Deploy from GitHub repo"
2. Select the `Afrifund` repository
3. Choose the `backend` folder as the root directory
4. Railway will auto-detect Node.js and PostgreSQL

### Step 3: Add PostgreSQL Database
1. Click "+ New" → "Database" → "PostgreSQL"
2. Railway will automatically add `DATABASE_URL` environment variable

### Step 4: Configure Environment Variables
In Railway dashboard, add these environment variables:

```bash
NODE_ENV=production
PORT=3001
API_PREFIX=api/v1

# DATABASE_URL is auto-provided by Railway PostgreSQL

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-production-key-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-production-key-change-this
JWT_REFRESH_EXPIRES_IN=30d

# Redis (Railway will provide if you add Redis service)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Frontend URL (Update after deploying frontend)
FRONTEND_URL=https://your-frontend.vercel.app

# Payment Providers (Mock for MVP)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxx
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
MPESA_CONSUMER_KEY=xxxxx
MPESA_CONSUMER_SECRET=xxxxx
MPESA_PASSKEY=xxxxx
MPESA_SHORTCODE=174379

# Platform Settings
PLATFORM_FEE_PERCENTAGE=3.0
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
CERTIFICATE_STORAGE_PATH=./public/certificates

# Mock KYC
MOCK_KYC_AUTO_APPROVE=true
```

### Step 5: Deploy
1. Railway will automatically build and deploy
2. Get your backend URL: `https://your-app.railway.app`
3. Test: `https://your-app.railway.app/api/v1/campaigns`

---

## 🎨 Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (free tier available)

### Step 2: Deploy Frontend
1. Click "Add New Project"
2. Import `Afrifund` repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Configure Environment Variables
In Vercel dashboard, add:

```bash
# Backend API URL (from Railway deployment)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app

# Payment Provider Public Keys
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

# Feature Flags
NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS=true
```

### Step 4: Deploy
1. Click "Deploy"
2. Vercel will build and deploy automatically
3. Get your frontend URL: `https://your-app.vercel.app`

### Step 5: Update Backend CORS
1. Go back to Railway
2. Update `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy backend

---

## 🔗 Connect Everything

After both deployments:

1. **Update Backend `FRONTEND_URL`**:
   - Railway → Environment Variables
   - Set `FRONTEND_URL=https://your-app.vercel.app`

2. **Update Frontend `NEXT_PUBLIC_API_URL`**:
   - Vercel → Settings → Environment Variables
   - Set `NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1`

3. **Redeploy both services** to apply changes

---

## 🧪 Test Your Deployment

Visit your Vercel URL and test:

1. **Homepage**: `https://your-app.vercel.app`
2. **Login**: Use test accounts
   - Creator: test@afrifund.com / Test123!@#
   - Backer: backer@afrifund.com / Backer123!@#
3. **API Health**: `https://your-backend.railway.app/api/v1/campaigns`

---

## 📝 Test Accounts (Already Created)

These accounts exist in your database:

- **Creator**: test@afrifund.com / Test123!@# (KYC Approved)
- **Backer**: backer@afrifund.com / Backer123!@#
- **Admin**: admin@afrifund.com / Admin123!@#

**Test Campaign**: "Solar Power for Rural Communities" (Already ACTIVE)

---

## 🔒 Production Checklist

Before going live:

- [ ] Change all JWT secrets to strong random values
- [ ] Add real payment provider credentials
- [ ] Disable `MOCK_KYC_AUTO_APPROVE`
- [ ] Set up proper email service (SMTP)
- [ ] Add Redis service on Railway for better performance
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Add custom domain names

---

## 🆘 Troubleshooting

**Backend won't start:**
- Check `DATABASE_URL` is set correctly
- Check all required env vars are present
- View Railway logs for errors

**Frontend can't connect to backend:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend CORS settings (`FRONTEND_URL`)
- Test backend API directly in browser

**Database migration errors:**
- Railway runs migrations automatically via Procfile
- If issues, manually run: `npx prisma migrate deploy`

---

## 💰 Costs

**Railway Free Tier:**
- $5 free credits monthly
- Enough for development/testing
- ~500 hours of usage

**Vercel Free Tier:**
- 100GB bandwidth
- Unlimited deployments
- Perfect for hobby projects

Both platforms offer generous free tiers for MVP testing! 🎉
