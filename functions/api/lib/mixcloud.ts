

export interface MixcloudResult {
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

export async function searchMixcloud(query: string, maxResults: number = 20, env?: any): Promise<MixcloudResult[]> {
  try {
    // Mixcloud API endpoint
    const url = `https://api.mixcloud.com/search/?q=${encodeURIComponent(query)}&type=cloudcast&limit=${maxResults}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mixcloud API error: ${response.status}`);
    }

    const data: any = await response.json();
    const cloudcasts = data?.data || [];

    const results: MixcloudResult[] = cloudcasts.map((cast: any) => {
      const durationSeconds = cast.audio_length || 0;
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = durationSeconds % 60;
      const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      const title = cast.name || 'Unknown';
      const artist = cast.user?.name || cast.user?.username || 'Unknown Artist';

      return {
        id: cast.key || cast.slug,
        title: title,
        artist: artist,
        thumbnail: cast.pictures?.large || cast.pictures?.medium || cast.pictures?.thumbnail || '',
        duration: duration,
        url: cast.url || `https://www.mixcloud.com${cast.key}`,
        embedUrl: `https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=${encodeURIComponent(cast.key || '')}`,
        publishedAt: cast.created_time || new Date().toISOString(),
        viewCount: cast.play_count || 0,
        description: cast.description || `${title} by ${artist}`,
        platform: 'mixcloud',
        aiScore: calculateAIScore(title, artist, query, cast.play_count || 0)
      };
    });

    return results;
  } catch (error) {
    console.error('Mixcloud search error:', error);
    return [];
  }
}

function calculateAIScore(title: string, artist: string, query: string, playCount: number): number {
  let score = Math.min(playCount / 1000, 20); // Normalize play count to max 20 points
  
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
