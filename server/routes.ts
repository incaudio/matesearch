// ...existing code...
import type { Express } from "express";
import dotenv from "dotenv";
dotenv.config();
import { createServer, type Server } from "http";
import { searchJamendo, getTrendingTracks } from "./lib/jamendo";
// import { analyzeVibeFromAudio, recognizeAudio } from "./lib/openai-service";
import { searchQuerySchema, vibeMatchRequestSchema, audioRecognitionRequestSchema } from "@shared/schema";
import { registerLibraryRoutes } from "./routes/library";
let setupAuth: any = async () => {};
let isAuthenticated: any = (_req: any, _res: any, next: any) => next();
try {
  const replitAuth = require("./replitAuth");
  if (process.env.REPLIT_ENV === "true" || (process.env.ISSUER_URL && process.env.REPL_ID && process.env.REPLIT_DOMAINS && process.env.CLIENT_ID)) {
    setupAuth = replitAuth.setupAuth;
    isAuthenticated = replitAuth.isAuthenticated;
  }
} catch (e) {
  // Auth not available, fallback to no-op
}
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Web search endpoint for music information
  app.get('/api/web-search', async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'Missing or invalid query' });
      }

      // Use DuckDuckGo Instant Answer API for music-related searches
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query + ' music')}&format=json&no_html=1&skip_disambig=1`;
      
      try {
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        const results = [];
        
        // Add abstract if available
        if (data.Abstract && data.AbstractURL) {
          results.push({
            title: data.Heading || query,
            url: data.AbstractURL,
            description: data.Abstract
          });
        }
        
        // Add related topics
        if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
          for (const topic of data.RelatedTopics.slice(0, 5)) {
            if (topic.Text && topic.FirstURL) {
              results.push({
                title: topic.Text.split(' - ')[0] || topic.Text,
                url: topic.FirstURL,
                description: topic.Text
              });
            }
          }
        }
        
        // If no results, provide a fallback Google search link
        if (results.length === 0) {
          results.push({
            title: `${query} - Music Search`,
            url: `https://www.google.com/search?q=${encodeURIComponent(query + ' music')}`,
            description: `Search for music-related information about "${query}"`
          });
        }
        
        res.json(results);
      } catch (apiError) {
        console.error('[WEB-SEARCH] API Error:', apiError);
        // Fallback to Google search link
        res.json([{
          title: `${query} - Music Search`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query + ' music')}`,
          description: `Search for music-related information about "${query}"`
        }]);
      }
    } catch (e) {
      console.error('[WEB-SEARCH] Error:', e);
      res.status(500).json({ error: 'Web search failed' });
    }
  });

  // Universal music search endpoint with AI filtering
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      const sortBy = (req.query.sortBy as string) || 'relevance';
      const platformFilter = (req.query.platform as string) || 'all';
      const aiMode = req.query.aiMode === 'true';
      
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'Missing or invalid query' });
      }

      // Aggregate results from reliable public API sources in parallel
      // Note: Each API has its own timeout handling internally
      const [jamendo, soundcloud, youtube, internetArchive, mixcloud] = await Promise.all([
        (await import('./lib/jamendo')).searchJamendo(query, 12).catch((err) => { console.error('Jamendo error:', err.message); return []; }),
        (await import('./lib/soundcloud')).searchSoundCloud(query, 12).catch((err) => { console.error('SoundCloud error:', err.message); return []; }),
        (await import('./lib/youtube')).searchYouTube(query, 12).catch((err) => { console.error('YouTube error:', err.message); return []; }),
        (await import('./lib/internet-archive')).searchInternetArchive(query, 12).catch((err) => { console.error('Internet Archive error:', err.message); return []; }),
        (await import('./lib/mixcloud')).searchMixcloud(query, 12).catch((err) => { console.error('Mixcloud error:', err.message); return []; }),
      ]);
      
      let results = [
        ...jamendo,
        ...soundcloud,
        ...youtube,
        ...internetArchive,
        ...mixcloud,
      ].map(r => {
        const rec: any = r;
        return {
          ...r,
          platform: rec.platform || rec.source || 'unknown',
          description: rec.description || '',
          aiScore: rec.aiScore || 0,
        };
      });

      console.log(`[SEARCH] Query: "${query}", Results before filtering: ${results.length}, AI Mode: ${aiMode}`);

      // Filter: only valid music results from working platforms
      let filtered = results.filter((r: any) => {
        const url = (r.url || '').toLowerCase();
        const isMusicSite = url.includes('jamendo.com') || url.includes('youtube.com') || url.includes('youtu.be') || url.includes('soundcloud.com') || url.includes('archive.org') || url.includes('mixcloud.com');
        const isPublic = isMusicSite && !url.includes('login') && !url.includes('signin');
        return isPublic;
      });

      // Apply platform filter
      if (platformFilter !== 'all') {
        filtered = filtered.filter((r: any) => r.platform === platformFilter);
      }

      console.log(`[SEARCH] After filtering: ${filtered.length} results, Platform: ${platformFilter}, SortBy: ${sortBy}`);

      // AI Mode: Sort by AI score, get top 3 most accurate, then randomize order
      if (aiMode) {
        filtered.sort((a: any, b: any) => (b.aiScore || 0) - (a.aiScore || 0));
        filtered = filtered.slice(0, 3);
        // Randomize the order of top 3 results
        filtered = filtered.sort(() => Math.random() - 0.5);
        console.log(`[SEARCH] AI Mode: Returning top 3 results in random order with AI scores:`, filtered.map((r: any) => ({ title: r.title, score: r.aiScore })));
      } else {
        // Apply normal sorting
        if (sortBy === 'newest') {
          filtered.sort((a: any, b: any) => {
            const dateA = new Date(a.publishedAt || 0).getTime();
            const dateB = new Date(b.publishedAt || 0).getTime();
            return dateB - dateA;
          });
        } else if (sortBy === 'popularity') {
          filtered.sort((a: any, b: any) => {
            const viewsA = a.viewCount || 0;
            const viewsB = b.viewCount || 0;
            return viewsB - viewsA;
          });
        } else if (sortBy === 'publicDomain') {
          filtered = filtered.filter((r: any) => r.platform === 'jamendo');
        } else {
          // Default relevance sorting by AI score
          filtered.sort((a: any, b: any) => (b.aiScore || 0) - (a.aiScore || 0));
        }
      }

      res.json(filtered);
    } catch (e) {
      console.error('[SEARCH] Error:', e);
      res.status(500).json({ error: 'Search failed' });
    }
  });
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  registerLibraryRoutes(app);
  
  // Song info endpoint for video and lyrics
  app.use('/api/song-info', (await import('./routes/song-info')).default);
  
  // AI music card suggestions after first search
  app.post("/api/ai/suggestions", async (req, res) => {
    try {
      const { userHistory } = req.body;
      const { getMusicSuggestions } = await import("./lib/ai-suggestions");
      const suggestions = await getMusicSuggestions(userHistory || []);
      res.json({ suggestions });
    } catch (e) {
      res.status(500).json({ error: "AI suggestion error" });
    }
  });

  // AI search bar suggestions
  app.post("/api/ai/search-suggestions", async (req, res) => {
    try {
      const { currentInput, userHistory } = req.body;
      const { getSearchSuggestions } = await import("./lib/ai-suggestions");
      const suggestions = await getSearchSuggestions(currentInput || "", userHistory || []);
      res.json({ suggestions });
    } catch (e) {
      res.status(500).json({ error: "AI search suggestion error" });
    }
  });
  // AI Assistant command handler
  app.post("/api/ai/command", async (req, res) => {
    try {
      const { command } = req.body;
      if (!command || typeof command !== "string") {
        return res.status(400).json({ error: "Missing command" });
      }
      // Use FreeGPT for music Q&A
      const { freegptChat } = await import("./lib/freegpt");
      const prompt = `You are a world-class AI assistant for a music app. You answer ANY question about the music industry, including:\n\n- Artist news, biographies, and life stories (past and present)\n- Music history, genres, and movements (from the 19th century to today)\n- Songs, albums, and their stories\n- Record labels, producers, and the business of music\n- Lyrics, songwriting, and composition\n- Music technology, instruments, and production\n- Music awards, charts, and records\n- Anything factual, creative, or newsworthy about music\n\nIf the user asks about anything outside the music world, politely refuse and say you only answer music-related questions. If the user asks for music, search, play, or playlist actions, suggest an action in JSON: { action: '...' }.\n\nUser: ${command}`;
      const reply = await freegptChat({
        messages: [
          { role: "system", content: "You are a world-class AI assistant for a music app. You answer ANY question about the music industry, including artist news, biographies, music history, genres, songs, albums, record labels, lyrics, and more. If the user asks about anything outside the music world, politely refuse and say you only answer music-related questions." },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
      });
      res.json({ reply });
    } catch (e) {
      res.status(500).json({ error: "AI error" });
    }
  });
// ...existing code...

  // Vibe Match endpoint - text-based, uses FreeGPT
  app.post("/api/vibe-match", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'Missing or invalid query' });
      }
      const { freegptChat } = await import("./lib/freegpt");
      const prompt = `You are a music vibe and trend expert. Given the user's search query, suggest:\n- 3-5 musical vibes that match the query\n- 5 trending or similar songs (title and artist)\n\nReply in JSON:\n{\n  "vibes": ["vibe1", "vibe2", ...],\n  "trendingSongs": [{"title": "...", "artist": "..."}, ...]\n}\n\nQuery: ${query}`;
      const text = await freegptChat({
        messages: [
          { role: "system", content: "You are a music vibe and trend expert. Suggest vibes and trending songs for a search query." },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
      });
      let result = { vibes: [], trendingSongs: [] };
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error('Vibe match JSON parse error:', err, text);
      }
      res.json(result);
    } catch (error) {
      console.error("Vibe match error:", error);
      res.status(500).json({ error: "Vibe matching failed" });
    }
  });

  // Audio Recognition endpoint - Shazam-like functionality (disabled - requires OpenAI Whisper API)
  // app.post("/api/recognize", async (req, res) => {
  //   try {
  //     const { audioData } = audioRecognitionRequestSchema.parse(req.body);
  //     const result = await recognizeAudio(audioData);
  //     res.json(result);
  //   } catch (error) {
  //     if (error instanceof z.ZodError) {
  //       res.status(400).json({ error: "Invalid request", details: error.errors });
  //     } else {
  //       console.error("Audio recognition error:", error);
  //       res.status(500).json({ error: "Audio recognition failed" });
  //     }
  //   }
  // });

  const httpServer = createServer(app);

  return httpServer;
}
