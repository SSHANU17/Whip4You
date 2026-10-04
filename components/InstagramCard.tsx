import React, { useEffect, useRef, useState } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface IGMedia {
  username: string;
  profilePicUrl: string | null;
  isVideo: boolean;
  videoUrl: string | null;
  displayUrl: string | null;
  permalink: string;
  slides: { isVideo: boolean; displayUrl: string | null; videoUrl: string | null }[];
}

interface InstagramCardProps {
  postUrl: string;
}

// ─── Cache ───────────────────────────────────────────────────────────────────

const cache = new Map<string, Promise<IGMedia | null>>();

function extractTarget(raw: string) {
  const permalinkMatch = raw.match(/data-instgrm-permalink\s*=\s*["']([^"']+)/i)?.[1];
  const candidate = (permalinkMatch || raw).trim().replace(/&amp;/g, '&');
  try {
    const url = new URL(candidate);
    if (!['instagram.com', 'www.instagram.com'].includes(url.hostname)) return null;
    const m = url.pathname.match(/^\/(p|reel|tv)\/([\w-]+)/i);
    if (!m) return null;
    return { postType: m[1].toLowerCase(), shortcode: m[2], permalink: `https://www.instagram.com/${m[1].toLowerCase()}/${m[2]}/` };
  } catch { return null; }
}

function parseHtml(html: string, permalink: string): IGMedia | null {
  const idx = html.indexOf('"contextJSON":');
  if (idx === -1) return null;
  try {
    const sq = html.indexOf('"', idx + 14);
    let eq = sq + 1;
    while (eq < html.length) {
      if (html[eq] === '\\') eq += 2; else if (html[eq] === '"') break; else eq++;
    }
    const media = JSON.parse(JSON.parse(html.slice(sq, eq + 1))).gql_data?.shortcode_media;
    if (!media) return null;

    const sidecar = media?.edge_sidecar_to_children?.edges;
    const slides = Array.isArray(sidecar) && sidecar.length
      ? sidecar.map((e: any) => ({ isVideo: !!e.node.is_video, displayUrl: e.node.display_url || null, videoUrl: e.node.video_url || null }))
      : [{ isVideo: !!media.is_video, displayUrl: media.display_url || null, videoUrl: media.video_url || null }];

    return {
      username: media.owner?.username || 'whip4you',
      profilePicUrl: media.owner?.profile_pic_url || null,
      isVideo: !!media.is_video,
      videoUrl: media.video_url || null,
      displayUrl: media.display_url || null,
      permalink,
      slides,
    };
  } catch { return null; }
}

function parseJinaMarkdown(markdown: string, permalink: string, isReel: boolean): IGMedia | null {
  try {
    const cdnMatches = [...markdown.matchAll(/\((https:\/\/[^)]+cdninstagram\.com[^)]+)\)/g)].map(m => m[1]);
    if (!cdnMatches.length) return null;
    const profilePic = cdnMatches[0] || null;
    const displayUrl = cdnMatches[1] || cdnMatches[0];
    return {
      username: 'whip4you',
      profilePicUrl: profilePic,
      isVideo: isReel,
      videoUrl: null,
      displayUrl,
      permalink,
      slides: [{ isVideo: false, displayUrl, videoUrl: null }]
    };
  } catch { return null; }
}

