import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { searchJamendo } from './lib/jamendo';
import { searchSoundCloud } from './lib/soundcloud';
import { searchYouTube } from './lib/youtube';
import { searchInternetArchive } from './lib/internet-archive';
import { searchMixcloud } from './lib/mixcloud';
import { getMusicSuggestions, getSearchSuggestions } from './lib/ai-suggestions';
import { freegptChat } from './lib/freegpt';

type Env = {
  DB: D1Database;
  YOUTUBE_API_KEY?: string;
  SOUNDCLOUD_CLIENT_ID?: string;
  OPENAI_API_KEY?: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

app.get('/api/web-search', async (c) => {
  try {
    const query = c.req.query('q');
    
    if (!query || typeof query !== 'string' || !query.trim()) {
      return c.json({ error: 'Missing or invalid query' }, 400);
    }

    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query + ' music')}&format=json&no_html=1&skip_disambig=1`;
    
    try {
      const response = await fetch(searchUrl);
      const data: any = await response.json();
      
      const results = [];
      
      if (data.Abstract && data.AbstractURL) {
        results.push({
          title: data.Heading || query,
          url: data.AbstractURL,
          description: data.Abstract
        });
      }
      
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
      
      if (results.length === 0) {
        results.push({
          title: `${query} - Music Search`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query + ' music')}`,
          description: `Search for music-related information about "${query}"`
        });
      }
      
      return c.json(results);
    } catch (apiError) {
      console.error('[WEB-SEARCH] API Error:', apiError);
      return c.json([{
        title: `${query} - Music Search`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query + ' music')}`,
        description: `Search for music-related information about "${query}"`
      }]);
    }
  } catch (e) {
    console.error('[WEB-SEARCH] Error:', e);
    return c.json({ error: 'Web search failed' }, 500);
  }
});

app.get('/api/search', async (c) => {
  try {
    const query = c.req.query('q');
    const sortBy = c.req.query('sortBy') || 'relevance';
    const platformFilter = c.req.query('platform') || 'all';
    const aiMode = c.req.query('aiMode') === 'true';
    
    if (!query || typeof query !== 'string' || !query.trim()) {
      return c.json({ error: 'Missing or invalid query' }, 400);
    }

    const [jamendo, soundcloud, youtube, internetArchive, mixcloud] = await Promise.all([
      searchJamendo(query, 12, c.env).catch((err: any) => { console.error('Jamendo error:', err.message); return []; }),
      searchSoundCloud(query, 12, c.env).catch((err: any) => { console.error('SoundCloud error:', err.message); return []; }),
      searchYouTube(query, 12, c.env).catch((err: any) => { console.error('YouTube error:', err.message); return []; }),
      searchInternetArchive(query, 12, c.env).catch((err: any) => { console.error('Internet Archive error:', err.message); return []; }),
      searchMixcloud(query, 12, c.env).catch((err: any) => { console.error('Mixcloud error:', err.message); return []; }),
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

    let filtered = results.filter((r: any) => {
      const url = (r.url || '').toLowerCase();
      const isMusicSite = url.includes('jamendo.com') || url.includes('youtube.com') || url.includes('youtu.be') || url.includes('soundcloud.com') || url.includes('archive.org') || url.includes('mixcloud.com');
      const isPublic = isMusicSite && !url.includes('login') && !url.includes('signin');
      return isPublic;
    });

    if (platformFilter !== 'all') {
      filtered = filtered.filter((r: any) => r.platform === platformFilter);
    }

    console.log(`[SEARCH] After filtering: ${filtered.length} results, Platform: ${platformFilter}, SortBy: ${sortBy}`);

    if (aiMode) {
      filtered.sort((a: any, b: any) => (b.aiScore || 0) - (a.aiScore || 0));
      filtered = filtered.slice(0, 3);
      filtered = filtered.sort(() => Math.random() - 0.5);
      console.log(`[SEARCH] AI Mode: Returning top 3 results in random order with AI scores:`, filtered.map((r: any) => ({ title: r.title, score: r.aiScore })));
    } else {
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
        filtered.sort((a: any, b: any) => (b.aiScore || 0) - (a.aiScore || 0));
      }
    }

    return c.json(filtered);
  } catch (e) {
    console.error('[SEARCH] Error:', e);
    return c.json({ error: 'Search failed' }, 500);
  }
});

app.get('/api/song-info', async (c) => {
  try {
    const query = c.req.query('q');
    
    if (!query) {
      return c.json({ error: "Query parameter is required" }, 400);
    }

    const queryParts = query.split(/[-–—]/);
    let artist = "";
    let track = "";
    let thumbnail = "";
    let duration = "";
    let platform = "";
    let lyrics: string | null = null;
    
    if (queryParts.length >= 2) {
      artist = queryParts[0].trim();
      track = queryParts[1].trim();
    } else {
      track = query.trim();
    }

    try {
      const youtubeResults = await searchYouTube(query, 1, c.env);
      if (youtubeResults.length > 0) {
        const firstResult = youtubeResults[0];
        if (!artist) artist = firstResult.artist || "";
        if (!track && firstResult.title) track = firstResult.title;
        thumbnail = firstResult.thumbnail || "";
        duration = firstResult.duration || "";
        platform = firstResult.platform || "YouTube";
      }
    } catch (error) {
      console.log("YouTube fetch failed, continuing with lyrics only:", error);
    }

    if (artist && track) {
      try {
        const lyricsUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
        const response = await fetch(lyricsUrl);
        if (response.ok) {
          const data: any = await response.json();
          if (data.lyrics) {
            lyrics = data.lyrics;
          }
        }
      } catch (error) {
        console.error("Error fetching lyrics from lyrics.ovh:", error);
      }
    }
    
    if (!lyrics) {
      try {
        const searchUrl = `https://some-random-api.com/others/lyrics?title=${encodeURIComponent(query)}`;
        const response = await fetch(searchUrl);
        if (response.ok) {
          const data: any = await response.json();
          if (data.lyrics && data.title && data.author) {
            if (!artist) artist = data.author;
            if (!track) track = data.title;
            lyrics = data.lyrics;
          }
        }
      } catch (error) {
        console.error("Error fetching from some-random-api:", error);
      }
    }

    return c.json({
      artist: artist || "Unknown Artist",
      track: track || query,
      thumbnail,
      duration,
      platform,
      lyrics: lyrics || "Lyrics not available for this song.",
    });
  } catch (error) {
    console.error("Error in song-info route:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post("/api/ai/suggestions", async (c) => {
  try {
    const { userHistory } = await c.req.json();
    const suggestions = await getMusicSuggestions(userHistory || []);
    return c.json({ suggestions });
  } catch (e) {
    return c.json({ error: "AI suggestion error" }, 500);
  }
});

