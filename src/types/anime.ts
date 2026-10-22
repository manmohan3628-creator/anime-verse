export type AnimeStatus = 'Ongoing' | 'Completed' | 'Upcoming';

export interface LegalStreamingProvider {
  name: string;
  url: string;
  free: boolean;
  logo?: string;
  badgeText?: string;
  type: 'subscription' | 'free_with_ads' | 'official_channel';
}

export interface Episode {
  id: number;
  episodeNumber: number;
  title: string;
  thumbnail?: string;
  duration: string;
  synopsis?: string;
  airDate?: string;
  videoUrl?: string; // Authorized direct media or sample stream
  isOfficialFree: boolean;
}

export interface Anime {
  id: number;
  title: string;
  titleEnglish?: string;
  titleJapanese?: string;
  poster: string;
  banner: string;
  synopsis: string;
  year: number;
  season?: string;
  genres: string[];
  score: number;
  scoredBy?: number;
  rank?: number;
  popularity?: number;
  status: AnimeStatus;
  episodes: number | null;
  duration: string;
  rating: string;
  studio: string;
  trailerYoutubeId?: string;
  legalProviders: LegalStreamingProvider[];
  officialFreeStreamUrl?: string;
  episodesList: Episode[];
  featuredTag?: string;
}

export type WatchlistStatus = 'Watching' | 'Plan to Watch' | 'Completed' | 'On Hold' | 'Dropped';

export interface WatchlistItem {
  animeId: number;
  anime: Anime;
  addedAt: string;
  status: WatchlistStatus;
  isFavorite: boolean;
  userRating?: number;
}

export interface WatchProgress {
  animeId: number;
  episodeNumber: number;
  currentTime: number;
  duration: number;
  watchedAt: string;
  isCompleted: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  joinedDate: string;
  preferredTheme: 'dark' | 'midnight' | 'light';
  notificationsEnabled: boolean;
  autoPlayNext: boolean;
}

export interface SearchFilterState {
  query: string;
  genre: string;
  status: string;
  year: string;
  ratingMin: number;
  sortBy: 'score_desc' | 'popularity_asc' | 'year_desc' | 'title_asc';
}
