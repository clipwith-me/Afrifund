# 🚀 Deploy AfriFund to Render + Vercel - Quick Start

## ✅ What's Ready
- ✅ Deployment configurations created
- ✅ Code pushed to GitHub
- ✅ Environment variables pre-configured
- ✅ Health checks enabled

---

## 📋 Deployment Steps (15 minutes total)

### Step 1: Deploy Backend to Render (5 minutes)

**🔗 One-Click Deploy:**
1. Go to: https://dashboard.render.com/
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository: `Afrifund`
4. Render will detect `render.yaml` and show:
   - ✅ PostgreSQL database (`afrifund-db`)
   - ✅ Web service (`afrifund-backend`)
5. Click **"Apply"**
6. Wait ~5 minutes for deployment

**Your backend will be live at**: `https://afrifund-backend.onrender.com`

**⚠️ Important**: After deployment, run migrations (see Step 3)

---

### Step 2: Deploy Frontend to Vercel (3 minutes)

**🔗 One-Click Deploy:**
1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your GitHub repository: `Afrifund`
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js (auto-detected)
5. Add environment variables (copy from below):
   ```
   NEXT_PUBLIC_API_URL=https://afrifund-backend.onrender.com/api/v1
   NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS=true
   ```
6. Click **"Deploy"**
7. Wait ~2-3 minutes

**Your frontend will be live at**: `https://afrifund-XXXXX.vercel.app`

**After deployment:**
- Copy your Vercel URL
- Go to Vercel → Project Settings → Environment Variables
- Add: `NEXT_PUBLIC_APP_URL=https://your-actual-vercel-url.vercel.app`
- Redeploy

---

### Step 3: Run Database Migrations (2 minutes)

**Via Render Dashboard:**
1. Go to your Render service: `afrifund-backend`
2. Click **"Shell"** tab
3. Run:
   ```bash
   npx prisma migrate deploy
   ```
4. Wait for migrations to complete (~1 minute)

**Expected output:**
```
✅ Migration completed successfully
✅ All tables created
```

---

### Step 4: Test Your Deployment (2 minutes)

**Test Backend:**
```bash
curl https://afrifund-backend.onrender.com/api/v1/health
```

**Expected response:**
```json
{
  "status": "ok",
  "database": "connected",
  "environment": "production"
}
```

**Test Frontend:**
- Open: `https://your-project.vercel.app`
- You should see the AfriFund homepage
- Try creating an account
- Check browser console for API connection

---

## 🎉 You're Live!

Your AfriFund MVP is now deployed:
- **Frontend**: https://your-project.vercel.app
- **Backend**: https://afrifund-backend.onrender.com
- **Database**: PostgreSQL on Render

---

## 📚 Detailed Documentation

For more details, see:
- Backend deployment: `RENDER_DEPLOYMENT.md`
- Frontend deployment: `VERCEL_DEPLOYMENT.md`

---

## ⚠️ Important Notes

### Free Tier Limitations
- **Render**: Service spins down after 15 min inactivity (cold starts ~30-60s)
- **Vercel**: 100GB bandwidth/month

### Payment Configuration
To enable real payments (not mock):
1. Get API keys from:
   - Flutterwave: https://dashboard.flutterwave.com
   - Paystack: https://dashboard.paystack.com
2. Update Vercel environment variables:
   ```
   NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-key
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your-key
   NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS=false
   ```
3. Redeploy on Vercel

---

## 🆘 Troubleshooting

**Backend not responding:**
- Wait 60 seconds (cold start on free tier)
- Check Render logs: Dashboard → afrifund-backend → Logs

**Frontend can't connect to backend:**
- Verify `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Check browser console for CORS errors
- Test backend health endpoint

**Database errors:**
- Ensure migrations ran successfully
- Check Render → afrifund-db → Status

**Build fails:**
- Check build logs in Render/Vercel dashboards
- Ensure all dependencies are in `package.json`

---

## 🚀 Next Steps

After successful deployment:
1. ✅ Test user registration and login
2. ✅ Create a test campaign
3. ✅ Test payment flow (mock mode)
4. ✅ Configure custom domain (optional)
5. ✅ Set up monitoring and analytics
6. ✅ Get real payment provider keys
7. ✅ Invite beta users

---

**Need help?** Check the detailed guides:
- `RENDER_DEPLOYMENT.md`
- `VERCEL_DEPLOYMENT.md`

**Ready to deploy?** Start with Step 1 above! 🚀