app.post("/api/ai/search-suggestions", async (c) => {
  try {
    const { currentInput, userHistory } = await c.req.json();
    const suggestions = await getSearchSuggestions(currentInput || "", userHistory || []);
    return c.json({ suggestions });
  } catch (e) {
    return c.json({ error: "AI search suggestion error" }, 500);
  }
});

app.post("/api/ai/command", async (c) => {
  try {
    const { command } = await c.req.json();
    if (!command || typeof command !== "string") {
      return c.json({ error: "Missing command" }, 400);
    }
    const prompt = `You are a world-class AI assistant for a music app. You answer ANY question about the music industry, including:\n\n- Artist news, biographies, and life stories (past and present)\n- Music history, genres, and movements (from the 19th century to today)\n- Songs, albums, and their stories\n- Record labels, producers, and the business of music\n- Lyrics, songwriting, and composition\n- Music technology, instruments, and production\n- Music awards, charts, and records\n- Anything factual, creative, or newsworthy about music\n\nIf the user asks about anything outside the music world, politely refuse and say you only answer music-related questions. If the user asks for music, search, play, or playlist actions, suggest an action in JSON: { action: '...' }.\n\nUser: ${command}`;
    const reply = await freegptChat({
      messages: [
        { role: "system", content: "You are a world-class AI assistant for a music app. You answer ANY question about the music industry, including artist news, biographies, music history, genres, songs, albums, record labels, lyrics, and more. If the user asks about anything outside the music world, politely refuse and say you only answer music-related questions." },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
    });
    return c.json({ reply });
  } catch (e) {
    return c.json({ error: "AI error" }, 500);
  }
});

app.post("/api/vibe-match", async (c) => {
  try {
    const { query } = await c.req.json();
    if (!query || typeof query !== 'string' || !query.trim()) {
      return c.json({ error: 'Missing or invalid query' }, 400);
    }
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
    return c.json(result);
  } catch (error) {
    console.error("Vibe match error:", error);
    return c.json({ error: "Vibe matching failed" }, 500);
  }
});

export const onRequest = app.fetch;
