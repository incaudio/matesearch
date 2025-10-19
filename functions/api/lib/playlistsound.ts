

export interface PlaylistSoundResult {
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

export async function searchPlaylistSound(query: string, maxResults: number = 20): Promise<PlaylistSoundResult[]> {
  try {
    // PlaylistSound.com search
    const url = `https://playlistsound.com/api/search?q=${encodeURIComponent(query)}&limit=${maxResults}`;
    
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
    const playlists = data.playlists || data.results || [];

    const results: PlaylistSoundResult[] = playlists.slice(0, maxResults).map((playlist: any) => {
      const title = playlist.title || playlist.name || 'Unknown Playlist';
      const artist = playlist.creator || playlist.user?.name || 'PlaylistSound';
      
      return {
        id: playlist.id || String(Math.random()),
        title: title,
        artist: artist,
        thumbnail: playlist.cover_url || playlist.image || playlist.thumbnail || '',
        duration: `${playlist.track_count || 0} tracks`,
        url: playlist.url || `https://playlistsound.com/playlist/${playlist.id}`,
        embedUrl: playlist.embed_url || playlist.url || '',
        publishedAt: playlist.created_at || new Date().toISOString(),
        viewCount: playlist.plays || 0,
        description: playlist.description || `${title} - Music playlist`,
        platform: 'playlistsound',
        aiScore: calculateAIScore(title, artist, query)
      };
    });

    return results;
  } catch (error) {
    console.error('PlaylistSound search error:', error);
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
