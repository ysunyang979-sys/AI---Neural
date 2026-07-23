// Cloudflare Pages Functions - Ultra-Robust Multi-Key Load Balancer & Reverse Proxy Worker
// Serves endpoints under /api/* on Cloudflare Edge with Dynamic Key Discovery, Rotation & Fallbacks

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, '');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Helper CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // 1. SiliconFlow Multi-Key Proxy
    if (path.startsWith('siliconflow')) {
      const keys = getKeys(env, 'SILICONFLOW');
      return await proxyWithKeyRotation(request, 'https://api.siliconflow.cn/v1/chat/completions', keys, key => ({
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }), corsHeaders);
    }

    // 2. Groq Multi-Key Proxy
    if (path.startsWith('groq')) {
      const keys = getKeys(env, 'GROQ');
      return await proxyWithKeyRotation(request, 'https://api.groq.com/openai/v1/chat/completions', keys, key => ({
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }), corsHeaders);
    }

    // 3. GLM Multi-Key Proxy
    if (path.startsWith('glm')) {
      const keys = getKeys(env, 'GLM');
      return await proxyWithKeyRotation(request, 'https://open.bigmodel.cn/api/paas/v4/chat/completions', keys, key => ({
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }), corsHeaders);
    }

    // 4. Mistral Proxy
    if (path.startsWith('mistral')) {
      return await proxyRequest(request, 'https://mist.358966.xyz/v1/chat/completions', {
        'Content-Type': 'application/json'
      }, corsHeaders);
    }

    // 5. Tavily Search Multi-Key Proxy
    if (path.startsWith('tavily')) {
      const keys = getKeys(env, 'TAVILY');
      return await proxyTavilyWithRotation(request, keys, corsHeaders);
    }

    // 6. Serper Google Search Multi-Key Proxy
    if (path.startsWith('serper')) {
      const keys = getKeys(env, 'SERPER');
      return await proxyWithKeyRotation(request, 'https://google.serper.dev/search', keys, key => ({
        'X-API-KEY': key,
        'Content-Type': 'application/json'
      }), corsHeaders);
    }

    // 7. Weather API Proxy
    if (path.startsWith('weather')) {
      const keys = getKeys(env, 'WEATHER');
      const apiKey = keys[0] || '';
      const targetUrl = new URL('https://api.weatherapi.com/v1/current.json');
      url.searchParams.forEach((val, key) => targetUrl.searchParams.set(key, val));
      if (apiKey) targetUrl.searchParams.set('key', apiKey);

      const res = await fetch(targetUrl.toString(), { method: 'GET' });
      return createCorsResponse(res, corsHeaders);
    }

    // 8. General Search Proxy / Fallback
    if (path.startsWith('search')) {
      let query = '';
      try {
        const body = await request.json();
        query = body.query || body.q || '';
      } catch(e) {}
      if (!query) query = url.searchParams.get('q') || '';

      const searchResult = await performDuckDuckGoSearch(query);
      return new Response(searchResult, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found', path }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Dynamically discover all keys matching prefix from env object
function getKeys(env, prefixName) {
  const keys = [];
  const cleanPrefix = prefixName.toUpperCase().replace(/_KEYS?$/, '');

  for (const k of Object.keys(env || {})) {
    if (k.toUpperCase().includes(cleanPrefix)) {
      const val = env[k];
      if (typeof val === 'string' && val.trim().length > 0) {
        val.split(',').forEach(part => {
          const t = part.trim();
          if (t && !keys.includes(t) && t !== 'dummy') keys.push(t);
        });
      }
    }
  }
  return keys;
}

// Proxy function with Multi-Key Load Balancing & Failover Retry
async function proxyWithKeyRotation(incomingRequest, targetUrl, keys, makeHeadersFn, corsHeaders) {
  if (!keys || keys.length === 0) {
    return new Response(JSON.stringify({ error: `No API keys found in Cloudflare Environment` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);
  const reqBody = incomingRequest.method !== 'GET' && incomingRequest.method !== 'HEAD' ? await incomingRequest.text() : null;

  let lastResponse = null;

  for (const apiKey of shuffledKeys) {
    try {
      const customHeaders = makeHeadersFn(apiKey);
      const upstreamResponse = await fetch(targetUrl, {
        method: incomingRequest.method,
        headers: { ...customHeaders },
        body: reqBody
      });

      if (upstreamResponse.status >= 200 && upstreamResponse.status < 300) {
        return createCorsResponse(upstreamResponse, corsHeaders);
      }

      lastResponse = upstreamResponse;
      console.warn(`Key ${apiKey.substring(0, 8)}... failed with HTTP ${upstreamResponse.status}, trying next key.`);
    } catch (err) {
      console.error(`Fetch failed with key:`, err);
    }
  }

  if (lastResponse) return createCorsResponse(lastResponse, corsHeaders);
  return new Response(JSON.stringify({ error: 'All API keys failed' }), {
    status: 502,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function proxyTavilyWithRotation(incomingRequest, keys, corsHeaders) {
  let rawBody = {};
  try { rawBody = await incomingRequest.json(); } catch(e) {}

  if (keys && keys.length > 0) {
    const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);
    for (const apiKey of shuffledKeys) {
      try {
        const payload = { ...rawBody, api_key: apiKey };
        const res = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.status >= 200 && res.status < 300) {
          return createCorsResponse(res, corsHeaders);
        }
      } catch(e) {}
    }
  }

  // Fallback to DuckDuckGo search if Tavily fails
  const query = rawBody.query || rawBody.q || '';
  const fallbackResult = await performDuckDuckGoSearch(query);
  return new Response(JSON.stringify({
    answer: "Web Search Results",
    results: [{ title: "Search Results for " + query, url: "https://duckduckgo.com/?q=" + encodeURIComponent(query), content: fallbackResult }]
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function performDuckDuckGoSearch(query) {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!res.ok) throw new Error('DuckDuckGo HTTP ' + res.status);
    const html = await res.text();

    const matches = [...html.matchAll(/<a class="result__snippet[^>]*>(.*?)<\/a>/gi)];
    let out = `【云端实时搜索结果】\n`;
    if (matches.length > 0) {
      matches.slice(0, 5).forEach((m, idx) => {
        const text = m[1].replace(/<[^>]+>/g, '').trim();
        out += `${idx + 1}. ${text}\n\n`;
      });
    } else {
      out += `已检索核心公开数据库: ${query}\n`;
    }
    return out;
  } catch(e) {
    return `【云端基础搜索】未找到关于 "${query}" 的极时数据，但可以基于已知常识进行推理解答。`;
  }
}

async function proxyRequest(incomingRequest, targetUrl, customHeaders, corsHeaders) {
  const reqBody = incomingRequest.method !== 'GET' && incomingRequest.method !== 'HEAD' ? await incomingRequest.text() : null;

  const upstreamResponse = await fetch(targetUrl, {
    method: incomingRequest.method,
    headers: { ...customHeaders },
    body: reqBody
  });

  return createCorsResponse(upstreamResponse, corsHeaders);
}

function createCorsResponse(response, corsHeaders) {
  const newHeaders = new Headers(response.headers);
  Object.keys(corsHeaders).forEach(key => newHeaders.set(key, corsHeaders[key]));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
