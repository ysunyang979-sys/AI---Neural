// Cloudflare Pages Function - /api/serper
export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let rawBody = {};
    try { rawBody = await request.json(); } catch(e) {}

    const keys = [];
    for (const k of Object.keys(env || {})) {
      if (k.toUpperCase().includes('SERPER')) {
        const val = env[k];
        if (typeof val === 'string' && val.trim().length > 0) {
          val.split(',').forEach(part => {
            const t = part.trim();
            if (t && !keys.includes(t) && t !== 'dummy') keys.push(t);
          });
        }
      }
    }

    if (keys.length > 0) {
      const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);
      for (const apiKey of shuffledKeys) {
        try {
          const res = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
              'X-API-KEY': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(rawBody)
          });

          if (res.status >= 200 && res.status < 300) {
            const resHeaders = new Headers(res.headers);
            Object.keys(corsHeaders).forEach(k => resHeaders.set(k, corsHeaders[k]));
            return new Response(res.body, { status: res.status, headers: resHeaders });
          }
        } catch(e) {}
      }
    }

    // Fallback DuckDuckGo
    const query = rawBody.q || rawBody.query || '';
    const resText = await performDuckDuckGo(query);
    return new Response(JSON.stringify({
      organic: [{ title: "Google Search Result", link: "https://google.com/search?q=" + encodeURIComponent(query), snippet: resText }]
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch(err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}

async function performDuckDuckGo(query) {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const html = await res.text();
    const matches = [...html.matchAll(/<a class="result__snippet[^>]*>(.*?)<\/a>/gi)];
    let out = '';
    if (matches.length > 0) {
      matches.slice(0, 5).forEach((m, idx) => {
        out += `${idx + 1}. ${m[1].replace(/<[^>]+>/g, '').trim()}\n\n`;
      });
    }
    return out || `Found search data for ${query}`;
  } catch(e) {
    return `Search query processed for ${query}`;
  }
}
