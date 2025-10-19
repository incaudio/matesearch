

export interface AccuRadioResult {
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

export async function searchAccuRadio(query: string, maxResults: number = 20): Promise<AccuRadioResult[]> {
  try {
    // AccuRadio channel/station search
    const url = `https://www.accuradio.com/api/search?query=${encodeURIComponent(query)}`;
    
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
    const channels = data.channels || data.results || [];

    const results: AccuRadioResult[] = channels.slice(0, maxResults).map((channel: any) => {
      const title = channel.name || channel.title || 'Unknown Channel';
      const artist = 'AccuRadio';
      
      return {
        id: channel.id || String(Math.random()),
        title: title,
        artist: artist,
        thumbnail: channel.image_url || channel.thumbnail || 'https://www.accuradio.com/images/logo.png',
        duration: 'Live Stream',
        url: channel.url || `https://www.accuradio.com/${channel.id}`,
        embedUrl: channel.stream_url || channel.url || '',
        publishedAt: new Date().toISOString(),
        viewCount: channel.listeners || 0,
        description: channel.description || `${title} - Online radio station`,
        platform: 'accuradio',
        aiScore: calculateAIScore(title, query)
      };
    });

    return results;
  } catch (error) {
    console.error('AccuRadio search error:', error);
    return [];
  }
}

function calculateAIScore(title: string, query: string): number {
  let score = 0;
  
  const queryLower = query.toLowerCase();
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes(queryLower)) score += 50;
  if (titleLower === queryLower) score += 100;
  
  const titleWords = titleLower.split(' ');
  const queryWords = queryLower.split(' ');
  const matchingWords = queryWords.filter(word => titleWords.includes(word)).length;
  score += matchingWords * 10;
  
  return score;
}
