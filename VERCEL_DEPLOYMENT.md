# 🚀 Vercel Deployment Guide

## Deploy Frontend to Vercel

### Prerequisites
- Backend deployed to Render (see RENDER_DEPLOYMENT.md)
- Backend URL: `https://afrifund-backend.onrender.com`

---

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to GitHub
Ensure your code is pushed to GitHub:
```bash
git status
git push origin claude/afrifund-mvp-platform-01C4cTj3aRufHDrWzXQVFGKN
```

### Step 2: Import to Vercel

1. **Go to Vercel**: https://vercel.com/new

2. **Import Git Repository**
   - Click "Add New Project"
   - Select your GitHub account
   - Choose `Afrifund` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_API_URL=https://afrifund-backend.onrender.com/api/v1
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxx
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
   NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS=true
   ```

   **Note**: Update `NEXT_PUBLIC_APP_URL` after first deployment when you know your Vercel URL

5. **Deploy**
   - Click "Deploy"
   - Wait for build (~2-3 minutes)
   - Your app will be live at: `https://your-project.vercel.app`

### Step 3: Update App URL

After first deployment:
1. Copy your Vercel URL (e.g., `https://afrifund.vercel.app`)
2. Go to Project Settings → Environment Variables
3. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
4. Redeploy (Vercel → Deployments → Redeploy)

---

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy from Frontend Directory
```bash
cd /home/user/Afrifund/frontend

# First deployment (creates project)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? afrifund (or your choice)
# - Directory? ./ (current directory)
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://afrifund-backend.onrender.com/api/v1

vercel env add NEXT_PUBLIC_APP_URL
# Enter: Will update after first deploy

vercel env add NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS
# Enter: true

# Deploy to production
vercel --prod
```

---

## Option 3: Quick Deploy Button

Add this to your repository README.md:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/Afrifund&root-directory=frontend&env=NEXT_PUBLIC_API_URL,NEXT_PUBLIC_APP_URL&envDescription=Required%20environment%20variables&envLink=https://github.com/YOUR_USERNAME/Afrifund/blob/main/VERCEL_DEPLOYMENT.md)
```

---

## Configuration Files (Optional)

### vercel.json (Already in frontend/)
```json
{
  "buildCommand": "cd frontend && npm run build",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs",
  "outputDirectory": "frontend/.next"
}
```

---

## Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://afrifund-backend.onrender.com/api/v1` | Backend API endpoint |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` | Your Vercel app URL |
| `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | `FLWPUBK_TEST-xxxxx` | Flutterwave test key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_test_xxxxx` | Paystack test key |
| `NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS` | `true` | Enable mock payments for testing |

**Important**: 
- All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never put sensitive secrets in `NEXT_PUBLIC_` variables
- Get real payment keys from Flutterwave/Paystack dashboards

---

## Post-Deployment

### Step 1: Test Your Deployment
```bash
# Test frontend
curl https://your-project.vercel.app

# Test API connection (check browser console)
# Open https://your-project.vercel.app
# Check Network tab for API calls
```

### Step 2: Custom Domain (Optional)
1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### Step 3: Enable Analytics (Optional)
1. Vercel dashboard → Your project → Analytics
2. Enable Vercel Analytics (free tier available)
3. Monitor page views, performance, and errors

---

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches and pull requests

Configure in: Project Settings → Git

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure Node version matches (check `package.json` engines field)

### API Connection Fails
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend
- Test backend health: `curl https://afrifund-backend.onrender.com/api/v1/health`

### Environment Variables Not Working
- Ensure variables are prefixed with `NEXT_PUBLIC_`
- Redeploy after adding/updating variables
- Clear browser cache

### Slow Initial Load
- Render free tier has cold starts (~30-60s)
- Consider upgrading Render to paid plan
- Or add a warm-up endpoint that pings backend periodically

---

## Performance Optimization

### Enable Edge Functions
Add to `next.config.js`:
```javascript
module.exports = {
  experimental: {
    runtime: 'edge',
  },
}
```

### Image Optimization
Vercel automatically optimizes images via Next.js Image component:
```jsx
import Image from 'next/image'
<Image src="/path" width={500} height={300} alt="..." />
```

---

## Free Tier Limits

Vercel Free Plan:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ HTTPS/SSL automatic
- ✅ Preview deployments
- ✅ Global CDN
- ⚠️ 6000 build minutes/month
- ⚠️ 100GB-hours serverless function execution

---

## Next Steps

1. ✅ Frontend deployed to Vercel
2. ✅ Backend running on Render
3. ⏭️ Test complete user flow
4. ⏭️ Configure payment providers
5. ⏭️ Add custom domain
6. ⏭️ Set up monitoring and analytics

---

**Your Live Application**:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://afrifund-backend.onrender.com`
- API Docs: `https://afrifund-backend.onrender.com/api`

🎉 **Your AfriFund MVP is now live!**
