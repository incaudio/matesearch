// YouTube Data API - Direct fetch implementation for Cloudflare Workers compatibility
// No googleapis dependency needed

export interface YouTubeSearchResult {
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
}

export async function searchYouTube(query: string, maxResults: number = 20, env?: any): Promise<YouTubeSearchResult[]> {
  try {
    const apiKey = env?.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.log('YouTube API key not configured, skipping YouTube search');
      return [];
    }

    // Search for music videos using YouTube Data API v3
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=${maxResults}&order=relevance&key=${apiKey}`;
    
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      console.error('YouTube search API error:', searchResponse.status);
      return [];
    }

    const searchData: any = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    const videoIds = searchData.items
      .map((item: any) => item.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return [];
    }

    // Get video details for duration and statistics
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(',')}&key=${apiKey}`;
    
    const videosResponse = await fetch(videosUrl);
    
    if (!videosResponse.ok) {
      console.error('YouTube videos API error:', videosResponse.status);
      return [];
    }

    const videosData: any = await videosResponse.json();
    const results: YouTubeSearchResult[] = [];

    for (const video of videosData.items || []) {
      if (!video.id) continue;

      const duration = parseDuration(video.contentDetails?.duration || 'PT0S');
      const snippet = video.snippet;
      
      results.push({
        id: video.id,
        title: snippet?.title || 'Unknown',
        artist: snippet?.channelTitle || 'Unknown Artist',
        thumbnail: snippet?.thumbnails?.high?.url || snippet?.thumbnails?.default?.url || '',
        duration,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        embedUrl: `https://www.youtube.com/embed/${video.id}`,
        publishedAt: snippet?.publishedAt || new Date().toISOString(),
        viewCount: parseInt(video.statistics?.viewCount || '0'),
        description: snippet?.description || '',
      });
    }

    return results;
  } catch (error) {
    console.error('YouTube search error:', error);
    // Return empty array instead of throwing - allows other sources to work
    return [];
  }
}

function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
