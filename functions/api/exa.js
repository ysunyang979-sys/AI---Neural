// Cloudflare Pages Function - /api/exa (Exa.ai Neural Search Proxy)
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

    // Extract EXA keys from environment (supports EXA_KEYS, EXA_KEY, EXA_KEY_1, etc.)
    const keys = [];
    for (const k of Object.keys(env || {})) {
      if (k.toUpperCase().includes('EXA')) {
        const val = env[k];
        if (typeof val === 'string' && val.trim().length > 0) {
          val.split(',').forEach(part => {
            const t = part.trim();
            if (t && !keys.includes(t) && t !== 'dummy') keys.push(t);
          });
        }
      }
    }

    const query = rawBody.query || rawBody.q || '';

    if (keys.length > 0) {
      const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);
      for (const apiKey of shuffledKeys) {
        try {
          const payload = {
            query: query,
            useAutoprompt: true,
            numResults: rawBody.numResults || 5,
            contents: { text: { maxCharacters: 1000 } }
          };
          const res = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
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
    const fallbackText = await performDuckDuckGo(query);
    return new Response(JSON.stringify({
      results: [{ title: "Search Results for " + query, url: "https://exa.ai/search?q=" + encodeURIComponent(query), text: fallbackText }]
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

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
