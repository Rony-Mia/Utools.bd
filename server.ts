import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parsing for JSON and urlencoded
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 1. API routes FIRST (before static serving or fallback handlers)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Utools.bd',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  app.get('/api/capabilities', (req, res) => {
    res.json({
      prerendered: true,
      routes: ['/', '/converter', '/photo-resizer', '/age-calculator', '/amount-in-words', '/bangla-date-converter'],
      ssr: true,
      hydration: true
    });
  });

  // Wikipedia On This Day Proxy API
  app.get('/api/onthisday', async (req, res) => {
    try {
      const month = String(req.query.month || '').padStart(2, '0');
      const day = String(req.query.day || '').padStart(2, '0');
      if (!month || !day || isNaN(Number(month)) || isNaN(Number(day))) {
        return res.status(400).json({ error: 'Valid month and day parameters required (MM and DD)' });
      }

      const wikiUrl = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/selected/${month}/${day}`;
      const response = await fetch(wikiUrl, {
        headers: {
          'User-Agent': 'Utools.bd (https://utools.bd; contact@utools.bd)',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Wikipedia API responded with status ' + response.status });
      }

      const data = await response.json();
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch historical events from Wikipedia' });
    }
  });

  // Decap CMS GitHub OAuth Flow
  app.get('/api/auth', (req, res) => {
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const redirectUri = `${protocol}://${host}/api/callback`;
    const clientId = process.env.GITHUB_CLIENT_ID;

    if (!clientId) {
      return res.status(500).send(`
        <!doctype html>
        <html lang="bn">
          <head><meta charset="utf-8"><title>GitHub OAuth Credentials Missing</title></head>
          <body style="font-family:sans-serif;padding:2rem;text-align:center;line-height:1.6;">
            <h2>GitHub OAuth Credentials Missing</h2>
            <p>Decap CMS অ্যাডমিন ব্যবহারের জন্য <code>GITHUB_CLIENT_ID</code> এবং <code>GITHUB_CLIENT_SECRET</code> এনভায়রনমেন্ট ভেরিয়েবল সেট করতে হবে।</p>
          </body>
        </html>
      `);
    }

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.redirect(githubAuthUrl);
  });

  app.get('/api/callback', async (req, res) => {
    const code = req.query.code as string;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!code) {
      return res.status(400).send('Authorization code missing');
    }

    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Utools.bd-CMS-Auth',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const data = await response.json();
      const token = data.access_token;

      if (!token) {
        return res.status(401).send(`Authentication failed: ${data.error_description || data.error || 'Unknown error'}`);
      }

      const content = `
        <!doctype html>
        <html><body>
        <script>
          (function() {
            function receiveMessage(e) {
              window.opener.postMessage(
                'authorization:github:success:${JSON.stringify({ token, provider: 'github' })}',
                e.origin
              );
            }
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
          })();
        </script>
        </body></html>
      `;
      res.setHeader('Content-Type', 'text/html');
      res.send(content);
    } catch (err: any) {
      res.status(500).send('OAuth exchange error: ' + (err.message || 'unknown error'));
    }
  });

  // Admin redirect (/admin -> /admin/)
  app.get('/admin', (req, res, next) => {
    if (req.path === '/admin') {
      return res.redirect(301, '/admin/');
    }
    next();
  });

  // 301 Permanent Redirects for historical / renamed slugs
  const REDIRECT_MAP: Record<string, string> = {
    '/blog/bijoy-to-unicode-conversion-tips': '/blog/bijoy-to-unicode-converter',
    '/blog/teletalk-photo-signature-resize-guide': '/blog',
  };

  // Canonical URL enforcement (strip trailing slashes & apply 301 redirects)
  app.use((req, res, next) => {
    const clean = req.path.replace(/\/+$/, '');
    if (REDIRECT_MAP[clean]) {
      return res.redirect(301, REDIRECT_MAP[clean]);
    }
    // Don't strip trailing slash for /admin/
    if (req.path.length > 1 && req.path.endsWith('/') && !req.path.startsWith('/admin')) {
      const query = req.url.slice(req.path.length);
      return res.redirect(301, clean + query);
    }
    next();
  });

  // 2. Vite middleware in Development OR Static Serving in Production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[server] Running in development mode with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[server] Running in production mode with prerendered static files...');
    const distPath = path.join(process.cwd(), 'dist');

    // Verify dist directory exists
    if (!fs.existsSync(distPath)) {
      throw new Error(`Production dist directory not found at ${distPath}`);
    }

    // Serve static assets from dist (css, js, media, fonts)
    app.use(express.static(distPath, {
      index: false,
      redirect: false,
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html') || filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else if (filePath.match(/\.(woff2?|ttf|otf|eot)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (filePath.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));

    // Specific route handler for prerendered pages
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
      }

      // Ignore API requests if any slipped through
      if (req.path.startsWith('/api')) {
        return next();
      }

      const reqPath = req.path.replace(/\/+$/, '') || '/';
      const cleanPath = reqPath === '/' ? '' : reqPath.replace(/^\//, '');
      const potentialHtmlPath = cleanPath
        ? path.join(distPath, cleanPath, 'index.html')
        : path.join(distPath, 'index.html');

      if (fs.existsSync(potentialHtmlPath)) {
        console.log(`[server] Serving prerendered: ${potentialHtmlPath}`);
        return res.sendFile(potentialHtmlPath);
      }

      next();
    });

    // Unknown URLs: serve the prerendered 404 page with a real 404 status
    // (Express v5 wildcard format), instead of soft-404ing to index.html.
    app.get('*all', (req, res) => {
      console.log(`[server] 404: ${req.path}`);
      const notFoundPath = path.join(distPath, '404.html');
      res
        .status(404)
        .sendFile(fs.existsSync(notFoundPath) ? notFoundPath : path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Utools.bd server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
