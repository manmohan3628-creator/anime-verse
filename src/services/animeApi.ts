import { Anime, SearchFilterState, Episode } from '../types/anime';
import { CURATED_ANIME_DATA } from './animeData';

// Jikan API base URL
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// In-memory cache to prevent redundant API calls
const apiCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Safe fetch wrapper with timeout and cache
async function cachedFetch<T>(url: string): Promise<T | null> {
  const cached = apiCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      // If rate limited or error, return null to trigger graceful local fallback
      return null;
    }

    const data = await response.json();
    apiCache.set(url, { data, timestamp: Date.now() });
    return data as T;
  } catch {
    return null;
  }
}

// Convert Jikan API anime item into our clean Anime interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapJikanToAnime(item: any): Anime {
  const genres = Array.isArray(item.genres)
    ? item.genres.map((g: { name: string }) => g.name)
    : [];

  const year =
    item.year ||
    (item.aired?.prop?.from?.year ? item.aired.prop.from.year : 2024);

  const trailerId = item.trailer?.youtube_id || undefined;
  const youtubeEmbed = trailerId ? `https://www.youtube.com/embed/${trailerId}` : undefined;

  const mockEpisodes: Episode[] = [];
  const epCount = item.episodes || 12;
  const maxToGenerate = Math.min(epCount, 12);
  for (let i = 1; i <= maxToGenerate; i++) {
    mockEpisodes.push({
      id: Number(`${item.mal_id}${i}`),
      episodeNumber: i,
      title: i === 1 ? 'Prologue / Pilot' : `Episode ${i}`,
      duration: item.duration || '24 min',
      thumbnail: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url,
      synopsis: `Episode ${i} continues the journey of ${item.title}.`,
      isOfficialFree: i === 1,
    });
  }

  const encodedTitle = encodeURIComponent(item.title);

  return {
    id: item.mal_id,
    title: item.title,
    titleEnglish: item.title_english || item.title,
    titleJapanese: item.title_japanese || '',
    poster: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || '',
    banner: item.images?.jpg?.large_image_url || item.images?.webp?.image_url || '',
    synopsis: item.synopsis || 'No synopsis provided for this title.',
    year: year,
    season: item.season ? `${item.season.charAt(0).toUpperCase() + item.season.slice(1)} ${year}` : `${year}`,
    genres: genres.length > 0 ? genres : ['Animation', 'Action'],
    score: item.score || 8.0,
    scoredBy: item.scored_by || 10000,
    rank: item.rank || 500,
    popularity: item.popularity || 999,
    status: item.airing ? 'Ongoing' : 'Completed',
    episodes: item.episodes || null,
    duration: item.duration || '24 min',
    rating: item.rating || 'PG-13',
    studio: item.studios?.[0]?.name || 'Animation Studio',
    trailerYoutubeId: trailerId,
    legalProviders: [
      {
        name: 'Crunchyroll',
        url: `https://www.crunchyroll.com/search?q=${encodedTitle}`,
        free: false,
        badgeText: 'Official Licensor',
        type: 'subscription',
      },
      {
        name: 'Netflix',
        url: `https://www.netflix.com/search?q=${encodedTitle}`,
        free: false,
        badgeText: 'Streaming Partner',
        type: 'subscription',
      },
      {
        name: 'Ani-One / Muse',
        url: `https://www.youtube.com/results?search_query=${encodedTitle}+official+episode`,
        free: true,
        badgeText: 'Official Free Broadcast',
        type: 'official_channel',
      },
    ],
    officialFreeStreamUrl: youtubeEmbed,
    episodesList: mockEpisodes,
  };
}

