# Vercel Deployment Guide for Mate Music Search Engine

## 🚀 Quick Setup

### Vercel Framework Settings
When deploying to Vercel, set the following in your project settings:

**Framework Preset:** `Other` (Do NOT select Vite, React, or Express)

**Build Settings:**
- Build Command: `npm run build` (or leave empty to use package.json default)
- Output Directory: `dist/public`
- Install Command: `npm install`

---

## 📋 Environment Variables

Set these in your Vercel project settings (Settings > Environment Variables):

### ⚠️ CRITICAL - Required for Search to Work:
```bash
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

### 🎵 Music Search API Keys (At least ONE required for search results):
Without these, search will return **NO RESULTS**. Set at least one:

```bash
# Option 1: YouTube (Recommended - Best coverage)
YOUTUBE_API_KEY=your_youtube_api_key

# Option 2: SoundCloud (Good alternative)
SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id

# Option 3: RapidAPI (Deezer, Spotify results)
RAPIDAPI_KEY=your_rapidapi_key
```

**How to get API keys:**
- **YouTube API:** [Google Cloud Console](https://console.cloud.google.com/) → Enable YouTube Data API v3
- **SoundCloud:** [SoundCloud Developers](https://developers.soundcloud.com/)
- **RapidAPI:** [RapidAPI Deezer](https://rapidapi.com/deezerdevs/api/deezer-1)

### 🤖 AI Features (Optional):
```bash
OPENAI_API_KEY=your_openai_api_key        # For AI vibe matching & suggestions
JAMENDO_CLIENT_ID=your_jamendo_client_id  # Additional music source
SESSION_SECRET=your_random_secret_string  # For secure sessions
```

**⚠️ Important Note on AI Features:**
- AI search suggestions and music recommendations use free external AI APIs
- These free endpoints are **unreliable** and may not work on Vercel
- For production AI features, you **must** set `OPENAI_API_KEY`
- Without OpenAI key: AI suggestions will gracefully fail (returning empty results)
- The core search functionality works independently of AI features

**Generate SESSION_SECRET:**
```bash
openssl rand -base64 32
```

### 🚨 Important Notes:
- **Without music API keys, search won't work on Vercel!**
- The app uses free APIs as fallbacks (Jamendo, Internet Archive, Mixcloud)
- For best results, configure at least YouTube or SoundCloud API keys

---

## ⚙️ Configuration Files

Your project is already configured with:

1. **`vercel.json`** - Defines build and routing configuration
   - Builds the frontend as static site
   - Builds API routes as serverless functions
   - Rewrites API calls to `/api/index`
   - Routes all other requests to `index.html` (SPA routing)

2. **`package.json`** - Has `vercel-build` script that runs `vite build`

3. **`api/index.ts`** - Serverless function for API routes

---

## 🔧 How It Works

### Architecture:
```
Vercel Deployment
├── Frontend (Static Site)
│   └── Built by Vite → dist/public/
│       ├── index.html
│       ├── assets/
│       └── ...
│
└── Backend (Serverless Functions)
    └── api/index.ts
        ├── Express app
        └── All /api/* routes
```

### Request Flow:
1. **API requests** (`/api/*`) → Routed to `api/index.ts` serverless function
2. **Static assets** (`/assets/*`) → Served from `dist/public/`
3. **All other routes** → Served `index.html` (React Router handles routing)

---

## 🚨 Common Issues & Fixes

### Issue 1: Site Shows Raw Code Instead of Rendering
**Cause:** Wrong framework preset or incorrect vercel.json configuration

**Fix:**
- Set Framework Preset to **"Other"** in Vercel dashboard
- Ensure `vercel.json` has correct `rewrites` configuration (already done ✅)
- Verify build output directory is `dist/public`

### Issue 2: API Routes Return 404
**Cause:** API rewrites not working

**Fix:**
- Check that `api/index.ts` exists and exports a handler
- Verify `rewrites` section in `vercel.json` includes `/api/(.*)`
- Ensure `@vercel/node` is in dependencies (already done ✅)

### Issue 3: SPA Routes Return 404 on Refresh
**Cause:** Missing catch-all route

**Fix:**
- Already configured in `vercel.json` with catch-all route to `index.html` ✅

### Issue 4: Database Connection Errors
**Cause:** DATABASE_URL not set or incorrect

**Fix:**
1. Add DATABASE_URL to Vercel environment variables
2. Use PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.)
3. Run database migrations: `npm run db:push`

### Issue 5: PostCSS Warnings
**Cause:** Configuration conflict

**Fix:**
- Keep Tailwind v3 (already configured ✅)
- Use standard `postcss.config.js` with tailwindcss plugin ✅

### Issue 6: Search Returns No Results on Vercel
**Cause:** Missing API keys or CORS issues

**Fix:**
1. **Add at least ONE music API key:**
   - YouTube API key (recommended) OR
   - SoundCloud Client ID
   
2. **Free APIs that work without keys:**
   - Jamendo (always works ✅)
   - Internet Archive (always works ✅)
   - Mixcloud (always works ✅)

3. **Check Vercel deployment logs:**
   - Look for API errors or timeout issues
   - Ensure all environment variables are set

4. **CORS is now configured** - The API handler sets proper CORS headers ✅

---

## 📦 Deployment Steps

### Option 1: GitHub Integration (Recommended)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Set Framework Preset to **"Other"**
   - Add environment variables (DATABASE_URL, etc.)
   - Click **"Deploy"**

3. **Post-deployment:**
   - Your app will be live at `https://your-project.vercel.app`
   - Set up database if needed (see below)

### Option 2: Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow prompts to configure project**

---

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Easiest)

1. Go to your Vercel project
2. Click "Storage" tab
3. Click "Create Database" → "Postgres"
4. Database URL will be automatically added to environment variables
5. Push schema: `npm run db:push`

### Option 2: External Database (Neon, Supabase)

1. Create a PostgreSQL database at:
   - [Neon](https://neon.tech) (recommended - free tier)
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app)

2. Copy the connection string

3. Add to Vercel environment variables:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
   ```

4. Push schema from your local machine:
   ```bash
   DATABASE_URL="your_connection_string" npm run db:push
   ```

---

## ✅ Pre-Deployment Checklist

- [ ] Set Framework Preset to **"Other"** in Vercel
- [ ] Add DATABASE_URL environment variable
- [ ] Add SESSION_SECRET environment variable
- [ ] Add API keys (YOUTUBE_API_KEY, OPENAI_API_KEY, etc.)
- [ ] Verify `vercel.json` configuration
- [ ] Test build locally: `npm run build`
- [ ] Push database schema: `npm run db:push`

---

## 🎯 Expected Result

After successful deployment:

1. **Frontend:** Beautiful music search interface at `https://your-project.vercel.app`
2. **API Routes:** Working at `https://your-project.vercel.app/api/*`
3. **Database:** Connected and tables created
4. **Features:**
   - Multi-platform music search ✅
   - AI mode ✅
   - Web search with "/" prefix ✅
   - Library management ✅
   - Lyrics display ✅

---

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs in dashboard
2. Verify all environment variables are set
3. Test API routes: `https://your-project.vercel.app/api/health`
4. Check browser console for frontend errors

---

**Remember:** Always set Framework Preset to **"Other"** - not Vite, React, or Express!
