import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import Critters from 'critters';
import { PRERENDER_ROUTES, NOT_FOUND_ROUTE } from './src/routes.tsx';
import { generateRssFeed } from './scripts/generate-rss.ts';
import { submitIndexNow } from './scripts/submit-indexnow.ts';

function getDynamicBlogRoutes(): string[] {
  const blogDir = path.resolve(process.cwd(), 'content/blog');
  if (!fs.existsSync(blogDir)) return [];
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.json'));
  const routes: string[] = [];
  for (const f of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(blogDir, f), 'utf-8'));
      if (raw.published !== false && raw.slug && raw.title) {
        routes.push(`/blog/${raw.slug}`);
      }
    } catch (err) {
      console.warn(`[prerender] Skipping invalid blog file: ${f}`, err);
    }
  }
  return routes;
}

function getDynamicCustomPageRoutes(): string[] {
  const pagesDir = path.resolve(process.cwd(), 'content/pages');
  if (!fs.existsSync(pagesDir)) return [];
  const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.json'));
  const routes: string[] = [];
  for (const f of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(pagesDir, f), 'utf-8'));
      const slug = raw.slug || f.replace(/\.json$/, '');
      const pathRoute = `/${slug}`;
      if (slug && slug !== 'home' && !(PRERENDER_ROUTES as readonly string[]).includes(pathRoute)) {
        routes.push(pathRoute);
      }
    } catch (err) {
      console.warn(`[prerender] Skipping invalid page file: ${f}`, err);
    }
  }
  return routes;
}

// Single source of truth: static routes + dynamic custom pages + dynamic blog posts
const DYNAMIC_BLOG_ROUTES = getDynamicBlogRoutes();
const DYNAMIC_PAGE_ROUTES = getDynamicCustomPageRoutes();
const ROUTES: readonly string[] = [...PRERENDER_ROUTES, ...DYNAMIC_PAGE_ROUTES, ...DYNAMIC_BLOG_ROUTES];
// Rendered in the same two passes as every other route, but written to
// dist/404.html instead of a routeClean folder, and left out of the sitemap.
const ALL_RENDER_ROUTES: readonly string[] = [...ROUTES, NOT_FOUND_ROUTE];

const SITE_ORIGIN = 'https://utools.bd';

