# AfriFund Deployment Guide

## Current Deployment Status

**Branch:** `claude/afrifund-mvp-platform-01C4cTj3aRufHDrWzXQVFGKN`  
**Latest Commit:** `24fec2c` - Add admin user creation tools and SQL commands  
**Status:** ✅ Code pushed - Auto-deployment should trigger

---

## 🏗️ Deployment Architecture

### Backend - Render
- **URL:** https://afrifund-backend.onrender.com
- **Service:** afrifund-backend
- **Region:** Oregon (US West)
- **Database:** PostgreSQL (afrifund-db)
- **Health Check:** https://afrifund-backend.onrender.com/api/v1/health

### Frontend - Vercel
- **URL:** https://afrifund.vercel.app
- **Project:** afrifund
- **Region:** Washington D.C. (iad1)
- **Framework:** Next.js 15
- **Backend API:** https://afrifund-backend.onrender.com/api/v1

---

## 🚀 Automatic Deployment

Both platforms are configured for **automatic deployment** on git push.

✅ **Your latest changes are pushed** - Deployments should start automatically!

**Monitor deployments:**
- **Render:** https://dashboard.render.com/
- **Vercel:** https://vercel.com/dashboard

---

## 🔧 Manual Deployment (If Needed)

### Option 1: Render Dashboard
1. Go to: https://dashboard.render.com/
2. Find service: **afrifund-backend**
3. Click **"Manual Deploy"**
4. Select branch: `claude/afrifund-mvp-platform-01C4cTj3aRufHDrWzXQVFGKN`
5. Click **"Deploy"**

### Option 2: Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Find project: **afrifund**
3. Go to **"Deployments"** tab
4. Click **"Redeploy"** on latest deployment

### Option 3: Force Push to Trigger Deployment
```bash
git commit --allow-empty -m "Trigger deployment"
git push -u origin claude/afrifund-mvp-platform-01C4cTj3aRufHDrWzXQVFGKN
```

### Option 4: Using CLI Tools

**Vercel CLI:**
```bash
cd frontend
npx vercel --prod
```

**Render CLI:**
```bash
npm install -g @render/cli
render deploy --service afrifund-backend
```

---

## ✅ Deployment Verification

### 1. Check Backend Health
```bash
curl https://afrifund-backend.onrender.com/api/v1/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-25T...",
  "database": "connected"
}
```

### 2. Check Frontend
```bash
curl -I https://afrifund.vercel.app
```

**Expected:** `HTTP/2 200`

### 3. Test Admin Login

**Via Browser:**
1. Go to: https://afrifund.vercel.app/auth/login
2. Enter:
   - **Email:** `lekankolawolejohn@gmail.com`
   - **Password:** `Kolawolelekan@21`
3. Click **"Sign In"**
4. ✅ Should redirect to dashboard

**Via API:**
```bash
curl -X POST https://afrifund-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lekankolawolejohn@gmail.com",
    "password": "Kolawolelekan@21"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "email": "lekankolawolejohn@gmail.com",
    "role": "ADMIN",
    "isVerified": true
  },
  "accessToken": "eyJhbGci..."
}
```

---

## 📊 Deployment Timeline

**Typical deployment times:**

- **Vercel (Frontend):** 2-5 minutes
  - Install dependencies: 30-60s
  - Build Next.js: 60-90s
  - Deploy: 30-60s

- **Render (Backend):** 5-10 minutes
  - Install dependencies: 2-3 min
  - Prisma generate: 30-60s
  - Build NestJS: 2-3 min
  - Start server: 30s

⚠️ **Note:** Render free tier spins down after 15 min of inactivity. First request takes ~30-60s to wake up.

---

## 📝 Admin User Setup

**Credentials:**
- **Email:** lekankolawolejohn@gmail.com
- **Password:** Kolawolelekan@21
- **Role:** ADMIN

✅ **Already created via SQL** (user confirmed)