function fetchMedia(rawUrl: string): Promise<IGMedia | null> {
  const target = extractTarget(rawUrl);
  if (!target) return Promise.resolve(null);
  const key = target.permalink;
  if (cache.has(key)) return cache.get(key)!;

  const p = (async (): Promise<IGMedia | null> => {
    // 1. Try internal /api/instagram endpoint (Vite dev middleware or Vercel serverless)
    try {
      const r = await fetch(`/api/instagram?url=${encodeURIComponent(target.permalink)}`);
      if (r.ok) {
        const d = await r.json();
        if (d?.displayUrl || d?.videoUrl) return d as IGMedia;
      }
    } catch { /**/ }

    // 2. Direct client fallback via jina reader (returns pure markdown with cdninstagram image URLs)
    try {
      const jinaUrl = `https://r.jina.ai/${encodeURIComponent(target.permalink + 'embed/')}`;
      const r = await fetch(jinaUrl);
      if (r.ok) {
        const text = await r.text();
        const parsed = parseJinaMarkdown(text, target.permalink, target.postType === 'reel');
        if (parsed) return parsed;
      }
    } catch { /**/ }

    // 3. Fallback via allorigins proxy if available
    try {
      const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(target.permalink + 'embed/')}`;
      const r = await fetch(proxy, { signal: AbortSignal.timeout(4000) });
      if (r.ok) {
        const { contents } = await r.json();
        const parsed = parseHtml(contents || '', target.permalink);
        if (parsed) return parsed;
      }
    } catch { /**/ }

    return null;
  })();

  cache.set(key, p);
  return p;
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const HeartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CommentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M8.2881437,19.1950792 C8.38869181,19.1783212 8.49195996,19.1926955 8.58410926,19.2362761 C9.64260561,19.7368747 10.8021412,20 12,20 C16.418278,20 20,16.418278 20,12 C20,7.581722 16.418278,4 12,4 C7.581722,4 4,7.581722 4,12 C4,13.7069096 4.53528582,15.3318588 5.51454846,16.6849571 C5.62010923,16.830816 5.63909672,17.022166 5.5642591,17.1859256 L4.34581002,19.8521348 L8.2881437,19.1950792 Z M3.58219949,20.993197 C3.18698783,21.0590656 2.87870208,20.6565881 3.04523765,20.2921751 L4.53592782,17.0302482 C3.54143337,15.5576047 3,13.818993 3,12 C3,7.02943725 7.02943725,3 12,3 C16.9705627,3 21,7.02943725 21,12 C21,16.9705627 16.9705627,21 12,21 C10.707529,21 9.4528641,20.727055 8.30053434,20.2068078 L3.58219949,20.993197 Z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M20 13V17.5C20 20.5577 16 20.5 12 20.5C8 20.5 4 20.5577 4 17.5V13M12 3L12 15M12 3L16 7M12 3L8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BookmarkIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const DotsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const VolumeOnIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6l-4 4H4v4h4l4 4V6zM19.07 4.929a10 10 0 010 14.142" />
  </svg>
);

const VolumeOffIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
  </svg>
);

// ─── Card ────────────────────────────────────────────────────────────────────

function InstagramCard({ postUrl }: InstagramCardProps) {
  const target = extractTarget(postUrl);
  const permalink = target?.permalink || postUrl;

  const [media, setMedia] = useState<IGMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [slideIdx, setSlideIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [avatarErr, setAvatarErr] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchMedia(postUrl).then((d) => { if (alive) { setMedia(d); setLoading(false); } });
    return () => { alive = false; };
  }, [postUrl]);

  const slides = media?.slides?.length ? media.slides : media ? [{ isVideo: media.isVideo, displayUrl: media.displayUrl, videoUrl: media.videoUrl }] : [];
  const slide = slides[slideIdx] ?? slides[0] ?? null;
  const activeVideo = slide?.isVideo ? (slide.videoUrl || media?.videoUrl) : null;

  // Auto-advance photo carousel when not hovered
  useEffect(() => {
    if (slides.length <= 1 || activeVideo || isHovered) return;
    const t = setInterval(() => setSlideIdx(p => (p + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, [slides.length, !!activeVideo, isHovered]);

  // Autoplay video / toggle mute on hover
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !activeVideo) return;
    v.muted = !isHovered;
    setIsMuted(!isHovered);
    v.play().catch(() => { v.muted = true; setIsMuted(true); v.play().catch(() => {}); });
  }, [activeVideo, isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    const v = videoRef.current;
    if (v && activeVideo) {
      v.muted = false;
      setIsMuted(false);
      v.play().catch(() => { v.muted = true; setIsMuted(true); v.play().catch(() => {}); });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const v = videoRef.current;
    if (v) { v.muted = true; setIsMuted(true); }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) { v.volume = 1; v.play().catch(() => {}); }
    setIsMuted(v.muted);
  };

  const username = media?.username || 'whip4you';

  return (
    <div
      className="insta-card-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between p-3 border-b border-[rgba(212,175,55,0.25)]">
        <a
          href={`https://www.instagram.com/${username}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 no-underline min-w-0"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-zinc-800 border border-zinc-700">
            {media?.profilePicUrl && !avatarErr ? (
              <img
                src={media.profilePicUrl}
                alt={username}
                referrerPolicy="no-referrer"
                onError={() => setAvatarErr(true)}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <img src="/w4u-logo.svg" alt={username} className="w-full h-full object-contain p-0.5" draggable={false} />
            )}
          </div>
          <span className="text-sm font-semibold text-gray-900 truncate">{username}</span>
        </a>
        <a
          href={permalink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          aria-label="More options"
          className="text-gray-900 hover:text-[#D4AF37] transition-colors"
        >
          <DotsIcon />
        </a>
      </div>

      {/* ── Media ── */}
      <div className="relative bg-zinc-950 overflow-hidden" style={{ height: 340 }}>
        {loading ? (
          <div className="w-full h-full animate-pulse bg-zinc-800" />
        ) : slide ? (
          <>
            {activeVideo ? (
              <video
                ref={videoRef}
                src={activeVideo}
                poster={slide.displayUrl ?? undefined}
                autoPlay loop muted playsInline preload="auto"
                onClick={toggleMute}
                className="w-full h-full object-cover cursor-pointer"
              />
            ) : (
              <a href={permalink} target="_blank" rel="noopener noreferrer" className="block w-full h-full" draggable={false}>
                <img
                  src={slide.displayUrl || ''}
                  alt={`${username} post`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </a>
            )}

            {/* Mute pill for videos */}
            {activeVideo && (
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white backdrop-blur-sm hover:bg-black/80 transition-colors z-10"
              >
                {isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
              </button>
            )}

            {/* Carousel arrows & dots for multi-slide */}
            {slides.length > 1 && (
              <>
                {slideIdx > 0 && (
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); setSlideIdx(p => p - 1); }}
                    aria-label="Previous"
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center text-zinc-900 z-10 hover:bg-white"
                  >
                    <ChevronLeftIcon />
                  </button>
                )}
                {slideIdx < slides.length - 1 && (
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); setSlideIdx(p => p + 1); }}
                    aria-label="Next"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center text-zinc-900 z-10 hover:bg-white"
                  >
                    <ChevronRightIcon />
                  </button>
                )}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 pointer-events-none">
                  {slides.slice(0, 10).map((_, i) => (
                    <span key={i} className={`w-1 h-1 rounded-full transition-all ${i === slideIdx ? 'bg-white scale-125' : 'bg-white/40'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          /* Clean placeholder if media cannot be fetched */
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-400 p-4 text-center">
            <span className="text-xs mb-2">View post on Instagram</span>
            <a
              href={permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#D4AF37] hover:underline"
              onClick={e => e.stopPropagation()}
            >
              Open Post ↗
            </a>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-between items-center px-3 py-2">
        <div className="flex space-x-3">
          <a href={permalink} target="_blank" rel="noopener noreferrer" aria-label="Like post" className="text-gray-900 hover:text-red-500 transition-colors" onClick={e => e.stopPropagation()}>
            <HeartIcon />
          </a>
          <a href={permalink} target="_blank" rel="noopener noreferrer" aria-label="Comment" className="text-gray-900 hover:text-gray-500 transition-colors" onClick={e => e.stopPropagation()}>
            <CommentIcon />
          </a>
          <a href={permalink} target="_blank" rel="noopener noreferrer" aria-label="Share" className="text-gray-900 hover:text-gray-500 transition-colors" onClick={e => e.stopPropagation()}>
            <ShareIcon />
          </a>
        </div>
        <a href={permalink} target="_blank" rel="noopener noreferrer" aria-label="Save post" className="text-gray-900 hover:text-gray-500 transition-colors" onClick={e => e.stopPropagation()}>
          <BookmarkIcon />
        </a>
      </div>
    </div>
  );
}

export default InstagramCard;

