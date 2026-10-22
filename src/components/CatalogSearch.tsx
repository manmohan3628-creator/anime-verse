import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Star,
  Film,
} from 'lucide-react';
import { Anime, SearchFilterState } from '../types/anime';
import { AnimeService } from '../services/animeApi';
import { AnimeCard } from './AnimeCard';

interface CatalogSearchProps {
  initialGenre?: string;
  onSelectAnime: (anime: Anime) => void;
  onWatchAnime: (anime: Anime) => void;
  onToggleWatchlist: (anime: Anime) => void;
  isAnimeInWatchlist: (id: number) => boolean;
}

const GENRES = [
  'All',
  'Action',
  'Romance',
  'Comedy',
  'Fantasy',
  'Isekai',
  'Horror',
  'Mystery',
  'Slice of Life',
  'Sci-Fi',
  'Adventure',
  'Supernatural',
  'Drama',
  'Classic',
];

const YEARS = ['All', '2024', '2023', '2022', '2021', '2019', '2016', '2011', '<2010'];

const RATINGS = [
  { label: 'Any Rating', value: 0 },
  { label: '8.5+ Masterpiece', value: 8.5 },
  { label: '8.0+ Highly Rated', value: 8.0 },
  { label: '7.5+ Good', value: 7.5 },
];

export const CatalogSearch: React.FC<CatalogSearchProps> = ({
  initialGenre = 'All',
  onSelectAnime,
  onWatchAnime,
  onToggleWatchlist,
  isAnimeInWatchlist,
}) => {
  const [filters, setFilters] = useState<SearchFilterState>({
    query: '',
    genre: initialGenre,
    status: 'All',
    year: 'All',
    ratingMin: 0,
    sortBy: 'score_desc',
  });

  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<Anime[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      const { results: searchResults, isLiveApi: live } = await AnimeService.searchAnime(filters);
      if (!isCancelled) {
        setResults(searchResults);
        setIsLiveApi(live);
        setLoading(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [filters]);

  // Autocomplete calculation
  const handleQueryChange = (q: string) => {
    setFilters((prev) => ({ ...prev, query: q }));
    if (q.trim().length >= 2) {
      const matches = AnimeService.getCurated().filter((a) =>
        a.title.toLowerCase().includes(q.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (anime: Anime) => {
    setFilters((prev) => ({ ...prev, query: anime.title }));
    setShowSuggestions(false);
    onSelectAnime(anime);
  };

  const handleResetFilters = () => {
    setFilters({
      query: '',
      genre: 'All',
      status: 'All',
      year: 'All',
      ratingMin: 0,
      sortBy: 'score_desc',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Anime Catalog &amp; Discovery
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explore thousands of verified titles, seasonal premieres, and legal streaming hubs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-800/40">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isLiveApi ? 'Live MAL API Data' : 'Verified Archives'}</span>
            </span>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>
        </div>

        {/* Search input with autocomplete dropdown */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={filters.query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => filters.query.length >= 2 && setShowSuggestions(true)}
              placeholder="Search by anime title, character, or studio (e.g. Solo Leveling, Frieren, MAPPA)..."
              className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-lg"
            />
            {filters.query && (
              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, query: '' }));
                  setShowSuggestions(false);
                }}
                className="absolute right-3.5 p-1 text-slate-400 hover:text-white"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-40 overflow-hidden divide-y divide-slate-800">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item)}
                  className="flex items-center gap-3 p-3 hover:bg-slate-800/80 cursor-pointer transition-colors"
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-14 object-cover rounded bg-slate-950 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{item.year}</span>
                      <span>·</span>
                      <span>{item.genres[0]}</span>
                      <span>·</span>
                      <span className="text-amber-400 font-mono">★ {item.score.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          {/* Genre Segmented Tabs */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
              Genres
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {GENRES.map((g) => {
                const isActive = (filters.genre === g) || (g === 'All' && !filters.genre);
                return (
                  <button
                    key={g}
                    onClick={() => setFilters((prev) => ({ ...prev, genre: g }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/40 font-semibold'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Filter Dropdowns Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
            {/* Release Year */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">
                Release Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => setFilters((prev) => ({ ...prev, year: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-violet-500"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y} className="bg-slate-900">
                    {y === '<2010' ? 'Classic (<2010)' : y}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">
                Minimum Rating
              </label>
              <select
                value={filters.ratingMin}
                onChange={(e) => setFilters((prev) => ({ ...prev, ratingMin: Number(e.target.value) }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-violet-500"
              >
                {RATINGS.map((r) => (
                  <option key={r.value} value={r.value} className="bg-slate-900">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Airing Status */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="All" className="bg-slate-900">All Statuses</option>
                <option value="Ongoing" className="bg-slate-900">Ongoing / Airing</option>
                <option value="Completed" className="bg-slate-900">Completed</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sortBy: e.target.value as SearchFilterState['sortBy'] }))
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-violet-500 font-semibold"
              >
                <option value="score_desc" className="bg-slate-900">Highest Rated</option>
                <option value="popularity_asc" className="bg-slate-900">Most Popular</option>
                <option value="year_desc" className="bg-slate-900">Newest Release</option>
                <option value="title_asc" className="bg-slate-900">Title (A–Z)</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 py-1 px-2.5 rounded hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>
      )}

      {/* Results Count & Status */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
        <span>
          Found <strong className="text-white font-mono tabular-nums">{results.length}</strong> anime matching criteria
        </span>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col gap-2">
              <div className="aspect-[3/4] bg-slate-800 rounded-xl" />
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Search Grid Results */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              isInWatchlist={isAnimeInWatchlist(anime.id)}
              onSelect={onSelectAnime}
              onWatch={onWatchAnime}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && (
        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Film className="w-8 h-8 text-violet-400/60" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Anime Found</h3>
            <p className="text-xs text-slate-400">
              We couldn&apos;t find any titles matching &quot;{filters.query}&quot; with current filter parameters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-md transition-colors"
          >
            Clear Filters &amp; Browse All
          </button>
        </div>
      )}
    </div>
  );
};
