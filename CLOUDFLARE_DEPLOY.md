# Deploying Mate Music Search to Cloudflare Pages

This guide walks you through deploying the Mate music search engine to Cloudflare Pages with full functionality.

## Prerequisites

- Cloudflare account (free tier works)
- GitHub account
- Git installed locally
- Node.js 20+ installed

## Architecture Overview

**What's been converted:**
- ✅ React frontend → Static site (served by Cloudflare Pages)
- ✅ Express API → Cloudflare Pages Functions (using Hono framework)
- ✅ PostgreSQL database → Cloudflare D1 (SQLite-based)
- ✅ Music search, AI features, library management → All working on Cloudflare

## Step 1: Set Up Cloudflare D1 Database

### 1.1 Install Wrangler CLI

```bash
npm install -g wrangler
```

### 1.2 Login to Cloudflare

```bash
wrangler login
```

### 1.3 Create D1 Database

```bash
# Create the database
wrangler d1 create mate-music-db

# Copy the database_id from the output and update wrangler.toml
```

Update `wrangler.toml` with your database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "mate-music-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with actual ID
```

### 1.4 Create Database Schema

Generate migrations:

```bash
npx drizzle-kit generate --config=drizzle.config.d1.ts
```

Apply migrations locally (for testing):

```bash
wrangler d1 migrations apply mate-music-db --local
```

Apply migrations to production:

```bash
wrangler d1 migrations apply mate-music-db
```

### 1.5 Seed Default User (Required)

The application requires a default user for library functionality. Seed the database:

```bash
# Seed both local and production databases
npm run db:seed:d1
```

Or manually:

```bash
# Seed local database
wrangler d1 execute mate-music-db --local --file=./server/db/seed.sql

# Seed production database
wrangler d1 execute mate-music-db --file=./server/db/seed.sql
```

**Important:** This step is required before the library features (playlists, liked songs, saved songs) will work.

## Step 2: Configure Environment Variables

### 2.1 Optional API Keys

These API keys enhance functionality but are optional:

- `YOUTUBE_API_KEY` - YouTube Data API v3 (for YouTube search)
- `SOUNDCLOUD_CLIENT_ID` - SoundCloud API (for SoundCloud search)
- `OPENAI_API_KEY` - OpenAI API (for premium AI features)

Without these keys, the app will use:
- Free music sources: Jamendo, Internet Archive, Mixcloud
- Free AI APIs for suggestions

### 2.2 Set Environment Variables in Cloudflare

In Cloudflare Dashboard:
1. Go to **Workers & Pages** → Your project → **Settings** → **Environment variables**
2. Add variables for both Production and Preview:

```
YOUTUBE_API_KEY=your_key_here (optional)
SOUNDCLOUD_CLIENT_ID=your_key_here (optional)
OPENAI_API_KEY=your_key_here (optional)
```

## Step 3: Build and Deploy

### 3.1 Build the Application

```bash
npm run build
```

This creates:
- `dist/public/` - Static frontend files
- `functions/` - API endpoints

### 3.2 Deploy via Wrangler

```bash
npm run cf:deploy
```

Or manually:

```bash
wrangler pages deploy dist/public --project-name=mate-music-search
```

### 3.3 Deploy via GitHub (Alternative)

1. Push your code to GitHub:

```bash
git add .
git commit -m "Cloudflare deployment ready"
git push origin main
```

2. In Cloudflare Dashboard:
   - Go to **Workers & Pages** → **Create application** → **Pages**
   - Click **Connect to Git**
   - Select your repository
   - Configure build settings:
     - **Build command:** `npm run build`
     - **Build output directory:** `dist/public`
     - **Root directory:** (leave empty)
   - Add environment variables (if any)
   - Click **Save and Deploy**

3. Bind D1 Database:
   - Go to **Settings** → **Functions** → **D1 database bindings**
   - Add binding: `DB` → Select `mate-music-db`
   - Save

## Step 4: Verify Deployment

### 4.1 Check Your Site

Visit your Cloudflare Pages URL (e.g., `mate-music-search.pages.dev`)

### 4.2 Test Functionality

- ✅ Search for music (try "lo-fi beats")
- ✅ Enable AI mode toggle
- ✅ Web search (add "/" prefix to query)
- ✅ Create a playlist
- ✅ Like songs
- ✅ Save songs for later
- ✅ View lyrics for songs

### 4.3 Check Functions Logs

In Cloudflare Dashboard:
1. Go to your Pages project
2. Click **Functions** tab
3. View real-time logs and analytics

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain

1. Go to your Pages project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `music.example.com`)
4. Follow DNS instructions

### 5.2 DNS Configuration

Add CNAME record:
```
music.example.com → mate-music-search.pages.dev
```

SSL certificate is automatically provisioned.

## Local Development

### Using Wrangler Dev

```bash
# Build frontend first
npm run build

# Start local Cloudflare Pages dev server
npm run cf:dev
```

Visit `http://localhost:8788`

### Using Original Dev Server (Replit)

```bash
npm run dev
```

Visit `http://localhost:5000`

## Troubleshooting

### Functions Not Working

**Problem:** API endpoints returning 404
**Solution:** 
1. Ensure `functions/` directory is in your repository
2. Check D1 database binding in Cloudflare dashboard
3. Verify environment variables are set

### Database Errors

**Problem:** "D1_ERROR: no such table"
**Solution:**
```bash
# Apply migrations to production
wrangler d1 migrations apply mate-music-db
```

### Build Failures

**Problem:** Build fails during deployment
**Solution:**
1. Check build logs in Cloudflare Dashboard
2. Ensure all dependencies are in `package.json`
3. Try building locally: `npm run build`

### API Keys Not Working

**Problem:** YouTube/SoundCloud not returning results
**Solution:**
1. Verify environment variables are set in Cloudflare
2. Check API key validity
3. App falls back to free sources (Jamendo, Internet Archive)

## Performance Optimization

### Caching

Cloudflare Pages automatically caches static assets. For API responses:

```typescript
// In your function
return new Response(JSON.stringify(data), {
  headers: {
    'Cache-Control': 'public, max-age=300', // 5 minutes
  },
});
```

### Database Query Optimization

D1 queries are fast, but for high traffic:
1. Use Cloudflare KV for frequently accessed data
2. Implement request caching in Workers
3. Use Durable Objects for real-time features

## Cost Estimate

Cloudflare Pages is extremely generous:

**Free Tier Includes:**
- Unlimited requests
- Unlimited bandwidth
- 500 builds/month
- 100,000 D1 reads/day
- 50,000 D1 writes/day

**Paid Plan ($20/month):**
- Everything in free tier
- Unlimited builds
- Advanced analytics
- Higher D1 limits

**Typical usage for this app:** Free tier is sufficient for most use cases.

## Migration from Replit

If you're migrating from Replit to Cloudflare:

1. ✅ Code is already converted
2. ❌ No need to export PostgreSQL data (fresh D1 database)
3. ✅ All features work the same way
4. ✅ Faster global performance (Cloudflare edge network)

## Support

- **Cloudflare Docs:** https://developers.cloudflare.com/pages/
- **D1 Documentation:** https://developers.cloudflare.com/d1/
- **Hono Framework:** https://hono.dev/

## Next Steps

- [ ] Set up custom domain
- [ ] Add analytics tracking
- [ ] Configure cache headers
- [ ] Set up staging environment
- [ ] Add CI/CD pipeline
- [ ] Monitor D1 usage

---

**Congratulations!** Your music search engine is now running on Cloudflare's global edge network. 🎵
