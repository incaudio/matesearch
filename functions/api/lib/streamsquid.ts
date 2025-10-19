

export interface StreamSquidResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  url: string;
  embedUrl: string;
  publishedAt: string;
  viewCount: number;
  description: string;
  platform: string;
  aiScore?: number;
}

export async function searchStreamSquid(query: string, maxResults: number = 20): Promise<StreamSquidResult[]> {
  try {
    // StreamSquid search - using their public search
    const url = `https://streamsquid.com/api/search?q=${encodeURIComponent(query)}&limit=${maxResults}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      return [];
    }

    const data: any = await response.json();
    const tracks = data.results || data.tracks || [];

    const results: StreamSquidResult[] = tracks.slice(0, maxResults).map((track: any) => {
      const title = track.title || track.name || 'Unknown';
      const artist = track.artist || track.user?.name || 'Unknown Artist';
      
      return {
        id: track.id || String(Math.random()),
        title: title,
        artist: artist,
        thumbnail: track.artwork_url || track.thumbnail || track.image || '',
        duration: formatDuration(track.duration || 0),
        url: track.permalink_url || track.url || `https://streamsquid.com/track/${track.id}`,
        embedUrl: track.stream_url || track.url || '',
        publishedAt: track.created_at || new Date().toISOString(),
        viewCount: track.playback_count || track.plays || 0,
        description: track.description || `${title} by ${artist}`,
        platform: 'streamsquid',
        aiScore: calculateAIScore(title, artist, query)
      };
    });

    return results;
  } catch (error) {
    console.error('StreamSquid search error:', error);
    return [];
  }
}

function calculateAIScore(title: string, artist: string, query: string): number {
  let score = 0;
  
  const queryLower = query.toLowerCase();
  const titleLower = title.toLowerCase();
  const artistLower = artist.toLowerCase();
  
  if (titleLower.includes(queryLower)) score += 50;
  if (artistLower.includes(queryLower)) score += 30;
  
  if (titleLower === queryLower) score += 100;
  if (artistLower === queryLower) score += 80;
  
  const titleWords = titleLower.split(' ');
  const queryWords = queryLower.split(' ');
  const matchingWords = queryWords.filter(word => titleWords.includes(word)).length;
  score += matchingWords * 10;
  
  return score;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
