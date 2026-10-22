import React, { useState } from 'react';
import {
  X,
  Play,
  Star,
  Plus,
  Check,
  Heart,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Anime, Episode, WatchlistStatus } from '../types/anime';
import { AnimeCard } from './AnimeCard';

interface AnimeDetailsModalProps {
  anime: Anime | null;
  onClose: () => void;
  onWatch: (anime: Anime, episode?: Episode) => void;
  onToggleFavorite: (animeId: number) => void;
  isFavorite: boolean;
  watchlistStatus?: WatchlistStatus;
  onUpdateWatchlistStatus: (anime: Anime, status: WatchlistStatus) => void;
  onRemoveFromWatchlist: (animeId: number) => void;
  similarAnime: Anime[];
  onSelectSimilar: (anime: Anime) => void;
  isEpisodeWatched: (animeId: number, epNumber: number) => boolean;
  onToggleEpisodeWatched: (animeId: number, epNumber: number) => void;
}

export const AnimeDetailsModal: React.FC<AnimeDetailsModalProps> = ({
  anime,
  onClose,
  onWatch,
  onToggleFavorite,
  isFavorite,
  watchlistStatus,
  onUpdateWatchlistStatus,
  onRemoveFromWatchlist,
  similarAnime,
  onSelectSimilar,
  isEpisodeWatched,
  onToggleEpisodeWatched,
}) => {
  const [selectedSeason, setSelectedSeason] = useState('Season 1');
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  if (!anime) return null;

  const episodes = anime.episodesList && anime.episodesList.length > 0
    ? anime.episodesList
    : [
        {
          id: Number(`${anime.id}1`),
          episodeNumber: 1,
          title: 'Pilot Episode',
          duration: anime.duration || '24 min',
          synopsis: `Opening chapter of ${anime.title}.`,
          isOfficialFree: true,
        },
      ];

  const watchlistOptions: WatchlistStatus[] = [
    'Watching',
    'Plan to Watch',
    'Completed',
    'On Hold',
    'Dropped',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-950/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          aria-label="Close anime details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 no-scrollbar">
          {/* Header Banner */}
          <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-950">
            <img
              src={anime.banner || anime.poster}
              alt={anime.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent" />

            {/* Bottom Overlay Info */}
            <div className="absolute bottom-4 left-4 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end gap-4 z-10">
              {/* Poster Thumbnail */}
              <div className="hidden sm:block w-32 sm:w-40 aspect-[3/4] rounded-xl overflow-hidden border-2 border-slate-700/60 shadow-2xl shrink-0 bg-slate-950">
                <img
                  src={anime.poster}
                  alt={anime.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Fast CTAs */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-violet-600/30 text-violet-300 border border-violet-500/40">
                    {anime.status}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-300 bg-slate-950/70 px-2 py-0.5 rounded border border-amber-500/30">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-mono tabular-nums font-bold">{anime.score.toFixed(1)}</span>
                  </div>
                  {anime.rank && (
                    <span className="text-xs text-slate-300 bg-slate-950/70 px-2 py-0.5 rounded font-mono tabular-nums border border-slate-700">
                      Rank #{anime.rank}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {anime.title}
                </h2>
                {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                  <p className="text-sm text-slate-400">{anime.titleEnglish}</p>
                )}

                {/* Primary Action Button Cluster */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    onClick={() => onWatch(anime, episodes[0])}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 transition-all glow-purple"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Watch Now</span>
                  </button>

                  {/* Watchlist dropdown */}
                  <div className="relative group">
                    <select
                      value={watchlistStatus || ''}
                      onChange={(e) => {
                        const val = e.target.value as WatchlistStatus;
                        if (!val) {
                          onRemoveFromWatchlist(anime.id);
                        } else {
                          onUpdateWatchlistStatus(anime, val);
                        }
                      }}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold border backdrop-blur-md transition-all appearance-none pr-8 cursor-pointer ${
                        watchlistStatus
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-violet-400'
                      }`}
                    >
                      <option value="" className="bg-slate-900 text-slate-300">
                        + Add to Watchlist
                      </option>
                      {watchlistOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-slate-200">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      {watchlistStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Favorite Toggle */}
                  <button
                    onClick={() => onToggleFavorite(anime.id)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isFavorite
                        ? 'bg-rose-950/60 border-rose-500 text-rose-400 shadow-md shadow-rose-900/30'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-rose-400/50'
                    }`}
                    title={isFavorite ? 'In Favorites' : 'Add to Favorites'}
                    aria-label="Toggle Favorite"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* Metadata Badges & Specs Bar - clean unboxed layout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block uppercase font-mono tracking-wider text-[10px]">Year / Season</span>
                <span className="font-semibold text-slate-200">{anime.season || anime.year}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-mono tracking-wider text-[10px]">Episodes</span>
                <span className="font-semibold text-slate-200 font-mono tabular-nums">
                  {anime.episodes ? `${anime.episodes} Episodes` : 'Ongoing'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-mono tracking-wider text-[10px]">Studio</span>
                <span className="font-semibold text-slate-200 truncate block">{anime.studio}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-mono tracking-wider text-[10px]">Content Rating</span>
                <span className="font-semibold text-slate-200">{anime.rating}</span>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase font-mono text-[11px]">
                Synopsis
              </h3>
              <p
                className={`text-sm text-slate-300 leading-relaxed ${
                  !synopsisExpanded ? 'line-clamp-3' : ''
                }`}
              >
                {anime.synopsis}
              </p>
              {anime.synopsis.length > 200 && (
                <button
                  onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                  className="text-xs font-semibold text-violet-400 hover:underline"
                >
                  {synopsisExpanded ? 'Read Less' : 'Read Full Synopsis'}
                </button>
              )}
            </div>

            {/* Genres */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase font-mono text-[11px]">
                Genres
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {anime.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/60 font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Authorized Legal Streaming Providers Section */}
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-300">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-sm font-bold">Authorized Streaming Providers</h4>
                </div>
                <span className="text-[11px] text-cyan-400/80 font-medium">100% Legal & Official</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Watch full licensed episodes and simulcasts directly via official licensed partner platforms:
              </p>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {anime.legalProviders.map((provider) => (
                  <a
                    key={provider.name}
                    href={provider.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-cyan-700/40 hover:border-cyan-400 text-xs font-semibold text-slate-100 transition-colors group"
                  >
                    <span>{provider.name}</span>
                    {provider.badgeText && (
                      <span className="text-[10px] text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/50">
                        {provider.badgeText}
                      </span>
                    )}
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            {/* Season and Episode Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-400" />
                  <h3 className="text-base font-bold text-white">Episodes</h3>
                </div>

                {/* Season Picker */}
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="bg-slate-800 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
                >
                  <option value="Season 1">Season 1 ({episodes.length} Episodes)</option>
                </select>
              </div>

              {/* Episode List */}
              <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar pr-1">
                {episodes.map((ep) => {
                  const watched = isEpisodeWatched(anime.id, ep.episodeNumber);
                  return (
                    <div
                      key={ep.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-violet-500/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => onWatch(anime, ep)}
                          className="w-8 h-8 rounded-lg bg-violet-600/30 group-hover:bg-violet-600 text-violet-300 group-hover:text-white flex items-center justify-center shrink-0 transition-colors"
                          aria-label={`Play Episode ${ep.episodeNumber}`}
                        >
                          <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 font-mono tabular-nums">
                              EP {ep.episodeNumber}
                            </span>
                            <span className="text-xs text-slate-500">·</span>
                            <h5 className="text-xs font-semibold text-slate-200 truncate group-hover:text-violet-300">
                              {ep.title}
                            </h5>
                          </div>
                          {ep.synopsis && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{ep.synopsis}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="text-xs text-slate-400 font-mono tabular-nums">
                          {ep.duration}
                        </span>

                        <button
                          onClick={() => onToggleEpisodeWatched(anime.id, ep.episodeNumber)}
                          className={`p-1.5 rounded-md transition-colors ${
                            watched
                              ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/40'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title={watched ? 'Mark as unwatched' : 'Mark as watched'}
                          aria-label={watched ? 'Mark as unwatched' : 'Mark as watched'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Similar Anime Recommendations */}
            {similarAnime.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>Similar Anime Recommendations</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {similarAnime.slice(0, 4).map((sim) => (
                    <div
                      key={sim.id}
                      onClick={() => onSelectSimilar(sim)}
                      className="cursor-pointer group rounded-lg overflow-hidden bg-slate-950 border border-slate-800 hover:border-violet-500/50 p-2 transition-all"
                    >
                      <div className="aspect-[3/4] rounded-md overflow-hidden bg-slate-900 mb-2">
                        <img
                          src={sim.poster}
                          alt={sim.title}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h5 className="text-xs font-bold text-slate-200 truncate group-hover:text-violet-300">
                        {sim.title}
                      </h5>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>{sim.year}</span>
                        <span className="text-amber-400 font-mono font-bold">★ {sim.score.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
