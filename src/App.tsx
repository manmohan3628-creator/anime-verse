/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Film,
  TrendingUp,
  Award,
  Flame,
  Tv,
  Heart,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Anime, Episode, WatchlistItem, WatchlistStatus, UserProfile } from './types/anime';
import { AnimeService } from './services/animeApi';
import { StorageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { AnimeRow } from './components/AnimeRow';
import { RecentlyReleasedRow } from './components/RecentlyReleasedRow';
import { AnimeDetailsModal } from './components/AnimeDetailsModal';
import { WatchPage } from './components/WatchPage';
import { CatalogSearch } from './components/CatalogSearch';
import { WatchlistView } from './components/WatchlistView';
import { LegalHubModal } from './components/LegalHubModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AnimeCard } from './components/AnimeCard';
import { Toast, ToastMessage } from './components/Toast';

function dedupeAnime(list: Anime[]): Anime[] {
  const seen = new Set<number>();
  return list.filter((anime) => {
    if (seen.has(anime.id)) return false;
    seen.add(anime.id);
    return true;
  });
}

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [watchTarget, setWatchTarget] = useState<{ anime: Anime; episode?: Episode } | null>(null);

  // Modals
  const [isLegalHubOpen, setIsLegalHubOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Data state
  const [trending, setTrending] = useState<Anime[]>([]);
  const [popularSeason, setPopularSeason] = useState<Anime[]>([]);
  const [mostWatched, setMostWatched] = useState<Anime[]>([]);
  const [topRated, setTopRated] = useState<Anime[]>([]);
  const [recentlyReleased, setRecentlyReleased] = useState<Array<{ anime: Anime; episode: Episode; releaseTime: string }>>([]);
  const [classics, setClassics] = useState<Anime[]>([]);

  // User Library State
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(StorageService.getProfile());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const triggerToast = useCallback((title: string, message?: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync initial data and user preferences
  useEffect(() => {
    setWatchlist(StorageService.getWatchlist());
    setFavorites(StorageService.getFavorites());
    setUserProfile(StorageService.getProfile());

    // Load anime catalog data
    async function loadCatalog() {
      const [trend, pop, watched, top] = await Promise.all([
        AnimeService.getTrendingAnime(),
        AnimeService.getPopularThisSeason(),
        AnimeService.getMostWatched(),
        AnimeService.getTopRated(),
      ]);
      setTrending(trend);
      setPopularSeason(pop);
      setMostWatched(watched);
      setTopRated(top);
      setRecentlyReleased(AnimeService.getRecentlyReleased());
      setClassics(AnimeService.getClassics());
    }

    loadCatalog();
  }, []);

  // Genre Anime Rows
  const actionAnime = useMemo(() => AnimeService.getByGenre('Action'), []);
  const romanceAnime = useMemo(() => AnimeService.getByGenre('Romance'), []);
  const comedyAnime = useMemo(() => AnimeService.getByGenre('Comedy'), []);
  const fantasyAnime = useMemo(() => AnimeService.getByGenre('Fantasy'), []);
  const isekaiAnime = useMemo(() => AnimeService.getByGenre('Isekai'), []);
  const horrorAnime = useMemo(() => AnimeService.getByGenre('Horror'), []);
  const mysteryAnime = useMemo(() => AnimeService.getByGenre('Mystery'), []);
  const sliceOfLifeAnime = useMemo(() => AnimeService.getByGenre('Slice of Life'), []);

  const fantasyAndIsekai = useMemo(
    () => dedupeAnime([...fantasyAnime, ...isekaiAnime]),
    [fantasyAnime, isekaiAnime]
  );
  const romanceAndComedy = useMemo(
    () => dedupeAnime([...romanceAnime, ...comedyAnime]),
    [romanceAnime, comedyAnime]
  );
  const horrorAndMystery = useMemo(
    () => dedupeAnime([...horrorAnime, ...mysteryAnime]),
    [horrorAnime, mysteryAnime]
  );

  // Personalized Recommendations
  const recommendedAnime = useMemo(() => {
    const userFavGenres = watchlist
      .flatMap((w) => w.anime.genres)
      .slice(0, 4);
    return AnimeService.getRecommended(userFavGenres);
  }, [watchlist]);

  // Similar anime calculation for details modal
  const similarAnime = useMemo(() => {
    if (!selectedAnime) return [];
    const firstGenre = selectedAnime.genres[0] || 'Action';
    return AnimeService.getByGenre(firstGenre)
      .filter((a) => a.id !== selectedAnime.id)
      .slice(0, 6);
  }, [selectedAnime]);

  // Watchlist Actions
  const handleToggleWatchlist = (anime: Anime) => {
    const isPresent = watchlist.some((item) => item.animeId === anime.id);
    if (isPresent) {
      const updated = StorageService.removeFromWatchlist(anime.id);
      setWatchlist(updated);
      triggerToast('Removed from Watchlist', `"${anime.title}" has been removed.`, 'info');
    } else {
      const updated = StorageService.addToWatchlist(anime, 'Plan to Watch');
      setWatchlist(updated);
      triggerToast('Added to Watchlist', `"${anime.title}" added to your Plan to Watch queue.`, 'success');
    }
  };

  const handleUpdateWatchlistStatus = (anime: Anime, status: WatchlistStatus) => {
    const updated = StorageService.addToWatchlist(anime, status);
    setWatchlist(updated);
    triggerToast('Status Updated', `"${anime.title}" set to ${status}.`, 'success');
  };

  const handleUpdateWatchlistStatusById = (animeId: number, status: WatchlistStatus) => {
    const updated = StorageService.updateWatchlistStatus(animeId, status);
    setWatchlist(updated);
    const item = updated.find((w) => w.animeId === animeId);
    if (item) {
      triggerToast('Status Updated', `"${item.anime.title}" set to ${status}.`, 'success');
    }
  };

  const handleRemoveFromWatchlist = (animeId: number) => {
    const target = watchlist.find((w) => w.animeId === animeId);
    const updated = StorageService.removeFromWatchlist(animeId);
    setWatchlist(updated);
    if (target) {
      triggerToast('Removed', `"${target.anime.title}" removed from your list.`, 'info');
    }
  };

  // Favorites Action
  const handleToggleFavorite = (animeId: number) => {
    const isNowFav = StorageService.toggleFavorite(animeId);
    setFavorites(StorageService.getFavorites());
    setWatchlist(StorageService.getWatchlist());
    const anime = AnimeService.getCurated().find((a) => a.id === animeId);
    const title = anime?.title || 'Anime';
    if (isNowFav) {
      triggerToast('Added to Favorites', `"${title}" was pinned to your favorites!`, 'success');
    } else {
      triggerToast('Removed from Favorites', `"${title}" removed from favorites.`, 'info');
    }
  };

  // Episode Watch Status
  const isEpisodeWatched = (animeId: number, epNumber: number) => {
    return Boolean(StorageService.getAnimeProgress(animeId, epNumber)?.isCompleted);
  };

  const handleToggleEpisodeWatched = (animeId: number, epNumber: number) => {
    const current = isEpisodeWatched(animeId, epNumber);
    StorageService.markEpisodeWatched(animeId, epNumber, !current);
    triggerToast(
      !current ? 'Episode Watched' : 'Marked as Unwatched',
      `Episode ${epNumber} status updated.`,
      'info'
    );
  };

  // Watch Action
  const handleWatch = (anime: Anime, episode?: Episode) => {
    setSelectedAnime(null);
    setWatchTarget({ anime, episode });
  };

  // Refresh Watchlist
  const refreshWatchlist = () => {
    setWatchlist(StorageService.getWatchlist());
    setFavorites(StorageService.getFavorites());
  };

  // Theme Class Calculation
  const themeClass = useMemo(() => {
    if (userProfile.preferredTheme === 'dark') return 'bg-[#030712] text-slate-100';
    if (userProfile.preferredTheme === 'light') return 'bg-slate-900 text-slate-100';
    return 'bg-[#070913] text-slate-100'; // midnight default
  }, [userProfile.preferredTheme]);

  // If currently watching, show full screen WatchPage
  if (watchTarget) {
    return (
      <WatchPage
        anime={watchTarget.anime}
        initialEpisode={watchTarget.episode}
        onBack={() => setWatchTarget(null)}
        onSelectAnime={(a) => {
          setWatchTarget(null);
          setSelectedAnime(a);
        }}
        onEpisodeWatchedChange={refreshWatchlist}
      />
    );
  }

  return (
    <div className={`min-h-screen ${themeClass} flex flex-col transition-colors duration-300`}>
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Primary Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        watchlistCount={watchlist.length}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenLegalHub={() => setIsLegalHubOpen(true)}
        onSearchClick={() => setActiveTab('catalog')}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* VIEW 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-6 pb-16">
            {/* Animated Large Hero Banner */}
            <HeroBanner
              featuredAnimeList={trending.slice(0, 5)}
              onSelectAnime={setSelectedAnime}
              onWatchAnime={(a) => handleWatch(a)}
              onToggleWatchlist={handleToggleWatchlist}
              isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
            />

            {/* Content Carousels Flow */}
            <div className="space-y-4">
              {/* Trending Anime */}
              <AnimeRow
                title="Trending Anime"
                subtitle="Most discussed and hyped titles worldwide right now"
                animeList={trending}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
                viewAllAction={() => setActiveTab('catalog')}
              />

              {/* Recently Released Episodes */}
              <RecentlyReleasedRow
                recentItems={recentlyReleased}
                onWatchEpisode={(a, ep) => handleWatch(a, ep)}
                onSelectAnime={setSelectedAnime}
              />

              {/* Popular This Season */}
              <AnimeRow
                title="Popular This Season"
                subtitle="Current seasonal anime broadcasting weekly"
                animeList={popularSeason}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />

              {/* Recommended For You */}
              <AnimeRow
                title="Recommended For You"
                subtitle="Hand-picked picks tailored to your favorite genres and watchlist"
                animeList={recommendedAnime}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />

              {/* Most Watched Anime */}
              <AnimeRow
                title="Most Watched Anime"
                subtitle="All-time blockbusters with millions of passionate fans"
                animeList={mostWatched}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />

              {/* Top-Rated Anime */}
              <AnimeRow
                title="Top-Rated Anime"
                subtitle="Critically acclaimed masterpieces with 8.5+ scores on MyAnimeList"
                animeList={topRated}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />

              {/* Action */}
              <AnimeRow
                title="Action & High Stakes"
                subtitle="Adrenaline-pumping battles and supernatural powerups"
                animeList={actionAnime}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />

              {/* Fantasy & Isekai */}
              <AnimeRow
                title="Fantasy & Isekai Worlds"
                subtitle="Reincarnation adventures, mythical beasts, and ancient magic"
                animeList={fantasyAndIsekai.slice(0, 10)}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />

              {/* Romance & Comedy */}
              <AnimeRow
                title="Romance & Heartwarming Comedy"
                subtitle="Wholesome laughter, romantic tension, and unforgettable friendships"
                animeList={romanceAndComedy.slice(0, 10)}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />

              {/* Horror & Mystery */}
              <AnimeRow
                title="Horror & Mind-Bending Mystery"
                subtitle="Dark psychological thrillers and suspenseful investigations"
                animeList={horrorAndMystery.slice(0, 10)}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />

              {/* Slice of Life */}
              <AnimeRow
                title="Slice of Life & Cozy Vibes"
                subtitle="Relaxing music, tranquil everyday life, and heartwarming stories"
                animeList={sliceOfLifeAnime}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />

              {/* Classic Anime */}
              <AnimeRow
                title="Timeless Classics"
                subtitle="Pioneering anime that defined generations of animation"
                animeList={classics}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: TRENDING */}
        {activeTab === 'trending' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  <Flame className="w-7 h-7 text-rose-500" />
                  <span>Trending Anime Worldwide</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Live ranking of the most engaged titles on MyAnimeList and streaming platforms
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trending.map((anime) => (
                <div key={anime.id} className="relative">
                  {anime.rank && (
                    <div className="absolute -top-2 -left-2 z-20 w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-lg font-mono tabular-nums">
                      #{anime.rank <= 100 ? anime.rank : 'Top'}
                    </div>
                  )}
                  <AnimeCard
                    anime={anime}
                    isInWatchlist={watchlist.some((w) => w.animeId === anime.id)}
                    onSelect={setSelectedAnime}
                    onWatch={(a) => handleWatch(a)}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: CATALOG & SEARCH */}
        {activeTab === 'catalog' && (
          <CatalogSearch
            onSelectAnime={setSelectedAnime}
            onWatchAnime={(a) => handleWatch(a)}
            onToggleWatchlist={handleToggleWatchlist}
            isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
          />
        )}

        {/* VIEW 4: MY WATCHLIST */}
        {activeTab === 'watchlist' && (
          <WatchlistView
            watchlist={watchlist}
            onSelectAnime={setSelectedAnime}
            onWatchAnime={(a) => handleWatch(a)}
            onUpdateStatus={handleUpdateWatchlistStatusById}
            onRemove={handleRemoveFromWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onNavigateToCatalog={() => setActiveTab('catalog')}
            onTriggerToast={triggerToast}
            refreshWatchlist={refreshWatchlist}
          />
        )}

        {/* VIEW 5: GENRES BROWSE */}
        {activeTab === 'genres' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Browse by Anime Genre
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Deep dive into specific animation styles, themes, and emotional journeys
              </p>
            </div>

            <div className="space-y-6">
              <AnimeRow
                title="Action & Supernatural"
                animeList={actionAnime}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />
              <AnimeRow
                title="Romance & Drama"
                animeList={romanceAnime}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />
              <AnimeRow
                title="Fantasy & Isekai"
                animeList={fantasyAndIsekai}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />
              <AnimeRow
                title="Comedy & Parody"
                animeList={comedyAnime}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />
              <AnimeRow
                title="Mystery & Thriller"
                animeList={horrorAndMystery}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />
              <AnimeRow
                title="Slice of Life & Music"
                animeList={sliceOfLifeAnime}
                onSelectAnime={setSelectedAnime}
                onWatchAnime={(a) => handleWatch(a)}
                onToggleWatchlist={handleToggleWatchlist}
                isAnimeInWatchlist={(id) => watchlist.some((w) => w.animeId === id)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Anime Details Modal */}
      {selectedAnime && (
        <AnimeDetailsModal
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
          onWatch={(anime, ep) => handleWatch(anime, ep)}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={favorites.includes(selectedAnime.id)}
          watchlistStatus={watchlist.find((w) => w.animeId === selectedAnime.id)?.status}
          onUpdateWatchlistStatus={handleUpdateWatchlistStatus}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          similarAnime={similarAnime}
          onSelectSimilar={(sim) => setSelectedAnime(sim)}
          isEpisodeWatched={isEpisodeWatched}
          onToggleEpisodeWatched={handleToggleEpisodeWatched}
        />
      )}

      {/* Legal Hub Modal */}
      {isLegalHubOpen && (
        <LegalHubModal onClose={() => setIsLegalHubOpen(false)} />
      )}

      {/* User Profile Modal */}
      {isProfileOpen && (
        <UserProfileModal
          profile={userProfile}
          watchlist={watchlist}
          onClose={() => setIsProfileOpen(false)}
          onUpdateProfile={(updated) => setUserProfile(updated)}
          onTriggerToast={triggerToast}
        />
      )}

      {/* Quiet, Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="font-extrabold text-sm tracking-wider text-white">
                ANIME<span className="text-violet-400">VERSE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Premium Anime Streaming Discovery Platform. Powered by Jikan &amp; Official Licensors.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => setIsLegalHubOpen(true)}
              className="hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Legal Streaming Hub</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className="hover:text-slate-200 transition-colors"
            >
              Catalog &amp; Search
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className="hover:text-slate-200 transition-colors"
            >
              My Library
            </button>
            <a
              href="https://jikan.moe"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              <span>Jikan API</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-xs text-slate-500 font-mono text-center md:text-right">
            &copy; 2026 ANIMEVERSE. All anime imagery belongs to respective copyright holders.
          </div>
        </div>
      </footer>
    </div>
  );
}
