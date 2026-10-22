import React, { useState } from 'react';
import {
  Bookmark,
  Heart,
  Play,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Anime, WatchlistItem, WatchlistStatus } from '../types/anime';
import { StorageService } from '../services/storageService';

interface WatchlistViewProps {
  watchlist: WatchlistItem[];
  onSelectAnime: (anime: Anime) => void;
  onWatchAnime: (anime: Anime) => void;
  onUpdateStatus: (animeId: number, status: WatchlistStatus) => void;
  onRemove: (animeId: number) => void;
  onToggleFavorite: (animeId: number) => void;
  onNavigateToCatalog: () => void;
  onTriggerToast: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
  refreshWatchlist: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlist,
  onSelectAnime,
  onWatchAnime,
  onUpdateStatus,
  onRemove,
  onToggleFavorite,
  onNavigateToCatalog,
  onTriggerToast,
  refreshWatchlist,
}) => {
  const [filterTab, setFilterTab] = useState<string>('All');

  const tabs = ['All', 'Watching', 'Plan to Watch', 'Completed', 'Favorites'];

  // Filter items
  const filteredList = watchlist.filter((item) => {
    if (filterTab === 'All') return true;
    if (filterTab === 'Favorites') return item.isFavorite;
    return item.status === filterTab;
  });

  const favoritesCount = watchlist.filter((i) => i.isFavorite).length;

  // Export JSON
  const handleExport = () => {
    const dataStr = StorageService.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `animeverse_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onTriggerToast('Watchlist Exported', 'JSON backup file successfully saved.', 'success');
  };

  // Import JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = StorageService.importData(content);
      if (ok) {
        refreshWatchlist();
        onTriggerToast('Watchlist Restored', 'Imported data synced to local storage.', 'success');
      } else {
        onTriggerToast('Import Failed', 'Invalid JSON backup format.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-violet-400" />
            <span>My Watchlist &amp; Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your watching status, episode progress, and favorite anime
          </p>
        </div>

        {/* Backup & Cross-device migration buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
            title="Export Watchlist Backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <label
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Restore from JSON Backup"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = filterTab === tab;
          let count = 0;
          if (tab === 'All') count = watchlist.length;
          else if (tab === 'Favorites') count = favoritesCount;
          else count = watchlist.filter((i) => i.status === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${isActive ? 'bg-violet-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => {
            const anime = item.anime;
            return (
              <div
                key={anime.id}
                className="flex gap-3.5 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-violet-500/50 transition-all group"
              >
                {/* Poster */}
                <div
                  onClick={() => onSelectAnime(anime)}
                  className="w-24 aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 shrink-0 cursor-pointer relative"
                >
                  <img
                    src={anime.poster}
                    alt={anime.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h3
                        onClick={() => onSelectAnime(anime)}
                        className="text-sm font-bold text-slate-100 truncate hover:text-violet-300 cursor-pointer"
                      >
                        {anime.title}
                      </h3>
                      <button
                        onClick={() => onToggleFavorite(anime.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 shrink-0"
                        title={item.isFavorite ? 'Remove favorite' : 'Add to favorites'}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            item.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <span>{anime.year}</span>
                      <span>·</span>
                      <span className="truncate">{anime.genres[0]}</span>
                      <span>·</span>
                      <span className="text-amber-400 font-mono">★ {anime.score.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Status Picker & Actions */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        onUpdateStatus(anime.id, e.target.value as WatchlistStatus)
                      }
                      className="bg-slate-800 text-slate-200 text-xs font-semibold px-2 py-1 rounded-md border border-slate-700/80 focus:outline-none focus:border-violet-500"
                    >
                      <option value="Watching">Watching</option>
                      <option value="Plan to Watch">Plan to Watch</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Dropped">Dropped</option>
                    </select>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onWatchAnime(anime)}
                        className="p-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600 text-violet-300 hover:text-white transition-colors"
                        title="Watch Episode"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={() => onRemove(anime.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Bookmark className="w-8 h-8 text-violet-400/60" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Your Watchlist is Empty</h3>
            <p className="text-xs text-slate-400 mt-1">
              {filterTab === 'All'
                ? 'Start building your queue by exploring trending anime, classics, and newly released episodes.'
                : `No anime currently marked as "${filterTab}".`}
            </p>
          </div>
          <button
            onClick={onNavigateToCatalog}
            className="px-5 py-2.5 text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-lg shadow-violet-600/30 transition-all glow-purple"
          >
            Discover Anime
          </button>
        </div>
      )}
    </div>
  );
};
