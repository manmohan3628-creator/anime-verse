import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Palette,
  Check,
  Sparkles,
  Cloud,
  Clock,
  Tv,
  Heart,
} from 'lucide-react';
import { UserProfile, WatchlistItem } from '../types/anime';
import { StorageService } from '../services/storageService';

interface UserProfileModalProps {
  profile: UserProfile;
  watchlist: WatchlistItem[];
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onTriggerToast: (title: string, message?: string, type?: 'success' | 'info' | 'error') => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profile,
  watchlist,
  onClose,
  onUpdateProfile,
  onTriggerToast,
}) => {
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [theme, setTheme] = useState(profile.preferredTheme);

  // Statistics
  const watchingCount = watchlist.filter((i) => i.status === 'Watching').length;
  const completedCount = watchlist.filter((i) => i.status === 'Completed').length;
  const favoritesCount = watchlist.filter((i) => i.isFavorite).length;
  const totalEpisodesEstimated = completedCount * 12 + watchingCount * 5;
  const totalHours = Math.round((totalEpisodesEstimated * 24) / 60);

  const handleSave = () => {
    const updated = StorageService.saveProfile({
      username: username.trim() || 'OtakuVoyager',
      bio: bio.trim(),
      avatar: selectedAvatar,
      preferredTheme: theme,
    });
    onUpdateProfile(updated);
    onTriggerToast('Profile Saved', 'Your user preferences have been updated.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white">Otaku Profile &amp; Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto no-scrollbar text-xs sm:text-sm">
          {/* User Watch Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
              <span className="text-xl font-extrabold text-violet-400 font-mono tabular-nums block">
                {watchlist.length}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">In Watchlist</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
              <span className="text-xl font-extrabold text-cyan-400 font-mono tabular-nums block">
                {completedCount}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Completed</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
              <span className="text-xl font-extrabold text-rose-400 font-mono tabular-nums block">
                {favoritesCount}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Favorites</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
              <span className="text-xl font-extrabold text-amber-400 font-mono tabular-nums block">
                ~{totalHours}h
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Hours Watched</span>
            </div>
          </div>

          {/* Edit Nickname & Bio */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Otaku Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={30}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Bio &amp; Favorite Genres
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                maxLength={120}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>
          </div>

          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-violet-400" />
              <span>Appearance &amp; Theme Mode</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'midnight', label: 'Dark Midnight' },
                { id: 'dark', label: 'OLED Obsidian' },
                { id: 'light', label: 'Clean Contrast' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id as UserProfile['preferredTheme'])}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    theme === item.id
                      ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cross-Device Sync Path Notice */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3 text-xs">
            <Cloud className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">Cross-Device Cloud Sync Ready</span>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Your data is securely kept in high-speed local browser storage. You can backup your library anytime using the JSON Export button in your Watchlist, or connect to our Cloud SQL / Firebase backend for multi-device sync.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-md transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
