export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const clean = String(url).trim().replace(/&amp;/g, '&').replace(/\/+$/, '');
    const m = clean.match(/instagram\.com\/(p|reel|tv)\/([\w-]+)/i);
    if (!m) {
      return res.status(400).json({ error: 'Invalid Instagram URL' });
    }

    const postType = m[1].toLowerCase();
    const shortcode = m[2];
    const permalink = `https://www.instagram.com/${postType}/${shortcode}/`;
    const embedUrl = `${permalink}embed/`;

    const r = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const html = await r.text();
    const idx = html.indexOf('contextJSON');

    if (idx !== -1) {
      const colon = html.indexOf(':', idx);
      const sq = html.indexOf('"', colon);
      let eq = sq + 1;
      while (eq < html.length) {
        if (html[eq] === '\\') eq += 2;
        else if (html[eq] === '"') break;
        else eq++;
      }
      const jsonStr = JSON.parse(html.slice(sq, eq + 1));
      const parsed = JSON.parse(jsonStr);
      const media = parsed.gql_data?.shortcode_media;

      if (media) {
        const sidecar = media?.edge_sidecar_to_children?.edges;
        const slides = Array.isArray(sidecar) && sidecar.length
          ? sidecar.map(e => ({
              isVideo: !!e.node.is_video,
              displayUrl: e.node.display_url || null,
              videoUrl: e.node.video_url || null
            }))
          : [{
              isVideo: !!media.is_video,
              displayUrl: media.display_url || null,
              videoUrl: media.video_url || null
            }];

        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        return res.status(200).json({
          shortcode,
          postType,
          permalink,
          username: media.owner?.username || 'whip4you',
          profilePicUrl: media.owner?.profile_pic_url || null,
          isVideo: !!media.is_video,
          videoUrl: media.video_url || null,
          displayUrl: media.display_url || null,
          slides
        });
      }
    }

    // Fallback via jina if direct contextJSON is not extracted
    const jinaRes = await fetch(`https://r.jina.ai/${embedUrl}`);
    if (jinaRes.ok) {
      const markdown = await jinaRes.text();
      const cdnMatches = [...markdown.matchAll(/\((https:\/\/[^)]+cdninstagram\.com[^)]+)\)/g)].map(match => match[1]);
      if (cdnMatches.length > 0) {
        const displayUrl = cdnMatches[1] || cdnMatches[0];
        return res.status(200).json({
          shortcode,
          postType,
          permalink,
          username: 'whip4you',
          profilePicUrl: cdnMatches[0] || null,
          isVideo: postType === 'reel',
          videoUrl: null,
          displayUrl,
          slides: [{ isVideo: false, displayUrl, videoUrl: null }]
        });
      }
    }

    return res.status(404).json({ error: 'Media not found in post' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
