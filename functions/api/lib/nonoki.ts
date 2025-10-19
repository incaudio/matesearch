

export interface NonokiResult {
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

export async function searchNonoki(query: string, maxResults: number = 20): Promise<NonokiResult[]> {
  try {
    // Nonoki.com search
    const url = `https://nonoki.com/api/search?query=${encodeURIComponent(query)}&limit=${maxResults}`;
    
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
    const tracks = data.songs || data.results || [];

    const results: NonokiResult[] = tracks.slice(0, maxResults).map((track: any) => {
      const title = track.title || track.name || 'Unknown';
      const artist = track.artist || track.artist_name || 'Unknown Artist';
      
      return {
        id: track.id || String(Math.random()),
        title: title,
        artist: artist,
        thumbnail: track.thumbnail || track.image || track.cover_url || '',
        duration: formatDuration(track.duration || 0),
        url: track.url || `https://nonoki.com/song/${track.id}`,
        embedUrl: track.stream_url || track.url || '',
        publishedAt: track.published_at || new Date().toISOString(),
        viewCount: track.play_count || 0,
        description: track.description || `${title} by ${artist}`,
        platform: 'nonoki',
        aiScore: calculateAIScore(title, artist, query)
      };
    });

    return results;
  } catch (error) {
    console.error('Nonoki search error:', error);
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
