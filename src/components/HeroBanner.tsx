import React, { useState, useEffect } from 'react';
import { Play, Plus, Check, Info, Star, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { Anime } from '../types/anime';

interface HeroBannerProps {
  featuredAnimeList: Anime[];
  onSelectAnime: (anime: Anime) => void;
  onWatchAnime: (anime: Anime) => void;
  onToggleWatchlist: (anime: Anime) => void;
  isAnimeInWatchlist: (id: number) => boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredAnimeList,
  onSelectAnime,
  onWatchAnime,
  onToggleWatchlist,
  isAnimeInWatchlist,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const count = featuredAnimeList?.length || 0;

  // Auto rotate banner every 7 seconds unless hovered
  useEffect(() => {
    if (isPaused || count <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, 7000);
    return () => clearInterval(interval);
  }, [count, isPaused]);

  // If list is empty, show loading skeleton (rendered after hooks)
  if (!featuredAnimeList || featuredAnimeList.length === 0) {
    return (
      <div className="w-full h-[520px] sm:h-[600px] lg:h-[660px] bg-slate-950 animate-pulse flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const currentAnime = featuredAnimeList[currentIndex % featuredAnimeList.length] || featuredAnimeList[0];
  const inWatchlist = isAnimeInWatchlist(currentAnime.id);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredAnimeList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredAnimeList.length);
  };

  return (
    <div
      className="relative w-full h-[520px] sm:h-[600px] lg:h-[660px] overflow-hidden bg-slate-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Anime Artwork with Crossfade */}
      <div className="absolute inset-0">
        <img
          key={currentAnime.id}
          src={currentAnime.banner || currentAnime.poster}
          alt={currentAnime.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top opacity-50 sm:opacity-60 scale-105 transition-all duration-700 filter brightness-90 contrast-110"
        />

        {/* Ambient Dark & Neon Gradient Scrims for 100% Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-[#070913]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070913] via-[#070913]/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
      </div>

      {/* Hero Content Area */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Spotlight Tag */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 rounded-md">
              {currentAnime.featuredTag || 'Featured Premiere'}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Legal Stream</span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none text-balance">
            {currentAnime.title}
          </h1>

          {/* Japanese Subtitle if present */}
          {currentAnime.titleJapanese && (
            <p className="text-sm font-medium text-violet-300/80 tracking-widest">
              {currentAnime.titleJapanese}
            </p>
          )}

          {/* Unboxed Metadata Line */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-300 font-medium">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="font-mono tabular-nums font-bold">{currentAnime.score.toFixed(1)}</span>
            </div>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{currentAnime.year}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{currentAnime.status}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono tabular-nums">{currentAnime.episodes ? `${currentAnime.episodes} Episodes` : 'Ongoing'}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-violet-300">{currentAnime.genres.slice(0, 3).join(', ')}</span>
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed max-w-xl">
            {currentAnime.synopsis}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onWatchAnime(currentAnime)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all glow-purple"
              aria-label={`Watch ${currentAnime.title} now`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Now</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(currentAnime)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border backdrop-blur-md transition-all ${
                inWatchlist
                  ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300 hover:bg-emerald-600/30'
                  : 'bg-slate-900/80 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-violet-500/50'
              }`}
              aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{inWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
            </button>

            <button
              onClick={() => onSelectAnime(currentAnime)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white backdrop-blur-md transition-all"
              aria-label={`View details for ${currentAnime.title}`}
            >
              <Info className="w-4 h-4" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Banner Carousel Controls */}
      <div className="absolute bottom-6 right-4 sm:right-8 z-20 flex items-center gap-3">
        <button
          onClick={handlePrev}
          className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
          aria-label="Previous featured anime"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5">
          {featuredAnimeList.map((anime, idx) => (
            <button
              key={anime.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-6 bg-gradient-to-r from-violet-500 to-cyan-400'
                  : 'w-2 bg-slate-600 hover:bg-slate-500'
              }`}
              aria-label={`Jump to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
          aria-label="Next featured anime"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