If login fails, see `CREATE_ADMIN_USER.md` for troubleshooting.

---

## 🔍 Monitoring Logs

### Render Logs
```bash
# Via Dashboard
https://dashboard.render.com/ → afrifund-backend → Logs

# Via API
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.render.com/v1/services/{serviceId}/logs
```

### Vercel Logs
```bash
# Via CLI
cd frontend
npx vercel logs afrifund --prod

# Via Dashboard
https://vercel.com/dashboard → afrifund → Deployments
```

---

## 🧪 Post-Deployment Testing

After deployment completes:

- [ ] Backend health endpoint responds
- [ ] Frontend loads without errors  
- [ ] Admin login works
- [ ] Database connection active
- [ ] Create test campaign
- [ ] Test donation flow
- [ ] Check mobile responsiveness
- [ ] Verify notifications work

---

## 🆘 Troubleshooting

### Backend Issues

**"Cannot reach database server"**
- Check Render dashboard → Environment → DATABASE_URL is set
- Verify database is running

**"Module not found" errors**
- Ensure build command includes: `npx prisma generate`
- Check `render.yaml` configuration

**"Port already in use"**
- Render sets PORT=10000 automatically
- Verify in environment variables

### Frontend Issues

**"NEXT_PUBLIC_API_URL is undefined"**
- Vercel → Project Settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL=https://afrifund-backend.onrender.com/api/v1`
- Redeploy

**"Network request failed"**
- Check backend is running
- Verify CORS configured for Vercel domain

### Admin Login Issues

**"Invalid credentials" after deployment:**

1. **Admin user not in production database**
   - Run SQL command on production DB (see CREATE_ADMIN_USER.md)
   - Or: `npm run prisma:seed` if backend has DB access

2. **Wrong DATABASE_URL**
   - Check Render environment variable
   - Verify points to production database

3. **Password hash mismatch**
   - Must use: `$2b$10$0OZMzwBasa/5QC5XI33C3epP3szorsxRx0LxnsSj6sTAs3gxTcbBm`

---

## 🔒 Environment Variables

### Backend (Render)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/afrifund
JWT_SECRET=<auto-generated>
JWT_EXPIRATION=7d
PORT=10000

# Optional: Real Payment Providers
FLUTTERWAVE_PUBLIC_KEY=<your-key>
FLUTTERWAVE_SECRET_KEY=<your-key>
PAYSTACK_PUBLIC_KEY=<your-key>
PAYSTACK_SECRET_KEY=<your-key>
MPESA_CONSUMER_KEY=<your-key>
MPESA_CONSUMER_SECRET=<your-key>
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://afrifund-backend.onrender.com/api/v1
NEXT_PUBLIC_APP_URL=https://afrifund.vercel.app
NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS=true
```

---

## 📚 Related Documentation

- `CREATE_ADMIN_USER.md` - Admin user creation guide
- `PAYMENT_CONFIG.md` - Payment provider setup
- `SEED_USERS.md` - Database seeding
- `render.yaml` - Render deployment config
- `frontend/vercel.json` - Vercel deployment config

---

## 🔗 Quick Links

- **Frontend:** https://afrifund.vercel.app
- **Backend:** https://afrifund-backend.onrender.com
- **Health Check:** https://afrifund-backend.onrender.com/api/v1/health
- **Login:** https://afrifund.vercel.app/auth/login
- **Render Dashboard:** https://dashboard.render.com/
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 💰 Free Tier Limits

**Render Free Tier:**
- 750 hours/month
- Auto-sleep after 15 min inactivity
- PostgreSQL: 1GB storage

**Vercel Free Tier:**
- 100GB bandwidth/month
- Unlimited deployments
- Unlimited team members

---

## 📞 Support

For deployment issues:

1. Check platform status pages
2. Review deployment logs
3. Verify environment variables
4. Test health endpoints
5. Check database connectivity

**Last Updated:** 2026-06-25  
**Commit:** 24fec2c
