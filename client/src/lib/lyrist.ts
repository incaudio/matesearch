export async function getLyrics(artist: string, title: string): Promise<{ lyrics: string }> {
  const apis = [
    {
      name: 'lyrics.ovh',
      url: `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
      transform: (data: any) => data.lyrics
    },
    {
      name: 'some-random-api',
      url: `https://some-random-api.com/others/lyrics?title=${encodeURIComponent(title + ' ' + artist)}`,
      transform: (data: any) => data.lyrics
    }
  ];

  for (const api of apis) {
    try {
      const response = await fetch(api.url, { 
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        const lyrics = api.transform(data);
        
        if (lyrics && lyrics.trim()) {
          return { lyrics };
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${api.name}:`, error);
      continue;
    }
  }
  
  throw new Error("No lyrics found from any source");
}
