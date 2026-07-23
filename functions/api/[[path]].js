// Cloudflare Pages Functions - Reverse Proxy & API Key Shield Worker
// Serves endpoints under /api/* on Cloudflare Edge

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
    // 1. SiliconFlow Proxy
    if (path.startsWith('siliconflow')) {
      const apiKey = env.SILICONFLOW_KEY;
      if (!apiKey) return new Response(JSON.stringify({ error: 'SILICONFLOW_KEY not set in Cloudflare Environment' }), { status: 500, headers: corsHeaders });

      return await proxyRequest(request, 'https://api.siliconflow.cn/v1/chat/completions', {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }, corsHeaders);
    }

    // 2. Groq Proxy
    if (path.startsWith('groq')) {
      const apiKey = env.GROQ_KEY;
      if (!apiKey) return new Response(JSON.stringify({ error: 'GROQ_KEY not set in Cloudflare Environment' }), { status: 500, headers: corsHeaders });

      return await proxyRequest(request, 'https://api.groq.com/openai/v1/chat/completions', {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }, corsHeaders);
    }

    // 3. GLM (Zhipu BigModel) Proxy
    if (path.startsWith('glm')) {
      const apiKey = env.GLM_KEY;
      if (!apiKey) return new Response(JSON.stringify({ error: 'GLM_KEY not set in Cloudflare Environment' }), { status: 500, headers: corsHeaders });

      return await proxyRequest(request, 'https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }, corsHeaders);
    }

    // 4. Mistral Proxy
    if (path.startsWith('mistral')) {
      return await proxyRequest(request, 'https://mist.358966.xyz/v1/chat/completions', {
        'Content-Type': 'application/json'
      }, corsHeaders);
    }

    // 5. Tavily Search Proxy
    if (path.startsWith('tavily')) {
      const apiKey = env.TAVILY_KEY;
      let body = {};
      try { body = await request.json(); } catch(e) {}
      if (apiKey) body.api_key = apiKey;

      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return createCorsResponse(res, corsHeaders);
    }

    // 6. Serper Google Search Proxy
    if (path.startsWith('serper')) {
      const apiKey = env.SERPER_KEY;
      if (!apiKey) return new Response(JSON.stringify({ error: 'SERPER_KEY not set in Cloudflare Environment' }), { status: 500, headers: corsHeaders });

      return await proxyRequest(request, 'https://google.serper.dev/search', {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }, corsHeaders);
    }

    // 7. Weather API Proxy
    if (path.startsWith('weather')) {
      const apiKey = env.WEATHER_KEY;
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
