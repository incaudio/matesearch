# Deploying to Vercel

This guide explains how to deploy your Mate music search engine to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed: `npm i -g vercel`
3. A PostgreSQL database (Vercel Postgres or external like Neon, Supabase, etc.)

## Environment Variables

Before deploying, set these environment variables in your Vercel project settings:

### Required:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Random secret string for sessions (generate with: `openssl rand -base64 32`)

### Optional (for full functionality):
- `JAMENDO_CLIENT_ID` - Jamendo API client ID (or use default)

### For Replit Auth (if using):
- `REPLIT_ENV` - Set to "true" if using Replit auth
- `ISSUER_URL` - OIDC issuer URL
- `REPL_ID` - Your Replit app ID
- `REPLIT_DOMAINS` - Comma-separated domains
- `CLIENT_ID` - OAuth client ID

## Deployment Steps

### Option 1: Deploy via Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts to:
# 1. Link to existing project or create new one
# 2. Configure environment variables
# 3. Deploy
```

### Option 2: Deploy via Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to https://vercel.com/new
3. Import your repository
4. Configure environment variables in Vercel dashboard
5. Click "Deploy"

## Post-Deployment

1. Run database migrations:
   ```bash
   # Set DATABASE_URL locally or in Vercel env vars
   npm run db:push
   ```

2. Your app will be available at: `https://your-project.vercel.app`

## Important Notes

- The build command is `vite build` (configured in package.json as `vercel-build`)
- Static files are served from `dist/public`
- API routes are in the `api/` directory
- Sessions are stored in PostgreSQL (requires DATABASE_URL)

## Troubleshooting

### "Cannot find module" errors
- Make sure all dependencies are in `dependencies` not `devDependencies`
- Run `npm install` locally to verify

### Database connection errors
- Verify DATABASE_URL is set correctly in Vercel environment variables
- Check that your database allows connections from Vercel IPs
- Run `npm run db:push` to ensure tables are created

### API routes not working
- Check Vercel function logs in the dashboard
- Verify `api/index.ts` is properly exporting the handler
- Ensure routes in `vercel.json` are correct