export const AnimeService = {
  // Get all curated anime base
  getCurated(): Anime[] {
    return CURATED_ANIME_DATA;
  },

  // Get anime by ID (curated first, then Jikan API)
  async getAnimeById(id: number): Promise<Anime | null> {
    const local = CURATED_ANIME_DATA.find((a) => a.id === id);
    if (local) return local;

    // Fetch from Jikan API
    const res = await cachedFetch<{ data: unknown }>(`${JIKAN_BASE_URL}/anime/${id}/full`);
    if (res && res.data) {
      return mapJikanToAnime(res.data);
    }
    return null;
  },

  // Trending Anime
  async getTrendingAnime(): Promise<Anime[]> {
    // Try Jikan top anime airing
    const res = await cachedFetch<{ data: unknown[] }>(`${JIKAN_BASE_URL}/top/anime?filter=airing&limit=10`);
    if (res && res.data && res.data.length > 0) {
      const live = res.data.map(mapJikanToAnime);
      // Merge unique with curated
      const combined = [...CURATED_ANIME_DATA.slice(0, 4)];
      live.forEach((item) => {
        if (!combined.some((c) => c.id === item.id)) {
          combined.push(item);
        }
      });
      return combined.slice(0, 10);
    }
    return CURATED_ANIME_DATA.filter((a) => a.score >= 8.3).slice(0, 10);
  },

  // Popular This Season
  async getPopularThisSeason(): Promise<Anime[]> {
    const res = await cachedFetch<{ data: unknown[] }>(`${JIKAN_BASE_URL}/seasons/now?limit=10`);
    if (res && res.data && res.data.length > 0) {
      const live = res.data.map(mapJikanToAnime);
      return live.slice(0, 10);
    }
    return CURATED_ANIME_DATA.filter((a) => a.year >= 2023).slice(0, 10);
  },

  // Most Watched Anime
  async getMostWatched(): Promise<Anime[]> {
    const res = await cachedFetch<{ data: unknown[] }>(`${JIKAN_BASE_URL}/top/anime?filter=bypopularity&limit=10`);
    if (res && res.data && res.data.length > 0) {
      return res.data.map(mapJikanToAnime).slice(0, 10);
    }
    return [...CURATED_ANIME_DATA].sort((a, b) => (b.scoredBy || 0) - (a.scoredBy || 0)).slice(0, 10);
  },

  // Top-Rated Anime
  async getTopRated(): Promise<Anime[]> {
    const res = await cachedFetch<{ data: unknown[] }>(`${JIKAN_BASE_URL}/top/anime?limit=10`);
    if (res && res.data && res.data.length > 0) {
      return res.data.map(mapJikanToAnime).slice(0, 10);
    }
    return [...CURATED_ANIME_DATA].sort((a, b) => b.score - a.score).slice(0, 10);
  },

  // Recently Released Episodes
  getRecentlyReleased(): Array<{ anime: Anime; episode: Episode; releaseTime: string }> {
    return [
      {
        anime: CURATED_ANIME_DATA[0], // Solo Leveling
        episode: CURATED_ANIME_DATA[0].episodesList[CURATED_ANIME_DATA[0].episodesList.length - 1] || CURATED_ANIME_DATA[0].episodesList[0],
        releaseTime: '2 hours ago',
      },
      {
        anime: CURATED_ANIME_DATA[3], // Dandadan
        episode: CURATED_ANIME_DATA[3].episodesList[1] || CURATED_ANIME_DATA[3].episodesList[0],
        releaseTime: '5 hours ago',
      },
      {
        anime: CURATED_ANIME_DATA[1], // Frieren
        episode: CURATED_ANIME_DATA[1].episodesList[CURATED_ANIME_DATA[1].episodesList.length - 1],
        releaseTime: 'Yesterday',
      },
      {
        anime: CURATED_ANIME_DATA[7], // Bleach
        episode: CURATED_ANIME_DATA[7].episodesList[0],
        releaseTime: '2 days ago',
      },
      {
        anime: CURATED_ANIME_DATA[4], // Jujutsu Kaisen
        episode: CURATED_ANIME_DATA[4].episodesList[1] || CURATED_ANIME_DATA[4].episodesList[0],
        releaseTime: '3 days ago',
      },
      {
        anime: CURATED_ANIME_DATA[13], // One Piece
        episode: CURATED_ANIME_DATA[13].episodesList[0],
        releaseTime: 'This week',
      },
    ];
  },

  // Filter anime by Genre
  getByGenre(genreName: string): Anime[] {
    const lower = genreName.toLowerCase();
    return CURATED_ANIME_DATA.filter((a) =>
      a.genres.some((g) => g.toLowerCase().includes(lower))
    );
  },

  // Classic Anime
  getClassics(): Anime[] {
    return CURATED_ANIME_DATA.filter((a) => a.year < 2010 || a.genres.includes('Classic'));
  },

  // Recommendations
  getRecommended(favoriteGenres: string[] = []): Anime[] {
    if (favoriteGenres.length === 0) {
      return [...CURATED_ANIME_DATA].sort(() => 0.5 - Math.random()).slice(0, 10);
    }
    const matches = CURATED_ANIME_DATA.filter((a) =>
      a.genres.some((g) => favoriteGenres.includes(g))
    );
    if (matches.length >= 6) return matches.slice(0, 10);
    return [...matches, ...CURATED_ANIME_DATA.filter((a) => !matches.includes(a))].slice(0, 10);
  },

  // Search and Advanced Filters
  async searchAnime(filters: SearchFilterState): Promise<{ results: Anime[]; isLiveApi: boolean }> {
    const { query, genre, status, year, ratingMin, sortBy } = filters;

    // If query has text, attempt live Jikan API search
    if (query.trim().length >= 3) {
      const encoded = encodeURIComponent(query.trim());
      const res = await cachedFetch<{ data: unknown[] }>(
        `${JIKAN_BASE_URL}/anime?q=${encoded}&limit=20&sfw=true`
      );
      if (res && res.data && res.data.length > 0) {
        let items = res.data.map(mapJikanToAnime);

        // Apply secondary filters on Jikan results
        if (genre) {
          items = items.filter((a) => a.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
        }
        if (status && status !== 'All') {
          items = items.filter((a) => a.status.toLowerCase() === status.toLowerCase());
        }
        if (year && year !== 'All') {
          if (year === '<2010') {
            items = items.filter((a) => a.year < 2010);
          } else {
            items = items.filter((a) => a.year === Number(year));
          }
        }
        if (ratingMin > 0) {
          items = items.filter((a) => a.score >= ratingMin);
        }

        // Sort
        items = this.sortAnimeList(items, sortBy);
        return { results: items, isLiveApi: true };
      }
    }

    // Fallback: search in local curated dataset
    let local = [...CURATED_ANIME_DATA];

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      local = local.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.titleEnglish && a.titleEnglish.toLowerCase().includes(q)) ||
          (a.titleJapanese && a.titleJapanese.includes(q)) ||
          a.genres.some((g) => g.toLowerCase().includes(q)) ||
          a.studio.toLowerCase().includes(q)
      );
    }

    if (genre && genre !== 'All') {
      local = local.filter((a) => a.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
    }

    if (status && status !== 'All') {
      local = local.filter((a) => a.status.toLowerCase() === status.toLowerCase());
    }

    if (year && year !== 'All') {
      if (year === '<2010') {
        local = local.filter((a) => a.year < 2010);
      } else {
        local = local.filter((a) => a.year === Number(year));
      }
    }

    if (ratingMin > 0) {
      local = local.filter((a) => a.score >= ratingMin);
    }

    local = this.sortAnimeList(local, sortBy);
    return { results: local, isLiveApi: false };
  },

  sortAnimeList(list: Anime[], sortBy: SearchFilterState['sortBy']): Anime[] {
    switch (sortBy) {
      case 'score_desc':
        return list.sort((a, b) => b.score - a.score);
      case 'popularity_asc':
        return list.sort((a, b) => (a.popularity || 999) - (b.popularity || 999));
      case 'year_desc':
        return list.sort((a, b) => b.year - a.year);
      case 'title_asc':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list;
    }
  },
};
