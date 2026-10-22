import React, { useState } from 'react';
import { Play, Star, Plus, Check, Info, Film } from 'lucide-react';
import { Anime } from '../types/anime';

interface AnimeCardProps {
  anime: Anime;
  isInWatchlist?: boolean;
  onSelect: (anime: Anime) => void;
  onWatch: (anime: Anime) => void;
  onToggleWatchlist?: (anime: Anime) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  isInWatchlist = false,
  onSelect,
  onWatch,
  onToggleWatchlist,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const primaryGenre = anime.genres && anime.genres.length > 0 ? anime.genres[0] : 'Anime';

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800/80 hover:border-violet-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-950/30 flex-shrink-0 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(anime)}
    >
      {/* Poster Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
        {!imgError && anime.poster ? (
          <img
            src={anime.poster}
            alt={anime.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-800 to-slate-950 text-slate-400">
            <Film className="w-10 h-10 mb-2 text-violet-400/60" />
            <span className="text-xs font-semibold text-center line-clamp-2 text-slate-300">
              {anime.title}
            </span>
          </div>
        )}

        {/* Subtle Dark Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Status & Score Indicators - unboxed clean presentation */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs font-medium">
          <span className="text-[11px] font-semibold tracking-wide text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-sm border border-cyan-500/20">
            {anime.status}
          </span>
          <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-sm border border-amber-500/20 text-amber-300">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-mono tabular-nums text-xs font-bold">{anime.score.toFixed(1)}</span>
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWatch(anime);
            }}
            className="w-11 h-11 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-600/40 transform hover:scale-110 active:scale-95 transition-all"
            title="Watch Now"
            aria-label={`Watch ${anime.title}`}
          >
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </button>

          <div className="flex items-center gap-2">
            {onToggleWatchlist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatchlist(anime);
                }}
                className={`p-2 rounded-full border transition-all ${
                  isInWatchlist
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-violet-400'
                }`}
                title={isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                aria-label={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(anime);
              }}
              className="p-2 rounded-full bg-slate-800/80 border border-slate-700 text-slate-200 hover:border-violet-400 transition-all"
              title="More Details"
              aria-label={`More details about ${anime.title}`}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Metadata Details */}
      <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between">
        <div>
          <h3
            className="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-violet-300 transition-colors"
            title={anime.title}
          >
            {anime.title}
          </h3>

          {/* Clean unboxed metadata with typographic separators */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <span>{anime.year}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="truncate max-w-[90px]">{primaryGenre}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono tabular-nums">{anime.episodes ? `${anime.episodes} eps` : 'TV'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
