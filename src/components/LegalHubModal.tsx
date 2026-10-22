import React from 'react';
import {
  X,
  ShieldCheck,
  ExternalLink,
  Key,
  CheckCircle2,
  Tv,
  HelpCircle,
} from 'lucide-react';

interface LegalHubModalProps {
  onClose: () => void;
}

export const LegalHubModal: React.FC<LegalHubModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Authorized Legal Streaming Hub</h2>
              <p className="text-xs text-slate-400">
                Ethical anime distribution, verified licensors, and API configuration guide
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto no-scrollbar text-xs sm:text-sm text-slate-300">
          {/* Legal Commitment Banner */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Zero Piracy &amp; Direct Creator Support</span>
            </div>
            <p className="leading-relaxed text-slate-300 text-xs">
              ANIMEVERSE strictly avoids illegitimate scrapers, pirated streams, or unauthorized video servers. Every streaming link connects to verified licensors, official distributor YouTube broadcasts (e.g. Muse Asia, Ani-One), or legally embedded video previews.
            </p>
          </div>

          {/* Current Integration Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-[11px]">
              Platform Feature Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Official YouTube Trailer Player</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-[10px]">
                    ACTIVE
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Embeds verified promotional video trailers directly from official studios (Aniplex, Kadokawa, Toho, Wit, MAPPA).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Custom HTML5 Video Player</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-[10px]">
                    ACTIVE
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Playback controls, seeking, volume, playback speed (0.75x–2x), theater mode, and progress saving.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Direct Licensor Deep Links</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-[10px]">
                    ACTIVE
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  One-click verified navigation to Crunchyroll, Netflix, Hulu, Disney+, and Amazon Prime Video.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-violet-500/30 space-y-1">
                <div className="flex items-center justify-between text-violet-300 font-bold">
                  <span>Live Jikan (MyAnimeList) API</span>
                  <span className="px-1.5 py-0.5 rounded bg-violet-950 border border-violet-500/30 text-[10px]">
                    ACTIVE
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Real-time metadata lookup with in-memory caching and offline fallback dataset.
                </p>
              </div>
            </div>
          </div>

          {/* Setup Instructions for Authorized Streaming Providers */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-violet-300">
              <Key className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold">How to Configure Commercial Provider APIs</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              If your organization or team obtains direct commercial content delivery network (CDN) licensing credentials from anime distribution partners, you can configure them via server environment variables:
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1 overflow-x-auto">
              <p># Optional Licensor Partner Tokens in .env</p>
              <p>CRUNCHYROLL_PARTNER_AFFILIATE_ID=&quot;your_partner_id&quot;</p>
              <p>NETFLIX_AFFILIATE_CAMPAIGN_TAG=&quot;your_campaign_tag&quot;</p>
              <p>MUSE_ASIA_API_CHANNEL_KEY=&quot;your_youtube_channel_key&quot;</p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              All credentials should remain securely on the backend server and never be hardcoded into frontend client bundles.
            </p>
          </div>

          {/* Verified Official Distributors */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-[11px]">
              Official Anime Licensors
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <a
                href="https://www.crunchyroll.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-violet-500 transition-colors"
              >
                <span className="font-semibold text-slate-200">Crunchyroll</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
              <a
                href="https://www.netflix.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-violet-500 transition-colors"
              >
                <span className="font-semibold text-slate-200">Netflix Anime</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
              <a
                href="https://www.youtube.com/@MuseAsia"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-violet-500 transition-colors"
              >
                <span className="font-semibold text-slate-200">Muse Asia</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors"
          >
            I Understand &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
