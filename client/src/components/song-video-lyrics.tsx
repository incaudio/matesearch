import { useState, useEffect } from "react";
import { getLyrics } from "../lib/lyrist";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Music2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SongVideoLyricsProps {
  artist: string;
  title: string;
}

export function SongVideoLyrics({ artist, title }: SongVideoLyricsProps) {
  const [lyrics, setLyrics] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (!artist || !title) return;
    
    setLoading(true);
    setError(false);
    setDismissed(false);
    
    getLyrics(artist, title)
      .then((result) => {
        if (result.lyrics && result.lyrics.trim()) {
          setLyrics(result.lyrics);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [artist, title]);

  if (dismissed || (!loading && error)) {
    return null;
  }

  if (!loading && !lyrics) {
    return null;
  }

  return (
    <Card className="mb-6 p-6 glass-elevated border-violet-400/20 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2 mb-4">
        <Music2 className="h-5 w-5 text-violet-500" />
        <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
          Lyrics
        </h3>
      </div>
      
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading lyrics...</span>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-mono">
            {lyrics}
          </pre>
        </div>
      )}
    </Card>
  );
}
