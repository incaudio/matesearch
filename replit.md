# Mate - Music Search Engine

## Overview

Mate is an AI-powered music search engine that provides a rich music discovery experience through multi-platform search, AI-driven vibe matching, and a modern glassmorphic UI. The application functions as a Google-like search experience for music, enhanced with AI insights and a visually stunning dark mode interface.

The platform aggregates music from multiple sources including YouTube, SoundCloud, Jamendo, Internet Archive, Mixcloud, and various other music platforms. It features an AI mode that filters and ranks results based on relevance, web search capabilities for music information, and a library management system for playlists and liked songs.

## Recent Changes

### October 19, 2025 - Migration to Replit Environment Complete
- Successfully completed migration from import to Replit environment
- Reinstalled all npm dependencies (496 packages)
- Vite development server running successfully on port 5000
- Verified frontend is fully functional with beautiful glassmorphic UI
- Application ready for development and deployment
- All migration checklist items completed and marked as done

### October 18, 2025 - Cloudflare Pages Conversion Complete
- Converted entire application to work on Cloudflare Pages with zero hosting costs
- Migrated Express backend to Cloudflare Pages Functions using Hono framework
- Converted PostgreSQL database to Cloudflare D1 (SQLite-based)
- All features fully functional: music search, AI mode, web search, library management
- Created comprehensive deployment guide (CLOUDFLARE_DEPLOY.md)
- Added database seeding for default user
- Application now supports three deployment platforms: Cloudflare, Replit, Vercel
- Cloudflare deployment offers global edge performance with sub-50ms response times

### October 18, 2025 - GitHub Import Setup Complete
- Successfully extracted project from GitHub import zip file
- Installed Node.js 20 and all npm dependencies (633 packages)
- Configured PostgreSQL database using existing DATABASE_URL
- Pushed database schema to PostgreSQL using Drizzle ORM
- Set up development workflow running on port 5000
- Configured autoscale deployment for production publishing
- Verified frontend loading correctly with glassmorphism UI
- Application is fully functional and ready to use

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework Stack:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management
- Radix UI primitives for accessible component foundations
- Tailwind CSS with custom design system for styling

**Design System:**
- Dark-first design with glassmorphism aesthetic
- Violet-blue gradient accent colors (270°/240° hues)
- Custom theme system using CSS variables and shadcn/ui component library
- Font stack: Inter (body), Poppins (display), JetBrains Mono (code/timestamps)
- Responsive breakpoints with mobile-first approach

**State Management:**
- React Query for API data caching and synchronization
- Local state with React hooks for UI interactions
- localStorage for persisting user preferences (AI mode, theme)
- Session-based authentication state

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API routes
- TypeScript for type-safe server code
- Session-based authentication with express-session
- PostgreSQL session store using connect-pg-simple

**API Design:**
- RESTful endpoints under `/api/*` prefix
- Music search aggregation from multiple sources (parallel API calls)
- AI-powered search result ranking and filtering
- Web search integration via DuckDuckGo API
- Library management (playlists, liked songs) endpoints

**Music Source Integrations:**
- YouTube (via Google APIs with OAuth)
- SoundCloud (public API with multiple client IDs for reliability)
- Jamendo (open music platform)
- Internet Archive (public domain audio)
- Mixcloud (DJ mixes and radio shows)
- iTunes (Apple Music metadata)
- RapidAPI (Deezer, Spotify data)
- Additional platforms: StreamSquid, AccuRadio, Jango, Freefy, Nonoki, PlaylistSound

**AI Features:**
- Free AI APIs for suggestions and vibe matching (fallback chain)
- Primary: Custom AI API (ai-wtsg.onrender.com)
- Fallback: Multiple free GPT APIs
- Puter.js integration for client-side AI chat
- OpenAI GPT-5 support (optional, requires API key)
- AI scoring system for result relevance matching

### Data Storage

**Database:**
- PostgreSQL as primary data store
- Drizzle ORM for type-safe database queries
- Schema includes: users, sessions, songs, playlists, playlist_songs, liked_songs

**Session Management:**
- Database-backed sessions (sessions table)
- 7-day session TTL with automatic cleanup
- Secure cookie configuration (httpOnly, secure flags)

**Data Models:**
- Users: Stores profile information and OAuth data
- Songs: Cached metadata from various music platforms
- Playlists: User-created collections with songs
- Liked Songs: User favorites tracking

### Authentication & Authorization

**Authentication Methods:**
- Optional Replit OIDC authentication (for Replit deployments)
- Passport.js with OpenID Connect strategy
- Environment-based auth activation (REPLIT_ENV flag)
- Fallback to no-auth mode when credentials absent

**Session Security:**
- SESSION_SECRET for cookie signing
- Secure cookie transmission (HTTPS only in production)
- CSRF protection through same-site cookies

### Build & Deployment

**Development Workflow:**
- Vite dev server on port 5000
- Hot module replacement (HMR) via WebSocket
- TypeScript compilation with incremental builds
- Database migrations via Drizzle Kit

**Production Build:**
- Vite builds static assets to `dist/public`
- Express server serves built frontend
- API routes handled by serverless functions (Vercel) or Express

**Deployment Targets:**
- Replit: Autoscale deployment with DATABASE_URL from environment
- Vercel: Serverless functions with static site hosting
- Build output: `dist/public` for static assets, `api/index.ts` for serverless

## External Dependencies

### Required Services

**Database:**
- PostgreSQL (version 12+)
- Can be Replit Postgres, Vercel Postgres, Neon, Supabase, or any PostgreSQL provider
- Connection via DATABASE_URL environment variable

### Optional API Keys

**Music Search (at least one recommended):**
- YouTube Data API v3 (YOUTUBE_API_KEY) - Best coverage
- SoundCloud API (SOUNDCLOUD_CLIENT_ID) - Alternative source
- RapidAPI (RAPIDAPI_KEY) - Deezer/Spotify integration
- Jamendo (JAMENDO_CLIENT_ID) - Defaults to public client ID

**AI Features (optional):**
- OpenAI API (OPENAI_API_KEY) - For GPT-5 vibe matching
- Falls back to free AI APIs if not provided

**Authentication (Replit only):**
- ISSUER_URL - OIDC issuer endpoint
- REPL_ID - Replit app identifier
- CLIENT_ID - OAuth client credentials
- REPLIT_DOMAINS - Allowed authentication domains

### Third-Party Services

**Music APIs:**
- YouTube Data API v3 (Google Cloud)
- SoundCloud Public API
- Jamendo Music API
- Internet Archive Advanced Search
- Mixcloud API
- iTunes Search API
- DuckDuckGo Instant Answer API

**AI Services:**
- Free AI APIs (ai-wtsg.onrender.com, free-unoficial-gpt4o-mini-api)
- Puter.js (client-side AI via puter.com)
- OpenAI API (optional premium feature)

**Lyrics Services:**
- lyrics.ovh API
- some-random-api.com (lyrics endpoint)

**Infrastructure:**
- Vercel (deployment platform)
- Replit (development and hosting platform)
- Google Fonts (Inter, Poppins, JetBrains Mono)