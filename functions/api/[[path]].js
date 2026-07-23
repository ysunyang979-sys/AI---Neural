// Cloudflare Pages Functions - Multi-Key Load Balancer & Reverse Proxy Worker
// Serves endpoints under /api/* on Cloudflare Edge with Automatic Key Rotation & Failover

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
      const keys = getKeys(env, 'SILICONFLOW_KEY');
      return await proxyWithKeyRotation(request, 'https://api.siliconflow.cn/v1/chat/completions', keys, key => ({
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }), corsHeaders);
    }

    // 2. Groq Multi-Key Proxy
    if (path.startsWith('groq')) {
      const keys = getKeys(env, 'GROQ_KEY');
      return await proxyWithKeyRotation(request, 'https://api.groq.com/openai/v1/chat/completions', keys, key => ({
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }), corsHeaders);
    }

    // 3. GLM Multi-Key Proxy
    if (path.startsWith('glm')) {
      const keys = getKeys(env, 'GLM_KEY');
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
      const keys = getKeys(env, 'TAVILY_KEY');
      return await proxyTavilyWithRotation(request, keys, corsHeaders);
    }

    // 6. Serper Google Search Multi-Key Proxy
    if (path.startsWith('serper')) {
      const keys = getKeys(env, 'SERPER_KEY');
      return await proxyWithKeyRotation(request, 'https://google.serper.dev/search', keys, key => ({
        'X-API-KEY': key,
        'Content-Type': 'application/json'
      }), corsHeaders);
    }

    // 7. Weather API Proxy
    if (path.startsWith('weather')) {
      const keys = getKeys(env, 'WEATHER_KEY');
      const apiKey = keys[0] || '';
      const targetUrl = new URL('https://api.weatherapi.com/v1/current.json');
      url.searchParams.forEach((val, key) => targetUrl.searchParams.set(key, val));
      if (apiKey) targetUrl.searchParams.set('key', apiKey);

      const res = await fetch(targetUrl.toString(), { method: 'GET' });
      return createCorsResponse(res, corsHeaders);
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

// Extract multiple keys from single string (comma-separated) or numbered environment variables
function getKeys(env, baseName) {
  const keys = [];
  const multiStr = env[`${baseName}S`] || env[baseName];
  if (multiStr) {
    multiStr.split(',').forEach(k => {
      const trimmed = k.trim();
      if (trimmed && !keys.includes(trimmed)) keys.push(trimmed);
    });
  }

  for (let i = 1; i <= 10; i++) {
    const k = env[`${baseName}_${i}`] || env[`${baseName}${i}`];
    if (k && !keys.includes(k.trim())) keys.push(k.trim());
  }
  return keys;
}

// Proxy function with Multi-Key Load Balancing & Failover Retry
async function proxyWithKeyRotation(incomingRequest, targetUrl, keys, makeHeadersFn, corsHeaders) {
  if (!keys || keys.length === 0) {
    return new Response(JSON.stringify({ error: `No API keys configured for endpoint` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Shuffle keys for randomized load balancing
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

      // If successful, return immediately
      if (upstreamResponse.status >= 200 && upstreamResponse.status < 300) {
        return createCorsResponse(upstreamResponse, corsHeaders);
      }

      // If rate-limited (429), unauthorized (401/403), or server error (5xx), try next key
      lastResponse = upstreamResponse;
      console.warn(`Key ${apiKey.substring(0, 8)}... failed with status ${upstreamResponse.status}, retrying next key.`);
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
  if (!keys || keys.length === 0) {
    return new Response(JSON.stringify({ error: 'No Tavily keys configured' }), { status: 500, headers: corsHeaders });
  }

  const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);
  let rawBody = {};
  try { rawBody = await incomingRequest.json(); } catch(e) {}

  let lastRes = null;

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
      lastRes = res;
    } catch(e) {}
  }

  if (lastRes) return createCorsResponse(lastRes, corsHeaders);
  return new Response(JSON.stringify({ error: 'All Tavily keys failed' }), { status: 502, headers: corsHeaders });
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