function generateSitemap(routes: readonly string[]): string {
  const urlEntries = routes
    .map((route) => {
      const loc = `${SITE_ORIGIN}${route === '/' ? '/' : route}`;
      const priority = route === '/' ? '1.0' : '0.8';
      return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
}

async function prerender() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const serverEntryPath = path.resolve(distDir, 'server/entry-server.js');
  const templatePath = path.resolve(distDir, 'index.html');

  if (!fs.existsSync(serverEntryPath)) {
    throw new Error(`Server entry file not found at ${serverEntryPath}`);
  }
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Client template index.html not found at ${templatePath}`);
  }

  const template = fs.readFileSync(templatePath, 'utf-8');

  // Initialize Critters for automated critical CSS extraction & non-critical deferral
  const critters = new Critters({
    path: distDir,
    preload: 'media',
    noscriptFallback: true,
    inlineFonts: false,
    reduceInlineStyles: false,
    pruneSource: false,
    logLevel: 'warn',
  });

  // Dynamic import of the compiled SSR bundle
  const { render, preloadAllPages } = await import(pathToFileURL(serverEntryPath).href);

  // 0. Warm the module cache for every lazily-loaded tool page. Without
  //    this, each page's React.lazy() ctor() would hit real disk I/O the
  //    first time it's triggered below, and one setImmediate flush might
  //    not be enough time for that to settle.
  if (typeof preloadAllPages === 'function') {
    await preloadAllPages();
  }

  // 1. Trigger pass: render every route once so each lazy page's
  //    React.lazy() component fires its ctor() at least once. The output
  //    here is thrown away — on a component's first-ever render, Suspense
  //    always shows the fallback, because the resulting promise can never
  //    settle within the same synchronous renderToString() call no matter
  //    how "ready" the underlying module already is.
  for (const url of ALL_RENDER_ROUTES) {
    try {
      render(url);
    } catch {
      // Ignored — this pass exists only to kick off each lazy import.
    }
  }

  // Let the just-triggered promises actually resolve. Their module code is
  // already cached from step 0, so this settles via microtasks almost
  // immediately rather than waiting on disk I/O again — two setImmediate
  // round-trips gives plenty of margin.
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));

  // 2. Real pass: every lazy page component is now resolved (its internal
  //    status flipped to "resolved" while we waited above), so this render
  //    call returns full HTML synchronously instead of a Suspense fallback.
  for (const url of ALL_RENDER_ROUTES) {
    const isNotFound = url === NOT_FOUND_ROUTE;
    console.log(`[prerender] Rendering route: ${isNotFound ? '404' : url}`);
    const { html: renderedHtml, helmet } = render(url);

    // Extract title and meta tags from rendered HTML
    const titleMatch = renderedHtml.match(/<title>[\s\S]*?<\/title>/);
    const newTitle = titleMatch ? titleMatch[0] : '';

    // Extract meta tags from rendered output
    const metaMatches = renderedHtml.match(/<meta\s+[^>]*\/?>/g) || [];

    // Extract body by stripping title and meta tags from rendered output
    const bodyHtml = renderedHtml
      .replace(/<title>[\s\S]*?<\/title>/g, '')
      .replace(/<meta\s+[^>]*\/?>/g, '')
      .trim();

    // Inject into template
    let pageHtml = template;

    // 1. Replace or update <title> from Helmet or rendered HTML
    const finalTitle = newTitle || (helmet?.title?.toString() || '');
    if (finalTitle) {
      if (pageHtml.includes('<title>')) {
        pageHtml = pageHtml.replace(/<title>[\s\S]*?<\/title>/, finalTitle);
      } else {
        pageHtml = pageHtml.replace('</head>', `  ${finalTitle}\n</head>`);
      }
    }

    // 2. Handle meta tags from Helmet context
    let allMetaTags = metaMatches || [];
    
    // Extract meta tags from Helmet if available
    if (helmet?.meta) {
      const helmetMetaHtml = helmet.meta.toString();
      // Extract individual meta tags from helmet output
      const helmetMetaMatches = helmetMetaHtml.match(/<meta\s+[^>]*\/?>/g) || [];
      allMetaTags = [...allMetaTags, ...helmetMetaMatches];
    }

    // Remove default meta description/og/twitter tags from template to avoid duplicates
    if (allMetaTags.length > 0) {
      pageHtml = pageHtml.replace(/<meta\s+name="description"[^>]*\/?>\s*/gi, '');
      pageHtml = pageHtml.replace(/<meta\s+property="og:[^"]*"[^>]*\/?>\s*/gi, '');
      pageHtml = pageHtml.replace(/<meta\s+name="twitter:[^"]*"[^>]*\/?>\s*/gi, '');

      // Deduplicate meta tags by name/property
      const metaMap = new Map<string, string>();
      for (const metaTag of allMetaTags) {
        const nameMatch = metaTag.match(/name="([^"]*)"/);
        const propertyMatch = metaTag.match(/property="([^"]*)"/);
        const key = nameMatch ? nameMatch[1] : (propertyMatch ? propertyMatch[1] : null);
        
        if (key) {
          metaMap.set(key, metaTag);
        }
      }

      const dedupedMetaTags = Array.from(metaMap.values());
      const metaTagsStr = dedupedMetaTags.map((m: string) => `    ${m}`).join('\n');
      
      if (pageHtml.includes('</head>')) {
        pageHtml = pageHtml.replace('</head>', `${metaTagsStr}\n  </head>`);
      }
    }

    // 2b. Inject a page-specific canonical link (drop any leftover one
    // from the template first so repeated builds don't duplicate it).
    pageHtml = pageHtml.replace(/<link\s+rel="canonical"[^>]*\/?>\s*/gi, '');
    if (!isNotFound) {
      const canonicalHref = `${SITE_ORIGIN}${url === '/' ? '/' : url}`;
      pageHtml = pageHtml.replace(
        '</head>',
        `  <link rel="canonical" href="${canonicalHref}"/>\n</head>`
      );
    }

    // 3. Inject body content into <div id="root">
    pageHtml = pageHtml.replace(
      '<div id="root"></div>',
      `<div id="root">${bodyHtml}</div>`
    );

    // 3.5. Extract critical above-the-fold CSS and load remaining CSS asynchronously
    try {
      pageHtml = await critters.process(pageHtml);
      // Format deferred stylesheet link to exact pattern requested:
      // <link rel="preload" as="style" href="[css file]">
      // <link rel="stylesheet" href="[css file]" media="print" onload="this.media='all'; this.onload=null;">
      // <noscript><link rel="stylesheet" href="[css file]"></noscript>
      pageHtml = pageHtml.replace(
        /<link([^>]*rel=["']stylesheet["'][^>]*)media=["']print["']\s+onload=["']this\.media='all'["']([^>]*)>/g,
        (match, p1, p2) => {
          const hrefMatch = match.match(/href=["']([^"']+)["']/);
          const href = hrefMatch ? hrefMatch[1] : '';
          return `<link rel="preload" as="style" href="${href}">\n    <link${p1}media="print" onload="this.media='all'; this.onload=null;"${p2}>`;
        }
      );
    } catch (crittersErr) {
      console.warn(`[prerender] Critters optimization warning on ${url}:`, crittersErr);
    }

    // 4. Save to destination
    const routeClean = url === '/' ? '' : url.replace(/^\//, '');
    const outDir = routeClean && !isNotFound ? path.join(distDir, routeClean) : distDir;
    fs.mkdirSync(outDir, { recursive: true });

    // Vercel/most static hosts serve dist/404.html with a 404 status automatically;
    // server.ts also serves it explicitly with res.status(404) for the Express path.
    const outFile = path.join(outDir, isNotFound ? '404.html' : 'index.html');
    fs.writeFileSync(outFile, pageHtml, 'utf-8');
    console.log(`[prerender] Wrote: ${outFile} (${(pageHtml.length / 1024).toFixed(1)} KB)`);
  }

  // 5. Clean up temporary dist/server folder
  const serverDir = path.resolve(distDir, 'server');
  if (fs.existsSync(serverDir)) {
    fs.rmSync(serverDir, { recursive: true, force: true });
    console.log('[prerender] Cleaned up temporary dist/server directory.');
  }

  // 6. Auto-generate sitemap.xml from the same ROUTES list used above,
  // so a new tool's route only needs to be added once (in src/routes.tsx).
  const sitemapXml = generateSitemap(ROUTES);
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`[prerender] Wrote: ${path.join(distDir, 'sitemap.xml')} (${ROUTES.length} routes)`);

  // 7. Auto-generate rss.xml for the blog
  const rssXml = generateRssFeed();
  fs.writeFileSync(path.join(distDir, 'rss.xml'), rssXml, 'utf-8');
  console.log(`[prerender] Wrote: ${path.join(distDir, 'rss.xml')}`);

  // 8. Auto-submit changed URLs to IndexNow
  await submitIndexNow();

  console.log('[prerender] All routes successfully prerendered!');
}

prerender().catch((err) => {
  console.error('[prerender] Error during prerender:', err);
  process.exit(1);
});
