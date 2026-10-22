import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Anime } from '../types/anime';
import { AnimeCard } from './AnimeCard';

interface AnimeRowProps {
  title: string;
  subtitle?: string;
  animeList: Anime[];
  onSelectAnime: (anime: Anime) => void;
  onWatchAnime: (anime: Anime) => void;
  onToggleWatchlist: (anime: Anime) => void;
  isAnimeInWatchlist: (id: number) => boolean;
  viewAllAction?: () => void;
}

export const AnimeRow: React.FC<AnimeRowProps> = ({
  title,
  subtitle,
  animeList,
  onSelectAnime,
  onWatchAnime,
  onToggleWatchlist,
  isAnimeInWatchlist,
  viewAllAction,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Deduplicate anime items to ensure no duplicate cards appear in the row
  const uniqueAnimeList = React.useMemo(() => {
    const seen = new Set<number>();
    return animeList.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }, [animeList]);

  if (!uniqueAnimeList || uniqueAnimeList.length === 0) {
    return null;
  }

  return (
    <section className="relative py-4 space-y-3">
      {/* Row Header */}
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewAllAction && (
            <button
              onClick={viewAllAction}
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors py-1 px-2"
            >
              Explore All
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={rowRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 py-2 scroll-smooth"
      >
        {uniqueAnimeList.map((anime, idx) => (
          <div key={`${anime.id}_${idx}`} className="w-36 sm:w-44 md:w-48 flex-shrink-0">
            <AnimeCard
              anime={anime}
              isInWatchlist={isAnimeInWatchlist(anime.id)}
              onSelect={onSelectAnime}
              onWatch={onWatchAnime}
              onToggleWatchlist={onToggleWatchlist}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
