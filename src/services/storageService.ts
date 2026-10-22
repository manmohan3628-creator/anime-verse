import { Anime, WatchlistItem, WatchProgress, UserProfile, WatchlistStatus } from '../types/anime';

const STORAGE_KEYS = {
  WATCHLIST: 'animeverse_watchlist_v1',
  PROGRESS: 'animeverse_progress_v1',
  PROFILE: 'animeverse_profile_v1',
  FAVORITES: 'animeverse_favorites_v1',
  SETTINGS: 'animeverse_settings_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_default_otaku',
  username: 'OtakuVoyager',
  avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
  bio: 'Exploring anime universes across galaxies. Shonen and psychological thriller aficionado.',
  joinedDate: 'October 2024',
  preferredTheme: 'midnight',
  notificationsEnabled: true,
  autoPlayNext: true,
};

export const StorageService = {
  // Watchlist
  getWatchlist(): WatchlistItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToWatchlist(anime: Anime, status: WatchlistStatus = 'Plan to Watch'): WatchlistItem[] {
    const list = this.getWatchlist();
    const existingIndex = list.findIndex((item) => item.animeId === anime.id);

    if (existingIndex >= 0) {
      list[existingIndex].status = status;
    } else {
      list.unshift({
        animeId: anime.id,
        anime,
        addedAt: new Date().toISOString(),
        status,
        isFavorite: false,
      });
    }

    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
    return list;
  },

  removeFromWatchlist(animeId: number): WatchlistItem[] {
    const list = this.getWatchlist().filter((item) => item.animeId !== animeId);
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
    return list;
  },

  updateWatchlistStatus(animeId: number, status: WatchlistStatus): WatchlistItem[] {
    const list = this.getWatchlist().map((item) => {
      if (item.animeId === animeId) {
        return { ...item, status };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
    return list;
  },

  // Favorites
  getFavorites(): number[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleFavorite(animeId: number): boolean {
    const favs = this.getFavorites();
    let isFav = false;
    let updated: number[];

    if (favs.includes(animeId)) {
      updated = favs.filter((id) => id !== animeId);
      isFav = false;
    } else {
      updated = [...favs, animeId];
      isFav = true;
    }

    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));

    // Also sync in watchlist if present
    const list = this.getWatchlist().map((item) => {
      if (item.animeId === animeId) {
        return { ...item, isFavorite: isFav };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));

    return isFav;
  },

  isFavorite(animeId: number): boolean {
    return this.getFavorites().includes(animeId);
  },

  // Watch Progress
  getProgress(): Record<string, WatchProgress> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  getAnimeProgress(animeId: number, episodeNumber: number): WatchProgress | null {
    const all = this.getProgress();
    return all[`${animeId}_${episodeNumber}`] || null;
  },

  saveProgress(animeId: number, episodeNumber: number, currentTime: number, duration: number, isCompleted = false) {
    const all = this.getProgress();
    all[`${animeId}_${episodeNumber}`] = {
      animeId,
      episodeNumber,
      currentTime,
      duration,
      watchedAt: new Date().toISOString(),
      isCompleted: isCompleted || (duration > 0 && currentTime / duration > 0.85),
    };
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(all));
  },

  markEpisodeWatched(animeId: number, episodeNumber: number, watched: boolean) {
    const all = this.getProgress();
    const key = `${animeId}_${episodeNumber}`;
    if (watched) {
      all[key] = {
        animeId,
        episodeNumber,
        currentTime: 1440,
        duration: 1440,
        watchedAt: new Date().toISOString(),
        isCompleted: true,
      };
    } else {
      delete all[key];
    }
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(all));
  },

  // User Profile
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  },

  // Export / Import Data
  exportData(): string {
    const exportBundle = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      watchlist: this.getWatchlist(),
      favorites: this.getFavorites(),
      progress: this.getProgress(),
      profile: this.getProfile(),
    };
    return JSON.stringify(exportBundle, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.watchlist) {
        localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(parsed.watchlist));
      }
      if (parsed.favorites) {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(parsed.favorites));
      }
      if (parsed.progress) {
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(parsed.progress));
      }
      if (parsed.profile) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed.profile));
      }
      return true;
    } catch {
      return false;
    }
  },
};
