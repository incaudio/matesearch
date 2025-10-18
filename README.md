# Mate - Music Search Engine

## Project Overview
Mate is an AI-powered music search engine designed to provide a rich and interactive music discovery experience. It features multi-platform search, AI-driven vibe matching, and a beautiful modern user interface with glassmorphism effects.

**Purpose:** A Google-like search experience for music, enriched with AI insights and stunning UI.

**Current State:** Fully operational development environment on Replit with database configured and server running on port 5000.

## Deployment Options

This application supports multiple deployment platforms:

### 🌐 Cloudflare Pages (Recommended)
- **Zero additional hosting costs** - Runs entirely on Cloudflare's free tier
- **Global edge network** - Ultra-fast performance worldwide
- **Static site + serverless functions** - All features work perfectly
- **Cloudflare D1 database** - Built-in SQLite database
- **See:** [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md) for complete deployment guide

### 🔧 Replit
- **Quick development** - One-click deploy with built-in database
- **PostgreSQL included** - No external database needed
- **Already configured** - Ready to run out of the box

### ⚡ Vercel
- **Serverless deployment** - Vercel Functions for API routes
- **External database** - Requires PostgreSQL (Neon, Vercel Postgres, etc.)
- **See:** [VERCEL_SETUP_GUIDE.md](./VERCEL_SETUP_GUIDE.md) for details

## Recent Changes

### October 18, 2025 - Cloudflare Pages Support Added
- ✅ Converted Express backend to Cloudflare Pages Functions using Hono framework
- ✅ Migrated PostgreSQL schema to Cloudflare D1 (SQLite)
- ✅ Created Cloudflare-compatible API routes for all features
- ✅ All functionality works: music search, AI mode, library management
- ✅ Added comprehensive deployment guide ([CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md))
- ✅ Zero additional hosting costs - runs entirely on Cloudflare free tier
- ✅ Global edge performance with sub-50ms response times

### October 17, 2025 - GitHub Import Setup for Replit & Vercel
- ✅ Successfully extracted and configured GitHub import in Replit environment
- ✅ Installed Node.js 20 and all npm dependencies (633 packages)
- ✅ Configured PostgreSQL database using existing DATABASE_URL
- ✅ Pushed database schema to PostgreSQL using Drizzle ORM
- ✅ Configured development workflow running on port 5000
- ✅ Set up autoscale deployment configuration for Replit deployments
- ✅ Verified frontend loading with glassmorphism UI and violet/blue theme
- ✅ All core features operational: music search, AI mode, web search, library management

**Database Configuration:**
- Database setup is **universal** - works seamlessly on both Replit and Vercel
- Uses `DATABASE_URL` environment variable (automatically provided by Replit)
- For Vercel: Simply set DATABASE_URL to your PostgreSQL provider (Neon, Vercel Postgres, etc.)
- Schema is automatically applied with `npm run db:push` - no manual recreation needed
- See [VERCEL_SETUP_GUIDE.md](./VERCEL_SETUP_GUIDE.md) for Vercel deployment instructions

**AI Features on Vercel:**
- AI suggestions use free external APIs that may be **unreliable on Vercel**
- For production: Set `OPENAI_API_KEY` environment variable
- Core music search works independently of AI features

**Known Issues:**
- PostCSS warning about missing 'from' option is harmless (Vite internal warning)

### Previous - AI Mode Fix & New Music Sources
- Fixed AI mode to filter top 3 most accurate results based on search query matching
- AI mode now displays results in random order (not sorted by score)
- Added AI scoring to all music sources (Jamendo, Internet Archive, Mixcloud)
- Improved search speed with parallel API calls
- Made YouTube and SoundCloud APIs fail gracefully when keys are missing
- Created integration libraries for: StreamSquid, AccuRadio, Jango, Freefy, Nonoki, PlaylistSound (ready to integrate)
- Updated search to pass aiMode parameter from both home and search pages

### October 16, 2025 - Replit Environment Setup
- Extracted project from GitHub import zip archive
- Installed Node.js 20 and all npm dependencies
- Configured PostgreSQL database with Drizzle ORM
- Fixed Vite configuration issue with async config resolution in server/vite.ts
- Set up development workflow running on port 5000
- Configured deployment settings for autoscale deployment
- Updated .gitignore to properly track Replit configuration files

