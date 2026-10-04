
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function instagramDevPlugin() {
  return {
    name: 'instagram-dev-api',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/instagram')) return next();
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const targetUrl = urlObj.searchParams.get('url');
          if (!targetUrl) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Missing url parameter' }));
          }

          const clean = targetUrl.trim().replace(/&amp;/g, '&').replace(/\/+$/, '');
          const m = clean.match(/instagram\.com\/(p|reel|tv)\/([\w-]+)/i);
          if (!m) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Invalid Instagram URL' }));
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
                ? sidecar.map((e: any) => ({
                    isVideo: !!e.node.is_video,
                    displayUrl: e.node.display_url || null,
                    videoUrl: e.node.video_url || null
                  }))
                : [{
                    isVideo: !!media.is_video,
                    displayUrl: media.display_url || null,
                    videoUrl: media.video_url || null
                  }];

              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                shortcode,
                postType,
                permalink,
                username: media.owner?.username || 'whip4you',
                profilePicUrl: media.owner?.profile_pic_url || null,
                isVideo: !!media.is_video,
                videoUrl: media.video_url || null,
                displayUrl: media.display_url || null,
                slides
              }));
            }
          }

          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Could not extract media' }));
        } catch (err: any) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: err.message || 'Internal error' }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), instagramDevPlugin()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 3
      },
      mangle: {
        toplevel: true,
        safari10: true
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
        }
      }
    },
    outDir: 'dist',
    sourcemap: false
  }
});
