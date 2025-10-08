# Deployment Options - Best Choices for Your Project

**By Victor Jotham Ashioya**  
**Project:** Data Centers Are Eating The World

---

## 🎯 Recommended Stack (ALL FREE!)

### Option A: Full Free Tier (Recommended) ⭐

| Component | Service | Free Tier | Why? |
|-----------|---------|-----------|------|
| **Frontend** | Vercel | Unlimited | Perfect for Vite/React, auto-deploy from GitHub |
| **Backend** | Railway | 500 hours/month | Easy PostgreSQL integration, $5 credit |
| **Database** | Railway PostgreSQL | Included | Same platform as backend, 1GB storage |
| **Domain** | Vercel | yourproject.vercel.app | Free subdomain |
| **Scraper** | GitHub Actions | 2000 min/month | Automated weekly runs |

**Total Cost:** $0/month (within free tiers)  
**Setup Time:** 30 minutes  
**Difficulty:** ⭐⭐ (Easy)

---

### Option B: Premium Free Tier (Alternative)

| Component | Service | Free Tier | Why? |
|-----------|---------|-----------|------|
| **Frontend** | Netlify | 100GB bandwidth | Great CI/CD, similar to Vercel |
| **Backend** | Render | 750 hours/month | Easy to use, generous free tier |
| **Database** | Supabase | 500MB | PostgreSQL + PostGIS built-in! |
| **Scraper** | Manual | Run locally | Cron job on your machine |

**Total Cost:** $0/month  
**Setup Time:** 45 minutes  
**Difficulty:** ⭐⭐⭐ (Medium)

---

## 🚀 Detailed Deployment Guide - Option A (Recommended)

### Step 1: Create GitHub Repository (5 minutes)

```bash
cd C:\Users\HomePC\data_centers_mapping

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial release: Data Centers Are Eating The World by Victor Jotham Ashioya"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/ashioyajotham/data_centers_mapping.git
git branch -M main
git push -u origin main
```

**Important:** Don't commit `.env` files (already in .gitignore ✅)

---

### Step 2: Deploy Backend to Railway (10 minutes)

1. **Sign up:** https://railway.app (use GitHub login)

2. **Create New Project:**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your `data_centers_mapping` repo
   - Select service: **Backend**

3. **Configure:**
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`

4. **Add PostgreSQL:**
   - In your project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will auto-provision and connect it

5. **Environment Variables:**
   Railway auto-sets:
   - `DATABASE_URL` (from PostgreSQL plugin)
   - `PORT` (auto-assigned)
   
   You add:
   - `NODE_ENV` = `production`

6. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Copy your backend URL: `https://your-project.railway.app`

7. **Setup Database:**
   - In Railway, click on PostgreSQL
   - Click "Query" tab
   - Paste contents of `backend/src/db/schema.sql`
   - Run it!

---

### Step 3: Deploy Frontend to Vercel (5 minutes)

1. **Sign up:** https://vercel.com (use GitHub login)

2. **Import Project:**
   - Click "Add New" → "Project"
   - Import your GitHub repo
   - Select `frontend` as root directory

3. **Configure Build:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables:**
   Add these in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend.railway.app
   VITE_MAPBOX_TOKEN=your_actual_mapbox_token
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2 minutes
   - Your site will be live at: `https://data-centers-mapping.vercel.app`

---

### Step 4: Seed Production Database (2 minutes)

**From your local machine:**

```bash
# Update backend/.env with Railway database URL
DATABASE_URL=postgresql://user:pass@railway.host:5432/dbname

# Run seed
cd backend
npm run db:seed

# Run scraper to populate
cd ../scraper
# Update scraper/.env with Railway database URL
python main.py
```

