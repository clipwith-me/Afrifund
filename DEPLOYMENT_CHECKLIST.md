# 🚀 AfriFund Deployment Checklist

## ✅ Backend (Railway)

### 1. Create Railway Project
- [ ] Go to https://railway.app
- [ ] Sign in with GitHub
- [ ] Click "New Project" → "Deploy from GitHub repo"
- [ ] Select `clipwith-me/Afrifund` repository
- [ ] Choose branch: `claude/afrifund-mvp-platform-01C4cTj3aRufHDrWzXQVFGKN`

### 2. Configure Service
- [ ] Click on the created service
- [ ] Go to Settings → Root Directory
- [ ] Enter: `backend`
- [ ] Save

### 3. Add PostgreSQL
- [ ] Click "+ New" in project
- [ ] Select "Database" → "PostgreSQL"
- [ ] Wait for database to provision
- [ ] `DATABASE_URL` will be auto-added to variables

### 4. Add Environment Variables
Copy from `railway-env-template.txt` and add to Railway Variables tab:
- [ ] NODE_ENV=production
- [ ] PORT=3001
- [ ] API_PREFIX=api/v1
- [ ] JWT_SECRET (use strong random string!)
- [ ] JWT_REFRESH_SECRET (use strong random string!)
- [ ] FRONTEND_URL (update after Vercel deployment)
- [ ] All other variables from template

### 5. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Check logs for any errors
- [ ] Copy your Railway URL (e.g., `https://afrifund-production.up.railway.app`)

### 6. Test Backend
- [ ] Visit: `https://your-railway-url.railway.app/api/v1/campaigns`
- [ ] Should return `[]` (empty array) or test campaign data

---

## ✅ Frontend (Vercel)

### 1. Create Vercel Project
- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub
- [ ] Click "Add New Project"
- [ ] Import `clipwith-me/Afrifund` repository

### 2. Configure Project
- [ ] Framework: Next.js (auto-detected)
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm run build` (auto)
- [ ] Output Directory: `.next` (auto)

### 3. Add Environment Variables
- [ ] NEXT_PUBLIC_API_URL = `https://your-railway-url.railway.app/api/v1`
- [ ] NEXT_PUBLIC_APP_URL = `https://your-app.vercel.app`
- [ ] NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS = `true`
- [ ] NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY = `FLWPUBK_TEST-mock`
- [ ] NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = `pk_test_mock`

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (should succeed now!)
- [ ] Copy your Vercel URL (e.g., `https://afrifund.vercel.app`)

### 5. Test Frontend
- [ ] Visit your Vercel URL
- [ ] Homepage should load
- [ ] Click "Campaigns" - should load (empty or with test data)

---

## 🔗 Connect Frontend & Backend

### 1. Update Railway FRONTEND_URL
- [ ] Go to Railway → Your Service → Variables
- [ ] Update `FRONTEND_URL` to your Vercel URL
- [ ] Click "Redeploy"

### 2. Update Vercel API_URL (if needed)
- [ ] Go to Vercel → Settings → Environment Variables
- [ ] Verify `NEXT_PUBLIC_API_URL` points to your Railway URL
- [ ] Redeploy if you made changes

---

## 🧪 Test Complete Application

### 1. Test Authentication
- [ ] Go to `https://your-vercel-url.vercel.app/auth/login`
- [ ] Login with: `test@afrifund.com` / `Test123!@#`
- [ ] Should redirect to dashboard

### 2. Test Dashboard
- [ ] Dashboard loads with user info
- [ ] Campaign "Solar Power for Rural Communities" visible
- [ ] Stats show: $97 raised

### 3. Test Campaign Pages
- [ ] Visit `/campaigns`
- [ ] Click on "Solar Power for Rural Communities"
- [ ] Campaign detail page loads
- [ ] Donation button visible

### 4. Test Donation Flow
- [ ] Logout, login as: `backer@afrifund.com` / `Backer123!@#`
- [ ] Go to campaign detail
- [ ] Click "Back This Project"
- [ ] Enter amount (e.g., $50)
- [ ] Click "Donate Now"
- [ ] Mock payment page should open
- [ ] Complete payment
- [ ] Check dashboard for certificate

---

## 🎉 Success Criteria

All these should work:
- ✅ Backend API responds on Railway
- ✅ Frontend loads on Vercel
- ✅ Login/Registration works
- ✅ Dashboard displays data
- ✅ Campaigns are visible
- ✅ Donation flow completes
- ✅ Certificates are generated

---

## 🔧 Troubleshooting

### Backend Issues
- **Build fails**: Check root directory is set to `backend`
- **Database errors**: Ensure PostgreSQL service is connected
- **CORS errors**: Verify `FRONTEND_URL` matches your Vercel URL exactly

### Frontend Issues
- **Build fails**: Check error logs, may need to fix TypeScript/ESLint errors
- **API not connecting**: Verify `NEXT_PUBLIC_API_URL` is correct
- **Blank pages**: Check browser console for errors

### Both Services
- **502 errors**: Services may still be deploying, wait a minute
- **Environment variables**: Double-check all required vars are set
- **Logs**: Always check deployment logs for specific errors

---

## 📱 Your Live URLs

After successful deployment:

**Frontend**: https://your-app.vercel.app
**Backend**: https://your-app.railway.app
**API**: https://your-app.railway.app/api/v1/campaigns

**Test Accounts**:
- Creator: test@afrifund.com / Test123!@#
- Backer: backer@afrifund.com / Backer123!@#
- Admin: admin@afrifund.com / Admin123!@#

---

## 🎯 Next Steps After Deployment

1. **Test all features thoroughly**
2. **Update JWT secrets** with strong random values
3. **Add custom domain** (optional)
4. **Set up monitoring** (Railway and Vercel both have built-in monitoring)
5. **Configure production payment providers** when ready
6. **Disable mock KYC** for production (`MOCK_KYC_AUTO_APPROVE=false`)
7. **Set up email service** for notifications

---

## 💰 Cost Estimate

**Railway Free Tier**: $5 credit/month (~500 hours)
**Vercel Free Tier**: Unlimited for personal projects

Both are FREE for development and testing! 🎉
