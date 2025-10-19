

export interface JangoResult {
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

export async function searchJango(query: string, maxResults: number = 20): Promise<JangoResult[]> {
  try {
    // Jango station search
    const url = `https://www.jango.com/api/search?q=${encodeURIComponent(query)}&type=artist`;
    
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
    const stations = data.artists || data.results || [];

    const results: JangoResult[] = stations.slice(0, maxResults).map((station: any) => {
      const artist = station.name || station.artist_name || 'Unknown Artist';
      const title = `${artist} Radio`;
      
      return {
        id: station.id || String(Math.random()),
        title: title,
        artist: artist,
        thumbnail: station.image || station.artwork_url || 'https://www.jango.com/images/logo.png',
        duration: 'Live Stream',
        url: `https://www.jango.com/music/${encodeURIComponent(artist)}`,
        embedUrl: station.stream_url || '',
        publishedAt: new Date().toISOString(),
        viewCount: station.plays || 0,
        description: `Listen to ${artist} radio on Jango`,
        platform: 'jango',
        aiScore: calculateAIScore(artist, query)
      };
    });

    return results;
  } catch (error) {
    console.error('Jango search error:', error);
    return [];
  }
}

function calculateAIScore(artist: string, query: string): number {
  let score = 0;
  
  const queryLower = query.toLowerCase();
  const artistLower = artist.toLowerCase();
  
  if (artistLower.includes(queryLower)) score += 50;
  if (artistLower === queryLower) score += 100;
  
  const artistWords = artistLower.split(' ');
  const queryWords = queryLower.split(' ');
  const matchingWords = queryWords.filter(word => artistWords.includes(word)).length;
  score += matchingWords * 10;
  
  return score;
}
