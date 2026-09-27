import fs from 'node:fs';
import path from 'node:path';

const INDEXNOW_KEY = '4a8f9d6c2b1e4758a3d9e2b1c4f6a780';
const HOST = 'utools.bd';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

export async function submitIndexNow() {
  console.log('[indexnow] Preparing URL submission to IndexNow API...');
  
  const sitemapPath = path.resolve(process.cwd(), 'dist/sitemap.xml');
  const urlList: string[] = [];

  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    const matches = sitemapContent.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g);
    for (const match of matches) {
      urlList.push(match[1]);
    }
  }

  if (urlList.length === 0) {
    urlList.push(`https://${HOST}/`);
  }

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      console.log(`[indexnow] Successfully submitted ${urlList.length} URLs to IndexNow (Status: ${response.status})`);
    } else {
      console.warn(`[indexnow] API responded with status ${response.status}: ${response.statusText}`);
    }
  } catch (err: any) {
    console.log(`[indexnow] Notice: Could not connect to external IndexNow endpoint from current environment (${err?.message || err}). Key file is active at /${INDEXNOW_KEY}.txt`);
  }
}

// Allow direct CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  submitIndexNow();
}
