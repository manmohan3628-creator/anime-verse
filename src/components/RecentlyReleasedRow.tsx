import React from 'react';
import { Play, Clock, Sparkles } from 'lucide-react';
import { Anime, Episode } from '../types/anime';

interface RecentlyReleasedRowProps {
  recentItems: Array<{ anime: Anime; episode: Episode; releaseTime: string }>;
  onWatchEpisode: (anime: Anime, episode: Episode) => void;
  onSelectAnime: (anime: Anime) => void;
}

export const RecentlyReleasedRow: React.FC<RecentlyReleasedRowProps> = ({
  recentItems,
  onWatchEpisode,
  onSelectAnime,
}) => {
  if (!recentItems || recentItems.length === 0) return null;

  return (
    <section className="py-4 space-y-3">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Recently Released Episodes</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Freshly broadcast simulcasts with authorized official streaming feeds
          </p>
        </div>
      </div>

      <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 py-2">
        {recentItems.map(({ anime, episode, releaseTime }) => (
          <div
            key={`${anime.id}_${episode.id}`}
            onClick={() => onWatchEpisode(anime, episode)}
            className="w-64 sm:w-72 flex-shrink-0 group rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-950/30 cursor-pointer flex flex-col justify-between"
          >
            {/* Episode Image Preview */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
              <img
                src={episode.thumbnail || anime.banner || anime.poster}
                alt={`${anime.title} Episode ${episode.episodeNumber}`}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-950/50 backdrop-blur-xs transition-opacity">
                <div className="w-10 h-10 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </div>
              </div>

              {/* Episode tag */}
              <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-white bg-slate-950/90 px-2 py-0.5 rounded border border-white/10 font-mono tabular-nums">
                  EP {episode.episodeNumber}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>{releaseTime}</span>
                </span>
              </div>
            </div>

            {/* Info details */}
            <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between">
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAnime(anime);
                  }}
                  className="text-xs font-semibold text-violet-400 hover:underline truncate block text-left w-full"
                >
                  {anime.title}
                </button>
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1 mt-0.5">
                  {episode.title}
                </h4>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="font-mono tabular-nums">{episode.duration}</span>
                <span className="text-emerald-400 font-medium">Authorized Stream</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
