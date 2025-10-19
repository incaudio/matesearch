import { Router } from "express";
import { searchYouTube } from "../lib/youtube";

const router = Router();

async function searchGeniusAndGetLyrics(query: string): Promise<{ artist: string; track: string; lyrics: string | null }> {
  try {
    const searchUrl = `https://some-random-api.com/others/lyrics?title=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    
    if (response.ok) {
      const data = await response.json();
      if (data.lyrics && data.title && data.author) {
        return {
          artist: data.author,
          track: data.title,
          lyrics: data.lyrics
        };
      }
    }
    
    return { artist: "", track: "", lyrics: null };
  } catch (error) {
    console.error("Error fetching from some-random-api:", error);
    return { artist: "", track: "", lyrics: null };
  }
}

async function fetchLyrics(artist: string, track: string): Promise<string | null> {
  try {
    const lyricsUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
    const response = await fetch(lyricsUrl);
    
    if (response.ok) {
      const data = await response.json();
      if (data.lyrics) {
        return data.lyrics;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching lyrics from lyrics.ovh:", error);
    return null;
  }
}

router.get("/", async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
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
      const youtubeResults = await searchYouTube(query, 1);
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
      lyrics = await fetchLyrics(artist, track);
    }
    
    if (!lyrics) {
      const geniusResult = await searchGeniusAndGetLyrics(query);
      if (geniusResult.lyrics) {
        if (!artist) artist = geniusResult.artist;
        if (!track) track = geniusResult.track;
        lyrics = geniusResult.lyrics;
      }
    }

    res.json({
      artist: artist || "Unknown Artist",
      track: track || query,
      thumbnail,
      duration,
      platform,
      lyrics: lyrics || "Lyrics not available for this song.",
    });
  } catch (error) {
    console.error("Error in song-info route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