**Or use Railway CLI:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Seed database
cd backend
railway run npm run db:seed
```

---

### Step 5: Setup Automated Scraping (5 minutes)

**GitHub Actions** (already configured in `.github/workflows/scraper.yml`)

1. **Add Secrets to GitHub:**
   - Go to your repo → Settings → Secrets
   - Add `DATABASE_URL` (your Railway PostgreSQL URL)
   - Add `USER_AGENT`

2. **Enable Workflow:**
   - The workflow runs every Monday at 2 AM UTC
   - Or manually trigger: Actions → Run workflow

---

## 🎯 After Deployment Checklist

### Test Your Production Site:

- [ ] Visit your Vercel URL
- [ ] Map loads with markers ✅
- [ ] Click markers → detail panel works ✅
- [ ] Filters work ✅
- [ ] Export buttons work ✅
- [ ] Dashboard shows stats ✅
- [ ] Admin requires password ✅
- [ ] All pages load ✅

### Update Links:

**In your code (optional for next version):**
- Update About page URLs to point to production
- Add production URL to README

---

## 💰 Cost Breakdown

### Free Tier Limits:

**Vercel:**
- ✅ Unlimited bandwidth for personal projects
- ✅ 100GB bandwidth/month commercial
- ✅ Auto SSL certificate
- ✅ Global CDN

**Railway:**
- ✅ $5 free credit (500 hours backend runtime)
- ✅ 1GB PostgreSQL storage
- ✅ 100GB bandwidth
- ⚠️ After $5 credit: ~$5-10/month

**GitHub Actions:**
- ✅ 2000 minutes/month free
- ✅ Enough for weekly scraping

**Total: $0-5/month** (after Railway credit expires)

---

## 🔒 Security Before Going Public

### 1. Change Admin Password

Edit `frontend/src/components/ProtectedRoute.tsx`:
```typescript
const ADMIN_PASSWORD = 'YOUR_STRONG_PASSWORD_HERE'
```

Or use environment variable:
```typescript
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD
```

Then add to Vercel:
```
VITE_ADMIN_PASSWORD=your_secure_password
```

### 2. Add Rate Limiting (Optional)

In `backend/src/index.ts`, add:
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

app.use('/api/', limiter)
```

### 3. Enable CORS for Your Domain

In `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: 'https://your-site.vercel.app'
}))
```

---

## 📊 Alternative Options (If You Prefer)

### Option C: All-in-One Platform

**Render (Easier, Single Platform)**
- Frontend + Backend + Database all on Render
- Free tier: 750 hours/month
- Easier management (one dashboard)
- Slightly slower cold starts

### Option D: Self-Hosted VPS

**DigitalOcean/Hetzner ($5-10/month)**
- Full control
- Better for learning DevOps
- More setup required
- See `docs/DEPLOYMENT.md` for full guide

### Option E: Supabase + Vercel

**For Database-Heavy Projects**
- Supabase: PostgreSQL + Auth + Storage
- Vercel: Frontend + Serverless API
- Great combo, but needs refactoring

---

## 🎓 My Recommendation for You

### Phase 1: Deploy NOW (Option A)
- **Frontend:** Vercel (5 minutes)
- **Backend:** Railway (10 minutes)
- **Database:** Railway PostgreSQL (included)
- **Scraper:** Run locally for now

**Why?** 
- Fastest to production
- Free
- Professional domains
- Easy to manage

### Phase 2: After Launch (Optimize)
- Add GitHub Actions scraper
- Add rate limiting
- Consider paid Railway if needed
- Monitor usage

---

## 🚀 Quick Start Deployment (30 Minutes)

**Let's do it right now!**

### Step 1: GitHub (First)
```bash
# If not already done
cd C:\Users\HomePC\data_centers_mapping
git init
git add .
git commit -m "Production ready: Data Centers mapping platform by Victor Jotham Ashioya"
```

Create repo on GitHub, then push.

### Step 2: Railway (Backend + DB)
1. Sign up at railway.app
2. New Project → From GitHub
3. Add PostgreSQL
4. Deploy!

### Step 3: Vercel (Frontend)
1. Sign up at vercel.com
2. Import GitHub repo
3. Set root to `frontend`
4. Add env vars
5. Deploy!

### Step 4: Seed Database
Use Railway CLI or update local DATABASE_URL to Railway's.

---

## 📞 Need Help Deploying?

I can walk you through each step! 

**Ready to start?** Let's begin with GitHub! Want me to help you commit and push to GitHub first? 🎯

