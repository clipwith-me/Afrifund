# 🚀 Quick Deploy Guide (5 Minutes)

## Backend (Railway)

1. **Go to**: https://railway.app
2. **Login** with GitHub
3. **Click**: "New Project" → "Deploy from GitHub repo"
4. **Select**: Your `Afrifund` repository
5. **Settings** → Root Directory: `backend`
6. **Add Database**: Click "+" → PostgreSQL
7. **Copy** your Railway app URL (e.g., `https://afrifund-backend.railway.app`)

## Frontend (Vercel)

1. **Go to**: https://vercel.com
2. **Login** with GitHub
3. **Click**: "Add New Project" → Import `Afrifund` repo
4. **Configure**:
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detected)
5. **Environment Variables** (click "Add" for each):
   ```
   NEXT_PUBLIC_API_URL = https://YOUR-RAILWAY-URL/api/v1
   NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
   NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS = true
   ```
6. **Click**: "Deploy"
7. **Copy** your Vercel URL

## Final Step: Connect Them

1. **Back to Railway**:
   - Variables tab
   - Add: `FRONTEND_URL = https://YOUR-VERCEL-URL`
   - Click "Redeploy"

2. **Done!** Visit your Vercel URL 🎉

---

## ✅ Test It

Visit: `https://your-app.vercel.app`

**Login with**:
- Email: test@afrifund.com
- Password: Test123!@#

---

## 📱 Your Live URLs

After deployment, you'll have:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **API Docs**: `https://your-app.railway.app/api/v1/campaigns`

Both will be publicly accessible! 🌍