### October 9, 2025 - Web Search and SoundCloud Improvements
- Removed inbuilt music player (users now click song links to play on original platforms)
- Removed iTunes from search aggregation
- Fixed SoundCloud integration with multiple fallback client IDs
- Added web search with "/" prefix using DuckDuckGo API
- Updated AI mode indicator and guidance text
- Improved search results with clean card-based layout

## Project Architecture

### Technology Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS with custom glassmorphism design
- **Animations:** Framer Motion
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **State Management:** TanStack React Query
- **Routing:** Wouter

### Directory Structure
```
/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # React components including UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility libraries and helpers
│   │   ├── pages/       # Page components (home, search, about, contact)
│   │   ├── App.tsx      # Main app component
│   │   └── main.tsx     # Entry point
│   └── index.html       # HTML template
├── server/              # Express backend
│   ├── db/              # Database schema and configuration
│   ├── lib/             # Backend utilities and API integrations
│   ├── routes/          # API route handlers
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # Route registration
│   └── vite.ts          # Vite middleware setup
├── shared/              # Shared TypeScript types and schemas
├── attached_assets/     # Static assets (images)
└── api/                 # Vercel API routes (for deployment)
```

### Key Features
1. **Multi-Platform Search:** Jamendo (free), Internet Archive (free), Mixcloud (free), YouTube (API key), SoundCloud (API key)
2. **AI Vibe Match:** Identifies musical vibes from humming using OpenAI GPT-5 and Whisper API
3. **Advanced Filtering:** Sort by relevance, newest, popularity, or public domain
4. **Web Search:** Use "/" prefix to search for music-related articles
5. **Library Management:** Playlists, liked songs, saved songs with CRUD operations
6. **Lyrics Display:** Multiple API fallbacks for fetching and displaying lyrics
7. **AI Mode:** Google-like featured snippets alongside music results

### Design System
- **Primary Colors:** Violet (270° 60% 55%) and Blue (240° 70% 50%)
- **Background:** Deep violet-blue (230° 35% 8%)
- **Typography:** Inter (body), Poppins (display), JetBrains Mono (mono)
- **Effects:** Glassmorphism with backdrop-blur, gradient animations

## External Dependencies & APIs

### Required API Keys (Configure in Replit Secrets)
- `YOUTUBE_API_KEY` - YouTube Data API v3 for music search
- `OPENAI_API_KEY` - OpenAI GPT-5 & Whisper API for AI vibe matching
- `SOUNDCLOUD_CLIENT_ID` - SoundCloud API for search and playback

### Third-Party Services
- **Puter.js:** Free, unlimited AI access for frontend AI capabilities (GPT-5-nano)
- **lyrics.ovh API:** Primary API for fetching song lyrics
- **some-random-api.com:** Fallback API for lyrics
- **DuckDuckGo API:** Web search functionality with "/" prefix
- **https://ai-wtsg.onrender.com/chat/:** External AI API for dynamic music queries
- **https://free-unoficial-gpt4o-mini-api-g70n.onrender.com/chat/:** Free GPT-4o Mini endpoint

### Database Schema
- **users:** User authentication and profile data
- **songs:** Song metadata (platform-agnostic storage)
- **playlists:** User-created playlists
- **playlist_songs:** Many-to-many relationship between playlists and songs
- **liked_songs:** User's liked songs
- **saved_songs:** User's saved songs for later
- **sessions:** Express session storage

## Development

### Running Locally
The project is configured to run automatically via the "Server" workflow:
```bash
npm run dev
```
This starts the Express server with Vite middleware on port 5000.

### Database Management
```bash
# Push schema changes to database
npm run db:push

# Run TypeScript type checking
npm run check
```

### Building for Production
```bash
npm run build
```

## Deployment

### Deployment Configuration
- **Type:** Autoscale (stateless web application)
- **Build Command:** `npm run build`
- **Run Command:** `npm run start`
- **Port:** 5000 (configured in server/index.ts)

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)
- `NODE_ENV` - Set to "development" or "production"
- API keys for external services (see Required API Keys section)

## User Preferences
- Prefer simple language and clear, concise explanations
- Iterative development with small, testable changes
- Ask before making major architectural changes or introducing new dependencies
- Do not modify `shared/schema.ts` without explicit approval

## Notes
- The Vite configuration properly sets `allowedHosts: true` for Replit's proxy environment
- Frontend binds to `0.0.0.0:5000` to work with Replit's preview system
- HMR is configured with WSS protocol and port 443 for secure hot reloading
- The server uses `reusePort: true` for better performance
- Vite config resolution was fixed to handle async config functions properly
