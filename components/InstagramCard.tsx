import React from 'react';

function getInstagramEmbedUrl(value: string): string | null {
  try {
    const permalink = value.match(/data-instgrm-permalink\s*=\s*["']([^"']+)/i)?.[1];
    const url = new URL((permalink || value).trim().replace(/&amp;/g, '&'));
    if (!['instagram.com', 'www.instagram.com', 'instagr.am'].includes(url.hostname)) return null;
    const match = url.pathname.match(/^\/(p|reel|tv)\/([\w-]+)/);
    if (!match) return null;
    return `https://www.instagram.com/${match[1]}/${match[2]}/embed/?hidecaption=true&autoplay=1&muted=1`;
  } catch {
    return null;
  }
}

const InstagramCard: React.FC<{ postUrl: string }> = ({ postUrl }) => {
  const embedUrl = getInstagramEmbedUrl(postUrl);
  if (!embedUrl) return null;
  return (
    <article className="insta-post-card" aria-label="Instagram post">
      <iframe
        src={embedUrl}
        title="Whip4You Instagram post"
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </article>
  );
};

export default InstagramCard;
