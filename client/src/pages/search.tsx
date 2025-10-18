import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Search as SearchIcon, SlidersHorizontal, Music, Moon, Sun, Menu, ExternalLink, Info } from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchResult } from "@shared/schema";
import { FilterPanel } from "@/components/filter-panel";
import { VibeMatchModal } from "@/components/vibe-match-modal";
import { SongVideoLyrics } from "@/components/song-video-lyrics";


export default function SearchPage() {

  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const initialQuery = searchParams.get("q") || "";
  const urlAiMode = searchParams.get("aiMode") === "true";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [showVibeMatch, setShowVibeMatch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sortBy, setSortBy] = useState<"relevance" | "newest" | "popularity" | "publicDomain">("popularity");
  const [platform, setPlatform] = useState<"all" | "jamendo">("all");
  const { theme, setTheme } = useTheme();
  const [aiMode, setAiMode] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check URL first, then fall back to localStorage
      const params = new URLSearchParams(window.location.search);
      if (params.has('aiMode')) {
        return params.get('aiMode') === 'true';
      }
      return localStorage.getItem('aiMode') === 'true';
    }
    return false;
  });
  // Sync aiMode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiMode', aiMode ? 'true' : 'false');
    }
  }, [aiMode]);
  const [isSearching, setIsSearching] = useState(false);

  // Check if query starts with "/"
  const isWebSearch = activeQuery.startsWith('/');
  const cleanQuery = isWebSearch ? activeQuery.slice(1).trim() : activeQuery;

  const { data: results, isLoading } = useQuery<SearchResult[]>({
    queryKey: [`/api/search?q=${encodeURIComponent(cleanQuery)}&sortBy=${sortBy}&platform=${platform}&aiMode=${aiMode}`],
    enabled: !!cleanQuery && !isWebSearch,
  });

  const { data: webResults, isLoading: isWebLoading } = useQuery<any[]>({
    queryKey: [`/api/web-search?q=${encodeURIComponent(cleanQuery)}`],
    enabled: !!cleanQuery && isWebSearch,
  });

  useEffect(() => {
    setSearchQuery(initialQuery);
    setActiveQuery(initialQuery);
    setIsSearching(false);
  }, [initialQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setActiveQuery(searchQuery.trim());
      // Preserve aiMode in URL when searching from search page
      const params = new URLSearchParams({ q: searchQuery.trim() });
      if (aiMode) {
        params.set('aiMode', 'true');
      }
      setLocation(`/search?${params.toString()}`);
      setIsSearching(false);
    }
  };

  // Removed handlePlayTrack

  return (

  <>


    {/* Menu button - hides beneath sidebar when open */}


    {/* Responsive container for logo and search bar */}
    <div className="max-w-3xl w-full mx-auto px-4 pt-8 pb-4 flex flex-col items-center">
      {/* Logo/Brand just above search bar */}
      <div className="w-full flex flex-col items-center mb-2 sm:mb-4">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-display font-semibold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent cursor-pointer select-none hover:scale-105 transition-transform duration-200"
          onClick={() => setLocation('/')}
        >
          Mate.
        </h1>
      </div>
      {/* Search bar and controls */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <form onSubmit={handleSearch} className="flex-1 w-full max-w-2xl">
          <div className="glass backdrop-blur-xl rounded-full px-6 py-2 flex items-center gap-2">
            <SearchIcon className="w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for songs... (Use / for web search)"
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-sm"
              data-testid="input-search-page"
            />
            {/* AI toggle icon */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={`backdrop-blur-md bg-white/10 border border-white/10 px-4 py-1 rounded-full font-bold text-base select-none focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all duration-200 shadow-md ${aiMode ? "text-white animate-glow bg-gradient-to-r from-violet-500 to-blue-500 shadow-lg" : "text-violet-400"}`}
              style={{
                boxShadow: aiMode ? "0 0 12px 2px var(--theme-accent, #8b5cf6)" : undefined,
                filter: "blur(0px)",
                color: theme === 'light' && !aiMode ? '#4c1d95' : undefined // dark violet for light mode
              }}
              onClick={() => setAiMode((v) => !v)}
              title={aiMode ? "AI mode on" : "Enable AI mode"}
              tabIndex={0}
            >
              AI
            </Button>
            {searchQuery.trim() && (
              <Button
                type="submit"
                size="sm"
                disabled={isSearching || isLoading}
                className={`glass backdrop-blur-xl bg-gradient-to-r from-violet-500/80 to-blue-500/80 hover:from-violet-600/80 hover:to-blue-600/80 animate-fade-in ${isSearching || isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                style={{ color: theme === 'light' ? '#4c1d95' : undefined }}
              >
                {isSearching || isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  'Search'
                )}
              </Button>
            )}
          </div>
        </form>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="text-violet-400"
            data-testid="button-filters"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVibeMatch(true)}
            className="text-violet-400"
            data-testid="button-vibe-match-search"
          >
            <Music className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-violet-400"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>

    {/* Loading progress bar */}
    {(isSearching || isLoading) && (
      <div className="w-full h-1 bg-transparent overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500 animate-loading-bar"></div>
      </div>
    )}

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 pb-32">
        {/* Guide for / search prefix */}
        {!activeQuery && (
          <div className="mb-6 px-4 py-3 rounded-lg glass-elevated border border-blue-400/40 bg-gradient-to-r from-blue-500/10 to-violet-500/10">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">Pro Tip: Web Search</p>
                <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                  Start your search with <code className="px-1.5 py-0.5 rounded bg-blue-500/20 font-mono text-xs">/</code> to search for music-related articles and information from the web.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI mode indicator - Only shows when AI mode is ON and a search has been made */}
        {aiMode && activeQuery && !isWebSearch && (
          <div className="mb-6 px-4 py-2 rounded-lg glass-elevated border border-violet-400/40 bg-gradient-to-r from-violet-500/10 to-blue-500/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
              <p className="text-sm text-violet-700 dark:text-violet-300">AI mode is active - showing curated results</p>
            </div>
          </div>
        )}
        
        {/* Song Details & Lyrics Section */}
        {activeQuery && !isWebSearch && (
          <SongVideoLyrics artist={cleanQuery.split(" - ")[0] || cleanQuery} title={cleanQuery.split(" - ")[1] || ""} />
        )}
        
        {/* Web search results */}
        {isWebSearch && webResults && webResults.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-violet-500" />
              <span className="bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                Related Information
              </span>
            </h3>
            <div className="space-y-4">
              {webResults.map((result: any, idx: number) => (
                <div key={idx} className="group">
                  <a 
                    href={result.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors"
                  >
                    {result.title}
                  </a>
                  <div className="text-sm text-green-700 dark:text-green-500 mt-1">
                    {result.url}
                  </div>
                  {result.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {result.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="my-6 border-t border-border"></div>
          </div>
        )}
        
        {isWebLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Searching the web...</p>
          </div>
        ) : isWebSearch && (!webResults || webResults.length === 0) && cleanQuery ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mb-4">
              <ExternalLink className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No web results found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Try a different search query
            </p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Searching music...</p>
          </div>
        ) : results && results.length > 0 ? (
          <div className="space-y-6">
            {results.map((result) => (
              <div 
                key={result.id} 
                className="group"
              >
                <div className="flex items-start gap-4">
                  {result.thumbnail && (
                    <img 
                      src={result.thumbnail} 
                      alt={result.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xl font-medium text-blue-600 dark:text-blue-400 hover:underline line-clamp-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors"
                      >
                        {result.title}
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <span className="font-medium text-foreground/70">{result.artist}</span>
                      {result.duration && (
                        <>
                          <span>•</span>
                          <span>{result.duration}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="capitalize">{result.platform}</span>
                    </div>
                    
                    {result.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {result.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeQuery ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mb-4">
              <Music className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Try different keywords or use Vibe Match to find similar songs
            </p>
          </div>
        ) : null}
      </main>

      {/* Filter panel */}
      <FilterPanel
        open={showFilters}
        onOpenChange={setShowFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        platform={platform}
        setPlatform={setPlatform}
      />

      {/* Vibe match modal */}
      <VibeMatchModal
        open={showVibeMatch}
        onOpenChange={setShowVibeMatch}
      />
    </>
  );
}
