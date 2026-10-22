import React, { useState } from 'react';
import { Search, Bookmark, ShieldCheck, User, Menu, X, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/anime';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  watchlistCount: number;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onOpenLegalHub: () => void;
  onSearchClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  watchlistCount,
  userProfile,
  onOpenProfile,
  onOpenLegalHub,
  onSearchClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'trending', label: 'Trending' },
    { id: 'catalog', label: 'Catalog & Search' },
    { id: 'watchlist', label: 'My Watchlist' },
    { id: 'genres', label: 'Genres' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 text-left group focus:outline-none"
            aria-label="Animeverse Home"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-violet-300 bg-clip-text text-transparent whitespace-nowrap">
              ANIME<span className="text-violet-400">VERSE</span>
            </span>
          </button>
        </div>

        {/* Zone 2: 4-5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`transition-colors whitespace-nowrap shrink-0 relative py-1 focus:outline-none ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Search trigger */}
          <button
            onClick={onSearchClick}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors focus:outline-none"
            title="Search Anime"
            aria-label="Search anime"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Watchlist Quick Button */}
          <button
            onClick={() => handleNavClick('watchlist')}
            className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors focus:outline-none"
            title="My Watchlist"
            aria-label="My Watchlist"
          >
            <Bookmark className="w-4 h-4" />
            {watchlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-violet-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center font-mono tabular-nums">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* Legal Streaming Verified Badge & Info */}
          <button
            onClick={onOpenLegalHub}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 rounded-lg hover:bg-cyan-900/40 transition-colors focus:outline-none"
            title="Authorized Legal Streaming Sources"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Legal Hub</span>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 bg-slate-800/60 border border-slate-700/50 rounded-lg hover:border-violet-500/50 transition-all focus:outline-none"
            aria-label="User Profile"
          >
            <div className="w-6 h-6 rounded-md overflow-hidden bg-violet-900/60 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-violet-300" />
            </div>
            <span className="text-xs font-medium text-slate-200 hidden lg:inline max-w-[80px] truncate">
              {userProfile.username}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800/80 px-4 py-4 space-y-3">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === link.id
                    ? 'bg-violet-600/20 text-violet-300 font-semibold border border-violet-500/30'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                onOpenLegalHub();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-cyan-300 hover:bg-cyan-950/40 rounded-lg text-left"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Authorized Legal Streaming Sources</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
