import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Tv,
  Subtitles,
  Gauge,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Anime, Episode } from '../types/anime';
import { StorageService } from '../services/storageService';

interface WatchPageProps {
  anime: Anime;
  initialEpisode?: Episode;
  onBack: () => void;
  onSelectAnime: (anime: Anime) => void;
  onEpisodeWatchedChange: () => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  anime,
  initialEpisode,
  onBack,
  onEpisodeWatchedChange,
}) => {
  const episodes = anime.episodesList && anime.episodesList.length > 0
    ? anime.episodesList
    : [
        {
          id: Number(`${anime.id}1`),
          episodeNumber: 1,
          title: 'Pilot Episode',
          duration: anime.duration || '24 min',
          synopsis: `Episode 1 of ${anime.title}`,
          isOfficialFree: true,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
      ];

  const [currentEpisode, setCurrentEpisode] = useState<Episode>(
    initialEpisode || episodes[0]
  );

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1440); // 24 minutes default in seconds
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [playerType, setPlayerType] = useState<'trailer_embed' | 'html5_player'>(
    currentEpisode.videoUrl ? 'html5_player' : 'trailer_embed'
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Retrieve saved progress for this episode
  useEffect(() => {
    const saved = StorageService.getAnimeProgress(anime.id, currentEpisode.episodeNumber);
    if (saved && videoRef.current) {
      videoRef.current.currentTime = saved.currentTime;
      setCurrentTime(saved.currentTime);
    }
  }, [anime.id, currentEpisode.episodeNumber]);

  // Sync video time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      // Save progress every 5 seconds
      StorageService.saveProgress(
        anime.id,
        currentEpisode.episodeNumber,
        videoRef.current.currentTime,
        videoRef.current.duration || duration
      );
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.muted = false;
        videoRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  };

  // Next / Previous Episode
  const currentEpIndex = episodes.findIndex((e) => e.episodeNumber === currentEpisode.episodeNumber);
  const hasNext = currentEpIndex < episodes.length - 1;
  const hasPrev = currentEpIndex > 0;

  const handleNextEpisode = () => {
    if (hasNext) {
      const nextEp = episodes[currentEpIndex + 1];
      setCurrentEpisode(nextEp);
      setCurrentTime(0);
      setIsPlaying(false);
      if (nextEp.videoUrl) setPlayerType('html5_player');
    }
  };

  const handlePrevEpisode = () => {
    if (hasPrev) {
      const prevEp = episodes[currentEpIndex - 1];
      setCurrentEpisode(prevEp);
      setCurrentTime(0);
      setIsPlaying(false);
      if (prevEp.videoUrl) setPlayerType('html5_player');
    }
  };

  // Mark watched
  const isWatched = StorageService.getAnimeProgress(anime.id, currentEpisode.episodeNumber)?.isCompleted;
  const handleToggleWatched = () => {
    StorageService.markEpisodeWatched(anime.id, currentEpisode.episodeNumber, !isWatched);
    onEpisodeWatchedChange();
  };

  // Time formatter (HH:MM:SS or MM:SS)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime += 5;
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime -= 5;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, volume]);

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Browse</span>
          </button>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-white truncate">{anime.title}</h1>
            <p className="text-xs text-slate-400 font-mono tabular-nums">
              Episode {currentEpisode.episodeNumber}: {currentEpisode.title}
            </p>
          </div>
        </div>

        {/* Player Type Switcher & Mark Watched */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleWatched}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isWatched
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isWatched ? 'Watched' : 'Mark Watched'}</span>
          </button>

          {anime.trailerYoutubeId && (
            <button
              onClick={() =>
                setPlayerType(playerType === 'trailer_embed' ? 'html5_player' : 'trailer_embed')
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-950/60 border border-violet-700/50 text-violet-300 hover:bg-violet-900/50 transition-colors"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {playerType === 'trailer_embed' ? 'Switch to Custom Player' : 'Switch to Official Broadcast'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div
        className={`flex-1 flex flex-col ${
          isTheaterMode ? 'max-w-none' : 'max-w-7xl mx-auto w-full'
        } p-3 sm:p-6 gap-6`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Video Screen Area (3 Columns in Desktop) */}
          <div className="lg:col-span-3 space-y-4">
            <div
              ref={playerContainerRef}
              onMouseMove={handleMouseMove}
              className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center group"
            >
              {playerType === 'trailer_embed' && anime.trailerYoutubeId ? (
                /* Official YouTube Trailer / Legal Preview Embed */
                <iframe
                  src={`https://www.youtube.com/embed/${anime.trailerYoutubeId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`}
                  title={`${anime.title} Episode ${currentEpisode.episodeNumber}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                /* Custom HTML5 Video Player with Authorized Source */
                <>
                  <video
                    ref={videoRef}
                    src={currentEpisode.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleNextEpisode}
                    onClick={togglePlay}
                    className="w-full h-full object-contain cursor-pointer"
                    poster={currentEpisode.thumbnail || anime.banner || anime.poster}
                  />

                  {/* Subtitle Display Simulation */}
                  {subtitlesOn && isPlaying && (
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg bg-black/80 text-white text-xs sm:text-sm font-semibold tracking-wide pointer-events-none text-center shadow-lg">
                      [Dialogue: In Japanese with Official English Subtitles]
                    </div>
                  )}

                  {/* Custom Player Controls Bar */}
                  <div
                    className={`absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 transition-opacity duration-300 ${
                      showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    {/* Progress Slider */}
                    <div className="flex items-center gap-2 group/slider">
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:h-2 transition-all"
                      />
                    </div>

                    {/* Bottom Controls Row */}
                    <div className="flex items-center justify-between text-slate-200 text-xs sm:text-sm">
                      <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button
                          onClick={togglePlay}
                          className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>

                        {/* Prev / Next Episode */}
                        <button
                          onClick={handlePrevEpisode}
                          disabled={!hasPrev}
                          className={`p-1.5 rounded-lg transition-colors ${
                            hasPrev ? 'hover:text-white hover:bg-white/10' : 'text-slate-600'
                          }`}
                          aria-label="Previous Episode"
                        >
                          <SkipBack className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNextEpisode}
                          disabled={!hasNext}
                          className={`p-1.5 rounded-lg transition-colors ${
                            hasNext ? 'hover:text-white hover:bg-white/10' : 'text-slate-600'
                          }`}
                          aria-label="Next Episode"
                        >
                          <SkipForward className="w-4 h-4" />
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={toggleMute}
                            className="p-1.5 rounded-lg hover:text-white hover:bg-white/10"
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-16 h-1 bg-slate-700 rounded-lg appearance-none accent-violet-400 cursor-pointer hidden sm:block"
                          />
                        </div>

                        {/* Time stamp */}
                        <div className="font-mono tabular-nums text-xs text-slate-300">
                          <span>{formatTime(currentTime)}</span>
                          <span className="mx-1 text-slate-500">/</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Right Control Cluster */}
                      <div className="flex items-center gap-2">
                        {/* Subtitles Toggle */}
                        <button
                          onClick={() => setSubtitlesOn(!subtitlesOn)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            subtitlesOn ? 'text-violet-400 bg-violet-950/60' : 'text-slate-400 hover:text-slate-200'
                          }`}
                          title="Subtitles (CC)"
                        >
                          <Subtitles className="w-4 h-4" />
                        </button>

                        {/* Speed dropdown */}
                        <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/60">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          <select
                            value={playbackSpeed}
                            onChange={(e) => handleSpeedChange(Number(e.target.value))}
                            className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none cursor-pointer"
                          >
                            <option value="0.75" className="bg-slate-900 text-slate-200">0.75x</option>
                            <option value="1" className="bg-slate-900 text-slate-200">1.0x</option>
                            <option value="1.25" className="bg-slate-900 text-slate-200">1.25x</option>
                            <option value="1.5" className="bg-slate-900 text-slate-200">1.5x</option>
                            <option value="2" className="bg-slate-900 text-slate-200">2.0x</option>
                          </select>
                        </div>

                        {/* Theater Mode */}
                        <button
                          onClick={() => setIsTheaterMode(!isTheaterMode)}
                          className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 hidden sm:block"
                          title="Theater Mode"
                        >
                          <Tv className="w-4 h-4" />
                        </button>

                        {/* Fullscreen */}
                        <button
                          onClick={toggleFullscreen}
                          className="p-1.5 rounded-lg hover:text-white hover:bg-white/10"
                          title="Fullscreen (F)"
                        >
                          {document.fullscreenElement ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Legal Streaming Authorization Banner & Instant Licensor Links */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-cyan-300">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold">
                    Official Authorized Legal Streaming Sources
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Source: Licensed partner distributor feeds
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                To support the original anime creators, animators, and production committees, full uncut episodes with multi-language dubs and subs are officially streamable through:
              </p>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {anime.legalProviders.map((prov) => (
                  <a
                    key={prov.name}
                    href={prov.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-950 border border-cyan-800/40 hover:border-cyan-400 text-xs font-semibold text-slate-100 transition-colors"
                  >
                    <span>Watch on {prov.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </a>
                ))}
              </div>
            </div>

            {/* Episode Synopsis & Anime Details */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">
                  {anime.title} — Episode {currentEpisode.episodeNumber}
                </h3>
                <span className="text-xs text-slate-400 font-mono tabular-nums">{currentEpisode.duration}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentEpisode.synopsis || anime.synopsis}
              </p>
            </div>
          </div>

          {/* Episode List & Navigation Sidebar (1 Column in Desktop) */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono text-[11px]">
                Season Episodes ({episodes.length})
              </h3>
              <span className="text-xs text-violet-400 font-semibold">Season 1</span>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto no-scrollbar pr-1">
              {episodes.map((ep) => {
                const isSelected = ep.episodeNumber === currentEpisode.episodeNumber;
                const watched = StorageService.getAnimeProgress(anime.id, ep.episodeNumber)?.isCompleted;

                return (
                  <div
                    key={ep.id}
                    onClick={() => {
                      setCurrentEpisode(ep);
                      setCurrentTime(0);
                      setIsPlaying(false);
                      if (ep.videoUrl) setPlayerType('html5_player');
                    }}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-950/40 border-violet-500 shadow-md shadow-violet-950/50'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 aspect-video rounded-md overflow-hidden bg-slate-950 shrink-0">
                      <img
                        src={ep.thumbnail || anime.poster}
                        alt={`EP ${ep.episodeNumber}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-violet-600/40 flex items-center justify-center">
                          <Play className="w-4 h-4 fill-white text-white" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-300 font-mono tabular-nums">
                          EP {ep.episodeNumber}
                        </span>
                        {watched && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-slate-100 truncate mt-0.5">
                        {ep.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono tabular-nums block mt-1">
                        {ep.duration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
